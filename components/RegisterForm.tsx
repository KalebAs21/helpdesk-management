"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "../lib/validations";
import { registerUser } from "@/actions/auth";

export default function RegisterForm() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    });

    async function onSubmit(data: RegisterInput) {
        const result = await registerUser(data);

        if (result.success) {
            alert("Registration Successful");
        } else {
            alert(result.message ?? "Registration Failed");
        }
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 w-96 rounded-lg border p-6"
        >
            <h1 className="text-2xl font-bold">Register</h1>

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
                className="w-full rounded bg-blue-600 p-2 text-white"
            >
                Register
            </button>
        </form>
    );
}
