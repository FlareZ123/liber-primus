'use strict';

/**
 * Exact key-independent skip-path graph for a cyclic/Latin H2 tableau:
 * C_i=(tau[P_i]+r_j) mod29, r_j=(prime[j]-1) mod29.
 *
 * When the H2 encryptor discards one or more proposed ciphertext symbols
 * identical to C_(i-1), it consumes those rows and tries SAME plaintext.
 * Because tau[P_i] is shared by all candidates, it cancels from every
 * skipped-row test. Neither the secret permutation nor plaintext is
 * needed to check structural path reachability.
 *
 * Source-only original LP2 gate plus a genuinely seeded synthetic H2
 * positive whose hidden pointer must remain reachable. No inverse/key
 * is claimed; the zero-skip path is always feasible.
 *
 * Windows Node.js 22, CommonJS, no packages or file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const gibran = read('resources/control/gibran_prophet_58585.txt');
const C = gp.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices);
const LEN = 12956;
const MOD = 29;
const MAX_EXTRA = 850;
const MAX_SKIP_PER_RUNE = 4;
assert.equal(C.length, LEN);

/** @param {number} v */
const mod = (v) => (v % MOD + MOD) % MOD;
const composite = new Uint8Array(650001);
const rows = [];
for (let n = 2; n < composite.length && rows.length < 45000; n += 1) {
  if (composite[n]) continue;
  rows.push((n - 1) % MOD);
  if (n * n < composite.length) {
    for (let k = n * n; k < composite.length; k += n) composite[k] = 1;
  }
}
assert.equal(rows.length, 45000);

/** @param {number} seed */
function rng(seed) {
  let state = seed >>> 0;
  const next = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
  return { next, integer: (n) => Math.floor(next() * n) };
}

