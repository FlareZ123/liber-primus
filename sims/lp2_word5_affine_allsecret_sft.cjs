'use strict';

/**
 * Original LP2 5-phase word-local affine model, secret-key-independent SFT.
 *
 * Candidate family, per original printed rune word w:
 * C[w,j] = a[w]*P[w,j] + b[w,j%5] (mod 29),
 * a[w] in {1,...,28}, b[w,0..4] arbitrary.
 * This is a source-motivated hypothesis, NOT an established LP2 operation.
 *
 * For j >= 5, C[j]-C[j-5] = a*(P[j]-P[j-5]) (mod29).
 * Normalize the first nonzero difference to 1. Its remaining ratios form
 * an exact invariant under ALL 28*29^5 unknown word-specific keys.
 *
 * Single-file test: node sims/lp2_word5_affine_allsecret_sft.cjs
 * Reads checked-in original LP2 and four native-English reference corpora.
 * Node.js 22; CommonJS; no third-party dependencies or file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(root, name), 'utf8').replace(/\r\n/g, '\n');
}
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const lp1 = read('resources/transcriptions/lp1_wulfic_canonical.txt');
const alphabet = new Map(gp.runes.map((r, i) => [r, i]));
const tokens = gp.translit.map((s, i) => ({s, i})).sort((a, b) => b.s.length - a.s.length);
const inv = Array(29).fill(0);
for (let a = 1; a < 29; a++) {
  for (let b = 1; b < 29; b++) if (a * b % 29 === 1) inv[a] = b;
}
assert(inv.slice(1).every(x => x > 0));

/** @param {number} n @returns {number} */
function mod29(n) {
  return (n % 29 + 29) % 29;
}

/** @param {string} text @returns {number[][]} */
function runeWords(text) {
  return text.replace(/[\r\n\t\/% ]/g, '').split(/[-.&$§0-9]+/).filter(Boolean).map(w =>
    [...w].map(r => {
      const n = alphabet.get(r);
      assert(n !== undefined, 'unknown original GP rune: ' + r);
      return n;
    })
  );
}

/** Source-attested GP English spelling including ING/IO and C/K normalization.
 * @param {string} input @returns {number[]}
 */
function encode(input) {
  const word = input.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const result = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith('ING', i)) {
      result.push(21);
      i += 3;
    } else if (word.startsWith('IO', i)) {
      result.push(27);
      i += 2;
    } else {
      const token = tokens.find(t => word.startsWith(t.s, i));
      assert(token, 'unmappable word ' + input);
      result.push(token.i);
      i += token.s.length;
    }
  }
  return result;
}

/** @param {number[]} word @returns {number[]} */
function fiveDeltas(word) {
  return word.slice(5).map((n, j) => mod29(n - word[j]));
}

/** @param {number[]} word @returns {[string,string]} */
function signatures(word) {
  const diffs = fiveDeltas(word);
  const first = diffs.find(x => x !== 0) || 0;
  const projective = first ? diffs.map(x => x * inv[first] % 29) : diffs;
  return [
    word.length + ':' + diffs.join('.'),
    word.length + ':' + projective.join('.')
  ];
}

/** Secret slope and phase shifts chosen independently for every source word.
 * @param {number[]} plain @param {number} a @param {number[]} phase
 * @returns {number[]}
 */
function encrypt(plain, a, phase) {
  return plain.map((p, j) => mod29(a * p + phase[j % 5]));
}

/** @param {number[]} cipher @param {number} a @param {number[]} phase
 * @returns {number[]}
 */
function decrypt(cipher, a, phase) {
  return cipher.map((c, j) => mod29(inv[a] * (c - phase[j % 5])));
}

/** Exact minimum rune-identity changes to fit this candidate word into the
 * secret family for a specific reference word. For fixed a, maximize the
 * multiplicity of each residual C[j]-a*P[j] separately in each of five phases.
 * The modal residual is the optimal secret b for that phase.
 * @param {number[]} cipher @param {number[]} plain @returns {number}
 */
function minEdits(cipher, plain) {
  assert.equal(cipher.length, plain.length);
  let best = cipher.length;
  for (let a = 1; a < 29; a++) {
    const counts = new Uint8Array(145);
    const maxima = new Uint8Array(5);
    for (let j = 0; j < cipher.length; j++) {
      const index = (j % 5) * 29 + mod29(cipher[j] - a * plain[j]);
      const count = ++counts[index];
      if (count > maxima[j % 5]) maxima[j % 5] = count;
    }
    let loss = cipher.length;
    for (const m of maxima) loss -= m;
    if (loss < best) best = loss;
    if (best === 0) break;
  }
  return best;
}

