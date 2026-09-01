"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const categories = [
  "Electronics",
  "ID Card",
  "Wallet",
  "Bag",
  "Keys",
  "Books",
  "Other",
];

export default function HomeSearch() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");

  function handleSearch() {
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (type) {
      params.set("type", type);
    }

    if (category) {
      params.set("category", category);
    }

    router.push(`/search?${params.toString()}`);
  }

  function handleClear() {
    setSearch("");
    setType("");
    setCategory("");

    router.push("/search");
  }

  return (
    <div className="mx-auto max-w-5xl">

      {/* Search Input */}
      <div className="flex">
        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSearch();
            }
          }}
          placeholder="Search lost or found items..."
          className="flex-1 rounded-l-lg border border-gray-300 px-5 py-4 outline-none focus:border-blue-500"
        />

        <button
          type="button"
          onClick={handleSearch}
          className="rounded-r-lg bg-blue-600 px-7 font-semibold text-white hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {/* Filters */}
      <div className="mt-4 grid gap-4 md:grid-cols-3">

        {/* Type */}
        <select
          value={type}
          onChange={(event) =>
            setType(event.target.value)
          }
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
        >
          <option value="">All Items</option>
          <option value="Lost">Lost Items</option>
          <option value="Found">Found Items</option>
        </select>

        {/* Category */}
        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value)
          }
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
        >
          <option value="">All Categories</option>

          {categories.map((itemCategory) => (
            <option
              key={itemCategory}
              value={itemCategory}
            >
              {itemCategory}
            </option>
          ))}
        </select>

        {/* Clear */}
        <button
          type="button"
          onClick={handleClear}
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
        >
          Clear Filters
        </button>

      </div>
    </div>
  );
}