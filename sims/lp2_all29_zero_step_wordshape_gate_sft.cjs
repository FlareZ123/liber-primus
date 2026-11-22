"use strict";

/**
 * Original LP2 all-29 fixed-zero-symbol word-shape test.
 *
 * H_r: on each physical page, at every noninitial rune,
 * C[i] === C[i - 1] if and only if plaintext[i] === r.
 * The unknown decoder/key may otherwise be arbitrary. Original printed
 * GP word boundaries and ordinary English orthography are retained.
 *
 * The reference population is exact solved GP29 text plus original-era
 * Cicada literary registers, sampled as entire words conditioned on each
 * original LP2 word's exact GP length. One physical-page initial per
 * rune-bearing page is unobservable and excluded from every statistic.
 *
 * Run on Node.js 22 from repository root:
 *   node sims/lp2_all29_zero_step_wordshape_gate_sft.cjs
 *
 * No file writes or third-party dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");

/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source = read("resources/liber-primus/lp2-transcription.txt");
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const literaryFiles = [
  "resources/external/2013-book-of-law-I.txt",
  "resources/external/2013-book-of-law-II.txt",
  "resources/external/2013-book-of-law-III.txt",
  "resources/external/cicada2012-blake-marriage-gutenberg45315.txt"
];
assert.deepEqual(solved.runes, corpus.runes);
const { runes, translit } = corpus;
assert.equal(runes.length, 29);
const symbols = new Set(runes);
const originalWords = source.split("%").slice(0, 55).join("")
  .replace(/[\/\s]/g, "").split(/[-.&$§]+/)
  .filter(word => word.length && [...word].every(rune => symbols.has(rune)))
  .map(word => [...word].map(rune => runes.indexOf(rune)));
assert.equal(originalWords.length, 2896);
assert.equal(originalWords.flat().length, 12956);
const pages = corpus.pages.filter(page => page.page <= 55 && page.indices.length);
assert.equal(pages.length, 55);
assert.deepEqual(pages.flatMap(page => page.indices), originalWords.flat());

/** @param {string} raw @returns {number[][]} */
function encodeHistorical(raw) {
  const digraphs = ["ING", "TH", "EO", "NG", "OE", "AE", "IA", "EA"];
  return (raw.toUpperCase().match(/[A-Z]+/g) ?? []).map(sourceWord => {
    const word = sourceWord.replace(/V/g, "U")
      .replace(/[KQ]/g, "C").replace(/Z/g, "S");
    const out = [];
    for (let j = 0; j < word.length;) {
      const token = digraphs.find(t => word.startsWith(t, j));
      if (token) {
        out.push(translit.indexOf(token === "ING" ? "NG" : token));
        j += token.length;
      } else {
        out.push(translit.indexOf(word[j]));
        j++;
      }
    }
    assert(out.every(x => x >= 0));
    return out;
  });
}
const nativeRegex = new RegExp("[" + runes.join("") + "]+", "gu");
const native = solved.sections.flatMap(section =>
  (section.source_text.match(nativeRegex) ?? [])
    .map(word => [...word].map(rune => runes.indexOf(rune))));
const literary = literaryFiles.flatMap(file => encodeHistorical(read(file)));
assert.deepEqual([native.length, native.flat().length, literary.length],
  [740, 2979, 13645]);
const reference = native.concat(literary);
assert.equal(reference.length, 14385);
const pageStarts = new Set();
const pageLengths = [];
let offset = 0;
for (const page of pages) {
  pageStarts.add(offset);
  pageLengths.push(page.indices.length);
  offset += page.indices.length;
}
assert.equal(offset, 12956);
assert.equal(pageStarts.size, 55);

// Exclude all 55 physical-page starts. No ciphertext predecessor exists
// there, even when a typographic word continues across the page cut.
const sizes = Array.from({length: 15}, (_, L) => Array(L).fill(0));
const observed = Array.from({length: 15}, (_, L) => Array(L).fill(0));
const available = Array.from({length: 15}, () => []);
let current = 0;
let previous = null;
let originalZeroEvents = 0;
for (const word of originalWords) {
  const L = word.length;
  const valid = [];
  for (let j = 0; j < L; j++) {
    const observable = !pageStarts.has(current);
    valid.push(observable);
    if (observable) {
      sizes[L][j]++;
      if (word[j] === previous) {
        observed[L][j]++;
        originalZeroEvents++;
      }
    }
    previous = word[j];
    current++;
  }
  available[L].push(valid);
}
assert.equal(current, 12956);
assert.equal(originalZeroEvents, 86);
assert.equal(sizes.flat().reduce((n,x) => n+x, 0), 12901);
assert.deepEqual(available.map(words => words.length),
  Array.from({length: 15}, (_, L) =>
    originalWords.filter(word => word.length === L).length));

// Source word lists by exact printed GP rune length.
const byLength = Array.from({length: 15}, () => []);
for (const word of reference) {
  if (word.length <= 14) byLength[word.length].push(word);
}
assert(byLength.slice(1).every(words => words.length > 0));
const expected = Array.from({length: 29}, () =>
  Array.from({length: 15}, (_, L) => Array(L).fill(0)));
for (let L = 1; L <= 14; L++) {
  for (const word of byLength[L]) {
    for (let j = 0; j < L; j++) expected[word[j]][L][j]++;
  }
}
for (let rune = 0; rune < 29; rune++) {
  for (let L = 1; L <= 14; L++) {
    for (let j = 0; j < L; j++) {
      expected[rune][L][j] =
        (expected[rune][L][j] + 0.5) / (byLength[L].length + 1);
    }
  }
}

/**
 * Twice the Bernoulli log likelihood loss relative to saturated class
 * frequencies, grouped by original (word length, position in word).
 * Word-block bootstrap accounts for strong within-word dependence.
 * @param {number[][]} maskCounts
 * @param {number} marker
 * @returns {number}
 */
