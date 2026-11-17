'use strict';

/**
 * H2 candidate: recover *hidden prime-key skip path* when the exact
 * 29-by-29 ciphertext permutation tableau is given to a synthetic oracle.
 *
 * Complements the existing H2 tableau-Hungarian positive that is instead
 * granted the exact secret pointer path. Neither oracle is available for
 * original LP2. No plaintext from unsolved LP2 is claimed.
 *
 * Independent source-native Gibran plaintext, held-out Shakespeare
 * bigram model, four independent secret permutation tableaux and
 * four q=0.81 collision-skip streams of 12,956 runes each.
 *
 * Run: node sims/lp2_h2_known_table_hidden_pointer_viterbi_sft.cjs
 * Node.js 22, CommonJS, deterministic, read-only, no dependencies.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} rel @returns {string} */
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const gibran = read('resources/control/gibran_prophet_58585.txt');
const shakespeare = read('resources/control/shakespeare_first300k.txt');

const ALPHABET = 29;
const LENGTH = 12956;
const Q = 0.81;
const MAX_EXTRA = 850;
const MAX_PER_RUNE = 4;
const tokens = gp.translit.map((spelling, index) => ({ spelling, index }))
  .sort((a, b) => b.spelling.length - a.spelling.length);

/** @param {string} input @returns {number[]} */
function encodeWord(input) {
  const word = input.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith('ING', i)) {
      out.push(21); i += 3; continue;
    }
    if (word.startsWith('IO', i)) {
      out.push(27); i += 2; continue;
    }
    const token = tokens.find(({ spelling }) => word.startsWith(spelling, i));
    assert.ok(token, 'unmapped source word character');
    out.push(token.index);
    i += token.spelling.length;
  }
  return out;
}

/** @param {string} source @returns {number[]} */
function toRunes(source) {
  return (source.match(/[A-Za-z]+/g) || []).flatMap(encodeWord);
}

const corpus = toRunes(gibran);
const reference = toRunes(shakespeare);
assert.equal(corpus.length, 62492);
assert.equal(reference.length, 217106);
assert.equal(gp.translit.length, ALPHABET);
assert.deepEqual(gp.pages.filter((p) => p.page <= 55)
  .reduce((sum, p) => sum + p.indices.length, 0), LENGTH);
const unigram = new Array(ALPHABET).fill(0);
const bigram = Array.from({ length: ALPHABET },
  () => new Array(ALPHABET).fill(0));
for (let i = 0; i < reference.length; i += 1) {
  unigram[reference[i]] += 1;
  if (i > 0) bigram[reference[i - 1]][reference[i]] += 1;
}
const logP = Array.from({ length: ALPHABET }, (_, x) =>
  Float64Array.from({ length: ALPHABET },
    (_, y) => Math.log((bigram[x][y] + 3) /
      (unigram[x] + 3 * ALPHABET))));

// Independently sourced genuine p56 operation: successive prime totients
// reduced modulo GP29. This H2 tableau/skip extension is hypothetical.
const composite = new Uint8Array(650001);
const primeRows = [];
for (let p = 2; p < composite.length && primeRows.length < 45000; p += 1) {
  if (composite[p]) continue;
  primeRows.push((p - 1) % ALPHABET);
  if (p * p < composite.length) {
    for (let k = p * p; k < composite.length; k += p) composite[k] = 1;
  }
}
assert.equal(primeRows.length, 45000);

/** @param {number} seed */
function rng(seed) {
  let s = seed >>> 0;
  const u = () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
  return { u, int: (n) => Math.floor(u() * n) };
}

