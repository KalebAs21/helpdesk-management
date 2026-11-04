import "server-only";
import { cookies } from "next/headers";
import { verifyToken } from "./auth";
import { prisma } from "./prisma";
import { redirect } from "next/navigation";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "TECHNICAL" | "EMPLOYEE";
  department?: "IT" | "ELECTRICAL" | "GENERAL" | null;
};

/**
 * Reads the JWT from the cookie, verifies it, and loads the current user
 * from the database. Returns null if there is no valid session.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const payload = verifyToken(token) as { id: string; role: string };

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true, role: true },
    });

    return user as SessionUser | null;
  } catch {
    return null;
  }
}

/**
 * Same as getCurrentUser, but redirects to /login if there is no session.
 * Use this at the top of Server Components / Server Actions that require auth.
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Redirects to /dashboard if the current user's role is not in `roles`.
 * Use inside Server Actions to enforce role-based access control server-side
 * (middleware only checks that a valid token exists, not the role).
 */
export async function requireRole(
  roles: SessionUser["role"][]
): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new Error("Forbidden: you do not have permission to do this.");
  }
  return user;
}
