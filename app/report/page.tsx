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
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-800 dark:border-t-blue-500"></div>
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Verifying session...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 dark:bg-slate-950">
      <div className="mx-auto max-w-2xl">
        {/* HEADER */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <span>📝</span> Report Form
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Report a Lost or Found Item
          </h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base dark:text-slate-400">
            Fill out the details below with photo upload and 2FA email confirmation.
          </p>
        </div>

        {/* CONTACT NUMBER BANNER */}
        {needsPhone && !phoneSaved && (
          <div className="mt-8 rounded-3xl border border-amber-200/80 bg-amber-50/80 p-6 backdrop-blur-md shadow-sm dark:border-amber-900/50 dark:bg-amber-950/30">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-xl text-amber-600">
                📞
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-amber-900 dark:text-amber-200">
                  Add Your Contact Number
                </h2>
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                  Since you signed in with Google, please add your phone number so people can reach you.
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
                    className="flex-1 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-xs font-semibold outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:border-amber-800 dark:bg-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleSavePhone}
                    disabled={phoneLoading}
                    className="rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-amber-700 disabled:opacity-60"
                  >
                    {phoneLoading ? "Saving…" : "Save Phone"}
                  </button>
                </div>
                {phoneError && (
                  <p className="mt-2 text-xs font-semibold text-rose-600">{phoneError}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {phoneSaved && (
          <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <p className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <span>✅</span> Contact number saved! People can now contact you.
            </p>
          </div>
        )}

        {/* REPORT FORM */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl sm:p-10 dark:border-slate-800 dark:bg-slate-900"
        >
          {/* ITEM TYPE */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Item Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setItemType("Lost")}
                className={`flex items-center justify-center gap-3 rounded-2xl border-2 p-4 font-bold text-sm transition-all duration-200 ${itemType === "Lost"
                    ? "border-rose-500 bg-rose-50/80 text-rose-600 shadow-md shadow-rose-500/10 dark:bg-rose-950/40 dark:text-rose-400"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700"
                  }`}
              >
                <span className="text-xl">🔴</span>
                <span>Lost Item</span>
              </button>

              <button
                type="button"
                onClick={() => setItemType("Found")}
                className={`flex items-center justify-center gap-3 rounded-2xl border-2 p-4 font-bold text-sm transition-all duration-200 ${itemType === "Found"
                    ? "border-emerald-500 bg-emerald-50/80 text-emerald-600 shadow-md shadow-emerald-500/10 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700"
                  }`}
              >
                <span className="text-xl">🟢</span>
                <span>Found Item</span>
              </button>
            </div>
          </div>

          {/* ITEM PHOTO UPLOAD */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Item Photo <span className="font-normal text-slate-400 dark:text-slate-500">(Optional)</span>
            </label>

            {imageUrl ? (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-950">
                <img
                  src={imageUrl}
                  alt="Item Preview"
                  className="h-52 w-full rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="absolute top-4 right-4 rounded-full bg-slate-950/80 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-rose-600 shadow-lg"
                >
                  ✕ Remove Photo
                </button>
              </div>
            ) : (
              <div className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-8 text-center transition hover:border-blue-500 hover:bg-blue-50/30 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-500/50">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                  📸
                </div>
                <p className="mt-3 text-sm font-bold text-slate-800 dark:text-white">
                  Upload a clear photo of the item
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Supports PNG, JPG, WEBP formats up to 10MB
                </p>

                <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500">
                  {uploadingImage ? "Uploading Photo…" : "Select Image File"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>

                {uploadError && (
                  <p className="mt-2 text-xs font-semibold text-rose-600">{uploadError}</p>
                )}
              </div>
            )}
          </div>

          {/* ITEM NAME */}
          <div>
            <label htmlFor="itemName" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Item Name
            </label>
            <input
              id="itemName"
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Blue Hydro Flask / Sony Headphones"
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-900/30"
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label htmlFor="category" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-900/30"
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
            <label htmlFor="location" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Science Building 2nd Floor / Main Library"
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-900/30"
            />
          </div>

          {/* DATE */}
          <div>
            <label htmlFor="date" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Date Lost / Found
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-900/30"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label htmlFor="description" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Description &amp; Key Details
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe color, distinct marks, serial numbers, or condition..."
              rows={4}
              required
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-900/30"
            />
          </div>

          {/* MESSAGE */}
          {message && (
            <div
              className={`rounded-2xl p-4 text-center text-sm font-bold shadow-sm ${messageType === "success"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                }`}
            >
              {message}
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:shadow-xl hover:shadow-blue-600/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Sending OTP Code…
              </span>
            ) : (
              "Add a post"
            )}
          </button>
        </form>
      </div>

      {/* 🔐 2FA OTP VERIFICATION MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md transition-all">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10 text-3xl text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                🔐
              </div>
              <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                2-Factor Authentication
              </h2>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                We sent a 6-digit OTP verification code to:
              </p>
              <p className="mt-1 font-bold text-blue-600 dark:text-blue-400">{userEmail || "your email"}</p>
            </div>

            {otpError && (
              <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-3 text-center text-xs font-bold text-amber-800 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-200">
                {otpError}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="mt-6 space-y-5">
              <div>
                <label htmlFor="otp-input" className="block text-center text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 dark:text-slate-400">
                  Enter 6-Digit Code
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
                  className="w-full rounded-2xl border-2 border-blue-500 bg-blue-50/50 py-4 text-center text-3xl font-black tracking-[0.5em] text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-900/30"
                />
              </div>

              <button
                type="submit"
                disabled={otpLoading || otpCode.length !== 6}
                className="w-full rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40"
              >
                {otpLoading ? "Verifying OTP…" : "Verify Code & Confirm Post"}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold text-slate-500 dark:border-slate-800">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={otpLoading}
                className="text-blue-600 hover:underline disabled:opacity-50 dark:text-blue-400"
              >
                🔄 Resend Code
              </button>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
