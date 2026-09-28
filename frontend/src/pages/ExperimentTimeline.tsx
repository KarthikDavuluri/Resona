import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs } from '../api/audit';
import { History, Clock, FileText, Cpu, AlertTriangle, ArrowRight } from 'lucide-react';

export const ExperimentTimeline: React.FC = () => {
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['audit-logs-timeline'],
    queryFn: () => fetchAuditLogs(50),
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-[#2A2E31] pb-4 font-mono space-y-1">
        <h2 className="text-xl font-bold text-[#F5F7F8] flex items-center gap-2">
          <History className="w-5 h-5 text-[#00CFFF]" /> CHRONOLOGICAL EXPERIMENT TIMELINE
        </h2>
        <p className="text-xs text-[#9CA3A8] font-sans">
          Chronological institutional memory stream tracking experiment creation, outcome retention, failure logs, and reflection events over time.
        </p>
      </div>

      {/* Loop Progression Banner */}
      <div className="p-4 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-2 font-mono text-xs">
        <span className="text-[10px] text-[#00CFFF] uppercase tracking-wider font-bold block">
          Knowledge Accumulation Progression:
        </span>
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold text-[#F5F7F8]">
          <span>EXPERIMENT</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#697177]" />
          <span>OUTCOME RECORDED</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#697177]" />
          <span className="text-[#10B981]">MEMORY RETAINED</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#697177]" />
          <span>PATTERN CLUSTERING</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#697177]" />
          <span className="text-[#F59E0B]">IMPROVED DECISION</span>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-[#697177] font-mono text-xs">Loading research timeline...</div>
      ) : !auditLogs || auditLogs.length === 0 ? (
        <div className="p-12 border border-dashed border-[#2A2E31] rounded-xl text-center text-[#9CA3A8] font-sans text-xs">
          No audit history logged yet. Perform experiments or trigger reflections to populate timeline.
        </div>
      ) : (
        <div className="relative border-l border-[#2A2E31] ml-4 space-y-6 font-mono text-xs">
          {auditLogs.map((log) => {
            let Icon = Clock;
            let iconColor = 'bg-[#151718] border-[#2A2E31] text-[#F5F7F8]';

            if (log.action.includes('CREATE')) {
              Icon = FileText;
              iconColor = 'bg-[#1A1D1F] border-[#00CFFF] text-[#00CFFF]';
            } else if (log.action.includes('RETAIN') || log.action.includes('MEMORY')) {
              Icon = Cpu;
              iconColor = 'bg-[rgba(16,185,129,0.1)] border-resona-success/30 text-[#10B981]';
            } else if (log.action.includes('FAILURE')) {
              Icon = AlertTriangle;
              iconColor = 'bg-[rgba(239,68,68,0.1)] border-resona-failure/30 text-[#EF4444]';
            }

            return (
              <div key={log.id} className="relative pl-6">
                <div
                  className={`absolute -left-3 top-0.5 w-6 h-6 rounded-full border flex items-center justify-center ${iconColor}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="p-4 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F5F7F8] uppercase text-xs">{log.action}</span>
                    <span className="text-[11px] text-[#697177]">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[#9CA3A8] text-[11px]">
                    <span>Entity: {log.entity_type} ({log.entity_id})</span>
                    <span>Researcher: {log.researcher_id || 'System'}</span>
                  </div>

                  {log.new_state && (
                    <div className="p-2.5 rounded-lg bg-[#1A1D1F] border border-[#2A2E31] text-[11px] text-[#F5F7F8]">
                      State: {typeof log.new_state === 'object' && log.new_state ? Object.entries(log.new_state).map(([k, v]) => `${k}: ${v}`).join(', ') : String(log.new_state).replace(/^\{|\}$/g, '')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
