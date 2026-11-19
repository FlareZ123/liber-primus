"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const M = 29;

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} x @returns {number} */
function mod29(x) {
  return ((x % M) + M) % M;
}

/** @param {number} n @returns {number[]} */
function base29(n) {
  if (n === 0) return [0];
  const out = [];
  let x = n;
  while (x > 0) {
    out.unshift(x % M);
    x = Math.floor(x / M);
  }
  return out;
}

/** @param {number[]} values @returns {number[]} */
function H(values) {
  const out = [];
  for (let l = 0, r = values.length - 1; l < r; l += 1, r -= 1) {
    out.push(mod29(values[l] - values[r]));
    out.push(mod29(values[l] + values[r]));
  }
  if (values.length % 2 === 1) out.push(values[(values.length - 1) / 2]);
  return out;
}

/** @param {number} start @param {number[]} rises @returns {number[]} */
function cumulative(start, rises) {
  const out = [mod29(start)];
  let x = mod29(start);
  for (const rise of rises) {
    x = mod29(x + rise);
    out.push(x);
  }
  return out;
}

/** @param {string} text @returns {number[][][]} */
function parseSquares(text) {
  return text.trim().split(/\n\s*\n/u).map((block) =>
    block.split("\n").map((line) =>
      line.trim().split(/\s+/u).map(Number)
    )
  );
}

/** @param {number[][]} square @returns {number} */
function center(square) {
  const m = Math.floor(square.length / 2);
  return square[m][m];
}

/** @param {number[][]} square @returns {number} */
function magicSum(square) {
  return square[0].reduce((sum, value) => sum + value, 0);
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const ink = JSON.parse(read("resources/liber-primus/lp2-p0-physical-ink-override.json"));
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} text @returns {number[]} */
function gpText(text) {
  const normalized = text
    .toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const out = [];
  for (let index = 0; index < normalized.length;) {
    const token = gpTokens.find((row) => normalized.startsWith(row.symbol, index));
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(index));
    out.push(token.value);
    index += token.symbol.length;
  }
  return out;
}

/** @param {string} source @returns {number[][]} */
function runeWords(source) {
  const out = [];
  let current = [];
  for (const character of [...source]) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      current.push(value);
    } else if (current.length) {
      out.push(current);
      current = [];
    }
  }
  if (current.length) out.push(current);
  return out;
}

/** @returns {Array<{page:number,words:Array<{start:number,values:number[]}>}>} */
function unknownPhysicalWords() {
  const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);
  return parts.map((part, segment) => {
    const page = segment >= 50 ? segment + 1 : segment;
    const words = [];
    let current = [];
    let start = 0;
    let offset = 0;

    const finish = () => {
      if (!current.length) return;
      words.push({start, values: current});
      current = [];
    };

    for (const character of [...part]) {
      const value = runeIndex.get(character);
      if (value !== undefined) {
        if (!current.length) start = offset;
        current.push(value);
        offset += 1;
      } else if (character === "/" || /\s/u.test(character)) {
        // Printed line wrap preserves the word.
      } else {
        finish();
      }
    }
    finish();
    return {page, words};
  });
}

// Reconstruct only the state fields supplied by authenticated square metadata.
const squares = parseSquares(read("resources/cicada2014-openpuff-magic-squares.txt"));
const same1033 = squares
  .filter((square) => magicSum(square) === 1033)
  .sort((a, b) => a.length - b.length);
assert.equal(same1033.length, 2);

const small = same1033[0];
const large = same1033[1];
const g = small.length;
const K = large.length - small.length;
const [e, q] = base29(center(small));
const largeCenter = base29(center(large));
assert.equal(largeCenter.length, 2);
assert.equal(largeCenter[0] - e, largeCenter[1] - q);
const A = largeCenter[0] - e;

const sum1033 = base29(1033);
assert.equal(sum1033.length, 3);
const unitFromSum = sum1033[0];
const a = sum1033[1];
const B = mod29(A - sum1033[2]);

