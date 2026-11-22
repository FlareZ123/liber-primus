"use strict";

/**
 * Source-fixed, lossless 29-symbol rank/state construction for the printed
 * LP2 32x8 byte table; corrected successor to the lossy 5+3 proposal.
 *
 * The historical PATIENCE column order is fixed, as are byte ordering,
 * row-state update and original-book/ten-dot bridge clocks. This is a
 * prospectively specified candidate, NOT a claim of the historical cipher.
 *
 * Run: node sims/lp2_grid_rank_state_original_inverse.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const load = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const grid = JSON.parse(load("resources/liber-primus/lp2-grid-256.json"));
const corpus = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const original = corpus.pages.filter((p) => p.page <= 55)
  .flatMap((p) => p.indices);
const bytes = grid.pages.flatMap((p) => p.bytes);
const table = Array.from({length: 32}, (_, i) => bytes.slice(i * 8, i * 8 + 8));
const PATIENCE = [6, 5, 3, 0, 2, 4, 7, 1];
const GP = 29;
assert.equal(original.length, 12956);
assert.equal(bytes.length, 256);
assert(table.every((row) => row.length === 8 && new Set(row).size === 8));

/**
 * Convert a published GP rune and the previous published rune to a class.
 * A repeat has sentinel rank 28. The other 28 possible rune values are
 * ordered while skipping the previous rune.
 * @param {number} current Current printed ciphertext index 0..28.
 * @param {number} previous Previous printed ciphertext index 0..28.
 * @returns {number} Unique rank 0..28.
 */
function predecessorRank(current, previous) {
  return current === previous ? 28 : current - Number(current > previous);
}

/**
 * Recover the printed ciphertext value from a 29-valued predecessor rank.
 * @param {number} rank GP29 predecessor rank.
 * @param {number} previous Previous printed ciphertext value.
 * @returns {number} Published ciphertext.
 */
function recoverCipher(rank, previous) {
  return rank === 28 ? previous : rank + Number(rank >= previous);
}

/**
 * Return the original grid column for one of the seven four-rank blocks
 * or the one repeat-rank sentinel.
 * @param {number} rank Predecessor rank.
 * @returns {number} Original physical source-grid column.
 */
function column(rank) {
  const q = rank === 28 ? 7 : Math.floor(rank / 4);
  return PATIENCE[q];
}

/**
 * Each physical grid row has eight DISTINCT original byte values. Ordering
 * its eight columns by byte value yields a permutation of eight class labels.
 * Expanding q=0..6 to the four residual symbols and q=7 to one repeat symbol
 * gives a full permutation of all 29 GP ranks.
 * @param {number} state Row state 0..31.
 * @returns {{forward:number[],inverse:number[]}}
 */
function makePermutation(state) {
  const order = Array.from({length: 8}, (_, q) => q)
    .sort((a, b) => table[state][PATIENCE[a]] - table[state][PATIENCE[b]]);
  const forward = Array(GP);
  let output = 0;
  for (const q of order) {
    if (q === 7) forward[28] = output++;
    else for (let h = 0; h < 4; h++) forward[4 * q + h] = output++;
  }
  assert.equal(output, GP);
  assert.equal(new Set(forward).size, GP);
  const inverse = Array(GP);
  forward.forEach((v, i) => { inverse[v] = i; });
  return {forward, inverse};
}
const permutations = Array.from({length: 32}, (_, s) => makePermutation(s));

/**
 * The low five bits of the byte selected by the CURRENT known ciphertext
 * predecessor rank become the next state. No hidden witness is used.
 * @param {number} state
 * @param {number} rank
 */
function nextState(state, rank) {
  return table[state][column(rank)] & 31;
}

/**
 * Genuine inverse with the table and seed known. Ciphertext determines the
 * state transition after each decoded GP29 symbol.
 * @param {number[]} ciphertext GP ciphertext.
 * @param {number} [seed=0] Initial row.
 * @param {number} [initialPrevious=0] Initial prior published GP rune.
 * @returns {number[]} Candidate GP plaintext.
 */
function decrypt(ciphertext, seed = 0, initialPrevious = 0) {
  let state = seed, previous = initialPrevious;
  const plain = [];
  for (const current of ciphertext) {
    const rank = predecessorRank(current, previous);
    plain.push(permutations[state].forward[rank]);
    state = nextState(state, rank);
    previous = current;
  }
  return plain;
}

/**
 * Exact forward encoder from any candidate GP29 plaintext.
 * @param {number[]} plaintext GP29 plaintext.
 * @param {number} [seed=0]
 * @param {number} [initialPrevious=0]
 * @returns {number[]} GP29 ciphertext.
 */
