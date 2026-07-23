import {
    STATUS_LABELS,
    PRIORITY_LABELS,
    CATEGORY_LABELS,
} from "@/../lib/workflow";

const STATUS_COLORS: Record<string, string> = {
    OPEN: "bg-zinc-100 text-zinc-700",
    ASSIGNED: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-amber-100 text-amber-700",
    RESOLVED: "bg-green-100 text-green-700",
    CLOSED: "bg-zinc-200 text-zinc-500",
};

const PRIORITY_COLORS: Record<string, string> = {
    LOW: "bg-zinc-100 text-zinc-600",
    MEDIUM: "bg-blue-100 text-blue-700",
    HIGH: "bg-orange-100 text-orange-700",
    CRITICAL: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: string }) {
    return (
        <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                STATUS_COLORS[status] ?? "bg-zinc-100 text-zinc-700"
            }`}
        >
            {STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status}
        </span>
    );
}

export function PriorityBadge({ priority }: { priority: string }) {
    return (
        <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                PRIORITY_COLORS[priority] ?? "bg-zinc-100 text-zinc-700"
            }`}
        >
            {PRIORITY_LABELS[priority] ?? priority}
        </span>
    );
}

export function CategoryBadge({ category }: { category: string }) {
    return (
        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
            {CATEGORY_LABELS[category] ?? category}
        </span>
    );
}
