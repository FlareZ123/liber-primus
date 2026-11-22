"use strict";

/**
 * Agent32: frozen LP2 printed 256-token table as a functional address graph.
 *
 * Both conventions are CONDITIONAL:
 *   A) ordinary 60-digit alphabet 0..255;
 *   B) source-unused 'f' deleted, 59-digit alphabet 0..251.
 *
 * For each convention, byte[i] is a 0-based successor cell address.
 * The matched shuffle preserves every original printed token, fixes the
 * physical ASCII LP3 cells and the reported base59 self-reference cell189,
 * and rearranges the other 252 complete source tokens without changing
 * their paired base60/base59 readings. The null is retrospective: counts
 * measure surprise of already-discovered properties, not authorship odds.
 *
 * Run: node sims/lp2_p50_lp3_pointer_b59_b60_cycles_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} name */
function load(name) {
  return JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
}

const grid = load("resources/liber-primus/base60-grid.json");
const ink = load("resources/liber-primus/lp2-ink-annotations.json");
const corpus = load("resources/liber-primus/lp2-corpus.json");
const tokens = grid.rows.flat();
assert.equal(tokens.length, 256);
assert.ok(grid.rows.length === 32 && grid.rows.every(row => row.length === 8));
assert.equal(grid.alphabet.length, 60);
assert.ok(!tokens.some(token => token.includes("f")));

const reducedAlphabet = grid.alphabet.replace("f", "");
assert.equal(reducedAlphabet.length, 59);

/** @param {string} alphabet */
function decode(alphabet) {
  const digit = new Map([...alphabet].map((char, index) => [char, index]));
  return tokens.map(token =>
    digit.get(token[0]) * alphabet.length + digit.get(token[1])
  );
}
const bytes60 = decode(grid.alphabet);
const bytes59 = decode(reducedAlphabet);
assert.deepEqual(bytes60, grid.byte_rows.flat());
for (const bytes of [bytes60, bytes59]) {
  assert.ok(bytes.every(b => Number.isInteger(b) && b >= 0 && b < 256));
}

const firstRed = ink.pages.find(page => page.page === 57).large_punctuation[0];
assert.deepEqual(firstRed, [7, 13, "red"]);
const markerIndex = 47; // Outer clockwise cell13 = original r6c8.
assert.deepEqual([47, 55, 63].map(i => tokens[i]), ["1G", "1K", "0p"]);
assert.deepEqual([47, 55, 63].map(i => bytes60[i]), [76, 80, 51]);
assert.equal(String.fromCharCode(bytes60[47], bytes60[55], bytes60[63]), "LP3");

/**
 * Find every directed cycle of a finite functional graph a[i] -> a[a[i]].
 * All vertices and their outgoing addresses must fit the indexed range.
 * @param {number[]} addresses
 * @returns {number[][]}
 */
function findCycles(addresses) {
  const n = addresses.length;
  const visited = new Uint8Array(n);
  const cycles = [];
  for (let first = 0; first < n; first++) {
    if (visited[first]) continue;
    const local = new Int16Array(n);
    local.fill(-1);
    /** @type {number[]} */
    const path = [];
    let vertex = first;
    while (local[vertex] === -1 && !visited[vertex]) {
      local[vertex] = path.length;
      path.push(vertex);
      vertex = addresses[vertex];
    }
    if (local[vertex] !== -1) {
      cycles.push(path.slice(local[vertex]));
    }
    for (const v of path) visited[v] = 1;
  }
  return cycles;
}

/**
 * Return the leading tail length and eventual cycle length from one vertex.
 * @param {number[]} addresses
 * @param {number} start
 */
function orbit(addresses, start) {
  const visitedAt = new Int16Array(addresses.length);
  visitedAt.fill(-1);
  const points = [];
  let at = start;
  while (visitedAt[at] === -1) {
    visitedAt[at] = points.length;
    points.push(at);
    at = addresses[at];
  }
  return {
    tail: visitedAt[at],
    period: points.length - visitedAt[at],
    points
  };
}

/** @param {number[]} addresses @param {number[]} cycle */
function basinSize(addresses, cycle) {
  const set = new Set(cycle);
  let count = 0;
  for (let i = 0; i < addresses.length; i++) {
    const seen = new Set();
    let at = i;
    while (!seen.has(at)) {
      if (set.has(at)) {
        count++;
        break;
      }
      seen.add(at);
      at = addresses[at];
    }
  }
  return count;
}

// Fully independent small planted graph with known single three-node cycle.
const plant = [1, 4, 1, 1, 7, 2, 5, 1];
assert.deepEqual(findCycles(plant), [[1, 4, 7]]);
assert.equal(basinSize(plant, [1, 4, 7]), 8);
assert.deepEqual([orbit(plant, 1).tail, orbit(plant, 1).period], [0, 3]);

