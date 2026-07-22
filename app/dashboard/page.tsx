import Link from "next/link";

export default function Dashboard() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Helpdesk Dashboard</h1>

            <div className="grid grid-cols-2 gap-4">
                <Link
                    href="/tickets"
                    className="rounded bg-blue-600 p-4 text-center text-white"
                >
                    View Tickets
                </Link>

                <Link
                    href="/tickets/create"
                    className="rounded bg-green-600 p-4 text-center text-white"
                >
                    Create Ticket
                </Link>
            </div>
        </div>
    );
}
