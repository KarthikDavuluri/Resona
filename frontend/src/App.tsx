import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { fetchHealthStatus } from './api/health';
import { Layout } from './components/layout/Layout';

import { CommandCenter } from './pages/CommandCenter';
import { Experiments } from './pages/Experiments';
import { ExperimentDetail } from './pages/ExperimentDetail';
import { ExperimentLogger } from './pages/ExperimentLogger';
import { ExperimentIntelligence } from './pages/ExperimentIntelligence';
import { MemoryWorkspace } from './pages/MemoryWorkspace';
import { FailureIntelligence } from './pages/FailureIntelligence';
import { Patterns } from './pages/Patterns';
import { MentalModels } from './pages/MentalModels';
import { Directives } from './pages/Directives';
import { ParameterSpace } from './pages/ParameterSpace';
import { ExperimentTimeline } from './pages/ExperimentTimeline';
import { Researchers } from './pages/Researchers';
import { AuditTrail } from './pages/AuditTrail';
import { ImpactEvaluation } from './pages/ImpactEvaluation';
import { OrdProvenance } from './pages/OrdProvenance';
import { Settings } from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 10000,
    },
  },
});

const AppRoutes: React.FC = () => {
  const { data: health } = useQuery({
    queryKey: ['health-status'],
    queryFn: fetchHealthStatus,
  });

  return (
    <Routes>
      <Route path="/" element={<Layout health={health} title="Command Center"><CommandCenter /></Layout>} />
      <Route path="/experiments" element={<Layout health={health} title="Experiment Workspace"><Experiments /></Layout>} />
      <Route path="/experiments/new" element={<Layout health={health} title="Record Real Experiment"><ExperimentLogger /></Layout>} />
      <Route path="/experiments/:id" element={<Layout health={health} title="Experiment Record Detail"><ExperimentDetail /></Layout>} />
      <Route path="/intelligence" element={<Layout health={health} title="Experiment Decision Intelligence"><ExperimentIntelligence /></Layout>} />
      <Route path="/timeline" element={<Layout health={health} title="Chronological Research Timeline"><ExperimentTimeline /></Layout>} />
      <Route path="/memory" element={<Layout health={health} title="Experiential Memory Workspace"><MemoryWorkspace /></Layout>} />
      <Route path="/failures" element={<Layout health={health} title="Failure Intelligence & Typology"><FailureIntelligence /></Layout>} />
      <Route path="/patterns" element={<Layout health={health} title="Synthesized Failure & Success Patterns"><Patterns /></Layout>} />
      <Route path="/mental-models" element={<Layout health={health} title="Scientific Mental Models"><MentalModels /></Layout>} />
      <Route path="/directives" element={<Layout health={health} title="Research Directives Management"><Directives /></Layout>} />
      <Route path="/parameter-space" element={<Layout health={health} title="Parameter Space Scatter Plot"><ParameterSpace /></Layout>} />
      <Route path="/researchers" element={<Layout health={health} title="Researchers & Feedback Workspace"><Researchers /></Layout>} />
      <Route path="/audit" element={<Layout health={health} title="Traceable Scientific Audit Trail"><AuditTrail /></Layout>} />
      <Route path="/impact" element={<Layout health={health} title="Impact & Memory Ablation Study"><ImpactEvaluation /></Layout>} />
      <Route path="/ord-provenance" element={<Layout health={health} title="Open Reaction Database Provenance"><OrdProvenance /></Layout>} />
      <Route path="/settings" element={<Layout health={health} title="Platform Infrastructure Settings"><Settings /></Layout>} />
    </Routes>
  );
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
