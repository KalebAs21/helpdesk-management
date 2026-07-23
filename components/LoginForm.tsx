"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "../lib/validations";
import { loginUser } from "../app/actions/auth";
import { useState } from "react";
import Link from "next/link";

export default function LoginForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setErrorMessage(null);
    const result = await loginUser(data);
    if (result && !result.success) {
      setErrorMessage(result.message ?? "Login failed.");
    }
  }

  const fillDemo = (email: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", "password123", { shouldValidate: true });
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/30">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
          DeskFlow Helpdesk
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Sign in to manage issues, assignments, and resolution updates.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 space-y-5"
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
            Email Address
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="name@company.com"
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/40 disabled:opacity-50 transition-all cursor-pointer"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>

        {/* Demo Accounts Quick-Fill Panel */}
        <div className="pt-3 border-t border-slate-100">
          <p className="text-center text-xs font-semibold text-slate-500 mb-2.5">
            ⚡ Quick Demo Accounts (Click to Fill):
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemo("manager1@company.com")}
              className="rounded-lg border border-purple-200 bg-purple-50 px-2 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition-colors"
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => fillDemo("tech1@company.com")}
              className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
            >
              Tech Staff
            </button>
            <button
              type="button"
              onClick={() => fillDemo("emp1@company.com")}
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              Employee
            </button>
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-600">
            Don't have an account yet?{" "}
            <Link href="/register" className="font-bold text-indigo-600 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
