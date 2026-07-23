"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addComment } from "../app/actions/tickets";

export default function CommentForm({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);
    const result = await addComment({ ticketId, content });
    setIsSubmitting(false);

    if (result.success) {
      setContent("");
      router.refresh();
    } else {
      setError(result.message ?? "Could not add comment.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
    >
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Post Comment / Progress Update
        </label>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-3 border border-red-200 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type an update or reply here..."
        rows={3}
        className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none"
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          {isSubmitting ? "Posting..." : "Post Update"}
        </button>
      </div>
    </form>
  );
}
