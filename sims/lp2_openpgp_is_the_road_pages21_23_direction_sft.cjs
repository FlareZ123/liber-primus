"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} n */
function mod29(n) {
  return ((n % 29) + 29) % 29;
}

/** @param {number} x @param {number} y */
function H(x, y) {
  return [mod29(x - y), mod29(x + y)];
}

/** @param {number[]} values */
function H4(values) {
  assert.equal(values.length, 4);
  return [
    mod29(values[0] - values[3]),
    mod29(values[1] - values[2]),
    mod29(values[1] + values[2]),
    mod29(values[0] + values[3]),
  ];
}

/** @param {number[]} shell */
function H4inv(shell) {
  assert.equal(shell.length, 4);
  const inv2 = 15;
  return [
    mod29((shell[0] + shell[3]) * inv2),
    mod29((shell[1] + shell[2]) * inv2),
    mod29((shell[2] - shell[1]) * inv2),
    mod29((shell[3] - shell[0]) * inv2),
  ];
}

/** @param {number} base @param {number} exponent @param {number} modulus */
function powMod(base, exponent, modulus) {
  let b = BigInt(base);
  let e = BigInt(exponent);
  const m = BigInt(modulus);
  let out = 1n;
  while (e > 0n) {
    if (e & 1n) out = (out * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return Number(out);
}

/** @param {number} a @param {number} modulus */
function inverseMod(a, modulus) {
  for (let x = 1; x < modulus; x += 1) {
    if ((a * x) % modulus === 1) return x;
  }
  throw new Error("no inverse");
}

/** @param {string} token @param {string} alphabet */
function tryDecodeToken(token, alphabet) {
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  return hi < 0 || lo < 0 ? null : hi * alphabet.length + lo;
}

/** @param {string} token @param {string} alphabet */
function decodeToken(token, alphabet) {
  const value = tryDecodeToken(token, alphabet);
  assert.notEqual(value, null, "token is invalid in requested alphabet: " + token);
  return value;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const clear = signed2016.split("-----BEGIN PGP SIGNATURE-----")[0];
const source = clear
  .slice(clear.indexOf("Hello."))
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());
assert.equal(source.length, 43);

const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} word */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    if (normalized.startsWith("ING", i)) {
      out.push(21);
      i += 3;
      continue;
    }
    if (normalized.startsWith("IO", i)) {
      out.push(27);
      i += 2;
      continue;
    }
    const row = gpTokens.find((candidate) => normalized.startsWith(candidate.symbol, i));
    assert.ok(row, "unmapped GP spelling at " + normalized.slice(i));
    out.push(row.value);
    i += row.symbol.length;
  }
  return out;
}

/** @param {string} word */
function gp0(word) {
  return gp(word).reduce((sum, value) => sum + value, 0);
}

const tape = grid.pages.flatMap((page) => page.tokens);
const base60 = grid.alphabet;
const base59 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx";

// Reconstruct the state from the authenticated full-integer OPENPGP route.
const N = 0x7A35090Fn;
const b = Number(N % 16n);
const B = Number(N % 60n);
const p = Number(N % 29n);
const q = B - b;
assert.deepEqual([b, B, p, q], [15, 19, 23, 4]);
assert.deepEqual([source[b], source[B], source[p]], ["WORDS", "THEIR", "ROAD"]);

const possibleG = [];
for (let candidate = 1; candidate < p; candidate += 1) {
  if (powMod(candidate, b, p) === B) possibleG.push(candidate);
}
assert.deepEqual(possibleG, [5]);
const g = possibleG[0];
const e = inverseMod(b, p - 1);
assert.equal(e, 3);

const triadPacket = ["PRIMUS", "NUMBERS", "OPENPGP"].map((word) => {
  const token = tape[gp0(word)];
  return decodeToken(token, base60) % 29;
});
assert.deepEqual(triadPacket, [8, 19, 3]);
const [A] = triadPacket;
const possibleA = [];
for (let candidate = 1; candidate < p; candidate += 1) {
  if (powMod(g, candidate, p) === A) possibleA.push(candidate);
}
assert.deepEqual(possibleA, [6]);
const a = possibleA[0];
const K = powMod(A, b, p);
assert.equal(K, 2);

