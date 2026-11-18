"use strict";

/**
 * Source-exact continuation of the independently selected p55 -> p27:28
 * DJU / BEI handoff under the replicated GP0 -> p50 byte navigation grammar.
 *
 * Run: node sims/lp2_p27_dju_bei_gp0_divinity_convergence_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/**
 * @param {number} pageNumber
 * @returns {{index:number,start:number,length:number,indices:number[]}[]}
 */
function parsePageWords(pageNumber) {
  const source = transcription.split(/\r?\n%\r?\n/)[pageNumber];
  const words = [];
  let current = [];
  let offset = 0;
  let start = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({index: words.length, start, length: current.length, indices: current});
    current = [];
  };
  for (const ch of [...source]) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (ch === "-" || ch === ".") {
      flush();
    }
  }
  flush();
  return words;
}

/** @param {{indices:number[]} word */
function gp0(word) {
  return word.indices.reduce((total, value) => total + value, 0);
}

/** @param {{indices:number[]} word */
function primeSum(word) {
  return word.indices.reduce((total, value) => total + corpus.prime[value], 0);
}

/** @param {number} n */
function phi(n) {
  let result = n;
  let value = n;
  for (let p = 2; p * p <= value; p += 1) {
    if (value % p !== 0) continue;
    while (value % p === 0) value /= p;
    result -= result / p;
  }
  if (value > 1) result -= result / value;
  return result;
}

/** @param {{indices:number[]} word */
function text(word) {
  return word.indices.map((value) => corpus.translit[value]).join("");
}

const p27 = parsePageWords(27);
const page27 = corpus.pages.find((page) => page.page === 27);
assert.ok(page27);
assert.equal(page27.indices.length, 234);
assert.equal(p27.length, 52);
assert.equal(grid.bytes.length, 256);

/** @param {number} offset */
function containing(offset) {
  return p27.find((word) =>
    word.start <= offset && offset < word.start + word.length) || null;
}

/**
 * Apply two word->table-byte steps with p27 retained as the already selected
 * receiver page.
 * @param {{index:number,start:number,length:number,indices:number[]}} source
 */
function branch(source) {
  const sourceNumber = gp0(source);
  assert(sourceNumber < 256);
  const firstByte = grid.bytes[sourceNumber];
  const intermediate = containing(firstByte);
  if (!intermediate) return {sourceNumber, firstByte, intermediate: null, secondByte: null};

  const intermediateNumber = gp0(intermediate);
  assert(intermediateNumber < 256);
  const secondByte = grid.bytes[intermediateNumber];
  return {sourceNumber, firstByte, intermediate, intermediateNumber, secondByte};
}

const dju = p27.find((word) => word.start === 28);
const bei = p27.find((word) => word.start === 31);
assert.ok(dju);
assert.ok(bei);
assert.equal(text(dju), "DJU");
assert.equal(text(bei), "BEI");
assert.equal(gp0(dju), 35);
assert.equal(gp0(bei), 45);

const djuBranch = branch(dju);
const beiBranch = branch(bei);
assert.equal(djuBranch.firstByte, 39);
assert.equal(beiBranch.firstByte, 107);
assert.ok(djuBranch.intermediate);
assert.ok(beiBranch.intermediate);
assert.equal(djuBranch.intermediate.start, 37);
assert.equal(beiBranch.intermediate.start, 105);
assert.equal(djuBranch.intermediate.length, 3);
assert.equal(beiBranch.intermediate.length, 3);
assert.equal(djuBranch.firstByte, djuBranch.intermediate.start + djuBranch.intermediate.length - 1);
assert.equal(beiBranch.firstByte, beiBranch.intermediate.start + beiBranch.intermediate.length - 1);
assert.equal(gp0(djuBranch.intermediate), 40);
assert.equal(gp0(beiBranch.intermediate), 55);
assert.equal(djuBranch.secondByte, 80);
assert.equal(beiBranch.secondByte, 80);

