import ItemCard from "@/components/ItemCard";
import ItemSearch from "@/components/ItemSearch";

type Item = {
  id: number;
  item_type: "Lost" | "Found";
  item_name: string;
  category: string;
  location: string;
  item_date: string;
  description: string;
  status: "Active" | "Returned";
};

type PageProps = {
  searchParams: Promise<{
    search?: string;
    type?: string;
    category?: string;
  }>;
};

async function getItems(
  search?: string,
  category?: string
): Promise<Item[]> {
  const url = new URL(
    "http://localhost:3000/api/items"
  );

  url.searchParams.set("type", "Lost");

  if (search) {
    url.searchParams.set("search", search);
  }

  if (category) {
    url.searchParams.set("category", category);
  }

  const response = await fetch(url.toString(), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch lost items");
  }

  return response.json();
}

export default async function LostItems({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const lostItems = await getItems(
    params.search,
    params.category
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 px-4 sm:px-6 py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-semibold mb-4">
            🔍 Lost Items
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
            Lost Items
          </h1>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">
            Browse items reported as lost on campus. Help students find their belongings.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="mb-12 sm:mb-16">
          <ItemSearch type="Lost" />
        </div>

        {/* Result Information */}
        {(params.search || params.category) && (
          <div className="mb-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              {params.search && (
                <span>
                  Search: <span className="font-bold text-gray-900 dark:text-white">\"{ params.search}\"</span>
                </span>
              )}
              {params.search && params.category && <span className="mx-2">•</span>}
              {params.category && (
                <span>
                  Category: <span className="font-bold text-gray-900 dark:text-white">{params.category}</span>
                </span>
              )}
            </p>
          </div>
        )}

        {/* Items */}
        {lostItems.length === 0 ? (
          <div className="mt-12 rounded-2xl bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 sm:p-16 text-center shadow-sm">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              No lost items found
            </p>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Try adjusting your search filters or browse all items.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8 text-sm sm:text-base">
              Found <span className="font-bold text-gray-900 dark:text-white">{lostItems.length}</span> lost item{lostItems.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {lostItems.map((item) => (
                <ItemCard
                  key={item.id}
                  id={item.id}
                  name={item.item_name}
                  category={item.category}
                  location={item.location}
                  date={item.item_date}
                  type={item.item_type}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}