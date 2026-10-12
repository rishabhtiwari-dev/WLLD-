'use client';

import React from 'react';
import { useBrandDashboard } from '../../hooks/useBrandDashboard';
import BrandStats from '../../components/brand/BrandStats';
import CampaignsList from '../../components/brand/CampaignsList';
import CreateCampaignModal from '../../components/modals/CreateCampaignModal';
import SimulateViewModal from '../../components/modals/SimulateViewModal';
import { Plus, RefreshCw } from 'lucide-react';

export default function BrandDashboardPage() {
  const {
    user,
    authLoading,
    campaigns,
    selectedCampaignId,
    campaignSubmissions,
    isLoading,
    isCreateOpen,
    setIsCreateOpen,
    simulatingSubmission,
    setSimulatingSubmission,
    fetchCampaigns,
    fetchCampaignDetails,
    toggleCampaignExpand,
    totalAllocated,
    totalSpent,
    totalRemaining,
    spentPercent,
    activeCampaignsCount,
  } = useBrandDashboard();

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

      {/* Metric Cards (Design component) */}
      <BrandStats
        totalAllocated={totalAllocated}
        totalSpent={totalSpent}
        totalRemaining={totalRemaining}
        spentPercent={spentPercent}
        activeCampaignsCount={activeCampaignsCount}
        campaignsCount={campaigns.length}
      />

      {/* Campaigns Listing (Design component) */}
      <CampaignsList
        campaigns={campaigns}
        selectedCampaignId={selectedCampaignId}
        campaignSubmissions={campaignSubmissions}
        onToggleExpand={toggleCampaignExpand}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenSimulate={(sub) => setSimulatingSubmission(sub)}
      />

      {/* Modals */}
      <CreateCampaignModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchCampaigns}
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
