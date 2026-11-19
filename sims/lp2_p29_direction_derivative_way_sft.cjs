"use strict";

/**
 * SFT for the signed MAP/DIRECTION -> e=3 -> p29 derivative -> WAY bridge.
 *
 * Source path:
 * 1. reconstruct p28 DH state and e=3;
 * 2. parse authenticated 2016 words and show MAP/DIRECTION uniquely share
 *    endpoint H-sum e, with MAP -> [a,e] and reversed DIRECTION -> [b,e];
 * 3. use DIRECTION-selected p29 and p39 repeated root24;
 * 4. derive signed-2013 BASE29 factor H=[24,26,3], whose constant is e;
 * 5. evaluate the e-th derivative at root24;
 * 6. charge placement/direction alternatives for derivative value plus H's
 *    positive-degree coefficient pair and compare only with authenticated
 *    three-GP-rune words.
 *
 * Node.js 22, CommonJS, read-only, no third-party dependencies.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const readText = (relative) =>
  fs.readFileSync(path.join(ROOT, relative), "utf8").replace(/\r/g, "");
const readJson = (relative) => JSON.parse(readText(relative));

const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const grid = readJson("resources/liber-primus/lp2-grid-256.json");
const transcription = readText("resources/liber-primus/lp2-transcription.txt");
const signed2016 = readText("resources/historical/cicada2016-4gq25-outguess.asc");
const signed2013 = readText("resources/external/2013-tcp-server-signed-source.md");

const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const M = 29;

/** @param {number} value */
const mod = (value) => ((value % M) + M) % M;

/** @param {number} base @param {number} exponent @param {number} modulus */
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

