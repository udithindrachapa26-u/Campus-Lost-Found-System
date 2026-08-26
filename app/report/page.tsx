"use client";

import { useState } from "react";

export default function ReportItem() {
  const [itemType, setItemType] = useState<"Lost" | "Found">("Lost");
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemType,
          itemName,
          category,
          location,
          date,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Something went wrong.");
        return;
      }

      setMessage("Item reported successfully!");

      // Clear form
      setItemType("Lost");
      setItemName("");
      setCategory("");
      setLocation("");
      setDate("");
      setDescription("");
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-2xl">

        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">
            Report an Item
          </h1>

          <p className="mt-3 text-gray-600">
            Report an item you have lost or found on campus.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-6 rounded-xl bg-white p-8 shadow-sm"
        >
          {/* Item Type */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Item Type
            </label>

            <select
              value={itemType}
              onChange={(event) =>
                setItemType(
                  event.target.value as "Lost" | "Found"
                )
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="Lost">Lost Item</option>
              <option value="Found">Found Item</option>
            </select>
          </div>

          {/* Item Name */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Item Name
            </label>

            <input
              type="text"
              value={itemName}
              onChange={(event) =>
                setItemName(event.target.value)
              }
              placeholder="e.g. Black Wallet"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Category
            </label>

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              required
            >
              <option value="">Select category</option>
              <option value="Electronics">Electronics</option>
              <option value="ID Card">ID Card</option>
              <option value="Wallet">Wallet</option>
              <option value="Bag">Bag</option>
              <option value="Keys">Keys</option>
              <option value="Books">Books</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Location
            </label>

            <input
              type="text"
              value={location}
              onChange={(event) =>
                setLocation(event.target.value)
              }
              placeholder="e.g. University Library"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(event) =>
                setDate(event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Describe the item..."
              rows={5}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Message */}
          {message && (
            <div className="rounded-lg bg-blue-50 p-4 text-center text-blue-700">
              {message}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </main>
  );
}