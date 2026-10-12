'use client';

import React from 'react';
import { ISubmission } from '../../types';
import {
  Send,
  Instagram,
  Youtube,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';

interface Props {
  submissions: ISubmission[];
  onBrowseCampaigns: () => void;
  onOpenSimulate: (submission: ISubmission) => void;
}

export default function CreatorSubmissionsList({
  submissions,
  onBrowseCampaigns,
  onOpenSimulate,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {submissions.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Send className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No submissions yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Browse open campaigns and submit your Instagram or YouTube post link to start earning.
          </p>
          <button
            onClick={onBrowseCampaigns}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition"
          >
            Browse Campaigns
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-3 font-semibold">Campaign</th>
                <th className="px-5 py-3 font-semibold">Platform &amp; Link</th>
                <th className="px-5 py-3 font-semibold">Views</th>
                <th className="px-5 py-3 font-semibold">Milestone Reached</th>
                <th className="px-5 py-3 font-semibold">Earned Payout</th>
                <th className="px-5 py-3 font-semibold">Status / Spike</th>
                <th className="px-5 py-3 font-semibold text-right">Simulation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.map((sub) => {
                const camp = typeof sub.campaignId === 'object' ? sub.campaignId : null;
                return (
                  <tr key={sub._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-900 block">{camp?.name || 'Campaign'}</span>
                      <span className="text-[10px] text-slate-400">
                        Budget Remaining: ₹{camp ? camp.remainingBudget.toLocaleString() : 'N/A'}
                      </span>
                    </td>

                    <td className="px-5 py-4 max-w-[220px]">
                      <div className="flex items-center gap-1.5 mb-1">
                        {sub.platform === 'Instagram' ? (
                          <Instagram className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                        ) : (
                          <Youtube className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        )}
                        <span className="font-semibold text-slate-700 text-[11px]">{sub.platform}</span>
                      </div>
                      <a
                        href={sub.postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline flex items-center gap-1 text-[11px] truncate"
                      >
                        <span className="truncate">{sub.postUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-slate-900 block">
                        {sub.currentViews.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400">views</span>
                    </td>

                    <td className="px-5 py-4">
                      {sub.highestMilestoneReached ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {sub.highestMilestoneReached.views.toLocaleString()}v (₹
                          {sub.highestMilestoneReached.payout})
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Waiting for 1st milestone</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-base font-black text-emerald-600">
                        ₹{sub.currentPayout.toLocaleString()}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {sub.flaggedForSpike ? (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full text-[10px] font-bold border border-rose-200"
                          title={sub.spikeReason}
                        >
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Spike Flagged
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-semibold">
                          Verified
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => onOpenSimulate(sub)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Simulate Views</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
