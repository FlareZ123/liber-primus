"use strict";

/**
 * Original p49–51 256-byte table's simplest directed-pointer interpretation.
 * SFT: node sims/lp2_p50_direct_byte_pointer_firstcycle_sft.cjs
 * Node.js 22 / CommonJS; no external packages or file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const table = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const bytes = table.bytes;
assert.equal(bytes.length, 256);
assert.ok(bytes.every((n) => Number.isInteger(n) && n >= 0 && n <= 255));
assert.equal(bytes[0], 203);
assert.equal(corpus.pages[49].indices.length, 66);
assert.equal(corpus.pages[50].indices.length, 0);
assert.equal(corpus.pages[51].indices.length, 92);
const flankRuneCount = corpus.pages[49].indices.length +
  corpus.pages[51].indices.length;
assert.equal(flankRuneCount, 158);
assert.equal(bytes[flankRuneCount], 249);
assert.equal(bytes[249], flankRuneCount);
assert.deepEqual(table.pages.flatMap((p) => p.tokens).filter((s) => s === "49").length, 3);

/** Follow zero-based source byte as the next zero-based table-cell address.
 * @param {number[]} values
 * @param {number} start
 * @returns {{walk:number[], cycleStart:number}}
 */
function walk(values, start) {
  const encountered = new Map(), nodes = [];
  let pointer = start;
  while (!encountered.has(pointer)) {
    encountered.set(pointer, nodes.length);
    nodes.push(pointer);
    pointer = values[pointer];
  }
  return {walk: nodes, cycleStart: encountered.get(pointer)};
}
const route = walk(bytes, 0);
const actualCycle = [0, 203, 68, 199, 47, 76, 114, 197, 115, 247, 192];
assert.deepEqual(route.walk, actualCycle);
assert.equal(route.cycleStart, 0);
assert.equal(bytes[actualCycle[actualCycle.length - 1]], 0);
const key = actualCycle.map((index) => bytes[index] % 29);
assert.deepEqual(key, [0, 10, 25, 18, 18, 27, 23, 28, 15, 18, 0]);
assert.equal(corpus.pages[49].indices.length % key.length, 0);

const mod29 = (n) => ((n % 29) + 29) % 29;
/** @param {number[]} values @returns {number} */
function coincidence(values) {
  const bins = Array(29).fill(0);
  for (const value of values) bins[value]++;
  return bins.reduce((n, v) => n + v * (v - 1), 0) /
    (values.length * (values.length - 1));
}
/** @param {number[]} values @param {number} sign @returns {number[]} */
function applyKey(values, sign) {
  return values.map((n, index) => mod29(n + sign * key[index % key.length]));
}
const flankCycle = [158, 249];
const flankKey = flankCycle.map((cell) => bytes[cell] % 29);
assert.deepEqual(flankKey, [17, 13]);
assert.equal(corpus.pages[49].indices.length % 22, 0);
const combinedResults = [];
for (const page of [49, 51, 52]) {
  const cipher = corpus.pages[page].indices;
  for (const a of [-1, 1]) for (const b of [-1, 1]) {
    // Two naturally sourced cycles together repeat at lcm(11,2)=22.
    const plain = cipher.map((x, i) => mod29(x +
      a * key[i % 11] + b * flankKey[i % 2]));
    const rebuilt = plain.map((x, i) => mod29(x -
      a * key[i % 11] - b * flankKey[i % 2]));
    assert.deepEqual(rebuilt, cipher);
    combinedResults.push({page, signEleven:a, signTwo:b,
      ioc: Number(coincidence(plain).toFixed(12)),
      prefix:plain.slice(0, 35).map((x) => corpus.translit[x]).join("")});
  }
}
const combinedFeedbackModels = [];
for (const page of [49, 51, 52]) {
  const cipher = corpus.pages[page].indices;
  for (const a of [-1, 1]) for (const b of [-1, 1]) {
    const plain = cipher.map((x, i) => mod29(x -
      (i ? cipher[i - 1] : 0) +
      a * key[i % 11] + b * flankKey[i % 2]));
    const rebuilt = [];
    let previous = 0;
    for (let i = 0; i < plain.length; i++) {
      const next = mod29(previous + plain[i] -
        a * key[i % 11] - b * flankKey[i % 2]);
      rebuilt.push(next);
      previous = next;
    }
    assert.deepEqual(rebuilt, cipher);
    combinedFeedbackModels.push({page, signEleven:a, signTwo:b,
      ioc:Number(coincidence(plain).toFixed(12)),
      prefix: plain.slice(0, 35).map((x) => corpus.translit[x]).join("")});
  }
}
// Semantic, not just printed-page, boundaries established by Agent18 #1099.
const before = corpus.pages[48].indices.slice(-72).concat(corpus.pages[49].indices);
const after = corpus.pages[51].indices.concat(corpus.pages[52].indices.slice(0, 78));
const intact = before.concat(after);
const terminal = corpus.pages[54].indices.concat(corpus.pages[55].indices);
assert.equal(before.length, 138);
assert.equal(after.length, 170);
assert.equal(intact.length, 308);
assert.equal(terminal.length, 308);
assert.equal(intact.length % 22, 0);
const intactSentenceModels = [];
for (const [name, cipher] of [["flankingIntactSentences", intact],
                             ["terminalOriginal", terminal]]) {
  for (const resetAt138 of [false, true])
    for (const a of [-1, 1]) for (const b of [-1, 1]) {
      const clock = (i) => resetAt138 && i >= 138 ? i - 138 : i;
      const plain = cipher.map((x, i) => mod29(x +
        a * key[clock(i) % 11] + b * flankKey[clock(i) % 2]));
      const rebuilt = plain.map((x, i) => mod29(x -
        a * key[clock(i) % 11] - b * flankKey[clock(i) % 2]));
      assert.deepEqual(rebuilt, cipher);
      intactSentenceModels.push({name, resetAt138,
        signEleven:a, signTwo:b, ioc:Number(coincidence(plain).toFixed(12)),
        prefix:plain.slice(0, 45).map((x) => corpus.translit[x]).join("")});
    }
}
const rows = [];
for (const page of [49, 51, 52]) {
  const original = corpus.pages[page].indices;
  for (const sign of [-1, 1]) {
    const decoded = applyKey(original, sign);
    assert.deepEqual(applyKey(decoded, -sign), original);
    rows.push({page, sign, count: original.length,
      ioc: Number(coincidence(decoded).toFixed(12)),
      prefix: decoded.slice(0, 35).map((x) => corpus.translit[x]).join("")});
  }
}
// A genuine independent solved-source positive checks that the proposed
// repeating register is a fully reversible 29-symbol cryptographic operation.
const knownClear = corpus.pages[57].indices;
assert.equal(knownClear.length, 95);
for (const sign of [-1, 1])
  assert.deepEqual(applyKey(applyKey(knownClear, sign), -sign), knownClear);

