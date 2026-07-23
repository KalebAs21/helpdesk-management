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

    return (
        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
            <form onSubmit={handleSearchSubmit} className="flex flex-col">
                <label className="mb-1 text-xs font-medium text-zinc-500">
                    Search title
                </label>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-48 rounded border p-1.5 text-sm"
                />
            </form>

            <div className="flex flex-col">
                <label className="mb-1 text-xs font-medium text-zinc-500">
                    Status
                </label>
                <select
                    defaultValue={searchParams.get("status") ?? ""}
                    onChange={(e) => updateParam("status", e.target.value)}
                    className="rounded border p-1.5 text-sm"
                >
                    <option value="">All</option>
                    <option value="OPEN">Open</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                </select>
            </div>

            <div className="flex flex-col">
                <label className="mb-1 text-xs font-medium text-zinc-500">
                    Priority
                </label>
                <select
                    defaultValue={searchParams.get("priority") ?? ""}
                    onChange={(e) => updateParam("priority", e.target.value)}
                    className="rounded border p-1.5 text-sm"
                >
                    <option value="">All</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                </select>
            </div>

            <div className="flex flex-col">
                <label className="mb-1 text-xs font-medium text-zinc-500">
                    Category
                </label>
                <select
                    defaultValue={searchParams.get("category") ?? ""}
                    onChange={(e) => updateParam("category", e.target.value)}
                    className="rounded border p-1.5 text-sm"
                >
                    <option value="">All</option>
                    <option value="IT_SUPPORT">IT Support</option>
                    <option value="FACILITIES">Facilities</option>
                    <option value="HR">HR</option>
                    <option value="OTHER">Other</option>
                </select>
            </div>

            {showAssignedTo && (
                <div className="flex flex-col">
                    <label className="mb-1 text-xs font-medium text-zinc-500">
                        Assigned To
                    </label>
                    <select
                        defaultValue={searchParams.get("assignedTo") ?? ""}
                        onChange={(e) =>
                            updateParam("assignedTo", e.target.value)
                        }
                        className="rounded border p-1.5 text-sm"
                    >
                        <option value="">Anyone</option>
                        {technicians.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="flex flex-col">
                <label className="mb-1 text-xs font-medium text-zinc-500">
                    Sort by
                </label>
                <select
                    defaultValue={searchParams.get("sort") ?? "date"}
                    onChange={(e) => updateParam("sort", e.target.value)}
                    className="rounded border p-1.5 text-sm"
                >
                    <option value="date">Newest</option>
                    <option value="priority">Priority</option>
                    <option value="status">Status</option>
                </select>
            </div>

            {searchParams.toString().length > 0 && (
                <button
                    type="button"
                    onClick={() => router.push(pathname)}
                    className="rounded border px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100"
                >
                    Clear filters
                </button>
            )}
        </div>
    );
}
