"use strict";

/**
 * SFT for the p29/p50 repeated-root Taylor packet and authenticated
 * signed-2016 index instruction.
 *
 * Node.js 22, CommonJS, no third-party dependencies.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const M = 29;
const mod = (value) => ((value % M) + M) % M;

/**
 * Descending coefficients P(X) -> ascending Taylor coefficients P(r+X).
 *
 * @param {number[]} descending
 * @param {number} r
 * @returns {number[]}
 */
function shift(descending, r) {
  let result = [];
  for (const coefficient of descending) {
    const next = Array(result.length + 1).fill(0);
    for (let index = 0; index < result.length; index += 1) {
      next[index] = mod(next[index] + r * result[index]);
      next[index + 1] = mod(next[index + 1] + result[index]);
    }
    next[0] = mod(next[0] + coefficient);
    result = next;
  }
  return result;
}

/** @param {number} a @param {number} b */
function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

/** @param {number} value @param {number} modulus */
function inverse(value, modulus) {
  assert.equal(gcd(value, modulus), 1);
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  throw new Error("inverse not found");
}

const state = Object.freeze({
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
});
const e = inverse(state.b, state.p - 1);
assert.equal(e, 3);

const table = grid.bytes.map(mod);
assert.equal(table.length, 256);

const pages = corpus.pages.filter(
  (page) => page.page < 56 && page.indices.length > 0
);
assert.equal(pages.length, 55);

const events = [];
for (const page of pages) {
  for (const pageOrder of ["high", "low"]) {
    const pageCoefficients =
      pageOrder === "high" ? page.indices : [...page.indices].reverse();

    for (const tableOrder of ["high", "low"]) {
      const tableCoefficients =
        tableOrder === "high" ? table : [...table].reverse();

      for (let r = 0; r < M; r += 1) {
        const pageJet = shift(pageCoefficients, r);
        const tableJet = shift(tableCoefficients, r);

        if (
          pageJet[0] !== 0 ||
          pageJet[1] !== 0 ||
          tableJet[0] !== 0 ||
          tableJet[1] !== 0
        ) {
          continue;
        }

        const qPage = pageJet[2];
        const qTable = tableJet[2];
        const dPage = pageJet[3];
        const dTable = tableJet[3];
        const delta = mod(qPage - qTable);
        const packet = [r, r + delta, qTable, qPage];
        const consecutive =
          packet[1] === r + 1 &&
          packet[2] === r + 2 &&
          packet[3] === r + 3 &&
          packet[3] < 43;

        events.push({
          page: page.page,
          pageOrder,
          tableOrder,
          r,
          qPage,
          qTable,
          dPage,
          dTable,
          delta,
          packet,
          consecutive,
        });
      }
    }
  }
}

assert.deepEqual(events, [
  {
    page: 29,
    pageOrder: "high",
    tableOrder: "high",
    r: 24,
    qPage: 27,
    qTable: 26,
    dPage: 6,
    dTable: 6,
    delta: 1,
    packet: [24, 25, 26, 27],
    consecutive: true,
  },
  {
    page: 29,
    pageOrder: "low",
    tableOrder: "low",
    r: 23,
    qPage: 10,
    qTable: 15,
    dPage: 13,
    dTable: 16,
    delta: 24,
    packet: [23, 47, 15, 10],
    consecutive: false,
  },
]);

const consecutiveEvents = events.filter((event) => event.consecutive);
assert.equal(consecutiveEvents.length, 1);

const selected = consecutiveEvents[0];
assert.equal(selected.page, 29);
assert.equal(selected.pageOrder, "high");
assert.equal(selected.tableOrder, "high");

// Secondary state cross-check, not used to choose the page or orientation.
assert.equal(selected.r, mod(-state.g));
assert.equal(selected.qPage, mod(-state.K));
assert.equal(selected.qTable, mod(-e));
assert.equal(selected.dPage, state.a);
assert.equal(selected.dTable, state.a);
assert.equal(selected.delta, mod(state.a - state.g));
assert.equal(selected.delta, mod(e - state.K));

// Parse only the authenticated natural-language body.
const bodyStart = signed2016.indexOf("Hello.");
const signatureStart = signed2016.indexOf("-----BEGIN PGP SIGNATURE-----");
assert.ok(bodyStart >= 0 && signatureStart > bodyStart);
const body = signed2016
  .slice(bodyStart, signatureStart)
  .replace(/\b7A35090F\b/g, "");
const words = body.match(/[A-Za-z]+/g) || [];
assert.equal(words.length, 43);

const upper = words.map((word) => word.toUpperCase());
const packetWords = selected.packet.map((index) => upper[index]);
assert.deepEqual(packetWords, ["AND", "THEIR", "NUMBERS", "ARE"]);

// The p28 source-selection bridge independently fixed these before this gate.
assert.equal(upper[28], "THE");
assert.equal(upper[29], "DIRECTION");

const sixIndices = [...selected.packet, 28, 29];
assert.deepEqual(sixIndices, [24, 25, 26, 27, 28, 29]);
const sixWords = sixIndices.map((index) => upper[index]);
assert.deepEqual(
  sixWords,
  ["AND", "THEIR", "NUMBERS", "ARE", "THE", "DIRECTION"]
);

// Report nearby source context, without using it as a selector.
const context = upper.slice(22, 31).map((word, offset) => ({
  index: offset + 22,
  word,
}));

console.log(JSON.stringify({
  status: "PASS",
  chargedFamily: {
    pages: pages.length,
    pageOrders: 2,
    tableOrders: 2,
    roots: 29,
    totalConfigurations: pages.length * 2 * 2 * 29,
    sharedDoubleRootEvents: events,
    consecutivePackets: consecutiveEvents.length,
  },
  selectedPacket: {
    page: selected.page,
    root: selected.r,
    qTable: selected.qTable,
    qPage: selected.qPage,
    dTable: selected.dTable,
    dPage: selected.dPage,
    delta: selected.delta,
    indices: selected.packet,
    words: packetWords,
  },
  independentContinuation: {
    indices: [28, 29],
    words: [upper[28], upper[29]],
  },
  completeInstructionSpan: {
    indices: sixIndices,
    words: sixWords,
    text: sixWords.join(" "),
  },
  stateCrosscheck: {
    e,
    identities: {
      rootEqualsMinusG: selected.r === mod(-state.g),
      pageQuotientEqualsMinusK: selected.qPage === mod(-state.K),
      tableQuotientEqualsMinusE: selected.qTable === mod(-e),
      bothDerivativesEqualA:
        selected.dPage === state.a && selected.dTable === state.a,
      deltaEqualsAMinusG: selected.delta === mod(state.a - state.g),
    },
  },
  nearbySourceContext: context,
  classification:
    "Retrospective but orientation-selective source bridge: the independently selected p29/table repeated-root Taylor packet uniquely emits signed indices 24..27 = AND THEIR NUMBERS ARE; the independently selected p28 THE/DIRECTION bridge supplies indices28..29, completing AND THEIR NUMBERS ARE THE DIRECTION.",
}, null, 2));
