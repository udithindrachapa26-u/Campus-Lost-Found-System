import ItemCard from "@/components/ItemCard";

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
  type?: string,
  category?: string
): Promise<Item[]> {
  const url = new URL(
    "https://campus-lost-found-system-roan.vercel.app/api/items"
  );

  if (search) {
    url.searchParams.set("search", search);
  }

  if (type === "Lost" || type === "Found") {
    url.searchParams.set("type", type);
  }

  if (category) {
    url.searchParams.set("category", category);
  }

  const response = await fetch(url.toString(), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch items");
  }

  return response.json();
}

export default async function SearchPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const items = await getItems(
    params.search,
    params.type,
    params.category
  );

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">
            Search Items
          </h1>

          <p className="mt-3 text-gray-600">
            Search for lost and found items on campus.
          </p>
        </div>

        {/* Search Information */}
        <div className="mt-8 text-center text-gray-600">

          {params.search && (
            <p>
              Search:
              <span className="ml-1 font-semibold text-gray-800">
                "{params.search}"
              </span>
            </p>
          )}

          {params.type && (
            <p>
              Type:
              <span className="ml-1 font-semibold text-gray-800">
                {params.type}
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

        {/* Results */}
        {items.length === 0 ? (
          <div className="mt-10 rounded-xl bg-white p-10 text-center shadow-sm">
            <p className="text-lg text-gray-500">
              No matching items found.
            </p>
          </div>
        ) : (
          <>
            <p className="mt-10 text-gray-600">
              {items.length} item(s) found
            </p>

            <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
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
          </>
        )}

      </div>
    </main>
  );
}