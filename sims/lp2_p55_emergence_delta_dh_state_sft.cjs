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

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function modPow(base, exponent, modulus) {
  let result = 1;
  let b = base % modulus;
  let e = exponent;
  while (e > 0) {
    if (e % 2 === 1) result = (result * b) % modulus;
    b = (b * b) % modulus;
    e = Math.floor(e / 2);
  }
  return result;
}

/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) {
    if (n % d === 0) return false;
  }
  return true;
}

/** @param {number[]} values @returns {number[]} */
function h4(values) {
  assert.equal(values.length, 4);
  return [
    mod29(values[0] - values[3]),
    mod29(values[1] - values[2]),
    mod29(values[1] + values[2]),
    mod29(values[0] + values[3]),
  ];
}

/**
 * @param {number[][]} wordValues
 * @returns {number[]}
 */
function hiddenRuneCounts(wordValues) {
  let active = wordValues.map((word) => word.length);
  const counts = [active.reduce((sum, length) => sum + length, 0)];

  while (active.length) {
    const next = [];
    for (const length of active) {
      if (length === 1) continue;
      const innerLength = length - 2;
      if (innerLength > 1) next.push(innerLength);
    }
    active = next;
    counts.push(active.reduce((sum, length) => sum + length, 0));
  }
  return counts;
}

/** @param {number[]} counts @returns {number[]} */
function dropResidues(counts) {
  assert.ok(counts.length >= 7);
  return counts.slice(0, 6).map((count, index) =>
    mod29(count - counts[index + 1])
  );
}

const raw = read("resources/lp2-transcription.txt");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runePattern = /[\u16A0-\u16FF]/u;

const segments = raw.split("%").slice(0, 55);
const stream = segments.join("%");

/** @typedef {{page:number,value:number}[]} Word */
/** @type {Word[]} */
const words = [];
/** @type {{page:number,value:number}[]} */
let current = [];
let runePage = 0;

function finishWord() {
  if (!current.length) return;
  words.push(current);
  current = [];
}

for (const character of stream) {
  if (runePattern.test(character)) {
    current.push({page: runePage, value: runeIndex.get(character)});
  } else if (character === "%") {
    runePage += 1;
  } else if (character === "/" || /\s/u.test(character)) {
    // Printed line and page wraps preserve a word.
  } else {
    finishWord();
  }
}
finishWord();

/** @param {number} page @returns {number} */
function physicalPage(page) {
  return page >= 50 ? page + 1 : page;
}

/** @type {Map<number, number[][]>} */
const completeWordsByPhysicalPage = new Map();
for (let page = 0; page < segments.length; page += 1) {
  const completeWords = words
    .filter((word) => word[0].page === page && word[word.length - 1].page === page)
    .map((word) => word.map((site) => site.value));
  completeWordsByPhysicalPage.set(physicalPage(page), completeWords);
}
completeWordsByPhysicalPage.set(50, []);

const p55Words = completeWordsByPhysicalPage.get(55);
assert.ok(p55Words);
assert.equal(p55Words.length, 16);

const counts = hiddenRuneCounts(p55Words);
assert.deepEqual(counts, [75, 41, 23, 7, 5, 3, 0]);

const drops = dropResidues(counts);
assert.deepEqual(drops, [5, 18, 16, 2, 2, 3]);

// Reconstruct the complete DH state from the typed drop roles
// [g, A-B, K-b, K, K, e].
const g = drops[0];
const aMinusB = drops[1];
const kMinusB = drops[2];
const K = drops[3];
assert.equal(drops[4], K);
const e = drops[5];
const b = mod29(K - kMinusB);

assert.deepEqual({g, K, e, b}, {g: 5, K: 2, e: 3, b: 15});

const productMinusOne = b * e - 1;
const modulusCandidates = [];
for (let order = 1; order <= productMinusOne; order += 1) {
  if (productMinusOne % order !== 0) continue;
  const candidate = order + 1;
  if (candidate > b && isPrime(candidate)) modulusCandidates.push(candidate);
}
assert.deepEqual(modulusCandidates, [23]);
const p = modulusCandidates[0];

const B = modPow(g, b, p);
const A = mod29(aMinusB + B);
const aCandidates = [];
for (let candidate = 1; candidate < p; candidate += 1) {
  if (
    modPow(g, candidate, p) === A
    && modPow(B, candidate, p) === K
  ) {
    aCandidates.push(candidate);
  }
}
assert.deepEqual(aCandidates, [6]);
const a = aCandidates[0];
const q = e + 1;

const reconstructed = {p, g, a, b, A, B, K, e, q};
assert.deepEqual(reconstructed, {
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
  e: 3,
  q: 4,
});

assert.equal(modPow(g, a, p), A);
assert.equal(modPow(g, b, p), B);
assert.equal(modPow(A, b, p), K);
assert.equal(modPow(B, a, p), K);
assert.equal((b * e) % (p - 1), 1);

assert.deepEqual(counts.slice(-4), [g + K, g, e, 0]);
assert.deepEqual(h4(counts.slice(-4)), [g + K, K, A, g + K]);
assert.equal(counts[2], p);

const target = [g, mod29(A - B), mod29(K - b), K, K, e];
assert.deepEqual(target, drops);

const variants = new Map([
  ["forward", target],
  ["negative", target.map((value) => mod29(-value))],
  ["reverse", target.slice().reverse()],
  ["reverse-negative", target.map((value) => mod29(-value)).reverse()],
]);

let chargedWindows = 0;
let eligibleWindows = 0;
/** @type {Map<string, Array<{physicalPage:number,startWord:number,counts:number[],drops:number[]}>>} */
const hits = new Map([...variants.keys()].map((name) => [name, []]));

for (let page = 0; page <= 55; page += 1) {
  const pageWords = completeWordsByPhysicalPage.get(page) || [];
  for (let start = 0; start + 16 <= pageWords.length; start += 1) {
    chargedWindows += 1;
    const windowCounts = hiddenRuneCounts(pageWords.slice(start, start + 16));
    if (windowCounts.length < 7) continue;
    eligibleWindows += 1;
    const windowDrops = dropResidues(windowCounts);

    for (const [name, expected] of variants) {
      if (windowDrops.every((value, index) => value === expected[index])) {
        hits.get(name).push({
          physicalPage: page,
          startWord: start + 1,
          counts: windowCounts,
          drops: windowDrops,
        });
      }
    }
  }
}

assert.equal(chargedWindows, 2039);
assert.equal(eligibleWindows, 224);
assert.deepEqual(hits.get("forward"), [{
  physicalPage: 55,
  startWord: 1,
  counts: [75, 41, 23, 7, 5, 3, 0],
  drops: [5, 18, 16, 2, 2, 3],
}]);
assert.deepEqual(hits.get("negative"), []);
assert.deepEqual(hits.get("reverse"), []);
assert.deepEqual(hits.get("reverse-negative"), []);

console.log(JSON.stringify({
  status: "PASS",
  p55: {
    counts,
    drops,
    dropTyping: ["g", "A-B", "K-b", "K", "K", "e"],
    terminalCounts: counts.slice(-4),
    terminalTyping: ["g+K", "g", "e", "F"],
    terminalH4: h4(counts.slice(-4)),
    terminalH4Typing: ["g+K", "K", "A", "g+K"],
  },
  reconstructed,
  controls: {
    chargedWindows,
    eligibleWindows,
    variantHits: Object.fromEntries(
      [...hits].map(([name, rows]) => [name, rows.length])
    ),
    forwardHits: hits.get("forward"),
  },
}, null, 2));
