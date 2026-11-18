"use strict";

/**
 * SFT: source-internal four-rune stop for the already selected post-TURNS
 * shared2 branch.
 *
 * Run:
 *   node sims/lp2_2016_plus29_p0p1_stop_convergence_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = require("../resources/liber-primus/lp2-corpus.json");
const p50 = require("../resources/liber-primus/lp2-grid-256.json");
const signed = fs.readFileSync(
  path.join(root, "resources", "historical", "cicada2016-4gq25-outguess.asc"),
  "utf8"
);

const translit = corpus.translit;
const ordered = translit
  .map((text, index) => ({text, index}))
  .sort((a, b) => b.text.length - a.text.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S");
  const out = [];
  let at = 0;
  while (at < normalized.length) {
    const token = ordered.find(row => normalized.startsWith(row.text, at));
    assert.ok(token, `unmapped word ${word} at ${at}`);
    out.push(token.index);
    at += token.text.length;
  }
  return out;
}

/** @param {number[]} values @returns {number} */
const sum = values => values.reduce((total, value) => total + value, 0);

/** @param {number} value @returns {number} */
const mod29 = value => (value % 29 + 29) % 29;

/** @param {number} n @returns {number} */
function phi(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let result = n;
  let rest = n;
  for (let p = 2; p * p <= rest; p += 1) {
    if (rest % p !== 0) continue;
    while (rest % p === 0) rest /= p;
    result -= result / p;
  }
  if (rest > 1) result -= result / rest;
  return result;
}

/** @param {number} n @returns {number} */
function mu(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let rest = n;
  let sign = 1;
  for (let p = 2; p * p <= rest; p += 1) {
    if (rest % p !== 0) continue;
    rest /= p;
    sign = -sign;
    if (rest % p === 0) return 0;
  }
  return rest > 1 ? -sign : sign;
}

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const out = [];
  for (let n = 2; out.length < count; n += 1) {
    let prime = true;
    for (let d = 2; d * d <= n; d += 1) {
      if (n % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(n);
  }
  return out;
}

const clear = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\r?\n\r?\n/)
  .slice(1)
  .join("\n");
const words = clear
  .split(/[^A-Za-z0-9]+/)
  .filter(token => /^[A-Za-z]+$/.test(token));
assert.equal(words.length, 43);

const wordRows = words.map((word, index) => ({
  index,
  word: word.toLowerCase(),
  gp0: sum(gp(word)),
}));
const arithmeticWindows = [];
for (let i = 0; i + 2 < wordRows.length; i += 1) {
  const triple = wordRows.slice(i, i + 3);
  const d1 = triple[1].gp0 - triple[0].gp0;
  const d2 = triple[2].gp0 - triple[1].gp0;
  if (d1 === d2) {
    arithmeticWindows.push({
      index: i,
      words: triple.map(row => row.word),
      gp0: triple.map(row => row.gp0),
      step: d1,
    });
  }
}
assert.deepEqual(arithmeticWindows, [{
  index: 3,
  words: ["lies", "empty", "epiphany"],
  gp0: [63, 92, 121],
  step: 29,
}]);

const signedAddresses = arithmeticWindows[0].gp0;
const tableCoordinates = signedAddresses.map(address => [
  Math.floor(address / 8),
  address % 8,
]);
assert.deepEqual(tableCoordinates, [[7, 7], [11, 4], [15, 1]]);
const tableSteps = [
  [
    tableCoordinates[1][0] - tableCoordinates[0][0],
    tableCoordinates[1][1] - tableCoordinates[0][1],
  ],
  [
    tableCoordinates[2][0] - tableCoordinates[1][0],
    tableCoordinates[2][1] - tableCoordinates[1][1],
  ],
];
assert.deepEqual(tableSteps, [[4, -3], [4, -3]]);

const reflectedCoordinates = tableCoordinates.map(([row, column]) => [row, 7 - column]);
const reflectedSteps = [
  [
    reflectedCoordinates[1][0] - reflectedCoordinates[0][0],
    reflectedCoordinates[1][1] - reflectedCoordinates[0][1],
  ],
  [
    reflectedCoordinates[2][0] - reflectedCoordinates[1][0],
    reflectedCoordinates[2][1] - reflectedCoordinates[1][1],
  ],
];
assert.deepEqual(reflectedSteps, [[4, 3], [4, 3]]);
assert.equal(Math.abs(tableSteps[0][0]), Math.abs(reflectedSteps[0][0]));
const verticalStop = Math.abs(tableSteps[0][0]);
assert.equal(verticalStop, 4);

// Reproduce the shared2 ring geodesic on the source 32x8 table after two peels.
// The remaining rectangle is rows2..29, columns2..5 in zero-based coordinates.
const ring = [];
for (let row = 2; row <= 29; row += 1) ring.push(row * 8 + 5);
for (let column = 4; column >= 2; column -= 1) ring.push(29 * 8 + column);
for (let row = 28; row >= 2; row -= 1) ring.push(row * 8 + 2);
for (let column = 3; column <= 4; column += 1) ring.push(2 * 8 + column);
assert.equal(ring.length, 60);

