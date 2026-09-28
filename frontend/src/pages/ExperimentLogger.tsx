import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createExperiment, logExperimentOutcome } from '../api/experiments';
import { Plus, Trash2, CheckCircle2, AlertTriangle, ArrowLeft, TestTube2 } from 'lucide-react';
import { FlowButton } from '../components/ui/FlowButton';
import { ToastPopup } from '../components/ui/ToastPopup';

export const ExperimentLogger: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [projectName, setProjectName] = useState('proj_palladium_cross_coupling');
  const [researcherId, setResearcherId] = useState('res_dr_elena');
  const [expName, setExpName] = useState('');
  const [description, setDescription] = useState('');
  const [expType, setExpType] = useState('reaction');

  // Parameters list
  const [parameters, setParameters] = useState<Array<{ name: string; value: string; unit: string }>>([
    { name: 'temperature', value: '155.0', unit: 'degC' },
    { name: 'solvent', value: 'Anisole', unit: '' },
    { name: 'catalyst', value: 'NiCl2(dppf)', unit: '' },
  ]);

  // Outcome states
  const [status, setStatus] = useState('success');
  const [yieldPct, setYieldPct] = useState('92.5');
  const [notes, setNotes] = useState('');

  const addParameterRow = () => {
    setParameters([...parameters, { name: '', value: '', unit: '' }]);
  };

  const removeParameterRow = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const updateParameterRow = (index: number, field: 'name' | 'value' | 'unit', val: string) => {
    const copy = [...parameters];
    copy[index][field] = val;
    setParameters(copy);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expName.trim()) {
      setErrorMsg('Experiment Name is required.');
      setToastMessage('Please enter an Experiment Name.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const createdExp = await createExperiment({
        project_id: projectName,
        researcher_id: researcherId,
        experiment_name: expName,
        description: description,
        experiment_type: expType,
        parameters: parameters
          .filter((p) => p.name.trim() !== '')
          .map((p) => ({
            parameter_name: p.name.trim(),
            parameter_value: p.value.trim(),
            numeric_value: isNaN(parseFloat(p.value)) ? undefined : parseFloat(p.value),
            unit: p.unit.trim() || undefined,
          })),
      });

      await logExperimentOutcome(createdExp.id, {
        status: status,
        yield_percentage: yieldPct ? parseFloat(yieldPct) : undefined,
        notes: notes || undefined,
        uncertainty_level: 'low',
      });

      const successStr = `Experiment ${createdExp.id} successfully saved & retained in Hindsight memory!`;
      setSuccessMsg(successStr);
      setToastMessage(successStr);

      setTimeout(() => {
        navigate(`/experiments/${createdExp.id}`);
      }, 2000);
    } catch (err: any) {
      const errStr = err.message || 'Failed to submit experiment.';
      setErrorMsg(errStr);
      setToastMessage(errStr);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans relative">
      <ToastPopup
        message={toastMessage}
        type={errorMsg ? 'error' : 'success'}
        onClose={() => setToastMessage(null)}
      />

      <button
        onClick={() => navigate('/experiments')}
        className="inline-flex items-center gap-2 text-xs font-mono text-[#9CA3A8] hover:text-[#00CFFF] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Experiments Workspace
      </button>

      <div className="border-b border-[#2A2E31] pb-4 font-mono">
        <h2 className="text-xl font-bold text-[#F5F7F8] flex items-center gap-2">
          <TestTube2 className="w-5 h-5 text-[#00CFFF]" /> RECORD REAL EXPERIMENT
        </h2>
        <p className="text-xs text-[#9CA3A8] font-sans mt-1">
          Log an actual scientific reaction run. Submitting persists parameters and automatically triggers Hindsight experience retention.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-[rgba(239,68,68,0.1)] border border-resona-failure/30 text-xs font-mono text-[#EF4444] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-[rgba(16,185,129,0.1)] border border-resona-success/30 text-xs font-mono text-[#10B981] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 font-mono text-xs">
        {/* Section 1: Metadata */}
        <div className="p-6 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#00CFFF] border-b border-[#2A2E31] pb-2.5">
            1. EXPERIMENT METADATA & REACTION SPECIFICATION
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#9CA3A8] mb-1.5 font-semibold">Project Identifier *</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-[#1A1D1F] border border-[#2A2E31] rounded-md px-3.5 py-2 text-[#F5F7F8] focus:outline-none focus:border-[#00CFFF]"
                required
              />
            </div>
            <div>
              <label className="block text-[#9CA3A8] mb-1.5 font-semibold">Researcher ID *</label>
              <input
                type="text"
                value={researcherId}
                onChange={(e) => setResearcherId(e.target.value)}
                className="w-full bg-[#1A1D1F] border border-[#2A2E31] rounded-md px-3.5 py-2 text-[#F5F7F8] focus:outline-none focus:border-[#00CFFF]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[#9CA3A8] mb-1.5 font-semibold">Experiment Name *</label>
            <input
              type="text"
              value={expName}
              onChange={(e) => setExpName(e.target.value)}
              placeholder="e.g. Nickel-Catalyzed Cross Coupling Run 4"
              className="w-full bg-[#1A1D1F] border border-[#2A2E31] rounded-md px-3.5 py-2 text-[#F5F7F8] placeholder-[#697177] focus:outline-none focus:border-[#00CFFF]"
              required
            />
          </div>

          <div>
            <label className="block text-[#9CA3A8] mb-1.5 font-semibold">Description & Context</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief context regarding reaction conditions, goals, or setup..."
              className="w-full bg-[#1A1D1F] border border-[#2A2E31] rounded-md px-3.5 py-2 text-[#F5F7F8] placeholder-[#697177] focus:outline-none focus:border-[#00CFFF] font-sans"
            />
          </div>
        </div>

        {/* Section 2: Parameters */}
        <div className="p-6 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-4">
          <div className="flex items-center justify-between border-b border-[#2A2E31] pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#00CFFF]">
              2. CHEMICAL & PHYSICAL PARAMETERS
            </h3>
            <button
              type="button"
              onClick={addParameterRow}
              className="text-[#00CFFF] hover:underline flex items-center gap-1.5 text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" /> Add Parameter
            </button>
          </div>

          <div className="space-y-3">
            {parameters.map((param, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Parameter (e.g. temperature)"
                  value={param.name}
                  onChange={(e) => updateParameterRow(idx, 'name', e.target.value)}
                  className="flex-1 bg-[#1A1D1F] border border-[#2A2E31] rounded-md px-3 py-2 text-[#F5F7F8] placeholder-[#697177] focus:outline-none focus:border-[#00CFFF]"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 155.0)"
                  value={param.value}
                  onChange={(e) => updateParameterRow(idx, 'value', e.target.value)}
                  className="flex-1 bg-[#1A1D1F] border border-[#2A2E31] rounded-md px-3 py-2 text-[#F5F7F8] placeholder-[#697177] focus:outline-none focus:border-[#00CFFF]"
                />
                <input
                  type="text"
                  placeholder="Unit (e.g. degC)"
                  value={param.unit}
                  onChange={(e) => updateParameterRow(idx, 'unit', e.target.value)}
                  className="w-28 bg-[#1A1D1F] border border-[#2A2E31] rounded-md px-3 py-2 text-[#F5F7F8] placeholder-[#697177] focus:outline-none focus:border-[#00CFFF]"
                />
                {parameters.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeParameterRow(idx)}
                    className="p-1.5 text-[#697177] hover:text-[#EF4444] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Outcomes */}
        <div className="p-6 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#00CFFF] border-b border-[#2A2E31] pb-2.5">
            3. REACTION OUTCOME & RESULTS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#9CA3A8] mb-1.5 font-semibold">Outcome Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#1A1D1F] border border-[#2A2E31] rounded-md px-3.5 py-2 text-[#F5F7F8] focus:outline-none focus:border-[#00CFFF] cursor-pointer"
              >
                <option value="success" className="bg-[#1A1D1F] text-[#F5F7F8]">Success</option>
                <option value="failure" className="bg-[#1A1D1F] text-[#F5F7F8]">Failure</option>
                <option value="partial" className="bg-[#1A1D1F] text-[#F5F7F8]">Partial Success</option>
              </select>
            </div>
            <div>
              <label className="block text-[#9CA3A8] mb-1.5 font-semibold">Yield Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                value={yieldPct}
                onChange={(e) => setYieldPct(e.target.value)}
                placeholder="e.g. 94.2"
                className="w-full bg-[#1A1D1F] border border-[#2A2E31] rounded-md px-3.5 py-2 text-[#F5F7F8] placeholder-[#697177] focus:outline-none focus:border-[#00CFFF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#9CA3A8] mb-1.5 font-semibold">Observations & Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Clear conversion observed via HPLC; zero precipitate..."
              className="w-full bg-[#1A1D1F] border border-[#2A2E31] rounded-md px-3.5 py-2 text-[#F5F7F8] placeholder-[#697177] focus:outline-none focus:border-[#00CFFF] font-sans"
            />
          </div>
        </div>

        {/* Submit with FlowButton (explicitly type="submit") */}
        <div className="flex justify-end pt-2">
          <FlowButton
            type="submit"
            text={submitting ? 'Logging & Retaining Experience...' : 'Save & Retain Experience'}
            disabled={submitting}
          />
        </div>
      </form>
    </div>
  );
};
