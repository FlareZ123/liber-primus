"use strict";
/**
 * Original LP2: a key-independent period-2 Bifid/Polybius 5x5 GP25
 * exclusion with four arbitrary transparent GP runes, all 23,751 choices.
 *
 * For each source-defined clock, a plaintext GP-E core value can be
 * generated from at most two 5x5 ordered pair rectangles per core pair.
 * Relax each rectangle to the 25 most frequent observed ordered pairs.
 * Add only the largest same-glyph count among any trailing singleton.
 * This dominates every possible secret 25! keyed square.
 *
 * Run on Node.js 22 from the repo root:
 * node sims/lp2_bifid25_allsecret_period2_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(
  root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const originalPages = corpus.pages.filter((p) => p.page < 56 && p.indices.length);
const all = originalPages.flatMap((p) => p.indices);
assert.equal(all.length, 12956);
assert.equal(originalPages.length, 55);
const runeMap = new Map(corpus.runes.map((x, i) => [x, i]));
const transcript = fs.readFileSync(
  path.join(root, "resources/lp2-transcription.txt"), "utf8");
const unsolved = transcript.split("%").slice(0, 55).join("%");
const toRunes = (s) => [...s].filter((ch) => runeMap.has(ch))
  .map((ch) => runeMap.get(ch));
const sections = unsolved.split("$").map(toRunes).filter((s) => s.length);
const words = parseSharedCorpus().words.map((w) => toRunes(w.runes));
assert.deepEqual(sections.map((v) => v.length),
  [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316]);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), all);
assert.deepEqual(sections.flat(), all);
const clocks = {
  book: [all],
  pages: originalPages.map((p) => p.indices),
  sections,
  words,
};
/** @param {number[]} t @returns {number} */
const bitmask = (t) => t.reduce((a, x) => a | (1 << x), 0);
/**
 * Relax each 5x5 pair rectangle to the 25 largest pair matrix cells.
 * For an unpaired core rune, period-one Bifid copies it unchanged.
 * @param {number[][]} segments
 * @param {number} removedMask
 * @returns {{bound:number,pairTop25:number,maxTail:number,pairs:number}}
 */
function capacity(segments, removedMask) {
  const histogram = new Int32Array(29 * 29);
  const tails = new Int32Array(29);
  let pairs = 0;
  for (const segment of segments) {
    let previous = -1;
    for (const glyph of segment) {
      if (removedMask & (1 << glyph)) continue;
      if (previous < 0) previous = glyph;
      else {
        histogram[previous * 29 + glyph]++;
        previous = -1;
        pairs++;
      }
    }
    if (previous >= 0) tails[previous]++;
  }
  const maxCell = Math.max(...histogram);
  const cellFrequencies = new Int32Array(maxCell + 1);
  for (const count of histogram) cellFrequencies[count]++;
  let toSelect = 25;
  let pairTop25 = 0;
  for (let x = maxCell; x >= 0 && toSelect; x--) {
    const n = Math.min(toSelect, cellFrequencies[x]);
    toSelect -= n;
    pairTop25 += n * x;
  }
  assert.equal(toSelect, 0);
  return {bound: 2 * pairTop25 + Math.max(...tails),
    pairTop25, maxTail: Math.max(...tails), pairs};
}
/** @param {number[][]} segments @returns {object} */
function exhaustive(segments) {
  let maximum = 0;
  let minimum = Infinity;
  let achievingMask = null;
  let choices = 0;
  for (let a = 0; a < 26; a++)
    for (let b = a + 1; b < 27; b++)
      for (let d = b + 1; d < 28; d++)
        for (let e = d + 1; e < 29; e++) {
          const result = capacity(segments, bitmask([a, b, d, e]));
          if (result.bound > maximum) {
            maximum = result.bound;
            achievingMask = [a, b, d, e];
          }
          minimum = Math.min(minimum, result.bound);
          choices++;
        }
  assert.equal(choices, 23751);
  return {segments: segments.length, choices, maximum,
    minimum, achievingMask};
}
/**
 * Greedy canonical GP English transcriber for the pinned Shakespeare text.
 * All seven digraphs are honored. Historic non-GP letters K,Q,V,Z are
 * normalized before parsing; QU -> CW.
 * @param {string} raw
 * @returns {number[]}
 */
