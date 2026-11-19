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

function HInv(diff, sum) {
  const inv2 = 15;
  return [
    mod29((diff + sum) * inv2),
    mod29((sum - diff) * inv2),
  ];
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
// assign the ordered source pair [e,-K] to [center singleton, the adjacent five-rune word].
// This recovers READ OUT exactly.
const parts = transcription.split(/^\s*%\s*$/m);

// Canonical page-local words must retain printed words that continue across
// physical page boundaries. Crossing words are excluded from either page's
// complete-word ordinals.
const unknownSegments = parts.slice(0, 55);
const canonicalPages = unknownSegments.map((text, segment) => ({
  page: segment >= 50 ? segment + 1 : segment,
  words: [],
  offset: 0,
}));
let currentCanonicalWord = [];
let canonicalStartSegment = 0;
let canonicalEndSegment = 0;
let canonicalStartOffset = 0;
let crossingWordCount = 0;

function flushCanonicalWord() {
  if (!currentCanonicalWord.length) return;
  if (canonicalStartSegment === canonicalEndSegment) {
    const page = canonicalPages[canonicalStartSegment];
    page.words.push({
      ordinal: page.words.length + 1,
      start: canonicalStartOffset,
      end: canonicalStartOffset + currentCanonicalWord.length - 1,
      length: currentCanonicalWord.length,
      values: currentCanonicalWord.slice(),
    });
  } else {
    crossingWordCount += 1;
  }
  currentCanonicalWord = [];
}

for (let segment = 0; segment < unknownSegments.length; segment += 1) {
  for (const char of [...unknownSegments[segment]]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!currentCanonicalWord.length) {
        canonicalStartSegment = segment;
        canonicalStartOffset = canonicalPages[segment].offset;
      }
      canonicalEndSegment = segment;
      currentCanonicalWord.push(value);
      canonicalPages[segment].offset += 1;
    } else if (char === "/" || /\s/u.test(char)) {
      // Printed line and physical-page wraps may continue a word.
    } else {
      flushCanonicalWord();
    }
  }
}
flushCanonicalWord();

const canonicalWords = canonicalPages.flatMap((page) =>
  page.words.map((word) => ({page: page.page, ...word}))
);
const canonicalWordsByPage = new Map(
  canonicalPages.map((page) => [page.page, page.words])
);
const canonicalPageWords = (page) => canonicalWordsByPage.get(page) || [];

assert.equal(crossingWordCount, 32);
assert.equal(canonicalWords.length, 2864);

// Fresh same-index consequence: BE(34) -> PATHS(40) fixes the only
// nonzero H coordinate of a same-GP0 two-rune subtraction key.
const be = message[34];
const paths = message[40];
assert.equal(be.word, "BE");
assert.equal(paths.word, "PATHS");
const beRise = mod29(paths.gp0 - be.gp0);
assert.equal(beRise, state.B);

const beKey = HInv(beRise, 0);
assert.deepEqual(beKey, [24, 5]);
const beValues = gp(be.word);
const predictedP34Cipher = beValues.map((value, index) =>
  mod29(value + beKey[index])
);
assert.deepEqual(predictedP34Cipher, [12, 23]);

const p34Words = canonicalPageWords(34);
const p34StateReceivers = p34Words.filter(
  (word) =>
    word.values.length === beValues.length &&
    word.values.reduce((sum, value) => sum + value, 0) === be.gp0
);
assert.deepEqual(
  p34StateReceivers.map((word) => [word.start, word.values]),
  [
    [4, [12, 23]],
    [249, [28, 7]],
  ]
);
assert.deepEqual(
  p34StateReceivers
    .filter((word) =>
      word.values.every((value, index) => value === predictedP34Cipher[index])
    )
    .map((word) => word.start),
  [4]
);

