"use strict";

/**
 * Key-independent gate for cumulative GP29 ciphers whose difference alphabet
 * may change at every source-visible page and every relative word position.
 *
 * Proposed model (within each printed word):
 *   C[w,0] = g_page(P[w,0])
 *   C[w,j] - C[w,j-1] = h_page,j(P[w,j]) mod 29, j >= 1
 *
 * Every g and h is an otherwise arbitrary SECRET permutation of GP29.
 * In particular, h_page,1 is completely unknown and can differ on all
 * 55 rune-bearing pages. Only PAGE-stratified counts are invariant under
 * independently chosen page alphabets; pooling across pages is invalid. Its existence preserves the SORTED frequency
 * distribution of the second plaintext rune in each page's printed words.
 *
 * Source-native English controls use the established LP1 ING/IO orthography.
 * All comparisons are conditional on the original printed word lengths and
 * on three finite source-native English corpora, not a proof for all languages.
 *
 * Node.js 22 CommonJS SFT, without network, dependencies, or filesystem writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8")
  .replace(/\r\n/g, "\n");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const glyphToIndex = new Map(gp.runes.map((glyph, i) => [glyph, i]));
const runeRx = new RegExp("[" + gp.runes.join("") + "]+", "gu");
const unsolved = transcription.split("%").slice(0, 55).join("%")
  .replace(/\/\n/g, "").replace(/[\r\n%]/g, "");
const words = (unsolved.match(runeRx) || []).map(word =>
  Array.from(word, glyph => {
    assert(glyphToIndex.has(glyph));
    return glyphToIndex.get(glyph);
  }));

assert.equal(words.length, 2896);
const flat = words.flat();
assert.equal(flat.length, 12956);
const originalPages = gp.pages.filter(page => page.page <= 55);
const allOriginal = originalPages.flatMap(page => page.indices);
assert.deepEqual(flat, allOriginal);

const pageOf = new Uint8Array(flat.length);
let off = 0;
for (const page of originalPages) {
  pageOf.fill(page.page, off, off + page.indices.length);
  off += page.indices.length;
}
assert.equal(off, flat.length);

const chapterEnds = [729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956];
const chapterOf = new Uint8Array(flat.length);
off = 0;
for (let i = 0; i < chapterEnds.length; i++) {
  chapterOf.fill(i, off, chapterEnds[i]);
  off = chapterEnds[i];
}
assert.equal(off, flat.length);

const mod = x => ((x % 29) + 29) % 29;

/** @typedef {{length:number, delta:number, page:number|null, chapter:number|null}} Record */

/** @param {number[][]} sourceWords @returns {Record[]} */
function buildRecords(sourceWords) {
  const result = [];
  let offset = 0;
  for (const word of sourceWords) {
    if (word.length > 1) {
      result.push({
        length: word.length,
        delta: mod(word[1] - word[0]),
        page: pageOf[offset] === pageOf[offset + 1] ? pageOf[offset] : null,
        chapter: chapterOf[offset] === chapterOf[offset + 1]
          ? chapterOf[offset] : null
      });
    }
    offset += word.length;
  }
  assert.equal(offset, 12956);
  return result;
}

const records = buildRecords(words);
assert.equal(records.length, 2813);
const pageCrossings = records.filter(record => record.page === null).length;
const chapterCrossings = records.filter(record => record.chapter === null).length;

/** @param {Record[]} data */
function stratify(data) {
  const pages = Array.from({length: 56}, () => []);
  const chapters = Array.from({length: 9}, () => []);
  for (const record of data) {
    if (record.page !== null) pages[record.page].push(record);
    if (record.chapter !== null) chapters[record.chapter].push(record);
  }
  return {
    book: [data],
    chapter: chapters,
    page: pages
  };
}

/** @param {string} source */
function nativeWords(source) {
  return (source.toUpperCase().match(/[A-Z]+/g) || [])
    .map(word => encodeSourceNativeGP(word));
}

/** @param {number[][]} sourceWords */
function byLength(sourceWords) {
  const pools = new Map();
  for (const word of sourceWords) {
    if (!pools.has(word.length)) pools.set(word.length, []);
    pools.get(word.length).push(word);
  }
  for (const word of words) {
    assert(pools.get(word.length)?.length,
      "source-native corpus lacks original GP word length " + word.length);
  }
  return pools;
}

/** @param {number[]} a @param {number[]} b */
function sortedTV(a, b) {
  const x = a.slice().sort((p, q) => q - p);
  const y = b.slice().sort((p, q) => q - p);
  const nx = x.reduce((p, q) => p + q, 0);
  const ny = y.reduce((p, q) => p + q, 0);
  assert(nx > 0 && ny > 0);
  return x.reduce((sum, v, i) => sum + Math.abs(v / nx - y[i] / ny), 0) / 2;
}

/** @param {Record[]} group @param {Map<number,number[][]>} pools */
function expectedSecondRunes(group, pools) {
  const counts = new Map();
  for (const record of group) {
    counts.set(record.length, (counts.get(record.length) || 0) + 1);
  }
  const expected = new Array(29).fill(0);
  for (const [length, n] of counts) {
    const pool = pools.get(length);
    assert(pool?.length);
    const count = new Array(29).fill(0);
    for (const word of pool) count[word[1]]++;
    for (let i = 0; i < 29; i++) expected[i] += n * count[i] / pool.length;
  }
  return expected;
}

