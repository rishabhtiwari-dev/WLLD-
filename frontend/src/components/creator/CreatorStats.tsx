'use client';

import React from 'react';
import { Wallet, Eye, Send } from 'lucide-react';
import { CreatorEarnings } from '../../types';

interface Props {
  earnings: CreatorEarnings;
}

export default function CreatorStats({ earnings }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg shadow-emerald-500/10">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
            Total Earnings
          </span>
          <div className="p-2 bg-white/10 rounded-xl">
            <Wallet className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="mt-4 text-3xl font-black">
          ₹{(earnings.totalEarnings || 0).toLocaleString()}
        </div>
        <span className="text-[11px] text-emerald-100 mt-1 block">
          Accrued across all verified posts
        </span>
      </div>

      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Views
          </span>
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Eye className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 text-3xl font-black text-slate-900">
          {(earnings.totalViews || 0).toLocaleString()}
        </div>
        <span className="text-[11px] text-slate-400 mt-1 block">Across active campaigns</span>
      </div>

      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Submitted Posts
          </span>
          <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
            <Send className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 text-3xl font-black text-purple-600">
          {(earnings.totalSubmissions || 0).toLocaleString()}
        </div>
        <span className="text-[11px] text-slate-400 mt-1 block">Active tracking links</span>
      </div>
    </div>
  );
}

