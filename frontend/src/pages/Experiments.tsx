import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchExperiments } from '../api/experiments';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Plus, Filter, TestTube2 } from 'lucide-react';

export const Experiments: React.FC = () => {
  const [searchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') || '';

  const [search, setSearch] = useState(searchFromUrl);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: experiments, isLoading, isError, error } = useQuery({
    queryKey: ['experiments', { search }],
    queryFn: () => fetchExperiments({ search: search || undefined }),
  });

  const filteredExperiments = (experiments || []).filter((exp) => {
    if (statusFilter === 'all') return true;
    const latestOutcomeStatus = exp.outcomes && exp.outcomes.length > 0 
      ? exp.outcomes[0].status 
      : exp.status;
    return latestOutcomeStatus?.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2E31] pb-4 font-mono">
        <div>
          <h2 className="text-xl font-bold text-[#F5F7F8] flex items-center gap-2">
            <TestTube2 className="w-5 h-5 text-[#00CFFF]" /> EXPERIMENT WORKSPACE
          </h2>
          <p className="text-xs text-[#9CA3A8] font-sans mt-0.5">
            Browse, filter, and inspect institutional experiment history.
          </p>
        </div>
        <Link
          to="/experiments/new"
          className="px-4 py-2 bg-[#1A1D1F] hover:bg-[#2A2E31] text-[#F5F7F8] font-semibold text-xs rounded-lg border border-[#2A2E31] inline-flex items-center gap-2 font-mono shrink-0 transition-colors"
        >
          <Plus className="w-4 h-4 text-[#00CFFF]" /> Log New Experiment
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-[#151718] border border-[#2A2E31] flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#697177]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, catalyst, solvent..."
            className="w-full bg-[#1A1D1F] border border-[#2A2E31] rounded-md pl-9 pr-3 py-2 text-[#F5F7F8] placeholder-[#697177] focus:outline-none focus:border-[#00CFFF]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#9CA3A8]" />
            <span className="text-[#9CA3A8]">Outcome:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#1A1D1F] border border-[#2A2E31] rounded-md px-3 py-1.5 text-[#F5F7F8] focus:outline-none focus:border-[#00CFFF] font-mono cursor-pointer"
            >
              <option value="all" className="bg-[#1A1D1F] text-[#F5F7F8]">All Outcomes</option>
              <option value="success" className="bg-[#1A1D1F] text-[#F5F7F8]">Success</option>
              <option value="completed" className="bg-[#1A1D1F] text-[#F5F7F8]">Completed</option>
              <option value="failure" className="bg-[#1A1D1F] text-[#F5F7F8]">Failure</option>
              <option value="partial" className="bg-[#1A1D1F] text-[#F5F7F8]">Partial</option>
              <option value="proposed" className="bg-[#1A1D1F] text-[#F5F7F8]">Proposed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-[#2A2E31] rounded-xl overflow-hidden bg-[#151718] font-mono text-xs">
        {isLoading ? (
          <div className="p-12 text-center text-[#697177]">Loading experiment database...</div>
        ) : isError ? (
          <div className="p-12 text-center text-resona-failure">
            Error retrieving experiments: {error instanceof Error ? error.message : 'Backend unreachable'}
          </div>
        ) : filteredExperiments.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-xs text-[#9CA3A8]">No experiments recorded matching criteria.</p>
            <p className="text-[11px] text-[#697177] font-sans">
              Log a real reaction or adjust your search filter to see historical records.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2A2E31] bg-[#111314] text-[#9CA3A8] text-[10px] uppercase">
                <th className="py-3 px-4">Experiment ID & Name</th>
                <th className="py-3 px-3">Parameters Overview</th>
                <th className="py-3 px-3">Source Type</th>
                <th className="py-3 px-3">Outcome</th>
                <th className="py-3 px-3 text-right">Yield</th>
                <th className="py-3 px-4 text-right">Logged At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2E31]">
              {filteredExperiments.map((exp) => {
                const latestOutcome = exp.outcomes && exp.outcomes.length > 0 ? exp.outcomes[0] : null;
                const statusToShow = latestOutcome?.status || exp.status || 'pending';
                const paramsSummary = (exp.parameters || [])
                  .slice(0, 3)
                  .map((p) => `${p.parameter_name}: ${p.parameter_value}`)
                  .join(' | ');

                return (
                  <tr key={exp.id} className="hover:bg-[#1A1D1F] transition-colors">
                    <td className="py-3 px-4">
                      <Link to={`/experiments/${exp.id}`} className="font-semibold text-[#F5F7F8] hover:text-[#00CFFF] transition-colors block">
                        {exp.experiment_name}
                      </Link>
                      <span className="text-[10px] text-[#697177] block">{exp.id}</span>
                    </td>
                    <td className="py-3 px-3 text-[#9CA3A8] max-w-[280px] truncate" title={paramsSummary}>
                      {paramsSummary || 'No parameters logged'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#1A1D1F] text-[#F5F7F8] text-[10px] border border-[#2A2E31]">
                        {exp.source_type}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={statusToShow} />
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-[#F5F7F8]">
                      {latestOutcome?.yield_percentage != null ? `${latestOutcome.yield_percentage}%` : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right text-[#697177] text-[11px]">
                      {new Date(exp.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
