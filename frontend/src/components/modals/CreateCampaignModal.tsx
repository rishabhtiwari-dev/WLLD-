'use client';

import React from 'react';
import { useCreateCampaign } from '../../hooks/useCreateCampaign';
import { PlatformType } from '../../types';
import { Plus, Trash2, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCampaignModal({ isOpen, onClose, onSuccess }: Props) {
  const {
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
  } = useCreateCampaign({ onSuccess, onClose });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Create New Campaign</h3>
            <p className="text-xs text-slate-500">
              Define campaign budget, target platform, and creator milestone ladder
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Campaign Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Summer Viral Video Hype"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as PlatformType)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="Instagram">Instagram</option>
                <option value="YouTube">YouTube</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Total Budget (₹)
              </label>
              <input
                type="number"
                min={1}
                required
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Milestone Ladder Editor */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Milestone Ladder (Views &rarr; Payout)
              </label>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-2 py-1 rounded"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Milestone
              </button>
            </div>

            <div className="space-y-2">
              {ladder.map((m, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-6 text-xs font-bold text-slate-400 text-center">
                    #{idx + 1}
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min={1}
                        required
                        value={m.views}
                        onChange={(e) =>
                          handleMilestoneChange(idx, 'views', Number(e.target.value))
                        }
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="View threshold"
                      />
                      <span className="absolute right-2.5 top-2 text-[10px] text-slate-400">
                        views
                      </span>
                    </div>

                    <span className="text-slate-400 text-xs font-bold">&rarr;</span>

                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-2 text-[10px] text-slate-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={0}
                        required
                        value={m.payout}
                        onChange={(e) =>
                          handleMilestoneChange(idx, 'payout', Number(e.target.value))
                        }
                        className="w-full pl-6 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Payout"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                    title="Remove milestone"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
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
              className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 shadow-sm transition"
            >
              {isLoading ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

