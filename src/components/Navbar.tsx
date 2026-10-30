import React, { useState } from 'react';
import {
  Brain,
  FileText,
  Sparkles,
  CheckCircle2,
  CalendarClock,
  Baby,
  Layers,
  Flame,
  Cloud,
  CloudCheck,
  CloudOff,
  RefreshCw,
  LogIn,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { User } from 'firebase/auth';

export type ActiveTab =
  | 'ingestion'
  | 'generator'
  | 'quiz'
  | 'flashcards'
  | 'mindmap'
  | 'charts'
  | 'retention'
  | 'feynman';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  ingestedCount: number;
  highAttentionCount: number;
  averageScore: number;
  user: User | null;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'guest';
  onSignIn: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  ingestedCount,
  highAttentionCount,
  averageScore,
  user,
  syncStatus,
  onSignIn,
  onSignOut,
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'ingestion', label: '1. Upload Files', icon: <FileText className="w-4 h-4" />, badge: `${ingestedCount}` },
    { id: 'generator', label: '2. Study Generator', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'quiz', label: '3. Quiz & Diagnostics', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'flashcards', label: 'Flashcards', icon: <Layers className="w-4 h-4" /> },
    { id: 'mindmap', label: 'Mind Map', icon: <Brain className="w-4 h-4" /> },
    { id: 'charts', label: 'Formula Matrix', icon: <Layers className="w-4 h-4" /> },
    {
      id: 'retention',
      label: '4. Spaced Retention',
      icon: <CalendarClock className="w-4 h-4" />,
      badge: highAttentionCount > 0 ? `${highAttentionCount} Urgent` : undefined,
    },
    { id: 'feynman', label: '5. Feynman Simplifier', icon: <Baby className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('ingestion')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  TOP BENCHER <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">AI</span>
                </span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-700/60 text-indigo-300">
                  RANK #1 PREP OS
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Multi-Device Cloud Synchronized Cognitive Synthesis Engine
              </p>
            </div>
          </div>

          {/* Cloud Sync & User Profile */}
          <div className="flex items-center space-x-3">
            {/* Quick Metrics */}
            <div className="hidden lg:flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1.5 bg-slate-900/80 border border-slate-800 px-2.5 py-1.5 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-400">Accuracy:</span>
                <span className="font-bold text-white">{averageScore}%</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-900/80 border border-slate-800 px-2.5 py-1.5 rounded-lg">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">Urgent:</span>
                <span className={`font-bold ${highAttentionCount > 0 ? 'text-red-400' : 'text-slate-300'}`}>
                  {highAttentionCount}
                </span>
              </div>
            </div>

            {/* Cloud Sync Status Badge */}
            <div className="flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-lg border bg-slate-900/80 border-slate-800">
              {syncStatus === 'synced' && (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium hidden sm:inline">Cloud Synced</span>
                </>
              )}
              {syncStatus === 'syncing' && (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  <span className="text-indigo-300 font-medium hidden sm:inline">Syncing...</span>
                </>
              )}
              {syncStatus === 'guest' && (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300 font-medium hidden sm:inline">Local / Guest</span>
                </>
              )}
              {syncStatus === 'offline' && (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-rose-400 font-medium hidden sm:inline">Offline</span>
                </>
              )}
            </div>

            {/* User Account / Auth Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowAuthModal(!showAuthModal)}
                  className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white transition-all cursor-pointer"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-5 h-5 rounded-full ring-1 ring-indigo-500"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                      {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[100px] truncate hidden md:inline font-medium">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </button>

                {showAuthModal && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="Avatar"
                          className="w-9 h-9 rounded-full ring-1 ring-indigo-500"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                          {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">
                          {user.displayName || 'Top Bencher Scholar'}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                      </div>
                    </div>

                    <div className="py-2.5 space-y-1.5 text-[11px] text-slate-400">
                      <div className="flex items-center justify-between">
                        <span>Multi-device Cloud Sync:</span>
                        <span className="text-emerald-400 font-semibold">Active</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Synced Documents:</span>
                        <span className="text-white font-mono">{ingestedCount}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowAuthModal(false);
                        onSignOut();
                      }}
                      className="w-full mt-2 py-2 px-3 bg-red-950/40 hover:bg-red-950/80 border border-red-900/60 rounded-lg text-xs font-semibold text-red-300 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="flex items-center space-x-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
                title="Sign in with Google to enable multi-device cloud synchronization"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In to Sync</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-1 ring-indigo-400/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isActive
                        ? 'bg-indigo-900/90 text-indigo-200'
                        : item.badge.includes('Urgent')
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
