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
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const screen = read("resources/historical/cicada2013-os-original-message.txt");
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find(row => normalized.startsWith(row.symbol, offset));
    assert.ok(token, "unmapped GP spelling " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {string} text @returns {number} */
function gp0(text) {
  return text.split(/[^A-Za-z]+/).filter(Boolean).flatMap(gp)
    .reduce((sum, value) => sum + value, 0);
}

/** @param {number[]} pair @returns {number[]} */
function H(pair) {
  return [mod29(pair[0] - pair[1]), mod29(pair[0] + pair[1])];
}

/** @param {number[]} pair @returns {number[]} */
function Hinv(pair) {
  const inv2 = 15;
  return [
    mod29((pair[0] + pair[1]) * inv2),
    mod29((pair[1] - pair[0]) * inv2),
  ];
}

/** @param {number} base @param {number} exponent @returns {number} */
function modPow29(base, exponent) {
  let result = 1;
  let value = mod29(base);
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * value) % 29;
    value = (value * value) % 29;
    power = Math.floor(power / 2);
  }
  return result;
}

const phrase = "The key is all around you";
assert.ok(screen.includes(phrase + "."));
assert.ok(screen.trim().endsWith("3301"));
const wordSums = Object.fromEntries(
  phrase.toUpperCase().split(" ").map(word => [word, gp0(word)])
);
assert.deepEqual(wordSums, {
  THE: 20,
  KEY: 49,
  IS: 25,
  ALL: 64,
  AROUND: 64,
  YOU: 30,
});
const phraseAddress = gp0(phrase);
assert.equal(phraseAddress, 252);

const tokens = grid.rows.flat();
const alphabet = grid.alphabet;
assert.equal(tokens.length, 256);
assert.equal(tokens[phraseAddress], "30");
const tableValues = tokens.map(token => {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return 60 * high + low;
});
assert.equal(tableValues[phraseAddress], 180);
assert.deepEqual(
  tableValues.map((value, index) => value === 180 ? index : -1)
    .filter(index => index >= 0),
  [252]
);

const ring = [];
for (let column = 0; column < 8; column += 1) ring.push(column);
for (let row = 1; row < 32; row += 1) ring.push(row * 8 + 7);
for (let column = 6; column >= 0; column -= 1) ring.push(31 * 8 + column);
for (let row = 30; row >= 1; row -= 1) ring.push(row * 8);
assert.equal(ring.length, 76);
assert.equal(new Set(ring).size, 76);
assert.equal(ring.includes(phraseAddress), true);

const p55 = corpus.pages.find(page => page.page === 55);
const p56 = corpus.pages.find(page => page.page === 56);
const p57 = corpus.pages.find(page => page.page === 57);
assert.ok(p55 && p56 && p57);
assert.equal(p55.indices.length, 76);
assert.equal(256 - ring.length, 180);
assert.equal(p56.indices.length + p57.indices.length, 180);

const selectedToken = tokens[phraseAddress];
const digitPair = [
  alphabet.indexOf(selectedToken[0]) % 29,
  alphabet.indexOf(selectedToken[1]) % 29,
];
assert.deepEqual(digitPair, [3, 0]);
const receiverPair = Hinv(digitPair);
assert.deepEqual(receiverPair, [16, 13]);
assert.deepEqual(H(receiverPair), digitPair);

const redStarts = [];
for (const pageInk of ink.pages) {
  const page = corpus.pages.find(candidate => candidate.page === pageInk.page);
  if (!page) continue;
  for (const span of pageInk.red_spans || []) {
    if (span.length < 2) continue;
    const pair = page.indices.slice(span.start, span.start + 2);
    assert.equal(pair.length, 2);
    redStarts.push({
      page: pageInk.page,
      start: span.start,
      length: span.length,
      pair,
      h: H(pair),
    });
  }
}
assert.equal(redStarts.length, 18);
const receiverHits = redStarts.filter(row =>
  row.pair[0] === receiverPair[0] && row.pair[1] === receiverPair[1]
);
assert.deepEqual(receiverHits, [{
  page: 53,
  start: 128,
  length: 51,
  pair: [16, 13],
  h: [3, 0],
}]);

const redPairSet = new Set(redStarts.map(row => row.pair.join(",")));
const tableReceiverHits = [];
for (let cell = 0; cell < tokens.length; cell += 1) {
  const cellToken = tokens[cell];
  const pair = [
    alphabet.indexOf(cellToken[0]) % 29,
    alphabet.indexOf(cellToken[1]) % 29,
  ];
  const sourcePair = Hinv(pair);
  if (redPairSet.has(sourcePair.join(","))) {
    tableReceiverHits.push({
      cell,
      token: cellToken,
      onOuterRing: ring.includes(cell),
      sourcePair,
    });
  }
}
assert.deepEqual(
  tableReceiverHits.map(row => [row.cell, row.token, row.onOuterRing]),
  [
    [174, "3T", false],
    [202, "3T", false],
    [236, "3w", false],
    [252, "30", true],
  ]
);

