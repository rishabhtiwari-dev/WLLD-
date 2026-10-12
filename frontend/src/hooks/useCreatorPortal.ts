import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { ICampaign, ISubmission, CreatorEarnings } from '../types';

export function useCreatorPortal() {
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

  const [submittingCampaign, setSubmittingCampaign] = useState<ICampaign | null>(null);
  const [simulatingSubmission, setSimulatingSubmission] = useState<ISubmission | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  return {
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
  };
}
