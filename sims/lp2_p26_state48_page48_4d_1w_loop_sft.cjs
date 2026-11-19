"use strict";

/**
 * SFT: p26 WAY/MAP state56 -> page48 -> 4D ordinal -> 1W self-return.
 *
 * This tests a source-only continuation of the fixed p50 navigation route.
 * No unknown plaintext values are scored or fit.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const table = grid.rows.flat();
const bytes = grid.byte_rows.flat();

assert.equal(table.length, 256);
assert.equal(bytes.length, 256);

const singleGp = new Map();
corpus.translit.forEach((symbol, value) => {
  if (/^[A-Z]$/u.test(symbol)) singleGp.set(symbol, value);
});

/**
 * Move by a literal digit+cardinal token on the original 32x8 p50 table.
 * @param {number} address
 * @param {string} token
 * @returns {number|null}
 */
function cardinalMove(address, token) {
  const match = token.match(/^([1-9])([NSEW])$/u);
  if (!match) return null;
  const magnitude = Number(match[1]);
  const direction = match[2];
  let row = Math.floor(address / 8);
  let column = address % 8;

  if (direction === "N") row -= magnitude;
  if (direction === "S") row += magnitude;
  if (direction === "W") column -= magnitude;
  if (direction === "E") column += magnitude;

  if (row < 0 || row >= 32 || column < 0 || column >= 8) return null;
  return row * 8 + column;
}

// Frozen WAY -> MAP continuation.
assert.equal(table[57], "1w");
assert.equal(table[56], "4E");
const asciiDirection = String.fromCharCode(Number.parseInt(table[56], 16));
assert.equal(asciiDirection, "N");
const state48 = 56 - 8;
assert.equal(state48, 48);

// The selected state is now also a physical unknown page number.
assert.equal(table[state48], "4D");
const page48 = corpus.pages.find((page) => page.page === state48);
assert.ok(page48);

const d = singleGp.get("D");
assert.notEqual(d, undefined);
const dOffsets = page48.indices
  .map((value, index) => value === d ? index : null)
  .filter((index) => index !== null);
assert.deepEqual(dOffsets.slice(0, 4), [19, 83, 100, 145]);

const fourthDOffset = dOffsets[3];
const fourthDPosition = fourthDOffset + 1;
assert.equal(fourthDOffset, 145);
assert.equal(fourthDPosition, 146);

// One-based ordinal position carries a literal movement token.
assert.equal(table[fourthDPosition], "1W");
const returnedOffset = cardinalMove(fourthDPosition, table[fourthDPosition]);
assert.equal(returnedOffset, fourthDOffset);
assert.equal(page48.indices[returnedOffset], d);
assert.equal(
  page48.indices.slice(0, returnedOffset + 1).filter((value) => value === d).length,
  4
);
assert.equal(table[returnedOffset], "3U");

// Familywise page-indexed ordinal audit.
// For every rune-bearing unknown page q <=55, open p50[q]. If the token is
// n<single GP letter>, select the nth occurrence of that rune on page q.
// Then inspect p50 at its one-based position and charge a literal cardinal
// move. A self-return lands on the selected rune's zero-based offset.
const rows = [];
for (const page of corpus.pages.filter((row) =>
  row.page <= 55 && row.indices.length > 0
)) {
  const pageToken = table[page.page];
  const match = pageToken.match(/^([1-9])([A-Z])$/u);
  if (!match || !singleGp.has(match[2])) continue;

  const ordinal = Number(match[1]);
  const symbol = match[2];
  const value = singleGp.get(symbol);
  const offsets = page.indices
    .map((rune, index) => rune === value ? index : null)
    .filter((index) => index !== null);

  if (offsets.length < ordinal) {
    rows.push({
      page: page.page,
      pageToken,
      ordinal,
      symbol,
      available: offsets.length,
      resolved: false,
    });
    continue;
  }

  const offset = offsets[ordinal - 1];
  const position = offset + 1;
  const positionToken = position < 256 ? table[position] : null;
  const destination = positionToken === null
    ? null
    : cardinalMove(position, positionToken);

  rows.push({
    page: page.page,
    pageToken,
    ordinal,
    symbol,
    available: offsets.length,
    resolved: true,
    offset,
    position,
    positionToken,
    destination,
    selfReturn: destination === offset,
  });
}

const resolved = rows.filter((row) => row.resolved);
const cardinalRows = resolved.filter((row) => row.destination !== null);
const selfReturns = resolved.filter((row) => row.selfReturn);

assert.equal(rows.length, 17);
assert.equal(resolved.length, 16);
assert.deepEqual(
  cardinalRows.map((row) => ({
    page: row.page,
    pageToken: row.pageToken,
    offset: row.offset,
    position: row.position,
    positionToken: row.positionToken,
    destination: row.destination,
  })),
  [
    {
      page: 31,
      pageToken: "2D",
      offset: 14,
      position: 15,
      positionToken: "3W",
      destination: 12,
    },
    {
      page: 48,
      pageToken: "4D",
      offset: 145,
      position: 146,
      positionToken: "1W",
      destination: 145,
    },
  ]
);
assert.deepEqual(
  selfReturns.map((row) => ({
    page: row.page,
    pageToken: row.pageToken,
    offset: row.offset,
    position: row.position,
    positionToken: row.positionToken,
  })),
  [{
    page: 48,
    pageToken: "4D",
    offset: 145,
    position: 146,
    positionToken: "1W",
  }]
);

console.log(JSON.stringify({
  status: "PASS",
  route: {
    wayMap: {
      wayState: 57,
      token: table[57],
      mapState: 56,
    },
    state56: {
      token: table[56],
      hexAsciiDirection: asciiDirection,
      nextState: state48,
    },
    page48: {
      pageToken: table[48],
      fourthDOffset,
      fourthDPosition,
      positionToken: table[fourthDPosition],
      returnedOffset,
      landingToken: table[returnedOffset],
    },
  },
  familyAudit: {
    pageIndexedOrdinalTokens: rows.length,
    resolvableOrdinals: resolved.length,
    cardinalAtOrdinal: cardinalRows.length,
    exactSelfReturns: selfReturns.length,
    selfReturns,
  },
  classification:
    "source-only page/ordinal/navigation self-index; preserves a p26-to-p48 route but does not recover plaintext",
}, null, 2));
