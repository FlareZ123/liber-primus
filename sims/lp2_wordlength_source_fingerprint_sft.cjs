"use strict";

/**
 * Original LP2 word-length fingerprint versus reference text.
 * Usage: node sims/lp2_wordlength_source_fingerprint_sft.cjs
 * Runs read-only on the versioned repository corpus.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.join(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const RUNIC = /[ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ]+/g;
const GP = /ING|TH|NG|EO|OE|AE|IA|EA|[A-Z]/g;
const K = 8;
const references = [
  ["Gibran", "resources/control/gibran_prophet_58585.txt", 15733, 9],
  ["Emerson", "resources/control/emerson_essays_2944.txt", 77932, 9],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", 55407, 9],
  ["Blake", "resources/control/blake_song_of_liberty_train.txt", 479, 0],
  ["LP1", "resources/liber-primus/lp1-plaintext-reference.txt", 904, 0]
];

/** @param {string} word @returns {number} */
function length(word) { return (word.toUpperCase().match(GP) || []).length; }

/** @param {number[]} xs @param {number} i @returns {string} */
function key(xs, i) { return xs.slice(i, i + K).join(","); }

/**
 * @param {number[]} original
 * @param {string[]} words
 * @returns {{hits:number,longest:number,offset:number,example:string}}
 */
function scan(original, words) {
  const index = new Map();
  for (let i = 0; i <= original.length - K; i++) {
    const s = key(original, i);
    if (!index.has(s)) index.set(s, []);
    index.get(s).push(i);
  }
  const test = words.map(length);
  let hits = 0, longest = 0, offset = -1, example = "";
  for (let j = 0; j <= test.length - K; j++) {
    for (const i of index.get(key(test, j)) || []) {
      hits++;
      if (i > 0 && j > 0 && original[i - 1] === test[j - 1]) continue;
      let n = 0;
      while (i + n < original.length && j + n < test.length
        && original[i + n] === test[j + n]) n++;
      if (n > longest) {
        longest = n;
        offset = i;
        example = words.slice(j, j + n).join(" ");
      }
    }
  }
  return { hits, longest, offset, example };
}

const transcription = read("resources/lp2-transcription.txt")
  .replace(/[\/\n%\r]/g, "").replace(/[$&]/g, ".");
const allWords = transcription.match(RUNIC) || [];
const original = allWords.slice(0, 2896).map((w) => w.length);
assert.equal(original.length, 2896);
assert.equal(original.reduce((x, y) => x + y, 0), 12956);

const solved = read("resources/liber-primus/lp1-plaintext-reference.txt");
const p57 = solved.split("### 57")[1];
assert.ok(p57);
const solvedWords = p57.match(/[A-Za-z]+/g) || [];
assert.equal(solvedWords.length, 20);
assert.deepEqual(solvedWords.map(length), allWords.slice(-20).map((w) => w.length));
console.log("PASS p57 original solved-page GP rune-length check: 20/20.");
console.log("PASS LP2 unknown: 2,896 words and 12,956 runes.");

for (const [name, filename, expectedCount, expectedLongest] of references) {
  const words = read(filename).match(/[A-Za-z]+/g) || [];
  assert.equal(words.length, expectedCount, name + " input count");
  const result = scan(original, words);
  assert.equal(result.longest, expectedLongest, name + " longest length match");
  assert.ok(result.longest < 10);
  console.log(name + ": words=" + words.length
    + ", K8 hits=" + result.hits + ", longest=" + result.longest
    + ", LP2 word=" + result.offset + ", example=" + result.example);
}
console.log("PASS no 10-word literal length fingerprint in the five references.");
