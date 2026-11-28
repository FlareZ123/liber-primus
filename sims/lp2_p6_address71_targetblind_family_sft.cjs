"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
const mod29 = (value) => ((value % 29) + 29) % 29;

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signedText = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
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
    const token = gpTokens.find((candidate) => normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, "unmapped GP spelling " + word);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

const signedClear = signedText.split("-----BEGIN PGP SIGNATURE-----")[0];
const signed = signedClear
  .slice(signedClear.indexOf("Hello."))
  .split(/[^A-Za-z0-9]+/)
  .filter((token) => /^[A-Za-z]+$/.test(token))
  .map((label, index) => ({ index, label: label.toUpperCase(), values: gp(label) }));
assert.equal(signed.length, 43);

const fourTargets = new Map();
for (const word of signed) {
  if (word.values.length === 4) fourTargets.set(word.values.join(","), word.label);
}
assert.equal(fourTargets.size, 9);

const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const words = [];
for (let block = 0; block < parts.length; block += 1) {
  const page = block >= 50 ? block + 1 : block;
  let offset = 0;
  let start = -1;
  let values = [];
  const flush = () => {
    if (!values.length) return;
    words.push({ page, start, length: values.length, values: values.slice() });
    values = [];
  };
  for (const char of parts[block]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!values.length) start = offset;
      values.push(value);
      offset += 1;
    } else if (!/[\s/]/u.test(char)) {
      flush();
    }
  }
  flush();
}

// Address71 is selected upstream by the p6 SEEKS/title self-address relation.
// This gate does not use PATHS, target GP0, or a same-GP0 receiver filter.
const receivers = words.filter((word) => word.start === 71 && word.length === 4);
assert.deepEqual(
  receivers.map((word) => [word.page, word.values]),
  [
    [6, [24,16,14,17]],
    [7, [20,27,10,5]],
    [27, [12,4,28,4]],
    [37, [5,24,4,17]],
    [40, [4,15,14,21]],
  ],
);

// Charge the broad p6 visual family already used as a discovery-order control:
// repeated black line count r in {20,22,24}, followed by any ordered pair of
// distinct-value atoms printed in the p6 red title. 3*9*9 = 243 keys.
const repeatedLineCounts = [20,22,24];
const p6Title = [24,16,14,17,19,6,27,15,17,14,12];
const titleAtoms = [...new Set(p6Title)];
assert.equal(titleAtoms.length, 9);

const baseKeys = new Map();
for (const r of repeatedLineCounts) {
  for (const x of titleAtoms) {
    for (const y of titleAtoms) {
      const key = [r,r,x,y];
      baseKeys.set(key.join(","), key);
    }
  }
}
assert.equal(baseKeys.size, 243);

/** @param {number[]} values @returns {number[][]} */
function permutations(values) {
  if (values.length <= 1) return [values.slice()];
  const out = [];
  for (let index = 0; index < values.length; index += 1) {
    const rest = values.slice(0, index).concat(values.slice(index + 1));
    for (const tail of permutations(rest)) out.push([values[index], ...tail]);
  }
  return out;
}

const permutedKeys = new Map();
for (const key of baseKeys.values()) {
  for (const permutation of permutations(key)) {
    permutedKeys.set(permutation.join(","), permutation);
  }
}
assert.equal(permutedKeys.size, 1389);

/**
 * @param {Map<string, number[]>} keys
 * @returns {object[]}
 */
function authenticatedHits(keys) {
  const hits = [];
  for (const receiver of receivers) {
    for (const key of keys.values()) {
      for (const sign of [-1, 1]) {
        const plain = receiver.values.map((value, index) => mod29(value + sign * key[index]));
        const target = fourTargets.get(plain.join(","));
        if (target) {
          hits.push({
            page: receiver.page,
            start: receiver.start,
            cipher: receiver.values,
            key,
            sign,
            target,
            plain,
          });
        }
      }
    }
  }
  return hits;
}

const baseHits = authenticatedHits(baseKeys);
const permutedHits = authenticatedHits(permutedKeys);
const expected = [{
  page: 40,
  start: 71,
  cipher: [4,15,14,21],
  key: [20,20,12,6],
  sign: -1,
  target: "PATHS",
  plain: [13,24,2,15],
}];
assert.deepEqual(baseHits, expected);
assert.deepEqual(permutedHits, expected);

console.log(JSON.stringify({
  status: "PASS",
  receiverFamily: receivers.map((word) => ({ page: word.page, start: word.start, cipher: word.values })),
  authenticatedFourRuneTargets: [...fourTargets.values()],
  p6VisualKeyFamily: {
    repeatedLineCounts,
    titleAtoms,
    baseKeyCount: baseKeys.size,
    permutationClosedKeyCount: permutedKeys.size,
  },
  baseHits,
  permutedHits,
  conclusion: "Within the target-blind address71 four-rune receiver family, the broad p6 visual key family and its full coordinate-permutation closure have exactly one authenticated source hit: p40 PATHS.",
}, null, 2));
