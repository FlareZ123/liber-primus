"use strict";

/**
 * SFT: select p0 block 4 from a locked LP1 checksum, without a language score.
 *
 * Upstream premise: the source-bounded p0 bootstrap has already recovered
 * AS I GO THE / WEATHER / TURNS and frozen the 36-candidate block-4 family.
 * This test asks whether pre-existing LP1 numerical structure selects one
 * block-4 path and stop before inspecting its English meaning.
 *
 * Run: node sims/lp2_p0_lp1_checksum_block4_selector_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const lp1 = read("resources/liber-primus/lp1-plaintext-reference.txt");
const shakespeare = read("resources/control/shakespeare_first300k.txt");
const gibran = read("resources/control/gibran_prophet_58585.txt");

const translit = corpus.translit;
const grid = corpus.pages.filter(page => page.page <= 2).flatMap(page => page.indices);
assert.equal(grid.length, 729);

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

/** @param {number} count */
function firstPrimes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) if (isPrime(n)) out.push(n);
  return out;
}

const gpPrimes = firstPrimes(29);

/** @param {number} n */
function phi(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let result = n;
  let rest = n;
  for (let p = 2; p * p <= rest; p++) {
    if (rest % p !== 0) continue;
    while (rest % p === 0) rest /= p;
    result -= result / p;
  }
  if (rest > 1) result -= result / rest;
  return result;
}

/** @param {number} n */
function mu(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let rest = n;
  let sign = 1;
  for (let p = 2; p * p <= rest; p++) {
    if (rest % p !== 0) continue;
    rest /= p;
    sign = -sign;
    if (rest % p === 0) return 0;
  }
  return rest > 1 ? -sign : sign;
}

/** @param {number} value */
const mod29 = value => (value % 29 + 29) % 29;

const tokenOrder = translit.map((token, ordinal) => ({token, ordinal}))
  .sort((a, b) => b.token.length - a.token.length);
const encodedWordCache = new Map();

/** @param {string} original */
function encodeNativeGP(original) {
  const cached = encodedWordCache.get(original);
  if (cached) return cached.slice();
  const clean = original.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < clean.length;) {
    if (clean.startsWith("ING", i)) {
      out.push(21);
      i += 3;
      continue;
    }
    if (clean.startsWith("IO", i)) {
      out.push(27);
      i += 2;
      continue;
    }
    const token = tokenOrder.find(row => clean.startsWith(row.token, i));
    if (!token) return null;
    out.push(token.ordinal);
    i += token.token.length;
  }
  encodedWordCache.set(original, out.slice());
  return out;
}

/** @param {string[]} words */
function metrics(words) {
  const encoded = words.map(encodeNativeGP);
  assert.ok(encoded.every(Boolean));
  const runes = encoded.flat();
  return {
    words: words.length,
    runes: runes.length,
    indexSum: runes.reduce((sum, value) => sum + value, 0),
    gpSum: runes.reduce((sum, value) => sum + gpPrimes[value], 0),
  };
}

// The visible LP1 matrices independently produce 233 through the already
// documented FORM -> 91st prime -> 934 -> totient route.
assert.equal(metrics(["FORM"]).gpSum, 91);
const prime91 = firstPrimes(91).at(-1);
assert.equal(prime91, 467);
const matrixValue = 2 * prime91;
assert.equal(matrixValue, 934);
assert.equal((lp1.match(/\b934\b/g) || []).length, 2);
const targetIndexSum = phi(matrixValue) / 2;
assert.equal(targetIndexSum, 233);

// The pre-existing LP1-warning twin supplies the locked word/rune/GP target.
const warningTwin = ["YOU", "KNOW", "TO", "BE", "TRUE", "TEST", "THE"];
const warningMetrics = metrics(warningTwin);
assert.deepEqual(warningMetrics, {words: 7, runes: 21, indexSum: 232, gpSum: 825});
assert.equal(phi(targetIndexSum), warningMetrics.indexSum);

