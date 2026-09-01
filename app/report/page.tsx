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

  const [itemType, setItemType] = useState<ItemType>("Lost");
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  // Photo Upload State
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingLogin, setCheckingLogin] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  // Contact number state (for Google users)
  const [needsPhone, setNeedsPhone] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneSaved, setPhoneSaved] = useState(false);

  // 2FA OTP state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  // ==========================================
  // CHECK LOGIN + fetch phone status
  // ==========================================
  useEffect(() => {
    async function checkLogin() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          router.push("/login");
          return;
        }

        const data = await response.json();

        if (!data.user?.phone) {
          setNeedsPhone(true);
        }

        setCheckingLogin(false);
      } catch (error) {
        console.error("Login check error:", error);
        router.push("/login");
      }
    }

    checkLogin();
  }, [router]);

  // ==========================================
  // HANDLE IMAGE FILE SELECTION & UPLOAD
  // ==========================================
  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setUploadError(data.message || "Failed to upload photo.");
        return;
      }

      setImageUrl(data.url);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("Unable to upload photo. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  }

  // ==========================================
  // SAVE PHONE NUMBER
  // ==========================================
  async function handleSavePhone() {
    setPhoneError("");
    const cleaned = phone.trim();

    if (!/^[0-9]{10}$/.test(cleaned)) {
      setPhoneError("Please enter a valid 10-digit phone number.");
      return;
    }

    setPhoneLoading(true);

    try {
      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: cleaned }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPhoneError(data.message || "Failed to save phone number.");
        return;
      }

      setPhoneSaved(true);
      setNeedsPhone(false);
    } catch (error) {
      console.error("Save phone error:", error);
      setPhoneError("Unable to connect. Please try again.");
    } finally {
      setPhoneLoading(false);
    }
  }

  // ==========================================
  // SUBMIT REPORT -> TRIGGERS OTP SENDING
  // ==========================================
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (!itemName.trim()) {
      setMessage("Please enter the item name.");
      setMessageType("error");
      return;
    }
    if (!category) {
      setMessage("Please select a category.");
      setMessageType("error");
      return;
    }
    if (!location.trim()) {
      setMessage("Please enter the location.");
      setMessageType("error");
      return;
    }
    if (!date) {
      setMessage("Please select the date.");
      setMessageType("error");
      return;
    }
    if (!description.trim()) {
      setMessage("Please enter a description.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/items/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          itemType,
          itemName: itemName.trim(),
          category,
          location: location.trim(),
          date,
          description: description.trim(),
          imageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        setMessage(data.message || "Something went wrong sending verification code.");
        setMessageType("error");
        return;
      }

      setPendingId(data.pendingId);
      setUserEmail(data.userEmail || "");
      setOtpCode("");
      setOtpError("");
      setShowOtpModal(true);

    } catch (error) {
      console.error("Send OTP error:", error);
      setMessage("Unable to connect to the server.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // VERIFY OTP AND POST ITEM
  // ==========================================
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();

    if (!pendingId) return;
    const cleanOtp = otpCode.trim();

    if (!/^[0-9]{6}$/.test(cleanOtp)) {
      setOtpError("Please enter a valid 6-digit OTP code.");
      return;
    }

    setOtpError("");
    setOtpLoading(true);

    try {
      const response = await fetch("/api/items/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          pendingId,
          otpCode: cleanOtp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setOtpError(data.message || "Verification failed.");
        return;
      }

      setShowOtpModal(false);
      setMessage("Item verified and posted successfully!");
      setMessageType("success");

      // Reset form
      setItemType("Lost");
      setItemName("");
      setCategory("");
      setLocation("");
      setDate("");
      setDescription("");
      setImageUrl(null);

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);

    } catch (error) {
      console.error("Verify OTP error:", error);
      setOtpError("Unable to verify OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  }

  // ==========================================
  // RESEND OTP
  // ==========================================
  async function handleResendOtp() {
    setOtpError("");
    setOtpLoading(true);

    try {
      const response = await fetch("/api/items/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          itemType,
          itemName: itemName.trim(),
          category,
          location: location.trim(),
          date,
          description: description.trim(),
          imageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setOtpError(data.message || "Failed to resend code.");
        return;
      }

      setPendingId(data.pendingId);
      setOtpError("New verification code sent to your email!");
    } catch (err) {
      console.error(err);
      setOtpError("Unable to resend code.");
    } finally {
      setOtpLoading(false);
    }
  }

  if (checkingLogin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600">Checking login...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-2xl">
        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">Report an Item</h1>
          <p className="mt-3 text-gray-600">
            Report an item you have lost or found on campus with photo upload &amp; 2FA email confirmation.
          </p>
        </div>

        {/* CONTACT NUMBER BANNER */}
        {needsPhone && !phoneSaved && (
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-2xl">📞</span>
              <div className="flex-1">
                <h2 className="font-semibold text-amber-800">Add your contact number</h2>
                <p className="mt-1 text-sm text-amber-700">
                  Since you signed in with Google, we don&apos;t have your phone number yet. Add it so people can reach you about your reported item.
                </p>
                <div className="mt-4 flex gap-3">
                  <input
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
                    type="button"
                    onClick={handleSavePhone}
                    disabled={phoneLoading}
                    className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60"
                  >
                    {phoneLoading ? "Saving..." : "Save"}
                  </button>
                </div>
                {phoneError && (
                  <p className="mt-2 text-sm font-medium text-red-600">{phoneError}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {phoneSaved && (
          <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 px-6 py-4">
            <p className="flex items-center gap-2 text-sm font-medium text-green-700">
              <span>✅</span> Contact number saved! People can now reach you about your items.
            </p>
          </div>
        )}

        {/* REPORT FORM */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-6 rounded-2xl bg-white p-8 shadow-sm"
        >
          {/* ITEM TYPE */}
          <div>
            <label className="mb-3 block font-medium text-gray-700">Item Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setItemType("Lost")}
                className={`rounded-xl border-2 p-4 font-semibold transition ${
                  itemType === "Lost"
                    ? "border-red-500 bg-red-50 text-red-600"
                    : "border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >
                <span className="text-xl">🔴</span>
                <span className="ml-2">Lost Item</span>
              </button>

              <button
                type="button"
                onClick={() => setItemType("Found")}
                className={`rounded-xl border-2 p-4 font-semibold transition ${
                  itemType === "Found"
                    ? "border-green-500 bg-green-50 text-green-600"
                    : "border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >
                <span className="text-xl">🟢</span>
                <span className="ml-2">Found Item</span>
              </button>
            </div>
          </div>

          {/* ITEM PHOTO UPLOAD */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Item Photo <span className="text-xs text-gray-400 font-normal">(Optional)</span>
            </label>

            {imageUrl ? (
              <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-2">
                <img
                  src={imageUrl}
                  alt="Item Preview"
                  className="h-48 w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="absolute top-4 right-4 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-red-700"
                >
                  ✕ Remove Photo
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:border-blue-400">
                <span className="text-3xl">📷</span>
                <p className="mt-2 text-sm font-medium text-gray-700">Upload a photo of the item</p>
                <p className="mt-1 text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>

                <label className="mt-4 inline-flex cursor-pointer items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                  {uploadingImage ? "Uploading Photo..." : "Choose Image File"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>

                {uploadError && (
                  <p className="mt-2 text-xs font-medium text-red-600">{uploadError}</p>
                )}
              </div>
            )}
          </div>

          {/* ITEM NAME */}
          <div>
            <label htmlFor="itemName" className="mb-2 block font-medium text-gray-700">
              Item Name
            </label>
            <input
              id="itemName"
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Black Wallet"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label htmlFor="category" className="mb-2 block font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* LOCATION */}
          <div>
            <label htmlFor="location" className="mb-2 block font-medium text-gray-700">
              Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. University Library"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* DATE */}
          <div>
            <label htmlFor="date" className="mb-2 block font-medium text-gray-700">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label htmlFor="description" className="mb-2 block font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the item, color, special features, etc."
              rows={5}
              required
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* MESSAGE */}
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

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading
              ? "Sending Verification Code..."
              : `Proceed to 2FA Email Verification`}
          </button>
        </form>
      </div>

      {/* 🔐 2FA OTP VERIFICATION MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl transition-all">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl text-blue-600">
                🔐
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-800">
                2-Factor Email Authentication
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                We sent a 6-digit OTP code to your registered email:
              </p>
              <p className="mt-1 font-semibold text-blue-600">{userEmail || "your email"}</p>
            </div>

            {otpError && (
              <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-center text-sm font-medium text-amber-800">
                {otpError}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="mt-6 space-y-5">
              <div>
                <label htmlFor="otp-input" className="block text-center text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  id="otp-input"
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  required
                  autoFocus
                  className="w-full rounded-xl border-2 border-blue-500 bg-blue-50/50 py-3.5 text-center text-3xl font-extrabold tracking-[0.5em] text-gray-800 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                disabled={otpLoading || otpCode.length !== 6}
                className="w-full rounded-xl bg-blue-600 py-3.5 font-bold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {otpLoading ? "Verifying OTP..." : "Verify & Confirm Item"}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between border-t pt-4 text-sm text-gray-500">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={otpLoading}
                className="font-medium text-blue-600 hover:underline disabled:opacity-50"
              >
                🔄 Resend Code
              </button>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="font-medium text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