assert.equal(gp0("MUST"), 51);
const p53 = corpus.pages.find(page => page.page === 53);
assert.ok(p53);
const hit = receiverHits[0];
assert.equal(hit.start + hit.length, p53.indices.length);
assert.equal(hit.length, gp0("MUST"));

const parts = transcription.split(/^\s*%\s*$/m);
const p53Part = parts[52].replace(/\/\s*/gu, "");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
let pageOffset = 0;
const p53Words = (p53Part.match(/[\u16A0-\u16FF]+/gu) || []).map(word => {
  const values = [...word].map(rune => {
    const value = runeIndex.get(rune);
    assert.notEqual(value, undefined);
    return value;
  });
  const row = {start: pageOffset, end: pageOffset + values.length, values};
  pageOffset = row.end;
  return row;
});
assert.equal(pageOffset, p53.indices.length);
const selectedWords = p53Words.filter(row =>
  row.start >= hit.start && row.end <= hit.start + hit.length
);
assert.equal(selectedWords.length, 12);
const firstShedCount = selectedWords.reduce(
  (sum, row) => sum + Math.max(0, row.values.length - 2),
  0
);
assert.equal(firstShedCount, 27);

// The clue has now yielded an ordered raw key pair before p28 is opened:
// H(first2) begins with 3, and the first literal shed count is 27.
// Apply those values in source order to p28's independently fixed
// center-singleton and one-based word28 operands.
const p28Part = parts[28].replace(/\/\s*/gu, "");
let p28Offset = 0;
const p28Words = (p28Part.match(/[\u16A0-\u16FF]+/gu) || []).map(word => {
  const values = [...word].map(rune => {
    const value = runeIndex.get(rune);
    assert.notEqual(value, undefined);
    return value;
  });
  const row = {start: p28Offset, end: p28Offset + values.length, values};
  p28Offset = row.end;
  return row;
});
const p28Runes = p28Words.flatMap(row => row.values);
assert.equal(p28Runes.length, 269);
const p28CenterOffset = 134;
const p28Word28 = p28Words[27];
assert.equal(p28Word28.start, p28CenterOffset + 1);
assert.deepEqual(
  [p28Runes[p28CenterOffset], ...p28Word28.values],
  [9, 28, 24, 10, 1, 20]
);

const historicalKeyPair = [digitPair[0], firstShedCount];
assert.deepEqual(historicalKeyPair, [3, 27]);
const readOutRaw = [
  modPow29(p28Runes[p28CenterOffset], historicalKeyPair[0]),
  ...p28Word28.values.map(value => modPow29(value, historicalKeyPair[1])),
];
assert.deepEqual(readOutRaw, [4, 28, 23, 3, 1, 16]);
assert.equal(readOutRaw.map(value => corpus.translit[value]).join(""), "READOUT");

const reversedKeyRaw = [
  modPow29(p28Runes[p28CenterOffset], historicalKeyPair[1]),
  ...p28Word28.values.map(value => modPow29(value, historicalKeyPair[0])),
];
assert.deepEqual(reversedKeyRaw, [13, 28, 20, 14, 1, 25]);
assert.equal(reversedKeyRaw.map(value => corpus.translit[value]).join(""), "PEALXUAE");


const ourOwn = [...gp("OUR"), ...gp("OWN")];
assert.deepEqual(ourOwn, [3, 1, 4, 3, 7, 9]);
const p55Tail = p55.indices.slice(70);
assert.deepEqual(p55Tail, [23, 11, 1, 17, 18, 10]);
assert.deepEqual(
  p55.indices.map((value, index) => value === 0 ? index : -1)
    .filter(index => index >= 0),
  [15, 25, 41]
);

const startRingPosition = ring.indexOf(phraseAddress);
const footerRows = [];
const requiredKey = {
  plus: p55Tail.map((cipher, index) => mod29(cipher - ourOwn[index])),
  minus: p55Tail.map((cipher, index) => mod29(ourOwn[index] - cipher)),
  beaufort: p55Tail.map((cipher, index) => mod29(cipher + ourOwn[index])),
};
assert.deepEqual(requiredKey, {
  plus: [20, 10, 26, 14, 11, 1],
  minus: [9, 19, 3, 15, 18, 28],
  beaufort: [26, 12, 5, 20, 25, 19],
});

for (const direction of [1, -1]) {
  const key = Array.from({length: 76}, (unused, index) => {
    void unused;
    const position = (startRingPosition + direction * index + 76 * 10) % 76;
    return mod29(tableValues[ring[position]]);
  });

  for (const [mode, required] of Object.entries(requiredKey)) {
    for (let bypassCount = 0; bypassCount <= 3; bypassCount += 1) {
      const consumedBeforeTail = 70 - bypassCount;
      const keyTail = key.slice(consumedBeforeTail, consumedBeforeTail + 6);
      const matches = keyTail.filter((value, index) =>
        value === required[index]
      ).length;
      footerRows.push({
        direction: direction === 1 ? "clockwise" : "counterclockwise",
        mode,
        bypassCount,
        consumedBeforeTail,
        keyTail,
        matches,
      });
    }
  }
}

