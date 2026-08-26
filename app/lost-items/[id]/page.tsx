type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ItemDetails({ params }: PageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow-sm">
        <p className="text-sm text-gray-500">
          Item ID: {id}
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-800">
          Lost Item Details
        </h1>

        <div className="mt-8 space-y-4">
          <p>
            <strong>Item:</strong> Black Wallet
          </p>

          <p>
            <strong>Category:</strong> Wallet
          </p>

          <p>
            <strong>Location:</strong> University Library
          </p>

          <p>
            <strong>Date:</strong> 2026-08-20
          </p>

          <p>
            <strong>Status:</strong> Lost
          </p>
        </div>
      </div>
    </main>
  );
}