"use strict";

/**
 * Source-locked GP29 word-clock seam test for Director issue #1184.
 *
 * Candidate: the authenticated LP2 p56 prime-totient addition with literal-F
 * transparency, newly hypothesized to restart at each complete printed word.
 * At the 32 actual page-crossing words compare a continuous word clock with
 * an additional physical-page break reset. Neither reset is historically
 * authenticated for the unresolved LP2 source.
 *
 * Read-only, single runnable test file (SFT), Node.js 22 CommonJS.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55);
const rune = new Map(gp.runes.map((c, i) => [c, i]));
const mod29 = n => ((n % 29) + 29) % 29;

/** @returns {number[]} The actual prime-totient key, indexed from prime 2. */
function primeKey() {
  const out = [];
  for (let n = 2; out.length < 100; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) out.push((n - 1) % 29);
  }
  return out;
}
const key = primeKey();

/**
 * @typedef {{nums:number[], pages:number[], startPage:number,
 *  startLocal:number, endPage:number, endLocal:number, first:number}} Word
 */
/** @returns {{words:Word[], counts:number[]}} */
function parseWords() {
  /** @type {Word[]} */
  const words = [];
  const counts = [];
  /** @type {Word|null} */
  let current = null;
  let global = 0;
  for (let page = 0; page < pages.length; page++) {
    let local = 0;
    const indices = [];
    for (const ch of pages[page]) {
      if (rune.has(ch)) {
        const value = rune.get(ch);
        assert.equal(typeof value, "number");
        if (!current) current = {
          nums: [], pages: [], startPage: page, startLocal: local,
          endPage: page, endLocal: local, first: global
        };
        current.nums.push(value);
        current.pages.push(page);
        current.endPage = page;
        current.endLocal = local;
        indices.push(value);
        local++;
        global++;
      } else if (ch === "/" || /\s/u.test(ch)) {
        // Page and line wraps are not word delimiters.
      } else if (current) {
        words.push(current);
        current = null;
      }
    }
    counts.push(local);
    const physical = page >= 50 ? page + 1 : page;
    assert.deepEqual(indices, gp.pages[physical].indices,
      "Source transcript / canonical index mismatch at page " + physical);
  }
  if (current) words.push(current);
  assert.equal(global, 12956);
  assert.equal(words.length, 2896);
  assert.equal(words.filter(w => w.startPage !== w.endPage).length, 32);
  return {words, counts};
}

/**
 * Exact F-transparent decoder-state enumeration; an encrypted non-F must
 * consume a key, while a literal plaintext F never consumes one.
 * @param {number[]} nums Original ciphertext indices
 * @param {number|null} cut Additional key-clock reset before this local slot
 * @returns {Map<number,number>} Consumed-key count -> valid path multiplicity
 */
function paths(nums, cut = null) {
  let states = new Map([[0, 1]]);
  for (let i = 0; i < nums.length; i++) {
    if (i === cut && states.size) {
      let total = 0;
      for (const paths of states.values()) total += paths;
      states = new Map([[0, total]]);
    }
    const next = new Map();
    for (const [used, count] of states) {
      const c = nums[i];
      if (c === 0) next.set(used, (next.get(used) || 0) + count);
      const plain = mod29(c - key[used]);
      if (plain !== 0) {
        next.set(used + 1, (next.get(used + 1) || 0) + count);
      }
    }
    states = next;
  }
  return states;
}
/** @param {Map<number,number>} m @returns {number} */
function countPaths(m) {
  let total = 0;
  for (const count of m.values()) total += count;
  return total;
}
/**
 * @param {number[]} plain Authentic-source GP29 plaintext
 * @param {number|null} cut Optional page rekey within this complete word
 * @returns {number[]}
 */
function encrypt(plain, cut = null) {
  const out = [];
  let used = 0;
  for (let i = 0; i < plain.length; i++) {
    if (i === cut) used = 0;
    const p = plain[i];
    out.push(p === 0 ? 0 : mod29(p + key[used++]));
  }
  return out;
}

/** Original source-calibrated GP29 spelling, including ING and IO. */
function nativeGP(text) {
  const tokens = gp.translit.map((s, i) => ({s, i}))
    .sort((a, b) => b.s.length - a.s.length);
  const letters = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (const word of letters.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith("ING", i)) {
        out.push(21); i += 3;
      } else if (word.startsWith("IO", i)) {
        out.push(27); i += 2;
      } else {
        const token = tokens.find(t => word.startsWith(t.s, i));
        assert.ok(token, "Unencodable historical GP29 spelling");
        out.push(token.i);
        i += token.s.length;
      }
    }
  }
  return out;
}

