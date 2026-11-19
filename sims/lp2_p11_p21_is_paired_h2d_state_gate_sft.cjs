"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);
const parts = transcription.split(/^\s*%\s*$/m);

/** @param {number} value */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} page */
function pageRaw(page) {
  if (page === 50) return "";
  return parts[page < 50 ? page : page - 1] || "";
}

/** @param {number} page */
function parseWords(page) {
  const words = [];
  let values = [];
  let offset = 0;
  let start = 0;

  const flush = () => {
    if (!values.length) return;
    words.push({
      page,
      index: words.length,
      start,
      end: offset - 1,
      length: values.length,
      gp0: values.reduce((sum, value) => sum + value, 0),
      values: values.slice(),
    });
    values = [];
  };

  for (const character of pageRaw(page)) {
    if (runeIndex.has(character)) {
      if (!values.length) start = offset;
      values.push(runeIndex.get(character));
      offset += 1;
    } else if (character === "/" || /\s/u.test(character)) {
      // Printed line wraps do not terminate a printed word.
    } else {
      flush();
    }
  }
  flush();
  return { words, runeCount: offset };
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

  const values = [];
  for (let index = 0; index < normalized.length;) {
    if (normalized.startsWith("ING", index)) {
      values.push(21);
      index += 3;
      continue;
    }
    if (normalized.startsWith("IO", index)) {
      values.push(27);
      index += 2;
      continue;
    }
    const token = gpTokens.find((row) => normalized.startsWith(row.symbol, index));
    assert.ok(token, `Unmapped GP text at ${normalized.slice(index)}`);
    values.push(token.value);
    index += token.symbol.length;
  }
  return values;
}

function signedWords() {
  const clear = signed2016
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, "")
    .replace(/\b3301\b/g, "")
    .replace(/\b[0-9A-F]{8,}\b/g, "");

  return (clear.match(/[A-Za-z]+/g) || []).map((word, index) => {
    const values = gp(word);
    return {
      index,
      word: word.toUpperCase(),
      values,
      gp0: values.reduce((sum, value) => sum + value, 0),
    };
  });
}

/** @param {number[]} row */
function H2(row) {
  assert.equal(row.length, 2);
  return [mod29(row[0] - row[1]), mod29(row[0] + row[1])];
}

/** @param {number} difference @param {number} sum */
function H2inv(difference, sum) {
  const inverseTwo = 15;
  return [
    mod29((difference + sum) * inverseTwo),
    mod29((sum - difference) * inverseTwo),
  ];
}

/** Rows first, then columns. @param {number[][]} matrix */
function H2D(matrix) {
  assert.equal(matrix.length, 2);
  const upper = H2(matrix[0]);
  const lower = H2(matrix[1]);
  return [
    [mod29(upper[0] - lower[0]), mod29(upper[1] - lower[1])],
    [mod29(upper[0] + lower[0]), mod29(upper[1] + lower[1])],
  ];
}

/** Inverse of H2D. @param {number[][]} matrix */
function H2Dinv(matrix) {
  assert.equal(matrix.length, 2);
  const differences = H2inv(matrix[0][0], matrix[1][0]);
  const sums = H2inv(matrix[0][1], matrix[1][1]);
  return [
    H2inv(differences[0], sums[0]),
    H2inv(differences[1], sums[1]),
  ];
}

const source = signedWords();
assert.equal(source.length, 43);
assert.equal(source[11].word, "IS");
assert.equal(source[12].word, "THE");
assert.equal(source[21].word, "IS");
assert.equal(source[22].word, "THE");
assert.deepEqual(source[11].values, [10, 15]);
assert.equal(source[11].gp0, 25);

// Charge every authenticated same-GP0 source pair. Only IS/IS has one
// same-index state receiver on each corresponding physical page.
const gp0Pairs = [];
for (let left = 0; left < source.length; left += 1) {
  for (let right = left + 1; right < source.length; right += 1) {
    if (source[left].gp0 !== source[right].gp0) continue;
    const leftMatches = parseWords(left).words.filter(
      (word) =>
        word.length === source[left].values.length &&
        word.gp0 === source[left].gp0
    );
    const rightMatches = parseWords(right).words.filter(
      (word) =>
        word.length === source[right].values.length &&
        word.gp0 === source[right].gp0
    );
    gp0Pairs.push({
      left,
      right,
      leftWord: source[left].word,
      rightWord: source[right].word,
      gp0: source[left].gp0,
      leftMatches,
      rightMatches,
    });
  }
}
assert.equal(gp0Pairs.length, 29);
const jointlyUnique = gp0Pairs.filter(
  (row) => row.leftMatches.length === 1 && row.rightMatches.length === 1
);
assert.equal(jointlyUnique.length, 1);
assert.equal(jointlyUnique[0].left, 11);
assert.equal(jointlyUnique[0].right, 21);
assert.equal(jointlyUnique[0].leftWord, "IS");
assert.equal(jointlyUnique[0].rightWord, "IS");

