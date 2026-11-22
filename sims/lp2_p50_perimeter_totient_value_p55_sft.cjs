"use strict";

/**
 * Test phi(n) mod 29 from each nonzero p50 perimeter token as a 75-rune
 * additive GP29 key for the 75-rune p55 body.
 *
 * This is a bounded hypothesis test, not a claimed Cicada mechanism.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} relative */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const dictionaryText = read("resources/control/english_wordfreq_textblob.txt");

const tokens = grid.pages.flatMap((page) => page.tokens);
assert.equal(tokens.length, 256);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);
assert.ok(tokens.every((token) => !token.includes("f")));

const height = 32;
const width = 8;
const perimeterIndices = [];
for (let col = 0; col < width; col += 1) perimeterIndices.push(col);
for (let row = 1; row < height - 1; row += 1) {
  perimeterIndices.push(row * width + (width - 1));
}
for (let col = width - 1; col >= 0; col -= 1) {
  perimeterIndices.push((height - 1) * width + col);
}
for (let row = height - 2; row >= 1; row -= 1) {
  perimeterIndices.push(row * width);
}
assert.equal(perimeterIndices.length, 76);

const perimeter = perimeterIndices.map((flatIndex, perimeterIndex) => ({
  flatIndex,
  perimeterIndex,
  token: tokens[flatIndex],
}));
const zeroCells = perimeter.filter((cell) => cell.token === "00");
assert.deepEqual(zeroCells, [
  { flatIndex: 192, perimeterIndex: 52, token: "00" },
]);
const nonzeroPerimeter = perimeter.filter((cell) => cell.token !== "00");
assert.equal(nonzeroPerimeter.length, 75);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {string} text */
function runeWords(text) {
  const normalized = text.replace(/\/\s*/gu, "");
  return (normalized.match(/[\u16A0-\u16FF]+/gu) || []).map((word) =>
    [...word].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined, "Unknown rune " + rune);
      return value;
    })
  );
}

const parts = transcription.split(/^\s*%\s*$/m);
const p55WordsAll = runeWords(parts[54]);
assert.equal(p55WordsAll.length, 17);
assert.deepEqual(p55WordsAll[0], [21]); // GP29 index 21 is NG.
const p55All = p55WordsAll.flat();
assert.deepEqual(p55All, corpus.pages[55].indices);
assert.equal(p55All.length, 76);

const p55BodyWords = p55WordsAll.slice(1);
const p55Body = p55BodyWords.flat();
const wordLengths = p55BodyWords.map((word) => word.length);
assert.equal(p55BodyWords.length, 16);
assert.equal(p55Body.length, 75);
assert.deepEqual(wordLengths, [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);

const lexicon = new Set(
  dictionaryText
    .split(/\r?\n/u)
    .filter((line) => /^[a-z]+ \d+$/u.test(line))
    .map((line) => line.split(" ")[0])
);
assert.equal(lexicon.size, 29157);

/** @param {string} token @param {string} alphabet */
function decodeToken(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0, "Invalid token " + token);
  return high * alphabet.length + low;
}

/** @param {number} n */
function phi(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let result = n;
  let remaining = n;
  for (let factor = 2; factor * factor <= remaining; factor += 1) {
    if (remaining % factor !== 0) continue;
    while (remaining % factor === 0) remaining /= factor;
    result -= result / factor;
  }
  if (remaining > 1) result -= result / remaining;
  return Math.round(result);
}

/** @param {number} value */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} values */
function splitWords(values) {
  let offset = 0;
  return wordLengths.map((length) => {
    const word = values
      .slice(offset, offset + length)
      .map((value) => corpus.translit[value])
      .join("")
      .toLowerCase();
    offset += length;
    return word;
  });
}

/** @param {string[]} words */
function matches(words) {
  return words.filter(
    (word, index) => wordLengths[index] >= 3 && lexicon.has(word)
  );
}

/** @param {number[]} cipher @param {number[]} key @param {number} sign */
function decryptDirect(cipher, key, sign) {
  assert.equal(cipher.length, key.length);
  return cipher.map((value, index) => mod29(value + sign * key[index]));
}

/**
 * Transparent-plaintext-F branch rule:
 * a ciphertext F may be transparent and consume no key; otherwise decrypt
 * normally, but an encrypted plaintext F is disallowed. Retain every branch.
 *
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} sign
 */
function decryptFTransparent(cipher, key, sign) {
  let states = [{ nextKey: 0, plain: [] }];
  for (const value of cipher) {
    const next = [];
    for (const state of states) {
      if (value === 0) {
        next.push({ nextKey: state.nextKey, plain: [...state.plain, 0] });
      }
      if (state.nextKey < key.length) {
        const plain = mod29(value + sign * key[state.nextKey]);
        if (plain !== 0) {
          next.push({
            nextKey: state.nextKey + 1,
            plain: [...state.plain, plain],
          });
        }
      }
    }
    states = next;
  }
  return states;
}

const results = [];
for (const radix of [60, 59]) {
  const alphabet = radix === 60 ? alphabet60 : alphabet59;
  for (const direction of ["clockwise", "counterclockwise"]) {
    const orderedCells =
      direction === "clockwise"
        ? nonzeroPerimeter
        : nonzeroPerimeter.slice().reverse();
    const key = orderedCells.map(
      (cell) => phi(decodeToken(cell.token, alphabet)) % 29
    );

    for (const sign of [-1, 1]) {
      const direct = decryptDirect(p55Body, key, sign);
      const directWords = splitWords(direct);
      const directMatches = matches(directWords);

      const branches = decryptFTransparent(p55Body, key, sign).map((branch) => {
        const words = splitWords(branch.plain);
        return {
          consumedKey: branch.nextKey,
          words,
          matches: matches(words),
        };
      });
      const bestBranch = branches
        .slice()
        .sort((a, b) => b.matches.length - a.matches.length)[0];

      results.push({
        radix,
        direction,
        sign,
        directWords: directWords.join(" "),
        directMatches,
        fTransparentBranchCount: branches.length,
        fTransparentBestMatches: bestBranch?.matches ?? [],
        fTransparentBestWords: bestBranch?.words.join(" ") ?? null,
        fTransparentBestKeyConsumed: bestBranch?.consumedKey ?? null,
      });
    }
  }
}

assert.equal(results.length, 8);
assert.ok(results.every((result) => result.directMatches.length === 0));
assert.ok(
  results.every((result) => result.fTransparentBestMatches.length === 0)
);

console.log(
  JSON.stringify(
    {
      status:
        "PASS: exact 75-to-75 source mapping reproduced; no candidate yields a lexicon word of at least 3 GP runes",
      table: {
        shape: [height, width],
        perimeterLength: perimeter.length,
        zeroPerimeterCell: zeroCells[0],
        nonzeroTotientKeys: nonzeroPerimeter.length,
        base60Alphabet: alphabet60,
        base59Alphabet: alphabet59,
      },
      receiver: {
        totalRunes: p55All.length,
        carriedWord: "NG",
        bodyRunes: p55Body.length,
        bodyWordCount: p55BodyWords.length,
        bodyWordLengths: wordLengths,
      },
      dictionary: { entries: lexicon.size, minimumMatchedGpRunes: 3 },
      results,
    },
    null,
    2
  )
);
