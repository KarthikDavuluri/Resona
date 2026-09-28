import React from 'react';
import { ArrowRight, TestTube2, Layers, Cpu, Grid, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProvenanceChainProps {
  experimentId?: string;
  experimentName?: string;
  observationText?: string;
  memoryId?: string;
  patternName?: string;
  directiveText?: string;
}

export const ProvenanceChain: React.FC<ProvenanceChainProps> = ({
  experimentId,
  experimentName,
  observationText,
  memoryId,
  patternName,
  directiveText,
}) => {
  return (
    <div className="p-4 rounded-xl bg-[#151718] border border-[#2A2E31] font-mono text-xs space-y-3">
      <span className="text-[10px] text-[#00CFFF] uppercase tracking-wider block font-bold">
        INSTITUTIONAL KNOWLEDGE LINEAGE TRACE
      </span>

      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        {/* Step 1: Experiment */}
        <div className="flex items-center gap-1.5 p-2 rounded-md bg-[#1A1D1F] border border-[#2A2E31]">
          <TestTube2 className="w-3.5 h-3.5 text-[#00CFFF]" />
          {experimentId ? (
            <Link to={`/experiments/${experimentId}`} className="font-semibold text-[#F5F7F8] hover:text-[#00CFFF] transition-colors">
              {experimentName || experimentId}
            </Link>
          ) : (
            <span className="text-[#9CA3A8]">Historical Reaction</span>
          )}
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-[#697177] shrink-0" />

        {/* Step 2: Observation */}
        <div className="flex items-center gap-1.5 p-2 rounded-md bg-[#1A1D1F] border border-[#2A2E31] max-w-xs truncate">
          <Layers className="w-3.5 h-3.5 text-[#9CA3A8]" />
          <span className="text-[#F5F7F8] font-sans text-xs truncate">
            {observationText || 'Reaction outcome & parameter metrics logged'}
          </span>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-[#697177] shrink-0" />

        {/* Step 3: Memory */}
        <div className="flex items-center gap-1.5 p-2 rounded-md bg-[#1A1D1F] border border-[#2A2E31]">
          <Cpu className="w-3.5 h-3.5 text-[#00CFFF]" />
          <span className="text-[#F5F7F8] font-mono font-semibold">{memoryId || 'Hindsight Memory'}</span>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-[#697177] shrink-0" />

        {/* Step 4: Pattern */}
        <div className="flex items-center gap-1.5 p-2 rounded-md bg-[#1A1D1F] border border-[#2A2E31]">
          <Grid className="w-3.5 h-3.5 text-[#10B981]" />
          <span className="text-[#10B981] font-semibold">{patternName || 'Synthesized Pattern'}</span>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-[#697177] shrink-0" />

        {/* Step 5: Future Decision */}
        <div className="flex items-center gap-1.5 p-2 rounded-md bg-[#1A1D1F] border border-[#2A2E31]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span className="text-[#F59E0B] font-semibold max-w-xs truncate font-sans text-xs">
            {directiveText || 'Decision Guidance Applied'}
          </span>
        </div>
      </div>
    </div>
  );
};