const p11 = parseWords(11);
const p21 = parseWords(21);
const r11 = jointlyUnique[0].leftMatches[0];
const r21 = jointlyUnique[0].rightMatches[0];
assert.deepEqual(
  { index: r11.index, start: r11.start, end: r11.end, values: r11.values },
  { index: 11, start: 49, end: 50, values: [11, 14] }
);
assert.deepEqual(
  { index: r21.index, start: r21.start, end: r21.end, values: r21.values },
  { index: 33, start: 170, end: 171, values: [24, 1] }
);

// The two source-selected pages also share a full-page rune/word signature.
assert.equal(p11.runeCount, 273);
assert.equal(p21.runeCount, 273);
assert.equal(p11.words.length, 55);
assert.equal(p21.words.length, 55);

const signatureGroups = new Map();
for (let page = 0; page <= 42; page += 1) {
  const parsed = parseWords(page);
  const key = `${parsed.runeCount}/${parsed.words.length}`;
  if (!signatureGroups.has(key)) signatureGroups.set(key, []);
  signatureGroups.get(key).push(page);
}
const duplicateSignatures = [...signatureGroups.entries()]
  .filter(([, pages]) => pages.length > 1)
  .map(([signature, pages]) => ({ signature, pages }));
assert.deepEqual(duplicateSignatures, [
  { signature: "261/61", pages: [4, 34] },
  { signature: "273/55", pages: [11, 21] },
]);

// Complete common-source-length collision-receiver census.
// For every equal-GP0 source pair, only source lengths are admissible.
// Exactly two pair/length cases have one matching receiver on each page.
const commonLengthCollisionReceivers = [];
for (const row of gp0Pairs) {
  const sourceLengths = [...new Set([
    source[row.left].values.length,
    source[row.right].values.length,
  ])];
  for (const length of sourceLengths) {
    const leftMatches = parseWords(row.left).words.filter(
      (word) => word.length === length && word.gp0 === row.gp0
    );
    const rightMatches = parseWords(row.right).words.filter(
      (word) => word.length === length && word.gp0 === row.gp0
    );
    if (leftMatches.length === 1 && rightMatches.length === 1) {
      commonLengthCollisionReceivers.push({
        left: row.left,
        right: row.right,
        leftWord: row.leftWord,
        rightWord: row.rightWord,
        gp0: row.gp0,
        length,
        leftReceiver: leftMatches[0],
        rightReceiver: rightMatches[0],
      });
    }
  }
}
assert.deepEqual(
  commonLengthCollisionReceivers.map((row) => ({
    left: row.left,
    right: row.right,
    words: [row.leftWord, row.rightWord],
    gp0: row.gp0,
    length: row.length,
    leftIndex: row.leftReceiver.index,
    rightIndex: row.rightReceiver.index,
  })),
  [
    {
      left: 11,
      right: 21,
      words: ["IS", "IS"],
      gp0: 25,
      length: 2,
      leftIndex: 11,
      rightIndex: 33,
    },
    {
      left: 13,
      right: 33,
      words: ["WAY", "WILL"],
      gp0: 57,
      length: 4,
      leftIndex: 39,
      rightIndex: 34,
    },
  ]
);

// WAY/WILL has source lengths 3/4. Only length4 survives on both pages,
// so the source collision itself selects WILL rather than WAY.
assert.equal(source[13].word, "WAY");
assert.equal(source[13].values.length, 3);
assert.equal(source[33].word, "WILL");
assert.equal(source[33].values.length, 4);
assert.equal(source[13].gp0, 57);
assert.equal(source[33].gp0, 57);
for (const page of [13, 33]) {
  assert.equal(
    parseWords(page).words.filter((word) => word.length === 3 && word.gp0 === 57).length,
    0
  );
  assert.equal(
    parseWords(page).words.filter((word) => word.length === 4 && word.gp0 === 57).length,
    1
  );
}

const wayWill = commonLengthCollisionReceivers.find(
  (row) => row.left === 13 && row.right === 33 && row.length === 4
);
assert.ok(wayWill);
assert.deepEqual(
  {
    index: wayWill.leftReceiver.index,
    start: wayWill.leftReceiver.start,
    end: wayWill.leftReceiver.end,
    values: wayWill.leftReceiver.values,
  },
  { index: 39, start: 154, end: 157, values: [15, 27, 12, 3] }
);
assert.deepEqual(
  {
    index: wayWill.rightReceiver.index,
    start: wayWill.rightReceiver.start,
    end: wayWill.rightReceiver.end,
    values: wayWill.rightReceiver.values,
  },
  { index: 34, start: 132, end: 135, values: [3, 15, 17, 22] }
);

