'use client';

import React from 'react';
import { Wallet, TrendingUp, PieChart, Sparkles } from 'lucide-react';

interface Props {
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  spentPercent: number;
  activeCampaignsCount: number;
  campaignsCount: number;
}

export default function BrandStats({
  totalAllocated,
  totalSpent,
  totalRemaining,
  spentPercent,
  activeCampaignsCount,
  campaignsCount,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Total Allocated Budget</span>
          <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-black text-slate-900">
          ₹{totalAllocated.toLocaleString()}
        </div>
        <span className="text-[11px] text-slate-400 mt-1 block">
          Across {campaignsCount} campaigns
        </span>
      </div>

      <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Total Budget Spent</span>
          <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-black text-rose-600">
          ₹{totalSpent.toLocaleString()}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-700">{spentPercent}%</span> of total budget utilized
        </div>
      </div>

      <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Remaining Budget</span>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <PieChart className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-black text-emerald-600">
          ₹{totalRemaining.toLocaleString()}
        </div>
        <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
          Protected from overspending
        </span>
      </div>

      <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Active Campaigns</span>
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-black text-indigo-600">
          {activeCampaignsCount}
        </div>
        <span className="text-[11px] text-slate-400 mt-1 block">Ready for creator posts</span>
      </div>
    </div>
  );
}

