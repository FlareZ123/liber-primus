'use strict';

/**
 * Source-passage recovery attempt: first-party LP2 original ciphertext vs
 * pre-2014 public-domain Hermetic work "The Kybalion" (Project Gutenberg 14209).
 *
 * Two independently testable, key-independent plaintext predictions:
 * A) the printed GP word lengths preserve a contiguous original English quote;
 * B) a repeat of the ciphertext rune marks one secret plaintext GP symbol,
 *    irrespective of secret nonrepeat-key alphabets and printed words.
 * Both search complete source and untouched original-cipher targets.
 *
 * Reproduce in Windows 11 / Node.js 22:
 * node sims/lp2_kybalion_1908_original_plaintext_passage_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const read = (filename) => fs.readFileSync(path.join(root, filename), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const raw = read('resources/external/kybalion-gitenberg-14209.txt');
const sourceSha = crypto.createHash('sha1')
  .update('blob ' + Buffer.byteLength(raw) + '\0')
  .update(raw)
  .digest('hex');
assert.equal(sourceSha, '04b68061063bd61a0f7192c48d2dfd9c60370bcf');
const begin = raw.search(/\*\*\*\s*START/i), end = raw.search(/\*\*\*\s*END/i);
assert.ok(begin >= 0 && end > begin);
const body = raw.slice(begin, end);
const sourceWords = body.match(/[A-Za-z]+/g) || [];
const tokens = gp.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} original @returns {number[]} */
function encodeNativeGP(original) {
  const text = original.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const output = [];
  for (let i = 0; i < text.length;) {
    if (text.startsWith('ING', i)) { output.push(21); i += 3; }
    else if (text.startsWith('IO', i)) { output.push(27); i += 2; }
    else {
      const term = tokens.find((t) => text.startsWith(t.s, i));
      assert.ok(term, 'unmapped public-domain source Latin spelling');
      output.push(term.i);
      i += term.s.length;
    }
  }
  return output;
}
const sourceWordsGP = sourceWords.map(encodeNativeGP);
const sourceRunes = sourceWordsGP.flat();
assert.equal(sourceWords.length, 34347);
assert.equal(sourceRunes.length, 148189);
const originalPages = gp.pages.filter((p) => p.page <= 55 && p.indices.length);
const unknown = originalPages.flatMap((p) => p.indices);
const physicalPageStart = new Set();
let pos = 0;
for (const pg of originalPages) {
  physicalPageStart.add(pos);
  pos += pg.indices.length;
}
assert.equal(pos, 12956);
assert.equal(physicalPageStart.size, 55);

// Preserve the actual physical line/page carries and split only at
// explicit printed word separators; ignore newlines, /, % and page labels.
const actualTranscription = read('resources/liber-primus/lp2-transcription.txt');
const unknownTranscription = actualTranscription.split(/\n%\s*\n/).slice(0, 55).join('');
const runeSet = new Set(gp.runes);
const manuscriptWords = unknownTranscription.split(/[-.$&]/)
  .map((section) => [...section].filter((ch) => runeSet.has(ch)))
  .filter((word) => word.length);
const lengths = manuscriptWords.map((w) => w.length);
assert.equal(lengths.length, 2896);
assert.equal(lengths.reduce((a, b) => a + b), 12956);
assert.deepEqual(manuscriptWords.flat().map((x) => gp.runes.indexOf(x)), unknown);

const sourceLengths = sourceWordsGP.map((word) => word.length);
const signature = (arr, i, n) => arr.slice(i, i + n).join(',');
const sourceEight = new Map();
for (let j = 0; j + 8 <= sourceLengths.length; j++) {
  const key = signature(sourceLengths, j, 8);
  let indices = sourceEight.get(key);
  if (!indices) { indices = []; sourceEight.set(key, indices); }
  indices.push(j);
}
let match8 = 0, match9 = 0, maxMatch = 0;
for (let i = 0; i + 8 <= lengths.length; i++) {
  for (const j of sourceEight.get(signature(lengths, i, 8)) || []) {
    let n = 8;
    while (i + n < lengths.length && j + n < sourceLengths.length &&
      lengths[i + n] === sourceLengths[j + n]) n++;
    match8++;
    if (n >= 9) match9++;
    maxMatch = Math.max(maxMatch, n);
  }
}
assert.equal(match8, 10);
assert.equal(match9, 0);
assert.equal(maxMatch, 8);

// An independent 18-source-word plant must be found at its original offset.
const plantedPosition = 112;
const plantedLengths = sourceLengths.slice(plantedPosition, plantedPosition + 18);
assert.equal(plantedLengths.length, 18);
assert.ok((sourceEight.get(signature(plantedLengths, 0, 8)) || [])
  .includes(plantedPosition));
assert.deepEqual(plantedLengths, sourceLengths.slice(plantedPosition, plantedPosition + 18));

