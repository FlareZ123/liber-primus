"use strict";

/**
 * Original-source collision/quote bridge for Liber Primus LP2.
 *
 * Source inputs are original-derived corpus, ink annotations, quote offsets,
 * numeric table and native GP-English quadgrams. The 13×state+input walk was
 * proposed on Issue #12 before this cross-track test. This experiment tests
 * the follow-up equality of 86 repeated walk visits, 86 original ciphertext
 * doublets and 86 quote words, without fitting the recurrence to plaintext.
 *
 * SFT: node sims/ink256_lcg_collision_quote_bridge_sft.cjs
 * No unknown plaintext or authentic cipher is claimed.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const load = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(load("resources/liber-primus/lp2-ink-annotations.json"));
const quote = JSON.parse(load("resources/liber-primus/lp2-quote-punctuation-spans.json"));
const table = JSON.parse(load("resources/liber-primus/base60-grid.json"));
const transcription = load("resources/lp2-transcription.txt");
const quadText = load("resources/control/duko_round27_english_quadgrams.txt");

const events = [];
for (const page of ink.pages) {
  for (const span of page.red_spans || []) {
    for (let j = 0; j < span.length; j++) {
      const rune = span.runes[j];
      const index = corpus.runes.indexOf(rune);
      assert(index >= 0);
      events.push({page: page.page, time: 2 * (span.start + j) + 1,
        value: index + 1, kind: "rune"});
    }
  }
  for (const [at, dots] of page.large_punctuation || []) {
    if (dots === 13) {
      events.push({page: page.page, time: 2 * at,
        value: 31, kind: "mark"});
    }
  }
}
events.sort((a, b) => (a.page - b.page) || (a.time - b.time));
assert.equal(events.length, 256);
assert.equal(events.filter(e => e.kind === "rune").length, 225);
assert.equal(events.filter(e => e.kind === "mark").length, 31);

/** @param {number[]} input Chronological source-event input values. */
function walk(input) {
  const seen = new Uint8Array(256);
  const repeats = [];
  let state = 0;
  let distinct = 0;
  for (let i = 0; i < input.length; i++) {
    state = (13 * state + input[i]) & 255;
    if (seen[state]) repeats.push({event: i, state});
    else { seen[state] = 1; distinct++; }
  }
  return {state, distinct, repeats};
}
const values = events.map(e => e.value);
const observed = walk(values);
assert.equal(observed.state, 133);
assert.equal(observed.distinct, 170);
assert.equal(observed.repeats.length, 86);

// Only the 55 rune-bearing unsolved physical pages enter the doublet count.
const cipher = corpus.pages.filter(p => p.status === "unsolved").flatMap(p => p.indices);
assert.equal(cipher.length, 12956);
const doublets = [];
for (let i = 0; i + 1 < cipher.length; i++)
  if (cipher[i] === cipher[i + 1]) doublets.push({at: i, index: cipher[i]});
assert.equal(doublets.length, 86);

// Parse the continuous transcript: '/' and '%' are layout, not word gaps.
const source = transcription.split("%").slice(0, 55).join("%");
const isRune = ch => /[\u16A0-\u16FF]/u.test(ch);
const words = [];
let current = "", start = 0, offset = 0;
function flush() {
  if (current) words.push({start, end: offset, runes: current});
  current = "";
}
for (const ch of source) {
  if (isRune(ch)) {
    if (!current) start = offset;
    current += ch;
    offset++;
  } else if (ch !== "%" && ch !== "/" && !/\s/u.test(ch)) flush();
}
flush();
assert.equal(words.length, 2896);
const quoteWords = words.filter(w => quote.quotes.some(q => w.start >= q.start && w.end <= q.end));
assert.equal(quoteWords.length, 86);
const quoteIndices = quoteWords.map(w => [...w.runes].map(r => corpus.runes.indexOf(r)));
assert.equal(quoteIndices.flat().length, 405);

const bytes = table.byte_rows.flat();
assert.equal(bytes.length, 256);
const keys = {
  state: observed.repeats.map(e => e.state % 29),
  byte: observed.repeats.map(e => bytes[e.state] % 29),
  input: observed.repeats.map(e => values[e.event] % 29)
};

/**
 * Transform each quoted word with the source-chronological repeat-event key.
 * @param {number[][]} grouped Grouped 29-rune text.
 * @param {number[]} key One value for each of 86 words.
 * @param {number} sign +1 for encryption, -1 for decryption.
 */
