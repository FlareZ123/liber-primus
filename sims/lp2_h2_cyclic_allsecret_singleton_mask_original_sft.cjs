'use strict';

/**
 * Key-independent exact collision-skip obstruction for a single cyclic
 * 29-row substitution tableau with ANY unknown GP29 permutation tau:
 *
 *   C[i] = (tau[P[i]] + (prime[J]-1)) mod29.
 *
 * Rejected outputs may equal previous emitted C[i-1], spending a key row
 * before the next try for the SAME plaintext P[i]. The hidden prime pointer
 * may drift by an unknown total number of rejected rows. A genuine native
 * GP29-English singleton source-printed word P[i] is A/I/O, so tau[P[i]]
 * must be one of at most three globally fixed symbols. Because tau is a
 * permutation, NO knowledge of its actual 29! arrangements is needed.
 *
 * Exact DP state: (at-most-three underlying symbols as 29-bit mask,
 * total skipped rows after the emitted character). All future-equivalent
 * histories merge. This is a necessary-condition gate for the declared
 * model, NOT an LP2 decryption or author-selected cipher.
 *
 * Read-only original SFT: node sims/lp2_h2_cyclic_allsecret_singleton_mask_original_sft.cjs
 * Windows 11, Node 22, CommonJS, no packages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const source = read('resources/liber-primus/lp2-transcription.txt');
const C = gp.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(C.length, 12956);
const index = new Map(gp.runes.map((r, i) => [r, i]));
const parsed = [];
const words = [];
const marks = [];
let pending = -1;
for (const ch of source) {
  if (ch === '$') marks.push(parsed.length);
  if (parsed.length >= C.length) continue;
  if (index.has(ch)) {
    if (pending < 0) pending = parsed.length;
    parsed.push(index.get(ch));
  } else if (ch !== '/' && ch !== '%' && !/\s/.test(ch) &&
    pending >= 0) {
    words.push([pending, parsed.length]);
    pending = -1;
  }
}
if (pending >= 0) words.push([pending, parsed.length]);
assert.deepEqual(parsed, C);
assert.equal(words.length, 2896);
const singleton = new Set(words.filter(([a, b]) => b - a === 1)
  .map(([a]) => a));
assert.equal(singleton.size, 83);
assert.deepEqual([...singleton].slice(0, 5), [176, 244, 350, 530, 644]);
const ends = marks.filter(x => x > 0 && x < C.length);
const boundaries = [0, ...ends, C.length];
assert.deepEqual(boundaries,
  [0, 729, 1874, 3612, 5506, 6527, 7960, 9640, 12956]);
const chapters = boundaries.slice(1)
  .map((end, k) => [boundaries[k], end]);

const primeTotients = [];
const sieve = new Uint8Array(400000);
for (let p = 2; p < sieve.length && primeTotients.length < 16000; p++) {
  if (sieve[p]) continue;
  primeTotients.push((p - 1) % 29);
  if (p * p < sieve.length)
    for (let j = p * p; j < sieve.length; j += p) sieve[j] = 1;
}
assert.equal(primeTotients.length, 16000);
// Three consecutive discarded candidates would require three consecutive
// identical prime residues. None exists on the finite tested key prefix.
assert.ok(primeTotients.every((v, i) =>
  i + 2 >= primeTotients.length ||
  !(v === primeTotients[i + 1] && v === primeTotients[i + 2])));
const mod = x => ((x % 29) + 29) % 29;
/** @param {number} mask @returns {number} */
function bits(mask) {
  let n = 0;
  for (let v = mask; v !== 0; v &= v - 1) n++;
  return n;
}
/**
 * Exact all-path reachability for one original source section.
 * When initial masks are supplied, reset the key clock but retain the
 * same globally unknown tau(A), tau(I), tau(O) across visual sections.
 *
 * @param {number[]} tape
 * @param {number} globalStart
 * @param {Set<number>} singles Global GP rune offsets
 * @param {Map<number,Set<number>>} [initial] Mask => reachable key skip counts
 * @param {number[]|null} [trueDrift] Synthetic control accepted key offsets
 * @param {number[]|null} [trueLabels] Synthetic control actual underlying base labels
 */
