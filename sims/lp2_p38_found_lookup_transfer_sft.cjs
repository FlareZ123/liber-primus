"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source = read("resources/liber-primus/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const parts = source.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const state = Object.freeze({ p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 });

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {string} text @returns {Array<{index:number,start:number,end:number,values:number[]}>} */
function parseWords(text) {
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({ index: words.length + 1, start, end: offset - 1, values: current.slice() });
    current = [];
  };
  for (const char of [...text]) {
    if (runeSet.has(char)) {
      if (!current.length) start = offset;
      current.push(runeIndex.get(char));
      offset += 1;
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return words;
}

/** @param {number} page @returns {string[]} */
function runeLines(page) {
  return physicalPart(page).trim().split("/").filter((line) => /[\u16A0-\u16FF]/u.test(line));
}

/** @param {string} line @returns {number[]} */
function runeValues(line) {
  return [...line].map((char) => runeIndex.get(char)).filter((value) => value !== undefined);
}

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
    const token = gpTokens.find((candidate) => normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, "unmapped GP spelling " + word);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {number[]} values @returns {number} */
function encode29(values) {
  let encoded = 0;
  for (const value of values) encoded = encoded * 29 + value;
  return encoded;
}

const clear = signed.split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\r?\n\r?\n/u).slice(1).join("\n");
const targets = [...new Map(
  (clear.match(/[A-Za-z]+/g) || [])
    .map((word) => word.toUpperCase())
    .map((word) => [word, gp(word)])
    .filter(([, values]) => values.length === 5)
).entries()].map(([word, values]) => ({ word, values }));
assert.deepEqual(targets.map((target) => target.word),
  ["HELLO", "EMPTY", "SEEKS", "LIBER", "WORDS", "FOUND", "FALSE"]);

const receivers = parseWords(physicalPart(38))
  .filter((word) => word.values.length === 5 && word.end === 53);
assert.equal(receivers.length, 1);
const receiver = receivers[0];
assert.deepEqual(receiver, {
  index: 10,
  start: 49,
  end: 53,
  values: [19, 25, 22, 26, 3],
});

const p28 = runeLines(28);
const lines = { HERE: runeValues(p28[0]), DH: runeValues(p28[5]) };
const options = [];
const byValue = new Map();
for (const [lineName, values] of Object.entries(lines)) {
  for (const [field, oneBasedIndex] of Object.entries(state)) {
    const value = values[oneBasedIndex - 1];
    const descriptor = lineName + "[" + field + "]";
    options.push({ descriptor, value });
    if (!byValue.has(value)) byValue.set(value, []);
    byValue.get(value).push(descriptor);
  }
}
assert.equal(options.length, 14);

const hits = [];
for (const target of targets) {
  for (const sign of [-1, 1]) {
    const key = receiver.values.map((cipher, index) =>
      sign === 1
        ? mod29(target.values[index] - cipher)
        : mod29(cipher - target.values[index])
    );
    const descriptorLists = key.map((value) => byValue.get(value) || []);
    if (!descriptorLists.every((descriptors) => descriptors.length)) continue;
    hits.push({
      target: target.word,
      sign,
      key,
      descriptorLists,
      aliasCount: descriptorLists.reduce((count, descriptors) => count * descriptors.length, 1),
    });
  }
}
assert.equal(14 ** 5 * 2, 1075648);
assert.deepEqual(hits, [{
  target: "FOUND",
  sign: 1,
  key: [10, 7, 8, 12, 20],
  descriptorLists: [
    ["HERE[a]"],
    ["HERE[b]"],
    ["DH[A]", "DH[K]"],
    ["DH[a]"],
    ["DH[p]"],
  ],
  aliasCount: 2,
}]);

const key = hits[0].key;
const plaintext = receiver.values.map((value, index) => mod29(value + key[index]));
assert.deepEqual(plaintext, gp("FOUND"));
assert.deepEqual(
  plaintext.map((value, index) => mod29(value - key[index])),
  receiver.values
);

const targetByGp = new Map(targets.map((target) => [target.values.join(","), target.word]));
let fiveRuneWords = 0;
const fixedKeyHits = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  for (const word of parseWords(physicalPart(page))) {
    if (word.values.length !== 5) continue;
    fiveRuneWords += 1;
    const plain = word.values.map((value, index) => mod29(value + key[index]));
    const target = targetByGp.get(plain.join(","));
    if (target) fixedKeyHits.push({ page, word: word.index, start: word.start, end: word.end, target });
  }
}
assert.equal(fiveRuneWords, 318);
assert.deepEqual(fixedKeyHits, [{ page: 38, word: 10, start: 49, end: 53, target: "FOUND" }]);

const numericValues = [...new Set(options.map((option) => option.value))];
assert.deepEqual(numericValues.slice().sort((a, b) => a - b),
  [3, 5, 7, 8, 10, 12, 17, 20, 22, 23, 24, 26, 28]);
const space = 29 ** 5;
const foundSeen = new Uint8Array(space);
const allSeen = new Uint8Array(space);
let foundCoverage = 0;
let allCoverage = 0;
const found = targets.find((target) => target.word === "FOUND");
assert.ok(found);

for (const k0 of numericValues)
for (const k1 of numericValues)
for (const k2 of numericValues)
for (const k3 of numericValues)
for (const k4 of numericValues) {
  const candidateKey = [k0, k1, k2, k3, k4];
  for (const sign of [-1, 1]) {
    const foundCipher = found.values.map((value, index) =>
      mod29(value - sign * candidateKey[index]));
    const foundIndex = encode29(foundCipher);
    if (!foundSeen[foundIndex]) {
      foundSeen[foundIndex] = 1;
      foundCoverage += 1;
    }
    for (const target of targets) {
      const cipher = target.values.map((value, index) =>
        mod29(value - sign * candidateKey[index]));
      const encoded = encode29(cipher);
      if (!allSeen[encoded]) {
        allSeen[encoded] = 1;
        allCoverage += 1;
      }
    }
  }
}

assert.equal(foundCoverage, 709818);
assert.equal(allCoverage, 4494629);

console.log(JSON.stringify({
  status: "PASS",
  chronology:
    "lookup grammar frozen at commit 8d10211e2094299844293fe687a7dc6ebdad8fa9 before Agent16 opened the p38 receiver",
  receiver,
  family: {
    labelConfigurations: 14 ** 5 * 2,
    hits,
  },
  recovery: {
    key,
    plaintext,
    text: plaintext.map((value) => corpus.translit[value]).join(""),
  },
  fixedKeyTransfer: { fiveRuneWords, hits: fixedKeyHits },
  exactCoverage: {
    gp29Space: space,
    foundOnly: foundCoverage,
    foundOnlyFraction: foundCoverage / space,
    allTargets: allCoverage,
    allTargetsFraction: allCoverage / space,
  },
  classification:
    "prospective transfer within a conditional p38 navigation receiver; FOUND is the sole authenticated target under the frozen HERE/DH lookup grammar",
}, null, 2));
