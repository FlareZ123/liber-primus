"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const raw = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {number} value */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} x @param {number} y */
function H(x, y) {
  return [mod29(x - y), mod29(x + y)];
}

/** @param {number[]} values */
function shell5(values) {
  return [...H(values[0], values[4]), ...H(values[1], values[3]), values[2]];
}

/** @param {number[]} shell */
function inverseShell5(shell) {
  const [d0, s0, d1, s1, center] = shell;
  const inverse2 = 15;
  return [
    mod29((d0 + s0) * inverse2),
    mod29((d1 + s1) * inverse2),
    center,
    mod29((s1 - d1) * inverse2),
    mod29((s0 - d0) * inverse2),
  ];
}

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
  for (let index = 0; index < normalized.length; ) {
    if (normalized.startsWith("ING", index)) {
      out.push(21);
      index += 3;
      continue;
    }
    if (normalized.startsWith("IO", index)) {
      out.push(27);
      index += 2;
      continue;
    }
    const token = gpTokens.find((row) => normalized.startsWith(row.symbol, index));
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(index));
    out.push(token.value);
    index += token.symbol.length;
  }
  return out;
}

/**
 * Page-local parser used by the #1784 p39 holdout.
 * @param {string} text
 * @param {number} page
 */
function parsePage(text, page) {
  const words = [];
  const runes = [];
  let current = [];
  let start = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({
      page,
      ordinal: words.length + 1,
      start,
      values: current.slice(),
    });
    current = [];
  };
  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if ((char === "-" || char === ".") && current.length) {
      flush();
    }
  }
  flush();
  return words;
}

const pageParts = raw.split("%");
const pageLocalWords = [];
for (let segment = 0; segment < 55; segment += 1) {
  const page = segment <= 49 ? segment : segment + 1;
  pageLocalWords.push(...parsePage(pageParts[segment], page));
}
const pageLocalFives = pageLocalWords.filter((word) => word.values.length === 5);
assert.equal(pageLocalFives.length, 318);

// Derive the p6 packet atoms directly from the printed title words.
const p6Words = pageLocalWords.filter((word) => word.page === 6);
const p6W1 = p6Words.find((word) => word.start === 71);
const p6W2 = p6Words.find((word) => word.start === 75);
const p6W3 = p6Words.find((word) => word.start === 76);
const p6W4 = p6Words.find((word) => word.start === 80);
assert.deepEqual(p6W1.values, [24, 16, 14, 17]);
assert.deepEqual(p6W2.values, [19]);
assert.deepEqual(p6W3.values, [6, 27, 15, 17]);
assert.deepEqual(p6W4.values, [14, 12]);
const titleLengths = [
  p6W1.values.length,
  p6W2.values.length,
  p6W3.values.length,
  p6W4.values.length,
];
assert.deepEqual(titleLengths, [4, 1, 4, 2]);
const titleH = [...H(titleLengths[0], titleLengths[3]), ...H(titleLengths[1], titleLengths[2])];
assert.deepEqual(titleH, [2, 26, 5, 6]);

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");
const targets = [
  ...new Map(
    clear
      .split(/[^A-Za-z0-9]+/u)
      .filter((value) => /^[A-Za-z]+$/u.test(value))
      .map((word) => ({ word: word.toUpperCase(), values: gp(word) }))
      .filter((row) => row.values.length === 5)
      .map((row) => [row.values.join(","), row])
  ).values(),
];
assert.deepEqual(
  targets.map((row) => row.word),
  ["HELLO", "EMPTY", "SEEKS", "LIBER", "WORDS", "FOUND", "FALSE"]
);
const targetMap = new Map(targets.map((row) => [row.values.join(","), row.word]));

const p39 = pageLocalFives.find((word) => word.page === 39 && word.start === 132);
assert.ok(p39);
assert.deepEqual(p39.values, [19, 7, 10, 17, 23]);
const FALSE = gp("FALSE");
assert.deepEqual(FALSE, [0, 24, 20, 15, 18]);
const requiredKey = p39.values.map((value, index) => mod29(value - FALSE[index]));
assert.deepEqual(requiredKey, [19, 12, 19, 2, 5]);
assert.deepEqual(shell5(requiredKey), [14, 24, 10, 14, 19]);

const W1 = p6W1.values;
const B = p6W2.values[0];
const repeatedSlots = [];
for (let left = 0; left < 4; left += 1) {
  for (let right = left + 1; right < 4; right += 1) {
    repeatedSlots.push([left, right]);
  }
}

