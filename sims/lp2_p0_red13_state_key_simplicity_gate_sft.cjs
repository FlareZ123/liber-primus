"use strict";

/**
 * SFT: target-free algebraic-simplicity gate for the p0 red13 state key.
 *
 * The grammar is frozen before plaintext scoring:
 *   cost 0: residue 0
 *   cost 1: plus or minus one authenticated DH-state field
 *   cost 2: x plus/minus y for two authenticated DH-state fields
 *
 * This tests whether the residual for EPIPHANY SEEKS is independently
 * exceptional under a broad state-expression grammar. It does not alter the
 * stronger source-shape selector, ciphertext-only THE WAY readout, marker
 * packet, or exact replay.
 *
 * Node.js 22, CommonJS, read-only.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const M = 29;

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % M) + M) % M;
}

/** @param {number[]} values @returns {number} */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(
  read("resources/external/relikd-solved-gp29-native-v1.json")
);
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} text @returns {number[]} */
function gpText(text) {
  const normalized = text
    .toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const out = [];
  for (let index = 0; index < normalized.length;) {
    const token = gpTokens.find((row) =>
      normalized.startsWith(row.symbol, index)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(index));
    out.push(token.value);
    index += token.symbol.length;
  }
  return out;
}

/**
 * Split a rune-native source on every non-rune separator.
 *
 * @param {string} source
 * @returns {number[][]}
 */
function runeWords(source) {
  const out = [];
  let current = [];
  for (const character of [...source]) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      current.push(value);
    } else if (current.length) {
      out.push(current);
      current = [];
    }
  }
  if (current.length) out.push(current);
  return out;
}

