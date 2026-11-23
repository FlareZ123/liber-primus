'use strict';

/**
 * LP2 page-private monoalphabetic shared-plaintext gate.
 *
 * Exact input: repository's original-source GP29 transcription, 55 rune-bearing
 * unsolved physical pages, and punctuation positions.
 *
 * For a window, its equality pattern records the first-seen class of each rune.
 * Every injective page-private alphabet substitution preserves this pattern.
 * Thus a shared plaintext window requires matching patterns at BOTH ciphertext
 * locations, regardless of the secret alphabet.
 *
 * A deterministic constrained swap null independently randomizes rune positions
 * within each page while preserving:
 *  - every original page length and every original page rune count;
 *  - every page's exact 29-rune frequency vector;
 *  - the location of EVERY original adjacent-equal pair (including boundaries);
 *  - the exact printed word-gap pattern;
 *  - the first and last rune of each physical page.
 *
 * The null is a conditional MCMC control, not a proof that historical Cicada
 * generated ciphertext by this mechanism.
 *
 * Windows Node.js 22, CommonJS, read-only. No external packages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const source = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const corpusBytes = fs.readFileSync(path.join(source, 'lp2-corpus.json'));
const transcriptionBytes = fs.readFileSync(path.join(source, 'lp2-transcription.txt'));
const corpus = JSON.parse(corpusBytes.toString('utf8'));
const groups = transcriptionBytes.toString('utf8').split('%');
const symbolIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const originals = corpus.pages
  .filter((p) => p.page <= 55 && p.indices.length > 0)
  .map((p) => ({ page: p.page, runes: p.indices }));

assert.equal(originals.length, 55);
assert.equal(originals.reduce((a, p) => a + p.runes.length, 0), 12956);
assert.equal(groups.length, 57);

/**
 * Transcription "/" means a physical line wrap, including midword wraps.
 * Literal "-" and "." delimit printed words. Keep boundary bits separate
 * from the GP29 rune stream; do not reinterpret a line wrap as a space.
 *
 * @returns {Map<number, Uint8Array>}
 */
function readBoundaryMasks() {
  const masks = new Map();
  for (let groupId = 0; groupId < groups.length; groupId++) {
    const page = groupId < 50 ? groupId : groupId + 1;
    if (page > 55) continue;
    const text = groups[groupId];
    const glyphs = Array.from(text.matchAll(/[ᚠ-ᛪ]/gu));
    const sourceRunes = glyphs.map((g) => symbolIndex.get(g[0]));
    const expected = originals.find((p) => p.page === page);
    assert.ok(expected, 'missing page ' + page);
    assert.deepEqual(sourceRunes, expected.runes, 'transcription/corpus mismatch p' + page);

    const bits = new Uint8Array(glyphs.length);
    for (let i = 0; i < glyphs.length - 1; i++) {
      const intervening = text.slice(glyphs[i].index + 1, glyphs[i + 1].index);
      bits[i] = intervening.includes('-') || intervening.includes('.') ? 1 : 0;
    }
    masks.set(page, bits);
  }
  assert.equal(masks.size, originals.length);
  return masks;
}

const boundary = readBoundaryMasks();

/** @param {number[]} a @param {number} start @param {number} size */
function equalityPattern(a, start, size) {
  const observed = new Int8Array(29).fill(-1);
  let classes = 0;
  let pattern = '';
  for (let j = start; j < start + size; j++) {
    const rune = a[j];
    if (observed[rune] < 0) observed[rune] = classes++;
    pattern += String.fromCharCode(65 + observed[rune]);
  }
  return pattern;
}

/** @param {Uint8Array} a @param {number} start @param {number} size */
function wordMask(a, start, size) {
  let result = '';
  for (let j = start; j < start + size - 1; j++) result += a[j] ? '1' : '0';
  return result;
}

/**
 * Return every identical-pattern pair, counting same-page and cross-page
 * matches separately. Page identity is kept rather than array index.
 *
 * @param {{page:number,runes:number[]}[]} pages
 * @param {number} size
 * @param {boolean} includePairs
 */
