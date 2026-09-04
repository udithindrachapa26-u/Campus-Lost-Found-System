import Link from "next/link";
import HomeSearch from "@/components/HomeSearch";

export default function Home() {
  return (
    <main className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] bg-slate-950 px-4 py-24 sm:px-6 md:py-36 text-center text-white overflow-hidden flex items-center justify-center">
        {/* Background Mesh Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-blue-600/30 via-indigo-600/30 to-purple-600/20 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 -left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-10 -right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 backdrop-blur-md mb-8">
            <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-blue-300 uppercase">
              Smart Campus Lost &amp; Found System
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.15] text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
            Reconnecting You With What Matters
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-xl text-slate-300 font-normal leading-relaxed">
            Lost an item on campus or found someone else&apos;s belonging? Report it in seconds.
          </p>

          {/* Search Box */}
          <div className="mx-auto mt-10 max-w-2xl w-full">
            <HomeSearch />
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 px-2">
            <Link
              href="/lost-items"
              className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-500/40 transition-all transform hover:-translate-y-0.5"
            >
              🔍 Browse Lost Items
            </Link>

            <Link
              href="/found-items"
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/80 px-8 py-4 text-base font-bold text-slate-200 backdrop-blur-md hover:bg-slate-800 hover:border-slate-600 transition-all transform hover:-translate-y-0.5"
            >
              📦 Browse Found Items
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-20 sm:px-6 md:py-28 bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-extrabold tracking-wider text-blue-600 uppercase dark:text-blue-400">
              Simple &amp; Fast Process
            </span>
            <h2 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              How Campus Lost &amp; Found Works
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-4 text-base sm:text-lg">
              Three effortless steps to locate or return lost items across campus buildings.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative group rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10 text-2xl font-black text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                01
              </div>
              <h3 className="mt-6 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Report &amp; Upload Photo
              </h3>
              <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Submit item details, attach a photo, and confirm instantly with a 2FA OTP code sent to your email.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative group rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/10 text-2xl font-black text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                02
              </div>
              <h3 className="mt-6 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Instant Search &amp; Filter
              </h3>
              <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Search through active items by category (Electronics, Wallet, Keys, ID), location, or description.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative group rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600/10 text-2xl font-black text-violet-600 dark:bg-violet-500/20 dark:text-violet-400">
                03
              </div>
              <h3 className="mt-6 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Direct Contact &amp; Recover
              </h3>
              <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Connect directly with the reporter via phone or email and arrange a safe recovery on campus.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