const cycles60 = findCycles(bytes60);
const cycles59 = findCycles(bytes59);
assert.deepEqual(cycles60, [
  [0, 203, 68, 199, 47, 76, 114, 197, 115, 247, 192],
  [249, 158]
]);
assert.deepEqual(cycles59, [[189]]);
assert.deepEqual([bytes59[67], bytes59[189]], [189, 189]);
assert.deepEqual([basinSize(bytes60, cycles60[0]),
  basinSize(bytes60, cycles60[1])], [252, 4]);
assert.equal(basinSize(bytes59, cycles59[0]), 256);

const origin = orbit(bytes60, markerIndex);
assert.equal(origin.tail, 0);
assert.equal(origin.period, 11);
assert.deepEqual(origin.points, [
  47, 76, 114, 197, 115, 247, 192, 0, 203, 68, 199
]);
const sourceP57 = corpus.pages.find(page => page.page === 57).indices;
const surfaceWord = [..."SURFACE"].map(char => corpus.translit.indexOf(char));
assert.ok(surfaceWord.every(index => index >= 0));
const surfacePositions = [];
for (let i = 0; i <= sourceP57.length - surfaceWord.length; i++) {
  if (surfaceWord.every((symbol, k) => sourceP57[i + k] === symbol)) {
    surfacePositions.push(i);
  }
}
assert.equal(surfacePositions.length, 1);
const sourceSurfaceGP0 = surfaceWord.reduce((total, value) => total + value, 0);
assert.equal(sourceSurfaceGP0, 67);

const base59Red13Orbit = orbit(bytes59, markerIndex);
assert.equal(base59Red13Orbit.period, 1);
assert.equal(base59Red13Orbit.tail, 12);
assert.deepEqual(base59Red13Orbit.points, [
  47, 75, 174, 206, 125, 20, 100, 82, 198, 103, 203, 67, 189
]);
assert.equal(base59Red13Orbit.points.at(-2), sourceSurfaceGP0);
assert.equal(base59Red13Orbit.points.length, firstRed[1]);
assert.equal(bytes59[189], 189);

/**
 * Direct, frozen historical p56 prime-totient inverse with the original
 * b59 graph root189 used as a prime-index start for source-selected p55.
 * The original p55 Fehu runes remain literal and do not advance the key.
 * This tests one motivated receiver, without offset or mask optimization.
 */
function primesAtLeast(length) {
  const all = [];
  for (let candidate = 2; all.length < length; candidate++) {
    let isPrime = true;
    for (let d = 2; d * d <= candidate; d++) {
      if (candidate % d === 0) { isPrime = false; break; }
    }
    if (isPrime) all.push(candidate);
  }
  return all;
}
const primeList = primesAtLeast(300);
const originalP56 = corpus.pages.find(page => page.page === 56).indices;
let p56Clock = 0;
const decodedP56 = originalP56.map((cipher, offset) =>
  offset === 56 ? cipher :
    (cipher - (primeList[p56Clock++] - 1) % 29 + 29) % 29
);
assert.ok(decodedP56.map(i => corpus.translit[i]).join("")
  .startsWith("ANENDWITHINTHEDEEPWEBTH"));

const originalP55 = corpus.pages.find(page => page.page === 55).indices;
const p55Fehu = originalP55.flatMap((value, i) => value === 0 ? [i] : []);
assert.deepEqual(p55Fehu, [15, 25, 41]);
let p55Clock = 0;
const proposedP55 = originalP55.map(cipher =>
  cipher === 0 ? 0 :
    (cipher - (primeList[189 + p55Clock++] - 1) % 29 + 29) % 29
);
assert.equal(p55Clock, 73);
let reverseP55Clock = 0;
assert.deepEqual(proposedP55.map(plain =>
  plain === 0 ? 0 :
    (plain + (primeList[189 + reverseP55Clock++] - 1) % 29) % 29
), originalP55);
function ioc(sequence) {
  const counts = Array(29).fill(0);
  for (const rune of sequence) counts[rune]++;
  return counts.reduce((total, count) =>
    total + count * (count - 1), 0) /
    (sequence.length * (sequence.length - 1));
}
assert.ok(Math.abs(ioc(proposedP55) - 0.03508771929824561) < 1e-10);

/**
 * Conditional matched null. Fixed original source cells preserve the exact
 * red13→LP3 observation and the indexed 3C=189 self-point under base59.
 * The remaining 252 printed two-character tokens are moved intact.
 *
 * Every output count refers to these fixed post-discovery diagnostics.
 * @returns {{trials:number, counts:Record<string,number>}}
 */
