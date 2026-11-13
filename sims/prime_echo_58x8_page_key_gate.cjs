#!/usr/bin/env node
"use strict";

// One fixed source-shaped test of the 464-prime list as a 58 x 8,
// physical-page-local GP29 additive key. This is a bounded negative,
// not an assertion that Cicada selected this reshape.

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const primeEcho = read("resources/historical/cicada2013-os-original-prime-echo.sh");
const shakespeare = read("resources/control/shakespeare_first300k.txt");

const primes = [...primeEcho.matchAll(/echo(?: -n)?\s+"(\d+)/g)].map((m) => Number(m[1]));
assert.equal(primes.length, 464);
assert.equal(primes[0], 2);
assert.equal(primes[173], 1033);
assert.equal(primes[463], 3301);
assert.equal(corpus.pages.length, 58);
assert.equal(primes.length / corpus.pages.length, 8);

const physicalPage50 = corpus.pages.find((p) => p.page === 50);
assert(physicalPage50);
assert.equal(physicalPage50.indices.length, 0, "p50 is a numeric table, not rune text");

const unknownPages = corpus.pages
  .filter((p) => p.page >= 0 && p.page <= 55 && p.indices.length > 0)
  .sort((a, b) => a.page - b.page);
assert.equal(unknownPages.length, 55);
const runeCount = unknownPages.reduce((n, p) => n + p.indices.length, 0);
assert.equal(runeCount, 12956);

const mod = (n, m) => ((n % m) + m) % m;
const translit = (xs) => xs.map((x) => corpus.translit[x]).join("");
const runeIndex = new Map(corpus.translit.map((r, i) => [r, i]));

function encodeEnglish(text) {
  const out = [];
  for (let word of text.match(/[A-Za-z]+/g) || []) {
    word = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < word.length;) {
      const digraph = runeIndex.get(word.slice(i, i + 2));
      if (digraph !== undefined) {
        out.push(digraph);
        i += 2;
      } else {
        const single = runeIndex.get(word[i]);
        if (single !== undefined) out.push(single);
        i += 1;
      }
    }
  }
  return out;
}

const training = encodeEnglish(shakespeare.slice(0, 240000));
const heldout = encodeEnglish(shakespeare.slice(240000));
assert.equal(training.length, 174998);
assert.equal(heldout.length, 43802);
const frequency = Array(29).fill(1);
for (const x of training) frequency[x] += 1;
const denominator = frequency.reduce((a, b) => a + b, 0);
const logp = frequency.map((x) => Math.log(x / denominator));

function score(xs) {
  let total = 0;
  for (const x of xs) total += logp[x];
  return total / xs.length;
}

function ioc(xs) {
  const counts = Array(29).fill(0);
  for (const x of xs) counts[x] += 1;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}

const raw = unknownPages.flatMap((p) => p.indices);
const rawScore = score(raw);
const rawIoc = ioc(raw);
const primeResidues = primes.map((p) => mod(p, 29));

// Each physical page j owns primes 8j..8j+7. The row resets at that
// physical page's first rune; empty p50 still reserves its row.
function decode(key, sign, shift) {
  const out = [];
  for (const page of unknownPages) {
    const row = key.slice(page.page * 8, page.page * 8 + 8);
    for (let i = 0; i < page.indices.length; i += 1) {
      const k = mod(row[i % 8] + shift, 29);
      out.push(mod(page.indices[i] + sign * k, 29));
    }
  }
  return out;
}

function scoreKey(key, sign, shift) {
  let total = 0;
  let count = 0;
  for (const page of unknownPages) {
    const row = key.slice(page.page * 8, page.page * 8 + 8);
    for (let i = 0; i < page.indices.length; i += 1) {
      const k = mod(row[i % 8] + shift, 29);
      total += logp[mod(page.indices[i] + sign * k, 29)];
      count += 1;
    }
  }
  return total / count;
}

const sourceCases = [];
for (const [reducer, shift] of [["prime", 0], ["totient", -1]]) {
  for (const sign of [-1, 1]) {
    const decoded = decode(primeResidues, sign, shift);
    sourceCases.push({
      reducer,
      sign,
      score: score(decoded),
      ioc: ioc(decoded),
      prefix96: translit(decoded.slice(0, 96))
    });
  }
}
const sourceBest = Math.max(...sourceCases.map((x) => x.score));
const bestCase = sourceCases.reduce((a, b) => (b.score > a.score ? b : a));
const heldoutScore = score(heldout);

// The four nominal variants are not four independent keys:
// phi(p) = p - 1, so the totient maps are global one-symbol rotations
// of the corresponding prime maps.
const primeMinus = decode(primeResidues, -1, 0);
const totientMinus = decode(primeResidues, -1, -1);
const primePlus = decode(primeResidues, 1, 0);
const totientPlus = decode(primeResidues, 1, -1);
assert.deepEqual(totientMinus, primeMinus.map((x) => mod(x + 1, 29)));
assert.deepEqual(totientPlus, primePlus.map((x) => mod(x - 1, 29)));

// Positive implementation control: encrypt and recover 12,956 independent
// held-out Shakespeare GP symbols under the same physical page lengths.
function transformStream(input, key, sign, shift, encrypt) {
  const out = [];
  let cursor = 0;
  for (const page of unknownPages) {
    const row = key.slice(page.page * 8, page.page * 8 + 8);
    for (let i = 0; i < page.indices.length; i += 1) {
      const k = mod(row[i % 8] + shift, 29);
      out.push(mod(input[cursor] + (encrypt ? -sign : sign) * k, 29));
      cursor += 1;
    }
  }
  assert.equal(cursor, input.length);
  return out;
}
const plant = heldout.slice(0, runeCount);
assert.equal(plant.length, runeCount);
const plantedCipher = transformStream(plant, primeResidues, -1, 0, true);
const plantedRecovered = transformStream(plantedCipher, primeResidues, -1, 0, false);
assert.deepEqual(plantedRecovered, plant);

// Order-null: shuffle all 464 source residues, reshape into the same 58 x 8
// physical-page blocks, and score the maximum over the same four variants.
let rng = 0x3301;
function random01() {
  rng ^= rng << 13;
  rng ^= rng >>> 17;
  rng ^= rng << 5;
  return (rng >>> 0) / 4294967296;
}
function shuffle(values) {
  const out = values.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random01() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const shuffleCount = 1000;
const maxima = [];
for (let trial = 0; trial < shuffleCount; trial += 1) {
  const key = shuffle(primeResidues);
  let best = -Infinity;
  for (const shift of [0, -1]) {
    for (const sign of [-1, 1]) best = Math.max(best, scoreKey(key, sign, shift));
  }
  maxima.push(best);
}
const mean = maxima.reduce((a, b) => a + b, 0) / maxima.length;
const variance = maxima.reduce((a, b) => a + (b - mean) ** 2, 0) / (maxima.length - 1);
const sorted = maxima.slice().sort((a, b) => a - b);
const atLeast = maxima.filter((x) => x >= sourceBest).length;
const rank = 1 + maxima.filter((x) => x > sourceBest).length;

const result = {
  source: {
    primeCount: primes.length,
    firstPrime: primes[0],
    p174: primes[173],
    p464: primes[463],
    physicalPages: corpus.pages.length,
    primesPerPage: 8,
    unknownRunePages: unknownPages.length,
    unknownRunes: runeCount,
    p50ReservedEmptyRow: true,
    firstPageKey: primeResidues.slice(0, 8),
    lastUnknownPageKey: primeResidues.slice(55 * 8, 56 * 8)
  },
  reference: {
    trainingRunes: training.length,
    heldoutRunes: heldout.length,
    heldoutUnigramScore
  },
  raw: { unigramScore: rawScore, ioc: rawIoc },
  sourceCases,
  bestSourceCase: bestCase,
  orderNull: {
    shuffleCount,
    seed: "0x3301",
    mean,
    sampleSd: Math.sqrt(variance),
    p95: sorted[Math.floor(0.95 * shuffleCount)],
    p99: sorted[Math.floor(0.99 * shuffleCount)],
    maximum: sorted[sorted.length - 1],
    shufflesAtLeastAsGood: atLeast,
    empiricalP: (atLeast + 1) / (shuffleCount + 1),
    sourceRank: rank
  },
  positiveControl: {
    inputRunes: plant.length,
    recoveredRunes: plantedRecovered.length,
    exact: true
  },
  conclusion: "No source-selected plaintext or key. The direct 58x8 page-local additive prime/totient reading is not distinctive."
};
console.log(JSON.stringify(result, null, 2));
