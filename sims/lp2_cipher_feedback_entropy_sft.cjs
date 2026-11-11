"use strict";

/**
 * Key-independent conditional-entropy gate for stationary ciphertext-feedback
 * GP29 substitutions. Run from the repository with:
 * node sims/lp2_cipher_feedback_entropy_sft.cjs
 *
 * @typedef {{page:number, indices:number[]}} Page
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
/** @type {Page[]} */
const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
const PAGE_LENGTHS = pages.map((p) => p.indices.length);
const SECTION_LENGTHS = [729, 1145, 1729, 9, 1894, 1021, 1524, 1589, 3316];
const ciphertext = pages.flatMap((p) => p.indices);
const N = ciphertext.length;
assert.equal(N, 12956);
assert.equal(PAGE_LENGTHS.length, 55);
assert.equal(SECTION_LENGTHS.reduce((a, b) => a + b, 0), N);

function starts(lengths) {
  const result = new Set([0]);
  let offset = 0;
  for (const len of lengths) {
    result.add(offset);
    offset += len;
  }
  assert.equal(offset, N);
  return result;
}
const pageStarts = starts(PAGE_LENGTHS);
const sectionStarts = starts(SECTION_LENGTHS);
const sectionAt = new Array(N);
let offset = 0;
for (let s = 0; s < SECTION_LENGTHS.length; s++) {
  for (let j = 0; j < SECTION_LENGTHS[s]; j++) sectionAt[offset++] = s;
}
assert.equal(offset, N);

/** @param {number[]} counts */
function entropy(counts) {
  const total = counts.reduce((a, b) => a + b, 0);
  let h = 0;
  for (const count of counts) {
    if (!count) continue;
    const p = count / total;
    h -= p * Math.log2(p);
  }
  return h;
}
function newRows() {
  return Array.from({length: SECTION_LENGTHS.length}, () =>
    Array.from({length: 29}, () => Array(29).fill(0)));
}
function isTransition(i, sectioned) {
  return i > 0 && !pageStarts.has(i) &&
    (!sectioned || !sectionStarts.has(i));
}
/** @param {number[]} stream */
function transitionRows(stream, sectioned) {
  const rows = newRows();
  let n = 0;
  for (let i = 1; i < N; i++) {
    if (!isTransition(i, sectioned)) continue;
    const s = sectioned ? sectionAt[i] : 0;
    rows[s][stream[i - 1]][stream[i]]++;
    n++;
  }
  return {rows, n};
}
function conditionalEntropy(rows) {
  const n = rows.flat(2).reduce((a, b) => a + b, 0);
  let h = 0;
  for (const byPreviousRune of rows) {
    for (const counts of byPreviousRune) {
      const m = counts.reduce((a, b) => a + b, 0);
      if (m) h += m / n * entropy(counts);
    }
  }
  return h;
}
const globalRows = transitionRows(ciphertext, false);
const sectionRows = transitionRows(ciphertext, true);
const globalH = conditionalEntropy(globalRows.rows);
const sectionH = conditionalEntropy(sectionRows.rows);
assert.equal(globalRows.n, 12901);
assert.equal(sectionRows.n, 12899);
assert.ok(Math.abs(globalH - 4.785306737223474) < 1e-10);
assert.ok(Math.abs(sectionH - 4.429572312568618) < 1e-10);

// Compare empirical plaintext entropies on precisely the ciphertext's
// destination positions, including both within-page and section restarts.
const transitions = [];
for (let i = 1; i < N; i++) {
  if (isTransition(i, true)) transitions.push(i);
}
const tokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} text */
function encodeNativeGP(text) {
  const out = [];
  const normalized = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const match = tokens.find((x) => word.startsWith(x.s, i));
      assert(match, "unmapped GP token");
      out.push(match.i);
      i += match.s.length;
    }
  }
  return out;
}
function destinationEntropy(block) {
  const counts = Array(29).fill(0);
  for (const i of transitions) counts[block[i]]++;
  return entropy(counts);
}
const controls = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];
const out = [];
let plantPlaintext = null;
for (const [name, filename] of controls) {
  const data = encodeNativeGP(read(filename));
  const values = [];
  for (let start = 0; start + N <= data.length; start += Math.floor(N / 2)) {
    const block = data.slice(start, start + N);
    if (plantPlaintext === null) plantPlaintext = block;
    values.push(destinationEntropy(block));
  }
  assert(values.length > 0);
  values.sort((a, b) => a - b);
  out.push({
    name, windows: values.length,
    min: values[0], median: values[Math.floor(values.length / 2)],
    max: values.at(-1)
  });
}
assert.deepEqual(out.map((x) => x.windows), [32, 8, 49]);
assert(out.every((x) => x.max < sectionH));

