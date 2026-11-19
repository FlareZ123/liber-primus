"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const out = [];
  for (let index = 0; index < normalized.length;) {
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
    const token = gpTokens.find((row) =>
      normalized.startsWith(row.symbol, index)
    );
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(index));
    out.push(token.value);
    index += token.symbol.length;
  }
  return out;
}

/**
 * Canonical outside-in H serialization used by the local inverse reports:
 * differences outside-in, odd center literal, then sums inside-out.
 * @param {number[]} values
 * @returns {number[]}
 */
function H(values) {
  const differences = [];
  const sums = [];
  let left = 0;
  let right = values.length - 1;
  while (left < right) {
    differences.push(mod29(values[left] - values[right]));
    sums.push(mod29(values[left] + values[right]));
    left += 1;
    right -= 1;
  }
  return [
    ...differences,
    ...(left === right ? [values[left]] : []),
    ...sums.reverse(),
  ];
}

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
      ordinal: page.words.length + 1,
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
      // Printed line/page wraps can continue a word.
    } else {
      flushCanonicalWord();
    }
  }
}
flushCanonicalWord();

const canonicalWords = canonicalPages.flatMap((page) =>
  page.words.map((word) => ({page: page.page, ...word}))
);
const wordsByPage = new Map(
  canonicalPages.map((page) => [page.page, page.words])
);
const pageWords = (page) => wordsByPage.get(page) || [];

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");
const source = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word, index) => ({
    index,
    ordinal: index + 1,
    word: word.toUpperCase(),
    values: gp(word),
  }));
assert.equal(source.length, 43);

const firstIndex = (word) => {
  const row = source.find((candidate) => candidate.word === word);
  assert.ok(row, "missing source word " + word);
  return row.index;
};
const their = source.filter((row) => row.word === "THEIR").map((row) => row.index);
assert.deepEqual(their, [19, 25]);

const state = Object.freeze({
  p: firstIndex("ROAD"),
  g: firstIndex("EPIPHANY"),
  a: their[1] - their[0],
  b: firstIndex("WORDS"),
  A: firstIndex("DEVOTED"),
  B: their[0],
  K: firstIndex("PATH"),
  e: firstIndex("LIES"),
  q: firstIndex("EMPTY"),
});
assert.deepEqual(state, {
  p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3, q: 4,
});

// Existing one-based source-number route:
// source ordinal n -> project page n-1 -> canonical local word n.
const diagonal = source.map((row) => {
  const page = row.ordinal - 1;
  const words = pageWords(page);
  return {
    source: row,
    page,
    wordCount: words.length,
    object: words[row.ordinal - 1] || null,
  };
});
assert.deepEqual(
  diagonal.filter((row) => !row.object).map((row) => [
    row.source.ordinal,
    row.source.word,
    row.page,
    row.wordCount,
  ]),
  [[33, "YOU", 32, 22]]
);

// The p31 object is fixed before any inverse by authenticated ordinal32 AND.
const andRow = diagonal[31];
assert.equal(andRow.source.word, "AND");
assert.equal(andRow.page, 31);
assert.equal(andRow.object.ordinal, 32);
assert.equal(andRow.object.start, 126);
assert.deepEqual(andRow.object.values, [12, 23, 1]);
assert.deepEqual(andRow.source.values, [24, 9, 23]);

const andKey = andRow.object.values.map((value, index) =>
  mod29(value - andRow.source.values[index])
);
assert.deepEqual(andKey, [17, 14, 7]);
assert.deepEqual(H(andKey), [
  mod29(-state.B),
  mod29(-state.b),
  mod29(-state.g),
]);
assert.deepEqual(H(andKey), [10, 14, 24]);

const recoveredAnd = andRow.object.values.map((value, index) =>
  mod29(value - andKey[index])
);
assert.deepEqual(recoveredAnd, gp("AND"));

// Charge the whole length-compatible numbered diagonal. The criterion is only
// that every H(key) coordinate is a signed direct DH-state atom or zero.
const signedAtoms = new Set([0]);
for (const value of Object.values(state)) {
  signedAtoms.add(value);
  signedAtoms.add(mod29(-value));
}

const lengthCompatible = diagonal
  .filter((row) =>
    row.object &&
    row.object.values.length === row.source.values.length
  )
  .map((row) => {
    const key = row.object.values.map((value, index) =>
      mod29(value - row.source.values[index])
    );
    const shell = H(key);
    return {
      index: row.source.index,
      word: row.source.word,
      key,
      shell,
      allSigned: shell.every((value) => signedAtoms.has(value)),
    };
  });

