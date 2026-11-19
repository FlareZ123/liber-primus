"use strict";

/**
 * SFT: conditional p28 HERE -> FOUND -> p39 -> VERIFY route.
 *
 * This reproduces one fixed chain from existing source-selected ingredients:
 * - authenticated DH state K=2;
 * - p28 local HERE candidate;
 * - conventional full base60 p50 values;
 * - p33 THEIR RISE = +6;
 * - independently selected p39 VERIFY receiver;
 * - existing VERIFY -> p9 DIRECTION|PATHS holdout.
 *
 * Windows Node.js 22, CommonJS, no third-party dependencies.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const p50 = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const signedSource = read("resources/historical/cicada2016-4gq25-outguess.asc");

const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase()
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

    const token = gpTokens.find(candidate =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }

  return values;
}

/** @param {string} word @returns {number} */
function gp0(word) {
  return gp(word).reduce((sum, value) => sum + value, 0);
}

const clear = signedSource.split("-----BEGIN PGP SIGNATURE-----")[0];
const body = clear.slice(clear.indexOf("Hello."));
const signed = body
  .split(/[^A-Za-z0-9]+/)
  .filter(token => /^[A-Za-z]+$/.test(token))
  .map((word, index) => ({
    index,
    label: word.toUpperCase(),
    gp0: gp0(word),
  }));

assert.equal(signed.length, 43);

const cells = p50.rows.flat();
const full = p50.byte_rows.flat();
assert.equal(cells.length, 256);
assert.equal(full.length, 256);

/** @param {number} state @returns {number} */
function T(state) {
  assert.ok(Number.isInteger(state) && state >= 0 && state < 256);
  return full[state];
}

/** @param {number} state @param {number} steps @returns {number} */
function iterate(state, steps) {
  let current = state;
  for (let index = 0; index < steps; index += 1) {
    current = T(current);
  }
  return current;
}

// K=2 is independently authenticated by the 2016 DH state.
const K = 2;

// Existing p28 local marker candidate.
assert.equal(gp0("HERE"), 48);
assert.equal(cells[48], "4D");
assert.equal(T(48), 253);
assert.equal(cells[253], "0a");
assert.equal(iterate(gp0("HERE"), K), 36);
assert.equal(gp0("FOUND"), 36);

// Source-side calibration of the same exact T^K operation.
const adjacencyHits = [];
for (let index = 0; index < signed.length - 1; index += 1) {
  if (iterate(signed[index].gp0, K) === signed[index + 1].gp0) {
    adjacencyHits.push([
      index,
      signed[index].label,
      signed[index + 1].label,
    ]);
  }
}

assert.deepEqual(adjacencyHits, [[33, "WILL", "BE"]]);

// THEIR RISE fixes +6 from the two authenticated THEIR occurrences.
assert.equal(signed[19].label, "THEIR");
assert.equal(signed[25].label, "THEIR");
const rise = 25 - 19;
assert.equal(rise, 6);

// HERE -> FOUND supplies the source word at index35.
assert.equal(signed[35].label, "FOUND");
assert.equal(signed[35].gp0, 36);
assert.equal(signed[35 + rise].label, "VERIFY");

// The source number of FOUND selects p39 under the existing full-base60
// p50 address -> physical-page grammar.
assert.equal(cells[35], "0d");
assert.equal(T(35), 39);

// Charge the same rise/address relation over the independently selected
// source-word/page candidates that predate this route.
const candidatePages = [
  {targetIndex: 6, target: "SEEKS", page: 6},
  {targetIndex: 16, target: "ARE", page: 32},
  {targetIndex: 17, target: "THE", page: 32},
  {targetIndex: 33, target: "WILL", page: 33},
  {targetIndex: 34, target: "BE", page: 34},
  {targetIndex: 38, target: "BEWARE", page: 38},
  {targetIndex: 40, target: "PATHS", page: 40},
  {targetIndex: 41, target: "VERIFY", page: 39},
];

const risePageHits = candidatePages
  .map(candidate => ({
    ...candidate,
    sourceIndex: candidate.targetIndex - rise,
    pageValue: T(candidate.targetIndex - rise),
  }))
  .filter(candidate => candidate.pageValue === candidate.page);

assert.deepEqual(
  risePageHits.map(candidate => [
    candidate.sourceIndex,
    candidate.target,
    candidate.page,
  ]),
  [[35, "VERIFY", 39]]
);

// Independently selected p39 DIVINITY receiver reproduces VERIFY.
const page39 = corpus.pages.find(page => page.page === 39);
assert.ok(page39);
assert.deepEqual(page39.indices.slice(105, 110), [8, 6, 4, 12, 16]);

const p39Inner = page39.indices.slice(106, 109);
assert.deepEqual(p39Inner, [6, 4, 12]);
const p39InnerGp0 = p39Inner.reduce((sum, value) => sum + value, 0);
assert.equal(p39InnerGp0, 22);
assert.equal(cells[22], "0x");
assert.equal(T(22), 59);
assert.equal(gp0("VERIFY"), 59);

// Existing VERIFY holdout consumes the recovered source state prospectively.
assert.equal(cells[59], "19");
assert.equal(T(59), 69);
assert.equal(T(59) % 60, 9);

const page9 = corpus.pages.find(page => page.page === 9);
assert.ok(page9);
assert.deepEqual(
  page9.indices.slice(134, 141),
  [19, 25, 4, 0, 3, 16, 21]
);

const p9Packet = page9.indices.slice(135, 141);
assert.equal(
  p9Packet.reduce((sum, value) => sum + value, 0),
  T(59)
);
assert.equal(
  p9Packet.slice(0, K).reduce((sum, value) => sum + value, 0),
  29
);
assert.equal(
  p9Packet.slice(K).reduce((sum, value) => sum + value, 0),
  40
);
assert.equal(signed[29].label, "DIRECTION");
assert.equal(signed[40].label, "PATHS");

console.log(JSON.stringify({
  status: "conditional HERE route closes through independently selected p39 VERIFY and existing p9 holdout",
  entry: {
    marker: "HERE",
    gp0: gp0("HERE"),
    K,
    p50States: [T(48), iterate(48, K)],
    sourceWord: "FOUND",
  },
  sourceCalibration: {
    tKAdjacentHits: adjacencyHits,
    rise,
    foundIndex: 35,
    riseTarget: signed[41].label,
  },
  pageConvergence: {
    p50AtFoundIndex: T(35),
    risePageHits,
  },
  p39: {
    receiver: [105, 109],
    shedInterior: p39Inner,
    innerGp0: p39InnerGp0,
    p50Output: T(p39InnerGp0),
    output: "VERIFY",
  },
  downstreamHoldout: {
    verifyGp0: gp0("VERIFY"),
    p50Cell: cells[59],
    full: T(59),
    low: T(59) % 60,
    page: 9,
    packet: p9Packet,
    split: ["DIRECTION", "PATHS"],
  },
}, null, 2));
