import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPatterns, triggerPatternDiscovery } from '../api/patterns';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ProvenanceChain } from '../components/ui/ProvenanceChain';
import { FlowButton } from '../components/ui/FlowButton';
import { Grid, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Patterns: React.FC = () => {
  const queryClient = useQueryClient();
  const [discovering, setDiscovering] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const { data: patterns, isLoading, isError, error } = useQuery({
    queryKey: ['patterns'],
    queryFn: fetchPatterns,
  });

  const triggerMutation = useMutation({
    mutationFn: triggerPatternDiscovery,
    onMutate: () => {
      setDiscovering(true);
      setMsg(null);
    },
    onSuccess: (res) => {
      setMsg(res.message || `Discovered ${res.patterns_count} new patterns.`);
      queryClient.invalidateQueries({ queryKey: ['patterns'] });
      queryClient.invalidateQueries({ queryKey: ['impact-metrics'] });
    },
    onSettled: () => {
      setDiscovering(false);
    },
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2E31] pb-4 font-mono">
        <div>
          <h2 className="text-xl font-bold text-[#F5F7F8] flex items-center gap-2">
            <Grid className="w-5 h-5 text-[#00CFFF]" /> DISCOVERED PATTERNS & INSIGHTS
          </h2>
          <p className="text-xs text-[#9CA3A8] font-sans mt-0.5">
            Density-based clustering synthesizes recurring failure conditions into actionable scientific directives.
          </p>
        </div>

        {/* FlowButton integration */}
        <FlowButton
          onClick={() => triggerMutation.mutate()}
          disabled={discovering}
          text={discovering ? "Analyzing Clusters..." : "Trigger Pattern Discovery"}
        />
      </div>

      {/* Hero Inquiry Box */}
      <div className="p-5 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-2 font-mono">
        <span className="text-[10px] text-[#10B981] uppercase tracking-wider font-bold block">
          PRIMARY RESEARCH INQUIRY:
        </span>
        <h3 className="text-lg font-bold text-[#F5F7F8]">"WHAT HAS RESONA LEARNED?"</h3>
        <p className="text-xs text-[#9CA3A8] font-sans leading-relaxed">
          Patterns emerge when multiple independent experiments exhibit similar outcomes under overlapping parameter regions. High confidence patterns generate candidate directives for future laboratory decisions.
        </p>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-resona-success-bg border border-resona-success/30 text-xs text-resona-success flex items-center gap-2 font-sans font-mono">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {msg}
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-[#697177] font-mono">Loading pattern repository...</div>
      ) : isError ? (
        <div className="p-12 text-center text-resona-failure font-mono">
          Error loading patterns: {error instanceof Error ? error.message : 'Backend unreachable'}
        </div>
      ) : !patterns || patterns.length === 0 ? (
        <div className="p-12 border border-dashed border-[#2A2E31] rounded-xl text-center space-y-2 text-[#9CA3A8] font-sans">
          <p>No discovered patterns available in current dataset.</p>
          <p className="text-[11px] text-[#697177] font-mono">Click "Trigger Pattern Discovery" to scan recent experiment runs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 font-mono text-xs">
          {patterns.map((pat) => (
            <div key={pat.id} className="p-6 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-4">
              <div className="flex items-start justify-between border-b border-[#2A2E31] pb-3">
                <div>
                  <span className="text-[10px] text-[#697177] uppercase tracking-wider block font-semibold">Cluster Identification</span>
                  <h3 className="text-base font-bold text-[#F5F7F8] mt-0.5">{pat.cluster_name}</h3>
                </div>
                <StatusBadge status="active" label={`${Math.round(pat.confidence * 100)}% Confidence`} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-lg bg-[#1A1D1F] border border-[#2A2E31]">
                  <span className="text-[10px] text-[#697177] uppercase block font-semibold">Algorithm</span>
                  <span className="text-xs font-semibold text-[#F5F7F8]">{pat.algorithm}</span>
                </div>
                <div className="p-3.5 rounded-lg bg-[#1A1D1F] border border-[#2A2E31]">
                  <span className="text-[10px] text-[#697177] uppercase block font-semibold">Supporting Experiments</span>
                  <span className="text-xs font-bold text-[#10B981]">{pat.supporting_experiments_count} Runs</span>
                </div>
                <div className="p-3.5 rounded-lg bg-[#1A1D1F] border border-[#2A2E31]">
                  <span className="text-[10px] text-[#697177] uppercase block font-semibold">Pattern Record ID</span>
                  <span className="text-[10px] text-[#F5F7F8]">{pat.id}</span>
                </div>
              </div>

              {/* Lineage Trace */}
              <ProvenanceChain
                experimentId={pat.supporting_experiment_ids?.[0]}
                experimentName={`Supporting Run (${pat.supporting_experiment_ids?.[0] || 'exp_01'})`}
                observationText="Parameter threshold density cluster"
                memoryId="mem_retained"
                patternName={pat.cluster_name}
                directiveText="Parameter constraint directive candidate"
              />

              {pat.supporting_experiment_ids && pat.supporting_experiment_ids.length > 0 && (
                <div className="pt-3 border-t border-[#2A2E31] space-y-2">
                  <span className="text-[11px] font-semibold text-[#9CA3A8] uppercase tracking-wider block">
                    All Supporting Experiment Records:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {pat.supporting_experiment_ids.map((expId) => (
                      <Link
                        key={expId}
                        to={`/experiments/${expId}`}
                        className="px-3 py-1 rounded-md bg-[#1A1D1F] border border-[#2A2E31] text-[11px] text-[#F5F7F8] hover:text-[#00CFFF] transition-colors font-mono"
                      >
                        {expId}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