function transform(grouped, key, sign) {
  return grouped.map((w, i) => w.map(c => (c + sign * key[i] + 29) % 29));
}
const grams = new Map();
let total = 0;
for (const line of quadText.split(/\r?\n/u)) {
  const m = line.match(/^([A-Z]{4})\s+(\d+)$/u);
  if (m) {
    const freq = Number(m[2]);
    grams.set(m[1], freq);
    total += freq;
  }
}
/** @param {number[]} indices Original GP index stream. */
function score(indices) {
  const expanded = indices.map(i => corpus.translit[i]).join("");
  let sum = 0, hits = 0;
  for (let i = 0; i + 4 <= expanded.length; i++) {
    const count = grams.get(expanded.slice(i, i + 4)) || 0;
    sum += Math.log10((count + 0.01) / total);
    if (count) hits++;
  }
  return {meanLog10: sum / (expanded.length - 3), hits,
    preview: expanded.slice(0, 100)};
}
const baseline = score(quoteIndices.flat());
const candidates = [];
for (const [name, key] of Object.entries(keys)) {
  assert.equal(key.length, 86);
  for (const sign of [-1, 1]) {
    const decoded = transform(quoteIndices, key, sign).flat();
    candidates.push({key: name, sign, ...score(decoded)});
  }
}
candidates.sort((a, b) => b.meanLog10 - a.meanLog10);
// All six source-frozen literal per-word GP29 inverses underperform raw quotes.
assert(candidates.every(c => c.meanLog10 < baseline.meanLog10));
// Positive control is an authentic solved LP2 source, repeated to match 405 slots.
const solved = corpus.pages.find(p => p.page === 57).indices;
assert.equal(solved.length, 95);
const plant = quoteIndices.map((w, i) => Array.from({length: w.length}, (_, j) =>
  solved[(quoteIndices.slice(0, i).reduce((n, q) => n + q.length, 0) + j) % solved.length]));
const encrypted = transform(plant, keys.byte, 1);
assert.deepEqual(transform(encrypted, keys.byte, -1), plant);
assert.deepEqual(transform(transform(quoteIndices, keys.byte, -1), keys.byte, 1), quoteIndices);

// Distinct 256-state collision count was noticed after the 133 terminal check:
// these are diagnostic shuffle controls, not a pre-registered significance test.
let seed = 0x30112026;
/** @returns {number} Deterministic xorshift32 output. */
function rand() {
  seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
  return seed >>> 0;
}
const redPositions = events.map((e, i) => e.kind === "rune" ? i : -1).filter(i => i >= 0);
const trials = 100000;
let end133 = 0, exact170 = 0, joint = 0, distinctSum = 0, distinctSq = 0;
for (let t = 0; t < trials; t++) {
  const shuffled = values.slice();
  for (let j = redPositions.length - 1; j > 0; j--) {
    const k = rand() % (j + 1);
    const a = redPositions[j], b = redPositions[k];
    [shuffled[a], shuffled[b]] = [shuffled[b], shuffled[a]];
  }
  const x = walk(shuffled);
  distinctSum += x.distinct;
  distinctSq += x.distinct * x.distinct;
  if (x.state === 133) end133++;
  if (x.distinct === 170) exact170++;
  if (x.state === 133 && x.distinct === 170) joint++;
}
assert.equal(end133, 1535);
assert.equal(exact170, 2387);
assert.equal(joint, 47);

// A key-independent obstruction to ANY fixed secret state→doublet-rune table:
// collision states reused in the 86 ordered observations must emit one glyph.
const stateOutputs = new Map();
for (let i = 0; i < observed.repeats.length; i++) {
  const x = observed.repeats[i].state;
  if (!stateOutputs.has(x)) stateOutputs.set(x, []);
  stateOutputs.get(x).push(doublets[i].index);
}
const reusedStates = [...stateOutputs.values()].filter(a => a.length > 1);
const minimumForcedErrors = reusedStates.reduce((n, a) => {
  const counts = new Map();
  for (const glyph of a) counts.set(glyph, (counts.get(glyph) || 0) + 1);
  return n + a.length - Math.max(...counts.values());
}, 0);
assert.equal(stateOutputs.size, 72);
assert.equal(reusedStates.length, 12);
assert.equal(minimumForcedErrors, 14);

const comparison = {};
for (const [name, key] of Object.entries(keys))
  comparison[name] = key.filter((v, i) => v === doublets[i].index).length;
assert.deepEqual(comparison, {state: 3, byte: 2, input: 4});
console.log(JSON.stringify({
  observation: {redRunes: 225, thirteenDotMarks: 31,
    sourceEventCount: 256, terminal: observed.state,
    visitedStates: observed.distinct, repeatedVisits: observed.repeats.length,
    originalDoublets: doublets.length, quoteWords: quoteWords.length,
    quoteRunes: quoteIndices.flat().length},
  shuffle: {seed: "0x30112026", trials, end133, exact170, joint,
    meanDistinct: distinctSum / trials,
    sdDistinct: Math.sqrt(distinctSq / trials - (distinctSum / trials) ** 2),
    jointAddOne: (joint + 1) / (trials + 1)},
  originalRuneAgreement: comparison,
  allSecretStationaryStateOutputGate: {distinctCollisionStates: stateOutputs.size,
    reusedStates: reusedStates.length, minimumForcedErrors},
  nativeQuoteBaseline: baseline,
  proposedWordwiseInverses: candidates, nativePlantRoundtrip: true,
  conclusion: "Post-selected source coincidence; no recovered LP2 plaintext/key."
}, null, 2));
