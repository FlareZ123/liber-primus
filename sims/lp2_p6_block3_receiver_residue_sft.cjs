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

const inv2 = 15;
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signedText = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

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
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/**
 * Frozen outside-in H4 inverse:
 * shell=[x0-x3,x1-x2,x1+x2,x0+x3].
 * @param {number[]} shell
 * @returns {number[]}
 */
function h4Inverse(shell) {
  const [d0, d1, s1, s0] = shell;
  return [
    mod29((d0 + s0) * inv2),
    mod29((d1 + s1) * inv2),
    mod29((s1 - d1) * inv2),
    mod29((s0 - d0) * inv2),
  ];
}

/** @param {number[]} values @returns {number[][]} */
function orientations(values) {
  return [values.slice(), values.slice().reverse()];
}

const clear = signedText.split("-----BEGIN PGP SIGNATURE-----")[0];
const source = clear.slice(clear.indexOf("Hello."))
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((label, index) => ({
    index,
    label: label.toUpperCase(),
    gp: gp(label),
  }));

assert.equal(source.length, 43);
assert.deepEqual(source.slice(37, 41).map((word) => word.label), [
  "LUCK", "BEWARE", "FALSE", "PATHS",
]);

const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const words = [];
let current = [];
let startPage = -1;
let endPage = -1;
let startOffset = -1;

/** Flush one canonical complete printed word. */
function flush() {
  if (!current.length) return;
  words.push({
    page: startPage,
    endPage,
    start: startOffset,
    values: current.slice(),
  });
  current = [];
}

for (let block = 0; block < parts.length; block += 1) {
  const page = block >= 50 ? block + 1 : block;
  let offset = 0;
  for (const char of parts[block]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) {
        startPage = page;
        startOffset = offset;
      }
      endPage = page;
      current.push(value);
      offset += 1;
    } else if (!/[\s/]/u.test(char)) {
      flush();
    }
  }
}
flush();

const canonical = words.filter((word) => word.page === word.endPage);

/** @param {number} page */
function localWords(page) {
  return canonical.filter((word) => word.page === page);
}

// Reconstruct p6 title.
const p6 = localWords(6);
const titleStarts = [71, 75, 76, 80];
const title = titleStarts.map((start) => {
  const word = p6.find((candidate) => candidate.start === start);
  assert.ok(word, "missing p6 title word at " + start);
  return word;
});

const titleLengths = title.map((word) => word.values.length);
assert.deepEqual(titleLengths, [4, 1, 4, 2]);

const q = titleLengths[0];
const K = titleLengths[3];
assert.deepEqual({ q, K }, { q: 4, K: 2 });

const qWords = [title[0].values, title[2].values];
const W3 = title[2].values;
const W4 = title[3].values;
assert.deepEqual(W3, [6, 27, 15, 17]);
assert.deepEqual(W4, [14, 12]);

// Post-discovery finite charge:
// - either q-length title word (2);
// - any contiguous K=2 slice within it (3);
// - either orientation of that slice (2);
// - either W4 orientation (2);
// - either alternating interleave order (2).
const charged = [];
const pages = [37, 38, 39, 40];

for (let qWordIndex = 0; qWordIndex < qWords.length; qWordIndex += 1) {
  const word = qWords[qWordIndex];
  for (let segmentStart = 0; segmentStart <= word.length - K; segmentStart += 1) {
    const segment = word.slice(segmentStart, segmentStart + K);
    for (const A of orientations(segment)) {
      for (const B of orientations(W4)) {
        for (const first of ["A", "B"]) {
          const shell = first === "A"
            ? [A[0], B[0], A[1], B[1]]
            : [B[0], A[0], B[1], A[1]];
          const residues = h4Inverse(shell);

          const matches = pages.map((page, index) => {
            const targetLength = source[page].gp.length;
            return localWords(page)
              .map((receiver, localIndex) => ({
                ordinal: localIndex + 1,
                start: receiver.start,
                residue: receiver.start % 29,
                length: receiver.values.length,
                values: receiver.values,
              }))
              .filter((receiver) =>
                receiver.residue === residues[index] &&
                receiver.length === targetLength
              );
          });

          charged.push({
            qWordIndex,
            segmentStart,
            A,
            B,
            first,
            shell,
            residues,
            matches,
          });
        }
      }
    }
  }
}

assert.equal(charged.length, 48);

const allPages = charged.filter((candidate) =>
  candidate.matches.every((matches) => matches.length > 0)
);
assert.equal(allPages.length, 2);

// P40 address71 is independently established by the p6 address71 route.
// It resolves the remaining residue/length ambiguity.
const withAddress71 = allPages.filter((candidate) =>
  candidate.matches[3].some((receiver) => receiver.start === 71)
);
assert.equal(withAddress71.length, 1);

const winner = withAddress71[0];
assert.deepEqual(winner, {
  qWordIndex: 1,
  segmentStart: 2,
  A: [17, 15],
  B: [12, 14],
  first: "A",
  shell: [17, 12, 15, 14],
  residues: [1, 28, 16, 13],
  matches: [
    [{
      ordinal: 38,
      start: 146,
      residue: 1,
      length: 4,
      values: [3, 2, 6, 27],
    }],
    [{
      ordinal: 12,
      start: 57,
      residue: 28,
      length: 6,
      values: [8, 25, 14, 2, 17, 22],
    }],
    [{
      ordinal: 30,
      start: 132,
      residue: 16,
      length: 5,
      values: [19, 7, 10, 17, 23],
    }],
    [
      {
        ordinal: 4,
        start: 13,
        residue: 13,
        length: 4,
        values: [12, 28, 3, 18],
      },
      {
        ordinal: 17,
        start: 71,
        residue: 13,
        length: 4,
        values: [4, 15, 14, 21],
      },
      {
        ordinal: 52,
        start: 216,
        residue: 13,
        length: 4,
        values: [5, 15, 14, 22],
      },
    ],
  ],
});

// Express the winning construction directly:
// reverse(last K runes of W3), reverse(W4), alternating interleave.
assert.deepEqual(
  orientations(W3.slice(W3.length - K))[1],
  [17, 15]
);
assert.deepEqual(orientations(W4)[1], [12, 14]);
assert.deepEqual(winner.shell, [W3[3], W4[1], W3[2], W4[0]]);

// The selected p37-p39 receivers are unique under residue+source-length.
// P40 is resolved by the independent address71 selector.
const selectedStarts = [
  winner.matches[0][0].start,
  winner.matches[1][0].start,
  winner.matches[2][0].start,
  71,
];
assert.deepEqual(selectedStarts, [146, 57, 132, 71]);

console.log(JSON.stringify({
  status: "PASS",
  p6: {
    titleStarts,
    titleLengths,
    W3,
    W4,
  },
  chargedFamily: {
    configurations: charged.length,
    allFourPagesSupported: allPages.length,
    allFourPlusIndependentP40Address71: withAddress71.length,
  },
  winningConstruction: {
    description: "reverse(last K runes of W3), reverse(W4), interleave A-first, H4^-1",
    shell: winner.shell,
    predictedStartResidues: winner.residues,
    sourceLengths: pages.map((page) => source[page].gp.length),
    sourceWords: pages.map((page) => source[page].label),
    candidateStarts: winner.matches.map((matches) =>
      matches.map((receiver) => receiver.start)
    ),
    selectedStarts,
  },
}, null, 2));
