"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
const readJson = (relative) => JSON.parse(read(relative));

const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/**
 * @param {number} base
 * @param {number} exponent
 * @param {number} modulus
 */
function modPow(base, exponent, modulus) {
  let result = 1 % modulus;
  let x = ((base % modulus) + modulus) % modulus;
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = (result * x) % modulus;
    x = (x * x) % modulus;
    e = Math.floor(e / 2);
  }
  return result;
}

/**
 * @param {string} text
 */
function parseCanonical(text) {
  const words = [];
  let values = [];
  let start = 0;
  let offset = 0;

  function flush() {
    if (!values.length) return;
    words.push({
      ordinal: words.length + 1,
      start,
      end: offset - 1,
      values: values.slice(),
    });
    values = [];
  }

  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!values.length) start = offset;
      values.push(value);
      offset += 1;
    } else if ((char === "-" || char === ".") && values.length) {
      flush();
    }
  }
  flush();
  return words;
}

/**
 * @param {number[]} values
 */
function shell(values) {
  const out = [];
  let left = 0;
  let right = values.length - 1;
  while (left < right) {
    out.push(
      mod29(values[left] - values[right]),
      mod29(values[left] + values[right])
    );
    left += 1;
    right -= 1;
  }
  if (left === right) out.push(values[left]);
  return out;
}

const signedStart = signed2016.indexOf("Hello.");
const signedEnd = signed2016.indexOf("-----BEGIN PGP SIGNATURE-----");
assert.ok(signedStart >= 0 && signedEnd > signedStart);
const body = signed2016.slice(signedStart, signedEnd);
const source = body
  .replace(/\b7A35090F\b/g, "")
  .match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g)
  .map((word, index) => ({
    index,
    ordinal: index + 1,
    word: word.toUpperCase(),
  }));

assert.equal(source.length, 43);
const byWord = new Map();
for (const row of source) {
  if (!byWord.has(row.word)) byWord.set(row.word, row.index);
}
assert.equal(byWord.get("VERIFY"), 41);
assert.equal(byWord.get("OPENPGP"), 42);
assert.equal(byWord.get("NUMBERS"), 26);
assert.equal(byWord.get("PRIMUS"), 10);
assert.equal(byWord.get("WORDS"), 15);
assert.equal(byWord.get("THEIR"), 19);
assert.equal(byWord.get("ROAD"), 23);

// Numbered route: source word42 VERIFY -> physical page42/project p41 -> word42.
const verify = source[41];
assert.equal(verify.word, "VERIFY");
assert.equal(verify.ordinal, 42);

const verifyObject = parseCanonical(parts[41])[41];
assert.ok(verifyObject);
assert.equal(verifyObject.ordinal, 42);
assert.equal(verifyObject.start, 171);
assert.deepEqual(verifyObject.values, [0, 14, 13, 19, 3, 6, 9]);

const verifyShell = shell(verifyObject.values);
assert.deepEqual(verifyShell, [20, 9, 8, 20, 10, 16, 19]);
const innerCore = verifyShell.slice(-3);
assert.deepEqual(innerCore, [10, 16, 19]);

const [endpoint, stride, expectedMiddleResidue] = innerCore;
assert.equal(endpoint, byWord.get("PRIMUS"));
assert.equal(expectedMiddleResidue, byWord.get("THEIR"));

// From zero-based OPENPGP=42, the source-selected stride16 reaches exactly
// NUMBERS26 then PRIMUS10 without wrapping.
const walk = [byWord.get("OPENPGP")];
while (walk.at(-1) !== endpoint) {
  const next = walk.at(-1) - stride;
  assert.ok(next >= 0, "backward stride left authenticated source");
  walk.push(next);
}
assert.deepEqual(walk, [42, 26, 10]);
assert.deepEqual(
  walk.map((index) => source[index].word),
  ["OPENPGP", "NUMBERS", "PRIMUS"]
);

// Authentic printed OpenPGP key ID.
const keyIdMatch = signed2016.match(/\b([0-9A-F]{8})\b/);
assert.ok(keyIdMatch);
assert.equal(keyIdMatch[1], "7A35090F");
const N = Number.parseInt(keyIdMatch[1], 16);
assert.equal(N, 0x7A35090F);

