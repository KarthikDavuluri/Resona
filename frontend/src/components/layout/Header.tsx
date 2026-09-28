import React from 'react';
import { HealthResponse } from '../../types';
import { Search, Activity, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  health?: HealthResponse;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ health, title }) => {
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = React.useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/experiments?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  const isMemoryOnline = health?.services?.hindsight_memory === 'connected';

  return (
    <header className="h-16 border-b border-[#2A2E31] bg-[#070809] sticky top-0 z-30 px-6 flex items-center justify-between font-sans">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-2 font-mono text-xs">
        <span className="text-[#9CA3A8]">RESONA</span>
        <span className="text-[#697177]">/</span>
        <h1 className="text-xs font-bold text-[#F5F7F8] tracking-tight">{title || 'Command Center'}</h1>
      </div>

      {/* Global Search & System Status Indicators */}
      <div className="flex items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#697177]" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search experiments, parameters..."
            className="w-full bg-[#151718] border border-[#2A2E31] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#F5F7F8] placeholder-[#697177] focus:outline-none focus:border-[#00CFFF] transition-colors font-mono"
          />
        </form>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#151718] border border-[#2A2E31]">
            <span className="w-2 h-2 rounded-full bg-[#00CFFF] animate-pulse" />
            <span className="text-[#9CA3A8]">API ONLINE</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#151718] border border-[#2A2E31]">
            <span className={`w-2 h-2 rounded-full ${isMemoryOnline ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`} />
            <span className="text-[#9CA3A8]">{isMemoryOnline ? 'MEMORY ONLINE' : 'MEMORY FALLBACK'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
