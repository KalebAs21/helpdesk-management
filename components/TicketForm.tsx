"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTicketSchema, CreateTicketInput } from "../lib/validations";
import { createTicket } from "../app/actions/tickets";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TicketForm() {
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CreateTicketInput>({
        resolver: zodResolver(createTicketSchema),
        defaultValues: { category: "IT_SUPPORT", priority: "MEDIUM" },
    });

    async function onSubmit(data: CreateTicketInput) {
        setErrorMessage(null);
        const result = await createTicket(data);

        if (result.success) {
            router.push(`/tickets/${result.ticketId}`);
            router.refresh();
        } else {
            setErrorMessage(result.message ?? "Could not create ticket.");
        }
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 rounded-lg border bg-white p-6"
        >
            {errorMessage && (
                <div className="rounded bg-red-100 p-2 text-sm text-red-700">
                    {errorMessage}
                </div>
            )}

            <div>
                <label className="mb-1 block text-sm font-medium">Title</label>
                <input
                    {...register("title")}
                    placeholder="Short summary of the issue"
                    className="w-full rounded border p-2"
                />
                {errors.title && (
                    <p className="text-sm text-red-500">
                        {errors.title.message}
                    </p>
                )}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">
                    Description
                </label>
                <textarea
                    {...register("description")}
                    rows={5}
                    placeholder="Describe the problem in detail"
                    className="w-full rounded border p-2"
                />
                {errors.description && (
                    <p className="text-sm text-red-500">
                        {errors.description.message}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Category
                    </label>
                    <select
                        {...register("category")}
                        className="w-full rounded border p-2"
                    >
                        <option value="IT_SUPPORT">IT Support</option>
                        <option value="FACILITIES">Facilities</option>
                        <option value="HR">HR</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Priority
                    </label>
                    <select
                        {...register("priority")}
                        className="w-full rounded border p-2"
                    >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                    </select>
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded bg-blue-600 p-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
                {isSubmitting ? "Creating..." : "Create Ticket"}
            </button>
        </form>
    );
}
