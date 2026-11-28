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
  note: "p32 starts1 and30 have identical GP0=5, so this checksum does not replace the first-full-stop tie-break",
}, null, 2));