// Receiver word numbers are themselves authenticated source directions.
assert.equal(source[wayWill.leftReceiver.index].word, "FALSE");
assert.equal(source[wayWill.rightReceiver.index].word, "BE");
assert.equal(wayWill.rightReceiver.index, source[33].index + 1);
assert.equal(source[34].word, "BE");
assert.equal(source[39].word, "FALSE");

// The original selected ciphertext block.
const cipher = [r11.values, r21.values];
assert.deepEqual(cipher, [[11, 14], [24, 1]]);
const cipherH2D = H2D(cipher);
assert.deepEqual(cipherH2D, [[3, 0], [20, 21]]);

// Independently reconstructed state.
const state = {
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
  e: 3,
  q: 4,
};
assert.equal(mod29(state.a - state.g), 1);
assert.equal(mod29(state.p - state.K), 21);

// Source positions of repeated IS independently recover e under H.
assert.deepEqual(H2([11, 21]), [state.B, state.e]);

// P28 literal-DH line: physical line6 has p=23 runes and DH[p]=20.
const p28Lines = pageRaw(28)
  .split("/")
  .map((line) => [...line].filter((rune) => runeIndex.has(rune)).map((rune) => runeIndex.get(rune)))
  .filter((line) => line.length);
const dhLine = p28Lines[5];
assert.equal(dhLine.length, state.p);
assert.deepEqual(dhLine.slice(0, 2), [23, 8]); // literal D,H
assert.equal(dhLine[state.p - 1], 20);
const dhAtP = dhLine[state.p - 1];

assert.deepEqual(cipherH2D, [
  [state.e, 0],
  [dhAtP, mod29(state.p - state.K)],
]);

// Source-derived paired key shell.
const shell = [
  [state.e, 0],
  [mod29(state.a - state.g), 0],
];
assert.deepEqual(shell, [[3, 0], [1, 0]]);
const keys = H2Dinv(shell);
assert.deepEqual(keys, [[1, 28], [14, 15]]);
assert.deepEqual(H2D(keys), shell);

const plaintextRows = cipher.map((row, rowIndex) =>
  row.map((value, column) => mod29(value - keys[rowIndex][column]))
);
assert.deepEqual(plaintextRows, [source[11].values, source[21].values]);
assert.deepEqual(plaintextRows, [[10, 15], [10, 15]]);

// Source-derived positive scalar family.
const scalarSet = [
  state.p,
  state.g,
  state.a,
  state.b,
  state.A,
  state.B,
  state.K,
  state.e,
  state.q,
  mod29(state.K * state.a),
  mod29(state.K * state.g),
  mod29(state.a - state.g),
];
assert.equal(new Set(scalarSet).size, scalarSet.length);
const twoRuneTargets = [];
for (const row of source) {
  if (row.values.length !== 2) continue;
  if (!twoRuneTargets.some((target) =>
    target.values.every((value, index) => value === row.values[index])
  )) {
    twoRuneTargets.push(row);
  }
}
assert.deepEqual(twoRuneTargets.map((row) => row.word), ["THE", "IS", "BE"]);

const scalarFamilyHits = [];
let scalarFamilyConfigurations = 0;
for (const x of scalarSet) {
  for (const y of scalarSet) {
    for (const sign of [-1, 1]) {
      scalarFamilyConfigurations += 1;
      const candidateKeys = H2Dinv([[x, 0], [y, 0]]);
      const output = cipher.map((row, rowIndex) =>
        row.map((value, column) =>
          mod29(value + sign * candidateKeys[rowIndex][column])
        )
      );
      for (const target of twoRuneTargets) {
        if (
          output[0].every((value, index) => value === target.values[index]) &&
          output[1].every((value, index) => value === target.values[index])
        ) {
          scalarFamilyHits.push({ x, y, sign, target: target.word, candidateKeys });
        }
      }
    }
  }
}
assert.equal(scalarFamilyConfigurations, 288);
assert.deepEqual(scalarFamilyHits, [{
  x: state.e,
  y: mod29(state.a - state.g),
  sign: -1,
  target: "IS",
  candidateKeys: [[1, 28], [14, 15]],
}]);

// Fully widened residue family leaves only the exact sign pair and its negation.
const residueHits = [];
for (let x = 0; x < 29; x += 1) {
  for (let y = 0; y < 29; y += 1) {
    for (const sign of [-1, 1]) {
      const candidateKeys = H2Dinv([[x, 0], [y, 0]]);
      const output = cipher.map((row, rowIndex) =>
        row.map((value, column) =>
          mod29(value + sign * candidateKeys[rowIndex][column])
        )
      );
      for (const target of twoRuneTargets) {
        if (
          output[0].every((value, index) => value === target.values[index]) &&
          output[1].every((value, index) => value === target.values[index])
        ) {
          residueHits.push({ x, y, sign, target: target.word });
        }
      }
    }
  }
}
assert.deepEqual(residueHits, [
  { x: 3, y: 1, sign: -1, target: "IS" },
  { x: 26, y: 28, sign: 1, target: "IS" },
]);

