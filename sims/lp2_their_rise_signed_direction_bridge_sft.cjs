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

/** @param {[number, number]} pair @returns {[number, number]} */
function h(pair) {
  const [x, y] = pair;
  return [mod29(x - y), mod29(x + y)];
}

/** @param {[number, number]} pair @returns {[number, number]} */
function hInv(pair) {
  const [u, v] = pair;
  return [mod29((u + v) * 15), mod29((v - u) * 15)];
}

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const out = [];
  for (let candidate = 2; out.length < count; candidate += 1) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor += 1) {
      if (candidate % divisor === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(candidate);
  }
  return out;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);
const primes = firstPrimes(130);
const state = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3, q: 4 };
const stateByValue = new Map(Object.entries(state).map(([field, value]) => [value, field]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {number} n @returns {number} */
function totientPrimeOrdinal(n) {
  assert.ok(Number.isInteger(n) && n >= 1);
  return mod29(primes[n - 1] - 1);
}

/** @param {number[]} values @returns {string} */
function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {string} text @returns {number[][]} */
function runeWords(text) {
  const normalized = text.replace(/\/\s*/gu, "");
  return (normalized.match(/[\u16A0-\u16FF]+/gu) || []).map((word) =>
    [...word].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    })
  );
}

/** @param {number} page @returns {{values:number[],start:number,end:number,length:number}[]} */
function wordRows(page) {
  let offset = 0;
  return runeWords(physicalPart(page)).map((values) => {
    const row = { values, start: offset, end: offset + values.length, length: values.length };
    offset = row.end;
    return row;
  });
}

/** @param {{start:number,end:number,length:number}[]} rows @param {number} start @param {number} end */
function rowsInSpan(rows, start, end) {
  return rows.filter((row) => row.start >= start && row.end <= end);
}

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      out.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      out.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find(({ symbol }) => normalized.startsWith(symbol, offset));
    assert.ok(token, "unmapped signed word: " + word + " at " + offset);
    out.push(token.value);
    offset += token.symbol.length;
  }
  return out;
}

/** @param {string} word @returns {number} */
function gp0(word) {
  return gp(word).reduce((sum, value) => sum + value, 0);
}

const words = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u).slice(1).join("\n")
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());
assert.equal(words.length, 43);

// Reconstruct p33 THEIR RISE from original layout counts and solved-p56 T(n).
const p33Rows = wordRows(33);
const p33Ink = ink.pages.find((page) => page.page === 33);
assert.ok(p33Ink);
assert.deepEqual(p33Ink.red_spans.map((span) => [span.start, span.length]), [[0, 10], [91, 8]]);
const upperLengths = rowsInSpan(p33Rows, 0, 10).map((row) => row.length);
const lowerLengths = rowsInSpan(p33Rows, 91, 99).map((row) => row.length);
assert.deepEqual(upperLengths, [2, 8]);
assert.deepEqual(lowerLengths, [3, 5]);
const upperText = spell([...upperLengths, ...hInv(upperLengths)].map(totientPrimeOrdinal));
const lowerText = spell([...lowerLengths, ...h(lowerLengths)].map(totientPrimeOrdinal));
assert.equal(upperText, "THEIR");
assert.equal(lowerText, "RISE");

// THEIR occurs exactly twice. P33's B=19 entry and H-chain output25 fix zero-based indexing.
const theirPositions = words.map((word, index) => word === "THEIR" ? index : -1)
  .filter((index) => index >= 0);
assert.deepEqual(theirPositions, [19, 25]);
assert.equal(theirPositions[0], state.B);
assert.equal(h([state.B, state.p])[0], theirPositions[1]);
const rise = theirPositions[1] - theirPositions[0];
assert.equal(rise, state.a);
assert.equal(words[rise], "SEEKS");
assert.deepEqual(words.slice(25, 30), ["THEIR", "NUMBERS", "ARE", "THE", "DIRECTION"]);

// THEIR RISE is also an exact +a translation between the two parallel signed clauses.
const firstTheirClause = words.slice(theirPositions[0], theirPositions[0] + 5);
const secondTheirClause = words.slice(theirPositions[1], theirPositions[1] + 5);
assert.deepEqual(firstTheirClause, ["THEIR", "MEANING", "IS", "THE", "ROAD"]);
assert.deepEqual(secondTheirClause, ["THEIR", "NUMBERS", "ARE", "THE", "DIRECTION"]);
assert.equal(words[24], "AND");
for (let offset = 0; offset < firstTheirClause.length; offset += 1) {
  assert.equal(words[theirPositions[0] + offset + state.a], secondTheirClause[offset]);
}
const clauseGp0Rises = firstTheirClause.map((word, offset) =>
  gp0(secondTheirClause[offset]) - gp0(word)
);
assert.deepEqual(clauseGp0Rises, [0, state.a, state.p - state.K, 0, 2 * 29]);
assert.equal(words[22], "THE");
assert.equal(words[22 + state.a], "THE");
assert.equal(words[state.p], "ROAD");
assert.equal(words[state.p + state.a], "DIRECTION");
assert.equal(state.p + state.a, 29);

