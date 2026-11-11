/**
 * Original-cipher 28-page reused-keystream equality test.
 * Run: node sims/lp2_28page_samepad_holdout_sft.cjs
 * No dependencies or file writes. All pseudo-random controls use a fixed seed.
 * Requires the repository resources/ directory relative to sims/.
 */
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const json = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const corpus = json("resources/liber-primus/lp2-corpus.json");
const pages = corpus.pages.map((p) => p.indices);
const sourcePaths = [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt",
];
assert.equal(pages.length, 58);
assert.equal(pages[50].length, 0);
assert.equal(pages.slice(0, 56).reduce((n, p) => n + p.length, 0), 12956);

/** @type {Map<string, number>} */
const alphabet = new Map(corpus.translit.map((letter, i) => [letter, i]));
/** @param {string} text @returns {number[]} */
function toGp(text) {
  const normalized = text.toUpperCase().replace(/K/g, "C").replace(/Q/g, "C")
    .replace(/V/g, "U").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const pair = normalized.slice(i, i + 2);
    if (alphabet.has(pair)) {
      out.push(alphabet.get(pair));
      i += 2;
    } else if (alphabet.has(normalized[i])) {
      out.push(alphabet.get(normalized[i]));
      i++;
    } else {
      i++;
    }
  }
  return out;
}

/** @type {number} */
let state = 0x1828367;
/** @returns {number} An unsigned 32-bit integer. */
function nextUint() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
/** @param {number} max @returns {number} */
function randomBelow(max) {
  return nextUint() % max;
}

/**
 * Reversible GP28 predecessor-exclusion inverse; -1 marks first or repeat.
 * @param {number[]} page @returns {number[]}
 */
function rank28(page) {
  return page.map((symbol, i) => i === 0 || symbol === page[i - 1]
    ? -1 : symbol - Number(symbol > page[i - 1]));
}
const ranks = pages.map(rank28);
/**
 * Equality count in native GP29 or predecessor-exclusion GP28.
 * @param {number} first @param {number} second @param {boolean} reduced
 * @returns {{m:number,n:number}}
 */
function compare(first, second, reduced) {
  const a = reduced ? ranks[first] : pages[first];
  const b = reduced ? ranks[second] : pages[second];
  let m = 0;
  let n = 0;
  for (let i = reduced ? 1 : 0; i < Math.min(a.length, b.length); i++) {
    if (reduced && (a[i] < 0 || b[i] < 0)) continue;
    n++;
    m += Number(a[i] === b[i]);
  }
  return { m, n };
}
/** @param {boolean} reduced @returns {{m:number,n:number,rate:number}} */
function original(reduced) {
  let m = 0;
  let n = 0;
  // Hold out the p27/p55 repeated-word pair which motivated the 28-page idea.
  for (let p = 0; p < 27; p++) {
    const part = compare(p, p + 28, reduced);
    m += part.m;
    n += part.n;
  }
  return { m, n, rate: m / n };
}
const obs29 = original(false);
const obs28 = original(true);
assert.deepEqual([obs29.m, obs29.n, obs28.m, obs28.n], [194, 5587, 200, 5489]);

/** @param {number[]} items @returns {[number,number,number]} */
function range(items) {
  const sorted = items.slice().sort((a, b) => a - b);
  return [sorted[0], sorted[Math.floor(sorted.length / 2)], sorted[sorted.length - 1]];
}

// Empirical null: shuffle which second-half physical page accompanies each
// first-half page, preserving all original letters, within-page order and lengths.
const crossMatrices = [false, true].map((reduced) =>
  Array.from({ length: 27 }, (_, p) =>
    Array.from({ length: 28 }, (_, q) => compare(p, q + 28, reduced))));
/** @type {number[][]} */
const nullRates = [[], []];
for (let t = 0; t < 10000; t++) {
  const assignment = Array.from({ length: 28 }, (_, i) => i);
  for (let i = 27; i > 0; i--) {
    const j = randomBelow(i + 1);
    [assignment[i], assignment[j]] = [assignment[j], assignment[i]];
  }
  for (let channel = 0; channel < 2; channel++) {
    let m = 0;
    let n = 0;
    for (let p = 0; p < 27; p++) {
      const count = crossMatrices[channel][p][assignment[p]];
      m += count.m;
      n += count.n;
    }
    nullRates[channel].push(m / n);
  }
}
const observed = [obs29, obs28];
for (let channel = 0; channel < 2; channel++) {
  const model = channel ? "GP28 predecessor rank" : "GP29 direct";
  const x = observed[channel];
  const empiricalPercentile = nullRates[channel].filter((v) => v <= x.rate).length / 10000;
  console.log(JSON.stringify({ model, original: x, matchedPageNullRange: range(nullRates[channel]), empiricalPercentile }));
}

