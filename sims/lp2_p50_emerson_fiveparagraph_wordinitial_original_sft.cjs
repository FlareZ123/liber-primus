'use strict';

/**
 * Source-locked, read-only SFT for a historical two-field book-code recipient.
 * Reproduction: node sims/lp2_p50_emerson_fiveparagraph_wordinitial_original_sft.cjs
 * All paths and operations run in Windows 11 / Node.js 22.
 *
 * The rule is a hypothetical transfer of the author's authenticated 2014
 * Self-Reliance selection, not a demonstrated LP2 instruction.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const essay = readJson('resources/external/2014-emerson-firstfive-word60-source.json');
const grid = readJson('resources/liber-primus/base60-grid.json');
const corpus = readJson('resources/liber-primus/lp2-corpus.json');

const G = 29;
const sourceWords = essay.first_sixty_words;
const tokens = grid.rows.flat();
const rawBytes = Buffer.from(grid.byte_rows.flat());
assert.equal(essay.source_blob_sha1, '12a6bc018047a1276e77f2b7f633d5905732fff9');
assert.deepEqual(essay.original_paragraph_word_counts, [283, 241, 112, 182, 221]);
assert.equal(sourceWords.length, 5);
for (const words of sourceWords) assert.equal(words.length, 60);
assert.equal(tokens.length, 256);
assert.equal(grid.rows.length, 32);
for (const row of grid.rows) assert.equal(row.length, 8);
assert.equal(rawBytes.length, 256);
assert.equal(
  crypto.createHash('sha256').update(rawBytes).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290'
);

const alphabet = grid.alphabet;
assert.equal(alphabet, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
/** @type {Array<[number, number]>} */
const addresses = tokens.map((cell) => {
  assert.equal(cell.length, 2);
  const pair = /** @type {[number, number]} */ ([alphabet.indexOf(cell[0]), alphabet.indexOf(cell[1])]);
  assert.ok(pair[0] >= 0 && pair[0] < 5 && pair[1] >= 0 && pair[1] < 60);
  return pair;
});
assert.deepEqual(addresses[0], [3, 23]);
assert.equal(sourceWords[3][23], 'rebel');

/** Zero-based paragraph and zero-based word, output each addressed word's first letter. */
const initials = addresses.map(([paragraph, word]) => sourceWords[paragraph][word][0].toUpperCase());
const externalMessage = initials.join('');
assert.equal(initials.length, 256);
assert.equal(externalMessage.slice(0, 70), 'RETOWWTNHDTPODNATAAMGFFFCEASHMODTHAOBIDSIMTCTCBIANCFHWTIMTOHNBVOEASABC');
assert.equal(externalMessage.slice(-30), 'CDTIOHNYBTWIAATOTCAWEATTSTWTII');

const gp = new Map(corpus.translit.map((label, index) => [label, index]));
/** Historic native GP normalizes Latin V to U; no unsupported letter occurs. */
const key = initials.map((ch) => {
  const mapped = gp.get(ch === 'V' ? 'U' : ch);
  assert.notEqual(mapped, undefined, 'Every first initial must map to one GP symbol');
  return /** @type {number} */ (mapped);
});
assert.equal(key.length, 256);
assert.deepEqual(key.slice(0, 5), [corpus.translit.indexOf('R'), corpus.translit.indexOf('E'), corpus.translit.indexOf('T'), corpus.translit.indexOf('O'), corpus.translit.indexOf('W')]);

/**
 * @param {number[]} a
 * @returns {number}
 */
function ioc(a) {
  const frequencies = Array(G).fill(0);
  for (const symbol of a) frequencies[symbol]++;
  return frequencies.reduce((total, n) => total + n * (n - 1), 0) / (a.length * (a.length - 1));
}

/**
 * @param {number[]} a
 * @returns {string}
 */
function roman(a) {
  return a.slice(0, 30).map((n) => corpus.translit[n]).join(' ');
}

