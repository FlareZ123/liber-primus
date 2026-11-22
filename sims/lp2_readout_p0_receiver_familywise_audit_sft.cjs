"use strict";

/**
 * Director #1706: familywise audit of READOUT versus READ / OUT as p0 receivers.
 *
 * Frozen before DH/state scoring:
 * - whole-word GP0 -> zero-based p50 cell;
 * - p28 source geometry: 23 runes with exact center F;
 * - conventional base60, drop-f base59 and literal-token output types already
 *   present in the research record;
 * - zero/one-based receiver offsets;
 * - split endpoint order and all four endpoint inclusion conventions;
 * - every rune-bearing physical p0..p55 page.
 *
 * Literal tokens instantiate numeric rune offsets only when the printed token
 * itself is decimal. No extra token codec is invented.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const transcription = fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);
const tableTokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");

assert.equal(tableTokens.length, 256);
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);

/**
 * @param {string} token
 * @param {string} alphabet
 * @returns {number}
 */
function decodeToken(token, alphabet) {
  return alphabet.indexOf(token[0]) * alphabet.length +
    alphabet.indexOf(token[1]);
}

/**
 * @param {string} token
 * @returns {number|null}
 */
function literalNumber(token) {
  return /^\d+$/.test(token) ? Number(token) : null;
}

/**
 * @param {number} physicalPage
 * @returns {{runes:number[],words:Array<{n:number,start:number,end:number,len:number,values:number[],sum:number}>}}
 */
function parsePage(physicalPage) {
  if (physicalPage === 50) return {runes: [], words: []};
  const text = parts[physicalPage < 50 ? physicalPage : physicalPage - 1];
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      n: words.length + 1,
      start,
      end: start + current.length - 1,
      len: current.length,
      values: current.slice(),
      sum: current.reduce((total, value) => total + value, 0),
    });
    current = [];
  }

  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return {runes, words};
}

const physicalPages = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  physicalPages.push({page, ...parsePage(page)});
}
assert.equal(physicalPages.length, 55);

// Independently fixed p28 source geometry. DH labels are not used here.
const p28Lines = parts[28].trim().split("/")
  .filter((line) => line.trim().length > 0);
const p28Line6 = [...p28Lines[5]]
  .filter((char) => runeIndex.has(char))
  .map((char) => runeIndex.get(char));
assert.equal(p28Line6.length, 23);
assert.equal(p28Line6[11], 0);

// Matched source family: every original whole-word-bounded 23-rune interval
// whose exact center is F.
const geometry = [];
for (const page of physicalPages) {
  const starts = new Set(page.words.map((word) => word.start));
  const ends = new Set(page.words.map((word) => word.end));
  for (let start = 0; start + 22 < page.runes.length; start += 1) {
    const end = start + 22;
    if (
      starts.has(start) &&
      ends.has(end) &&
      page.runes[start + 11] === 0
    ) {
      geometry.push({
        id: geometry.length,
        page: page.page,
        start,
        end,
        center: start + 11,
      });
    }
  }
}
assert.equal(geometry.length, 23);
assert.deepEqual(
  geometry.filter((row) => row.page === 0)
    .map((row) => [row.start, row.end, row.center]),
  [[80, 102, 91], [166, 188, 177]],
);

// GP0 values are frozen by the READ OUT candidate itself.
const READOUT = 75;
const READ = 55;
const OUT = 20;
assert.equal(tableTokens[READOUT], "2v");
assert.equal(tableTokens[READ], "1K");
assert.equal(tableTokens[OUT], "1g");

const semantics = [];
for (const mode of ["base60", "base59", "literal"]) {
  for (const receiverOrigin of [0, 1]) {
    semantics.push({mode, receiverOrigin});
  }
}

/**
 * @param {string} token
 * @param {"base60"|"base59"|"literal"} mode
 * @returns {number|null}
 */
function numericOutput(token, mode) {
  if (mode === "base60") return decodeToken(token, alphabet60);
  if (mode === "base59") return decodeToken(token, alphabet59);
  return literalNumber(token);
}

assert.deepEqual(
  ["base60", "base59", "literal"].map((mode) => [
    mode,
    numericOutput(tableTokens[READ], mode),
    numericOutput(tableTokens[OUT], mode),
    numericOutput(tableTokens[READOUT], mode),
  ]),
  [
    ["base60", 80, 102, 177],
    ["base59", 79, 100, 174],
    ["literal", null, null, null],
  ],
);

