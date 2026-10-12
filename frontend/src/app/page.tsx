'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { Sparkles, TrendingUp, ShieldCheck, Zap, ArrowRight, Layers, Users, BarChart3 } from 'lucide-react';

export default function HomePage() {
  const { user, demoLogin } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-6 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
        <span>Creator Marketplace Payout Engine</span>
      </div>

      {/* Main Title */}
      <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-3xl leading-tight">
        Scale viral campaigns with{' '}
        <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          transparent milestone payouts
        </span>
      </h1>

      <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl">
        Brands define view thresholds and budgets. Creators submit posts and track earnings
        in real-time as views grow. Never overspend, never double-pay.
      </p>

      {/* Role Action CTAs */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        {user ? (
          <Link
            href={user.role === 'brand' ? '/brand' : '/creator'}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition"
          >
            <span>Go to your {user.role === 'brand' ? 'Brand Dashboard' : 'Creator Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <>
            <button
              onClick={() => demoLogin('brand')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-200 transition"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Explore as Brand (Demo)</span>
            </button>

            <button
              onClick={() => demoLogin('creator')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-800 bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 shadow-sm transition"
            >
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Explore as Creator (Demo)</span>
            </button>
          </>
        )}
      </div>

      {/* Feature Grid */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl w-full">
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">Milestone Ladder Payouts</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Creators are awarded the payout of the highest milestone crossed (e.g. 10K &rarr; ₹500, 50K &rarr; ₹2,000, 100K &rarr; ₹5,000). Repeated view updates never double-pay.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">Atomic Budget Cap</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Guaranteed protection against overspend. Even under simultaneous parallel requests, campaign spending strictly stops at the brand's total budget.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">Anomaly Spike Detection</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Built-in velocity analyzer detects unnatural surges in views, tagging suspicious updates with audit logs for brand review.
          </p>
        </div>
      </div>
    </div>
  );
}
