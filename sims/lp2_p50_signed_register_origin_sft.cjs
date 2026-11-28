"use strict";

/**
 * Signed-message register-origin gate for Director issue #3354.
 * SFT: node sims/lp2_p50_signed_register_origin_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8")
  .replace(/\r\n/g, "\n");

const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const tokens = grid.pages.flatMap((page) => page.tokens);
const a60 = grid.alphabet;
const a59 = a60.replace("f", "");
assert.equal(tokens.length, 256);
assert.equal(a60.length, 60);
assert.equal(a59.length, 59);
const clear = signed.split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----\nHash: [^\n]+\n\n/u, "");

const words = clear.split(/[^A-Za-z0-9]+/u)
  .filter((x) => /^[A-Za-z]+$/u.test(x))
  .map((x) => x.toUpperCase());

assert.equal(words.length, 43);

const zeroOrigin = (n) => words[n];
const oneBased = (n) => words[n - 1];
const expected = new Map([
  [17, ["THE", "ARE"]],
  [18, ["MAP", "THE"]],
  [19, ["THEIR", "MAP"]],
  [20, ["MEANING", "THEIR"]],
  [21, ["IS", "MEANING"]],
  [22, ["THE", "IS"]],
  [23, ["ROAD", "THE"]],
  [24, ["AND", "ROAD"]],
  [28, ["THE", "ARE"]],
  [29, ["DIRECTION", "THE"]],
  [35, ["FOUND", "BE"]],
  [36, ["GOOD", "FOUND"]],
  [39, ["FALSE", "BEWARE"]],
  [40, ["PATHS", "FALSE"]]
]);

for (const [n, pair] of expected) {
  assert.equal(zeroOrigin(n), pair[0]);
  assert.equal(oneBased(n), pair[1]);
}

assert.equal(zeroOrigin(22) + " " + zeroOrigin(23), "THE ROAD");
assert.equal(oneBased(22) + " " + oneBased(23), "IS THE");
assert.equal(zeroOrigin(17) + " " + zeroOrigin(18), "THE MAP");
assert.equal(oneBased(17) + " " + oneBased(18), "ARE THE");

assert.equal(words.slice(17, 25).join(" "),
  "THE MAP THEIR MEANING IS THE ROAD AND");
assert.equal(words.slice(16, 24).join(" "),
  "ARE THE MAP THEIR MEANING IS THE ROAD");

/** @param {string} token @param {string} alphabet */
function decode(token, alphabet) {
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0);
  return hi * alphabet.length + lo;
}
/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return true;
}
const primes = [];
for (let n = 2; primes.length < 300; n += 1) if (isPrime(n)) primes.push(n);
const primeRank = new Map(primes.map((p, i) => [p, i + 1]));
const ranks = new Map([
  [59, tokens.map((token) => primeRank.get(decode(token, a59)) || null)],
  [60, tokens.map((token) => primeRank.get(decode(token, a60)) || null)],
]);
const at = (row, column) => row * 8 + column;

/**
 * Search the exact discovered rank scaffold while allowing each cell either
 * source-visible radix and both physical orientations.
 */
function scanNumericScaffold() {
  const hits = [];
  for (let k = 1; k <= 35; k += 1) {
    const distance = k + 3;
    for (const vertical of [-1, 1]) {
      for (const horizontal of [-1, 1]) {
        for (let row0 = 0; row0 < 32; row0 += 1) {
          for (let column = 0; column < 8; column += 1) {
            const rows = [
              row0,
              row0 + vertical,
              row0 + 2 * vertical,
              row0 + 3 * vertical,
            ];
            const crossRow = row0 + 2 * vertical + distance * vertical;
            if (rows.some((row) => row < 0 || row >= 32) ||
                crossRow < 0 || crossRow >= 32) continue;
            const requirements = [
              [at(rows[0], column), k],
              [at(rows[1], column), k + 1],
              [at(rows[2], column), k + 2],
              [at(rows[3], column), k + 7],
              [at(crossRow, column), k + 4],
            ];
            const verticalOk = requirements.every(([cell, wanted]) =>
              [59, 60].some((radix) => ranks.get(radix)[cell] === wanted));
            if (!verticalOk) continue;
            for (let roadColumn = 0; roadColumn < 8; roadColumn += 1) {
              const nextColumn = roadColumn + horizontal;
              if (nextColumn < 0 || nextColumn >= 8) continue;
              const first = at(crossRow, roadColumn);
              const second = at(crossRow, nextColumn);
              const firstOk = [59, 60].some((radix) =>
                ranks.get(radix)[first] === k + 5);
              const secondOk = [59, 60].some((radix) =>
                ranks.get(radix)[second] === k + 6);
              if (firstOk && secondOk) {
                hits.push({
                  k, vertical, horizontal, start:[row0, column],
                  intersection:[crossRow, column],
                  roadPair:[[crossRow, roadColumn], [crossRow, nextColumn]],
                  distance,
                });
              }
            }
          }
        }
      }
    }
  }
  return hits;
}

