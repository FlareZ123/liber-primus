"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * Recover candidate source-key shifts from next-word initials after complete
 * one-rune GP words. A purely source-conditioned discriminator, not a solver.
 *
 * Run from repository root: node sims/lp2_singleton_nextword_key_oracle_sft.cjs
 */

function read(rel) {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf8");
}

const GP_COUNT = 29;
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const physicalPages = corpus.pages.filter((p) => p.page >= 0 && p.page <= 55);
const ciphertext = physicalPages.flatMap((p) => p.indices);
const gp = new Map(corpus.runes.map((r, i) => [r, i]));
const gpLatin = new Map(corpus.translit.map((s, i) => [s, i]));

assert.equal(ciphertext.length, 12956);
assert.equal(gp.size, 29);

const loc = [];
for (const p of physicalPages) {
  for (let i = 0; i < p.indices.length; i++) {
    loc.push({ page: p.page, local: i });
  }
}

function sourceWords() {
  const text = read("resources/lp2-transcription.txt").split("%").slice(0, 55).join("%");
  const words = [];
  const observed = [];
  let size = 0;
  let start = 0;
  let offset = 0;

  function finish(separator) {
    if (!size) return;
    words.push({ start, end: offset, length: size, separator });
    size = 0;
  }

  for (const rune of text) {
    if (gp.has(rune)) {
      if (!size) start = offset;
      observed.push(gp.get(rune));
      offset++;
      size++;
    } else if (rune !== "%" && rune !== "/" && !/\s/u.test(rune)) {
      finish(rune);
    }
  }
  finish("");

  assert.equal(words.length, 2896);
  assert.deepEqual(observed, ciphertext);
  return words;
}

const words = sourceWords();
const allSingletons = words.filter((w) => w.length === 1);
const probes = allSingletons.filter((w) =>
  w.separator === "-" &&
  w.end < ciphertext.length &&
  loc[w.end].page === loc[w.end - 1].page
).map((w) => ({
  global: w.end,
  local: loc[w.end].local,
  delta: (ciphertext[w.end] - ciphertext[w.end - 1] + GP_COUNT) % GP_COUNT
}));

assert.equal(allSingletons.length, 83);
assert.equal(probes.length, 75);

function firstRune(word) {
  const normalized = word.replace(/[KQ]/gu, "C").replace(/V/gu, "U").replace(/Z/gu, "S");
  for (const d of ["TH", "EO", "OE", "AE", "IA", "EA", "NG"]) {
    if (normalized.startsWith(d)) return gpLatin.get(d);
  }
  return gpLatin.get(normalized[0]);
}

function nativeSingletonSuccessors() {
  const w = read("resources/control/shakespeare_first300k.txt").toUpperCase().match(/[A-Z]+/gu);
  const events = [];
  for (let i = 0; i + 1 < w.length; i++) {
    if (w[i] !== "A" && w[i] !== "I") continue;
    const next = firstRune(w[i + 1]);
    if (next === undefined) continue;
    events.push({ type: w[i] === "A" ? 0 : 1, next });
  }
  assert.equal(events.length, 1976);
  return events;
}

const nativeEvents = nativeSingletonSuccessors();
const halfNative = Math.floor(nativeEvents.length / 2);
const training = nativeEvents.slice(0, halfNative);
const nativeHoldout = nativeEvents.slice(halfNative);
const counts = [Array(29).fill(0.5), Array(29).fill(0.5)];
for (const e of training) counts[e.type][e.next]++;
const probability = counts.map((a) => {
  const sum = a.reduce((x, y) => x + y, 0);
  return a.map((x) => x / sum);
});
const weightA = training.filter((e) => e.type === 0).length / training.length;

// Enumerate all 29^2 unknown word-initial shifts. The formula holds for
// any remaining 27 entries of the proposed predecessor-plaintext key.
const logTable = Array.from({ length: 29 * 29 }, (_, k) => {
  const a = Math.floor(k / 29);
  const b = k % 29;
  return Array.from({ length: 29 }, (_, d) => {
    const p = weightA * probability[0][(d - a + 29) % 29] +
      (1 - weightA) * probability[1][(d - b + 29) % 29];
    return Math.log(29 * p);
  });
});

function likelihood(symbols, keyIndex) {
  return symbols.reduce((sum, d) => sum + logTable[keyIndex][d], 0);
}

function bestFit(symbols) {
  const frequency = Array(29).fill(0);
  for (const d of symbols) frequency[d]++;
  let gain = -Infinity;
  let keyIndex = -1;
  for (let k = 0; k < logTable.length; k++) {
    let value = 0;
    for (let d = 0; d < 29; d++) value += frequency[d] * logTable[k][d];
    if (value > gain) {
      gain = value;
      keyIndex = k;
    }
  }
  return { gain, fA: Math.floor(keyIndex / 29), fI: keyIndex % 29, keyIndex };
}

