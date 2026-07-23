"use server";

import { prisma } from "../../lib/prisma";
import { registerSchema, loginSchema } from "../../lib/validations";
import { signToken } from "../../lib/auth";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function registerUser(formData: unknown) {
  const result = registerSchema.safeParse(formData);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { name, email, password, role } = result.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      success: false,
      message: "Email already exists.",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  });

  return {
    success: true,
    message: "Registration successful.",
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