// The authenticated THE scaffold has exactly two +a boundary jumps.
// The later one is now selected by the first-THEIR -> second-THEIR translation.
const thePositions = words.map((word, index) => word === "THE" ? index : -1)
  .filter((index) => index >= 0);
assert.deepEqual(thePositions, [1, 7, 12, 17, 22, 28]);
assert.deepEqual(
  thePositions.slice(0, -1)
    .filter((position, index) => thePositions[index + 1] - position === state.a)
    .map((position, index) => [position, thePositions[thePositions.indexOf(position) + 1]]),
  [[1, 7], [22, 28]]
);
assert.equal(words[2], "PATH");
assert.equal(words[8], "DEVOTED");
assert.equal(words[23], "ROAD");
assert.equal(words[29], "DIRECTION");

// Literal p50 geometry: a word's number supplies upward row count; its GP0 supplies address.
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every((row) => row.length === state.A));
const geometryCases = [];
for (const origin of [0, 1]) {
  for (const direction of ["rise", "fall"]) {
    const hits = [];
    let valid = 0;
    for (let index = 0; index < words.length; index += 1) {
      const number = index + origin;
      const start = gp0(words[index]);
      const destination = start + (direction === "rise" ? -1 : 1) * number * state.A;
      if (start >= 256 || destination < 0 || destination >= 256) continue;
      valid += 1;
      const field = stateByValue.get(destination);
      if (field) hits.push({ index, number, word: words[index], start, destination, field });
    }
    geometryCases.push({ origin, direction, valid, hits });
  }
}
const zeroRise = geometryCases.find((row) => row.origin === 0 && row.direction === "rise");
assert.ok(zeroRise);
assert.deepEqual(zeroRise.hits, [
  { index: 2, number: 2, word: "PATH", start: 39, destination: 23, field: "p" },
  { index: 6, number: 6, word: "SEEKS", start: 71, destination: 23, field: "p" },
]);
assert.deepEqual(
  geometryCases.filter((row) => row.direction === "fall").flatMap((row) => row.hits),
  []
);
assert.equal(gp0("PATH") - state.K * state.A, state.p);
assert.equal(gp0("SEEKS") - state.a * state.A, state.p);

// Secondary exact consequences under the same frozen zero-based rising rule.
assert.equal(gp0("LIES") - state.e * state.A, gp0("PATH"));
assert.equal(gp0("EPIPHANY") - state.g * state.A, state.e ** state.q);

// Precommitted PATH pointer transfer: exact base60 tape, start39, depth p=23.
const bytes = grid.byte_rows.flat();
const pathRoute = [gp0("PATH")];
for (let step = 0; step < state.p; step += 1) {
  pathRoute.push(bytes[pathRoute.at(-1)]);
}
assert.deepEqual(pathRoute, [
  39, 5, 237, 32, 115, 247, 192, 0, 203, 68, 199, 47,
  76, 114, 197, 115, 247, 192, 0, 203, 68, 199, 47, 76,
]);
assert.equal(pathRoute.length, state.p + 1);
assert.equal(pathRoute.at(-1), 76);
assert.ok(pathRoute.at(-1) > 57);
assert.equal(pathRoute[state.e], 32); // observed only after the frozen terminal gate failed.

console.log(JSON.stringify({
  status: "PASS",
  hiddenInstruction: {
    p33: upperText + " " + lowerText,
    theirPositions,
    rise,
    riseField: "a",
    wordAtRiseIndex: words[rise],
    clauseFromSecondTheir: words.slice(25, 30).join(" "),
    clauseTranslation: {
      from: firstTheirClause.join(" "),
      to: secondTheirClause.join(" "),
      indexDelta: state.a,
      gp0Rises: clauseGp0Rises,
      the: "22 + a = 28",
      roadToDirection: "p=23 + a=6 = 29",
    },
  },
  p50Geometry: {
    width: state.A,
    conventions: geometryCases,
    selectedZeroBasedRise: zeroRise,
    identities: {
      path: "GP0(PATH)=39; 39-K*A=23=p",
      seeks: "GP0(SEEKS)=71; 71-a*A=23=p",
      lies: "GP0(LIES)=63; 63-e*A=39=GP0(PATH)",
      epiphany: "GP0(EPIPHANY)=121; 121-g*A=81=e^q",
    },
  },
  prospectivePathTransfer: {
    start: gp0("PATH"),
    depth: state.p,
    route: pathRoute,
    terminal: pathRoute.at(-1),
    legalPhysicalPage: pathRoute.at(-1) <= 57,
    postFailureObservation: "route state at step e=3 is 32; this was not the precommitted success condition",
  },
  interpretation: "P33 THEIR RISE supplies a literal upward direction for signed word numbers on the 32x8 p50 geometry. Under the source-fixed zero-based convention, PATH and SEEKS are the only valid signed words whose rise lands on any DH field, and both land on p=23. This supplies a human-facing selector for the p=23 depth already used by the SEEKS route. The prospectively frozen PATH depth-p transfer fails at terminal76, so it does not generalize the SEEKS pointer route.",
}, null, 2));
