"use server";

import { prisma } from "../../lib/prisma";
import { requireRole } from "../../lib/session";
import { createUserSchema } from "../../lib/validations";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

type ActionResult =
  | { success: true; message?: string; userId?: string }
  | { success: false; message?: string; errors?: Record<string, string[] | undefined> };

/**
 * Creates a new user account.
 * SECURITY: Only authorized System Administrators (role = ADMIN) can execute this action.
 */
export async function createUser(formData: unknown): Promise<ActionResult> {
  // 1. Strictly verify the caller is an authenticated ADMIN on the server
  await requireRole(["ADMIN"]);

  // 2. Validate input fields using Zod
  const result = createUserSchema.safeParse(formData);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { name, email, password, role, department } = result.data;

  // 3. Ensure email uniqueness
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      success: false,
      message: "An account with this email address already exists.",
    };
  }

  // 4. Hash the password securely with bcrypt (10 rounds)
  const hashedPassword = await bcrypt.hash(password, 10);

  // 5. Create user record
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      department: role === "ADMIN" ? null : department ?? "IT",
    },
  });

  revalidatePath("/admin/users");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `Account for ${name} (${role}) created successfully.`,
    userId: user.id,
  };
}

/**
 * Fetches all users for the Admin User Management dashboard.
 * SECURITY: Only authorized System Administrators can query full user lists.
 */
export async function getAdminUsers() {
  await requireRole(["ADMIN"]);

  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      createdAt: true,
      _count: {
        select: {
          createdTickets: true,
          assignedTickets: true,
        },
      },
    },
  });
}