function scan(pages, size, includePairs = false) {
  const seen = new Map();
  let samePage = 0;
  let crossPage = 0;
  let crossSameWordMask = 0;
  const pairs = [];

  for (const p of pages) {
    const b = boundary.get(p.page);
    for (let start = 0; start + size <= p.runes.length; start++) {
      const key = equalityPattern(p.runes, start, size);
      const mask = wordMask(b, start, size);
      let prior = seen.get(key);
      if (!prior) {
        prior = [];
        seen.set(key, prior);
      }
      for (const q of prior) {
        if (q.page === p.page) {
          samePage++;
        } else {
          crossPage++;
          if (q.mask === mask) crossSameWordMask++;
          if (includePairs) {
            pairs.push({ p1: q.page, a: q.start, p2: p.page, b: start });
          }
        }
      }
      prior.push({ page: p.page, start, mask });
    }
  }
  return { size, samePage, crossPage, crossSameWordMask, pairs };
}

/**
 * Derive one partial bijection from a matched header, then predict a strictly
 * unseen continuation without adding symbols to the guessed alphabet.
 *
 * @param {number[]} a
 * @param {number} ai
 * @param {number[]} b
 * @param {number} bi
 * @param {number} header
 * @param {number} continuation
 */
function continuationTest(a, ai, b, bi, header, continuation) {
  const forward = new Int8Array(29).fill(-1);
  const backward = new Int8Array(29).fill(-1);
  for (let i = 0; i < header; i++) {
    const x = a[ai + i];
    const y = b[bi + i];
    assert.ok(forward[x] < 0 || forward[x] === y);
    assert.ok(backward[y] < 0 || backward[y] === x);
    forward[x] = y;
    backward[y] = x;
  }
  const heldout = Math.min(continuation, a.length - ai - header, b.length - bi - header);
  let predicted = 0;
  let correct = 0;
  let incorrect = 0;
  let firstError = -1;
  for (let i = 0; i < heldout; i++) {
    const mapped = forward[a[ai + header + i]];
    if (mapped < 0) continue;
    predicted++;
    if (mapped === b[bi + header + i]) {
      correct++;
    } else {
      incorrect++;
      if (firstError < 0) firstError = i;
    }
  }
  return { heldout, predicted, correct, incorrect, firstError };
}

/** Deterministic xorshift32 RNG. */
class Rng {
  /** @param {number} seed */
  constructor(seed) {
    this.state = seed >>> 0;
    assert.notEqual(this.state, 0);
  }
  nextInt() {
    let s = this.state;
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    this.state = s >>> 0;
    return this.state;
  }
  /** @param {number} n */
  uniform(n) {
    return Math.floor((this.nextInt() / 4294967296) * n);
  }
}

/**
 * Exact-symbol-frequency, exact-adjacent-equality-site constrained MCMC.
 * Fixed physical first and last runes protect genuine cross-page joins.
 *
 * @param {number[]} a Input page rune indices, copied by caller.
 * @param {Rng} rng
 */
function shuffleConstrained(a, rng) {
  let accepted = 0;
  for (let attempt = 0; attempt < 12 * a.length; attempt++) {
    const i = 1 + rng.uniform(a.length - 2);
    const j = 1 + rng.uniform(a.length - 2);
    if (i === j || a[i] === a[j]) continue;

    const b0 = a[i - 1] === a[i];
    const b1 = a[i] === a[i + 1];
    const b2 = a[j - 1] === a[j];
    const b3 = a[j] === a[j + 1];

    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
    if (
      (a[i - 1] === a[i]) !== b0 ||
      (a[i] === a[i + 1]) !== b1 ||
      (a[j - 1] === a[j]) !== b2 ||
      (a[j] === a[j + 1]) !== b3
    ) {
      const undo = a[i];
      a[i] = a[j];
      a[j] = undo;
    } else {
      accepted++;
    }
  }
  return accepted;
}

/** Assert all important preserved statistics for a shuffled page. */
function assertPageConserved(before, after) {
  assert.equal(before.length, after.length);
  assert.equal(before[0], after[0]);
  assert.equal(before[before.length - 1], after[after.length - 1]);
  const f1 = new Int32Array(29);
  const f2 = new Int32Array(29);
  for (let i = 0; i < before.length; i++) {
    f1[before[i]]++;
    f2[after[i]]++;
    if (i > 0) {
      assert.equal(after[i] === after[i - 1], before[i] === before[i - 1]);
    }
  }
  assert.deepEqual(f1, f2);
}