// Reproduce the upstream q-spaced phrase closure that selected pages 21..23.
/** @param {string} word */
function sourceImage(word) {
  return decodeToken(tape[gp0(word)], base60) % 29;
}
const roleImage = ["WORDS", "THEIR", "ROAD"].map(sourceImage);
assert.deepEqual(roleImage, [28, 23, 11]);
const roleImageWords = roleImage.map((index) => source[index]);
assert.deepEqual(roleImageWords, ["THE", "ROAD", "IS"]);
const roadPhrase = roleImageWords.slice(K).concat(roleImageWords.slice(0, K));
assert.deepEqual(roadPhrase, ["IS", "THE", "ROAD"]);
assert.deepEqual(source.slice(21, 24), roadPhrase);
assert.deepEqual([21, 22, 23], [p - K, p - 1, p]);

// Canonical unknown-word parser used by the established double-index SFT.
// Slash/whitespace can continue a word; punctuation/delimiters terminate one.
// A word crossing a physical page boundary is excluded.
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);
const unknownSegments = parts.slice(0, 55);
const canonicalPages = unknownSegments.map((text, segment) => ({
  page: segment >= 50 ? segment + 1 : segment,
  words: [],
  offset: 0,
}));
let currentWord = [];
let startSegment = 0;
let endSegment = 0;
let startOffset = 0;

function flushCanonicalWord() {
  if (!currentWord.length) return;
  if (startSegment === endSegment) {
    const page = canonicalPages[startSegment];
    page.words.push({
      index: page.words.length,
      start: startOffset,
      end: startOffset + currentWord.length - 1,
      values: currentWord.slice(),
    });
  }
  currentWord = [];
}

for (let segment = 0; segment < unknownSegments.length; segment += 1) {
  for (const char of [...unknownSegments[segment]]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!currentWord.length) {
        startSegment = segment;
        startOffset = canonicalPages[segment].offset;
      }
      endSegment = segment;
      currentWord.push(value);
      canonicalPages[segment].offset += 1;
    } else if (char === "/" || /\s/u.test(char)) {
      // source line/page wrap
    } else {
      flushCanonicalWord();
    }
  }
}
flushCanonicalWord();

const wordsByPage = new Map(canonicalPages.map((page) => [page.page, page.words]));
const pageOffsets = new Map(canonicalPages.map((page) => [page.page, page.offset]));

/** @param {number} page */
function pageWords(page) {
  return wordsByPage.get(page) || [];
}

/** @param {{start:number,end:number}[]} words @param {number} offset */
function containingWord(words, offset) {
  return words.find((word) => word.start <= offset && offset <= word.end) || null;
}

// Prospectively selected p22 holdout. THE fixes the p50 address before p22 is read.
assert.equal(source[22], "THE");
assert.equal(gp0("THE"), 20);
assert.equal(tape[20], "1g");
const pointer59 = decodeToken("1g", base59);
const pointer60 = decodeToken("1g", base60);
assert.deepEqual([pointer59, pointer60], [100, 102]);

const chargedPositions = [pointer59 - 1, pointer59, pointer60 - 1, pointer60]
  .sort((x, y) => x - y);
assert.deepEqual(chargedPositions, [99, 100, 101, 102]);

const p22Words = pageWords(22);
const p22Hits = chargedPositions.map((offset) => containingWord(p22Words, offset));
assert.ok(p22Hits.every(Boolean));
assert.ok(p22Hits.every((word) => word.index === p22Hits[0].index));
const p22Receiver = p22Hits[0];

assert.deepEqual(
  {
    index: p22Receiver.index,
    start: p22Receiver.start,
    end: p22Receiver.end,
    values: p22Receiver.values,
  },
  {
    index: 19,
    start: 99,
    end: 102,
    values: [22, 28, 28, 24],
  }
);
assert.deepEqual(
  chargedPositions,
  Array.from({ length: p22Receiver.values.length }, (_, i) => p22Receiver.start + i)
);

const p22RawSum = p22Receiver.values.reduce((sum, value) => sum + value, 0);
assert.equal(p22RawSum, pointer60);
assert.equal(p22RawSum % 29, b);
assert.equal(p22Receiver.index, B);
assert.equal(source[p22Receiver.index], "THEIR");