assert.deepEqual({g, K, e, q, A, a, B, unitFromSum}, {
  g: 5,
  K: 2,
  e: 3,
  q: 4,
  A: 8,
  a: 6,
  B: 19,
  unitFromSum: 1,
});

// Replace Agent14's lexical anchors THE7 / WAY13 by square-state anchors.
const u = q - e;
const t = g + K;
const w = A + g;
assert.deepEqual({u, t, w}, {u: 1, t: 7, w: 13});

// Same already-documented three-column rise grammar, now state-only.
const leftRises = [q - u, w - u, w + u].map(mod29);
const centerRises = [q, q + t, q + 2 * t, q + 3 * t].map(mod29);
const rightRises = [t - u, t, t + u].map(mod29);

const left = cumulative(-q, leftRises);
const centerColumn = cumulative(q, centerRises);
const right = cumulative(t, rightRises);

assert.deepEqual(leftRises, [3, 12, 14]);
assert.deepEqual(centerRises, [4, 11, 18, 25]);
assert.deepEqual(rightRises, [6, 7, 8]);

assert.deepEqual(left, [25, 28, 11, 25]);
assert.deepEqual(centerColumn, [4, 8, 19, 8, 4]);
assert.deepEqual(right, [7, 13, 20, 28]);

// State consequences emerge without being supplied as generator inputs.
assert.deepEqual(centerColumn, [q, A, B, A, q]);
assert.deepEqual(rightRises, [a, g + K, A]);

const markerPacket = [...left, ...centerColumn, ...right];

// The visible marker counts 4|5|4 have exactly one partition matching the
// adjacent red title's 8+5 word lengths: both side columns (4+4), then center5.
// Outside-in H makes that physical split algebraically exact.
const sidePacket = [...left, ...right];
const firstWordKey = H(sidePacket);
const secondWordKey = H(centerColumn);
assert.equal(sidePacket.length, 8);
assert.equal(centerColumn.length, 5);

const key = H(markerPacket);
assert.deepEqual(key, [...firstWordKey, ...secondWordKey]);
assert.deepEqual(markerPacket, [
  25, 28, 11, 25,
  4, 8, 19, 8, 4,
  7, 13, 20, 28,
]);
assert.deepEqual(key, [
  26, 24, 8, 19, 27, 24, 18, 3,
  0, 8, 0, 16, 19,
]);

const p0Cipher = ink.physical_zero_based.red_words.flatMap((word) => word.gp_indices);
assert.equal(p0Cipher.length, 13);
const p0Plain = p0Cipher.map((value, index) => mod29(value - key[index]));
assert.deepEqual(p0Plain, [...gpText("EPIPHANY"), ...gpText("SEEKS")]);

// Build the pinned solved/authenticated lexical pool.
const lexical = new Map();
for (const section of solved.sections) {
  for (const values of runeWords(section.source_text)) {
    const text = values.map((value) => corpus.translit[value]).join("");
    lexical.set(values.join(","), {text, source: "solved"});
  }
}

const clear = signed.slice(
  signed.indexOf("Hello."),
  signed.indexOf("-----BEGIN PGP SIGNATURE-----")
);
const signedWords = clear
  .replace(/\b7A35090F\b/gu, "")
  .match(/[A-Za-z]+/gu)
  .map((text) => ({text: text.toUpperCase(), values: gpText(text)}));
assert.equal(signedWords.length, 43);
for (const row of signedWords) {
  lexical.set(row.values.join(","), {text: row.text, source: "signed2016"});
}

// Secondary check: the former lexical anchors are consequences of state.
assert.equal(signedWords[t].text, "THE");
assert.equal(signedWords[w].text, "WAY");

