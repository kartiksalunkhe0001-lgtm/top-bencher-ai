import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRetentionStatus,
  generateSpacedRepetitionSchedule,
  diagnoseQuizMistake,
  evaluateFeynmanExplanation,
  generateDynamicQuestions,
  generateDynamicFlashcards,
  generateDynamicMindMap,
  generateDynamicCharts,
  formatSecondsToTimer,
  formatSecondsHuman,
  formatBytes,
  MAX_UPLOAD_SIZE_BYTES,
  SUPPORTED_SUBJECTS,
} from './studyEngine';
import { DocumentItem } from '../types';

test('formatBytes correctly formats file sizes without 0.0 KB rounding bugs', () => {
  // Empty or invalid
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(-10), '0 B');
  assert.equal(formatBytes(null), '0 B');
  assert.equal(formatBytes(undefined), '0 B');

  // Small byte files (under 1 KB - previously caused 0.0 KB bugs)
  assert.equal(formatBytes(256), '256 B');
  assert.equal(formatBytes(750), '750 B');

  // Kilobyte files
  assert.equal(formatBytes(1024), '1.0 KB');
  assert.equal(formatBytes(2560), '2.5 KB');
  assert.equal(formatBytes(4915), '4.8 KB');
  assert.equal(formatBytes(45056), '44 KB');

  // Megabyte files
  assert.equal(formatBytes(1024 * 1024), '1.0 MB');
  assert.equal(formatBytes(15 * 1024 * 1024), '15.0 MB');
  assert.equal(formatBytes(52.5 * 1024 * 1024), '52.5 MB');
  assert.equal(formatBytes(MAX_UPLOAD_SIZE_BYTES), '100.0 MB');

  // Verify MAX_UPLOAD_SIZE_BYTES is exactly 100 MB
  assert.equal(MAX_UPLOAD_SIZE_BYTES, 100 * 1024 * 1024);
});

test('Timer utilities format seconds accurately', () => {
  assert.equal(formatSecondsToTimer(0), '00:00');
  assert.equal(formatSecondsToTimer(42), '00:42');
  assert.equal(formatSecondsToTimer(75), '01:15');
  assert.equal(formatSecondsToTimer(360), '06:00');

  assert.equal(formatSecondsHuman(42), '42s');
  assert.equal(formatSecondsHuman(60), '1m');
  assert.equal(formatSecondsHuman(125), '2m 5s');
});

test('SUPPORTED_SUBJECTS strictly includes Physics, Chemistry, Mathematics, Computer Science, and English', () => {
  assert.ok(SUPPORTED_SUBJECTS.includes('Physics'));
  assert.ok(SUPPORTED_SUBJECTS.includes('Chemistry'));
  assert.ok(SUPPORTED_SUBJECTS.includes('Mathematics'));
  assert.ok(SUPPORTED_SUBJECTS.includes('Computer Science'));
  assert.ok(SUPPORTED_SUBJECTS.includes('English'));
});

test('calculateRetentionStatus correctly categorizes scores per requirements', () => {
  // High Attention Needed (Score < 50%)
  assert.equal(calculateRetentionStatus(0), 'HIGH_ATTENTION');
  assert.equal(calculateRetentionStatus(33.3), 'HIGH_ATTENTION');
  assert.equal(calculateRetentionStatus(49.9), 'HIGH_ATTENTION');

  // Some Attention Needed (Score 50% - 80%)
  assert.equal(calculateRetentionStatus(50), 'SOME_ATTENTION');
  assert.equal(calculateRetentionStatus(65), 'SOME_ATTENTION');
  assert.equal(calculateRetentionStatus(80), 'SOME_ATTENTION');

  // Low Attention Needed (Score > 80%)
  assert.equal(calculateRetentionStatus(80.1), 'LOW_ATTENTION');
  assert.equal(calculateRetentionStatus(95), 'LOW_ATTENTION');
  assert.equal(calculateRetentionStatus(100), 'LOW_ATTENTION');
});

