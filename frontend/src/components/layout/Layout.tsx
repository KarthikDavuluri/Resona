import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { HealthResponse } from '../../types';

interface LayoutProps {
  children: React.ReactNode;
  health?: HealthResponse;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, health, title }) => {
  return (
    <div className="min-h-screen bg-[#070809] text-[#F5F7F8] flex flex-col md:flex-row font-sans selection:bg-[#00CFFF] selection:text-[#070809]">
      <Sidebar health={health} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header health={health} title={title} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
};