// The converged byte is the first rune after shedding one circumference from
// the independently identified 12-rune p27 body word.
const divinityCarrier = containing(80);
assert.ok(divinityCarrier);
assert.equal(divinityCarrier.start, 79);
assert.equal(divinityCarrier.length, 12);
assert.equal(80, divinityCarrier.start + 1);

const onceShed = {
  indices: divinityCarrier.indices.slice(1, -1),
};
const twiceShed = {
  indices: divinityCarrier.indices.slice(2, -2),
};
assert.equal(onceShed.indices.length, 10);
assert.equal(twiceShed.indices.length, 8);
assert.equal(primeSum(divinityCarrier), 562);
assert.equal(phi(primeSum(divinityCarrier)), 280);
assert.equal(primeSum(twiceShed), 376);

// Independent solved-p57 controls for the two already reported semantic values.
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} word */
function gpWord(word) {
  const normalized = word.toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const token = gpTokens.find((item) => normalized.startsWith(item.symbol, i));
    assert.ok(token);
    out.push(token.value);
    i += token.symbol.length;
  }
  return {indices: out};
}
assert.equal(primeSum(gpWord("DIVINITY")), 376);
assert.equal(primeSum(gpWord("INSTAR")), 280);

// Finite p27 population control. Among all 51 adjacent pairs, only two
// converge after two GP0/table-byte steps. Only DJU/BEI converges from two
// distinct first bytes; the other pair is a trivial first-byte collision.
const convergent = [];
for (let i = 0; i < p27.length - 1; i += 1) {
  const left = branch(p27[i]);
  const right = branch(p27[i + 1]);
  if (left.secondByte === null || right.secondByte === null) continue;
  if (left.secondByte !== right.secondByte) continue;
  convergent.push({
    pairIndex: i,
    starts: [p27[i].start, p27[i + 1].start],
    source: [text(p27[i]), text(p27[i + 1])],
    firstBytes: [left.firstByte, right.firstByte],
    secondByte: left.secondByte,
  });
}
assert.equal(convergent.length, 2);
const distinctFirst = convergent.filter((row) => row.firstBytes[0] !== row.firstBytes[1]);
assert.deepEqual(distinctFirst, [{
  pairIndex: dju.index,
  starts: [28, 31],
  source: ["DJU", "BEI"],
  firstBytes: [39, 107],
  secondByte: 80,
}]);

process.stdout.write(JSON.stringify({
  status: "source-selected p27 DJU/BEI GP0 navigation converges on DIVINITY carrier; NO UNKNOWN PLAINTEXT",
  handoff: {
    sourceStarts: [28, 31],
    sourceWords: ["DJU", "BEI"],
    sourceGp0: [gp0(dju), gp0(bei)],
    firstBytes: [djuBranch.firstByte, beiBranch.firstByte],
    intermediateStarts: [djuBranch.intermediate.start, beiBranch.intermediate.start],
    intermediateLengths: [djuBranch.intermediate.length, beiBranch.intermediate.length],
    intermediateGp0: [djuBranch.intermediateNumber, beiBranch.intermediateNumber],
    convergedByte: djuBranch.secondByte,
  },
  divinityCarrier: {
    start: divinityCarrier.start,
    length: divinityCarrier.length,
    convergenceOffsetWithinWord: djuBranch.secondByte - divinityCarrier.start,
    wholePrimeSum: primeSum(divinityCarrier),
    wholeTotient: phi(primeSum(divinityCarrier)),
    onceShedLength: onceShed.indices.length,
    twiceShedLength: twiceShed.indices.length,
    twiceShedPrimeSum: primeSum(twiceShed),
  },
  p27Population: {
    adjacentPairs: p27.length - 1,
    twoStepConvergences: convergent,
    distinctFirstByteConvergences: distinctFirst.length,
  },
}, null, 2) + "\n");
