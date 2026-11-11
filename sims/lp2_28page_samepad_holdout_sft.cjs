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


/**
 * Expanded invariant: if the same page-local pad is reused 28 pages later,
 * but either page also has an arbitrary secret Caesar offset, all possible
 * offset hypotheses merely ROTATE the residue-difference histogram.
 * The maximum bin is therefore a key-independent upper bound on any
 * correctly offset-aligned plaintext equality count.
 * Each physical page pair gets an independent, unrestricted offset (29 or 28
 * candidates); the selected p27/p55 pair is still withheld.
 *
 * @param {number[]} first @param {number[]} second
 * @param {number} modulus @param {number} start
 * @returns {{m:number,n:number}}
 */
function bestUnknownOffset(first, second, modulus, start) {
  const frequencies = Array(modulus).fill(0);
  let n = 0;
  for (let i = start; i < Math.min(first.length, second.length); i++) {
    if (first[i] < 0 || second[i] < 0) continue;
    frequencies[(first[i] - second[i] + modulus) % modulus]++;
    n++;
  }
  return { m: Math.max(...frequencies), n };
}

/**
 * @param {number[][]} sourcePages @param {number} modulus
 * @param {number} start @returns {{m:number,n:number,rate:number}}
 */
function wholeUnknownOffset(sourcePages, modulus, start) {
  let m = 0;
  let n = 0;
  for (let p = 0; p < 27; p++) {
    const count = bestUnknownOffset(sourcePages[p], sourcePages[p + 28], modulus, start);
    m += count.m;
    n += count.n;
  }
  return { m, n, rate: m / n };
}
const unknownOffsetObserved = [
  wholeUnknownOffset(pages, 29, 0),
  wholeUnknownOffset(ranks, 28, 1),
];
assert.deepEqual(
  unknownOffsetObserved.map((v) => [v.m, v.n]),
  [[338, 5587], [343, 5489]],
);

// Matched page reassignment null, with the 29/28-way secret offset refitted
// independently for every page pair in every shuffle.
const offsetMatrices = [
  pages,
  ranks,
].map((sourcePages, mode) => Array.from({ length: 27 }, (_, p) =>
  Array.from({ length: 28 }, (_, q) =>
    bestUnknownOffset(sourcePages[p], sourcePages[q + 28], mode ? 28 : 29, mode ? 1 : 0))));
const offsetControls = [[], []];
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
      const count = offsetMatrices[channel][p][assignment[p]];
      m += count.m;
      n += count.n;
    }
    offsetControls[channel].push(m / n);
  }
}
for (let channel = 0; channel < 2; channel++) {
  const observed = unknownOffsetObserved[channel];
  console.log(JSON.stringify({
    family: channel ? "all-offset GP28 rank" : "all-offset GP29",
    original: observed,
    assignmentNullRange: range(offsetControls[channel]),
    pagePermutationLowerPercentile:
      offsetControls[channel].filter((rate) => rate <= observed.rate).length / 10000,
  }));
}

// Native GP controls are aligned to the EXACT same 26 available page-pair
// lengths, but each original control draws independent text windows for each
// pair. Maximize the residue histogram anew for every individual pair.
for (const src of sourcePaths) {
  const native = toGp(fs.readFileSync(path.join(root, src), "utf8"));
  for (const reduced of [false, true]) {
    const modulus = reduced ? 28 : 29;
    const source = reduced ? native.filter((x) => x !== 0).map((x) => x - 1) : native;
    const ratios = [];
    for (let t = 0; t < 300; t++) {
      let m = 0;
      let n = 0;
      for (let p = 0; p < 27; p++) {
        const length = Math.min(pages[p].length, pages[p + 28].length);
        if (!length) continue;
        const a = randomBelow(source.length - length);
        const b = randomBelow(source.length - length);
        const result = bestUnknownOffset(
          source.slice(a, a + length),
          source.slice(b, b + length),
          modulus,
          reduced ? 1 : 0,
        );
        m += result.m;
        n += result.n;
      }
      ratios.push(m / n);
    }
    const observed = unknownOffsetObserved[Number(reduced)];
    console.log(JSON.stringify({
      source: path.basename(src),
      family: reduced ? "all-offset GP28 rank" : "all-offset GP29",
      nativeRange: range(ratios),
      nativeAtOrBelowOriginal: ratios.filter((v) => v <= observed.rate).length,
      repetitions: 300,
    }));
    assert(ratios.every((v) => v > observed.rate),
      "Native all-offset control unexpectedly overlaps original; inspect frozen analysis");
  }
}

