"use strict";

/**
 * Independent original-input gate for the published November 2026
 * 27x27 LP2 p0-p2 claimed opening "AS I GO THE".
 *
 * Holds all 14 GP rune inputs for the plausible heading-derived source
 * key nodes fixed in 10,000 matched-null texts. Permutes only the
 * remaining 715 original ciphertext positions, preserving exact counts.
 * Evaluates the external frozen opening and the natural 78-way uncertainty
 * in heading-coordinate, three-rune node, center-phi and ray selection.
 *
 * The opening's exact inverse is real arithmetic; identification of its
 * author-selected route is the question under test.
 * Standalone read-only Windows Node.js 22 CommonJS SFT.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source = gp.pages.slice(0, 3).flatMap(p => p.indices);
assert.equal(source.length, 729);
const translit = gp.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);

/** @param {string} passage @returns {number[]} */
function encode(passage) {
  const out = [];
  const words = passage.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C")
    .replace(/Z/g, "S").match(/[A-Z]+/g) || [];
  for (const word of words) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith("ING", i)) {
        out.push(21);
        i += 3;
      } else if (word.startsWith("IO", i)) {
        out.push(27);
        i += 2;
      } else {
        const t = translit.find(x => word.startsWith(x.token, i));
        assert(t, "GP29 word character");
        out.push(t.index);
        i += t.token.length;
      }
    }
  }
  return out;
}
const corpus = [
  ...encode(read("resources/control/shakespeare_first300k.txt")),
  ...encode(read("resources/control/gibran_prophet_58585.txt"))
];
assert.equal(corpus.length, 279598);
const counts = new Int32Array(29 ** 3);
for (let i = 0; i + 3 <= corpus.length; i++) {
  counts[corpus[i] * 841 + corpus[i + 1] * 29 + corpus[i + 2]]++;
}
const logCount = Float64Array.from(counts, v => Math.log(v + 0.15));

/** @param {number} n @returns {number} */
function phi(n) {
  let v = n;
  for (let p = 2; p * p <= n; p++) {
    if (n % p === 0) {
      while (n % p === 0) n /= p;
      v -= v / p;
    }
  }
  if (n > 1) v -= v / n;
  return v;
}

/** @param {number} n @returns {number} */
function mu(n) {
  if (n === 0) return 0;
  let factors = 0;
  for (let p = 2; p * p <= n; p++) {
    if (n % p === 0) {
      n /= p;
      factors++;
      if (n % p === 0) return 0;
      while (n % p === 0) n /= p;
    }
  }
  if (n > 1) factors++;
  return factors % 2 ? -1 : 1;
}
const index = (r, c) => 27 * (r - 1) + c - 1;
const coordinates = [[13, 12], [12, 13]];
const axes = [[0, 1], [1, 0], [1, 1], [1, -1]];
const directions = [
  [-1, -1], [-1, 0], [-1, 1], [0, -1],
  [0, 1], [1, -1], [1, 0], [1, 1]
];

// These fourteen source cells determine every variant's key, phase,
// and source-geometric ray length, so they remain fixed in nulls.
const fixed = new Set();
for (const [r, c] of coordinates) {
  for (const [dr, dc] of axes) {
    fixed.add(index(r - dr, c - dc));
    fixed.add(index(r, c));
    fixed.add(index(r + dr, c + dc));
  }
}
assert.equal(fixed.size, 14);

/**
 * Natural finite neighboring choices under the proposed 13/phi(13) clue.
 * Deduplicate identical source positions and effective key rotations.
 * @param {number[]} data
 * @returns {{start:number,key:number[]}[]}
 */
function openingVariants(data) {
  const seen = new Set();
  const out = [];
  for (const [r, c] of coordinates) {
    for (const [dr, dc] of axes) {
      const node = [[r - dr, c - dc], [r, c], [r + dr, c + dc]];
      const [a, b, z] = node.map(([row, col]) => data[index(row, col)]);
      const distance = phi(b) + phi(phi(b));
      for (const transform of [false, true]) {
        const raw = [a, transform ? phi(b) : b, z];
        for (const alignment of ["none", "mobius"]) {
          const phase = alignment === "none" ? 0 :
            (raw.reduce((sum, k) => sum + mu(phi(k)), 0) % 3 + 3) % 3;
          const key = raw.map((_, i) => raw[(i + phase) % 3]);
          for (const [or, oc] of node) {
            for (const [sr, sc] of directions) {
              const row = or + distance * sr;
              const col = oc + distance * sc;
              if (row < 1 || row > 27 || col < 1 || col > 27) continue;
              const start = index(row, col);
              if (start > 722) continue;
              const label = [start, ...key].join(",");
              if (seen.has(label)) continue;
              seen.add(label);
              out.push({start, key});
            }
          }
        }
      }
    }
  }
  return out;
}