const chapterEnds = [729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956];
const chapterStarts = [0, ...chapterEnds.slice(0, -1)];
const expectedEventCounts = [4, 6, 9, 10, 11, 13, 12, 18, 3];
const prefix = Array.from({ length: 29 }, () => new Uint32Array(sourceRunes.length + 1));
for (let r = 0; r < 29; r++)
  for (let i = 0; i < sourceRunes.length; i++)
    prefix[r][i + 1] = prefix[r][i] + (sourceRunes[i] === r ? 1 : 0);

/**
 * Exact source-passage recovery with an arbitrary fixed special rune r:
 * C[i]===C[i-1] iff plaintext[i]===r on every eligible physical page rune.
 *
 * @param {number} start original chapter global runic start
 * @param {number} end original chapter global runic end
 * @param {number[]} cipher complete ciphertext
 * @param {boolean} early stop after first match
 * @returns {{positions:number[],end:number,found:number,example:object|null,events:number}}
 */
function searchSource(start, end, cipher, early = false) {
  const n = end - start;
  const events = [], invalid = [0];
  for (let j = 1; j < n; j++) {
    if (physicalPageStart.has(start + j)) invalid.push(j);
    else if (cipher[start + j] === cipher[start + j - 1]) events.push(j);
  }
  let found = 0, example = null;
  for (let rune = 0; rune < 29; rune++) {
    const tally = prefix[rune];
    for (let offset = 0; offset + n <= sourceRunes.length; offset++) {
      let count = tally[offset + n] - tally[offset];
      for (const j of invalid) count -= +(sourceRunes[offset + j] === rune);
      if (count !== events.length) continue;
      if (!events.every((j) => sourceRunes[offset + j] === rune)) continue;
      found++;
      if (!example) example = { sourceRuneStart: offset, specialRune: rune };
      if (early) return { positions: events, end: n, found, example, events: events.length };
    }
  }
  return { positions: events, end: n, found, example, events: events.length };
}

/**
 * Fully reversible positive-model encoder. At each physical page leader,
 * emit plaintext literally; at later positions, encode an R as predecessor
 * repeat and 28 other GP symbols via a nonzero predecessor-relative rank.
 * @param {number[]} plain
 * @param {number} r
 * @param {number} originalGlobalOffset
 * @returns {number[]}
 */
function encodeMarker(plain, r, originalGlobalOffset) {
  const encrypted = [];
  for (let i = 0; i < plain.length; i++) {
    if (!i || physicalPageStart.has(originalGlobalOffset + i)) encrypted.push(plain[i]);
    else if (plain[i] === r) encrypted.push(encrypted[i - 1]);
    else {
      const rank = plain[i] > r ? plain[i] - 1 : plain[i];
      encrypted.push((encrypted[i - 1] + 1 + rank) % 29);
    }
  }
  return encrypted;
}
function decodeMarker(cipher, r, originalGlobalOffset) {
  const plain = [];
  for (let i = 0; i < cipher.length; i++) {
    if (!i || physicalPageStart.has(originalGlobalOffset + i)) plain.push(cipher[i]);
    else if (cipher[i] === cipher[i - 1]) plain.push(r);
    else {
      const rank = (cipher[i] - cipher[i - 1] - 1 + 29) % 29;
      plain.push(rank >= r ? rank + 1 : rank);
    }
  }
  return plain;
}
const synthetic = sourceRunes.slice(101, 830);
const special = 28;
const syntheticCipher = encodeMarker(synthetic, special, 0);
assert.deepEqual(decodeMarker(syntheticCipher, special, 0), synthetic);
const syntheticMask = new Set();
for (let j = 1; j < synthetic.length; j++)
  if (!physicalPageStart.has(j) && syntheticCipher[j] === syntheticCipher[j - 1])
    syntheticMask.add(j);
for (let j = 1; j < synthetic.length; j++)
  if (!physicalPageStart.has(j))
    assert.equal(syntheticMask.has(j), synthetic[j] === special);
assert.ok(syntheticMask.size > 1);

const chapters = chapterStarts.map((start, chapter) => {
  const end = chapterEnds[chapter];
  const answer = searchSource(start, end, unknown);
  assert.equal(answer.events, expectedEventCounts[chapter]);
  assert.equal(answer.found, 0);
  return { chapter: chapter + 1, originalRunes: end - start,
    repeatEvents: answer.events, sourceMatches: answer.found };
});
assert.equal(chapters.reduce((sum, x) => sum + x.repeatEvents, 0), 86);
console.log(JSON.stringify({
  source: 'GITenberg PG14209 1908 Kybalion',
  sourceGitBlobSHA1: sourceSha,
  originalRunes: unknown.length,
  originalWords: manuscriptWords.length,
  sourceNativeRunes: sourceRunes.length,
  sourceWords: sourceWords.length,
  sourceWordLength8Matches: match8,
  sourceWordLength9orMoreMatches: match9,
  longestMatchedPrintedWordRun: maxMatch,
  originalChapters: chapters,
  positive: {
    planted18SourceWordsRecovered: true,
    syntheticNativeRerecovered: synthetic.length,
    syntheticMarkerRerecovered: syntheticMask.size
  }
}, null, 2));
console.log('PASS: no copied original chapter under either exact plaintext-carrying source model');
