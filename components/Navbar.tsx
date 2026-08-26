import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-blue-600 px-8 py-4 text-white">
      <h2 className="text-xl font-bold">
        Campus Lost & Found
      </h2>

      <div className="flex gap-6">
        <Link
          href="/"
          className="hover:text-blue-200"
        >
          Home
        </Link>

        <Link
          href="/lost-items"
          className="hover:text-blue-200"
        >
          Lost Items
        </Link>

        <Link
          href="/found-items"
          className="hover:text-blue-200"
        >
          Found Items
        </Link>

        <Link
          href="/report"
          className="hover:text-blue-200"
        >
          Report Item
        </Link>
      </div>
    </nav>
  );
}