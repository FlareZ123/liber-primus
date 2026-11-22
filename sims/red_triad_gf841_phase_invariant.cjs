"use strict";

/**
 * Source-defined GF(29^2) primitive generator, 840-phase key-independent
 * collision invariant on authentic unsolved LP2 ciphertext.
 *
 * Run with Node.js 22: node sims/red_triad_gf841_phase_invariant.cjs
 *
 * Read only original source inputs and separately committed control texts.
 * A stationary phase-dependent permutation preserves within-phase equality,
 * regardless of the 840 unknown permutation keys.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const FIELD = 29;
const PERIOD = 840;
const WINDOW_COUNT = 300;
const SECTION_LENGTHS = [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316];

const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/base60-grid.json"), "utf8"));
const pages = corpus.pages.filter(p => p.page < 56);
const original = pages.flatMap(p => p.indices);
assert.equal(original.length, 12956);
assert.equal(SECTION_LENGTHS.reduce((a, b) => a + b, 0), original.length);

/** @param {number} x @returns {number} */
function mod(x) { return (x % FIELD + FIELD) % FIELD; }

/** @param {number} x @returns {number} */
function inv(x) {
  for (let k = 1; k < FIELD; k++) if (mod(x * k) === 1) return k;
  throw new RangeError("Zero element is not invertible");
}

// The only three-rune red texts on p3 and p39 are source-local 119..121.
// Both triples are in increasing polynomial-power order.
const red3 = corpus.pages.find(p => p.page === 3).indices.slice(119, 122);
const red39 = corpus.pages.find(p => p.page === 39).indices.slice(119, 122);
const ac = corpus.pages.find(p => p.page === 54).indices[0];
assert.deepEqual(red3, [13, 23, 2]);
assert.deepEqual(red39, [27, 5, 15]);
assert.equal(ac, 24);
assert.deepEqual([
  mod(15 * ac * ac), mod(-30 * ac), 15
], red39);

// red3 = 13 + 23*u + 2*u^2 = 0.
// Thus u^2 = A + B*u in GF(29^2), with A=8 and B=3.
const A = mod(-red3[0] * inv(red3[2]));
const B = mod(-red3[1] * inv(red3[2]));
assert.deepEqual([A, B], [8, 3]);

/** @typedef {[number,number]} GF841 */
/** @param {GF841} x @param {GF841} y @returns {GF841} */
function mul(x, y) {
  return [
    mod(x[0] * y[0] + A * x[1] * y[1]),
    mod(x[0] * y[1] + x[1] * y[0] + B * x[1] * y[1])
  ];
}

const u = [0, 1];
let power = [1, 0];
for (let i = 1; i < PERIOD; i++) {
  power = mul(power, u);
  assert.notDeepEqual(power, [1, 0]);
}
assert.deepEqual(mul(power, u), [1, 0]);

// p39's polynomial is 15*(X-24)^2, and divides the original grid
// polynomial twice in the field. The quotient has 254 coefficients.
const bytes = grid.byte_rows.flat();
assert.equal(bytes.length, 256);

/** @param {number[]} values @returns {number[]} */
function divideByXMinusAc(values) {
  const a = values.slice(), q = [];
  for (let i = 0; i < a.length - 1; i++) {
    q.push(a[i]);
    a[i + 1] = mod(a[i + 1] + ac * a[i]);
  }
  assert.equal(a[a.length - 1], 0);
  return q;
}
const quotient = divideByXMinusAc(divideByXMinusAc(bytes.map(mod)));
assert.equal(quotient.length, 254);

/** Construct original position clocks; section clock uses canonical $ spans. */
function positionClocks() {
  const out = { book: [], page: [], section: [] };
  let i = 0, section = 0, sectionStart = 0, sectionEnd = SECTION_LENGTHS[0];
  for (const p of pages) {
    for (let j = 0; j < p.indices.length; i++, j++) {
      while (i >= sectionEnd) {
        section++;
        sectionStart = sectionEnd;
        sectionEnd += SECTION_LENGTHS[section];
      }
      out.book.push(i % PERIOD);
      out.page.push(j % PERIOD);
      out.section.push(section * PERIOD + (i - sectionStart) % PERIOD);
    }
  }
  return out;
}
const clocks = positionClocks();

/**
 * Exact per-state equality invariant for an arbitrary unknown bijection.
 * @param {number[]} sequence
 * @param {number[]} clock
 * @param {number} [offset]
 */