assert.deepEqual(
  lengthCompatible.map((row) => row.index),
  [3, 11, 14, 15, 21, 31, 37]
);
assert.deepEqual(
  lengthCompatible.filter((row) => row.allSigned).map((row) => [
    row.index,
    row.word,
    row.shell,
  ]),
  [
    [11, "IS", [state.K, 0]],
    [31, "AND", [mod29(-state.B), mod29(-state.b), mod29(-state.g)]],
    [37, "LUCK", [state.B, 0, state.K, state.g]],
  ]
);

// Freeze the p31 key, then scan every canonical three-rune word, every distinct
// authenticated three-rune target, and both signs. The only transfer is p33 YOU.
const threeRuneWords = canonicalWords.filter((word) => word.values.length === 3);
const targetMap = new Map();
for (const row of source) {
  if (row.values.length === 3) {
    targetMap.set(row.values.join(","), row);
  }
}
const threeRuneTargets = [...targetMap.values()];
assert.deepEqual(
  threeRuneTargets.map((row) => row.word),
  ["PATH", "WAY", "ITS", "ARE", "MAP", "AND", "YOU"]
);

const fixedKeyHits = [];
for (const word of threeRuneWords) {
  for (const target of threeRuneTargets) {
    for (const sign of [-1, 1]) {
      const output = word.values.map((value, index) =>
        mod29(value + sign * andKey[index])
      );
      if (output.every((value, index) => value === target.values[index])) {
        fixedKeyHits.push({
          page: word.page,
          ordinal: word.ordinal,
          start: word.start,
          target: target.word,
          sign,
          cipher: word.values,
        });
      }
    }
  }
}

assert.equal(threeRuneWords.length, 716);
assert.equal(
  threeRuneWords.length * threeRuneTargets.length * 2,
  10024
);
assert.deepEqual(fixedKeyHits, [
  {
    page: 31,
    ordinal: 32,
    start: 126,
    target: "AND",
    sign: -1,
    cipher: [12, 23, 1],
  },
  {
    page: 33,
    ordinal: 29,
    start: 116,
    target: "YOU",
    sign: -1,
    cipher: [14, 17, 8],
  },
]);

const p33You = fixedKeyHits[1];
const p33YouValues = p33You.cipher.map((value, index) =>
  mod29(value - andKey[index])
);
assert.deepEqual(p33YouValues, gp("YOU"));

// Independently established p33 WILL receiver. The recovered THEIR RISE
// instruction fixes rise a=6, and word29 + a lands exactly on word35 WILL.
const p33Words = pageWords(33);
const p33Will = p33Words.find((word) => word.start === 132);
assert.ok(p33Will);
assert.equal(p33Will.ordinal, 35);
assert.deepEqual(p33Will.values, [3, 15, 17, 22]);

const will = source[33];
assert.equal(will.word, "WILL");
const willKey = p33Will.values.map((value, index) =>
  mod29(value - will.values[index])
);
assert.deepEqual(willKey, [25, 5, 26, 2]);
assert.deepEqual(H(willKey), [state.p, state.A, state.K, mod29(-state.K)]);
assert.equal(p33Will.ordinal - p33You.ordinal, state.a);

console.log("PASS p31 AND -> p33 YOU -> WILL transfer");
console.log(JSON.stringify({
  state,
  p31And: {
    page: andRow.page,
    ordinal: andRow.object.ordinal,
    start: andRow.object.start,
    cipher: andRow.object.values,
    key: andKey,
    keyShell: H(andKey),
    plaintext: "AND",
  },
  diagonalCharge: {
    lengthCompatible: lengthCompatible.map((row) => ({
      index: row.index,
      word: row.word,
      shell: row.shell,
      allSigned: row.allSigned,
    })),
    signedHits: lengthCompatible
      .filter((row) => row.allSigned)
      .map((row) => row.word),
  },
  fixedKeyTransfer: {
    threeRuneWords: threeRuneWords.length,
    targets: threeRuneTargets.map((row) => row.word),
    configurations:
      threeRuneWords.length * threeRuneTargets.length * 2,
    hits: fixedKeyHits,
  },
  p33Rise: {
    youOrdinal: p33You.ordinal,
    willOrdinal: p33Will.ordinal,
    rise: p33Will.ordinal - p33You.ordinal,
    expectedRise: state.a,
  },
}, null, 2));
