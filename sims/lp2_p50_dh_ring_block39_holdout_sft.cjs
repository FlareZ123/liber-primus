"use strict";

/**
 * SFT: prospective block39 holdout for the shared2 DH-ring vector.
 *
 * The COLD bridge uses the fixed shared2 circumference turn sequence
 * DOWN6 / LEFT3 / UP6. Freeze that vector and apply it to the published
 * block38 source center before looking at block39 plaintext. The external
 * Reports 00-16 independently forecast a horizontal, even/even, even-radius
 * source node with Möbius signature [0,+1,0] and phase1.
 *
 * This test asks whether the most direct vector propagation supplies a valid
 * block39 key and then whether either source-node orientation yields a
 * complete word under the already pinned Shakespeare gate or a complete
 * frequent-word segmentation under the already pinned Shakespeare+Gibran
 * gate.
 *
 * Run:
 *   node sims/lp2_p50_dh_ring_block39_holdout_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const external = require("./lp2_external27x27_nextstep_gate.cjs");

const ROOT = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8").replace(/\r\n/g, "\n");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const shakespeare = read("resources/control/shakespeare_first300k.txt");
const gibran = read("resources/control/gibran_prophet_58585.txt");
const grid = corpus.pages.filter((page) => page.page <= 2).flatMap((page) => page.indices);
const translit = corpus.translit;

assert.equal(grid.length, 729);

/** @param {number} n @returns {number} */
function phi(n) {
  assert(Number.isInteger(n) && n > 0);
  let value = n;
  let rest = n;
  for (let p = 2; p * p <= rest; p += 1) {
    if (rest % p !== 0) continue;
    while (rest % p === 0) rest /= p;
    value -= value / p;
  }
  if (rest > 1) value -= value / rest;
  return value;
}

/** @param {number} n @returns {-1|0|1} */
function mu(n) {
  assert(Number.isInteger(n) && n > 0);
  let result = 1;
  let rest = n;
  for (let p = 2; p * p <= rest; p += 1) {
    if (rest % p !== 0) continue;
    rest /= p;
    result = -result;
    if (rest % p === 0) return 0;
    while (rest % p === 0) rest /= p;
  }
  return rest > 1 ? -result : result;
}

/** @param {number} a @param {number} b @returns {number} */
function gcd(a, b) {
  let x = a;
  let y = b;
  while (y) [x, y] = [y, x % y];
  return x;
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return (value % 29 + 29) % 29;
}

/** @param {[number,number]} coordinate @returns {number} */
function n0(coordinate) {
  return 27 * (coordinate[0] - 1) + coordinate[1];
}

/** @param {[number,number]} coordinate @returns {number} */
function n1(coordinate) {
  return 27 * (coordinate[1] - 1) + 28 - coordinate[0];
}

/** @param {[number,number]} coordinate @returns {number} */
function n2(coordinate) {
  return 730 - n0(coordinate);
}

/** @param {[number,number]} coordinate @returns {number} */
function n3(coordinate) {
  return 730 - n1(coordinate);
}

/** @param {[number,number]} coordinate @returns {number} */
function glyph(coordinate) {
  return grid[n0(coordinate) - 1];
}

// Re-derive the shared2 p50 short-arc segment vector.
const tableRows = table.pages.reduce((sum, page) => sum + page.rows, 0);
const tableColumns = table.pages[0].cols;
assert.equal(tableRows, 32);
assert.equal(tableColumns, 8);

/** @param {number} depth @returns {number[]} */
function circumference(depth) {
  const top = depth;
  const left = depth;
  const bottom = tableRows - 1 - depth;
  const right = tableColumns - 1 - depth;
  const out = [];
  for (let column = left; column <= right; column += 1) {
    out.push(top * tableColumns + column);
  }
  for (let row = top + 1; row <= bottom; row += 1) {
    out.push(row * tableColumns + right);
  }
  for (let column = right - 1; column >= left; column -= 1) {
    out.push(bottom * tableColumns + column);
  }
  for (let row = bottom - 1; row > top; row -= 1) {
    out.push(row * tableColumns + left);
  }
  return out;
}

const ring = circumference(2);
assert.equal(ring.length, 60);

/** @param {number} index @returns {[number,number]} */
function tableCoordinate(index) {
  return [Math.floor(index / tableColumns), index % tableColumns];
}

/** @param {number} from @param {number} to @returns {string} */
function direction(from, to) {
  const [r0, c0] = tableCoordinate(from);
  const [r1, c1] = tableCoordinate(to);
  const key = `${r1 - r0},${c1 - c0}`;
  const names = new Map([
    ["-1,0", "up"],
    ["1,0", "down"],
    ["0,-1", "left"],
    ["0,1", "right"],
  ]);
  const result = names.get(key);
  assert(result);
  return result;
}

