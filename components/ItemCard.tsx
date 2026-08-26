import Link from "next/link";

type ItemCardProps = {
  id: number;
  name: string;
  category: string;
  location: string;
  date: string;
  type: "Lost" | "Found";
};

export default function ItemCard({
  id,
  name,
  category,
  location,
  date,
  type,
}: ItemCardProps) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <h3 className="text-xl font-semibold text-gray-800">
          {name}
        </h3>

        <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-600">
          {type}
        </span>
      </div>

      <p className="mt-3 text-sm text-gray-500">
        Category: {category}
      </p>

      <p className="mt-2 text-sm text-gray-500">
        Location: {location}
      </p>

      <p className="mt-2 text-sm text-gray-500">
        Date: {date}
      </p>

      <Link
        href={`/lost-items/${id}`}
        className="mt-5 block w-full rounded-lg bg-blue-600 px-4 py-2 text-center font-medium text-white hover:bg-blue-700"
        >
        View Details
      </Link>
    </div>
  );
}