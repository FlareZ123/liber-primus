"use strict";

/**
 * SFT: authenticated source indices 25..29 form THEIR NUMBERS ARE THE
 * DIRECTION; solved p57 circumference shedding reduces that page corridor to
 * p27, whose pre-existing red-span parser uniquely yields WE/MUST/SHED and
 * contains the unique DIVINITY-within carrier.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
const readJson = (relative) => JSON.parse(read(relative));

const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const annotations = readJson("resources/liber-primus/lp2-ink-annotations.json");
const grid = readJson("resources/liber-primus/lp2-grid-256.json");
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const alphabet = new Map(corpus.runes.map((rune, index) => [rune, index]));
const rawPages = transcription.split("%");

/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if (n < 2) return false;
  for (let divisor = 2; divisor * divisor <= n; divisor += 1) {
    if (n % divisor === 0) return false;
  }
  return true;
}

/** @param {number} n @returns {number|null} */
function primeRank(n) {
  if (!isPrime(n)) return null;
  let rank = 0;
  for (let value = 2; value <= n; value += 1) {
    if (isPrime(value)) rank += 1;
  }
  return rank;
}

/** @param {number} n @returns {number} */
function phi(n) {
  let result = n;
  let remaining = n;
  for (let p = 2; p * p <= remaining; p += 1) {
    if (remaining % p !== 0) continue;
    while (remaining % p === 0) remaining /= p;
    result -= result / p;
  }
  if (remaining > 1) result -= result / remaining;
  return result;
}

/** @param {number[]} values @returns {number} */
function primeSum(values) {
  return values.reduce((sum, value) => sum + corpus.prime[value], 0);
}

/** @param {number[]} values @returns {string} */
function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/**
 * @param {number[][]} parts
 * @returns {{inner:number[][],removed:number[]}}
 */
function shed(parts) {
  const removed = [];
  const inner = parts.map((part) => {
    if (!part.length) return [];
    if (part.length === 1) {
      removed.push(part[0]);
      return [];
    }
    removed.push(part[0], part.at(-1));
    return part.slice(1, -1);
  });
  return {inner, removed};
}

/** @param {number[]} values @returns {number[]} */
function shedCorridor(values) {
  assert.ok(values.length % 2 === 1);
  let current = values.slice();
  while (current.length > 1) current = current.slice(1, -1);
  return current;
}

/**
 * @param {number} physicalPage
 * @returns {Array<{start:number,end:number,inds:number[]}>}
 */
function pageWords(physicalPage) {
  const source = rawPages[physicalPage <= 49 ? physicalPage : physicalPage - 1] || "";
  let offset = 0;
  let start = -1;
  let current = [];
  const words = [];

  function flush() {
    if (!current.length) return;
    words.push({start, end: offset, inds: current});
    start = -1;
    current = [];
  }

  for (const char of source) {
    if (alphabet.has(char)) {
      if (!current.length) start = offset;
      current.push(alphabet.get(char));
      offset += 1;
    } else if (char === "/" || /\s/u.test(char)) {
    } else {
      flush();
    }
  }
  flush();
  return words;
}

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");

const sourceWords = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());

assert.equal(sourceWords.length, 43);
assert.deepEqual(
  sourceWords.slice(25, 30),
  ["THEIR", "NUMBERS", "ARE", "THE", "DIRECTION"]
);

const corridor = [25, 26, 27, 28, 29];
assert.deepEqual(shedCorridor(corridor), [27]);
assert.equal(sourceWords[27], "ARE");

const p57 = pageWords(57).map((word) => ({
  name: translit(word.inds),
  sum: primeSum(word.inds),
}));
assert.equal(p57.length, 20);
assert.deepEqual(
  p57.slice(8, 14).map((word) => word.name),
  ["WE", "MUST", "SHED", "OUR", "OWN", "CIRCUMFERENCES"]
);
const p57Sums = new Set(p57.map((word) => word.sum));
const p57BySum = new Map(p57.map((word) => [word.sum, word.name]));

const p27Annotation = annotations.pages.find((page) => page.page === 27);
assert.ok(p27Annotation);
const p27Span = p27Annotation.red_spans[0];
const p27Heading = [...p27Span.runes].map((rune) => alphabet.get(rune));
const p27Words = pageWords(27).filter(
  (word) =>
    word.start >= p27Span.start &&
    word.end <= p27Span.start + p27Span.length
);
const p27Marker = p27Annotation.large_punctuation.find(
  (mark) => mark[0] === p27Span.start + p27Span.length
);
assert.deepEqual(p27Words.map((word) => word.inds.length), [3, 12, 4]);
assert.deepEqual(p27Marker, [19, 13, "red"]);

const headingRank = primeRank(primeSum(p27Heading));
assert.equal(headingRank, 186);
assert.equal(p57BySum.get(186), "MUST");
assert.equal(grid.bytes[186], 19);
assert.equal(p27Span.length, 19);
assert.equal(p27Heading[0], 19);

