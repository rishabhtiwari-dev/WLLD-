'use client';

import React from 'react';
import { useSimulateView } from '../../hooks/useSimulateView';
import { ISubmission } from '../../types';
import { AlertTriangle, CheckCircle2, X, Zap } from 'lucide-react';

interface Props {
  submission: ISubmission;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SimulateViewModal({
  submission,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const { newViews, setNewViews, isLoading, resultMessage, handleSimulate } = useSimulateView({
    submission,
    onSuccess,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Simulate Platform Views</h3>
              <p className="text-xs text-slate-500">
                Test milestone calculation, budget capping, &amp; spike detection
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

        {/* Current State Summary */}
        <div className="my-5 p-4 bg-slate-50 rounded-xl grid grid-cols-2 gap-4 border border-slate-200/60 text-xs">
          <div>
            <span className="text-slate-500 block">Current Views:</span>
            <span className="text-base font-bold text-slate-800">
              {submission.currentViews.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Current Payout Earned:</span>
            <span className="text-base font-bold text-emerald-600">
              ₹{submission.currentPayout.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Quick Simulation Presets */}
        <div className="space-y-3 mb-5">
          <label className="text-xs font-semibold text-slate-700 block">Quick Preset Jumps:</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => {
                const v = submission.currentViews + 10000;
                setNewViews(v);
                handleSimulate(v);
              }}
              disabled={isLoading}
              className="px-2.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50/50 transition disabled:opacity-50"
            >
              +10K Views
            </button>
            <button
              type="button"
              onClick={() => {
                const v = submission.currentViews + 50000;
                setNewViews(v);
                handleSimulate(v);
              }}
              disabled={isLoading}
              className="px-2.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50/50 transition disabled:opacity-50"
            >
              +50K Views
            </button>
            <button
              type="button"
              onClick={() => {
                const v = submission.currentViews + 100000;
                setNewViews(v);
                handleSimulate(v);
              }}
              disabled={isLoading}
              className="px-2.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50/50 transition disabled:opacity-50"
            >
              +100K Views
            </button>
            <button
              type="button"
              onClick={() => {
                const v = submission.currentViews + 250000;
                setNewViews(v);
                handleSimulate(v);
              }}
              disabled={isLoading}
              className="px-2.5 py-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-300 rounded-lg hover:bg-amber-100 transition disabled:opacity-50"
              title="Triggers Spike Anomaly Detector"
            >
              ⚡ Spike (+250K)
            </button>
          </div>
        </div>

        {/* Custom Input */}
        <div className="space-y-2 mb-5">
          <label className="text-xs font-semibold text-slate-700 block">
            Or Set Exact Total Views:
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              value={newViews}
              onChange={(e) => setNewViews(Number(e.target.value))}
              className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. 75000"
            />
            <button
              type="button"
              onClick={() => handleSimulate(newViews)}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 shadow-sm transition"
            >
              {isLoading ? 'Updating...' : 'Update Views'}
            </button>
          </div>
        </div>

        {/* Result Message Box */}
        {resultMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
              resultMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : resultMessage.type === 'warning'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {resultMessage.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            )}
            {resultMessage.type === 'warning' && (
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            )}
            {resultMessage.type === 'error' && <X className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />}
            <div>
              <p className="font-semibold">{resultMessage.text}</p>
            </div>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

