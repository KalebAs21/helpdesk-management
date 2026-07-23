"use server";

import { prisma } from "../../lib/prisma";
import { requireUser, requireRole } from "@/../lib/session";
import {
  createTicketSchema,
  assignTicketSchema,
  updateStatusSchema,
  updatePrioritySchema,
  addCommentSchema,
} from "../../lib/validations";
import { canTransition } from "@/../lib/workflow";
import { revalidatePath } from "next/cache";

type ActionResult =
  | { success: true; message?: string; ticketId?: string }
  | { success: false; message?: string; errors?: Record<string, string[] | undefined> };

/**
 * Employees, technicians, and managers can all create tickets.
 * Ticket number is generated inside a transaction to avoid collisions.
 */
export async function createTicket(formData: unknown): Promise<ActionResult> {
  const user = await requireUser();

  const result = createTicketSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const { title, description, category, priority } = result.data;

  const ticket = await prisma.$transaction(async (tx) => {
    const count = await tx.ticket.count();
    const ticketNumber = `TKT-${String(count + 1).padStart(3, "0")}`;

    const created = await tx.ticket.create({
      data: {
        ticketNumber,
        title,
        description,
        category,
        priority,
        status: "OPEN",
        createdById: user.id,
      },
    });

    await tx.activity.create({
      data: {
        ticketId: created.id,
        userId: user.id,
        type: "CREATED",
        detail: `Ticket created (${priority.toLowerCase()} priority)`,
      },
    });

    return created;
  });

  revalidatePath("/tickets");
  revalidatePath("/dashboard");

  return { success: true, ticketId: ticket.id };
}

/**
 * Only managers can assign a ticket to a technician.
 * Assigning moves the ticket from OPEN to ASSIGNED.
 */
export async function assignTicket(formData: unknown): Promise<ActionResult> {
  const manager = await requireRole(["MANAGER"]);

  const result = assignTicketSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const { ticketId, assignedToId } = result.data;

  const [ticket, technician] = await Promise.all([
    prisma.ticket.findUnique({ where: { id: ticketId } }),
    prisma.user.findUnique({ where: { id: assignedToId } }),
  ]);

  if (!ticket) return { success: false, message: "Ticket not found." };
  if (!technician || technician.role !== "TECHNICAL") {
    return { success: false, message: "Assignee must be a technical employee." };
  }
  if (ticket.status !== "OPEN" && ticket.status !== "ASSIGNED") {
    return {
      success: false,
      message: `Cannot reassign a ticket that is ${ticket.status.toLowerCase()}.`,
    };
  }

  await prisma.$transaction([
    prisma.ticket.update({
      where: { id: ticketId },
      data: { assignedToId, status: "ASSIGNED" },
    }),
    prisma.activity.create({
      data: {
        ticketId,
        userId: manager.id,
        type: "ASSIGNED",
        detail: `Assigned to ${technician.name}`,
      },
    }),
  ]);

  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath("/tickets");
  revalidatePath("/dashboard");

  return { success: true };
}

/**
 * Status transitions are validated against the workflow rules for the
 * current user's role, so this enforces who can move a ticket where.
 */
export async function updateTicketStatus(formData: unknown): Promise<ActionResult> {
  const user = await requireUser();

  const result = updateStatusSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const { ticketId, status } = result.data;

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return { success: false, message: "Ticket not found." };

  const isAssignee = ticket.assignedToId === user.id;
  const isCreator = ticket.createdById === user.id;

  const allowed = canTransition(
    user.role,
    ticket.status,
    status,
    isAssignee,
    isCreator
  );

  if (!allowed) {
    return {
      success: false,
      message: "You are not allowed to make this status change.",
    };
  }

  await prisma.$transaction([
    prisma.ticket.update({
      where: { id: ticketId },
      data: { status },
    }),
    prisma.activity.create({
      data: {
        ticketId,
        userId: user.id,
        type: "STATUS_CHANGED",
        detail: `${ticket.status.replace("_", " ")} -> ${status.replace("_", " ")}`,
      },
    }),
  ]);

  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath("/tickets");
  revalidatePath("/dashboard");

  return { success: true };
}

/**
 * Only managers can directly change priority after creation.
 */
export async function updateTicketPriority(
  formData: unknown
): Promise<ActionResult> {
  await requireRole(["MANAGER"]);

  const result = updatePrioritySchema.safeParse(formData);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const { ticketId, priority } = result.data;

  const managerUser = await requireUser();
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return { success: false, message: "Ticket not found." };

  await prisma.$transaction([
    prisma.ticket.update({
      where: { id: ticketId },
      data: { priority },
    }),
    prisma.activity.create({
      data: {
        ticketId,
        userId: managerUser.id,
        type: "PRIORITY_CHANGED",
        detail: `${ticket.priority} -> ${priority}`,
      },
    }),
  ]);

  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath("/tickets");
  revalidatePath("/dashboard");

  return { success: true };
}

