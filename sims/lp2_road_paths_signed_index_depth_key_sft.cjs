"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);
const table = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const parts = transcription.split(/^\s*%\s*$/m);

/** @param {number} value */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} left @param {number} right */
function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

/** @param {string} word */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const output = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      output.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      output.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(offset));
    output.push(token.value);
    offset += token.symbol.length;
  }
  return output;
}

/** @param {string} text */
function parsePage(text) {
  const output = [];
  let current = [];
  let start = 0;
  let offset = 0;

  function flush() {
    if (!current.length) return;
    output.push({
      index: output.length,
      start,
      end: offset - 1,
      length: current.length,
      values: current.slice(),
    });
    current = [];
  }

  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if ((char === "-" || char === ".") && current.length) {
      flush();
    }
  }
  flush();
  return output;
}

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");
const words = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());
assert.equal(words.length, 43);

const wordValues = words.map((word) => gp(word));
const lengths = wordValues.map((values) => values.length);
const gp0 = wordValues.map((values) =>
  values.reduce((total, value) => total + value, 0)
);
const low60 = table.map((token) => alphabet60.indexOf(token[1]));
const direction = words.map((_, index) =>
  mod29(low60[index] - index - lengths[index])
);

/** @param {number} start */
function trace(start) {
  const seen = new Map();
  const route = [];
  let node = start;
  while (!seen.has(node)) {
    seen.set(node, route.length);
    route.push(node);
    node = direction[node];
  }
  return { depth: seen.get(node), entry: node, route };
}

const traces = words.map((_, index) => trace(index));
const maximumDepth = Math.max(...traces.map((row) => row.depth));
assert.equal(maximumDepth, 5);

const roadIndex = words.indexOf("ROAD");
const pathsIndex = words.indexOf("PATHS");
assert.deepEqual([roadIndex, pathsIndex], [23, 40]);
assert.deepEqual([lengths[roadIndex], lengths[pathsIndex]], [4, 4]);
assert.deepEqual([gp0[roadIndex], gp0[pathsIndex]], [54, 54]);
assert.equal(traces[pathsIndex].depth, 4);

const indexPair = H(mod29(roadIndex), mod29(pathsIndex));
const depthPair = [
  mod29(maximumDepth - traces[pathsIndex].depth),
  mod29(traces[pathsIndex].depth),
];
const roadKey = [...indexPair, ...depthPair];
assert.deepEqual(indexPair, [12, 5]);
assert.deepEqual(depthPair, [1, 4]);
assert.deepEqual(roadKey, [12, 5, 1, 4]);

const p0 = parsePage(parts[0]);
const p0ByStart = new Map(p0.map((word) => [word.start, word]));
const routeReceiver = p0ByStart.get(105);
assert.ok(routeReceiver);
assert.deepEqual(routeReceiver.values, [16, 8, 25, 27]);
const roadPlain = routeReceiver.values.map((value, index) =>
  mod29(value - roadKey[index])
);
assert.deepEqual(roadPlain, gp("ROAD"));

const alphabet59 = alphabet60.replace("f", "");
/** @param {string} token @param {string} alphabet */
function decodeToken(token, alphabet) {
  return alphabet.indexOf(token[0]) * alphabet.length + alphabet.indexOf(token[1]);
}
assert.equal(table[54], "2a");
const directOffset = decodeToken(table[54], alphabet59);
assert.equal(directOffset, 154);
const directReceiver = p0ByStart.get(directOffset);
assert.ok(directReceiver);
assert.equal(directReceiver.length, 4);
const directPlain = directReceiver.values.map((value, index) =>
  mod29(value - roadKey[index])
);
assert.deepEqual(directPlain, [14, 5, 22, 20]);

const sameAddressPairs = [];
for (let first = 0; first < words.length; first += 1) {
  for (let second = first + 1; second < words.length; second += 1) {
    if (gp0[first] === gp0[second]) sameAddressPairs.push({ first, second });
  }
}
assert.equal(sameAddressPairs.length, 29);
const sameAddressFourRunePairs = sameAddressPairs.filter(({ first, second }) =>
  lengths[first] === 4 && lengths[second] === 4
);
assert.deepEqual(
  sameAddressFourRunePairs.map(({ first, second }) => [words[first], words[second]]),
  [["THEIR", "THEIR"], ["ROAD", "PATHS"]]
);

const fourRuneWords = [];
for (let partIndex = 0; partIndex < 55; partIndex += 1) {
  const physicalPage = partIndex <= 49 ? partIndex : partIndex + 1;
  for (const word of parsePage(parts[partIndex])) {
    if (word.length === 4) fourRuneWords.push({ page: physicalPage, ...word });
  }
}
assert.equal(fourRuneWords.length, 514);

