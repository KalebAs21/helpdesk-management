"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";

type Technician = { id: string; name: string };

export default function TicketFilters({
  showAssignedTo,
  technicians,
}: {
  showAssignedTo: boolean;
  technicians: Technician[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParam("search", search);
  }

  const hasActiveFilters = Array.from(searchParams.keys()).length > 0;

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter & Search Tickets
        </h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => router.push(pathname)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear all filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
        {/* Search Title */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col lg:col-span-2">
          <label className="mb-1 text-xs font-bold text-slate-700">Search Title</label>
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search issue summary..."
              className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>

        {/* Status Dropdown */}
        <div className="flex flex-col">
          <label className="mb-1 text-xs font-bold text-slate-700">Status</label>
          <select
            value={searchParams.get("status") ?? ""}
            onChange={(e) => updateParam("status", e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {/* Priority Dropdown */}
        <div className="flex flex-col">
          <label className="mb-1 text-xs font-bold text-slate-700">Priority</label>
          <select
            value={searchParams.get("priority") ?? ""}
            onChange={(e) => updateParam("priority", e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        {/* Category Dropdown */}
        <div className="flex flex-col">
          <label className="mb-1 text-xs font-bold text-slate-700">Category</label>
          <select
            value={searchParams.get("category") ?? ""}
            onChange={(e) => updateParam("category", e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="IT_SUPPORT">IT Support</option>
            <option value="FACILITIES">Facilities</option>
            <option value="HR">HR</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Manager Assignee Filter or Sort */}
        {showAssignedTo ? (
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-bold text-slate-700">Assigned To</label>
            <select
              value={searchParams.get("assignedTo") ?? ""}
              onChange={(e) => updateParam("assignedTo", e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none cursor-pointer"
            >
              <option value="">Anyone</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-bold text-slate-700">Sort By</label>
            <select
              value={searchParams.get("sort") ?? "date"}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none cursor-pointer"
            >
              <option value="date">Newest First</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
