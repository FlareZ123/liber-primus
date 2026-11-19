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

const block9Path = [[18,15],[18,16]];
const cipher = block9Path.map(([row, column]) => cell(row, column));
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

// Block10: the prospectively sealed node shares its center with the lower
// outer block9 node, fixing the endpoint before plaintext is read.
const block9LowerOuter = selectorHits[0].points[2];
assert.deepEqual(block9LowerOuter, [19,16]);

const block10Packet = [22,11,22];
const block10Hits = findExactTriples(block10Packet);
assert.deepEqual(block10Hits, [{
  radius: 1,
  axis: "V",
  points: [[18,16],[19,16],[20,16]],
}]);
assert.deepEqual(block10Hits[0].points[1], block9LowerOuter);

const block10Derived = deriveKey(block10Packet);
assert.deepEqual(block10Derived, {
  unrotated: [22,10,22],
  rotation: 2,
  key: [22,22,10],
});

// Advance the authenticated source pointer one word: 16 ARE, 17 THE,
// 18 MAP, 19 THEIR. The map pair is row19, columns16/17. Direction must
// terminate at the shared state node (19,16), so it is 17 -> 16.
assert.deepEqual(sourceWords.slice(16,20), ["ARE","THE","MAP","THEIR"]);
const block10Path = [[19,17],[19,16]];
assert.deepEqual(block10Path[1], block9LowerOuter);
const block10Cipher = block10Path.map(([row,column]) => cell(row,column));
assert.deepEqual(block10Cipher, [24,11]);
const block10Plain = block10Cipher.map((value,index) => mod29(value - block10Derived.key[index]));
assert.deepEqual(block10Plain, [2,18]);
assert.equal(known.get(block10Plain.join(",")), "THE");

// Charge the four cardinal neighbors in both orientations. The source pointer
// specifically selects column17, while the shared node fixes the endpoint.
const neighbors = [[18,16],[20,16],[19,15],[19,17]];
const neighborTrials = [];
for (const neighbor of neighbors) {
  for (const coords of [[neighbor,block9LowerOuter],[block9LowerOuter,neighbor]]) {
    const trialCipher = coords.map(([row,column]) => cell(row,column));
    const trialPlain = trialCipher.map((value,index) => mod29(value - block10Derived.key[index]));
    neighborTrials.push({
      coords,
      plaintext: trialPlain,
      label: known.get(trialPlain.join(",")) || null,
    });
  }
}
assert.deepEqual(neighborTrials.filter((trial) => trial.label), [
  { coords: [[19,15],[19,16]], plaintext: [7,18], label: "WE" },
  { coords: [[19,17],[19,16]], plaintext: [2,18], label: "THE" },
]);
assert.deepEqual(neighborTrials.find((trial) =>
  JSON.stringify(trial.coords) === JSON.stringify(block10Path)), {
  coords: block10Path,
  plaintext: [2,18],
  label: "THE",
});

// Stop at block11. Its state packet has two placements, so the key-source
// selector is no longer unique and no map continuation is licensed.
const block11Packet = [11,17,11];
const block11Hits = findExactTriples(block11Packet);
assert.equal(block11Hits.length, 2);

console.log(JSON.stringify({
  status: "PASS",
  sourceSelector: selector,
  uniqueGridHit: selectorHits,
  publicGeometryMatchesAcrossAllLength13Windows: sourceWindowPublicMatches,
  block9Key,
  hinge: selector.end,
  mapPhrase: sourceWords.slice(selector.end, selector.end + 4),
  path: block9Path,
  cipher,
  plaintext: "OF",
  coordinateFamily: {
    cases: coordinateTrials.length,
    lexical: coordinateTrials.filter((trial) => trial.label),
  },
  broadHingeControl: hingeLexical,
  block10: {
    packet: block10Packet,
    node: block10Hits[0],
    key: block10Derived,
    path: block10Path,
    cipher: block10Cipher,
    plaintext: "THE",
    sharedEndpoint: block9LowerOuter,
    neighborLexical: neighborTrials.filter((trial) => trial.label),
  },
  stop: {
    block11Packet,
    exactPlacements: block11Hits.length,
    decision: "stop: key-source packet is no longer unique",
  },
}, null, 2));