// Bit masks are safe because there are only 23 matched geometry windows.
const endpointMask = new Map();
for (const row of geometry) {
  const key = `${row.start}:${row.end}`;
  endpointMask.set(key, (endpointMask.get(key) || 0) | (1 << row.id));
}

/**
 * Whole READOUT supplies one point. Score whether that point is the center of
 * a matched source interval. This does not invent a second endpoint.
 * @param {string} token
 * @param {{mode:string,receiverOrigin:number}} semantic
 * @returns {number}
 */
function wholeWindowMask(token, semantic) {
  const value = numericOutput(token, semantic.mode);
  if (!Number.isInteger(value)) return 0;
  const center = value - semantic.receiverOrigin;
  let mask = 0;
  for (const row of geometry) {
    if (row.center === center) mask |= 1 << row.id;
  }
  return mask;
}

/**
 * Split READ / OUT supplies two numeric endpoints. Charge source order,
 * reverse order and all endpoint inclusion conventions.
 * @param {string} readToken
 * @param {string} outToken
 * @param {{mode:string,receiverOrigin:number}} semantic
 * @returns {number}
 */
function splitWindowMask(readToken, outToken, semantic) {
  const readValue = numericOutput(readToken, semantic.mode);
  const outValue = numericOutput(outToken, semantic.mode);
  if (!Number.isInteger(readValue) || !Number.isInteger(outValue)) return 0;

  const offsets = [
    readValue - semantic.receiverOrigin,
    outValue - semantic.receiverOrigin,
  ];
  let mask = 0;

  for (const ordered of [offsets, [offsets[1], offsets[0]]]) {
    const direction = Math.sign(ordered[1] - ordered[0]);
    if (!direction) continue;
    for (const includeSource of [true, false]) {
      for (const includeTarget of [true, false]) {
        const first = ordered[0] + (includeSource ? 0 : direction);
        const last = ordered[1] - (includeTarget ? 0 : direction);
        if ((last - first) * direction < 0) continue;
        const start = Math.min(first, last);
        const end = Math.max(first, last);
        mask |= endpointMask.get(`${start}:${end}`) || 0;
      }
    }
  }
  return mask;
}

/**
 * @param {number} wholeMask
 * @param {boolean} requireDistinct
 * @returns {number}
 */
function compatibleSamePageMask(wholeMask, requireDistinct) {
  let out = 0;
  for (const whole of geometry) {
    if (!(wholeMask & (1 << whole.id))) continue;
    for (const split of geometry) {
      if (split.page !== whole.page) continue;
      if (requireDistinct && split.id === whole.id) continue;
      out |= 1 << split.id;
    }
  }
  return out;
}

// Actual source tokens: the unique joint semantic is conventional base60 with
// zero-based receiver offsets.
const actualRows = [];
for (let s = 0; s < semantics.length; s += 1) {
  const semantic = semantics[s];
  const wholeMask = wholeWindowMask(tableTokens[READOUT], semantic);
  const splitMask = splitWindowMask(
    tableTokens[READ], tableTokens[OUT], semantic);
  if (!wholeMask && !splitMask) continue;
  const jointDistinct =
    compatibleSamePageMask(wholeMask, true) & splitMask;
  actualRows.push({
    semantic,
    whole: geometry.filter((row) => wholeMask & (1 << row.id)),
    split: geometry.filter((row) => splitMask & (1 << row.id)),
    jointDistinct: Boolean(jointDistinct),
  });
}

assert.deepEqual(actualRows, [{
  semantic: {mode: "base60", receiverOrigin: 0},
  whole: [{id: 1, page: 0, start: 166, end: 188, center: 177}],
  split: [{id: 0, page: 0, start: 80, end: 102, center: 91}],
  jointDistinct: true,
}]);

// Precompute all exact-token-multiset placements. The three source addresses
// 75,55,20 are distinct, so the exact permutation sample space is 256P3.
const wholeMasks = Array.from({length: 256}, () => Array(6).fill(0));
for (let tokenIndex = 0; tokenIndex < 256; tokenIndex += 1) {
  for (let s = 0; s < semantics.length; s += 1) {
    wholeMasks[tokenIndex][s] =
      wholeWindowMask(tableTokens[tokenIndex], semantics[s]);
  }
}

