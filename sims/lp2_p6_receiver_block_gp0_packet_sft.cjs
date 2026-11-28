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

/** @param {number[]} values @returns {number} */
function gp0(values) {
  return mod29(values.reduce((sum, value) => sum + value, 0));
}

/** @param {number} left @param {number} right @returns {number[]} */
function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

/** @param {number[]} shell @returns {number[]} */
function invertH4(shell) {
  assert.equal(shell.length, 4);
  const inv2 = 15;
  const [d0, d1, s1, s0] = shell;
  return [
    mod29((d0 + s0) * inv2),
    mod29((d1 + s1) * inv2),
    mod29((s1 - d1) * inv2),
    mod29((s0 - d0) * inv2),
  ];
}

/** @param {number[]} shell @returns {number[]} */
function invertH2(shell) {
  assert.equal(shell.length, 2);
  const inv2 = 15;
  const [difference, sum] = shell;
  return [
    mod29((difference + sum) * inv2),
    mod29((sum - difference) * inv2),
  ];
}

/** @param {number[]} values @returns {number[]} */
function hSplit(values) {
  const differences = [];
  const sums = [];
  const half = Math.floor(values.length / 2);
  for (let index = 0; index < half; index += 1) {
    const left = values[index];
    const right = values[values.length - 1 - index];
    differences.push(mod29(left - right));
    sums.push(mod29(left + right));
  }
  const out = differences.slice();
  if (values.length % 2 === 1) {
    out.push(values[half]);
  }
  out.push(...sums.reverse());
  return out;
}

/** @param {number[]} values @returns {number[][]} */
function permutations(values) {
  const out = [];
  function visit(prefix, rest) {
    if (!rest.length) {
      out.push(prefix);
      return;
    }
    for (let index = 0; index < rest.length; index += 1) {
      visit(
        prefix.concat(rest[index]),
        rest.slice(0, index).concat(rest.slice(index + 1))
      );
    }
  }
  visit([], values);
  return out;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);

/** @returns {Map<number, any[]>} */
function parsePages() {
  const pages = Array.from({ length: parts.length }, (_, segment) => ({
    page: segment >= 50 ? segment + 1 : segment,
    words: [],
  }));
  const offsets = pages.map(() => 0);
  let values = [];
  let startSegment = 0;
  let endSegment = 0;
  let start = 0;

  function flush() {
    if (!values.length) return;
    if (startSegment === endSegment) {
      const page = pages[startSegment];
      page.words.push({
        page: page.page,
        ordinal: page.words.length,
        start,
        end: start + values.length - 1,
        values: values.slice(),
        length: values.length,
        gp0: gp0(values),
      });
    }
    values = [];
  }

  for (let segment = 0; segment < parts.length; segment += 1) {
    for (const char of parts[segment]) {
      const value = runeIndex.get(char);
      if (value !== undefined) {
        if (!values.length) {
          startSegment = segment;
          start = offsets[segment];
        }
        endSegment = segment;
        values.push(value);
        offsets[segment] += 1;
      } else if (char === "/" || /\s/u.test(char)) {
        continue;
      } else {
        flush();
      }
    }
  }
  flush();
  return new Map(pages.map((page) => [page.page, page.words]));
}

const pages = parsePages();

/** @param {number} page @param {number} start @returns {any} */
function wordAt(page, start) {
  const word = (pages.get(page) || []).find((candidate) => candidate.start === start);
  assert.ok(word, `missing p${page} word at ${start}`);
  return word;
}

/** @param {number[]} values @param {number} index @returns {number[]} */
function removeAt(values, index) {
  return values.filter((_, offset) => offset !== index);
}

const p6TitleStarts = [71, 75, 76, 80];
const p6Title = p6TitleStarts.map((start) => wordAt(6, start));
assert.deepEqual(p6Title.map((word) => word.values), [
  [24, 16, 14, 17],
  [19],
  [6, 27, 15, 17],
  [14, 12],
]);
assert.deepEqual(p6Title.map((word) => word.length), [4, 1, 4, 2]);

