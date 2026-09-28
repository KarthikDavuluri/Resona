import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export const ToastPopup: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-6 right-6 z-50 animate-bounce-in max-w-md font-mono text-xs shadow-2xl">
      <div
        className={`p-4 rounded-xl border flex items-center gap-3 backdrop-blur-md ${
          type === 'success'
            ? 'bg-[#111314]/95 border-[#10B981] text-[#10B981]'
            : type === 'error'
            ? 'bg-[#111314]/95 border-[#EF4444] text-[#EF4444]'
            : 'bg-[#111314]/95 border-[#00CFFF] text-[#00CFFF]'
        }`}
      >
        {type === 'success' ? (
          <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-[#EF4444] shrink-0" />
        )}
        <div className="flex-1">
          <span className="font-bold block uppercase text-[10px] tracking-wider text-[#9CA3A8]">
            {type === 'success' ? 'SYSTEM NOTIFICATION' : 'ALERT'}
          </span>
          <p className="text-xs text-[#F5F7F8] font-sans font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-[#2A2E31] rounded-md text-[#9CA3A8] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
