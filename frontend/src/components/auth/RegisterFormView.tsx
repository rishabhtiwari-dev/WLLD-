'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Building2, UserCircle } from 'lucide-react';
import { UserRole } from '../../types';

interface Props {
  name: string;
  setName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  role: UserRole;
  setRole: (val: UserRole) => void;
  error: string | null;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function RegisterFormView({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  role,
  setRole,
  error,
  isLoading,
  onSubmit,
}: Props) {
  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-100">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-purple-50 text-purple-600 rounded-xl mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Create an Account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Join Meme&apos;d to launch campaigns or monetize your audience
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Role selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('creator')}
                className={`p-3 rounded-xl border text-left flex flex-col items-start gap-1 transition ${
                  role === 'creator'
                    ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <UserCircle
                  className={`w-5 h-5 ${role === 'creator' ? 'text-emerald-600' : 'text-slate-400'}`}
                />
                <span className="text-xs font-bold text-slate-800">Creator</span>
                <span className="text-[10px] text-slate-500">Post memes &amp; get paid</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('brand')}
                className={`p-3 rounded-xl border text-left flex flex-col items-start gap-1 transition ${
                  role === 'brand'
                    ? 'border-purple-500 bg-purple-50/60 ring-2 ring-purple-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <Building2
                  className={`w-5 h-5 ${role === 'brand' ? 'text-purple-600' : 'text-slate-400'}`}
                />
                <span className="text-xs font-bold text-slate-800">Brand</span>
                <span className="text-[10px] text-slate-500">Launch &amp; fund campaigns</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Full Name or Brand Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={role === 'brand' ? 'Red Bull Marketing' : 'Aarav Sharma'}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Password (min. 6 chars)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm disabled:opacity-50 transition"
          >
            {isLoading ? 'Creating Account...' : 'Complete Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