// The walked labels supply the natural radix/moduli:
// OPENPGP -> hex16, NUMBERS -> conventional base60 (with base59 rival),
// PRIMUS -> GP/base29.
const residues = {
  hex16: N % 16,
  base60: N % 60,
  base59: N % 59,
  base29: N % 29,
};
assert.deepEqual(residues, {
  hex16: 15,
  base60: 19,
  base59: 0,
  base29: 23,
});

// VERIFY's source-selected inner-core value19 selects base60 over base59.
assert.equal(residues.base60, expectedMiddleResidue);
assert.notEqual(residues.base59, expectedMiddleResidue);

// The three source landings are exactly b,B,p.
assert.equal(residues.hex16, byWord.get("WORDS"));
assert.equal(residues.base60, byWord.get("THEIR"));
assert.equal(residues.base29, byWord.get("ROAD"));

const b = residues.hex16;
const B = residues.base60;
const p = residues.base29;
const gCandidates = [];
for (let g = 1; g < p; g += 1) {
  if (modPow(g, b, p) === B) gCandidates.push(g);
}
assert.deepEqual(gCandidates, [5]);
const g = gCandidates[0];

// Reconstruct the remaining state without the p28 DH line.
// THEIR occurs at zero-based positions19 and25, so authored RISE gives a=6.
const theirPositions = source
  .filter((row) => row.word === "THEIR")
  .map((row) => row.index);
assert.deepEqual(theirPositions, [19, 25]);
const a = theirPositions[1] - theirPositions[0];
const A = modPow(g, a, p);
const K = modPow(B, a, p);
const e = (() => {
  for (let candidate = 1; candidate < p - 1; candidate += 1) {
    if ((b * candidate) % (p - 1) === 1) return candidate;
  }
  return null;
})();
const q = e + 1;

const recoveredState = {p, g, a, b, A, B, K, e, q};
assert.deepEqual(recoveredState, {
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

// Every recovered value lands on the independently authenticated role word.
assert.equal(byWord.get("ROAD"), recoveredState.p);
assert.equal(byWord.get("EPIPHANY"), recoveredState.g);
assert.equal(byWord.get("SEEKS"), recoveredState.a);
assert.equal(byWord.get("WORDS"), recoveredState.b);
assert.equal(byWord.get("DEVOTED"), recoveredState.A);
assert.equal(byWord.get("THEIR"), recoveredState.B);
assert.equal(byWord.get("PATH"), recoveredState.K);
assert.equal(byWord.get("LIES"), recoveredState.e);
assert.equal(byWord.get("EMPTY"), recoveredState.q);
assert.equal(modPow(A, b, p), K);
assert.equal(modPow(B, a, p), K);

// Manuscript-wide inner-core control: every canonical odd-length word >=3,
// same fixed outside-in shell, exact innermost [diff,sum,center] triple.
let eligibleOddWords = 0;
const coreHits = [];
for (let page = 0; page <= 55; page += 1) {
  for (const word of parseCanonical(parts[page])) {
    if (word.values.length < 3 || word.values.length % 2 === 0) continue;
    eligibleOddWords += 1;
    const core = shell(word.values).slice(-3);
    if (core.every((value, index) => value === innerCore[index])) {
      coreHits.push({
        page,
        ordinal: word.ordinal,
        start: word.start,
        length: word.values.length,
      });
    }
  }
}
assert.equal(eligibleOddWords, 1375);
assert.deepEqual(coreHits, [{
  page: 41,
  ordinal: 42,
  start: 171,
  length: 7,
}]);

console.log("PASS VERIFY numbered core selects OPENPGP modulus ladder");
console.log(JSON.stringify({
  verify: {
    sourceIndex: verify.index,
    sourceOrdinal: verify.ordinal,
    projectPage: 41,
    localWord: verifyObject.ordinal,
    start: verifyObject.start,
    values: verifyObject.values,
    shell: verifyShell,
    innerCore,
  },
  openpgpWalk: {
    indices: walk,
    words: walk.map((index) => source[index].word),
  },
  keyId: keyIdMatch[1],
  residues,
  recoveredState,
  control: {eligibleOddWords, coreHits},
}, null, 2));