const records = transcript.split('%');
const original = runeWords(records.slice(0, 55).join('%'));
assert.equal(original.length, 2896);
assert.equal(original.reduce((sum, w) => sum + w.length, 0), 12956);
assert.equal(original.filter(w => w.length >= 10 && w.length <= 14).length, 109);
const files = [
  'resources/control/english_wordfreq_textblob.txt',
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt'
];
// All unique native words in the fixed four-source reference panel.
const termSet = new Set();
for (const f of files) {
  for (const s of read(f).match(/[A-Za-z]+/g) || []) termSet.add(s.toLowerCase());
}
const native = new Map();
const additiveSignatures = new Set();
const affineSignatures = new Set();
for (const term of termSet) {
  const word = encode(term);
  if (word.length < 6 || word.length > 14) continue;
  if (!native.has(word.length)) native.set(word.length, []);
  native.get(word.length).push(word);
  const [additive, affine] = signatures(word);
  additiveSignatures.add(additive);
  affineSignatures.add(affine);
}
const buckets = {};
let editBudget = 0;
let totalLong = 0;
for (const cipher of original) {
  const len = cipher.length;
  if (len < 6 || len > 14) continue;
  if (!buckets[len]) buckets[len] = {length: len, total: 0, additive: 0, affine: 0, editBudget: 0, editDistances: {}};
  const b = buckets[len];
  b.total++;
  const [addSig, affSig] = signatures(cipher);
  if (additiveSignatures.has(addSig)) b.additive++;
  if (affineSignatures.has(affSig)) b.affine++;
  if (len < 10) continue;
  totalLong++;
  let min = len;
  for (const plain of native.get(len) || []) {
    const d = minEdits(cipher, plain);
    if (d < min) min = d;
    if (min === 0) break;
  }
  b.editBudget += min;
  b.editDistances[min] = (b.editDistances[min] || 0) + 1;
  editBudget += min;
}
assert.equal(totalLong, 109);
const expected = [
  [6, 256, 256, 256, 0],
  [7, 216, 212, 216, 0],
  [8, 156, 26, 156, 0],
  [9, 78, 1, 10, 0],
  [10, 52, 0, 0, 82],
  [11, 32, 0, 0, 74],
  [12, 18, 0, 0, 57],
  [13, 4, 0, 0, 15],
  [14, 3, 0, 0, 16]
];
for (const [len, total, add, aff, edits] of expected) {
  assert.deepEqual(
    [buckets[len].total, buckets[len].additive, buckets[len].affine, buckets[len].editBudget],
    [total, add, aff, edits], 'model source contract L=' + len
  );
}
assert.equal(editBudget, 244);
assert(editBudget > 86);

// Check the original solved GP register is not systematically outside the
// fixed English signature panel. p10->p11 word carry is counted as separate
// page fragments here, but no such split occurs in the >=8 subset.
const lp1pages = lp1.split('%');
const clear = [3,8,9,10,11,14].flatMap(page => runeWords(lp1pages[page]));
const longClear = clear.filter(w => w.length >= 8 && w.length <= 14);
assert.equal(longClear.length, 25);
assert.equal(longClear.filter(w => additiveSignatures.has(signatures(w)[0])).length, 21);
assert.equal(longClear.filter(w => affineSignatures.has(signatures(w)[1])).length, 23);
const p57 = runeWords(records[56]);
assert.equal(p57.reduce((a, w) => a + w.length, 0), 95);
assert.equal(p57.filter(w => w.length >= 8 && w.length <= 14).length, 2);

// Independent planted positive: arbitrary word-specific nonzero slopes and
// five independently chosen shifts, with exact 109-word inverse re-encryption.
let random = 0x47053301;
function rand() {
  random ^= random << 13;
  random ^= random >>> 17;
  random ^= random << 5;
  return random >>> 0;
}
let positives = 0;
for (const row of original.filter(w => w.length >= 10 && w.length <= 14)) {
  const plain = native.get(row.length)[rand() % native.get(row.length).length];
  const a = 1 + rand() % 28;
  const shifts = Array.from({length: 5}, () => rand() % 29);
  const cipher = encrypt(plain, a, shifts);
  assert.deepEqual(decrypt(cipher, a, shifts), plain);
  assert.equal(signatures(cipher)[1], signatures(plain)[1]);
  assert.equal(minEdits(cipher, plain), 0);
  positives++;
}
assert.equal(positives, 109);

process.stdout.write(JSON.stringify({
  status: 'bounded exact original-input negative, no recovered plaintext',
  model: 'word-specific invertible slope and five arbitrary phase shifts in GP29',
  originals: {words: original.length, runes: 12956, longWords: totalLong},
  reference: {sourceFiles: files, uniqueLatinWords: termSet.size,
    additiveSignatures: additiveSignatures.size, affineSignatures: affineSignatures.size},
  byLength: expected.map(([len]) => buckets[len]),
  minimumChangedRuneIdentities: editBudget,
  availableAdjacentRepeatEvents: 86,
  sourceNativeClearLp1: {longWords: 25, additiveCompatible: 21, affineCompatible: 23},
  positiveControls: {wordSpecificSecrets: positives, allRuneRoundTrips: true}
}, null, 2) + '\n');
