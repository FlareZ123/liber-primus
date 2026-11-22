"use strict";

/**
 * Source-delimited 32 crossing words versus 32 numeric-grid rows.
 * Node.js 22: node sims/lp2_crosspage32_grid32_wordrow_key_sft.cjs
 * Direct, small, frozen trial. Does not assert the 32=32 alignment was authored.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const base = path.join(__dirname, "..");
/** @param {string} p @returns {string} */
const read = (p) => fs.readFileSync(path.join(base, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source = read("resources/liber-primus/lp2-transcription.txt");
const table = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const dictionary = read("resources/control/english_wordfreq_textblob.txt");
const mod29 = (n) => ((n % 29) + 29) % 29;
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const nativeTokens = ["ING", "TH", "NG", "EO", "OE", "AE", "IA", "EA"];

/**
 * @param {string} input
 * @returns {number[] | null}
 */
function toGP(input) {
  const text = input.toUpperCase().replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C").replace(/V/g, "U").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < text.length;) {
    const token = nativeTokens.find((s) => text.startsWith(s, i)) || text[i];
    const index = corpus.translit.indexOf(token === "ING" ? "NG" : token);
    if (index < 0) return null;
    out.push(index);
    i += token.length;
  }
  return out;
}

/** @returns {{ c: number[], pages: number[] }[]} */
function parseWords() {
  const parts = source.split("%").slice(0, 55);
  assert.equal(parts.length, 55);
  /** @type {{ c: number[], pages: number[] }[]} */
  const words = [];
  let c = [], pages = [], page = 0;
  function finish() {
    if (c.length) words.push({ c, pages });
    c = [];
    pages = [];
  }
  for (const character of parts.join("%")) {
    const x = runeIndex.get(character);
    if (x !== undefined) {
      c.push(x);
      pages.push(page >= 50 ? page + 1 : page);
    } else if (character === "%") {
      page++;
    } else if (character === "/" || /\s/u.test(character)) {
      continue;
    } else {
      finish();
    }
  }
  finish();
  return words;
}

/** @returns {Map<number, Map<string, string>>} */
function makeLexicon() {
  /** @type {Map<number, Map<string, string>>} */
  const lex = new Map();
  for (const line of dictionary.split(/\r?\n/u)) {
    const match = /^([a-z]+)\s+\d+$/u.exec(line);
    if (!match) continue;
    const gp = toGP(match[1]);
    if (!gp) continue;
    if (!lex.has(gp.length)) lex.set(gp.length, new Map());
    lex.get(gp.length).set(gp.join(","), match[1]);
  }
  return lex;
}

/** @param {number} value @returns {number} */
function phi(value) {
  if (value === 0) return 0;
  let answer = value, n = value;
  for (let p = 2; p * p <= n; p++) {
    if (n % p === 0) {
      while (n % p === 0) n /= p;
      answer -= answer / p;
    }
  }
  if (n > 1) answer -= answer / n;
  return answer;
}

/** @param {string} alphabet @returns {number[][]} */
function decodeGrid(alphabet) {
  return table.rows.map((row) => row.map((token) =>
    alphabet.indexOf(token[0]) * alphabet.length + alphabet.indexOf(token[1])));
}

const words = parseWords();
const seams = words.filter((w) => w.pages[0] !== w.pages[w.pages.length - 1]);
const lexical = makeLexicon();
assert.equal(words.length, 2896);
assert.equal(words.reduce((sum, w) => sum + w.c.length, 0), 12956);
assert.equal(seams.length, 32);
assert.equal(table.rows.length, 32);
assert.ok(table.rows.every((r) => r.length === 8));
assert.deepEqual(words.flatMap((w) => w.c),
  corpus.pages.slice(0, 56).flatMap((p) => p.indices));

/**
 * Word-local, right-aligned, and explicitly boundary-aligned octet clocks.
 * Only a single eight-cell row is used per source crossing word.
 * @param {number} j
 * @param {number} length
 * @param {number} cut
 * @param {"word"|"end"|"seam"} clock
 * @returns {number}
 */
function at(j, length, cut, clock) {
  const pos = clock === "word" ? j : clock === "end" ?
    j + 8 - length : j + 8 - cut;
  return ((pos % 8) + 8) % 8;
}

/**
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} sign
 * @param {"mod29"|"phi"} conversion
 * @param {"word"|"end"|"seam"} clock
 * @param {number} cut
 * @returns {number[]}
 */
function inverse(cipher, key, sign, conversion, clock, cut) {
  const convert = conversion === "phi" ? phi : (x) => x;
  return cipher.map((value, j) =>
    mod29(value + sign * (convert(key[at(j, cipher.length, cut, clock)]) % 29)));
}

const alphabet60 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
const sources = [["60", alphabet60], ["59", alphabet60.replace("f", "")]];
const trials = [];
for (const [radix, alphabet] of sources) {
  const rows = decodeGrid(alphabet);
  assert.ok(rows.flat().every((b) => Number.isInteger(b) && b >= 0 && b <= 255));
  for (const conversion of ["mod29", "phi"]) {
    for (const sign of [-1, 1]) {
      for (const reversed of [false, true]) {
        for (const clock of ["word", "end", "seam"]) {
          /** @type {{ordinal:number,from:number,word:string,length:number}[]} */
          const matches = [];
          seams.forEach((w, ordinal) => {
            const cut = w.pages.findIndex((p) => p !== w.pages[0]);
            const row = reversed ? rows[ordinal].slice().reverse() : rows[ordinal];
            const plain = inverse(w.c, row, sign, conversion, clock, cut);
            const word = lexical.get(plain.length)?.get(plain.join(","));
            if (word) matches.push({ ordinal, from: w.pages[0],
              word, length: plain.length });
          });
          trials.push({radix, conversion, sign, reversed, clock, matches});
        }
      }
    }
  }
}
assert.equal(trials.length, 48);
trials.sort((a, b) => b.matches.length - a.matches.length);
assert.equal(trials[0].matches.length, 2);
assert.ok(trials[0].matches.every((m) => m.length <= 4));
assert.ok(trials.every((t) => t.matches.every((m) => m.length <= 4)));
assert.ok(trials.every((t) => t.matches.length < 32));

// Positive control under the exact primary row/clock conversion.
// Independent original-GP words are selected from the source-frozen lexicon;
// key and plaintext are known to the synthetic generator alone.
const row60 = decodeGrid(alphabet60);
const plant = seams.map((w, ordinal) => {
  const pool = Array.from(lexical.get(w.c.length).keys());
  const plain = pool[(ordinal * 173 + 31) % pool.length].split(",").map(Number);
  const cut = w.pages.findIndex((p) => p !== w.pages[0]);
  const key = row60[ordinal];
  const cipher = plain.map((v, j) => mod29(v + key[at(j, plain.length, cut, "word")]));
  assert.deepEqual(inverse(cipher, key, -1, "mod29", "word", cut), plain);
  return cipher;
});
assert.equal(plant.length, 32);

// The directly motivated one-byte-per-row readout (one GP-prime-sum modulo 8
// column per original crossing word) has no contiguous ASCII plaintext.
const column = seams.map((w) =>
  w.c.reduce((sum, index) => sum + corpus.prime[index], 0) % 8);
const byteReadout = row60.map((r, i) => r[column[i]]);
const printable = byteReadout.filter((b) => b >= 32 && b <= 126).length;
assert.equal(printable, 11);

console.log(JSON.stringify({
  status: "No authentic plaintext or source-selected key",
  crossingWords: seams.length,
  numericTableRows: table.rows.length,
  trials: trials.length,
  bestDictionaryMatches: trials[0].matches.length,
  longestMatchedRuneWord: Math.max(...trials.flatMap((t) =>
    t.matches.map((m) => m.length))),
  bestTrial: trials[0],
  primeSumColumnPrintable: printable,
  primeSumColumnBytes: byteReadout.map((b) => b.toString(16).padStart(2, "0")).join(""),
  allPlantedWordsInvert: plant.length === 32
}, null, 2));