function matchedNull() {
  const fixed = new Set([47, 55, 63, 189]);
  const positions = [];
  const source60 = [];
  const source59 = [];
  for (let i = 0; i < 256; i++) {
    if (fixed.has(i)) continue;
    positions.push(i);
    source60.push(bytes60[i]);
    source59.push(bytes59[i]);
  }
  assert.equal(positions.length, 252);
  const state60 = bytes60.slice();
  const state59 = bytes59.slice();
  let seed = 0x13f53c91;
  /** @returns {number} */
  function random() {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return seed >>> 0;
  }
  const counts = {
    b60LOn11: 0,
    b60_11and2: 0,
    b59Unique189: 0,
    b60LOn11_b59Unique189: 0,
    fullBothCycleFamilies: 0,
    b59Marker13PathTo189: 0,
    b59MarkerPathViaSurface67: 0,
    b59Marker13ViaSurface67: 0
  };
  const trials = 120000;
  for (let trial = 0; trial < trials; trial++) {
    const sh = Array.from({length: 252}, (_, i) => i);
    for (let i = sh.length - 1; i > 0; i--) {
      const j = random() % (i + 1);
      [sh[i], sh[j]] = [sh[j], sh[i]];
    }
    for (let i = 0; i < positions.length; i++) {
      state60[positions[i]] = source60[sh[i]];
      state59[positions[i]] = source59[sh[i]];
    }
    const selected = orbit(state60, markerIndex);
    const l11 = selected.tail === 0 && selected.period === 11;
    const c60 = findCycles(state60);
    const c59 = findCycles(state59);
    const profile = c60.length === 2 &&
      c60.some(cycle => cycle.length === 11) &&
      c60.some(cycle => cycle.length === 2);
    const sink = c59.length === 1 &&
      c59[0].length === 1 && c59[0][0] === 189;
    if (l11) counts.b60LOn11++;
    if (profile) counts.b60_11and2++;
    if (sink) counts.b59Unique189++;
    if (l11 && sink) counts.b60LOn11_b59Unique189++;
    if (profile && l11 && sink) counts.fullBothCycleFamilies++;
    const route = orbit(state59, markerIndex).points;
    const reachesFixedRoot = route.at(-1) === 189;
    const length13 = route.length === 13;
    const viaSourceSurface = reachesFixedRoot &&
      route.length >= 2 && route.at(-2) === sourceSurfaceGP0;
    if (reachesFixedRoot && length13) counts.b59Marker13PathTo189++;
    if (viaSourceSurface) counts.b59MarkerPathViaSurface67++;
    if (viaSourceSurface && length13) counts.b59Marker13ViaSurface67++;
  }
  return {trials, counts};
}
const nullResult = matchedNull();
assert.deepEqual(nullResult.counts, {
  b60LOn11: 779,
  b60_11and2: 216,
  b59Unique189: 1404,
  b60LOn11_b59Unique189: 9,
  fullBothCycleFamilies: 0,
  b59Marker13PathTo189: 1120,
  b59MarkerPathViaSurface67: 182,
  b59Marker13ViaSurface67: 14
});

console.log(JSON.stringify({
  classification: "Original table structure; conditional typed address grammar",
  page57OpeningRedDots: firstRed[1],
  base60Cycles: cycles60,
  base60Basins: [252, 4],
  base60AnchorOrbit: origin,
  base60CyclicVertices: cycles60.flat().length,
  base59Cycles: cycles59,
  base59Basin: 256,
  base59Cell67: bytes59[67],
  base59Cell189: bytes59[189],
  sourceSolvedP57Surface: {
    transliteration: "SURFACE",
    gpOrdinalSum: sourceSurfaceGP0,
    originalSourceRuneOffset: surfacePositions[0]
  },
  base59Red13PointerRoute: base59Red13Orbit,
  primeTotientRoot189OnOriginalP55: {
    historicalSolvedP56Positive: true,
    primeStartIndex: 189,
    firstPrime: primeList[189],
    consumedKeyRunes: p55Clock,
    preservedLiteralFehuOffsets: p55Fehu,
    sourceOriginalIoC: ioc(originalP55),
    decodedIoC: ioc(proposedP55),
    originalReceiverReencoded: true,
    decodedPrefix: proposedP55.slice(0, 30).map(i => corpus.translit[i]).join(""),
    recoveredUnknownPlaintext: false
  },
  matchedTokenPermutation: {
    ...nullResult,
    rates: Object.fromEntries(Object.entries(nullResult.counts).map(
      ([key, n]) => [key, n / nullResult.trials]
    ))
  },
  caveat: "Retrospective motifs and a postselected dual-radix comparison; this null is not an authorship p-value or a decoder",
  unknownLP2PlaintextRecovered: false
}, null, 2));
