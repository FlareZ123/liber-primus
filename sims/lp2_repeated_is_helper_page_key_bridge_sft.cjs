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
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const p50 = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const screen2013 = read("resources/historical/cicada2013-os-original-message.txt");
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let index = 0; index < normalized.length;) {
    if (normalized.startsWith("ING", index)) {
      out.push(21);
      index += 3;
      continue;
    }
    if (normalized.startsWith("IO", index)) {
      out.push(27);
      index += 2;
      continue;
    }
    const token = gpTokens.find((row) =>
      normalized.startsWith(row.symbol, index)
    );
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(index));
    out.push(token.value);
    index += token.symbol.length;
  }
  return out;
}

/** @param {string} text @returns {number} */
function gp0(text) {
  return text
    .split(/[^A-Za-z]+/u)
    .filter(Boolean)
    .flatMap(gp)
    .reduce((sum, value) => sum + value, 0);
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/**
 * @param {number} page
 * @returns {{page:number,ordinal0:number,start:number,values:number[]}[]}
 */
function pageWords(page) {
  const source = physicalPart(page);
  const out = [];
  let current = [];
  let start = 0;
  let offset = 0;

  const flush = () => {
    if (!current.length) return;
    out.push({page, ordinal0: out.length, start, values: current.slice()});
    current = [];
  };

  for (const ch of source) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (ch === "-" || ch === "." || ch === "&") {
      flush();
    } else if (ch === "/" || /\s/u.test(ch)) {
      // line wraps preserve a word
    } else {
      flush();
    }
  }
  flush();
  return out;
}

/** @param {[number,number]} pair @returns {[number,number]} */
function h(pair) {
  return [mod29(pair[0] - pair[1]), mod29(pair[0] + pair[1])];
}

/** @param {number} scalar @returns {[number,number]} */
function scalarKey(scalar) {
  return [mod29(scalar * 15), mod29(-scalar * 15)];
}

const clear = signed2016.split("-----BEGIN PGP SIGNATURE-----")[0];
const sourceWords = clear
  .slice(clear.indexOf("Hello."))
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());

assert.equal(sourceWords.length, 43);
assert.equal(sourceWords[11], "IS");
assert.equal(sourceWords[21], "IS");
assert.equal(sourceWords[33], "WILL");

// P11.
const p11 = pageWords(11)[11];
assert.deepEqual(p11, {
  page: 11,
  ordinal0: 11,
  start: 49,
  values: [11, 14],
});
assert.equal(sourceWords[p11.ordinal0], "IS");
assert.equal(gp0(sourceWords[p11.ordinal0]), 25);
assert.deepEqual(
  [mod29(p11.values[0] + p11.values[1]), mod29(p11.values[0] - p11.values[1])],
  [25, 26]
);

assert.ok(screen2013.includes("Good luck."));
assert.equal(gp0("GOOD LUCK"), 66);
const table = p50.rows.flat();
assert.equal(table[66], "0P");
assert.equal(p50.alphabet.indexOf("P"), 25);

// Reconstruct the independently audited p25 side object.
const p25Words = pageWords(25);
const p25Word30 = p25Words[29];
assert.equal(p25Word30.start, 145);
assert.deepEqual(p25Word30.values, [3, 20, 10, 11, 16]);

const p25Runes = corpus.pages.find((page) => page.page === 25).indices;
const p25Predecessor = p25Runes[p25Word30.start - 1];
assert.equal(p25Predecessor, 18);
const p25Source = [p25Predecessor, ...p25Word30.values];
assert.deepEqual(p25Source, [18, 3, 20, 10, 11, 16]);
const p25Outer = h([p25Source[0], p25Source.at(-1)]);
assert.deepEqual(p25Outer, [2, 5]);

const p11Scalar = p25Outer[0];
assert.equal(p11Scalar, 2);
const p11Key = scalarKey(p11Scalar);
assert.deepEqual(p11Key, [1, 28]);
const p11Plain = p11.values.map((value, slot) =>
  mod29(value - p11Key[slot])
);
assert.deepEqual(p11Plain, gp("IS"));

// P21.
const target21 = gp("IS");
const target21Gp0 = target21.reduce((sum, value) => sum + value, 0);
const p21Candidates = pageWords(21).filter((word) =>
  word.values.length === target21.length &&
  word.values.reduce((sum, value) => sum + value, 0) === target21Gp0
);
assert.equal(p21Candidates.length, 1);
const p21 = p21Candidates[0];
assert.deepEqual(p21, {
  page: 21,
  ordinal0: 33,
  start: 170,
  values: [24, 1],
});
assert.deepEqual(h(p21.values), [23, 25]);
assert.equal(sourceWords[p21.ordinal0], "WILL");
assert.equal(gp0(sourceWords[p21.ordinal0]), 57);

// Solved p57 FIND route.
assert.equal(gp0("FIND"), 42);
assert.equal(table[42], "0S");
const p21Scalar = p50.alphabet.indexOf(table[42][1]);
assert.equal(p21Scalar, 28);
const p21Key = scalarKey(p21Scalar);
assert.deepEqual(p21Key, [14, 15]);
const p21Plain = p21.values.map((value, slot) =>
  mod29(value - p21Key[slot])
);
assert.deepEqual(p21Plain, gp("IS"));

// Finite receiver-ordinal source-word context.
const expected = [
  [6, 28, "THE", 20],
  [11, 11, "IS", 25],
  [21, 33, "WILL", 57],
  [33, 34, "BE", 35],
  [34, 2, "PATH", 39],
  [38, 11, "IS", 25],
  [40, 16, "ARE", 46],
];
for (const [page, ordinal0, word, wordGp0] of expected) {
  assert.equal(sourceWords[ordinal0], word);
  assert.equal(gp0(word), wordGp0);
}
assert.deepEqual(
  expected.filter((row) => row[3] === 56 || row[3] === 57),
  [[21, 33, "WILL", 57]]
);

console.log(JSON.stringify({
  status: "PASS",
  p11: {
    receiver: p11,
    ordinalSourceWord: sourceWords[p11.ordinal0],
    helperPage: gp0(sourceWords[p11.ordinal0]),
    helperState: {page: 25, outerH: p25Outer},
    scalar: p11Scalar,
    key: p11Key,
    plaintext: "IS",
  },
  p21: {
    receiver: p21,
    ordinalSourceWord: sourceWords[p21.ordinal0],
    helperPage: gp0(sourceWords[p21.ordinal0]),
    helperRoute: {
      page: 57,
      imperative: "FIND",
      gp0: 42,
      p50Token: table[42],
      low60: p21Scalar,
    },
    scalar: p21Scalar,
    key: p21Key,
    plaintext: "IS",
  },
  receiverOrdinalContext: expected.map(
    ([page, ordinal0, word, wordGp0]) => ({page, ordinal0, word, gp0: wordGp0})
  ),
}, null, 2));
