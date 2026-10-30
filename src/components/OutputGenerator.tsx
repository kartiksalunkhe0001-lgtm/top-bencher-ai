import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  CheckCircle2,
  Layers,
  Brain,
  TableProperties,
  ArrowRight,
  Code2,
  Terminal,
  Cpu,
  AlertTriangle,
  UploadCloud,
} from 'lucide-react';
import { DocumentItem, OutputType, QuizMode, DifficultyLevel, StudyConfig } from '../types';

interface OutputGeneratorProps {
  documents: DocumentItem[];
  selectedDocument: DocumentItem | null;
  onSelectDocument: (doc: DocumentItem) => void;
  onGenerate: (config: StudyConfig, targetDoc: DocumentItem | null) => void;
  isGenerating: boolean;
  onNavigateToIngestion: () => void;
}

export const OutputGenerator: React.FC<OutputGeneratorProps> = ({
  documents,
  selectedDocument,
  onSelectDocument,
  onGenerate,
  isGenerating,
  onNavigateToIngestion,
}) => {
  const [outputType, setOutputType] = useState<OutputType>('quiz');
  const [quizMode, setQuizMode] = useState<QuizMode>('mixed');
  const [quantity, setQuantity] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('competitive_exam');
  const [showPromptPreview, setShowPromptPreview] = useState<boolean>(false);

  const targetDoc = selectedDocument || documents[0] || null;
  const hasFiles = documents.length > 0;

  // Build aggregated system prompt for transparent inspection using user's actual file
  const aggregatedSystemPrompt = `[TOP_BENCHER_AI_SYSTEM_DIRECTIVE]:
ROLE: Principal Academician & Exam Architect
TARGET OUTPUT: ${outputType.toUpperCase()}
MODE: ${outputType === 'quiz' ? `QUIZ (${quizMode.toUpperCase()})` : outputType.toUpperCase()}
ITEM QUANTITY: ${quantity}
DIFFICULTY TIER: ${difficulty.toUpperCase()}
SOURCE DOCUMENT: ${targetDoc ? targetDoc.name : 'NO USER FILE PROVIDED'}
SUBJECT DOMAIN: ${targetDoc ? targetDoc.subject : 'UNDEFINED'}
USER DOCUMENT CONTENT:
${targetDoc ? targetDoc.content.slice(0, 500) + '...' : 'Waiting for user file upload...'}

STRICT GENERATION CONSTRAINTS:
1. Zero preloaded or generic assumptions. Ground questions strictly in the uploaded text above.
2. Formulate step-by-step analytical derivations for every solution.
3. Map every incorrect distractor to an exact logic step failure.
4. Output strict JSON conforming to Top Bencher Study Schema.`;

  const handleStartGeneration = () => {
    if (!hasFiles || !targetDoc) return;
    onGenerate(
      {
        outputType,
        quizMode,
        quantity,
        difficulty,
        focusSubject: targetDoc?.subject,
      },
      targetDoc
    );
  };

  const outputTypes: { id: OutputType; title: string; subtitle: string; icon: React.ReactNode }[] = [
    {
      id: 'quiz',
      title: 'Interactive Test / Quiz',
      subtitle: 'MCQ, Subjective & Step-by-Step Derivation Diagnostics',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    },
    {
      id: 'flashcards',
      title: 'Active Flashcards',
      subtitle: 'Mnemonics, Spaced Review intervals & Formula keys',
      icon: <Layers className="w-5 h-5 text-indigo-400" />,
    },
    {
      id: 'mindmap',
      title: 'Hierarchical Mind Map',
      subtitle: 'Visual concept node tree with invariant dependencies',
      icon: <Brain className="w-5 h-5 text-violet-400" />,
    },
    {
      id: 'charts',
      title: 'Structured Charts & Tables',
      subtitle: 'Proof matrices, trap warnings & formula cheat-sheets',
      icon: <TableProperties className="w-5 h-5 text-cyan-400" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="inline-flex items-center space-x-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
          <Cpu className="w-3.5 h-3.5" />
          <span>Component 2: Multi-Modal Study Output Generator</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Synthesize Uploaded Documents into Rigorous Study Artifacts
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Configure output mode, question quantity (1-25), and cognitive difficulty. The engine reads your
          uploaded file content dynamically without falling back to any mock chapters.
        </p>
      </div>

      {/* No Files Uploaded Warning Banner */}
      {!hasFiles && (
        <div className="p-5 rounded-xl bg-amber-950/40 border border-amber-600/60 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-white">No Document Uploaded Yet</h2>
              <p className="text-xs text-amber-200 mt-0.5">
                Top Bencher AI is 100% dynamic and has zero preloaded chapters. Please upload your textbook notes,
                PDF, code file, or handwritten notes in Ingestion Engine first.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToIngestion}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shrink-0 transition-colors cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document Now</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configuration Controls */}
        <div className="lg:col-span-8 space-y-5">
          {/* Output Type Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h2 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
              <span>Select Study Output Modality</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {outputTypes.map((type) => {
                const isSelected = outputType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setOutputType(type.id)}
                    className={`p-4 rounded-xl border text-left transition-all flex items-start space-x-3 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-950 border-indigo-500 ring-1 ring-indigo-500/30 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                      {type.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{type.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{type.subtitle}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quiz Mode Sub-selector (if Quiz chosen) */}
            {outputType === 'quiz' && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-300 block mb-2">Quiz Format Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['mcq', 'subjective', 'mixed'] as QuizMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setQuizMode(mode)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium capitalize border transition-all cursor-pointer ${
                        quizMode === mode
                          ? 'bg-indigo-600/30 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {mode === 'mcq' ? 'Multiple Choice (MCQ)' : mode === 'subjective' ? 'Subjective / Derivation' : 'Mixed Format'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quantity Control Slider: 1 to 25 items */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span>Quantity Control</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Specify volume of questions, cards, or proof nodes</p>
              </div>
              <div className="text-lg font-black text-indigo-400 bg-indigo-950/80 px-3.5 py-1 rounded-lg border border-indigo-800">
                {quantity} <span className="text-xs text-indigo-300 font-normal">items</span>
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="25"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                aria-label="Quantity slider"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>1 item (Rapid Drill)</span>
                <span>10 items (Standard Drill)</span>
                <span>25 items (Full Exam)</span>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center space-x-2 pt-1">
              <span className="text-xs text-slate-400 mr-2">Quick Presets:</span>
              {[5, 10, 15, 20, 25].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setQuantity(preset)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                    quantity === preset
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Tier */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <label className="text-sm font-bold text-white block mb-3">Cognitive Difficulty Tier</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'fundamental' as DifficultyLevel,
                  title: 'Fundamental',
                  desc: 'Axiom definition & baseline rule verification',
                },
                {
                  id: 'competitive_exam' as DifficultyLevel,
                  title: 'Competitive Exam',
                  desc: 'Multi-step derivations and rigorous problem solving',
                },
                {
                  id: 'olympiad_research' as DifficultyLevel,
                  title: 'Olympiad & Research',
                  desc: 'Boundary invariants, edge cases & non-trivial bounds',
                },
              ].map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setDifficulty(tier.id)}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    difficulty === tier.id
                      ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/30'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-white">{tier.title}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{tier.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Source Document Selection & Generation Engine CTA */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white">Target Uploaded File</h3>
            {!hasFiles ? (
              <div className="p-4 bg-slate-950 rounded-lg text-xs text-amber-300 border border-amber-900/50">
                No user files uploaded. Upload a document in Ingestion & OCR first to target.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {documents.map((doc) => {
                  const isSelected = targetDoc?.id === doc.id;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => onSelectDocument(doc)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-950/60 border-indigo-500 text-white font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <div className="truncate">{doc.name}</div>
                        <div className="text-[10px] text-slate-400">{doc.subject} • {doc.size}</div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Launch CTA */}
            <button
              onClick={handleStartGeneration}
              disabled={isGenerating || !hasFiles}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-xl flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                isGenerating
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : !hasFiles
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/30'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing From Uploaded Text...</span>
                </>
              ) : !hasFiles ? (
                <span>Upload a Document First to Generate</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate {quantity} {outputType.toUpperCase()} Items</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Toggle System Prompt Preview */}
            <button
              onClick={() => setShowPromptPreview(!showPromptPreview)}
              className="w-full text-center text-[11px] text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center space-x-1 pt-1 cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{showPromptPreview ? 'Hide System Prompt' : 'Inspect Aggregated System Prompt'}</span>
            </button>

            {showPromptPreview && (
              <div className="mt-2 p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[10px] text-indigo-300/90 whitespace-pre-wrap max-h-56 overflow-y-auto">
                <div className="flex items-center space-x-1 text-slate-500 mb-1">
                  <Terminal className="w-3 h-3" />
                  <span>System Prompt Preview:</span>
                </div>
                {aggregatedSystemPrompt}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
