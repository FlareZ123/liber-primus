"use strict";

/**
 * Dual READOUT packet standard-DH cascade.
 *
 * Starting from fixed one-based (A,K), the split packet emits candidate (a,p),
 * the independently selected whole packet indexed by those values emits
 * candidate (b,B), and ordinary Diffie-Hellman algebra must uniquely recover
 * g while reproducing the starting A and K. The selected pair is the sole hit
 * among the 23 center-F matched receivers and returns to p50 root189.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const raw = fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const segments = raw.split(/^\s*%\s*$/m).slice(0, 55);

function physicalPage(segment) {
  return segment >= 50 ? segment + 1 : segment;
}

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

function parsePage(source) {
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      start,
      end: start + current.length - 1,
      values: current.slice(),
    });
    current = [];
  }

  for (const char of [...source]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if ((char === "-" || char === ".") && current.length) {
      flush();
    }
  }
  flush();
  return { runes, words };
}

function shellWord(values) {
  const out = [];
  for (let left = 0, right = values.length - 1;
    left < right; left += 1, right -= 1) {
    out.push(
      mod29(values[left] - values[right]),
      mod29(values[left] + values[right])
    );
  }
  if (values.length % 2 === 1) {
    out.push(values[(values.length - 1) / 2]);
  }
  return out;
}

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const next = x % y;
    x = y;
    y = next;
  }
  return x;
}

function inverse(value, modulus) {
  let oldR = value;
  let r = modulus;
  let oldS = 1;
  let s = 0;

  while (r !== 0) {
    const q = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }

  if (oldR !== 1) return null;
  return ((oldS % modulus) + modulus) % modulus;
}

function modPow(base, exponent, modulus) {
  let result = 1 % modulus;
  let factor = base % modulus;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * factor) % modulus;
    factor = (factor * factor) % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}

function isPrime(value) {
  if (value < 2) return false;
  for (let divisor = 2; divisor * divisor <= value; divisor += 1) {
    if (value % divisor === 0) return false;
  }
  return true;
}

const fixedA = 8;
const fixedK = 2;

const spans = [];
for (let segment = 0; segment < segments.length; segment += 1) {
  const page = parsePage(segments[segment]);
  for (let first = 0; first < page.words.length; first += 1) {
    let length = 0;
    for (let last = first; last < page.words.length; last += 1) {
      length += page.words[last].values.length;
      if (length > 23) break;
      if (length !== 23) continue;

      const start = page.words[first].start;
      const end = page.words[last].end;
      if (end - start + 1 !== 23) continue;

      const stream = page.words
        .slice(first, last + 1)
        .flatMap((word) => shellWord(word.values));

      spans.push({
        page: physicalPage(segment),
        start,
        end,
        centerF: page.runes[start + 11] === 0,
        stream,
      });
    }
  }
}

assert.equal(spans.length, 614);

function evaluateDhCascade(first, second) {
  const a = first.stream[fixedA - 1];
  const p = first.stream[fixedK - 1];

  if (!isPrime(p) || a <= 0 || a >= p) return null;
  if (a > 23 || p > 23) return null;

  const b = second.stream[a - 1];
  const B = second.stream[p - 1];

  if (b <= 0 || b >= p || B <= 0 || B >= p) return null;
  if (gcd(b, p - 1) !== 1) return null;

  const inverseB = inverse(b, p - 1);
  assert.notEqual(inverseB, null);

  const g = modPow(B, inverseB, p);
  if (modPow(g, a, p) !== fixedA) return null;
  if (modPow(B, a, p) !== fixedK) return null;

  return { a, p, b, B, g };
}

function scanPairs(family) {
  const hits = [];
  for (const first of family) {
    for (const second of family) {
      if (first === second) continue;
      const result = evaluateDhCascade(first, second);
      if (!result) continue;
      hits.push({
        first: [first.page, first.start, first.end],
        second: [second.page, second.start, second.end],
        ...result,
      });
    }
  }
  return hits;
}

const matched = spans.filter((span) => span.centerF);
assert.equal(matched.length, 23);

 // The 256-token grid is one continuous 32x8 object physically split across
 // p49-p51. The page-local token counts define the original address breaks.
 const gridSegments = grid.pages.map((page) => ({
   page: page.page,
   tokens: page.tokens.length,
   rows: page.tokens.length / 8,
 }));
 assert.deepEqual(gridSegments, [
   {page:49,tokens:80,rows:10},
   {page:50,tokens:104,rows:13},
   {page:51,tokens:72,rows:9},
 ]);
 assert.equal(gridSegments.reduce((sum, page) => sum + page.tokens, 0), 256);
 assert.equal(corpus.pages.find((page) => page.page === 49).runic_count > 0, true);
 assert.equal(corpus.pages.find((page) => page.page === 50).runic_count, 0);
 assert.equal(corpus.pages.find((page) => page.page === 51).runic_count > 0, true);
 const firstTableBoundary = gridSegments[0].tokens; // address 80
 const secondTableBoundary = firstTableBoundary + gridSegments[1].tokens; // 184

 // Post-discovery physical-layout audit: charge the two original table page
 // breaks against all 23 already frozen center-F receiver windows.
 const startsAtFirstBoundary = matched.filter(
   (span) => span.start === firstTableBoundary);
 const crossesSecondBoundary = matched.filter(
   (span) => span.start < secondTableBoundary &&
     span.end >= secondTableBoundary);
 assert.deepEqual(startsAtFirstBoundary.map((span) =>
   [span.page,span.start,span.end]), [[0,80,102]]);
 assert.deepEqual(crossesSecondBoundary.map((span) =>
   [span.page,span.start,span.end]), [
   [0,166,188],
   [8,172,194],
   [24,172,194],
 ]);

 const samePageBoundaryPairs = [];
 for (const first of matched) {
   if (first.start !== firstTableBoundary) continue;
   for (const second of matched) {
     if (first === second || first.page !== second.page) continue;
     if (second.start < secondTableBoundary &&
         second.end >= secondTableBoundary) {
       samePageBoundaryPairs.push({
         first:[first.page,first.start,first.end],
         second:[second.page,second.start,second.end],
       });
     }
   }
 }
 assert.equal(matched.length * (matched.length - 1), 506);
 assert.deepEqual(samePageBoundaryPairs, [{
   first:[0,80,102],
   second:[0,166,188],
 }]);

const matchedHits = scanPairs(matched);
assert.deepEqual(matchedHits, [{
  first: [0, 80, 102],
  second: [0, 166, 188],
  a: 6,
  p: 23,
  b: 15,
  B: 19,
  g: 5,
}]);

const broadHits = scanPairs(spans);
assert.equal(broadHits.length, 26);


 const splitPacket = matched.find((span) =>
   span.page === 0 && span.start === 80 && span.end === 102);
 const wholePacket = matched.find((span) =>
   span.page === 0 && span.start === 166 && span.end === 188);
 assert.ok(splitPacket && wholePacket);
 const tablePageForAddress = (address) =>
   address < firstTableBoundary ? 49 :
     address < secondTableBoundary ? 50 : 51;
 const selectedPacketCoordinates = [
   {packet:"split",selector:8,value:splitPacket.stream[7],
     offset:splitPacket.start+7},
   {packet:"split",selector:2,value:splitPacket.stream[1],
     offset:splitPacket.start+1},
   {packet:"whole",selector:6,value:wholePacket.stream[5],
     offset:wholePacket.start+5},
   {packet:"whole",selector:23,value:wholePacket.stream[22],
     offset:wholePacket.start+22},
 ].map((row) => ({...row,tablePage:tablePageForAddress(row.offset)}));
 assert.deepEqual(selectedPacketCoordinates, [
   {packet:"split",selector:8,value:6,offset:87,tablePage:50},
   {packet:"split",selector:2,value:23,offset:81,tablePage:50},
   {packet:"whole",selector:6,value:15,offset:171,tablePage:50},
   {packet:"whole",selector:23,value:19,offset:188,tablePage:51},
 ]);
const selected = matchedHits[0];
assert.equal(modPow(selected.g, selected.a, selected.p), fixedA);
assert.equal(modPow(selected.B, selected.a, selected.p), fixedK);
assert.equal(modPow(selected.g, selected.b, selected.p), selected.B);

const rootAddress = selected.p * 8 + selected.g;
assert.equal(rootAddress, 189);

const tokens = grid.pages.flatMap((page) => page.tokens);
assert.equal(tokens[rootAddress], "3C");

const alphabet59 = grid.alphabet.replace("f", "");
function decode(token, alphabet) {
  let value = 0;
  for (const char of token) {
    const digit = alphabet.indexOf(char);
    assert.notEqual(digit, -1);
    value = value * alphabet.length + digit;
  }
  return value;
}

assert.equal(decode(tokens[rootAddress], alphabet59), rootAddress);

console.log(JSON.stringify({
  status: "PASS",
  allWordBounded23: spans.length,
  matchedCenterF23: matched.length,
  matchedOrderedPairs: matched.length * (matched.length - 1),
  matchedDhCascadeHits: matchedHits,
  broadOrderedPairs: spans.length * (spans.length - 1),
  broadDhCascadeHitCount: broadHits.length,
  gridPagination: {
    segments: gridSegments,
    boundaries: [firstTableBoundary, secondTableBoundary],
    samePageBoundaryPairs,
    selectedPacketCoordinates,
  },
  externalRoot: {
    zeroBasedCoordinate: [selected.p, selected.g],
    zeroBasedAddress: rootAddress,
    token: tokens[rootAddress],
    base59Value: decode(tokens[rootAddress], alphabet59),
    selfPointer: true,
  },
}, null, 2));
