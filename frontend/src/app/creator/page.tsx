'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';
import { ICampaign, ISubmission, CreatorEarnings } from '../../types';
import SubmitPostModal from '../../components/SubmitPostModal';
import SimulateViewModal from '../../components/SimulateViewModal';
import {
  Wallet,
  Eye,
  Send,
  CheckCircle2,
  Instagram,
  Youtube,
  ExternalLink,
  Zap,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Layers,
} from 'lucide-react';

export default function CreatorPortal() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'submissions' | 'campaigns'>('submissions');
  const [earnings, setEarnings] = useState<CreatorEarnings>({
    totalEarnings: 0,
    totalViews: 0,
    totalSubmissions: 0,
  });
  const [submissions, setSubmissions] = useState<ISubmission[]>([]);
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [submittingCampaign, setSubmittingCampaign] = useState<ICampaign | null>(null);
  const [simulatingSubmission, setSimulatingSubmission] = useState<ISubmission | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [earningsRes, submissionsRes, campaignsRes] = await Promise.all([
        api.get('/submissions/creator/earnings'),
        api.get('/submissions/creator'),
        api.get('/campaigns'),
      ]);

      if (earningsRes.success) setEarnings(earningsRes.data);
      if (submissionsRes.success) setSubmissions(submissionsRes.data);
      if (campaignsRes.success) setCampaigns(campaignsRes.data);
    } catch (err) {
      console.error('Failed to load creator data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  if (authLoading || (!user && isLoading)) {
    return (
      <div className="py-20 text-center text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
        <p className="text-xs">Loading creator portal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Creator Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse campaigns, submit content, and track your milestone earnings
          </p>
        </div>

        <button
          onClick={fetchData}
          className="self-start sm:self-auto p-2 text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
          title="Refresh stats"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Aggregate Metric Cards */}
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
            ₹{earnings.totalEarnings.toLocaleString()}
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
            {earnings.totalViews.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across active campaigns
          </span>
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
            {earnings.totalSubmissions}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Active tracking links
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition ${
            activeTab === 'submissions'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>My Submissions ({submissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('campaigns')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition ${
            activeTab === 'campaigns'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Browse Live Campaigns ({campaigns.length})</span>
        </button>
      </div>

      {/* TAB 1: Submissions */}
      {activeTab === 'submissions' && (
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
                onClick={() => setActiveTab('campaigns')}
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
                          <span className="font-bold text-slate-900 block">
                            {camp?.name || 'Campaign'}
                          </span>
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
                            <span className="font-semibold text-slate-700 text-[11px]">
                              {sub.platform}
                            </span>
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
                            onClick={() => setSimulatingSubmission(sub)}
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
      )}

      {/* TAB 2: Browse Live Campaigns */}
      {activeTab === 'campaigns' && (
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
                  onClick={() => setSubmittingCampaign(camp)}
                  disabled={isExhausted}
                  className="w-full py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm disabled:opacity-50 transition"
                >
                  {isExhausted ? 'Campaign Budget Finished' : 'Submit Post Link'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <SubmitPostModal
        campaign={submittingCampaign}
        isOpen={!!submittingCampaign}
        onClose={() => setSubmittingCampaign(null)}
        onSuccess={() => {
          fetchData();
          setActiveTab('submissions');
        }}
      />

      {simulatingSubmission && (
        <SimulateViewModal
          submission={simulatingSubmission}
          isOpen={!!simulatingSubmission}
          onClose={() => setSimulatingSubmission(null)}
          onSuccess={() => {
            fetchData();
          }}
        />
      )}
    </div>
  );
}
