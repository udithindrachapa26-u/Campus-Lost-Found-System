import Link from "next/link";

type ItemCardProps = {
  id: number;
  name: string;
  category: string;
  location: string;
  date: string;
  type: "Lost" | "Found";
  imageUrl?: string | null;
};

const categoryIcons: Record<string, string> = {
  Electronics: "📱",
  "ID Card": "💳",
  Wallet: "👛",
  Bag: "🎒",
  Keys: "🔑",
  Books: "📚",
  Other: "📦",
};

export default function ItemCard({
  id,
  name,
  category,
  location,
  date,
  type,
  imageUrl,
}: ItemCardProps) {
  const icon = categoryIcons[category] || "📦";

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
      <div>
        {/* Photo Container */}
        {imageUrl ? (
          <div className="relative h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80" />

            <span
              className={`absolute top-3 right-3 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-md backdrop-blur-md ${
                type === "Lost"
                  ? "bg-rose-500/90 text-white"
                  : "bg-emerald-500/90 text-white"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              {type}
            </span>

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-md">
                {icon} {category}
              </span>
            </div>
          </div>
        ) : (
          <div className="border-b border-slate-100 p-5 dark:border-slate-800">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {icon} {category}
              </span>

              <span
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                  type === "Lost"
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${type === "Lost" ? "bg-rose-500" : "bg-emerald-500"}`} />
                {type}
              </span>
            </div>
          </div>
        )}

        <div className="p-5">
          <h3 className="text-lg font-bold tracking-tight text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-blue-400">
            {name}
          </h3>

          <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-base">📍</span>
              <span className="font-medium line-clamp-1">{location}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-base">📅</span>
              <span className="font-medium">
                {date ? new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 pt-0">
        <Link
          href={`/lost-items/${id}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-blue-600 hover:shadow-md dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          View Details
          <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
