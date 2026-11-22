/**
 * Historical 2014 community "Key Switch" hypothesis: necessary two-key word gate.
 * This is NOT an authenticated Cicada cipher. Run from the repository root:
 * node sims/lp2_archived_keyswitch_word_gate_sft.cjs
 *
 * The source illustration is archived in krisyotam/cicada3301 at
 * archives/cijhho/EXTRA WIKI PAGES/Liber Primus Ideas and Suggestions/Algorithm.png
 * Git blob ff0491218e17b53bc8c98da22dbc8ec3b9aad911.
 *
 * The historically displayed 1-based keys are fixed below. We deliberately
 * relax its look-ahead switch to the union of both possible letters, which
 * is more generous than the proposed forward cipher. Test both plausible
 * 1-based and 0-based key-value conventions without changing the key clocks.
 * No changes to original source files. No CLI options, external packages, or writes.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const transcript = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const dictionaryText = fs.readFileSync(path.join(root, 'resources/control/english_wordfreq_textblob.txt'), 'utf8');

const glyphs = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const glyphMap = new Map(glyphs.map((v, i) => [v, i]));
glyphMap.set('ᛂ', 11);
const keys = [
  [24, 11, 2, 11, 10, 11, 17, 27], // DIVINITY: historical image, 1-based
  [6, 11, 5, 6, 2, 20, 1, 19, 5, 19, 16, 6, 19, 16], // CIRCUMFERENCES
];
const plainLetters = {
  f: 0, u: 1, o: 3, r: 4, c: 5, g: 6, w: 7, h: 8, n: 9,
  i: 10, j: 11, p: 13, x: 14, s: 15, t: 16, b: 17,
  e: 18, m: 19, l: 20, d: 23, a: 24, y: 26,
};

/** @param {string} word @returns {number[]} */
function toGp(word) {
  const normalized = word.replace(/v/g, 'u').replace(/[kq]/g, 'c').replace(/z/g, 's');
  const contractions = [['ing', 21], ['th', 2], ['eo', 12], ['oe', 22], ['ae', 25], ['ia', 27], ['ea', 28]];
  /** @type {number[]} */
  const result = [];
  for (let i = 0; i < normalized.length;) {
    const found = contractions.find(([prefix]) => normalized.startsWith(prefix, i));
    if (found) {
      result.push(found[1]);
      i += found[0].length;
    } else {
      const value = plainLetters[normalized[i]];
      if (value === undefined) return [];
      result.push(value);
      i++;
    }
  }
  return result;
}

const firstPage = transcript.slice(0, transcript.indexOf('%')).replace(/[\s/]/g, '');
const words = firstPage.split(/[-.]/g).filter(Boolean)
  .map(token => [...token].map(g => {
    assert(glyphMap.has(g), 'Unexpected rune in first page: ' + g);
    return glyphMap.get(g);
  }));
const ciphertext = words.flat();
assert.deepEqual(ciphertext, corpus.pages[0].indices);
assert.equal(ciphertext.length, 262);

// IMPORTANT: This auxiliary phase diagnostic applies to an IDEALIZED,
// REPAIRED anti-repeat encoder that compares with the last EMITTED output.
// The historical C++ actually compares separate same-key LOOKAHEAD outputs
// before choosing the present key. It may emit repeats at unequal key slots.
// Therefore this diagnostic does NOT exclude the literal historical code.
// The separate native-word necessary-condition test is branch-independent.
/** @param {number} i @param {number} phaseA @param {number} phaseB */
const matchingKeySlots = (i, phaseA, phaseB) =>
  keys[0][(i + phaseA) % keys[0].length] === keys[1][(i + phaseB) % keys[1].length];