const firstShed = shed(p27Words.map((word) => word.inds));
const firstInner = firstShed.inner.flat();
assert.equal(firstInner.length, 13);
assert.equal(firstInner.length, p27Marker[1]);
const firstRank = primeRank(primeSum(firstInner));
assert.equal(firstRank, 122);
assert.equal(grid.bytes[firstRank], 86);
assert.equal(p57BySum.get(86), "WE");

const secondShed = shed(firstShed.inner);
assert.equal(primeSum(secondShed.removed), 233);
assert.equal(phi(233), 232);
assert.equal(p57BySum.get(232), "SHED");

const p27Values = [186, 86, 232];
const ordered = p27Values.slice().sort((left, right) => left - right);
assert.deepEqual(ordered, [86, 186, 232]);
assert.deepEqual(ordered.map((value) => p57BySum.get(value)), ["WE", "MUST", "SHED"]);

const passingRedPages = [];
for (const page of annotations.pages) {
  const words = pageWords(page.page);
  for (const redSpan of page.red_spans || []) {
    const runes = [...redSpan.runes].map((rune) => alphabet.get(rune));
    const rank = primeRank(primeSum(runes));
    const spanWords = words.filter(
      (word) =>
        word.start >= redSpan.start &&
        word.end <= redSpan.start + redSpan.length
    );
    const first = shed(spanWords.map((word) => word.inds));
    const inner = first.inner.flat();
    const mark = (page.large_punctuation || []).find(
      (candidate) => candidate[0] === redSpan.start + redSpan.length
    );
    const innerRank = primeRank(primeSum(inner));

    const fullSourceWord = rank !== null && p57Sums.has(rank);
    const selfCheck =
      rank !== null &&
      rank >= 0 &&
      rank < 256 &&
      grid.bytes[rank] === redSpan.length &&
      runes[0] === redSpan.length;
    const markerCheck = Boolean(mark) && inner.length === mark[1];
    const shedSourceWord =
      innerRank !== null &&
      innerRank >= 0 &&
      innerRank < 256 &&
      p57Sums.has(grid.bytes[innerRank]);

    if (fullSourceWord && selfCheck && markerCheck && shedSourceWord) {
      passingRedPages.push(page.page);
    }
  }
}
assert.deepEqual(passingRedPages, [27]);

const corridorHits = [];
for (let start = 0; start + 4 < sourceWords.length; start += 1) {
  const indices = [start, start + 1, start + 2, start + 3, start + 4];
  const [center] = shedCorridor(indices);
  if (passingRedPages.includes(center)) {
    corridorHits.push({
      start,
      end: start + 4,
      center,
      words: sourceWords.slice(start, start + 5),
    });
  }
}
assert.equal(sourceWords.length - 4, 39);
assert.deepEqual(corridorHits, [{
  start: 25,
  end: 29,
  center: 27,
  words: ["THEIR", "NUMBERS", "ARE", "THE", "DIRECTION"],
}]);

const completeUnknownWords = [];
const unknownSource = rawPages.slice(0, 55).join("%");
let complete = [];
function finishComplete() {
  if (!complete.length) return;
  completeUnknownWords.push(complete);
  complete = [];
}
for (const char of unknownSource) {
  if (alphabet.has(char)) {
    complete.push(alphabet.get(char));
  } else if (char === "%" || char === "/" || /\s/u.test(char)) {
  } else {
    finishComplete();
  }
}
finishComplete();

const twelveRuneWords = completeUnknownWords.filter((word) => word.length === 12);
assert.equal(twelveRuneWords.length, 18);
const divinityHits = twelveRuneWords.filter(
  (word) => primeSum(word.slice(2, -2)) === 376
);
assert.equal(divinityHits.length, 1);
assert.equal(translit(divinityHits[0]), "EORNSOOCAEYEE");
assert.equal(translit(divinityHits[0].slice(2, -2)), "NSOOCAEY");
assert.equal(p57BySum.get(376), "DIUINITY");

console.log("PASS numbers-direction corridor sheds to p27");
console.log(JSON.stringify({
  sourceClause: sourceWords.slice(25, 30),
  corridorLayers: [[25,26,27,28,29],[26,27,28],[27]],
  selectedPage: 27,
  p27Heading: {
    lengths: p27Words.map((word) => word.inds.length),
    primeRank: headingRank,
    fullWord: p57BySum.get(headingRank),
    firstShedLength: firstInner.length,
    firstShedTableWord: p57BySum.get(grid.bytes[firstRank]),
    secondShellPhi: phi(primeSum(secondShed.removed)),
    secondShellWord: p57BySum.get(phi(primeSum(secondShed.removed))),
    ordered: ordered.map((value) => [value, p57BySum.get(value)]),
  },
  controls: {
    signedFiveWordWindows: sourceWords.length - 4,
    passingRedPages,
    corridorHits,
    twelveRuneWords: twelveRuneWords.length,
    divinityWithinHits: divinityHits.length,
  },
}, null, 2));