/** @param {{int:(n:number)=>number}} random @returns {number[]} */
function permutation(random) {
  const out = Array.from({ length: ALPHABET }, (_, i) => i);
  for (let i = ALPHABET - 1; i > 0; i -= 1) {
    const j = random.int(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** @param {number[][]} table @returns {number[][]} */
function inverseTable(table) {
  return table.map((row) => {
    const result = new Array(ALPHABET).fill(-1);
    row.forEach((c, p) => { result[c] = p; });
    assert.ok(result.every((x) => x >= 0));
    return result;
  });
}

/**
 * Given the exact tableau, infer the ENTIRE hidden skip-pointer path from
 * ciphertext alone. No plaintext, true skip path or planted crib is read.
 *
 * Pointer at rune i is j_i=i+d_i. d_i is nondecreasing, advances by the
 * number m of rejected candidates before the accepted ciphertext.
 * If m > 0, every intervening tableau output for that same candidate
 * plaintext must equal the previous published ciphertext rune. This
 * source-model constraint eliminates almost all arbitrary skip paths.
 *
 * The actual skip rejection log probability contributes m*log(Q).
 * The stop probability when an accepted glyph equals its predecessor is
 * constant across candidate paths, so omission does not alter ranking.
 * A held-out Shakespeare GP29 bigram scores the inferred plaintext.
 *
 * @param {number[]} ciphertext
 * @param {number[][]} exactTable
 * @returns {{pointer:number[],plaintext:number[],extraSkips:number}}
 */
function recoverPointer(ciphertext, exactTable) {
  const inv = inverseTable(exactTable);
  let scores = Float64Array.from({ length: MAX_EXTRA + 1 },
    (_, d) => d === 0 ? 0 : -Infinity);
  /** @type {Int16Array[]} */
  const back = new Array(LENGTH);

  for (let i = 1; i < LENGTH; i += 1) {
    const next = new Float64Array(MAX_EXTRA + 1).fill(-Infinity);
    const parent = new Int16Array(MAX_EXTRA + 1).fill(-1);
    let maximum = -Infinity;
    for (let d = 0; d <= MAX_EXTRA; d += 1) {
      const previousScore = scores[d];
      if (!Number.isFinite(previousScore)) continue;
      const priorPlain = inv[primeRows[i - 1 + d]][ciphertext[i - 1]];
      for (let m = 0; m <= MAX_PER_RUNE && d + m <= MAX_EXTRA; m += 1) {
        const targetDrift = d + m;
        const newPlain = inv[primeRows[i + targetDrift]][ciphertext[i]];
        let admissible = true;
        for (let k = 0; k < m; k += 1) {
          if (exactTable[primeRows[i + d + k]][newPlain] !== ciphertext[i - 1]) {
            admissible = false;
            break;
          }
        }
        if (!admissible) continue;
        const score = previousScore +
          logP[priorPlain][newPlain] + m * Math.log(Q);
        if (score > next[targetDrift]) {
          next[targetDrift] = score;
          parent[targetDrift] = d;
          maximum = Math.max(maximum, score);
        }
      }
    }
    assert.ok(Number.isFinite(maximum), 'empty hidden-pointer path');
    // Normalize on every rune to avoid loss of floating-point range.
    for (let d = 0; d <= MAX_EXTRA; d += 1) {
      if (Number.isFinite(next[d])) next[d] -= maximum;
    }
    back[i] = parent;
    scores = next;
  }
  let d = 0;
  for (let candidate = 1; candidate <= MAX_EXTRA; candidate += 1) {
    if (scores[candidate] > scores[d]) d = candidate;
  }
  const extraSkips = d;
  const pointer = new Array(LENGTH);
  const plaintext = new Array(LENGTH);
  for (let i = LENGTH - 1; i >= 0; i -= 1) {
    pointer[i] = i + d;
    plaintext[i] = inv[primeRows[i + d]][ciphertext[i]];
    if (i > 0) d = back[i][d];
  }
  assert.equal(d, 0);
  return { pointer, plaintext, extraSkips };
}

const expected = [
  { skips: 406, pointerHits: 12949, plaintextHits: 12949 },
  { skips: 364, pointerHits: 12949, plaintextHits: 12949 },
  { skips: 342, pointerHits: 12952, plaintextHits: 12952 },
  { skips: 345, pointerHits: 12953, plaintextHits: 12954 },
];
const results = [];
for (let trial = 0; trial < expected.length; trial += 1) {
  const random = rng((0x3301abcd + trial * 1013904223) >>> 0);
  const sourceStart = random.int(corpus.length - LENGTH);
  const sourcePlain = corpus.slice(sourceStart, sourceStart + LENGTH);
  const secret = Array.from({ length: ALPHABET }, () => permutation(random));
  const inv = inverseTable(secret);
  const ciphertext = [];
  const truePointer = [];
  let ptr = 0;
  let precedingCipher = -1;
  let largestSkip = 0;
  for (let i = 0; i < LENGTH; i += 1) {
    let output = secret[primeRows[ptr]][sourcePlain[i]];
    let skips = 0;
    while (output === precedingCipher && random.u() < Q) {
      ptr += 1;
      skips += 1;
      output = secret[primeRows[ptr]][sourcePlain[i]];
    }
    largestSkip = Math.max(largestSkip, skips);
    ciphertext.push(output);
    truePointer.push(ptr);
    precedingCipher = output;
    ptr += 1;
  }
  assert.ok(largestSkip <= MAX_PER_RUNE);
  const trueTotalSkips = truePointer.at(-1) - (LENGTH - 1);
  assert.equal(trueTotalSkips, expected[trial].skips);
  assert.deepEqual(ciphertext.map((c, i) =>
    inv[primeRows[truePointer[i]]][c]), sourcePlain,
  'True key pointer and true tableau must recover all synthetic runes');

  const inferred = recoverPointer(ciphertext, secret);
  const pointerHits = inferred.pointer.reduce((sum, value, i) =>
    sum + Number(value === truePointer[i]), 0);
  const plaintextHits = inferred.plaintext.reduce((sum, value, i) =>
    sum + Number(value === sourcePlain[i]), 0);
  assert.deepEqual(
    { skips: inferred.extraSkips, pointerHits, plaintextHits },
    expected[trial], 'Unexpected hidden-pointer recovery');
  results.push({
    trial,
    trueSkips: trueTotalSkips,
    inferredSkips: inferred.extraSkips,
    correctPointerPositions: pointerHits,
    correctPlaintextRunes: plaintextHits,
    plaintextAccuracy: plaintextHits / LENGTH,
  });
}
console.log(JSON.stringify({
  status: 'PASS',
  model: 'H2 synthetic prime-totient row skips with ORACLE SECRET TABLEAU',
  trueTableauGranted: true,
  trueHiddenPointerGranted: false,
  originalLP2PlaintextRecovered: false,
  originalLP2SecretTableauRecovered: false,
  originalLP2SecretKeyPathRecovered: false,
  trials: results.length,
  meanRecoveredRunes: results.reduce((sum, r) =>
    sum + r.correctPlaintextRunes, 0) / results.length,
  results,
}, null, 2));
