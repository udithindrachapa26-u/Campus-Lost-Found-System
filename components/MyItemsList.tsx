"use client";

import { useState } from "react";
import Link from "next/link";

export type Item = {
  id: number;
  item_type: "Lost" | "Found";
  item_name: string;
  category: string;
  location: string;
  item_date: string;
  description: string;
  image_url?: string | null;
  status: "Active" | "Returned";
  created_at: string;
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

export default function MyItemsList({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState<Item[]>(initialItems);

  // Edit state
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Edit form fields
  const [itemType, setItemType] = useState<"Lost" | "Found">("Lost");
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"Active" | "Returned">("Active");

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");

  // Open Edit Modal
  function handleOpenEdit(item: Item) {
    setEditingItem(item);
    setItemType(item.item_type);
    setItemName(item.item_name);
    setCategory(item.category);
    setLocation(item.location);
    const formattedDate = item.item_date ? new Date(item.item_date).toISOString().split("T")[0] : "";
    setDate(formattedDate);
    setDescription(item.description);
    setImageUrl(item.image_url || null);
    setStatus(item.status);
    setEditError("");
  }

  // Handle Photo Upload in Edit Modal
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setEditError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setEditError(data.message || "Failed to upload photo");
        return;
      }

      setImageUrl(data.url);
    } catch (err) {
      console.error("Image upload error:", err);
      setEditError("Unable to upload image.");
    } finally {
      setUploading(false);
    }
  }

  // Save Edit
  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem) return;

    setEditError("");
    setEditLoading(true);

    try {
      const response = await fetch(`/api/items/${editingItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          itemType,
          itemName,
          category,
          location,
          date,
          description,
          imageUrl,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setEditError(data.message || "Failed to update item");
        return;
      }

      // Update local state
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                item_type: itemType,
                item_name: itemName,
                category,
                location,
                item_date: date,
                description,
                image_url: imageUrl,
                status,
              }
            : item
        )
      );

      setEditingItem(null);
    } catch (err) {
      console.error("Update item error:", err);
      setEditError("Something went wrong. Please try again.");
    } finally {
      setEditLoading(false);
    }
  }

  // Handle Delete
  async function handleDelete(id: number) {
    setDeleteError("");
    setDeletingId(id);

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setDeleteError(data.message || "Failed to delete item");
        setDeletingId(null);
        return;
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error("Delete item error:", err);
      setDeleteError("Unable to delete item. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      {deleteError && (
        <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
          {deleteError}
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow">
          <p className="text-lg font-medium text-gray-700">
            You haven&apos;t reported any items yet.
          </p>
          <p className="mt-2 text-gray-500">
            Report a lost or found item to see it here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl bg-white shadow transition hover:shadow-md"
            >
              <div>
                {/* Photo Display */}
                {item.image_url && (
                  <div className="relative h-44 w-full bg-gray-100">
                    <img
                      src={item.image_url}
                      alt={item.item_name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* Type + Status */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        item.item_type === "Lost"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {item.item_type}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        item.status === "Active"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Item name */}
                  <h3 className="mt-4 text-xl font-bold text-gray-800">
                    {item.item_name}
                  </h3>

                  {/* Details */}
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-semibold">Category:</span> {item.category}
                    </p>
                    <p>
                      <span className="font-semibold">Location:</span> {item.location}
                    </p>
                    <p>
                      <span className="font-semibold">Date:</span>{" "}
                      {item.item_date
                        ? new Date(item.item_date).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="mt-4 border-t pt-4 text-sm text-gray-600">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t p-6 pt-4">
                {confirmDeleteId === item.id ? (
                  <div className="flex items-center justify-between gap-2 rounded-lg bg-red-50 p-3">
                    <span className="text-xs font-medium text-red-800">
                      Confirm delete?
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {deletingId === item.id ? "Deleting…" : "Yes, Delete"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Link
                      href={`/lost-items/${item.id}`}
                      className="flex-1 rounded-lg border border-gray-200 bg-gray-50 py-2 text-center text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                    >
                      View
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="flex-1 rounded-lg bg-blue-50 py-2 text-center text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="flex-1 rounded-lg bg-red-50 py-2 text-center text-xs font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-xl font-bold text-gray-800">Edit Item</h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {editError && (
              <div className="mt-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              {/* Item Photo Upload */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Item Photo
                </label>
                {imageUrl ? (
                  <div className="relative mb-2 h-40 w-full overflow-hidden rounded-xl bg-gray-100">
                    <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl(null)}
                      className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-xs text-white hover:bg-black"
                    >
                      ✕ Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="text-xs text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {uploading && <span className="text-xs text-blue-600">Uploading…</span>}
                  </div>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Item Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setItemType("Lost")}
                    className={`rounded-lg border p-2 text-sm font-semibold transition ${
                      itemType === "Lost"
                        ? "border-red-500 bg-red-50 text-red-600"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    🔴 Lost Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemType("Found")}
                    className={`rounded-lg border p-2 text-sm font-semibold transition ${
                      itemType === "Found"
                        ? "border-green-500 bg-green-50 text-green-600"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    🟢 Found Item
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="edit-name" className="mb-1 block text-sm font-medium text-gray-700">
                  Item Name
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="edit-category" className="mb-1 block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="edit-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="edit-location" className="mb-1 block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  id="edit-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* Date */}
              <div>
                <label htmlFor="edit-date" className="mb-1 block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  id="edit-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="edit-status" className="mb-1 block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="edit-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "Active" | "Returned")}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Returned">Returned / Resolved</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="edit-description" className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {editLoading ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
