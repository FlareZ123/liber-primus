"use strict";

/**
 * Exact all-secret test of two independently source-motivated state bits:
 *  - the published phase-zero p50 low60-and-even-second-digit state;
 *  - the five-position clock restarted at actual printed word boundaries.
 * A complete 29-symbol secret permutation is allowed for EVERY combination
 * of previous ciphertext rune, p50 binary state, and word-phase residue.
 * Thus 29*2*5 = 290 arbitrary secret substitution alphabets are allowed.
 *
 * Test: could a direct inverse yield the GP29 unigram concentrations of
 * native English without extra chapter/page state or postcipher shuffle?
 *
 * Includes exact source runs, native-English comparisons and real
 * encrypted roundtrip controls. Read-only, Windows Node22 CommonJS SFT.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const original = gp.pages.filter(p => p.page <= 55 && p.indices.length);
const tape = original.flatMap(p => p.indices);
const TOKENS = grid.pages.flatMap(p => p.tokens);
const A60 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
const stateBit = TOKENS.map(t =>
  t[0] === "0" && (A60.indexOf(t[1]) & 1) === 0 ? 1 : 0);
const N = tape.length, FREE = original.length;
assert.deepEqual([N, FREE, stateBit.length,
  stateBit.filter(Boolean).length], [12956, 55, 256, 36]);

const gpIndex = new Map(gp.runes.map((r, i) => [r, i]));
const source = read("resources/lp2-transcription.txt");
const words = [];
let word = [], total = 0;
for (const ch of source) {
  if (gpIndex.has(ch)) {
    word.push({pos:total, rune:gpIndex.get(ch)});
    total++;
    if (total === N) {
      words.push(word);
      break;
    }
  } else if ("-.&".includes(ch) && word.length) {
    words.push(word);
    word = [];
  }
}
assert.equal(words.length, 2896);
assert.equal(total, N);
assert.deepEqual(words.flat().map(v => v.rune), tape);
const phase = new Uint8Array(N);
for (const w of words) for (let j = 0; j < w.length; j++)
  phase[w[j].pos] = j % 5;

const pageHead = new Uint8Array(N);
let offset = 0;
for (const p of original) {
  pageHead[offset] = 1;
  offset += p.indices.length;
}
assert.equal(offset, N);

/**
 * Key must be a deterministic visible class. No guessed secret key enters.
 * @param {number} position
 * @param {"none"|"bit"|"five"|"combined"} mode
 * @returns {number}
 */
function state(position, mode) {
  if (mode === "none") return 0;
  const binary = stateBit[(position - 1) & 255];
  if (mode === "bit") return binary;
  if (mode === "five") return phase[position];
  return 5 * binary + phase[position];
}

/**
 * Exact optimal upper bound under ANY 29! permutation per state and
 * preceding ciphertext rune, plus all page heads free.
 * @param {number[]} ciphertext
 * @param {"none"|"bit"|"five"|"combined"} mode
 * @returns {{upper:number[],classes:number,selectedPairs:number}}
 */
function bound(ciphertext, mode) {
  assert.equal(ciphertext.length, N);
  const rows = new Map();
  let selectedPairs = 0;
  for (let pos = 1; pos < N; pos++) {
    if (pageHead[pos]) continue;
    const key = 29 * state(pos, mode) + ciphertext[pos - 1];
    if (stateBit[(pos - 1) & 255]) selectedPairs++;
    let row = rows.get(key);
    if (!row) rows.set(key, row = Array(29).fill(0));
    row[ciphertext[pos]]++;
  }
  const sorted = [...rows.values()].map(r =>
    r.slice().sort((a, b) => b - a));
  return {
    upper:[1, 2, 3, 4].map(k => FREE + sorted.reduce((sum, row) =>
      sum + row.slice(0, k).reduce((a, b) => a + b, 0), 0)),
    classes:rows.size,
    selectedPairs
  };
}

const fixed = Object.fromEntries(
  ["none", "bit", "five", "combined"].map(m => [m, bound(tape, m)]));
assert.deepEqual(fixed.none.upper, [769, 1414, 2026, 2619]);
assert.deepEqual(fixed.bit.upper, [852, 1570, 2243, 2875]);
assert.deepEqual(fixed.five.upper, [1081, 1981, 2796, 3555]);
assert.deepEqual(fixed.combined.upper, [1284, 2325, 3247, 4091]);
assert.equal(fixed.combined.classes, 290);
assert.equal(fixed.combined.selectedPairs, 1809);

