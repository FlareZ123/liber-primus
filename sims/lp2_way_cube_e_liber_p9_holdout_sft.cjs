"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const base60 = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const signed2013 = read("resources/external/2013-tcp-server-signed-source.md");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);
const p50 = base60.rows.flat();
const alphabet60 = base60.alphabet;
const M = 29;

const clear = signed2016.match(
  /Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u
);
assert.ok(clear);
const sourceWords = (clear[1].match(/\b[A-Za-z]+\b/gu) || [])
  .map((word) => word.toUpperCase());
assert.equal(sourceWords.length, 43);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % M) + M) % M;
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function modPow(base, exponent, modulus) {
  let out = 1;
  let value = ((base % modulus) + modulus) % modulus;
  let power = exponent;
  while (power > 0) {
    if (power & 1) out = out * value % modulus;
    value = value * value % modulus;
    power = Math.floor(power / 2);
  }
  return out;
}

/** @param {number} value @param {number} modulus @returns {number} */
function inverse(value, modulus) {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if (value * candidate % modulus === 1) return candidate;
  }
  throw new Error("inverse not found");
}

const state = {
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
  q: 4,
};
const e = inverse(state.b, state.p - 1);
assert.equal(e, 3);

/** @param {number} value @returns {number} */
function cube(value) {
  return modPow(value, e, M);
}

/** @param {number} value @param {number} count @returns {number} */
function iterateCube(value, count) {
  let out = mod29(value);
  for (let step = 0; step < count; step += 1) out = cube(out);
  return out;
}

/*
 * Source-native WAY -> LIBER transition.
 * WAY is fixed by the existing p29 candidate and has a unique signed index13.
 */
const wayIndices = sourceWords
  .map((word, index) => ({word, index}))
  .filter((row) => row.word === "WAY")
  .map((row) => row.index);
assert.deepEqual(wayIndices, [13]);

const liberIndices = sourceWords
  .map((word, index) => ({word, index}))
  .filter((row) => row.word === "LIBER")
  .map((row) => row.index);
assert.deepEqual(liberIndices, [9]);

const wayIndex = wayIndices[0];
const liberIndex = liberIndices[0];
const wayCubePath = [wayIndex];
for (let step = 0; step < e; step += 1) {
  wayCubePath.push(cube(wayCubePath.at(-1)));
}
assert.deepEqual(wayCubePath, [13, 22, 5, 9]);
assert.deepEqual(
  wayCubePath.map((index) => sourceWords[index]),
  ["WAY", "THE", "EPIPHANY", "LIBER"]
);
assert.equal(iterateCube(wayIndex, e), liberIndex);
assert.equal(iterateCube(liberIndex, e), wayIndex);
assert.equal(modPow(wayIndex, modPow(e, e, 28), M), liberIndex);

// The signed sentence itself has LIBER and WAY as its endpoints.
assert.deepEqual(
  sourceWords.slice(liberIndex, wayIndex + 1),
  ["LIBER", "PRIMUS", "IS", "THE", "WAY"]
);

// Charge every nonzero step count in the six-cycle. Only count e reaches LIBER9.
const waySixCycle = [];
for (let count = 1; count <= 6; count += 1) {
  waySixCycle.push({
    count,
    index: iterateCube(wayIndex, count),
    word: sourceWords[iterateCube(wayIndex, count)],
  });
}
assert.deepEqual(waySixCycle, [
  {count: 1, index: 22, word: "THE"},
  {count: 2, index: 5, word: "EPIPHANY"},
  {count: 3, index: 9, word: "LIBER"},
  {count: 4, index: 4, word: "EMPTY"},
  {count: 5, index: 6, word: "SEEKS"},
  {count: 6, index: 13, word: "WAY"},
]);
assert.deepEqual(
  waySixCycle.filter((row) => row.index === liberIndex).map((row) => row.count),
  [e]
);

