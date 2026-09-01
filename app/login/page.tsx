"use client";

import { FormEvent, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Separate component so useSearchParams is inside Suspense
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Show errors that come back via redirect from the OAuth callback
  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (!oauthError) return;

    const messages: Record<string, string> = {
      google_denied: "Google sign-in was cancelled.",
      missing_code: "Google sign-in failed. Please try again.",
      token_exchange: "Could not verify your Google account. Please try again.",
      userinfo: "Could not retrieve your Google account info. Please try again.",
      no_email: "Your Google account has no email address associated.",
      server: "Something went wrong during Google sign-in. Please try again.",
    };

    setError(messages[oauthError] || "Sign-in failed. Please try again.");
  }, [searchParams]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Login failed"
        );
        return;
      }

      // Login successful
      router.push("/dashboard");

    } catch (error) {
      console.error(error);

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleSignIn() {
    setError("");
    setGoogleLoading(true);
    // Redirect to the Google OAuth initiation route
    window.location.href = "/api/auth/google";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        {/* Header */}
        <div className="mb-8 text-center">

          <h1 className="text-3xl font-bold text-gray-800">
            Welcome Back
          </h1>

          <p className="mt-2 text-gray-500">
            Login to Campus Lost &amp; Found
          </p>

        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 rounded-lg bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          id="google-signin-btn"
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          {googleLoading ? (
            /* Spinner */
            <svg
              className="h-5 w-5 animate-spin text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          ) : (
            /* Google "G" logo SVG */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="h-5 w-5"
            >
              <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.08-6.08C34.46 3.08 29.52 1 24 1 14.82 1 7.07 6.48 3.55 14.22l7.1 5.52C12.35 13.4 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.64-.15-3.22-.43-4.75H24v9h12.7c-.55 2.97-2.2 5.48-4.68 7.17l7.18 5.57C43.55 37.25 46.5 31.34 46.5 24.5z"/>
              <path fill="#FBBC05" d="M10.65 28.26A14.5 14.5 0 019.5 24c0-1.48.25-2.91.65-4.26l-7.1-5.52A23.94 23.94 0 001 24c0 3.87.92 7.53 2.55 10.78l7.1-6.52z"/>
              <path fill="#34A853" d="M24 47c5.52 0 10.16-1.83 13.55-4.96l-7.18-5.57C28.57 37.77 26.38 38.5 24 38.5c-6.26 0-11.65-3.9-13.35-9.24l-7.1 5.52C7.07 41.52 14.82 47 24 47z"/>
            </svg>
          )}
          {googleLoading ? "Redirecting…" : "Continue with Google"}
        </button>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-sm text-gray-400">or continue with email</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        {/* Register Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}

          <button
            type="button"
            onClick={() => router.push("/register")}
            className="font-semibold text-blue-600 hover:underline"
          >
            Register
          </button>
        </p>

      </div>

    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}