/**
 * Calibrated GP29 transliteration from independently solved LP1:
 * ING and IO receive source-attested composite rune spellings.
 * @param {string} text
 * @returns {number[]}
 */
function nativeGP(text) {
  const tokens = gp.translit.map((s, i) => ({s, i}))
    .sort((a, b) => b.s.length - a.s.length);
  const clean = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  for (const w of clean.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < w.length;) {
      if (w.startsWith("ING", i)) {
        result.push(21); i += 3;
      } else if (w.startsWith("IO", i)) {
        result.push(27); i += 2;
      } else {
        const t = tokens.find(t => w.startsWith(t.s, i));
        assert(t, "native GP spelling: " + w);
        result.push(t.i);
        i += t.s.length;
      }
    }
  }
  return result;
}

/** @param {number[]} sequence @param {number} k */
function topK(sequence, k) {
  const counts = Array(29).fill(0);
  for (const rune of sequence) counts[rune]++;
  return counts.sort((a, b) => b - a)
    .slice(0, k).reduce((a, b) => a + b, 0);
}

const controls = [
  ["Gibran", nativeGP(read("resources/control/gibran_prophet_58585.txt"))],
  ["Shakespeare", nativeGP(read("resources/control/shakespeare_first300k.txt"))]
];
const windows = [];
for (const [name, sourceRunes] of controls) {
  let passed = 0;
  const minima = Array(4).fill(N);
  for (let start = 0; start + N <= sourceRunes.length; start += 1703) {
    const passage = sourceRunes.slice(start, start + N);
    for (let i = 0; i < 4; i++) {
      const value = topK(passage, i + 1);
      assert(value > fixed.combined.upper[i], name + " top-" + (i + 1));
      minima[i] = Math.min(minima[i], value);
    }
    passed++;
  }
  windows.push({name,originalGPSize:sourceRunes.length,windows:passed,minima});
}
assert.deepEqual(windows.map(w => w.windows), [30, 120]);

const reference = read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split(/### \d+\r?\n/).slice(1).join(" ");
const solved = nativeGP(reference);
assert.equal(solved.length, 3510);
for (let i = 0; i < 4; i++)
  assert(topK(solved, i + 1) / solved.length >
    fixed.combined.upper[i] / N);

/**
 * Actual forward and inverse pass of 290 independently secret permutations.
 * @param {number[]} plaintext
 * @returns {{cipher:number[],decoded:number[]}}
 */
function plant(plaintext) {
  let seed = 0x3301b175;
  /** @returns {number} */
  function next() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  }
  const maps = Array.from({length:290}, () => {
    const p = Array.from({length:29}, (_, i) => i);
    for (let j = 28; j > 0; j--) {
      const k = next() % (j + 1);
      [p[j], p[k]] = [p[k], p[j]];
    }
    return p;
  });
  const inverse = maps.map(p => {
    const q = Array(29);
    p.forEach((v, i) => {q[v] = i;});
    return q;
  });
  const cipher = [], decoded = [];
  for (let pos = 0; pos < N; pos++) {
    if (pageHead[pos]) {
      cipher.push(next() % 29);
      decoded.push(plaintext[pos]); // arbitrary page-head IV decoded freely
      continue;
    }
    const id = 29 * state(pos, "combined") + cipher[pos - 1];
    const c = maps[id][plaintext[pos]];
    cipher.push(c);
    decoded.push(inverse[id][c]);
  }
  return {cipher, decoded};
}

const native = controls[0][1].slice(0, N);
const plantResult = plant(native);
assert.deepEqual(plantResult.decoded, native);
const plantBound = bound(plantResult.cipher, "combined");
for (let i = 0; i < 4; i++)
  assert(topK(native, i + 1) <= plantBound.upper[i],
    "genuine encrypted source-native GP control must pass key-independent bound");

console.log(JSON.stringify({
  model:"29 hidden key permutations × p50 bit0 × word-phase5",
  originalSource:"original 12956 GP29 runes/2896 printed words, phase-zero p50",
  pages:FREE,
  allSecretBounds:fixed,
  nativeControls:windows,
  solvedReference:solved.length,
  planted:{runes:N,states:290,exactPlaintext:true,
    upper:plantBound.upper},
  decision:"Global p50-low60-bit0 + word5 state insufficient for direct source-native English emission; extra state/encoder remains required"
}, null, 2));
