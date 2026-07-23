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
            className="rounded-lg border bg-white p-4"
        >
            {error && (
                <div className="mb-2 rounded bg-red-100 p-2 text-sm text-red-700">
                    {error}
                </div>
            )}
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add a comment or update..."
                rows={3}
                className="w-full rounded border p-2 text-sm"
            />
            <div className="mt-2 flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {isSubmitting ? "Posting..." : "Post Comment"}
                </button>
            </div>
        </form>
    );
}
