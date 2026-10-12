'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';
import { ICampaign, ISubmission } from '../../types';
import CreateCampaignModal from '../../components/CreateCampaignModal';
import SimulateViewModal from '../../components/SimulateViewModal';
import {
  Plus,
  TrendingUp,
  Wallet,
  PieChart,
  Instagram,
  Youtube,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function BrandDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [campaignSubmissions, setCampaignSubmissions] = useState<Record<string, ISubmission[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Simulation modal state
  const [simulatingSubmission, setSimulatingSubmission] = useState<ISubmission | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      // Fetch brand's campaigns
      const res = await api.get('/campaigns?mine=true');
      if (res.success && res.data) {
        setCampaigns(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch campaigns', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCampaignDetails = async (campaignId: string) => {
    try {
      const res = await api.get(`/campaigns/${campaignId}`);
      if (res.success && res.data) {
        setCampaignSubmissions((prev) => ({
          ...prev,
          [campaignId]: res.data.submissions || [],
        }));
      }
    } catch (err) {
      console.error('Failed to load campaign submissions', err);
    }
  };

  const toggleCampaignExpand = (campaignId: string) => {
    if (selectedCampaignId === campaignId) {
      setSelectedCampaignId(null);
    } else {
      setSelectedCampaignId(campaignId);
      if (!campaignSubmissions[campaignId]) {
        fetchCampaignDetails(campaignId);
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchCampaigns();
    }
  }, [user]);

  // Aggregate stats
  const totalAllocated = campaigns.reduce((acc, c) => acc + c.totalBudget, 0);
  const totalSpent = campaigns.reduce((acc, c) => acc + c.spentBudget, 0);
  const totalRemaining = Math.max(0, totalAllocated - totalSpent);
  const spentPercent = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  if (authLoading || (!user && isLoading)) {
    return (
      <div className="py-20 text-center text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
        <p className="text-xs">Loading brand dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Brand Campaign Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track spent vs. remaining budgets in real-time across your creator campaigns
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCampaigns}
            className="p-2 text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
            title="Refresh campaigns"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-200 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
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
          <span className="text-[11px] text-slate-400 mt-1 block">Across {campaigns.length} campaigns</span>
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
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Protected from overspending</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Campaigns</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-indigo-600">
            {campaigns.filter((c) => c.status === 'ACTIVE').length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Ready for creator posts</span>
        </div>
      </div>

      {/* Campaigns Listing */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Your Campaigns</h2>
          <span className="text-xs font-medium text-slate-500">
            {campaigns.length} total
          </span>
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
              onClick={() => setIsCreateOpen(true)}
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
                        <span className="text-[11px] font-semibold text-slate-400 mr-1">
                          Ladder:
                        </span>
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
                        onClick={() => toggleCampaignExpand(camp._id)}
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
                                const creatorObj = typeof sub.creatorId === 'object' ? sub.creatorId : null;
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
                                          {sub.highestMilestoneReached.views.toLocaleString()}v (₹{sub.highestMilestoneReached.payout})
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
                                        onClick={() => setSimulatingSubmission(sub)}
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

      {/* Modals */}
      <CreateCampaignModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          fetchCampaigns();
        }}
      />

      {simulatingSubmission && (
        <SimulateViewModal
          submission={simulatingSubmission}
          isOpen={!!simulatingSubmission}
          onClose={() => setSimulatingSubmission(null)}
          onSuccess={() => {
            fetchCampaigns();
            if (selectedCampaignId) {
              fetchCampaignDetails(selectedCampaignId);
            }
          }}
        />
      )}
    </div>
  );
}
