"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "../lib/validations";
import { registerUser } from "../app/actions/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function RegisterForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "EMPLOYEE" },
  });

  async function onSubmit(data: RegisterInput) {
    setErrorMessage(null);
    const result = await registerUser(data);

    if (result.success) {
      router.push("/login?registered=1");
    } else {
      setErrorMessage(result.message ?? "Registration failed.");
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/30">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
          Create Account
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Register to submit and track support requests.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 space-y-4"
      >
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3.5 border border-red-200 text-sm font-medium text-red-700">
            <svg className="w-5 h-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Full Name
          </label>
          <input
            {...register("name")}
            placeholder="John Doe"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none text-sm font-medium"
          />
          {errors.name && (
            <p className="mt-1 text-xs font-semibold text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Email Address
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="john@company.com"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none text-sm font-medium"
          />
          {errors.email && (
            <p className="mt-1 text-xs font-semibold text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Password
          </label>
          <input
            type="password"
            {...register("password")}
            placeholder="••••••••"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none text-sm font-medium"
          />
          {errors.password && (
            <p className="mt-1 text-xs font-semibold text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Role
          </label>
          <select
            {...register("role")}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none text-sm font-medium cursor-pointer"
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="TECHNICAL">Technical Staff</option>
            <option value="MANAGER">Manager</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/40 disabled:opacity-50 transition-all cursor-pointer mt-2"
        >
          {isSubmitting ? "Registering..." : "Create Account"}
        </button>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-indigo-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
