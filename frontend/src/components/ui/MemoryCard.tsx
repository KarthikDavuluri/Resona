import React from 'react';
import { Cpu, CheckCircle2, ShieldAlert, AlertTriangle, Layers, Clock } from 'lucide-react';
import { RecalledExperience } from '../../types';

interface MemoryCardProps {
  memory: RecalledExperience;
}

export const formatRawMemoryString = (rawContent: string) => {
  if (!rawContent) return { title: '', parameters: [], observations: '', outcome: '', failureReason: '', lessons: [] };

  // Parse Python dict-like parameters string if present: {'key': 'val', ...}
  let title = '';
  let observations = '';
  let outcome = '';
  let failureReason = '';
  const parameters: Array<{ key: string; val: string }> = [];
  const lessons: string[] = [];

  // Match Experiment: <name>
  const expMatch = rawContent.match(/Experiment:\s*([^:.]+)/i);
  if (expMatch) {
    title = expMatch[1].trim();
  }

  // Match Parameters: {...}
  const paramDictMatch = rawContent.match(/Parameters:\s*\{([^}]+)\}/i);
  if (paramDictMatch) {
    const dictBody = paramDictMatch[1];
    // Extract 'key': 'val' or "key": "val"
    const pairs = dictBody.match(/['"]?([^'":\s]+)['"]?\s*:\s*['"]?([^'",}]+)['"]?/g);
    if (pairs) {
      pairs.forEach((pair) => {
        const parts = pair.split(':');
        if (parts.length === 2) {
          const k = parts[0].replace(/['"\s]/g, '');
          const v = parts[1].replace(/['"\s]/g, '');
          if (k && v) parameters.push({ key: k, val: v });
        }
      });
    }
  }

  // Match Outcome: <status>
  const outcomeMatch = rawContent.match(/Outcome:\s*([^:.]+)/i);
  if (outcomeMatch) {
    outcome = outcomeMatch[1].trim();
  }

  // Match Observations: <text>
  const obsMatch = rawContent.match(/Observations:\s*([^:.]+)/i);
  if (obsMatch && obsMatch[1].trim() !== '.' && obsMatch[1].trim() !== 'N/A') {
    observations = obsMatch[1].trim();
  }

  // Match Failure Reason: <text>
  const failMatch = rawContent.match(/Failure Reason:\s*([^:.]+)/i);
  if (failMatch && failMatch[1].trim() !== 'N/A' && failMatch[1].trim() !== '.') {
    failureReason = failMatch[1].trim();
  }

  // If title is empty, clean string fallback
  if (!title) {
    title = rawContent.split('.')[0] || 'Experiential Memory';
  }

  return { title, parameters, observations, outcome, failureReason, lessons };
};

export const MemoryCard: React.FC<MemoryCardProps> = ({ memory }) => {
  const { title, parameters, observations, outcome, failureReason } = formatRawMemoryString(memory.content);
  const relevancePct = Math.round((memory.relevance_score || 0.8) * 100);

  return (
    <div className="p-4 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-3 font-mono text-xs">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2A2E31] pb-2.5">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#00CFFF]" />
          <span className="font-bold text-[#F5F7F8] text-xs">{memory.memory_id || 'Hindsight Record'}</span>
          {title && title !== '.' && (
            <span className="px-2 py-0.5 rounded bg-[#1A1D1F] border border-[#2A2E31] text-[#9CA3A8] text-[10px]">
              Exp: {title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#697177]">Mode: {memory.hindsight_mode || 'retained'}</span>
          <span className="px-2 py-0.5 rounded bg-[rgba(0,207,255,0.1)] text-[#00CFFF] text-[11px] font-bold border border-[rgba(0,207,255,0.2)]">
            Relevance: {relevancePct}%
          </span>
        </div>
      </div>

      {/* Clean Parameters Badges */}
      {parameters.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] text-[#697177] uppercase font-semibold block">Reaction Parameters:</span>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            {parameters.map((p, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-md bg-[#1A1D1F] border border-[#2A2E31] text-[#F5F7F8]">
                <span className="text-[#9CA3A8]">{p.key}:</span> <span className="font-bold text-[#00CFFF]">{p.val}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Outcome / Observation Body */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {outcome && (
          <div className="p-2.5 rounded-lg bg-[#1A1D1F] border border-[#2A2E31] flex items-center gap-2">
            {outcome.toLowerCase().includes('success') ? (
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
            ) : outcome.toLowerCase().includes('fail') ? (
              <ShieldAlert className="w-4 h-4 text-[#EF4444] shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />
            )}
            <div>
              <span className="text-[10px] text-[#697177] block uppercase font-semibold">Recorded Outcome</span>
              <span className="font-bold text-[#F5F7F8] capitalize text-xs">{outcome}</span>
            </div>
          </div>
        )}

        {failureReason && (
          <div className="p-2.5 rounded-lg bg-[#1A1D1F] border border-[rgba(239,68,68,0.3)] flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-[#EF4444] block uppercase font-semibold">Failure Root Cause</span>
              <span className="text-[#F5F7F8] text-[11px] font-sans leading-tight block">{failureReason}</span>
            </div>
          </div>
        )}
      </div>

      {observations && (
        <div className="p-2.5 rounded-lg bg-[#1A1D1F] border border-[#2A2E31] text-[11px] font-sans text-[#9CA3A8] flex items-start gap-2">
          <Layers className="w-3.5 h-3.5 text-[#00CFFF] shrink-0 mt-0.5" />
          <span><strong className="text-[#F5F7F8] font-mono text-[10px] uppercase">Observations:</strong> {observations}</span>
        </div>
      )}

      {/* Footer Timestamp */}
      <div className="flex items-center justify-between text-[10px] text-[#697177] pt-1">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-[#697177]" /> Recorded: {memory.timestamp ? new Date(memory.timestamp).toLocaleString() : 'Recent run'}
        </span>
      </div>
    </div>
  );
};
