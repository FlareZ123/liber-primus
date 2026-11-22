"use strict";

/**
 * One frozen, source-motif-selected 5-phase duplicate-relocation hypothesis.
 * Original p0..55 GP rune clock continuous, p7 five-dot quincunx center phase2.
 * At other phases, a repeated prior ciphertext rune is swapped with i+4.
 * Test original phase predictions, page-histogram-preserving synthetic controls,
 * same-line/same-word source lag5 sites and explicit noninjectivity.
 *
 * This is a diagnostic. A lossy postfilter cannot itself decipher unknown pages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @param {string} relative */
const read = relative => fs.readFileSync(path.join(__dirname, "..", relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const parts = read("resources/liber-primus/lp2-transcription.txt")
  .split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const pages = corpus.pages.filter(record => record.page <= 55 && record.indices.length)
  .sort((a, b) => a.page - b.page);

const stream = [];
const pageRanges = [];
const lagFiveSites = [];

for (const source of pages) {
  const start = stream.length;
  const part = parts[source.page >= 51 ? source.page - 1 : source.page];
  const lines = part.split("/").filter(line => /[\u16a0-\u16ff]/u.test(line));
  let local = 0;
  for (const line of lines) {
    const all = [...line].filter(rune => runeIndex.has(rune))
      .map(rune => runeIndex.get(rune));
    const fragments = [...line.matchAll(/[\u16a0-\u16ff]+/gu)]
      .map(match => [...match[0]].map(rune => runeIndex.get(rune)));
    assert.deepEqual(fragments.flat(), all);
    let offset = 0;
    for (const fragment of fragments) {
      for (let i = 5; i < fragment.length; i++) {
        lagFiveSites.push(start + local + offset + i);
      }
      offset += fragment.length;
    }
    local += all.length;
  }
  assert.equal(local, source.indices.length);
  stream.push(...source.indices);
  pageRanges.push({ page: source.page, start, end: stream.length });
}
assert.equal(stream.length, 12956);
assert.equal(lagFiveSites.length, 1645);

/**
 * @param {number[]} symbols
 * @returns {number[]}
 */
function repair(symbols) {
  const modified = symbols.slice();
  for (let i = 1; i + 4 < modified.length; i++) {
    if (i % 5 !== 2 && modified[i] === modified[i - 1]) {
      [modified[i], modified[i + 4]] = [modified[i + 4], modified[i]];
    }
  }
  return modified;
}

/** @param {number[]} symbols */
function events(symbols) {
  let doublets = 0;
  let phase2Doublets = 0;
  let fiveBack = 0;
  let phase1FiveBack = 0;
  for (const page of pageRanges) {
    for (let i = page.start + 1; i < page.end; i++) {
      if (symbols[i] === symbols[i - 1]) {
        doublets++;
        if (i % 5 === 2) phase2Doublets++;
      }
    }
  }
  for (const i of lagFiveSites) {
    if (symbols[i] === symbols[i - 5]) {
      fiveBack++;
      if (i % 5 === 1) phase1FiveBack++;
    }
  }
  return { doublets, phase2Doublets, fiveBack, phase1FiveBack };
}

/** @param {number} seed */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {number[]} original @param {()=>number} random */
function pageShuffle(original, random) {
  const output = original.slice();
  for (const range of pageRanges) {
    for (let i = range.end - 1; i > range.start; i--) {
      const j = range.start + (random() % (i - range.start + 1));
      [output[i], output[j]] = [output[j], output[i]];
    }
  }
  return output;
}

/** @param {number[]} values */
function distribution(values) {
  values.sort((a, b) => a - b);
  return {
    minimum: values[0],
    p025: values[Math.floor(values.length * 0.025)],
    median: values[Math.floor(values.length / 2)],
    p975: values[Math.floor(values.length * 0.975)],
    maximum: values.at(-1),
    mean: values.reduce((sum, value) => sum + value, 0) / values.length,
  };
}

const original = events(stream);
assert.deepEqual(original, {
  doublets: 86,
  phase2Doublets: 16,
  fiveBack: 72,
  phase1FiveBack: 16,
});

/*
 * A concrete six-rune collision proves repair is not injective.
 * In the first active phase1, the first sequence has a doublet and swaps
 * its second glyph with the glyph four positions later. The second input
 * already equals that output and remains untouched.
 */
const x = [3, 3, 4, 5, 6, 7];
const y = [3, 7, 4, 5, 6, 3];
assert.notDeepEqual(x, y);
assert.deepEqual(repair(x), y);
assert.deepEqual(repair(y), y);

/*
 * Use no fitted nuisance parameters. Source histograms and word boundaries
 * remain frozen. The one left-to-right repair operation is identical in all
 * 1000 source-controlled trials.
 */
const random = rng(0x3301a5f0);
const count = 1000;
const properties = ["doublets", "phase2Doublets", "fiveBack", "phase1FiveBack"];
const raw = Object.fromEntries(properties.map(key => [key, []]));
const repaired = Object.fromEntries(properties.map(key => [key, []]));
for (let trial = 0; trial < count; trial++) {
  const shuffled = pageShuffle(stream, random);
  const a = events(shuffled);
  const b = events(repair(shuffled));
  for (const key of properties) {
    raw[key].push(a[key]);
    repaired[key].push(b[key]);
  }
}
const stats = properties.map(property => ({
  property,
  original: original[property],
  shuffled: distribution(raw[property]),
  shuffledThenRepaired: distribution(repaired[property]),
}));
console.log(JSON.stringify({
  status: "Finite source-locked explanatory model; full reversible decryption impossible without an independently supplied sideband",
  original,
  trialCount: count,
  fixedSourceClock: "global GP rune offset0 from p0; middle phase2 exempt, four-position forward move; one pass",
  exactOriginalLag5Sites: lagFiveSites.length,
  stats,
  noninjectiveWitness: { firstInput: x, secondInput: y, sameOutput: y },
  noRecoveredPlaintext: true,
}, null, 2));
