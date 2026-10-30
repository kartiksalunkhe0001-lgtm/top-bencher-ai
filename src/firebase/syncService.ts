import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errorHandler';
import { DocumentItem, QuizSessionResult, TopicRetentionRecord, FeynmanCritique } from '../types';
import { formatBytes } from '../utils/studyEngine';

/**
 * Sanitize an ID to match ^[a-zA-Z0-9_\-]+$ and length <= 128
 */
export function sanitizeDocId(rawId: string): string {
  const cleaned = rawId.replace(/[^a-zA-Z0-9_\-]/g, '_');
  return cleaned.slice(0, 120) || `id_${Date.now()}`;
}

// -----------------------------------------------------------------------------
// 1. CLOUD FILE STORAGE & SYNC
// -----------------------------------------------------------------------------

export async function saveUserFile(userId: string, docItem: DocumentItem): Promise<void> {
  const safeFileId = sanitizeDocId(docItem.id);
  const path = `users/${userId}/files/${safeFileId}`;

  // Parse exact byte count to prevent 0-byte saves
  let numBytes = typeof docItem.sizeBytes === 'number' && docItem.sizeBytes > 0
    ? docItem.sizeBytes
    : 0;

  if (!numBytes && typeof docItem.size === 'string') {
    const match = docItem.size.match(/^([\d.]+)\s*(MB|KB|B)?$/i);
    if (match) {
      const val = parseFloat(match[1]);
      const unit = (match[2] || 'KB').toUpperCase();
      if (unit === 'MB') numBytes = Math.round(val * 1024 * 1024);
      else if (unit === 'KB') numBytes = Math.round(val * 1024);
      else numBytes = Math.round(val);
    } else if (docItem.content) {
      numBytes = docItem.content.length;
    }
  }

  try {
    const fileRef = doc(db, 'users', userId, 'files', safeFileId);
    await setDoc(fileRef, {
      id: safeFileId,
      userId: userId,
      name: docItem.name.slice(0, 250),
      type: docItem.type.slice(0, 60),
      size: numBytes,
      extractedContent: (docItem.content || docItem.extractedOcrText || '').slice(0, 480000),
      uploadedAt: docItem.uploadDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteUserFile(userId: string, fileId: string): Promise<void> {
  const safeFileId = sanitizeDocId(fileId);
  const path = `users/${userId}/files/${safeFileId}`;

  try {
    const fileRef = doc(db, 'users', userId, 'files', safeFileId);
    await deleteDoc(fileRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeUserFiles(
  userId: string,
  onUpdate: (files: DocumentItem[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const path = `users/${userId}/files`;
  const filesCol = collection(db, 'users', userId, 'files');

  return onSnapshot(
    filesCol,
    (snapshot) => {
      const items: DocumentItem[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        const numBytes = typeof d.size === 'number' && d.size > 0
          ? d.size
          : (d.extractedContent?.length || 2048);
        const formattedSize = formatBytes(numBytes);

        items.push({
          id: d.id || docSnap.id,
          name: d.name || 'Untitled Document',
          type: d.type || 'text',
          size: formattedSize,
          sizeBytes: numBytes,
          subject: d.subject || 'Dynamic Study Material',
          content: d.extractedContent || '',
          extractedOcrText: d.extractedContent || '',
          uploadDate: d.uploadedAt || new Date().toLocaleDateString(),
          tags: ['Cloud Synced'],
        });
      });
      onUpdate(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (err) {
        if (onError) onError(err);
      }
    }
  );
}

// -----------------------------------------------------------------------------
// 2. QUIZ ATTEMPTS & TIME-SPENT ANALYTICS
// -----------------------------------------------------------------------------

export async function saveQuizAttempt(userId: string, result: QuizSessionResult): Promise<void> {
  const safeId = sanitizeDocId(`quiz_${Date.now()}`);
  const path = `users/${userId}/quizAttempts/${safeId}`;

  try {
    const quizRef = doc(db, 'users', userId, 'quizAttempts', safeId);
    await setDoc(quizRef, {
      id: safeId,
      userId: userId,
      subject: (result.subject || 'General').slice(0, 60),
      format: (result.topic || 'Quiz Session').slice(0, 60),
      score: result.scorePercentage,
      totalQuestions: result.total,
      totalDurationSeconds: result.totalDurationSeconds || 0,
      questionLogs: JSON.stringify({
        questionTimes: result.questionTimes || {},
        submissions: result.submissions || {},
        correct: result.correct,
      }).slice(0, 480000),
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeQuizAttempts(
  userId: string,
  onUpdate: (attempts: any[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const path = `users/${userId}/quizAttempts`;
  const colRef = collection(db, 'users', userId, 'quizAttempts');

  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      onUpdate(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (err) {
        if (onError) onError(err);
      }
    }
  );
}

// -----------------------------------------------------------------------------
// 3. SPACED REPETITION SCHEDULES
// -----------------------------------------------------------------------------

export async function saveSpacedSchedule(userId: string, record: TopicRetentionRecord): Promise<void> {
  const safeTopicId = sanitizeDocId(record.id || `topic_${Date.now()}`);
  const path = `users/${userId}/spacedSchedules/${safeTopicId}`;

  try {
    const recordRef = doc(db, 'users', userId, 'spacedSchedules', safeTopicId);
    const attentionLevel =
      record.status === 'HIGH_ATTENTION'
        ? 'High Attention Needed'
        : record.status === 'SOME_ATTENTION'
        ? 'Some Attention Needed'
        : 'Low Attention Needed';

    await setDoc(recordRef, {
      id: safeTopicId,
      userId: userId,
      topicName: record.topic.slice(0, 120),
      subject: record.subject.slice(0, 60),
      attentionLevel: attentionLevel,
      lastScore: record.scorePercentage,
      reviewIntervalDays: record.nextDueDay || 1,
      nextReviewDate: new Date(Date.now() + (record.nextDueDay || 1) * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeSpacedSchedules(
  userId: string,
  onUpdate: (records: TopicRetentionRecord[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const path = `users/${userId}/spacedSchedules`;
  const colRef = collection(db, 'users', userId, 'spacedSchedules');

  return onSnapshot(
    colRef,
    (snapshot) => {
      const records: TopicRetentionRecord[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        const status =
          d.attentionLevel === 'High Attention Needed'
            ? 'HIGH_ATTENTION'
            : d.attentionLevel === 'Some Attention Needed'
            ? 'SOME_ATTENTION'
            : 'LOW_ATTENTION';

        records.push({
          id: d.id || docSnap.id,
          topic: d.topicName || 'Topic Drill',
          subject: d.subject || 'General',
          totalQuestions: 5,
          correctCount: Math.round((d.lastScore / 100) * 5),
          scorePercentage: d.lastScore || 0,
          status,
          intervals: [
            { day: 1, dueDate: 'Day 1', completed: d.reviewIntervalDays > 1 },
            { day: 3, dueDate: 'Day 3', completed: d.reviewIntervalDays > 3 },
            { day: 7, dueDate: 'Day 7', completed: d.reviewIntervalDays > 7 },
            { day: 14, dueDate: 'Day 14', completed: d.reviewIntervalDays > 14 },
          ],
          lastTestedAt: 'Cloud Synced',
          nextDueDay: d.reviewIntervalDays || 1,
        });
      });
      onUpdate(records);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (err) {
        if (onError) onError(err);
      }
    }
  );
}

// -----------------------------------------------------------------------------
// 4. FEYNMAN TECHNIQUE ANALYSES
// -----------------------------------------------------------------------------

export async function saveFeynmanAnalysis(
  userId: string,
  data: {
    conceptName: string;
    userExplanation: string;
    critique: FeynmanCritique;
  }
): Promise<void> {
  const safeId = sanitizeDocId(`feynman_${Date.now()}`);
  const path = `users/${userId}/feynmanAnalyses/${safeId}`;

  try {
    const analysisRef = doc(db, 'users', userId, 'feynmanAnalyses', safeId);
    await setDoc(analysisRef, {
      id: safeId,
      userId: userId,
      conceptName: data.conceptName.slice(0, 120),
      userExplanation: data.userExplanation.slice(0, 9500),
      clarityScore: data.critique.clarityScore || 0,
      grade: (data.critique.childAnalogyGrade || data.critique.verdict || 'A').slice(0, 30),
      analysisJson: JSON.stringify(data.critique).slice(0, 95000),
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
