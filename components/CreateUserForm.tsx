"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, CreateUserInput } from "../lib/validations";
import { createUser } from "../app/actions/admin";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateUserForm({ onUserCreated }: { onUserCreated?: () => void }) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: "EMPLOYEE",
      department: "IT",
    },
  });

  const selectedRole = watch("role");

  async function onSubmit(data: CreateUserInput) {
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await createUser(data);

    if (result.success) {
      setSuccessMessage(result.message ?? "User created successfully!");
      reset({ role: "EMPLOYEE", department: "IT", name: "", email: "", password: "" });
      router.refresh();
      if (onUserCreated) onUserCreated();
    } else {
      setErrorMessage(result.message ?? "Failed to create user.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
    >
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-900">Provision New User Account</h3>
        <p className="text-xs text-slate-500">
          Only Administrators can register staff members and set their permissions.
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 border border-red-200 text-xs font-semibold text-red-700">
          <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 border border-emerald-200 text-xs font-semibold text-emerald-700">
          <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Full Name *
          </label>
          <input
            {...register("name")}
            placeholder="e.g. John Doe"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none"
          />
          {errors.name && (
            <p className="mt-1 text-xs font-semibold text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Email Address *
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="user@company.com"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none"
          />
          {errors.email && (
            <p className="mt-1 text-xs font-semibold text-red-600">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Initial Password *
          </label>
          <input
            type="password"
            {...register("password")}
            placeholder="At least 6 characters"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none"
          />
          {errors.password && (
            <p className="mt-1 text-xs font-semibold text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Role *
          </label>
          <select
            {...register("role")}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none cursor-pointer"
          >
            <option value="EMPLOYEE">Employee (Requester)</option>
            <option value="TECHNICAL">Technical Staff (Support)</option>
            <option value="MANAGER">Manager (Department Lead)</option>
            <option value="ADMIN">Administrator (Full System)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Department
          </label>
          <select
            {...register("department")}
            disabled={selectedRole === "ADMIN"}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="IT">IT Support</option>
            <option value="ELECTRICAL">Electrical (Future)</option>
            <option value="GENERAL">General Support</option>
          </select>
          {selectedRole === "ADMIN" && (
            <p className="mt-1 text-[11px] text-slate-400 italic">Admins oversee all departments</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-500/20 hover:from-rose-700 hover:to-indigo-700 disabled:opacity-50 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          {isSubmitting ? "Creating..." : "Create User Account"}
        </button>
      </div>
    </form>
  );
}
