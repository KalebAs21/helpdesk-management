"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTicketSchema, CreateTicketInput } from "../lib/validations";
import { createTicket } from "../app/actions/tickets";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function TicketForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: { category: "IT_SUPPORT", priority: "MEDIUM" },
  });

  async function onSubmit(data: CreateTicketInput) {
    setErrorMessage(null);
    const result = await createTicket(data);

    if (result.success) {
      router.push(`/tickets/${result.ticketId}`);
      router.refresh();
    } else {
      setErrorMessage(result.message ?? "Could not create ticket.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 space-y-6 max-w-2xl mx-auto"
    >
      <div className="border-b border-slate-100 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Support Ticket</h1>
        <p className="text-xs text-slate-500 mt-1">Submit an issue for resolution by our technical team.</p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 border border-red-200 text-sm font-medium text-red-700">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
          Issue Title / Summary *
        </label>
        <input
          {...register("title")}
          placeholder="e.g. Unable to connect to VPN after software update"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none font-medium"
        />
        {errors.title && (
          <p className="mt-1 text-xs font-semibold text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
          Detailed Description *
        </label>
        <textarea
          {...register("description")}
          rows={5}
          placeholder="Please describe what happened, steps to reproduce, error messages, etc..."
          className="w-full rounded-xl border border-slate-300 bg-white p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none"
        />
        {errors.description && (
          <p className="mt-1 text-xs font-semibold text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Category *
          </label>
          <select
            {...register("category")}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none cursor-pointer font-medium"
          >
            <option value="IT_SUPPORT">IT Support</option>
            <option value="FACILITIES">Facilities</option>
            <option value="HR">HR</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Priority *
          </label>
          <select
            {...register("priority")}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none cursor-pointer font-medium"
          >
            <option value="LOW">Low - General inquiry</option>
            <option value="MEDIUM">Medium - Normal issue</option>
            <option value="HIGH">High - Work disrupted</option>
            <option value="CRITICAL">Critical - System down / Urgent</option>
          </select>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <Link
          href="/tickets"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {isSubmitting ? "Submitting..." : "Submit Ticket"}
        </button>
      </div>
    </form>
  );
}
