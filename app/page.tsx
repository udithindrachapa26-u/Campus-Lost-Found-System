import Link from "next/link";
import HomeSearch from "@/components/HomeSearch";

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-blue-600 px-6 py-20 text-center text-white">
        <h1 className="text-4xl font-bold md:text-5xl">
          Campus Lost & Found
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
          Lost something on campus? Or found an item?
          Help your fellow students find what they are looking for.
        </p>

        <div className="mx-auto mt-8 flex max-w-xl">
          <HomeSearch />
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/lost-items"
            className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-600 hover:bg-blue-50"
          >
            Find Lost Items
          </Link>

          <Link
            href="/found-items"
            className="rounded-lg border border-white px-6 py-3 font-semibold text-white hover:bg-blue-500"
          >
            View Found Items
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16">
        <h2 className="text-center text-3xl font-bold text-gray-800">
          How It Works
        </h2>

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
          <div className="rounded-xl border p-6 text-center shadow-sm">
            <h3 className="text-xl font-semibold">
              1. Report
            </h3>

            <p className="mt-3 text-gray-600">
              Report an item that you have lost or found on campus.
            </p>
          </div>

          <div className="rounded-xl border p-6 text-center shadow-sm">
            <h3 className="text-xl font-semibold">
              2. Search
            </h3>

            <p className="mt-3 text-gray-600">
              Search through reported items and find your belongings.
            </p>
          </div>

          <div className="rounded-xl border p-6 text-center shadow-sm">
            <h3 className="text-xl font-semibold">
              3. Recover
            </h3>

            <p className="mt-3 text-gray-600">
              Contact the owner or finder and return the item.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}