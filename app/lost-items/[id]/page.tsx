import Link from "next/link";

type Item = {
  id: number;
  user_id: number;

  item_type: "Lost" | "Found";
  item_name: string;
  category: string;
  location: string;
  item_date: string;
  description: string;
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

async function getItem(
  id: string
): Promise<Item> {
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

export default async function ItemDetails({
  params,
}: PageProps) {

  const { id } = await params;

  const item = await getItem(id);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">

      <div className="mx-auto max-w-3xl">

        {/* Back */}
        <Link
          href="/lost-items"
          className="mb-6 inline-block text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back to Lost Items
        </Link>


        <div className="rounded-xl bg-white p-8 shadow-sm">

          {/* Header */}
          <div className="flex items-center justify-between">

            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                item.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
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


          {/* Item Details */}
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
                Date
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


          {/* Divider */}
          <div className="my-8 border-t border-gray-200" />


          {/* Reporter Contact */}
          <div className="rounded-xl bg-blue-50 p-6">

            <h2 className="text-xl font-bold text-gray-800">
              Contact Reporter
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Contact the person who reported this
              lost item.
            </p>


            <div className="mt-6 space-y-4">

              {/* Name */}
              <div>
                <p className="text-sm text-gray-500">
                  Name
                </p>

                <p className="font-medium text-gray-800">
                  {item.reporter_name ||
                    "Not available"}
                </p>
              </div>


              {/* Email */}
              <div>
                <p className="text-sm text-gray-500">
                  Email
                </p>

                {item.reporter_email ? (
                  <a
                    href={`mailto:${item.reporter_email}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {item.reporter_email}
                  </a>
                ) : (
                  <p className="text-gray-700">
                    Not available
                  </p>
                )}
              </div>


              {/* Phone */}
              <div>
                <p className="text-sm text-gray-500">
                  Phone
                </p>

                {item.reporter_phone ? (
                  <a
                    href={`tel:${item.reporter_phone}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {item.reporter_phone}
                  </a>
                ) : (
                  <p className="text-gray-700">
                    Not available
                  </p>
                )}
              </div>


              {/* Contact Buttons */}
              <div className="flex gap-3 pt-3">

                {item.reporter_phone && (
                  <a
                    href={`tel:${item.reporter_phone}`}
                    className="flex-1 rounded-lg bg-green-600 px-4 py-3 text-center font-semibold text-white hover:bg-green-700"
                  >
                    📞 Call
                  </a>
                )}

                {item.reporter_email && (
                  <a
                    href={`mailto:${item.reporter_email}`}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold text-white hover:bg-blue-700"
                  >
                    ✉ Email
                  </a>
                )}

              </div>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}