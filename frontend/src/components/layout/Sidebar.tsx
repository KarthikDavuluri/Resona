import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, TestTube2, Sparkles, Cpu, AlertOctagon, Grid,
  ChevronDown, ChevronRight, History, Sliders, Compass, ShieldCheck,
  Users, FileText, BarChart3, Database, Settings, Atom
} from 'lucide-react';
import { HealthResponse } from '../../types';

interface SidebarProps {
  health?: HealthResponse;
}

export const Sidebar: React.FC<SidebarProps> = ({ health }) => {
  const [toolsOpen, setToolsOpen] = useState(true);

  const primaryNav = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'Experiments', path: '/experiments', icon: TestTube2 },
    { label: 'Intelligence', path: '/intelligence', icon: Sparkles },
    { label: 'Memory', path: '/memory', icon: Cpu },
    { label: 'Failures', path: '/failures', icon: AlertOctagon },
    { label: 'Patterns', path: '/patterns', icon: Grid },
  ];

  const secondaryNav = [
    { label: 'Timeline', path: '/timeline', icon: History },
    { label: 'Parameter Space', path: '/parameter-space', icon: Sliders },
    { label: 'Researchers', path: '/researchers', icon: Users },
    { label: 'Audit Trail', path: '/audit', icon: FileText },
    { label: 'Impact & Evaluation', path: '/impact', icon: BarChart3 },
    { label: 'ORD Provenance', path: '/ord-provenance', icon: Database },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#111314] border-r border-[#2A2E31] h-screen sticky top-0 flex flex-col select-none shrink-0 text-[#F5F7F8]">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-[#2A2E31] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1A1D1F] border border-[#2A2E31] text-[#00CFFF] flex items-center justify-center font-mono font-bold shadow-xs">
            <Atom className="w-4 h-4 text-[#00CFFF]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight text-[#F5F7F8] font-mono">RESONA</h1>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00CFFF]" />
            </div>
            <p className="text-[10px] text-[#9CA3A8] font-mono tracking-tight">Scientific Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {/* Primary Navigation */}
        <div className="space-y-1">
          <div className="px-3 pb-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#697177]">
            Core Platform
          </div>
          {primaryNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#1A1D1F] text-[#F5F7F8] font-semibold border-l-2 border-[#00CFFF]'
                      : 'text-[#9CA3A8] hover:text-[#F5F7F8] hover:bg-[#151718]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 text-[#9CA3A8]" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Workspace Navigation Group */}
        <div className="space-y-1 pt-3 border-t border-[#2A2E31]">
          <button
            onClick={() => setToolsOpen(!toolsOpen)}
            className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#697177] hover:text-[#F5F7F8] transition-colors"
          >
            <span>Workspace Tools</span>
            {toolsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {toolsOpen && (
            <div className="space-y-0.5 pt-1">
              {secondaryNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                        isActive
                          ? 'bg-[#1A1D1F] text-[#F5F7F8] font-semibold border-l-2 border-[#00CFFF]'
                          : 'text-[#9CA3A8] hover:text-[#F5F7F8] hover:bg-[#151718]'
                      }`
                    }
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 text-[#9CA3A8]" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-[#2A2E31] bg-[#151718] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#1A1D1F] border border-[#2A2E31] text-[#F5F7F8] font-bold flex items-center justify-center font-mono text-xs">
            DV
          </div>
          <div className="space-y-0.5 leading-none">
            <p className="text-xs font-semibold text-[#F5F7F8] font-mono">Dr. Vance</p>
            <p className="text-[10px] text-[#9CA3A8] font-mono">vance@resona.ai</p>
          </div>
        </div>
        <div className="w-2 h-2 rounded-full bg-[#00CFFF]" title="System Online" />
      </div>
    </aside>
  );
};
