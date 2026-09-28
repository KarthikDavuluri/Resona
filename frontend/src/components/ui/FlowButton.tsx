import React from 'react';
import { ArrowRight } from 'lucide-react';

interface FlowButtonProps {
  text?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
}

export function FlowButton({
  text = "Modern Button",
  onClick,
  type = 'button',
  disabled = false,
  className = '',
}: FlowButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative flex items-center justify-center gap-1 overflow-hidden
        rounded-[100px]
        border-[1.5px] border-[#2A2E31]
        bg-[#151718]
        px-8 py-3
        text-sm font-semibold text-[#F5F7F8]
        cursor-pointer
        transition-all duration-[600ms]
        ease-[cubic-bezier(0.23,1,0.32,1)]
        hover:border-transparent
        hover:text-[#070809]
        hover:rounded-[12px]
        active:scale-[0.95]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      <ArrowRight
        className="
          absolute w-4 h-4 left-[-25%]
          stroke-[#F5F7F8]
          fill-none
          z-[9]
          group-hover:left-4
          group-hover:stroke-[#070809]
          transition-all duration-[800ms]
          ease-[cubic-bezier(0.34,1.56,0.64,1)]
        "
      />

      <span
        className="
          relative z-[1]
          -translate-x-3
          group-hover:translate-x-3
          transition-all duration-[800ms]
          ease-out
        "
      >
        {text}
      </span>

      <span
        className="
          absolute top-1/2 left-1/2
          -translate-x-1/2 -translate-y-1/2
          w-4 h-4
          bg-[#00CFFF]
          rounded-[50%]
          opacity-0
          group-hover:w-[300px]
          group-hover:h-[300px]
          group-hover:opacity-100
          transition-all duration-[800ms]
          ease-[cubic-bezier(0.19,1,0.22,1)]
        "
      />

      <ArrowRight
        className="
          absolute w-4 h-4 right-4
          stroke-[#F5F7F8]
          fill-none
          z-[9]
          group-hover:right-[-25%]
          group-hover:stroke-[#070809]
          transition-all duration-[800ms]
          ease-[cubic-bezier(0.34,1.56,0.64,1)]
        "
      />
    </button>
  );
}
