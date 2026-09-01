"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type ItemSearchProps = {
  type?: "Lost" | "Found";
};

const categories = [
  "Electronics",
  "ID Card",
  "Wallet",
  "Bag",
  "Keys",
  "Books",
  "Other",
];

export default function ItemSearch({
  type,
}: ItemSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  const [category, setCategory] = useState(
    searchParams.get("category") || ""
  );

  const [itemType, setItemType] = useState(
    searchParams.get("type") || type || ""
  );

  function handleFilter() {
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (itemType) {
      params.set("type", itemType);
    }

    if (category) {
      params.set("category", category);
    }

    const pathname =
      itemType === "Found"
        ? "/found-items"
        : "/lost-items";

    router.push(
      `${pathname}?${params.toString()}`
    );
  }

  function handleClear() {
    setSearch("");
    setCategory("");
    setItemType(type || "");

    const pathname =
      type === "Found"
        ? "/found-items"
        : "/lost-items";

    router.push(pathname);
  }

  return (
    <div className="mx-auto mt-8 max-w-4xl">

      {/* Search */}
      <div className="flex">
        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleFilter();
            }
          }}
          placeholder="Search item, category or location..."
          className="flex-1 rounded-l-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
        />

        <button
          type="button"
          onClick={handleFilter}
          className="bg-blue-600 px-6 font-medium text-white hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {/* Filters */}
      <div className="mt-4 grid gap-4 md:grid-cols-3">

        {/* Type */}
        <select
          value={itemType}
          onChange={(event) =>
            setItemType(event.target.value)
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