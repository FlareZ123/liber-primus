"use strict";

/**
 * SFT: THEIR RISE + authenticated GP0 differences recover two H-rectangle
 * missing corners: [a,b] and [e,-K]. The same source-derived [e,-K]
 * reproduces the existing p28 READ OUT transform.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

function gp0(word) {
  return gp(word).reduce((sum, value) => sum + value, 0);
}

function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

function signedWords() {
  const clear = signed2016
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .split(/\n\n/u)
    .slice(1)
    .join("\n");

  return clear
    .split(/[^A-Za-z0-9]+/u)
    .filter((token) => /^[A-Za-z]+$/u.test(token))
    .map((word, index) => ({
      index,
      word: word.toUpperCase(),
      gp0: gp0(word),
    }));
}

function parsePage(text) {
  const words = [];
  let values = [];
  let start = 0;
  let offset = 0;

  function flush() {
    if (!values.length) return;
    words.push({
      index: words.length,
      start,
      end: offset - 1,
      length: values.length,
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
 * Return the missing fourth corner when three distinct points occupy exactly
 * three cells of a 2x2 Cartesian rectangle.
 *
 * @param {Array<[number, number]>} points
 * @returns {[number, number] | null}
 */
function rectangleMissing(points) {
  const xs = [...new Set(points.map((point) => point[0]))];
  const ys = [...new Set(points.map((point) => point[1]))];
  const present = new Set(points.map((point) => point.join(",")));

  if (xs.length !== 2 || ys.length !== 2 || present.size !== 3) return null;

  const missing = [];
  for (const x of xs) {
    for (const y of ys) {
      if (!present.has([x, y].join(","))) missing.push([x, y]);
    }
  }
  return missing.length === 1 ? missing[0] : null;
}

/**
 * Build seven GP0 rise residues and transform their three outside-in pairs.
 *
 * @param {Array<{index:number,word:string,gp0:number}>} message
 * @param {number} start
 * @param {number} rise
 * @param {"forward"|"reverse"} orientation
 */
function riseRectangle(message, start, rise, orientation) {
  const residues = [];
  for (let index = start; index < start + 7; index += 1) {
    residues.push(mod29(message[index + rise].gp0 - message[index].gp0));
  }

  const pairIndices = [[0, 6], [1, 5], [2, 4]];
  const points = pairIndices.map(([left, right]) =>
    orientation === "forward"
      ? H(residues[left], residues[right])
      : H(residues[right], residues[left])
  );

  return {
    start,
    rise,
    orientation,
    residues,
    points,
    center: residues[3],
    missing: rectangleMissing(points),
  };
}

const message = signedWords();
assert.equal(message.length, 43);

const indexOf = (word) => {
  const matches = message.filter((row) => row.word === word);
  assert.ok(matches.length >= 1, "missing source word " + word);
  return matches.map((row) => row.index);
};

// Established authenticated-word role values, reconstructed from source
// positions rather than hard-coded numeric state values.
const theirPositions = indexOf("THEIR");
assert.deepEqual(theirPositions, [19, 25]);
const rise = theirPositions[1] - theirPositions[0];

const state = Object.freeze({
  K: indexOf("PATH")[0],
  e: indexOf("LIES")[0],
  q: indexOf("EMPTY")[0],
  g: indexOf("EPIPHANY")[0],
  a: indexOf("SEEKS")[0],
  A: indexOf("DEVOTED")[0],
  b: indexOf("WORDS")[0],
  B: theirPositions[0],
  p: indexOf("ROAD")[0],
});
assert.deepEqual(state, {
  K: 2,
  e: 3,
  q: 4,
  g: 5,
  a: 6,
  A: 8,
  b: 15,
  B: 19,
  p: 23,
});
assert.equal(rise, state.a);
assert.equal((state.g ** state.a) % state.p, state.A);
assert.equal((state.g ** state.b) % state.p, state.B);
assert.equal((state.A ** state.b) % state.p, state.K);
assert.equal((state.B ** state.a) % state.p, state.K);

// Exhaust every seven-pair window under the source-selected rise a=6 and
// both H operand orientations.
const fixedRiseEvents = [];
for (let start = 0; start + rise + 6 < message.length; start += 1) {
  for (const orientation of ["forward", "reverse"]) {
    const event = riseRectangle(message, start, rise, orientation);
    if (event.missing) fixedRiseEvents.push(event);
  }
}

assert.equal(fixedRiseEvents.length, 4);
assert.deepEqual(
  fixedRiseEvents.map((event) => [
    event.start,
    event.orientation,
    event.missing,
  ]),
  [
    [5, "forward", [state.p, state.b]],
    [5, "reverse", [state.a, state.b]],
    [30, "forward", [mod29(-state.e), mod29(-state.K)]],
    [30, "reverse", [state.e, mod29(-state.K)]],
  ]
);