/**
 * Unnormalized native GP-English trigram score per trigram.
 * @param {number[]} tape
 * @param {number} start
 * @param {number[]} key
 */
function score(tape, start, key) {
  const p = Array.from({length: 7}, (_, i) =>
    (tape[start + i] - key[i % 3] + 29) % 29);
  let total = 0;
  for (let i = 0; i < 5; i++) {
    total += logCount[p[i] * 841 + p[i + 1] * 29 + p[i + 2]];
  }
  return total / 5;
}
const start = index(13, 25);
const sourceNode = [
  source[index(13, 11)], source[index(13, 12)], source[index(13, 13)]
];
const key = [sourceNode[0], phi(sourceNode[1]), sourceNode[2]];
assert.deepEqual(sourceNode, [25, 11, 28]);
assert.deepEqual(key, [25, 10, 28]);
assert.equal(mu(phi(key[0])) + mu(phi(key[1])) + mu(phi(key[2])), 0);
const claimed = encode("AS I GO THE");
assert.deepEqual(claimed, [24, 15, 10, 6, 3, 2, 18]);
assert.deepEqual(
  source.slice(start, start + 7).map((c, i) => (c - key[i % 3] + 29) % 29),
  claimed
);
const fixedScore = score(source, start, key);
assert.equal(fixedScore, 3.9610429643684086);
const variants = openingVariants(source);
assert.equal(variants.length, 78);
assert(variants.some(v => v.start === start && v.key.every((k, i) => k === key[i])));
const originalHigher = variants.filter(v => score(source, v.start, v.key) > fixedScore);
assert.equal(originalHigher.length, 0);

// Genuine positive: the stated decoder is reversible for a planted first
// block under the frozen key and source positions.
const planted = source.slice();
claimed.forEach((p, i) => { planted[start + i] = (p + key[i % 3]) % 29; });
assert.deepEqual(planted.slice(start, start + 7), source.slice(start, start + 7));
assert.deepEqual(
  planted.slice(start, start + 7).map((c, i) => (c - key[i % 3] + 29) % 29),
  claimed
);

// Matched finite null: both coordinate candidates, their eight neighboring
// cells, source key values and 729-rune unigram histogram stay fixed. The
// exact same 78 candidate locations and keys are tested in each shuffled
// tape, so selection freedom is controlled, rather than ignored.
let state = 0x33011914;
function random32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const moving = Array.from({length: source.length}, (_, i) => i)
  .filter(i => !fixed.has(i));
assert.equal(moving.length, 715);
let atLeast = 0;
let sumOfBest = 0;
let maxOfBest = -Infinity;
for (let trial = 0; trial < 10000; trial++) {
  const y = source.slice();
  for (let i = moving.length - 1; i > 0; i--) {
    const j = random32() % (i + 1);
    [y[moving[i]], y[moving[j]]] = [y[moving[j]], y[moving[i]]];
  }
  let best = -Infinity;
  for (const v of variants) best = Math.max(best, score(y, v.start, v.key));
  sumOfBest += best;
  maxOfBest = Math.max(maxOfBest, best);
  if (best >= fixedScore) atLeast++;
}
assert.equal(atLeast, 2236);
console.log(JSON.stringify({
  externalClaim: "AS I GO THE",
  originalRuneSpan: 729,
  originalCiphertextIndices: source.slice(start, start + 7),
  originalNode: sourceNode,
  alignedKey: key,
  originalPlaintextRunes: claimed,
  naturalClueVariants: variants.length,
  originalSelectedSevenRuneMeanLogTrigramCount: fixedScore,
  originalSelectedScoreRank: originalHigher.length + 1,
  nullFrozenSourceNodes: fixed.size,
  nullShuffledRemainingPositions: moving.length,
  nullTrials: 10000,
  nullAnyAlternativeAtLeastClaimed: atLeast,
  nullAnyAlternativeProportion: atLeast / 10000,
  nullMeanBestScore: sumOfBest / 10000,
  nullMaxBestScore: maxOfBest,
  verdict: "Exact arithmetic recovers one seven-rune phrase; source selects no unique route and no complete original plaintext. Exploratory route has 22.36% matched-null support."
}, null, 2));
