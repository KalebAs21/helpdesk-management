import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  CATEGORY_LABELS,
} from "@/../lib/workflow";

const STATUS_CONFIG: Record<string, { label: string; style: string; dot: string }> = {
  OPEN: {
    label: "Open",
    style: "bg-rose-100/80 text-rose-800 border-rose-200",
    dot: "bg-rose-500",
  },
  ASSIGNED: {
    label: "Assigned",
    style: "bg-indigo-100/80 text-indigo-800 border-indigo-200",
    dot: "bg-indigo-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    style: "bg-amber-100/80 text-amber-800 border-amber-200",
    dot: "bg-amber-500 animate-pulse",
  },
  RESOLVED: {
    label: "Resolved",
    style: "bg-emerald-100/80 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
  },
  CLOSED: {
    label: "Closed",
    style: "bg-slate-200/80 text-slate-700 border-slate-300",
    dot: "bg-slate-500",
  },
};

const PRIORITY_CONFIG: Record<string, { label: string; style: string }> = {
  LOW: {
    label: "Low",
    style: "bg-slate-100 text-slate-700 border-slate-200",
  },
  MEDIUM: {
    label: "Medium",
    style: "bg-blue-100 text-blue-800 border-blue-200",
  },
  HIGH: {
    label: "High",
    style: "bg-amber-100 text-amber-800 border-amber-200 font-bold",
  },
  CRITICAL: {
    label: "Critical",
    style: "bg-rose-100 text-rose-800 border-rose-300 font-extrabold shadow-2xs",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status,
    style: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.style}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const config = PRIORITY_CONFIG[priority] ?? {
    label: PRIORITY_LABELS[priority] ?? priority,
    style: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.style}`}
    >
      {priority === "CRITICAL" && (
        <svg className="w-3 h-3 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )}
      {config.label}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  const label = CATEGORY_LABELS[category] ?? category;
  return (
    <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100/70 px-2.5 py-0.5 text-xs font-medium text-slate-700">
      {label}
    </span>
  );
}