const splitMasks = new Uint32Array(256 * 256 * 6);
const splitAny = new Uint32Array(256 * 256);
function splitIndex(readIndex, outIndex, semanticIndex) {
  return (readIndex * 256 + outIndex) * 6 + semanticIndex;
}

let splitOrderedPairHits = 0;
for (let readIndex = 0; readIndex < 256; readIndex += 1) {
  for (let outIndex = 0; outIndex < 256; outIndex += 1) {
    if (readIndex === outIndex) continue;
    let any = 0;
    for (let s = 0; s < semantics.length; s += 1) {
      const mask = splitWindowMask(
        tableTokens[readIndex], tableTokens[outIndex], semantics[s]);
      splitMasks[splitIndex(readIndex, outIndex, s)] = mask;
      any |= mask;
    }
    splitAny[readIndex * 256 + outIndex] = any;
    if (any) splitOrderedPairHits += 1;
  }
}
assert.equal(splitOrderedPairHits, 594);

const wholeAny = wholeMasks.map((row) =>
  row.reduce((combined, mask) => combined | mask, 0));

const allowedDistinct = wholeMasks.map((row) =>
  row.map((mask) => compatibleSamePageMask(mask, true)));
const allowedLoose = wholeMasks.map((row) =>
  row.map((mask) => compatibleSamePageMask(mask, false)));
const allowedDistinctAny = wholeAny.map((mask) =>
  compatibleSamePageMask(mask, true));
const allowedLooseAny = wholeAny.map((mask) =>
  compatibleSamePageMask(mask, false));

let sharedDistinct = 0;
let permissiveDistinct = 0;
let sharedLoose = 0;
let permissiveLoose = 0;

const assignments = 256 * 255 * 254;
for (let wholeIndex = 0; wholeIndex < 256; wholeIndex += 1) {
  for (let readIndex = 0; readIndex < 256; readIndex += 1) {
    if (readIndex === wholeIndex) continue;
    for (let outIndex = 0; outIndex < 256; outIndex += 1) {
      if (outIndex === wholeIndex || outIndex === readIndex) continue;

      let sharedDistinctHit = false;
      let sharedLooseHit = false;
      for (let s = 0; s < semantics.length; s += 1) {
        const splitMask =
          splitMasks[splitIndex(readIndex, outIndex, s)];
        if ((allowedDistinct[wholeIndex][s] & splitMask) !== 0) {
          sharedDistinctHit = true;
        }
        if ((allowedLoose[wholeIndex][s] & splitMask) !== 0) {
          sharedLooseHit = true;
        }
      }

      sharedDistinct += Number(sharedDistinctHit);
      sharedLoose += Number(sharedLooseHit);
      permissiveDistinct += Number(
        (allowedDistinctAny[wholeIndex] &
          splitAny[readIndex * 256 + outIndex]) !== 0);
      permissiveLoose += Number(
        (allowedLooseAny[wholeIndex] &
          splitAny[readIndex * 256 + outIndex]) !== 0);
    }
  }
}

assert.equal(assignments, 16581120);
assert.equal(sharedDistinct, 452);
assert.equal(permissiveDistinct, 1242);
assert.equal(sharedLoose, 1030);
assert.equal(permissiveLoose, 3122);

// Open the state packet only after the receiver family is frozen.
const p0 = physicalPages.find((page) => page.page === 0);
assert.ok(p0);

/**
 * @param {number[]} values
 * @returns {number[]}
 */
function hShell(values) {
  const out = [];
  for (
    let left = 0, right = values.length - 1;
    left < right;
    left += 1, right -= 1
  ) {
    out.push(
      ((values[left] - values[right]) % 29 + 29) % 29,
      (values[left] + values[right]) % 29,
    );
  }
  if (values.length % 2) out.push(values[(values.length - 1) / 2]);
  return out;
}

/**
 * @param {number} base
 * @param {number} exponent
 * @returns {number}
 */
function pow29(base, exponent) {
  let result = 1;
  let value = base % 29;
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = (result * value) % 29;
    value = (value * value) % 29;
    e >>= 1;
  }
  return result;
}

/**
 * @param {number[]} values
 * @returns {string}
 */
