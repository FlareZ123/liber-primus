"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8").replace(/\r/g, "");
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");

const tokens = grid.pages.flatMap((p) => p.tokens);
const a60 = grid.alphabet;
const used = new Set(tokens.flatMap((t) => [t[0], t[1]]));
const missing = [...a60].filter((x) => !used.has(x));
assert.deepEqual(missing, ["f"]);
const a59 = a60.replace("f", "");

/** @param {string} token @param {string} alphabet */
function decode(token, alphabet) {
  const h = alphabet.indexOf(token[0]);
  const l = alphabet.indexOf(token[1]);
  assert.ok(h >= 0 && l >= 0);
  return h * alphabet.length + l;
}

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return true;
}
const primes = [];
for (let n = 2; primes.length < 256; n += 1) if (isPrime(n)) primes.push(n);
const primeRank = new Map(primes.map((p, i) => [p, i + 1]));

const clear = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");
const words = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((x) => /^[A-Za-z]+$/u.test(x))
  .map((x) => x.toUpperCase());
assert.equal(words.length, 43);
assert.deepEqual(words.slice(17, 30), [
  "THE", "MAP", "THEIR", "MEANING", "IS", "THE", "ROAD",
  "AND", "THEIR", "NUMBERS", "ARE", "THE", "DIRECTION",
]);

/** @param {string} alphabet */
function adjacentPrimePairs(alphabet) {
  const values = tokens.map((t) => decode(t, alphabet));
  const out = [];
  for (let r = 0; r < 32; r += 1) {
    for (let c = 0; c < 8; c += 1) {
      const i = 8 * r + c;
      for (const [dr, dc, direction] of [[0, 1, "E"], [1, 0, "S"]]) {
        const rr = r + dr;
        const cc = c + dc;
        if (rr >= 32 || cc >= 8) continue;
        const j = 8 * rr + cc;
        const ri = primeRank.get(values[i]) || null;
        const rj = primeRank.get(values[j]) || null;
        if (ri !== null && rj !== null && Math.abs(ri - rj) === 1) {
          out.push({ i, j, direction, values: [values[i], values[j]], ranks: [ri, rj] });
        }
      }
    }
  }
  return out;
}

const p60 = adjacentPrimePairs(a60);
assert.deepEqual(p60, [
  { i: 211, j: 219, direction: "S", values: [61, 59], ranks: [18, 17] },
]);
assert.deepEqual([words[17], words[18]], ["THE", "MAP"]);

const p59 = adjacentPrimePairs(a59);
assert.deepEqual(p59, [
  { i: 40, j: 41, direction: "E", values: [79, 83], ranks: [22, 23] },
  { i: 152, j: 160, direction: "S", values: [227, 229], ranks: [49, 50] },
]);
assert.deepEqual(p59[0].ranks.map((r) => words[r]), ["THE", "ROAD"]);

assert.equal(tokens[43], "1D");
assert.equal(decode("1D", a60), 73);
assert.equal(primeRank.get(73), 21);
assert.equal(words[21], "IS");
assert.equal(Number.parseInt("1D", 16), 29);
assert.equal(words[29], "DIRECTION");

const dual = [];
for (let i = 0; i < tokens.length; i += 1) {
  const v59 = decode(tokens[i], a59);
  const v60 = decode(tokens[i], a60);
  const r59 = primeRank.get(v59) || null;
  const r60 = primeRank.get(v60) || null;
  if (r59 === null || r60 === null) continue;
  if (r59 >= words.length || r60 >= words.length) continue;
  if (Math.abs(r59 - r60) !== 1) continue;
  dual.push({ i, token: tokens[i], v59, r59, w59: words[r59], v60, r60, w60: words[r60] });
}
assert.deepEqual(dual, [
  { i: 24, token: "1n", v59: 107, r59: 28, w59: "THE",
    v60: 109, r60: 29, w60: "DIRECTION" },
  { i: 223, token: "2V", v59: 149, r59: 35, w59: "FOUND",
    v60: 151, r60: 36, w60: "GOOD" },
]);

assert.equal(words[24], "AND");
assert.deepEqual(words.slice(24, 30), [
  "AND", "THEIR", "NUMBERS", "ARE", "THE", "DIRECTION",
]);

const p29 = corpus.pages.find((p) => p.page === 29).indices;
assert.deepEqual(p29.slice(106, 108), [8, 15]);
assert.deepEqual(p29.slice(108, 112), [11, 26, 11, 18]);

const mod29 = (x) => ((x % 29) + 29) % 29;
/** @param {number[]} x */
function h2(x) { return [mod29(x[0] - x[1]), mod29(x[0] + x[1])]; }
/** @param {number[]} x */
function h4(x) {
  return [
    mod29(x[0] - x[3]),
    mod29(x[1] - x[2]),
    mod29(x[1] + x[2]),
    mod29(x[0] + x[3]),
  ];
}
assert.deepEqual(h2(p29.slice(106, 108)), [22, 23]);
assert.deepEqual([words[22], words[23]], ["THE", "ROAD"]);
assert.deepEqual(h4(p29.slice(108, 112)), [22, 15, 8, 0]);

assert.equal(primeRank.get(decode(tokens[203], a59)), 19);
assert.equal(words[19], "THEIR");
assert.equal(tokens[195], "1T");
assert.equal(decode(tokens[195], a60), 89);
assert.equal(primeRank.get(decode(tokens[195], a60)), 24);
assert.equal(words[24], "AND");
assert.notEqual(primeRank.get(decode(tokens[195], a59)), 20);
assert.notEqual(primeRank.get(decode(tokens[195], a60)), 20);

