import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchExperiments } from '../api/experiments';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, ZAxis } from 'recharts';
import { Sliders, Filter, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ParameterSpace: React.FC = () => {
  const { data: experiments, isLoading } = useQuery({
    queryKey: ['experiments-parameter-space'],
    queryFn: () => fetchExperiments({ limit: 100 }),
  });

  const [selectedParamName, setSelectedParamName] = useState('temperature');

  const scatterData = (experiments || [])
    .map((exp) => {
      const outcome = exp.outcomes && exp.outcomes.length > 0 ? exp.outcomes[0] : null;
      if (!outcome || outcome.yield_percentage == null) return null;

      const targetParam = (exp.parameters || []).find(
        (p) => p.parameter_name.toLowerCase().includes(selectedParamName.toLowerCase())
      );

      const val = targetParam?.numeric_value ?? parseFloat(targetParam?.parameter_value || '');
      if (isNaN(val)) return null;

      return {
        id: exp.id,
        name: exp.experiment_name,
        x: val,
        y: outcome.yield_percentage,
        status: outcome.status,
        unit: targetParam?.unit || '',
      };
    })
    .filter(Boolean) as Array<{ id: string; name: string; x: number; y: number; status: string; unit: string }>;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2E31] pb-4 font-mono">
        <div>
          <h2 className="text-xl font-bold text-[#F5F7F8] flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#00CFFF]" /> PARAMETER SPACE & EVIDENCE DENSITY MAP
          </h2>
          <p className="text-xs text-[#9CA3A8] font-sans mt-0.5">
            Visualize tested chemical parameters against yield outcomes to identify high-yield regimes, failure clusters, and low-evidence unexplored regions.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-[#697177]" />
          <span className="text-[#9CA3A8]">Parameter Axis:</span>
          <select
            value={selectedParamName}
            onChange={(e) => setSelectedParamName(e.target.value)}
            className="bg-[#151718] border border-[#2A2E31] rounded-md px-3 py-1.5 text-xs text-[#F5F7F8] focus:outline-none focus:border-[#00CFFF]"
          >
            <option value="temperature">Temperature</option>
            <option value="concentration">Concentration</option>
            <option value="catalyst_loading">Catalyst Loading</option>
          </select>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="p-5 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-3 font-mono text-xs">
        <span className="text-[10px] text-[#00CFFF] uppercase font-bold tracking-wider block">
          PARAMETER LANDSCAPE ANALYSIS
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans text-xs">
          <div className="p-3.5 rounded-lg bg-[#1A1D1F] border border-[#2A2E31] space-y-1">
            <div className="font-bold text-[#F5F7F8] flex items-center gap-1.5 font-mono text-xs">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" /> High Yield Zones
            </div>
            <p className="text-[#9CA3A8] text-[11px] leading-relaxed">
              Dense clusters above 70% yield indicate stable, repeatable reaction regimes.
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-[#1A1D1F] border border-[#2A2E31] space-y-1">
            <div className="font-bold text-[#F5F7F8] flex items-center gap-1.5 font-mono text-xs">
              <AlertTriangle className="w-4 h-4 text-[#EF4444]" /> Failure Clusters
            </div>
            <p className="text-[#9CA3A8] text-[11px] leading-relaxed">
              Recurring low yield (under 40%) or decomposition data points isolate instability boundaries.
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-[#1A1D1F] border border-[#2A2E31] space-y-1">
            <div className="font-bold text-[#F5F7F8] flex items-center gap-1.5 font-mono text-xs">
              <HelpCircle className="w-4 h-4 text-[#F59E0B]" /> Low-Evidence Gaps
            </div>
            <p className="text-[#9CA3A8] text-[11px] leading-relaxed">
              Unexplored parameter gaps highlight candidates for future DOE (Design of Experiments).
            </p>
          </div>
        </div>
      </div>

      {/* Chart Panel */}
      <div className="p-6 rounded-xl bg-[#151718] border border-[#2A2E31] space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between text-xs text-[#9CA3A8] pb-2 border-b border-[#2A2E31]">
          <span>
            Plotting: {selectedParamName.toUpperCase()} vs YIELD (%) [{scatterData.length} valid data points]
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block" /> High Yield (≥70%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] inline-block" /> Low Yield / Failure</span>
          </div>
        </div>

        {isLoading ? (
          <div className="h-80 flex items-center justify-center text-[#697177]">Loading parameter plot data...</div>
        ) : scatterData.length === 0 ? (
          <div className="h-80 flex flex-col items-center justify-center text-[#697177] space-y-2 font-sans">
            <p>No numeric parameter values found matching "{selectedParamName}".</p>
            <p className="text-[11px] text-[#697177] font-mono">Ensure experiments have numeric parameters logged.</p>
          </div>
        ) : (
          <div className="h-80 w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2E31" />
                <XAxis type="number" dataKey="x" name={selectedParamName} stroke="#697177" tick={{ fontSize: 11, fill: '#9CA3A8' }} />
                <YAxis type="number" dataKey="y" name="Yield" unit="%" stroke="#697177" tick={{ fontSize: 11, fill: '#9CA3A8' }} domain={[0, 100]} />
                <ZAxis type="number" range={[60, 60]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-[#1A1D1F] border border-[#2A2E31] rounded-lg shadow text-xs space-y-1 font-mono">
                          <p className="font-bold text-[#F5F7F8]">{data.name}</p>
                          <p className="text-[#9CA3A8]">ID: {data.id}</p>
                          <p className={data.y >= 70 ? 'text-[#10B981] font-bold' : 'text-[#EF4444] font-bold'}>
                            Yield: {data.y}%
                          </p>
                          <p className="text-[#F5F7F8]">
                            {selectedParamName}: {data.x} {data.unit}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Experiments" data={scatterData} fill="#00CFFF" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {scatterData.length > 0 && (
        <div className="border border-[#2A2E31] rounded-xl overflow-hidden bg-[#151718] font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2A2E31] bg-[#111314] text-[#9CA3A8] text-[11px] uppercase">
                <th className="py-3 px-4">Experiment Record</th>
                <th className="py-3 px-3">{selectedParamName} Value</th>
                <th className="py-3 px-3 text-right">Yield (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2E31]">
              {scatterData.map((pt) => (
                <tr key={pt.id} className="hover:bg-[#1A1D1F] transition-colors">
                  <td className="py-3 px-4">
                    <Link to={`/experiments/${pt.id}`} className="font-semibold text-[#F5F7F8] hover:text-[#00CFFF] transition-colors">
                      {pt.name}
                    </Link>
                  </td>
                  <td className="py-3 px-3 text-[#F5F7F8]">
                    {pt.x} {pt.unit}
                  </td>
                  <td className={`py-3 px-3 text-right font-bold ${pt.y >= 70 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {pt.y}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
