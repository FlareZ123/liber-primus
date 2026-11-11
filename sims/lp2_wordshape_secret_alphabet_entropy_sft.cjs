"use strict";

/**
 * Original LP2 word-shape state entropy gate, including page- and section-keyed
 * permutations. SFT: node sims/lp2_wordshape_secret_alphabet_entropy_sft.cjs
 *
 * Any fixed bijection P -> C chosen only by (word length, position, optional
 * page/section) preserves the empirical conditional entropy H(C | state).
 * Native controls are resampled to MATCH EACH original word length.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");

const ROOT = path.join(__dirname, "..");
const files = [
  "resources/liber-primus/lp2-corpus.json",
  "resources/lp2-transcription.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt",
];
/** @param {string} file */
function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}
/** @param {string} text */
function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}
const data = files.map(read);
const corpus = JSON.parse(data[0]);
assert.equal(corpus.runes.length, 29);
const runeToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const source = data[1].split("%").slice(0, 55).join("%");

/** @type {number[][]} */
const words = [];
let current = [];
for (const ch of source) {
  if (runeToIndex.has(ch)) {
    current.push(runeToIndex.get(ch));
  } else if (ch === "%" || ch === "/" || /\s/u.test(ch)) {
    // Page and line breaks are editorial/typographical, not word breaks.
  } else if (current.length) {
    words.push(current);
    current = [];
  }
}
if (current.length) words.push(current);
assert.equal(words.length, 2896);
assert.equal(words.reduce((n, w) => n + w.length, 0), 12956);
const pageSizes = corpus.pages.filter(p => p.page <= 55 && p.indices.length)
  .map(p => p.indices.length);
const sectionSizes = [729, 1145, 1729, 9, 1894, 1021, 1524, 1589, 3316];
assert.equal(pageSizes.reduce((a, b) => a + b), 12956);
assert.equal(sectionSizes.reduce((a, b) => a + b), 12956);
const pageAt = pageSizes.flatMap((size, id) => Array(size).fill(id));
const sectionAt = sectionSizes.flatMap((size, id) => Array(size).fill(id));
const all = words.flat();
assert.deepEqual(all, corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices),
  "Word parser must preserve exact original rune sequence");

/** @typedef {{length:number,position:number,page:number,section:number}} RuneState */
/** @type {RuneState[][]} */
const wordStates = [];
let absolute = 0;
for (const word of words) {
  const length = word.length;
  wordStates.push(word.map((_, position) => ({
    length, position, page: pageAt[absolute + position],
    section: sectionAt[absolute + position],
  })));
  absolute += length;
}
assert.equal(absolute, 12956);

/** @param {RuneState} state @param {"word"|"section"|"page"} model */
function stateKey(state, model) {
  const base = state.length + ":" + state.position;
  if (model === "word") return base;
  return (model === "section" ? state.section : state.page) + ":" + base;
}

/** @param {number[][]} input @param {"word"|"section"|"page"} model */
function histogramByState(input, model) {
  assert.equal(input.length, words.length);
  const map = new Map();
  for (let w = 0; w < input.length; w++) {
    assert.equal(input[w].length, words[w].length);
    for (let i = 0; i < input[w].length; i++) {
      const key = stateKey(wordStates[w][i], model);
      if (!map.has(key)) map.set(key, Array(29).fill(0));
      const value = input[w][i];
      assert(Number.isInteger(value) && value >= 0 && value < 29);
      map.get(key)[value]++;
    }
  }
  return map;
}
/** @param {Map<string, number[]>} groups */
function conditionalEntropy(groups) {
  const n = 12956;
  let total = 0;
  for (const counts of groups.values()) {
    const subtotal = counts.reduce((a, b) => a + b, 0);
    for (const count of counts) {
      if (!count) continue;
      const p = count / subtotal;
      total -= (subtotal / n) * p * Math.log2(p);
    }
  }
  return total;
}
const modes = ["word", "section", "page"];
const actual = modes.map(mode => ({
  state: mode, groups: histogramByState(words, mode).size,
  entropy: conditionalEntropy(histogramByState(words, mode)),
}));
const expected = [4.7091878831286, 4.0167155154128, 2.3499969131473];
for (let i = 0; i < modes.length; i++) {
  assert.ok(Math.abs(actual[i].entropy - expected[i]) < 1e-9);
}
assert.deepEqual(actual.map(x => x.groups), [105, 679, 3023]);

const gpTokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} text */
function nativeWordsByLength(text) {
  const byLength = new Map();
  for (let w of text.toUpperCase().match(/[A-Z]+/g) || []) {
    w = w.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S").replace(/ING/g, "NG");
    const symbols = [];
    for (let at = 0; at < w.length;) {
      const tok = gpTokens.find(t => w.startsWith(t.s, at));
      assert(tok);
      symbols.push(tok.i);
      at += tok.s.length;
    }
    const length = symbols.length;
    if (!byLength.has(length)) byLength.set(length, []);
    byLength.get(length).push(symbols);
  }
  return byLength;
}
let seed = 0x13039110;
/** @returns {number} */
function nextUint() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed;
}
/** @param {Map<number, number[][]>} lookup */
function sampleMatchingLengths(lookup) {
  return words.map(w => {
    const list = lookup.get(w.length);
    assert(list && list.length, "No native word of source length " + w.length);
    return list[nextUint() % list.length];
  });
}
/** @param {number[]} a */
function range(a) {
  const sorted = a.slice().sort((x, y) => x - y);
  return {min: sorted[0], median: sorted[Math.floor(sorted.length/2)],
    max: sorted.at(-1)};
}
const controls = [];
const nativeLookups = data.slice(2).map(nativeWordsByLength);
for (let src = 0; src < nativeLookups.length; src++) {
  const lookup = nativeLookups[src];
  const rows = [[], [], []];
  for (let t = 0; t < 32; t++) {
    const sampled = sampleMatchingLengths(lookup);
    for (let k = 0; k < modes.length; k++) {
      rows[k].push(conditionalEntropy(histogramByState(sampled, modes[k])));
    }
  }
  const bounds = rows.map(range);
  assert(bounds.every((b, i) => b.max < actual[i].entropy));
  controls.push({source: files[src + 2], matchedSamples: 32,
    availableLengths: [...lookup.keys()].length,
    entropyByState: Object.fromEntries(modes.map((mode, i) => [mode, bounds[i]]))});
}

// Distinct pre-encoded historical-language control: the published Latin
// Vulgate New Testament is already GP29 word-preserving, with 0..9 A..S
// encoding rune indices 0..28. No Latin prose is silently re-tokenized.
const latinPath = "resources/control/latin-vulgate-gp-wholewords.txt";
const latinRaw = read(latinPath);
const radix29 = "0123456789ABCDEFGHIJKLMNOPQRS";
assert.equal(radix29.length, 29);
const latinLookup = new Map();
let latinWords = 0;
for (const line of latinRaw.split(/\r?\n/)) {
  const token = line.trim();
  if (!/^[0-9A-S]+$/.test(token)) continue;
  const gp = [...token].map(c => {
    const i = radix29.indexOf(c);
    assert(i >= 0);
    return i;
  });
  const length = gp.length;
  if (!latinLookup.has(length)) latinLookup.set(length, []);
  latinLookup.get(length).push(gp);
  latinWords++;
}
assert.equal(latinWords, 39835);
const latinRows = [[], [], []];
let latinSeed = 0x29a21111;
/** @param {number} n */
function latinRandomIndex(n) {
  latinSeed = (Math.imul(latinSeed, 1664525) + 1013904223) >>> 0;
  return latinSeed % n;
}
for (let t = 0; t < 32; t++) {
  const nativeSample = words.map(w => {
    const pool = latinLookup.get(w.length);
    assert(pool && pool.length, "Missing Latin GP word length " + w.length);
    return pool[latinRandomIndex(pool.length)];
  });
  for (let k = 0; k < modes.length; k++) {
    latinRows[k].push(conditionalEntropy(histogramByState(nativeSample, modes[k])));
  }
}
const latinBounds = latinRows.map(range);
assert(latinBounds.every((r, i) => r.max < actual[i].entropy));
controls.push({
  source: latinPath, matchedSamples:32, availableLengths:latinLookup.size,
  entropyByState:Object.fromEntries(modes.map((mode,i)=>[mode,latinBounds[i]])),
});
assert.equal(controls.length,4);

// Full secret-key positive control. Every state can have its own arbitrary GP29
// bijection. Both forwards and backwards must be exact for a planted native passage.
const planted = sampleMatchingLengths(nativeLookups[1]);
const perms = new Map();
const inverses = new Map();
for (let w = 0; w < words.length; w++) {
  for (const state of wordStates[w]) {
    const key = stateKey(state, "page");
    if (perms.has(key)) continue;
    const perm = Array.from({length:29}, (_,i) => i);
    for (let i=28;i>0;i--) {
      const j=nextUint()%(i+1);
      [perm[i],perm[j]]=[perm[j],perm[i]];
    }
    const inv=Array(29);
    perm.forEach((val,i)=>{inv[val]=i;});
    perms.set(key,perm);
    inverses.set(key,inv);
  }
}
const encrypted = planted.map((word, w) =>
  word.map((symbol, i) => perms.get(stateKey(wordStates[w][i],"page"))[symbol]));
const recovered = encrypted.map((word, w) =>
  word.map((symbol, i) => inverses.get(stateKey(wordStates[w][i],"page"))[symbol]));
assert.deepEqual(recovered, planted);
for (const mode of modes) {
  const before = conditionalEntropy(histogramByState(planted, mode));
  const after = conditionalEntropy(histogramByState(encrypted, mode));
  if (mode === "page") assert.ok(Math.abs(before-after) < 1e-10);
}
console.log(JSON.stringify({
  hypothesis: "Arbitrary fixed GP29 permutation keyed by word shape, plus optional section or physical page",
  sourceSHA256: Object.fromEntries([...files.map((name,i)=>[name,sha256(data[i])]),[latinPath,sha256(latinRaw)]]),
  original: actual,
  controls,
  planted: {length:12956, stateTables:perms.size, exactRecovery:true,
    pageEntropyPlaintext:conditionalEntropy(histogramByState(planted,"page")),
    pageEntropyEncrypted:conditionalEntropy(histogramByState(encrypted,"page"))},
  conclusion: "All secret bijections in this exact word-shape/page-or-section family preserve the observed group histograms; original conditional entropy is outside all matched-length native English and GP Latin controls. No plaintext recovered."
}, null, 2));
