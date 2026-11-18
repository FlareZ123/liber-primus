"use strict";

/**
 * Source-exact SFT for the p28 BASE29 -> GOODBYE bracket.
 *
 * Reconstructs the authenticated command cut points through the frozen
 * GP0 -> p50 -> base59 grammar, then checks the bracketed p28 words and
 * literal circumference-peel signatures manuscript-wide.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signedProtocol = read("resources/external/2013-tcp-server-signed-source.md");
const solved = JSON.parse(
  read("resources/external/relikd-solved-gp29-native-v1.json")
);
const liveVectors = JSON.parse(
  read("resources/external/2013-tcp-live-test-vectors.json")
);

assert.match(
  signedProtocol,
  /RAND, QUINE, BASE29, CODE, KOAN, DH, NEXT, and GOODBYE/
);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);
const table = grid.pages.flatMap((page) => page.tokens);
const alphabet59 = grid.alphabet.replace("f", "");
const parts = transcription.split(/\r?\n%\r?\n/);

/** @param {number[]} values */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

/** @param {string} text */
function englishToGp(text) {
  const normalized = text
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP text at " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {string} token */
function decode59(token) {
  const high = alphabet59.indexOf(token[0]);
  const low = alphabet59.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * 59 + low;
}

/** @param {string} encoded */
function decodeBase29(encoded) {
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRS";
  let value = 0;
  for (const character of encoded) {
    const digit = alphabet.indexOf(character);
    assert.ok(digit >= 0);
    value = value * 29 + digit;
  }
  return value;
}

/** @param {number} limit @returns {number[]} */
function primesBelow(limit) {
  const composite = new Uint8Array(limit);
  const primes = [];
  for (let value = 2; value < limit; value += 1) {
    if (composite[value]) continue;
    primes.push(value);
    if (value * value < limit) {
      for (let multiple = value * value; multiple < limit; multiple += value) {
        composite[multiple] = 1;
      }
    }
  }
  return primes;
}

/** @param {string} text */
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

/** @param {number} physicalPage */
function wordsOnPhysicalPage(physicalPage) {
  assert.notEqual(physicalPage, 50);
  const partIndex = physicalPage <= 49 ? physicalPage : physicalPage - 1;
  return runeWords(parts[partIndex]);
}

/** @param {number[]} word */
function peelSums(word) {
  const output = [];
  for (let current = word; current.length > 0; current = current.slice(1, -1)) {
    output.push(sum(current));
  }
  return output;
}

const base29Address = sum(englishToGp("BASE29"));
const goodbyeAddress = sum(englishToGp("GOODBYE"));
const nextAddress = sum(englishToGp("NEXT"));
assert.deepEqual(
  { base29Address, goodbyeAddress, nextAddress },
  { base29Address: 74, goodbyeAddress: 96, nextAddress: 57 }
);

assert.equal(table[base29Address], "3P");
assert.equal(table[goodbyeAddress], "3g");
const base29Cut = decode59(table[base29Address]);
const goodbyeCut = decode59(table[goodbyeAddress]);
assert.deepEqual({ base29Cut, goodbyeCut }, { base29Cut: 202, goodbyeCut: 218 });

const p28Words = wordsOnPhysicalPage(28);
assert.equal(p28Words.length, 59);

let cursor = 0;
const p28Rows = p28Words.map((word, index) => {
  const start = cursor;
  cursor += word.length;
  return {
    number: index + 1,
    start,
    end: cursor - 1,
    values: word,
    gp0: sum(word),
    peels: peelSums(word),
  };
});
assert.equal(cursor, 269);

const bracket = p28Rows.slice(43, 46);
assert.deepEqual(
  bracket.map((row) => [row.number, row.start, row.end, row.values, row.gp0]),
  [
    [44, 202, 206, [24, 18, 19, 13, 9], 83],
    [45, 207, 211, [0, 28, 6, 23, 17], 74],
    [46, 212, 217, [3, 14, 6, 9, 26, 6], 64],
  ]
);
assert.equal(bracket[0].start, base29Cut);
assert.equal(bracket[2].end + 1, goodbyeCut);
assert.deepEqual(bracket.map((row) => row.peels), [
  [83, 50, 19],
  [74, 57, 6],
  [64, 55, 15],
]);

const allWords = runeWords(parts.slice(0, 55).join("\n"));
assert.equal(allWords.length, 2896);

const signatures = [
  [83, 50, 19],
  [74, 57, 6],
  [64, 55, 15],
];
const signatureCounts = signatures.map(() => 0);
for (const word of allWords) {
  const peels = peelSums(word);
  for (let index = 0; index < signatures.length; index += 1) {
    const signature = signatures[index];
    if (signature.every((value, position) => peels[position] === value)) {
      signatureCounts[index] += 1;
    }
  }
}
assert.deepEqual(signatureCounts, [1, 1, 1]);

let tripleHits = 0;
for (let index = 0; index + 2 < allWords.length; index += 1) {
  if (
    sum(allWords[index]) === 83 &&
    sum(allWords[index + 1]) === 74 &&
    sum(allWords[index + 2]) === 64
  ) {
    tripleHits += 1;
  }
}
assert.equal(allWords.length - 2, 2894);
assert.equal(tripleHits, 1);

/*
 * New holdout consequence: SHED -> 55 -> complete word15, while the
 * adjacent bracket word independently exposes NEXT. P55's first page-local
 * one-rune fragment continues the preceding p54 word, leaving 16 intact
 * p55 words. One-based 15 selects DJU and NEXT selects BEI.
 */
const p54Words = wordsOnPhysicalPage(54);
const p55Words = wordsOnPhysicalPage(55);
assert.deepEqual(p55Words[0], [21]);
const joined5455 = runeWords(parts[53] + "\n" + parts[54]);
assert.equal(joined5455.length, p54Words.length + p55Words.length - 1);
assert.deepEqual(
  joined5455[p54Words.length - 1],
  p54Words.at(-1).concat(p55Words[0])
);

const p55CompleteWords = p55Words.slice(1);
assert.equal(p55CompleteWords.length, 16);
const p55Selector = bracket[2].peels[2];
assert.equal(p55Selector, 15);
assert.equal(bracket[1].peels[1], nextAddress);

const dju = p55CompleteWords[p55Selector - 1];
const bei = p55CompleteWords[p55Selector];
assert.deepEqual(dju, [23, 11, 1]);
assert.deepEqual(bei, [17, 18, 10]);

const pairHits = [];
for (let physicalPage = 0; physicalPage <= 55; physicalPage += 1) {
  if (physicalPage === 50) continue;
  const words = wordsOnPhysicalPage(physicalPage);
  for (let index = 0; index + 1 < words.length; index += 1) {
    if (
      words[index].length === dju.length &&
      words[index + 1].length === bei.length &&
      words[index].every((value, position) => value === dju[position]) &&
      words[index + 1].every((value, position) => value === bei[position])
    ) {
      pairHits.push({
        page: physicalPage,
        localWord: index + 1,
        nextLocalWord: index + 2,
      });
    }
  }
}
assert.deepEqual(pairHits, [
  { page: 27, localWord: 6, nextLocalWord: 7 },
  { page: 55, localWord: 16, nextLocalWord: 17 },
]);

/*
 * Secondary deterministic continuation:
 * nested 57/6 selects solved p57 word6 TO -> GP0 19;
 * p50 cell19 is 0X and decodes to 33 in either radix.
 */
const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const p57Words = runeWords(p57.source_text);
assert.equal(p57Words.length, 20);
const p57Word6 = p57Words[5];
assert.deepEqual(p57Word6, [16, 3]);
assert.equal(sum(p57Word6), 19);
assert.equal(table[19], "0X");
assert.equal(decode59(table[19]), 33);
const alphabet60 = grid.alphabet;
const decode60 = (token) =>
  alphabet60.indexOf(token[0]) * 60 + alphabet60.indexOf(token[1]);
assert.equal(decode60(table[19]), 33);

/*
 * BASE29 1033 -> 16I closes onto the selected LP2 objects.
 * The literal radix supplies address29; p50[29] is the unique token16;
 * the already selected p28 word28 leaves a literal center I after two peels.
 */
const testVector = liveVectors.stableOrganizerTestVector;
assert.deepEqual(testVector, {
  base29Request: 1033,
  base29Response: "16I",
  dhModulus: 3301,
});
assert.equal(decodeBase29(testVector.base29Response), testVector.base29Request);

assert.equal(table[29], "16");
assert.deepEqual(
  table.map((token, index) => token === "16" ? index : null)
    .filter((index) => index !== null),
  [29]
);

const p28CenterWord = p28Rows[27];
assert.deepEqual(p28CenterWord.values, [28, 24, 10, 1, 20]);
const p28CenterRune = p28CenterWord.values.slice(2, 3);
assert.deepEqual(p28CenterRune, [10]);
assert.equal(corpus.translit[p28CenterRune[0]], "I");
const reconstructed1033 = table[29] + corpus.translit[p28CenterRune[0]];
assert.equal(reconstructed1033, testVector.base29Response);
assert.equal(decodeBase29(reconstructed1033), 1033);

// Matched prefix control for the independently reproduced 3QO=3301 route.
assert.equal(table[103], "3Q");
assert.deepEqual(
  table.map((token, index) => token === "3Q" ? index : null)
    .filter((index) => index !== null),
  [103]
);
assert.equal(decodeBase29("3QO"), testVector.dhModulus);

/*
 * The older cuneiform arithmetic had prime ranks 174=6*29 and 464=16*29.
 * The p28 object now selects both quotients directly.
 */
const primes = primesBelow(4000);
const base29Center = bracket[1].peels[2];
assert.equal(base29Center, 6);
const literalTablePrefix = Number(table[29]);
assert.equal(literalTablePrefix, 16);
const cuneiformPrimeOperands = [
  primes[base29Center * 29 - 1],
  primes[literalTablePrefix * 29 - 1],
];
assert.deepEqual(cuneiformPrimeOperands, [1033, 3301]);
assert.equal(primes.indexOf(1033) + 1, 174);
assert.equal(primes.indexOf(3301) + 1, 464);

console.log(JSON.stringify({
  status: "PASS",
  cuts: {
    BASE29: { address: 74, token: "3P", base59: 202 },
    GOODBYE: { address: 96, token: "3g", base59: 218 },
  },
  bracket: bracket.map((row) => ({
    word: row.number,
    start: row.start,
    end: row.end,
    gp0: row.gp0,
    peels: row.peels,
  })),
  corpus: {
    words: allWords.length,
    tripleWindows: allWords.length - 2,
    ordered837464Hits: tripleHits,
    nestedSignatureCounts: signatureCounts,
  },
  p55Exit: {
    selector: p55Selector,
    word: "DJU",
    next: "BEI",
    pairHits,
  },
  p33Continuation: {
    p57Word6: "TO",
    p57Word6Gp0: 19,
    p50Token: "0X",
    page: 33,
    base29_1033: {
      address: 29,
      p50Prefix: table[29],
      p28Suffix: corpus.translit[p28CenterRune[0]],
      reconstructed: reconstructed1033,
    },
    base29_3301_control: {
      address: 103,
      p50Prefix: table[103],
      encoded: "3QO",
    },
    primeRankOperands: {
      quotient1033: base29Center,
      quotient3301: literalTablePrefix,
      radix: 29,
      operands: cuneiformPrimeOperands,
    },
  },
}, null, 2));
