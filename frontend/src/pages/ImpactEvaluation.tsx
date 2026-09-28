import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchImpactMetrics } from '../api/metrics';
import { StatusBadge } from '../components/ui/StatusBadge';
import { BarChart3, Cpu, ShieldCheck, Zap, TrendingUp } from 'lucide-react';

export const ImpactEvaluation: React.FC = () => {
  const { data: metrics, isLoading, isError, error } = useQuery({
    queryKey: ['impact-metrics'],
    queryFn: fetchImpactMetrics,
  });

  const ablation = metrics?.ablation_study;
  const summary = metrics?.summary;

  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-[#2A2E31] pb-4 font-mono">
        <h2 className="text-xl font-bold text-[#F5F7F8] flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#00CFFF]" /> IMPACT & MEMORY ABLATION STUDY
        </h2>
        <p className="text-xs text-[#9CA3A8] font-sans mt-0.5">
          Quantitative benchmarking comparing decision-support relevance, confidence, and failure avoidance with Memory OFF versus RESONA Memory ON.
        </p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center font-mono text-xs text-[#697177]">Evaluating impact metrics...</div>
      ) : isError || !metrics ? (
        <div className="p-12 text-center font-mono text-xs text-[#EF4444]">
          Error loading impact metrics: {error instanceof Error ? error.message : 'Backend unreachable'}
        </div>
      ) : (
        <div className="space-y-6 font-mono text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Memory OFF Card */}
            <div className="p-6 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-4">
              <div className="flex items-center justify-between border-b border-[#2A2E31] pb-3">
                <span className="text-xs font-bold text-[#9CA3A8] uppercase tracking-wider">MEMORY OFF (Baseline)</span>
                <span className="px-2.5 py-0.5 rounded-md bg-[#1A1D1F] border border-[#2A2E31] text-[#697177] text-[10px]">
                  Exact SQL Search
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1A1D1F] border border-[#2A2E31]">
                  <span className="text-[#9CA3A8]">Retrieved Evidence Signal:</span>
                  <span className="text-[#F5F7F8] font-semibold">{ablation?.without_memory_mode?.retrieved_evidence_signal}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1A1D1F] border border-[#2A2E31]">
                  <span className="text-[#9CA3A8]">Failure Pattern Detection:</span>
                  <span className="text-[#EF4444] font-semibold">{ablation?.without_memory_mode?.failure_pattern_detection}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1A1D1F] border border-[#2A2E31]">
                  <span className="text-[#9CA3A8]">Recommendation Relevance:</span>
                  <span className="text-[#F5F7F8] font-semibold">
                    {Math.round((ablation?.without_memory_mode?.recommendation_relevance_score || 0) * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1A1D1F] border border-[#2A2E31]">
                  <span className="text-[#9CA3A8]">Average Confidence Score:</span>
                  <span className="text-[#F5F7F8] font-semibold">
                    {Math.round((ablation?.without_memory_mode?.average_confidence_score || 0) * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#1A1D1F] border border-[#2A2E31]">
                  <span className="text-[#9CA3A8]">Failure Avoidance Rate:</span>
                  <span className="text-[#9CA3A8] font-bold">{ablation?.without_memory_mode?.repeated_failure_avoidance_rate}</span>
                </div>
              </div>
            </div>

            {/* Memory ON Card */}
            <div className="p-6 rounded-xl bg-[#151718] border border-[#00CFFF]/40 space-y-4">
              <div className="flex items-center justify-between border-b border-[#2A2E31] pb-3">
                <span className="text-xs font-bold text-[#10B981] uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#10B981]" /> RESONA MEMORY ON (Hindsight)
                </span>
                <StatusBadge status="connected" label="Hybrid Memory ON" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1A1D1F] border border-[#2A2E31]">
                  <span className="text-[#9CA3A8]">Retrieved Evidence Signal:</span>
                  <span className="text-[#10B981] font-semibold">{ablation?.with_resona_memory_mode?.retrieved_evidence_signal}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1A1D1F] border border-[#2A2E31]">
                  <span className="text-[#9CA3A8]">Failure Pattern Detection:</span>
                  <span className="text-[#10B981] font-semibold">{ablation?.with_resona_memory_mode?.failure_pattern_detection}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1A1D1F] border border-[#2A2E31]">
                  <span className="text-[#9CA3A8]">Recommendation Relevance:</span>
                  <span className="text-[#10B981] font-semibold">
                    {Math.round((ablation?.with_resona_memory_mode?.recommendation_relevance_score || 0) * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1A1D1F] border border-[#2A2E31]">
                  <span className="text-[#9CA3A8]">Average Confidence Score:</span>
                  <span className="text-[#10B981] font-semibold">
                    {Math.round((ablation?.with_resona_memory_mode?.average_confidence_score || 0) * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#1A1D1F] border border-[#10B981]/30">
                  <span className="text-[#9CA3A8]">Failure Avoidance Rate:</span>
                  <span className="text-[#10B981] font-bold text-sm">{ablation?.with_resona_memory_mode?.repeated_failure_avoidance_rate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delta Gains Bar */}
          <div className="p-6 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-4">
            <h3 className="text-xs font-bold text-[#F5F7F8] uppercase tracking-wider flex items-center gap-2 border-b border-[#2A2E31] pb-2.5">
              <ShieldCheck className="w-4 h-4 text-[#00CFFF]" /> QUANTIFIED MEMORY DELTA GAINS
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-[#1A1D1F] border border-[#2A2E31] space-y-1">
                <span className="text-[10px] text-[#697177] uppercase font-semibold">Relevance Gain</span>
                <div className="text-2xl font-bold text-[#10B981]">{ablation?.memory_improvement_delta?.relevance_gain}</div>
              </div>
              <div className="p-4 rounded-xl bg-[#1A1D1F] border border-[#2A2E31] space-y-1">
                <span className="text-[10px] text-[#697177] uppercase font-semibold">Confidence Gain</span>
                <div className="text-2xl font-bold text-[#10B981]">{ablation?.memory_improvement_delta?.confidence_gain}</div>
              </div>
              <div className="p-4 rounded-xl bg-[#1A1D1F] border border-[#2A2E31] space-y-1">
                <span className="text-[10px] text-[#697177] uppercase font-semibold">Failure Avoidance Improvement</span>
                <div className="text-2xl font-bold text-[#10B981]">{ablation?.memory_improvement_delta?.failure_avoidance_improvement}</div>
              </div>
            </div>
          </div>

          {/* Summary Table */}
          {summary && (
            <div className="p-6 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-3">
              <h3 className="text-xs font-bold text-[#F5F7F8] uppercase tracking-wider border-b border-[#2A2E31] pb-2.5">
                ACCUMULATED PLATFORM METRICS
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-[#1A1D1F] border border-[#2A2E31]">
                  <span className="text-[10px] text-[#697177] block font-semibold">Total Experiments:</span>
                  <span className="font-bold text-[#F5F7F8] text-sm">{summary.total_accumulated_experiments}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#1A1D1F] border border-[#2A2E31]">
                  <span className="text-[10px] text-[#697177] block font-semibold">Logged Outcomes:</span>
                  <span className="font-bold text-[#F5F7F8] text-sm">{summary.total_logged_outcomes}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#1A1D1F] border border-[#2A2E31]">
                  <span className="text-[10px] text-[#697177] block font-semibold">Discovered Patterns:</span>
                  <span className="font-bold text-[#F5F7F8] text-sm">{summary.total_discovered_patterns}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#1A1D1F] border border-[#2A2E31]">
                  <span className="text-[10px] text-[#697177] block font-semibold">Candidate Directives:</span>
                  <span className="font-bold text-[#F5F7F8] text-sm">{summary.total_candidate_directives}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
