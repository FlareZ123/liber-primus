"use strict";

/**
 * SFT: the source-selected shared2 p50 circumference supplies the three
 * cardinal choices missing from the frozen post-TURNS 27x27 transition.
 *
 * The DH ring is derived before reading the selected p1 output. Its unique
 * 15-edge geodesic from root 189 to address 186 has segment directions
 * down, left, up. Those directions map in procedural order to the frozen
 * block-4 choices: key-center displacement, ciphertext-start displacement,
 * and read direction. The pre-existing LP1 checksum fixes the four-rune stop.
 *
 * Run from repository root:
 *   node sims/lp2_p50_dh_ring_selects_p0p1_cold_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8").replace(/\r\n/g, "\n");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const lp1 = read("resources/liber-primus/lp1-plaintext-reference.txt");

const translit = corpus.translit;
const alphabet60 = table.alphabet;
const alphabet59 = alphabet60.replace("f", "");
const tableTokens = table.pages.flatMap((page) => page.tokens);

assert.equal(tableTokens.length, 256);
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);

/** @param {number} value @returns {number} */
function mod29(value) {
  return (value % 29 + 29) % 29;
}

/** @param {number} n @returns {number} */
function phi(n) {
  assert(Number.isInteger(n) && n > 0);
  let value = n;
  let rest = n;
  for (let p = 2; p * p <= rest; p += 1) {
    if (rest % p !== 0) continue;
    while (rest % p === 0) rest /= p;
    value -= value / p;
  }
  if (rest > 1) value -= value / rest;
  return value;
}

/** @param {number} n @returns {number} */
function mu(n) {
  assert(Number.isInteger(n) && n > 0);
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

/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let p = 3; p * p <= n; p += 2) {
    if (n % p === 0) return false;
  }
  return true;
}

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const out = [];
  for (let n = 2; out.length < count; n += 1) {
    if (isPrime(n)) out.push(n);
  }
  return out;
}

const gpPrimes = firstPrimes(29);

/** @param {string} token @param {string} alphabet @returns {number} */
function tokenValue(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}

const rows = table.pages.reduce((sum, page) => sum + page.rows, 0);
const columns = table.pages[0].cols;
assert.equal(rows, 32);
assert.equal(columns, 8);
assert(table.pages.every((page) => page.cols === columns));

/**
 * Clockwise rectangular circumference, starting at the upper-left cell.
 * @param {number} depth
 * @returns {number[]}
 */
function circumference(depth) {
  const top = depth;
  const left = depth;
  const bottom = rows - 1 - depth;
  const right = columns - 1 - depth;
  const out = [];
  for (let column = left; column <= right; column += 1) {
    out.push(top * columns + column);
  }
  for (let row = top + 1; row <= bottom; row += 1) {
    out.push(row * columns + right);
  }
  for (let column = right - 1; column >= left; column -= 1) {
    out.push(bottom * columns + column);
  }
  for (let row = bottom - 1; row > top; row -= 1) {
    out.push(row * columns + left);
  }
  return out;
}

const ring = circumference(2);
assert.equal(ring.length, 60);

/** @param {number} index @returns {[number, number]} */
function tableCoordinate(index) {
  return [Math.floor(index / columns), index % columns];
}

/**
 * Directed arc through the fixed clockwise ring.
 * @param {number} start
 * @param {number} end
 * @param {1|-1} step
 * @returns {number[]}
 */
function ringArc(start, end, step) {
  const startPos = ring.indexOf(start);
  const endPos = ring.indexOf(end);
  assert(startPos >= 0 && endPos >= 0);
  const out = [start];
  let position = startPos;
  while (position !== endPos) {
    position = (position + step + ring.length) % ring.length;
    out.push(ring[position]);
  }
  return out;
}

