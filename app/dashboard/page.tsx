import Link from "next/link";
import { requireUser } from "@/../lib/session";
import { getDashboardStats } from "../actions/tickets";
import NavBar from "@/../components/NavBar";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/../lib/workflow";

function StatWidget({
  title,
  value,
  subtitle,
  icon,
  accentColor = "indigo",
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: "indigo" | "blue" | "emerald" | "amber" | "rose" | "purple";
}) {
  const accentStyles = {
    indigo: "border-l-indigo-600 text-indigo-600 bg-indigo-50/50",
    blue: "border-l-blue-600 text-blue-600 bg-blue-50/50",
    emerald: "border-l-emerald-600 text-emerald-600 bg-emerald-50/50",
    amber: "border-l-amber-500 text-amber-600 bg-amber-50/50",
    rose: "border-l-rose-600 text-rose-600 bg-rose-50/50",
    purple: "border-l-purple-600 text-purple-600 bg-purple-50/50",
  };

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-xs border-l-4 ${accentStyles[accentColor]} hover:shadow-md transition-all`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</span>
        {icon && <div className="p-2 rounded-xl bg-slate-100/80">{icon}</div>}
      </div>
      <div className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">{value}</div>
      {subtitle && <div className="mt-1 text-xs text-slate-500">{subtitle}</div>}
    </div>
  );
}

export default async function Dashboard() {
  const user = await requireUser();
  const stats = await getDashboardStats();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavBar user={user} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Dashboard Overview</span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">Welcome back, {user.name}</h1>
            <p className="text-sm text-slate-600 mt-1">
              Here is what's happening across your support workflow today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/tickets"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-all"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              View All Tickets
            </Link>
            <Link
              href="/tickets/create"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-blue-700 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Ticket
            </Link>
          </div>
        </div>

        {/* Administrator Command Center View */}
        {stats.role === "ADMIN" && (
          <div className="space-y-8">
            {/* Top Admin Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatWidget
                title="System Accounts"
                value={stats.totalUsers}
                subtitle="Total registered users across company"
                accentColor="purple"
                icon={
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
              />
              <StatWidget
                title="Total Tickets"
                value={stats.total}
                subtitle="All-time support tickets logged"
                accentColor="indigo"
                icon={
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                }
              />
              <StatWidget
                title="Technical Staff"
                value={stats.technicians.length}
                subtitle="Active technicians handling issues"
                accentColor="blue"
                icon={
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              />
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Quick Admin Action</span>
                  <p className="text-xs text-slate-500 mt-1">Manage permissions, roles, and departments</p>
                </div>
                <Link
                  href="/admin/users"
                  className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-rose-500/20 hover:bg-rose-700 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  User Management
                </Link>
              </div>
            </div>

            {/* Ticket Pipeline Statuses */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Company-Wide Ticket Statuses
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                <StatWidget
                  title="Total System"
                  value={stats.total}
                  accentColor="purple"
                />
                {stats.byStatus.map((s) => {
                  const colorMap: Record<string, "indigo" | "blue" | "amber" | "emerald" | "rose"> = {
                    OPEN: "rose",
                    ASSIGNED: "indigo",
                    IN_PROGRESS: "amber",
                    RESOLVED: "emerald",
                    CLOSED: "blue",
                  };
                  return (
                    <StatWidget
                      key={s.status}
                      title={STATUS_LABELS[s.status] ?? s.status}
                      value={s._count}
                      accentColor={colorMap[s.status] ?? "indigo"}
                    />
                  );
                })}
              </div>
            </div>

            {/* Technical Team Workload */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Technical Team Workload
              </h2>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600 font-bold">
                    <tr>
                      <th className="px-6 py-3.5">Technician Name</th>
                      <th className="px-6 py-3.5">Active Open Tickets</th>
                      <th className="px-6 py-3.5">Capacity Bar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.technicians.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                            {t.name[0]}
                          </div>
                          {t.name}
                        </td>
                        <td className="px-6 py-4 font-extrabold text-slate-900">
                          {t.openCount} {t.openCount === 1 ? "ticket" : "tickets"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-48 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-2.5 rounded-full ${
                                t.openCount > 3 ? "bg-rose-500" : t.openCount > 1 ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                              style={{ width: `${Math.min(t.openCount * 25, 100)}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Manager View */}
        {stats.role === "MANAGER" && (
          <div className="space-y-8">
            {/* Status Grid */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Tickets by Status
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                <StatWidget
                  title="Total System"
                  value={stats.total}
                  accentColor="purple"
                  icon={
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  }
                />
                {stats.byStatus.map((s) => {
                  const colorMap: Record<string, "indigo" | "blue" | "amber" | "emerald" | "rose"> = {
                    OPEN: "rose",
                    ASSIGNED: "indigo",
                    IN_PROGRESS: "amber",
                    RESOLVED: "emerald",
                    CLOSED: "blue",
                  };
                  return (
                    <StatWidget
                      key={s.status}
                      title={STATUS_LABELS[s.status] ?? s.status}
                      value={s._count}
                      accentColor={colorMap[s.status] ?? "indigo"}
                    />
                  );
                })}
              </div>
            </div>

            {/* Priority Section */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Tickets by Priority
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {stats.byPriority.map((p) => {
                  const colorMap: Record<string, "indigo" | "blue" | "amber" | "rose"> = {
                    LOW: "indigo",
                    MEDIUM: "blue",
                    HIGH: "amber",
                    CRITICAL: "rose",
                  };
                  return (
                    <StatWidget
                      key={p.priority}
                      title={PRIORITY_LABELS[p.priority] ?? p.priority}
                      value={p._count}
                      accentColor={colorMap[p.priority] ?? "indigo"}
                    />
                  );
                })}
              </div>
            </div>

            {/* Team Workload Table */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Technical Team Workload
              </h2>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600 font-bold">
                    <tr>
                      <th className="px-6 py-3.5">Technician Name</th>
                      <th className="px-6 py-3.5">Active Open Tickets</th>
                      <th className="px-6 py-3.5">Capacity Bar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.technicians.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                            {t.name[0]}
                          </div>
                          {t.name}
                        </td>
                        <td className="px-6 py-4 font-extrabold text-slate-900">
                          {t.openCount} {t.openCount === 1 ? "ticket" : "tickets"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-48 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-2.5 rounded-full ${
                                t.openCount > 3 ? "bg-rose-500" : t.openCount > 1 ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                              style={{ width: `${Math.min(t.openCount * 25, 100)}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Technical Staff View */}
        {stats.role === "TECHNICAL" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatWidget
              title="Assigned To Me"
              value={stats.assignedToMe}
              subtitle="Total tickets currently assigned to your queue"
              accentColor="blue"
              icon={
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            />
            <StatWidget
              title="Active In-Progress Tickets"
              value={stats.openAssignedToMe}
              subtitle="Tickets currently requiring technical resolution"
              accentColor="amber"
              icon={
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>
        )}

        {/* Employee View */}
        {stats.role === "EMPLOYEE" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatWidget
              title="My Submitted Tickets"
              value={stats.myTickets}
              subtitle="Total issues reported by you"
              accentColor="indigo"
              icon={
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
            />
            <StatWidget
              title="Awaiting My Confirmation"
              value={stats.awaitingAction}
              subtitle="Resolved tickets ready for your confirmation to close"
              accentColor="emerald"
              icon={
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>
        )}
      </main>
    </div>
  );
}
