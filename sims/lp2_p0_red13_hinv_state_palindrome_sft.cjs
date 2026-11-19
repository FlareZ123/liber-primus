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

const circumferenceControls = receivers.filter((row) => {
  const leftRises = forwardRises(row.columns.left);
  const centerRises = forwardRises(row.columns.center);
  return (
    row.columns.left[0] === row.columns.left[row.columns.left.length - 1] &&
    row.columns.center[0] === row.columns.center[row.columns.center.length - 1] &&
    leftRises.reduce((sum, value) => sum + value, 0) === 29 &&
    centerRises.reduce((sum, value) => sum + value, 0) === 58
  );
});
assert.deepEqual(
  circumferenceControls.map((row) => [row.page, row.ordinal]),
  [[0, 1]]
);
assert.equal(forwardRises(p0.columns.right).reduce((sum, value) => sum + value, 0), 21);
assert.deepEqual(forwardRises(p0.columns.right.slice().reverse()), [21,22,23]);

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

/**
 * @param {number} base
 * @param {number} exponent
 * @param {number} modulus
 * @returns {number}
 */
function powMod(base, exponent, modulus) {
  let result = 1 % modulus;
  let factor = ((base % modulus) + modulus) % modulus;
  for (let power = exponent; power > 0; power = Math.floor(power / 2)) {
    if (power % 2 === 1) result = (result * factor) % modulus;
    factor = (factor * factor) % modulus;
  }
  return result;
}

/**
 * @param {number} q
 * @param {number} theIndex
 * @param {number} wayIndex
 * @returns {{p:number,g:number,a:number,b:number,A:number,B:number,K:number,e:number,q:number}}
 */
function stateFromAnchors(q, theIndex, wayIndex) {
  return {
    p: q + theIndex + wayIndex - 1,
    g: q + 1,
    a: theIndex - 1,
    b: 2 * q + theIndex,
    A: 2 * q,
    B: theIndex + wayIndex - 1,
    K: wayIndex - q - theIndex,
    e: q - 1,
    q,
  };
}

/** @param {{p:number,g:number,a:number,b:number,A:number,B:number,K:number}} state @returns {boolean} */
function validDhState(state) {
  if (state.p <= 2 || state.K < 0 || state.K >= state.p) return false;
  return (
    powMod(state.g, state.a, state.p) === state.A &&
    powMod(state.g, state.b, state.p) === state.B &&
    powMod(state.B, state.a, state.p) === state.K &&
    powMod(state.A, state.b, state.p) === state.K
  );
}

const anchorState = stateFromAnchors(4, 7, 13);
assert.deepEqual(anchorState, {p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3,q:4});
assert.equal(validDhState(anchorState), true);
assert.deepEqual(
  [
    [anchorState.K, sourceWords[anchorState.K]],
    [anchorState.e, sourceWords[anchorState.e]],
    [anchorState.q, sourceWords[anchorState.q]],
    [anchorState.g, sourceWords[anchorState.g]],
    [anchorState.a, sourceWords[anchorState.a]],
    [anchorState.g + anchorState.K, sourceWords[anchorState.g + anchorState.K]],
    [anchorState.A, sourceWords[anchorState.A]],
  ],
  [
    [2,"PATH"],
    [3,"LIES"],
    [4,"EMPTY"],
    [5,"EPIPHANY"],
    [6,"SEEKS"],
    [7,"THE"],
    [8,"DEVOTED"],
  ]
);
assert.deepEqual(sourceWords.slice(2,9), [
  "PATH","LIES","EMPTY","EPIPHANY","SEEKS","THE","DEVOTED",
]);
assert.equal(sourceWords[anchorState.b], "WORDS");
assert.equal(sourceWords[anchorState.B - 1], "MAP");
assert.equal(sourceWords[anchorState.B], "THEIR");
assert.equal(sourceWords[anchorState.p], "ROAD");
assert.equal(sourceWords[anchorState.p + anchorState.K], "THEIR");
assert.equal(sourceWords[anchorState.p + anchorState.a], "DIRECTION");

const dhAnchorControl = theIndices.map((theIndex) => {
  const state = stateFromAnchors(4, theIndex, 13);
  return { theIndex, state, valid: validDhState(state) };
});
assert.deepEqual(
  dhAnchorControl.filter((row) => row.valid).map((row) => row.theIndex),
  [7]
);

const directPacketFromAnchors = [
  mod29(-4),
  mod29(-1),
  mod29(4 + 7),
  mod29(-4),
  4,
  mod29(2 * 4),
  mod29(7 + 13 - 1),
  mod29(2 * 4),
  4,
  7,
  13,
  mod29(7 + 13),
  mod29(-1),
];

const generated = markerRiseGenerator(4, 7, 13);
assert.deepEqual(directPacketFromAnchors, generated.inverse);
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
    generatedDhState: anchorState,
    stateSourceRun2to8: sourceWords.slice(2,9),
    stateSourceLandmarks: {
      b15: sourceWords[anchorState.b],
      Bminus1_18: sourceWords[anchorState.B - 1],
      B19: sourceWords[anchorState.B],
      p23: sourceWords[anchorState.p],
      pPlusK25: sourceWords[anchorState.p + anchorState.K],
      pPlusa29: sourceWords[anchorState.p + anchorState.a],
    },
    validTHEIndicesUnderDhGate: dhAnchorControl.filter((row) => row.valid).map((row) => row.theIndex),
    directPacketFromAnchors,
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
    circumferenceHits: circumferenceControls.map((row) => [row.page, row.ordinal]),
    p0RiseTotals: {
      left: forwardRises(p0.columns.left).reduce((sum, value) => sum + value, 0),
      center: forwardRises(p0.columns.center).reduce((sum, value) => sum + value, 0),
      right: forwardRises(p0.columns.right).reduce((sum, value) => sum + value, 0),
    },
    rightReverseRises: forwardRises(p0.columns.right.slice().reverse()),
  },
  orientationControl: transformHits,
  decision:
    "Visible q=4, source-selected THE7, and unique WAY13 generate the entire reconstructed DH state through simple linear relations; among all six authenticated THE occurrences, only THE7 yields a state satisfying the DH equations. The same three anchors directly generate the 13-value H-inverse marker packet and therefore the exact p0 additive key. The formulas were recognized after the residual structure was visible, so they remain candidate provenance pending a new prospective plaintext or key consequence.",
}, null, 2));
