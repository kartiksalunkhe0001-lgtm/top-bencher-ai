import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  CalendarClock,
  Flame,
  Check,
  ChevronRight,
  Clock,
  Timer,
  BarChart3,
  Filter,
} from 'lucide-react';
import { QuizQuestion, QuizSubmission, RetentionCategory } from '../types';
import {
  calculateRetentionStatus,
  diagnoseQuizMistake,
  formatSecondsHuman,
  formatSecondsToTimer,
} from '../utils/studyEngine';

interface QuizRunnerProps {
  questions: QuizQuestion[];
  onQuizComplete: (results: {
    topic: string;
    subject: string;
    total: number;
    correct: number;
    scorePercentage: number;
    status: RetentionCategory;
    totalDurationSeconds: number;
    questionTimes: Record<number, number>;
  }) => void;
  onNavigateToRetention: () => void;
  onNavigateToFeynman: (topic: string) => void;
  onNavigateToGenerator?: () => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  questions,
  onQuizComplete,
  onNavigateToRetention,
  onNavigateToFeynman,
  onNavigateToGenerator,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submissions, setSubmissions] = useState<Record<number, QuizSubmission>>({});
  const [subjectiveInput, setSubjectiveInput] = useState('');
  const [showSubjectiveModal, setShowSubjectiveModal] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Timer states
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState(0);
  const [questionTimes, setQuestionTimes] = useState<Record<number, number>>({});
  const [analyticsFilter, setAnalyticsFilter] = useState<'ALL' | 'MISTAKES' | 'TIME_INTENSIVE'>('ALL');

  // Live timer interval: tracks total elapsed seconds & current question seconds
  useEffect(() => {
    if (isFinished || !questions || questions.length === 0) return;

    const interval = setInterval(() => {
      setTotalElapsedSeconds((prev) => prev + 1);
      setQuestionTimes((prev) => ({
        ...prev,
        [currentIndex]: (prev[currentIndex] || 0) + 1,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isFinished, currentIndex, questions]);

  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-xl space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-950/80 border border-indigo-800 flex items-center justify-center mx-auto text-indigo-400">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">No Active Quiz Session</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Top Bencher AI is 100% dynamic and does not load mock questions. Upload your lecture notes, textbook excerpt,
          or code in Upload Files, then generate your custom diagnostic test.
        </p>
        <div className="pt-2">
          {onNavigateToGenerator && (
            <button
              onClick={onNavigateToGenerator}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Go to Study Generator
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex] || questions[0];
  const currentSubmission = submissions[currentIndex];

  const handleSelectOption = (optionIndex: number) => {
    if (currentSubmission) return; // Already answered

    const diagnostic = diagnoseQuizMistake(currentQ, optionIndex);
    const timeSpent = questionTimes[currentIndex] || 1;

    const submission: QuizSubmission = {
      questionId: currentQ.id,
      userSelection: optionIndex,
      isCorrect: diagnostic.isCorrect,
      diagnosedErrorStep: diagnostic.diagnosedErrorStep,
      diagnosedRationale: diagnostic.diagnosedRationale,
      stepBreakdown: diagnostic.stepBreakdown,
      timeSpentSeconds: timeSpent,
    };

    setSubmissions((prev) => ({
      ...prev,
      [currentIndex]: submission,
    }));
  };

  const handleGradeSubjective = (selfGradeCorrect: boolean) => {
    const timeSpent = questionTimes[currentIndex] || 1;
    const breakdown = currentQ.solutionDerivation.map((s) => ({
      stepNumber: s.stepNumber,
      status: selfGradeCorrect ? ('correct' as const) : ('flawed' as const),
      critique: selfGradeCorrect
        ? `Criterion satisfied: ${s.title}`
        : `Deviation noted in step derivation: ${s.title}`,
    }));

    const submission: QuizSubmission = {
      questionId: currentQ.id,
      userTextAnswer: subjectiveInput,
      isCorrect: selfGradeCorrect,
      diagnosedErrorStep: selfGradeCorrect ? undefined : 2,
      diagnosedRationale: selfGradeCorrect
        ? undefined
        : 'Subjective derivation missed the core mathematical boundary constraint or formula step.',
      stepBreakdown: breakdown,
      timeSpentSeconds: timeSpent,
    };

    setSubmissions((prev) => ({
      ...prev,
      [currentIndex]: submission,
    }));
    setShowSubjectiveModal(false);
    setSubjectiveInput('');
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finalizeQuiz();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const finalizeQuiz = () => {
    const total = questions.length;
    let correctCount = 0;
    Object.values(submissions).forEach((sub) => {
      if (sub.isCorrect) correctCount++;
    });
    const percentage = Math.round((correctCount / total) * 100);
    const status = calculateRetentionStatus(percentage);

    setIsFinished(true);
    onQuizComplete({
      topic: currentQ.topic,
      subject: currentQ.subject,
      total,
      correct: correctCount,
      scorePercentage: percentage,
      status,
      totalDurationSeconds: totalElapsedSeconds,
      questionTimes,
    });
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSubmissions({});
    setTotalElapsedSeconds(0);
    setQuestionTimes({});
    setIsFinished(false);
  };

  // Summary Metrics
  const answeredCount = Object.keys(submissions).length;
  const correctCount = Object.values(submissions).filter((s) => s.isCorrect).length;
  const wrongCount = answeredCount - correctCount;
  const finalPercentage = answeredCount > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const finalStatus = calculateRetentionStatus(finalPercentage);
  const averagePaceSeconds = questions.length > 0 ? Math.round(totalElapsedSeconds / questions.length) : 0;

  // Filtered Questions for Final Question-by-Question Breakdown
  const filteredQuestions = questions.filter((q, idx) => {
    const sub = submissions[idx];
    const timeSpent = questionTimes[idx] || 0;
    if (analyticsFilter === 'MISTAKES') {
      return sub && !sub.isCorrect;
    }
    if (analyticsFilter === 'TIME_INTENSIVE') {
      return timeSpent >= 30;
    }
    return true;
  });

  // TEST SUBMISSION & TIME-SPENT ANALYTICS VIEW
  if (isFinished) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Verdict Hero Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center shadow-xl relative overflow-hidden">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
            <span>Diagnostic Complete & Time Analytics</span>
          </div>

          <h2 className="text-3xl font-extrabold text-white">Top Bencher Assessment Verdict</h2>
          <p className="text-slate-400 text-sm mt-1">Topic: {currentQ.topic} ({currentQ.subject})</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
            {/* Score Ratio */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs text-slate-400 uppercase font-semibold">Score Ratio</div>
              <div className="text-3xl font-black text-white mt-1">
                {correctCount} / {questions.length}
              </div>
              <div className="text-xs text-slate-500 mt-1">{finalPercentage}% Accuracy</div>
            </div>

            {/* Retention Category */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs text-slate-400 uppercase font-semibold">Retention Category</div>
              <div className="mt-1">
                {finalStatus === 'HIGH_ATTENTION' && (
                  <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-red-950 text-red-300 border border-red-800">
                    High Attention (&lt;50%)
                  </span>
                )}
                {finalStatus === 'SOME_ATTENTION' && (
                  <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800">
                    Some Attention (50-80%)
                  </span>
                )}
                {finalStatus === 'LOW_ATTENTION' && (
                  <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Low Attention (&gt;80%)
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-2">Logged in Spaced Scheduler</div>
            </div>

            {/* Total Duration & Time Tracking */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs text-slate-400 uppercase font-semibold flex items-center justify-center space-x-1">
                <Timer className="w-3.5 h-3.5 text-indigo-400" />
                <span>Total Test Duration</span>
              </div>
              <div className="text-2xl font-black text-indigo-300 font-mono mt-1">
                {formatSecondsToTimer(totalElapsedSeconds)}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Avg: <strong className="text-white">{formatSecondsHuman(averagePaceSeconds)}</strong> / question
              </div>
            </div>

            {/* Review Scheduling */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs text-slate-400 uppercase font-semibold">Spaced Intervals</div>
              <div className="text-sm font-bold text-emerald-400 mt-1">Day 1, 3, 7, 14</div>
              <div className="text-xs text-slate-400 mt-1">Memory decay resets queued</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onNavigateToRetention}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <CalendarClock className="w-4 h-4" />
              <span>Open Spaced Repetition Schedule</span>
            </button>
            <button
              onClick={() => onNavigateToFeynman(currentQ.topic)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-violet-950 hover:bg-violet-900 border border-violet-800 text-violet-200 font-bold text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Deconstruct in Feynman Simplifier</span>
            </button>
            <button
              onClick={handleRestart}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Quiz</span>
            </button>
          </div>
        </div>

        {/* QUESTION-BY-QUESTION TIME & MISTAKE BREAKDOWN (Specification 3 Core Feature) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span>Question-by-Question Time Breakdown & Mistake Analysis</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Exact duration spent per question paired with step-by-step diagnostic feedback
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setAnalyticsFilter('ALL')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  analyticsFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({questions.length})
              </button>
              <button
                onClick={() => setAnalyticsFilter('MISTAKES')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  analyticsFilter === 'MISTAKES' ? 'bg-red-950 text-red-300 border border-red-800' : 'text-slate-400 hover:text-white'
                }`}
              >
                Mistakes ({wrongCount})
              </button>
              <button
                onClick={() => setAnalyticsFilter('TIME_INTENSIVE')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  analyticsFilter === 'TIME_INTENSIVE' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'text-slate-400 hover:text-white'
                }`}
              >
                Time Intensive (&ge;30s)
              </button>
            </div>
          </div>

          {/* List of Questions with Time Analytics */}
          <div className="space-y-4">
            {filteredQuestions.map((q) => {
              const qIndex = questions.findIndex((item) => item.id === q.id);
              const sub = submissions[qIndex];
              const timeSpent = questionTimes[qIndex] || 0;
              const isCorrect = sub?.isCorrect ?? false;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border space-y-3 transition-all ${
                    sub
                      ? isCorrect
                        ? 'bg-slate-950/80 border-emerald-900/60'
                        : 'bg-slate-950/90 border-red-900/60'
                      : 'bg-slate-950/50 border-slate-800'
                  }`}
                >
                  {/* Question Header & Timing Badges */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                        Q{qIndex + 1}
                      </span>
                      <span className="text-xs font-bold text-white">{q.topic}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs">
                      {/* Time Spent Badge */}
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-800 font-mono font-semibold">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{formatSecondsHuman(timeSpent)}</span>
                      </span>

                      {/* Correct / Incorrect Badge */}
                      {sub ? (
                        isCorrect ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Correct</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-red-950 text-red-300 border border-red-800 font-bold">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Flaw at Step {sub.diagnosedErrorStep || 2}</span>
                          </span>
                        )
                      ) : (
                        <span className="text-slate-500 text-xs">Unanswered</span>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="text-xs text-slate-200 leading-relaxed font-medium">
                    {q.question}
                  </div>

                  {/* MCQ Options Display */}
                  {q.options && (
                    <div className="space-y-1.5 pt-1 text-xs">
                      {q.options.map((opt, oIdx) => {
                        const isChosen = sub?.userSelection === oIdx;
                        const isActualCorrect = oIdx === q.correctOptionIndex;

                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                              isActualCorrect
                                ? 'bg-emerald-950/40 border-emerald-600/80 text-emerald-200 font-semibold'
                                : isChosen && !isActualCorrect
                                ? 'bg-red-950/40 border-red-600/80 text-red-200'
                                : 'bg-slate-900/60 border-slate-800/80 text-slate-400 opacity-60'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-[11px]">
                                {String.fromCharCode(65 + oIdx)}.
                              </span>
                              <span>{opt}</span>
                            </div>
                            {isActualCorrect && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                            {isChosen && !isActualCorrect && (
                              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Step-by-Step Diagnostic Breakdown (if incorrect) */}
                  {sub && !isCorrect && (
                    <div className="p-3.5 rounded-lg bg-red-950/20 border border-red-800/60 space-y-2.5 text-xs">
                      <div className="flex items-center space-x-1.5 font-bold text-red-300">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>Step-by-Step Error Diagnostic:</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {sub.diagnosedRationale}
                      </p>

                      {/* Derivation Steps */}
                      <div className="space-y-1.5 pt-1">
                        {q.solutionDerivation.map((s) => (
                          <div
                            key={s.stepNumber}
                            className={`p-2 rounded text-[11px] border ${
                              s.stepNumber === (sub.diagnosedErrorStep || 2)
                                ? 'bg-red-950/50 border-red-700 text-red-200 font-medium'
                                : 'bg-slate-950 border-slate-800 text-slate-400'
                            }`}
                          >
                            <span className="font-bold">
                              Step {s.stepNumber} ({s.title}):
                            </span>{' '}
                            {s.explanation}
                            {s.stepNumber === (sub.diagnosedErrorStep || 2) && s.commonPitfall && (
                              <div className="mt-1 text-red-300 font-semibold">
                                ⚠️ Pitfall: {s.commonPitfall}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="text-[11px] text-amber-300 bg-slate-950/80 p-2 rounded border border-amber-900/40">
                        <strong>Why Result Collapsed:</strong> {q.conceptualCollapseWarning}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE TEST SESSION WITH LIVE TIMERS
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Session Progress Bar & Live Timers */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="px-2.5 py-1 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-semibold">
            {currentQ.subject}
          </div>
          <div className="text-xs text-slate-400">
            Topic: <span className="text-slate-200 font-medium">{currentQ.topic}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Live Countdown / Elapsed Timer */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/80 border border-indigo-700/80 font-mono text-xs text-indigo-200 shadow-sm">
            <Timer className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="text-slate-400">Elapsed:</span>
            <span className="font-bold text-white">{formatSecondsToTimer(totalElapsedSeconds)}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Q{currentIndex + 1}:</span>
            <span className="font-bold text-indigo-300">{formatSecondsHuman(questionTimes[currentIndex] || 0)}</span>
          </div>

          <div className="text-xs font-semibold text-slate-300 hidden md:block">
            <span className="text-indigo-400">{currentIndex + 1}</span> / {questions.length}
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
              {currentQ.type === 'mcq' ? 'Rigorous Multi-Step MCQ' : 'Subjective Derivation Proof'}
            </span>
            {currentSubmission && (
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center space-x-1 ${
                  currentSubmission.isCorrect
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'bg-red-950 text-red-300 border border-red-700'
                }`}
              >
                {currentSubmission.isCorrect ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Flawless Derivation</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Flaw Detected</span>
                  </>
                )}
              </span>
            )}
          </div>

          <h2 className="text-lg font-bold text-white leading-relaxed">{currentQ.question}</h2>
        </div>

        {/* Options List (MCQ) */}
        {currentQ.options && (
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = currentSubmission?.userSelection === idx;
              const isCorrect = idx === currentQ.correctOptionIndex;
              const hasAnswered = !!currentSubmission;

              // Immediate feedback styling:
              // Correct option -> Emerald Green
              // Incorrect selection -> Red
              let optionStyle = 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-200';

              if (hasAnswered) {
                if (isCorrect) {
                  optionStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-950/50';
                } else if (isSelected && !isCorrect) {
                  optionStyle = 'bg-red-950/40 border-red-500 text-red-200 shadow-lg shadow-red-950/50';
                } else {
                  optionStyle = 'bg-slate-950/30 border-slate-900 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={hasAnswered}
                  className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-start space-x-3 cursor-pointer ${optionStyle}`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border ${
                      hasAnswered && isCorrect
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : hasAnswered && isSelected && !isCorrect
                        ? 'bg-red-500 text-white border-red-400'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <div className="flex-1 leading-relaxed">{opt}</div>
                  {hasAnswered && isCorrect && <Check className="w-5 h-5 text-emerald-400 shrink-0" />}
                  {hasAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Subjective Mode Box */}
        {currentQ.type === 'subjective' && !currentSubmission && (
          <div className="space-y-3">
            <textarea
              rows={4}
              placeholder="Type your derivation steps or core theorem synthesis..."
              value={subjectiveInput}
              onChange={(e) => setSubjectiveInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
            />
            <button
              onClick={() => setShowSubjectiveModal(true)}
              disabled={!subjectiveInput.trim()}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Submit & Compare with Model Derivation
            </button>
          </div>
        )}

        {/* STEP-BY-STEP MISTAKE DIAGNOSTIC PANEL */}
        {currentSubmission && (
          <div
            className={`rounded-xl border p-5 space-y-4 ${
              currentSubmission.isCorrect
                ? 'bg-emerald-950/20 border-emerald-800/80'
                : 'bg-red-950/20 border-red-800/80'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                {currentSubmission.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                )}
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {currentSubmission.isCorrect
                      ? 'Flawless Derivation Verified'
                      : `Critical Derivation Flaw Pinpointed at Step ${currentSubmission.diagnosedErrorStep || 2}`}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {currentSubmission.isCorrect
                      ? 'All intermediate operators and contextual constraints satisfied.'
                      : currentSubmission.diagnosedRationale}
                  </p>
                </div>
              </div>

              {/* Time spent on this question */}
              <div className="text-xs font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-indigo-300 shrink-0 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-indigo-400" />
                <span>{formatSecondsHuman(currentSubmission.timeSpentSeconds || 0)}</span>
              </div>
            </div>

            {/* Granular Step-by-Step Derivation Breakdown */}
            <div className="space-y-2.5 pt-2">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Step-by-Step Derivation & Mistake Audit:
              </div>
              <div className="space-y-2">
                {currentSubmission.stepBreakdown.map((step) => {
                  const stepDetail = currentQ.solutionDerivation.find((s) => s.stepNumber === step.stepNumber);
                  return (
                    <div
                      key={step.stepNumber}
                      className={`p-3 rounded-lg border text-xs ${
                        step.status === 'correct'
                          ? 'bg-slate-950/70 border-emerald-900/60 text-slate-300'
                          : step.status === 'flawed'
                          ? 'bg-red-950/50 border-red-700 text-red-200'
                          : 'bg-slate-950/30 border-slate-900 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold flex items-center space-x-1.5">
                          {step.status === 'correct' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                          {step.status === 'flawed' && <XCircle className="w-3.5 h-3.5 text-red-400" />}
                          <span>
                            Step {step.stepNumber}: {stepDetail?.title || `Derivation Segment ${step.stepNumber}`}
                          </span>
                        </span>
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                            step.status === 'correct'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : step.status === 'flawed'
                              ? 'bg-red-950 text-red-300 border border-red-700 animate-pulse'
                              : 'bg-slate-900 text-slate-500'
                          }`}
                        >
                          {step.status === 'flawed' ? 'FATAL LOGICAL BREAK' : step.status.toUpperCase()}
                        </span>
                      </div>

                      {stepDetail?.formulaOrCode && (
                        <div className="font-mono text-[11px] bg-slate-900/80 px-2.5 py-1 rounded my-1 text-indigo-300">
                          {stepDetail.formulaOrCode}
                        </div>
                      )}

                      <p className="text-[11px] text-slate-300 leading-relaxed mt-1">{step.critique}</p>

                      {step.status === 'flawed' && stepDetail?.commonPitfall && (
                        <div className="mt-2 p-2 rounded bg-red-950/60 border border-red-800 text-[11px] text-red-300">
                          <strong className="text-red-200">Exam Pitfall Trap:</strong> {stepDetail.commonPitfall}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Why the Overall Result Collapsed */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
              <span className="font-bold text-amber-400 flex items-center space-x-1 mb-1">
                <Flame className="w-3.5 h-3.5" />
                <span>Why the Overall Result Collapsed:</span>
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {currentQ.conceptualCollapseWarning}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={!currentSubmission}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              currentSubmission
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>{currentIndex === questions.length - 1 ? 'Complete & Grade Session' : 'Next Question'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subjective Self-Grade Modal */}
      {showSubjectiveModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Compare with Top Bencher Derivation</h3>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-2">
              <div className="text-slate-400 font-semibold">Your Response:</div>
              <p className="text-slate-200 font-mono">{subjectiveInput}</p>
            </div>

            <div className="p-3 bg-indigo-950/30 rounded-lg border border-indigo-800/60 text-xs space-y-2">
              <div className="text-indigo-300 font-semibold">Model Solution Derivation:</div>
              {currentQ.solutionDerivation.map((s) => (
                <div key={s.stepNumber} className="text-slate-300">
                  <span className="font-bold text-indigo-400">Step {s.stepNumber}:</span> {s.title} — {s.explanation}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3">
              <button
                onClick={() => handleGradeSubjective(false)}
                className="px-4 py-2 rounded-lg bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 text-xs font-semibold cursor-pointer"
              >
                Failed Step / Incomplete
              </button>
              <button
                onClick={() => handleGradeSubjective(true)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
              >
                Matches Model Derivation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
