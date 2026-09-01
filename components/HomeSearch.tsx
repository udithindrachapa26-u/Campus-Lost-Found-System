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
    <div className="mx-auto max-w-5xl w-full">
      {/* Search Input */}
      <div className="flex flex-col sm:flex-row gap-2">
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
          placeholder="🔍 Search lost or found items..."
          className="flex-1 rounded-xl border-2 border-white/50 bg-white/10 px-5 py-3 sm:py-4 text-white placeholder-white/70 backdrop-blur-sm outline-none focus:border-white focus:bg-white/20 transition-all shadow-lg"
        />

        <button
          type="button"
          onClick={handleSearch}
          className="rounded-xl bg-gradient-to-r from-white to-blue-100 px-6 sm:px-8 py-3 sm:py-4 font-bold text-blue-600 hover:from-blue-50 hover:to-white transition-all shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
        >
          Search
        </button>
      </div>

      {/* Filters */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Type */}
        <select
          value={type}
          onChange={(event) =>
            setType(event.target.value)
          }
          className="rounded-lg border-2 border-white/50 bg-white/10 px-3 sm:px-4 py-2.5 sm:py-3 text-white backdrop-blur-sm outline-none focus:border-white focus:bg-white/20 transition-all font-medium text-sm sm:text-base"
        >
          <option value="" className="bg-gray-900 text-white">All Items</option>
          <option value="Lost" className="bg-gray-900 text-white">Lost Items</option>
          <option value="Found" className="bg-gray-900 text-white">Found Items</option>
        </select>

        {/* Category */}
        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value)
          }
          className="rounded-lg border-2 border-white/50 bg-white/10 px-3 sm:px-4 py-2.5 sm:py-3 text-white backdrop-blur-sm outline-none focus:border-white focus:bg-white/20 transition-all font-medium text-sm sm:text-base"
        >
          <option value="" className="bg-gray-900 text-white">All Categories</option>
          {categories.map((itemCategory) => (
            <option
              key={itemCategory}
              value={itemCategory}
              className="bg-gray-900 text-white"
            >
              {itemCategory}
            </option>
          ))}
        </select>

        {/* Clear */}
        <button
          type="button"
          onClick={handleClear}
          className="rounded-lg border-2 border-white/50 bg-white/10 px-3 sm:px-4 py-2.5 sm:py-3 font-medium text-white hover:bg-white/20 hover:border-white transition-all backdrop-blur-sm text-sm sm:text-base"
        >
          Clear
        </button>
      </div>
    </div>
  );
}