// Familywise charge over every authenticated source-index page.
const collapses = [];
for (let page = 0; page < source.length; page += 1) {
  const token = tape[gp0(source[page])];
  const v59 = tryDecodeToken(token, base59);
  const v60 = tryDecodeToken(token, base60);
  if (v59 === null || v60 === null) continue;
  const positions = [v59 - 1, v59, v60 - 1, v60].sort((x, y) => x - y);
  const words = pageWords(page);
  const pageLength = pageOffsets.get(page) || 0;
  if (positions.some((offset) => offset < 0 || offset >= pageLength)) continue;
  const hits = positions.map((offset) => containingWord(words, offset));
  if (hits.some((word) => !word)) continue;
  if (!hits.every((word) => word.index === hits[0].index)) continue;
  const receiver = hits[0];
  const sum = receiver.values.reduce((total, value) => total + value, 0);
  const completeOffsets = Array.from(
    { length: receiver.values.length },
    (_, i) => receiver.start + i
  );
  collapses.push({
    page,
    sourceWord: source[page],
    token,
    v59,
    v60,
    positions,
    word: receiver.index,
    start: receiver.start,
    end: receiver.end,
    sum,
    exactEnvelope:
      positions.length === completeOffsets.length &&
      positions.every((value, i) => value === completeOffsets[i]),
    selfAddress: sum === v59 || sum === v60,
  });
}
assert.equal(collapses.length, 18);
assert.deepEqual(
  collapses.filter((row) => row.exactEnvelope).map((row) => row.page),
  [22]
);
assert.deepEqual(
  collapses.filter((row) => row.selfAddress).map((row) => row.page),
  [22]
);


// Prospective transfer gate frozen before p25 inspection.
// P22's AND24 -> recovered THEIR25 consequence selects source word25 / p25.
assert.equal(source[25], "THEIR");
assert.equal(gp0("THEIR"), 34);
assert.equal(tape[34], "3H");
const p25V59 = decodeToken("3H", base59);
const p25V60 = decodeToken("3H", base60);
assert.deepEqual([p25V59, p25V60], [194, 197]);
const p25TransferPositions = [p25V59 - 1, p25V59, p25V60 - 1, p25V60]
  .sort((x, y) => x - y);
assert.deepEqual(p25TransferPositions, [193, 194, 196, 197]);
const p25Words = pageWords(25);
const p25TransferHits = p25TransferPositions.map(
  (offset) => containingWord(p25Words, offset)
);
assert.ok(p25TransferHits.every(Boolean));
assert.deepEqual(
  p25TransferHits.map((word) => [word.index, word.start, word.end]),
  [
    [38, 189, 193],
    [39, 194, 195],
    [40, 196, 198],
    [40, 196, 198],
  ]
);
assert.equal(
  p25TransferHits.every((word) => word.index === p25TransferHits[0].index),
  false
);


// Local plaintext gate on the prospectively selected p22 receiver.
// The flanking source words in IS THE ROAD fix the first two shell coordinates.
const outerRoadShell = H(gp0("IS"), gp0("ROAD"));
assert.deepEqual(outerRoadShell, [0, p - K]);
assert.deepEqual(outerRoadShell, [0, 21]);

// Charge every ordered pair, including repeats, from p23's visible state line
// [K,a,e,g,q] for the remaining two coordinates. Compare both signs against
// every distinct authenticated four-rune source target.
const p23VisibleState = { K, a, e, g, q };
const fourRuneTargets = [...new Set(source)]
  .map((word) => ({ word, values: gp(word) }))
  .filter((row) => row.values.length === 4);
assert.deepEqual(
  fourRuneTargets.map((row) => row.word),
  ["LIES", "THEIR", "MEANING", "ROAD", "SEEK", "WILL", "GOOD", "LUCK", "PATHS"]
);