const state = Object.freeze({
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

const cipher = [
  15, 8, 18, 3, 6, 19, 27, 0,
  15, 26, 18, 21, 5,
];

const clear = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, "")
  .replace(/\b3301\b/g, "")
  .replace(/\b[0-9A-F]{8,}\b/g, "");

const signedWords = (clear.match(/[A-Za-z]+/g) || []).map((text) => ({
  text: text.toUpperCase(),
  values: gpText(text),
  source: "signed2016",
}));

const lexicalPool = new Map();
for (const section of solved.sections) {
  for (const values of runeWords(section.source_text)) {
    const text = values.map((value) => corpus.translit[value]).join("");
    lexicalPool.set(text, {text, values, source: "solved"});
  }
}
for (const row of signedWords) {
  lexicalPool.set(row.text, row);
}

const length8 = [...lexicalPool.values()].filter((row) =>
  row.values.length === 8
);
const length5 = [...lexicalPool.values()].filter((row) =>
  row.values.length === 5
);

assert.equal(lexicalPool.size, 295);
assert.equal(length8.length, 18);
assert.equal(length5.length, 38);

const stateFields = Object.entries(state);
const minCost = Array(M).fill(Infinity);
const examples = Array.from({length: M}, () => []);

/**
 * Record a residue representation at its minimum expression cost.
 *
 * @param {number} value
 * @param {number} cost
 * @param {string} expression
 */
function addRepresentation(value, cost, expression) {
  const residue = mod29(value);
  if (cost < minCost[residue]) {
    minCost[residue] = cost;
    examples[residue] = [expression];
  } else if (cost === minCost[residue]) {
    examples[residue].push(expression);
  }
}

addRepresentation(0, 0, "0");
for (const [name, value] of stateFields) {
  addRepresentation(value, 1, name);
  addRepresentation(-value, 1, "-" + name);
}
for (const [leftName, leftValue] of stateFields) {
  for (const [rightName, rightValue] of stateFields) {
    addRepresentation(
      leftValue + rightValue,
      2,
      leftName + "+" + rightName
    );
    addRepresentation(
      leftValue - rightValue,
      2,
      leftName + "-" + rightName
    );
  }
}

assert.ok(minCost.every(Number.isFinite));
assert.deepEqual(
  [0, 1, 2].map((cost) => minCost.filter((value) => value === cost).length),
  [1, 16, 12]
);

/**
 * @param {number[]} key
 * @returns {{score:number, binary:number, unary:number, zeros:number}}
 */
function scoreKey(key) {
  const costs = key.map((value) => minCost[value]);
  return {
    score: sum(costs),
    binary: costs.filter((value) => value === 2).length,
    unary: costs.filter((value) => value === 1).length,
    zeros: costs.filter((value) => value === 0).length,
  };
}

/**
 * @typedef {{
 *   sign:string,
 *   left:string,
 *   right:string,
 *   score:number,
 *   binary:number,
 *   unary:number,
 *   zeros:number,
 *   key:number[]
 * }} Candidate
 */

/**
 * @param {boolean} bothSigns
 * @returns {Candidate[]}
 */
function enumerateCandidates(bothSigns) {
  const signs = bothSigns ? [1, -1] : [1];
  const rows = [];

  for (const sign of signs) {
    for (const left of length8) {
      for (const right of length5) {
        const plain = [...left.values, ...right.values];
        const key = cipher.map((value, index) =>
          mod29(sign === 1
            ? value - plain[index]
            : plain[index] - value)
        );
        rows.push({
          sign: sign === 1 ? "C-P" : "P-C",
          left: left.text,
          right: right.text,
          ...scoreKey(key),
          key,
        });
      }
    }
  }

  rows.sort((left, right) =>
    left.score - right.score
    || left.binary - right.binary
    || right.zeros - left.zeros
    || left.left.localeCompare(right.left)
    || left.right.localeCompare(right.right)
    || left.sign.localeCompare(right.sign)
  );
  return rows;
}

/**
 * Count 13-coordinate residue vectors with total grammar cost <= threshold.
 *
 * @param {number} threshold
 * @returns {bigint}
 */
function countRandomVectorsAtMost(threshold) {
  const countsByCost = [1n, 16n, 12n];
  let dp = Array(threshold + 1).fill(0n);
  dp[0] = 1n;

  for (let position = 0; position < 13; position += 1) {
    const next = Array(threshold + 1).fill(0n);
    for (let total = 0; total <= threshold; total += 1) {
      if (dp[total] === 0n) continue;
      for (let cost = 0; cost <= 2; cost += 1) {
        const updated = total + cost;
        if (updated <= threshold) {
          next[updated] += dp[total] * countsByCost[cost];
        }
      }
    }
    dp = next;
  }
  return dp.reduce((total, value) => total + value, 0n);
}

const cp = enumerateCandidates(false);
const both = enumerateCandidates(true);

const targetCp = cp.find((row) =>
  row.left === "EPIPHANY"
  && row.right === "SEEKS"
  && row.sign === "C-P"
);
assert.ok(targetCp);
assert.equal(targetCp.score, 13);
assert.equal(targetCp.binary, 2);
assert.equal(targetCp.unary, 9);
assert.equal(targetCp.zeros, 2);
assert.equal(cp.indexOf(targetCp) + 1, 5);
assert.equal(cp.filter((row) => row.score === 13).length, 7);

assert.equal(cp[0].left, "BEHAUIARS");
assert.equal(cp[0].right, "SEEKS");
assert.equal(cp[0].score, 12);
assert.equal(cp[0].binary, 1);
assert.equal(cp[0].zeros, 2);

const targetBoth = both.find((row) =>
  row.left === "EPIPHANY"
  && row.right === "SEEKS"
  && row.sign === "C-P"
);
assert.ok(targetBoth);
assert.equal(both.length, 1368);
assert.equal(both.indexOf(targetBoth) + 1, 9);
assert.equal(both.filter((row) => row.score === 13).length, 14);
assert.equal(both.filter((row) => row.score === 12).length, 2);

const randomAtMost12 = countRandomVectorsAtMost(12);
const randomAtMost13 = countRandomVectorsAtMost(13);
const randomTotal = 29n ** 13n;
const pAtMost12 = Number(randomAtMost12) / Number(randomTotal);
const pAtMost13 = Number(randomAtMost13) / Number(randomTotal);
assert.ok(Math.abs(pAtMost12 - 0.0029728910795608026) < 1e-15);
assert.ok(Math.abs(pAtMost13 - 0.012508442432133804) < 1e-15);

console.log(JSON.stringify({
  status: "PASS",
  grammar: {
    cost0: "0",
    cost1: "plus/minus one state field",
    cost2: "x plus/minus y over state fields",
    residueCostCounts: [1, 16, 12],
    allResiduesCovered: true,
  },
  sourcePool: {
    distinctWords: lexicalPool.size,
    length8: length8.length,
    length5: length5.length,
    cpCases: cp.length,
    bothSignCases: both.length,
  },
  target: {
    pair: "EPIPHANY SEEKS",
    cpScore: targetCp.score,
    cpRank: cp.indexOf(targetCp) + 1,
    cpSameScore: cp.filter((row) => row.score === targetCp.score).length,
    bothSignRank: both.indexOf(targetBoth) + 1,
    bothSignSameScore: both.filter((row) =>
      row.score === targetBoth.score
    ).length,
    key: targetCp.key,
    coordinateExamples: targetCp.key.map((value, index) => ({
      index,
      value,
      cost: minCost[value],
      examples: examples[value].slice(0, 8),
    })),
  },
  bestCp: cp.slice(0, 8).map((row) => ({
    pair: row.left + " " + row.right,
    score: row.score,
    binary: row.binary,
    zeros: row.zeros,
  })),
  uniformRandom13Vector: {
    pScoreAtMost12: pAtMost12,
    pScoreAtMost13: pAtMost13,
  },
  decision:
    "Broad DH-state algebraic simplicity does not independently select "
    + "EPIPHANY SEEKS or its 13-atom key order.",
}, null, 2));