/**
 * Anyone involved with the ticket (creator, assignee, or any manager) can
 * add a comment/update. Comments form the activity timeline together with
 * ticket creation and status changes.
 */
export async function addComment(formData: unknown): Promise<ActionResult> {
  const user = await requireUser();

  const result = addCommentSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const { ticketId, content } = result.data;

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return { success: false, message: "Ticket not found." };

  const isInvolved =
    user.role === "MANAGER" ||
    ticket.createdById === user.id ||
    ticket.assignedToId === user.id;

  if (!isInvolved) {
    return {
      success: false,
      message: "You can only comment on tickets you're involved with.",
    };
  }

  await prisma.comment.create({
    data: { ticketId, userId: user.id, content },
  });

  revalidatePath(`/tickets/${ticketId}`);

  return { success: true };
}

/**
 * Managers see everyone; technicians see tickets assigned to them;
 * employees see tickets they created. Filtering/search/sort are applied
 * on top of that visibility scope.
 */
export async function getVisibleTickets(filters?: {
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: string;
  search?: string;
  sort?: "date" | "priority" | "status";
}) {
  const user = await requireUser();

  const where: Record<string, unknown> = {};

  if (user.role === "TECHNICAL") {
    where.assignedToId = user.id;
  } else if (user.role === "EMPLOYEE") {
    where.createdById = user.id;
  }

  if (filters?.status) where.status = filters.status;
  if (filters?.priority) where.priority = filters.priority;
  if (filters?.category) where.category = filters.category;
  if (filters?.assignedTo && user.role === "MANAGER") {
    where.assignedToId = filters.assignedTo;
  }
  if (filters?.search) {
    where.title = { contains: filters.search, mode: "insensitive" };
  }

  const orderBy =
    filters?.sort === "priority"
      ? [{ priority: "desc" as const }]
      : filters?.sort === "status"
      ? [{ status: "asc" as const }]
      : [{ createdAt: "desc" as const }];

  return prisma.ticket.findMany({
    where,
    orderBy,
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
    },
  });
}

/**
 * Loads a single ticket with full detail for the ticket detail page,
 * scoped so a user can only view tickets they're allowed to see.
 */
export async function getTicketDetail(ticketId: string) {
  const user = await requireUser();

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, name: true, role: true } } },
      },
      activities: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, name: true, role: true } } },
      },
    },
  });

  if (!ticket) return null;

  const canView =
    user.role === "MANAGER" ||
    ticket.createdById === user.id ||
    ticket.assignedToId === user.id;

  if (!canView) return null;

  return ticket;
}

export async function getTechnicians() {
  await requireUser();
  return prisma.user.findMany({
    where: { role: "TECHNICAL" },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
}

/**
 * Dashboard stats, scoped to what each role should see per the spec:
 * manager -> org-wide by priority/status, technical -> their own tickets,
 * employee -> their own tickets and what's awaiting their action.
 */
export async function getDashboardStats() {
  const user = await requireUser();

  if (user.role === "MANAGER") {
    const [total, byStatus, byPriority, technicians] = await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.groupBy({ by: ["status"], _count: true }),
      prisma.ticket.groupBy({ by: ["priority"], _count: true }),
      prisma.user.findMany({
        where: { role: "TECHNICAL" },
        select: { id: true, name: true },
      }),
    ]);

    const workload = await prisma.ticket.groupBy({
      by: ["assignedToId"],
      where: { status: { notIn: ["CLOSED"] }, assignedToId: { not: null } },
      _count: true,
    });

    return {
      role: "MANAGER" as const,
      total,
      byStatus,
      byPriority,
      technicians: technicians.map((t) => ({
        id: t.id,
        name: t.name,
        openCount: workload.find((w) => w.assignedToId === t.id)?._count ?? 0,
      })),
    };
  }

  if (user.role === "TECHNICAL") {
    const [assignedToMe, openAssignedToMe] = await Promise.all([
      prisma.ticket.count({ where: { assignedToId: user.id } }),
      prisma.ticket.count({
        where: {
          assignedToId: user.id,
          status: { in: ["ASSIGNED", "IN_PROGRESS"] },
        },
      }),
    ]);

    return { role: "TECHNICAL" as const, assignedToMe, openAssignedToMe };
  }

  // EMPLOYEE
  const [myTickets, awaitingAction] = await Promise.all([
    prisma.ticket.count({ where: { createdById: user.id } }),
    prisma.ticket.count({
      where: { createdById: user.id, status: "RESOLVED" },
    }),
  ]);

  return { role: "EMPLOYEE" as const, myTickets, awaitingAction };
}