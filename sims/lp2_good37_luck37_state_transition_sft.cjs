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

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function modPow(base, exponent, modulus) {
  let value = 1;
  let factor = base % modulus;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) value = (value * factor) % modulus;
    factor = (factor * factor) % modulus;
    power = Math.floor(power / 2);
  }
  return value;
}

/** @param {number[]} values @returns {number[]} */
function H4(values) {
  assert.equal(values.length, 4);
  return [
    mod29(values[0] - values[3]),
    mod29(values[1] - values[2]),
    mod29(values[1] + values[2]),
    mod29(values[0] + values[3]),
  ];
}

/** @param {number[]} shell @returns {number[]} */
function H4inv(shell) {
  assert.equal(shell.length, 4);
  const inv2 = 15;
  return [
    mod29((shell[0] + shell[3]) * inv2),
    mod29((shell[1] + shell[2]) * inv2),
    mod29((shell[2] - shell[1]) * inv2),
    mod29((shell[3] - shell[0]) * inv2),
  ];
}

/** @param {number[]} values @returns {number[]} */
function H5(values) {
  assert.equal(values.length, 5);
  return [
    mod29(values[0] - values[4]),
    mod29(values[1] - values[3]),
    values[2],
    mod29(values[1] + values[3]),
    mod29(values[0] + values[4]),
  ];
}

/** @param {number} difference @param {number} sum @returns {number[]} */
function HpairInv(difference, sum) {
  const inv2 = 15;
  return [
    mod29((difference + sum) * inv2),
    mod29((sum - difference) * inv2),
  ];
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const parts = transcription.split(/^\s*%\s*$/m);
const runeToValue = new Map(corpus.runes.map((rune, value) => [rune, value]));

const start = signed2016.indexOf("Hello.");
const end = signed2016.indexOf("-----BEGIN PGP SIGNATURE-----");
const source = signed2016
  .slice(start, end)
  .replace(/\b7A35090F\b/g, "")
  .match(/[A-Za-z]+/g)
  .map((word) => word.toUpperCase());

assert.equal(source.length, 43);
assert.equal(source[4], "EMPTY");
assert.equal(source[5], "EPIPHANY");
assert.equal(source[6], "SEEKS");
assert.equal(source[8], "DEVOTED");
assert.equal(source[19], "THEIR");
assert.equal(source[23], "ROAD");
assert.equal(source[36], "GOOD");
assert.equal(source[37], "LUCK");

/**
 * Reproduce the page-local printed-word convention used by the GOOD37 report.
 * Slash/newline wrapping does not terminate a word.
 *
 * @param {number} page
 * @returns {{ordinal:number,start:number,end:number,values:number[]}[]}
 */
function pageWords(page) {
  assert.notEqual(page, 50);
  const text = parts[page <= 49 ? page : page - 1];
  const out = [];
  let values = [];
  let startOffset = 0;
  let runeOffset = 0;

  function flush() {
    if (!values.length) return;
    out.push({
      ordinal: out.length + 1,
      start: startOffset,
      end: runeOffset - 1,
      values: values.slice(),
    });
    values = [];
  }

  for (const character of [...text]) {
    const value = runeToValue.get(character);
    if (value !== undefined) {
      if (!values.length) startOffset = runeOffset;
      values.push(value);
      runeOffset += 1;
    } else if ((character === "-" || character === ".") && values.length) {
      flush();
    }
  }
  flush();
  return out;
}

const good = pageWords(36)[36];
assert.deepEqual(good, {
  ordinal: 37,
  start: 169,
  end: 173,
  values: [2, 22, 4, 1, 20],
});

const goodShell = H5(good.values);
assert.deepEqual(goodShell, [11, 21, 4, 23, 22]);

const [aPlusG, pMinusK, q, p, pMinusOne] = goodShell;
const one = mod29(p - pMinusOne);
const K = mod29(p - pMinusK);
const [a, g] = HpairInv(one, aPlusG);
const A = modPow(g, a, p);
const B = mod29(p - q);

assert.deepEqual({p, q, one, K, a, g, A, B}, {
  p: 23,
  q: 4,
  one: 1,
  K: 2,
  a: 6,
  g: 5,
  A: 8,
  B: 19,
});
assert.equal(source[p], "ROAD");
assert.equal(source[q], "EMPTY");
assert.equal(source[g], "EPIPHANY");
assert.equal(source[a], "SEEKS");
assert.equal(source[A], "DEVOTED");
assert.equal(source[B], "THEIR");

const predictedRawShell = [
  g,
  mod29(p + K),
  A,
  one,
];
assert.deepEqual(predictedRawShell, [5, 25, 8, 1]);

const predictedKeyShell = [
  B,
  mod29(p - p),
  K,
  g,
];
assert.deepEqual(predictedKeyShell, [19, 0, 2, 5]);

const luckReceiver = pageWords(37)[37];
assert.deepEqual(luckReceiver, {
  ordinal: 38,
  start: 146,
  end: 149,
  values: [3, 2, 6, 27],
});
assert.deepEqual(H4(luckReceiver.values), predictedRawShell);

const key = H4inv(predictedKeyShell);
assert.deepEqual(key, [12, 1, 1, 22]);

const plaintext = luckReceiver.values.map((value, index) =>
  mod29(value - key[index])
);
assert.deepEqual(plaintext, [20, 1, 5, 5]);

const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
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
    assert.ok(token, "unmapped GP spelling " + word);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

assert.deepEqual(gp(source[37]), plaintext);
assert.equal(source[37], "LUCK");
assert.equal(luckReceiver.values.reduce((sum, value) => sum + value, 0), 38);
assert.equal(source[38], "BEWARE");

console.log(JSON.stringify({
  status: "PASS",
  predecessor: {
    source: {zeroBased: 36, oneBased: 37, word: source[36]},
    page: 36,
    wordOrdinal: good.ordinal,
    receiver: good.values,
    H5: goodShell,
    stateTyping: ["a+g", "p-K", "q", "p", "p-1"],
  },
  derivedState: {p, q, one, K, a, g, A, B},
  prediction: {
    nextSource: {zeroBased: 37, word: source[37]},
    rawH4: predictedRawShell,
    keyH4: predictedKeyShell,
  },
  reveal: {
    page: 37,
    wordZeroBased: 37,
    wordOneBased: luckReceiver.ordinal,
    receiver: luckReceiver.values,
    observedH4: H4(luckReceiver.values),
    key,
    plaintext,
    plaintextWord: source[37],
    rawGp0: 38,
    continuation: source[38],
  },
  interpretation:
    "The independently established GOOD37 H5 state packet reconstructs the untouched LUCK37 raw H4 shell and the exact [B,0,K,g] key shell. The derived key decrypts the numbered p37 receiver exactly to authenticated LUCK, and its raw GP0 points onward to BEWARE38.",
}, null, 2));