function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/**
 * @param {number} start
 * @param {number} end
 * @returns {{values:number[],words:Array<object>,hStream:number[],hCube:string}}
 */
function inspectReceiver(start, end) {
  const values = p0.runes.slice(start, end + 1);
  const words = p0.words.filter((word) =>
    word.start >= start && word.end <= end);
  const hStream = words.flatMap((word) => hShell(word.values));
  const wholeHCube = hShell(values).map((value) => pow29(value, 3));
  return {
    values,
    words,
    hStream,
    hCube: spell(wholeHCube),
  };
}

const splitReceiver = inspectReceiver(80, 102);
const wholeReceiver = inspectReceiver(166, 188);

assert.deepEqual(
  splitReceiver.words.map((word) => word.len),
  [3, 7, 5, 8]);
assert.deepEqual(
  splitReceiver.words.map((word) => word.sum % 29),
  [19, 20, 5, 23]);
assert.deepEqual(
  wholeReceiver.words.map((word) => word.len),
  [7, 3, 1, 6, 6]);
assert.deepEqual(
  wholeReceiver.words.map((word) => word.sum % 29),
  [14, 21, 28, 14, 22]);

const dhState = [23, 5, 6, 8, 15, 19, 2];
assert(dhState.every((value) => splitReceiver.hStream.includes(value)));
const wholeMissingDh = dhState.filter((value) =>
  !wholeReceiver.hStream.includes(value));
assert.deepEqual(wholeMissingDh, [23, 5, 6]);
assert(wholeReceiver.hCube.startsWith("UCF"));

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "familywise-positive READOUT/READ-OUT receiver selection; value semantics remain inferential and no plaintext is claimed",
  frozenSourceGeometry: {
    p28Line6Length: p28Line6.length,
    p28Line6Center: corpus.translit[p28Line6[11]],
    manuscriptMatchedWindows: geometry.length,
    p0MatchedWindows: geometry.filter((row) => row.page === 0),
  },
  actual: {
    whole: {
      gp0: READOUT,
      token: tableTokens[READOUT],
      base60: numericOutput(tableTokens[READOUT], "base60"),
      receiverCenter: 177,
      interval: [166, 188],
    },
    split: {
      gp0: [READ, OUT],
      tokens: [tableTokens[READ], tableTokens[OUT]],
      base60: [
        numericOutput(tableTokens[READ], "base60"),
        numericOutput(tableTokens[OUT], "base60"),
      ],
      interval: [80, 102],
    },
    uniqueJointSemantic: {
      mode: "base60",
      receiverOrigin: "zero",
      endpointConvention: "closed",
      receiverPage: 0,
    },
  },
  chargedFamily: {
    outputModes: ["base60", "base59", "literal-decimal-only"],
    receiverOrigins: ["zero", "one"],
    splitEndpointOrders: ["READ->OUT", "OUT->READ"],
    splitEndpointInclusionConventions: 4,
    receiverPages: 55,
    literalActualInstantiatesNumericOffsets: false,
  },
  exactTokenMultisetNull: {
    assignments,
    splitMarginal: {
      orderedTokenAssignments: 256 * 255,
      familyHits: splitOrderedPairHits,
      rate: splitOrderedPairHits / (256 * 255),
    },
    jointDistinctSamePage: {
      sharedModeAndOrigin: sharedDistinct,
      sharedRate: sharedDistinct / assignments,
      permissiveIndependentModeAndOrigin: permissiveDistinct,
      permissiveRate: permissiveDistinct / assignments,
    },
    jointSamePageAllowSameWindow: {
      sharedModeAndOrigin: sharedLoose,
      sharedRate: sharedLoose / assignments,
      permissiveIndependentModeAndOrigin: permissiveLoose,
      permissiveRate: permissiveLoose / assignments,
    },
  },
  postFreezeStateCheck: {
    splitWordLengths: splitReceiver.words.map((word) => word.len),
    splitWordGp0Residues: splitReceiver.words.map((word) => word.sum % 29),
    splitWordwiseHCoversAllDhState: true,
    wholeWordLengths: wholeReceiver.words.map((word) => word.len),
    wholeWordGp0Residues: wholeReceiver.words.map((word) => word.sum % 29),
    wholeWordwiseHMissingDhState: wholeMissingDh,
    wholeFrozenHThenCube: wholeReceiver.hCube,
  },
}, null, 2) + "\n");
