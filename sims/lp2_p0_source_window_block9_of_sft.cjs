"use strict";

/**
 * SFT: authenticated signed-source windows select the public 27x27 block9
 * J-OE-J key node and the original two-cell path that decrypts to OF.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const grid = corpus.pages.filter((page) => page.page <= 2).flatMap((page) => page.indices);

assert.equal(grid.length, 729);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} values @returns {number[]} */
function h(values) {
  const out = [];
  for (let left = 0, right = values.length - 1; left < right; left += 1, right -= 1) {
    out.push(mod29(values[left] - values[right]), mod29(values[left] + values[right]));
  }
  if (values.length % 2 === 1) out.push(values[(values.length - 1) / 2]);
  return out;
}

/** @param {string} word @returns {number[]} */
function gpWord(word) {
  const normalized = word.toUpperCase()
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
    const token = gpTokens.find((candidate) => normalized.startsWith(candidate.symbol, index));
    assert.ok(token, `unmapped GP spelling ${word} at ${index}`);
    values.push(token.value);
    index += token.symbol.length;
  }
  return values;
}

/** @param {string} source @returns {number[][]} */
function runeWords(source) {
  const words = [];
  let current = [];
  for (const char of [...source]) {
    const value = runeIndex.get(char);
    if (value !== undefined) current.push(value);
    else if (current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}

/** @param {number} n @returns {number} */
function phi(n) {
  let result = n;
  let value = n;
  for (let prime = 2; prime * prime <= value; prime += 1) {
    if (value % prime !== 0) continue;
    while (value % prime === 0) value /= prime;
    result -= result / prime;
  }
  if (value > 1) result -= result / value;
  return result;
}

/** @param {number} n @returns {number} */
function mobius(n) {
  if (n === 1) return 1;
  let value = n;
  let factors = 0;
  for (let prime = 2; prime * prime <= value; prime += 1) {
    if (value % prime !== 0) continue;
    value /= prime;
    factors += 1;
    if (value % prime === 0) return 0;
    while (value % prime === 0) value /= prime;
  }
  if (value > 1) factors += 1;
  return factors % 2 === 0 ? 1 : -1;
}

/** @param {number[]} packet @returns {{unrotated:number[],rotation:number,key:number[]}} */
function deriveKey(packet) {
  assert.equal(packet.length, 3);
  assert.equal(packet[0], packet[2]);
  const unrotated = [packet[0], phi(packet[1]), packet[2]];
  const rotation = mod29(
    unrotated.reduce((sum, value) => sum + mobius(phi(value)), 0)
  ) % 3;
  const key = unrotated.slice(rotation).concat(unrotated.slice(0, rotation));
  return { unrotated, rotation, key };
}

/** @param {number[]} values @returns {number[]} */
function markerSums(values) {
  assert.equal(values.length, 13);
  const shell = h(values);
  return [
    shell.slice(0, 4),
    shell.slice(4, 9),
    shell.slice(9, 13),
  ].map((group) => group.reduce((sum, value) => sum + value, 0) % 29);
}

/** @param {number} row @param {number} column @returns {number} */
function cell(row, column) {
  assert.ok(row >= 1 && row <= 27);
  assert.ok(column >= 1 && column <= 27);
  return grid[(row - 1) * 27 + column - 1];
}

const signedClear = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");
const sourceWords = signedClear
  .split(/[^A-Za-z0-9]+/u)
  .filter((word) => /^[A-Za-z]+$/u.test(word))
  .map((word) => word.toUpperCase());

assert.equal(sourceWords.length, 43);
const encoded = sourceWords.map(gpWord);

const known = new Map();
for (const section of solved.sections) {
  for (const values of runeWords(section.source_text)) {
    known.set(values.join(","), values.map((value) => corpus.translit[value]).join(""));
  }
}
for (const word of sourceWords) {
  const values = gpWord(word);
  known.set(values.join(","), word);
}

const length13 = [];
for (let start = 0; start < sourceWords.length; start += 1) {
  let values = [];
  for (let end = start; end < sourceWords.length; end += 1) {
    values = values.concat(encoded[end]);
    if (values.length > 13) break;
    if (values.length !== 13) continue;
    length13.push({
      start,
      end,
      phrase: sourceWords.slice(start, end + 1).join(" "),
      values,
      packet: markerSums(values),
    });
    break;
  }
}
assert.equal(length13.length, 13);

const symmetric = length13.filter((item) => item.packet[0] === item.packet[2]);
assert.deepEqual(symmetric, [{
  start: 12,
  end: 15,
  phrase: "THE WAY ITS WORDS",
  values: [2,18,7,24,26,10,16,15,7,3,4,23,15],
  packet: [11,23,11],
}]);

const directions = [
  ["H", 0, 1],
  ["V", 1, 0],
  ["D1", 1, 1],
  ["D2", 1, -1],
];

/** @param {number[]} target @returns {Array<{radius:number,axis:string,points:number[][]}>} */
function findExactTriples(target) {
  const hits = [];
  for (let radius = 1; radius <= 13; radius += 1) {
    for (const [axis, dr, dc] of directions) {
      for (let row = 1; row <= 27; row += 1) {
        for (let column = 1; column <= 27; column += 1) {
          const points = [
            [row, column],
            [row + radius * dr, column + radius * dc],
            [row + 2 * radius * dr, column + 2 * radius * dc],
          ];
          if (points.some(([r, c]) => r < 1 || r > 27 || c < 1 || c > 27)) continue;
          const values = points.map(([r, c]) => cell(r, c));
          if (values.every((value, index) => value === target[index])) {
            hits.push({ radius, axis, points });
          }
        }
      }
    }
  }
  return hits;
}

const selector = symmetric[0];
const selectorHits = findExactTriples(selector.packet);
assert.deepEqual(selectorHits, [{
  radius: 2,
  axis: "D2",
  points: [[15,20],[17,18],[19,16]],
}]);

const publicMarked = [
  "334,335,336","354,355,356","103,373,643","666,693,720","331,385,439","636,663,690",
  "474,501,528","201,285,369","397,449,501","474,501,528","501,605,709","556,561,566",
  "501,605,709","649,653,657","123,420,717","392,527,651,654,655,657,661,662,667",
  "669,696,723","448,529,610","285,312,339","434,440,446","132,213,294","121,310,499",
  "280,448,616","273,354,435","144,340,536","485,511,537","594,621,648","386,413,440",
  "282,363,444","365,521,677","158,262,366","351,357,363","228,232,236","556,561,566",
  "69,181,293","324,334,344","94,150,206","282,309,336",
].map((source) => new Set(source.split(",").map(Number)));

const sourceWindowPublicMatches = [];
for (const item of length13) {
  const hits = findExactTriples(item.packet);
  for (const hit of hits) {
    const linear = hit.points.map(([row, column]) => (row - 1) * 27 + column - 1);
    publicMarked.forEach((marked, index) => {
      if (linear.every((value) => marked.has(value))) {
        sourceWindowPublicMatches.push({
          phrase: item.phrase,
          packet: item.packet,
          block: index + 1,
          hit,
        });
      }
    });
  }
}
assert.deepEqual(sourceWindowPublicMatches, [{
  phrase: "THE WAY ITS WORDS",
  packet: [11,23,11],
  block: 9,
  hit: {
    radius: 2,
    axis: "D2",
    points: [[15,20],[17,18],[19,16]],
  },
}]);

const block9Key = deriveKey(selector.packet);
assert.deepEqual(block9Key, {
  unrotated: [11,22,11],
  rotation: 0,
  key: [11,22,11],
});

assert.equal(selector.end, 15);
assert.deepEqual(sourceWords.slice(selector.end, selector.end + 4), ["WORDS","ARE","THE","MAP"]);

const path = [[18,15],[18,16]];
const cipher = path.map(([row, column]) => cell(row, column));
assert.deepEqual(cipher, [14,22]);
const plaintext = cipher.map((value, index) => mod29(value - block9Key.key[index]));
assert.deepEqual(plaintext, [3,0]);
assert.equal(known.get(plaintext.join(",")), "OF");
assert.deepEqual(plaintext.map((value, index) => mod29(value + block9Key.key[index])), cipher);

// Charge all coordinate assignments made only from 15..18.
const sourceNumbers = [15,16,17,18];
const coordinateTrials = [];
for (const origin of ["direct","plus1"]) {
  const convert = (value) => origin === "direct" ? value : value + 1;
  for (const axis of ["H","V"]) {
    for (const fixed of sourceNumbers) {
      for (const first of sourceNumbers) {
        for (const second of sourceNumbers) {
          if (first === second || first === fixed || second === fixed) continue;
          const coords = axis === "H"
            ? [[convert(fixed), convert(first)], [convert(fixed), convert(second)]]
            : [[convert(first), convert(fixed)], [convert(second), convert(fixed)]];
          if (coords.some(([row, column]) => row < 1 || row > 27 || column < 1 || column > 27)) continue;
          const trialCipher = coords.map(([row, column]) => cell(row, column));
          const trialPlain = trialCipher.map((value, index) => mod29(value - block9Key.key[index]));
          coordinateTrials.push({
            origin,
            axis,
            fixed,
            first,
            second,
            coords,
            plaintext: trialPlain,
            label: known.get(trialPlain.join(",")) || null,
          });
        }
      }
    }
  }
}
assert.equal(coordinateTrials.length, 96);
assert.deepEqual(coordinateTrials.filter((trial) => trial.label), [{
  origin: "direct",
  axis: "H",
  fixed: 18,
  first: 15,
  second: 16,
  coords: [[18,15],[18,16]],
  plaintext: [3,0],
  label: "OF",
}]);

// Broader hinge formula is not independently selective; retain its alternatives.
const hingeLexical = [];
for (let start = 1; start <= 24; start += 1) {
  const coords = [[start + 3, start], [start + 3, start + 1]];
  const trialCipher = coords.map(([row, column]) => cell(row, column));
  const trialPlain = trialCipher.map((value, index) => mod29(value - block9Key.key[index]));
  const label = known.get(trialPlain.join(",")) || null;
  if (label) hingeLexical.push({ start, phrase: sourceWords.slice(start, start + 4).join(" "), coords, label });
}
assert.deepEqual(hingeLexical, [
  { start: 2, phrase: "PATH LIES EMPTY EPIPHANY", coords: [[5,2],[5,3]], label: "OR" },
  { start: 15, phrase: "WORDS ARE THE MAP", coords: [[18,15],[18,16]], label: "OF" },
  { start: 22, phrase: "THE ROAD AND THEIR", coords: [[25,22],[25,23]], label: "TO" },
]);

// Explicit block10 boundary: the natural increasing source-number order is
// opposite the public claimed direction, so no transfer is promoted.
const block10Key = [22,22,10];
const block10Increasing = [[19,16],[19,17]];
const block10Reverse = [[19,17],[19,16]];
const decodePair = (coords) => coords.map(([row,column], index) =>
  mod29(cell(row,column) - block10Key[index]));
assert.deepEqual(decodePair(block10Increasing), [18,2]);
assert.deepEqual(decodePair(block10Reverse), [2,18]);
assert.equal(known.get(decodePair(block10Reverse).join(",")), "THE");
assert.equal(known.get(decodePair(block10Increasing).join(",")) || null, null);

console.log(JSON.stringify({
  status: "PASS",
  sourceSelector: selector,
  uniqueGridHit: selectorHits,
  publicGeometryMatchesAcrossAllLength13Windows: sourceWindowPublicMatches,
  block9Key,
  hinge: selector.end,
  mapPhrase: sourceWords.slice(selector.end, selector.end + 4),
  path,
  cipher,
  plaintext: "OF",
  coordinateFamily: {
    cases: coordinateTrials.length,
    lexical: coordinateTrials.filter((trial) => trial.label),
  },
  broadHingeControl: hingeLexical,
  block10Boundary: {
    increasing: { coords: block10Increasing, plaintext: decodePair(block10Increasing) },
    reversePublic: { coords: block10Reverse, plaintext: "THE" },
    decision: "do not infer a reversal rule retrospectively",
  },
}, null, 2));
