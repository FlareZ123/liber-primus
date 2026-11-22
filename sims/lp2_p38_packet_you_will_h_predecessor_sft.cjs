"use strict";

/**
 * P38 [g,Ka,B] packet: endpoint-selected WILL plus H-difference predecessor YOU.
 *
 * The p38 packet is selected upstream. This SFT charges the complete extended
 * DH field-pair family against authenticated signed2016 words, then asks
 * whether either fixed H coordinate points by the already selected p50 low
 * component to the selected word's immediate signed predecessor.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signedSource = read("resources/historical/cicada2016-4gq25-outguess.asc");

const tape = grid.pages.flatMap((page) => page.tokens);
const alphabet = grid.alphabet;
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, index) => ({ symbol: symbol.toUpperCase(), index }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

assert.equal(tape.length, 256);
assert.equal(alphabet.length, 60);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {string} word @returns {number} */
function gp0(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  let total = 0;
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      total += 21;
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      total += 27;
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    total += token.index;
    offset += token.symbol.length;
  }
  return total;
}

/** @param {string[]} tokens @param {number} address @returns {number|null} */
function low60(tokens, address) {
  if (!Number.isInteger(address) || address < 0 || address >= tokens.length) {
    return null;
  }
  const value = alphabet.indexOf(tokens[address][1]);
  return value < 0 ? null : value;
}

const clear = signedSource
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\r?\n\r?\n/)
  .slice(1)
  .join("\n");

const signedWords = clear
  .split(/[^A-Za-z0-9]+/)
  .filter((token) => /^[A-Za-z]+$/.test(token))
  .map((word, index) => ({
    index,
    label: word.toUpperCase(),
    gp0: gp0(word),
  }));

assert.equal(signedWords.length, 43);
assert.equal(signedWords[32].label, "YOU");
assert.equal(signedWords[33].label, "WILL");
assert.equal(signedWords[33].gp0, 57);

// Verify the selected p38 successor packet itself.
const p38 = transcription.split(/^\s*%\s*$/m)[38];
const p38Words = [];
let current = [];
let start = 0;
let offset = 0;

function flushWord() {
  if (!current.length) return;
  p38Words.push({
    index: p38Words.length,
    start,
    end: offset - 1,
    values: current.slice(),
  });
  current = [];
}

for (const char of [...p38]) {
  const value = runeIndex.get(char);
  if (value !== undefined) {
    if (!current.length) start = offset;
    current.push(value);
    offset += 1;
  } else if (char === "-" || char === ".") {
    flushWord();
  }
}
flushWord();

const packet = p38Words.find((word) => word.start === 54 && word.end === 56);
assert.ok(packet);
assert.deepEqual(packet.values, [5, 12, 19]);

const dh = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 };
const fields = [
  ...Object.entries(dh).map(([name, value]) => ({ name, value })),
  { name: "Ka", value: mod29(dh.K * dh.a) },
  { name: "Kg", value: mod29(dh.K * dh.g) },
];

assert.deepEqual(
  fields.map((field) => [field.name, field.value]),
  [
    ["p", 23],
    ["g", 5],
    ["a", 6],
    ["b", 15],
    ["A", 8],
    ["B", 19],
    ["K", 2],
    ["Ka", 12],
    ["Kg", 10],
  ]
);

/**
 * @param {string[]} tokens
 * @returns {Array<object>}
 */
function phraseHits(tokens) {
  const hits = [];

  for (const left of fields) {
    for (const right of fields) {
      for (const target of signedWords) {
        if (
          low60(tokens, left.value) !== target.gp0 ||
          low60(tokens, right.value) !== target.index ||
          target.index === 0
        ) {
          continue;
        }

        const h = [
          mod29(left.value - right.value),
          mod29(left.value + right.value),
        ];

        for (let coordinate = 0; coordinate < h.length; coordinate += 1) {
          if (
            low60(tokens, h[coordinate]) === target.index - 1
          ) {
            hits.push({
              left: left.name,
              right: right.name,
              target: target.label,
              predecessor: signedWords[target.index - 1].label,
              coordinate,
              hValue: h[coordinate],
            });
          }
        }
      }
    }
  }

  return hits;
}

const observed = phraseHits(tape);
assert.deepEqual(observed, [
  {
    left: "g",
    right: "B",
    target: "WILL",
    predecessor: "YOU",
    coordinate: 0,
    hValue: 15,
  },
]);

// Explicit raw table values.
assert.equal(low60(tape, dh.g), 57);
assert.equal(low60(tape, dh.B), 33);
assert.equal(low60(tape, mod29(dh.g - dh.B)), 32);
assert.equal(mod29(dh.g - dh.B), dh.b);
assert.equal(signedWords[32].label, "YOU");
assert.equal(signedWords[33].label, "WILL");

// Exact-token-multiset null.
/** @param {number} seed @returns {() => number} */
function makeRng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * @param {string[]} source
 * @param {() => number} random
 * @returns {string[]}
 */
function shuffled(source, random) {
  const result = source.slice();
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

const permutationCount = 100000;
const random = makeRng(0x24a11ce5);
let tailCount = 0;
let totalHits = 0;
const histogram = {};

for (let trial = 0; trial < permutationCount; trial += 1) {
  const hitCount = phraseHits(shuffled(tape, random)).length;
  totalHits += hitCount;
  histogram[hitCount] = (histogram[hitCount] || 0) + 1;
  if (hitCount >= observed.length) tailCount += 1;
}

assert.equal(tailCount, 1815);
assert.deepEqual(histogram, { 0: 98185, 1: 1768, 2: 46, 3: 1 });

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "post-selection but familywise-charged packet phrase closure: the independently selected p38 [g,Ka,B] packet has outer fields (g,B) as the sole extended-DH pair selecting an authenticated word, WILL, while the fixed H difference g-B=b points to its immediate signed predecessor YOU",
  packet: {
    page: 38,
    start: packet.start,
    end: packet.end,
    values: packet.values,
    typed: ["g", "Ka", "B"],
  },
  family: {
    fields: fields.map((field) => field.name),
    orderedPairs: fields.length * fields.length,
    targets: signedWords.length,
    hCoordinates: 2,
    labeledConfigurations: fields.length * fields.length * signedWords.length * 2,
    hits: observed,
  },
  raw: {
    g: { address: dh.g, token: tape[dh.g], low60: low60(tape, dh.g) },
    B: { address: dh.B, token: tape[dh.B], low60: low60(tape, dh.B) },
    Hdiff: {
      value: mod29(dh.g - dh.B),
      label: "b",
      token: tape[dh.b],
      low60: low60(tape, dh.b),
    },
    phrase: ["YOU", "WILL"],
  },
  permutationCalibration: {
    trials: permutationCount,
    seed: "0x24a11ce5",
    meanHits: totalHits / permutationCount,
    correctedTail: (tailCount + 1) / (permutationCount + 1),
    histogram,
  },
}, null, 2));
