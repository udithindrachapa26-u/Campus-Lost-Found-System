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

  url.searchParams.set("type", "Found");

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
    throw new Error("Failed to fetch found items");
  }

  return response.json();
}

export default async function FoundItems({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const foundItems = await getItems(
    params.search,
    params.category
  );

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">
            Found Items
          </h1>

          <p className="mt-3 text-gray-600">
            Browse items found on campus.
          </p>
        </div>

        {/* Search + Filters */}
        <ItemSearch type="Found" />

        {/* Result Information */}
        <div className="mt-8 text-center text-gray-600">
          {params.search && (
            <p>
              Search:
              <span className="ml-1 font-semibold text-gray-800">
                "{params.search}"
              </span>
            </p>
          )}

          {params.category && (
            <p>
              Category:
              <span className="ml-1 font-semibold text-gray-800">
                {params.category}
              </span>
            </p>
          )}
        </div>

        {/* Items */}
        {foundItems.length === 0 ? (
          <div className="mt-10 rounded-xl bg-white p-10 text-center shadow-sm">
            <p className="text-lg text-gray-500">
              No found items found.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {foundItems.map((item) => (
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
        )}

      </div>
    </main>
  );
}