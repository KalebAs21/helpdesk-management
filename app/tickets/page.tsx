import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/../lib/session";
import { getVisibleTickets, getTechnicians } from "../actions/tickets";
import NavBar from "@/../components/NavBar";
import TicketFilters from "@/../components/TicketFilters";
import {
  StatusBadge,
  PriorityBadge,
  CategoryBadge,
} from "@/../components/Badges";

type SearchParams = {
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: string;
  search?: string;
  sort?: "date" | "priority" | "status";
};

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requireUser();
  const params = await searchParams;

  const [tickets, technicians] = await Promise.all([
    getVisibleTickets(params),
    user.role === "MANAGER" ? getTechnicians() : Promise.resolve([]),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavBar user={user} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {user.role === "MANAGER" ? "All System Tickets" : user.role === "TECHNICAL" ? "Assigned Technical Tickets" : "My Support Tickets"}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Showing {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"} based on active filters
            </p>
          </div>
          <Link
            href="/tickets/create"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-blue-700 transition-all self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Ticket
          </Link>
        </div>

        {/* Filter Toolbar */}
        <Suspense fallback={null}>
          <TicketFilters
            showAssignedTo={user.role === "MANAGER"}
            technicians={technicians}
          />
        </Suspense>

        {/* Tickets Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600 font-bold">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Title & Issue Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Assigned Technician</th>
                  <th className="px-6 py-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <p className="font-semibold text-slate-900">No tickets found</p>
                      <p className="text-xs text-slate-500 mt-1">Try clearing filters or search query to view more items.</p>
                    </td>
                  </tr>
                )}
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-indigo-50/40 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs font-bold">
                      <Link
                        href={`/tickets/${t.id}`}
                        className="inline-block rounded-lg bg-indigo-50 px-2.5 py-1 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-all"
                      >
                        {t.ticketNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/tickets/${t.id}`}
                        className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1"
                      >
                        {t.title}
                      </Link>
                      <div className="text-xs text-slate-500 mt-0.5">
                        By {t.createdBy.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <CategoryBadge category={t.category} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-medium">
                      {t.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                            {t.assignedTo.name[0]}
                          </div>
                          <span>{t.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 font-medium">
                      {new Date(t.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