/** @param {number} start @param {number} end @param {1|-1} step @returns {number[]} */
function arc(start, end, step) {
  const out = [start];
  let position = ring.indexOf(start);
  const target = ring.indexOf(end);
  assert(position >= 0 && target >= 0);
  while (position !== target) {
    position = (position + step + ring.length) % ring.length;
    out.push(ring[position]);
  }
  return out;
}

/** @param {number[]} pathValues @returns {{direction:string,length:number}[]} */
function compress(pathValues) {
  const out = [];
  for (let i = 1; i < pathValues.length; i += 1) {
    const name = direction(pathValues[i - 1], pathValues[i]);
    const previous = out.at(-1);
    if (previous && previous.direction === name) previous.length += 1;
    else out.push({direction: name, length: 1});
  }
  return out;
}

const a = arc(189, 186, 1);
const b = arc(189, 186, -1);
const shortArc = a.length < b.length ? a : b;
const vector = compress(shortArc);
assert.deepEqual(vector, [
  {direction: "down", length: 6},
  {direction: "left", length: 3},
  {direction: "up", length: 6},
]);

// Freeze the vector before reading any block39 output.
const movement = new Map([
  ["up", [-1, 0]],
  ["down", [1, 0]],
  ["left", [0, -1]],
  ["right", [0, 1]],
]);
let predictedCenter = [12, 13]; // published block38 source center
for (const segment of vector) {
  const delta = movement.get(segment.direction);
  predictedCenter = [
    predictedCenter[0] + delta[0] * segment.length,
    predictedCenter[1] + delta[1] * segment.length,
  ];
}
assert.deepEqual(predictedCenter, [12, 10]);

const evenLengths = [...new Set(vector.map((segment) => segment.length))]
  .filter((length) => length % 2 === 0);
assert.deepEqual(evenLengths, [6]);
const predictedRadius = evenLengths[0];

const rule = external.forecast();
assert.deepEqual(rule.signature, [0, 1, 0]);
assert.equal(rule.phase, 1);
assert.equal(rule.sourceAxis, 0); // horizontal
assert.deepEqual(rule.sourceCenterParity, [0, 0]);
assert.equal(rule.radiusParity, 0);
assert.equal(predictedCenter[0] % 2, 0);
assert.equal(predictedCenter[1] % 2, 0);
assert.equal(predictedRadius % 2, 0);

const nodeCoordinates = [
  [predictedCenter[0], predictedCenter[1] - predictedRadius],
  predictedCenter,
  [predictedCenter[0], predictedCenter[1] + predictedRadius],
];
const rawNode = nodeCoordinates.map(glyph);
assert.deepEqual(rawNode.map((value) => translit[value]), ["L", "OE", "H"]);
assert.notEqual(rawNode[0], rawNode[2]);

// Evaluate only the four variants already admitted by the external source-node
// rule. The prospective signature itself selects the untransformed pair.
const nodeVariants = [];
for (const transformed of [false, true]) {
  for (const reverse of [false, true]) {
    const initial = reverse ? [rawNode[2], rawNode[1], rawNode[0]] : rawNode.slice();
    const key = initial.slice();
    if (transformed) key[1] = phi(key[1]);
    const signature = key.map((value) => mu(phi(value)));
    const aligned = key.slice(rule.phase).concat(key.slice(0, rule.phase));
    nodeVariants.push({transformed, reverse, initial, key, signature, aligned});
  }
}

const signatureHits = nodeVariants.filter((variant) =>
  variant.signature.every((value, index) => value === rule.signature[index])
);
assert.equal(signatureHits.length, 2);
assert(signatureHits.every((variant) => !variant.transformed));
assert.deepEqual(
  signatureHits.map((variant) => variant.aligned.map((value) => translit[value])),
  [["OE", "H", "L"], ["OE", "L", "H"]]
);

// Use the pre-existing frozen ciphertext-path generator. No path is chosen by
// output; every legal path is tested under each predicted key orientation.
const paths = external.ciphertextCandidates(rule);
assert.equal(paths.length, 132);
const shakespeareDictionary = external.englishDictionary();
assert(shakespeareDictionary.has(external.encodeWord("HOW").join(",")));

/** @param {{center:number[],aligned:number[]}} variant @param {object} span */
function decrypt(variant, span) {
  return span.values.map((cipher, index) =>
    mod29(cipher - variant.aligned[index % variant.aligned.length])
  );
}

/** @param {number[]} center @param {object} span @returns {boolean} */
function passesGcd(center, span) {
  const M = center;
  const B = span.B;
  const E = span.E;
  return [
    gcd(n0(M), n0(B)),
    gcd(n0(M), n0(B)),
    gcd(n1(M), n3(E)),
    gcd(n0(M), n2(E)),
  ].every((value) => mu(value) !== 0);
}

