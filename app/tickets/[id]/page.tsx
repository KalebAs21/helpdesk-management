import { notFound } from "next/navigation";
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

// Local types to ensure TypeScript correctly infers array structures
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

export default async function TicketDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const user = await requireUser();
    const { id } = await params;

    const ticket = await getTicketDetail(id);
    if (!ticket) notFound();

    const technicians = user.role === "MANAGER" ? await getTechnicians() : [];

    // Safely cast activities and comments to avoid the `never[]` type inference issue
    const activities: ActivityItem[] = ticket.activities ?? [];
    const comments: CommentItem[] = ticket.comments ?? [];

    // Merge activities + comments into one chronological timeline
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
    const isInvolved = user.role === "MANAGER" || isAssignee || isCreator;

    return (
        <div className="flex min-h-screen flex-col">
            <NavBar user={user} />

            <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
                <div className="mb-6">
                    <div className="flex items-center gap-3 text-sm text-zinc-500">
                        <span className="font-mono">{ticket.ticketNumber}</span>
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                        <CategoryBadge category={ticket.category} />
                    </div>
                    <h1 className="mt-2 text-2xl font-bold">{ticket.title}</h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        Created by {ticket.createdBy.name} on{" "}
                        {new Date(ticket.createdAt).toLocaleDateString()}
                        {ticket.assignedTo && (
                            <> · Assigned to {ticket.assignedTo.name}</>
                        )}
                    </p>
                </div>

                <div className="mb-6 rounded-lg border bg-white p-5">
                    <h2 className="mb-2 text-sm font-semibold text-zinc-500">
                        Description
                    </h2>
                    <p className="whitespace-pre-wrap text-sm">
                        {ticket.description}
                    </p>
                </div>

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

                <div className="mt-6">
                    <h2 className="mb-3 text-lg font-semibold">Activity</h2>
                    <div className="space-y-4 rounded-lg border bg-white p-5">
                        {timeline.length === 0 && (
                            <p className="text-sm text-zinc-400">
                                No activity yet.
                            </p>
                        )}
                        {timeline.map((item) => (
                            <div
                                key={`${item.kind}-${item.id}`}
                                className="flex gap-3 text-sm"
                            >
                                <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-zinc-300" />
                                <div>
                                    <div className="text-zinc-500">
                                        <span className="font-medium text-zinc-700">
                                            {item.user.name}
                                        </span>{" "}
                                        · {item.createdAt.toLocaleString()}
                                        {item.kind === "activity" &&
                                            item.type !== "CREATED" && (
                                                <span className="ml-1 text-zinc-400">
                                                    (
                                                    {item.type
                                                        .replace("_", " ")
                                                        .toLowerCase()}
                                                    )
                                                </span>
                                            )}
                                    </div>
                                    <div
                                        className={
                                            item.kind === "comment"
                                                ? "mt-0.5 rounded bg-zinc-50 p-2"
                                                : "mt-0.5 italic text-zinc-600"
                                        }
                                    >
                                        {item.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {isInvolved && (
                        <div className="mt-4">
                            <CommentForm ticketId={ticket.id} />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