/** Deterministic xorshift32 controls, retaining entire source byte inventories. */
let state = 0x33013301;
/** @returns {number} */
function draw() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const families = {
  global: [Array.from({length: 256}, (_, i) => i)],
  row: Array.from({length: 32},
    (_, i) => Array.from({length: 8}, (_, j) => 8 * i + j)),
  column: Array.from({length: 8},
    (_, i) => Array.from({length: 32}, (_, j) => 8 * j + i))
};
const nulls = [];
for (const [family, groups] of Object.entries(families)) {
  const n = 50000;
  let rootCycle = 0, lengthEleven = 0, divisor66 = 0;
  let flankTwoCycle = 0, jointExactElevenAndFlankTwo = 0,
    jointDividing66AndFlankTwo = 0;
  let flankAnyTwoCycle = 0, jointDivisorAndAnyTwo = 0;
  for (let trial = 0; trial < n; trial++) {
    const copy = bytes.slice();
    for (const addresses of groups) {
      const shuffled = addresses.map((index) => copy[index]);
      for (let j = shuffled.length - 1; j > 0; j--) {
        const k = draw() % (j + 1);
        [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
      }
      addresses.forEach((index, j) => { copy[index] = shuffled[j]; });
    }
    const candidate = walk(copy, 0);
    const isFlankTwo = copy[158] === 249 && copy[249] === 158;
    const other = copy[158];
    const anyTwo = other !== 158 && copy[other] === 158;
    if (anyTwo) flankAnyTwoCycle++;
    if (anyTwo && candidate.cycleStart === 0 &&
        66 % candidate.walk.length === 0) jointDivisorAndAnyTwo++;
    if (isFlankTwo) flankTwoCycle++;
    if (isFlankTwo && candidate.cycleStart === 0 &&
        candidate.walk.length === 11) jointExactElevenAndFlankTwo++;
    if (isFlankTwo && candidate.cycleStart === 0 &&
        66 % candidate.walk.length === 0) jointDividing66AndFlankTwo++;
    if (candidate.cycleStart !== 0) continue;
    rootCycle++;
    if (candidate.walk.length === 11) lengthEleven++;
    if (66 % candidate.walk.length === 0) divisor66++;
  }
  nulls.push({family, trials:n, firstOnCycle:rootCycle,
    exact11: lengthEleven, cycleLengthDivides66: divisor66,
    flankIndex158InTwoCycle: flankTwoCycle,
    jointExact11AndFlankTwo: jointExactElevenAndFlankTwo,
    jointDivisor66AndFlankTwo: jointDividing66AndFlankTwo,
    flankIndex158AnyTwoCycle: flankAnyTwoCycle,
    jointDivisor66AndAnyTwo: jointDivisorAndAnyTwo});
}
console.log(JSON.stringify({source:"original 256 printed p49–51 table",
  hypothesis:"zero-based byte as zero-based index of next table cell",
  firstCellCycle:route.walk, cycleGP29Key:key, prologueRunes:66,
  sourceFirstPage:49, flankRuneCount, flankTwoCycle:[158,249],
  encodedKeyModels:rows, combinedKeyPeriod:22, combinedKeyModels:combinedResults,
  combinedFeedbackModels, intactSentenceModels, shuffleNulls:nulls}, null, 2));
console.log("PASS original pointer route/6-turn prologue and negative direct GP29 additive inverses. No unknown plaintext.");
