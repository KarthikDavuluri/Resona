import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchExperiments } from '../api/experiments';
import { submitFeedback } from '../api/feedback';
import { Users, User, ThumbsUp, ThumbsDown, CheckCircle2, FlaskConical } from 'lucide-react';
import { FlowButton } from '../components/ui/FlowButton';
import { ToastPopup } from '../components/ui/ToastPopup';

export const Researchers: React.FC = () => {
  const { data: experiments } = useQuery({
    queryKey: ['experiments'],
    queryFn: () => fetchExperiments({ limit: 100 }),
  });

  const [feedbackEntityId, setFeedbackEntityId] = useState('');
  const [feedbackEntityType, setFeedbackEntityType] = useState('recommendation');
  const [isHelpful, setIsHelpful] = useState(true);
  const [comment, setComment] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const feedbackMutation = useMutation({
    mutationFn: submitFeedback,
    onSuccess: () => {
      setFeedbackSuccess(true);
      setToastMsg('Researcher feedback successfully logged to system audit ledger!');
      setComment('');
      setFeedbackEntityId('');
      setTimeout(() => setFeedbackSuccess(false), 3000);
    },
    onError: (err: any) => {
      setToastMsg(err.message || 'Failed to submit feedback.');
    },
  });

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackEntityId.trim()) return;
    feedbackMutation.mutate({
      target_entity_id: feedbackEntityId.trim(),
      target_entity_type: feedbackEntityType,
      is_helpful: isHelpful,
      comment: comment || undefined,
      researcher_id: 'res_dr_elena',
    });
  };

  const researcherStats: Record<string, number> = {};
  (experiments || []).forEach((exp) => {
    const id = exp.researcher_id || 'res_dr_elena';
    researcherStats[id] = (researcherStats[id] || 0) + 1;
  });

  return (
    <div className="space-y-6 font-sans relative">
      <ToastPopup
        message={toastMsg}
        type={feedbackMutation.isError ? 'error' : 'success'}
        onClose={() => setToastMsg(null)}
      />

      <div className="border-b border-[#2A2E31] pb-4 font-mono">
        <h2 className="text-xl font-bold text-[#F5F7F8] flex items-center gap-2">
          <Users className="w-5 h-5 text-[#00CFFF]" /> RESEARCHER WORKSPACES & FEEDBACK
        </h2>
        <p className="text-xs text-[#9CA3A8] font-sans mt-0.5">
          Institutional multi-user contributions, experiment logs, and active memory feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
        {/* Left Column (6 cols): Active Researchers */}
        <div className="lg:col-span-6 p-6 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-4">
          <div className="flex items-center justify-between border-b border-[#2A2E31] pb-2.5">
            <h3 className="text-xs font-bold text-[#F5F7F8] uppercase tracking-wider flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-[#00CFFF]" /> ACTIVE INSTITUTIONAL RESEARCHERS
            </h3>
            <span className="text-[10px] text-[#697177] font-mono">{Object.keys(researcherStats).length} Active Profiles</span>
          </div>

          <div className="space-y-3">
            {Object.entries(researcherStats).map(([resId, count]) => (
              <div key={resId} className="p-4 rounded-xl bg-[#1A1D1F] border border-[#2A2E31] flex items-center justify-between hover:border-[#00CFFF] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#151718] border border-[#2A2E31] flex items-center justify-center text-[#00CFFF] font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5F7F8] text-xs">{resId}</h4>
                    <span className="text-[10px] text-[#9CA3A8] block font-sans">Senior Research Chemist</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[#10B981] font-bold text-sm block">{count}</span>
                  <span className="text-[10px] text-[#697177] uppercase font-semibold">Experiments Logged</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (6 cols): Submit Feedback */}
        <div className="lg:col-span-6 p-6 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-4">
          <h3 className="text-xs font-bold text-[#F5F7F8] uppercase tracking-wider border-b border-[#2A2E31] pb-2.5">
            SUBMIT RESEARCHER FEEDBACK
          </h3>

          {feedbackSuccess && (
            <div className="p-3 rounded-lg bg-[rgba(16,185,129,0.1)] border border-resona-success/30 text-[#10B981] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Feedback submitted to RESONA audit ledger!
            </div>
          )}

          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <label className="block text-[#9CA3A8] mb-1.5 font-semibold">Target Entity Type</label>
              <select
                value={feedbackEntityType}
                onChange={(e) => setFeedbackEntityType(e.target.value)}
                className="w-full bg-[#1A1D1F] border border-[#2A2E31] rounded-md px-3.5 py-2 text-[#F5F7F8] focus:outline-none focus:border-[#00CFFF] cursor-pointer"
              >
                <option value="recommendation" className="bg-[#1A1D1F] text-[#F5F7F8]">Proposal Recommendation</option>
                <option value="memory" className="bg-[#1A1D1F] text-[#F5F7F8]">Experiential Memory</option>
                <option value="pattern" className="bg-[#1A1D1F] text-[#F5F7F8]">Discovered Pattern</option>
                <option value="counterfactual" className="bg-[#1A1D1F] text-[#F5F7F8]">Counterfactual Alternative</option>
              </select>
            </div>

            <div>
              <label className="block text-[#9CA3A8] mb-1.5 font-semibold">Target Entity ID</label>
              <input
                type="text"
                value={feedbackEntityId}
                onChange={(e) => setFeedbackEntityId(e.target.value)}
                placeholder="e.g. mem_8f912a or pat_cluster_0"
                className="w-full bg-[#1A1D1F] border border-[#2A2E31] rounded-md px-3.5 py-2 text-[#F5F7F8] placeholder-[#697177] focus:outline-none focus:border-[#00CFFF]"
                required
              />
            </div>

            <div className="flex items-center gap-4 py-1">
              <label className="text-[#9CA3A8] font-semibold">Utility Rating:</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsHelpful(true)}
                  className={`px-3 py-1.5 rounded-md border flex items-center gap-1.5 transition-colors text-xs font-bold ${
                    isHelpful
                      ? 'bg-[rgba(16,185,129,0.15)] text-[#10B981] border-[#10B981]'
                      : 'bg-[#1A1D1F] text-[#9CA3A8] border-[#2A2E31]'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" /> Helpful
                </button>
                <button
                  type="button"
                  onClick={() => setIsHelpful(false)}
                  className={`px-3 py-1.5 rounded-md border flex items-center gap-1.5 transition-colors text-xs font-bold ${
                    !isHelpful
                      ? 'bg-[rgba(239,68,68,0.15)] text-[#EF4444] border-[#EF4444]'
                      : 'bg-[#1A1D1F] text-[#9CA3A8] border-[#2A2E31]'
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" /> Unhelpful
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[#9CA3A8] mb-1.5 font-semibold">Comment / Validation Rationale</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Explain why this historical memory was helpful or unhelpful..."
                className="w-full bg-[#1A1D1F] border border-[#2A2E31] rounded-md px-3.5 py-2 text-[#F5F7F8] placeholder-[#697177] focus:outline-none focus:border-[#00CFFF] font-sans"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <FlowButton
                type="submit"
                disabled={feedbackMutation.isPending}
                text={feedbackMutation.isPending ? "Submitting..." : "Log Researcher Feedback"}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
