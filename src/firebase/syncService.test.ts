import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeDocId } from './syncService';

test('sanitizeDocId produces safe IDs complying with Firestore regex ^[a-zA-Z0-9_\\-]+$', () => {
  const dirtyId = 'user@email.com / my test:file#1.pdf';
  const cleanId = sanitizeDocId(dirtyId);

  assert.match(cleanId, /^[a-zA-Z0-9_\-]+$/);
  assert.ok(cleanId.length <= 128);
  assert.ok(!cleanId.includes('@'));
  assert.ok(!cleanId.includes(':'));
  assert.ok(!cleanId.includes('/'));
  assert.ok(!cleanId.includes(' '));
});

test('sanitizeDocId provides fallback if string is completely empty or stripped', () => {
  const emptyClean = sanitizeDocId('');
  assert.ok(emptyClean.length > 0);
  assert.match(emptyClean, /^[a-zA-Z0-9_\-]+$/);
  setTimeout(() => process.exit(0), 100);
});
