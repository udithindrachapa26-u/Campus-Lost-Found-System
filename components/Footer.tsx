import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black px-4 py-12 sm:px-6 sm:py-16 text-white mt-16 sm:mt-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8 sm:mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
              Campus Lost & Found
            </h3>
            <p className="mt-2 text-sm text-gray-400 leading-relaxed">
              Helping students reconnect with their lost belongings.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-400 hover:text-blue-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/lost-items" className="text-gray-400 hover:text-blue-400 transition">
                  Lost Items
                </Link>
              </li>
              <li>
                <Link href="/found-items" className="text-gray-400 hover:text-blue-400 transition">
                  Found Items
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="text-gray-400 hover:text-blue-400 transition">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-gray-400 hover:text-blue-400 transition">
                  Register
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-white mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition text-lg">f</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition text-lg">𝕏</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition text-lg">in</a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-sm text-gray-500">
            © 2026 Campus Lost & Found. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}