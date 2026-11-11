"use strict";

/**
 * Source-locked 2012 Cicada book-code word-length crib test.
 *
 * Run: node sims/lp2_2012_bookcode_wordlength_sft.cjs
 * No network or package dependencies. Only derived GP word lengths are stored:
 * the complete archived Cicada-selected Britannica and Agrippa texts, plus
 * Mabinogion as independently mentioned historical context. No book plaintext
 * is embedded in this reproducer.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const SOURCE = JSON.parse(fs.readFileSync(path.join(
  ROOT, "resources", "derived", "2012-bookcode-gp-wordlengths.json"
), "utf8"));
const RUNE = /[\u16A0-\u16FF]/u;

/** @returns {{lengths:number[], runes:number}} */
function originalWords() {
  const raw = fs.readFileSync(path.join(ROOT, "resources",
    "lp2-transcription.txt"), "utf8");
  const pages = raw.split("%").slice(0, 55);
  assert.equal(pages.length, 55);
  const lengths = [];
  let current = 0;
  let runes = 0;
  for (const character of pages.join("%")) {
    if (RUNE.test(character)) {
      current++;
      runes++;
    } else if (character !== "%" && character !== "/" &&
               !/\s/u.test(character) && current > 0) {
      lengths.push(current);
      current = 0;
    }
  }
  if (current) lengths.push(current);
  assert.equal(runes, 12956, "canonical unsolved rune count");
  assert.equal(lengths.length, 2896, "canonical cross-page word count");
  return {lengths, runes};
}

/** @param {string} encoded @returns {number[]} */
function unpack(encoded) {
  assert.match(encoded, /^[A-Z]+$/u);
  return Array.from(encoded, char => char.charCodeAt(0) - 65);
}

/**
 * Require six exact consecutive word-length matches before extending.
 * Exact continuation is bounded at 200 words. The fuzzy continuation
 * permits two length discrepancies in 40 words, both after the fixed seed.
 * @param {number[]} ciphertext
 * @param {number[]} reference
 */
function scan(ciphertext, reference) {
  const index = new Map();
  for (let i = 0; i + 6 <= ciphertext.length; i++) {
    const k = ciphertext.slice(i, i + 6).join(",");
    if (!index.has(k)) index.set(k, []);
    index.get(k).push(i);
  }
  let exact = {count:0, cipherIndex:-1, sourceIndex:-1};
  let fuzzy = {count:0, cipherIndex:-1, sourceIndex:-1, errors:0, errorOffsets:[]};
  let seeds = 0;
  let qualified = 0;
  for (let j = 0; j + 6 <= reference.length; j++) {
    const key = reference.slice(j, j + 6).join(",");
    const hits = index.get(key) || [];
    for (const i of hits) {
      seeds++;
      let e = 6;
      while (e < 200 && i + e < ciphertext.length && j + e < reference.length &&
             ciphertext[i + e] === reference[j + e]) e++;
      if (e > exact.count) exact = {count:e, cipherIndex:i, sourceIndex:j};
      let f = 6;
      let errors = 0;
      const errorOffsets = [];
      while (f < 40 && i + f < ciphertext.length && j + f < reference.length) {
        if (ciphertext[i + f] !== reference[j + f]) {
          if (errors === 2) break;
          errors++;
          errorOffsets.push(f);
        }
        f++;
      }
      if (f > fuzzy.count) {
        fuzzy = {count:f, cipherIndex:i, sourceIndex:j, errors, errorOffsets};
      }
      if (f >= 20) qualified++;
    }
  }
  return {seeds, exact, fuzzy, qualified};
}

const CASES = [
  {id:"britannica-2012", source:"britannica-2012", n:186810,
   seeds:2333, exact:[8,2585,10831], fuzzy:[14,207,64624,7,13]},
  {id:"agrippa-2012", source:"agrippa-2012", n:1691,
   seeds:25, exact:[7,2557,1214], fuzzy:[10,28,1420,7,8]},
  {id:"mabinogion-context", source:"mabinogion-context", n:105582,
   seeds:4834, exact:[11,1654,23544], fuzzy:[14,1654,23544,11,13]},
  {id:"mabinogion-lady", source:"mabinogion-context", prefix:10395, n:10395,
   seeds:448, exact:[9,2363,1389], fuzzy:[12,2363,1389,9,11]},
];

/** @param {number[]} observed @param {number[]} expected */
function sameTriple(observed, expected) {
  assert.deepEqual(observed, expected);
}

function main() {
  const {lengths, runes} = originalWords();
  assert.equal(SOURCE.schema, 1);
  const sources = new Map(SOURCE.sources.map(s => [s.id, s]));
  const decoded = new Map();
  console.log("LP2 unknown corpus:", lengths.length, "words,", runes, "runes");
  for (const c of CASES) {
    const row = sources.get(c.source);
    assert.ok(row, "pinned source present: " + c.source);
    if (!decoded.has(c.source)) {
      const letters = unpack(row.encoded_lengths);
      assert.equal(letters.length, row.word_count);
      decoded.set(c.source, letters);
    }
    const full = decoded.get(c.source);
    const ref = c.prefix ? full.slice(0, c.prefix) : full;
    assert.equal(ref.length, c.n, c.id + " source word count");
    const result = scan(lengths, ref);
    assert.equal(result.seeds, c.seeds, c.id + " seed matches");
    assert.equal(result.qualified, 0, c.id + " 20-word alignment unexpected");
    sameTriple([result.exact.count, result.exact.cipherIndex, result.exact.sourceIndex], c.exact);
    sameTriple([result.fuzzy.count, result.fuzzy.cipherIndex,
      result.fuzzy.sourceIndex, ...result.fuzzy.errorOffsets], c.fuzzy);
    assert.equal(result.fuzzy.errors, 2);
    console.log(c.id + ":", JSON.stringify({
      sourceWords:ref.length, sixWordSeedAlignments:result.seeds,
      longestExact:result.exact, longestTwoMismatch:result.fuzzy,
      qualifiedTwentyWordCribs:result.qualified
    }));
  }
  const lady = decoded.get("mabinogion-context").slice(0, 10395);
  const plant = lengths.slice();
  plant.splice(1234, 40, ...lady.slice(333, 373));
  plant[1234 + 13]++;
  plant[1234 + 31]++;
  const positive = scan(plant, lady);
  assert.equal(positive.fuzzy.count, 40);
  assert.equal(positive.fuzzy.cipherIndex, 1234);
  assert.equal(positive.fuzzy.sourceIndex, 333);
  assert.deepEqual(positive.fuzzy.errorOffsets, [13, 31]);
  console.log("Hidden 40-word/2-length-error planted positive: recovered at",
    positive.fuzzy.cipherIndex, positive.fuzzy.sourceIndex);
  console.log("DECISION: no >=20-word source-locked LP2 crib from these three pinned books.");
}

if (require.main === module) main();
module.exports = {originalWords, scan, unpack};