// Positive mathematical invariant for completely hidden per-page offsets.
// Equality of differences is unaffected by an unknown additive constant.
for (const reduced of [false, true]) {
  const modulus = reduced ? 28 : 29;
  const source = reduced ? native.filter((x) => x !== 0).map((x) => x - 1) : native;
  const a = source.slice(500, 750);
  const b = source.slice(1000, 1250);
  const pad = Array.from({ length: 250 }, () => randomBelow(modulus));
  const offsetA = randomBelow(modulus);
  const offsetB = randomBelow(modulus);
  const rankA = a.map((v, i) => (v + pad[i] + offsetA) % modulus);
  const rankB = b.map((v, i) => (v + pad[i] + offsetB) % modulus);
  const actualA = reduced
    ? rankA.map((v, i) => i === 0 ? 13 : v + Number(v >= (i === 1 ? 13 : 0)))
    : rankA;
  if (reduced) {
    // Correctly construct each predecessor-exclusion ciphertext recursively.
    actualA[0] = 13;
    for (let i = 1; i < rankA.length; i++) {
      actualA[i] = rankA[i] + Number(rankA[i] >= actualA[i - 1]);
    }
  }
  const recoveredA = reduced ? rank28(actualA) : actualA;
  if (reduced) {
    for (let i = 1; i < 250; i++) assert.equal(recoveredA[i], rankA[i]);
  }
  for (let i = reduced ? 1 : 0; i < 250; i++) {
    assert.equal(
      (rankA[i] - rankB[i] + modulus) % modulus,
      (a[i] - b[i] + offsetA - offsetB + 2 * modulus) % modulus,
    );
  }
}


/**
 * More permissive affine-key architecture, now giving EACH page an independent
 * secret invertible multiplier as well as a free shift, while retaining a
 * common page-local pad: C[p,i]=a[p]*(P[p,i]+K[i])+b[p] (mod m).
 * Relative multiplication u=a[p]/a[p+28] cancels the unknown common pad.
 * No discrete-language threshold is assumed. Compare observed all-secret
 * maxima to matched original page-reassignment and native text controls.
 *
 * @param {number[]} a @param {number[]} b
 * @param {number} mod @param {number} start
 * @returns {{m:number,n:number}}
 */
function bestAffine(a, b, mod, start) {
  let peak = 0;
  let sampleSize = 0;
  for (let scale = 1; scale < mod; scale++) {
    if (mod === 28 && (scale % 2 === 0 || scale % 7 === 0)) continue;
    const differences = Array(mod).fill(0);
    let n = 0;
    for (let i = start; i < Math.min(a.length, b.length); i++) {
      if (a[i] < 0 || b[i] < 0) continue;
      differences[(a[i] - (scale * b[i]) % mod + mod) % mod]++;
      n++;
    }
    const frequency = Math.max(...differences);
    if (frequency > peak) {
      peak = frequency;
      sampleSize = n;
    }
  }
  return { m: peak, n: sampleSize };
}
const affineArrays = [pages, ranks];
const affineMatrices = affineArrays.map((source, mode) =>
  Array.from({ length: 27 }, (_, p) => Array.from({ length: 28 }, (_, q) =>
    bestAffine(source[p], source[q + 28], mode ? 28 : 29, mode ? 1 : 0))));
const affineObserved = affineMatrices.map((matrix) => {
  let m = 0;
  let n = 0;
  for (let p = 0; p < 27; p++) {
    m += matrix[p][p].m;
    n += matrix[p][p].n;
  }
  return { m, n, rate: m / n };
});
assert.deepEqual(affineObserved.map((v) => [v.m, v.n]),
  [[453, 5587], [427, 5489]]);

