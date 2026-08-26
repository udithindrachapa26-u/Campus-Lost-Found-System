import ItemCard from "@/components/ItemCard";

const lostItems = [
  {
    id: 1,
    name: "Black Wallet",
    category: "Wallet",
    location: "University Library",
    date: "2026-08-20",
    type: "Lost" as const,
  },
  {
    id: 2,
    name: "Student ID Card",
    category: "ID Card",
    location: "Main Canteen",
    date: "2026-08-21",
    type: "Lost" as const,
  },
  {
    id: 3,
    name: "Blue Water Bottle",
    category: "Bottle",
    location: "Lecture Hall 03",
    date: "2026-08-22",
    type: "Lost" as const,
  },
];

export default function LostItems() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">

        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">
            Lost Items
          </h1>

          <p className="mt-3 text-gray-600">
            Find items reported as lost by students.
          </p>
        </div>

        {/* Search */}
        <div className="mx-auto mt-8 flex max-w-2xl">
          <input
            type="text"
            placeholder="Search lost items..."
            className="flex-1 rounded-l-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <button
            type="button"
            className="rounded-r-lg bg-blue-600 px-6 font-medium text-white hover:bg-blue-700"
          >
            Search
          </button>
        </div>

        {/* Items */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lostItems.map((item) => (
            <ItemCard
              key={item.id}
              id={item.id}
              name={item.name}
              category={item.category}
              location={item.location}
              date={item.date}
              type={item.type}
            />
          ))}
        </div>

      </div>
    </main>
  );
}