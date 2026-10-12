'use client';

import React from 'react';
import { ICampaign, ISubmission } from '../../types';
import {
  Plus,
  Instagram,
  Youtube,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertTriangle,
  Zap,
} from 'lucide-react';

interface Props {
  campaigns: ICampaign[];
  selectedCampaignId: string | null;
  campaignSubmissions: Record<string, ISubmission[]>;
  onToggleExpand: (campaignId: string) => void;
  onOpenCreate: () => void;
  onOpenSimulate: (submission: ISubmission) => void;
}

export default function CampaignsList({
  campaigns,
  selectedCampaignId,
  campaignSubmissions,
  onToggleExpand,
  onOpenCreate,
  onOpenSimulate,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">Your Campaigns</h2>
        <span className="text-xs font-medium text-slate-500">{campaigns.length} total</span>
      </div>

      {campaigns.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No campaigns launched yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Create your first campaign with a custom milestone ladder and budget.
          </p>
          <button
            onClick={onOpenCreate}
            className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm transition"
          >
            Create Campaign Now
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {campaigns.map((camp) => {
            const spent = camp.spentBudget;
            const total = camp.totalBudget;
            const remaining = Math.max(0, total - spent);
            const percent = total > 0 ? Math.min(100, Math.round((spent / total) * 100)) : 0;
            const isExpanded = selectedCampaignId === camp._id;
            const submissions = campaignSubmissions[camp._id] || [];

            return (
              <div key={camp._id} className="p-6 transition hover:bg-slate-50/50">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Campaign Title & Platform */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-slate-900">{camp.name}</span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {camp.platform === 'Instagram' ? (
                          <Instagram className="w-3.5 h-3.5 text-pink-600" />
                        ) : (
                          <Youtube className="w-3.5 h-3.5 text-red-600" />
                        )}
                        {camp.platform}
                      </span>
                      {remaining === 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                          Budget Cap Reached
                        </span>
                      )}
                    </div>

                    {/* Milestone preview pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-slate-400 mr-1">Ladder:</span>
                      {camp.milestoneLadder.map((m, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[11px] font-medium border border-purple-100"
                        >
                          {m.views.toLocaleString()}v &rarr; ₹{m.payout.toLocaleString()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Budget Spent vs Remaining Bar */}
                  <div className="w-full lg:w-80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">
                        Spent: <strong className="text-slate-800">₹{spent.toLocaleString()}</strong>
                      </span>
                      <span className="text-slate-500 font-medium">
                        Remaining: <strong className="text-emerald-600">₹{remaining.toLocaleString()}</strong>
                      </span>
                    </div>

                    {/* Visual progress bar */}
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percent >= 100
                            ? 'bg-rose-500'
                            : percent > 75
                            ? 'bg-amber-500'
                            : 'bg-purple-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Total: ₹{total.toLocaleString()}</span>
                      <span>{percent}% utilized</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 self-end lg:self-center">
                    <button
                      onClick={() => onToggleExpand(camp._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition"
                    >
                      <span>{camp.submissionCount || submissions.length} Submissions</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Submissions Drawer */}
                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-slate-100 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Campaign Submissions &amp; View Audit
                    </h4>

                    {submissions.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">
                        No creator has submitted a post for this campaign yet.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                            <tr>
                              <th className="px-3 py-2 rounded-l-lg">Creator</th>
                              <th className="px-3 py-2">Post Link</th>
                              <th className="px-3 py-2">Current Views</th>
                              <th className="px-3 py-2">Payout Earned</th>
                              <th className="px-3 py-2">Milestone</th>
                              <th className="px-3 py-2">Status / Spike</th>
                              <th className="px-3 py-2 rounded-r-lg text-right">Simulation</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {submissions.map((sub) => {
                              const creatorObj =
                                typeof sub.creatorId === 'object' ? sub.creatorId : null;
                              return (
                                <tr key={sub._id} className="hover:bg-slate-50">
                                  <td className="px-3 py-3 font-semibold text-slate-800">
                                    {creatorObj?.name || 'Creator'}
                                  </td>
                                  <td className="px-3 py-3 max-w-[200px] truncate">
                                    <a
                                      href={sub.postUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-indigo-600 hover:underline flex items-center gap-1"
                                    >
                                      <span className="truncate">{sub.postUrl}</span>
                                      <ExternalLink className="w-3 h-3 shrink-0" />
                                    </a>
                                  </td>
                                  <td className="px-3 py-3 font-bold text-slate-900">
                                    {sub.currentViews.toLocaleString()}
                                  </td>
                                  <td className="px-3 py-3 font-bold text-emerald-600">
                                    ₹{sub.currentPayout.toLocaleString()}
                                  </td>
                                  <td className="px-3 py-3">
                                    {sub.highestMilestoneReached ? (
                                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-semibold border border-emerald-200">
                                        {sub.highestMilestoneReached.views.toLocaleString()}v (₹
                                        {sub.highestMilestoneReached.payout})
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 text-[11px]">None yet</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-3">
                                    {sub.flaggedForSpike ? (
                                      <span
                                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full text-[10px] font-bold border border-rose-200"
                                        title={sub.spikeReason}
                                      >
                                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                                        Spike Flagged
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-medium">
                                        Normal
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-3 py-3 text-right">
                                    <button
                                      onClick={() => onOpenSimulate(sub)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                                    >
                                      <Zap className="w-3 h-3" />
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
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
