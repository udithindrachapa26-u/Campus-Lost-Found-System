import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import MyItemsList, { Item } from "@/components/MyItemsList";

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

async function getMyItems(userId: number): Promise<Item[]> {
  const [rows] = await pool.execute(
    `
    SELECT
      id,
      item_type,
      item_name,
      category,
      location,
      item_date,
      description,
      status,
      created_at
    FROM items
    WHERE user_id = ?
    ORDER BY created_at DESC
    `,
    [userId]
  );

  // Convert MySQL Date objects to string for client component serialization
  const items = (rows as any[]).map((row) => ({
    ...row,
    item_date:
      row.item_date instanceof Date
        ? row.item_date.toISOString().split("T")[0]
        : String(row.item_date),
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  }));

  return items as Item[];
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const items = await getMyItems(user.id);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-8 shadow sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome, {user.name}! 👋
            </h1>

            <p className="mt-2 text-gray-600">
              Campus Lost &amp; Found Dashboard
            </p>
          </div>

          <LogoutButton />
        </div>

        {/* Account */}
        <div className="mt-6 rounded-2xl bg-white p-8 shadow">
          <h2 className="text-xl font-bold text-gray-800">
            Account Information
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium text-gray-800">{user.name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-800">{user.email}</p>
            </div>
          </div>
        </div>

        {/* My Items */}
        <div className="mt-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                My Reported Items
              </h2>

              <p className="mt-1 text-gray-600">
                Items you have reported (Edit or Delete anytime)
              </p>
            </div>

            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              {items.length} Items
            </span>
          </div>

          {/* Interactive MyItemsList */}
          <MyItemsList initialItems={items} />
        </div>
      </div>
    </main>
  );
}