function invert(tape, globalStart, singles, initial, trueDrift, trueLabels) {
  let states = initial || new Map([[0, new Set([0])]]);
  const samples = [];
  let oracleMask = 0;
  for (let i = 0; i < tape.length; i++) {
    const old = i ? tape[i - 1] : -1;
    const c = tape[i];
    const atSingleton = singles.has(globalStart + i);
    if (trueLabels && atSingleton)
      oracleMask |= 1 << trueLabels[i];
    const next = new Map();
    for (const [mask, drifts] of states) {
      for (const drift of drifts) {
        // Exactly 0..2 rejected candidates; no three consecutive equal
        // prime-residue rows over this clock. An unused key is consumed
        // only when its output matches previous ciphertext.
        for (let rejected = 0; rejected <= (i ? 2 : 0); rejected++) {
          const accepted = drift + rejected;
          const keyAt = i + accepted;
          if (keyAt >= primeTotients.length) continue;
          const base = mod(c - primeTotients[keyAt]);
          if (rejected >= 1 &&
            mod(base + primeTotients[i + drift]) !== old) continue;
          if (rejected >= 2 &&
            mod(base + primeTotients[i + drift + 1]) !== old) continue;
          const resultMask = atSingleton ? mask | (1 << base) : mask;
          if (atSingleton && bits(resultMask) > 3) continue;
          let set = next.get(resultMask);
          if (!set) {
            set = new Set();
            next.set(resultMask, set);
          }
          set.add(accepted);
        }
      }
    }
    states = next;
    if (trueDrift) {
      const legal = states.get(oracleMask);
      assert.ok(legal && legal.has(trueDrift[i]),
        'seeded positive true alphabet and skip pointer must survive');
    }
    if (atSingleton) samples.push({
      global: globalStart + i, local: i, observedCiphertext: c,
      masks: states.size,
      distinctStates: [...states.values()].reduce((n, set) => n + set.size, 0),
    });
    if (states.size === 0)
      return {pass: false, firstImpossibleGlobal: globalStart + i,
        firstImpossibleLocal: i, samples, states};
  }
  return {pass: true, samples, states,
    distinctMasks: states.size,
    distinctStates: [...states.values()].reduce((n, set) => n + set.size, 0)};
}

/** Every unchanged source division gets a fresh real prime-2 key clock. */
const independent = chapters.map(([lo, hi], i) => {
  const tested = invert(C.slice(lo, hi), lo, singleton);
  return {
    sourceChapter: i + 1, globalStart: lo, globalEndExclusive: hi,
    cipherRunes: hi - lo,
    sourceOneRuneWords: tested.samples.length,
    possible: tested.pass,
    firstImpossibleGlobal: tested.firstImpossibleGlobal ?? null,
    finalMasks: tested.pass ? tested.distinctMasks : 0,
    finalLastSingleton: tested.samples.at(-1),
  };
});
assert.deepEqual(independent.map(x => x.possible),
  [true, false, true, false, true, false, true, false]);
assert.deepEqual(independent.map(x => x.firstImpossibleGlobal),
  [null, 1316, null, 4176, null, 7185, null, 12254]);

/** The genuine source-wide continuous key clock fails at the tenth singleton. */
const continuous = invert(C, 0, singleton);
assert.equal(continuous.pass, false);
assert.equal(continuous.firstImpossibleGlobal, 1250);
assert.deepEqual(continuous.samples.slice(-3).map(x => ({
  at: x.global, masks: x.masks,
})), [
  {at: 1025, masks: 17},
  {at: 1062, masks: 5},
  {at: 1250, masks: 0},
]);

/** Even sharing one secret permutation with independent prime resets fails. */
let sharedMasks = new Map([[0, new Set([0])]]);
let sharedFailure = null;
for (const [lo, hi] of chapters) {
  const result = invert(C.slice(lo, hi), lo, singleton, sharedMasks);
  if (!result.pass) {
    sharedFailure = result.firstImpossibleGlobal;
    break;
  }
  sharedMasks = new Map([...result.states].map(([mask]) =>
    [mask, new Set([0])]));
}
assert.equal(sharedFailure, 1062);

/**
 * Source-native single physical-page witness, avoiding uncertain heading
 * modes on other chapters and avoiding any runes from other pages.
 */
const p28 = gp.pages.find(p => p.page === 28);
assert.equal(p28.indices.length, 269);
const page28Start = gp.pages.filter(p => p.page < 28)
  .reduce((sum, p) => sum + p.indices.length, 0);