function collisions(sequence, clock, offset = 0) {
  const states = new Map();
  for (let i = 0; i < original.length; i++) {
    const key = clock[i];
    let entry = states.get(key);
    if (!entry) {
      entry = { n: 0, counts: Array(29).fill(0) };
      states.set(key, entry);
    }
    entry.n++;
    entry.counts[sequence[i + offset]]++;
  }
  let matches = 0, pairs = 0;
  for (const state of states.values()) {
    pairs += state.n * (state.n - 1) / 2;
    for (const n of state.counts) matches += n * (n - 1) / 2;
  }
  return { matches, pairs, rate: matches / pairs };
}

/** @param {string} input @returns {number[]} */
function nativeGP(input) {
  const token = corpus.translit.map((s, i) => ({ s, i }))
    .sort((a, b) => b.s.length - a.s.length);
  const words = input.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C")
    .replace(/Z/g, "S").replace(/ING/g, "NG")
    .match(/[A-Z]+/g) || [];
  const result = [];
  for (const word of words) {
    const one = [];
    for (let i = 0; i < word.length;) {
      const match = token.find(t => word.startsWith(t.s, i));
      if (!match) { one.length = 0; break; }
      one.push(match.i);
      i += match.s.length;
    }
    result.push(...one);
  }
  return result;
}

/** Prove the invariant and exact full-length inverse on a hidden-key plant. */
function plantedCheck(reference, clock) {
  const encrypted = reference.map((plain, i) => {
    const s = clock[i], a = 1 + (s * 17) % 28, b = (s * 23 + 7) % 29;
    return mod(a * plain + b);
  });
  const decoded = encrypted.map((cipher, i) => {
    const s = clock[i], a = 1 + (s * 17) % 28, b = (s * 23 + 7) % 29;
    return mod((cipher - b) * inv(a));
  });
  assert.deepEqual(decoded, reference);
  assert.deepEqual(collisions(reference, clock), collisions(encrypted, clock));
  return decoded.length;
}

const sourceFiles = [
  "shakespeare_first300k.txt",
  "gibran_prophet_58585.txt",
  "emerson_essays_2944.txt"
];
const actual = Object.fromEntries(
  Object.entries(clocks).map(([k, v]) => [k, collisions(original, v)])
);
assert.deepEqual(actual.book, {
  matches: 3277, pairs: 93540, rate: 3277 / 93540
});
assert.deepEqual(actual.page, {
  matches: 10751, pairs: 311132, rate: 10751 / 311132
});
assert.deepEqual(actual.section, {
  matches: 307, pairs: 9051, rate: 307 / 9051
});

const controls = [];
let fullLengthPlantedRecoveries = 0;
for (const name of sourceFiles) {
  const raw = fs.readFileSync(path.join(ROOT, "resources/control", name), "utf8");
  const runes = nativeGP(raw);
  assert.ok(runes.length >= original.length + WINDOW_COUNT);
  const length = runes.length - original.length;
  const values = { book: [], page: [], section: [] };
  for (let w = 0; w < WINDOW_COUNT; w++) {
    const start = Math.floor(w * length / (WINDOW_COUNT - 1));
    for (const [key, clock] of Object.entries(clocks)) {
      values[key].push(collisions(runes, clock, start).rate);
    }
  }
  const reference = runes.slice(0, original.length);
  for (const clock of Object.values(clocks)) {
    fullLengthPlantedRecoveries += plantedCheck(reference, clock);
  }
  controls.push({
    source: name,
    sourceGP: runes.length,
    windows: WINDOW_COUNT,
    comparisons: Object.fromEntries(Object.entries(values).map(
      ([key, scores]) => [key, {
        min: Math.min(...scores),
        max: Math.max(...scores),
        atOrBelowOriginal: scores.filter(x => x <= actual[key].rate).length
      }]
    ))
  });
}
assert.equal(fullLengthPlantedRecoveries, 3 * 3 * original.length);
assert.ok(controls.every(c =>
  Object.values(c.comparisons).every(k => k.atOrBelowOriginal === 0)));

console.log(JSON.stringify({
  hypothesis: "A direct one-GP-rune cipher with any hidden bijection per state of the source primitive GF(29^2) u-multiplication clock (period 840)",
  source: { red3, red39, ac, generatorOrder: PERIOD, quotientLength: quotient.length },
  originalRunes: original.length, originalSamePhase: actual,
  sourceNativeControls: controls, fullLengthPlantedRecoveries,
  interpretation: "Strong conditional direct-native-GP exclusion for fixed u-multiplication states; neither original plaintext nor a key recovered. Evolving/feedback states and non-GP intermediate registers remain open."
}, null, 2));