// Manuscript-wide target-state control: among all GP0=25 two-rune word pairs,
// exactly p11/p21 needs the source-derived first-column shell [e,a-g] for IS.
const gp025Words = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  gp025Words.push(
    ...parseWords(page).words.filter((word) => word.length === 2 && word.gp0 === 25)
  );
}
assert.equal(gp025Words.length, 14);
const exactPairHits = [];
let gp025PairCount = 0;
for (let left = 0; left < gp025Words.length; left += 1) {
  for (let right = left + 1; right < gp025Words.length; right += 1) {
    gp025PairCount += 1;
    const pair = [gp025Words[left], gp025Words[right]];
    const target = source[11].values;
    const pairKeys = pair.map((word) =>
      word.values.map((value, index) => mod29(value - target[index]))
    );
    const pairShell = H2D(pairKeys);
    if (
      pairShell[0][0] === state.e &&
      pairShell[1][0] === mod29(state.a - state.g) &&
      pairShell[0][1] === 0 &&
      pairShell[1][1] === 0
    ) {
      exactPairHits.push({
        left: { page: pair[0].page, start: pair[0].start },
        right: { page: pair[1].page, start: pair[1].start },
        shell: pairShell,
      });
    }
  }
}
assert.equal(gp025PairCount, 91);
assert.deepEqual(exactPairHits, [{
  left: { page: 11, start: 49 },
  right: { page: 21, start: 170 },
  shell: [[3, 0], [1, 0]],
}]);

// Prospective holdout from commit 66dfbe7c9e8e72c152e2326ec99c7deb1185b4a0.
// Both authenticated IS occurrences are followed by THE, but the immediately
// following manuscript words fail the frozen two-rune length gate.
const successor11 = p11.words[r11.index + 1];
const successor21 = p21.words[r21.index + 1];
assert.deepEqual(
  { start: successor11.start, end: successor11.end, length: successor11.length, values: successor11.values },
  { start: 51, end: 53, length: 3, values: [8, 2, 14] }
);
assert.deepEqual(
  { start: successor21.start, end: successor21.end, length: successor21.length, values: successor21.values },
  { start: 172, end: 179, length: 8, values: [23, 8, 5, 7, 20, 27, 23, 12] }
);
assert.notEqual(successor11.length, source[12].values.length);
assert.notEqual(successor21.length, source[22].values.length);

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "source-selected p11/p21 IS paired H2D state packet; joint shell retrospective; frozen THE successor transfer fails",
  collisionBranchSelector: {
    commonLengthCases: commonLengthCollisionReceivers.map((row) => ({
      sourceIndices: [row.left, row.right],
      sourceWords: [row.leftWord, row.rightWord],
      gp0: row.gp0,
      length: row.length,
      receiverWordIndices: [row.leftReceiver.index, row.rightReceiver.index],
      receiverMappedWords: [
        source[row.leftReceiver.index]?.word || null,
        source[row.rightReceiver.index]?.word || null,
      ],
    })),
    wayWillDecision: {
      selectedTargetByCommonLength: "WILL",
      falseBranch: { page: 13, receiverWordIndex: 39, mapsTo: "FALSE" },
      continuationBranch: { page: 33, receiverWordIndex: 34, mapsTo: "BE" },
    },
  },
  sourcePair: {
    indices: [11, 21],
    word: "IS",
    successorIndices: [12, 22],
    successorWord: "THE",
    gp0CollisionPairs: gp0Pairs.length,
    jointlyUniquePairs: jointlyUnique.map((row) => ({
      left: row.left,
      right: row.right,
      word: row.leftWord,
    })),
  },
  pages: {
    p11: { runes: p11.runeCount, words: p11.words.length, receiver: r11 },
    p21: { runes: p21.runeCount, words: p21.words.length, receiver: r21 },
    duplicateSignatures,
  },
  ciphertextH2D: cipherH2D,
  stateInterpretation: {
    e: state.e,
    dhAtP,
    pMinusK: mod29(state.p - state.K),
  },
  jointKey: {
    shell,
    keys,
    plaintextRows,
  },
  controls: {
    scalarFamilyConfigurations,
    scalarFamilyHits,
    residueConfigurations: 29 * 29 * 2,
    residueHits,
    gp025Words: gp025Words.length,
    gp025Pairs: gp025PairCount,
    exactPairHits,
  },
  holdout: {
    precommit: "66dfbe7c9e8e72c152e2326ec99c7deb1185b4a0",
    p11Successor: successor11,
    p21Successor: successor21,
    result: "FAIL at the frozen two-rune length gate on both pages",
  },
}, null, 2));
