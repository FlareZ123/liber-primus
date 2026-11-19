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

/** @param {number[]} values @returns {number[]} */
function hOutsideIn(values) {
  const output = [];
  for (let index = 0; index < Math.floor(values.length / 2); index += 1) {
    const left = values[index];
    const right = values[values.length - 1 - index];
    output.push(mod29(left - right), mod29(left + right));
  }
  if (values.length % 2 === 1) output.push(values[Math.floor(values.length / 2)]);
  return output;
}

/** @param {number[]} values @returns {number[]} */
function hInverse(values) {
  const output = new Array(values.length);
  const inverse2 = 15;
  for (let index = 0; index < Math.floor(values.length / 2); index += 1) {
    const difference = values[index * 2];
    const sum = values[index * 2 + 1];
    output[index] = mod29((sum + difference) * inverse2);
    output[values.length - 1 - index] = mod29((sum - difference) * inverse2);
  }
  if (values.length % 2 === 1) output[Math.floor(values.length / 2)] = values[values.length - 1];
  return output;
}

/** @param {number[]} values @returns {boolean} */
function isPalindrome(values) {
  return values.every((value, index) => value === values[values.length - 1 - index]);
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const translit = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
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
    const token = translit.find((candidate) => normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, `No GP token for ${normalized.slice(offset)}`);
    output.push(token.value);
    offset += token.symbol.length;
  }
  return output;
}

const clear = signed2016.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);
assert.ok(clear);
const sourceWords = (clear[1].match(/\b[A-Za-z]+\b/gu) || []).map((word) => word.toUpperCase());

const source8plus5 = [];
for (let index = 0; index + 1 < sourceWords.length; index += 1) {
  const first = gp(sourceWords[index]);
  const second = gp(sourceWords[index + 1]);
  if (first.length === 8 && second.length === 5) {
    source8plus5.push({
      index,
      words: [sourceWords[index], sourceWords[index + 1]],
      plaintext: first.concat(second),
    });
  }
}

assert.equal(source8plus5.length, 1);
assert.deepEqual(source8plus5[0].words, ["EPIPHANY", "SEEKS"]);
const plaintext = source8plus5[0].plaintext;

const segments = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const pages = segments.map((text, segment) => ({
  page: segment >= 50 ? segment + 1 : segment,
  text,
  words: [],
  offset: 0,
}));

let current = [];
let startSegment = 0;
let endSegment = 0;
let startOffset = 0;

function flushWord() {
  if (current.length === 0) return;
  if (startSegment === endSegment) {
    const page = pages[startSegment];
    page.words.push({
      page: page.page,
      ordinal: page.words.length + 1,
      start: startOffset,
      values: current.slice(),
    });
  }
  current = [];
}

for (let segment = 0; segment < segments.length; segment += 1) {
  for (const char of [...segments[segment]]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (current.length === 0) {
        startSegment = segment;
        startOffset = pages[segment].offset;
      }
      endSegment = segment;
      current.push(value);
      pages[segment].offset += 1;
    } else if (char !== "/" && !/\s/u.test(char)) {
      flushWord();
    }
  }
}
flushWord();

const receivers = [];
for (const page of pages) {
  for (let index = 0; index + 1 < page.words.length; index += 1) {
    const first = page.words[index];
    const second = page.words[index + 1];
    if (first.values.length !== 8 || second.values.length !== 5) continue;

    const cipher = first.values.concat(second.values);
    const key = cipher.map((value, keyIndex) => mod29(value - plaintext[keyIndex]));
    const inverse = hInverse(key);
    const columns = {
      left: inverse.slice(0, 4),
      center: inverse.slice(4, 9),
      right: inverse.slice(9, 13),
    };

    receivers.push({
      page: page.page,
      ordinal: first.ordinal,
      start: first.start,
      cipher,
      key,
      inverse,
      columns,
      centerPalindrome: isPalindrome(columns.center),
      exactStateCenter: columns.center.join(",") === [4, 8, 19, 8, 4].join(","),
    });
  }
}

assert.equal(receivers.length, 19);
assert.deepEqual(
  receivers.filter((row) => row.centerPalindrome).map((row) => [row.page, row.ordinal]),
  [[0, 1]]
);
assert.deepEqual(
  receivers.filter((row) => row.exactStateCenter).map((row) => [row.page, row.ordinal]),
  [[0, 1]]
);

const p0 = receivers.find((row) => row.page === 0 && row.ordinal === 1);
assert.ok(p0);
assert.deepEqual(p0.key, [26,24,8,19,27,24,18,3,0,8,0,16,19]);
assert.deepEqual(
  p0.inverse,
  [25,28,11,25,4,8,19,8,4,7,13,20,28]
);
assert.deepEqual(p0.columns.center, [4,8,19,8,4]);

/** @param {number[]} values @returns {number[]} */
function forwardRises(values) {
  return values.slice(0, -1).map((value, index) => mod29(values[index + 1] - value));
}

assert.deepEqual(p0.columns.right, [7,13,20,28]);
assert.deepEqual(forwardRises(p0.columns.right), [6,7,8]);
assert.deepEqual(forwardRises(p0.columns.center), [4,11,18,25]);

/** @param {number[]} values @returns {boolean} */
function isArithmeticProgression(values) {
  if (values.length < 3) return true;
  const step = mod29(values[1] - values[0]);
  return values.slice(1).every((value, index) => mod29(value - values[index]) === step);
}

const centerRiseProgressions = receivers.filter((row) =>
  isArithmeticProgression(forwardRises(row.columns.center))
);
assert.deepEqual(
  centerRiseProgressions.map((row) => [row.page, row.ordinal]),
  [[0, 1]]
);

