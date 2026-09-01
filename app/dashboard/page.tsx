import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";

type User = {
  id: number;
  name: string;
  email: string;
};

type Item = {
  id: number;
  item_type: "Lost" | "Found";
  item_name: string;
  category: string;
  location: string;
  item_date: string;
  description: string;
  status: "Active" | "Returned";
  created_at: string;
};

async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const userId =
    cookieStore.get("user_id")?.value;

  if (!userId) {
    return null;
  }

  const [rows] =
    await pool.execute(
      `
      SELECT id, name, email
      FROM users
      WHERE id = ?
      `,
      [userId]
    );

  const users =
    rows as User[];

  if (users.length === 0) {
    return null;
  }

  return users[0];
}

async function getMyItems(
  userId: number
): Promise<Item[]> {

  const [rows] =
    await pool.execute(
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

  return rows as Item[];
}

export default async function DashboardPage() {

  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const items =
    await getMyItems(user.id);

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
              Campus Lost & Found Dashboard
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
              <p className="text-sm text-gray-500">
                Name
              </p>

              <p className="font-medium text-gray-800">
                {user.name}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Email
              </p>

              <p className="font-medium text-gray-800">
                {user.email}
              </p>
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
                Items you have reported
              </p>
            </div>

            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              {items.length} Items
            </span>

          </div>


          {items.length === 0 ? (

            <div className="rounded-2xl bg-white p-10 text-center shadow">

              <p className="text-lg font-medium text-gray-700">
                You haven't reported any items yet.
              </p>

              <p className="mt-2 text-gray-500">
                Report a lost or found item to see it here.
              </p>

            </div>

          ) : (

            <div className="grid gap-6 md:grid-cols-2">

              {items.map((item) => (

                <div
                  key={item.id}
                  className="rounded-2xl bg-white p-6 shadow transition hover:shadow-md"
                >

                  {/* Type + Status */}
                  <div className="flex items-center justify-between">

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        item.item_type === "Lost"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {item.item_type}
                    </span>

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                      {item.status}
                    </span>

                  </div>


                  {/* Item name */}
                  <h3 className="mt-4 text-xl font-bold text-gray-800">
                    {item.item_name}
                  </h3>


                  {/* Details */}
                  <div className="mt-4 space-y-2 text-sm text-gray-600">

                    <p>
                      <span className="font-semibold">
                        Category:
                      </span>{" "}
                      {item.category}
                    </p>

                    <p>
                      <span className="font-semibold">
                        Location:
                      </span>{" "}
                      {item.location}
                    </p>

                    <p>
                      <span className="font-semibold">
                        Date:
                      </span>{" "}
                      {new Date(item.item_date).toLocaleDateString()}
                    </p>

                  </div>


                  {/* Description */}
                  <p className="mt-4 border-t pt-4 text-sm text-gray-600">
                    {item.description}
                  </p>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </main>
  );
}