import Link from "next/link";
import { logoutUser } from "../app/actions/auth";
import { SessionUser } from "@/../lib/session";
import Image from "next/image";

const ROLE_BADGE_STYLE: Record<SessionUser["role"], { label: string; style: string }> = {
  MANAGER: { label: "Manager", style: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200" },
  TECHNICAL: { label: "Tech Staff", style: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200" },
  EMPLOYEE: { label: "Employee", style: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200" },
};

export default function NavBar({ user }: { user: SessionUser }) {
  const roleConfig = ROLE_BADGE_STYLE[user.role] ?? { label: user.role, style: "bg-slate-100 text-slate-700" };
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
        {/* Left Section: Logo & Nav Links */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
             <div className="mx-auto flex h-18 w-58 items-center justify-center">
                              <Image
                                  src="/dcmme-logo.png"
                                  alt="DCMME Logo"
                                  width={400}
                                  height={150}
                                  className="h-full w-full object-contain"
                                  priority
                              />
                          </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
              DeskFlow
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100/80 transition-all"
            >
              Dashboard
            </Link>
            <Link
              href="/tickets"
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100/80 transition-all"
            >
              Tickets
            </Link>
            <Link
              href="/tickets/create"
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100/80 transition-all flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Ticket
            </Link>
          </nav>
        </div>

        {/* Right Section: User Info & Logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 border-r border-slate-200 pr-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white font-semibold text-xs shadow-xs">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-semibold text-slate-900 leading-tight">{user.name}</div>
              <div className="mt-0.5">
                <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${roleConfig.style}`}>
                  {roleConfig.label}
                </span>
              </div>
            </div>
          </div>

          <form action={logoutUser}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-red-600 hover:border-red-200 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5" />
              </svg>
              Logout
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
