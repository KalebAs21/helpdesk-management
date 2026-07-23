import { Role, TicketStatus } from "@prisma/client";

/**
 * Status flow: OPEN -> ASSIGNED -> IN_PROGRESS -> RESOLVED -> CLOSED
 *
 * - EMPLOYEE: creates tickets (OPEN) and confirms resolution (RESOLVED -> CLOSED)
 * - TECHNICAL: moves ASSIGNED -> IN_PROGRESS -> RESOLVED, on tickets assigned to them
 * - MANAGER: can assign (which moves OPEN -> ASSIGNED) and update to any status
 */
export const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ["ASSIGNED"],
  ASSIGNED: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: ["CLOSED", "IN_PROGRESS"], // employee can reopen work if not actually fixed
  CLOSED: [],
};

export function canTransition(
  role: Role,
  currentStatus: TicketStatus,
  nextStatus: TicketStatus,
  isAssignee: boolean,
  isCreator: boolean
): boolean {
  if (!ALLOWED_TRANSITIONS[currentStatus].includes(nextStatus)) return false;

  if (role === "MANAGER") {
    // Managers can drive any valid transition
    return true;
  }

  if (role === "TECHNICAL") {
    // Only the assigned technician can move their own ticket through the pipeline
    if (!isAssignee) return false;
    return (
      (currentStatus === "ASSIGNED" && nextStatus === "IN_PROGRESS") ||
      (currentStatus === "IN_PROGRESS" && nextStatus === "RESOLVED")
    );
  }

  if (role === "EMPLOYEE") {
    // Only the creator can close their own ticket, or reopen if unresolved
    if (!isCreator) return false;
    return (
      (currentStatus === "RESOLVED" && nextStatus === "CLOSED") ||
      (currentStatus === "RESOLVED" && nextStatus === "IN_PROGRESS")
    );
  }

  return false;
}

export const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "Open",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const CATEGORY_LABELS: Record<string, string> = {
  IT_SUPPORT: "IT Support",
  FACILITIES: "Facilities",
  HR: "HR",
  OTHER: "Other",
};