function deviance(maskCounts, marker) {
  let result = 0;
  for (let L = 1; L <= 14; L++) {
    for (let j = 0; j < L; j++) {
      const n = sizes[L][j];
      if (n === 0) continue;
      const k = maskCounts[L][j];
      const p = expected[marker][L][j];
      const q = k / n;
      result += 2 * (k ? k * Math.log(q / p) : 0);
      result += 2 * (k === n ? 0 :
        (n - k) * Math.log((1 - q) / (1 - p)));
    }
  }
  return result;
}

/** @param {number} seed @returns {() => number} */
function makeRng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * Deterministically seed 2896 complete source words, preserving actual
 * original source word lengths and order. Verify a true bijective
 * plaintext-dependent zero-step rotor on every synthetic original-shaped
 * page, then verify the resulting word-boundary event mask.
 */
function plantedRotorControl() {
  const next = makeRng(0x11c1ada6);
  const plant = originalWords.map(word => {
    const pool = byLength[word.length];
    return pool[Math.floor(next() * pool.length)];
  });
  const plain = plant.flat();
  assert.equal(plain.length, 12956);
  const marker = 6; // GP G. Any of the 29 GP values would work.
  const cipher = new Array(plain.length);
  const decoded = new Array(plain.length);
  let at = 0;
  for (const L of pageLengths) {
    cipher[at] = plain[at];
    decoded[at] = cipher[at];
    for (let j = 1; j < L; j++) {
      const i = at + j;
      const step = (plain[i] - marker + 29) % 29;
      cipher[i] = (cipher[i - 1] + step) % 29;
      decoded[i] = (cipher[i] - cipher[i - 1] + 29 + marker) % 29;
    }
    at += L;
  }
  assert.deepEqual(decoded, plain);
  const X = Array.from({length: 15}, (_, L) => Array(L).fill(0));
  let site = 0, zeros = 0;
  for (const word of plant) {
    for (let j = 0; j < word.length; j++,site++) {
      if (pageStarts.has(site)) continue;
      const sourceMarker = word[j] === marker;
      const ciphertextZero = cipher[site] === cipher[site - 1];
      assert.equal(sourceMarker, ciphertextZero);
      if (ciphertextZero) {
        X[word.length][j]++;
        zeros++;
      }
    }
  }
  assert.equal(site, plain.length);
  return {marker: translit[marker], nativeRecovered: decoded.length,
    identicalReencrypt: plain.length, zeroEvents: zeros,
    sourceShapedDeviance: deviance(X, marker)};
}

function run() {
  const planted = plantedRotorControl();
  const originalD = Array.from({length: 29},
    (_, marker) => deviance(observed, marker));
  const maximum = Array(29).fill(0);
  const meanSum = Array(29).fill(0);
  const exceed = Array(29).fill(0);
  const B = 2000;
  const random = makeRng(0x33012026);
  for (let b = 0; b < B; b++) {
    const counts = Array.from({length: 29}, () =>
      Array.from({length: 15}, (_, L) => Array(L).fill(0)));
    for (let L = 1; L <= 14; L++) {
      const pool = byLength[L];
      for (const valid of available[L]) {
        const word = pool[Math.floor(random() * pool.length)];
        for (let j = 0; j < L; j++) {
          if (valid[j]) counts[word[j]][L][j]++;
        }
      }
    }
    for (let marker = 0; marker < 29; marker++) {
      const d = deviance(counts[marker], marker);
      maximum[marker] = Math.max(maximum[marker], d);
      meanSum[marker] += d;
      if (d >= originalD[marker]) exceed[marker]++;
    }
  }
  const byMarker = Array.from({length: 29}, (_, marker) => ({
    symbol: translit[marker], index: marker,
    sourceDeviance: Number(originalD[marker].toFixed(3)),
    bootstrapMean: Number((meanSum[marker]/B).toFixed(3)),
    bootstrapMaximum: Number(maximum[marker].toFixed(3)),
    samplesAtLeastAsExtreme: exceed[marker],
    rightTailPlusOne: (exceed[marker]+1)/(B+1)
  })).sort((a,b) => a.sourceDeviance - b.sourceDeviance);
  assert(exceed.every(x => x === 0));
  assert(planted.sourceShapedDeviance < originalD[6]);
  assert.equal(byMarker[0].symbol, "G");
  const output = {
    claim: "Within an exact-GP-length-matched finite Cicada-native English register, all 29 zero-step plaintext marker choices are grossly incompatible with original ciphertext doublet positions. Conditional register exclusion only; no plaintext/key.",
    originals: {runeBearingPages: pages.length, runeCount: 12956,
      originalWords: originalWords.length, observableAdjacentSites: 12901,
      ciphertextZeroSteps: originalZeroEvents},
    references: {nativeSolvedWords: native.length, historicalLiteraryWords: literary.length,
      totalWordSamples: reference.length},
    null: {samples: B, seed: "0x33012026", wholeWordResampling: true,
      matchingExactGpWordLengths: true, pageInitialsAlwaysUnconstrained: true},
    plantedPositive: planted,
    all29BeyondBootstrapMaximum: exceed.every(x => x === 0),
    unionNullWorstCaseMonteCarloUpperTail: Math.max(...exceed.map(x => (x+1)/(B+1))),
    byMarker,
    limits: "Requires one fixed exact zero-step plaintext marker and the historical source's GP spelling, word breaks and word-length-conditioned English distribution. A different register, partial zero implication, evolving marker or ciphertext-based escape may evade it."
  };
  console.log(JSON.stringify(output, null, 2));
  return output;
}
if (require.main === module) run();
module.exports = {run, deviance, plantedRotorControl};
