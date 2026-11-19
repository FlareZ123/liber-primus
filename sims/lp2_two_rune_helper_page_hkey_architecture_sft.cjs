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
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
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
    assert.ok(token);
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

/** @param {number} page @returns {{page:number,ordinal0:number,start:number,values:number[]}[]} */
function pageWords(page) {
  const source = parts[page <= 49 ? page : page - 1];
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
      // line wrap preserves word
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

// P11.
const p11 = pageWords(11)[11];
assert.deepEqual(p11, {page:11,ordinal0:11,start:49,values:[11,14]});
assert.equal(sourceWords[p11.ordinal0], "IS");
assert.equal(gp0("IS"), 25);
assert.ok(screen2013.includes("Good luck."));
assert.equal(gp0("GOOD LUCK"), 66);
const table = grid.rows.flat();
assert.equal(table[66], "0P");
assert.equal(grid.alphabet.indexOf("P"), 25);

const p25Word30 = pageWords(25)[29];
assert.deepEqual(p25Word30, {
  page:25, ordinal0:29, start:145, values:[3,20,10,11,16],
});
const p25 = corpus.pages.find((page) => page.page === 25);
assert.ok(p25);
const predecessor = p25.indices[p25Word30.start - 1];
assert.equal(predecessor, 18);
const p25Outer = h([predecessor, p25Word30.values.at(-1)]);
assert.deepEqual(p25Outer, [2,5]);
const p11Key = scalarKey(p25Outer[0]);
assert.deepEqual(p11Key, [1,28]);
assert.deepEqual(
  p11.values.map((value, slot) => mod29(value - p11Key[slot])),
  gp("IS")
);

// P21.
const isTarget = gp("IS");
const p21Matches = pageWords(21).filter((word) =>
  word.values.length === 2 &&
  word.values.reduce((a,b) => a+b, 0) === gp0("IS")
);
assert.equal(p21Matches.length, 1);
const p21 = p21Matches[0];
assert.deepEqual(p21, {page:21,ordinal0:33,start:170,values:[24,1]});
assert.equal(sourceWords[p21.ordinal0], "WILL");
assert.equal(gp0("WILL"), 57);
assert.equal(gp0("FIND"), 42);
assert.equal(table[42], "0S");
const p21Scalar = grid.alphabet.indexOf("S");
assert.equal(p21Scalar, 28);
const p21Key = scalarKey(p21Scalar);
assert.deepEqual(p21Key, [14,15]);
assert.deepEqual(
  p21.values.map((value, slot) => mod29(value - p21Key[slot])),
  isTarget
);

// P34.
const p34 = pageWords(34)[2];
assert.deepEqual(p34, {page:34,ordinal0:2,start:4,values:[12,23]});
assert.equal(sourceWords[p34.ordinal0], "PATH");
assert.equal(gp0("PATH"), 39);

const p39 = corpus.pages.find((page) => page.page === 39);
assert.ok(p39);
const p39Red = p39.indices.slice(119, 122);
assert.deepEqual(p39Red, [27,5,15]);
const p39H1 = h([p39Red[0], p39Red[1]]);
const p39H2 = h(p39H1);
assert.deepEqual(p39H1, [22,3]);
assert.deepEqual(p39H2, [19,25]);
assert.equal(p39H2[0], 19);
assert.equal(gp0("WE"), 25);

const p34Key = scalarKey(p39H2[0]);
assert.deepEqual(p34Key, [24,5]);
assert.deepEqual(
  p34.values.map((value, slot) => mod29(value - p34Key[slot])),
  gp("BE")
);

// The three exact-GP0 two-rune successes in the finite class.
assert.deepEqual([
  {
    page:11,
    target:"IS",
    helperWord:sourceWords[p11.ordinal0],
    helperPage:gp0(sourceWords[p11.ordinal0]),
    scalar:p25Outer[0],
  },
  {
    page:21,
    target:"IS",
    helperWord:sourceWords[p21.ordinal0],
    helperPage:gp0(sourceWords[p21.ordinal0]),
    scalar:p21Scalar,
  },
  {
    page:34,
    target:"BE",
    helperWord:sourceWords[p34.ordinal0],
    helperPage:gp0(sourceWords[p34.ordinal0]),
    scalar:p39H2[0],
  },
], [
  {page:11,target:"IS",helperWord:"IS",helperPage:25,scalar:2},
  {page:21,target:"IS",helperWord:"WILL",helperPage:57,scalar:28},
  {page:34,target:"BE",helperWord:"PATH",helperPage:39,scalar:19},
]);

console.log(JSON.stringify({
  status:"PASS",
  architecture:[
    {
      page:11,
      receiver:p11,
      target:"IS",
      sourceWord:"IS",
      helperPage:25,
      helperMechanism:"p25 unique outer H [K,g]",
      scalar:2,
      key:p11Key,
    },
    {
      page:21,
      receiver:p21,
      target:"IS",
      sourceWord:"WILL",
      helperPage:57,
      helperMechanism:"solved FIND -> p50[42]=0S -> low60",
      scalar:28,
      key:p21Key,
    },
    {
      page:34,
      receiver:p34,
      target:"BE",
      sourceWord:"PATH",
      helperPage:39,
      helperMechanism:"p39 red [-K,g,b], repeated H emits [B,GP0(WE)]",
      scalar:19,
      key:p34Key,
    },
  ],
}, null, 2));
