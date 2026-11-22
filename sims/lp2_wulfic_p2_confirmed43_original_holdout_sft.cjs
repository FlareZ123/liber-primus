'use strict';
/**
 * Exact source-original blind-holdout adjudication of the April 2026 Wulfic
 * claimed LP2 p2 43-state Vigenere partial key. Read-only Node 22 CJS SFT.
 *
 * Source proposal: https://github.com/Wulfic/Cicada3301-Liber_Primus/
 * blob/main/MASTER_TRACKER.md, section "Page 02 — Vigenère SUB".
 * Candidate is not a Cicada-authenticated key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const gp = JSON.parse(fs.readFileSync(path.join(root,
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const raw = fs.readFileSync(path.join(root,
  'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');
const original = gp.pages.find(p => p.page === 2).indices;
assert.equal(original.length, 201);
const sourcePage = raw.split('%')[2];
const indexOfRune = new Map(gp.runes.map((r, i) => [r, i]));

// The external source explicitly calls these 43 entries its Session20
// CONFIRMED list; it also says 18 of the 43 are still speculative.
const key = [20,1,20,27,1,7,26,25,4,19,22,4,26,9,1,18,9,15,20,1,6,10,10,16,
  6,23,3,13,22,10,5,0,0,2,15,4,2,0,9,22,26,22,15];
const sourceConfirmedPhases = new Set([
  0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,21,22,23,24,25,26,27,28,29,30
]);
assert.equal(key.length, 43);
assert.equal(sourceConfirmedPhases.size, 25);

/**
 * Exact proposal: all source ciphertext GP F=0 pass transparently and do
 * not consume a key element; all other runes subtract the current key.
 * @param {number[]} ciphertext
 * @returns {{decoded:number[], phase:(number|null)[]}}
 */
function decode(ciphertext) {
  const decoded = [], phase = [];
  let cursor = 0;
  for (const c of ciphertext) {
    if (c === 0) {
      decoded.push(0);
      phase.push(null);
    } else {
      const at = cursor % key.length;
      decoded.push((c - key[at] + 29) % 29);
      phase.push(at);
      cursor++;
    }
  }
  return {decoded, phase};
}
const {decoded, phase} = decode(original);
assert.equal(decoded.length, original.length);
assert.deepEqual(original.map((cipher, i) => phase[i] === null
  ? 0 : (decoded[i] + key[phase[i]]) % 29), original);
const transparent = original.flatMap((c, i) => c === 0 ? [i] : []);
assert.deepEqual(transparent, [49,64,90,104,109,116,190]);

// Parse exactly the printed physical-page word/period separations, ignoring
// line-wrap '/' while preserving source rune positions.
const words = [];
let current = [], currentStart = 0, at = 0;
/** @returns {void} */
function endWord() {
  if (!current.length) return;
  const values = current.map(x => decoded[x]);
  words.push({
    word: words.length + 1,
    sourceRuneStart: currentStart,
    length: values.length,
    output: values.map(i => gp.translit[i]).join(''),
    sourceConfirmedOnly: current.every(i =>
      phase[i] === null || sourceConfirmedPhases.has(phase[i]))
  });
  current = [];
}
for (const ch of sourcePage) {
  if (indexOfRune.has(ch)) {
    if (!current.length) currentStart = at;
    assert.equal(indexOfRune.get(ch), original[at]);
    current.push(at++);
  } else if (ch === '-' || ch === '.') {
    endWord();
  }
}
endWord();
assert.equal(at, 201);
assert.equal(words.length, 45);

// Reconstruct what the external proposal actually fits in the opening,
// rather than accepting it as independently recovered unknown plaintext.
assert.deepEqual(words.slice(0, 5).map(w => w.output),
  ['THE', 'I', 'IS', 'ISAMEAS', 'THAT']);
assert.equal(words[6].output, 'PILGRIM');

// Precommitted, mechanically forced predictions elsewhere in the same page.
// The source tracker describes w16, w26, w27 and w28 as all ciphering to 'A'
// under its asserted confirmed positions, but its posted FINAL array yields:
assert.deepEqual([16,26,27,28].map(i => words[i-1].output),
  ['U', 'U', 'EA', 'F']);
assert(words.filter(w => w.sourceRuneStart >= 43
  && w.sourceConfirmedOnly).length >= 18);
assert.equal(words[12].output, 'LNGFEOXXRCBW');
assert.equal(words[32].output, 'AUFUUDONGUR');
const fullHoldout = words.filter(w =>
  w.sourceRuneStart >= 43 && w.sourceConfirmedOnly);
assert.equal(fullHoldout.length, 18);
assert.equal(fullHoldout.filter(w => w.length >= 5).length, 6);
assert.equal(fullHoldout.filter(w => w.length >= 5 &&
  ['LNGFEOXXRCBW','PDAEIBTH','OEEALDCB','AUFUUDONGUR',
    'HAECDAE','RDBLLIAEN'].includes(w.output)).length, 6);

// Source-native fixed public control: applying the exact inverse procedure
// to its own decoded output round-trips original p2, independently of whether
// the candidate key represents an authentic decipherment.
console.log(JSON.stringify({
  verdict: 'external claimed confirmed p2 key does not predict its stated holdout A words',
  evidenceClass: 'mechanical inconsistency in external partial-solve proposal',
  originalPage: 2,
  sourceRuneCount: original.length,
  printedWords: words.length,
  candidateKeySize: key.length,
  fixedSourceKeyPhases: sourceConfirmedPhases.size,
  firstFit: words.slice(0, 5).map(w => w.output),
  intendedWord7: words[6].output,
  witnessClaimedA: [16,26,27,28].map(i=>words[i-1].output),
  fullyPredictedPostFirstCycleWords: fullHoldout,
  transparentOriginalPositions: transparent,
  sourceRoundTrip: '201/201',
  newAuthenticatedPlaintext: false
}, null, 2));