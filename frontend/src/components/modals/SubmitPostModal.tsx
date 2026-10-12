'use client';

import React from 'react';
import { useSubmitPost } from '../../hooks/useSubmitPost';
import { ICampaign } from '../../types';
import { X, Send, Link as LinkIcon, Instagram, Youtube } from 'lucide-react';

interface Props {
  campaign: ICampaign | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SubmitPostModal({ campaign, isOpen, onClose, onSuccess }: Props) {
  const { postUrl, setPostUrl, error, isLoading, generateSampleLink, handleSubmit } =
    useSubmitPost({
      campaign,
      onSuccess,
      onClose,
    });

  if (!isOpen || !campaign) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Submit Post</h3>
              <p className="text-xs text-slate-500">
                Link your post to start tracking views and qualifying for milestone payouts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Campaign Info Card */}
        <div className="my-4 p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-900 text-sm">{campaign.name}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold bg-white border text-slate-600">
              {campaign.platform === 'Instagram' ? (
                <Instagram className="w-3 h-3 text-pink-600" />
              ) : (
                <Youtube className="w-3 h-3 text-red-600" />
              )}
              {campaign.platform}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-500">
            <span>Remaining Campaign Budget:</span>
            <span className="font-bold text-emerald-600">
              ₹{((campaign.remainingBudget ?? Math.max(0, (campaign.totalBudget || 0) - (campaign.spentBudget || 0))) || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Public Post URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <LinkIcon className="w-4 h-4" />
              </div>
              <input
                type="url"
                required
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                placeholder={
                  campaign.platform === 'Instagram'
                    ? 'https://www.instagram.com/p/C_abc123/'
                    : 'https://www.youtube.com/watch?v=xyz123'
                }
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Quick preset links for demo */}
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span>Demo sample:</span>
            <button
              type="button"
              onClick={generateSampleLink}
              className="text-emerald-600 underline font-medium hover:text-emerald-700"
            >
              Generate Test Link
            </button>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 shadow-sm transition"
            >
              {isLoading ? 'Submitting...' : 'Submit Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

