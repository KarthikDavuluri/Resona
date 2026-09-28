import React from 'react';
import { CircleDot, AlertTriangle, CheckCircle2, ShieldAlert, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'sm' }) => {
  const normStatus = status?.toLowerCase() || '';

  let colorClasses = 'bg-[#1A1D1F] text-[#9CA3A8] border-[#2A2E31]';
  let Icon = CircleDot;

  if (normStatus.includes('healthy') || normStatus.includes('connected') || normStatus === 'success' || normStatus === 'active' || normStatus === 'completed') {
    colorClasses = 'bg-resona-success-bg text-resona-success border-resona-success/30';
    Icon = CheckCircle2;
  } else if (normStatus.includes('fallback') || normStatus.includes('development') || normStatus === 'partial' || normStatus === 'medium' || normStatus === 'candidate' || normStatus === 'in_progress') {
    colorClasses = 'bg-resona-warning-bg text-resona-warning border-resona-warning/30';
    Icon = AlertTriangle;
  } else if (normStatus.includes('failed') || normStatus.includes('degraded') || normStatus.includes('offline') || normStatus === 'failure' || normStatus === 'rejected') {
    colorClasses = 'bg-resona-failure-bg text-resona-failure border-resona-failure/30';
    Icon = ShieldAlert;
  } else if (normStatus === 'pending' || normStatus === 'proposed' || normStatus === 'draft') {
    colorClasses = 'bg-[#1A1D1F] text-[#9CA3A8] border-[#2A2E31]';
    Icon = Clock;
  }

  const textSize = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-md border ${colorClasses} ${textSize}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {label || status.toUpperCase()}
    </span>
  );
};
