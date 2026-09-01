"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ItemOwnerActionsProps = {
  item: {
    id: number;
    user_id: number;
    item_type: "Lost" | "Found";
    item_name: string;
    category: string;
    location: string;
    item_date: string;
    description: string;
    image_url?: string | null;
    status: "Active" | "Returned";
  };
  currentUserId: number;
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

export default function ItemOwnerActions({ item, currentUserId }: ItemOwnerActionsProps) {
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form state
  const [itemType, setItemType] = useState(item.item_type);
  const [itemName, setItemName] = useState(item.item_name);
  const [category, setCategory] = useState(item.category);
  const [location, setLocation] = useState(item.location);
  const formattedDate = item.item_date ? new Date(item.item_date).toISOString().split("T")[0] : "";
  const [date, setDate] = useState(formattedDate);
  const [description, setDescription] = useState(item.description);
  const [imageUrl, setImageUrl] = useState<string | null>(item.image_url || null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(item.status);

  // If not owner, return null
  if (!currentUserId || currentUserId !== item.user_id) {
    return null;
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

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
        setError(data.message || "Failed to upload photo");
        return;
      }

      setImageUrl(data.url);
    } catch (err) {
      console.error(err);
      setError("Unable to upload image.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
        setError(data.message || "Failed to update item");
        return;
      }

      setEditing(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Failed to update item. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);

    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to delete item");
      }
    } catch (err) {
      console.error(err);
      alert("Unable to delete item.");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Owner Actions</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditing(!editing)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {editing ? "Cancel Edit" : "✏️ Edit Item"}
          </button>
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              🗑️ Delete Item
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="rounded-lg bg-red-700 px-3 py-2 text-xs font-bold text-white hover:bg-red-800 disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Confirm Delete"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg bg-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {editing && (
        <form onSubmit={handleSave} className="mt-6 space-y-4 border-t border-gray-200 pt-6">
          {error && (
            <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700">{error}</div>
          )}

          {/* Image Upload / Change */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Item Photo</label>
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value as "Lost" | "Found")}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm"
              >
                <option value="Lost">Lost</option>
                <option value="Found">Found</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "Active" | "Returned")}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm"
              >
                <option value="Active">Active</option>
                <option value="Returned">Returned / Resolved</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Item Name</label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
              className="w-full resize-none rounded-lg border border-gray-300 p-2.5 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving Changes..." : "Save Changes"}
          </button>
        </form>
      )}
    </div>
  );
}