/**
 * @param {{page:number,ordinal:number,start:number,values:number[]}[]} fives
 */
function runFamily(fives) {
  let labeledForms = 0;
  let labeledHits = 0;
  const uniqueShells = new Set();
  const uniqueHits = new Map();

  for (let xIndex = 0; xIndex < 4; xIndex += 1) {
    for (let yIndex = 0; yIndex < 4; yIndex += 1) {
      for (let uIndex = 0; uIndex < 4; uIndex += 1) {
        for (let vIndex = 0; vIndex < 4; vIndex += 1) {
          for (const pair of repeatedSlots) {
            for (const order of [0, 1]) {
              for (const sign of [-1, 1]) {
                labeledForms += 1;
                const x = W1[xIndex];
                const y = W1[yIndex];
                const z = mod29(titleH[uIndex] * titleH[vIndex]);
                const shell = [null, null, null, null, B];
                shell[pair[0]] = x;
                shell[pair[1]] = x;
                const remaining = [0, 1, 2, 3].filter((slot) => !pair.includes(slot));
                shell[remaining[0]] = order === 0 ? y : z;
                shell[remaining[1]] = order === 0 ? z : y;
                uniqueShells.add(shell.join(","));

                const key = inverseShell5(shell);
                for (const word of fives) {
                  const plain = word.values.map((value, index) =>
                    mod29(value + sign * key[index])
                  );
                  const target = targetMap.get(plain.join(","));
                  if (!target) continue;
                  labeledHits += 1;
                  const id = [
                    word.page,
                    word.ordinal,
                    word.start,
                    target,
                    sign,
                    shell.join(","),
                  ].join("|");
                  if (!uniqueHits.has(id)) {
                    uniqueHits.set(id, {
                      page: word.page,
                      ordinal: word.ordinal,
                      start: word.start,
                      target,
                      sign,
                      shell,
                      key,
                    });
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return {
    labeledForms,
    uniqueShellCount: uniqueShells.size,
    labeledHits,
    hits: [...uniqueHits.values()],
  };
}

const pageLocal = runFamily(pageLocalFives);
assert.equal(pageLocal.labeledForms, 6144);
assert.equal(pageLocal.uniqueShellCount, 1555);
assert.equal(pageLocal.labeledHits, 2);
assert.deepEqual(pageLocal.hits, [{
  page: 39,
  ordinal: 30,
  start: 132,
  target: "FALSE",
  sign: -1,
  shell: [14, 24, 10, 14, 19],
  key: [19, 12, 19, 2, 5],
}]);

// Stricter parser: preserve page/line wraps inside canonical words and retain
// only words wholly contained on one unknown page.
const segments = raw.split(/^\s*%\s*$/m).slice(0, 55);
const canonicalPages = segments.map((text, segment) => ({
  page: segment >= 50 ? segment + 1 : segment,
  words: [],
  offset: 0,
}));
let current = [];
let startSegment = 0;
let endSegment = 0;
let startOffset = 0;
function flushCanonical() {
  if (!current.length) return;
  if (startSegment === endSegment) {
    const page = canonicalPages[startSegment];
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
      if (!current.length) {
        startSegment = segment;
        startOffset = canonicalPages[segment].offset;
      }
      endSegment = segment;
      current.push(value);
      canonicalPages[segment].offset += 1;
    } else if (char === "/" || /\s/u.test(char)) {
      // Continue through printed wraps.
    } else {
      flushCanonical();
    }
  }
}
flushCanonical();
const canonicalFives = canonicalPages
  .flatMap((page) => page.words)
  .filter((word) => word.values.length === 5);
assert.equal(canonicalFives.length, 311);
const canonical = runFamily(canonicalFives);
assert.equal(canonical.labeledForms, 6144);
assert.equal(canonical.uniqueShellCount, 1555);
assert.equal(canonical.labeledHits, 2);
assert.deepEqual(canonical.hits, pageLocal.hits);

console.log("PASS p6 -> p39 FALSE five-rune family");
console.log(JSON.stringify({
  p6: { W1, B, titleH },
  p39: {
    cipher: p39.values,
    plain: FALSE,
    key: requiredKey,
    shell: shell5(requiredKey),
  },
  pageLocal: {
    fiveRuneWords: pageLocalFives.length,
    ...pageLocal,
  },
  canonical: {
    fiveRuneWords: canonicalFives.length,
    ...canonical,
  },
}, null, 2));
