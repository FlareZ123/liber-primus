'use strict';

/**
 * Exact original-cipher wordwise progressive-affine exclusion over GP29.
 * A word may have its own secret a,b: C[j] = P[j] + a + j*b (mod 29).
 * The second discrete difference is invariant to both secrets.
 *
 * Single-file reproducibility test, Node.js 22 CommonJS:
 * node sims/lp2_word_progressive_affine_signature_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const reference = read('resources/control/english_wordfreq_textblob.txt');
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const tokens = gp.translit.map((word, index) => ({word, index}))
  .sort((a, b) => b.word.length - a.word.length);
const MAX_WORD_LENGTH = 14;

/** @param {number} x @returns {number} */
const mod = x => ((x % 29) + 29) % 29;

/** @param {string} word @returns {number[]|null} */
function encode(word) {
  const s = word.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S')
    .replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const out = [];
  for (let j = 0; j < s.length;) {
    const token = tokens.find(x => s.startsWith(x.word, j));
    if (!token) return null;
    out.push(token.index);
    j += token.word.length;
  }
  return out;
}

/**
 * Second differences C[j]-2*C[j-1]+C[j-2].
 * Equals the plaintext second differences for every secret a,b.
 * @param {number[]} values
 * @returns {string}
 */
function signature(values) {
  const codes = [];
  for (let j = 2; j < values.length; j++)
    codes.push(String.fromCharCode(65 + mod(
      values[j] - 2 * values[j - 1] + values[j - 2])));
  return codes.join('');
}

const native = Array.from({length: MAX_WORD_LENGTH + 1}, () => new Map());
for (const word of reference.match(/^[A-Za-z]+/gm) || []) {
  const values = encode(word);
  if (values && values.length <= MAX_WORD_LENGTH)
    native[values.length].set(values.join(','), values);
}
// GP-authenticated native standalone words; omit accidental lexicon initials.
native[1] = new Map([[3, [3]], [10, [10]], [24, [24]]]);
const wordsByLength = native.map(m => [...m.values()]);
const signatureByLength = wordsByLength.map(values =>
  new Set(values.map(signature)));
assert.deepEqual(wordsByLength.map(x => x.length).slice(0, 15),
  [0, 3, 188, 752, 2123, 3613, 4657, 4776, 4325, 3397,
    2388, 1450, 767, 379, 153]);

/** @typedef {{page:number,offset:number,indices:number[]}} Word */
/** @returns {Word[]} */
function originalWords() {
  /** @type {Word[]} */
  const result = [];
  let physicalPage = 0, localOffset = 0, current = [];
  let startPage = 0, startOffset = 0;
  function finish() {
    if (current.length) result.push({
      page: startPage, offset: startOffset, indices: current
    });
    current = [];
  }
  for (const ch of transcript.split('%').slice(0, 55).join('%')) {
    const symbol = runeIndex.get(ch);
    if (symbol !== undefined) {
      if (current.length === 0) {
        startPage = physicalPage < 50 ? physicalPage : physicalPage + 1;
        startOffset = localOffset;
      }
      current.push(symbol);
      localOffset++;
    } else if (ch === '%') {
      physicalPage++;
      localOffset = 0;
    } else if (ch === '/' || /\s/u.test(ch)) {
      // A printed word may continue across line or physical-page wraps.
    } else finish();
  }
  finish();
  return result;
}

const original = originalWords();
const ciphertext = gp.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices);
assert.equal(original.length, 2896);
assert.equal(ciphertext.length, 12956);
assert.equal(original.reduce((n, w) => n + w.indices.length, 0), 12956);
assert.deepEqual(original.flatMap(w => w.indices), ciphertext);

const printed = [];
for (let n = 4; n <= MAX_WORD_LENGTH; n++) {
  const selected = original.filter(w => w.indices.length === n);
  const hits = selected.filter(w => signatureByLength[n]
    .has(signature(w.indices)));
  printed.push({length: n, originalWordSlots: selected.length,
    compatibleSlots: hits.length});
}
assert.deepEqual(printed.map(x => x.originalWordSlots),
  [513, 317, 256, 216, 156, 78, 52, 32, 18, 4, 3]);
assert.deepEqual(printed.map(x => x.compatibleSlots),
  [488, 39, 1, 0, 0, 0, 0, 0, 0, 0, 0]);

// Stronger than preserving printed word breaks: every possible original
// contiguous window is admitted as a hypothetical word, regardless of
// punctuation, line boundary, or physical-page boundary.
const anycut = [];
for (let n = 6; n <= MAX_WORD_LENGTH; n++) {
  const hits = [];
  const signatures = signatureByLength[n];
  for (let start = 0; start <= ciphertext.length - n; start++) {
    const candidate = signature(ciphertext.slice(start, start + n));
    if (signatures.has(candidate)) hits.push(start);
  }
  anycut.push({length: n, originalWindows: ciphertext.length - n + 1,
    referenceSignatures: signatures.size, matches: hits.length,
    matchOffsets: hits});
}
assert.deepEqual(anycut.map(x => x.matches), [93, 2, 0, 0, 0, 0, 0, 0, 0]);
assert.deepEqual(anycut.find(x => x.length === 7).matchOffsets, [527, 12141]);

// A full-shape independent native-English positive: choose an original-length
// dictionary word for each of all 2896 slots, encrypt with an independently
// changing secret a and b per word and recover every rune exactly.
let position = 0, recovered = 0;
for (let w = 0; w < original.length; w++) {
  const n = original[w].indices.length;
  const list = wordsByLength[n];
  assert(list && list.length > 0,
    'missing independent native-GP word length ' + n);
  const plain = list[(w * 37 + 11) % list.length];
  const a = (w * 7 + 19) % 29, b = (w * 11 + 5) % 29;
  const encrypted = plain.map((p, j) => mod(p + a + b * j));
  const decoded = encrypted.map((c, j) => mod(c - a - b * j));
  assert.deepEqual(decoded, plain);
  if (n >= 4)
    assert(signatureByLength[n].has(signature(encrypted)));
  recovered += decoded.length;
  position += n;
}
assert.equal(position, 12956);
assert.equal(recovered, 12956);

console.log(JSON.stringify({
  model: 'every word independent arbitrary secret GP29 intercept and slope',
  original: {runes: ciphertext.length, printedWords: original.length},
  printed,
  anycut,
  positive: 'all 2896 original-length GP-native word plants round-trip; 12956/12956',
  decision: 'No original eight- to fourteen-rune window matches even one native GP word under any per-word linear positional key.'
}, null, 2));