const W1 = p6Title[0].values;
const W4 = p6Title[3].values;
const F = 0;
const expectedPacket = [...H(F, W1[1]), W1[0], W4[1]];
assert.deepEqual(expectedPacket, [13, 16, 24, 12]);

const p32Candidates = (pages.get(32) || []).filter(
  (word) => word.length === 3 && mod29(word.start) === 1
);
assert.deepEqual(p32Candidates.map((word) => word.start), [1, 30]);
assert.deepEqual(p32Candidates.map((word) => word.gp0), [5, 5]);
const p32 = wordAt(32, 30);

const p33Candidates = (pages.get(33) || []).filter(
  (word) => word.length === 4 && mod29(word.start) === 16
);
assert.deepEqual(p33Candidates.map((word) => word.start), [132]);
const p33 = p33Candidates[0];

const p34Candidates = (pages.get(34) || []).filter(
  (word) => word.length === 2 && mod29(word.start) === 4
);
assert.deepEqual(p34Candidates.map((word) => word.start), [4]);
const p34 = p34Candidates[0];

const p35Words = pages.get(35) || [];
const p35Packets = [];
for (let index = 0; index + 1 < p35Words.length; index += 1) {
  const left = p35Words[index];
  const right = p35Words[index + 1];
  if (
    left.length === 2 &&
    right.length === 3 &&
    right.start === left.end + 1 &&
    mod29(left.start) === 25
  ) {
    p35Packets.push({ start: left.start, values: left.values.concat(right.values) });
  }
}
assert.deepEqual(p35Packets, [
  { start: 25, values: [19, 17, 19, 24, 11] },
]);
const p35 = p35Packets[0].values;

const p36Raw = wordAt(36, 169);
assert.deepEqual(p36Raw.values, [2, 22, 4, 1, 20]);
const p36 = removeAt(p36Raw.values, 2);
assert.deepEqual(p36, [2, 22, 1, 20]);

/** @param {number} page @param {number} length @param {number} residue @returns {any[]} */
function residueArity(page, length, residue) {
  return (pages.get(page) || []).filter(
    (word) => word.length === length && mod29(word.start) === residue
  );
}

const p37Candidates = residueArity(37, 4, 1);
const p38Candidates = residueArity(38, 6, 28);
const p39Candidates = residueArity(39, 5, 16);
const p40Candidates = residueArity(40, 4, 13);
assert.deepEqual(p37Candidates.map((word) => word.start), [146]);
assert.deepEqual(p38Candidates.map((word) => word.start), [57]);
assert.deepEqual(p39Candidates.map((word) => word.start), [132]);
assert.deepEqual(p40Candidates.map((word) => word.start), [13, 71, 216]);
assert.deepEqual(p40Candidates.map((word) => word.gp0), [3, 25, 27]);

const p37 = p37Candidates[0].values;
const p38 = p38Candidates[0].values;
const p39 = p39Candidates[0].values;

const p41Raw = wordAt(41, 178);
assert.deepEqual(p41Raw.values, [27, 12, 5, 0, 17, 13, 19]);
const p41 = removeAt(p41Raw.values, 3);

const p42Selector = wordAt(42, 206);
assert.deepEqual(p42Selector.values, [16, 0, 14]);
const p42Raw = wordAt(42, 211);
assert.deepEqual(p42Raw.values, [10, 0, 14, 1, 3, 26, 8, 2]);
const p42 = removeAt(p42Raw.values, 1);

/** @param {number[]} p40 @returns {number[]} */
function receiverBlockSums(p40) {
  const blocks = [
    [p32.values, p33.values, p34.values, p35],
    [p36],
    [p37, p38, p39, p40],
    [p41, p42],
  ];
  return blocks.map((block) =>
    mod29(block.flat().reduce((sum, value) => sum + value, 0))
  );
}

const candidatePackets = p40Candidates.map((word) => ({
  start: word.start,
  packet: receiverBlockSums(word.values),
}));
assert.deepEqual(candidatePackets, [
  { start: 13, packet: [13, 16, 2, 12] },
  { start: 71, packet: [13, 16, 24, 12] },
  { start: 216, packet: [13, 16, 26, 12] },
]);
assert.deepEqual(candidatePackets[1].packet, expectedPacket);

