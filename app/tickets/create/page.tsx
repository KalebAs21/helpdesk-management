import { requireUser } from "@/../lib/session";
import NavBar from "@/../components/NavBar";
import TicketForm from "@/../components/TicketForm";

export default async function CreateTicketPage() {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavBar user={user} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <TicketForm />
      </main>
    </div>
  );
}
