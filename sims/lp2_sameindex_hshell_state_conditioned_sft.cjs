"use strict";

/**
 * SFT: condition four-rune H-shell evidence on the canonical same-index
 * (GP length, GP0) receiver selector. Printed "/" line wraps and whitespace
 * do not terminate words.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const transcription = read("resources/liber-primus/lp2-transcription.txt");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signedSource = read("resources/historical/cicada2016-4gq25-outguess.asc");
const parts = transcription.split(/^\s*%\s*$/m);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function pageRaw(page) {
  if (page === 50) return "";
  return parts[page < 50 ? page : page - 1] || "";
}

function parseWords(raw) {
  const words = [];
  let values = [];
  let offset = 0;
  let start = 0;

  const flush = () => {
    if (!values.length) return;
    words.push({
      start,
      end: offset - 1,
      length: values.length,
      values: values.slice(),
      gp0: sum(values),
    });
    values = [];
  };

  for (const character of raw) {
    if (runeIndex.has(character)) {
      if (!values.length) start = offset;
      values.push(runeIndex.get(character));
      offset += 1;
    } else if (character === "/" || /\s/u.test(character)) {
      // Printed wraps/whitespace do not terminate a word.
    } else {
      flush();
    }
  }
  flush();
  return words;
}

function gp(word) {
  const normalized = word
    .toUpperCase()
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

function H(values) {
  assert.equal(values.length, 4);
  return [
    mod29(values[0] - values[3]),
    mod29(values[1] - values[2]),
    mod29(values[1] + values[2]),
    mod29(values[0] + values[3]),
  ];
}

const clear = signedSource.split("-----BEGIN PGP SIGNATURE-----")[0];
const body = clear.slice(clear.indexOf("Hello."));
const tokens = body
  .split(/[^A-Za-z0-9]+/)
  .filter((token) => /^[A-Za-z]+$/.test(token));
const source = tokens.map((word, index) => ({
  index,
  word: word.toUpperCase(),
  values: gp(word),
}));
assert.equal(source.length, 43);

const sameIndex = [];
for (const row of source) {
  const matches = parseWords(pageRaw(row.index)).filter((word) =>
    word.length === row.values.length && word.gp0 === sum(row.values)
  );
  if (matches.length) {
    sameIndex.push({
      index: row.index,
      word: row.word,
      gp0: sum(row.values),
      matches: matches.map((word) => ({
        start: word.start,
        end: word.end,
        values: word.values,
      })),
    });
  }
}

assert.deepEqual(
  sameIndex.map((row) => row.index),
  [6, 11, 21, 33, 34, 38, 40]
);

const fourRune = [];
for (const row of sameIndex) {
  if (row.values) continue;
  const target = source[row.index];
  if (target.values.length !== 4) continue;
  for (const receiver of row.matches) {
    const key = receiver.values.map((value, index) =>
      mod29(value - target.values[index])
    );
    const shell = H(key);
    fourRune.push({
      index: row.index,
      target: row.word,
      start: receiver.start,
      cipher: receiver.values,
      key,
      keySumMod29: mod29(sum(key)),
      shell,
    });
  }
}

assert.deepEqual(
  fourRune.map((row) => [row.index, row.target, row.start]),
  [
    [33, "WILL", 132],
    [40, "PATHS", 71],
  ]
);

const state = Object.freeze({
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
  e: 3,
  q: 4,
});
const stateValues = [...new Set(Object.values(state))];
const signedStateValues = [...new Set(
  stateValues.flatMap((value) => [value, mod29(-value)])
)];

for (const row of fourRune) {
  // Exact GP0 equality makes key sum zero.
  assert.equal(row.keySumMod29, 0);
  // H2=k1+k2, H3=k0+k3. Therefore H3=-H2 is automatic.
  assert.equal(row.shell[3], mod29(-row.shell[2]));
  assert.equal(row.shell[1], state.A);
  assert.ok(signedStateValues.includes(row.shell[0]));
  assert.ok(stateValues.includes(row.shell[2]));
}

console.log(JSON.stringify({
  status: "PASS",
  canonicalWordBoundary: {
    slashAndWhitespaceTerminateWord: false,
    consequence:
      "The apparent p36 JFPJ fragment is a printed-line fragment, not a complete four-rune word; GOOD36 is not a same-index state hit.",
  },
  sameIndex,
  fourRune,
  automaticIdentity: {
    statement:
      "For a four-rune receiver with exact target GP0, sum(key)=0 mod29, therefore H(key)[3]=-H(key)[2].",
    derivation:
      "H2=k1+k2 and H3=k0+k3; H2+H3=sum(key)=0 mod29.",
  },
  nonAutomaticCommonResidue: [
    "H(key)[1]=A=8",
    "H(key)[0] is a signed authenticated state value",
    "H(key)[2] is an authenticated state value",
  ],
  interpretation:
    "P33 WILL and p40 PATHS are the only canonical four-rune same-index state cases. Their -y coordinate is automatic from GP0 equality; the remaining shared state typing is retrospective and has no third same-index four-rune transfer available.",
}, null, 2));