function gpEnglish(raw) {
  const s = raw.toUpperCase().replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C").replace(/V/g, "U").replace(/Z/g, "S");
  const indexed = new Map(corpus.translit.map((x, i) => [x, i]));
  const digraphs = new Set(["TH", "NG", "EO", "OE", "AE", "IA", "EA"]);
  const out = [];
  for (let i = 0; i < s.length; i++) {
    if (s.charCodeAt(i) < 65 || s.charCodeAt(i) > 90) continue;
    const pair = s.slice(i, i + 2);
    if (digraphs.has(pair)) {
      out.push(indexed.get(pair));
      i++;
    } else {
      const v = indexed.get(s[i]);
      assert.notEqual(v, undefined);
      out.push(v);
    }
  }
  return out;
}
/** @param {number[]} input @param {number} mask */
function encrypt2(input, mask) {
  const out = [];
  let pending = -1;
  let pendingIndex = -1;
  for (const value of input) {
    if (mask & (1 << value)) {
      out.push(value);
    } else if (pending < 0) {
      pending = value;
      pendingIndex = out.length;
      out.push(-1);
    } else {
      out[pendingIndex] = 5 * Math.floor(pending / 5) + Math.floor(value / 5);
      out.push(5 * (pending % 5) + value % 5);
      pending = -1;
    }
  }
  if (pending >= 0) out[pendingIndex] = pending;
  assert.ok(out.every((v) => v >= 0 && v < 29));
  return out;
}
/** @param {number[]} input @param {number} mask */
function decrypt2(input, mask) {
  const out = [];
  let pending = -1;
  let pendingIndex = -1;
  for (const value of input) {
    if (mask & (1 << value)) {
      out.push(value);
    } else if (pending < 0) {
      pending = value;
      pendingIndex = out.length;
      out.push(-1);
    } else {
      out[pendingIndex] = 5 * Math.floor(pending / 5) + Math.floor(value / 5);
      out.push(5 * (pending % 5) + value % 5);
      pending = -1;
    }
  }
  if (pending >= 0) out[pendingIndex] = pending;
  assert.ok(out.every((v) => v >= 0 && v < 29));
  return out;
}
/**
 * General standard Bifid fractionation on one reset-segment length.
 * The source pair used for each output is determined exactly by
 * interleaving ciphertext coordinates, for any block period >=2.
 * Each of the four row/column input-parity classes has one unknown
 * 5x5 rectangle; sum its 25 largest ordered-pair counts as a bound.
 * @param {number[][]} segments
 * @param {number} removedMask
 * @param {number} period
 */
function generalCapacity(segments, removedMask, period) {
  const h = new Int32Array(4 * 841);
  const tails = new Int32Array(29);
  const block = new Int8Array(period);
  function finish(size) {
    if (size === 1) {
      tails[block[0]]++;
      return;
    }
    for (let i = 0; i < size; i++) {
      const left = i;
      const right = size + i;
      const kind = ((left & 1) << 1) | (right & 1);
      const x = block[left >>> 1];
      const y = block[right >>> 1];
      h[kind * 841 + x * 29 + y]++;
    }
  }
  for (const source of segments) {
    let n = 0;
    for (const v of source) {
      if (removedMask & (1 << v)) continue;
      block[n++] = v;
      if (n === period) {
        finish(n);
        n = 0;
      }
    }
    if (n) finish(n);
  }
  let bound = Math.max(...tails);
  for (let kind = 0; kind < 4; kind++) {
    const base = kind * 841;
    let maxCell = 0;
    for (let j = 0; j < 841; j++) maxCell = Math.max(maxCell, h[base + j]);
    const freq = new Int32Array(maxCell + 1);
    for (let j = 0; j < 841; j++) freq[h[base + j]]++;
    let take = 25;
    for (let cell = maxCell; cell >= 0 && take; cell--) {
      const n = Math.min(take, freq[cell]);
      bound += cell * n;
      take -= n;
    }
    assert.equal(take, 0);
  }
  return bound;
}
/** @param {number[][]} segments @param {number} period */
function generalExhaustive(segments, period) {
  let maximum = -1;
  let minimum = Infinity;
  let maximizingMask = null;
  let choices = 0;
  for (let a = 0; a < 26; a++)
    for (let b = a + 1; b < 27; b++)
      for (let d = b + 1; d < 28; d++)
        for (let e = d + 1; e < 29; e++) {
          const bound = generalCapacity(segments, bitmask([a, b, d, e]), period);
          if (bound > maximum) {
            maximum = bound;
            maximizingMask = [a, b, d, e];
          }
          minimum = Math.min(minimum, bound);
          choices++;
        }
  assert.equal(choices, 23751);
  return {period, segments: segments.length, choices,
    maximum, minimum, maximizingMask};
}
/**
 * Source-positive generic Bifid with the identity 5x5 row-major secret key.
 * Preserves bypass positions and restarts its core clock for each segment.
 * @param {number[]} input
 * @param {number} mask
 * @param {number} period
 * @param {boolean} inverse
 */
