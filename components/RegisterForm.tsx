"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "../lib/validations";
import { registerUser } from "../app/actions/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterForm() {
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: { role: "EMPLOYEE" },
    });

    async function onSubmit(data: RegisterInput) {
        setErrorMessage(null);
        const result = await registerUser(data);

        if (result.success) {
            router.push("/login?registered=1");
        } else {
            setErrorMessage(result.message ?? "Registration failed.");
        }
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 w-96 rounded-lg border p-6 shadow-sm"
        >
            <h1 className="text-2xl font-bold">Register</h1>

            {errorMessage && (
                <div className="rounded bg-red-100 p-2 text-sm text-red-700">
                    {errorMessage}
                </div>
            )}

            <input
                {...register("name")}
                placeholder="Full Name"
                className="w-full border p-2 rounded"
            />
            <p className="text-red-500">{errors.name?.message}</p>

            <input
                {...register("email")}
                placeholder="Email"
                className="w-full border p-2 rounded"
            />
            <p className="text-red-500">{errors.email?.message}</p>

            <input
                type="password"
                {...register("password")}
                placeholder="Password"
                className="w-full border p-2 rounded"
            />
            <p className="text-red-500">{errors.password?.message}</p>

            <select {...register("role")} className="w-full border p-2 rounded">
                <option value="EMPLOYEE">Employee</option>
                <option value="TECHNICAL">Technical</option>
                <option value="MANAGER">Manager</option>
            </select>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded bg-blue-600 p-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
            >
                {isSubmitting ? "Registering..." : "Register"}
            </button>
        </form>
    );
}
