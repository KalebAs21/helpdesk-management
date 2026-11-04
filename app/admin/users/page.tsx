import { requireRole } from "../../../lib/session";
import { getAdminUsers } from "../../actions/admin";
import NavBar from "../../../components/NavBar";
import CreateUserForm from "../../../components/CreateUserForm";

export default async function AdminUsersPage() {
  // Strictly enforce server-side that only an ADMIN can view this page
  const user = await requireRole(["ADMIN"]);
  const users = await getAdminUsers();

  const ROLE_COLORS: Record<string, string> = {
    ADMIN: "bg-rose-100 text-rose-800 border-rose-200",
    MANAGER: "bg-purple-100 text-purple-800 border-purple-200",
    TECHNICAL: "bg-blue-100 text-blue-800 border-blue-200",
    EMPLOYEE: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };

  const DEPT_COLORS: Record<string, string> = {
    IT: "bg-indigo-50 text-indigo-700 border-indigo-200",
    ELECTRICAL: "bg-amber-50 text-amber-700 border-amber-200",
    GENERAL: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavBar user={user} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700 uppercase tracking-wide">
                Admin Center
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              User & Role Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Securely create company accounts, assign roles, and allocate departments.
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-slate-900">{users.length}</span>
            <p className="text-xs font-semibold text-slate-500">Registered Accounts</p>
          </div>
        </div>

        {/* Create User Form Section */}
        <CreateUserForm />

        {/* Existing Users Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              All System Users ({users.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600 font-bold">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">System Role</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Activity</th>
                  <th className="px-6 py-3.5">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {u.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-xs text-slate-500 font-medium">{u.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold ${ROLE_COLORS[u.role] ?? "bg-slate-100 text-slate-700"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.department ? (
                        <span className={`inline-block rounded-lg border px-2 py-0.5 text-xs font-semibold ${DEPT_COLORS[u.department] ?? "bg-slate-100 text-slate-600"}`}>
                          {u.department}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Global (All Depts)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 font-medium">
                      <span>{u._count.createdTickets} created</span>
                      <span className="mx-1.5 text-slate-300">·</span>
                      <span>{u._count.assignedTickets} assigned</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                      {new Date(u.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
