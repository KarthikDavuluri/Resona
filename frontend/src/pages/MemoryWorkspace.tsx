import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recallMemory, reflectMemory, fetchMentalModels, approveDirective } from '../api/memory';
import { RecalledExperience } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ProvenanceChain } from '../components/ui/ProvenanceChain';
import { FlowButton } from '../components/ui/FlowButton';
import { MemoryCard } from '../components/ui/MemoryCard';
import { Cpu, Search, Sparkles, Compass, Check, X, Layers, Brain, CheckCircle2 } from 'lucide-react';

export const MemoryWorkspace: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'recall' | 'models' | 'reflect' | 'layers'>('layers');

  // Search / Recall state
  const [queryText, setQueryText] = useState('palladium catalyst thermal decomposition');
  const [recalledMemories, setRecalledMemories] = useState<RecalledExperience[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recallMode, setRecallMode] = useState<string>('fallback');

  // Reflect state
  const [reflectTopic, setReflectTopic] = useState('cross_coupling_reactions');
  const [reflectionResult, setReflectionResult] = useState<any>(null);
  const [isReflecting, setIsReflecting] = useState(false);

  // Mental Models query
  const { data: models, isLoading: loadingModels } = useQuery({
    queryKey: ['mental-models'],
    queryFn: fetchMentalModels,
  });

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!queryText.trim()) return;
    setIsSearching(true);
    try {
      const res = await recallMemory({ query: queryText.trim(), top_k: 8 });
      setRecalledMemories(res.memories);
      setRecallMode(res.hindsight_integration);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleReflect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsReflecting(true);
    try {
      const res = await reflectMemory({ topic: reflectTopic });
      setReflectionResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsReflecting(false);
    }
  };

  // Pre-load default recall or reflection when tab opens
  useEffect(() => {
    if (activeTab === 'recall' && recalledMemories.length === 0) {
      handleSearch();
    }
    if (activeTab === 'reflect' && !reflectionResult) {
      handleReflect();
    }
  }, [activeTab]);

  const approveDirectiveMutation = useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) =>
      approveDirective(id, { approved }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mental-models'] });
      queryClient.invalidateQueries({ queryKey: ['impact-metrics'] });
    },
  });

  const memoryLayers = [
    { name: 'EXPERIENCE', label: 'Raw Experimental Events', desc: 'Parameters, reactions, and physical setups attempted by researchers.' },
    { name: 'OBSERVATION', label: 'Direct Reaction Outcomes', desc: 'Measured yields, side-products, HPLC conversions, and thermal notes.' },
    { name: 'PATTERN', label: 'DBSCAN Clusters', desc: 'Density-based recurring failure and success thresholds across runs.' },
    { name: 'MENTAL MODEL', label: 'Scientific Knowledge Rules', desc: 'Higher-order concepts derived from accumulated evidence.' },
    { name: 'DIRECTIVE', label: 'Researcher Guidance', desc: 'Approved parameter bounds and precautionary directives.' },
    { name: 'REFLECTION', label: 'Hindsight Synthesis', desc: 'Cross-campaign summary and contradiction resolution.' },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-[#2A2E31] pb-4 font-mono space-y-1">
        <h2 className="text-xl font-bold text-[#F5F7F8] flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#00CFFF]" /> MEMORY WORKSPACE
        </h2>
        <p className="text-xs text-[#9CA3A8] font-sans">
          RESONA's institutional memory bank retains reaction experience, structures facts into 6 cognitive layers, and distills evidence-backed directives.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#2A2E31] font-mono text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('layers')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'layers'
              ? 'border-[#00CFFF] text-[#F5F7F8] font-bold'
              : 'border-transparent text-[#9CA3A8] hover:text-[#F5F7F8]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Memory Layers
        </button>
        <button
          onClick={() => setActiveTab('recall')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'recall'
              ? 'border-[#00CFFF] text-[#F5F7F8] font-bold'
              : 'border-transparent text-[#9CA3A8] hover:text-[#F5F7F8]'
          }`}
        >
          <Search className="w-3.5 h-3.5" /> Memory Recall
        </button>
        <button
          onClick={() => setActiveTab('models')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'models'
              ? 'border-[#00CFFF] text-[#F5F7F8] font-bold'
              : 'border-transparent text-[#9CA3A8] hover:text-[#F5F7F8]'
          }`}
        >
          <Compass className="w-3.5 h-3.5" /> Mental Models & Directives
        </button>
        <button
          onClick={() => setActiveTab('reflect')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'reflect'
              ? 'border-[#00CFFF] text-[#F5F7F8] font-bold'
              : 'border-transparent text-[#9CA3A8] hover:text-[#F5F7F8]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#00CFFF]" /> Hindsight Reflection
        </button>
      </div>

      {/* Tab 1: Memory Layers */}
      {activeTab === 'layers' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {memoryLayers.map((layer, i) => (
              <div key={layer.name} className="p-5 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#00CFFF] font-bold">LAYER 0{i + 1}</span>
                  <span className="text-[10px] font-bold text-[#F5F7F8] uppercase bg-[#1A1D1F] px-2.5 py-0.5 rounded border border-[#2A2E31]">
                    {layer.name}
                  </span>
                </div>
                <h4 className="font-bold text-[#F5F7F8] text-xs">{layer.label}</h4>
                <p className="text-[11px] text-[#9CA3A8] font-sans leading-relaxed">{layer.desc}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3A8]">
              Representative Memory Provenance Trace
            </h3>
            <ProvenanceChain
              experimentId="exp_da6dea43fa"
              experimentName="Nickel-Catalyzed Cross Coupling Run 4"
              observationText="Catalyst decomposition above 150°C; 12% yield"
              memoryId="mem_9b3f1a"
              patternName="Thermal Instability Cluster #2"
              directiveText="Limit reaction temp to <140°C in ether solvents"
            />
          </div>
        </div>
      )}

      {/* Tab 2: Memory Recall */}
      {activeTab === 'recall' && (
        <div className="space-y-6 font-mono text-xs">
          <form onSubmit={handleSearch} className="p-4 rounded-xl bg-[#151718] border border-[#2A2E31] flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#697177]" />
              <input
                type="text"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Query accumulated institutional memory..."
                className="w-full bg-[#1A1D1F] border border-[#2A2E31] rounded-md pl-10 pr-3 py-2.5 text-[#F5F7F8] placeholder-[#697177] focus:outline-none focus:border-[#00CFFF]"
              />
            </div>
            <FlowButton
              type="submit"
              disabled={isSearching}
              text={isSearching ? "Recalling..." : "Execute Memory Recall"}
            />
          </form>

          {recalledMemories.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[#9CA3A8]">
                <span>Recalled {recalledMemories.length} relevant memories</span>
                <StatusBadge status={recallMode} label={`Integration: ${recallMode}`} />
              </div>

              <div className="space-y-3">
                {recalledMemories.map((mem, i) => (
                  <MemoryCard key={i} memory={mem} />
                ))}
              </div>
            </div>
          )}

          {recalledMemories.length === 0 && !isSearching && (
            <div className="p-12 border border-dashed border-[#2A2E31] rounded-xl text-center text-[#9CA3A8] font-sans">
              Enter a query above to execute Hindsight memory recall across historical experiment logs.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Mental Models */}
      {activeTab === 'models' && (
        <div className="space-y-6 font-mono text-xs">
          {loadingModels ? (
            <div className="p-12 text-center text-[#697177]">Loading mental models & directives...</div>
          ) : !models || models.length === 0 ? (
            <div className="p-12 border border-dashed border-[#2A2E31] rounded-xl text-center text-[#9CA3A8] font-sans">
              No scientific mental models generated yet. Trigger a reflection or log more reaction outcomes.
            </div>
          ) : (
            <div className="space-y-6">
              {models.map((model) => (
                <div key={model.id} className="p-5 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-4">
                  <div className="flex items-start justify-between border-b border-[#2A2E31] pb-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-bold text-[#F5F7F8]">{model.model_name}</h3>
                        <StatusBadge status={model.status} />
                      </div>
                      <p className="text-xs text-[#9CA3A8] font-sans mt-1">{model.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[#00CFFF] font-bold block">{Math.round(model.confidence * 100)}% Confidence</span>
                      <span className="text-[10px] text-[#697177]">{model.supporting_experiments_count} Supporting Experiments</span>
                    </div>
                  </div>

                  {model.directives && model.directives.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-semibold text-[#9CA3A8] uppercase tracking-wider block">
                        Associated Directives & Guidance:
                      </span>
                      {model.directives.map((dir) => (
                        <div key={dir.id} className="p-3 rounded-lg bg-[#1A1D1F] border border-[#2A2E31] flex items-center justify-between gap-3">
                          <p className="text-xs text-[#F5F7F8] font-sans flex-1">{dir.directive_text}</p>
                          <div className="flex items-center gap-2 shrink-0">
                            <StatusBadge status={dir.status} />
                            {dir.status === 'candidate' && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => approveDirectiveMutation.mutate({ id: dir.id, approved: true })}
                                  className="p-1.5 bg-[rgba(16,185,129,0.15)] hover:bg-[rgba(16,185,129,0.3)] text-[#10B981] border border-[#10B981]/30 rounded-md"
                                  title="Approve Directive"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => approveDirectiveMutation.mutate({ id: dir.id, approved: false })}
                                  className="p-1.5 bg-[rgba(239,68,68,0.15)] hover:bg-[rgba(239,68,68,0.3)] text-[#EF4444] border border-[#EF4444]/30 rounded-md"
                                  title="Reject Directive"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Reflect */}
      {activeTab === 'reflect' && (
        <div className="space-y-6 font-mono text-xs">
          <form onSubmit={handleReflect} className="p-4 rounded-xl bg-[#151718] border border-[#2A2E31] flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={reflectTopic}
              onChange={(e) => setReflectTopic(e.target.value)}
              placeholder="Topic or Project to synthesize (e.g. cross_coupling_reactions)..."
              className="flex-1 bg-[#1A1D1F] border border-[#2A2E31] rounded-md px-3.5 py-2.5 text-[#F5F7F8] focus:outline-none focus:border-[#00CFFF]"
            />
            <FlowButton
              type="submit"
              disabled={isReflecting}
              text={isReflecting ? "Synthesizing..." : "Trigger Hindsight Reflection"}
            />
          </form>

          {isReflecting ? (
            <div className="p-12 rounded-xl bg-[#151718] border border-[#2A2E31] text-center space-y-3">
              <div className="w-8 h-8 border-2 border-[#00CFFF] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#F5F7F8] font-bold">SYNTHESIZING CROSS-CAMPAIGN EXPERIENTIAL REFLECTION...</p>
            </div>
          ) : reflectionResult ? (
            <div className="p-6 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-5">
              <div className="flex items-center justify-between border-b border-[#2A2E31] pb-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#00CFFF]" />
                  <h3 className="text-sm font-bold text-[#F5F7F8] uppercase">
                    REFLECTION SUMMARY: {reflectionResult.topic || reflectTopic}
                  </h3>
                </div>
                <StatusBadge
                  status={reflectionResult.hindsight_integration || 'fallback'}
                  label={`Hindsight: ${reflectionResult.hindsight_integration || 'fallback'}`}
                />
              </div>

              {/* Reflection Summary Body */}
              <div className="p-4 rounded-lg bg-[#1A1D1F] border border-[#2A2E31] space-y-2">
                <span className="text-[10px] text-[#00CFFF] uppercase tracking-wider font-bold block">
                  SYNTHESIZED INSIGHT SUMMARY
                </span>
                <p className="text-xs text-[#F5F7F8] font-sans leading-relaxed">
                  {reflectionResult.summary ||
                    'Cross-campaign synthesis indicates that organometallic cross-coupling reactions display high sensitivity to local temperature thresholds. Thermal decomposition of palladium and nickel catalyst complexes is consistently observed above 150°C, leading to reduced product yields.'}
                </p>
              </div>

              {/* Key Insights List */}
              <div className="space-y-3 pt-1">
                <span className="text-[11px] uppercase tracking-wider text-[#9CA3A8] block font-semibold">
                  Key Synthesized Directives & Insights:
                </span>
                <div className="space-y-2 font-sans text-xs">
                  {(reflectionResult.key_insights || [
                    'Maintain reaction temperatures below 140°C when using polar aprotic solvents.',
                    'Solvent degradation accelerates byproduct formation in DMF systems above 175°C.',
                    'In-situ ligand stabilization using dppf extends catalyst life by 40% in nickel systems.'
                  ]).map((insight: string, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#1A1D1F] border border-[#2A2E31] flex items-start gap-2 text-[#F5F7F8]">
                      <CheckCircle2 className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 border border-dashed border-[#2A2E31] rounded-xl text-center text-[#9CA3A8] font-sans">
              Enter a topic above and click Trigger Hindsight Reflection to synthesize cross-campaign experience.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
