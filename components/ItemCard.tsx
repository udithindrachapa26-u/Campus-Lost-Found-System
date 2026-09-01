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

export default function ItemCard({
  id,
  name,
  category,
  location,
  date,
  type,
  imageUrl,
}: ItemCardProps) {
  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md">
      <div>
        {/* Photo Header */}
        {imageUrl ? (
          <div className="relative h-48 w-full overflow-hidden bg-gray-100">
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover transition duration-300 hover:scale-105"
            />
            <span
              className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-bold shadow-sm ${
                type === "Lost"
                  ? "bg-red-500 text-white"
                  : "bg-green-600 text-white"
              }`}
            >
              {type}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between border-b p-5 pb-3">
            <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                type === "Lost"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {type}
            </span>
          </div>
        )}

        <div className="p-5">
          {imageUrl && (
            <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
          )}

          <p className="mt-2 text-sm text-gray-600">
            <span className="font-medium text-gray-500">Category:</span> {category}
          </p>

          <p className="mt-1 text-sm text-gray-600">
            <span className="font-medium text-gray-500">Location:</span> {location}
          </p>

          <p className="mt-1 text-sm text-gray-600">
            <span className="font-medium text-gray-500">Date:</span> {date}
          </p>
        </div>
      </div>

      <div className="p-5 pt-0">
        <Link
          href={`/lost-items/${id}`}
          className="block w-full rounded-lg bg-blue-600 px-4 py-2.5 text-center font-semibold text-white hover:bg-blue-700 transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
