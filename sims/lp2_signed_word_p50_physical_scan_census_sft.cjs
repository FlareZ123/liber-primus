"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const alpha59 = grid.alphabet.replace("f", "");
const tape = grid.pages.flatMap((page) => page.tokens);
assert.equal(tape.length, 256);

const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a,b) => b.symbol.length - a.symbol.length);

/** @param {string} word @returns {number[]} */
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
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, index)
    );
    assert.ok(token, "unmapped GP spelling " + word + " at " + index);
    values.push(token.value);
    index += token.symbol.length;
  }
  return values;
}

/** @param {string} token @returns {number} */
function base59Token(token) {
  const hi = alpha59.indexOf(token[0]);
  const lo = alpha59.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0, "token outside fixed base59 alphabet: " + token);
  return 59 * hi + lo;
}

const clear = signed
  .slice(signed.indexOf("Hello."), signed.indexOf("-----BEGIN PGP SIGNATURE-----"))
  .replace(/\b7A35090F\b/g, "");
const words = clear.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
assert.equal(words.length, 43);
const upper = words.map((word) => word.toUpperCase());

const rows = upper.map((word, sourceIndex) => {
  const values = gpWord(word);
  const gp0 = values.reduce((sum,value) => sum + value, 0);
  assert.ok(gp0 >= 0 && gp0 < tape.length);
  const token = tape[gp0];
  const decoded = base59Token(token);
  const inScanRange = decoded >= 17 && decoded <= 74;
  return {
    sourceIndex,
    word,
    gp0,
    token,
    decoded,
    inScanRange,
    physicalPage: inScanRange ? decoded - 17 : null,
  };
});

const hits = rows.filter((row) => row.inScanRange);
const direction = rows.find((row) => row.word === "DIRECTION");
assert.ok(direction);
assert.deepEqual(
  {gp0:direction.gp0,token:direction.token,decoded:direction.decoded,physicalPage:direction.physicalPage},
  {gp0:112,token:"1D",decoded:72,physicalPage:55}
);

// Exact null preserving table decoded-value distribution and source-address collisions.
// Randomly permute the fixed 256 decoded values over addresses. All source words
// sharing a GP0 address remain coupled because the address is the random unit.
const decodedTable = tape.map(base59Token);
const successCount = decodedTable.filter((value) => value >= 17 && value <= 74).length;
const N = decodedTable.length;
const p = successCount / N;
const byAddress = new Map();
for (const row of rows) {
  byAddress.set(row.gp0, (byAddress.get(row.gp0) || 0) + 1);
}
const weights = [...byAddress.values()];
const sumWeights = weights.reduce((a,b) => a+b, 0);
const sumSquares = weights.reduce((a,b) => a+b*b, 0);
assert.equal(sumWeights, rows.length);
const pairProducts = (sumWeights*sumWeights - sumSquares) / 2;
const covariance = -p*(1-p)/(N-1);
const variance = p*(1-p)*sumSquares + 2*covariance*pairProducts;
const expected = rows.length * p;
const z = variance > 0 ? (hits.length - expected) / Math.sqrt(variance) : null;

// Exact weighted tail under fixed R successes among N positions.
// DP over source-address groups plus unused positions. State stores counts of
// choosing k successful table positions and resulting word-hit total.
const groups = weights.concat(Array(N - weights.length).fill(0));
let dp = new Map();
dp.set("0,0", 1n);
for (const weight of groups) {
  const next = new Map();
  for (const [key,count] of dp) {
    const [k,h] = key.split(",").map(Number);
    const key0 = k + "," + h;
    next.set(key0, (next.get(key0) || 0n) + count);
    if (k < successCount) {
      const key1 = (k+1) + "," + (h+weight);
      next.set(key1, (next.get(key1) || 0n) + count);
    }
  }
  dp = next;
}
let tail = 0n;
let total = 0n;
for (const [key,count] of dp) {
  const [k,h] = key.split(",").map(Number);
  if (k !== successCount) continue;
  total += count;
  if (h >= hits.length) tail += count;
}
assert.ok(total > 0n);
const tailProbability = Number(tail) / Number(total);

const collisionRows = [...byAddress.entries()]
  .filter(([,count]) => count > 1)
  .map(([gp0,count]) => ({
    gp0,
    count,
    words: rows.filter((row) => row.gp0 === gp0).map((row) => row.word),
  }));

console.log(JSON.stringify({
  status:"PASS",
  sourceWordCount:rows.length,
  rows,
  scanHits:hits,
  direction,
  collisions:collisionRows,
  null:{
    tableSize:N,
    scanRange:[17,74],
    successTableValues:successCount,
    uniqueSourceAddresses:weights.length,
    expectedWordHits:expected,
    variance,
    z,
    exactUpperTail:tailProbability,
  },
}, null, 2));