/**
 * @param {number[]} cipherOrPlain
 * @param {number} sign
 * @param {(i: number) => number} clock
 * @returns {number[]}
 */
function shift(cipherOrPlain, sign, clock) {
  return cipherOrPlain.map((symbol, i) => (symbol + sign * key[clock(i)] + G) % G);
}

/**
 * @param {number} page
 * @returns {number[]}
 */
function pageIndices(page) {
  const data = corpus.pages.find((p) => p.page === page);
  assert.ok(data);
  return data.indices;
}
const before = pageIndices(49);
const after = pageIndices(51);
const p16 = pageIndices(16);
const native = pageIndices(57);
assert.equal(before.length, 66);
assert.equal(after.length, 92);
assert.equal(p16.length, 267);
assert.equal(native.length, 95);
const flank = [...before, ...after];
const continuous = (i) => i % key.length;
const gapReset = (i) => (i < before.length ? i : i - before.length) % key.length;
const expectations = new Map([
  ['minus-continuous', 0.035717165201967264],
  ['minus-reset', 0.03410465210029832],
  ['plus-continuous', 0.03394340079013142],
  ['plus-reset', 0.032492138998629363],
]);
console.log('AUTHENTIC_SOURCES', JSON.stringify({
  essay: essay.source_blob_sha1,
  firstFiveParagraphWordCounts: essay.original_paragraph_word_counts,
  addresses: tokens.length,
  tableSHA256: crypto.createHash('sha256').update(rawBytes).digest('hex'),
}));
console.log('EXTERNAL_FIRST_INITIALS_256', externalMessage);
console.log('BASELINES', JSON.stringify({
  flank: ioc(flank), p16: ioc(p16), genuineSolvedP57: ioc(native),
}));

let tests = 0;
for (const sign of [-1, 1]) {
  for (const [clockName, clock] of [['continuous', continuous], ['reset', gapReset]]) {
    const plaintextCandidate = shift(flank, sign, clock);
    const label = (sign === -1 ? 'minus' : 'plus') + '-' + clockName;
    assert.ok(Math.abs(ioc(plaintextCandidate) - expectations.get(label)) < 1e-14, label);
    assert.deepEqual(shift(plaintextCandidate, -sign, clock), flank);
    const nativePlant = Array.from({ length: flank.length }, (_, i) => native[i % native.length]);
    const plantedCipher = shift(nativePlant, -sign, clock);
    assert.deepEqual(shift(plantedCipher, sign, clock), nativePlant);
    console.log('ORIGINAL_FLANK', label, 'runes', flank.length,
      'ioc', ioc(plaintextCandidate).toFixed(12), 'prefixGP', roman(plaintextCandidate));
    tests++;
  }
  const p16Candidate = shift(p16, sign, continuous);
  const expectP16 = sign === -1 ? 0.03511587958660697 : 0.03258145363408521;
  assert.ok(Math.abs(ioc(p16Candidate) - expectP16) < 1e-14);
  assert.deepEqual(shift(p16Candidate, -sign, continuous), p16);
  const plantedNative = Array.from({ length: p16.length }, (_, i) => native[i % native.length]);
  assert.deepEqual(shift(shift(plantedNative, -sign, continuous), sign, continuous), plantedNative);
  console.log('ORIGINAL_INDEPENDENT_P16', sign, 'runes', p16.length,
    'ioc', ioc(p16Candidate).toFixed(12), 'prefixGP', roman(p16Candidate));
  tests++;
}

/**
 * All-secret obstruction: each original Emerson initial may select any
 * independent GP29 symbol permutation. Same-initial collision counts
 * survive EVERY such permutation. Controls are source-original clear
 * LP1 runes rather than synthesized English or fitted plaintext.
 *
 * @param {number[]} symbols
 * @returns {{hits: number, pairs: number, rate: number}}
 */
