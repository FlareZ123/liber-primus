"use strict";

/**
 * SFT: condition H-shell evidence on the already-used same-index state selector.
 * Shows which shell coordinates are automatic from GP0 equality and which remain selective.
 *
 * Windows Node.js 22, CommonJS, no third-party dependencies.
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

const runeSet = new Set(corpus.runes);
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

function h(values) {
  assert.equal(values.length, 4);
  return [
    mod29(values[0] - values[3]),
    mod29(values[1] - values[2]),
    mod29(values[1] + values[2]),
    mod29(values[0] + values[3]),
  ];
}

function physicalPage(block) {
  return block < 50 ? block : block + 1;
}

function parseWords() {
  let block = 0;
  let page = 0;
  let pageOffset = 0;
  let startPage = null;
  let startOffset = null;
  let runes = [];
  const words = [];

  const close = () => {
    if (runes.length === 0) return;
    words.push({
      startPage,
      startOffset,
      endPage: page,
      endOffset: pageOffset - 1,
      values: runes.map((rune) => runeIndex.get(rune)),
    });
    startPage = null;
    startOffset = null;
    runes = [];
  };

  for (const ch of transcription) {
    if (runeSet.has(ch)) {
      if (runes.length === 0) {
        startPage = page;
        startOffset = pageOffset;
      }
      runes.push(ch);
      pageOffset += 1;
    } else if (ch === "-" || ch === "." || ch === "&" || ch === "$" || ch === "/" || ch === "\n") {
      close();
    } else if (ch === "%") {
      close();
      block += 1;
      page = physicalPage(block);
      pageOffset = 0;
    }
  }
  close();
  return words;
}

const clear = signedSource.split("-----BEGIN PGP SIGNATURE-----")[0];
const body = clear.slice(clear.indexOf("Hello."));
const tokens = body
  .split(/[^A-Za-z0-9]+/)
  .filter((token) => /^[A-Za-z]+$/.test(token));
const signed = tokens.map((word, index) => ({
  index,
  label: word.toUpperCase(),
  values: gp(word),
}));
assert.equal(signed.length, 43);

const words = parseWords();
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

const rows = [];
for (const target of signed) {
  const page = target.index;
  const matches = words.filter((word) =>
    word.startPage === page &&
    word.endPage === page &&
    word.values.length === target.values.length &&
    sum(word.values) === sum(target.values)
  );

  for (const receiver of matches) {
    const key = receiver.values.map((value, index) =>
      mod29(value - target.values[index])
    );
    const row = {
      index: target.index,
      target: target.label,
      start: receiver.startOffset,
      length: receiver.values.length,
      targetGp0: sum(target.values),
      receiverGp0: sum(receiver.values),
      key,
      keySumMod29: mod29(sum(key)),
      shell: receiver.values.length === 4 ? h(key) : null,
    };
    rows.push(row);
  }
}

assert.deepEqual(
  [...new Set(rows.map((row) => row.index))],
  [6, 11, 21, 33, 34, 36, 38, 40]
);

const fourRuneRows = rows.filter((row) => row.length === 4);
assert.deepEqual(
  [...new Set(fourRuneRows.map((row) => row.index))],
  [33, 36, 40]
);

// For any exact GP0-matched four-rune inverse, key sum is zero mod29.
// Under H=[k0-k3,k1-k2,k1+k2,k0+k3], this forces h3=-h2.
for (const row of fourRuneRows) {
  assert.equal(row.keySumMod29, 0);
  assert.equal(row.shell[3], mod29(-row.shell[2]));
}

const nonAutomatic = fourRuneRows.map((row) => ({
  ...row,
  secondIsA: row.shell[1] === state.A,
  firstIsSignedState: signedStateValues.includes(row.shell[0]),
  thirdIsState: stateValues.includes(row.shell[2]),
}));
assert.ok(nonAutomatic.every((row) =>
  row.secondIsA && row.firstIsSignedState && row.thirdIsState
));

console.log(JSON.stringify({
  status: "PASS",
  sameIndexStateRows: rows,
  sameIndexIndices: [...new Set(rows.map((row) => row.index))],
  fourRuneRows: nonAutomatic,
  automaticIdentity: {
    statement:
      "For a four-rune receiver with exact target GP0, sum(key)=0 mod29, therefore H(key)[3]=-H(key)[2].",
    derivation:
      "H2=k1+k2 and H3=k0+k3; H2+H3=sum(key)=0 mod29.",
  },
  genuinelyAdditionalConditions: [
    "H(key)[1]=A=8",
    "H(key)[0] is a signed authenticated state value",
    "H(key)[2] is an authenticated state value",
  ],
  interpretation:
    "The -y coordinate in the p33/p40 [x,A,y,-y] skeleton is automatic after same-state GP0 receiver selection. The surviving non-automatic common evidence is A in coordinate2 plus state-typed coordinates1/3.",
}, null, 2));