// Positive control: nine secret tables of 29 secret bijections, each keyed
// by the previous ciphertext rune. An exact inverse must recover every rune.
let seed = 0x3301d00d;
function rand() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed;
}
function permutation() {
  const p = Array.from({length: 29}, (_, i) => i);
  for (let i = p.length - 1; i > 0; i--) {
    const j = rand() % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  return p;
}
const maps = Array.from({length: SECTION_LENGTHS.length}, () =>
  Array.from({length: 29}, permutation));
const inverses = maps.map((byPrev) => byPrev.map((p) => {
  const inv = Array(29);
  p.forEach((val, i) => { inv[val] = i; });
  return inv;
}));
const encrypted = Array(N);
const recovered = Array(N);
for (let i = 0; i < N; i++) {
  if (pageStarts.has(i) || sectionStarts.has(i)) {
    encrypted[i] = plantPlaintext[i];
    recovered[i] = plantPlaintext[i];
  } else {
    const state = sectionAt[i];
    const previous = encrypted[i - 1];
    encrypted[i] = maps[state][previous][plantPlaintext[i]];
    recovered[i] = inverses[state][previous][encrypted[i]];
  }
}
assert.deepEqual(recovered, plantPlaintext);
const plaintextConditionedRows = newRows();
for (const i of transitions) {
  plaintextConditionedRows[sectionAt[i]][encrypted[i - 1]][plantPlaintext[i]]++;
}
const plantEncryptedH = conditionalEntropy(transitionRows(encrypted, true).rows);
const plantPlainConditionedH = conditionalEntropy(plaintextConditionedRows);
const plantUnconditionalH = destinationEntropy(plantPlaintext);
assert.ok(Math.abs(plantEncryptedH - plantPlainConditionedH) < 1e-12);
assert.ok(plantEncryptedH <= plantUnconditionalH + 1e-12);

// Grant the adversary *arbitrary* 29x29 row permutations at every
// phase of a publicly known periodic clock. No hidden-key search is needed:
// the entropy identity applies separately in each (phase, previous-C) state.
function phaseRows(period, pageReset) {
  const rows = Array.from({length: period}, () =>
    Array.from({length: 29}, () => Array(29).fill(0)));
  let start = 0;
  for (const len of PAGE_LENGTHS) {
    for (let j = 1; j < len; j++) {
      const i = start + j;
      const phase = (pageReset ? j : i) % period;
      rows[phase][ciphertext[i - 1]][ciphertext[i]]++;
    }
    start += len;
  }
  assert.equal(start, N);
  return conditionalEntropy(rows);
}
const phaseClock = [1, 5, 7, 8, 10, 11].map((period) => ({
  period,
  global: phaseRows(period, false),
  pageReset: phaseRows(period, true)
}));
assert.ok(Math.abs(phaseClock[1].global - 4.5835245426157085) < 1e-10);
assert.ok(Math.abs(phaseClock[2].pageReset - 4.466437907747491) < 1e-10);
for (const row of phaseClock.slice(0, 5)) {
  assert.ok(row.global > 4.28910 && row.pageReset > 4.28910);
}
assert.ok(phaseClock[5].global < 4.28910);

console.log(JSON.stringify({
  source: {
    runes: N, pages: PAGE_LENGTHS.length, sections: SECTION_LENGTHS.length,
    globalTransitions: globalRows.n, sectionTransitions: sectionRows.n,
    globalBits: globalH, sectionBits: sectionH
  },
  controls: out,
  phaseClock,
  secretBijectionPlant: {
    recovered: recovered.length, conditionalBits: plantEncryptedH,
    plaintextMarginalBits: plantUnconditionalH
  }
}, null, 2));
