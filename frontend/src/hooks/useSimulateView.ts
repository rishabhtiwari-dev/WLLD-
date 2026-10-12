import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { ISubmission } from '../types';

interface UseSimulateViewProps {
  submission: ISubmission;
  onSuccess: () => void;
}

export function useSimulateView({ submission, onSuccess }: UseSimulateViewProps) {
  const [newViews, setNewViews] = useState<number>(submission.currentViews + 10000);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<{
    type: 'success' | 'warning' | 'error';
    text: string;
    details?: any;
  } | null>(null);

  useEffect(() => {
    setNewViews(submission.currentViews + 10000);
    setResultMessage(null);
  }, [submission]);

  const handleSimulate = async (targetViews: number) => {
    setIsLoading(true);
    setResultMessage(null);

    try {
      const res = await api.patch(`/submissions/${submission._id}/views`, {
        views: targetViews,
      });

      if (res.success && res.data) {
        const { payoutIncrement, budgetExhausted, partialPayout, flaggedForSpike, spikeReason } =
          res.data;

        let type: 'success' | 'warning' = 'success';
        let message = `Views updated to ${targetViews.toLocaleString()}.`;

        if (payoutIncrement > 0) {
          message += ` Awarded +₹${payoutIncrement.toLocaleString()}!`;
        } else {
          message += ` No incremental payout (milestone already reached or unchanged).`;
        }

        if (partialPayout) {
          type = 'warning';
          message += ` ⚠️ Payout was capped by campaign remaining budget.`;
        } else if (budgetExhausted) {
          type = 'warning';
          message += ` ⚠️ Campaign budget is now 100% exhausted.`;
        }

        if (flaggedForSpike) {
          type = 'warning';
          message += ` 🚨 View Spike Detected: ${spikeReason}`;
        }

        setResultMessage({
          type,
          text: message,
          details: res.data,
        });

        onSuccess();
      }
    } catch (err: any) {
      setResultMessage({
        type: 'error',
        text: err.message || 'Failed to update views',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    newViews,
    setNewViews,
    isLoading,
    resultMessage,
    handleSimulate,
  };
}
