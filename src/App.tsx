import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { IngestionEngine } from './components/IngestionEngine';
import { OutputGenerator } from './components/OutputGenerator';
import { QuizRunner } from './components/QuizRunner';
import { FlashcardViewer } from './components/FlashcardViewer';
import { MindMapVisualizer } from './components/MindMapVisualizer';
import { StructuredCharts } from './components/StructuredCharts';
import { RetentionAnalytics } from './components/RetentionAnalytics';
import { FeynmanSimplifier } from './components/FeynmanSimplifier';
import { useAuth } from './firebase/authContext';
import {
  saveUserFile,
  deleteUserFile,
  subscribeUserFiles,
  saveQuizAttempt,
  saveSpacedSchedule,
  subscribeSpacedSchedules,
  saveFeynmanAnalysis,
} from './firebase/syncService';
import {
  DocumentItem,
  Flashcard,
  MindMapNode,
  QuizQuestion,
  QuizSessionResult,
  RetentionCategory,
  StructuredChart,
  StudyConfig,
  TopicRetentionRecord,
  FeynmanCritique,
} from './types';
import {
  generateDynamicStudyMaterials,
  generateSpacedRepetitionSchedule,
} from './utils/studyEngine';
import { Cloud, ShieldCheck, Sparkles } from 'lucide-react';

