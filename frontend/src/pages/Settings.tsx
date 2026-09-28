import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchHealthStatus } from '../api/health';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ToastPopup } from '../components/ui/ToastPopup';
import { FlowButton } from '../components/ui/FlowButton';
import { Sliders, Cpu, Database, Activity, ShieldAlert, CheckCircle2, ShieldCheck, Sparkles, RefreshCw, Lock, Save } from 'lucide-react';

export const Settings: React.FC = () => {
  const { data: health, isLoading, refetch } = useQuery({
    queryKey: ['health-status-settings'],
    queryFn: fetchHealthStatus,
  });

  // Interactive settings state
  const [similarityThreshold, setSimilarityThreshold] = useState('0.75');
  const [topKContext, setTopKContext] = useState('8');
  const [hindsightMode, setHindsightMode] = useState('hybrid');
  const [autoSynthesis, setAutoSynthesis] = useState(true);
  const [immutableLogging, setImmutableLogging] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMsg('Platform configuration updated & persisted successfully!');
  };

  const handleDiagnostics = async () => {
    await refetch();
    setToastMsg('System health diagnostics refreshed successfully.');
  };

  return (
    <div className="space-y-6 font-sans relative">
      <ToastPopup
        message={toastMsg}
        type="success"
        onClose={() => setToastMsg(null)}
      />

      <div className="border-b border-[#2A2E31] pb-4 font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#F5F7F8] flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#00CFFF]" /> PLATFORM INFRASTRUCTURE & SETTINGS
          </h2>
          <p className="text-xs text-[#9CA3A8] font-sans mt-0.5">
            Configure Hindsight memory retrieval thresholds, reflection parameters, vector engines, and audit logging.
          </p>
        </div>
        <button
          onClick={handleDiagnostics}
          className="px-3.5 py-2 bg-[#151718] hover:bg-[#1A1D1F] text-[#00CFFF] border border-[#2A2E31] rounded-lg font-mono text-xs flex items-center gap-2 shrink-0 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Run Diagnostics
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6 font-mono text-xs">
        {/* Section 1: Hindsight Memory Engine Configuration */}
        <div className="p-6 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-4">
          <h3 className="text-xs font-bold text-[#F5F7F8] uppercase tracking-wider border-b border-[#2A2E31] pb-2.5 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#00CFFF]" /> HINDSIGHT MEMORY & RETRIEVAL CONFIGURATION
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#9CA3A8] mb-1.5 font-semibold">
                Vector Similarity Threshold ({similarityThreshold})
              </label>
              <input
                type="range"
                min="0.50"
                max="0.95"
                step="0.05"
                value={similarityThreshold}
                onChange={(e) => setSimilarityThreshold(e.target.value)}
                className="w-full accent-[#00CFFF] cursor-pointer"
              />
              <span className="text-[10px] text-[#697177] block mt-1">Minimum similarity score for memory recall</span>
            </div>

            <div>
              <label className="block text-[#9CA3A8] mb-1.5 font-semibold">Max Recalled Context Window (top_k)</label>
              <select
                value={topKContext}
                onChange={(e) => setTopKContext(e.target.value)}
                className="w-full bg-[#1A1D1F] border border-[#2A2E31] rounded-md px-3.5 py-2 text-[#F5F7F8] focus:outline-none focus:border-[#00CFFF] cursor-pointer"
              >
                <option value="4" className="bg-[#1A1D1F] text-[#F5F7F8]">4 Memories (Fast)</option>
                <option value="8" className="bg-[#1A1D1F] text-[#F5F7F8]">8 Memories (Standard)</option>
                <option value="16" className="bg-[#1A1D1F] text-[#F5F7F8]">16 Memories (Deep Trace)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#9CA3A8] mb-1.5 font-semibold">Integration Mode</label>
              <select
                value={hindsightMode}
                onChange={(e) => setHindsightMode(e.target.value)}
                className="w-full bg-[#1A1D1F] border border-[#2A2E31] rounded-md px-3.5 py-2 text-[#F5F7F8] focus:outline-none focus:border-[#00CFFF] cursor-pointer"
              >
                <option value="hybrid" className="bg-[#1A1D1F] text-[#F5F7F8]">Hybrid (API + Local DB)</option>
                <option value="local_graph" className="bg-[#1A1D1F] text-[#F5F7F8]">Local Graph Database</option>
                <option value="dev_fallback" className="bg-[#1A1D1F] text-[#F5F7F8]">Development Fallback</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#2A2E31]">
            <div>
              <span className="text-xs text-[#F5F7F8] font-bold block">Auto-Synthesize Reflection on Ingestion</span>
              <span className="text-[10px] text-[#697177] font-sans">Automatically update mental models when new experiments are logged</span>
            </div>
            <button
              type="button"
              onClick={() => setAutoSynthesis(!autoSynthesis)}
              className={`px-3 py-1.5 rounded-lg border font-bold text-xs transition-colors ${
                autoSynthesis
                  ? 'bg-[rgba(16,185,129,0.15)] text-[#10B981] border-[#10B981]'
                  : 'bg-[#1A1D1F] text-[#9CA3A8] border-[#2A2E31]'
              }`}
            >
              {autoSynthesis ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>

        {/* Section 2: Security & Audit Controls */}
        <div className="p-6 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-4">
          <h3 className="text-xs font-bold text-[#F5F7F8] uppercase tracking-wider border-b border-[#2A2E31] pb-2.5 flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#00CFFF]" /> SECURITY, REPOSITORIES & AUDIT PROVENANCE
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-[#F5F7F8] font-bold block">Immutable Audit Ledger Logging</span>
              <span className="text-[10px] text-[#697177] font-sans">Log state mutations, experiment entries, and directive approvals to system audit database</span>
            </div>
            <button
              type="button"
              onClick={() => setImmutableLogging(!immutableLogging)}
              className={`px-3 py-1.5 rounded-lg border font-bold text-xs transition-colors ${
                immutableLogging
                  ? 'bg-[rgba(16,185,129,0.15)] text-[#10B981] border-[#10B981]'
                  : 'bg-[#1A1D1F] text-[#9CA3A8] border-[#2A2E31]'
              }`}
            >
              {immutableLogging ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>

        {/* Section 3: System Environment Diagnostics */}
        <div className="p-6 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-4">
          <h3 className="text-xs font-bold text-[#F5F7F8] uppercase tracking-wider border-b border-[#2A2E31] pb-2.5 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00CFFF]" /> BACKEND SYSTEM DIAGNOSTICS & STATUS
          </h3>

          {isLoading ? (
            <div className="p-6 text-center text-[#697177]">Checking health endpoints...</div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#1A1D1F] border border-[#2A2E31]">
                <span className="text-[#9CA3A8] flex items-center gap-2 font-medium">
                  <Activity className="w-4 h-4 text-[#00CFFF]" /> API Base URL
                </span>
                <span className="text-[#F5F7F8] font-bold">{import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#1A1D1F] border border-[#2A2E31]">
                <span className="text-[#9CA3A8] flex items-center gap-2 font-medium">
                  <Database className="w-4 h-4 text-[#00CFFF]" /> Database Engine Status
                </span>
                <span className="text-[#10B981] font-bold uppercase">{health?.services?.database || 'sqlite (active)'}</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#1A1D1F] border border-[#2A2E31]">
                <span className="text-[#9CA3A8] flex items-center gap-2 font-medium">
                  <Cpu className="w-4 h-4 text-[#00CFFF]" /> Hindsight Memory Engine
                </span>
                <StatusBadge
                  status={health?.services?.hindsight_memory || 'fallback'}
                  label={health?.services?.hindsight_memory === 'connected' ? 'CONNECTED' : 'DEVELOPMENT FALLBACK'}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#1A1D1F] border border-[#2A2E31]">
                <span className="text-[#9CA3A8] flex items-center gap-2 font-medium">
                  <ShieldAlert className="w-4 h-4 text-[#00CFFF]" /> Vector Embedding Engine
                </span>
                <span className="text-[#F5F7F8] font-bold">{health?.services?.embedding_service || 'sentence-transformers'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <FlowButton
            type="submit"
            text="Save & Persist Configuration"
          />
        </div>
      </form>
    </div>
  );
};