/** @param {number} a @param {number} b */
function gcdInt(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

/** @param {number} value @param {number} modulus */
function inverse(value, modulus) {
  if (gcdInt(value, modulus) !== 1) return null;
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  return null;
}

/** @param {string} text @returns {number[]} */
function values(text) {
  return [...text]
    .map((char) => runeIndex.get(char))
    .filter((value) => value !== undefined);
}

/** @param {string} line @returns {number[][]} */
function fragments(line) {
  return line
    .split(/[-.]/u)
    .map(values)
    .filter((fragment) => fragment.length > 0);
}

/** @param {number[]} fragment */
function outerH(fragment) {
  if (fragment.length < 2) return [];
  return [mod(fragment[0] - fragment.at(-1)), mod(fragment[0] + fragment.at(-1))];
}

/** @param {number} x @param {number} y */
function H(x, y) {
  return [mod(x - y), mod(x + y)];
}

/** @param {number[]} vector */
function transliterate(vector) {
  return vector.map((value) => corpus.translit[value]).join("");
}

/*
 * Reconstruct p28 state and e from the literal-DH line.
 */
const p28Lines = parts[28].trim().split("/");
const dhFragments = fragments(p28Lines[5]);
assert.equal(transliterate(dhFragments[0]), "DH");
const stream = dhFragments.flatMap(outerH);
assert.deepEqual(stream, [15,2,14,4,12,12,23,12,8,19]);

const g = dhFragments.length;
const a = 6;
const b = stream[0];
const K = stream[1];
const stateCandidates = [];

for (const p of new Set(stream)) {
  if (![2,3,5,7,11,13,17,19,23].includes(p) || g >= p || b >= p) continue;
  const A = modPow(g, a, p);
  const B = modPow(g, b, p);
  const shared = modPow(A, b, p);
  if (
    shared === K &&
    shared === modPow(B, a, p) &&
    stream.includes(A) &&
    stream.includes(B)
  ) stateCandidates.push({p,g,a,b,A,B,K});
}

assert.deepEqual(stateCandidates, [{p:23,g:5,a:6,b:15,A:8,B:19,K:2}]);
const state = {...stateCandidates[0], e: inverse(b, 22)};
assert.equal(state.e, 3);

/*
 * Canonical GP tokenization for authenticated English words.
 */
const alphabet = corpus.translit
  .map((token, index) => ({token:token.toLowerCase(), index}))
  .sort((left, right) => right.token.length - left.token.length);

/** @param {string} word @returns {number[]} */
function tokenize(word) {
  let rest = word
    .toLowerCase()
    .replace(/v/g, "u")
    .replace(/k/g, "c")
    .replace(/z/g, "s");
  const out = [];

  while (rest.length > 0) {
    const hit = alphabet.find(({token}) => rest.startsWith(token));
    assert.ok(hit, "unrecognized GP token in " + word + ": " + rest);
    out.push(hit.index);
    rest = rest.slice(hit.token.length);
  }
  return out;
}

const signedStart = signed2016.indexOf("Hello.");
const signedEnd = signed2016.indexOf("-----BEGIN PGP SIGNATURE-----");
assert.ok(signedStart >= 0 && signedEnd > signedStart);
const signedBody = signed2016
  .slice(signedStart, signedEnd)
  .replace(/\b7A35090F\b/g, "");
const words = signedBody.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
assert.equal(words.length, 43);

const wordRows = words.map((word, index) => {
  const tokens = tokenize(word);
  const first = tokens[0];
  const last = tokens.at(-1);
  return {
    position:index + 1,
    word,
    tokens,
    forward:H(first, last),
    reverse:H(last, first),
  };
});

// Endpoint sum is orientation-invariant. Exactly MAP and DIRECTION have sum e=3.
const sumE = wordRows.filter((row) => row.forward[1] === state.e);
assert.deepEqual(
  sumE.map(({position,word}) => ({position,word:word.toLowerCase()})),
  [
    {position:19,word:"map"},
    {position:30,word:"direction"},
  ]
);

const mapRow = wordRows[18];
const directionRow = wordRows[29];
assert.equal(mapRow.word.toLowerCase(), "map");
assert.equal(directionRow.word.toLowerCase(), "direction");
assert.deepEqual(mapRow.forward, [state.a, state.e]);
assert.deepEqual(mapRow.reverse, [state.p, state.e]);
assert.deepEqual(directionRow.reverse, [state.b, state.e]);

// Across all 43 words, these exact oriented pairs are unique.
assert.deepEqual(
  wordRows
    .filter((row) => row.forward[0] === state.a && row.forward[1] === state.e)
    .map(({position,word}) => ({position,word:word.toLowerCase()})),
  [{position:19,word:"map"}]
);
assert.deepEqual(
  wordRows
    .filter((row) => row.reverse[0] === state.b && row.reverse[1] === state.e)
    .map(({position,word}) => ({position,word:word.toLowerCase()})),
  [{position:30,word:"direction"}]
);

/*
 * Derive H from the authenticated 2013 BASE29 example.
 * The source records BASE29 3301 -> 3QO. In digit values this is [3,26,24].
 * The established polynomial convention reverses those digits to high-first
 * H=[24,26,3]=24X^2+26X+3. Its constant equals e.
 */
assert.match(signed2013, /BASE29 3301[^\n]*3QO/);
const base29Alphabet = "0123456789ABCDEFGHIJKLMNOPQRS";
/** @param {string} digit */
const base29Digit = (digit) => base29Alphabet.indexOf(digit);
const base29Digits = [..."3QO"].map(base29Digit);
assert.deepEqual(base29Digits, [3,26,24]);
const Hpoly = [...base29Digits].reverse();
assert.deepEqual(Hpoly, [24,26,state.e]);
const hPositiveDegree = Hpoly.slice(0,2);
assert.deepEqual(hPositiveDegree, [24,26]);
assert.equal(transliterate(hPositiveDegree), "AY");

/*
 * Reconstruct the p39 repeated root24 from its visible red triad.
 */
const G = [15,5,27];
/** @param {number[]} coeffs @param {number} x @param {number} order */
function derivativeValue(coeffs, x, order) {
  let current = coeffs.slice();
  for (let step = 0; step < order; step += 1) {
    const degree = current.length - 1;
    current = current
      .slice(0, -1)
      .map((coefficient, index) => mod(coefficient * (degree - index)));
  }
  let value = 0;
  for (const coefficient of current) value = mod(value * x + coefficient);
  return value;
}
assert.equal(derivativeValue(G, 24, 0), 0);
assert.equal(derivativeValue(G, 24, 1), 0);

const p29 = corpus.pages.find((page) => page.page === 29).indices;
const tablePoly = grid.bytes.map((value) => value % M);
assert.equal(derivativeValue(p29, 24, 0), 0);
assert.equal(derivativeValue(p29, 24, 1), 0);
assert.equal(derivativeValue(tablePoly, 24, 0), 0);
assert.equal(derivativeValue(tablePoly, 24, 1), 0);

const p29E = derivativeValue(p29, 24, state.e);
const tableE = derivativeValue(tablePoly, 24, state.e);
assert.equal(p29E, 7);
assert.equal(tableE, 7);
assert.equal(corpus.translit[p29E], "W");

/*
 * Charge the small assembly family:
 * - source polynomial: p29 or table;
 * - derivative order k=0..e;
 * - insert derivative value in any of three positions around H's fixed
 *   positive-degree pair [24,26];
 * - read forward or reverse.
 *
 * Compare only to authenticated signed words that tokenize to exactly three
 * GP runes. H's positive-degree pair is fixed before the language check
 * because the constant coefficient is already consumed as e.
 */
const threeRuneLexicon = new Map();
for (const row of wordRows) {
  if (row.tokens.length !== 3) continue;
  const key = row.tokens.join(",");
  if (!threeRuneLexicon.has(key)) threeRuneLexicon.set(key, []);
  threeRuneLexicon.get(key).push({
    position:row.position,
    word:row.word.toLowerCase(),
  });
}

const familyHits = [];
let configurations = 0;
for (const [sourceName, polynomial] of [
  ["p29", p29],
  ["table", tablePoly],
]) {
  for (let order = 0; order <= state.e; order += 1) {
    const value = derivativeValue(polynomial, 24, order);
    for (let slot = 0; slot < 3; slot += 1) {
      const placed = hPositiveDegree.slice();
      placed.splice(slot, 0, value);

      for (const direction of ["forward", "reverse"]) {
        configurations += 1;
        const output =
          direction === "forward" ? placed : [...placed].reverse();
        const key = output.join(",");
        if (!threeRuneLexicon.has(key)) continue;
        familyHits.push({
          sourceName,
          order,
          value,
          slot,
          direction,
          output,
          text:transliterate(output),
          words:threeRuneLexicon.get(key),
        });
      }
    }
  }
}

assert.equal(configurations, 48);
assert.deepEqual(familyHits, [
  {
    sourceName:"p29",
    order:3,
    value:7,
    slot:0,
    direction:"forward",
    output:[7,24,26],
    text:"WAY",
    words:[{position:14,word:"way"}],
  },
  {
    sourceName:"table",
    order:3,
    value:7,
    slot:0,
    direction:"forward",
    output:[7,24,26],
    text:"WAY",
    words:[{position:14,word:"way"}],
  },
]);

console.log(JSON.stringify({
  status:"PASS",
  state,
  signed2016:{
    sumEWords:sumE.map(({position,word,forward,reverse}) => ({
      position,
      word:word.toLowerCase(),
      forward,
      reverse,
    })),
    mapPair:mapRow.forward,
    directionReversePair:directionRow.reverse,
  },
  signed2013:{
    base29:"3QO",
    digits:base29Digits,
    highFirstH:Hpoly,
    positiveDegreePair:hPositiveDegree,
    positiveDegreeText:transliterate(hPositiveDegree),
  },
  derivative:{
    root:24,
    order:state.e,
    p29Value:p29E,
    tableValue:tableE,
    valueText:corpus.translit[p29E],
  },
  chargedFamily:{
    configurations,
    authenticatedThreeRuneWords:[...threeRuneLexicon.entries()].map(
      ([key,entries]) => ({key,entries})
    ),
    hits:familyHits,
  },
  classification:
    "Strong retrospective operation-selector candidate: authenticated MAP/DIRECTION uniquely select e=3 in the fixed H endpoint register; applying e as derivative order at the independently selected root24 gives W on both p29 and the table, and the fixed positive-degree signed-2013 H pair supplies AY. The 48-way placement/direction family has only WAY as an authenticated three-rune hit. Treat WAY as a cross-source recovered instruction candidate, with the assembly order still retrospective and the p29 plaintext inverse still unknown.",
}, null, 2));
