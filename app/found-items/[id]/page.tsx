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
  params: Promise<{
    id: string;
  }>;
};

async function getItem(id: string): Promise<Item> {
  const response = await fetch(
    `http://localhost:3000/api/items/${id}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Item not found");
  }

  return response.json();
}

export default async function FoundItemDetails({
  params,
}: PageProps) {
  const { id } = await params;

  const item = await getItem(id);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl bg-white p-8 shadow-sm">

          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              {item.status}
            </span>

            <span className="text-sm text-gray-500">
              ID: {item.id}
            </span>
          </div>

          {/* Item Name */}
          <h1 className="mt-6 text-3xl font-bold text-gray-800">
            {item.item_name}
          </h1>

          {/* Details */}
          <div className="mt-8 space-y-5">

            {/* Type */}
            <div>
              <p className="text-sm text-gray-500">
                Type
              </p>

              <p className="font-medium text-gray-800">
                {item.item_type}
              </p>
            </div>

            {/* Category */}
            <div>
              <p className="text-sm text-gray-500">
                Category
              </p>

              <p className="font-medium text-gray-800">
                {item.category}
              </p>
            </div>

            {/* Location */}
            <div>
              <p className="text-sm text-gray-500">
                Location
              </p>

              <p className="font-medium text-gray-800">
                {item.location}
              </p>
            </div>

            {/* Date */}
            <div>
              <p className="text-sm text-gray-500">
                Date Found
              </p>

              <p className="font-medium text-gray-800">
                {item.item_date}
              </p>
            </div>

            {/* Description */}
            <div>
              <p className="text-sm text-gray-500">
                Description
              </p>

              <p className="leading-7 text-gray-700">
                {item.description}
              </p>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}