const titleTape = p6Title.flatMap((word) => word.values);
assert.equal(titleTape.length, 11);
const family = new Set();
let labeledConstructions = 0;
for (const x of titleTape) {
  for (const y of titleTape) {
    for (const z of titleTape) {
      const base = [...H(F, x), y, z];
      for (const permutation of permutations(base)) {
        labeledConstructions += 1;
        family.add(permutation.join(","));
      }
    }
  }
}
assert.equal(labeledConstructions, 11 ** 3 * 24);
assert.equal(family.size, 5856);

const familyHits = candidatePackets.filter(({ packet }) =>
  family.has(packet.join(","))
);
assert.deepEqual(familyHits, [
  { start: 71, packet: [13, 16, 24, 12] },
]);

const sourceBlockGp0 = [13, 6, 18, 18];
const keyBlockSums = expectedPacket.map((value, index) =>
  mod29(value - sourceBlockGp0[index])
);
assert.deepEqual(keyBlockSums, [0, 10, 6, 23]);

// The block-key shift is itself a literal inner-title packet.
const W2 = p6Title[1].values;
const W3 = p6Title[2].values;
assert.deepEqual(W2, [19]);
assert.deepEqual(W3, [6, 27, 15, 17]);
const w3EndpointH = H(W3[0], W3[W3.length - 1]);
assert.deepEqual(w3EndpointH, [18, 23]);

const innerTitleShift = [
  F,
  mod29(-W2[0]),
  W3[0],
  w3EndpointH[1],
];
assert.deepEqual(innerTitleShift, keyBlockSums);

// Charge the complete inner-title role/sign/permutation family.
const innerFamily = new Set();
let innerLabeled = 0;
for (const sign of [1, -1]) {
  const singleton = mod29(sign * W2[0]);
  for (const rune of W3) {
    for (const endpointCoordinate of w3EndpointH) {
      for (const permutation of permutations([
        F,
        singleton,
        rune,
        endpointCoordinate,
      ])) {
        innerLabeled += 1;
        innerFamily.add(permutation.join(","));
      }
    }
  }
}
assert.equal(innerLabeled, 384);
assert.equal(innerFamily.size, 384);

const candidateKeyBlockSums = candidatePackets.map(({ start, packet }) => ({
  start,
  shift: packet.map((value, index) =>
    mod29(value - sourceBlockGp0[index])
  ),
}));
assert.deepEqual(candidateKeyBlockSums, [
  { start: 13, shift: [0, 10, 13, 23] },
  { start: 71, shift: [0, 10, 6, 23] },
  { start: 216, shift: [0, 10, 8, 23] },
]);

const innerHits = candidateKeyBlockSums.filter(({ shift }) =>
  innerFamily.has(shift.join(","))
);
assert.deepEqual(innerHits, [
  { start: 71, shift: [0, 10, 6, 23] },
]);

let exactInnerLabels = 0;
for (const sign of [1, -1]) {
  const singleton = mod29(sign * W2[0]);
  for (let runeIndex = 0; runeIndex < W3.length; runeIndex += 1) {
    const rune = W3[runeIndex];
    for (let endpointIndex = 0; endpointIndex < w3EndpointH.length; endpointIndex += 1) {
      const endpointCoordinate = w3EndpointH[endpointIndex];
      for (const permutation of permutations([
        F,
        singleton,
        rune,
        endpointCoordinate,
      ])) {
        if (permutation.join(",") === keyBlockSums.join(",")) {
          exactInnerLabels += 1;
          assert.equal(sign, -1);
          assert.equal(runeIndex, 0);
          assert.equal(endpointIndex, 1);
          assert.deepEqual(permutation, [0, 10, 6, 23]);
        }
      }
    }
  }
}
assert.equal(exactInnerLabels, 1);

// Resolve the aggregate shift to all eleven page-key sums using literal
// p6 title/Fehu shells.
const block1KeySums = invertH4([
  p6Title[0].length + p6Title[2].length,
  F,
  F,
  F,
]);
assert.deepEqual(block1KeySums, [4, 0, 0, 25]);

