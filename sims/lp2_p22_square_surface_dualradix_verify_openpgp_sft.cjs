"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const squares = read("resources/cicada2014-openpuff-magic-squares.txt")
  .trim()
  .split(/\n\s*\n/u)
  .map((block) => block
    .split("\n")
    .map((line) => line.trim().split(/\s+/u).map(Number)));

const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");

const tape = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = grid.alphabet.replace("f", "");
assert.equal(tape.length, 256);
assert.equal(squares.length, 3);

const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} text @returns {number} */
function gp0(text) {
  const normalized = text
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  let sum = 0;
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      sum += 21;
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      sum += 27;
      offset += 2;
      continue;
    }
    const token = gpTokens.find((row) => normalized.startsWith(row.symbol, offset));
    assert.ok(token, "Unmapped GP spelling: " + normalized.slice(offset));
    sum += token.value;
    offset += token.symbol.length;
  }
  return sum;
}

const clearMatch = signed.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);
assert.ok(clearMatch);
const sourceWords = (clearMatch[1].match(/\b[A-Za-z]+\b/gu) || [])
  .map((word) => word.toUpperCase());
assert.equal(sourceWords.length, 43);

const sourceByGp0 = new Map();
sourceWords.forEach((word, index) => {
  const value = gp0(word);
  if (!sourceByGp0.has(value)) sourceByGp0.set(value, []);
  sourceByGp0.get(value).push({word, index});
});

const p57Words = "PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE"
  .split(/\s+/u);
const p57ByGp0 = new Map();
p57Words.forEach((word, index) => {
  const value = gp0(word);
  if (!p57ByGp0.has(value)) p57ByGp0.set(value, []);
  p57ByGp0.get(value).push({word, index});
});

/** @param {number[][]} square @returns {number[]} */
function outerRing(square) {
  const n = square.length;
  const out = [];
  for (let column = 0; column < n; column += 1) out.push(square[0][column]);
  for (let row = 1; row < n; row += 1) out.push(square[row][n - 1]);
  for (let column = n - 2; column >= 0; column -= 1) out.push(square[n - 1][column]);
  for (let row = n - 2; row > 0; row -= 1) out.push(square[row][0]);
  return out;
}

/**
 * @param {number} source
 * @param {string} alphabet
 * @param {"base59"|"base60"} radix
 * @returns {{source:number,address:number,token:string,value:number,radix:string,hits:Array<{word:string,index:number}>}}
 */
function readCell(source, alphabet, radix) {
  const address = ((source % 256) + 256) % 256;
  const token = tape[address];
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.notEqual(high, -1);
  assert.notEqual(low, -1);
  const value = alphabet.length * high + low;
  return {
    source,
    address,
    token,
    value,
    radix,
    hits: sourceByGp0.get(value) || [],
  };
}

/** @param {number[][]} square @returns {Array<{position:number,word:string,index:number,radix:string,source:number,address:number,token:string,value:number}>} */
function signedEvents(square) {
  const events = [];
  outerRing(square).forEach((source, position) => {
    for (const row of [
      readCell(source, alphabet59, "base59"),
      readCell(source, alphabet60, "base60"),
    ]) {
      for (const hit of row.hits) {
        events.push({
          position,
          word: hit.word,
          index: hit.index,
          radix: row.radix,
          source,
          address: row.address,
          token: row.token,
          value: row.value,
        });
      }
    }
  });
  return events;
}

/** @param {Array<{position:number,index:number,word:string}>} events */
function adjacentForwardPairs(events) {
  const pairs = [];
  for (let left = 0; left < events.length; left += 1) {
    for (let right = left + 1; right < events.length; right += 1) {
      if (events[right].position <= events[left].position) continue;
      if (events[right].index === events[left].index + 1) {
        pairs.push({
          left: events[left],
          right: events[right],
        });
      }
    }
  }
  return pairs;
}

const charged = squares.map((square, squareIndex) => {
  const events = signedEvents(square);
  return {
    square: squareIndex + 1,
    order: square.length,
    events,
    adjacentForwardPairs: adjacentForwardPairs(events),
  };
});

const target = charged[0];
const targetVerify = target.events.filter((row) =>
  row.word === "VERIFY" && row.radix === "base60"
);
const targetOpenPgp = target.events.filter((row) =>
  row.word === "OPENPGP" && row.radix === "base59"
);

assert.deepEqual(targetVerify.map((row) => row.position), [3,11]);
assert.deepEqual(targetOpenPgp.map((row) => row.position), [5,13]);

const verifyOpenPgpPairs = target.adjacentForwardPairs.filter((pair) =>
  pair.left.word === "VERIFY" &&
  pair.right.word === "OPENPGP"
);
assert.equal(verifyOpenPgpPairs.length, 4);

// Other authenticated squares have no forward adjacent signed-source pair at all.
assert.equal(charged[1].adjacentForwardPairs.length, 0);
assert.equal(charged[2].adjacentForwardPairs.length, 0);
const p57SurfaceEvents = outerRing(squares[0]).flatMap((source, position) =>
  [
    readCell(source, alphabet59, "base59"),
    readCell(source, alphabet60, "base60"),
  ].flatMap((row) => (p57ByGp0.get(row.value) || []).map((hit) => ({
    position,
    word: hit.word,
    index: hit.index,
    radix: row.radix,
    source,
    address: row.address,
    token: row.token,
    value: row.value,
  })))
);
assert.deepEqual(
  [...new Map(p57SurfaceEvents.map((row) => [row.word, row])).values()]
    .map((row) => ({word:row.word,index:row.index}))
    .sort((left,right) => left.index - right.index),
  [
    {word:"CIRCUMFERENCES",index:13},
    {word:"DIVINITY",index:16},
  ]
);
assert.deepEqual(p57Words.slice(13,17), [
  "CIRCUMFERENCES",
  "FIND",
  "THE",
  "DIVINITY",
]);

console.log(JSON.stringify({
  status: "PASS",
  rule:
    "For each authenticated magic square, traverse the printed outer perimeter clockwise from top-left. At every perimeter integer, apply the same zero-origin p50 address and read both globally live base59/base60 interpretations. Record authenticated signed-source GP0 hits.",
  targetSquare: {
    events: target.events,
    verifyOpenPgpPairs,
    p57SurfaceEvents,
    p57Bracket: p57Words.slice(13,17),
  },
  controls: charged.slice(1),
  decision:
    "The selected 809-centered square is the only authenticated source square whose uniformly charged two-radix surface contains any forward adjacent signed-source pair; that pair is VERIFY41 -> OPENPGP42. The same surface yields p57 endpoints CIRCUMFERENCES13 and DIVINITY16, bracketing CIRCUMFERENCES FIND THE DIVINITY. Preserve as cross-source support for the literal SURFACE/OpenPGP route, not as a license to switch radix per target word.",
}, null, 2));
