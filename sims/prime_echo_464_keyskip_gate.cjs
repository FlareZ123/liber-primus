"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { logLikelihood } = require("./keyskip_transducer.cjs");

const ROOT = path.join(__dirname, "..");
const M = 29;
const REJECT_REPEAT = 0.81;
const MAX_TOTAL_SKIPS = 512;
const MAX_SKIPPED_PER_OUTPUT = 4;

function firstPrimes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) out.push(n);
  }
  return out;
}

function mod(x) { return (x % M + M) % M; }

function rng(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

function shuffle(values, seed) {
  const out = values.slice(), random = rng(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function stats(actual, controls) {
  const mean = controls.reduce((a, b) => a + b, 0) / controls.length;
  const sd = Math.sqrt(
    controls.reduce((a, b) => a + (b - mean) ** 2, 0) /
    (controls.length - 1)
  );
  return {
    actual,
    randomMean: mean,
    randomSD: sd,
    randomMax: Math.max(...controls),
    rank1toNPlus1: 1 + controls.filter(x => x > actual).length,
    empiricalP: (1 + controls.filter(x => x >= actual).length) /
      (controls.length + 1),
    z: (actual - mean) / sd
  };
}

const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const lp1 = fs.readFileSync(
  path.join(ROOT, "resources/transcriptions/lp1_wulfic_canonical.txt"), "utf8"
);
const pages = corpus.pages
  .filter(p => p.page >= 0 && p.page <= 55 && p.indices.length)
  .sort((a, b) => a.page - b.page);
const cipher = pages.flatMap(p => p.indices);
const runeId = new Map(corpus.runes.map((r, i) => [r, i]));

// Same reference distribution as sims/skip_phase_hmm.cjs:
// LP1 literal pages 3, 8–11, 14; solved LP2 controls; add-one smoothing.
const frequency = Array(M).fill(1);
const lp1Pages = lp1.split("%");
for (const pageIndex of [3, 8, 9, 10, 11, 14]) {
  for (const rune of lp1Pages[pageIndex] || "") {
    const id = runeId.get(rune);
    if (id !== undefined) frequency[id]++;
  }
}
for (const page of corpus.pages.filter(p => p.status === "solved")) {
  for (const id of page.indices) frequency[id]++;
}
const total = frequency.reduce((a, b) => a + b, 0);
const q = frequency.map(x => x / total);
const inverseSigma = Array.from({ length: M }, (_, i) => i);
const model = key => ({
  key, q, inverseSigma, offset: 0,
  rejectRepeat: REJECT_REPEAT,
  maxTotalSkips: MAX_TOTAL_SKIPS,
  maxSkippedPerOutput: MAX_SKIPPED_PER_OUTPUT
});
const score = key => logLikelihood(cipher, model(key));

const primes = firstPrimes(464);
const bases = [
  ["prime", primes.map(p => p % M)],
  ["totient", primes.map(p => (p - 1) % M)]
];
const screen = [];
for (let bi = 0; bi < bases.length; bi++) {
  const [name, base] = bases[bi];
  for (const sign of [-1, 1]) {
    const key = base.map(x => mod(sign * x));
    const actual = score(key);
    const controls = Array.from({ length: 8 }, (_, j) =>
      score(shuffle(key,
        0x47a100 + bi * 10000 + (sign > 0 ? 5000 : 0) + j))
    );
    screen.push({ name, sign, ...stats(actual, controls) });
  }
}

// Follow up the best 8-control screen entry (phi(prime), positive sign)
// with a larger, separately seeded 32-shuffle control.
const bestKey = bases[1][1].map(x => mod(x));
const bestActual = score(bestKey);
const bestControls = Array.from({ length: 32 }, (_, j) =>
  score(shuffle(bestKey, 0x47a100 + j))
);

const doublets = cipher.slice(1).filter((x, i) => x === cipher[i]).length;
console.log(JSON.stringify({
  test: "source-derived prime_echo key under soft ciphertext-repeat rejection",
  source: {
    primeCount: primes.length,
    firstPrime: primes[0],
    lastPrime: primes[primes.length - 1],
    period: primes.length,
    periodFactorization: "16 * 29"
  },
  corpus: {
    runeBearingUnknownPages: pages.length,
    unknownRunes: cipher.length,
    adjacentDoublets: doublets
  },
  model: {
    alphabet: M,
    keyClock: "one global continuous stream, phase 0",
    rejectRepeat: REJECT_REPEAT,
    maxTotalSkips: MAX_TOTAL_SKIPS,
    maxSkippedPerOutput: MAX_SKIPPED_PER_OUTPUT,
    plaintextPrior: "LP1 literal pages 3,8,9,10,11,14 + solved LP2; add-one smoothing",
    outerPermutation: "identity"
  },
  screen,
  bestFollowup: {
    mapping: "phi(prime) mod 29, positive sign",
    ...stats(bestActual, bestControls),
    randomControls: bestControls
  }
}, null, 2));
