import React, { useState } from 'react';
import {
  Layers,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Code2,
  Brain,
} from 'lucide-react';
import { Flashcard } from '../types';

interface FlashcardViewerProps {
  cards: Flashcard[];
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteryState, setMasteryState] = useState<Record<string, number>>({});

  const currentCard = cards[currentIndex] || cards[0];
  const currentMastery = masteryState[currentCard?.id] ?? currentCard?.masteryLevel ?? 0;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(cards.length - 1);
    }
  };

  const handleRateMastery = (level: number) => {
    setMasteryState((prev) => ({
      ...prev,
      [currentCard.id]: level,
    }));
    handleNext();
  };

  if (!currentCard || !cards || cards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-xl space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-950/80 border border-indigo-800 flex items-center justify-center mx-auto text-indigo-400">
          <Layers className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">No Active Flashcards</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Upload your notes or code in Ingestion Engine, then select "Active Flashcards" in the Study Generator
          to dynamically create active recall cards with mnemonics.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-semibold">
            {currentCard.subject}
          </div>
          <div className="text-xs text-slate-400">
            Topic: <span className="text-white font-medium">{currentCard.topic}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="text-slate-400">
            Card <strong className="text-white">{currentIndex + 1}</strong> of {cards.length}
          </span>
          <div className="w-24 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={handleFlip}
        className="w-full min-h-[360px] bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-8 shadow-2xl cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden group select-none"
      >
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 flex items-center space-x-1">
            <RotateCw className="w-3 h-3 text-indigo-400" />
            <span>Click to flip</span>
          </span>
        </div>

        {!isFlipped ? (
          /* FRONT SIDE */
          <div className="my-auto space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold">
              Cognitive Retrieval Prompt
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
              {currentCard.front}
            </h2>
            <p className="text-xs text-slate-400">
              Formulate your proof or derivation mentally before flipping.
            </p>
          </div>
        ) : (
          /* BACK SIDE */
          <div className="my-auto space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Model Answer & Axiomatic Proof</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">{currentCard.back}</p>

            {currentCard.formulaOrCode && (
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-indigo-300 flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{currentCard.formulaOrCode}</span>
              </div>
            )}

            <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-200 flex items-start space-x-2">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Top Bencher Mnemonic:</strong> {currentCard.mnemonic}
              </div>
            </div>
          </div>
        )}

        {/* Card Footer */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <div>Next Review: {currentCard.nextReviewDate}</div>
          <div className="flex items-center space-x-1">
            <span>Mastery:</span>
            {[1, 2, 3, 4, 5].map((lvl) => (
              <span
                key={lvl}
                className={`w-2 h-2 rounded-full ${
                  lvl <= currentMastery ? 'bg-indigo-400' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mastery Rating Controls (Spaced Repetition Feedback) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrev}
            className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
            aria-label="Previous card"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
            aria-label="Next card"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Spaced Retrieval Grading Buttons */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 text-[11px] mr-1 hidden md:inline">Rate Retrieval:</span>
          <button
            onClick={() => handleRateMastery(1)}
            className="px-3 py-1.5 rounded-lg bg-red-950/70 border border-red-800 text-red-300 hover:bg-red-900 font-semibold transition-all"
          >
            Again (&lt;10m)
          </button>
          <button
            onClick={() => handleRateMastery(2)}
            className="px-3 py-1.5 rounded-lg bg-amber-950/70 border border-amber-800 text-amber-300 hover:bg-amber-900 font-semibold transition-all"
          >
            Hard (1d)
          </button>
          <button
            onClick={() => handleRateMastery(4)}
            className="px-3 py-1.5 rounded-lg bg-indigo-950/70 border border-indigo-800 text-indigo-300 hover:bg-indigo-900 font-semibold transition-all"
          >
            Good (3d)
          </button>
          <button
            onClick={() => handleRateMastery(5)}
            className="px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300 hover:bg-emerald-900 font-semibold transition-all"
          >
            Mastered (7d)
          </button>
        </div>
      </div>
    </div>
  );
};