/** @param {number} from @param {number} to @returns {string} */
function cardinalDirection(from, to) {
  const [r0, c0] = tableCoordinate(from);
  const [r1, c1] = tableCoordinate(to);
  const key = `${r1 - r0},${c1 - c0}`;
  const names = new Map([
    ["-1,0", "up"],
    ["1,0", "down"],
    ["0,-1", "left"],
    ["0,1", "right"],
  ]);
  const direction = names.get(key);
  assert(direction);
  return direction;
}

/**
 * Collapse unit ring moves into cardinal segments.
 * @param {number[]} path
 * @returns {{direction:string,length:number}[]}
 */
function segments(path) {
  const out = [];
  for (let i = 1; i < path.length; i += 1) {
    const direction = cardinalDirection(path[i - 1], path[i]);
    const last = out.at(-1);
    if (last && last.direction === direction) last.length += 1;
    else out.push({direction, length: 1});
  }
  return out;
}

// Frozen DH addresses and source-selected shared2 circumference.
const root = 189;
const start = 186;
const clockwise = ringArc(root, start, 1);
const counterclockwise = ringArc(root, start, -1);
const shortArc = clockwise.length < counterclockwise.length ? clockwise : counterclockwise;
assert.equal(shortArc.length - 1, 15);
assert.equal(counterclockwise.length - 1, 45);
assert.deepEqual(segments(shortArc), [
  {direction: "down", length: 6},
  {direction: "left", length: 3},
  {direction: "up", length: 6},
]);

// The signed generator g=5 lands on the independently selected 3301 -> 229
// table address. The token is literal 00, the existing conditional p0 exit.
const generator = 5;
assert.equal(shortArc[generator], 229);
assert.equal(tableTokens[229], "00");
assert.equal(tokenValue(tableTokens[229], alphabet59), 0);
assert.equal(tokenValue(tableTokens[229], alphabet60), 0);

// FIND independently addresses cell42. On this same circumference it is
// exactly 28 edges from cell229, and cell42 itself prints value28 in both
// frozen radix readings.
function ringDistance(a, b) {
  const pa = ring.indexOf(a);
  const pb = ring.indexOf(b);
  assert(pa >= 0 && pb >= 0);
  const delta = Math.abs(pa - pb);
  return Math.min(delta, ring.length - delta);
}
assert.equal(ringDistance(229, 42), 28);
assert.equal(tableTokens[42], "0S");
assert.equal(tokenValue(tableTokens[42], alphabet59), 28);
assert.equal(tokenValue(tableTokens[42], alphabet60), 28);

// Reproduce GP0(FIND)=42 from solved p57 rather than hard-coding the word sum.
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {string} source @returns {number[][]} */
function parseWords(source) {
  const words = [];
  let current = [];
  const flush = () => {
    if (!current.length) return;
    words.push(current);
    current = [];
  };
  for (const ch of [...source]) {
    const value = runeIndex.get(ch);
    if (value !== undefined) current.push(value);
    else if (current.length && "-.$&§".includes(ch)) flush();
  }
  flush();
  return words;
}

/** @param {number[]} word @returns {string} */
function spell(word) {
  return word.map((index) => translit[index]).join("");
}

const p57Words = parseWords(transcription.split("%").at(-1));
const find = p57Words.find((word) => spell(word) === "FIND");
assert(find);
assert.equal(find.reduce((sum, value) => sum + value, 0), 42);

// The reverse orientation has down, right, up. RIGHT is not an in-bounds
// distance-12 post-TURNS start choice, so the root-to-start orientation is
// the only one whose ordered directions can instantiate the frozen family.
const reverseSegments = segments([...shortArc].reverse());
assert.deepEqual(reverseSegments, [
  {direction: "down", length: 6},
  {direction: "right", length: 3},
  {direction: "up", length: 6},
]);

// Frozen p0-p2 27x27 post-TURNS family.
const sourceGrid = corpus.pages
  .filter((page) => page.page <= 2)
  .flatMap((page) => page.indices);
assert.equal(sourceGrid.length, 729);
const side = 27;

