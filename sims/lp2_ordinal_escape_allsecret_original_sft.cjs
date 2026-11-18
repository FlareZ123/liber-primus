'use strict';

/**
 * Source-exact reversible ordinal-escape hypothesis for LP2.
 *
 * At every step, the predecessor ciphertext glyph is reserved as a literal
 * escape output. The remaining 28 ciphertext glyphs encode ranks 0..27.
 * Rank28 emits the predecessor again. A single secret 29-symbol permutation
 * may map rank labels to arbitrary GP29 plaintext glyphs.
 *
 * This tests both natural rank orders (linear and cyclic), including the
 * strongest possible per-page/per-large-mark initial-state freedom.
 * All operations are reversible for every secret alphabet permutation.
 *
 * Run: node sims/lp2_ordinal_escape_allsecret_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
/** @type {{pages:Array<{page:number,indices:number[]}>,translit:string[]}} */
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
/** @type {{events:Array<{symbol:string,rune_offset:number}>}} */
const punctuation = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-punctuation-identity.json'), 'utf8'));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length > 0);
const original = pages.flatMap(p => p.indices);
const clear = corpus.pages.find(p => p.page === 57).indices;
const N = original.length;
assert.equal(N, 12956);
assert.equal(pages.length, 55);
assert.equal(clear.length, 95);
assert.equal(corpus.translit.length, 29);

/**
 * @param {number} cur Cipher rune GP29 index.
 * @param {number} prev Previous cipher rune GP29 index.
 * @param {'linear'|'cyclic'} mode Ordinal ordering.
 * @returns {number} Rank 0..27 or reserved escape 28.
 */
function toRank(cur, prev, mode) {
  if (cur === prev) return 28;
  if (mode === 'linear') return cur - (cur > prev ? 1 : 0);
  return (cur - prev + 28) % 29;
}

/**
 * @param {number} rank GP rank, with 28 reserved as repeat escape.
 * @param {number} prev Previous cipher rune GP29 index.
 * @param {'linear'|'cyclic'} mode Ordinal ordering.
 * @returns {number} Cipher rune GP29 index.
 */
function fromRank(rank, prev, mode) {
  if (rank === 28) return prev;
  if (mode === 'linear') return rank + (rank >= prev ? 1 : 0);
  return (prev + 1 + rank) % 29;
}

/**
 * @param {number[]} xs GP rank indices.
 * @returns {number} Normalized coincidence probability.
 */
function ioc(xs) {
  const counts = Array(29).fill(0);
  for (const x of xs) counts[x]++;
  return counts.reduce((v, n) => v + n * (n - 1), 0) /
    (xs.length * (xs.length - 1));
}

/**
 * @param {number[][]} batches Cipher index arrays in printed page order.
 * @param {'linear'|'cyclic'} mode Ordinal ordering.
 * @param {boolean} pageReset F initial predecessor at each source page.
 * @returns {number[][]} Reversible ciphertext-derived rank arrays.
 */
function decode(batches, mode, pageReset) {
  let prev = 0;
  return batches.map(batch => {
    if (pageReset) prev = 0;
    return batch.map(cur => {
      const rank = toRank(cur, prev, mode);
      prev = cur;
      return rank;
    });
  });
}

/**
 * @param {number[][]} batches Rank arrays in printed page order.
 * @param {'linear'|'cyclic'} mode Ordinal ordering.
 * @param {boolean} pageReset F initial predecessor at each source page.
 * @returns {number[][]} Exact ciphertext forward image.
 */
function encode(batches, mode, pageReset) {
  let prev = 0;
  return batches.map(batch => {
    if (pageReset) prev = 0;
    return batch.map(rank => {
      const cur = fromRank(rank, prev, mode);
      prev = cur;
      return cur;
    });
  });
}

// The 35 source-attested large-mark/comma events may trigger a new state.
// Grant even stronger freedom by allowing their successor rune and every
// original physical-page first rune an arbitrary decoded rank 0..28.
const free = new Set([0]);
let offset = 0;
for (const page of pages) {
  free.add(offset);
  offset += page.indices.length;
}
const marks = punctuation.events.filter(e =>
  e.symbol === '⁜' || e.symbol === '⁚');
assert.equal(marks.length, 35);
for (const mark of marks) {
  if (mark.rune_offset < N) free.add(mark.rune_offset);
}
assert.equal(free.size, 78);

const nativePlant = Array.from({length: N}, (_, i) => clear[i % clear.length]);
const nativeIoC = ioc(nativePlant);
assert.ok(nativeIoC > 0.07);
// Secret GP alphabet, rank28 represents source-native plaintext F.
const secretAlphabet = Array.from({length: 29}, (_, i) => (i + 1) % 29);
const secretInverse = Array.from({length: 29}, (_, k) =>
  secretAlphabet.indexOf(k));
assert.equal(new Set(secretAlphabet).size, 29);
const payload = pages.map(p => p.indices);