const scaffoldHits = scanNumericScaffold();
assert.deepEqual(scaffoldHits, [{
  k:17, vertical:-1, horizontal:1, start:[27,3],
  intersection:[5,3], roadPair:[[5,0],[5,1]], distance:20,
}]);

const rankDistanceChecksum = [
  {rank:17, row:27}, {rank:18, row:26}, {rank:19, row:25},
].map(({rank, row}) => ({rank, distance:row - 5, sum:rank + row - 5}));
assert.deepEqual(rankDistanceChecksum, [
  {rank:17, distance:22, sum:39},
  {rank:18, distance:21, sum:39},
  {rank:19, distance:20, sum:39},
]);
assert.equal(primeRank.get(decode(tokens[126], a60)), 38);
assert.equal(primeRank.get(decode(tokens[182], a60)), 39);
assert.equal(primeRank.get(decode(tokens[2], a60)), 39);
assert.equal(primeRank.get(decode(tokens[26], a60)), 40);

// The two reasonable text origins each turn ROAD's corresponding number into
// a locally consistent direction token, so this cannot select an origin.
assert.equal(zeroOrigin(23), "ROAD");
assert.equal(tokens[23], "1R");
assert.equal(oneBased(24), "ROAD");
assert.equal(tokens[24], "1n");
assert.equal(oneBased(19), "MAP");
// rank19 is cell203 and rank24 is cell195: one physical cell north.
assert.equal(primeRank.get(decode(tokens[203], a59)), 19);
assert.equal(primeRank.get(decode(tokens[195], a60)), 24);
assert.equal(203 - 195, 8);

// Global control: the signed-register address band is not enriched for the
// movement-looking tokens used by the local ROAD duality.
const movementToken = /^([1-9])([NSEWLRUD])$/iu;
const movementCells = tokens.flatMap((token, cell) =>
  movementToken.test(token) ? [{cell, token}] : []);
const movementFirst43 = movementCells.filter(({cell}) => cell < words.length);
assert.equal(movementCells.length, 60);
assert.equal(movementFirst43.length, 12);

/** @param {number} n @param {number} k */
function logChoose(n, k) {
  let sum = 0;
  for (let i = 1; i <= k; i += 1) {
    sum += Math.log(n - k + i) - Math.log(i);
  }
  return sum;
}
/** @param {number} k */
function hypergeometricPmf(k) {
  return Math.exp(
    logChoose(60, k) +
    logChoose(196, 43 - k) -
    logChoose(256, 43)
  );
}
let movementTail = 0;
for (let k = 12; k <= 43; k += 1) movementTail += hypergeometricPmf(k);
assert.ok(Math.abs(movementTail - 0.2821018581118496) < 1e-12);
const movementExpected = 43 * 60 / 256;
assert.equal(movementExpected, 10.078125);

const lineCounts = clear.split("\n")
  .map((line) => (line.match(/[A-Za-z]+/g) || []).length);
assert.equal(Math.max(...lineCounts), 11);
assert.ok(lineCounts.every((n) => n < 29));

const book2012 = read("im-results/2012-845145127/162667212858-image-payload.asc");
assert.match(book2012, /^1:29$/mu);
assert.match(book2012, /^1:1$/mu);
assert.match(book2012, /^the first prime$/mu);

console.log(JSON.stringify({
  words: words.length,
  integer29: {zero: zeroOrigin(29), one: oneBased(29)},
  rank17_18: {
    zero: [zeroOrigin(17), zeroOrigin(18)],
    one: [oneBased(17), oneBased(18)]
  },
  rank22_23: {
    zero: [zeroOrigin(22), zeroOrigin(23)],
    one: [oneBased(22), oneBased(23)]
  },
  maxLineWords: Math.max(...lineCounts),
  originInvariantNumericScaffold: scaffoldHits[0],
  rankDistanceChecksum,
  roadDirectionRival: {
    zeroOrigin: {roadNumber:23, token:tokens[23], physical:"right"},
    oneBased: {roadNumber:24, token:tokens[24], physical:"north"},
  },
  movementRegisterControl: {
    fullTable:movementCells.length,
    first43:movementFirst43.length,
    expected:movementExpected,
    hypergeometricRightTail:movementTail,
  }
}, null, 2));
