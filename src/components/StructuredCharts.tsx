import React, { useState } from 'react';
import {
  TableProperties,
  Search,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import { StructuredChart } from '../types';

interface StructuredChartsProps {
  charts: StructuredChart[];
}

export const StructuredCharts: React.FC<StructuredChartsProps> = ({ charts }) => {
  const [activeChartId, setActiveChartId] = useState<string>(charts[0]?.id || 'chart-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const activeChart = charts.find((c) => c.id === activeChartId) || charts[0];

  const filteredRows =
    activeChart?.rows.filter((row) => {
      if (!searchQuery) return true;
      return row.cells.some((cell) => cell.toLowerCase().includes(searchQuery.toLowerCase()));
    }) || [];

  const handleCopyMarkdown = () => {
    if (!activeChart) return;
    const headerLine = `| ${activeChart.headers.join(' | ')} |`;
    const separatorLine = `| ${activeChart.headers.map(() => '---').join(' | ')} |`;
    const rowLines = activeChart.rows.map((r) => `| ${r.cells.join(' | ')} |`).join('\n');
    const md = `# ${activeChart.title}\n${activeChart.subtitle}\n\n${headerLine}\n${separatorLine}\n${rowLines}\n\nNotes: ${activeChart.notes}`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!charts || charts.length === 0 || !activeChart) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-xl space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-800 flex items-center justify-center mx-auto text-cyan-400">
          <TableProperties className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">No Formula Matrices Generated</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Upload your notes or code in Ingestion Engine, then choose "Structured Charts & Tables" in the Study Generator
          to dynamically synthesize comparative matrices and pitfall cheat sheets.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="inline-flex items-center space-x-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
          <TableProperties className="w-3.5 h-3.5" />
          <span>Structured Charts, Proof Matrices & Formula Tables</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          High-Yield Formula Cheat Sheets & Pitfall Matrices
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Side-by-side comparative matrices identifying governing physical laws, critical calculation steps,
          and highest-probability exam traps across academic disciplines.
        </p>

        {/* Tab Switcher & Search Bar */}
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
          <div className="flex space-x-2">
            {charts.map((chart) => (
              <button
                key={chart.id}
                onClick={() => setActiveChartId(chart.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeChartId === chart.id
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/25 ring-1 ring-cyan-400/40'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {chart.title.split('&')[0]}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Search table..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <button
              onClick={handleCopyMarkdown}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs flex items-center space-x-1 px-2.5 transition-colors"
              title="Copy table as Markdown"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Markdown'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">{activeChart.title}</h2>
            <p className="text-xs text-slate-400">{activeChart.subtitle}</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">
            {filteredRows.length} Rows Listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                {activeChart.headers.map((h, i) => (
                  <th key={i} className="p-3.5 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className={`transition-colors ${
                    row.highlight
                      ? 'bg-cyan-950/20 hover:bg-cyan-950/30'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  {row.cells.map((cell, cIdx) => (
                    <td key={cIdx} className="p-3.5 text-slate-300 align-top leading-relaxed">
                      {cIdx === 0 && row.tag ? (
                        <div className="space-y-1">
                          <span className="font-bold text-white block">{cell}</span>
                          <span
                            className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              row.tag.includes('HIGH') || row.tag.includes('URGENT')
                                ? 'bg-red-950 text-red-300 border border-red-800'
                                : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            }`}
                          >
                            {row.tag}
                          </span>
                        </div>
                      ) : cell.includes('=') || cell.includes('∂') || cell.includes('∫') || cell.includes('Quorum') ? (
                        <span className="font-mono text-cyan-300 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800/80 inline-block text-[11px]">
                          {cell}
                        </span>
                      ) : (
                        <span>{cell}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Notes */}
        {activeChart.notes && (
          <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400 flex items-start space-x-2">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">Top Bencher Architectural Note:</strong> {activeChart.notes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
