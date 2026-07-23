import Link from "next/link";
import { requireUser } from "@/../lib/session";
import { getDashboardStats } from "../actions/tickets";
import NavBar from "@/../components/NavBar";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/../lib/workflow";

function StatCard({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="rounded-lg border bg-white p-5">
            <div className="text-sm text-zinc-500">{label}</div>
            <div className="mt-1 text-3xl font-bold">{value}</div>
        </div>
    );
}

export default async function Dashboard() {
    const user = await requireUser();
    const stats = await getDashboardStats();

    return (
        <div className="flex min-h-screen flex-col">
            <NavBar user={user} />

            <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
                    <div className="flex gap-3">
                        <Link
                            href="/tickets"
                            className="rounded bg-white border px-4 py-2 text-sm font-medium hover:bg-zinc-100"
                        >
                            View Tickets
                        </Link>
                        <Link
                            href="/tickets/create"
                            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Create Ticket
                        </Link>
                    </div>
                </div>

                {stats.role === "MANAGER" && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <StatCard
                                label="Total Tickets"
                                value={stats.total}
                            />
                            {stats.byStatus.map((s) => (
                                <StatCard
                                    key={s.status}
                                    label={STATUS_LABELS[s.status]}
                                    value={s._count}
                                />
                            ))}
                        </div>

                        <div>
                            <h2 className="mb-3 text-lg font-semibold">
                                By Priority
                            </h2>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                {stats.byPriority.map((p) => (
                                    <StatCard
                                        key={p.priority}
                                        label={PRIORITY_LABELS[p.priority]}
                                        value={p._count}
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="mb-3 text-lg font-semibold">
                                Team Workload
                            </h2>
                            <div className="overflow-hidden rounded-lg border bg-white">
                                <table className="w-full text-sm">
                                    <thead className="bg-zinc-50 text-left text-zinc-500">
                                        <tr>
                                            <th className="px-4 py-2">
                                                Technician
                                            </th>
                                            <th className="px-4 py-2">
                                                Open Tickets
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.technicians.map((t) => (
                                            <tr key={t.id} className="border-t">
                                                <td className="px-4 py-2">
                                                    {t.name}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {t.openCount}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {stats.role === "TECHNICAL" && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <StatCard
                            label="Assigned To Me"
                            value={stats.assignedToMe}
                        />
                        <StatCard
                            label="My Open Tickets"
                            value={stats.openAssignedToMe}
                        />
                    </div>
                )}

                {stats.role === "EMPLOYEE" && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <StatCard label="My Tickets" value={stats.myTickets} />
                        <StatCard
                            label="Awaiting My Confirmation"
                            value={stats.awaitingAction}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
