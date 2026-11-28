"use strict";

/**
 * Literal GP30 separator-completed Playfair gate.
 *
 * Complete the original 15x2 Gematria Primus chart by placing one printed
 * word-separator symbol in its only missing lower-right cell. Pair continuously
 * from the first p0 rune and apply conventional rectangular Playfair inverse.
 * No keyword, phase, alternate board, or hole repair is searched.
 *
 * SFT: node sims/lp2_gp30_separator_playfair_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8")
  .replace(/\r\n/g, "\n");

const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
const SEP = 29;

/** @param {string} raw @returns {number[] | null} */
function encodeWord(raw) {
  const s = raw.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith("ING", i)) {
      out.push(21);
      i += 3;
      continue;
    }
    if (s.startsWith("IO", i)) {
      out.push(27);
      i += 2;
      continue;
    }
    const token = tokens.find((x) => s.startsWith(x.s, i));
    if (!token) return null;
    out.push(token.i);
    i += token.s.length;
  }
  return out;
}

function originalWords() {
  const raw = read("resources/lp2-transcription.txt");
  const stream = raw.split("%").slice(0, 55).join("%");
  const words = [];
  let word = [];
  const finish = () => {
    if (word.length) words.push(word);
    word = [];
  };
  for (const ch of stream) {
    if (runeIndex.has(ch)) word.push(runeIndex.get(ch));
    else if (ch === "%" || ch === "/" || /\s/u.test(ch)) {}
    else finish();
  }
  finish();
  assert.equal(words.length, 2896);
  assert.equal(words.flat().length, 12956);
  return words;
}

/** @param {number[][]} words */
const tapeFromWords = (words) => words.flatMap((word) => [...word, SEP]);

/** @param {number} symbol @returns {[number, number]} */
const coordinate = (symbol) => symbol < 15
  ? [symbol, 0]
  : [symbol - 15, 1];

/** @param {number} row @param {number} column */
const symbolAt = (row, column) => column === 0 ? row : 15 + row;

/**
 * Conventional rectangular Playfair pair transform.
 * dir=+1 is forward encryption; dir=-1 is inverse decryption.
 * Equal pairs use shared-row priority, matching the prior domain audit.
 *
 * @param {number} a
 * @param {number} b
 * @param {1|-1} dir
 * @returns {[number, number]}
 */
function pairTransform(a, b, dir) {
  const [ra, ca] = coordinate(a);
  const [rb, cb] = coordinate(b);
  if (ra === rb)
    return [symbolAt(ra, 1 - ca), symbolAt(rb, 1 - cb)];
  if (ca === cb)
    return [
      symbolAt((ra + dir + 15) % 15, ca),
      symbolAt((rb + dir + 15) % 15, cb)
    ];
  return [symbolAt(ra, cb), symbolAt(rb, ca)];
}

/** @param {number[]} tape @param {1|-1} dir */
function transform(tape, dir) {
  assert.equal(tape.length % 2, 0);
  const out = [];
  for (let i = 0; i < tape.length; i += 2)
    out.push(...pairTransform(tape[i], tape[i + 1], dir));
  return out;
}

/** @param {number[]} tape */
function splitAtSeparators(tape) {
  const words = [];
  let word = [];
  for (const symbol of tape) {
    if (symbol === SEP) {
      if (word.length) words.push(word);
      word = [];
    } else {
      word.push(symbol);
    }
  }
  if (word.length) words.push(word);
  return words;
}

const sourceWords = originalWords();
const sourceTape = tapeFromWords(sourceWords);
assert.equal(sourceTape.length, 15852);
assert.equal(sourceTape.length % 2, 0);

const decodedTape = transform(sourceTape, -1);
const decodedWords = splitAtSeparators(decodedTape);
const separators = decodedTape.filter((x) => x === SEP).length;
assert.equal(separators, 548);
assert.equal(decodedWords.length, 535);

const dictionary = new Set(
  read("resources/control/english_wordfreq_textblob.txt")
    .split("\n")
    .filter((line) => /^[a-z]+\s+\d+$/.test(line))
    .map((line) => encodeWord(line.split(/\s+/)[0]))
    .filter(Boolean)
    .map((word) => word.join(","))
);

let n4 = 0, m4 = 0, n5 = 0, m5 = 0;
for (const word of decodedWords) {
  const hit = dictionary.has(word.join(","));
  if (word.length >= 4) {
    n4++;
    m4 += Number(hit);
  }
  if (word.length >= 5) {
    n5++;
    m5 += Number(hit);
  }
}
assert.deepEqual([n4, m4, n5, m5], [493, 0, 472, 0]);

// Nontrivial native-English positive control.
const controlWords = (read("resources/control/shakespeare_first300k.txt")
  .toUpperCase().match(/[A-Z]+/g) || [])
  .slice(0, 300).map(encodeWord).filter(Boolean);
const clearControl = tapeFromWords(controlWords);
assert.equal(clearControl.length, 1534);
const encryptedControl = transform(clearControl, +1);
const recoveredControl = transform(encryptedControl, -1);
assert.deepEqual(recoveredControl, clearControl);

console.log(JSON.stringify({
  original: {
    inputWords: sourceWords.length,
    inputRunes: sourceWords.flat().length,
    inputSeparators: sourceWords.length,
    inputSymbols: sourceTape.length,
    decodedSeparators: separators,
    decodedWords: decodedWords.length,
    decodedWordsLengthAtLeast4: [m4, n4],
    decodedWordsLengthAtLeast5: [m5, n5]
  },
  positive: {
    words: controlWords.length,
    symbols: clearControl.length,
    cipherSeparators: encryptedControl.filter((x) => x === SEP).length,
    exactRoundtrip: true
  }
}, null, 2));
