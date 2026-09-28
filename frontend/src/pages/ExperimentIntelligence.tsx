import React, { useState, useEffect } from 'react';
import { reviewProposal } from '../api/proposals';
import { ProposalReviewResponse } from '../types';
import { ConfidenceIndicator } from '../components/ui/ConfidenceIndicator';
import { EvidenceDrawer } from '../components/ui/EvidenceDrawer';
import { StatusBadge } from '../components/ui/StatusBadge';
import { FlowButton } from '../components/ui/FlowButton';
import { MemoryCard } from '../components/ui/MemoryCard';
import { ToastPopup } from '../components/ui/ToastPopup';
import { Layers, ArrowRight, ShieldCheck, Cpu, Search, AlertOctagon, FileText } from 'lucide-react';

export const ExperimentIntelligence: React.FC = () => {
  const [expName, setExpName] = useState('High Temp Suzuki Coupling Run A3');
  const [description, setDescription] = useState('Cross coupling reaction using Pd(PPh3)4 in DMF heated to 185degC');
  const [temp, setTemp] = useState('185');
  const [solvent, setSolvent] = useState('DMF');
  const [catalyst, setCatalyst] = useState('Pd(PPh3)4');
  const [concentration, setConcentration] = useState('0.5');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProposalReviewResponse | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleEvaluate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      const res = await reviewProposal({
        experiment_name: expName,
        description: description,
        proposed_parameters: {
          temperature: temp,
          solvent: solvent,
          catalyst: catalyst,
          concentration: concentration,
        },
      });
      setResult(res);
      setToastMsg('Proposal evaluated against Hindsight memory!');
    } catch (err: any) {
      console.error('Failed to evaluate proposal', err);
      setToastMsg(err.message || 'Failed to evaluate proposal against memory.');
    } finally {
      setLoading(false);
    }
  };

  // Pre-evaluate default proposal on mount if result is not loaded
  useEffect(() => {
    if (!result && !loading) {
      handleEvaluate();
    }
  }, []);

  return (
    <div className="space-y-6 font-sans relative">
      <ToastPopup
        message={toastMsg}
        type={result ? 'success' : 'error'}
        onClose={() => setToastMsg(null)}
      />

      <div className="border-b border-[#2A2E31] pb-4 font-mono">
        <span className="text-[10px] text-[#00CFFF] font-bold uppercase tracking-wider block">
          DECISION INTELLIGENCE ENGINE
        </span>
        <h2 className="text-2xl font-bold text-[#F5F7F8]">EXPERIMENT INTELLIGENCE</h2>
        <p className="text-xs text-[#9CA3A8] mt-1 font-sans">
          Evaluate a proposed experiment using accumulated scientific experience before laboratory execution. Surface historical failure risks and evidence-backed parameter alternatives.
        </p>
      </div>

      {/* PROPOSAL FORM CARD */}
      <div className="p-6 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-5 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[#2A2E31] pb-3">
          <h3 className="text-xs font-bold text-[#F5F7F8] uppercase flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#00CFFF]" /> PROPOSED EXPERIMENT SPECIFICATION
          </h3>
          <span className="text-[10px] text-[#697177]">Step 1 of Decision Pipeline</span>
        </div>

        <form onSubmit={handleEvaluate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#9CA3A8] mb-1.5 font-semibold">Proposed Experiment Name *</label>
              <input
                type="text"
                value={expName}
                onChange={(e) => setExpName(e.target.value)}
                className="w-full bg-[#1A1D1F] border border-[#2A2E31] rounded-md px-3.5 py-2 text-[#F5F7F8] focus:outline-none focus:border-[#00CFFF]"
                required
              />
            </div>
            <div>
              <label className="block text-[#9CA3A8] mb-1.5 font-semibold">Reaction Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#1A1D1F] border border-[#2A2E31] rounded-md px-3.5 py-2 text-[#F5F7F8] focus:outline-none focus:border-[#00CFFF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
            <div>
              <label className="block text-[#9CA3A8] mb-1.5 font-semibold">Temperature (°C)</label>
              <input
                type="text"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                className="w-full bg-[#1A1D1F] border border-[#2A2E31] rounded-md px-3 py-2 text-[#F5F7F8] focus:outline-none focus:border-[#00CFFF]"
              />
            </div>
            <div>
              <label className="block text-[#9CA3A8] mb-1.5 font-semibold">Concentration (M)</label>
              <input
                type="text"
                value={concentration}
                onChange={(e) => setConcentration(e.target.value)}
                className="w-full bg-[#1A1D1F] border border-[#2A2E31] rounded-md px-3 py-2 text-[#F5F7F8] focus:outline-none focus:border-[#00CFFF]"
              />
            </div>
            <div>
              <label className="block text-[#9CA3A8] mb-1.5 font-semibold">Solvent</label>
              <input
                type="text"
                value={solvent}
                onChange={(e) => setSolvent(e.target.value)}
                className="w-full bg-[#1A1D1F] border border-[#2A2E31] rounded-md px-3 py-2 text-[#F5F7F8] focus:outline-none focus:border-[#00CFFF]"
              />
            </div>
            <div>
              <label className="block text-[#9CA3A8] mb-1.5 font-semibold">Catalyst</label>
              <input
                type="text"
                value={catalyst}
                onChange={(e) => setCatalyst(e.target.value)}
                className="w-full bg-[#1A1D1F] border border-[#2A2E31] rounded-md px-3 py-2 text-[#F5F7F8] focus:outline-none focus:border-[#00CFFF]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <FlowButton
              type="submit"
              text={loading ? "Evaluating Memory..." : "Evaluate Proposal Against Memory"}
            />
          </div>
        </form>
      </div>

      {/* EVALUATION RESULTS PANEL */}
      {loading ? (
        <div className="p-12 rounded-xl bg-[#151718] border border-[#2A2E31] text-center font-mono space-y-3">
          <div className="w-8 h-8 border-2 border-[#00CFFF] border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-1">
            <span className="font-semibold text-[#F5F7F8]">RECALLING EXPERIENCE • SEARCHING HISTORICAL RECORDS</span>
            <span className="text-[11px] text-[#697177] block">ANALYZING FAILURES • CHECKING CONTRADICTIONS • GENERATING COUNTERFACTUALS</span>
          </div>
        </div>
      ) : result ? (
        <div className="space-y-6 font-mono text-xs">
          {/* TOP SUMMARY BANNER */}
          <div className="p-6 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2A2E31] pb-3">
              <div>
                <span className="text-[10px] text-[#00CFFF] uppercase tracking-wider font-bold block">
                  RECOMMENDATION SYNTHESIS
                </span>
                <h3 className="text-base font-bold text-[#F5F7F8]">{result.recommendation}</h3>
              </div>
              <StatusBadge status={result.memory_mode} label={`Hindsight Mode: ${result.memory_mode}`} />
            </div>

            <p className="text-xs text-[#9CA3A8] font-sans leading-relaxed">{result.uncertainty_note}</p>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setDrawerOpen(true)}
                className="px-4 py-2 bg-[#1A1D1F] hover:bg-[#2A2E31] text-[#00CFFF] border border-[#2A2E31] rounded-lg font-bold flex items-center gap-2 transition-colors"
              >
                <Layers className="w-4 h-4" /> Inspect Evidence Trace ({result.provenance.length})
              </button>
            </div>

            {/* HISTORICAL EVIDENCE Breakdown */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] text-[#697177] uppercase tracking-wider block font-semibold">HISTORICAL EVIDENCE</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-[#1A1D1F] border border-[#2A2E31]">
                  <span className="text-[10px] text-[#9CA3A8] uppercase block font-semibold">Similar Experiments</span>
                  <span className="text-xl font-bold text-[#F5F7F8]">{result.similar_experiments_count}</span>
                </div>

                <div className="p-4 rounded-lg bg-[#1A1D1F] border border-[#2A2E31]">
                  <span className="text-[10px] text-[#9CA3A8] uppercase block font-semibold">Successes / Failures</span>
                  <span className="text-lg font-bold text-[#10B981]">{result.historical_successes_count}</span>
                  <span className="text-[#697177]"> / </span>
                  <span className="text-lg font-bold text-[#EF4444]">{result.historical_failures_count}</span>
                </div>

                <div className="p-4 rounded-lg bg-[#1A1D1F] border border-[#2A2E31]">
                  <span className="text-[10px] text-[#9CA3A8] uppercase block font-semibold">Contradictions Found</span>
                  <span className={`text-xl font-bold ${result.decision_support.contradiction_count > 0 ? 'text-[#F59E0B]' : 'text-[#F5F7F8]'}`}>
                    {result.decision_support.contradiction_count}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contradiction Alert Box */}
          {result.decision_support.contradiction_count > 0 && (
            <div className="p-5 rounded-xl bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)] space-y-2 text-[#F59E0B]">
              <div className="flex items-center gap-2 font-bold text-xs uppercase">
                <AlertOctagon className="w-4 h-4" /> Historical Contradiction Alert
              </div>
              <p className="text-xs font-sans text-[#F5F7F8] leading-relaxed">
                Historical experiment records exhibit conflicting outcome signals. Some runs report successful product yields, while others under identical or near-identical conditions reported thermal instability or decomposition above 180°C.
              </p>
            </div>
          )}

          {/* System Confidence Evaluation */}
          <ConfidenceIndicator confidence={result.confidence} />

          {/* HINDSIGHT MEMORY */}
          {result.hindsight_recalled_experience && result.hindsight_recalled_experience.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3A8] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#00CFFF]" /> HINDSIGHT RECALLED MEMORY ({result.hindsight_recalled_experience.length})
              </h3>

              <div className="space-y-3">
                {result.hindsight_recalled_experience.slice(0, 3).map((mem, idx) => (
                  <MemoryCard key={idx} memory={mem} />
                ))}
              </div>
            </div>
          )}

          {/* COUNTERFACTUAL SUGGESTIONS */}
          {result.counterfactual_suggestions && result.counterfactual_suggestions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3A8] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00CFFF]" /> EVIDENCE-BACKED COUNTERFACTUAL ALTERNATIVES
              </h3>

              <div className="space-y-3">
                {result.counterfactual_suggestions.map((cf, idx) => (
                  <div key={idx} className="p-5 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="px-2.5 py-1 rounded-md bg-[rgba(239,68,68,0.1)] text-[#EF4444] border border-[rgba(239,68,68,0.3)] font-medium">
                          Current: {typeof cf.original_config === 'object' && cf.original_config ? Object.entries(cf.original_config).map(([k, v]) => `${k}: ${v}`).join(', ') : String(cf.original_config).replace(/^\{|\}$/g, '')}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#697177]" />
                        <span className="px-2.5 py-1 rounded-md bg-[rgba(16,185,129,0.1)] text-[#10B981] border border-[rgba(16,185,129,0.3)] font-bold">
                          Alternative: {typeof cf.suggested_modification === 'object' && cf.suggested_modification ? Object.entries(cf.suggested_modification).map(([k, v]) => `${k}: ${v}`).join(', ') : String(cf.suggested_modification).replace(/^\{|\}$/g, '')}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#00CFFF]">Confidence: {Math.round(cf.confidence_score * 100)}%</span>
                    </div>

                    <p className="text-xs text-[#F5F7F8] font-sans leading-relaxed">{cf.reasoning}</p>

                    <div className="p-3 rounded-lg bg-[#1A1D1F] border border-[#2A2E31] text-[11px] text-[#9CA3A8] font-sans">
                      <strong className="text-[#F5F7F8] font-mono text-[10px] uppercase block mb-0.5">Historical Evidence Summary:</strong>
                      {cf.historical_evidence_summary}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence Drawer Modal */}
          {result && (
            <EvidenceDrawer
              isOpen={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              provenance={result.provenance}
              memories={result.hindsight_recalled_experience}
            />
          )}
        </div>
      ) : null}
    </div>
  );
};
