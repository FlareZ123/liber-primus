"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8").replace(/\r/g, "");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const raw = read("resources/liber-primus/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);
const segments = raw.split(/^\s*%\s*$/m).slice(0, 55);

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

function shell(values) {
  const out = [];
  for (let left = 0, right = values.length - 1; left < right; left += 1, right -= 1) {
    out.push(mod29(values[left] - values[right]), mod29(values[left] + values[right]));
  }
  if (values.length % 2) out.push(values[(values.length - 1) / 2]);
  return out;
}

function hsum(values) {
  return mod29(shell(values).reduce((sum, value) => sum + value, 0));
}

function gp0(values) {
  return mod29(values.reduce((sum, value) => sum + value, 0));
}

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
    assert.ok(token, `unmapped GP spelling: ${word}`);
    values.push(token.value);
    index += token.symbol.length;
  }
  return values;
}

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

const pages = segments.map((text, segment) => ({
  page: segment >= 50 ? segment + 1 : segment,
  text,
  offset: 0,
  words: [],
}));

let current = [];
let startSegment = 0;
let endSegment = 0;
let startOffset = 0;
function flushCanonical() {
  if (!current.length) return;
  if (startSegment === endSegment) {
    const page = pages[startSegment];
    page.words.push({
      ordinal: page.words.length + 1,
      start: startOffset,
      values: current.slice(),
      gp0: gp0(current),
    });
  }
  current = [];
}

for (let segment = 0; segment < segments.length; segment += 1) {
  for (const char of [...segments[segment]]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) {
        startSegment = segment;
        startOffset = pages[segment].offset;
      }
      endSegment = segment;
      current.push(value);
      pages[segment].offset += 1;
    } else if (char === "/" || /\s/u.test(char)) {
      continue;
    } else {
      flushCanonical();
    }
  }
}
flushCanonical();

let windowCount = 0;
const selectorHits = [];
for (const page of pages) {
  for (let index = 0; index + 3 < page.words.length; index += 1) {
    windowCount += 1;
    const words = page.words.slice(index, index + 4);
    const values = words.map((word) => word.gp0);
    const [a, b, c, terminal] = values;
    if (b !== a + 1 || c !== b + 1 || a < 1 || c >= sourceWords.length) continue;
    if (terminal >= sourceWords.length || sourceWords[terminal] !== sourceWords[a - 1]) continue;
    selectorHits.push({
      page: page.page,
      ordinals: words.map((word) => word.ordinal),
      starts: words.map((word) => word.start),
      gp0: values,
      reconstructedIndices: [a - 1, a, b, c],
      reconstructedWords: sourceWords.slice(a - 1, c + 1),
    });
  }
}

assert.equal(windowCount, 2699);
assert.deepEqual(selectorHits, [{
  page: 0,
  ordinals: [53, 54, 55, 56],
  starts: [235, 237, 244, 245],
  gp0: [13, 14, 15, 7],
  reconstructedIndices: [12, 13, 14, 15],
  reconstructedWords: ["THE", "WAY", "ITS", "WORDS"],
}]);

const pool = new Map();
for (const section of solved.sections) {
  for (const values of runeWords(section.source_text)) {
    pool.set(values.join(","), {
      label: values.map((value) => corpus.translit[value]).join(""),
      values,
    });
  }
}
for (const word of sourceWords) {
  const values = gpWord(word);
  pool.set(values.join(","), { label: word, values });
}
const seven = [...pool.values()].filter((candidate) => candidate.values.length === 7);
assert.equal(pool.size, 293);
assert.equal(seven.length, 36);

const receivers = [];
for (let segment = 0; segment < segments.length; segment += 1) {
  const page = segment >= 50 ? segment + 1 : segment;
  let offset = 0;
  let values = [];
  let start = 0;
  let breaks = [];

  function flushPhysical() {
    if (values.length === 7) receivers.push({ page, start, values: values.slice(), breaks: breaks.slice() });
    values = [];
    breaks = [];
  }

  for (const char of [...segments[segment]]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!values.length) start = offset;
      values.push(value);
      offset += 1;
    } else if (char === "/") {
      if (values.length) breaks.push(values.length);
    } else if (/\s/u.test(char)) {
      continue;
    } else {
      flushPhysical();
    }
  }
  flushPhysical();
}