function sameInitialCollisions(symbols) {
  /** @type {Map<string, number[]>} */
  const groups = new Map();
  for (let i = 0; i < symbols.length; i++) {
    const letter = initials[i % initials.length];
    if (!groups.has(letter)) groups.set(letter, Array(G).fill(0));
    groups.get(letter)[symbols[i]]++;
  }
  let hits = 0;
  let pairs = 0;
  for (const freq of groups.values()) {
    const size = freq.reduce((sum, v) => sum + v, 0);
    pairs += size * (size - 1) / 2;
    hits += freq.reduce((sum, v) => sum + v * (v - 1) / 2, 0);
  }
  return { hits, pairs, rate: hits / pairs };
}

const master = fs.readFileSync(path.join(root, 'resources/transcriptions/liber_primus_master.txt'), 'utf8');
const decodeRune = new Map(corpus.runes.map((rune, index) => [rune, index]));
const lp1Sections = master.split(/\r?\n\r?\n/).slice(1).join('\n\n')
  .split(/^\s*%\s*$/m)
  .map((section) => [...section].filter((ch) => decodeRune.has(ch)).map((ch) => decodeRune.get(ch)));
assert.equal(lp1Sections.length, 74);
assert.deepEqual(lp1Sections.slice(8, 12).map((a) => a.length), [187, 207, 192, 169]);
const independentlyClearLp1 = lp1Sections.slice(8, 12).flat();
assert.equal(independentlyClearLp1.length, 755);
assert.deepEqual(sameInitialCollisions(flank), { hits: 32, pairs: 947, rate: 32 / 947 });
assert.deepEqual(sameInitialCollisions(p16), { hits: 113, pairs: 3040, rate: 113 / 3040 });

/**
 * @param {number[]} original
 * @returns {{count: number, minimumHits: number, atMostOriginal: number}}
 */
function solvedNativeWindows(original) {
  let count = 0;
  let minimumHits = Number.POSITIVE_INFINITY;
  let atMostOriginal = 0;
  const target = sameInitialCollisions(original);
  for (let begin = 0; begin + original.length <= independentlyClearLp1.length; begin++) {
    const donor = independentlyClearLp1.slice(begin, begin + original.length);
    const observed = sameInitialCollisions(donor);
    assert.equal(observed.pairs, target.pairs);
    minimumHits = Math.min(minimumHits, observed.hits);
    if (observed.hits <= target.hits) atMostOriginal++;
    // Positive controls: source-letter-specific nonzero multipliers and
    // offsets form fully invertible affine GP29 permutations.
    const planted = donor.map((symbol, i) => {
      const order = initials[i % 256].charCodeAt(0) - 65;
      return ((1 + order % 28) * symbol + (7 * order + 3) % G) % G;
    });
    assert.deepEqual(sameInitialCollisions(planted), observed);
    count++;
  }
  return { count, minimumHits, atMostOriginal };
}

const nativeFlank = solvedNativeWindows(flank);
const nativeP16 = solvedNativeWindows(p16);
assert.deepEqual(nativeFlank, { count: 598, minimumHits: 37, atMostOriginal: 0 });
assert.deepEqual(nativeP16, { count: 489, minimumHits: 142, atMostOriginal: 0 });
console.log('ALL_SECRET_BIJECTION_INVARIANT', JSON.stringify({
  originalFlank: sameInitialCollisions(flank),
  originalP16: sameInitialCollisions(p16),
  nativeFlankWindows: nativeFlank,
  nativeP16Windows: nativeP16,
  conclusion: 'Every stationary letter-conditioned bijection preserves those original equality counts, all below genuine native-source controls',
}));

assert.equal(tests, 6);
console.log('PASS', tests, 'original variants, source-only 256-letter external book-code and solved-native GP29 plants.');
console.log('DECISION: This particular two-field Emerson initials and direct historical GP29 shift do not reveal prose. The source does not specify this LP2 mapping.');
