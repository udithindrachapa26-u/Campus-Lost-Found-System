import Link from "next/link";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import LogoutButton from "./LogoutButton";

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

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold text-blue-600"
        >
          Campus Lost & Found
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-6">

          <Link
            href="/"
            className="text-gray-700 hover:text-blue-600"
          >
            Home
          </Link>

          <Link
            href="/lost-items"
            className="text-gray-700 hover:text-blue-600"
          >
            Lost Items
          </Link>

          <Link
            href="/found-items"
            className="text-gray-700 hover:text-blue-600"
          >
            Found Items
          </Link>

          {/* Logged-in User */}
          {user ? (
            <>
              <Link
                href="/report"
                className="text-gray-700 hover:text-blue-600"
              >
                Report Item
              </Link>

              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-blue-600"
              >
                Dashboard
              </Link>

              <span className="font-medium text-gray-800">
                Hi, {user.name}
              </span>

              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
              >
                Register
              </Link>
            </>
          )}

        </div>

      </div>
    </nav>
  );
}