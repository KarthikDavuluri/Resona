import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchExperimentById } from '../api/experiments';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ArrowLeft, TestTube2, AlertTriangle, Layers, Calendar, User, Database, CheckCircle2, ShieldAlert } from 'lucide-react';

export const ExperimentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: exp, isLoading, isError, error } = useQuery({
    queryKey: ['experiment', id],
    queryFn: () => fetchExperimentById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="p-12 text-center font-mono text-xs text-[#697177]">Loading experiment record detail...</div>;
  }

  if (isError || !exp) {
    return (
      <div className="p-12 text-center font-mono text-xs text-[#EF4444] space-y-4">
        <p>Error loading experiment: {error instanceof Error ? error.message : 'Record not found'}</p>
        <Link to="/experiments" className="text-[#00CFFF] underline font-mono text-xs">
          Return to Experiments Workspace
        </Link>
      </div>
    );
  }

  const latestOutcome = exp.outcomes && exp.outcomes.length > 0 ? exp.outcomes[0] : null;
  const statusToShow = latestOutcome?.status || exp.status || 'success';

  return (
    <div className="space-y-6 font-sans">
      <Link to="/experiments" className="inline-flex items-center gap-2 text-xs font-mono text-[#9CA3A8] hover:text-[#00CFFF] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Experiments Workspace
      </Link>

      {/* Header Info Banner */}
      <div className="p-6 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-4 font-mono text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2A2E31] pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[#F5F7F8]">{exp.experiment_name}</h1>
              <StatusBadge status={statusToShow} />
            </div>
            <p className="text-xs text-[#697177] mt-1">ID: {exp.id}</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#9CA3A8]">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#00CFFF]" /> {new Date(exp.created_at).toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#00CFFF]" /> {exp.researcher_id}
            </span>
          </div>
        </div>

        {exp.description && (
          <p className="text-xs text-[#9CA3A8] font-sans leading-relaxed">{exp.description}</p>
        )}
      </div>

      {/* Grid: Parameters & Outcome */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        {/* Parameters Box */}
        <div className="p-6 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#00CFFF] flex items-center gap-2 border-b border-[#2A2E31] pb-2.5">
            <TestTube2 className="w-4 h-4 text-[#00CFFF]" /> REACTION PARAMETERS ({exp.parameters?.length || 0})
          </h3>

          {!exp.parameters || exp.parameters.length === 0 ? (
            <p className="text-xs text-[#697177] font-sans">No parameters recorded for this experiment.</p>
          ) : (
            <div className="space-y-2.5">
              {exp.parameters.map((param, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#1A1D1F] border border-[#2A2E31]">
                  <span className="text-[#9CA3A8] font-medium">{param.parameter_name}:</span>
                  <span className="text-[#F5F7F8] font-bold">
                    {param.parameter_value} {param.unit || ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Outcome Box */}
        <div className="p-6 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#00CFFF] flex items-center gap-2 border-b border-[#2A2E31] pb-2.5">
            <Layers className="w-4 h-4 text-[#00CFFF]" /> LOGGED OUTCOME & YIELD
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#1A1D1F] border border-[#2A2E31]">
              <span className="text-[#9CA3A8] font-medium">Outcome Status:</span>
              <StatusBadge status={statusToShow} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#1A1D1F] border border-[#2A2E31]">
              <span className="text-[#9CA3A8] font-medium">Recorded Yield:</span>
              <span className="text-[#10B981] font-bold text-sm">
                {latestOutcome?.yield_percentage != null ? `${latestOutcome.yield_percentage}%` : 'Recorded via Run Summary'}
              </span>
            </div>

            {latestOutcome?.notes && (
              <div className="p-3.5 rounded-lg bg-[#1A1D1F] border border-[#2A2E31] space-y-1">
                <span className="text-[10px] text-[#697177] uppercase tracking-wider font-semibold block">Observation Notes:</span>
                <p className="text-xs text-[#F5F7F8] font-sans leading-relaxed">{latestOutcome.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Provenance Footer */}
      <div className="p-4 rounded-xl bg-[#151718] border border-[#2A2E31] text-xs font-mono text-[#9CA3A8] flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-[#00CFFF]" /> Source Provenance: {exp.source_type}
        </span>
        {exp.source_doi && <span>DOI: {exp.source_doi}</span>}
      </div>
    </div>
  );
};