function bifidPeriod(input, mask, period, inverse) {
  const out = [];
  let block = [];
  let positions = [];
  function emit() {
    const n = block.length;
    if (!n) return;
    const coords = [];
    if (inverse) {
      for (const v of block) coords.push(Math.floor(v / 5), v % 5);
      for (let i = 0; i < n; i++)
        out[positions[i]] = 5 * coords[i] + coords[n + i];
    } else {
      for (const v of block) coords.push(Math.floor(v / 5));
      for (const v of block) coords.push(v % 5);
      for (let i = 0; i < n; i++)
        out[positions[i]] = 5 * coords[2 * i] + coords[2 * i + 1];
    }
    block = [];
    positions = [];
  }
  for (const v of input) {
    if (mask & (1 << v)) out.push(v);
    else {
      positions.push(out.length);
      block.push(v);
      out.push(-1);
      if (block.length === period) emit();
    }
  }
  emit();
  assert.ok(out.every((v) => Number.isInteger(v) && v >= 0 && v < 29));
  return out;
}

const controls = fs.readFileSync(path.join(
  root, "resources/control/shakespeare_first300k.txt"), "utf8");
const english = gpEnglish(controls);
const N = all.length;
assert.ok(english.length > N);
let ec = english.slice(0, N).filter((v) => v === 18).length;
let minimumE = ec;
for (let i = N; i < english.length; i++) {
  ec += (english[i] === 18) - (english[i - N] === 18);
  minimumE = Math.min(minimumE, ec);
}
assert.equal(english.length, 218800);
assert.equal(minimumE, 1397);
const source = english.slice(0, N);
assert.equal(source.filter((v) => v === 18).length, 1517);
const plantMask = bitmask([25, 26, 27, 28]);
const plant = encrypt2(source, plantMask);
assert.deepEqual(decrypt2(plant, plantMask), source);
const plantCapacity = capacity([plant], plantMask);
assert.ok(plantCapacity.bound >= 1517);
const original = {};
for (const [label, segments] of Object.entries(clocks)) {
  original[label] = exhaustive(segments);
  assert.ok(original[label].maximum < minimumE);
}
assert.deepEqual(Object.values(original).map((v) => v.maximum),
  [891, 885, 889, 865]);
const periodFive = generalExhaustive([all], 5);
assert.equal(periodFive.maximum, 848);
assert.equal(periodFive.minimum, 744);
assert.deepEqual(periodFive.maximizingMask, [3, 15, 19, 23]);
const plant5 = bifidPeriod(source, plantMask, 5, false);
assert.deepEqual(bifidPeriod(plant5, plantMask, 5, true), source);
const plant5Bound = generalCapacity([plant5], plantMask, 5);
assert.ok(plant5Bound >= 1517);
console.log(JSON.stringify({
  source: "LP2 original 55 rune pages; 29 GP glyphs",
  originalRunes: N,
  originalCipherMaxGlyph: Math.max(...Array.from({length:29}, (_, i) =>
    all.filter((v) => v === i).length)),
  englishControl: {
    GPsymbols: english.length,
    minimumBareEInAll12956Windows: minimumE,
    plantedBareE: 1517,
    plantExactRoundtrip: true,
    plantedKeyCapacity: plantCapacity.bound,
    periodFivePlantCapacity: plant5Bound,
  },
  original,
  periodFive,
  decision: "All 25! secret squares and all four-transparent selections, for the listed period-2 reset clocks, have GP-E frequency capacity below source English.",
}, null, 2));