function encrypt(plaintext, seed = 0, initialPrevious = 0) {
  let state = seed, previous = initialPrevious;
  const ciphertext = [];
  for (const symbol of plaintext) {
    const rank = permutations[state].inverse[symbol];
    const current = recoverCipher(rank, previous);
    ciphertext.push(current);
    state = nextState(state, rank);
    previous = current;
  }
  return ciphertext;
}

/**
 * Exact input-controlled convergence of all 32 possible initial row states.
 * @param {number[]} ciphertext
 * @param {number} previous
 * @returns {number} Smallest positive number of symbols after which every
 *   initial state produces the same row state, or -1 if no convergence.
 */
function convergence(ciphertext, previous) {
  let states = Array.from({length: 32}, (_, i) => i);
  for (let i = 0; i < ciphertext.length; i++) {
    const current = ciphertext[i];
    const rank = predecessorRank(current, previous);
    states = states.map((state) => nextState(state, rank));
    if (new Set(states).size === 1) return i + 1;
    previous = current;
  }
  return -1;
}

/** @param {number[]} values GP symbols. */
function ioc(values) {
  const counts = Array(GP).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0)
    / (values.length * (values.length - 1));
}

/**
 * Encode independent English prose to the established 29-rune GP spelling.
 * @param {string} source Independent Shakespeare plaintext.
 * @returns {number[]}
 */
function gpEnglish(source) {
  const tokens = corpus.translit.map((s, i) => ({s, i}))
    .sort((a, b) => b.s.length - a.s.length);
  const normalized = source.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
  const output = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    const buffer = [];
    for (let i = 0; i < word.length;) {
      const match = tokens.find((t) => word.startsWith(t.s, i));
      if (!match) { buffer.length = 0; break; }
      buffer.push(match.i);
      i += match.s.length;
    }
    output.push(...buffer);
  }
  return output;
}

/** @param {number[]} symbols GP indices. */
function textGP(symbols) {
  return symbols.map((x) => corpus.translit[x]).join("");
}

function main() {
  // Exact 29-to-29 mapping for every state, including 86 repeated runes.
  for (let s = 0; s < 32; s++) {
    for (let x = 0; x < GP; x++) {
      const p = permutations[s].forward[x];
      assert.equal(permutations[s].inverse[p], x);
    }
  }
  const decoded = decrypt(original);
  assert.deepEqual(encrypt(decoded), original);

  // The p49 ten-dot numerical table consumes zero additional *rune* steps.
  const previousPage48 = corpus.pages.find((p) => p.page === 48).indices.at(-1);
  const bridge = corpus.pages.filter((p) => p.page === 49 || p.page === 51)
    .flatMap((p) => p.indices);
  assert.equal(bridge.length, 158);
  const bridgeDecoded = decrypt(bridge, 0, previousPage48);
  assert.deepEqual(encrypt(bridgeDecoded, 0, previousPage48), bridge);

  // The cipher's original-plaintext recognition is calibratable: a true
  // source-native English plant recovers exactly under the same fixed grid.
  const native = gpEnglish(load("resources/control/shakespeare_first300k.txt"));
  assert(native.length >= 112956);
  const heldout = native.slice(100000, 100000 + original.length);
  const planted = encrypt(heldout);
  assert.deepEqual(decrypt(planted), heldout);

  // Distinguish this finite original-input failure from tautological replay.
  assert(ioc(heldout) > ioc(decoded) + 0.015);
  assert.equal(convergence(original, 0), 129);
  assert.equal(convergence(bridge, previousPage48), 38);

  const result = {
    proposedModel: "eight source-byte-ranked class permutations, PATIENCE columns, low-five-bit ciphertext feedback",
    cipherSymbols: original.length,
    physicalPage49Grid51BridgeSymbols: bridge.length,
    initialState: 0,
    nativeHeldoutIoc: ioc(heldout),
    originalDecodedIoc: ioc(decoded),
    bridgeDecodedIoc: ioc(bridgeDecoded),
    fullBookAllSeedCoalescenceRunes: convergence(original, 0),
    bridgeAllSeedCoalescenceRunes: convergence(bridge, previousPage48),
    originalCipherRecovered: encrypt(decoded).length,
    sourceNativePlantRecovered: heldout.length,
    sourceOnlyBookPrefix: textGP(decoded.slice(0, 75)),
    sourceOnlyBridgePrefix: textGP(bridgeDecoded.slice(0, 75)),
    inference: "lossless and source-fixed countermodel, but original outputs are near-random; no genuine unknown LP2 plaintext or key"
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}
if (require.main === module) main();
module.exports = {predecessorRank, recoverCipher, encrypt, decrypt, convergence, main};
