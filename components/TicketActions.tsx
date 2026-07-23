"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    assignTicket,
    updateTicketStatus,
    updateTicketPriority,
} from "../app/actions/tickets";
import { canTransition } from "@/../lib/workflow";

type Role = "MANAGER" | "TECHNICAL" | "EMPLOYEE";
type Status = "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

const STATUS_ORDER: Status[] = [
    "OPEN",
    "ASSIGNED",
    "IN_PROGRESS",
    "RESOLVED",
    "CLOSED",
];

const NEXT_STATUS_LABEL: Partial<Record<Status, string>> = {
    ASSIGNED: "Start Progress",
    IN_PROGRESS: "Mark Resolved",
    CLOSED: "Confirm & Close",
};

export default function TicketActions({
    ticketId,
    status,
    priority,
    role,
    isAssignee,
    isCreator,
    currentAssignedToId,
    technicians,
}: {
    ticketId: string;
    status: Status;
    priority: Priority;
    role: Role;
    isAssignee: boolean;
    isCreator: boolean;
    currentAssignedToId: string | null;
    technicians: { id: string; name: string; email: string }[];
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [assigneeId, setAssigneeId] = useState(currentAssignedToId ?? "");

    function runAction(
        fn: () => Promise<{ success: boolean; message?: string }>,
    ) {
        setError(null);
        startTransition(async () => {
            const result = await fn();
            if (!result.success) {
                setError(result.message ?? "Action failed.");
            } else {
                router.refresh();
            }
        });
    }

    // Figure out which forward status transitions are available to this user
    const possibleNextStatuses = STATUS_ORDER.filter((next) =>
        canTransition(role, status, next, isAssignee, isCreator),
    );

    const canAssign = role === "MANAGER" && status !== "CLOSED";
    const canChangePriority = role === "MANAGER" && status !== "CLOSED";

    if (!canAssign && !canChangePriority && possibleNextStatuses.length === 0) {
        return null;
    }

    return (
        <div className="rounded-lg border bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-zinc-500">
                Actions
            </h2>

            {error && (
                <div className="mb-3 rounded bg-red-100 p-2 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
                {canAssign && (
                    <div className="flex items-center gap-2">
                        <select
                            value={assigneeId}
                            onChange={(e) => setAssigneeId(e.target.value)}
                            className="rounded border p-1.5 text-sm"
                        >
                            <option value="">Select technician...</option>
                            {technicians.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                        <button
                            disabled={!assigneeId || isPending}
                            onClick={() =>
                                runAction(() =>
                                    assignTicket({
                                        ticketId,
                                        assignedToId: assigneeId,
                                    }),
                                )
                            }
                            className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {currentAssignedToId ? "Reassign" : "Assign"}
                        </button>
                    </div>
                )}

                {canChangePriority && (
                    <div className="flex items-center gap-2">
                        <select
                            defaultValue={priority}
                            onChange={(e) =>
                                runAction(() =>
                                    updateTicketPriority({
                                        ticketId,
                                        priority: e.target.value as Priority,
                                    }),
                                )
                            }
                            className="rounded border p-1.5 text-sm"
                        >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="CRITICAL">Critical</option>
                        </select>
                    </div>
                )}

                {possibleNextStatuses.map((next) => (
                    <button
                        key={next}
                        disabled={isPending}
                        onClick={() =>
                            runAction(() =>
                                updateTicketStatus({ ticketId, status: next }),
                            )
                        }
                        className="rounded border border-blue-600 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                    >
                        {NEXT_STATUS_LABEL[next] ?? `Move to ${next}`}
                    </button>
                ))}
            </div>
        </div>
    );
}
