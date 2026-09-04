import Link from "next/link";
import { cookies } from "next/headers";
import ItemOwnerActions from "@/components/ItemOwnerActions";

type Item = {
  id: number;
  user_id: number;

  item_type: "Lost" | "Found";
  item_name: string;
  category: string;
  location: string;
  item_date: string;
  description: string;
  image_url: string | null;
  status: "Active" | "Returned";

  reporter_name: string | null;
  reporter_email: string | null;
  reporter_phone: string | null;
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getItem(id: string): Promise<Item> {
  const response = await fetch(`https://campus-lost-found-system-roan.vercel.app/api/items/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Item not found");
  }

  return response.json();
}

export default async function ItemDetails({ params }: PageProps) {
  const { id } = await params;
  const item = await getItem(id);

  const cookieStore = await cookies();
  const currentUserId = Number(cookieStore.get("user_id")?.value || 0);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl">

        {/* Back Link */}
        <Link
          href="/lost-items"
          className="group mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span> Back to All Items
        </Link>

        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">

          {/* ITEM PHOTO HEADER */}
          {item.image_url ? (
            <div className="relative h-80 w-full overflow-hidden bg-slate-950">
              <img
                src={item.image_url}
                alt={item.item_name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white">
                <span
                  className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-extrabold shadow-md backdrop-blur-md ${item.item_type === "Lost"
                      ? "bg-rose-500/90 text-white"
                      : "bg-emerald-500/90 text-white"
                    }`}
                >
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  {item.item_type} Item
                </span>

                <span className="rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold backdrop-blur-md">
                  Status: {item.status}
                </span>
              </div>
            </div>
          ) : (
            <div className="border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span
                  className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-extrabold shadow-sm ${item.item_type === "Lost"
                      ? "bg-rose-500 text-white"
                      : "bg-emerald-500 text-white"
                    }`}
                >
                  {item.item_type} Item
                </span>

                <span className="rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold backdrop-blur-md">
                  Status: {item.status}
                </span>
              </div>
            </div>
          )}

          <div className="p-6 sm:p-10">
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {item.item_name}
            </h1>

            {/* Details Grid */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Category</p>
                <p className="mt-1 text-base font-bold text-slate-800 dark:text-white">{item.category}</p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Location</p>
                <p className="mt-1 text-base font-bold text-slate-800 dark:text-white">{item.location}</p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Date</p>
                <p className="mt-1 text-base font-bold text-slate-800 dark:text-white">{item.item_date}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description &amp; Details</h2>
              <p className="mt-2 text-base leading-relaxed text-slate-700 dark:text-slate-300">
                {item.description}
              </p>
            </div>

            {/* Owner Actions (Edit & Delete) */}
            <ItemOwnerActions item={item} currentUserId={currentUserId} />

            {/* Divider */}
            <div className="my-10 border-t border-slate-100 dark:border-slate-800" />

            {/* Reporter Contact */}
            <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-6 sm:p-8 dark:border-blue-900/40 dark:bg-blue-950/30">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Contact Reporter
              </h2>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Connect directly with the person who posted this item.
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between border-b border-blue-100/80 pb-3 dark:border-blue-900/40">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Reporter Name</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.reporter_name || "Anonymous User"}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-blue-100/80 pb-3 dark:border-blue-900/40">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Email Address</span>
                  {item.reporter_email ? (
                    <a
                      href={`mailto:${item.reporter_email}`}
                      className="text-sm font-bold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {item.reporter_email}
                    </a>
                  ) : (
                    <span className="text-sm text-slate-500">Not provided</span>
                  )}
                </div>

                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Phone Number</span>
                  {item.reporter_phone ? (
                    <a
                      href={`tel:${item.reporter_phone}`}
                      className="text-sm font-bold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {item.reporter_phone}
                    </a>
                  ) : (
                    <span className="text-sm text-slate-500">Not provided</span>
                  )}
                </div>

                {/* Contact Action Buttons */}
                <div className="flex gap-4 pt-4">
                  {item.reporter_phone && (
                    <a
                      href={`tel:${item.reporter_phone}`}
                      className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 hover:shadow-lg"
                    >
                      📞 Call Phone
                    </a>
                  )}

                  {item.reporter_email && (
                    <a
                      href={`mailto:${item.reporter_email}`}
                      className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg"
                    >
                      ✉ Send Email
                    </a>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