assert.equal(footerRows.length, 24);
assert.equal(Math.max(...footerRows.map(row => row.matches)), 1);
assert.equal(footerRows.some(row => row.matches === 6), false);

const typedProjectionRows = [];
for (const direction of [1, -1]) {
  const projected = Array.from({length: 76}, (unused, index) => {
    void unused;
    const position = (startRingPosition + direction * index + 76 * 10) % 76;
    const value = tableValues[ring[position]];
    const quotient = Math.floor(value / 29);
    const remainder = value % 29;
    const h = H([quotient, remainder]);
    const hinv = Hinv([quotient, remainder]);
    return {
      quotient,
      remainder,
      h0: h[0],
      h1: h[1],
      hinv0: hinv[0],
      hinv1: hinv[1],
    };
  });

  for (const field of Object.keys(projected[0])) {
    const key = projected.map(row => row[field]);
    for (const [mode, required] of Object.entries(requiredKey)) {
      for (let bypassCount = 0; bypassCount <= 3; bypassCount += 1) {
        const consumedBeforeTail = 70 - bypassCount;
        const keyTail = key.slice(consumedBeforeTail, consumedBeforeTail + 6);
        const matches = keyTail.filter((value, index) =>
          value === required[index]
        ).length;
        typedProjectionRows.push({
          direction: direction === 1 ? "clockwise" : "counterclockwise",
          field,
          mode,
          bypassCount,
          matches,
        });
      }
    }
  }
}

assert.equal(typedProjectionRows.length, 144);
assert.equal(Math.max(...typedProjectionRows.map(row => row.matches)), 2);
assert.equal(typedProjectionRows.some(row => row.matches === 6), false);

console.log(JSON.stringify({
  status: "PASS",
  historicalSource: {
    phrase,
    wordGP0: wordSums,
    phraseGP0: phraseAddress,
    screenEndsAt: 3301,
  },
  p50SelfPointer: {
    cell: phraseAddress,
    row: Math.floor(phraseAddress / 8),
    column: phraseAddress % 8,
    ringPosition: ring.indexOf(phraseAddress),
    token: selectedToken,
    tokenDigitPair: digitPair,
    base60Value: tableValues[phraseAddress],
  },
  terminalGeometry: {
    outerCells: ring.length,
    interiorCells: 256 - ring.length,
    p55Runes: p55.indices.length,
    p56Runes: p56.indices.length,
    p57Runes: p57.indices.length,
    p56PlusP57: p56.indices.length + p57.indices.length,
  },
  fixedHReceiver: {
    inversePair: receiverPair,
    redSpanHits: receiverHits,
    tableCellsHittingAnyRedStart: tableReceiverHits,
  },
  blindP53Consequence: {
    terminalRedSpanLength: hit.length,
    gp0Must: gp0("MUST"),
    printedWords: selectedWords.length,
    firstLiteralShedCount: firstShedCount,
  },
  historicalKeyToP28: {
    keyPair: historicalKeyPair,
    p28Source: [p28Runes[p28CenterOffset], ...p28Word28.values],
    rawOutput: readOutRaw,
    plaintext: readOutRaw.map(value => corpus.translit[value]).join(""),
    reversedKeyPlaintext: reversedKeyRaw.map(value => corpus.translit[value]).join(""),
  },
  sourceSelectedP55DirectPadGate: {
    startCell: phraseAddress,
    base60SelectedByValue180: true,
    variants: footerRows.length,
    maxFooterMatches: Math.max(...footerRows.map(row => row.matches)),
    exactOurOwnHits: footerRows.filter(row => row.matches === 6),
    typedDivmod29ProjectionVariants: typedProjectionRows.length,
    typedDivmod29ProjectionMaxMatches:
      Math.max(...typedProjectionRows.map(row => row.matches)),
    typedDivmod29ExactOurOwnHits:
      typedProjectionRows.filter(row => row.matches === 6),
  },
  decision:
    "The authenticated 2013 phrase self-selects p50 outer cell252. Its unique value180 types both the table interior and the known p56+p57 terminal register. Token30 maps through fixed H^-1 to the unique p53 terminal red-span start; its untouched length51=MUST and first shed27 reconnect to p27. The p53 receiver supplies the ordered raw key pair [3,27], which applied in source order to p28's fixed center and word28 operands yields READ OUT; reversing the key order yields PEALXUAE. The same source-selected cell252 phase closes the previously untested direct p50-ring pad start: all 24 raw-remainder and all 144 typed divmod29-projection direction/sign/F-clock variants miss the conditional OUR OWN footer, so that direct p55 consumer remains retired.",
}, null, 2));