// Post-freeze original-marker holdout: pair the four same-height flank dots.
// Physical left-minus-right is the only natural H channel whose four outputs
// all land inside the independently established central source instruction
// interval 14..29. Literal RISE orders those values increasingly.
const rowDifference = left.map((value, index) => mod29(value - right[index]));
const rowSum = left.map((value, index) => mod29(value + right[index]));
const mirroredDifference = right.map((value, index) => mod29(value - left[index]));
const centralInstructionMembership = (values) =>
  values.filter((value) => value >= 14 && value <= 29).length;

assert.deepEqual(rowDifference, [18, 15, 20, 26]);
assert.deepEqual(rowSum, [3, 12, 2, 24]);
assert.deepEqual(mirroredDifference, [11, 14, 9, 3]);
assert.deepEqual([
  centralInstructionMembership(rowDifference),
  centralInstructionMembership(rowSum),
  centralInstructionMembership(mirroredDifference),
], [4, 1, 1]);

const risingRowDifference = [...rowDifference].sort((a, b) => a - b);
assert.deepEqual(risingRowDifference, [15, 18, 20, 26]);
assert.deepEqual(
  risingRowDifference.map((value) => signedWords[value].text),
  ["WORDS", "MAP", "MEANING", "NUMBERS"]
);

const receivers = [];
for (const page of unknownPhysicalWords()) {
  for (let index = 0; index + 1 < page.words.length; index += 1) {
    const leftWord = page.words[index];
    const rightWord = page.words[index + 1];
    if (leftWord.values.length === 8 && rightWord.values.length === 5) {
      receivers.push({
        page: page.page,
        word: index + 1,
        start: leftWord.start,
        cipher: [...leftWord.values, ...rightWord.values],
      });
    }
  }
}
assert.equal(receivers.length, 19);

// Fixed generated key, no plaintext target: decrypt every same-shape receiver.
const lexicalHits = [];
for (const receiver of receivers) {
  const plain = receiver.cipher.map((value, index) => mod29(value - key[index]));
  const first = lexical.get(plain.slice(0, 8).join(","));
  const second = lexical.get(plain.slice(8).join(","));
  if (first && second) {
    lexicalHits.push({
      page: receiver.page,
      word: receiver.word,
      start: receiver.start,
      first: first.text,
      second: second.text,
      firstSource: first.source,
      secondSource: second.source,
    });
  }
}

assert.deepEqual(lexicalHits, [{
  page: 0,
  word: 1,
  start: 0,
  first: "EPIPHANY",
  second: "SEEKS",
  firstSource: "signed2016",
  secondSource: "signed2016",
}]);

console.log(JSON.stringify({
  status: "PASS",
  squareMetadata: {g, K, e, q, A, a, B},
  stateAnchors: {u, t, w},
  columns: {
    left: {seed: mod29(-q), rises: leftRises, values: left},
    center: {seed: q, rises: centerRises, values: centerColumn},
    right: {seed: t, rises: rightRises, values: right},
  },
  markerPacket,
  wordSplitGeometry: {
    markerCounts: [left.length, centerColumn.length, right.length],
    titleWordLengths: [8, 5],
    firstWordFrom: "left+right side columns",
    secondWordFrom: "center column",
    firstWordKey,
    secondWordKey,
  },
  additiveKey: key,
  p0Plaintext: ["EPIPHANY", "SEEKS"],
  matchedReceiverCount: receivers.length,
  fixedKeyLexicalHits: lexicalHits,
  formerLexicalAnchorsAsConsequences: {
    t: signedWords[t].text,
    w: signedWords[w].text,
  },
  postFreezeMarkerRowHoldout: {
    physicalDifference: rowDifference,
    physicalSum: rowSum,
    mirroredDifference,
    centralInstructionMembership: {
      physicalDifference: centralInstructionMembership(rowDifference),
      physicalSum: centralInstructionMembership(rowSum),
      mirroredDifference: centralInstructionMembership(mirroredDifference),
    },
    riseOrderedDifference: risingRowDifference,
    riseOrderedWords: risingRowDifference.map((value) => signedWords[value].text),
  },
}, null, 2));