export default function App() {
  const { user, signInWithGoogle, signOutUser, error: authError } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('ingestion');
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'guest'>('guest');

  // Strict Zero-Preloaded State: Starts completely blank unless loaded from user's cloud account!
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [mindMap, setMindMap] = useState<MindMapNode | null>(null);
  const [charts, setCharts] = useState<StructuredChart[]>([]);
  const [retentionRecords, setRetentionRecords] = useState<TopicRetentionRecord[]>([]);
  const [feynmanTopic, setFeynmanTopic] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => {
      setStatusNotification(null);
    }, 3800);
  };

  // Sync state with Firebase when user changes
  useEffect(() => {
    if (!user) {
      setSyncStatus('guest');
      return;
    }

    setSyncStatus('syncing');
    showNotification(`Connected to cloud as ${user.displayName || user.email}. Syncing study data...`);

    // 1. Subscribe to user uploaded files
    const unsubFiles = subscribeUserFiles(
      user.uid,
      (cloudDocs) => {
        setDocuments((prevLocal) => {
          // Merge preserving any newly added in-flight docs
          const cloudIds = new Set(cloudDocs.map((d) => d.id));
          const localOnly = prevLocal.filter((l) => !cloudIds.has(l.id));
          return [...cloudDocs, ...localOnly];
        });
        setSyncStatus('synced');
      },
      (err) => {
        console.warn('Files sync error:', err);
        setSyncStatus('offline');
      }
    );

    // 2. Subscribe to spaced schedules
    const unsubSchedules = subscribeSpacedSchedules(
      user.uid,
      (cloudRecords) => {
        if (cloudRecords.length > 0) {
          setRetentionRecords(cloudRecords);
        }
        setSyncStatus('synced');
      },
      (err) => {
        console.warn('Schedules sync error:', err);
      }
    );

    return () => {
      unsubFiles();
      unsubSchedules();
    };
  }, [user]);

  // Ingestion Handlers with Cloud Storage
  const handleAddDocument = async (docItem: DocumentItem) => {
    setDocuments((prev) => [docItem, ...prev]);
    if (!selectedDocument) {
      setSelectedDocument(docItem);
    }
    showNotification(`Ingested "${docItem.name}" into study queue.`);

    if (user) {
      setSyncStatus('syncing');
      try {
        await saveUserFile(user.uid, docItem);
        setSyncStatus('synced');
        showNotification(`☁️ Saved "${docItem.name}" securely to cloud storage.`);
      } catch (err) {
        console.error('Cloud file save error:', err);
        setSyncStatus('offline');
        showNotification('Local upload saved. Cloud sync pending connection.');
      }
    }
  };

  const handleRemoveDocument = async (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (selectedDocument?.id === id) {
      const remaining = documents.filter((d) => d.id !== id);
      setSelectedDocument(remaining[0] || null);
    }
    showNotification('Document removed from queue.');

    if (user) {
      try {
        await deleteUserFile(user.uid, id);
      } catch (err) {
        console.error('Cloud file delete error:', err);
      }
    }
  };

  const handleSelectDocumentForStudy = (docItem: DocumentItem) => {
    setSelectedDocument(docItem);
    setActiveTab('generator');
    showNotification(`Targeted "${docItem.name}" in Study Generator.`);
  };

  // Dynamic Study Generator Handler (reads user uploaded files)
  const handleGenerateStudyArtifact = (config: StudyConfig, targetDoc: DocumentItem | null) => {
    if (documents.length === 0) {
      showNotification('Please upload a document before generating study materials.');
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      try {
        const docToProcess = targetDoc || documents[0];
        const generated = generateDynamicStudyMaterials([docToProcess], config);

        setIsGenerating(false);

        if (config.outputType === 'quiz' && generated.questions) {
          setQuestions(generated.questions);
          setActiveTab('quiz');
          showNotification(
            `Dynamically generated ${generated.questions.length} questions from "${docToProcess.name}"!`
          );
        } else if (config.outputType === 'flashcards' && generated.flashcards) {
          setFlashcards(generated.flashcards);
          setActiveTab('flashcards');
          showNotification(
            `Dynamically synthesized ${generated.flashcards.length} flashcards from "${docToProcess.name}"!`
          );
        } else if (config.outputType === 'mindmap' && generated.mindMap) {
          setMindMap(generated.mindMap);
          setActiveTab('mindmap');
          showNotification(`Dynamically synthesized concept mind map for "${docToProcess.name}"!`);
        } else if (config.outputType === 'charts' && generated.charts) {
          setCharts(generated.charts);
          setActiveTab('charts');
          showNotification(`Dynamically synthesized formula matrix for "${docToProcess.name}"!`);
        }
      } catch (err) {
        setIsGenerating(false);
        showNotification(err instanceof Error ? err.message : 'Error generating study materials');
      }
    }, 800);
  };

  // Quiz Completion Handler with Granular Time Analytics Cloud Sync
  const handleQuizComplete = async (results: {
    topic: string;
    subject: string;
    total: number;
    correct: number;
    scorePercentage: number;
    status: RetentionCategory;
    totalDurationSeconds?: number;
    questionTimes?: Record<number, number>;
  }) => {
    const existingIndex = retentionRecords.findIndex((r) => r.topic === results.topic);
    const newRecord: TopicRetentionRecord = {
      id: `ret-${Date.now()}`,
      topic: results.topic,
      subject: results.subject,
      totalQuestions: results.total,
      correctCount: results.correct,
      scorePercentage: results.scorePercentage,
      status: results.status,
      intervals: generateSpacedRepetitionSchedule(new Date()),
      lastTestedAt: 'Just Now',
      nextDueDay: 1,
    };

    if (existingIndex >= 0) {
      const updated = [...retentionRecords];
      updated[existingIndex] = newRecord;
      setRetentionRecords(updated);
    } else {
      setRetentionRecords((prev) => [newRecord, ...prev]);
    }

    const durationText = results.totalDurationSeconds ? ` in ${results.totalDurationSeconds}s` : '';
    if (results.status === 'HIGH_ATTENTION') {
      showNotification(`🚨 High Attention Needed (${results.scorePercentage}%${durationText}): Scheduled for Day 1 retrieval.`);
    } else {
      showNotification(`Assessment logged: ${results.scorePercentage}% score${durationText} (${results.status.replace('_', ' ')}).`);
    }

    // Persist to Cloud Database if authenticated
    if (user) {
      setSyncStatus('syncing');
      try {
        const fullQuizResult: QuizSessionResult = {
          topic: results.topic,
          subject: results.subject,
          total: results.total,
          correct: results.correct,
          scorePercentage: results.scorePercentage,
          status: results.status,
          totalDurationSeconds: results.totalDurationSeconds || 0,
          questionTimes: results.questionTimes || {},
          submissions: {},
        };
        await saveQuizAttempt(user.uid, fullQuizResult);
        await saveSpacedSchedule(user.uid, newRecord);
        setSyncStatus('synced');
      } catch (err) {
        console.error('Error syncing quiz attempt to cloud:', err);
      }
    }
  };

  // Spaced Repetition Actions
  const handleLaunchReview = (record: TopicRetentionRecord) => {
    const matchedDoc = documents.find(
      (d) => d.name.includes(record.topic) || d.subject === record.subject
    );
    if (matchedDoc) {
      const reviewQuestions = generateDynamicStudyMaterials([matchedDoc], {
        outputType: 'quiz',
        quizMode: 'mixed',
        quantity: 5,
        difficulty: 'competitive_exam',
        focusSubject: record.subject,
      }).questions;
      if (reviewQuestions) {
        setQuestions(reviewQuestions);
      }
    }
    setActiveTab('quiz');
    showNotification(`Initiated Day ${record.nextDueDay} review drill for "${record.topic}"`);
  };

  const handleMarkIntervalComplete = async (recordId: string, day: number) => {
    let updatedTargetRecord: TopicRetentionRecord | null = null;

    setRetentionRecords((prev) =>
      prev.map((r) => {
        if (r.id === recordId) {
          const updatedIntervals = r.intervals.map((int) =>
            int.day === day ? { ...int, completed: true } : int
          );
          const nextIncomplete = updatedIntervals.find((int) => !int.completed);
          const updated: TopicRetentionRecord = {
            ...r,
            intervals: updatedIntervals,
            nextDueDay: nextIncomplete ? nextIncomplete.day : 14,
          };
          updatedTargetRecord = updated;
          return updated;
        }
        return r;
      })
    );

    showNotification(`Day ${day} interval marked complete!`);

    if (user && updatedTargetRecord) {
      try {
        await saveSpacedSchedule(user.uid, updatedTargetRecord);
      } catch (err) {
        console.error('Failed to sync updated spaced interval:', err);
      }
    }
  };

  // Feynman Persistence Handler
  const handleSaveFeynmanAnalysis = async (
    critique: FeynmanCritique,
    conceptTopic: string,
    userExplanation: string
  ) => {
    if (user) {
      setSyncStatus('syncing');
      try {
        await saveFeynmanAnalysis(user.uid, {
          conceptName: conceptTopic,
          userExplanation,
          critique,
        });
        setSyncStatus('synced');
        showNotification('☁️ Feynman critique saved to cloud profile.');
      } catch (err) {
        console.error('Error saving Feynman analysis:', err);
      }
    }
  };

  // Route to Feynman
  const handleNavigateToFeynman = (topicToFeynman: string) => {
    setFeynmanTopic(topicToFeynman);
    setActiveTab('feynman');
  };

  // Computed HUD Metrics
  const highAttentionCount = retentionRecords.filter((r) => r.status === 'HIGH_ATTENTION').length;
  const averageScore =
    retentionRecords.length > 0
      ? Math.round(
          retentionRecords.reduce((acc, r) => acc + r.scorePercentage, 0) / retentionRecords.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Toast Notification */}
      {statusNotification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-indigo-500/80 text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl shadow-indigo-950/60 flex items-center space-x-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          <span>{statusNotification}</span>
        </div>
      )}

      {/* Auth Error Banner if present */}
      {authError && (
        <div className="bg-red-950/70 border-b border-red-800 text-red-200 text-xs px-4 py-2 text-center flex items-center justify-center space-x-2">
          <span>{authError}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ingestedCount={documents.length}
        highAttentionCount={highAttentionCount}
        averageScore={averageScore}
        user={user}
        syncStatus={syncStatus}
        onSignIn={signInWithGoogle}
        onSignOut={signOutUser}
      />

      {/* Multi-Device Cloud Sync Banner for Guest Users */}
      {!user && (
        <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-violet-950/40 border-b border-indigo-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <Cloud className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                <strong className="text-white">Multi-Device Cloud Sync Available:</strong> Sign in with Google to synchronize your uploaded files, quiz times, and spaced repetition schedules across laptops and phones.
              </span>
            </div>
            <button
              onClick={signInWithGoogle}
              className="ml-4 shrink-0 font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-2 cursor-pointer"
            >
              Sign In Free →
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'ingestion' && (
          <IngestionEngine
            documents={documents}
            onAddDocument={handleAddDocument}
            onRemoveDocument={handleRemoveDocument}
            onSelectDocumentForStudy={handleSelectDocumentForStudy}
            onOpenGenerator={() => setActiveTab('generator')}
          />
        )}

        {activeTab === 'generator' && (
          <OutputGenerator
            documents={documents}
            selectedDocument={selectedDocument}
            onSelectDocument={setSelectedDocument}
            onGenerate={handleGenerateStudyArtifact}
            isGenerating={isGenerating}
            onNavigateToIngestion={() => setActiveTab('ingestion')}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizRunner
            questions={questions}
            onQuizComplete={handleQuizComplete}
            onNavigateToRetention={() => setActiveTab('retention')}
            onNavigateToFeynman={handleNavigateToFeynman}
            onNavigateToGenerator={() => setActiveTab('generator')}
          />
        )}

        {activeTab === 'flashcards' && <FlashcardViewer cards={flashcards} />}

        {activeTab === 'mindmap' && <MindMapVisualizer rootNode={mindMap} />}

        {activeTab === 'charts' && <StructuredCharts charts={charts} />}

        {activeTab === 'retention' && (
          <RetentionAnalytics
            records={retentionRecords}
            onLaunchReview={handleLaunchReview}
            onMarkIntervalComplete={handleMarkIntervalComplete}
          />
        )}

        {activeTab === 'feynman' && (
          <FeynmanSimplifier
            documents={documents}
            preselectedTopic={feynmanTopic}
            onSaveAnalysis={handleSaveFeynmanAnalysis}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-400">TOP BENCHER AI</span>
            <span>—</span>
            <span>Uncompromising Study OS for Competitive Academicians</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] text-slate-500">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cloud Synchronized & Isolated</span>
            </span>
            <span>•</span>
            <span>Ebbinghaus Spaced Intervals</span>
            <span>•</span>
            <span>Feynman Analogy Verification</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