/**
 * Generate source-native controls from untouched portions of published texts.
 * Independent random windows use the original page lengths as their fixed shape.
 * For reduced controls, F/GP0 is removed before window sampling, modelling a
 * 28-symbol plaintext register. The choice is a conditional alphabet model.
 * @param {number[]} gp @param {boolean} reduced @returns {number[]}
 */
function nativeControls(gp, reduced) {
  const source = reduced ? gp.filter((x) => x !== 0).map((x) => x - 1) : gp;
  const ratios = [];
  for (let t = 0; t < 300; t++) {
    let m = 0;
    let n = 0;
    for (let p = 0; p < 27; p++) {
      const length = Math.min(pages[p].length, pages[p + 28].length);
      if (length === 0) continue;
      const a = randomBelow(source.length - length);
      const b = randomBelow(source.length - length);
      for (let i = reduced ? 1 : 0; i < length; i++) {
        m += Number(source[a + i] === source[b + i]);
        n++;
      }
    }
    ratios.push(m / n);
  }
  return ratios;
}
for (const src of sourcePaths) {
  const gp = toGp(fs.readFileSync(path.join(root, src), "utf8"));
  for (const reduced of [false, true]) {
    const vals = nativeControls(gp, reduced);
    const observedRate = reduced ? obs28.rate : obs29.rate;
    console.log(JSON.stringify({
      source: path.basename(src),
      model: reduced ? "GP28/F-skip" : "GP29",
      sourceRunes: gp.length,
      nativeRange: range(vals),
      nativeAtOrBelowOriginal: vals.filter((x) => x <= observedRate).length,
      repetitions: vals.length,
    }));
    assert(vals.every((x) => x > observedRate), "Native control unexpectedly overlaps ciphertext; inspect the exact run");
  }
}

// Mathematically exact planted-key test, separate from language evidence.
// A shared page-local pad preserves plaintext equality at corresponding offsets.
const native = toGp(fs.readFileSync(path.join(root, sourcePaths[0]), "utf8"));
/**
 * @param {number[]} text @param {number[]} pad @param {number} iv
 * @returns {number[]}
 */
function encryptGp28(text, pad, iv) {
  const cipher = [iv];
  for (let i = 1; i < text.length; i++) {
    const rank = (text[i] + pad[i]) % 28;
    cipher.push(rank + Number(rank >= cipher[i - 1]));
  }
  return cipher;
}
for (let reduced of [false, true]) {
  const source = reduced ? native.filter((x) => x !== 0).map((x) => x - 1) : native;
  const a = source.slice(100, 600);
  const b = source.slice(1500, 2000);
  const pad = Array.from({ length: 500 }, () => randomBelow(reduced ? 28 : 29));
  if (reduced) {
    const ea = encryptGp28(a, pad, 13), eb = encryptGp28(b, pad, 24);
    const ra = rank28(ea), rb = rank28(eb);
    for (let i = 1; i < 500; i++) {
      assert.equal(ra[i] === rb[i], a[i] === b[i]);
      assert.equal(ra[i], (a[i] + pad[i]) % 28);
      assert.equal(rb[i], (b[i] + pad[i]) % 28);
    }
  } else {
    const ea = a.map((v, i) => (v + pad[i]) % 29);
    const eb = b.map((v, i) => (v + pad[i]) % 29);
    for (let i = 0; i < 500; i++) assert.equal(ea[i] === eb[i], a[i] === b[i]);
  }
}
const p57 = pages[57];
const freq = Array(29).fill(0);
for (const glyph of p57) freq[glyph]++;
const p57DirectCollision = freq.reduce((sum, n) => sum + n * (n - 1), 0) / (p57.length * (p57.length - 1));
console.log(JSON.stringify({ nativeSolvedP57Runes: p57.length, p57DirectCollision, verdict: "No 28-page shared page-local keystream signal under the specified direct-GP29 and predecessor-exclusion GP28 models; no unknown plaintext." }));