const block2KeySums = [mod29(-W2[0])];
assert.deepEqual(block2KeySums, [10]);

const w1EndpointH = H(W1[0], W1[W1.length - 1]);
assert.deepEqual(w1EndpointH, [7, 12]);
const block3Shell = [
  w1EndpointH[0],
  p6Title[1].length,
  mod29(-p6Title[1].length),
  w1EndpointH[0],
];
assert.deepEqual(block3Shell, [7, 1, 28, 7]);
const block3KeySums = invertH4(block3Shell);
assert.deepEqual(block3KeySums, [7, 0, 28, 0]);

const block4Shell = [W1[1], w3EndpointH[1]];
assert.deepEqual(block4Shell, [16, 23]);
const block4KeySums = invertH2(block4Shell);
assert.deepEqual(block4KeySums, [5, 18]);

const pageKeySums = [
  ...block1KeySums,
  ...block2KeySums,
  ...block3KeySums,
  ...block4KeySums,
];
assert.deepEqual(pageKeySums, [4, 0, 0, 25, 10, 7, 0, 28, 0, 5, 18]);
assert.deepEqual([
  mod29(block1KeySums.reduce((a, b) => a + b, 0)),
  block2KeySums[0],
  mod29(block3KeySums.reduce((a, b) => a + b, 0)),
  mod29(block4KeySums.reduce((a, b) => a + b, 0)),
], keyBlockSums);

const signedSourceGp0 = [1, 28, 6, 7, 6, 2, 1, 19, 25, 1, 17];
const predictedReceiverGp0 = signedSourceGp0.map((value, index) =>
  mod29(value + pageKeySums[index])
);
assert.deepEqual(predictedReceiverGp0, [5, 28, 6, 3, 16, 9, 1, 18, 25, 6, 6]);

const preparedReceiverGp0 = [
  p32.gp0,
  p33.gp0,
  p34.gp0,
  gp0(p35),
  gp0(p36),
  gp0(p37),
  gp0(p38),
  gp0(p39),
  p40Candidates[1].gp0,
  gp0(p41),
  gp0(p42),
];
assert.deepEqual(preparedReceiverGp0, predictedReceiverGp0);

// Block1 finite role family.
const block1Outputs = new Set();
let block1Labels = 0;
let block1TargetLabels = 0;
for (let leftRole = 0; leftRole < p6Title.length; leftRole += 1) {
  for (let rightRole = 0; rightRole < p6Title.length; rightRole += 1) {
    const lengthSum = mod29(
      p6Title[leftRole].length + p6Title[rightRole].length
    );
    for (const sign of [1, -1]) {
      const value = mod29(sign * lengthSum);
      for (let position = 0; position < 4; position += 1) {
        const shell = [F, F, F, F];
        shell[position] = value;
        const output = invertH4(shell);
        block1Labels += 1;
        block1Outputs.add(output.join(","));
        if (output.join(",") === block1KeySums.join(",")) {
          block1TargetLabels += 1;
          assert.equal(value, 8);
          assert.equal(position, 0);
        }
      }
    }
  }
}
assert.equal(block1Labels, 128);
assert.equal(block1Outputs.size, 48);
assert.equal(block1TargetLabels, 4);

// Block2 finite role family.
const block2Outputs = new Set();
let block2Labels = 0;
let block2TargetLabels = 0;
for (let index = 0; index < titleTape.length; index += 1) {
  for (const sign of [1, -1]) {
    const output = [mod29(sign * titleTape[index])];
    block2Labels += 1;
    block2Outputs.add(output.join(","));
    if (output.join(",") === block2KeySums.join(",")) {
      block2TargetLabels += 1;
      assert.equal(index, 4);
      assert.equal(sign, -1);
    }
  }
}
assert.equal(block2Labels, 22);
assert.equal(block2Outputs.size, 14);
assert.equal(block2TargetLabels, 1);

