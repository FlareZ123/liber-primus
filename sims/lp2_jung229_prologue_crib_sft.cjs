"use strict";

/**
 * Source-selected Jung Liber Primus prologue crib screen.
 * Run on Node.js 22 from repository root:
 *   node sims/lp2_jung229_prologue_crib_sft.cjs <extracted PDF text path>
 * The PDF is downloaded transiently by the manual workflow and is never
 * committed. Only the word-length findings are retained.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const trans = fs.readFileSync(path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");
const sourcePath = process.argv[2];
assert(sourcePath, "Pass an extracted Jung PDF text file");
const source = fs.readFileSync(sourcePath, "utf8");

const runeWord = /\p{Script=Runic}+/gu;
const pages = trans.split(/\s*%\s*/).filter(p => /\p{Script=Runic}/u.test(p));
assert.equal(pages.length, 57);
const unknownPages = pages.slice(0, 55).map((raw, i) => ({
  page: i < 50 ? i : i + 1,
  lengths: (raw.replace(/\/\s*/g, "").match(runeWord) || []).map(w => [...w].length)
}));
assert.equal(unknownPages.reduce((n, p) => n + p.lengths.reduce((s, x) => s + x, 0), 0), 12956);

const tokens = corpus.translit.slice().sort((a, b) => b.length - a.length);

/**
 * @param {string} w English word
 * @returns {number} Number of native GP29 runes
 */
function gpLength(w) {
  w = w.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  let n = 0;
  for (let i = 0; i < w.length; n++) {
    if (w.startsWith("ING", i)) i += 3;
    else if (w.startsWith("IO", i)) i += 2;
    else {
      const t = tokens.find(t => w.startsWith(t, i));
      assert(t, "Unknown GP spelling at " + w.slice(i));
      i += t.length;
    }
  }
  return n;
}

const parable = "PARABLE LICE THE INSTAR TUNNELNG TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE".split(" ");
const clear57 = (pages[56].replace(/\/\s*/g, "").match(runeWord) || []).map(w => [...w].length);
assert.deepEqual(parable.map(gpLength), clear57, "Authentic p57 spelling and word-length control");

/**
 * @param {string[]} words
 * @param {number[]} lengths
 * @param {string} register
 */
function scan(words, lengths, register) {
  const K = 5;
  const keyed = new Map();
  for (let j = 0; j + K <= lengths.length; j++) {
    const k = lengths.slice(j, j + K).join(",");
    const a = keyed.get(k) || [];
    a.push(j);
    keyed.set(k, a);
  }
  let best = 0;
  const results = [];
  for (const p of unknownPages) {
    for (let i = 0; i + K <= p.lengths.length; i++) {
      for (const j of keyed.get(p.lengths.slice(i, i + K).join(",")) || []) {
        let n = K;
        while (i + n < p.lengths.length && j + n < lengths.length
          && p.lengths[i+n] === lengths[j+n]) n++;
        if (n >= best) {
          if (n > best) { best = n; results.length = 0; }
          if (results.length < 25) {
            results.push({
              page: p.page,
              unknownWordIndex: i,
              sourceWordIndex: j,
              matchingWords: n,
              sourcePreview: words.slice(j,j+Math.min(n,8)).join(" "),
              sourceNextLengths: lengths.slice(j+n,j+n+5),
              originalNextLengths: p.lengths.slice(i+n,i+n+5)
            });
          }
        }
      }
    }
  }
  return {register, best, strongest:results.slice(0,12)};
}

/**
 * Word-permutation-invariant whole-page source crib.
 * Retain authentic printed original page-local word slots; do not fit a
 * transposition, delete words or tune alphabet size. A zero L1 histogram
 * distance means a source passage could have had its words permuted to the
 * original physical page; it does not identify the cipher or the permutation.
 *
 * @param {number[]} lengths ordered source word lengths
 * @param {string} register conversion label
 */
function pageBagCheck(lengths, register) {
  const B = 18; // 1..17, 18+; all larger lengths in a stable final bin
  const idx = n => Math.min(B - 1, n - 1);
  const found = [];
  for (const page of unknownPages) {
    const target = new Int32Array(B);
    for (const v of page.lengths) target[idx(v)]++;
    const n = page.lengths.length;
    if (n < 15 || n > lengths.length) continue;
    const running = new Int32Array(B);
    for (let j = 0; j < n; j++) running[idx(lengths[j])]++;
    let best = Infinity, at = -1, exact = 0;
    for (let j = 0; j + n <= lengths.length; j++) {
      let d = 0;
      for (let b = 0; b < B; b++) d += Math.abs(running[b]-target[b]);
      if (d < best) { best = d; at = j; }
      if (d === 0) exact++;
      if (j + n < lengths.length) {
        running[idx(lengths[j])]--;
        running[idx(lengths[j+n])]++;
      }
    }
    found.push({page:page.page, originalWords:n, bestL1:best,
      minimumSubstitutions:best/2, earliestSourceWord:at, exactWindows:exact});
  }
  found.sort((a,b)=>a.minimumSubstitutions-b.minimumSubstitutions || b.originalWords-a.originalWords);
  return {register, exactSourceWindows:found.reduce((x,y)=>x+y.exactWindows,0),
    strongest:found.slice(0,8), pagesScanned:found.length};
}

const words = source.match(/[A-Za-z]+/g) || [];
assert(words.length > 400, "Extracted PDF missing expected 2009 prologue text");
const results = [
  scan(words,words.map(gpLength),"GP29 source-calibrated"),
  scan(words,words.map(w=>w.length),"Latin26")
];
const maximum = Math.max(...results.map(r=>r.best));
const wordBag = [
  pageBagCheck(words.map(gpLength), "GP29 source-calibrated"),
  pageBagCheck(words.map(w=>w.length), "Latin26")
];
console.log(JSON.stringify({
  pdf:"Jung, The Red Book, Liber Primus, Prologue, English translation (printed page 229 onward)",
  source:"https://www.jungiananalysts.org.uk/wp-content/uploads/2024/09/The-Way-of-What-is-to-Come-from-C.-G.-Jung-Liber-Novus-The-Red-Book-1-1.pdf",
  exactOriginalRunes:12956,
  originalRuneBearingPages:55,
  solvedP57WordLengthPositive:clear57.length,
  sourceWords:words.length,
  results,
  permutationInvariantWholePage:wordBag,
  decision:maximum>=12 ? "Follow this candidate with withheld word-lengths and independently recovered key" : "No intact >=12-word direct source crib in this extracted text and fixed spelling"
},null,2));