function primeList(count) {
  const limit = 300000;
  const composite = new Uint8Array(limit + 1);
  const primes = [];
  for (let p = 2; p <= limit && primes.length < count; p++) {
    if (composite[p]) continue;
    primes.push(p);
    for (let j = p * p; j <= limit; j += p) composite[j] = 1;
  }
  assert.equal(primes.length, count);
  return primes;
}

const primes = primeList(17000);
const rows = grid.byte_rows;
assert.equal(rows.length, 32);
assert(rows.every((row) => row.length === 8));
const gridRowMajor = rows.flat();
const gridColMajor = Array.from({ length: 8 }, (_, col) => rows.map((row) => row[col])).flat();
const keyedStreams = [
  ["none", () => 0],
  ["prime-totient-global", (e) => (primes[e.global] - 1) % 29],
  ["prime-totient-page", (e) => (primes[e.local] - 1) % 29],
  ["prime-totient-global-3301", (e) => (primes[e.global + 3300] - 1) % 29],
  ["grid-row-major-global", (e) => gridRowMajor[e.global % 256] % 29],
  ["grid-row-major-page", (e) => gridRowMajor[e.local % 256] % 29],
  ["grid-column-major-global", (e) => gridColMajor[e.global % 256] % 29],
  ["grid-column-major-page", (e) => gridColMajor[e.local % 256] % 29],
  ["grid-reverse-global", (e) => gridRowMajor[255 - (e.global % 256)] % 29],
  ["grid-reverse-page", (e) => gridRowMajor[255 - (e.local % 256)] % 29]
];

function dekey(e, key) {
  return (e.delta - key(e) + 29) % 29;
}

const screen = keyedStreams.map(([name, key]) => {
  const data = probes.map((e) => dekey(e, key));
  const full = bestFit(data);
  const split = Math.floor(data.length / 2);
  const fitFirst = bestFit(data.slice(0, split));
  const fitSecond = bestFit(data.slice(split));
  return {
    name,
    full: { gain: full.gain, fA: full.fA, fI: full.fI },
    trainFirstGain: fitFirst.gain,
    firstToSecondHoldout: likelihood(data.slice(split), fitFirst.keyIndex),
    trainSecondGain: fitSecond.gain,
    secondToFirstHoldout: likelihood(data.slice(0, split), fitSecond.keyIndex)
  };
});

assert(Math.abs(screen[0].full.gain + 8.350453146305549) < 1e-7);
assert(Math.abs(screen[2].full.gain + 1.5693979958179975) < 1e-7);
assert(screen.every((x) => x.firstToSecondHoldout < 0 && x.secondToFirstHoldout < 0));

// Demonstrate positive key detection with genuinely held-out native words.
// Only source-derived index positions and the authentic prime-key formula are
// shared with the original experiment. The actual plaintext is not supplied.
const plantShifts = [7, 13];
const positiveKey = keyedStreams[2][1];
const planted = nativeHoldout.slice(0, probes.length).map((e, i) =>
  (e.next + plantShifts[e.type] + positiveKey(probes[i])) % 29
);
const plantedTests = keyedStreams.map(([name, key]) => {
  const source = planted.map((d, i) => (d - key(probes[i]) + 29) % 29);
  return { name, ...bestFit(source) };
});
const positive = plantedTests.find((x) => x.name === "prime-totient-page");
assert(positive.gain > 5);
assert.equal(positive.fA, 7);
assert.equal(positive.fI, 13);

// Frozen iid-uniform control with exactly the same all-secret search.
let rng = 0x3301;
function nextRandom() {
  rng ^= rng << 13;
  rng ^= rng >>> 17;
  rng ^= rng << 5;
  return rng >>> 0;
}
const nullMax = [];
for (let repeat = 0; repeat < 1000; repeat++) {
  const symbols = Array.from({ length: probes.length }, () => nextRandom() % 29);
  nullMax.push(bestFit(symbols).gain);
}
nullMax.sort((a, b) => a - b);
console.log(JSON.stringify({
  source: { runes: ciphertext.length, words: words.length,
    singletonWords: allSingletons.length, samePageHyphenProbes: probes.length },
  native: { train: training.length, heldout: nativeHoldout.length, weightA },
  screen,
  positive: { trueKey: "prime-totient-page", keyShifts: plantShifts,
    trueScore: positive.gain, otherModels: plantedTests.map((x) => ({ name: x.name, gain: x.gain })) },
  uniformNull: { draws: 1000, p50: nullMax[499], p95: nullMax[949], p99: nullMax[989] }
}, null, 2));
