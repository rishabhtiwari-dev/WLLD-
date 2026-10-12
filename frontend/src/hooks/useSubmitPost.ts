import { useState } from 'react';
import { api } from '../lib/api';
import { ICampaign } from '../types';

interface UseSubmitPostProps {
  campaign: ICampaign | null;
  onSuccess: () => void;
  onClose: () => void;
}

export function useSubmitPost({ campaign, onSuccess, onClose }: UseSubmitPostProps) {
  const [postUrl, setPostUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setPostUrl('');
    setError(null);
  };

  const generateSampleLink = () => {
    if (!campaign) return;
    const link =
      campaign.platform === 'Instagram'
        ? `https://instagram.com/p/meme_${Date.now()}`
        : `https://youtube.com/watch?v=clip_${Date.now()}`;
    setPostUrl(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;
    setError(null);

    if (!postUrl.trim()) {
      setError('Please provide a valid post link');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/submissions', {
        campaignId: campaign._id,
        postUrl: postUrl.trim(),
      });

      if (res.success) {
        resetForm();
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit post');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    postUrl,
    setPostUrl,
    error,
    isLoading,
    generateSampleLink,
    handleSubmit,
    resetForm,
  };
}