// Block3 finite role family.
const qWords = [p6Title[0].values, p6Title[2].values];
const qEndpointRoles = qWords.flatMap((word, wordIndex) => {
  const endpoint = H(word[0], word[word.length - 1]);
  return endpoint.map((value, coordinate) => ({ wordIndex, coordinate, value }));
});
const block3Outputs = new Set();
let block3Labels = 0;
let block3TargetLabels = 0;
for (const endpointRole of qEndpointRoles) {
  for (let lengthRole = 0; lengthRole < p6Title.length; lengthRole += 1) {
    const unit = p6Title[lengthRole].length;
    for (const shell of permutations([
      endpointRole.value,
      unit,
      mod29(-unit),
      endpointRole.value,
    ])) {
      const output = invertH4(shell);
      block3Labels += 1;
      block3Outputs.add(output.join(","));
      if (output.join(",") === block3KeySums.join(",")) {
        block3TargetLabels += 1;
        assert.equal(endpointRole.wordIndex, 0);
        assert.equal(endpointRole.coordinate, 0);
        assert.equal(lengthRole, 1);
        assert.deepEqual(shell, [7, 1, 28, 7]);
      }
    }
  }
}
assert.equal(block3Labels, 384);
assert.equal(block3Outputs.size, 144);
assert.equal(block3TargetLabels, 2);

// Block4 finite role family.
const block4Outputs = new Set();
let block4Labels = 0;
let block4TargetLabels = 0;
for (let runeIndex = 0; runeIndex < titleTape.length; runeIndex += 1) {
  for (const endpointRole of qEndpointRoles) {
    for (const shell of [
      [titleTape[runeIndex], endpointRole.value],
      [endpointRole.value, titleTape[runeIndex]],
    ]) {
      const output = invertH2(shell);
      block4Labels += 1;
      block4Outputs.add(output.join(","));
      if (output.join(",") === block4KeySums.join(",")) {
        block4TargetLabels += 1;
        assert.equal(runeIndex, 1);
        assert.equal(endpointRole.wordIndex, 1);
        assert.equal(endpointRole.coordinate, 1);
        assert.deepEqual(shell, [16, 23]);
      }
    }
  }
}
assert.equal(block4Labels, 88);
assert.equal(block4Outputs.size, 71);
assert.equal(block4TargetLabels, 1);

// Extend the checksum tape across the independently established skipped-K=2
// SEEK AND boundary using the older p30/p31 literal geometry keys.
const W4 = p6Title[3].values;
const key30Geometry = [
  W3[0],
  W4[0],
  ...H(F, W3[0]),
];
assert.deepEqual(key30Geometry, [6, 14, 23, 6]);

const key31Geometry = [
  W3[W3.length - 1],
  W4[0],
  H(W1[0], W1[W1.length - 1])[0],
];
assert.deepEqual(key31Geometry, [17, 14, 7]);

const boundaryKeySums = [
  gp0(key30Geometry),
  gp0(key31Geometry),
];
assert.deepEqual(boundaryKeySums, [20, 9]);

// The outer H-difference constraints predict those two older sums from the
// new p41/p42 core sums before using the p30/p31 key vectors.
const predictedBoundaryKeySums = [
  mod29(pageKeySums[10] + p6Title[3].length),
  mod29(pageKeySums[9] + p6Title[0].length),
];
assert.deepEqual(predictedBoundaryKeySums, [20, 9]);
assert.deepEqual(predictedBoundaryKeySums, boundaryKeySums);

const keySum13 = [
  ...boundaryKeySums,
  ...pageKeySums,
];
assert.deepEqual(keySum13, [
  20, 9, 4, 0, 0, 25, 10, 7, 0, 28, 0, 5, 18,
]);

const keySum13H = hSplit(keySum13);
assert.deepEqual(keySum13H, [
  2, 4, 4, 1, 0, 18, 10, 3, 0, 28, 4, 14, 9,
]);

const expectedBoundaryPrefix = [
  p6Title[3].length,
  p6Title[0].length,
  p6Title[2].length,
  p6Title[1].length,
  F,
  w3EndpointH[0],
  mod29(-W2[0]),
];
assert.deepEqual(expectedBoundaryPrefix, [2, 4, 4, 1, 0, 18, 10]);
assert.deepEqual(keySum13H.slice(0, 7), expectedBoundaryPrefix);