const p22KeyFamilyHits = [];
for (const [leftName, leftValue] of Object.entries(p23VisibleState)) {
  for (const [rightName, rightValue] of Object.entries(p23VisibleState)) {
    const pairShell = H(leftValue, rightValue);
    const shell = [...outerRoadShell, ...pairShell];
    const key = H4inv(shell);
    for (const sign of [-1, 1]) {
      const output = p22Receiver.values.map(
        (value, index) => mod29(value + sign * key[index])
      );
      for (const target of fourRuneTargets) {
        if (output.every((value, index) => value === target.values[index])) {
          p22KeyFamilyHits.push({
            leftName,
            rightName,
            shell,
            key,
            sign,
            target: target.word,
            output,
          });
        }
      }
    }
  }
}
assert.equal(5 * 5 * 2 * fourRuneTargets.length, 450);
assert.deepEqual(p22KeyFamilyHits, [{
  leftName: "g",
  rightName: "a",
  shell: [0, 21, 28, 11],
  key: [20, 10, 18, 20],
  sign: -1,
  target: "THEIR",
  output: gp("THEIR"),
}]);

const p22Key = p22KeyFamilyHits[0].key;
assert.deepEqual(H4(p22Key), [0, p - K, mod29(g - a), mod29(g + a)]);
assert.deepEqual(H4(p22Receiver.values), [27, 0, 27, 17]);

// Manuscript-wide receiver and fixed-key controls.
const canonicalFourRuneWords = canonicalPages.flatMap((page) =>
  page.words
    .filter((word) => word.values.length === 4)
    .map((word) => ({ page: page.page, ...word }))
);
assert.equal(canonicalFourRuneWords.length, 509);

const rawReceiverShell = H4(p22Receiver.values);
const rawShellHits = canonicalFourRuneWords.filter((word) =>
  H4(word.values).every((value, index) => value === rawReceiverShell[index])
);
assert.deepEqual(
  rawShellHits.map((word) => [word.page, word.index, word.start, word.values]),
  [[22, 19, 99, [22, 28, 28, 24]]]
);

const fixedKeyHits = [];
for (const word of canonicalFourRuneWords) {
  for (const target of fourRuneTargets) {
    for (const sign of [-1, 1]) {
      const output = word.values.map(
        (value, index) => mod29(value + sign * p22Key[index])
      );
      if (output.every((value, index) => value === target.values[index])) {
        fixedKeyHits.push({
          page: word.page,
          word: word.index,
          start: word.start,
          sign,
          target: target.word,
        });
      }
    }
  }
}
assert.equal(canonicalFourRuneWords.length * fourRuneTargets.length * 2, 9162);
assert.deepEqual(fixedKeyHits, [{
  page: 22,
  word: 19,
  start: 99,
  sign: -1,
  target: "THEIR",
}]);


// Raw source-index readout and duplicate-THEIR bridge.
// This is a second interpretation of the already selected ciphertext, so it is
// supporting route structure rather than an independent statistical control.
const p22LexicalReadout = p22Receiver.values.map((value) => source[value]);
assert.deepEqual(p22LexicalReadout, ["THE", "THE", "THE", "AND"]);
const lexicalPatternHits = canonicalFourRuneWords.filter((word) =>
  word.values.map((value) => source[value]).join(" ") === "THE THE THE AND"
);
assert.deepEqual(
  lexicalPatternHits.map((word) => [word.page, word.index, word.start, word.values]),
  [[22, 19, 99, [22, 28, 28, 24]]]
);

const finalRawSourceIndex = p22Receiver.values.at(-1);
assert.equal(finalRawSourceIndex, 24);
assert.equal(source[finalRawSourceIndex], "AND");
assert.equal(source[finalRawSourceIndex + 1], "THEIR");
assert.equal(p22KeyFamilyHits[0].target, source[finalRawSourceIndex + 1]);
assert.equal(p22Receiver.index, 19);
assert.equal(finalRawSourceIndex - p22Receiver.index, g);
assert.equal((finalRawSourceIndex + 1) - p22Receiver.index, a);


// "Their numbers are the direction": consume the selected adjacent source
// numbers AND24/THEIR25 as p50 addresses. Charge the documented base59/base60
// numeric alphabets across every authenticated adjacent source pair. A
// uniform pair shift means both outputs preserve adjacency by the same source
// index displacement.
/** @param {string} alphabet */
function sourceNumberUniformShiftHits(alphabet) {
  const hits = [];
  for (let index = 0; index + 1 < source.length; index += 1) {
    const left = tryDecodeToken(tape[index], alphabet);
    const right = tryDecodeToken(tape[index + 1], alphabet);
    if (left === null || right === null) continue;
    const leftOut = left % 29;
    const rightOut = right % 29;
    const leftShift = leftOut - index;
    const rightShift = rightOut - (index + 1);
    if (leftShift === rightShift) {
      hits.push({
        index,
        input: [source[index], source[index + 1]],
        tokens: [tape[index], tape[index + 1]],
        outputs: [leftOut, rightOut],
        words: [source[leftOut], source[rightOut]],
        shift: leftShift,
      });
    }
  }
  return hits;
}