/** Synthetic positive containing authentic p57 native runes in two secret alphabets. */
function positiveControl() {
  const p57 = corpus.pages.find((p) => p.page === 57);
  assert.ok(p57);
  const plaintext = p57.indices.concat(p57.indices, p57.indices);
  assert.ok(plaintext.length >= 132);
  const rng = new Rng(0x3301a140);
  const perm = () => {
    const out = Array.from({ length: 29 }, (_, i) => i);
    for (let i = 28; i > 0; i--) {
      const j = rng.uniform(i + 1);
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  };
  const a = perm();
  const b = perm();
  const encA = plaintext.map((x) => a[x]);
  const encB = plaintext.map((x) => b[x]);
  assert.equal(equalityPattern(encA, 0, 132), equalityPattern(encB, 0, 132));
  const result = continuationTest(encA, 0, encB, 0, 32, 100);
  assert.equal(result.heldout, 100);
  assert.ok(result.predicted >= 45);
  assert.equal(result.incorrect, 0);
  return result;
}

const sizes = [20, 21, 24, 28, 32];
const actual = sizes.map((n) => scan(originals, n, n === 20));
assert.equal(actual[0].crossPage, 19);
assert.equal(actual[0].samePage, 2);
assert.equal(actual[0].crossSameWordMask, 0);
for (const row of actual.slice(1)) {
  assert.equal(row.crossPage, 0);
  assert.equal(row.samePage, 0);
}
console.log('SOURCE sha256', crypto.createHash('sha256').update(corpusBytes).digest('hex'));
console.log('TRANSCRIPTION sha256', crypto.createHash('sha256').update(transcriptionBytes).digest('hex'));
console.log('Original pages', originals.length, 'runes', originals.reduce((s, x) => s + x.runes.length, 0));
console.log('Equality-pattern scan:', JSON.stringify(actual.map(({ pairs, ...rest }) => rest)));

const nativePlant = positiveControl();
console.log('NATIVE P57 PRIVATE-ALPHABET POSITIVE:', JSON.stringify(nativePlant));

const byPage = new Map(originals.map((p) => [p.page, p.runes]));
const holdouts = actual[0].pairs.map((pair) => ({
  ...pair,
  ...continuationTest(
    byPage.get(pair.p1), pair.a, byPage.get(pair.p2), pair.b, 20, 100
  )
}));
const nontrivial = holdouts.filter((p) => p.predicted >= 10);
assert.ok(nontrivial.length >= 10);
assert.ok(nontrivial.every((p) => p.incorrect > 0));
const best = holdouts.reduce((p, q) => q.correct > p.correct ? q : p);
console.log('ORIGINAL 20-RUNE PAIRS:', holdouts.length,
  'nontrivial heldouts', nontrivial.length,
  'all nontrivial heldouts fail;',
  'best observed count', JSON.stringify(best));

const rng = new Rng(0x3301a141);
const simulations = 256;
const null20 = [];
const null21 = [];
const null20Word = [];
let totalAccepted = 0;
for (let trial = 0; trial < simulations; trial++) {
  const shuffled = originals.map((p) => {
    const a = p.runes.slice();
    totalAccepted += shuffleConstrained(a, rng);
    assertPageConserved(p.runes, a);
    return { page: p.page, runes: a };
  });
  const a = scan(shuffled, 20);
  const b = scan(shuffled, 21);
  null20.push(a.crossPage);
  null20Word.push(a.crossSameWordMask);
  null21.push(b.crossPage);
  if ((trial + 1) % 64 === 0) {
    console.log('Null progress', trial + 1, '/', simulations);
  }
}
/** @param {number[]} x */
function summarize(x) {
  const sorted = x.slice().sort((a, b) => a - b);
  return {
    mean: x.reduce((a, b) => a + b, 0) / x.length,
    min: sorted[0],
    median: sorted[Math.floor(sorted.length / 2)],
    max: sorted[sorted.length - 1]
  };
}
/** @param {number[]} x @param {number} observed */
function upperTail(x, observed) {
  return (x.filter((v) => v >= observed).length + 1) / (x.length + 1);
}

console.log('NULL constrained shuffles', simulations,
  'accepted swaps/source rune/sim', totalAccepted / (simulations * 12956));
console.log('NULL 20 rune cross-page', JSON.stringify(summarize(null20)),
  'upper-tail p', upperTail(null20, actual[0].crossPage));
console.log('NULL 21 rune cross-page', JSON.stringify(summarize(null21)),
  'fraction with zero', null21.filter((x) => x === 0).length / simulations);
console.log('NULL 20 rune + word-boundary', JSON.stringify(summarize(null20Word)),
  'fraction zero', null20Word.filter((x) => x === 0).length / simulations);
console.log('PASS: no alphabet-isomorphic original shared plaintext span >=21 runes');
console.log('PASS: source/native planted decoder and original-input null calibration');