const firstPageDoubletIndices = [];
for (let i = 1; i < ciphertext.length; i++) {
  if (ciphertext[i] === ciphertext[i - 1]) firstPageDoubletIndices.push(i);
}
assert.deepEqual(firstPageDoubletIndices, [122, 207]);
const sourceMatchingResidues = [];
for (let i = 0; i < 56; i++) if (matchingKeySlots(i, 0, 0)) sourceMatchingResidues.push(i);
assert.deepEqual(sourceMatchingResidues, [1, 18, 29, 43]);
let bestFirstPageCollisions = 0;
let bestGlobalCollisions = 0;
const originalDoubletEvents = [];
let bookOffset = 0;
for (const page of corpus.pages.filter(p => p.page <= 55)) {
  for (let i = 1; i < page.indices.length; i++) {
    if (page.indices[i] === page.indices[i - 1]) {
      originalDoubletEvents.push({ page: page.page, local: i, global: bookOffset + i });
    }
  }
  bookOffset += page.indices.length;
}
assert.equal(originalDoubletEvents.length, 86);
for (let a = 0; a < 8; a++) {
  for (let b = 0; b < 14; b++) {
    bestFirstPageCollisions = Math.max(bestFirstPageCollisions,
      firstPageDoubletIndices.filter(i => matchingKeySlots(i, a, b)).length);
    bestGlobalCollisions = Math.max(bestGlobalCollisions,
      originalDoubletEvents.filter(e => matchingKeySlots(e.global, a, b)).length);
  }
}
let bestUnrelatedPagePhaseSum = 0;
for (const page of corpus.pages.filter(p => p.page <= 55)) {
  const events = originalDoubletEvents.filter(e => e.page === page.page);
  let bestPage = 0;
  for (let a = 0; a < 8; a++) {
    for (let b = 0; b < 14; b++) {
      bestPage = Math.max(bestPage, events.filter(e => matchingKeySlots(e.local, a, b)).length);
    }
  }
  bestUnrelatedPagePhaseSum += bestPage;
}
assert.equal(bestFirstPageCollisions, 1); // No phase pair explains both p0 repeats.
assert.equal(bestGlobalCollisions, 12); // Even global phase rescue explains <=12/86.
assert.equal(bestUnrelatedPagePhaseSum, 49); // Even freely reset each physical page: <=49/86.
console.log('Source image key-value equalities at positions modulo 56:', sourceMatchingResidues);
console.log('Original p0 equal-rune outputs at indices:', firstPageDoubletIndices,
  '; maximum under any phase pair:', bestFirstPageCollisions, '/', firstPageDoubletIndices.length);
console.log('All original p0-p55 same-page equalities:', originalDoubletEvents.length,
  '; maximal global-phase legal sites:', bestGlobalCollisions,
  '; maximal independently page-rescored legal sites:', bestUnrelatedPagePhaseSum);
console.log('DIAGNOSTIC PASS: the properly repaired last-emitted-output anti-repeat interpretation is excluded; the literal historical C++ is NOT evaluated by this event-phase argument.');

/** @type {Map<number, {word:string,runes:number[],frequency:number}[]>} */
const wordList = new Map();
for (const line of dictionaryText.split(/\r?\n/)) {
  if (!/^[a-z]+ \d+$/.test(line)) continue;
  const [word, amount] = line.split(' ');
  const runes = toGp(word);
  if (!runes.length) continue;
  if (!wordList.has(runes.length)) wordList.set(runes.length, []);
  wordList.get(runes.length).push({ word, runes, frequency: Number(amount) });
}
for (const list of wordList.values()) list.sort((a, b) => b.frequency - a.frequency);

/** @param {number[]} cipherWord @param {number} start @param {number} convention */
function candidates(cipherWord, start, convention) {
  const permitted = cipherWord.map((c, j) => keys.map(k => (c - k[(start + j) % k.length] - convention + 58) % 29));
  return (wordList.get(cipherWord.length) || []).filter(candidate =>
    candidate.runes.every((r, i) => permitted[i].includes(r)));
}


