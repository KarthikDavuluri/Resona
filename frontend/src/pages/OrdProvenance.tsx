import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchExperiments } from '../api/experiments';
import { Database, CheckCircle2, FileCode } from 'lucide-react';

export const OrdProvenance: React.FC = () => {
  const { data: experiments, isLoading } = useQuery({
    queryKey: ['ord-experiments'],
    queryFn: () => fetchExperiments({ limit: 100 }),
  });

  const ordRecords = (experiments || []).filter(
    (exp) => exp.source_type === 'ORD' || exp.source_type === 'ORD_SYNTHETIC'
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-[#2A2E31] pb-4 font-mono">
        <h2 className="text-xl font-bold text-[#F5F7F8] flex items-center gap-2">
          <Database className="w-5 h-5 text-[#00CFFF]" /> OPEN REACTION DATABASE (ORD) PROVENANCE
        </h2>
        <p className="text-xs text-[#9CA3A8] font-sans mt-0.5">
          Ingestion metrics, record normalization, unit standardizations, and source DOI citations.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-5 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-1">
          <span className="text-[10px] text-[#697177] uppercase font-semibold">Dataset Origin</span>
          <div className="text-base font-bold text-[#F5F7F8]">ORD Benchmark</div>
        </div>
        <div className="p-5 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-1">
          <span className="text-[10px] text-[#697177] uppercase font-semibold">Records Ingested</span>
          <div className="text-lg font-bold text-[#10B981]">{ordRecords.length}</div>
        </div>
        <div className="p-5 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-1">
          <span className="text-[10px] text-[#697177] uppercase font-semibold">Unit Normalization</span>
          <div className="text-base font-bold text-[#F5F7F8]">Standard (degC, M)</div>
        </div>
        <div className="p-5 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-1">
          <span className="text-[10px] text-[#697177] uppercase font-semibold">Pipeline Status</span>
          <div className="text-base font-bold text-[#10B981]">NORMALIZED</div>
        </div>
      </div>

      <div className="border border-[#2A2E31] rounded-xl overflow-hidden bg-[#151718] font-mono text-xs">
        {isLoading ? (
          <div className="p-12 text-center text-[#697177]">Loading ORD provenance records...</div>
        ) : ordRecords.length === 0 ? (
          <div className="p-12 text-center text-[#9CA3A8] font-sans">
            No ORD records found in local database. Run the ORD importer script to populate dataset.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2A2E31] bg-[#111314] text-[#9CA3A8] text-[10px] uppercase">
                <th className="py-3 px-4">ORD Reaction Name</th>
                <th className="py-3 px-3">Parameters</th>
                <th className="py-3 px-3">DOI Citation</th>
                <th className="py-3 px-4 text-right">Yield</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2E31]">
              {ordRecords.map((exp) => {
                const latestOutcome = exp.outcomes && exp.outcomes.length > 0 ? exp.outcomes[0] : null;
                const paramSummary = (exp.parameters || [])
                  .slice(0, 3)
                  .map((p) => `${p.parameter_name}: ${p.parameter_value}`)
                  .join(' | ');

                return (
                  <tr key={exp.id} className="hover:bg-[#1A1D1F] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#F5F7F8]">{exp.experiment_name}</td>
                    <td className="py-3 px-3 text-[#9CA3A8] max-w-xs truncate">{paramSummary}</td>
                    <td className="py-3 px-3 text-[#00CFFF] text-[11px]">{exp.source_doi || 'ORD Benchmark'}</td>
                    <td className="py-3 px-4 text-right font-bold text-[#10B981]">
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
  );
};
