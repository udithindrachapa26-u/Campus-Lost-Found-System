import Link from "next/link";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import LogoutButton from "./LogoutButton";
import NavbarClient from "./NavbarClient";

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
  if (users.length === 0) return null;
  return users[0];
}

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-xs transition-all dark:border-slate-800/80 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">

        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3 text-xl sm:text-2xl font-black tracking-tight"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-blue-500/20 transition-transform group-hover:scale-105">
            🔍
          </div>
          <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 bg-clip-text text-transparent dark:from-white dark:via-blue-200 dark:to-slate-200 font-extrabold">
            Campus <span className="text-blue-600 dark:text-blue-400">Lost &amp; Found</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 rounded-full border border-slate-200/60 bg-slate-100/60 p-1 backdrop-blur-md dark:border-slate-800 dark:bg-slate-800/60">
          <Link
            href="/"
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 rounded-full transition-all hover:bg-white dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700"
          >
            Home
          </Link>

          <Link
            href="/lost-items"
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 rounded-full transition-all hover:bg-white dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700"
          >
            Lost Items
          </Link>

          <Link
            href="/found-items"
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 rounded-full transition-all hover:bg-white dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700"
          >
            Found Items
          </Link>

          {user && (
            <>
              <Link
                href="/report"
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 rounded-full transition-all hover:bg-white dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700"
              >
                Report Item
              </Link>

              <Link
                href="/dashboard"
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 rounded-full transition-all hover:bg-white dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700"
              >
                Dashboard
              </Link>
            </>
          )}
        </div>

        {/* Auth Section */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-3 dark:border-slate-800 dark:bg-slate-800">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white uppercase">
                  {user.name.charAt(0)}
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {user.name}
                </span>
              </div>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition dark:text-slate-300 dark:hover:text-white"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/30"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <NavbarClient user={user} />

      </div>
    </nav>
  );
}
