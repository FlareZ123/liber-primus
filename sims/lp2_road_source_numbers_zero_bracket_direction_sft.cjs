"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} n @returns {number} */
function mod29(n) {
  return ((n % 29) + 29) % 29;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeToValue = new Map(corpus.runes.map((rune, value) => [rune, value]));
const valuesToText = (values) => values.map((value) => corpus.translit[value]).join("");

/** @param {string} fragment @returns {number[]} */
function runeValues(fragment) {
  return [...fragment].filter((rune) => runeToValue.has(rune)).map((rune) => runeToValue.get(rune));
}

/** @param {string} fragment @returns {[number, number]} */
function outerH(fragment) {
  const values = runeValues(fragment);
  assert.ok(values.length >= 2);
  return [mod29(values[0] - values.at(-1)), mod29(values[0] + values.at(-1))];
}

const pages = transcription.split("%").slice(0, 58);
const p28 = pages[28];
const lines = p28.trim().split("/").filter((line) => /[\u16A0-\u16FF]/u.test(line));
assert.equal(lines.length, 12);
const line1 = lines[0].match(/[\u16A0-\u16FF]+/gu) || [];
const line6 = lines[5].match(/[\u16A0-\u16FF]+/gu) || [];
assert.equal(line1.length, 5);
assert.equal(line6.length, 5);
const runeLength = (fragments) => fragments.reduce((n, fragment) => n + runeValues(fragment).length, 0);
assert.equal(runeLength(line1), 23);
assert.equal(runeLength(line6), 23);
assert.equal((p28.match(/\./g) || []).length, 3);

const here = [...outerH(line1[0]), ...outerH(line1[1])];
assert.equal(valuesToText(here), "HERE");
const line6Pairs = line6.flatMap((fragment) => outerH(fragment));
assert.deepEqual(line6Pairs, [15, 2, 14, 4, 12, 12, 23, 12, 8, 19]);

const dh = {p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2};
assert.equal((dh.g ** dh.a) % dh.p, dh.A);
assert.equal((dh.g ** dh.b) % dh.p, dh.B);
assert.equal((dh.A ** dh.b) % dh.p, dh.K);
assert.equal((dh.B ** dh.a) % dh.p, dh.K);

const roadKey = [lines.length, line1.length, 1, here.length];
assert.deepEqual(roadKey, [12, 5, 1, 4]);
const p0Cipher = corpus.pages[0].indices.slice(105, 109);
assert.deepEqual(p0Cipher, [16, 8, 25, 27]);
const road = p0Cipher.map((value, i) => mod29(value - roadKey[i]));
assert.equal(valuesToText(road), "ROAD");

const tokens = grid.pages.flatMap((page) => page.tokens);
const bytes = grid.pages.flatMap((page) => page.bytes);
assert.equal(tokens.length, 256);
assert.equal(bytes.length, 256);
const zeroCells = tokens.map((token, index) => token === "00" ? index : -1).filter((index) => index >= 0);
assert.deepEqual(zeroCells, [192, 229]);
assert.equal(229 - 192 - 1, 36);

/** @param {number} address @param {number} maxDepth @returns {{distance:number,zero:number,path:number[]}|null} */
function firstZero(address, maxDepth = 16) {
  const seen = new Set();
  const walked = [];
  let current = address;
  for (let distance = 0; distance <= maxDepth; distance += 1) {
    walked.push(current);
    if (tokens[current] === "00") return {distance, zero: current, path: walked};
    if (seen.has(current)) return null;
    seen.add(current);
    current = bytes[current];
  }
  return null;
}

/** @param {[number, number]} pair @param {0|1} origin @returns {number|null} */
function coordinateAddress(pair, origin) {
  const row = pair[0] - origin;
  const col = pair[1] - origin;
  if (row < 0 || row >= 32 || col < 0 || col >= 8) return null;
  return row * 8 + col;
}

const fixedPairings = [
  {name: "adjacent", pairs: [[0, 1], [2, 3]]},
  {name: "cross", pairs: [[0, 2], [1, 3]]},
  {name: "outer-inner", pairs: [[0, 3], [1, 2]]},
];

const fixedOutcomes = [];
for (const pairing of fixedPairings) {
  for (const origin of [0, 1]) {
    const addresses = pairing.pairs.map(([r, c]) => coordinateAddress([roadKey[r], roadKey[c]], origin));
    const hits = addresses.map((address) => address === null ? null : firstZero(address, 8));
    fixedOutcomes.push({pairing: pairing.name, origin, addresses, hits});
  }
}
const fixedSuccess = fixedOutcomes.filter((row) =>
  row.hits.every(Boolean) &&
  row.hits[0].zero !== row.hits[1].zero &&
  row.hits[0].distance === 1 &&
  row.hits[1].distance === 2);
assert.equal(fixedSuccess.length, 1);
assert.equal(fixedSuccess[0].pairing, "adjacent");
assert.equal(fixedSuccess[0].origin, 0);
assert.deepEqual(fixedSuccess[0].addresses, [101, 12]);
assert.deepEqual(fixedSuccess[0].hits.map((hit) => hit.path), [[101, 229], [12, 247, 192]]);

const scalars = [
  ["page-number", 28], ["page-rune-lines", lines.length], ["here-line-one", 1],
  ["here-line-runes", runeLength(line1)], ["here-line-fragments", line1.length],
  ["here-fragments-consumed", 2], ["here-output-length", here.length], ["dh-line-one", 6],
  ["dh-line-runes", runeLength(line6)], ["dh-line-fragments", line6.length],
  ["page-periods", (p28.match(/\./g) || []).length], ["center-index-mod29", 134 % 29],
  ["center-value", 9], ["page-word-number-mod29", 28], ["page-word-length", 5],
  ["p", dh.p], ["g", dh.g], ["a", dh.a], ["b", dh.b], ["A", dh.A],
  ["B", dh.B], ["K", dh.K], ["dh-inverse-e", 3],
].map(([name, value]) => ({name, value}));
assert.equal(scalars.length, 23);

let adjacentValid = 0;
const adjacentHits = [];
let canonicalValid = 0;
const canonicalHits = [];

for (let a = 0; a < scalars.length; a += 1) {
  for (let b = 0; b < scalars.length; b += 1) {
    if (b === a) continue;
    for (let c = 0; c < scalars.length; c += 1) {
      if (c === a || c === b) continue;
      for (let d = 0; d < scalars.length; d += 1) {
        if (d === a || d === b || d === c) continue;
        const tuple = [scalars[a], scalars[b], scalars[c], scalars[d]];
        const values = tuple.map((row) => row.value);
        const fields = tuple.map((row) => row.name);

        const directAddresses = [
          coordinateAddress([values[0], values[1]], 0),
          coordinateAddress([values[2], values[3]], 0),
        ];
        if (directAddresses.every((address) => address !== null)) {
          adjacentValid += 1;
          const hit = directAddresses.map((address) => firstZero(address, 3));
          if (hit.every(Boolean) && hit[0].zero !== hit[1].zero &&
              hit[0].distance === 1 && hit[1].distance === 2) {
            adjacentHits.push({fields, values, addresses: directAddresses, hit});
          }
        }

        for (const pairing of fixedPairings) {
          for (const origin of [0, 1]) {
            const addresses = pairing.pairs.map(([r, c]) =>
              coordinateAddress([values[r], values[c]], origin));
            if (!addresses.every((address) => address !== null)) continue;
            canonicalValid += 1;
            const hit = addresses.map((address) => firstZero(address, 3));
            if (hit.every(Boolean) && hit[0].zero !== hit[1].zero &&
                hit[0].distance === 1 && hit[1].distance === 2) {
              canonicalHits.push({fields, values, pairing: pairing.name, origin, addresses, hit});
            }
          }
        }
      }
    }
  }
}

assert.equal(adjacentValid, 55440);
assert.equal(adjacentHits.length, 4);
assert.ok(adjacentHits.every((row) => row.values.join(",") === "12,5,1,4"));
assert.ok(adjacentHits.every((row) => row.addresses.join(",") === "101,12"));
assert.equal(canonicalValid, 362880);
assert.equal(canonicalHits.length, 12);
assert.ok(canonicalHits.every((row) => row.origin === 0));
assert.ok(canonicalHits.every((row) => row.addresses.join(",") === "101,12"));
assert.ok(canonicalHits.every((row) => row.hit[0].zero === 229 && row.hit[1].zero === 192));
assert.ok(canonicalHits.every((row) => [...row.values].sort((x, y) => x - y).join(",") === "1,4,5,12"));

const clear = signed2016
  .slice(signed2016.indexOf("Hello."), signed2016.indexOf("-----BEGIN PGP SIGNATURE-----"))
  .replace(/\b[0-9A-F]{8}\b/g, "")
  .replace(/\b\d+\b/g, "");
const signedWords = (clear.match(/[A-Za-z]+/g) || []).map((word) => word.toUpperCase());
const signedText = signedWords.join(" ");
assert.ok(signedText.includes("THE PATH LIES EMPTY EPIPHANY SEEKS THE DEVOTED"));
assert.ok(signedText.includes("THEIR MEANING IS THE ROAD AND THEIR NUMBERS ARE THE DIRECTION"));
assert.equal(signedWords[36], "GOOD");

console.log(JSON.stringify({
  status: "PASS",
  roadKey,
  road: valuesToText(road),
  zeroCells,
  zeroInteriorLength: 36,
  fixedSuccess,
  adjacentFamily: {valid: adjacentValid, hits: adjacentHits.length},
  canonicalFamily: {
    valid: canonicalValid,
    hits: canonicalHits.length,
    distinctValueSets: [...new Set(canonicalHits.map((row) =>
      [...row.values].sort((x, y) => x - y).join(",")))],
  },
  secondaryEcho: {signedWordIndex36: signedWords[36]},
  decision: "ROAD source numbers reselect both p50 zero cells; a typed bracket consumer is still missing.",
}, null, 2));
