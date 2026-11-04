import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "../../../lib/session";
import { getTicketDetail, getTechnicians } from "../../actions/tickets";
import NavBar from "../../../components/NavBar";
import {
  StatusBadge,
  PriorityBadge,
  CategoryBadge,
} from "../../../components/Badges";
import TicketActions from "../../../components/TicketActions";
import CommentForm from "../../../components/CommentForm";

interface TicketUser {
  id: string;
  name: string;
}

interface ActivityItem {
  id: string;
  detail: string;
  type: string;
  createdAt: Date | string;
  user: TicketUser;
}

interface CommentItem {
  id: string;
  content: string;
  createdAt: Date | string;
  user: TicketUser;
}

const STEPS = ["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const STEP_LABELS: Record<string, string> = {
  OPEN: "Open",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const ticket = await getTicketDetail(id);
  if (!ticket) notFound();

  const technicians =
    user.role === "MANAGER" || user.role === "ADMIN" ? await getTechnicians() : [];

  const activities: ActivityItem[] = ticket.activities ?? [];
  const comments: CommentItem[] = ticket.comments ?? [];

  const timeline = [
    ...activities.map((a) => ({
      kind: "activity" as const,
      id: a.id,
      user: a.user,
      createdAt: new Date(a.createdAt),
      text: a.detail,
      type: a.type,
    })),
    ...comments.map((c) => ({
      kind: "comment" as const,
      id: c.id,
      user: c.user,
      createdAt: new Date(c.createdAt),
      text: c.content,
      type: "COMMENT" as const,
    })),
  ].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const isAssignee = ticket.assignedToId === user.id;
  const isCreator = ticket.createdById === user.id;
  const isInvolved =
    user.role === "ADMIN" || user.role === "MANAGER" || isAssignee || isCreator;

  const currentStepIndex = STEPS.indexOf(ticket.status);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavBar user={user} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Back Link & Header */}
        <div>
          <Link
            href="/tickets"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors mb-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Tickets
          </Link>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-sm font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200">
                {ticket.ticketNumber}
              </span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              <CategoryBadge category={ticket.category} />
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {ticket.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">Created by:</span>
                <span className="font-bold text-slate-900">{ticket.createdBy.name}</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">Created date:</span>
                <span>{new Date(ticket.createdAt).toLocaleString()}</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">Assigned Tech:</span>
                {ticket.assignedTo ? (
                  <span className="font-bold text-slate-900">{ticket.assignedTo.name}</span>
                ) : (
                  <span className="italic text-slate-400">Unassigned</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Stepper Progress Bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
            Ticket Status Progression Workflow
          </h2>
          <div className="relative flex items-center justify-between">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-500"
              style={{
                width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%`,
              }}
            />

            {STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                      isCurrent
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-110"
                        : isCompleted
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-300 bg-white text-slate-400"
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span className={`mt-2 text-[11px] font-bold ${isCurrent ? "text-indigo-600" : isCompleted ? "text-slate-900" : "text-slate-400"}`}>
                    {STEP_LABELS[step]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ticket Description Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Issue Description
          </h2>
          <p className="whitespace-pre-wrap text-sm text-slate-800 leading-relaxed font-normal">
            {ticket.description}
          </p>
        </div>

        {/* Ticket Action Controls */}
        <TicketActions
          ticketId={ticket.id}
          status={ticket.status}
          priority={ticket.priority}
          role={user.role}
          isAssignee={isAssignee}
          isCreator={isCreator}
          currentAssignedToId={ticket.assignedToId}
          technicians={technicians}
        />

        {/* Unified Timeline & Comments */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Activity Timeline & Comments
          </h2>

          <div className="space-y-4">
            {timeline.length === 0 && (
              <p className="text-sm text-slate-400 italic">No timeline activity recorded yet.</p>
            )}

            {timeline.map((item) => (
              <div key={`${item.kind}-${item.id}`} className="flex items-start gap-3.5 group">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 flex-shrink-0 mt-0.5">
                  {item.user.name[0]}
                </div>
                <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{item.user.name}</span>
                      {item.kind === "comment" ? (
                        <span className="rounded bg-blue-100 text-blue-700 px-1.5 py-0.5 font-bold text-[10px] uppercase">
                          Comment
                        </span>
                      ) : (
                        <span className="rounded bg-slate-200 text-slate-600 px-1.5 py-0.5 font-bold text-[10px] uppercase">
                          {item.type.replace("_", " ")}
                        </span>
                      )}
                    </div>
                    <span className="text-slate-600 font-medium">
                      {item.createdAt.toLocaleString()}
                    </span>
                  </div>
                  <div
                    className={
                      item.kind === "comment"
                        ? "text-sm text-slate-900 font-medium pt-1"
                        : "text-xs italic text-slate-600 pt-0.5"
                    }
                  >
                    {item.text}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Comment Form */}
          {isInvolved && (
            <div className="pt-4 border-t border-slate-100">
              <CommentForm ticketId={ticket.id} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
