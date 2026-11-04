"use server";

import { prisma } from "../../lib/prisma";
import { registerSchema, loginSchema } from "../../lib/validations";
import { signToken } from "../../lib/auth";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function registerUser(_formData: unknown) {
  return {
    success: false,
    message: "Public registration is disabled. Accounts must be provisioned by a System Administrator.",
  };
}

export async function loginUser(formData: unknown) {
  const result = loginSchema.safeParse(formData);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email, password } = result.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return {
      success: false,
      message: "Invalid credentials.",
    };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return {
      success: false,
      message: "Invalid credentials.",
    };
  }

  // Generate JWT payload containing user ID and role
  const token = signToken({ id: user.id, role: user.role });

  // Store JWT in HTTP-only cookie
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  // Perform server-side redirect immediately after setting the cookie
  redirect("/dashboard");
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/login");
}