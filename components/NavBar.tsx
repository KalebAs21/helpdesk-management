import Link from "next/link";
import { logoutUser } from "../app/actions/auth";
import { SessionUser } from "@/../lib/session";

const ROLE_LABELS: Record<SessionUser["role"], string> = {
    MANAGER: "Manager",
    TECHNICAL: "Technical",
    EMPLOYEE: "Employee",
};

export default function NavBar({ user }: { user: SessionUser }) {
    return (
        <header className="border-b bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="font-bold text-lg">
                        Helpdesk
                    </Link>
                    <nav className="flex gap-4 text-sm font-medium text-zinc-600">
                        <Link href="/dashboard" className="hover:text-zinc-900">
                            Dashboard
                        </Link>
                        <Link href="/tickets" className="hover:text-zinc-900">
                            Tickets
                        </Link>
                        <Link
                            href="/tickets/create"
                            className="hover:text-zinc-900"
                        >
                            New Ticket
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right text-sm">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-zinc-500">
                            {ROLE_LABELS[user.role]}
                        </div>
                    </div>
                    <form action={logoutUser}>
                        <button
                            type="submit"
                            className="rounded border px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
                        >
                            Log out
                        </button>
                    </form>
                </div>
            </div>
        </header>
    );
}
