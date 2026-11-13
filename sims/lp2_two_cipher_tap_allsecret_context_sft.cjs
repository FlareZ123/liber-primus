/**
 * Original LP2 two-ciphertext-tap arbitrary-secret-alphabet collision gate.
 *
 * Run: node sims/lp2_two_cipher_tap_allsecret_context_sft.cjs
 * Reads exact original indices and three fixed native-English source texts.
 * One file, deterministic, no external dependencies and no filesystem writes.
 */
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const N = 12956;

/** @param {string} filepath */
function read(filepath) {
  return fs.readFileSync(path.join(ROOT, filepath), "utf8");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const raw = corpus.pages.filter((p) => p.page <= 55 && p.indices.length).flatMap((p) => p.indices);
assert.equal(raw.length, N);
assert.equal(corpus.pages.filter((p) => p.page <= 55 && p.indices.length).length, 55);
const letterToIndex = new Map(corpus.translit.map((t, i) => [t, i]));
const combinations = ["ING", "TH", "NG", "EO", "OE", "AE", "IA", "EA"];

/** @param {string} s @returns {number[]} */
function nativeGP(s) {
  s = s.toUpperCase().replace(/QU/g, "CW").replace(/Q/g, "C")
    .replace(/K/g, "C").replace(/V/g, "U").replace(/Z/g, "S")
    .replace(/IO/g, "IA");
  const result = [];
  for (let i = 0; i < s.length;) {
    const pattern = combinations.find((t) => s.startsWith(t, i));
    if (pattern) {
      result.push(letterToIndex.get(pattern === "ING" ? "NG" : pattern));
      i += pattern.length;
    } else if (letterToIndex.has(s[i])) {
      result.push(letterToIndex.get(s[i]));
      i++;
    } else {
      i++;
    }
  }
  return result;
}

/**
 * All bijections selected by a fixed cipher-predecessor pair preserve
 * within-state input collision pairs exactly. This counts such output pairs.
 *
 * @param {number[]} output
 * @param {number[]|null} values - If given, count values under output-derived labels.
 * @returns {{ pairs: number, expectedFlat: number, states: number }}
 */
function collisions(output, values = null) {
  const groups = new Map();
  for (let i = 2; i < output.length; i++) {
    const state = output[i - 1] + 29 * output[i - 2];
    let counts = groups.get(state);
    if (!counts) {
      counts = new Uint16Array(29);
      groups.set(state, counts);
    }
    counts[values ? values[i] : output[i]]++;
  }
  let pairs = 0;
  let expectedFlat = 0;
  for (const counts of groups.values()) {
    let size = 0;
    for (const n of counts) {
      pairs += n * (n - 1) / 2;
      size += n;
    }
    expectedFlat += size * (size - 1) / (2 * 29);
  }
  return { pairs, expectedFlat, states: groups.size };
}

/** @param {number} x @returns {number} */
function inverse(x) {
  for (let y = 1; y < 29; y++) if (x * y % 29 === 1) return y;
  throw new Error("noninvertible GP29 multiplier");
}

/**
 * Each of all 841 predecessor-pair states receives its own unknown GP29
 * bijection. Affine maps provide a reversible positive control; the collision
 * invariant holds for every arbitrary non-affine bijection too.
 *
 * @param {number[]} plaintext
 * @param {number} seed
 * @returns {{ output: number[], decoded: number[] }}
 */
function encryptAndInvert(plaintext, seed) {
  let state = seed >>> 0;
  const a = new Int16Array(841);
  const b = new Int16Array(841);
  const inv = new Int16Array(841);
  for (let i = 0; i < 841; i++) {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    a[i] = 1 + (state >>> 0) % 28;
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    b[i] = (state >>> 0) % 29;
    inv[i] = inverse(a[i]);
  }
  const output = new Array(plaintext.length);
  for (let i = 0; i < plaintext.length; i++) {
    const prev1 = i < 2 ? 1 : output[i - 1];
    const prev2 = i < 2 ? 0 : output[i - 2];
    const label = prev1 + 29 * prev2;
    output[i] = (a[label] * plaintext[i] + b[label]) % 29;
  }
  const decoded = new Array(plaintext.length);
  for (let i = 0; i < output.length; i++) {
    const prev1 = i < 2 ? 1 : output[i - 1];
    const prev2 = i < 2 ? 0 : output[i - 2];
    const label = prev1 + 29 * prev2;
    decoded[i] = (inv[label] * ((output[i] - b[label] + 29) % 29)) % 29;
  }
  return { output, decoded };
}

function main() {
  const original = collisions(raw);
  assert.equal(original.pairs, 3580);
  assert.equal(original.states, 840);
  assert.ok(Math.abs(original.expectedFlat - 3528.034482758649) < 1e-8);
  console.log("ORIGINAL", original);
  const datasets = [
    ["Shakespeare", "resources/control/shakespeare_first300k.txt", 217106, 10, 6261, 6821],
    ["Gibran", "resources/control/gibran_prophet_58585.txt", 62492, 4, 6583, 6766],
    ["Emerson", "resources/control/emerson_essays_2944.txt", 321327, 10, 6341, 6867],
  ];
  let tested = 0;
  for (const [name, source, expectedNative, blocks, minExpected, maxExpected] of datasets) {
    const native = nativeGP(read(source));
    assert.equal(native.length, expectedNative, name);
    const scores = [];
    for (let block = 0; block < blocks; block++) {
      const plaintext = native.slice(block * N, (block + 1) * N);
      assert.equal(plaintext.length, N);
      const { output, decoded } = encryptAndInvert(plaintext, 0x330190 + block * 2719);
      assert.deepEqual(decoded, plaintext, "positive inverse of all 12,956 runes");
      const cipherScore = collisions(output);
      const hiddenPlainScore = collisions(output, plaintext);
      assert.equal(cipherScore.pairs, hiddenPlainScore.pairs,
        "all-secret state-alphabet equality invariant");
      scores.push(cipherScore.pairs);
      tested++;
      console.log("CONTROL", name, "block", block, "collisionPairs", cipherScore.pairs);
    }
    assert.equal(Math.min(...scores), minExpected, name);
    assert.equal(Math.max(...scores), maxExpected, name);
    assert.ok(original.pairs < minExpected);
    console.log("SOURCE", name, "GP-length", native.length,
      "windows", blocks, "range", minExpected, maxExpected);
  }
  assert.equal(tested, 24);
  console.log("DECISION: original 3580 context collision pairs versus all 24 GP-native "
    + "English controls >=6261. No keyed two-previous-ciphertext alphabet identifies plaintext.");
}

main();
