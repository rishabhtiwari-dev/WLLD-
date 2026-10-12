'use client';

import React from 'react';
import { useCreatorPortal } from '../../hooks/useCreatorPortal';
import CreatorStats from '../../components/creator/CreatorStats';
import CreatorSubmissionsList from '../../components/creator/CreatorSubmissionsList';
import LiveCampaignsGrid from '../../components/creator/LiveCampaignsGrid';
import SubmitPostModal from '../../components/modals/SubmitPostModal';
import SimulateViewModal from '../../components/modals/SimulateViewModal';
import { RefreshCw, Layers, Sparkles } from 'lucide-react';

export default function CreatorPortalPage() {
  const {
    user,
    authLoading,
    activeTab,
    setActiveTab,
    earnings,
    submissions,
    campaigns,
    isLoading,
    submittingCampaign,
    setSubmittingCampaign,
    simulatingSubmission,
    setSimulatingSubmission,
    fetchData,
  } = useCreatorPortal();

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

      {/* Aggregate Metric Cards (Design Component) */}
      <CreatorStats earnings={earnings} />

      {/* Tab Navigation */}
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

      {/* TAB 1: Submissions (Design Component) */}
      {activeTab === 'submissions' && (
        <CreatorSubmissionsList
          submissions={submissions}
          onBrowseCampaigns={() => setActiveTab('campaigns')}
          onOpenSimulate={(sub) => setSimulatingSubmission(sub)}
        />
      )}

      {/* TAB 2: Browse Live Campaigns (Design Component) */}
      {activeTab === 'campaigns' && (
        <LiveCampaignsGrid
          campaigns={campaigns}
          onOpenSubmit={(camp) => setSubmittingCampaign(camp)}
        />
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
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
