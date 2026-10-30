import React, { useState } from 'react';
import {
  CalendarClock,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Flame,
  Check,
  Calendar,
  Clock,
  Play,
} from 'lucide-react';
import { TopicRetentionRecord, RetentionCategory } from '../types';

interface RetentionAnalyticsProps {
  records: TopicRetentionRecord[];
  onLaunchReview: (record: TopicRetentionRecord) => void;
  onMarkIntervalComplete: (recordId: string, day: number) => void;
}

export const RetentionAnalytics: React.FC<RetentionAnalyticsProps> = ({
  records,
  onLaunchReview,
  onMarkIntervalComplete,
}) => {
  const [filter, setFilter] = useState<'ALL' | RetentionCategory>('ALL');

  const highAttentionList = records.filter((r) => r.status === 'HIGH_ATTENTION');
  const someAttentionList = records.filter((r) => r.status === 'SOME_ATTENTION');
  const lowAttentionList = records.filter((r) => r.status === 'LOW_ATTENTION');

  const filteredRecords = records.filter((r) => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="inline-flex items-center space-x-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
          <CalendarClock className="w-3.5 h-3.5" />
          <span>Component 4: Spaced Repetition & Topic Retention Analytics</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Scientific Memory Decay Prevention & Interval Scheduling
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Automated topic categorization sorts concepts by diagnostic accuracy. Topics requiring High Attention
          are flagged for mandatory Day 1, Day 3, Day 7, and Day 14 spaced retrieval sessions to flatten the Ebbinghaus forgetting curve.
        </p>
      </div>

      {/* 3 Retention Category Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* High Attention Needed (< 50%) */}
        <div
          onClick={() => setFilter(filter === 'HIGH_ATTENTION' ? 'ALL' : 'HIGH_ATTENTION')}
          className={`p-5 rounded-xl border transition-all cursor-pointer ${
            filter === 'HIGH_ATTENTION'
              ? 'bg-red-950/40 border-red-500 ring-1 ring-red-500/50 shadow-lg shadow-red-950/40'
              : 'bg-slate-900/90 border-slate-800 hover:border-red-900/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-400 flex items-center space-x-1.5 uppercase">
              <AlertOctagon className="w-4 h-4 animate-pulse" />
              <span>High Attention Needed</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
              Score &lt; 50%
            </span>
          </div>
          <div className="text-3xl font-black text-white mt-3">{highAttentionList.length}</div>
          <p className="text-xs text-slate-400 mt-1">
            Critical concepts queued for Day 1 immediate step review
          </p>
        </div>

        {/* Some Attention Needed (50% - 80%) */}
        <div
          onClick={() => setFilter(filter === 'SOME_ATTENTION' ? 'ALL' : 'SOME_ATTENTION')}
          className={`p-5 rounded-xl border transition-all cursor-pointer ${
            filter === 'SOME_ATTENTION'
              ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500/50 shadow-lg shadow-amber-950/40'
              : 'bg-slate-900/90 border-slate-800 hover:border-amber-900/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 flex items-center space-x-1.5 uppercase">
              <AlertTriangle className="w-4 h-4" />
              <span>Some Attention Needed</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              Score 50% - 80%
            </span>
          </div>
          <div className="text-3xl font-black text-white mt-3">{someAttentionList.length}</div>
          <p className="text-xs text-slate-400 mt-1">
            Partial comprehension; scheduled for Day 3 Feynman simplification
          </p>
        </div>

        {/* Low Attention Needed (> 80%) */}
        <div
          onClick={() => setFilter(filter === 'LOW_ATTENTION' ? 'ALL' : 'LOW_ATTENTION')}
          className={`p-5 rounded-xl border transition-all cursor-pointer ${
            filter === 'LOW_ATTENTION'
              ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/50 shadow-lg shadow-emerald-950/40'
              : 'bg-slate-900/90 border-slate-800 hover:border-emerald-900/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5 uppercase">
              <CheckCircle2 className="w-4 h-4" />
              <span>Low Attention Needed</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              Score &gt; 80%
            </span>
          </div>
          <div className="text-3xl font-black text-white mt-3">{lowAttentionList.length}</div>
          <p className="text-xs text-slate-400 mt-1">
            Firmly consolidated; scheduled for Day 14 retention check
          </p>
        </div>
      </div>

      {/* Retention Curve Comparison Visualizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Ebbinghaus Decay Curve vs Top Bencher Spaced Reinforcement</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualizing natural cognitive memory decay vs scheduled retrieval resets
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-medium">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-red-400 block" />
              <span className="text-slate-400">Without Spaced Review (Drops to 15%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-emerald-400 block" />
              <span className="text-emerald-300">With Top Bencher (Maintains &gt; 90%)</span>
            </div>
          </div>
        </div>

        {/* SVG Curve Diagram */}
        <div className="relative w-full h-48 bg-slate-950 rounded-xl p-4 border border-slate-800 overflow-hidden flex items-end">
          <svg className="w-full h-full" viewBox="0 0 600 140" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="20" x2="600" y2="20" stroke="#1e293b" strokeDasharray="3 3" />
            <line x1="0" y1="60" x2="600" y2="60" stroke="#1e293b" strokeDasharray="3 3" />
            <line x1="0" y1="100" x2="600" y2="100" stroke="#1e293b" strokeDasharray="3 3" />

            {/* Un-reviewed decay curve (red) */}
            <path
              d="M 20 20 Q 80 80, 160 110 T 350 125 T 580 130"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeDasharray="4 4"
            />

            {/* Top Bencher Spaced Reinforcement Sawtooth (emerald) */}
            {/* Day 0: 100% -> Day 1 drops to 60% then reset to 95% -> Day 3 drops to 75% then reset to 96% -> Day 7 drops to 85% then reset to 98% -> Day 14: 95% */}
            <path
              d="M 20 20 L 100 70 L 100 25 L 220 55 L 220 22 L 380 45 L 380 20 L 580 25"
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
            />

            {/* Review point pins */}
            <circle cx="100" cy="25" r="4" fill="#10b981" />
            <circle cx="220" cy="22" r="4" fill="#10b981" />
            <circle cx="380" cy="20" r="4" fill="#10b981" />
            <circle cx="580" cy="25" r="4" fill="#10b981" />
          </svg>

          {/* Labels on SVG */}
          <div className="absolute bottom-2 left-6 right-6 flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Day 0 (Initial Exam)</span>
            <span>Day 1 (Reset #1)</span>
            <span>Day 3 (Reset #2)</span>
            <span>Day 7 (Reset #3)</span>
            <span>Day 14 (Permanent Trace)</span>
          </div>
        </div>
      </div>

      {/* Spaced Interval Management Queue */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Dynamic Interval Review Schedule</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review sessions automatically assigned based on scientific intervals (Day 1, Day 3, Day 7, Day 14)
            </p>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Topics ({records.length})
            </button>
            <button
              onClick={() => setFilter('HIGH_ATTENTION')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filter === 'HIGH_ATTENTION' ? 'bg-red-950 text-red-300 border border-red-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              High Attention ({highAttentionList.length})
            </button>
          </div>
        </div>

        {/* Schedule Table */}
        <div className="space-y-3">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-10 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-500 space-y-2">
              <CalendarClock className="w-8 h-8 mx-auto text-slate-600" />
              <div className="font-semibold text-slate-400">No Topics in Retention Queue</div>
              <p className="max-w-xs mx-auto text-slate-500">
                Complete an interactive quiz on any uploaded document. Topics scoring below 50% will automatically
                be enrolled in Day 1, 3, 7, and 14 review intervals.
              </p>
            </div>
          ) : (
            filteredRecords.map((record) => (
              <div
                key={record.id}
                className={`p-4 rounded-xl border transition-all ${
                record.status === 'HIGH_ATTENTION'
                  ? 'bg-slate-950/90 border-red-900/60'
                  : record.status === 'SOME_ATTENTION'
                  ? 'bg-slate-950/80 border-amber-900/40'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                      {record.subject}
                    </span>
                    <h3 className="text-sm font-bold text-white">{record.topic}</h3>
                    {record.status === 'HIGH_ATTENTION' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800 flex items-center space-x-1">
                        <Flame className="w-3 h-3 text-red-400" />
                        <span>High Attention (&lt;50%)</span>
                      </span>
                    )}
                    {record.status === 'SOME_ATTENTION' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                        Some Attention (50-80%)
                      </span>
                    )}
                    {record.status === 'LOW_ATTENTION' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Consolidated (&gt;80%)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center space-x-3">
                    <span>
                      Accuracy: <strong className="text-white">{record.scorePercentage}%</strong> ({record.correctCount}/{record.totalQuestions})
                    </span>
                    <span>•</span>
                    <span>Last tested: {record.lastTestedAt}</span>
                  </div>
                </div>

                <button
                  onClick={() => onLaunchReview(record)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Launch Review Drill</span>
                </button>
              </div>

              {/* Intervals Progress (Day 1, Day 3, Day 7, Day 14) */}
              <div className="pt-3 border-t border-slate-900 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {record.intervals.map((interval) => (
                  <div
                    key={interval.day}
                    onClick={() => onMarkIntervalComplete(record.id, interval.day)}
                    className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      interval.completed
                        ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                        : interval.day === record.nextDueDay
                        ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-1 font-bold text-[11px]">
                      {interval.completed ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      )}
                      <span>Day {interval.day} Interval</span>
                    </div>
                    <div className="text-[10px] mt-0.5 opacity-80">{interval.dueDate}</div>
                    <div className="text-[9px] mt-1 uppercase font-semibold">
                      {interval.completed ? 'Completed' : interval.day === record.nextDueDay ? 'DUE NOW' : 'Scheduled'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  );
};
