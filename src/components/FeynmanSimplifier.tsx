import React, { useState } from 'react';
import {
  Baby,
  Sparkles,
  AlertOctagon,
  CheckCircle2,
  Lightbulb,
  RotateCcw,
  Zap,
  FileText,
  ShieldCheck,
  Compass,
  Layers,
} from 'lucide-react';
import { DocumentItem, FeynmanCritique } from '../types';
import { evaluateFeynmanExplanation } from '../utils/studyEngine';

interface FeynmanSimplifierProps {
  documents: DocumentItem[];
  preselectedTopic?: string;
  onSaveAnalysis?: (critique: FeynmanCritique, topic: string, explanation: string) => void;
}

export const FeynmanSimplifier: React.FC<FeynmanSimplifierProps> = ({
  documents,
  preselectedTopic,
  onSaveAnalysis,
}) => {
  const [topic, setTopic] = useState<string>(
    preselectedTopic ||
      (documents[0]
        ? documents[0].name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
        : 'Electrochemistry Nernst Equation')
  );
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || '');
  const [explanation, setExplanation] = useState<string>('');
  const [critique, setCritique] = useState<FeynmanCritique | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  const handleSelectDoc = (doc: DocumentItem) => {
    setSelectedDocId(doc.id);
    const cleanTopic = doc.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    setTopic(cleanTopic);
  };

  const handleRunEvaluation = () => {
    if (!explanation.trim()) return;
    const currentTopic = topic.trim() || selectedDoc?.name || 'Uploaded Concept';

    setIsAnalyzing(true);
    setTimeout(() => {
      const result = evaluateFeynmanExplanation(explanation, currentTopic, selectedDoc?.content);
      setCritique(result);
      setIsAnalyzing(false);
      if (onSaveAnalysis) {
        onSaveAnalysis(result, currentTopic, explanation);
      }
    }, 450);
  };

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="inline-flex items-center space-x-2 text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">
          <Baby className="w-3.5 h-3.5" />
          <span>Component 5: Feynman Technique Simplification & Verification Engine</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          "If you can't explain it to a six-year-old, you don't understand it yourself."
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Richard Feynman's ultimate litmus test. Explain any uploaded concept or custom topic using everyday sensory analogies.
          The engine dynamically evaluates your exact text against foundational axioms, detects jargon crutches, and provides
          a structured 4-pillar post-analysis breakdown.
        </p>

        {/* Dynamic Topic Selector from Uploaded Files */}
        {documents.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-violet-400" />
              <span>Target an Uploaded Document:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {documents.map((doc) => {
                const clean = doc.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
                const isSelected = selectedDocId === doc.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => handleSelectDoc(doc)}
                    className={`px-3 py-1.5 rounded-lg border text-xs transition-all flex items-center space-x-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-violet-950/70 border-violet-500 text-white font-semibold ring-1 ring-violet-500/30'
                        : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span>{clean}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-violet-300 border border-slate-800">
                      {doc.subject}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Topic / Concept
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter any concept (e.g. Electrochemistry Nernst Equation, Carnot Cycle, Dijkstra)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Your Plain-Language Explanation (As If Teaching a 6-Year-Old)
                </label>
                <span className="text-[11px] text-slate-500 font-mono">
                  {explanation.trim() ? explanation.trim().split(/\s+/).length : 0} words
                </span>
              </div>
              <textarea
                rows={9}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Explain the idea simply using a physical analogy: 'Think of two water tanks...', 'Imagine building a sandcastle on a breezy beach...', 'Like a game where kids pass a ball...'. Describe *why* it happens and avoid textbook buzzwords!"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 leading-relaxed font-sans"
              />
            </div>

            {/* Quick Prompts to Test */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <span className="font-semibold text-slate-300 block">💡 Quick Test Explanations:</span>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setTopic('Electrochemistry Nernst Equation');
                    setExplanation('Think of two connected water tanks. When one tank is full of water and the other is empty, the water pushes through the pipe with lots of pressure like electric voltage. As the other tank fills up, the pressure drops until water stops moving.');
                  }}
                  className="text-left text-violet-400 hover:text-violet-300 truncate cursor-pointer"
                >
                  • Try Clean Analogy: Water Tanks (Nernst Equation)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTopic('Quantum Superposition');
                    setExplanation('The wavefunction has an orthonormal Hamiltonian eigenvalue with differential divergence and quantum superposition in Hilbert space.');
                  }}
                  className="text-left text-red-400 hover:text-red-300 truncate cursor-pointer"
                >
                  • Try Jargon-Heavy Text: Textbook Jargon Trap
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={handleRunEvaluation}
                disabled={isAnalyzing || !explanation.trim()}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  isAnalyzing || !explanation.trim()
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/30'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Clarity, Jargon & Uploaded Alignment...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Run Feynman Critique & Audit</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setExplanation('');
                  setCritique(null);
                }}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Reset Input"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Structured 4-Pillar Post-Analysis Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          {critique ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
              {/* Verdict Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Post-Analysis Diagnostic Verdict
                  </span>
                  <div className="flex items-center space-x-2 mt-0.5">
                    {critique.verdict === 'MASTERED' && (
                      <span className="text-sm font-extrabold text-emerald-400 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>FEYNMAN MASTERY ACHIEVED</span>
                      </span>
                    )}
                    {critique.verdict === 'DEVELOPING' && (
                      <span className="text-sm font-extrabold text-amber-400 flex items-center space-x-1.5">
                        <Lightbulb className="w-4 h-4" />
                        <span>DEVELOPING INTUITION (PARTIAL GAPS)</span>
                      </span>
                    )}
                    {critique.verdict === 'RE-EXPLAIN_REQUIRED' && (
                      <span className="text-sm font-extrabold text-red-400 flex items-center space-x-1.5">
                        <AlertOctagon className="w-4 h-4" />
                        <span>RE-EXPLANATION REQUIRED (JARGON CRUTCH)</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-white">{critique.overallScore}/100</div>
                  <div className="text-[10px] text-slate-400">Mastery Index</div>
                </div>
              </div>

              {/* PILLAR 1: Conceptual Clarity & Simplicity Scores */}
              <div className="space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Pillar 1: Conceptual Clarity & Simplicity Profile</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Clarity Index</span>
                      <span className="font-bold text-white">{critique.clarityScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${critique.clarityScore}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Sentence coherence & logic flow</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Simplicity Index</span>
                      <span className="font-bold text-white">{critique.simplicityScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 rounded-full transition-all duration-500"
                        style={{ width: `${critique.simplicityScore}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Everyday vernacular usage</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Child Analogy</span>
                      <span className="font-bold text-violet-300">{critique.childAnalogyGrade.slice(0, 8)}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-300 truncate mt-1">
                      {critique.childAnalogyGrade}
                    </div>
                  </div>
                </div>

                {/* Jargon Penalty Meter */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-red-400 uppercase tracking-wider flex items-center space-x-1">
                      <AlertOctagon className="w-3.5 h-3.5" />
                      <span>Jargon Penalty Meter (-{critique.jargonPenaltyScore} pts)</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {critique.identifiedJargons.length === 0
                        ? 'Zero Jargon Detected (Clean)'
                        : `${critique.identifiedJargons.length} Terms Identified`}
                    </span>
                  </div>

                  {critique.identifiedJargons.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {critique.identifiedJargons.map((word, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[11px] font-mono bg-red-950 text-red-300 border border-red-800"
                        >
                          ⚠️ "{word}"
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-emerald-400">
                      Flawless discipline: No obscure technical buzzwords used as crutches.
                    </p>
                  )}
                </div>
              </div>

              {/* PILLAR 2: Identified Knowledge Gaps & Logical Flaws */}
              <div className="space-y-2 pt-1 border-t border-slate-800/80">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Pillar 2: Identified Knowledge Gaps & Logical Flaws</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {critique.conceptualGaps.map((gap, i) => (
                    <div
                      key={`gap-${i}`}
                      className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/60 text-amber-200 flex items-start space-x-2"
                    >
                      <span className="text-amber-400 font-bold shrink-0">🔍 Gap {i + 1}:</span>
                      <span>{gap}</span>
                    </div>
                  ))}
                  {critique.misunderstandings.map((err, i) => (
                    <div
                      key={`err-${i}`}
                      className="p-2.5 rounded-lg bg-red-950/20 border border-red-900/60 text-red-200 flex items-start space-x-2"
                    >
                      <span className="text-red-400 font-bold shrink-0">⚠️ Flaw:</span>
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PILLAR 3: Suggested Real-World Analogy Correction */}
              <div className="space-y-2 pt-1 border-t border-slate-800/80">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-violet-400 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pillar 3: Suggested Real-World Analogy Correction</span>
                </div>

                <div className="p-3.5 rounded-xl bg-gradient-to-br from-violet-950/40 via-slate-950 to-indigo-950/40 border border-violet-800/60 space-y-2">
                  <div className="text-[11px] text-violet-300 font-semibold uppercase tracking-wider">
                    ELI5 Physical Analogy (Addressing Your Identified Gaps):
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed italic font-serif">
                    "{critique.suggestedAnalogyCorrection || critique.eli5SimplifiedVersion}"
                  </p>
                </div>
              </div>

              {/* PILLAR 4: Academic Rigor Assessment */}
              <div className="space-y-2 pt-1 border-t border-slate-800/80">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Pillar 4: Academic Rigor Assessment</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <p>{critique.rigorAssessment}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs shadow-lg h-full flex flex-col items-center justify-center space-y-3">
              <Baby className="w-12 h-12 text-slate-700" />
              <div className="font-bold text-slate-400 text-sm">Awaiting Explanation Submission</div>
              <p className="max-w-sm text-slate-500">
                Write an explanation as if teaching a first-grader. The Feynman engine will evaluate your specific text
                across all 4 structured post-analysis pillars: Clarity Scores, Knowledge Gaps, Real-World Analogy Correction,
                and Rigor Assessment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
