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

  // -- Contact number state (for Google users) --------------------------
  const [needsPhone, setNeedsPhone] =
    useState(false);

  const [phone, setPhone] =
    useState("");

  const [phoneError, setPhoneError] =
    useState("");

  const [phoneLoading, setPhoneLoading] =
    useState(false);

  const [phoneSaved, setPhoneSaved] =
    useState(false);


  // ==========================================
  // CHECK LOGIN + fetch phone status
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

        const data = await response.json();

        // If user has no phone number saved (Google-only user)
        if (!data.user?.phone) {
          setNeedsPhone(true);
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
  // SAVE PHONE NUMBER
  // ==========================================

  async function handleSavePhone() {
    setPhoneError("");

    const cleaned = phone.trim();

    if (!/^[0-9]{10}$/.test(cleaned)) {
      setPhoneError(
        "Please enter a valid 10-digit phone number."
      );
      return;
    }

    setPhoneLoading(true);

    try {
      const response = await fetch(
        "/api/auth/me",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ phone: cleaned }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setPhoneError(
          data.message || "Failed to save phone number."
        );
        return;
      }

      // Phone saved -- dismiss the banner
      setPhoneSaved(true);
      setNeedsPhone(false);

    } catch (error) {
      console.error("Save phone error:", error);
      setPhoneError(
        "Unable to connect. Please try again."
      );
    } finally {
      setPhoneLoading(false);
    }
  }


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
            CONTACT NUMBER BANNER
            Shown only for Google users who
            have not saved a phone number yet.
        ================================== */}

        {needsPhone && !phoneSaved && (
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">

            <div className="flex items-start gap-3">

              {/* Icon */}
              <span className="mt-0.5 text-2xl">
                📞
              </span>

              <div className="flex-1">

                <h2 className="font-semibold text-amber-800">
                  Add your contact number
                </h2>

                <p className="mt-1 text-sm text-amber-700">
                  Since you signed in with Google, we don&apos;t have
                  your phone number yet. Add it so people can
                  reach you about your reported item.
                </p>

                <div className="mt-4 flex gap-3">

                  <input
                    id="contact-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setPhoneError("");
                    }}
                    placeholder="10-digit phone number"
                    maxLength={10}
                    className="flex-1 rounded-lg border border-amber-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  />

                  <button
                    id="save-phone-btn"
                    type="button"
                    onClick={handleSavePhone}
                    disabled={phoneLoading}
                    className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {phoneLoading ? "Saving..." : "Save"}
                  </button>

                </div>

                {/* Phone validation error */}
                {phoneError && (
                  <p className="mt-2 text-sm font-medium text-red-600">
                    {phoneError}
                  </p>
                )}

              </div>

            </div>

          </div>
        )}

        {/* Phone saved confirmation */}
        {phoneSaved && (
          <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 px-6 py-4">
            <p className="flex items-center gap-2 text-sm font-medium text-green-700">
              <span>✅</span>
              Contact number saved! People can now reach you about your items.
            </p>
          </div>
        )}


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
