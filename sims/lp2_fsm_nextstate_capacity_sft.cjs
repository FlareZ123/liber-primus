'use strict';

/**
 * Finite-state GP29 permutation transducer: source-original capacity gate.
 * Run: node sims/lp2_fsm_nextstate_capacity_sft.cjs
 *
 * Model on each physical page: C_i = pi[state_i](P_i),
 * state_(i+1) = delta(state_i, P_i). Each pi is a 29-way bijection.
 * delta and pi are time-independent, shared across the book; page initial
 * states may differ arbitrarily. Secret functions are unrestricted.
 *
 * A pair (plaintext GP rune, ciphertext GP rune) can only share a state
 * with observations of the same pair; its deterministic successor must
 * accommodate every observed successor pair at that state. The rank
 * bounds below hold for every hidden state/key under this contract.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length > 0);
const lens = pages.map((page) => page.indices.length);
const original = pages.flatMap((page) => page.indices);
const N = original.length;
assert.equal(N, 12956);
assert.equal(pages.length, 55);
assert.deepEqual(lens.slice(-2), [232, 76]);
const sentinel = new Uint8Array(N);
let cursor = 0;
for (const len of lens) {
  for (let i = 0; i < len - 1; i++) sentinel[cursor + i] = 1;
  cursor += len;
}
assert.equal(cursor, N);

/** @type {{s: string, i: number}[]} */
const alphabet = corpus.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);

/**
 * Native-GP normalization, frozen to the earlier 89-window study.
 * @param {string} source
 * @returns {number[]}
 */
function encode(source) {
  const words = source.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S')
    .match(/[A-Z]+/g) || [];
  /** @type {number[]} */
  const output = [];
  for (const word of words) {
    for (let i = 0; i < word.length;) {
      const token = alphabet.find((x) => word.startsWith(x.s, i));
      assert(token, 'Unmappable GP grapheme: ' + word.slice(i));
      output.push(token.i);
      i += token.s.length;
    }
  }
  return output;
}

/**
 * Bound number of distinct parent states required for positions with
 * the SAME current (P,C) pair, examining up to depth further transitions.
 * If several such positions share a parent state, their next state is the
 * same. Because that next state's pi is bijective, its successor pairs
 * form a partial matching. For any next input u, different output v
 * groups require disjoint parent states; similarly for any next output v.
 * Recursion retains the deterministic successor constraint.
 *
 * @param {number[]} positions
 * @param {number[]} plain
 * @param {number[]} cipher
 * @param {Uint8Array} hasNext
 * @param {number} depth
 * @returns {number}
 */
function pairStates(positions, plain, cipher, hasNext, depth) {
  if (!positions.length) return 0;
  if (depth === 0) return 1;
  /** @type {Map<number, number[]>} */
  const groups = new Map();
  for (const i of positions) {
    if (!hasNext[i]) continue;
    const j = i + 1;
    const key = 29 * plain[j] + cipher[j];
    let group = groups.get(key);
    if (!group) {
      group = [];
      groups.set(key, group);
    }
    group.push(j);
  }
  const inputTotals = new Uint16Array(29);
  const outputTotals = new Uint16Array(29);
  let bound = 1;
  for (const [key, group] of groups) {
    const requirement = pairStates(group, plain, cipher, hasNext, depth - 1);
    const u = Math.floor(key / 29);
    const v = key % 29;
    inputTotals[u] += requirement;
    outputTotals[v] += requirement;
    bound = Math.max(bound, inputTotals[u], outputTotals[v]);
  }
  return bound;
}

/**
 * For fixed plaintext rune p, states emitting different c cannot overlap.
 * For fixed ciphertext rune c, states accepting different p cannot overlap.
 * Sum the pair lower bounds in either direction, and maximize.
 *
 * @param {number[]} plain
 * @param {number[]} cipher
 * @param {Uint8Array} hasNext
 * @param {number} depth
 */
function stateLowerBound(plain, cipher, hasNext, depth) {
  assert.equal(plain.length, cipher.length);
  assert.equal(cipher.length, hasNext.length);
  /** @type {number[][]} */
  const pairs = Array.from({ length: 841 }, () => []);
  for (let i = 0; i < plain.length; i++) {
    pairs[29 * plain[i] + cipher[i]].push(i);
  }
  const byPlain = new Uint16Array(29);
  const byCipher = new Uint16Array(29);
  for (let key = 0; key < 841; key++) {
    const requirement = pairStates(pairs[key], plain, cipher, hasNext, depth);
    byPlain[Math.floor(key / 29)] += requirement;
    byCipher[key % 29] += requirement;
  }
  const maxPlain = Math.max(...byPlain);
  const maxCipher = Math.max(...byCipher);
  return {
    minimumStates: Math.max(maxPlain, maxCipher),
    maxPlain,
    maxCipher,
    criticalPlainRune: byPlain.indexOf(maxPlain),
    criticalCipherRune: byCipher.indexOf(maxCipher)
  };
}

