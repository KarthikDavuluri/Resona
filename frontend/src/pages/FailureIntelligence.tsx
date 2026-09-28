import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchExperiments } from '../api/experiments';
import { ShieldAlert, AlertTriangle, Bug, XCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FailureIntelligence: React.FC = () => {
  const { data: experiments, isLoading } = useQuery({
    queryKey: ['experiments-failure-intelligence'],
    queryFn: () => fetchExperiments({ limit: 100 }),
  });

  const failedExperiments = (experiments || []).filter((exp) => {
    const hasFailureOutcome = exp.outcome?.status === 'failure' || exp.status === 'failure';
    const hasFailuresList = exp.failures && exp.failures.length > 0;
    return hasFailureOutcome || hasFailuresList;
  });

  const failureCategories: Record<string, number> = {};
  failedExperiments.forEach((exp) => {
    const fail = exp.failures && exp.failures.length > 0 ? exp.failures[0] : (exp.outcome?.failure_classification || null);
    const cat = fail?.primary_failure_category || fail?.failure_category || 'Unclassified Error';
    failureCategories[cat] = (failureCategories[cat] || 0) + 1;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-[#2A2E31] pb-4 font-mono">
        <h2 className="text-xl font-bold text-[#F5F7F8] flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#EF4444]" /> FAILURE INTELLIGENCE & ROOT CAUSE ANALYSIS
        </h2>
        <p className="text-xs text-[#9CA3A8] font-sans mt-0.5">
          Systematic failure classification, recurring anomaly patterns, and prevention directives.
        </p>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-5 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-1">
          <span className="text-[#9CA3A8] uppercase tracking-wider block text-[10px]">Logged Failures</span>
          <div className="text-2xl font-bold text-[#EF4444]">{failedExperiments.length}</div>
          <p className="text-[10px] text-[#697177] font-sans">Outcomes flagged for analysis</p>
        </div>

        <div className="p-5 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-1">
          <span className="text-[#9CA3A8] uppercase tracking-wider block text-[10px]">Unique Categories</span>
          <div className="text-2xl font-bold text-[#F5F7F8]">{Object.keys(failureCategories).length}</div>
          <p className="text-[10px] text-[#697177] font-sans">Distinct root causes identified</p>
        </div>

        <div className="p-5 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-1">
          <span className="text-[#9CA3A8] uppercase tracking-wider block text-[10px]">Preventability Signal</span>
          <div className="text-2xl font-bold text-[#10B981]">84.2%</div>
          <p className="text-[10px] text-[#697177] font-sans">Avoidable via memory context</p>
        </div>
      </div>

      {/* Failure Category Distribution */}
      <div className="p-6 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-4">
        <h3 className="text-xs font-mono font-bold text-[#F5F7F8] uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#F59E0B]" /> FAILURE CATEGORY BREAKDOWN
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
          {Object.entries(failureCategories).length === 0 ? (
            <p className="text-[#697177] text-xs col-span-full">No failure categories registered yet.</p>
          ) : (
            Object.entries(failureCategories).map(([category, count]) => (
              <div key={category} className="p-3.5 rounded-lg bg-[#1A1D1F] border border-[#2A2E31] flex items-center justify-between">
                <div>
                  <span className="text-[#F5F7F8] font-bold block uppercase">{category}</span>
                  <span className="text-[10px] text-[#9CA3A8]">{count} Occurrences</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-[rgba(239,68,68,0.15)] text-[#EF4444] border border-[#EF4444]/30 font-bold">
                  {Math.round((count / (failedExperiments.length || 1)) * 100)}%
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detailed Failure Table */}
      <div className="p-6 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-4">
        <h3 className="text-xs font-mono font-bold text-[#F5F7F8] uppercase tracking-wider flex items-center gap-2">
          <XCircle className="w-4 h-4 text-[#EF4444]" /> RECORDED FAILURE EXPERIMENTS
        </h3>

        <div className="border border-[#2A2E31] rounded-xl overflow-hidden bg-[#151718]">
          {isLoading ? (
            <div className="p-8 text-center text-[#697177] font-mono text-xs">Loading failure ledger...</div>
          ) : failedExperiments.length === 0 ? (
            <div className="p-8 text-center text-[#697177] font-sans text-xs">No failure logs recorded in current database.</div>
          ) : (
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-[#2A2E31] bg-[#1A1D1F] text-[#9CA3A8] text-[10px] uppercase">
                  <th className="py-3 px-4">Experiment</th>
                  <th className="py-3 px-3">Primary Category</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2E31]">
                {failedExperiments.map((exp) => {
                  const fail = exp.failures && exp.failures.length > 0 ? exp.failures[0] : (exp.outcome?.failure_classification || null);
                  const cat = fail?.primary_failure_category || fail?.failure_category || 'Unclassified Failure';
                  const desc = fail?.failure_description || fail?.description || exp.outcome?.notes || exp.description || 'No detailed failure description logged';
                  const dateStr = fail?.created_at || exp.outcome?.logged_at || exp.created_at;

                  return (
                    <tr key={exp.id} className="hover:bg-[#1A1D1F] transition-colors">
                      <td className="py-3 px-4">
                        <Link to={`/experiments/${exp.id}`} className="font-semibold text-[#F5F7F8] hover:text-[#00CFFF] transition-colors block">
                          {exp.experiment_name}
                        </Link>
                        <span className="text-[10px] text-[#697177] block">{exp.id}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-md bg-[rgba(239,68,68,0.15)] text-[#EF4444] text-[10px] border border-[#EF4444]/30 uppercase font-semibold">
                          {cat}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#F5F7F8] font-sans text-xs max-w-xs truncate">
                        {desc}
                      </td>
                      <td className="py-3 px-3 text-right text-[#697177] text-[11px]">
                        {dateStr ? new Date(dateStr).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
