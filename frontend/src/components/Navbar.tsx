'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { Sparkles, LogOut, User, BarChart2, Layers, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { user, logout, demoLogin } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
              Meme'd
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Payout Tracker
            </span>
          </div>
        </Link>

        {/* Navigation / Role Links */}
        <nav className="flex items-center gap-3">
          {user ? (
            <>
              {user.role === 'brand' ? (
                <Link
                  href="/brand"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
                >
                  <BarChart2 className="w-4 h-4" />
                  <span>Brand Dashboard</span>
                </Link>
              ) : (
                <Link
                  href="/creator"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition"
                >
                  <Layers className="w-4 h-4" />
                  <span>Creator Portal</span>
                </Link>
              )}

              {/* User details */}
              <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left text-xs">
                  <div className="font-semibold text-slate-800">{user.name}</div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full ${
                        user.role === 'brand' ? 'bg-purple-500' : 'bg-emerald-500'
                      }`}
                    />
                    <span className="capitalize text-slate-500">{user.role}</span>
                  </div>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={logout}
                className="flex items-center gap-1 p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-medium">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => demoLogin('brand')}
                className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition"
              >
                Brand Demo
              </button>
              <button
                onClick={() => demoLogin('creator')}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition"
              >
                Creator Demo
              </button>
              <Link
                href="/login"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition"
              >
                Sign In
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

