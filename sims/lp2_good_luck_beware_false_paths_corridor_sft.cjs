"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signedText = read("resources/historical/cicada2016-4gq25-outguess.asc");
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

const clear = signedText.split("-----BEGIN PGP SIGNATURE-----")[0];
const signed = clear.slice(clear.indexOf("Hello."))
  .split(/[^A-Za-z0-9]+/)
  .filter((token) => /^[A-Za-z]+$/.test(token))
  .map((label, index) => ({ index, label: label.toUpperCase(), gp: gp(label) }));

assert.deepEqual(
  signed.slice(36, 41).map((word) => word.label),
  ["GOOD", "LUCK", "BEWARE", "FALSE", "PATHS"]
);

/**
 * @param {number[]} cipher
 * @param {number[]} key
 * @returns {number[]}
 */
function subtract(cipher, key) {
  assert.equal(cipher.length, key.length);
  return cipher.map((value, index) => mod29(value - key[index]));
}

const rows = [
  {
    index: 36,
    page: 36,
    start: 169,
    raw: corpus.pages[36].indices.slice(169, 174),
    prepare: (raw) => [raw[0], raw[1], raw[3], raw[4]],
    key: [25,19,27,26],
  },
  {
    index: 37,
    page: 37,
    start: 146,
    raw: corpus.pages[37].indices.slice(146, 150),
    prepare: (raw) => raw,
    key: [12,1,1,22],
  },
  {
    index: 38,
    page: 38,
    start: 57,
    raw: corpus.pages[38].indices.slice(57, 63),
    prepare: (raw) => raw,
    key: [20,7,7,7,13,4],
  },
  {
    index: 39,
    page: 39,
    start: 132,
    raw: corpus.pages[39].indices.slice(132, 137),
    prepare: (raw) => raw,
    key: [19,12,19,2,5],
  },
  {
    index: 40,
    page: 40,
    start: 71,
    raw: corpus.pages[40].indices.slice(71, 75),
    prepare: (raw) => raw,
    key: [20,20,12,6],
  },
];

assert.deepEqual(rows.map((row) => row.raw), [
  [2,22,4,1,20],
  [3,2,6,27],
  [8,25,14,2,17,22],
  [19,7,10,17,23],
  [4,15,14,21],
]);

const recovered = rows.map((row) => {
  if (row.index === 36) assert.equal(row.raw[2], 4);
  const prepared = row.prepare(row.raw);
  const plain = subtract(prepared, row.key);
  assert.deepEqual(plain, signed[row.index].gp);
  return {
    index: row.index,
    page: row.page,
    start: row.start,
    cipher: row.raw,
    key: row.key,
    plain,
    label: signed[row.index].label,
  };
});

assert.deepEqual(
  recovered.map((row) => row.label),
  ["GOOD", "LUCK", "BEWARE", "FALSE", "PATHS"]
);

console.log(JSON.stringify({
  status: "PASS",
  note: "Arithmetic synthesis only; local receiver/key evidence is documented in the five source reports.",
  recovered,
}, null, 2));