assert.equal(page28Start, 6761);
assert.ok(!ink.pages.some(p => p.page === 28),
  'source p28 has no annotated red-rune spans');
const p28Words = [...singleton].filter(x =>
  x >= page28Start && x < page28Start + p28.indices.length);
assert.deepEqual(p28Words.map(x => x - page28Start),
  [32, 163, 229, 233]);
assert.deepEqual(p28Words.map(x => C[x]), [21, 15, 11, 19]);
const page28 = invert(p28.indices, page28Start, singleton);
assert.equal(page28.pass, false);
assert.equal(page28.firstImpossibleLocal, 233);
assert.deepEqual(page28.samples.map(s => [s.local, s.masks,
  s.distinctStates]), [[32, 1, 1], [163, 4, 4],
  [229, 10, 10], [233, 0, 0]]);

/** A native source-derived planted positive with hidden skip path. */
function rng(seed) {
  let state = seed >>> 0;
  const u = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
  return {u, integer: size => Math.floor(u() * size)};
}
const random = rng(0x3301ac43);
const alphabet = Array.from({length:29}, (_, i) => i);
for (let i = alphabet.length - 1; i > 0; i--) {
  const j = random.integer(i + 1);
  [alphabet[i], alphabet[j]] = [alphabet[j], alphabet[i]];
}
const p57 = gp.pages.find(p => p.page === 57).indices;
assert.equal(p57.length, 95);
const clear = Array.from({length:p28.indices.length}, (_, i) =>
  p57[i % p57.length]);
for (const [i, local] of [32,163,229,233].entries())
  clear[local] = [24, 10, 3, 24][i]; // A I O A
const planted = new Array(clear.length);
const hiddenDrift = new Array(clear.length);
const hiddenLabels = clear.map(p => alphabet[p]);
let pointer = 0, previous = -1, actualSkips = 0;
for (let i = 0; i < clear.length; i++) {
  const base = hiddenLabels[i];
  let value = mod(base + primeTotients[pointer]);
  let skips = 0;
  while (value === previous && random.u() < 0.81) {
    pointer++;
    skips++;
    actualSkips++;
    value = mod(base + primeTotients[pointer]);
  }
  assert.ok(skips <= 2);
  planted[i] = value;
  hiddenDrift[i] = pointer - i;
  previous = value;
  pointer++;
}
const positive = invert(planted, page28Start, singleton, undefined,
  hiddenDrift, hiddenLabels);
assert.equal(positive.pass, true);
assert.ok(positive.distinctMasks >= 1);

/** A truly arbitrary generated tau is deliberately not passed to original. */
console.log(JSON.stringify({
  status: 'PASS',
  source: '12956 exact original GP29 runes, 2896 printed words, 83 singletons',
  model: 'C[i]=tau[P[i]]+phi(prime_j) modulo29; tau any 29-permutation; only equality-collision rejection; start prime2',
  secret: 'All 29! alphabets allowed, unknown legal skip path exhaustively retained',
  skipLimit: '0..2 exact: no 3 consecutive equal prime residues among 16000 rows',
  nativeRegister: 'originally printed one-rune words are literal English A/I/O',
  independentSourceChapters: independent,
  continuous: {firstImpossibleGlobal: continuous.firstImpossibleGlobal,
    lastThreeSingletons: continuous.samples.slice(-3)},
  sharedPermutationWithChapterPrimeResets: {
    firstImpossibleGlobal: sharedFailure,
  },
  page28: {
    page: 28, originalRunes: p28.indices.length,
    sourceSingletonLocal: p28Words.map(x => x - page28Start),
    ciphertextSingletonIndices: p28Words.map(x => C[x]),
    firstImpossibleLocal: page28.firstImpossibleLocal,
    trace: page28.samples,
    noRedRimesInSourceAnnotation: true,
  },
  syntheticPositive: {
    source: 'original clear p57 GP29 replicated and A/I/O source sites injected',
    nativeGP29Runes: clear.length,
    actualCollisionSkips: actualSkips,
    hiddenTrueAlphabetAndEveryPointerRetained: true,
    finalPossibleMasks: positive.distinctMasks,
  },
  decision: 'Exact key-independent original-cipher exclusion of this specific cyclic-Latin prime2 collision-skip model, even with a freely secret tau and per-section independent tau on four source chapters; no original plaintext or key.'
}, null, 2));
