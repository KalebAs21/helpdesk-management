import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["EMPLOYEE", "TECHNICAL", "MANAGER"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const ticketCategoryEnum = z.enum([
  "IT_SUPPORT",
  "FACILITIES",
  "HR",
  "OTHER",
]);

export const ticketPriorityEnum = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);

export const ticketStatusEnum = z.enum([
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
]);

export const createTicketSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(120, "Title must be under 120 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description is too long"),
  category: ticketCategoryEnum,
  priority: ticketPriorityEnum,
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;

export const assignTicketSchema = z.object({
  ticketId: z.string().min(1),
  assignedToId: z.string().min(1, "Select a technician"),
});

export type AssignTicketInput = z.infer<typeof assignTicketSchema>;

export const updateStatusSchema = z.object({
  ticketId: z.string().min(1),
  status: ticketStatusEnum,
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

export const updatePrioritySchema = z.object({
  ticketId: z.string().min(1),
  priority: ticketPriorityEnum,
});

export type UpdatePriorityInput = z.infer<typeof updatePrioritySchema>;

export const addCommentSchema = z.object({
  ticketId: z.string().min(1),
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment is too long"),
});

export type AddCommentInput = z.infer<typeof addCommentSchema>;

export const ticketFilterSchema = z.object({
  status: ticketStatusEnum.optional(),
  priority: ticketPriorityEnum.optional(),
  category: ticketCategoryEnum.optional(),
  assignedTo: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(["date", "priority", "status"]).optional(),
});

export type TicketFilterInput = z.infer<typeof ticketFilterSchema>;
