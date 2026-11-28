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
    assert.ok(token, "unmapped GP spelling " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

const clear = signedText.split("-----BEGIN PGP SIGNATURE-----")[0];
const signed = clear.slice(clear.indexOf("Hello."))
  .split(/[^A-Za-z0-9]+/)
  .filter((token) => /^[A-Za-z]+$/.test(token))
  .map((label, index) => ({ index, label: label.toUpperCase(), gp: gp(label) }));
const fourRuneTargets = signed.filter((word) => word.gp.length === 4);
assert.equal(fourRuneTargets.length, 10);

const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const words = [];
let current = [];
let startPage = -1;
let endPage = -1;
let startOffset = -1;

/** Flush one canonical printed word. */
function flush() {
  if (current.length === 0) return;
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
  for (const ch of parts[block]) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (current.length === 0) {
        startPage = page;
        startOffset = offset;
      }
      endPage = page;
      current.push(value);
      offset += 1;
    } else if (!/[\s/]/u.test(ch)) {
      flush();
    }
  }
}
flush();

const q = 4;
const qCentered = words.filter((word) =>
  word.page === word.endPage &&
  word.values.length === 5 &&
  word.values[2] === q
);
assert.equal(qCentered.length, 9);

/** @param {number[]} values @returns {number[][]} */
function uniquePermutations(values) {
  const result = new Map();
  /** @param {number[]} prefix @param {number[]} rest */
  function visit(prefix, rest) {
    if (rest.length === 0) {
      result.set(prefix.join(","), prefix.slice());
      return;
    }
    for (let index = 0; index < rest.length; index += 1) {
      const next = rest.slice();
      const value = next.splice(index, 1)[0];
      visit(prefix.concat(value), next);
    }
  }
  visit([], values);
  return [...result.values()];
}

const p = 23;
const K = 2;
const e = 3;
const B = 19;
const family = new Map();

for (const first of [mod29(p + K), mod29(p - K)]) {
  for (const signedK of [K, mod29(-K)]) {
    for (const signedE of [e, mod29(-e)]) {
      for (const key of uniquePermutations([first, B, signedK, signedE])) {
        family.set(key.join(","), key);
      }
    }
  }
}
assert.equal(family.size, 192);

const hits = [];
for (const receiver of qCentered) {
  const prepared = [
    receiver.values[0],
    receiver.values[1],
    receiver.values[3],
    receiver.values[4],
  ];
  for (const target of fourRuneTargets) {
    for (const direction of ["sub", "add"]) {
      const requiredKey = prepared.map((value, index) =>
        direction === "sub"
          ? mod29(value - target.gp[index])
          : mod29(target.gp[index] - value)
      );
      if (family.has(requiredKey.join(","))) {
        hits.push({
          page: receiver.page,
          start: receiver.start,
          cipher: receiver.values,
          prepared,
          targetIndex: target.index,
          target: target.label,
          direction,
          key: requiredKey,
        });
      }
    }
  }
}

assert.deepEqual(hits, [{
  page: 36,
  start: 169,
  cipher: [2,22,4,1,20],
  prepared: [2,22,1,20],
  targetIndex: 36,
  target: "GOOD",
  direction: "sub",
  key: [25,19,27,26],
}]);

assert.deepEqual(
  hits[0].key,
  [mod29(p + K), B, mod29(-K), mod29(-e)]
);
assert.deepEqual(
  hits[0].prepared.map((value, index) => mod29(value - hits[0].key[index])),
  signed[36].gp
);

console.log(JSON.stringify({
  status: "PASS",
  qCenteredReceivers: qCentered.length,
  authenticatedFourRuneOccurrences: fourRuneTargets.length,
  distinctP6Keys: family.size,
  chargedConfigurations: qCentered.length * fourRuneTargets.length * family.size * 2,
  hits,
}, null, 2));