// The reverse orientation is internally calibrated by the first rectangle:
// its missing corner is exactly the ordinary DH private pair [a,b].
const privateEvent = fixedRiseEvents.find(
  (event) =>
    event.start === 5 &&
    event.orientation === "reverse"
);
assert.ok(privateEvent);
assert.deepEqual(privateEvent.residues, [20, 7, 8, 26, 12, 13, 24]);
assert.deepEqual(privateEvent.points, [
  [state.q, state.b],
  [state.a, mod29(state.p - state.e)],
  [state.q, mod29(state.p - state.e)],
]);
assert.deepEqual(privateEvent.missing, [state.a, state.b]);

// Apply the unchanged orientation to the final seven rise pairs immediately
// after DIRECTION. The three visible rectangle corners force [e,-K].
const tailEvent = fixedRiseEvents.find(
  (event) =>
    event.start === 30 &&
    event.orientation === "reverse"
);
assert.ok(tailEvent);
assert.deepEqual(
  message.slice(30, 37).map((row) => row.word),
  ["SEEK", "AND", "YOU", "WILL", "BE", "FOUND", "GOOD"]
);
assert.deepEqual(
  message.slice(36, 43).map((row) => row.word),
  ["GOOD", "LUCK", "BEWARE", "FALSE", "PATHS", "VERIFY", "OPENPGP"]
);
assert.deepEqual(tailEvent.residues, [
  state.A,
  state.q,
  0,
  mod29(state.p - state.e),
  state.B,
  state.p,
  state.a + state.g,
]);
assert.deepEqual(tailEvent.points, [
  [state.e, state.B],
  [state.B, mod29(-state.K)],
  [state.B, state.B],
]);
assert.deepEqual(tailEvent.missing, [state.e, mod29(-state.K)]);
assert.deepEqual(tailEvent.missing, [3, 27]);

// Broader finite control: charge every possible positive rise that still
// permits seven pairs, every start, and both H orientations.
let charged = 0;
const allRectangleEvents = [];
for (let testRise = 1; testRise <= message.length - 7; testRise += 1) {
  for (
    let start = 0;
    start + testRise + 6 < message.length;
    start += 1
  ) {
    for (const orientation of ["forward", "reverse"]) {
      charged += 1;
      const event = riseRectangle(message, start, testRise, orientation);
      if (event.missing) allRectangleEvents.push(event);
    }
  }
}
assert.equal(charged, 1332);
assert.equal(allRectangleEvents.length, 8);
assert.deepEqual(
  allRectangleEvents.map((event) => [
    event.rise,
    event.start,
    event.orientation,
    event.missing,
  ]),
  [
    [2, 10, "forward", [16, 0]],
    [2, 10, "reverse", [13, 0]],
    [6, 5, "forward", [23, 15]],
    [6, 5, "reverse", [6, 15]],
    [6, 30, "forward", [26, 27]],
    [6, 30, "reverse", [3, 27]],
    [10, 12, "forward", [0, 22]],
    [10, 12, "reverse", [0, 22]],
  ]
);
assert.equal(
  allRectangleEvents.filter(
    (event) =>
      event.missing[0] === state.e &&
      event.missing[1] === mod29(-state.K)
  ).length,
  1
);

// Exact downstream consequence on the existing source-selected p28 object:
// assign the ordered source pair [e,-K] to [center singleton, word28].
// This recovers READ OUT exactly.
const parts = transcription.split(/^\s*%\s*$/m);
const p28Words = parsePage(parts[28]);
const p28Runes = corpus.pages.find((page) => page.page === 28).indices;
assert.equal(p28Runes.length, 269);
const centerOffset = Math.floor(p28Runes.length / 2);
assert.equal(centerOffset, 134);
const word28 = p28Words[27];
assert.equal(word28.start, 135);
assert.equal(word28.length, state.g);

const [centerExponent, wordExponent] = tailEvent.missing;
const decoded = [
  Number(BigInt(p28Runes[centerOffset]) ** BigInt(centerExponent) % 29n),
  ...word28.values.map((value) =>
    Number(BigInt(value) ** BigInt(wordExponent) % 29n)
  ),
];
assert.deepEqual(decoded, [4, 28, 23, 3, 1, 16]);
assert.equal(spell(decoded), "REA DOUT".replace(" ", ""));

console.log("PASS THEIR RISE H-rectangle source selector");
console.log(JSON.stringify({
  rise,
  fixedRiseRectangleEvents: fixedRiseEvents.map((event) => ({
    start: event.start,
    orientation: event.orientation,
    missing: event.missing,
  })),
  charged,
  allRectangleEvents: allRectangleEvents.map((event) => ({
    rise: event.rise,
    start: event.start,
    orientation: event.orientation,
    missing: event.missing,
  })),
  privatePair: privateEvent.missing,
  exponentPair: tailEvent.missing,
  p28Decoded: spell(decoded),
}, null, 2));
