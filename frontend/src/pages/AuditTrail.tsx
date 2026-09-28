import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs } from '../api/audit';
import { FileText, Shield, Clock, User, CheckCircle2 } from 'lucide-react';

export const AuditTrail: React.FC = () => {
  const { data: auditLogs, isLoading, isError, error } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => fetchAuditLogs(100),
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-[#2A2E31] pb-4 font-mono">
        <h2 className="text-xl font-bold text-[#F5F7F8] flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#00CFFF]" /> TRACEABLE SCIENTIFIC AUDIT TRAIL
        </h2>
        <p className="text-xs text-[#9CA3A8] font-sans mt-0.5">
          Immutable system ledger logging every state mutation, experiment outcome, memory retention call, and directive approval.
        </p>
      </div>

      <div className="border border-[#2A2E31] rounded-xl overflow-hidden bg-[#151718] font-mono text-xs">
        {isLoading ? (
          <div className="p-12 text-center text-[#697177]">Loading audit ledger...</div>
        ) : isError ? (
          <div className="p-12 text-center text-[#EF4444]">
            Error fetching audit log: {error instanceof Error ? error.message : 'Backend unreachable'}
          </div>
        ) : !auditLogs || auditLogs.length === 0 ? (
          <div className="p-12 text-center text-[#9CA3A8] space-y-1 font-sans">
            <p className="text-xs">No audit events recorded yet.</p>
            <p className="text-[11px] text-[#697177]">Log an experiment or approve a directive to generate ledger entries.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2A2E31] bg-[#111314] text-[#9CA3A8] text-[10px] uppercase">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Entity Type</th>
                <th className="py-3 px-3">Entity ID</th>
                <th className="py-3 px-3">Researcher</th>
                <th className="py-3 px-4 text-right">Source System</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2E31]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#1A1D1F] transition-colors">
                  <td className="py-3 px-4 text-[#697177] text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#1A1D1F] text-[#00CFFF] text-[10px] font-bold border border-[#2A2E31] uppercase">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#F5F7F8] font-semibold">{log.entity_type}</td>
                  <td className="py-3 px-3 text-[#9CA3A8] text-[11px]">{log.entity_id}</td>
                  <td className="py-3 px-3 text-[#F5F7F8]">{log.researcher_id || 'System'}</td>
                  <td className="py-3 px-4 text-right text-[#697177]">{log.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