/** @param {[number, number]} point @returns {number} */
function at([row, column]) {
  return sourceGrid[(row - 1) * side + column - 1];
}

/** @param {[number, number]} point @returns {boolean} */
function inBounds([row, column]) {
  return row >= 1 && row <= side && column >= 1 && column <= side;
}

const directionRows = [
  ["up", -1, 0],
  ["down", 1, 0],
  ["left", 0, -1],
  ["right", 0, 1],
];
const directionMap = new Map(directionRows.map(([name, dr, dc]) => [name, [dr, dc]]));

const turnsAnchor = [14, 19];
const ng = translit.indexOf("NG");
assert.equal(ng, 21);
const displacement = phi(ng);
assert.equal(displacement, 12);

const displacementChoices = directionRows
  .map(([name, dr, dc]) => ({
    name,
    point: [turnsAnchor[0] + displacement * dr, turnsAnchor[1] + displacement * dc],
  }))
  .filter((row) => inBounds(row.point));
assert.deepEqual(displacementChoices.map((row) => row.name), ["up", "down", "left"]);
assert(!displacementChoices.some((row) => row.name === "right"));

// The ordered short-arc segments provide exactly the three missing choices.
const [centerDirection, startDirection, readDirection] =
  segments(shortArc).map((row) => row.direction);
assert.deepEqual(
  [centerDirection, startDirection, readDirection],
  ["down", "left", "up"]
);
assert(displacementChoices.some((row) => row.name === centerDirection));
assert(displacementChoices.some((row) => row.name === startDirection));
assert(directionMap.has(readDirection));
assert(!displacementChoices.some((row) => row.name === reverseSegments[1].direction));

const [centerDr, centerDc] = directionMap.get(centerDirection);
const center = [
  turnsAnchor[0] + displacement * centerDr,
  turnsAnchor[1] + displacement * centerDc,
];
const nodePoints = [
  [center[0] - centerDr, center[1] - centerDc],
  center,
  [center[0] + centerDr, center[1] + centerDc],
];
const rawNode = nodePoints.map(at);
assert.deepEqual(rawNode.map((value) => translit[value]), ["H", "TH", "H"]);
const derivedNode = [rawNode[0], phi(rawNode[1]), rawNode[2]];
const rotation = mod29(
  derivedNode.reduce((sum, value) => sum + mu(phi(value)), 0)
) % 3;
const key = derivedNode.slice(rotation).concat(derivedNode.slice(0, rotation));
assert.deepEqual(key.map((value) => translit[value]), ["U", "H", "H"]);

const [startDr, startDc] = directionMap.get(startDirection);
const cipherStart = [
  turnsAnchor[0] + displacement * startDr,
  turnsAnchor[1] + displacement * startDc,
];
assert.deepEqual(cipherStart, [14, 7]);

// Reproduce the pre-existing LP1 checksum stop. No p1 language score enters it.
const tokenOrder = translit
  .map((token, ordinal) => ({token, ordinal}))
  .sort((a, b) => b.token.length - a.token.length);

/** @param {string} original @returns {number[]|null} */
function encodeNativeGP(original) {
  const clean = original.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < clean.length;) {
    if (clean.startsWith("ING", i)) {
      out.push(21);
      i += 3;
      continue;
    }
    if (clean.startsWith("IO", i)) {
      out.push(27);
      i += 2;
      continue;
    }
    const token = tokenOrder.find((row) => clean.startsWith(row.token, i));
    if (!token) return null;
    out.push(token.ordinal);
    i += token.token.length;
  }
  return out;
}

/** @param {string[]} words */
function phraseMetrics(words) {
  const encoded = words.map(encodeNativeGP);
  assert(encoded.every((word) => word !== null));
  const runes = encoded.flat();
  return {
    words: words.length,
    runes: runes.length,
    indexSum: runes.reduce((sum, value) => sum + value, 0),
    gpSum: runes.reduce((sum, value) => sum + gpPrimes[value], 0),
  };
}