/** @param {{integer:(n:number)=>number}} random */
function shuffle29(random) {
  const a = Array.from({ length: MOD }, (_, i) => i);
  for (let i = MOD - 1; i > 0; i -= 1) {
    const j = random.integer(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Exact admissible skip-path states, retaining all possible extra-advance
 * totals, rather than fitting or rating any plaintext/key.
 * @param {number[]} ciphertext
 * @param {number[]} [oraclePointer] synthetic positive evaluation ONLY
 */
function reachability(ciphertext, oraclePointer) {
  let reachable = new Uint8Array(MAX_EXTRA + 1);
  reachable[0] = 1;
  let maximum = 0;
  const milestones = new Map();
  const requested = new Set([255, 1023, 4095, 8191, 12955]);
  for (let i = 1; i < ciphertext.length; i += 1) {
    const next = new Uint8Array(MAX_EXTRA + 1);
    let nextMax = 0;
    for (let drift = 0; drift <= maximum; drift += 1) {
      if (!reachable[drift]) continue;
      for (let skips = 0; skips <= MAX_SKIP_PER_RUNE &&
        drift + skips <= MAX_EXTRA; skips += 1) {
        const newDrift = drift + skips;
        const base = mod(ciphertext[i] - rows[i + newDrift]);
        // Exact necessary and sufficient rule for each rejected row.
        let valid = true;
        for (let skipped = 0; skipped < skips; skipped += 1) {
          if (mod(base + rows[i + drift + skipped]) !== ciphertext[i - 1]) {
            valid = false;
            break;
          }
        }
        if (valid) {
          next[newDrift] = 1;
          nextMax = Math.max(nextMax, newDrift);
        }
      }
    }
    if (oraclePointer) {
      assert.equal(next[oraclePointer[i] - i], 1,
        'Forward-positive true secret skip path must be reachable');
    }
    reachable = next;
    maximum = nextMax;
    if (requested.has(i)) {
      milestones.set(i, {
        offset: i,
        reachableExtraTotals: reachable.reduce((sum, bit) => sum + bit, 0),
        highestExtraTotal: maximum,
      });
    }
  }
  return { milestones: [...milestones.values()], reachable, maximum };
}

const original = reachability(C);
assert.deepEqual(original.milestones,
  [
    { offset: 255, reachableExtraTotals: 10, highestExtraTotal: 9 },
    { offset: 1023, reachableExtraTotals: 38, highestExtraTotal: 37 },
    { offset: 4095, reachableExtraTotals: 142, highestExtraTotal: 141 },
    { offset: 8191, reachableExtraTotals: 284, highestExtraTotal: 283 },
    { offset: 12955, reachableExtraTotals: 456, highestExtraTotal: 455 },
  ]);
assert.ok(Array.from(original.reachable.slice(0, 456)).every((x) => x === 1));
assert.equal(original.reachable.slice(456).some((x) => x !== 0), false);

// Read exactly the 83 original one-rune word positions, preserving 32
// carried words rather than treating a physical page break as a delimiter.
const runeMap = new Map(gp.runes.map((rune, index) => [rune, index]));
const singletonPositions = [];
let word = [];
let absolute = 0;
let wordCount = 0;
const stream = transcription.split('%').slice(0, 55).join('%');
for (const rune of stream) {
  if (runeMap.has(rune)) {
    word.push(absolute);
    assert.equal(runeMap.get(rune), C[absolute]);
    absolute += 1;
  } else if (rune === '/' || rune === '%' || /\s/u.test(rune)) {
    // Physical line/page wraps join continuous words.
  } else if (word.length) {
    if (word.length === 1) singletonPositions.push(word[0]);
    wordCount += 1;
    word = [];
  }
}
if (word.length) {
  if (word.length === 1) singletonPositions.push(word[0]);
  wordCount += 1;
}
assert.deepEqual([absolute, wordCount, singletonPositions.length],
  [12956, 2896, 83]);
assert.deepEqual(singletonPositions.slice(0, 5), [176, 244, 350, 530, 644]);

// If there were *no* hidden skips, every singleton-word GP plaintext
// would have to map through the same secret permutation tau. The native
// English lexical set A/I/O has at most three cipher base labels.
// This is a key-independent exact necessary condition for this special
// no-skip cyclic tableau, not for the skip-consuming H2 model.
const noSkipSingletonBases = new Set(singletonPositions.map((i) =>
  mod(C[i] - rows[i])));
assert.equal(noSkipSingletonBases.size, 25);

// Synthetic forward positive, independent secret base permutation,
// genuine source-native GP orthography; correct hidden path must survive.
const spellings = gp.translit.map((spelling, index) =>
  ({ spelling, index })).sort((a, b) => b.spelling.length - a.spelling.length);
/** @param {string} source */
function encodeSource(source) {
  return (source.match(/[A-Za-z]+/g) || []).flatMap((token) => {
    const normalized = token.toUpperCase().replace(/QU/g, 'CW')
      .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
    const out = [];
    for (let i = 0; i < normalized.length;) {
      if (normalized.startsWith('ING', i)) {
        out.push(21); i += 3; continue;
      }
      if (normalized.startsWith('IO', i)) {
        out.push(27); i += 2; continue;
      }
      const found = spellings.find((a) => normalized.startsWith(a.spelling, i));
      assert.ok(found);
      out.push(found.index);
      i += found.spelling.length;
    }
    return out;
  });
}
const native = encodeSource(gibran);
assert.equal(native.length, 62492);
// Separate deterministic synthetic seed from source-original calculations.
const generator = rng(0x3301abcd);
const offset = generator.integer(native.length - LEN);
const clear = native.slice(offset, offset + LEN);
assert.equal(clear.length, LEN);
const tau = shuffle29(generator);
const synthetic = [];
const truePointer = [];
let pointer = 0;
let previous = -1;
let largestSkip = 0;
for (const plain of clear) {
  let candidate = mod(tau[plain] + rows[pointer]);
  let skips = 0;
  while (candidate === previous && generator.next() < 0.81) {
    pointer += 1;
    skips += 1;
    candidate = mod(tau[plain] + rows[pointer]);
  }
  assert.ok(skips <= MAX_SKIP_PER_RUNE);
  largestSkip = Math.max(skips, largestSkip);
  synthetic.push(candidate);
  truePointer.push(pointer);
  previous = candidate;
  pointer += 1;
}
const syntheticGraph = reachability(synthetic, truePointer);
const actualExtra = truePointer.at(-1) - (LEN - 1);
assert.equal(syntheticGraph.reachable[actualExtra], 1);
assert.equal(truePointer[0], 0);

console.log(JSON.stringify({
  status: 'PASS',
  cipher: 'key-independent H2 cyclic-Latin q=0.81 skip graph',
  original: {
    length: LEN,
    originalCiphertextRead: true,
    milestones: original.milestones,
    reachableFinalSkipTotals: 456,
    minimumFinalExtra: 0,
    maximumFinalExtra: original.maximum,
    originalSingletonWords: singletonPositions.length,
    noSkipSingletonDistinctBaseValues: noSkipSingletonBases.size,
    noSkipNativeAIOKeyIndependentFeasible: noSkipSingletonBases.size <= 3,
  },
  syntheticPositive: {
    originalShapedSourceLength: clear.length,
    trueExtraSkips: actualExtra,
    largestActualSkip: largestSkip,
    allHiddenTruePointerStatesReachable: true,
    possibleFinalExtraTotals: syntheticGraph.reachable.reduce((a, b) => a + b, 0),
  },
  conclusion: 'Cyclic H2 cancels secret alphabet from the skip graph. It does not determine a unique original key or plaintext.',
}, null, 2));
