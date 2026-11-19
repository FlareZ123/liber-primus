"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");

const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
const tableTokens = grid.pages.flatMap((page) => page.tokens);
const parts = transcription.split(/^\s*%\s*$/m);
const runeSet = new Set(corpus.runes);
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21); offset += 3; continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27); offset += 2; continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + word);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {string} token @param {string} alphabet @returns {number} */
function decodeToken(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}

/** @param {string} text @returns {{index:number,start:number,end:number,length:number}[]} */
function pageWords(text) {
  const words = [];
  let length = 0;
  let start = 0;
  let runeOffset = 0;
  const flush = () => {
    if (!length) return;
    words.push({index: words.length + 1, start, end: runeOffset - 1, length});
    length = 0;
  };
  for (const char of [...text]) {
    if (runeSet.has(char)) {
      if (!length) start = runeOffset;
      length += 1;
      runeOffset += 1;
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return words;
}

/** @param {number} offset @param {{start:number,end:number}[]} words */
function containingWord(offset, words) {
  return words.find((word) => word.start <= offset && offset <= word.end);
}

const paths = gp("PATHS");
assert.deepEqual(paths, [13, 24, 2, 15]);
const pathsGp0 = paths.reduce((sum, value) => sum + value, 0);
assert.equal(pathsGp0, 54);
assert.equal(tableTokens[pathsGp0], "2a");

const values = {
  base59: decodeToken("2a", alphabet59),
  base60: decodeToken("2a", alphabet60),
};
assert.deepEqual(values, {base59: 154, base60: 156});

const p0Words = pageWords(parts[0]);
const receiverModes = [];
for (const [radix, value] of Object.entries(values)) {
  for (const origin of [0, 1]) {
    const offset = value - origin;
    const word = containingWord(offset, p0Words);
    assert.ok(word);
    receiverModes.push({radix, origin, value, offset, word});
  }
}
assert.deepEqual(receiverModes, [
  {radix: "base59", origin: 0, value: 154, offset: 154,
    word: {index: 36, start: 154, end: 157, length: 4}},
  {radix: "base59", origin: 1, value: 154, offset: 153,
    word: {index: 35, start: 151, end: 153, length: 3}},
  {radix: "base60", origin: 0, value: 156, offset: 156,
    word: {index: 36, start: 154, end: 157, length: 4}},
  {radix: "base60", origin: 1, value: 156, offset: 155,
    word: {index: 36, start: 154, end: 157, length: 4}},
]);

const clear = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\r?\n\r?\n/).slice(1).join("\n");
const message = (clear.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [])\n  .map((word) => word.toUpperCase());
const pathsIndex = message.indexOf("PATHS");
assert.ok(pathsIndex >= 0);
const continuation = message.slice(pathsIndex + 1);
assert.deepEqual(continuation, ["VERIFY", "OPENPGP"]);
const continuationGpLengths = continuation.map((word) => ({
  word, length: gp(word).length,
}));
assert.deepEqual(continuationGpLengths, [
  {word: "VERIFY", length: 6},
  {word: "OPENPGP", length: 7},
]);

const receiverLengths = [...new Set(receiverModes.map((row) => row.word.length))];
assert.deepEqual(receiverLengths, [4, 3]);
assert.equal(
  continuationGpLengths.some((target) => receiverLengths.includes(target.length)),
  false
);

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "prospective stop: frozen GP0(word)->p50 token->p0 offset navigation has no PATHS continuation under either documented radix and either zero/one-based offset origin",
  paths: {gp: paths, gp0: pathsGp0, token: tableTokens[pathsGp0]},
  receiverModes,
  continuationGpLengths,
}, null, 2));