// Literal source-C++ lookahead grammar, with the unsafe key[(i%P)+1]
// naturally repaired as a cyclic key index. This is DISTINCT from the
// idealized last-emitted-output anti-repeat model and uses no language model.
// If both candidate lookahead pairs collide, the literal code uses continue
// and writes no ciphertext rune; reject that branch for a lossless stream.
const mod29 = n => ((n % 29) + 29) % 29;
/** @param {number} i @param {number} p @param {number} a @param {number} b */
const choices = (i, p, a, b) => ({
  div: mod29(p + keys[0][(i + a) % 8]),
  circ: mod29(p + keys[1][(i + b) % 14]),
});
const literalResults = [];
for (let a = 0; a < 8; a++) {
  for (let b = 0; b < 14; b++) {
    let reachable = new Set([mod29(ciphertext[0] - keys[0][a]),
                             mod29(ciphertext[0] - keys[1][b])]);
    let endedAt = 0;
    for (let i = 0; i < ciphertext.length - 1 && reachable.size; i++) {
      const next = new Set([
        mod29(ciphertext[i + 1] - keys[0][(i + 1 + a) % 8]),
        mod29(ciphertext[i + 1] - keys[1][(i + 1 + b) % 14]),
      ]);
      const after = new Set();
      for (const currentPlain of reachable) {
        for (const nextPlain of next) {
          const now = choices(i, currentPlain, a, b);
          const future = choices(i + 1, nextPlain, a, b);
          let emitted = now.div;
          if (future.div === now.div) {
            if (future.circ === now.circ) continue; // historical continue: no output
            emitted = now.circ;
          }
          if (emitted === ciphertext[i]) after.add(nextPlain);
        }
      }
      reachable = after;
      endedAt = i + 1;
    }
    literalResults.push({ a, b, survived: reachable.size > 0, endedAt });
  }
}
const literalBest = Math.max(...literalResults.map(r => r.endedAt));
const sourceLiteral = literalResults.find(r => r.a === 0 && r.b === 0);
assert.equal(literalResults.filter(r => r.survived).length, 0);
assert.equal(literalBest, 209);
assert.equal(sourceLiteral.endedAt, 123);
console.log('Literal historical lookahead grammar (cyclic-index repair):',
  '0 of 112 relative key-phase pairs emit the authentic 262-rune p0;',
  'source phase dies at p0 index', sourceLiteral.endedAt,
  'best shifted phase survives only to', literalBest);
console.log('Exact DP checks all GP29 plaintext symbol paths; no dictionary needed.');
console.log('Limit: source C++ out-of-bounds and unwritten output branches have undefined behavior.');

let position = 0;
let longTotal = 0;
let zeroWithImageValues = 0;
let zeroWithMinusOne = 0;
let controlMatched = 0;
console.log('Source: archived "Key Switch" image, SHA ff0491218e17b53bc8c98da22dbc8ec3b9aad911');
console.log('Authentic first page:', ciphertext.length, 'GP29 runes;', words.length, 'source-printed words');
console.log('Hypothesis: at every position allow either of two historical keys, discarding the restrictive switch condition');
console.log('Reference: TextBlob/Norvig English source lexicon with GP contractions and documented approximate spelling aliases');
for (let wi = 0; wi < words.length; wi++) {
  const original = words[wi];
  const currentPosition = position;
  position += original.length;
  if (original.length < 5) continue;
  longTotal++;
  const imageValues = candidates(original, currentPosition, 0);
  const zeroBased = candidates(original, currentPosition, -1);
  if (imageValues.length === 0) zeroWithImageValues++;
  if (zeroBased.length === 0) zeroWithMinusOne++;
  console.log('p0 w' + (wi + 1), 'rune offset', currentPosition,
    'length', original.length, 'possible native words:',
    imageValues.length, zeroBased.length);
  // A synthetic membership positive uses a real native lexicon word of the
  // identical GP length; it does not claim the flawed historical switch is invertible.
  const known = (wordList.get(original.length) || [])[0];
  assert(known);
  const plant = known.runes.map((v, j) => (v + keys[0][(currentPosition + j) % 8]) % 29);
  assert(candidates(plant, currentPosition, 0).some(w => w.word === known.word));
  controlMatched++;
}
assert.equal(longTotal, 22);
assert.equal(zeroWithImageValues, 22);
assert.equal(zeroWithMinusOne, 22);
assert.equal(controlMatched, 22);
console.log('TEST PASS: source p0 long word count', longTotal,
  'zero native-English candidates under image-value rule', zeroWithImageValues,
  'zero candidates under off-by-one convention', zeroWithMinusOne,
  'synthetic source-length membership plants', controlMatched, '/', longTotal);
console.log('Scope: excludes ordinary fixed-word native GP-English under this exact historical key alignment');
console.log('No claim against unknown key, lexical register, inserted/deleted text, source-unselected clock, or other cipher.');