// Actual historically solved controls: exact F skip and ING/IO orthography.
const solvedP56 = nativeGP(
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE " +
  "THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
assert.equal(solvedP56.length, 85);
assert.deepEqual(encrypt(solvedP56), gp.pages[56].indices,
  "Original solved LP2 p56 must decrypt with a continuous prime key");
assert.ok(countPaths(paths(gp.pages[56].indices)) > 0);
const solvedP57 = nativeGP(
  "LIKE THE INSTAR TUNNELING TO THE SURFACE " +
  "WE MUST SHED OUR OWN CIRCUMFERENCES " +
  "FIND THE DIVINITY WITHIN AND EMERGE");
assert.equal(solvedP57.length, 95);
assert.deepEqual(solvedP57, gp.pages[57].indices);

const {words, counts} = parseWords();
const cross = words.filter(w => w.startPage !== w.endPage);
const within = words.filter(w => w.startPage === w.endPage);
const groups = [[0,2], [3,7], [8,14], [15,22], [23,26],
  [27,32], [33,39], [40,52], [53,54]];
/** @param {number} page */
const group = page => groups.findIndex(([first, last]) =>
  page >= first && page <= last);

/**
 * Precommitted length- and nearby-position-matched within-page control:
 * same printed word length and source-visible chapter, choosing nearest
 * physical page, then nearest right-page-edge position; if none exists in
 * chapter, the same length in the whole book. Never uses cipher results.
 * @param {Word} seam
 * @returns {{word:Word,scope:string}}
 */
function matchControl(seam) {
  let pool = within.filter(w =>
    w.nums.length === seam.nums.length &&
    group(w.startPage) === group(seam.startPage));
  const scope = pool.length ? "same chapter" : "whole manuscript fallback";
  if (!pool.length) pool = within.filter(w =>
    w.nums.length === seam.nums.length);
  assert.ok(pool.length);
  /** @param {Word} w */
  const distance = w => Math.abs(w.startPage - seam.startPage) * 1000 +
    Math.abs((counts[w.endPage] - w.endLocal - 1) -
    (counts[seam.startPage] - seam.startLocal - 1));
  pool.sort((a, b) => distance(a) - distance(b) || a.first - b.first);
  return {word: pool[0], scope};
}

const decision = cross.map((w, ordinal) => {
  const cut = w.pages.filter(p => p === w.startPage).length;
  assert.ok(cut > 0 && cut < w.nums.length);
  const m = matchControl(w);
  const cont = countPaths(paths(w.nums));
  const reset = countPaths(paths(w.nums, cut));
  const matchedCont = countPaths(paths(m.word.nums));
  const matchedReset = countPaths(paths(m.word.nums, cut));
  // A positive of the frozen cipher in exactly this genuine source geometry.
  // The positive GP runes originate in the independently solved p57 page.
  const sample = Array.from({length: w.nums.length}, (_, j) =>
    solvedP57[(ordinal * 13 + j) % solvedP57.length]);
  for (const mode of [null, cut]) {
    const enc = encrypt(sample, mode);
    assert.ok(countPaths(paths(enc, mode)) > 0,
      "Source-layout positive must remain legally decryptable");
    assert.deepEqual(encrypt(sample, mode), enc,
      "Source-layout original encryption must be deterministic");
  }
  return {
    boundary: (w.startPage >= 50 ? w.startPage + 1 : w.startPage) +
      "->" + (w.endPage >= 50 ? w.endPage + 1 : w.endPage),
    length: w.nums.length, cut, cont, reset, matchedCont, matchedReset,
    matchedScope: m.scope
  };
});
/** @param {number[]} arr */
const tally = arr => ({
  n: arr.length,
  legal: arr.filter(x => x > 0).length,
  illegal: arr.filter(x => x === 0).length,
  multiple: arr.filter(x => x > 1).length
});
const allWithin = tally(within.map(w => countPaths(paths(w.nums))));
const crossCont = tally(decision.map(row => row.cont));
const crossReset = tally(decision.map(row => row.reset));
const matchedCont = tally(decision.map(row => row.matchedCont));
const matchedVirtualReset = tally(decision.map(row => row.matchedReset));
assert.deepEqual(allWithin, {n:2864,legal:2493,illegal:371,multiple:339});
assert.deepEqual(crossCont, {n:32,legal:29,illegal:3,multiple:5});
assert.deepEqual(crossReset, {n:32,legal:26,illegal:6,multiple:5});
assert.deepEqual(matchedCont, {n:32,legal:26,illegal:6,multiple:5});
assert.deepEqual(matchedVirtualReset, {n:32,legal:27,illegal:5,multiple:6});
assert.equal(decision.filter(x => x.matchedScope !== "same chapter").length, 1);
console.log(JSON.stringify({
  issue:1184, sourceRunes:12956, completeWords:2896,
  crossPageWords:32, originalP56PrimeFPositive:"85/85",
  originalP57OrthographyPositive:"95/95",
  originalCrossPageSyntheticGPPositive:"64/64 variant-word trials",
  allWithin, crossCont, crossReset, matchedCont, matchedVirtualReset,
  discrepantSeams:decision.filter(x => Number(x.cont > 0) !==
    Number(x.reset > 0)),
  decision:"Both frozen word-restarted p56-prime/F clock policies are " +
    "already impossible on 371 untouched within-page words. The 32 " +
    "original seam ciphertexts do not select an authentic reset rule " +
    "or recover LP2 plaintext. Do not generalize to other keyed models."
}, null, 2));