const sourceNumberUniformShiftHits59 = sourceNumberUniformShiftHits(base59);
const sourceNumberUniformShiftHits60 = sourceNumberUniformShiftHits(base60);
assert.deepEqual(sourceNumberUniformShiftHits59, [{
  index: 24,
  input: ["AND", "THEIR"],
  tokens: ["1n", "3I"],
  outputs: [20, 21],
  words: ["MEANING", "IS"],
  shift: -q,
}]);
assert.deepEqual(sourceNumberUniformShiftHits60, []);

const reconstructedClause = [
  source[p22Receiver.index],
  ...sourceNumberUniformShiftHits59[0].words,
  source[22],
  source[23],
  source[finalRawSourceIndex],
  p22KeyFamilyHits[0].target,
];
assert.deepEqual(
  reconstructedClause,
  ["THEIR", "MEANING", "IS", "THE", "ROAD", "AND", "THEIR"]
);
assert.deepEqual(source.slice(19, 26), reconstructedClause);

// P21 was independently established before this route as an IS state object.
const isValues = gp("IS");
const isSum = isValues.reduce((sum, value) => sum + value, 0);
function isStateReceivers(page) {
  return pageWords(page).filter(
    (word) =>
      word.values.length === isValues.length &&
      word.values.reduce((sum, value) => sum + value, 0) === isSum
  );
}
const p11Is = isStateReceivers(11);
const p21Is = isStateReceivers(21);
assert.deepEqual(
  p11Is.map((word) => [word.index, word.start, word.values]),
  [[11, 49, [11, 14]]]
);

const p11TheirNumbers = [
  mod29(p11Is[0].values[0] + p11Is[0].values[1]),
  mod29(p11Is[0].values[0] - p11Is[0].values[1]),
];
assert.deepEqual(p11TheirNumbers, [25, 26]);
assert.deepEqual(
  p11TheirNumbers.map((index) => source[index]),
  ["THEIR", "NUMBERS"]
);
assert.deepEqual(
  source.slice(25, 30),
  ["THEIR", "NUMBERS", "ARE", "THE", "DIRECTION"]
);
assert.equal(reconstructedClause.at(-1), source[25]);
const reconstructedFullClause = [
  ...reconstructedClause,
  ...source.slice(26, 30),
];
assert.deepEqual(
  reconstructedFullClause,
  ["THEIR", "MEANING", "IS", "THE", "ROAD", "AND", "THEIR", "NUMBERS", "ARE", "THE", "DIRECTION"]
);
assert.deepEqual(source.slice(19, 30), reconstructedFullClause);
assert.deepEqual(
  p21Is.map((word) => [word.index, word.start, word.values]),
  [[33, 170, [24, 1]]]
);
const row11 = H(...p11Is[0].values);
const row21 = H(...p21Is[0].values);
const col0 = H(row11[0], row21[0]);
const col1 = H(row11[1], row21[1]);
const p21Packet = [
  [col0[0], col1[0]],
  [col0[1], col1[1]],
];
assert.deepEqual(p21Packet, [[3, 0], [20, 21]]);
assert.equal(p21Packet[0][0], e);
assert.equal(p21Packet[1][1], p - K);

// P23 was independently established before this route as the state-origin page.
const p23Line1 = parts[23].split("/")[0];
const p23LineLengths = [...p23Line1.matchAll(/[\u16A0-\u16FF]+/gu)]
  .map((match) => [...match[0]].length);
assert.deepEqual(p23LineLengths, [2, 6, 3, 5, 4]);
assert.deepEqual(p23LineLengths, [K, a, e, g, q]);
assert.equal(p, 23);
assert.equal(powMod(g, a, p), A);
assert.equal(powMod(g, b, p), B);