assert.equal(phraseMetrics(["FORM"]).gpSum, 91);
const prime91 = firstPrimes(91).at(-1);
assert.equal(prime91, 467);
const matrixValue = 2 * prime91;
assert.equal(matrixValue, 934);
assert.equal((lp1.match(/\b934\b/g) || []).length, 2);
const targetIndexSum = phi(matrixValue) / 2;
assert.equal(targetIndexSum, 233);

const warning = phraseMetrics(["YOU", "KNOW", "TO", "BE", "TRUE", "TEST", "THE"]);
assert.deepEqual(warning, {words: 7, runes: 21, indexSum: 232, gpSum: 825});
assert.equal(phi(targetIndexSum), warning.indexSum);

const prefix = phraseMetrics(["AS", "I", "GO", "THE", "WEATHER", "TURNS"]);
assert.deepEqual(prefix, {words: 6, runes: 17, indexSum: 182, gpSum: 643});
const residual = {
  words: warning.words - prefix.words,
  runes: warning.runes - prefix.runes,
  indexSum: targetIndexSum - prefix.indexSum,
  gpSum: warning.gpSum - prefix.gpSum,
};
assert.deepEqual(residual, {words: 1, runes: 4, indexSum: 51, gpSum: 182});

const [readDr, readDc] = directionMap.get(readDirection);
const cipherCells = [];
const plaintext = [];
for (let i = 0; i < residual.runes; i += 1) {
  const cell = [cipherStart[0] + i * readDr, cipherStart[1] + i * readDc];
  assert(inBounds(cell));
  cipherCells.push(cell);
  plaintext.push(mod29(at(cell) - key[i % key.length]));
}
assert.equal(plaintext.reduce((sum, value) => sum + value, 0), residual.indexSum);
assert.equal(plaintext.reduce((sum, value) => sum + gpPrimes[value], 0), residual.gpSum);

// Forward reconstruction on the selected original cells.
for (let i = 0; i < plaintext.length; i += 1) {
  assert.equal(mod29(plaintext[i] + key[i % key.length]), at(cipherCells[i]));
}

const output = plaintext.map((value) => translit[value]).join("");
assert.equal(output, "COLD");

// The g=5 p0 exit lies on the first segment; the full first and final vertical
// legs total the same 12 used by the frozen NG-totient displacement.
const shortSegments = segments(shortArc);
assert.equal(shortSegments[0].length + shortSegments[2].length, displacement);

process.stdout.write(JSON.stringify({
  classification:
    "source-constrained cross-object selector; candidate plaintext remains below established status",
  dhRing: {
    root,
    start,
    sharedShedDepth: 2,
    circumferenceLength: ring.length,
    geodesicEdges: shortArc.length - 1,
    segments: shortSegments,
    generator,
    generatorLanding: shortArc[generator],
    generatorLandingToken: tableTokens[shortArc[generator]],
    reverseSegments,
  },
  findSelfLocation: {
    findGp0: 42,
    findToken: tableTokens[42],
    findValue59: tokenValue(tableTokens[42], alphabet59),
    findValue60: tokenValue(tableTokens[42], alphabet60),
    distanceFrom00: ringDistance(229, 42),
  },
  postTurns: {
    displacement,
    availableDisplacements: displacementChoices,
    selectedDirections: [centerDirection, startDirection, readDirection],
    center,
    key: key.map((value) => translit[value]),
    cipherStart,
    cipherCells,
    checksumResidual: residual,
    decodedRunes: plaintext.map((value) => translit[value]),
    decodedWord: output,
  },
  decision:
    "The shared2 DH circumference removes the three directional degrees of freedom in the frozen 36-way post-TURNS family and, with the already locked LP1 checksum stop, selects COLD without a language score. The bridge was discovered after COLD was known, so it is a retrospective source-constrained selector rather than a prospective plaintext authentication.",
}, null, 2) + "\n");
