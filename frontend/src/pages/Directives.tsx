import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMentalModels, approveDirective } from '../api/memory';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ShieldCheck, Check, X, Filter } from 'lucide-react';

export const Directives: React.FC = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'candidate' | 'approved' | 'rejected'>('all');

  const { data: models, isLoading } = useQuery({
    queryKey: ['mental-models'],
    queryFn: fetchMentalModels,
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) => approveDirective(id, { approved }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mental-models'] });
      queryClient.invalidateQueries({ queryKey: ['impact-metrics'] });
    },
  });

  const allDirectives = (models || []).flatMap((m) =>
    (m.directives || []).map((d) => ({
      ...d,
      model_name: m.model_name,
      model_confidence: m.confidence,
    }))
  );

  const filteredDirectives = allDirectives.filter((d) => {
    if (filter === 'all') return true;
    return d.status === filter;
  });

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-edge pb-4">
        <div>
          <h2 className="text-xl font-bold text-ink flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-ink-muted" /> Research Directives Management
          </h2>
          <p className="text-xs text-ink-muted font-sans mt-0.5">
            Candidate rules generated from reflection. Institutional directives require explicit researcher approval before entering decision-support rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-ink-muted" />
          <select
            value={filter}
            onChange={(e: any) => setFilter(e.target.value)}
            className="bg-surface-card border border-edge rounded px-3 py-1.5 text-xs text-ink focus:outline-none"
          >
            <option value="all">All Directives ({allDirectives.length})</option>
            <option value="candidate">Candidate Review Required</option>
            <option value="approved">Approved Directives</option>
            <option value="rejected">Rejected Directives</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-ink-faint">Loading directives...</div>
      ) : filteredDirectives.length === 0 ? (
        <div className="p-12 border border-dashed border-edge rounded-lg text-center text-ink-muted">
          No directives found matching current filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDirectives.map((dir) => (
            <div key={dir.id} className="p-4 rounded-lg bg-surface-card border border-edge flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-ink-faint uppercase font-semibold">Model: {dir.model_name}</span>
                  <span className="text-resona-success text-[10px]">({Math.round(dir.model_confidence * 100)}% Confidence)</span>
                </div>
                <p className="text-xs text-ink font-sans font-medium">{dir.directive_text}</p>
                <span className="text-[10px] text-ink-faint block">Directive ID: {dir.id}</span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge status={dir.status} />
                {dir.status === 'candidate' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => approveMutation.mutate({ id: dir.id, approved: true })}
                      className="px-3 py-1 bg-resona-success-bg hover:bg-resona-success/20 text-resona-success border border-resona-success/30 rounded text-xs flex items-center gap-1 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => approveMutation.mutate({ id: dir.id, approved: false })}
                      className="px-3 py-1 bg-resona-failure-bg hover:bg-resona-failure/20 text-resona-failure border border-resona-failure/30 rounded text-xs flex items-center gap-1 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
