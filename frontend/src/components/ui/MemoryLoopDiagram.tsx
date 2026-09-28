import React from 'react';
import { Link } from 'react-router-dom';
import { TestTube2, Layers, Cpu, Sparkles, ShieldCheck, ArrowRight, RotateCw } from 'lucide-react';

interface MemoryLoopDiagramProps {
  expCount?: number;
  outcomeCount?: number;
  memoryCount?: number;
  patternCount?: number;
  directiveCount?: number;
}

export const MemoryLoopDiagram: React.FC<MemoryLoopDiagramProps> = ({
  expCount = 0,
  outcomeCount = 0,
  memoryCount = 0,
  patternCount = 0,
  directiveCount = 0,
}) => {
  const steps = [
    {
      step: '01',
      title: 'EXPERIMENT',
      subtitle: 'What was attempted?',
      count: `${expCount} Recorded`,
      path: '/experiments',
      icon: TestTube2,
    },
    {
      step: '02',
      title: 'OUTCOME',
      subtitle: 'What actually happened?',
      count: `${outcomeCount} Outcomes`,
      path: '/experiments',
      icon: Layers,
    },
    {
      step: '03',
      title: 'MEMORY',
      subtitle: 'What did RESONA retain?',
      count: `${memoryCount} Logged`,
      path: '/memory',
      icon: Cpu,
    },
    {
      step: '04',
      title: 'REFLECTION',
      subtitle: 'What pattern was discovered?',
      count: `${patternCount} Patterns`,
      path: '/patterns',
      icon: Sparkles,
    },
    {
      step: '05',
      title: 'DECISION',
      subtitle: 'How does this affect future runs?',
      count: `${directiveCount} Directives`,
      path: '/directives',
      icon: ShieldCheck,
    },
    {
      step: '06',
      title: 'NEW EXPERIENCE',
      subtitle: 'Next result updates memory bank.',
      count: 'Continuous Loop',
      path: '/intelligence',
      icon: RotateCw,
    },
  ];

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-[#2A2E31] pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F7F8] flex items-center gap-2">
          <RotateCw className="w-4 h-4 text-[#00CFFF]" /> THE CLOSED-LOOP MEMORY ARCHITECTURE
        </h3>
        <span className="text-[10px] text-[#697177]">Interactive Institutional Feedback Loop</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.step}
              to={s.path}
              className="p-4 rounded-xl bg-[#151718] border border-[#2A2E31] hover:border-[#00CFFF] hover:bg-[#1A1D1F] transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#00CFFF] font-bold">{s.step}</span>
                  <Icon className="w-3.5 h-3.5 text-[#9CA3A8] group-hover:text-[#00CFFF] transition-colors" />
                </div>
                <h4 className="text-xs font-bold text-[#F5F7F8] uppercase tracking-tight group-hover:underline">
                  {s.title}
                </h4>
                <p className="text-[11px] text-[#9CA3A8] font-sans leading-tight">{s.subtitle}</p>
              </div>

              <div className="pt-2 border-t border-[#2A2E31] flex items-center justify-between text-[10px] text-[#F5F7F8] font-semibold">
                <span>{s.count}</span>
                <ArrowRight className="w-3 h-3 text-[#697177] group-hover:text-[#00CFFF] group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
