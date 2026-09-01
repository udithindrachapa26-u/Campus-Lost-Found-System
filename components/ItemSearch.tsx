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
    <div className="mx-auto max-w-5xl w-full">

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-2">
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
          placeholder="🔍 Search item, category or location..."
          className="flex-1 rounded-xl border-2 border-gray-200 dark:border-gray-700 px-4 sm:px-5 py-3 sm:py-4 text-gray-900 dark:text-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all"
        />

        <button
          type="button"
          onClick={handleFilter}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 sm:px-8 py-3 sm:py-4 font-bold text-white transition-all shadow-md hover:shadow-lg transform hover:scale-105 duration-200 whitespace-nowrap"
        >
          Search
        </button>
      </div>

      {/* Filters */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">

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