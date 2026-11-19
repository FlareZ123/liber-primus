"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const base60 = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const grid256 = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);
const p50 = base60.rows.flat();
const alphabet60 = base60.alphabet;
const M = 29;

const clear = signed2016.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);
assert.ok(clear);
const sourceWords = (clear[1].match(/\b[A-Za-z]+\b/gu) || [])
  .map((word) => word.toUpperCase());
assert.equal(sourceWords.length, 43);
assert.equal(sourceWords[29], "DIRECTION");
assert.equal(sourceWords[40], "PATHS");
assert.equal(sourceWords[41], "VERIFY");

const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol: symbol.toUpperCase(), value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);

function mod29(value) {
  return ((value % M) + M) % M;
}

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

function gp0(word) {
  return gp(word).reduce((total, value) => total + value, 0);
}

function decode60(token) {
  const high = alphabet60.indexOf(token[0]);
  const low = alphabet60.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * 60 + low;
}

function low60(address) {
  assert.ok(address >= 0 && address < p50.length);
  const low = alphabet60.indexOf(p50[address][1]);
  assert.ok(low >= 0);
  return low;
}

function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1] || "";
}

function parsePhysical(text) {
  const words = [];
  const runes = [];
  let current = [];
  let start = 0;
  function flush() {
    if (!current.length) return;
    words.push({start, end: start + current.length - 1, values: current.slice()});
    current = [];
  }
  for (const character of [...text]) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      if (!current.length) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if (
      character === "-" ||
      character === "." ||
      character === "&" ||
      character === "$"
    ) {
      flush();
    }
  }
  flush();
  return {words, runes};
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function evaluate(values, x) {
  let output = 0;
  for (const value of values) output = mod29(output * x + value);
  return output;
}

function evaluateDerivative(values, x) {
  const degree = values.length - 1;
  let output = 0;
  for (let index = 0; index < degree; index += 1) {
    output = mod29(output * x + values[index] * (degree - index));
  }
  return output;
}

function h4(values) {
  assert.equal(values.length, 4);
  return [
    mod29(values[0] - values[3]),
    mod29(values[1] - values[2]),
    mod29(values[1] + values[2]),
    mod29(values[0] + values[3]),
  ];
}

const state = {p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3, q: 4};

const verifyAddress = gp0("VERIFY");
assert.equal(verifyAddress, 59);
assert.equal(p50[verifyAddress], "19");
const verifyPage = low60(verifyAddress);
const verifyFull = decode60(p50[verifyAddress]);
assert.equal(verifyPage, 9);
assert.equal(verifyFull, 69);

const p9 = parsePhysical(physicalPart(verifyPage));
assert.equal(p9.runes.length, 268);
const midpoint = (p9.runes.length - 1) / 2;
const rightWord = p9.words.find((word) => word.start > midpoint);
assert.ok(rightWord);
assert.equal(rightWord.start, 135);
assert.equal(rightWord.values.length, state.g);
assert.deepEqual(rightWord.values, [25, 4, 0, 3, 16]);
const successor = p9.runes[rightWord.end + 1];
assert.equal(successor, state.B + state.K);
const packet = [...rightWord.values, successor];
assert.deepEqual(packet, [25, 4, 0, 3, 16, 21]);
assert.equal(sum(packet), verifyFull);

const directionIndex = sum(packet.slice(0, state.K));
const pathsIndex = sum(packet.slice(state.K));
assert.equal(directionIndex, 29);
assert.equal(pathsIndex, 40);
assert.equal(sourceWords[directionIndex], "DIRECTION");
assert.equal(sourceWords[pathsIndex], "PATHS");
assert.equal(sum(packet.slice(0, 3)), directionIndex);
assert.equal(sum(packet.slice(3)), pathsIndex);

const directStateHits = [];
for (let index = 0; index < sourceWords.length; index += 1) {
  const target = gp(sourceWords[index]);
  const targetSum = sum(target);
  const matches = parsePhysical(physicalPart(index)).words.filter((word) =>
    word.values.length === target.length && sum(word.values) === targetSum
  );
  if (matches.length) {
    directStateHits.push({
      index,
      word: sourceWords[index],
      count: matches.length,
      starts: matches.map((word) => word.start),
    });
  }
}
assert.deepEqual(directStateHits, [
  {index: 6, word: "SEEKS", count: 1, starts: [128]},
  {index: 11, word: "IS", count: 1, starts: [49]},
  {index: 21, word: "IS", count: 1, starts: [170]},
  {index: 33, word: "WILL", count: 1, starts: [132]},
  {index: 34, word: "BE", count: 2, starts: [4, 249]},
  {index: 38, word: "BEWARE", count: 1, starts: [57]},
  {index: 40, word: "PATHS", count: 1, starts: [71]},
]);

const repeatedRootPages = corpus.pages
  .filter((page) => page.page >= 0 && page.page <= 55 && page.indices.length > 0)
  .filter((page) =>
    evaluate(page.indices, 24) === 0 &&
    evaluateDerivative(page.indices, 24) === 0
  )
  .map((page) => page.page);
assert.deepEqual(repeatedRootPages, [directionIndex]);

const tableValues = grid256.bytes.map((value) => value % M);
assert.equal(evaluate(tableValues, 24), 0);
assert.equal(evaluateDerivative(tableValues, 24), 0);

const pathsTarget = gp("PATHS");
assert.deepEqual(pathsTarget, [13, 24, 2, 15]);
assert.equal(sum(pathsTarget), 54);
const p40 = parsePhysical(physicalPart(pathsIndex));
const p40Matches = p40.words.filter((word) =>
  word.values.length === pathsTarget.length &&
  sum(word.values) === sum(pathsTarget)
);
assert.equal(p40Matches.length, 1);
assert.equal(p40Matches[0].start, 71);
assert.deepEqual(p40Matches[0].values, [4, 15, 14, 21]);

const localKey = p40Matches[0].values.map((value, index) =>
  mod29(value - pathsTarget[index])
);
assert.deepEqual(localKey, [20, 20, 12, 6]);
assert.deepEqual(h4(localKey), [14, 8, 3, 26]);
assert.deepEqual(h4(localKey), [mod29(-state.b), state.A, state.e, 26]);

console.log(JSON.stringify({
  status: "PASS",
  verifyToPacket: {
    address: verifyAddress,
    p50: p50[verifyAddress],
    lowPage: verifyPage,
    heldoutFull: verifyFull,
    midpoint,
    rightWordStart: rightWord.start,
    rawPacket: packet,
    rawSum: sum(packet),
    K: state.K,
    split: [directionIndex, pathsIndex],
    sourceWords: [sourceWords[directionIndex], sourceWords[pathsIndex]],
    zeroDegeneracy: "cut3 has the same sums because packet[2]=F=0; K=2 fixes the boundary",
  },
  directIndexCalibration: {hits: directStateHits},
  directionBranch: {
    sourceIndex: directionIndex,
    page: directionIndex,
    repeatedRoot: 24,
    pagesWithRepeatedRoot24: repeatedRootPages,
    tableRepeatedRoot24: true,
  },
  pathsBranch: {
    sourceIndex: pathsIndex,
    page: pathsIndex,
    target: pathsTarget,
    uniqueReceiver: {
      start: p40Matches[0].start,
      cipher: p40Matches[0].values,
      gp0: sum(p40Matches[0].values),
    },
    localCandidate: {
      plaintext: "PATHS",
      key: localKey,
      keyShell: h4(localKey),
      shellLabels: "[-b,A,e,HERE[p]]",
      chronology: "shell serialization is retrospective",
    },
  },
}, null, 2));