/**
 * Exact key-independent IoC ceiling after assigning an arbitrary secret
 * 29-symbol alphabet independently to every original chapter or page.
 * Descending histogram alignment is globally optimal by rearrangement.
 *
 * @param {'linear'|'cyclic'} mode
 * @param {'chapter'|'page'} scale
 * @returns {number}
 */
function perSegmentSecretCeiling(mode, scale) {
  const groups = scale === 'chapter'
    ? [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
      [27, 32], [33, 39], [40, 53], [54, 55]]
    : pages.map(page => [page.page, page.page]);
  const histograms = groups.map(() => Array(29).fill(0));
  let predecessor = 0;
  let offset = 0;
  for (const page of pages) {
    const g = groups.findIndex(bounds =>
      page.page >= bounds[0] && page.page <= bounds[1]);
    assert.ok(g >= 0);
    for (const cur of page.indices) {
      if (!free.has(offset)) {
        histograms[g][toRank(cur, predecessor, mode)]++;
      }
      predecessor = cur;
      offset++;
    }
  }
  assert.equal(offset, N);
  const aligned = Array(29).fill(0);
  for (const histogram of histograms) {
    const ordered = [...histogram].sort((a, b) => b - a);
    for (let i = 0; i < 29; i++) aligned[i] += ordered[i];
  }
  const fixed = aligned.reduce((a, b) => a + b, 0);
  assert.equal(fixed, N - free.size);
  // Grant *all* page/mark starts to the largest output bin, optimistically.
  aligned[0] += free.size;
  return aligned.reduce((sum, n) => sum + n * (n - 1), 0) /
    (N * (N - 1));
}

const outcomes = [];
for (const mode of ['linear', 'cyclic']) {
  // All 29! secret alphabet choices preserve the multiset of ranks and IoC.
  // This exact source-boundary adversarial bound permits *any* rank at
  // each of 78 potential source-visible initial-state positions.
  const counts = Array(29).fill(0);
  let prev = 0;
  for (let i = 0; i < N; i++) {
    const cur = original[i];
    if (!free.has(i)) counts[toRank(cur, prev, mode)]++;
    prev = cur;
  }
  const nonfreeCount = counts.reduce((a, b) => a + b, 0);
  assert.equal(nonfreeCount, N - 78);
  const most = Math.max(...counts);
  const collisions = counts.reduce((a, b) => a + b * (b - 1), 0);
  const upper = (
    collisions - most * (most - 1) +
    (most + free.size) * (most + free.size - 1)
  ) / (N * (N - 1));
  assert.ok(upper < 0.036, 'new ordinal-escape candidate: investigate');
  const chapterCeiling = perSegmentSecretCeiling(mode, 'chapter');
  const pageCeiling = perSegmentSecretCeiling(mode, 'page');
  assert.ok(chapterCeiling < 0.037);
  assert.ok(pageCeiling < 0.04);
  const expected = mode === 'linear'
    ? [0.03592034745394232, 0.03926775766543628]
    : [0.036087990239565104, 0.0394514986388035];
  assert.ok(Math.abs(chapterCeiling - expected[0]) < 1e-13);
  assert.ok(Math.abs(pageCeiling - expected[1]) < 1e-13);

  for (const pageReset of [false, true]) {
    const decoded = decode(payload, mode, pageReset);
    assert.deepEqual(encode(decoded, mode, pageReset), payload,
      'reversible original cipher roundtrip must hold');
    const directIoC = ioc(decoded.flat());
    assert.ok(directIoC <= upper + 1e-13);
    assert.ok(directIoC < 0.036);

    // A complete source-native p57 language plant is encrypted through
    // a genuinely hidden 29-symbol label permutation and exactly recovered.
    let at = 0;
    const plantRanks = payload.map(batch => batch.map(() =>
      secretInverse[nativePlant[at++]]));
    const ciphertextPlant = encode(plantRanks, mode, pageReset);
    const recovered = decode(ciphertextPlant, mode, pageReset)
      .flat().map(rank => secretAlphabet[rank]);
    assert.deepEqual(recovered, nativePlant);
    assert.ok(ioc(recovered) > 0.07);
    outcomes.push({
      mode, pageReset, sourceIoC: directIoC, arbitrarySecretAlphabetMaxIoC: upper,
      allNineChapterAlphabetsMaxIoC: chapterCeiling,
      all55PageAlphabetsMaxIoC: pageCeiling,
      nativePlantIoC: nativeIoC, nativePlantRecovered: N,
    });
  }
}
console.log(JSON.stringify({
  decision: 'ordinal 28+escape with even page-local secret alphabets cannot yield native English unigram profile',
  input: 'canonical original LP2 physical pp0-55',
  originalRunes: N, printedPages: pages.length,
  largeAndCommaEvents: marks.length, freeResetsGranted: free.size,
  secretAlphabetKeysCoveredByIoCInvariant: '29! globally, independently per page or chapter',
  exactForwardReencryption: 'verified; not decryption evidence',
  outcomes,
}, null, 2));
