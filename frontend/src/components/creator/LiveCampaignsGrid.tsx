'use client';

import React from 'react';
import { ICampaign } from '../../types';
import { Instagram, Youtube } from 'lucide-react';

interface Props {
  campaigns: ICampaign[];
  onOpenSubmit: (campaign: ICampaign) => void;
}

export default function LiveCampaignsGrid({ campaigns, onOpenSubmit }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((camp) => {
        const remaining = camp.remainingBudget;
        const isExhausted = remaining <= 0;

        return (
          <div
            key={camp._id}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  {camp.platform === 'Instagram' ? (
                    <Instagram className="w-3.5 h-3.5 text-pink-600" />
                  ) : (
                    <Youtube className="w-3.5 h-3.5 text-red-600" />
                  )}
                  {camp.platform}
                </span>

                {isExhausted ? (
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Budget Exhausted
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Budget: ₹{remaining.toLocaleString()} left
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2">{camp.name}</h3>

              {/* Milestone ladder pills */}
              <div className="space-y-1.5 mb-6">
                <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wide">
                  Milestone Ladder:
                </span>
                <div className="space-y-1">
                  {camp.milestoneLadder.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs px-2.5 py-1.5 bg-slate-50 rounded-lg text-slate-700"
                    >
                      <span>{m.views.toLocaleString()} views</span>
                      <span className="font-bold text-emerald-600">₹{m.payout.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenSubmit(camp)}
              disabled={isExhausted}
              className="w-full py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm disabled:opacity-50 transition"
            >
              {isExhausted ? 'Campaign Budget Finished' : 'Submit Post Link'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
