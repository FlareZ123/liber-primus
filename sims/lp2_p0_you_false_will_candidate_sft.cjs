"use strict";

/**
 * SFT: signed-2016 YOU/FALSE pointer bracket -> p0 word32 WILL candidate.
 *
 * The receiver page p0 is already independently selected by the established
 * GP0/p50 circuit. This test freezes the same base60 word-pointer grammar and
 * performs a complete p0 word-boundary census before using any plaintext value.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));
const transcription = fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-transcription.txt"), "utf8");
const signed = fs.readFileSync(
  path.join(root, "resources", "historical", "cicada2016-4gq25-outguess.asc"), "utf8");

const p0 = corpus.pages.find((page) => page.page === 0).indices;
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);
const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet59 = grid.alphabet.replace("f", "");

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/K/g, "C").replace(/V/g, "U")
    .replace(/Q/g, "C").replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const token = gpTokens.find((item) => normalized.startsWith(item.symbol, i));
    assert.ok(token, "unmapped GP spelling at " + word + ":" + i);
    out.push(token.value);
    i += token.symbol.length;
  }
  return out;
}

/** @param {number[]} xs @returns {number} */
const sum = (xs) => xs.reduce((a, b) => a + b, 0);

/** @returns {string[]} */
function signedWords() {
  const clear = signed
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .split(/\r?\n\r?\n/)
    .slice(1)
    .join("\n");
  return clear.split(/[^A-Za-z0-9]+/)
    .filter((token) => /^[A-Za-z]+$/.test(token));
}

/** @returns {{index:number,start:number,end:number,length:number,indices:number[]}[]} */
function p0Words() {
  const source = transcription.split(/\n%\n/)[0];
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;
  function flush() {
    if (!current.length) return;
    words.push({
      index: words.length,
      start,
      end: offset - 1,
      length: current.length,
      indices: current,
    });
    current = [];
  }
  for (const ch of [...source]) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (ch === "-" || ch === ".") {
      flush();
    }
  }
  flush();
  assert.equal(offset, p0.length);
  return words;
}

/** @param {string} token @returns {number} */
function base59(token) {
  const hi = alphabet59.indexOf(token[0]);
  const lo = alphabet59.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0);
  return 59 * hi + lo;
}

const message = signedWords();
assert.equal(message.length, 43);
assert.equal(message[32].toUpperCase(), "YOU");
assert.equal(message[33].toUpperCase(), "WILL");
assert.equal(message[39].toUpperCase(), "FALSE");
assert.equal(message[40].toUpperCase(), "PATHS");

const signedRows = message.map((word, index) => {
  const values = gp(word);
  const gp0 = sum(values);
  return {index, word: word.toUpperCase(), values, gp0};
});
assert.equal(signedRows[32].gp0, 30);
assert.equal(signedRows[39].gp0, 77);
assert.equal(grid.bytes[30], 141);
assert.equal(grid.bytes[77], 144);

const words = p0Words();
assert.equal(words.length, 59);
const receiver = words[32];
assert.deepEqual(
  {start: receiver.start, end: receiver.end, length: receiver.length},
  {start: 141, end: 144, length: 4}
);

function p0Brackets(table) {
  const mapped = signedRows.map((row) => ({...row, target: table[row.gp0]}));
  const hits = [];
  for (const word of words) {
    const starts = mapped.filter((row) => row.target === word.start);
    const ends = mapped.filter((row) => row.target === word.end);
    if (starts.length && ends.length) {
      hits.push({
        p0Word: word.index,
        start: word.start,
        end: word.end,
        length: word.length,
        starts: starts.map((row) => [row.index, row.word]),
        ends: ends.map((row) => [row.index, row.word]),
      });
    }
  }
  return hits;
}

const base60Brackets = p0Brackets(grid.bytes);
assert.deepEqual(base60Brackets, [{
  p0Word: 32,
  start: 141,
  end: 144,
  length: 4,
  starts: [[32, "YOU"]],
  ends: [[39, "FALSE"]],
}]);

const table59 = tokens.map(base59);
assert.deepEqual(p0Brackets(table59), []);

