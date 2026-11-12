"use strict";
/**
 * A source-derived 612-state BBS hypothesis and an original-input all-secret
 * phase-collision gate. The Parable's clause sums fix 1259,1031,1229,
 * giving two primes ≡3 mod4 and an independently printed seed. The historical
 * product is authenticated; its use as a cipher PRNG remains conjectural.
 *
 * For period612 additive GP29, or EA-transparent predecessor-exclusion rank28,
 * equality of observations with the same key phase cannot be changed by
 * ANY independent hidden per-phase permutation at that phase. Test all 12956 real LP2 runes,
 * with 45 matched-length English controls and genuine encrypted plants.
 *
 * Run: node sims/parable_bbs612_original_phase_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {toGematria} = require("./previous_cipher_sbox_invariant.cjs");
const root = path.resolve(__dirname, "..");
const load = (p) => fs.readFileSync(path.join(root, p), "utf8");
const gp = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const p57 = gp.pages.find((p) => p.page === 57).indices;
const clauseLengths = [7, 30, 30, 28];
let offset = 0;
const clauseSums = clauseLengths.map((n) => {
  const result = p57.slice(offset, offset + n)
    .reduce((s, glyph) => s + gp.prime[glyph], 0);
  offset += n;
  return result;
});
assert.deepEqual(clauseSums, [449, 1259, 1031, 1229]);
const [p, q, seed] = clauseSums.slice(1);
assert.equal(p * q * seed, 1595277641);
assert.equal(p % 4, 3);
assert.equal(q % 4, 3);
assert.equal(seed % 4, 1);
const N = p * q;
const start = seed * seed % N;
const states = [];
let state = start;
do {
  assert(states.length < N);
  states.push(state);
  state = state * state % N;
} while (state !== start);
assert.equal(states.length, 612);
assert.equal(new Set(states).size, 612);
const bits = states.map((v) => v & 1);
const divisors = Array.from({length:612}, (_, i) => i + 1)
  .filter((d) => 612 % d === 0);
assert.equal(divisors.find((d) =>
  bits.every((v, i) => v === bits[i % d])), 612);

const pages = gp.pages.filter((x) => x.page <= 55 && x.indices.length);
const lens = pages.map((x) => x.indices.length);
const ciphertext = pages.flatMap((x) => x.indices);
assert.equal(pages.length, 55);
assert.equal(ciphertext.length, 12956);
const PERIOD = states.length;
const mod = (x, n) => ((x % n) + n) % n;
let randomState = (N ^ seed ^ 0x3301) >>> 0;
function nextRandom() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return randomState >>> 0;
}
/** @param {number} n */
function permutation(n) {
  const a = Array.from({length:n}, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = nextRandom() % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
/** @param {number[][]} rows */
function inverses(rows) {
  return rows.map((row) => {
    const inv = new Array(row.length);
    row.forEach((value, i) => {inv[value] = i;});
    assert.deepEqual(inv.slice().sort((a, b) => a - b),
      Array.from({length:row.length}, (_, i) => i));
    return inv;
  });
}
const table29 = Array.from({length:PERIOD}, () => permutation(29));
const table28 = Array.from({length:PERIOD}, () => permutation(28));
const inverse29 = inverses(table29);
const inverse28 = inverses(table28);

/**
 * @param {number[]} values Each entry is 0..28, or -1 for excluded positions.
 * @param {"global"|"skip"} clock Global rune count or compacted eligible count.
 */
function phaseCollision(values, clock) {
  const count = new Uint16Array(PERIOD);
  const groups = Array.from({length:PERIOD}, () => new Uint16Array(29));
  let used = 0;
  for (let pos = 0; pos < values.length; pos++) {
    const v = values[pos];
    if (v < 0) continue;
    const phase = (clock === "global" ? pos : used) % PERIOD;
    groups[phase][v]++;
    count[phase]++;
    used++;
  }
  let equal = 0, eligible = 0;
  for (let i = 0; i < PERIOD; i++) {
    eligible += count[i] * (count[i] - 1);
    for (const n of groups[i]) equal += n * (n - 1);
  }
  assert.equal(equal % 2, 0);
  assert.equal(eligible % 2, 0);
  return {equalPairs:equal / 2, eligiblePairs:eligible / 2,
    rate:equal / eligible, observations:used};
}

/** @param {number[]} symbols Original or synthetic 55-page GP29 stream. */
function stepRanks(symbols) {
  const ranks = new Array(symbols.length).fill(-1);
  let at = 0;
  for (const n of lens) {
    for (let i = 1; i < n; i++) {
      const current = symbols[at + i], previous = symbols[at + i - 1];
      if (current !== previous)
        ranks[at + i] = mod(current - previous - 1, 29);
    }
    at += n;
  }
  assert.equal(at, symbols.length);
  return ranks;
}

/**
 * The GP28 consumer is an explicit reversible plant: ciphertext C_i is
 * C_(i-1) for plaintext EA, otherwise one of its 28 other rune values.
 * @param {number[]} plain Source-native GP symbols.
 * @param {"global"|"skip"} clock
 */
function plant28(plain, clock) {
  const cipher = [], recovered = [];
  let pos = 0, eligible = 0;
  for (const n of lens) {
    let previous = plain[pos];
    cipher.push(previous);
    recovered.push(previous);
    pos++;
    for (let i = 1; i < n; i++, pos++) {
      const value = plain[pos];
      if (value === 28) {
        cipher.push(previous);
        recovered.push(28);
      } else {
        const phase = (clock === "global" ? pos : eligible) % PERIOD;
        const rank = table28[phase][value];
        const glyph = mod(previous + 1 + rank, 29);
        const readRank = mod(glyph - previous - 1, 29);
        cipher.push(glyph);
        recovered.push(inverse28[phase][readRank]);
        previous = glyph;
        eligible++;
      }
    }
  }
  assert.deepEqual(recovered, plain);
  assert.equal(cipher.length, 12956);
  return cipher;
}

/** @param {number[]} plain */
function plant29(plain) {
  const encrypted = plain.map((v, i) => table29[i % PERIOD][v]);
  const decrypted = encrypted.map((v, i) =>
    inverse29[i % PERIOD][v]);
  assert.deepEqual(decrypted, plain);
  return encrypted;
}

const actual28 = stepRanks(ciphertext);
assert.equal(actual28.filter((v) => v >= 0).length, 12815);
const actual = {
  direct29:phaseCollision(ciphertext, "global"),
  rank28Global:phaseCollision(actual28, "global"),
  rank28Skip:phaseCollision(actual28, "skip")
};
assert.equal(actual.direct29.eligiblePairs, 130704);
assert.equal(actual.rank28Global.eligiblePairs, 127880);
assert.equal(actual.rank28Skip.eligiblePairs, 127780);
assert(Math.abs(actual.rank28Global.rate -
  0.03504066312167657) < 1e-12);
assert(Math.abs(actual.rank28Skip.rate -
  0.03528721239630615) < 1e-12);

const files = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];
const controls = [];
for (const [name, sourcePath] of files) {
  const source = toGematria(load(sourcePath));
  for (let startIndex = 0; startIndex + 12956 <= source.length;
    startIndex += 12956) {
    const text = source.slice(startIndex, startIndex + 12956);
    const native28 = text.map((v, i) => v === 28 ? -1 : v);
    let at = 0;
    for (const n of lens) {native28[at] = -1; at += n;}
    const expected29 = phaseCollision(text, "global");
    const expected28Global = phaseCollision(native28, "global");
    const expected28Skip = phaseCollision(native28, "skip");

    const encrypted29 = plant29(text);
    const encrypted28Global = plant28(text, "global");
    const encrypted28Skip = plant28(text, "skip");
    const actualPlant29 = phaseCollision(encrypted29, "global");
    const actualPlant28Global = phaseCollision(stepRanks(encrypted28Global),
      "global");
    const actualPlant28Skip = phaseCollision(stepRanks(encrypted28Skip),
      "skip");
    for (const [expected, observed] of [
      [expected29, actualPlant29],
      [expected28Global, actualPlant28Global],
      [expected28Skip, actualPlant28Skip]
    ]) {
      assert.equal(expected.rate, observed.rate);
      assert.equal(expected.equalPairs, observed.equalPairs);
      assert.equal(expected.eligiblePairs, observed.eligiblePairs);
    }
    controls.push({name, startIndex,
      direct29:expected29.rate,
      rank28Global:expected28Global.rate,
      rank28Skip:expected28Skip.rate});
  }
}
assert.equal(controls.length, 45);
const minimum = (key) => Math.min(...controls.map((r) => r[key]));
const maximum = (key) => Math.max(...controls.map((r) => r[key]));
for (const key of ["direct29", "rank28Global", "rank28Skip"])
  assert(minimum(key) > 0.055 && maximum(key) > minimum(key));
const windows = Object.fromEntries(files.map(([name]) =>
  [name, controls.filter((x) => x.name === name).length]));
console.log(JSON.stringify({
  fact:{bodyClausePrimeSums:clauseSums.slice(1),
    id3ParableProduct:1595277641},
  proposed:{BlumModulus:N,seed,
    initialSquare:start,stateCycle:612,bitCycle:612},
  original:actual,
  controls:{windows,matchedLength:12956,syntheticRoundtrips:45*3,
    direct29:{min:minimum("direct29"),max:maximum("direct29")},
    rank28Global:{min:minimum("rank28Global"),max:maximum("rank28Global")},
    rank28Skip:{min:minimum("rank28Skip"),max:maximum("rank28Skip")}},
  finding:"Neither 612-phase GP29 nor EA-transparent 28-rank arbitrary secret-phase permutations can hide native-like GP language under tested book-continuous clocks.",
  recoveredUnknownPlaintext:false
},null,2));
