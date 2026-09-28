import React from 'react';
import { DecisionSupportConfidence } from '../../types';
import { ShieldCheck, ShieldAlert, Info } from 'lucide-react';

interface ConfidenceIndicatorProps {
  confidence: DecisionSupportConfidence;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({ confidence }) => {
  const level = confidence.level || 'Medium';
  const scorePercent = Math.round((confidence.score || 0) * 100);

  let barColor = 'bg-[#854D0E]';
  let badgeStyle = 'bg-[#FAF4E8] text-[#854D0E] border-[#E8D4B0]';
  let Icon = Info;

  if (level.toLowerCase() === 'high' || scorePercent >= 75) {
    barColor = 'bg-[#1E5138]';
    badgeStyle = 'bg-[#E8F2EC] text-[#1E5138] border-[#B6D8C4]';
    Icon = ShieldCheck;
  } else if (level.toLowerCase() === 'low' || scorePercent < 50) {
    barColor = 'bg-[#8C2A2A]';
    badgeStyle = 'bg-[#F9ECEC] text-[#8C2A2A] border-[#E5C2C2]';
    Icon = ShieldAlert;
  }

  return (
    <div className="p-5 rounded-lg bg-surface-card border border-edge space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-ink" />
          <span className="text-xs font-semibold uppercase tracking-wider text-ink font-mono">System Confidence Evaluation</span>
        </div>
        <div className={`px-2.5 py-0.5 rounded border text-[11px] font-mono font-medium ${badgeStyle}`}>
          {level.toUpperCase()} ({scorePercent}%)
        </div>
      </div>

      <div className="w-full bg-[#ECEAE5] h-1.5 rounded overflow-hidden">
        <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${scorePercent}%` }} />
      </div>

      <p className="text-xs text-ink-muted leading-relaxed font-sans">{confidence.explanation}</p>

      {confidence.key_factors && confidence.key_factors.length > 0 && (
        <div className="pt-3 border-t border-edge space-y-1.5 font-mono text-xs">
          <span className="text-[10px] text-ink-faint uppercase tracking-wider block">Key Factors Influencing Evaluation:</span>
          <ul className="space-y-1 font-sans">
            {confidence.key_factors.map((factor, i) => (
              <li key={i} className="text-xs text-ink flex items-start gap-2">
                <span className="text-ink-muted font-mono select-none">•</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
