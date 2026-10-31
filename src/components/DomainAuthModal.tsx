import React, { useState } from 'react';
import { AuthDomainConfigInfo } from '../types';
import { ShieldAlert, Copy, Check, ExternalLink, Sparkles, X, KeyRound, Globe } from 'lucide-react';

interface DomainAuthModalProps {
  info: AuthDomainConfigInfo;
  onClose: () => void;
  onUseScholarProfile: (email?: string, displayName?: string) => void;
}

export const DomainAuthModal: React.FC<DomainAuthModalProps> = ({
  info,
  onClose,
  onUseScholarProfile,
}) => {
  const [copied, setCopied] = useState(false);
  const domain = info.currentDomain || (typeof window !== 'undefined' ? window.location.hostname : '');
  const suggestedEmail = info.userEmail || 'k.salunkhe0001@gmail.com';

  const handleCopy = () => {
    if (domain && navigator.clipboard) {
      navigator.clipboard.writeText(domain);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          </div>
          <div className="pr-6">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Firebase Authentication Origin Guard
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
              Domain Authorization Required
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Google Firebase Authentication requires this preview host to be added to your Firebase project&apos;s authorized domains before completing Google Sign-In.
            </p>
          </div>
        </div>

        {/* Domain Display & Copy Box */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>Current Preview Hostname:</span>
            </span>
            <span className="text-slate-500 font-mono text-[10px]">Project: {info.projectId}</span>
          </div>
          <div className="flex items-center justify-between bg-slate-900/90 border border-slate-700/60 rounded-lg px-3 py-2 text-xs font-mono text-indigo-300 overflow-hidden">
            <span className="truncate mr-2 select-all">{domain || 'localhost'}</span>
            <button
              onClick={handleCopy}
              className="shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition-all cursor-pointer shadow-sm"
              title="Copy hostname to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Domain</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2-Step Fast Authorization Guide */}
        <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 p-3.5 text-xs space-y-2.5">
          <div className="font-semibold text-slate-200 flex items-center space-x-1.5 text-[11px]">
            <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
            <span>To authorize Google Sign-In for this URL (30 seconds):</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
            <li>
              Open Firebase Console{' '}
              <a
                href={info.consoleUrl}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 inline-flex items-center space-x-0.5"
              >
                <span>Authentication Settings</span>
                <ExternalLink className="w-3 h-3 ml-0.5 inline" />
              </a>.
            </li>
            <li>Scroll to <strong className="text-slate-300">Authorized domains</strong> and click <strong className="text-slate-300">Add domain</strong>.</li>
            <li>Paste <code className="text-indigo-300 font-mono bg-slate-900 px-1 py-0.5 rounded">{domain}</code> and save.</li>
          </ol>
        </div>

        {/* Immediate 1-Click Sandbox Option */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-indigo-950/40 border border-indigo-700/50 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Instant Scholar Sandbox (No Setup Needed)</span>
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
              Zero Delay
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Immediately activate your Top Bencher Scholar account ({suggestedEmail}) to experience full multi-device document caching, quiz diagnostics, and spaced repetition right now in this preview.
          </p>
          <button
            onClick={() => onUseScholarProfile(suggestedEmail, 'Kartik Salunkhe')}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            <span>Continue as Scholar ({suggestedEmail})</span>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-1">
          <a
            href={info.consoleUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-slate-400 hover:text-indigo-400 flex items-center space-x-1 transition-colors"
          >
            <span>Open Firebase Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};
