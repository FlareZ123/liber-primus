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

/** Frozen outside-in H4 forward. @param {number[]} values @returns {number[]} */
function h4(values) {
  assert.equal(values.length, 4);
  return [
    mod29(values[0] - values[3]),
    mod29(values[1] - values[2]),
    mod29(values[1] + values[2]),
    mod29(values[0] + values[3]),
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

// Second p6-only address coordinate: one-coordinate splices of the
// printed title lengths with one field from H4(title lengths).
const lengthShell = h4(titleLengths);
assert.deepEqual(lengthShell, [2, 26, 5, 6]);
const quotientPatterns = [];
for (let replaceIndex = 0; replaceIndex < titleLengths.length; replaceIndex += 1) {
  for (let hIndex = 0; hIndex < lengthShell.length; hIndex += 1) {
    const quotient = titleLengths.slice();
    quotient[replaceIndex] = lengthShell[hIndex];
    quotientPatterns.push({ replaceIndex, hIndex, quotient });
  }
}
assert.equal(quotientPatterns.length, 16);
assert.equal(new Set(quotientPatterns.map((entry) => entry.quotient.join(","))).size, 16);

/** @param {Array<Array<object>>} arrays @returns {Array<Array<object>>} */
function cartesian(arrays) {
  let out = [[]];
  for (const array of arrays) {
    const next = [];
    for (const prefix of out) {
      for (const value of array) next.push(prefix.concat([value]));
    }
    out = next;
  }
  return out;
}

const joint = [];
for (const residueCandidate of charged) {
  if (!residueCandidate.matches.every((matches) => matches.length > 0)) continue;
  for (const receivers of cartesian(residueCandidate.matches)) {
    const quotients = receivers.map((receiver) => Math.floor(receiver.start / 29));
    for (const quotientCandidate of quotientPatterns) {
      if (quotients.every((value, index) => value === quotientCandidate.quotient[index])) {
        joint.push({ residueCandidate, quotientCandidate, receivers, quotients });
      }
    }
  }
}
assert.equal(charged.length * quotientPatterns.length, 768);
assert.equal(joint.length, 1);

const winner = joint[0];
assert.deepEqual(winner.residueCandidate.shell, [17, 12, 15, 14]);
assert.deepEqual(winner.residueCandidate.residues, [1, 28, 16, 13]);
assert.deepEqual(winner.quotientCandidate, {
  replaceIndex: 0,
  hIndex: 2,
  quotient: [5, 1, 4, 2],
});
const selectedStarts = winner.receivers.map((receiver) => receiver.start);
assert.deepEqual(selectedStarts, [146, 57, 132, 71]);
assert.deepEqual(
  selectedStarts.map((start) => start % 29),
  winner.residueCandidate.residues
);
assert.deepEqual(
  selectedStarts.map((start) => Math.floor(start / 29)),
  winner.quotientCandidate.quotient
);

// Express the winning construction directly:
// reverse(last K runes of W3), reverse(W4), alternating interleave.
assert.deepEqual(
  orientations(W3.slice(W3.length - K))[1],
  [17, 15]
);
assert.deepEqual(orientations(W4)[1], [12, 14]);
assert.deepEqual(winner.residueCandidate.shell, [W3[3], W4[1], W3[2], W4[0]]);

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
    quotientPatterns: quotientPatterns.length,
    jointAddressGrammars: charged.length * quotientPatterns.length,
    jointSurvivors: joint.length,
  },
  winningConstruction: {
    description: "residue shell plus one-coordinate title/H(title) base29 quotient splice",
    shell: winner.residueCandidate.shell,
    predictedStartResidues: winner.residueCandidate.residues,
    predictedStartQuotients: winner.quotientCandidate.quotient,
    quotientSplice: {
      replaceIndex: winner.quotientCandidate.replaceIndex,
      hIndex: winner.quotientCandidate.hIndex,
    },
    sourceLengths: pages.map((page) => source[page].gp.length),
    sourceWords: pages.map((page) => source[page].label),
    candidateStarts: winner.residueCandidate.matches.map((matches) =>
      matches.map((receiver) => receiver.start)
    ),
    selectedStarts,
  },
}, null, 2));
