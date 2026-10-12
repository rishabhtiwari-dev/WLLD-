import { useState } from 'react';
import { api } from '../lib/api';
import { IMilestone, PlatformType } from '../types';

interface UseCreateCampaignProps {
  onSuccess: () => void;
  onClose: () => void;
}

export function useCreateCampaign({ onSuccess, onClose }: UseCreateCampaignProps) {
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState<PlatformType>('Instagram');
  const [totalBudget, setTotalBudget] = useState<number>(25000);
  const [ladder, setLadder] = useState<IMilestone[]>([
    { views: 10000, payout: 500 },
    { views: 50000, payout: 2000 },
    { views: 100000, payout: 5000 },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setName('');
    setPlatform('Instagram');
    setTotalBudget(25000);
    setLadder([
      { views: 10000, payout: 500 },
      { views: 50000, payout: 2000 },
      { views: 100000, payout: 5000 },
    ]);
    setError(null);
  };

  const handleAddMilestone = () => {
    const last = ladder[ladder.length - 1];
    const nextViews = last ? last.views * 2 : 10000;
    const nextPayout = last ? last.payout * 2 : 500;
    setLadder([...ladder, { views: nextViews, payout: nextPayout }]);
  };

  const handleRemoveMilestone = (index: number) => {
    if (ladder.length <= 1) {
      setError('A campaign must have at least one milestone');
      return;
    }
    setLadder(ladder.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (index: number, field: keyof IMilestone, value: number) => {
    const updated = [...ladder];
    updated[index] = { ...updated[index], [field]: value };
    setLadder(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Campaign name is required');
      return;
    }

    if (totalBudget <= 0) {
      setError('Total budget must be greater than ₹0');
      return;
    }

    // Verify milestone ladder ordering
    for (let i = 1; i < ladder.length; i++) {
      if (ladder[i].views <= ladder[i - 1].views) {
        setError(`Milestone ${i + 1} views must be strictly greater than Milestone ${i}`);
        return;
      }
      if (ladder[i].payout <= ladder[i - 1].payout) {
        setError(`Milestone ${i + 1} payout must be strictly greater than Milestone ${i}`);
        return;
      }
    }

    setIsLoading(true);
    try {
      const res = await api.post('/campaigns', {
        name: name.trim(),
        platform,
        totalBudget,
        milestoneLadder: ladder,
      });

      if (res.success) {
        resetForm();
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create campaign');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    name,
    setName,
    platform,
    setPlatform,
    totalBudget,
    setTotalBudget,
    ladder,
    error,
    isLoading,
    handleAddMilestone,
    handleRemoveMilestone,
    handleMilestoneChange,
    handleSubmit,
    resetForm,
  };
}