// Charge the complete six signed THE followers from the established scaffold.
// DIRECTION index29 reduces to state0 under the source GP29 cube.
const theFollowerIndices = [2, 8, 13, 18, 23, 29];
assert.deepEqual(
  theFollowerIndices.map((index) => sourceWords[index]),
  ["PATH", "DEVOTED", "WAY", "MAP", "ROAD", "DIRECTION"]
);
const followerImages = theFollowerIndices.map((index) => {
  const image = iterateCube(index, e);
  return {
    sourceIndex: index,
    sourceWord: sourceWords[index],
    imageIndex: image,
    imageWord: sourceWords[image],
  };
});
assert.deepEqual(followerImages, [
  {sourceIndex:2, sourceWord:"PATH", imageIndex:15, imageWord:"WORDS"},
  {sourceIndex:8, sourceWord:"DEVOTED", imageIndex:11, imageWord:"IS"},
  {sourceIndex:13, sourceWord:"WAY", imageIndex:9, imageWord:"LIBER"},
  {sourceIndex:18, sourceWord:"MAP", imageIndex:21, imageWord:"IS"},
  {sourceIndex:23, sourceWord:"ROAD", imageIndex:24, imageWord:"AND"},
  {sourceIndex:29, sourceWord:"DIRECTION", imageIndex:0, imageWord:"HELLO"},
]);
assert.deepEqual(
  followerImages.filter((row) => row.imageIndex === liberIndex),
  [followerImages[2]]
);

// State-derived iteration counts provide another fixed local family.
// e=3 is the sole count among K,e,q,g,a that lands on the independent p9 target.
const stateCounts = [
  ["K", state.K],
  ["e", e],
  ["q", state.q],
  ["g", state.g],
  ["a", state.a],
];
assert.deepEqual(
  stateCounts
    .map(([label, count]) => ({label, count, index:iterateCube(wayIndex, count)}))
    .filter((row) => row.index === liberIndex),
  [{label:"e", count:3, index:9}]
);

/*
 * Reproduce the p29 derivative candidate WAY from original p29/table values
 * and the authenticated 2013 AY factor.
 */
function derivativeValue(coefficients, x, order) {
  let current = coefficients.slice();
  for (let step = 0; step < order; step += 1) {
    const degree = current.length - 1;
    current = current
      .slice(0, -1)
      .map((coefficient, index) =>
        mod29(coefficient * (degree - index))
      );
  }
  let value = 0;
  for (const coefficient of current) {
    value = mod29(value * x + coefficient);
  }
  return value;
}

const repeatedRoot = 24;
const p29 = corpus.pages.find((page) => page.page === 29).indices;
const tablePolynomial = grid.bytes.map((value) => value % M);
assert.equal(derivativeValue(p29, repeatedRoot, 0), 0);
assert.equal(derivativeValue(p29, repeatedRoot, 1), 0);
assert.equal(derivativeValue(tablePolynomial, repeatedRoot, 0), 0);
assert.equal(derivativeValue(tablePolynomial, repeatedRoot, 1), 0);
const derivativeRune = derivativeValue(p29, repeatedRoot, e);
assert.equal(derivativeRune, 7);
assert.equal(derivativeValue(tablePolynomial, repeatedRoot, e), derivativeRune);

assert.match(signed2013, /BASE29 3301[^\n]*3QO/);
const base29Alphabet = "0123456789ABCDEFGHIJKLMNOPQRS";
const hDigits = [..."3QO"].map((digit) => base29Alphabet.indexOf(digit));
assert.deepEqual(hDigits, [3, 26, 24]);
const hPolynomial = [...hDigits].reverse();
assert.deepEqual(hPolynomial, [24, 26, e]);
const wayVector = [derivativeRune, ...hPolynomial.slice(0, 2)];
assert.deepEqual(wayVector, [7, 24, 26]);
assert.equal(wayVector.map((value) => corpus.translit[value]).join(""), "WAY");

/*
 * Reproduce the independent VERIFY -> p9 selector and the p9 DIRECTION fork.
 */
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol:symbol.toUpperCase(), value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number} */
function gp0English(word) {
  const normalized = word.toUpperCase()
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
    total += token.value;
    offset += token.symbol.length;
  }
  return total;
}

/** @param {string} token @returns {number} */
function decode60(token) {
  const high = alphabet60.indexOf(token[0]);
  const low = alphabet60.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * 60 + low;
}