// The completed MAP support independently recovers AND's number24.
// Dereference that exact recovered rank as a p50 address: it is the sole
// signed-range rank on the selected THEIR->ROAD segment whose same-number
// address is one of the global dual-radix consecutive signed tokens.
const selectedRank = primeRank.get(decode(tokens[195], a60));
assert.equal(selectedRank, 24);
assert.equal(tokens[selectedRank], "1n");
assert.deepEqual(dual.find((entry) => entry.i === selectedRank), {
  i:24, token:"1n", v59:107, r59:28, w59:"THE",
  v60:109, r60:29, w60:"DIRECTION",
});
const segmentSignedRanks = new Set();
for (let row = 25; row >= 5; row -= 1) {
  const cell = row * 8 + 3;
  for (const alphabet of [a60, a59]) {
    const r = primeRank.get(decode(tokens[cell], alphabet)) || null;
    if (r !== null && r < words.length) segmentSignedRanks.add(r);
  }
}
const segmentDualDereferences = [...segmentSignedRanks].filter((r) =>
  dual.some((entry) => entry.i === r)
);
assert.deepEqual(segmentDualDereferences, [24]);

/**
 * Apply the minimal human movement grammar suggested by DIRECTION.
 * N/S/E/W are absolute; U/D alias page up/down; L/R turn relative to the
 * current heading. Only positive one-digit distances are admitted.
 * @param {number} cell
 * @param {string} token
 * @param {"N"|"E"|"S"|"W"} heading
 * @returns {{cell:number,heading:"N"|"E"|"S"|"W"} | null}
 */
function move(cell, token, heading) {
  const match = /^([1-9])([NSEWLRUD])$/iu.exec(token);
  if (!match) return null;
  const steps = Number(match[1]);
  const op = match[2].toUpperCase();
  const directions = ["N", "E", "S", "W"];
  let nextHeading = heading;
  if (op === "L") {
    nextHeading = directions[(directions.indexOf(heading) + 3) % 4];
  } else if (op === "R") {
    nextHeading = directions[(directions.indexOf(heading) + 1) % 4];
  } else if (op === "U") {
    nextHeading = "N";
  } else if (op === "D") {
    nextHeading = "S";
  } else {
    nextHeading = op;
  }
  let row = Math.floor(cell / 8);
  let column = cell % 8;
  if (nextHeading === "N") row -= steps;
  if (nextHeading === "S") row += steps;
  if (nextHeading === "E") column += steps;
  if (nextHeading === "W") column -= steps;
  if (row < 0 || row >= 32 || column < 0 || column >= 8) return null;
  return {cell: row * 8 + column, heading: nextHeading};
}

const segmentMovementPrograms = [];
for (let row = 25; row >= 5; row -= 1) {
  const origin = row * 8 + 3;
  for (const [radix, alphabet] of [[60, a60], [59, a59]]) {
    const r = primeRank.get(decode(tokens[origin], alphabet)) || null;
    if (r === null || r >= words.length) continue;
    const firstToken = tokens[r];
    const first = move(origin, firstToken, "N");
    if (!first) continue;
    const secondToken = tokens[first.cell];
    const second = move(first.cell, secondToken, first.heading);
    segmentMovementPrograms.push({
      origin, radix, rank:r, word:words[r], firstToken,
      firstCell:first.cell, secondToken,
      secondCell:second ? second.cell : null,
    });
  }
}
assert.deepEqual(segmentMovementPrograms, [{
  origin:195, radix:60, rank:24, word:"AND", firstToken:"1n",
  firstCell:187, secondToken:"1L", secondCell:186,
}]);
assert.equal(tokens[186], "0J");
assert.equal(decode(tokens[186], a59), 19);
assert.equal(decode(tokens[186], a60), 19);
assert.equal(primeRank.get(19), 8);
assert.equal(words[8], "DEVOTED");
// Raw 19 is the already recovered DH public value B=19. It is not source[19].

const luckPrime = primes[36];
assert.equal(luckPrime, 157);
const luckCells59 = tokens.flatMap((t, i) => decode(t, a59) === luckPrime ? [i] : []);
const luckCells60 = tokens.flatMap((t, i) => decode(t, a60) === luckPrime ? [i] : []);
assert.deepEqual(luckCells60, []);
assert.deepEqual(luckCells59, [194]);
assert.ok(![215, 222, 224, 231].includes(194));

console.log("PASS p50 map/road/direction -> p29 bridge");
console.log(JSON.stringify({
  uniqueUnusedDigit: missing[0],
  mapPair: { cells: [219, 211], ranks: [17, 18], words: ["THE", "MAP"] },
  roadPair: { cells: [40, 41], ranks: [22, 23], words: ["THE", "ROAD"] },
  intersection: {
    cell: 43, token: "1D",
    base60: { value: 73, rank: 21, word: "IS" },
    hex: { value: 29, word: "DIRECTION" },
  },
  dualRadixConsecutiveTokens: dual,
  p29: {
    preceding: { offsets: [106, 108], h2: [22, 23], words: ["THE", "ROAD"] },
    selected: { offsets: [108, 112], h4: [22, 15, 8, 0] },
  },
  mapSupportAndDirection: {
    andCell: 195,
    andValue: 89,
    andPrimeRank: 24,
    dereferenceAddress: 24,
    dereferenceToken: tokens[24],
    dualWords: ["THE", "DIRECTION"],
    segmentDualDereferences,
    movementProgram: segmentMovementPrograms[0],
    movementTerminal: {
      cell:186,
      token:tokens[186],
      base59:decode(tokens[186], a59),
      base60:decode(tokens[186], a60),
      primeRank:primeRank.get(19),
      conditionalZeroOriginRankWord:words[primeRank.get(19)],
      dhPublicValueB:19,
    },
  },
  stoppedBeforeMeaning: false,
  foundGoodDoesNotContinueToLuck: true,
}, null, 2));