const splitTwo = receivers.filter((receiver) => receiver.breaks.length === 1 && receiver.breaks[0] === 2);
assert.equal(splitTwo.length, 15);

const runHits = [];
for (const receiver of splitTwo) {
  const carrier = gp0(receiver.values);
  for (const sign of [1, -1]) {
    for (const candidate of seven) {
      const key = receiver.values.map((value, index) =>
        mod29(sign === 1 ? value - candidate.values[index] : candidate.values[index] - value));
      const signature = [
        hsum(key),
        hsum(key.slice(0, 2)),
        carrier,
        hsum(key.slice(2)),
      ];
      if (signature[1] === signature[0] + 1 &&
          signature[2] === signature[1] + 1 &&
          signature[3] === signature[2] + 1) {
        runHits.push({
          page: receiver.page,
          start: receiver.start,
          sign: sign === 1 ? "C-P" : "P-C",
          label: candidate.label,
          plaintext: candidate.values,
          key,
          signature,
        });
      }
    }
  }
}

const plain = [23,18,1,3,16,18,23];
const key = [21,4,15,19,5,12,10];
const cipher = [15,22,16,22,21,1,4];
assert.deepEqual(runHits, [{
  page: 0,
  start: 237,
  sign: "C-P",
  label: "DEVOTED",
  plaintext: plain,
  key,
  signature: [12,13,14,15],
}]);
assert.deepEqual(plain.map((value, index) => mod29(value + key[index])), cipher);
assert.deepEqual(runHits[0].signature.map((index) => sourceWords[index]), ["THE","WAY","ITS","WORDS"]);

function permutations(values) {
  if (values.length <= 1) return [values.slice()];
  const out = [];
  for (let index = 0; index < values.length; index += 1) {
    for (const suffix of permutations(values.slice(0, index).concat(values.slice(index + 1)))) {
      out.push([values[index], ...suffix]);
    }
  }
  return out;
}

const orders = permutations(["full","prefix","carrier","suffix"]);
const orderHits = new Map(orders.map((order) => [order.join(">"), []]));
for (const receiver of splitTwo) {
  const carrier = gp0(receiver.values);
  for (const sign of [1, -1]) {
    for (const candidate of seven) {
      const residual = receiver.values.map((value, index) =>
        mod29(sign === 1 ? value - candidate.values[index] : candidate.values[index] - value));
      const fields = {
        full: hsum(residual),
        prefix: hsum(residual.slice(0, 2)),
        carrier,
        suffix: hsum(residual.slice(2)),
      };
      for (const order of orders) {
        const signature = order.map((field) => fields[field]);
        if (signature[1] === signature[0] + 1 &&
            signature[2] === signature[1] + 1 &&
            signature[3] === signature[2] + 1) {
          orderHits.get(order.join(">")).push({
            page: receiver.page,
            start: receiver.start,
            sign: sign === 1 ? "C-P" : "P-C",
            label: candidate.label,
            signature,
          });
        }
      }
    }
  }
}

const nonzeroOrders = [...orderHits.entries()]
  .filter(([, hits]) => hits.length)
  .map(([order, hits]) => ({ order, hits }));

assert.deepEqual(nonzeroOrders, [
  {
    order: "full>prefix>carrier>suffix",
    hits: [{ page: 0, start: 237, sign: "C-P", label: "DEVOTED", signature: [12,13,14,15] }],
  },
  {
    order: "full>carrier>suffix>prefix",
    hits: [{ page: 35, start: 110, sign: "C-P", label: "TOTIENT", signature: [9,10,11,12] }],
  },
]);

console.log(JSON.stringify({
  status: "PASS",
  selector: { windows: windowCount, hits: selectorHits },
  decoder: {
    sourceNativeVectors: pool.size,
    sevenRuneCandidates: seven.length,
    splitTwoReceivers: splitTwo.length,
    chargedCases: splitTwo.length * seven.length * 2,
    hits: runHits,
    reencryption: cipher,
  },
  orderingControl: { permutations: orders.length, nonzeroOrders },
}, null, 2));