// The two source-successor candidates are both exactly four GP runes.
assert.equal(gp("WILL").length, 4);
assert.equal(gp("PATHS").length, 4);

const cipher = p0.slice(receiver.start, receiver.end + 1);
assert.deepEqual(cipher, [19,16,9,18]);

function keyFor(word) {
  const plain = gp(word);
  assert.equal(plain.length, cipher.length);
  return cipher.map((value, i) => (value - plain[i] + 29) % 29);
}
const willKey = keyFor("WILL");
const pathsKey = keyFor("PATHS");
assert.deepEqual(willKey, [12,6,18,27]);
assert.deepEqual(pathsKey, [6,21,7,3]);
assert.equal(sum(willKey), 63);
assert.equal(sum(pathsKey), 37);
assert.equal(sum(gp("LIES")), 63);

const signedAt63 = signedRows.filter((row) => row.gp0 === 63)
  .map((row) => row.word);
assert.deepEqual(signedAt63, ["LIES"]);
assert.deepEqual(signedRows.filter((row) => row.gp0 === 37), []);

// Body-only first-residue relation discovered from independently selected
// THE ROAD and THE DEVOTED cribs. It is a local p0 holdout, not a global cipher.
const bodyCribs = [
  {word:"THE", start:103, length:2},
  {word:"ROAD", start:105, length:4},
  {word:"THE", start:235, length:2},
  {word:"DEVOTED", start:237, length:7},
];
for (const row of bodyCribs) {
  const firstPlain = gp(row.word)[0];
  const firstKey = (p0[row.start] - firstPlain + 29) % 29;
  assert.equal(firstKey, 3 * row.length);
}
const predictedWillFirst = (p0[141] - 3 * receiver.length + 29) % 29;
assert.equal(predictedWillFirst, gp("WILL")[0]);
assert.notEqual(predictedWillFirst, gp("PATHS")[0]);

// Complete p0 signed-vocabulary family under that local first-rune relation:
// WILL is the sole assignment whose full derived key GP0 is itself the GP0 of
// any authenticated signed word.
const signedSums = new Map();
for (const row of signedRows) {
  if (!signedSums.has(row.gp0)) signedSums.set(row.gp0, []);
  signedSums.get(row.gp0).push(row.word);
}
const assignments = [];
for (const word of words.slice(2)) {
  const predictedFirst = (p0[word.start] - 3 * word.length + 29) % 29;
  for (const candidate of signedRows.filter((row) =>
    row.values.length === word.length && row.values[0] === predictedFirst)) {
    const localCipher = p0.slice(word.start, word.end + 1);
    const key = localCipher.map((value, i) =>
      (value - candidate.values[i] + 29) % 29);
    const keyGp0 = sum(key);
    assignments.push({
      p0Word: word.index,
      candidate: candidate.word,
      keyGp0,
      signedKeyWords: signedSums.get(keyGp0) || [],
    });
  }
}
assert.equal(assignments.length, 20);
const vocabularyKeyHits = assignments.filter((row) => row.signedKeyWords.length);
assert.deepEqual(vocabularyKeyHits, [{
  p0Word: 32,
  candidate: "WILL",
  keyGp0: 63,
  signedKeyWords: ["LIES"],
}]);

console.log(JSON.stringify({
  receiver: {page:0, word_zero_based:32, start:141, end:144, cipher},
  base60_exact_word_brackets_on_p0: base60Brackets,
  base59_exact_word_brackets_on_p0: [],
  source_successors: {
    after_YOU: "WILL",
    after_FALSE: "PATHS",
  },
  candidate_keys: {
    WILL: {
      values: willKey,
      gp0: sum(willKey),
      gp0_signed_word: "LIES",
      first_residue_equals_3x_length: true,
    },
    PATHS: {
      values: pathsKey,
      gp0: sum(pathsKey),
      gp0_signed_word: null,
      first_residue_equals_3x_length: false,
    },
  },
  body_first_residue_training_words: bodyCribs.map((row) => row.word),
  first_residue_vocabulary_assignments: assignments.length,
  assignments_with_authenticated_word_key_sum: vocabularyKeyHits,
  decision: "WILL is the strongly preferred source-constrained p0 word32 plaintext candidate",
}, null, 2));
