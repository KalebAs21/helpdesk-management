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
        <div className="flex min-h-screen flex-col">
            <NavBar user={user} />

            <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        {user.role === "MANAGER" ? "All Tickets" : "My Tickets"}
                    </h1>
                    <Link
                        href="/tickets/create"
                        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Create Ticket
                    </Link>
                </div>

                <Suspense fallback={null}>
                    <TicketFilters
                        showAssignedTo={user.role === "MANAGER"}
                        technicians={technicians}
                    />
                </Suspense>

                <div className="overflow-hidden rounded-lg border bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-zinc-50 text-left text-zinc-500">
                            <tr>
                                <th className="px-4 py-2">Ticket</th>
                                <th className="px-4 py-2">Title</th>
                                <th className="px-4 py-2">Category</th>
                                <th className="px-4 py-2">Priority</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Assigned To</th>
                                <th className="px-4 py-2">Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-8 text-center text-zinc-400"
                                    >
                                        No tickets found.
                                    </td>
                                </tr>
                            )}
                            {tickets.map((t) => (
                                <tr
                                    key={t.id}
                                    className="border-t hover:bg-zinc-50"
                                >
                                    <td className="px-4 py-2 font-mono text-xs">
                                        <Link
                                            href={`/tickets/${t.id}`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {t.ticketNumber}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-2">
                                        <Link
                                            href={`/tickets/${t.id}`}
                                            className="hover:underline"
                                        >
                                            {t.title}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-2">
                                        <CategoryBadge category={t.category} />
                                    </td>
                                    <td className="px-4 py-2">
                                        <PriorityBadge priority={t.priority} />
                                    </td>
                                    <td className="px-4 py-2">
                                        <StatusBadge status={t.status} />
                                    </td>
                                    <td className="px-4 py-2 text-zinc-600">
                                        {t.assignedTo?.name ?? "—"}
                                    </td>
                                    <td className="px-4 py-2 text-zinc-600">
                                        {t.createdAt.toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
