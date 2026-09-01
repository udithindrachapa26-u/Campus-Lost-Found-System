import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";

type User = {
  id: number;
  name: string;
  email: string;
};

async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const userId = cookieStore.get("user_id")?.value;

  if (!userId) {
    return null;
  }

  const [rows] = await pool.execute(
    `
    SELECT id, name, email
    FROM users
    WHERE id = ?
    `,
    [userId]
  );

  const users = rows as User[];

  if (users.length === 0) {
    return null;
  }

  return users[0];
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">

      <div className="mx-auto max-w-5xl">

        <div className="rounded-2xl bg-white p-8 shadow">

          <div className="flex items-center justify-between">

            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Welcome, {user.name}! 👋
              </h1>

              <p className="mt-2 text-gray-600">
                Campus Lost & Found Dashboard
              </p>
            </div>

            <LogoutButton />

          </div>

          <div className="mt-8 rounded-xl bg-gray-50 p-6">

            <h2 className="text-xl font-semibold text-gray-800">
              Account Information
            </h2>

            <div className="mt-4 space-y-2">
              <p>
                <span className="font-medium">
                  Name:
                </span>{" "}
                {user.name}
              </p>

              <p>
                <span className="font-medium">
                  Email:
                </span>{" "}
                {user.email}
              </p>

              <p>
                <span className="font-medium">
                  User ID:
                </span>{" "}
                {user.id}
              </p>
            </div>

          </div>

        </div>

      </div>

    </main>
  );
}