// 10,000 original-cipher matched page reassignments, fitting scale AND shift
// for every candidate pair. Retain the page/word/letter corpus unchanged.
const affineAssignments = [[], []];
for (let t = 0; t < 10000; t++) {
  const second = Array.from({ length: 28 }, (_, i) => i);
  for (let i = 27; i > 0; i--) {
    const j = randomBelow(i + 1);
    [second[i], second[j]] = [second[j], second[i]];
  }
  for (let mode = 0; mode < 2; mode++) {
    let m = 0;
    let n = 0;
    for (let p = 0; p < 27; p++) {
      const result = affineMatrices[mode][p][second[p]];
      m += result.m;
      n += result.n;
    }
    affineAssignments[mode].push(m / n);
  }
}
for (let mode = 0; mode < 2; mode++) {
  const observed = affineObserved[mode];
  console.log(JSON.stringify({
    family: mode ? "fully affine GP28 rank" : "fully affine GP29",
    original: observed,
    assignmentNullRange: range(affineAssignments[mode]),
    pagePermutationLowerPercentile:
      affineAssignments[mode].filter((rate) => rate <= observed.rate).length / 10000,
  }));
}

// The 28-way/12-way hidden-scale family is much more permissive than page
// Caesar. Preserve exact overlap counts and do not claim an exclusion when
// the most generous GP29 controls occasionally overlap the ciphertext.
for (const src of sourcePaths) {
  const gp = toGp(fs.readFileSync(path.join(root, src), "utf8"));
  for (const reduced of [false, true]) {
    const mod = reduced ? 28 : 29;
    const source = reduced ? gp.filter((x) => x !== 0).map((x) => x - 1) : gp;
    const controls = [];
    for (let t = 0; t < 150; t++) {
      let m = 0;
      let n = 0;
      for (let p = 0; p < 27; p++) {
        const length = Math.min(pages[p].length, pages[p + 28].length);
        if (!length) continue;
        const a = randomBelow(source.length - length);
        const b = randomBelow(source.length - length);
        const result = bestAffine(
          source.slice(a, a + length), source.slice(b, b + length), mod,
          reduced ? 1 : 0,
        );
        m += result.m;
        n += result.n;
      }
      controls.push(m / n);
    }
    const original = affineObserved[Number(reduced)];
    console.log(JSON.stringify({
      source: path.basename(src),
      family: reduced ? "fully affine GP28 rank" : "fully affine GP29",
      nativeRange: range(controls),
      nativeAtOrBelowOriginal: controls.filter((v) => v <= original.rate).length,
      repetitions: controls.length,
    }));
  }
}

// Exact algebraic positive plants for the hidden-scale / hidden-offset
// necessary condition. The genuine encrypted relative differences must be
// a hidden scaled and shifted version of the plaintext differences.
for (const reduced of [false, true]) {
  const mod = reduced ? 28 : 29;
  const plain = reduced
    ? native.filter((x) => x !== 0).map((x) => x - 1) : native;
  const x = plain.slice(1000, 1300), y = plain.slice(2000, 2300);
  const key = Array.from({ length: 300 }, () => randomBelow(mod));
  const unitA = reduced ? 5 : 7, unitB = reduced ? 9 : 11;
  const offsetA = 13, offsetB = 17;
  const encryptedX = x.map((v, i) => (unitA * (v + key[i]) + offsetA) % mod);
  const encryptedY = y.map((v, i) => (unitB * (v + key[i]) + offsetB) % mod);
  let invB = 0;
  for (let u = 1; u < mod; u++) if ((unitB * u) % mod === 1) invB = u;
  assert(invB > 0);
  const relative = (unitA * invB) % mod;
  const shift = (offsetA - relative * offsetB + mod * mod) % mod;
  for (let i = 0; i < 300; i++) {
    assert.equal(
      (encryptedX[i] - relative * encryptedY[i] + mod * mod) % mod,
      (unitA * (x[i] - y[i]) + shift + mod * mod) % mod,
    );
  }
}