const singleWordHits = [];
const gcdCounts = [];
for (const variant of signatureHits) {
  let gcdCount = 0;
  for (const span of paths) {
    if (!passesGcd(predictedCenter, span)) continue;
    gcdCount += 1;
    const plain = decrypt({...variant, center: predictedCenter}, span);
    const match = shakespeareDictionary.get(plain.join(","));
    if (match) {
      singleWordHits.push({
        reverse: variant.reverse,
        word: match.word,
        B: span.B,
        E: span.E,
        length: plain.length,
      });
    }
  }
  gcdCounts.push(gcdCount);
}
assert.deepEqual(gcdCounts, [132, 132]);
assert.deepEqual(singleWordHits, []);

// Reproduce the independent two-author frequent-word register already frozen
// by the block39 continuation audit.
const wordCounts = new Map();
for (const word of (shakespeare + "\n" + gibran).match(/[A-Za-z]+/g) || []) {
  const encoded = external.encodeWord(word);
  if (!encoded) continue;
  const key = encoded.join(",");
  const row = wordCounts.get(key) || {sequence: encoded, count: 0, words: new Map()};
  row.count += 1;
  const upper = word.toUpperCase();
  row.words.set(upper, (row.words.get(upper) || 0) + 1);
  wordCounts.set(key, row);
}
const vocabulary = [...wordCounts.values()].filter((row) =>
  row.count >= 5 &&
  (row.sequence.length > 1 || row.sequence[0] === 24 || row.sequence[0] === 10)
);
assert.equal(vocabulary.length, 1465);

const byFirst = new Map();
for (const item of vocabulary) {
  const first = item.sequence[0];
  if (!byFirst.has(first)) byFirst.set(first, []);
  byFirst.get(first).push(item);
}

/** @param {number[]} sequence @returns {string[][]} */
function segment(sequence) {
  const memo = new Map();

  /** @param {number} position @returns {string[][]} */
  function visit(position) {
    if (position === sequence.length) return [[]];
    if (memo.has(position)) return memo.get(position);
    const out = [];
    for (const item of byFirst.get(sequence[position]) || []) {
      if (position + item.sequence.length > sequence.length) continue;
      let matches = true;
      for (let i = 0; i < item.sequence.length; i += 1) {
        if (sequence[position + i] !== item.sequence[i]) {
          matches = false;
          break;
        }
      }
      if (!matches) continue;
      const representative = [...item.words.entries()]
        .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0][0];
      for (const tail of visit(position + item.sequence.length)) {
        out.push([representative, ...tail]);
      }
    }
    memo.set(position, out);
    return out;
  }

  return visit(0);
}

assert(segment(external.encodeWord("THE")).length > 0);

const segmentedHits = [];
for (const variant of signatureHits) {
  for (const span of paths) {
    if (!passesGcd(predictedCenter, span)) continue;
    const plain = decrypt({...variant, center: predictedCenter}, span);
    for (const words of segment(plain)) {
      segmentedHits.push({
        reverse: variant.reverse,
        phrase: words.join(" "),
        B: span.B,
        E: span.E,
        length: plain.length,
      });
    }
  }
}
assert.deepEqual(segmentedHits, []);

process.stdout.write(JSON.stringify({
  classification: "prospective original-cipher holdout",
  ringVector: vector,
  block39Forecast: {
    sourceAxis: "horizontal",
    centerParity: rule.sourceCenterParity,
    radiusParity: rule.radiusParity,
    signature: rule.signature,
    phase: rule.phase,
  },
  prediction: {
    center: predictedCenter,
    radius: predictedRadius,
    sourceCoordinates: nodeCoordinates,
    rawNode: rawNode.map((value) => translit[value]),
    signatureCompatibleVariants: signatureHits.map((variant) => ({
      reverse: variant.reverse,
      transformed: variant.transformed,
      alignedKey: variant.aligned.map((value) => translit[value]),
    })),
  },
  ciphertextGate: {
    frozenPaths: paths.length,
    gcdSurvivorsPerOrientation: gcdCounts,
    pinnedShakespeareSingleWordHits: singleWordHits.length,
    pinnedTwoAuthorVocabularySize: vocabulary.length,
    pinnedFrequentWordSegmentations: segmentedHits.length,
  },
  decision:
    "The ring 6,3,6 vector prospectively predicts a block39 source center/radius whose untouched node matches the external signature, but neither admitted node orientation produces any complete pinned-register plaintext on any of the 132 frozen ciphertext paths. Reject direct reuse of the ring vector as a general block-to-block key propagation rule.",
}, null, 2) + "\n");
