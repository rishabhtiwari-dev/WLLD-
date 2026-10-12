import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { ICampaign, ISubmission } from '../types';

export function useBrandDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [campaignSubmissions, setCampaignSubmissions] = useState<Record<string, ISubmission[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [simulatingSubmission, setSimulatingSubmission] = useState<ISubmission | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/campaigns?mine=true');
      if (res.success && res.data) {
        setCampaigns(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch brand campaigns', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
  }, [user, fetchCampaigns]);

  // Derived budget analytics
  const totalAllocated = campaigns.reduce((acc, c) => acc + c.totalBudget, 0);
  const totalSpent = campaigns.reduce((acc, c) => acc + c.spentBudget, 0);
  const totalRemaining = Math.max(0, totalAllocated - totalSpent);
  const spentPercent = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;
  const activeCampaignsCount = campaigns.filter((c) => c.status === 'ACTIVE').length;

  return {
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
  };
}

