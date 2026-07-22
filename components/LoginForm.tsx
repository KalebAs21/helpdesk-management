"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "../lib/validations";
import { loginUser } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    async function onSubmit(data: LoginInput) {
        setErrorMessage(null);
        const result = await loginUser(data);

        if (result.success) {
            router.push("/dashboard");
            router.refresh();
        } else {
            setErrorMessage(result.message ?? "Login failed.");
        }
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 w-96 rounded-lg border p-6 shadow-sm"
        >
            <h1 className="text-2xl font-bold">Login</h1>

            {errorMessage && (
                <div className="rounded bg-red-100 p-2 text-sm text-red-700">
                    {errorMessage}
                </div>
            )}

            <div>
                <input
                    {...register("email")}
                    type="email"
                    placeholder="Email"
                    className="w-full border p-2 rounded"
                />
                {errors.email && (
                    <p className="text-sm text-red-500">
                        {errors.email.message}
                    </p>
                )}
            </div>

            <div>
                <input
                    type="password"
                    {...register("password")}
                    placeholder="Password"
                    className="w-full border p-2 rounded"
                />
                {errors.password && (
                    <p className="text-sm text-red-500">
                        {errors.password.message}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded bg-blue-600 p-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
            >
                {isSubmitting ? "Logging in..." : "Login"}
            </button>
        </form>
    );
}