// Charge every authenticated two-GP-rune word whose +6 partner exists.
// The frozen rule has two forward hits: p28 THE and p34 BE. The p28 hit
// was exposed by a failed CI assertion that had expected no hit there.
const twoRunePredictions = [];
for (const source of message) {
  if (source.index + rise >= message.length) continue;
  const target = gp(source.word);
  if (target.length !== 2) continue;

  const sourceRise = mod29(message[source.index + rise].gp0 - source.gp0);
  const key = HInv(sourceRise, 0);
  const predicted = target.map((value, index) => mod29(value + key[index]));
  const pageWords = canonicalPageWords(source.index);
  const matches = pageWords.filter(
    (word) =>
      word.values.length === 2 &&
      word.values.every((value, index) => value === predicted[index])
  );
  twoRunePredictions.push({
    index: source.index,
    word: source.word,
    rise: sourceRise,
    predicted,
    matches: matches.map((word) => word.start),
  });
}
assert.deepEqual(
  twoRunePredictions.map((row) => [row.index, row.word, row.matches]),
  [
    [1, "THE", []],
    [7, "THE", []],
    [11, "IS", []],
    [12, "THE", []],
    [17, "THE", []],
    [21, "IS", []],
    [22, "THE", []],
    [28, "THE", [140]],
    [34, "BE", [4]],
  ]
);

// Unexpected held-out consequence at signed/page index28.
// THE28 rises to BE34 by b=15, forcing H^-1([b,0])=[p-1,g+K].
// That predicts a manuscript-unique two-rune ciphertext immediately after
// the existing p28 READ OUT object.
const p28Source = message[28];
assert.equal(p28Source.word, "THE");
assert.equal(message[34].word, "BE");
const p28Rise = mod29(message[34].gp0 - p28Source.gp0);
assert.equal(p28Rise, state.b);
const p28TheKey = HInv(p28Rise, 0);
assert.deepEqual(p28TheKey, [22, 7]);
assert.deepEqual(p28TheKey, [state.p - 1, state.g + state.K]);
const p28TheCipher = gp(p28Source.word).map((value, index) =>
  mod29(value + p28TheKey[index])
);
assert.deepEqual(p28TheCipher, [24, 25]);

const p28Words = canonicalPageWords(28);
const p28Runes = corpus.pages.find((page) => page.page === 28).indices;
assert.equal(p28Runes.length, 269);
const centerOffset = Math.floor(p28Runes.length / 2);
assert.equal(centerOffset, 134);
const readoutWord = p28Words[26];
assert.equal(readoutWord.ordinal, 27);
assert.equal(readoutWord.start, 135);
assert.equal(readoutWord.length, state.g);
const p28TheWord = p28Words[27];
assert.equal(p28TheWord.ordinal, 28);
assert.equal(p28TheWord.start, 140);
assert.deepEqual(p28TheWord.values, p28TheCipher);
const p28The = p28TheWord.values.map((value, index) =>
  mod29(value - p28TheKey[index])
);
assert.deepEqual(p28The, gp("THE"));
assert.equal(spell(p28The), "THE");

const [centerExponent, wordExponent] = tailEvent.missing;
// Manuscript-wide exact packet control for the held-out p28 prediction.
let twoRuneWordCount = 0;
const p28PacketHits = [];
for (const word of canonicalWords) {
  if (word.values.length !== 2) continue;
  twoRuneWordCount += 1;
  if (word.values.every((value, index) => value === p28TheCipher[index])) {
    p28PacketHits.push({
      page: word.page,
      ordinal: word.ordinal,
      start: word.start,
    });
  }
}
assert.equal(twoRuneWordCount, 448);
assert.deepEqual(p28PacketHits, [{
  page: 28,
  ordinal: 28,
  start: 140,
}]);

const decoded = [
  Number(BigInt(p28Runes[centerOffset]) ** BigInt(centerExponent) % 29n),
  ...readoutWord.values.map((value) =>
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
  p28The: {
    rise: p28Rise,
    key: p28TheKey,
    predictedCipher: p28TheCipher,
    receiverStart: 140,
    manuscriptPacketHits: p28PacketHits,
  },
  p34Be: {
    rise: beRise,
    key: beKey,
    predictedCipher: predictedP34Cipher,
    receiverStart: 4,
  },
  p28Decoded: spell(decoded),
  p28Extended: spell(decoded) + spell(p28The),
}, null, 2));