// Broad prefix charge: all title-word role orders, all q-word endpoint-H
// roles, and both signs of all title-rune positions for the center.
const boundaryPrefixFamily = new Set();
let boundaryPrefixLabels = 0;
let boundaryPrefixTargetLabels = 0;
for (const lengthRoleOrder of permutations([0, 1, 2, 3])) {
  const emittedLengths = lengthRoleOrder.map(
    (role) => p6Title[role].length
  );
  for (const endpointRole of qEndpointRoles) {
    for (let runeIndex = 0; runeIndex < titleTape.length; runeIndex += 1) {
      for (const sign of [1, -1]) {
        const prefix = [
          ...emittedLengths,
          F,
          endpointRole.value,
          mod29(sign * titleTape[runeIndex]),
        ];
        boundaryPrefixLabels += 1;
        boundaryPrefixFamily.add(prefix.join(","));
        if (prefix.join(",") === expectedBoundaryPrefix.join(",")) {
          boundaryPrefixTargetLabels += 1;
          assert.equal(endpointRole.wordIndex, 1);
          assert.equal(endpointRole.coordinate, 0);
          assert.equal(runeIndex, 4);
          assert.equal(sign, -1);
        }
      }
    }
  }
}
assert.equal(boundaryPrefixLabels, 2112);
assert.equal(boundaryPrefixFamily.size, 672);
assert.equal(boundaryPrefixTargetLabels, 2);

// Complete the 13-page Hsplit shell using the authenticated SEEK AND
// boundary source. AND[1]=9 was explicitly held out by the older p30/p31
// geometry-key formulas, which used SEEK endpoints and AND.last.
const seek = [15, 18, 18, 5];
const andWord = [24, 9, 23];
assert.equal(gp0(seek), 27);
assert.equal(gp0(andWord), 27);

const boundarySumHalf = [
  andWord.length,
  F,
  mod29(-p6Title[1].length),
  seek.length,
  W4[0],
  andWord[1],
];
assert.deepEqual(boundarySumHalf, [3, 0, 28, 4, 14, 9]);
assert.deepEqual(keySum13H.slice(7), boundarySumHalf);

// Charge the six sum-half roles broadly while preserving only semantic type.
const heldOutBoundaryCoordinates = [
  seek[1],
  seek[2],
  andWord[0],
  andWord[1],
];
const boundarySumHalfFamily = new Set();
let boundarySumHalfLabels = 0;
let boundarySumHalfTargetLabels = 0;
for (const firstLength of [seek.length, andWord.length]) {
  for (let titleLengthRole = 0; titleLengthRole < p6Title.length; titleLengthRole += 1) {
    for (const titleLengthSign of [1, -1]) {
      const signedTitleLength = mod29(
        titleLengthSign * p6Title[titleLengthRole].length
      );
      for (const fourthLength of [seek.length, andWord.length]) {
        for (let w4Endpoint = 0; w4Endpoint < W4.length; w4Endpoint += 1) {
          for (const w4Sign of [1, -1]) {
            const signedW4 = mod29(w4Sign * W4[w4Endpoint]);
            for (
              let heldOutIndex = 0;
              heldOutIndex < heldOutBoundaryCoordinates.length;
              heldOutIndex += 1
            ) {
              for (const heldOutSign of [1, -1]) {
                const signedHeldOut = mod29(
                  heldOutSign * heldOutBoundaryCoordinates[heldOutIndex]
                );
                const candidate = [
                  firstLength,
                  F,
                  signedTitleLength,
                  fourthLength,
                  signedW4,
                  signedHeldOut,
                ];
                boundarySumHalfLabels += 1;
                boundarySumHalfFamily.add(candidate.join(","));
                if (candidate.join(",") === boundarySumHalf.join(",")) {
                  boundarySumHalfTargetLabels += 1;
                  assert.equal(firstLength, andWord.length);
                  assert.equal(titleLengthRole, 1);
                  assert.equal(titleLengthSign, -1);
                  assert.equal(fourthLength, seek.length);
                  assert.equal(w4Endpoint, 0);
                  assert.equal(w4Sign, 1);
                  assert.equal(heldOutIndex, 3);
                  assert.equal(heldOutSign, 1);
                }
              }
            }
          }
        }
      }
    }
  }
}
assert.equal(boundarySumHalfLabels, 1024);
assert.equal(boundarySumHalfFamily.size, 576);
assert.equal(boundarySumHalfTargetLabels, 1);