/** @param {number} address @returns {number} */
function low60(address) {
  const low = alphabet60.indexOf(p50[address][1]);
  assert.ok(low >= 0);
  return low;
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1] || "";
}

/** @param {string} text @returns {{words:Array<{start:number,end:number,values:number[]}>,runes:number[]}} */
function parsePhysical(text) {
  const words = [];
  const runes = [];
  let current = [];
  let start = 0;
  function flush() {
    if (!current.length) return;
    words.push({start, end:start + current.length - 1, values:current.slice()});
    current = [];
  }
  for (const character of [...text]) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      if (!current.length) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if (
      character === "-" ||
      character === "." ||
      character === "&" ||
      character === "$"
    ) {
      flush();
    }
  }
  flush();
  return {words, runes};
}

const verifyAddress = gp0English("VERIFY");
assert.equal(verifyAddress, 59);
assert.equal(p50[verifyAddress], "19");
const verifyPage = low60(verifyAddress);
const verifyFull = decode60(p50[verifyAddress]);
assert.equal(verifyPage, liberIndex);
assert.equal(verifyFull, 69);

const p9 = parsePhysical(physicalPart(verifyPage));
const midpoint = (p9.runes.length - 1) / 2;
const p9RightWord = p9.words.find((word) => word.start > midpoint);
assert.ok(p9RightWord);
assert.equal(p9RightWord.start, 135);
assert.equal(p9RightWord.values.length, state.g);
const p9Successor = p9.runes[p9RightWord.end + 1];
const p9Packet = [...p9RightWord.values, p9Successor];
assert.deepEqual(p9Packet, [25,4,0,3,16,21]);
assert.equal(p9Packet.reduce((sum, value) => sum + value, 0), verifyFull);
const directionIndex = p9Packet
  .slice(0, state.K)
  .reduce((sum, value) => sum + value, 0);
const pathsIndex = p9Packet
  .slice(state.K)
  .reduce((sum, value) => sum + value, 0);
assert.equal(directionIndex, 29);
assert.equal(pathsIndex, 40);
assert.equal(sourceWords[directionIndex], "DIRECTION");
assert.equal(sourceWords[pathsIndex], "PATHS");

// Same-index page semantics close the productive branch:
// p9 -> DIRECTION29 -> p29 -> WAY13 -> C^e -> LIBER9 -> p9.
assert.equal(directionIndex, 29);
assert.equal(corpus.pages.find((page) => page.page === directionIndex).page, 29);
assert.equal(iterateCube(wayIndex, e), verifyPage);

console.log(JSON.stringify({
  status:"PASS",
  sourceCube:{
    exponent:e,
    modulus:M,
    composedExponent:modPow(e, e, 28),
    wayIndex,
    liberIndex,
    path:wayCubePath,
    pathWords:wayCubePath.map((index) => sourceWords[index]),
    involution:[iterateCube(wayIndex,e), iterateCube(liberIndex,e)],
    sixCycle:waySixCycle,
    scaffoldFollowers:followerImages,
    stateCountHit:{label:"e",count:e,index:liberIndex},
  },
  p29Way:{
    repeatedRoot,
    derivativeOrder:e,
    derivativeRune,
    signed2013PositiveDegree:hPolynomial.slice(0,2),
    vector:wayVector,
    text:"WAY",
  },
  verifyP9:{
    address:verifyAddress,
    p50:p50[verifyAddress],
    page:verifyPage,
    full:verifyFull,
    packet:p9Packet,
    split:[directionIndex,pathsIndex],
    sourceWords:[sourceWords[directionIndex],sourceWords[pathsIndex]],
  },
  productiveCycle:[
    "p9",
    "DIRECTION29",
    "p29",
    "WAY13",
    "C^e",
    "LIBER9",
    "p9",
  ],
  classification:
    "Retrospective cross-route holdout: the authenticated cube composed e=3 times maps the independently reconstructed p29 WAY index13 to LIBER index9, exactly the page independently selected by VERIFY; this closes p9->DIRECTION29->p29->WAY13->LIBER9->p9. WAY is the sole signed THE follower mapped to p9 under the fixed C^e operation.",
}, null, 2));