const root = 189;
const target = 186;
const rootAt = ring.indexOf(root);
const targetAt = ring.indexOf(target);
assert.ok(rootAt >= 0 && targetAt >= 0);

const forwardDistance = (targetAt - rootAt + ring.length) % ring.length;
const reverseDistance = (rootAt - targetAt + ring.length) % ring.length;
assert.equal(Math.min(forwardDistance, reverseDistance), 15);

const direction = forwardDistance === 15 ? 1 : -1;
const shortArc = Array.from({length: 16}, (_, i) =>
  ring[(rootAt + direction * i + ring.length) % ring.length]
);
assert.deepEqual(shortArc, [
  189,197,205,213,221,229,237,236,235,234,226,218,210,202,194,186,
]);

/** @param {number} address @returns {[number, number]} */
const tableCoord = address => [Math.floor(address / 8), address % 8];
const stepNames = [];
for (let i = 1; i < shortArc.length; i += 1) {
  const [r0, c0] = tableCoord(shortArc[i - 1]);
  const [r1, c1] = tableCoord(shortArc[i]);
  stepNames.push(
    r1 > r0 ? "DOWN" :
    r1 < r0 ? "UP" :
    c1 > c0 ? "RIGHT" : "LEFT"
  );
}
const segments = [];
for (const step of stepNames) {
  if (!segments.length || segments.at(-1).direction !== step) {
    segments.push({direction: step, length: 1});
  } else {
    segments.at(-1).length += 1;
  }
}
assert.deepEqual(segments, [
  {direction: "DOWN", length: 6},
  {direction: "LEFT", length: 3},
  {direction: "UP", length: 6},
]);

// Apply the ring-selected directions to the frozen post-TURNS state.
const chapter = corpus.pages.filter(page => page.page <= 2).flatMap(page => page.indices);
assert.equal(chapter.length, 729);
/** @param {[number, number]} cell @returns {number} */
const at = ([row, column]) => chapter[(row - 1) * 27 + column - 1];

const anchor = [14, 19];
const distance = phi(translit.indexOf("NG"));
assert.equal(distance, 12);
const keyCenter = [anchor[0] + distance, anchor[1]]; // DOWN
const start = [anchor[0], anchor[1] - distance]; // LEFT
assert.deepEqual(keyCenter, [26, 19]);
assert.deepEqual(start, [14, 7]);

const rawNodeCells = [
  [keyCenter[0] - 1, keyCenter[1]],
  keyCenter,
  [keyCenter[0] + 1, keyCenter[1]],
];
const rawNode = rawNodeCells.map(at);
assert.deepEqual(rawNode.map(value => translit[value]), ["H", "TH", "H"]);
const derivedNode = [rawNode[0], phi(rawNode[1]), rawNode[2]];
assert.deepEqual(derivedNode.map(value => translit[value]), ["H", "U", "H"]);
const rotation = mod29(derivedNode.reduce(
  (total, value) => total + mu(phi(value)),
  0
)) % 3;
assert.equal(rotation, 1);
const key = derivedNode.slice(rotation).concat(derivedNode.slice(0, rotation));
assert.deepEqual(key.map(value => translit[value]), ["U", "H", "H"]);

assert.equal(segments[2].direction, "UP");
const cells = Array.from({length: verticalStop}, (_, i) => [start[0] - i, start[1]]);
const cipher = cells.map(at);
const plain = cipher.map((value, i) => mod29(value - key[i % key.length]));
assert.deepEqual(cipher.map(value => translit[value]), ["G", "J", "EA", "A"]);
assert.deepEqual(plain.map(value => translit[value]), ["C", "O", "L", "D"]);
const roundTrip = plain.map((value, i) => mod29(value + key[i % key.length]));
assert.deepEqual(roundTrip, cipher);

const gpPrimes = firstPrimes(29);
assert.equal(plain.length, 4);
assert.equal(sum(plain), 51);
assert.equal(sum(plain.map(index => gpPrimes[index])), 182);

console.log(JSON.stringify({
  classification: "retrospective source convergence for p0-to-p1 COLD stop",
  signedDirection: {
    words: arithmeticWindows[0].words,
    gp0: signedAddresses,
    originalSteps: tableSteps,
    reflectedSteps,
    reflectionInvariantVerticalMagnitude: verticalStop,
  },
  shared2Directions: segments,
  postTurns: {
    keyCenter,
    rawNode: rawNode.map(value => translit[value]),
    key: key.map(value => translit[value]),
    start,
    readDirection: "UP",
    stop: verticalStop,
    cells,
    ciphertext: cipher.map(value => translit[value]),
    plaintext: plain.map(value => translit[value]),
    indexSum: sum(plain),
    gpPrimeSum: sum(plain.map(index => gpPrimes[index])),
  },
  decision: "COLD has a source-internal 4-rune stop independent of the LP1 checksum; retain as retrospective until a fresh transition is predicted",
}, null, 2));