// Tighter corridor-geometry key family.
// P21 contributes one of its two H2D columns; p23 contributes the immediately
// flanking a/g pair around center e, with both orientations charged.
const p21Columns = {
  left: [p21Packet[0][0], p21Packet[1][0]],
  right: [p21Packet[0][1], p21Packet[1][1]],
};
assert.deepEqual(p21Columns, {
  left: [e, 20],
  right: [0, p - K],
});
const p23FlankPairs = {
  "a,g": [a, g],
  "g,a": [g, a],
};
const corridorGeometryHits = [];
for (const [columnName, column] of Object.entries(p21Columns)) {
  for (const [pairName, pair] of Object.entries(p23FlankPairs)) {
    const shell = [...column, ...H(pair[0], pair[1])];
    const key = H4inv(shell);
    for (const sign of [-1, 1]) {
      const output = p22Receiver.values.map(
        (value, index) => mod29(value + sign * key[index])
      );
      for (const target of fourRuneTargets) {
        if (output.every((value, index) => value === target.values[index])) {
          corridorGeometryHits.push({
            columnName,
            pairName,
            shell,
            key,
            sign,
            target: target.word,
          });
        }
      }
    }
  }
}
assert.equal(2 * 2 * 2 * fourRuneTargets.length, 72);
assert.deepEqual(corridorGeometryHits, [{
  columnName: "right",
  pairName: "g,a",
  shell: [0, 21, 28, 11],
  key: [20, 10, 18, 20],
  sign: -1,
  target: "THEIR",
}]);

// Both the new p22 Bob packet and the older p23 state route fix B=19,
// whose already-fixed native p50 handoff is physical p33.
assert.equal(tape[B], "0X");
const p33 = decodeToken(tape[B], base60);
assert.equal(p33, 33);

console.log(JSON.stringify({
  upstream: {
    key_id: "7A35090F",
    state: { p, q, g, a, b, A, B, K, e },
    phrase: roadPhrase.join(" "),
    page_numbers: [21, 22, 23],
  },
  p21_prior_state_packet: p21Packet,
  p11_overlap: {
    raw_sum_difference: p11TheirNumbers,
    words: p11TheirNumbers.map((index) => source[index]),
    full_clause: reconstructedFullClause,
  },
  p22_prospective_holdout: {
    source_word: source[22],
    p50_token: tape[20],
    base59: pointer59,
    base60: pointer60,
    charged_positions: chargedPositions,
    receiver: {
      word_index: p22Receiver.index,
      source_label: source[p22Receiver.index],
      offsets: [p22Receiver.start, p22Receiver.end],
      values: p22Receiver.values,
      raw_sum: p22RawSum,
      raw_sum_mod29: p22RawSum % 29,
    },
    family: {
      same_word_collapses: collapses.length,
      exact_envelope_pages: collapses.filter((row) => row.exactEnvelope).map((row) => row.page),
      self_address_pages: collapses.filter((row) => row.selfAddress).map((row) => row.page),
    },
    local_inverse: {
      raw_h4_shell: H4(p22Receiver.values),
      key_family_configurations: 450,
      hit: p22KeyFamilyHits[0],
      raw_shell_occurrences: rawShellHits.length,
      fixed_key_configurations: 9162,
      fixed_key_hits: fixedKeyHits,
      raw_source_readout: p22LexicalReadout,
      raw_source_readout_occurrences: lexicalPatternHits.length,
      their_occurrences: {
        first: p22Receiver.index,
        separator: finalRawSourceIndex,
        second: finalRawSourceIndex + 1,
        rise: (finalRawSourceIndex + 1) - p22Receiver.index,
      },
      number_direction: {
        base59_uniform_shift_hits: sourceNumberUniformShiftHits59,
        base60_uniform_shift_hits: sourceNumberUniformShiftHits60,
        reconstructed_clause: reconstructedClause,
      },
    },
  },
  p23_prior_line_lengths: p23LineLengths,
  corridor_geometry_inverse: {
    configurations: 72,
    hits: corridorGeometryHits,
  },
  p25_prospective_transfer: {
    source_word: source[25],
    p50_token: tape[34],
    positions: p25TransferPositions,
    hit_words: p25TransferHits.map((word) => word.index),
    same_word: false,
  },
  shared_B_handoff: { B, token: tape[B], page: p33 },
}, null, 2));