// Census every seven-word window in the solved LP1 reference. The twin is
// unique even before using the target LP2 index sum 233.
const lp1Lines = lp1.split("\n")
  .filter(line => /^[A-Z][A-Z0-9 "',;]+$/.test(line.trim()) && !/^###/.test(line));
const lp1Words = lp1Lines.flatMap(line => [...line.matchAll(/[A-Z]+/g)].map(match => match[0]));
const lp1Windows = [];
for (let i = 0; i + 7 <= lp1Words.length; i++) {
  const words = lp1Words.slice(i, i + 7);
  const encoded = words.map(encodeNativeGP);
  if (encoded.some(value => value === null)) continue;
  lp1Windows.push({phrase: words.join(" "), ...metrics(words)});
}
assert.equal(lp1Windows.length, 621);
const lp1TwinHits = lp1Windows.filter(row => row.runes === 21 && row.gpSum === 825);
assert.equal(lp1TwinHits.length, 1);
assert.equal(lp1TwinHits[0].phrase, warningTwin.join(" "));
assert.equal(lp1TwinHits[0].indexSum, 232);

// The first three source-bounded blocks already fix six words and 17 runes.
const firstThreeBlocks = ["AS", "I", "GO", "THE", "WEATHER", "TURNS"];
const prefixMetrics = metrics(firstThreeBlocks);
assert.deepEqual(prefixMetrics, {words: 6, runes: 17, indexSum: 182, gpSum: 643});
const residual = {
  words: warningMetrics.words - prefixMetrics.words,
  runes: warningMetrics.runes - prefixMetrics.runes,
  indexSum: targetIndexSum - prefixMetrics.indexSum,
  gpSum: warningMetrics.gpSum - prefixMetrics.gpSum,
};
assert.deepEqual(residual, {words: 1, runes: 4, indexSum: 51, gpSum: 182});

/** @param {[number, number]} point */
const at = ([row, column]) => grid[(row - 1) * 27 + column - 1];
const directions = [
  ["up", -1, 0],
  ["down", 1, 0],
  ["left", 0, -1],
  ["right", 0, 1],
];

// Reproduce the frozen 36-candidate block-4 family, then apply only the
// precommitted numerical residual. No dictionary or plaintext score is used.
const anchor = [14, 19];
const distance = phi(translit.indexOf("NG"));
assert.equal(distance, 12);
const family = [];
for (const [centerDir, centerDr, centerDc] of directions) {
  const center = [anchor[0] + distance * centerDr, anchor[1] + distance * centerDc];
  if (center.some(value => value < 1 || value > 27)) continue;
  const nodePoints = [
    [center[0] - centerDr, center[1] - centerDc],
    center,
    [center[0] + centerDr, center[1] + centerDc],
  ];
  if (nodePoints.flat().some(value => value < 1 || value > 27)) continue;
  const rawNode = nodePoints.map(at);
  if (rawNode[1] === 0) continue;
  const derivedNode = [rawNode[0], phi(rawNode[1]), rawNode[2]];
  const rotation = mod29(derivedNode.reduce((sum, value) => sum + mu(phi(value)), 0)) % 3;
  const key = derivedNode.slice(rotation).concat(derivedNode.slice(0, rotation));

  for (const [startDir, startDr, startDc] of directions) {
    const start = [anchor[0] + distance * startDr, anchor[1] + distance * startDc];
    if (start.some(value => value < 1 || value > 27)) continue;
    for (const [readDir, readDr, readDc] of directions) {
      const stream = [];
      let row = start[0];
      let column = start[1];
      for (let i = 0; i < 20; i++) {
        if (row < 1 || row > 27 || column < 1 || column > 27) break;
        stream.push(mod29(at([row, column]) - key[i % 3]));
        row += readDr;
        column += readDc;
      }
      family.push({centerDir, center, rawNode, key, startDir, start, readDir, stream});
    }
  }
}
assert.equal(family.length, 36);

const dualSumHits = [];
const tripleHits = [];
for (const candidate of family) {
  let indexSum = 0;
  let gpSum = 0;
  for (let length = 1; length <= candidate.stream.length; length++) {
    const rune = candidate.stream[length - 1];
    indexSum += rune;
    gpSum += gpPrimes[rune];
    if (indexSum === residual.indexSum && gpSum === residual.gpSum) {
      const hit = {...candidate, length, plaintext: candidate.stream.slice(0, length)};
      dualSumHits.push(hit);
      if (length === residual.runes) tripleHits.push(hit);
    }
  }
}
assert.equal(dualSumHits.length, 2);
assert.deepEqual(dualSumHits.map(hit => hit.length).sort((a, b) => a - b), [4, 5]);
assert.equal(tripleHits.length, 1);
const selected = tripleHits[0];
assert.equal(selected.centerDir, "down");
assert.deepEqual(selected.rawNode.map(value => translit[value]), ["H", "TH", "H"]);
assert.deepEqual(selected.key.map(value => translit[value]), ["U", "H", "H"]);
assert.equal(selected.startDir, "left");
assert.deepEqual(selected.start, [14, 7]);
assert.equal(selected.readDir, "up");
assert.deepEqual(selected.plaintext.map(value => translit[value]), ["C", "O", "L", "D"]);

// Conservative control: how often does an arbitrary seven-word literary
// window find any LP1 seven-word counterpart with the same rune count and GP
// sum and LP1 index sum equal to phi(control index sum)?
const lp1MetricKeys = new Set(lp1Windows.map(row => row.runes + "|" + row.gpSum + "|" + row.indexSum));
/** @param {string} text */
function controlCensus(text) {
  const words = [...text.toUpperCase().matchAll(/[A-Z]+/g)].map(match => match[0]);
  let total = 0;
  let hits = 0;
  for (let i = 0; i + 7 <= words.length; i++) {
    const group = words.slice(i, i + 7);
    const encoded = group.map(encodeNativeGP);
    if (encoded.some(value => value === null)) continue;
    total++;
    const m = metrics(group);
    if (lp1MetricKeys.has(m.runes + "|" + m.gpSum + "|" + phi(m.indexSum))) hits++;
  }
  return {total, hits, rate: hits / total};
}
const shakespeareControl = controlCensus(shakespeare);
const gibranControl = controlCensus(gibran);
assert.deepEqual({total: shakespeareControl.total, hits: shakespeareControl.hits}, {total: 55401, hits: 35});
assert.deepEqual({total: gibranControl.total, hits: gibranControl.hits}, {total: 15727, hits: 9});

console.log(JSON.stringify({
  status: "locked LP1 checksum uniquely selects block4 COLD inside frozen 36-branch family",
  lp1Target: {
    warningTwin: warningTwin.join(" "),
    warningMetrics,
    lp1SevenWordWindows: lp1Windows.length,
    exactTwinHits: lp1TwinHits.length,
    matrixValue,
    targetIndexSum,
  },
  upstreamPrefix: {phrase: firstThreeBlocks.join(" "), ...prefixMetrics},
  requiredBlock4Contribution: residual,
  familyCandidates: family.length,
  dualSumHits: dualSumHits.map(hit => ({
    length: hit.length,
    plaintextRunes: hit.plaintext.map(value => translit[value]),
  })),
  selected: {
    plaintext: "COLD",
    centerDirection: selected.centerDir,
    key: selected.key.map(value => translit[value]),
    start: selected.start,
    readDirection: selected.readDir,
  },
  controls: {shakespeare: shakespeareControl, gibran: gibranControl},
}, null, 2));
