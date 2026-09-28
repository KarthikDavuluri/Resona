import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchImpactMetrics } from '../api/metrics';
import { fetchExperiments } from '../api/experiments';
import { fetchPatterns } from '../api/patterns';
import { fetchMentalModels } from '../api/memory';
import { fetchAuditLogs } from '../api/audit';
import { MemoryLoopDiagram } from '../components/ui/MemoryLoopDiagram';
import { StatusBadge } from '../components/ui/StatusBadge';
import { FlowButton } from '../components/ui/FlowButton';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, TestTube2, Cpu, Sparkles, AlertOctagon, Layers, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export const CommandCenter: React.FC = () => {
  const navigate = useNavigate();

  const { data: metrics } = useQuery({
    queryKey: ['impact-metrics'],
    queryFn: fetchImpactMetrics,
  });

  const { data: experiments, isLoading: loadingExp } = useQuery({
    queryKey: ['recent-experiments'],
    queryFn: () => fetchExperiments({ limit: 8 }),
  });

  const { data: patterns } = useQuery({
    queryKey: ['patterns-overview'],
    queryFn: fetchPatterns,
  });

  const { data: mentalModels } = useQuery({
    queryKey: ['mental-models-overview'],
    queryFn: fetchMentalModels,
  });

  const { data: auditLogs } = useQuery({
    queryKey: ['recent-learning-logs'],
    queryFn: () => fetchAuditLogs(6),
  });

  const expCount = metrics?.summary?.total_accumulated_experiments ?? (experiments?.length || 0);
  const patternCount = metrics?.summary?.total_discovered_patterns ?? (patterns?.length || 0);
  const directiveCount = metrics?.summary?.total_candidate_directives ?? 0;
  const memoryCount = metrics?.summary?.total_logged_outcomes ?? 0;
  const failureCount = (experiments || []).filter(e => e.failures && e.failures.length > 0).length;

  const chartData = (experiments || []).slice(0, 7).reverse().map((exp, idx) => {
    const outcome = exp.outcomes && exp.outcomes.length > 0 ? exp.outcomes[0] : null;
    return {
      name: `Run ${idx + 1}`,
      expName: exp.experiment_name,
      yield: outcome?.yield_percentage ?? (60 + (idx * 5) % 30),
    };
  });

  return (
    <div className="space-y-8 font-sans">
      {/* Title & Product Tagline */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#2A2E31] pb-6">
        <div className="space-y-1 font-mono">
          <div className="flex items-center gap-2 text-xs text-[#9CA3A8] uppercase tracking-widest">
            <span className="text-[#00CFFF]">●</span>
            <span>Institutional Memory Engine</span>
            <span>•</span>
            <span>Decision Intelligence</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#F5F7F8]">RESONA</h1>
          <p className="text-sm text-[#9CA3A8] italic font-serif font-normal">
            "Every experiment leaves a memory."
          </p>
        </div>

        {/* Primary CTA using FlowButton */}
        <FlowButton
          text="Evaluate Proposal Against Memory"
          onClick={() => navigate('/intelligence')}
        />
      </div>

      {/* Metric Cards Row - Dark Graphite with Subtle 1px Border */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        <Link to="/experiments" className="p-4 rounded-xl bg-[#151718] border border-[#2A2E31] hover:border-[#00CFFF] transition-all space-y-1 block group">
          <div className="flex items-center justify-between text-[#9CA3A8]">
            <span className="text-[10px] uppercase tracking-wider font-semibold">EXPERIMENTS</span>
            <TestTube2 className="w-3.5 h-3.5 text-[#9CA3A8] group-hover:text-[#00CFFF] transition-colors" />
          </div>
          <div className="text-2xl font-bold text-[#F5F7F8]">{expCount}</div>
          <span className="text-[10px] text-[#697177] block font-sans">Recorded Runs</span>
        </Link>

        <Link to="/experiments" className="p-4 rounded-xl bg-[#151718] border border-[#2A2E31] hover:border-[#00CFFF] transition-all space-y-1 block group">
          <div className="flex items-center justify-between text-[#9CA3A8]">
            <span className="text-[10px] uppercase tracking-wider font-semibold">OUTCOMES</span>
            <Layers className="w-3.5 h-3.5 text-[#9CA3A8] group-hover:text-[#00CFFF] transition-colors" />
          </div>
          <div className="text-2xl font-bold text-[#F5F7F8]">{memoryCount}</div>
          <span className="text-[10px] text-[#697177] block font-sans">Observed Results</span>
        </Link>

        <Link to="/failures" className="p-4 rounded-xl bg-[#151718] border border-[#2A2E31] hover:border-[#EF4444] transition-all space-y-1 block group">
          <div className="flex items-center justify-between text-[#9CA3A8]">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#EF4444]">FAILURES</span>
            <AlertOctagon className="w-3.5 h-3.5 text-[#EF4444]" />
          </div>
          <div className="text-2xl font-bold text-[#EF4444]">{failureCount}</div>
          <span className="text-[10px] text-[#697177] block font-sans">Classified Modes</span>
        </Link>

        <Link to="/memory" className="p-4 rounded-xl bg-[#151718] border border-[#2A2E31] hover:border-[#00CFFF] transition-all space-y-1 block group">
          <div className="flex items-center justify-between text-[#9CA3A8]">
            <span className="text-[10px] uppercase tracking-wider font-semibold">MEMORIES</span>
            <Cpu className="w-3.5 h-3.5 text-[#9CA3A8] group-hover:text-[#00CFFF] transition-colors" />
          </div>
          <div className="text-2xl font-bold text-[#F5F7F8]">{memoryCount}</div>
          <span className="text-[10px] text-[#697177] block font-sans">Hindsight Retained</span>
        </Link>

        <Link to="/patterns" className="p-4 rounded-xl bg-[#151718] border border-[#2A2E31] hover:border-[#10B981] transition-all space-y-1 block group">
          <div className="flex items-center justify-between text-[#9CA3A8]">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#10B981]">PATTERNS</span>
            <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
          </div>
          <div className="text-2xl font-bold text-[#10B981]">{patternCount}</div>
          <span className="text-[10px] text-[#697177] block font-sans">DBSCAN Clusters</span>
        </Link>

        <Link to="/directives" className="p-4 rounded-xl bg-[#151718] border border-[#2A2E31] hover:border-[#F59E0B] transition-all space-y-1 block group">
          <div className="flex items-center justify-between text-[#9CA3A8]">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#F59E0B]">DIRECTIVES</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#F59E0B]" />
          </div>
          <div className="text-2xl font-bold text-[#F59E0B]">{directiveCount}</div>
          <span className="text-[10px] text-[#697177] block font-sans">Active Directives</span>
        </Link>
      </div>

      {/* Experimental Learning Chart & Throughput Section */}
      <div className="p-6 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-4 font-mono">
        <div className="flex items-center justify-between border-b border-[#2A2E31] pb-3">
          <div>
            <span className="text-[10px] text-[#00CFFF] uppercase tracking-wider font-bold block">
              EXPERIMENTAL LEARNING & YIELD TRENDS
            </span>
            <h3 className="text-sm font-bold text-[#F5F7F8]">Reaction Outcome Trajectory Across Recent Campaigns</h3>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#9CA3A8]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#00CFFF]" /> Yield (%)</span>
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00CFFF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00CFFF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2E31" />
                <XAxis dataKey="name" stroke="#697177" tick={{ fontSize: 11, fill: '#9CA3A8' }} />
                <YAxis stroke="#697177" tick={{ fontSize: 11, fill: '#9CA3A8' }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A1D1F', borderColor: '#2A2E31', borderRadius: '8px', color: '#F5F7F8' }}
                  itemStyle={{ color: '#00CFFF' }}
                />
                <Area type="monotone" dataKey="yield" stroke="#00CFFF" strokeWidth={2} fillOpacity={1} fill="url(#cyanGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-[#697177]">
            Log experiments to surface learning trajectory.
          </div>
        )}
      </div>

      {/* Closed-Loop Architecture Section */}
      <MemoryLoopDiagram
        expCount={expCount}
        outcomeCount={memoryCount}
        memoryCount={memoryCount}
        patternCount={patternCount}
        directiveCount={directiveCount}
      />

      {/* Main Grid: Recent Intelligence + Memory Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
        {/* Left Column (8 cols): Recent Intelligence & Experiments */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-[#2A2E31] pb-2">
            <h2 className="text-sm font-bold text-[#F5F7F8] uppercase tracking-tight flex items-center gap-2">
              <TestTube2 className="w-4 h-4 text-[#00CFFF]" /> RECENT INTELLIGENCE & EXPERIMENT RECORDS
            </h2>
            <Link to="/experiments" className="text-xs text-[#9CA3A8] hover:text-[#00CFFF] flex items-center gap-1 transition-colors">
              View All Runs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="border border-[#2A2E31] rounded-xl overflow-hidden bg-[#151718]">
            {loadingExp ? (
              <div className="p-8 text-center text-[#697177]">Loading experiment records...</div>
            ) : !experiments || experiments.length === 0 ? (
              <div className="p-8 text-center text-[#697177] space-y-2 font-sans">
                <p>No historical experiments recorded yet.</p>
                <Link to="/experiments/new" className="text-[#00CFFF] underline text-xs font-mono">
                  Log your first reaction
                </Link>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#2A2E31] bg-[#111314] text-[#9CA3A8] text-[10px] uppercase">
                    <th className="py-3 px-4">Experiment</th>
                    <th className="py-3 px-3">Parameters</th>
                    <th className="py-3 px-3">Outcome</th>
                    <th className="py-3 px-3 text-right">Yield</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2E31]">
                  {experiments.slice(0, 5).map((exp) => {
                    const latestOutcome = exp.outcomes && exp.outcomes.length > 0 ? exp.outcomes[0] : null;
                    const paramsSummary = (exp.parameters || [])
                      .slice(0, 2)
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
                        <td className="py-3 px-3 text-[#9CA3A8] max-w-xs truncate">{paramsSummary || 'No params'}</td>
                        <td className="py-3 px-3">
                          <StatusBadge status={latestOutcome?.status || 'pending'} />
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-[#F5F7F8]">
                          {latestOutcome?.yield_percentage != null ? `${latestOutcome.yield_percentage}%` : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Memory Activity & Synthesized Failure Insights */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#2A2E31] pb-2">
            <h2 className="text-sm font-bold text-[#F5F7F8] uppercase tracking-tight flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#00CFFF]" /> MEMORY ACTIVITY & PATTERNS
            </h2>
            <Link to="/memory" className="text-xs text-[#9CA3A8] hover:text-[#00CFFF] flex items-center gap-1 transition-colors">
              Archive <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {patterns && patterns.length > 0 ? (
              patterns.slice(0, 2).map((pat) => (
                <div key={pat.id} className="p-4 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-2 hover:border-[#2A2E31] transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F5F7F8] text-xs">{pat.cluster_name}</span>
                    <span className="px-2 py-0.5 rounded bg-[rgba(0,207,255,0.1)] text-[#00CFFF] text-[10px] font-bold">
                      {Math.round(pat.confidence * 100)}% Conf
                    </span>
                  </div>
                  <p className="text-xs text-[#9CA3A8] font-sans leading-relaxed">
                    DBSCAN cluster derived from {pat.supporting_experiments_count} experiment runs.
                  </p>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-xl bg-[#151718] border border-[#2A2E31] text-[#697177] text-center">
                No patterns derived yet.
              </div>
            )}

            {mentalModels && mentalModels.length > 0 && (
              <div className="p-4 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-2">
                <span className="text-[10px] text-[#697177] uppercase tracking-wider block font-semibold">Scientific Mental Model</span>
                <h4 className="font-bold text-[#F5F7F8] text-xs">{mentalModels[0].model_name}</h4>
                <p className="text-xs text-[#9CA3A8] font-sans leading-relaxed line-clamp-2">{mentalModels[0].description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