/** @param {number[]} values */
const range = (values) => [Math.min(...values), Math.max(...values)];
const sources = [
  { name: 'Shakespeare', path: 'resources/control/shakespeare_first300k.txt',
    size: 218800, windows: 32, d1: [202, 273, 3, 2], d2: [205, 281, 10, 7] },
  { name: 'Gibran', path: 'resources/control/gibran_prophet_58585.txt',
    size: 63114, windows: 8, d1: [243, 323, 7, 7], d2: [251, 339, 7, 7] },
  { name: 'Emerson', path: 'resources/control/emerson_essays_2944.txt',
    size: 324630, windows: 49, d1: [220, 291, 17, 12], d2: [228, 296, 24, 22] }
];
const allOne = [];
const allTwo = [];
let firstNative = null;
const summaries = [];
for (const source of sources) {
  const native = encode(read(source.path));
  assert.equal(native.length, source.size);
  const one = [];
  const two = [];
  for (let start = 0; start + N <= native.length; start += N / 2) {
    const candidate = native.slice(start, start + N);
    if (!firstNative) firstNative = candidate;
    one.push(stateLowerBound(candidate, original, sentinel, 1).minimumStates);
    two.push(stateLowerBound(candidate, original, sentinel, 2).minimumStates);
  }
  assert.equal(one.length, source.windows);
  const stats = (values) => [
    ...range(values),
    values.filter((x) => x > 252).length,
    values.filter((x) => x > 256).length
  ];
  assert.deepEqual(stats(one), source.d1);
  assert.deepEqual(stats(two), source.d2);
  allOne.push(...one);
  allTwo.push(...two);
  summaries.push({ source: source.name, windows: one.length,
    oneStep: stats(one), twoStep: stats(two) });
}
assert.equal(allTwo.length, 89);
assert.deepEqual([
  ...range(allTwo),
  allTwo.filter((x) => x > 252).length,
  allTwo.filter((x) => x > 256).length
], [205, 339, 41, 36]);
assert(firstNative);

// Original p54-55 chapter reserved as an independent visual holdout.
// This is a capacity computation, not an original-cipher plaintext decode.
const trainLen = N - 308;
const hasNextTrain = sentinel.slice(0, trainLen);
const heldout = stateLowerBound(
  firstNative.slice(trainLen), original.slice(trainLen),
  sentinel.slice(trainLen), 2);
const train = stateLowerBound(
  firstNative.slice(0, trainLen), original.slice(0, trainLen),
  hasNextTrain, 2);
assert.equal(train.minimumStates, 240);
assert.equal(heldout.minimumStates, 25);
assert.equal(stateLowerBound(firstNative, original, sentinel, 2).minimumStates, 244);

/**
 * Construct a genuinely lossless 16-state plant. State transitions depend
 * only on recovered plaintext. Rows are deterministic, seeded permutations.
 * @param {number} seed
 * @returns {number[][]}
 */
function permutationRows(seed) {
  const random = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return seed >>> 0;
  };
  const rows = [];
  for (let state = 0; state < 16; state++) {
    const row = Array.from({ length: 29 }, (_, i) => i);
    for (let i = 28; i > 0; i--) {
      const j = random() % (i + 1);
      [row[i], row[j]] = [row[j], row[i]];
    }
    rows.push(row);
  }
  return rows;
}

/**
 * @param {number[]} sequence
 * @param {number[][]} rows
 * @param {boolean} decrypt
 * @returns {number[]}
 */
function transform(sequence, rows, decrypt) {
  const result = [];
  let offset = 0;
  for (let page = 0; page < lens.length; page++) {
    let state = (5 + 3 * page) % 16;
    for (let i = 0; i < lens[page]; i++) {
      const value = sequence[offset + i];
      const plain = decrypt ? rows[state].indexOf(value) : value;
      assert(plain >= 0);
      result.push(decrypt ? plain : rows[state][plain]);
      state = (state + 13 * plain + 7) % 16;
    }
    offset += lens[page];
  }
  return result;
}
const rows = permutationRows(0x3301cafe);
const planted = transform(firstNative, rows, false);
const recovered = transform(planted, rows, true);
assert.deepEqual(recovered, firstNative);
const wrongRecovered = transform(planted, permutationRows(0x3301caff), true);
const wrongMatches = wrongRecovered.filter((x, i) => x === firstNative[i]).length;
assert.equal(wrongMatches, 438);
const plantedBound = stateLowerBound(firstNative, planted, sentinel, 2);
assert(plantedBound.minimumStates <= 16);

// Constructive universal upper witness for an arbitrary chosen plaintext:
// one state per original rune position. State i uses a cyclic 29-rune
// permutation with shift C_i-P_i, and on the observed input P_i advances to
// state i+1 unless at a page end. Every other input self-loops.
// Page initial states are the published page offsets. The inverse works
// identically from ciphertext using that same state/transition contract.
// This is deliberately a gigantic, source-unauthenticated lookup key.
const shifts = original.map((c, i) => (c - firstNative[i] + 29) % 29);
let state = 0;
let offset = 0;
const witnessEncrypted = [];
const witnessRecovered = [];
for (const len of lens) {
  state = offset;
  for (let i = 0; i < len; i++) {
    const x = firstNative[offset + i];
    const y = (x + shifts[state]) % 29;
    witnessEncrypted.push(y);
    const inverse = (y - shifts[state] + 29) % 29;
    witnessRecovered.push(inverse);
    state = i === len - 1 ? state : (x === firstNative[state] ? state + 1 : state);
  }
  offset += len;
}
assert.deepEqual(witnessEncrypted, original);
assert.deepEqual(witnessRecovered, firstNative);

console.log(JSON.stringify({
  result: 'PASS: finite-state reversible GP29 source-original lower bound',
  model: 'Shared pi[state] permutation and delta(state,plaintext), arbitrary page initial states',
  unknownRunes: N,
  nativeWindows: allTwo.length,
  oneStep: [Math.min(...allOne), Math.max(...allOne)],
  twoStep: [Math.min(...allTwo), Math.max(...allTwo)],
  sourceSummaries: summaries,
  twoStepAbove252: 41,
  twoStepAbove256: 36,
  firstShakespeare: { full: 244, train: train.minimumStates,
    heldout: heldout.minimumStates },
  positivePlant: { trueStates: 16, inferredMinimumAtMost16: plantedBound.minimumStates,
    recovered: recovered.length, wrongKeyMatches: wrongMatches },
  originalConstructiveUpperStates: N,
  novelUnknownPlaintext: false
}, null, 2));
