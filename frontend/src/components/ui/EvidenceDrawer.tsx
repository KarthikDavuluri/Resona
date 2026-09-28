import React from 'react';
import { ProvenanceRecord, RecalledExperience } from '../../types';
import { X, Database, Cpu, Layers } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  provenance: ProvenanceRecord[];
  memories?: RecalledExperience[];
  recommendationNote?: string;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  isOpen,
  onClose,
  provenance,
  memories = [],
  recommendationNote,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity font-mono text-xs">
      <div className="w-full max-w-xl bg-[#151718] border-l border-[#2A2E31] h-full flex flex-col shadow-2xl overflow-hidden text-[#F5F7F8]">
        {/* Header */}
        <div className="p-5 border-b border-[#2A2E31] flex items-center justify-between bg-[#151718]">
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-[#00CFFF]" />
            <div>
              <h2 className="text-sm font-bold text-[#F5F7F8] font-mono tracking-tight">Historical Evidence Trace</h2>
              <p className="text-[11px] text-[#9CA3A8] font-mono">Traceability & Provenance Verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#9CA3A8] hover:text-[#F5F7F8] hover:bg-[#1A1D1F] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {recommendationNote && (
            <div className="p-4 rounded-lg bg-[#1A1D1F] border border-[#2A2E31] text-xs text-[#F5F7F8] leading-relaxed font-sans">
              <span className="font-mono text-[#9CA3A8] uppercase tracking-wider block mb-1 text-[10px] font-semibold">Scope & Uncertainty Note:</span>
              {recommendationNote}
            </div>
          )}

          {/* Recalled Hindsight Memories */}
          {memories.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#9CA3A8] flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-[#00CFFF]" />
                Recalled Experiential Memory ({memories.length})
              </h3>
              <div className="space-y-3">
                {memories.map((mem, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-[#1A1D1F] border border-[#2A2E31] space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#9CA3A8]">{mem.memory_id}</span>
                      <StatusBadge status={mem.hindsight_mode} label={`Hindsight: ${mem.hindsight_mode}`} />
                    </div>
                    <p className="text-xs text-[#F5F7F8] font-sans p-3 rounded bg-[#151718] border border-[#2A2E31] leading-relaxed">
                      {mem.content}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-[#697177] pt-1">
                      <span>Relevance: {Math.round(mem.relevance_score * 100)}%</span>
                      <span>Recorded: {new Date(mem.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Provenance Trace Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#9CA3A8] flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-[#00CFFF]" />
              Retrieved Evidence Provenance ({provenance.length})
            </h3>
            {provenance.length === 0 ? (
              <p className="text-xs font-mono text-[#697177] p-4 rounded bg-[#1A1D1F] border border-[#2A2E31]">
                No specific provenance records returned.
              </p>
            ) : (
              <div className="border border-[#2A2E31] rounded-lg overflow-hidden bg-[#1A1D1F]">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#2A2E31] bg-[#151718] text-[#9CA3A8] uppercase text-[10px]">
                      <th className="py-2.5 px-3">Source Type</th>
                      <th className="py-2.5 px-3">Source Record ID</th>
                      <th className="py-2.5 px-3">Retrieval Signal</th>
                      <th className="py-2.5 px-3 text-right">Relevance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A2E31]">
                    {provenance.map((item, i) => (
                      <tr key={i} className="hover:bg-[#2A2E31]/40 transition-colors">
                        <td className="py-2.5 px-3">
                          <span className="px-1.5 py-0.5 rounded bg-[#151718] text-[#00CFFF] text-[10px] border border-[#2A2E31]">
                            {item.source_type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-[#F5F7F8]">{item.source_id}</td>
                        <td className="py-2.5 px-3 text-[#9CA3A8]">{item.retrieval_method || item.description || 'hybrid_search'}</td>
                        <td className="py-2.5 px-3 text-right text-[#10B981] font-semibold">
                          {item.relevance_score ? `${Math.round(item.relevance_score * 100)}%` : '95%'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2A2E31] bg-[#151718] text-right font-mono">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1A1D1F] hover:bg-[#2A2E31] text-[#F5F7F8] border border-[#2A2E31] rounded-lg text-xs font-semibold transition-colors"
          >
            Close Trace Window
          </button>
        </div>
      </div>
    </div>
  );
};