const consecutiveRightRamps = receivers.filter((row) => {
  const rises = forwardRises(row.columns.right);
  return rises[1] === mod29(rises[0] + 1) && rises[2] === mod29(rises[1] + 1);
});
assert.deepEqual(
  consecutiveRightRamps.map((row) => [row.page, row.ordinal]),
  [[0, 1]]
);

/** @param {number} seed @param {number[]} rises @returns {number[]} */
function cumulativeRise(seed, rises) {
  const output = [mod29(seed)];
  let currentValue = mod29(seed);
  for (const rise of rises) {
    currentValue = mod29(currentValue + rise);
    output.push(currentValue);
  }
  return output;
}

/**
 * @param {number} q
 * @param {number} theIndex
 * @param {number} wayIndex
 * @returns {{left:number[],center:number[],right:number[],inverse:number[],key:number[]}}
 */
function markerRiseGenerator(q, theIndex, wayIndex) {
  const left = cumulativeRise(-q, [q - 1, wayIndex - 1, wayIndex + 1]);
  const center = cumulativeRise(q, [
    q,
    q + theIndex,
    q + 2 * theIndex,
    q + 3 * theIndex,
  ]);
  const right = cumulativeRise(theIndex, [theIndex - 1, theIndex, theIndex + 1]);
  const inverse = [...left, ...center, ...right];
  return { left, center, right, inverse, key: hOutsideIn(inverse) };
}

const theIndices = sourceWords
  .map((word, index) => word === "THE" ? index : null)
  .filter((index) => index !== null);
const wayIndices = sourceWords
  .map((word, index) => word === "WAY" ? index : null)
  .filter((index) => index !== null);

assert.deepEqual(theIndices, [1,7,12,17,22,28]);
assert.deepEqual(wayIndices, [13]);

const generated = markerRiseGenerator(4, 7, 13);
assert.deepEqual(generated.inverse, p0.inverse);
assert.deepEqual(generated.key, p0.key);
assert.deepEqual(
  p0.cipher.map((value, index) => mod29(value - generated.key[index])),
  plaintext
);

const generatorAnchorControl = theIndices.map((theIndex) => {
  const candidate = markerRiseGenerator(4, theIndex, 13);
  const hits = receivers
    .filter((row) => row.inverse.join(",") === candidate.inverse.join(","))
    .map((row) => [row.page, row.ordinal]);
  return { theIndex, hits };
});

assert.deepEqual(generatorAnchorControl, [
  { theIndex: 1, hits: [] },
  { theIndex: 7, hits: [[0,1]] },
  { theIndex: 12, hits: [] },
  { theIndex: 17, hits: [] },
  { theIndex: 22, hits: [] },
  { theIndex: 28, hits: [] },
]);

const transforms = {
  raw: (values) => values,
  H: hOutsideIn,
  Hinv: hInverse,
  reverse: (values) => values.slice().reverse(),
  Hrev: (values) => hOutsideIn(values.slice().reverse()),
  HinvRev: (values) => hInverse(values.slice().reverse()),
};

const transformHits = {};
for (const [name, transform] of Object.entries(transforms)) {
  transformHits[name] = [];
  for (const row of receivers) {
    const view = transform(row.key);
    const center = view.slice(4, 9);
    if (isPalindrome(center)) transformHits[name].push([row.page, row.ordinal]);
  }
}

assert.deepEqual(transformHits, {
  raw: [],
  H: [],
  Hinv: [[0, 1]],
  reverse: [],
  Hrev: [],
  HinvRev: [],
});

console.log(JSON.stringify({
  status: "PASS",
  authenticatedTarget: source8plus5[0].words,
  receiverFamily: {
    adjacent8plus5: receivers.length,
    centerPalindromeHits: receivers
      .filter((row) => row.centerPalindrome)
      .map((row) => [row.page, row.ordinal]),
    exactQABaqHits: receivers
      .filter((row) => row.exactStateCenter)
      .map((row) => [row.page, row.ordinal]),
  },
  p0: {
    residualKey: p0.key,
    inverseH: p0.inverse,
    markerColumns4_5_4: p0.columns,
    centerStateLabels: ["q", "A", "B", "A", "q"],
    rightColumn: p0.columns.right,
    centerColumnRises: forwardRises(p0.columns.center),
    centerRiseStep: 7,
    rightColumnRises: forwardRises(p0.columns.right),
    rightRiseSourceWords: ["SEEKS6", "THE7", "DEVOTED8"],
  },
  candidateRiseGenerator: {
    anchors: { q: 4, THE: 7, WAY: 13 },
    inversePacket: generated.inverse,
    columns: {
      left: generated.left,
      center: generated.center,
      right: generated.right,
    },
    generatedKey: generated.key,
    sourceTHEAnchorControl: generatorAnchorControl,
  },
  progressionControl: {
    centerRiseArithmeticProgressionHits: centerRiseProgressions.map((row) => [row.page, row.ordinal]),
    rightConsecutiveRampHits: consecutiveRightRamps.map((row) => [row.page, row.ordinal]),
  },
  orientationControl: transformHits,
  decision:
    "After independent source selection of EPIPHANY SEEKS, the residual H-inverse aligns with the visible 4|5|4 marker. A compact cumulative-rise generator using q=4, recovered THE7, and unique WAY13 reproduces all 13 inverse coordinates and therefore the exact additive key. Holding q and WAY fixed while charging all six authenticated THE indices leaves only THE7, and it hits p0 alone among 19 matched 8+5 receivers. The generator was recognized after the residual structure was visible, so it is a candidate key-order provenance rule pending an independent prospective consumer.",
}, null, 2));
