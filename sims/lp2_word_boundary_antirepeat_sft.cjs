"use strict";

/**
 * LP2 cross-word adjacent rune equality gate.
 * Complete SFT: node sims/lp2_word_boundary_antirepeat_sft.cjs
 *
 * Original ciphertext, with source word/page/section boundaries retained.
 * Statistical shuffle nulls are conditional on original words and their lengths,
 * and optionally within the same source section or physical page.
 * This is not an encryption inverse or a proof of a historical filter.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { parseLP2Words } = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const raw = read("resources/lp2-transcription.txt");
const parsed = parseLP2Words(raw);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.runeCount, 12956);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const words = parsed.words.map(w => [...w.runes].map(r => {
  const v = runeIndex.get(r);
  assert(v !== undefined, "unknown rune");
  return v;
}));
const original = words.flat();
assert.deepEqual(original, corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices));
const pageAt = corpus.pages.filter(p => p.page <= 55 && p.indices.length)
  .flatMap(p => Array(p.indices.length).fill(p.page));
const sectionLengths = [729, 1145, 1729, 9, 1894, 1021, 1524, 1589, 3316];
const sectionAt = sectionLengths.flatMap((n, i) => Array(n).fill(i));
assert.equal(sectionAt.length, original.length);
let offset = 0;
const starts = words.map(w => {
  const out = {length: w.length, page: pageAt[offset], section: sectionAt[offset]};
  offset += w.length;
  return out;
});
assert.equal(offset, original.length);

/** @param {number[][]} list */
function crossEqual(list) {
  let count = 0;
  for (let i = 1; i < list.length; i++) {
    if (list[i - 1].at(-1) === list[i][0]) count++;
  }
  return count;
}
/** @param {number[][]} list */
function withinEqual(list) {
  let count = 0;
  for (const word of list) {
    for (let i = 1; i < word.length; i++) {
      if (word[i - 1] === word[i]) count++;
    }
  }
  return count;
}
const originalCross = crossEqual(words);
const originalWithin = withinEqual(words);
assert.equal(originalCross, 23);
assert.equal(originalWithin, 63);
const crossPositions = words.length - 1;
const withinPositions = original.length - words.length;
assert.equal(crossPositions, 2895);
assert.equal(withinPositions, 10060);
let seed = 0x33012224;
/** @param {number} n */
function rand(n) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed % n;
}
/** @param {number[]} array */
function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
/** @param {number[]} array */
function distribution(array) {
  const a = array.slice().sort((x, y) => x - y);
  return {min: a[0], p05: a[Math.floor(a.length * .05)],
    median: a[Math.floor(a.length * .5)], p95: a[Math.floor(a.length * .95)],
    max: a.at(-1), leObserved: a.filter(x => x <= originalCross).length,
    pLowerAddOne: (a.filter(x => x <= originalCross).length + 1) / (a.length + 1)};
}
/**
 * Permutation leaves the *slot* word length, printed text section, physical
 * starting page and whole-word glyph content intact as specified. This avoids
 * the misleading iid-letter test.
 * @param {"length"|"section"|"page"} model
 * @param {number} n
 */
function restrictedNull(model, n) {
  const groups = new Map();
  for (let i = 0; i < starts.length; i++) {
    const s = starts[i];
    const key = model === "length" ? String(s.length) :
      (model === "section" ? s.section : s.page) + ":" + s.length;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(i);
  }
  const observations = [];
  for (let iteration = 0; iteration < n; iteration++) {
    const replacement = words.slice();
    for (const slots of groups.values()) {
      const groupWords = shuffle(slots.map(i => words[i]));
      for (let j = 0; j < slots.length; j++) replacement[slots[j]] = groupWords[j];
    }
    observations.push(crossEqual(replacement));
  }
  return {model, stateGroups:groups.size, permutations:n,...distribution(observations)};
}
const shuffleNulls = ["length", "section", "page"].map(m => restrictedNull(m, 20000));
assert(shuffleNulls.every(s => s.min > originalCross));

const gpTokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} text */
function nativeWords(text) {
  const arr = [];
  for (let w of text.toUpperCase().match(/[A-Z]+/g) || []) {
    w = w.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S").replace(/ING/g, "NG");
    const gp = [];
    for (let i = 0; i < w.length;) {
      const tok = gpTokens.find(x => w.startsWith(x.s, i));
      assert(tok);
      gp.push(tok.i);
      i += tok.s.length;
    }
    arr.push(gp);
  }
  return arr;
}
const nativeFiles = ["resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt"];
const nativeControls = nativeFiles.map(file => {
  const sourceWords = nativeWords(read(file));
  const byLength = new Map();
  for (const word of sourceWords) {
    if (!byLength.has(word.length)) byLength.set(word.length, []);
    byLength.get(word.length).push(word);
  }
  const trials = [];
  for (let t = 0; t < 200; t++) {
    const sample = starts.map(s => {
      const pool = byLength.get(s.length);
      assert(pool?.length);
      return pool[rand(pool.length)];
    });
    trials.push(crossEqual(sample));
  }
  assert(trials.every(x => x > originalCross));
  return {source:file, actualWords:sourceWords.length,
    actualCrossEqual:crossEqual(sourceWords),
    actualCrossRate:crossEqual(sourceWords)/(sourceWords.length-1),
    matchedWordLengthSamples:200, matched:distribution(trials)};
});

// Solved plaintext control: actual p57 is plain GP-runic English. It has
// zero cross-word repeats across 19 boundaries and one within-word doublet.
// Shows the exclusion is a corpus-level diagnostic, not a semantic law.
const p57 = parseLP2Words(raw.split("%").at(-1), 1).words
  .map(w => [...w.runes].map(r => runeIndex.get(r)));
assert.equal(p57.length, 20);
assert.equal(p57.flat().length, 95);
assert.equal(crossEqual(p57), 0);
assert.equal(withinEqual(p57), 1);

const observed = {
  words:words.length,runes:original.length,
  withinWord:{trials:withinPositions,equal:originalWithin,
    rate:originalWithin/withinPositions},
  acrossWords:{trials:crossPositions,equal:originalCross,
    rate:originalCross/crossPositions},
  pageBoundaries:corpus.pages.filter(p=>p.page<=55&&p.indices.length).length-1
};
console.log(JSON.stringify({
  result:"Cross-word equality suppressed under length/page/section-preserving word shuffles",
  corpusSHA256:crypto.createHash("sha256").update(read("resources/liber-primus/lp2-corpus.json")).digest("hex"),
  transcriptSHA256:crypto.createHash("sha256").update(raw).digest("hex"),
  observed,shuffleNulls,nativeControls,
  solvedP57:{words:20,runes:95,crossEqual:0,withinEqual:1},
  scope:"Observed original-order dependence; no original plaintext/key or uniquely selected cipher. Native p57 is a counterexample to treating rare crossword equality as impossible for ordinary English."
},null,2));
