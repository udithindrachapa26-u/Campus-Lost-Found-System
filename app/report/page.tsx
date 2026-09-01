"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ItemType = "Lost" | "Found";

const categories = [
  "Electronics",
  "ID Card",
  "Wallet",
  "Bag",
  "Keys",
  "Books",
  "Other",
];

export default function ReportItem() {
  const router = useRouter();

  const [itemType, setItemType] =
    useState<ItemType>("Lost");

  const [itemName, setItemName] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [date, setDate] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [checkingLogin, setCheckingLogin] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState<"success" | "error" | "">("");


  // ==========================================
  // CHECK LOGIN
  // ==========================================

  useEffect(() => {
    async function checkLogin() {
      try {
        const response = await fetch(
          "/api/auth/me",
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          router.push("/login");
          return;
        }

        setCheckingLogin(false);

      } catch (error) {
        console.error(
          "Login check error:",
          error
        );

        router.push("/login");
      }
    }

    checkLogin();
  }, [router]);


  // ==========================================
  // SUBMIT REPORT
  // ==========================================

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    // Basic validation
    if (!itemName.trim()) {
      setMessage(
        "Please enter the item name."
      );
      setMessageType("error");
      return;
    }

    if (!category) {
      setMessage(
        "Please select a category."
      );
      setMessageType("error");
      return;
    }

    if (!location.trim()) {
      setMessage(
        "Please enter the location."
      );
      setMessageType("error");
      return;
    }

    if (!date) {
      setMessage(
        "Please select the date."
      );
      setMessageType("error");
      return;
    }

    if (!description.trim()) {
      setMessage(
        "Please enter a description."
      );
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      // ======================================
      // Send data to API
      // ======================================

      const response = await fetch(
        "/api/items",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            itemType,
            itemName: itemName.trim(),
            category,
            location: location.trim(),
            date,
            description: description.trim(),
          }),
        }
      );

      const data = await response.json();

      // ======================================
      // API ERROR
      // ======================================

      if (!response.ok) {

        // User is not logged in
        if (response.status === 401) {
          router.push("/login");
          return;
        }

        setMessage(
          data.message ||
            "Something went wrong."
        );

        setMessageType("error");

        return;
      }


      // ======================================
      // SUCCESS
      // ======================================

      setMessage(
        "Item reported successfully!"
      );

      setMessageType("success");


      // Clear form
      setItemType("Lost");
      setItemName("");
      setCategory("");
      setLocation("");
      setDate("");
      setDescription("");


      // Redirect after 1 second
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);

    } catch (error) {

      console.error(
        "Submit error:",
        error
      );

      setMessage(
        "Unable to connect to the server."
      );

      setMessageType("error");

    } finally {
      setLoading(false);
    }
  }


  // ==========================================
  // LOGIN CHECK LOADING
  // ==========================================

  if (checkingLogin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>

          <p className="mt-4 text-gray-600">
            Checking login...
          </p>

        </div>

      </main>
    );
  }


  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">

      <div className="mx-auto max-w-2xl">


        {/* ==================================
            HEADER
        ================================== */}

        <div className="text-center">

          <h1 className="text-4xl font-bold text-gray-800">
            Report an Item
          </h1>

          <p className="mt-3 text-gray-600">
            Report an item you have lost or
            found on campus.
          </p>

        </div>


        {/* ==================================
            FORM
        ================================== */}

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-6 rounded-2xl bg-white p-8 shadow-sm"
        >


          {/* ==================================
              ITEM TYPE
          ================================== */}

          <div>

            <label className="mb-3 block font-medium text-gray-700">
              Item Type
            </label>


            <div className="grid grid-cols-2 gap-4">


              {/* LOST */}

              <button
                type="button"
                onClick={() =>
                  setItemType("Lost")
                }
                className={`rounded-xl border-2 p-4 font-semibold transition ${
                  itemType === "Lost"
                    ? "border-red-500 bg-red-50 text-red-600"
                    : "border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >

                <span className="text-xl">
                  🔴
                </span>

                <span className="ml-2">
                  Lost Item
                </span>

              </button>


              {/* FOUND */}

              <button
                type="button"
                onClick={() =>
                  setItemType("Found")
                }
                className={`rounded-xl border-2 p-4 font-semibold transition ${
                  itemType === "Found"
                    ? "border-green-500 bg-green-50 text-green-600"
                    : "border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >

                <span className="text-xl">
                  🟢
                </span>

                <span className="ml-2">
                  Found Item
                </span>

              </button>

            </div>

          </div>


          {/* ==================================
              ITEM NAME
          ================================== */}

          <div>

            <label
              htmlFor="itemName"
              className="mb-2 block font-medium text-gray-700"
            >
              Item Name
            </label>

            <input
              id="itemName"
              type="text"
              value={itemName}
              onChange={(event) =>
                setItemName(
                  event.target.value
                )
              }
              placeholder="e.g. Black Wallet"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>


          {/* ==================================
              CATEGORY
          ================================== */}

          <div>

            <label
              htmlFor="category"
              className="mb-2 block font-medium text-gray-700"
            >
              Category
            </label>

            <select
              id="category"
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >

              <option value="">
                Select category
              </option>

              {categories.map(
                (categoryName) => (
                  <option
                    key={categoryName}
                    value={categoryName}
                  >
                    {categoryName}
                  </option>
                )
              )}

            </select>

          </div>


          {/* ==================================
              LOCATION
          ================================== */}

          <div>

            <label
              htmlFor="location"
              className="mb-2 block font-medium text-gray-700"
            >
              Location
            </label>

            <input
              id="location"
              type="text"
              value={location}
              onChange={(event) =>
                setLocation(
                  event.target.value
                )
              }
              placeholder="e.g. University Library"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>


          {/* ==================================
              DATE
          ================================== */}

          <div>

            <label
              htmlFor="date"
              className="mb-2 block font-medium text-gray-700"
            >
              Date
            </label>

            <input
              id="date"
              type="date"
              value={date}
              onChange={(event) =>
                setDate(
                  event.target.value
                )
              }
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>


          {/* ==================================
              DESCRIPTION
          ================================== */}

          <div>

            <label
              htmlFor="description"
              className="mb-2 block font-medium text-gray-700"
            >
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Describe the item, color, special features, etc."
              rows={5}
              required
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>


          {/* ==================================
              MESSAGE
          ================================== */}

          {message && (
            <div
              className={`rounded-lg p-4 text-center font-medium ${
                messageType === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}


          {/* ==================================
              SUBMIT BUTTON
          ================================== */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >

            {loading
              ? "Submitting..."
              : `Report ${
                  itemType === "Lost"
                    ? "Lost"
                    : "Found"
                } Item`}

          </button>

        </form>

      </div>

    </main>
  );
}