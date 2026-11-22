"use strict";

/**
 * Full-LP2 printed-word-length crib discovery against three source corpora
 * and solved LP1 original runes, using BOTH historically plausible English
 * registers: native GP29 with source-calibrated ING/IO, and Latin26.
 *
 * Run from repository root: node sims/lp2_fullbook_source_crib_sft.cjs
 * Node.js 20+, CommonJS, no writes or third-party dependencies.
 * This is a finite source-crib screen, not a plaintext decoder.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const unknown = read("resources/liber-primus/lp2-transcription.txt");
const lp1 = read("resources/transcriptions/lp1_wulfic_canonical.txt");
const scripts = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];
const token = gp.translit.slice().sort((x, y) => y.length - x.length);
const runeWord = /\p{Script=Runic}+/gu;
const physicalUnknown = unknown.split(/\s*%\s*/).slice(0, 55)
  .map((raw, i) => ({
    page: i < 50 ? i : i + 1,
    words: raw.replace(/\/\s*/g, "").match(runeWord) || []
  }));
assert.equal(physicalUnknown.length, 55);
assert.equal(physicalUnknown.reduce((n, p) =>
  n + p.words.reduce((s, w) => s + [...w].length, 0), 0), 12956);

const lp1Sections = lp1.split(/\s*%\s*/).map((raw, section) => ({
  section,
  words: raw.replace(/\/\s*/g, "").match(runeWord) || []
}));

/**
 * Native-GP spelling copied from the independently solved LP1/p57 witness.
 * @param {string} word
 * @returns {number}
 */
function gpLength(word) {
  word = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  let length = 0;
  for (let i = 0; i < word.length; length++) {
    if (word.startsWith("ING", i)) i += 3;
    else if (word.startsWith("IO", i)) i += 2;
    else {
      const next = token.find(t => word.startsWith(t, i));
      assert(next, "unmapped source word " + word);
      i += next.length;
    }
  }
  return length;
}

/**
 * Match source runs without fitting/altering original word boundaries.
 * Seeding a five-word k-gram avoids O(corpus*manuscript) exhaustive loops.
 *
 * @param {string} name
 * @param {string} register
 * @param {string[]} sourceWords
 * @param {number[]} sourceLengths
 * @returns {{name:string,register:string,n:number,runes:number,page:number,word:number,at:number,phrase:string}[]}
 */
function matches(name, register, sourceWords, sourceLengths) {
  const K = 5;
  const index = new Map();
  const key = (values, start) => values.slice(start, start + K).join(",");
  for (let j = 0; j <= sourceLengths.length - K; j++) {
    const k = key(sourceLengths, j);
    let a = index.get(k);
    if (!a) { a = []; index.set(k, a); }
    a.push(j);
  }
  const output = [];
  for (const page of physicalUnknown) {
    const lengths = page.words.map(w => [...w].length);
    for (let i = 0; i <= lengths.length - K; i++) {
      for (const j of index.get(key(lengths, i)) || []) {
        let n = K, runes = 0;
        for (let k = 0; k < K; k++) runes += lengths[i + k];
        while (i + n < lengths.length && j + n < sourceLengths.length &&
          lengths[i + n] === sourceLengths[j + n]) {
          runes += lengths[i + n];
          n++;
        }
        if (n >= 7) output.push({
          name, register, n, runes, page: page.page, word: i + 1,
          at: j + 1, phrase: sourceWords.slice(j, j + n).join(" ")
        });
      }
    }
  }
  return output;
}
const findings = [];
for (const [name, file] of scripts) {
  const words = read(file).match(/[A-Za-z]+/g) || [];
  findings.push(...matches(name, "GP29", words, words.map(gpLength)));
  findings.push(...matches(name, "Latin26", words, words.map(w => w.length)));
}
for (const p of lp1Sections) {
  findings.push(...matches("LP1 section " + p.section, "original runes",
    p.words, p.words.map(w => [...w].length)));
}
findings.sort((a, b) => b.n - a.n || b.runes - a.runes);
const bestFor = (name, register) => Math.max(0, ...findings
  .filter(f => f.name === name && f.register === register).map(f => f.n));
assert.equal(bestFor("Shakespeare", "GP29"), 9);
assert.equal(bestFor("Gibran", "GP29"), 9);
assert.equal(bestFor("Emerson", "GP29"), 9);
assert.equal(bestFor("Shakespeare", "Latin26"), 9);
assert.equal(bestFor("Gibran", "Latin26"), 9);
assert.equal(bestFor("Emerson", "Latin26"), 10);
const lp1Seven = findings.filter(f =>
  f.name.startsWith("LP1 section") && f.n >= 7);
assert.deepEqual(lp1Seven.map(x => [x.page, x.word, x.n, x.runes]),
  [[55, 11, 7, 30], [25, 46, 7, 29]]);
assert.ok(findings.every(f => f.n < 12),
  "An extended source-crib match warrants new independent decoding.");

console.log(JSON.stringify({
  exactInput: "55 original rune-bearing LP2 pages, physical p0–55",
  inspected: scripts.map(([name, file]) => ({
    name, words: (read(file).match(/[A-Za-z]+/g) || []).length
  })),
  registers: ["source-calibrated native GP29", "Latin26", "solved LP1 original rune lengths"],
  longest: findings.slice(0, 12),
  directLP1: lp1Seven,
  conclusion: "No fixed contiguous >=12-word source crib. Short matches have no source-selected cipher operation."
}, null, 2));
