'use client';

import { useState } from 'react';
import Link from 'next/link';
import LogoutButton from './LogoutButton';

type User = {
  id: number;
  name: string;
  email: string;
};

export default function NavbarClient({ user }: { user: User | null }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden inline-flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        aria-label="Toggle menu"
      >
        <svg
          className={`w-6 h-6 text-gray-700 dark:text-gray-300 transition-transform ${
            isOpen ? 'rotate-90' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            <Link
              href="/"
              onClick={closeMenu}
              className="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium rounded-lg hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-800"
            >
              Home
            </Link>

            <Link
              href="/lost-items"
              onClick={closeMenu}
              className="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium rounded-lg hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-800"
            >
              Lost Items
            </Link>

            <Link
              href="/found-items"
              onClick={closeMenu}
              className="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium rounded-lg hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-800"
            >
              Found Items
            </Link>

            {user && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-800 pt-2 mt-2">
                  <Link
                    href="/report"
                    onClick={closeMenu}
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium rounded-lg hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-800"
                  >
                    Report Item
                  </Link>

                  <Link
                    href="/dashboard"
                    onClick={closeMenu}
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium rounded-lg hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-800"
                  >
                    Dashboard
                  </Link>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-2 mt-2">
                  <p className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.name}
                  </p>
                  <div className="px-3">
                    <LogoutButton />
                  </div>
                </div>
              </>
            )}

            {!user && (
              <div className="border-t border-gray-200 dark:border-gray-800 pt-2 mt-2 space-y-2">
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="block px-3 py-2 text-blue-600 hover:text-blue-700 font-medium dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="block px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-all text-center"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