const p30 = wordAt(30, 112);
const p31 = wordAt(31, 126);
assert.deepEqual(p30.values, [21, 3, 12, 11]);
assert.deepEqual(p31.values, [12, 23, 1]);
assert.equal(p30.gp0, 18);
assert.equal(p31.gp0, 7);
const predictedBoundaryReceiverGp0 = [
  mod29(gp0(seek) + boundaryKeySums[0]),
  mod29(gp0(andWord) + boundaryKeySums[1]),
];
assert.deepEqual(predictedBoundaryReceiverGp0, [18, 7]);
assert.deepEqual(predictedBoundaryReceiverGp0, [p30.gp0, p31.gp0]);

const fullPredictedReceiverGp0 = [
  ...predictedBoundaryReceiverGp0,
  ...predictedReceiverGp0,
];
assert.deepEqual(fullPredictedReceiverGp0, [
  18, 7, 5, 28, 6, 3, 16, 9, 1, 18, 25, 6, 6,
]);

const keyBlockH4 = [
  mod29(keyBlockSums[0] - keyBlockSums[3]),
  mod29(keyBlockSums[1] - keyBlockSums[2]),
  mod29(keyBlockSums[1] + keyBlockSums[2]),
  mod29(keyBlockSums[0] + keyBlockSums[3]),
];
assert.deepEqual(keyBlockH4, [6, 4, 16, 23]);
assert.deepEqual(keyBlockH4, [
  W3[0],
  p6Title[0].length,
  W1[1],
  w3EndpointH[1],
]);

console.log(JSON.stringify({
  status: "PASS: p6 Fehu/title packet matches scheduled receiver-block GP0 sums",
  p6: { titleStarts: p6TitleStarts, titleTape, W1, W4, expectedPacket },
  receiverCandidates: candidatePackets,
  family: {
    labeledConstructions,
    distinctNumericPackets: family.size,
    hits: familyHits,
  },
  sourceBlockGp0,
  keyBlockSums,
  innerTitle: {
    shift: innerTitleShift,
    keyBlockH4,
    labeledConstructions: innerLabeled,
    distinctNumericPackets: innerFamily.size,
    candidateShifts: candidateKeyBlockSums,
    hits: innerHits,
    exactLabeledRealizations: exactInnerLabels,
  },
  pageKeySumSchedule: {
    pageKeySums,
    signedSourceGp0,
    predictedReceiverGp0,
    preparedReceiverGp0,
    families: {
      block1: {
        labeled: block1Labels,
        distinct: block1Outputs.size,
        targetLabels: block1TargetLabels,
      },
      block2: {
        labeled: block2Labels,
        distinct: block2Outputs.size,
        targetLabels: block2TargetLabels,
      },
      block3: {
        labeled: block3Labels,
        distinct: block3Outputs.size,
        targetLabels: block3TargetLabels,
      },
      block4: {
        labeled: block4Labels,
        distinct: block4Outputs.size,
        targetLabels: block4TargetLabels,
      },
    },
    boundary13: {
      keySums: keySum13,
      hSplit: keySum13H,
      prefix: expectedBoundaryPrefix,
      predictedPrefixKeySums: predictedBoundaryKeySums,
      independentGeometryKeySums: boundaryKeySums,
      family: {
        labeled: boundaryPrefixLabels,
        distinct: boundaryPrefixFamily.size,
        targetLabels: boundaryPrefixTargetLabels,
      },
      sumHalf: boundarySumHalf,
      sumHalfFamily: {
        labeled: boundarySumHalfLabels,
        distinct: boundarySumHalfFamily.size,
        targetLabels: boundarySumHalfTargetLabels,
      },
      predictedBoundaryReceiverGp0,
      fullPredictedReceiverGp0,
    },
  },
  note: "p32 starts1 and30 have identical GP0=5, so this checksum does not replace the first-full-stop tie-break",
}, null, 2));