/** @param {Record[]} group */
function observedDeltas(group) {
  const hist = new Array(29).fill(0);
  for (const record of group) hist[record.delta]++;
  return hist;
}

/** @param {Record[][]} groups @param {Map<number,number[][]>} pools */
function panel(groups, pools) {
  const n = groups.reduce((sum, g) => sum + g.length, 0);
  const expectations = groups.map(g => g.length
    ? expectedSecondRunes(g, pools) : null);
  const original = groups.reduce((sum, g, i) => sum + (g.length
    ? (g.length / n) * sortedTV(observedDeltas(g), expectations[i]) : 0), 0);
  return {n, groups, expectations, original};
}

/** @param {number} initial */
function xorshift32(initial) {
  let state = initial >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/** @param {ReturnType<typeof panel>} p @param {Map<number,number[][]>} pools @param {()=>number} random */
function sampledScore(p, pools, random) {
  let total = 0;
  for (let i = 0; i < p.groups.length; i++) {
    const group = p.groups[i];
    if (!group.length) continue;
    const hist = new Array(29).fill(0);
    for (const record of group) {
      const options = pools.get(record.length);
      const word = options[Math.floor(random() * options.length)];
      hist[word[1]]++;
    }
    total += group.length / p.n * sortedTV(hist, p.expectations[i]);
  }
  return total;
}

/**
 * A complete reversible native-English plant with distinct secret affine
 * alphabets for EACH page and word position. Alphabet multipliers 11 and 17
 * are invertible mod29 (inverse multipliers 8 and 12, respectively).
 * @param {number[][]} plainWords
 */
function plantCipher(plainWords) {
  let offset = 0;
  let matched = 0;
  const cipherWords = [];
  for (const word of plainWords) {
    const encrypted = [];
    const recovered = [];
    for (let j = 0; j < word.length; j++) {
      const page = pageOf[offset + j];
      if (j === 0) {
        encrypted.push(mod(11 * word[0] + 5 * page + 3));
        recovered.push(mod(8 * (encrypted[0] - 5 * page - 3)));
      } else {
        encrypted.push(mod(encrypted[j - 1] +
          17 * word[j] + 3 * page + 7 * j));
        recovered.push(mod(12 * (encrypted[j] - encrypted[j - 1] -
          3 * page - 7 * j)));
      }
      assert.equal(recovered[j], word[j], "source-native exact re-encryption inverse");
      matched++;
    }
    cipherWords.push(encrypted);
    offset += word.length;
  }
  assert.equal(offset, 12956);
  assert.equal(matched, 12956);
  return cipherWords;
}

const controls = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];
const originalGroups = {page: stratify(records).page};
const trials = 500;
const summary = {};

for (let sourceId = 0; sourceId < controls.length; sourceId++) {
  const [name, filename] = controls[sourceId];
  const pools = byLength(nativeWords(read(filename)));
  const panels = Object.fromEntries(
    Object.entries(originalGroups).map(([key, group]) =>
      [key, panel(group, pools)]));
  const random = xorshift32(0x33015635 + sourceId);
  const scores = {};
  for (const [key, item] of Object.entries(panels)) {
    const baseline = Array.from({length: trials},
      () => sampledScore(item, pools, random)).sort((a, b) => a - b);
    scores[key] = {
      n: item.n,
      original: item.original,
      controlMin: baseline[0],
      controlMedian: baseline[Math.floor(trials / 2)],
      controlMax: baseline[trials - 1]
    };
    assert(item.original > baseline[trials - 1] + 0.10,
      name + " source-conditional position-alphabet page bound " + key);
  }

  // A source-native complete positive plant, preserving every original
  // printed word length and every physical-page boundary.
  const plantWords = words.map(word => {
    const pool = pools.get(word.length);
    return pool[Math.floor(random() * pool.length)];
  });
  assert.equal(plantWords.length, 2896);
  const encrypted = plantCipher(plantWords);
  const plantGroups = {page: stratify(buildRecords(encrypted)).page};
  const plantScore = {};
  for (const [key, groups] of Object.entries(plantGroups)) {
    const originalPanel = panels[key];
    const n = groups.reduce((sum, g) => sum + g.length, 0);
    assert.equal(n, originalPanel.n);
    const score = groups.reduce((sum, g, i) => sum + (g.length
      ? g.length / n * sortedTV(observedDeltas(g),
        originalPanel.expectations[i]) : 0), 0);
    assert(score < originalPanel.original - 0.10);
    plantScore[key] = score;
  }
  summary[name] = {scores, plantScore};
}

console.log(JSON.stringify({
  result: "source-matched conditional exclusion; no unknown LP2 plaintext or key",
  originalWords: words.length,
  originalRunes: flat.length,
  availableSecondRunePositions: records.length,
  pageBoundaryExcluded: pageCrossings,
  controlTrialsPerCorpusAndStratum: trials,
  nativeExactRecoveredPlantRunesPerCorpus: flat.length,
  summary
}, null, 2));