const authenticatedFourRuneTargets = new Map(
  [...new Map(
    words
      .map((word, index) => ({ word, values: wordValues[index] }))
      .filter((row) => row.values.length === 4)
      .map((row) => [row.values.join(","), row])
  ).values()].map((row) => [row.values.join(","), row.word])
);
assert.equal(authenticatedFourRuneTargets.size, 9);

const canonicalHits = [];
for (const { first, second } of sameAddressPairs) {
  const d = traces[second].depth;
  const key = [
    ...H(mod29(first), mod29(second)),
    mod29(maximumDepth - d),
    mod29(d),
  ];
  for (const word of fourRuneWords) {
    const plain = word.values.map((value, index) => mod29(value - key[index]));
    const target = authenticatedFourRuneTargets.get(plain.join(","));
    if (target) {
      canonicalHits.push({
        pair: [first, words[first], second, words[second]],
        key,
        page: word.page,
        start: word.start,
        target,
      });
    }
  }
}
assert.deepEqual(canonicalHits, [{
  pair: [23, "ROAD", 40, "PATHS"],
  key: [12, 5, 1, 4],
  page: 0,
  start: 105,
  target: "ROAD",
}]);

const familyHits = [];
let familyKeys = 0;
for (const { first, second } of sameAddressPairs) {
  for (const indexOrigin of [0, 1]) {
    for (const reverseH of [false, true]) {
      for (const depthFrom of ["first", "second"]) {
        for (const reverseDepth of [false, true]) {
          familyKeys += 1;
          const x = mod29(first + indexOrigin);
          const y = mod29(second + indexOrigin);
          const h = reverseH ? H(y, x) : H(x, y);
          const d = traces[depthFrom === "first" ? first : second].depth;
          const depth = reverseDepth
            ? [mod29(d), mod29(maximumDepth - d)]
            : [mod29(maximumDepth - d), mod29(d)];
          const key = [...h, ...depth];

          for (const word of fourRuneWords) {
            const plain = word.values.map((value, index) =>
              mod29(value - key[index])
            );
            const target = authenticatedFourRuneTargets.get(plain.join(","));
            if (!target) continue;
            familyHits.push({
              pair: [first, words[first], second, words[second]],
              indexOrigin,
              reverseH,
              depthFrom,
              reverseDepth,
              key,
              page: word.page,
              start: word.start,
              target,
            });
          }
        }
      }
    }
  }
}
assert.equal(familyKeys, 464);
assert.equal(familyKeys * fourRuneWords.length, 238496);
assert.equal(familyHits.length, 8);
const routeRoadHits = familyHits.filter((hit) =>
  hit.page === 0 && hit.start === 105 && hit.target === "ROAD"
);
assert.deepEqual(routeRoadHits, [{
  pair: [23, "ROAD", 40, "PATHS"],
  indexOrigin: 0,
  reverseH: false,
  depthFrom: "second",
  reverseDepth: false,
  key: [12, 5, 1, 4],
  page: 0,
  start: 105,
  target: "ROAD",
}]);

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "post-discovery source-derived ROAD key compression: ROAD/PATHS share GP0=54; H of their zero-based signed indices gives [12,5], and PATHS graph depth4 partitions maximum depth5 as [1,4], reproducing the published ROAD key [12,5,1,4]. Across all 29 same-GP0 source pairs and 514 unknown four-rune words the fixed construction has one authenticated-target hit, p0:105 ROAD. A 464-key nearby convention charge has eight total lexical hits, while the route-selected p0:105 ROAD event occurs once under the canonical conventions. The construction was recognized after ROAD was known, so this strengthens key provenance without independently proving plaintext.",
  source: {
    road: { index: roadIndex, gp0: gp0[roadIndex], depth: traces[roadIndex].depth },
    paths: { index: pathsIndex, gp0: gp0[pathsIndex], depth: traces[pathsIndex].depth },
    maximumDepth,
    indexPair,
    depthPair,
    key: roadKey,
  },
  routeReceiver: {
    start: routeReceiver.start,
    cipher: routeReceiver.values,
    plaintext: roadPlain,
  },
  directGp0Rival: {
    token: table[54],
    base59Offset: directOffset,
    cipher: directReceiver.values,
    plaintext: directPlain,
  },
  audit: {
    sameAddressPairs: sameAddressPairs.length,
    sameAddressFourRunePairs: sameAddressFourRunePairs.map(({ first, second }) =>
      [words[first], words[second]]
    ),
    fourRuneWords: fourRuneWords.length,
    authenticatedFourRuneTargets: authenticatedFourRuneTargets.size,
    canonicalHits,
    familyKeys,
    familyWordTrials: familyKeys * fourRuneWords.length,
    familyHits,
  },
}, null, 2));