test('generateSpacedRepetitionSchedule generates Day 1, 3, 7, 14 intervals', () => {
  const base = new Date('2026-10-30T12:00:00Z');
  const schedule = generateSpacedRepetitionSchedule(base);

  assert.equal(schedule.length, 4);
  assert.equal(schedule[0].day, 1);
  assert.equal(schedule[1].day, 3);
  assert.equal(schedule[2].day, 7);
  assert.equal(schedule[3].day, 14);

  assert.equal(schedule[0].dueDate, '2026-10-31');
  assert.equal(schedule[1].dueDate, '2026-11-02');
  assert.equal(schedule[2].dueDate, '2026-11-06');
  assert.equal(schedule[3].dueDate, '2026-11-13');
});

test('generateDynamicQuestions produces contextual, non-boilerplate questions from uploaded document', () => {
  const userDoc: DocumentItem = {
    id: 'user-doc-eng',
    name: 'English_Rhetorical_Devices.txt',
    type: 'text',
    size: '12 KB',
    subject: 'English',
    uploadDate: '2026-10-30',
    tags: ['English', 'Grammar'],
    content: `Rhetorical Devices and Persuasive Analysis:
1. Anaphora: The deliberate repetition of a word or phrase at the beginning of successive clauses.
2. Chiasmus: A reversal in the order of words in two otherwise parallel phrases.
3. Synecdoche: A figure of speech in which a part is made to represent the whole.`,
  };

  const questions = generateDynamicQuestions(userDoc, 3, 'mcq', 'competitive_exam');
  assert.equal(questions.length, 3);
  assert.equal(questions[0].subject, 'English');
  assert.ok(questions[0].question.includes('Anaphora'));
  // Verify correct option is clean definition without robotic boilerplate
  assert.ok(questions[0].options![0].includes('repetition of a word or phrase'));
  assert.ok(!questions[0].options![0].includes('It strictly establishes:'));

  // Test diagnostic on dynamic question
  const correctCheck = diagnoseQuizMistake(questions[0], 0);
  assert.equal(correctCheck.isCorrect, true);

  const wrongCheck = diagnoseQuizMistake(questions[0], 1);
  assert.equal(wrongCheck.isCorrect, false);
  assert.equal(wrongCheck.diagnosedErrorStep, 2);
});

test('generateDynamicFlashcards, MindMap, and Charts work dynamically on user files', () => {
  const userDoc: DocumentItem = {
    id: 'user-doc-cs',
    name: 'Binary_Search_Trees.ts',
    type: 'code',
    size: '4 KB',
    subject: 'Computer Science',
    uploadDate: '2026-10-30',
    tags: ['CS', 'Algorithms'],
    content: `Binary Search Tree Specifications:
BST Invariant: For any node X, all keys in left subtree are strictly less than X.
Search Complexity: O(h) where h is tree height.
Balanced BST: Guarantees O(log n) worst-case search.`,
  };

  const cards = generateDynamicFlashcards(userDoc, 3);
  assert.equal(cards.length, 3);
  assert.equal(cards[0].subject, 'Computer Science');

  const mindMap = generateDynamicMindMap(userDoc);
  assert.ok(mindMap.label.includes('Binary Search Trees'));

  const charts = generateDynamicCharts(userDoc);
  assert.ok(charts.length > 0);
  assert.ok(charts[0].rows.length > 0);
});

test('evaluateFeynmanExplanation grades clarity, simplicity and catches jargon in uploaded context', () => {
  const jargonHeavy =
    'The wavefunction has an orthonormal Hamiltonian eigenvalue with differential divergence and quantum superposition in Hilbert space.';
  const resultJargon = evaluateFeynmanExplanation(jargonHeavy, 'Wave Equations');
  assert.ok(resultJargon.identifiedJargons.length >= 3);
  assert.equal(resultJargon.verdict, 'RE-EXPLAIN_REQUIRED');

  const simpleVernacular =
    'Imagine a bouncy ball trapped in a room. Like a toy, it bounces between the walls until someone opens the door to look inside.';
  const resultSimple = evaluateFeynmanExplanation(simpleVernacular, 'Wave Equations');
  assert.equal(resultSimple.identifiedJargons.length, 0);
  assert.ok(resultSimple.overallScore >= 70);
});
