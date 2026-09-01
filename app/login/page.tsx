"use client";

import { FormEvent, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      router.push("/dashboard");

    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleSignIn() {
    setError("");
    setGoogleLoading(true);
    window.location.href = "/api/auth/google";
  }

  return (
    <main className="relative flex min-h-[88vh] items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 overflow-hidden">
      {/* Mesh background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-10">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-2xl text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 mb-3">
            👋
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Login to Campus Lost &amp; Found System
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-center text-xs font-bold text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          id="google-signin-btn"
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-850"
        >
          {googleLoading ? (
            <svg className="h-5 w-5 animate-spin text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
              <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.08-6.08C34.46 3.08 29.52 1 24 1 14.82 1 7.07 6.48 3.55 14.22l7.1 5.52C12.35 13.4 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.64-.15-3.22-.43-4.75H24v9h12.7c-.55 2.97-2.2 5.48-4.68 7.17l7.18 5.57C43.55 37.25 46.5 31.34 46.5 24.5z"/>
              <path fill="#FBBC05" d="M10.65 28.26A14.5 14.5 0 019.5 24c0-1.48.25-2.91.65-4.26l-7.1-5.52A23.94 23.94 0 001 24c0 3.87.92 7.53 2.55 10.78l7.1-6.52z"/>
              <path fill="#34A853" d="M24 47c5.52 0 10.16-1.83 13.55-4.96l-7.18-5.57C28.57 37.77 26.38 38.5 24 38.5c-6.26 0-11.65-3.9-13.35-9.24l-7.1 5.52C7.07 41.52 14.82 47 24 47z"/>
            </svg>
          )}
          {googleLoading ? "Connecting to Google…" : "Continue with Google"}
        </button>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">or continue with email</span>
          <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@university.edu"
              required
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-900/30"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-900/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login to Account"}
          </button>
        </form>

        {/* Register Link */}
        <p className="mt-8 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="font-bold text-blue-600 hover:underline dark:text-blue-400"
          >
            Create an account
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
