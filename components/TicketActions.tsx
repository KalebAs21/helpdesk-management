"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  assignTicket,
  updateTicketStatus,
  updateTicketPriority,
} from "../app/actions/tickets";
import { canTransition } from "@/../lib/workflow";

type Role = "ADMIN" | "MANAGER" | "TECHNICAL" | "EMPLOYEE";
type Status = "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

const STATUS_ORDER: Status[] = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

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
    fn: () => Promise<{ success: boolean; message?: string }>
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

  // Get allowed forward/backward status transitions for current user role
  const possibleNextStatuses = STATUS_ORDER.filter((next) =>
    canTransition(role, status, next, isAssignee, isCreator)
  );

  const canAssign = (role === "MANAGER" || role === "ADMIN") && status !== "CLOSED";
  const canChangePriority = (role === "MANAGER" || role === "ADMIN") && status !== "CLOSED";

  if (!canAssign && !canChangePriority && possibleNextStatuses.length === 0) {
    return null;
  }

  const getButtonText = (targetStatus: Status): string => {
    if (status === "ASSIGNED" && targetStatus === "IN_PROGRESS") return "Start Progress";
    if (status === "IN_PROGRESS" && targetStatus === "RESOLVED") return "Mark as Resolved";
    if (status === "RESOLVED" && targetStatus === "CLOSED") return "Confirm & Close Ticket";
    if (status === "RESOLVED" && targetStatus === "IN_PROGRESS") return "Reopen Ticket";
    if (status === "OPEN" && targetStatus === "ASSIGNED") return "Assign Ticket";
    return `Move to ${targetStatus.replace("_", " ")}`;
  };

  const getButtonIcon = (targetStatus: Status) => {
    if (targetStatus === "IN_PROGRESS") {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    if (targetStatus === "RESOLVED" || targetStatus === "CLOSED") {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        Workflow Management Actions
      </h2>

      {error && (
        <div className="rounded-xl bg-red-50 p-3.5 border border-red-200 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        {/* Manager Assign Controls */}
        {canAssign && (
          <div className="flex items-center gap-2.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap pl-1">Assign Tech:</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 outline-none cursor-pointer"
            >
              <option value="">Select Technician...</option>
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
                  })
                )
              }
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer"
            >
              {currentAssignedToId ? "Reassign" : "Assign"}
            </button>
          </div>
        )}

        {/* Manager Priority Control */}
        {canChangePriority && (
          <div className="flex items-center gap-2.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap pl-1">Set Priority:</label>
            <select
              defaultValue={priority}
              onChange={(e) =>
                runAction(() =>
                  updateTicketPriority({
                    ticketId,
                    priority: e.target.value as Priority,
                  })
                )
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 outline-none cursor-pointer"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        )}

        {/* Status Transition Action Buttons */}
        {possibleNextStatuses.map((next) => {
          const isReopen = next === "IN_PROGRESS" && status === "RESOLVED";
          const btnClass = isReopen
            ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20";

          return (
            <button
              key={next}
              disabled={isPending}
              onClick={() =>
                runAction(() =>
                  updateTicketStatus({ ticketId, status: next })
                )
              }
              className={`inline-flex items-center gap-2 rounded-xl border border-transparent px-4 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 ${btnClass}`}
            >
              {getButtonIcon(next)}
              {getButtonText(next)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
