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
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
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

/**
 * Canonical printed words. Slash/whitespace preserve wrapped words.
 * @param {number} page
 * @returns {{page:number,ordinal0:number,start:number,values:number[]}[]}
 */
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
      // preserve line-wrapped word
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
  const inverse2 = 15;
  return [
    mod29(scalar * inverse2),
    mod29(-scalar * inverse2),
  ];
}

const clear = signed2016.split("-----BEGIN PGP SIGNATURE-----")[0];
const signedWords = clear
  .slice(clear.indexOf("Hello."))
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());
assert.equal(signedWords.length, 43);

const receivers = [];
for (let index = 0; index < signedWords.length; index += 1) {
  const target = gp(signedWords[index]);
  const targetGp0 = target.reduce((sum, value) => sum + value, 0);

  for (const local of pageWords(index)) {
    if (
      local.values.length === target.length &&
      local.values.reduce((sum, value) => sum + value, 0) === targetGp0
    ) {
      receivers.push({
        sourceIndex: index,
        targetWord: signedWords[index],
        target,
        ...local,
      });
    }
  }
}

assert.equal(receivers.length, 8);
assert.deepEqual(
  [...new Set(receivers.map((row) => row.sourceIndex))],
  [6, 11, 21, 33, 34, 38, 40]
);

const familyRows = [];
for (const receiver of receivers) {
  for (const origin of [0, 1]) {
    const sourceOrdinal = receiver.ordinal0 + origin;
    if (sourceOrdinal < 0 || sourceOrdinal >= signedWords.length) continue;

    const keyWord = signedWords[sourceOrdinal];
    const scalar = gp(keyWord).reduce((sum, value) => sum + value, 0) % 29;
    const key = scalarKey(scalar);

    for (const sign of [-1, 1]) {
      const output = receiver.values.map((value, slot) =>
        mod29(value + sign * key[slot])
      );
      familyRows.push({
        page: receiver.page,
        targetWord: receiver.targetWord,
        start: receiver.start,
        ordinal0: receiver.ordinal0,
        origin,
        sourceOrdinal,
        keyWord,
        scalar,
        key,
        sign,
        output,
        exact: output.every(
          (value, slot) => value === receiver.target[slot]
        ),
      });
    }
  }
}

assert.equal(familyRows.length, 28);
const hits = familyRows.filter((row) => row.exact);
assert.deepEqual(hits, [
  {
    page: 21,
    targetWord: "IS",
    start: 170,
    ordinal0: 33,
    origin: 0,
    sourceOrdinal: 33,
    keyWord: "WILL",
    scalar: 28,
    key: [14, 15],
    sign: -1,
    output: [10, 15],
    exact: true,
  },
  {
    page: 34,
    targetWord: "BE",
    start: 4,
    ordinal0: 2,
    origin: 0,
    sourceOrdinal: 2,
    keyWord: "PATH",
    scalar: 10,
    key: [5, 24],
    sign: 1,
    output: [17, 18],
    exact: true,
  },
]);

const p21 = receivers.find((row) => row.sourceIndex === 21);
assert.ok(p21);
assert.deepEqual(p21.values, [24, 1]);
assert.deepEqual(h(p21.values), [23, 25]);
assert.equal(p21.ordinal0, 33);
assert.equal(signedWords[33], "WILL");
assert.equal(gp("WILL").reduce((sum, value) => sum + value, 0), 57);
assert.deepEqual(scalarKey(28), [14, 15]);

const p34 = receivers.find(
  (row) => row.sourceIndex === 34 && row.start === 4
);
assert.ok(p34);
assert.deepEqual(p34.values, [12, 23]);
assert.equal(p34.ordinal0, 2);
assert.equal(signedWords[2], "PATH");
assert.equal(gp("PATH").reduce((sum, value) => sum + value, 0), 39);
assert.deepEqual(scalarKey(10), [5, 24]);
assert.deepEqual(
  scalarKey(10).map((value) => mod29(-value)),
  [24, 5]
);

let completeTwoRuneWords = 0;
let rawPacketOccurrences = 0;
let rawShellOccurrences = 0;
const distinctTwoRuneTargets = [];
for (const word of signedWords) {
  const values = gp(word);
  if (
    values.length === 2 &&
    !distinctTwoRuneTargets.some((row) => row.word === word)
  ) {
    distinctTwoRuneTargets.push({word, values});
  }
}
assert.deepEqual(
  distinctTwoRuneTargets.map((row) => row.word),
  ["THE", "IS", "BE"]
);

const fixedKey = [14, 15];
const fixedKeyHits = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  for (const local of pageWords(page)) {
    if (local.values.length !== 2) continue;
    completeTwoRuneWords += 1;

    if (local.values.every((value, slot) => value === p21.values[slot])) {
      rawPacketOccurrences += 1;
    }
    const shell = h(local.values);
    if (shell[0] === 23 && shell[1] === 25) {
      rawShellOccurrences += 1;
    }

    for (const sign of [-1, 1]) {
      const output = local.values.map((value, slot) =>
        mod29(value + sign * fixedKey[slot])
      );
      for (const target of distinctTwoRuneTargets) {
        if (output.every((value, slot) => value === target.values[slot])) {
          fixedKeyHits.push({
            page,
            start: local.start,
            ordinal0: local.ordinal0,
            sign,
            target: target.word,
          });
        }
      }
    }
  }
}

assert.equal(completeTwoRuneWords, 465);
assert.equal(rawPacketOccurrences, 1);
assert.equal(rawShellOccurrences, 1);
assert.equal(fixedKeyHits.length, 5);
assert.ok(
  fixedKeyHits.some(
    (row) =>
      row.page === 21 &&
      row.start === 170 &&
      row.sign === -1 &&
      row.target === "IS"
  )
);

console.log(JSON.stringify({
  status: "PASS",
  receiverFamily: {
    receivers: receivers.length,
    pages: [...new Set(receivers.map((row) => row.sourceIndex))],
    chargedOriginSignConfigurations: familyRows.length,
    hits,
  },
  p21: {
    receiver: {
      page: p21.page,
      ordinal0: p21.ordinal0,
      start: p21.start,
      cipher: p21.values,
    },
    rawShell: h(p21.values),
    rawPacketOccurrences,
    rawShellOccurrences,
    keySource: {
      sourceOrdinal: 33,
      word: "WILL",
      gp0: 57,
      scalarMod29: 28,
      key: fixedKey,
    },
    plaintext: "IS",
  },
  p34IndependentConvergence: {
    receiver: {
      page: p34.page,
      ordinal0: p34.ordinal0,
      start: p34.start,
      cipher: p34.values,
    },
    keyWord: "PATH",
    scalarMod29: 10,
    additiveKey: [5, 24],
    equivalentSubtractiveKey: [24, 5],
    plaintext: "BE",
  },
  fixedKeyControl: {
    completeTwoRuneWords,
    targets: distinctTwoRuneTargets.map((row) => row.word),
    configurations:
      completeTwoRuneWords * distinctTwoRuneTargets.length * 2,
    hits: fixedKeyHits,
  },
}, null, 2));
