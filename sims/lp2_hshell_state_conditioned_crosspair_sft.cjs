"use strict";

/**
 * SFT: charge the non-automatic four-rune H-shell residue over the complete
 * 43 signed words x 43 physical pages source-state matrix.
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

const mod29 = (value) => ((value % 29) + 29) % 29;
const sum = (values) => values.reduce((total, value) => total + value, 0);

function pageRaw(page) {
  return parts[page] || "";
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
      values: values.slice(),
      length: values.length,
      gp0: sum(values),
    });
    values = [];
  };
  for (const ch of raw) {
    if (runeIndex.has(ch)) {
      if (!values.length) start = offset;
      values.push(runeIndex.get(ch));
      offset += 1;
    } else if (ch === "/" || /\s/u.test(ch)) {
      // Printed wrap/whitespace: continue current word.
    } else {
      flush();
    }
  }
  flush();
  return words;
}

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
    const token = gpTokens.find((row) => normalized.startsWith(row.symbol, offset));
    assert.ok(token, "unmapped " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

function H(key) {
  assert.equal(key.length, 4);
  return [
    mod29(key[0] - key[3]),
    mod29(key[1] - key[2]),
    mod29(key[1] + key[2]),
    mod29(key[0] + key[3]),
  ];
}

const clear = signedSource.split("-----BEGIN PGP SIGNATURE-----")[0];
const body = clear.slice(clear.indexOf("Hello."));
const source = body.split(/[^A-Za-z0-9]+/)
  .filter((token) => /^[A-Za-z]+$/.test(token))
  .map((word, index) => ({
    index,
    word: word.toUpperCase(),
    values: gp(word),
  }));
assert.equal(source.length, 43);

const state = Object.freeze({
  p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3, q: 4,
});
const stateValues = [...new Set(Object.values(state))];
const signedStateValues = [...new Set(
  stateValues.flatMap((value) => [value, mod29(-value)])
)];

const rows = [];
for (let page = 0; page < 43; page += 1) {
  const words = parseWords(pageRaw(page));
  for (const target of source) {
    if (target.values.length !== 4) continue;
    const matches = words.filter((word) =>
      word.length === 4 && word.gp0 === sum(target.values)
    );
    if (matches.length !== 1) continue;

    const receiver = matches[0];
    const key = receiver.values.map((value, index) =>
      mod29(value - target.values[index])
    );
    const shell = H(key);
    assert.equal(mod29(sum(key)), 0);
    assert.equal(shell[3], mod29(-shell[2]));

    rows.push({
      page,
      index: target.index,
      target: target.word,
      start: receiver.start,
      shell,
      identity: page === target.index,
      h0SignedState: signedStateValues.includes(shell[0]),
      h1IsA: shell[1] === state.A,
      h2State: stateValues.includes(shell[2]),
    });
  }
}

const residueHits = rows.filter((row) =>
  row.h0SignedState && row.h1IsA && row.h2State
);
const identityRows = rows.filter((row) => row.identity);
const identityResidueHits = residueHits.filter((row) => row.identity);

assert.equal(rows.length, 62);
assert.deepEqual(
  residueHits.map((row) => [row.page, row.index, row.target, row.start, row.shell]),
  [
    [33, 33, "WILL", 132, [23, 8, 2, 27]],
    [40, 40, "PATHS", 71, [14, 8, 3, 26]],
  ]
);
assert.deepEqual(identityResidueHits, residueHits);

console.log(JSON.stringify({
  status: "PASS",
  uniqueFourRuneStatePairs: rows.length,
  residualCriterion:
    "H0 in signed state, H1=A=8, H2 in state; H3=-H2 is excluded because GP0 equality forces it.",
  residueHits,
  residueHitCount: residueHits.length,
  identityRows,
  identityResidueHits,
  interpretation:
    "This is the correct familywise control for the p33/p40 shared H-shell residue after conditioning on exact four-rune source-state selection.",
}, null, 2));
