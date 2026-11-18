"use strict";

/**
 * Reproduce the p55->p27 / red-13-dot combinadic candidate continuation.
 *
 * This SFT deliberately uses the zero-based lexicographic combination rank
 * already frozen by lp2_red225_dot13_constant_weight_rank_sft.cjs. It does
 * not search rank conventions, event classes, factors, byte orders, or
 * base32 alphabets.
 *
 * Run:
 *   node sims/lp2_primeecho_red13_onion_candidate_sft.cjs
 *
 * Node.js 22, CommonJS, standard library only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  k = Math.min(k, n - k);
  let value = 1n;
  for (let i = 1; i <= k; i++) {
    value = value * BigInt(n - k + i) / BigInt(i);
  }
  return value;
}

/**
 * Zero-based lexicographic rank of an increasing tuple.
 * @param {number} n
 * @param {number} k
 * @param {number[]} positions
 * @returns {bigint}
 */
function lexRank(n, k, positions) {
  assert.equal(positions.length, k);
  let rank = 0n;
  let previous = -1;
  for (let i = 0; i < k; i++) {
    for (let candidate = previous + 1; candidate < positions[i]; candidate++) {
      rank += choose(n - candidate - 1, k - i - 1);
    }
    previous = positions[i];
  }
  return rank;
}

/** @param {number} n @returns {boolean} */
function isSmallPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) return false;
  }
  return true;
}

/** @param {number} ordinal @returns {number} */
function nthPrime(ordinal) {
  let count = 0;
  for (let n = 2; ; n++) {
    if (isSmallPrime(n) && ++count === ordinal) return n;
  }
}

/**
 * Strong probable-prime check for the fixed factors reported here.
 * This is a reproducibility guard, not a general primality prover.
 * @param {bigint} n
 * @returns {boolean}
 */
function strongProbablePrime(n) {
  if (n < 2n) return false;
  for (const p of [2n,3n,5n,7n,11n,13n,17n,19n,23n,29n,31n,37n,41n,43n]) {
    if (n === p) return true;
    if (n % p === 0n) return false;
  }
  let d = n - 1n;
  let s = 0;
  while ((d & 1n) === 0n) {
    d >>= 1n;
    s++;
  }
  const modPow = (a, e, m) => {
    let out = 1n;
    a %= m;
    while (e) {
      if (e & 1n) out = out * a % m;
      a = a * a % m;
      e >>= 1n;
    }
    return out;
  };
  for (const base of [2n,3n,5n,7n,11n,13n,17n,19n,23n,29n,31n,37n,41n,43n]) {
    if (base >= n) continue;
    let x = modPow(base, d, n);
    if (x === 1n || x === n - 1n) continue;
    let witness = true;
    for (let r = 1; r < s; r++) {
      x = x * x % n;
      if (x === n - 1n) {
        witness = false;
        break;
      }
    }
    if (witness) return false;
  }
  return true;
}

/** @param {bigint} n @returns {string} */
function torV2Base32(n) {
  assert.ok(n >= 0n && n < (1n << 80n));
  const alphabet = "abcdefghijklmnopqrstuvwxyz234567";
  let out = "";
  for (let shift = 75n; shift >= 0n; shift -= 5n) {
    out += alphabet[Number((n >> shift) & 31n)];
  }
  return out;
}

// Canonical p0-p55 word stream, preserving physical wraps/page boundaries.
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const source = transcription.split("%").slice(0, 55).join("%");
const words = [];
let current = [];
const flushWord = () => {
  if (!current.length) return;
  words.push({
    translit: current.map(index => corpus.translit[index]).join(""),
    primeSum: current.reduce((sum, index) => sum + corpus.prime[index], 0)
  });
  current = [];
};
for (const ch of source) {
  if (runeIndex.has(ch)) {
    current.push(runeIndex.get(ch));
  } else if (ch === "%" || ch === "/" || /\s/u.test(ch)) {
    // Physical wrap/page separators do not end a word.
  } else {
    flushWord();
  }
}
flushWord();
assert.equal(words.length, 2896);

const pairHits = [];
for (let i = 0; i + 1 < words.length; i++) {
  if (words[i].translit === "DJU" && words[i + 1].translit === "BEI") {
    pairHits.push(i);
  }
}
assert.deepEqual(pairHits, [1462, 2894]);
const dju = words[pairHits[0]];
const bei = words[pairHits[0] + 1];
assert.equal(dju.primeSum, 129);
assert.equal(bei.primeSum, 159);
assert.equal(bei.primeSum - dju.primeSum, 30);

// Reproduce the already-frozen 225-red-rune + 31-thirteen-dot event order.
const events = [];
let serial = 0;
for (const page of [...ink.pages].sort((a, b) => a.page - b.page)) {
  for (const span of page.red_spans || []) {
    const runes = Array.from(span.runes);
    for (let i = 0; i < runes.length; i++) {
      events.push({
        page: page.page,
        offset: span.start + i + 0.5,
        kind: "red",
        color: "red",
        bit: 0,
        serial: serial++
      });
    }
  }
  for (const [offset, dots, color] of page.large_punctuation || []) {
    if (dots === 13) {
      events.push({
        page: page.page,
        offset,
        kind: "dot13",
        color,
        bit: 1,
        serial: serial++
      });
    }
  }
}
events.sort((a, b) =>
  a.page - b.page ||
  a.offset - b.offset ||
  (a.kind === "dot13" ? 0 : 1) - (b.kind === "dot13" ? 0 : 1) ||
  a.serial - b.serial);

assert.equal(events.length, 256);
assert.equal(events.filter(event => event.kind === "red").length, 225);
assert.equal(events.filter(event => event.kind === "dot13" && event.color === "red").length, 30);
assert.equal(events.filter(event => event.kind === "dot13" && event.color === "black").length, 1);

const fullPositions = events
  .map((event, index) => event.bit ? index : null)
  .filter(index => index !== null);
assert.equal(fullPositions.length, 31);

// Exact prior Agent13 rank: this locks the convention independently of this candidate.
const priorFullRank = lexRank(256, 31, fullPositions);
assert.equal(
  priorFullRank,
  6823208894503251143167281798760439560912n
);

// The pair's gap 30 selects the red-only thirteen-dot class: remove the lone
// black mark, leaving 225 red runes + 30 red marks = 255 red events.
const redOnly = events.filter(event => !(event.kind === "dot13" && event.color === "black"));
assert.equal(redOnly.length, 255);
const redPositions = redOnly
  .map((event, index) => event.kind === "dot13" ? index : null)
  .filter(index => index !== null);
assert.equal(redPositions.length, 30);

const total = choose(255, 30);
const log2Capacity = Math.log2(Number(total));
assert.equal(Math.floor(log2Capacity), 129);
assert.equal(dju.primeSum, Math.floor(log2Capacity));

const rank = lexRank(255, 30, redPositions);
assert.equal(rank, 816613232064430740393939040116034006349n);

// p27 is independently selected by the duplicate-pair handoff. Parse its
// physical word layout so the small prime factors can be checked against the
// selected neighborhood without inventing a divisor after factorization.
const p27Ink = ink.pages.find(page => page.page === 27);
assert.equal(p27Ink.red_spans.length, 1);
assert.equal(p27Ink.red_spans[0].start, 0);
assert.equal(p27Ink.red_spans[0].length, 19);
const p27Red13 = p27Ink.large_punctuation
  .filter(([offset, dots, color]) => dots === 13 && color === "red")
  .map(([offset]) => offset);
assert.deepEqual(p27Red13, [19]);

const p27Words = [];
let p27Offset = 0;
let p27Line = 1;
let p27Current = [];
let p27Start = null;
const flushP27 = () => {
  if (!p27Current.length) return;
  p27Words.push({
    line: p27Line,
    start: p27Start,
    end: p27Offset,
    translit: p27Current.map(index => corpus.translit[index]).join(""),
    primeSum: p27Current.reduce((sum, index) => sum + corpus.prime[index], 0)
  });
  p27Current = [];
  p27Start = null;
};
for (const ch of transcription.split("%")[27]) {
  if (runeIndex.has(ch)) {
    if (p27Start === null) p27Start = p27Offset;
    p27Current.push(runeIndex.get(ch));
    p27Offset++;
  } else if (ch === "/") {
    p27Line++;
  } else if (/\s/u.test(ch)) {
    // Printed wraps do not terminate a hyphen-delimited word.
  } else {
    flushP27();
  }
}
flushP27();

const p27Dju = p27Words.find(word => word.translit === "DJU");
const p27Bei = p27Words.find(word => word.translit === "BEI");
const p27Aef = p27Words.find(word =>
  word.line === 2 && word.start === 34 && word.translit === "AEF");
assert.deepEqual(
  [p27Dju.line, p27Dju.start, p27Dju.end, p27Dju.primeSum],
  [2, 28, 31, 129]
);
assert.deepEqual(
  [p27Bei.line, p27Bei.start, p27Bei.end, p27Bei.primeSum],
  [2, 31, 34, 159]
);
assert.deepEqual(
  [p27Aef.line, p27Aef.start, p27Aef.end, p27Aef.primeSum],
  [2, 34, 36, 103]
);

// Factor R first. Its three small prime factors independently reappear in the
// selected p27 layout:
//   19  = red heading length / red-13 line boundary,
//   31  = local start of BEI, the second anchor word,
//   103 = GP-prime sum of AEF, immediately following the anchor pair.
// Secondary echoes: 31 is also the total 13-dot count, and 103 is prime(27).
const smallLayoutFactors = [19n, 31n, 103n];
const routeDivisor = smallLayoutFactors.reduce((product, factor) => product * factor, 1n);
assert.equal(routeDivisor, 60667n);
assert.equal(rank % routeDivisor, 0n);
assert.equal(events.filter(event => event.kind === "dot13").length, 31);
assert.equal(nthPrime(27), 103);

const residual = rank / routeDivisor;
assert.equal(residual, 13460583712140549893581997463465047n);

const smallFactor = 25795396177n;
const onionFactor = 521821166063052627702311n;
assert.equal(
  rank,
  19n * 31n * 103n * smallFactor * onionFactor
);
assert.ok(strongProbablePrime(smallFactor));
assert.ok(strongProbablePrime(onionFactor));
assert.equal(onionFactor.toString(2).length, 79);

const onionLabel = torV2Base32(onionFactor);
assert.equal(onionLabel, "nz77w2upkfkyj4rh");
assert.equal(onionLabel.length, 16);

console.log(JSON.stringify({
  handoff: {
    repeatedPair: ["DJU", "BEI"],
    wordIndices: pairHits,
    gpPrimeSums: [dju.primeSum, bei.primeSum],
    directedGap: bei.primeSum - dju.primeSum
  },
  ink: {
    redRunes: 225,
    red13: 30,
    black13: 1,
    redOnlyEvents: redOnly.length,
    redPositions
  },
  combinadic: {
    convention: "zero-based lexicographic rank, frozen by prior 31-of-256 work",
    total: total.toString(),
    log2Capacity,
    floorCapacityBits: Math.floor(log2Capacity),
    rank: rank.toString()
  },
  p27LocalConfirmation: {
    redHeadingLength: p27Ink.red_spans[0].length,
    red13Boundary: p27Red13[0],
    dju: {start: p27Dju.start, end: p27Dju.end, primeSum: p27Dju.primeSum},
    bei: {start: p27Bei.start, end: p27Bei.end, primeSum: p27Bei.primeSum},
    followingAef: {start: p27Aef.start, end: p27Aef.end, primeSum: p27Aef.primeSum},
    matchedSmallPrimeFactors: smallLayoutFactors.map(String),
    secondaryEchoes: {totalDot13: 31, prime27: nthPrime(27)}
  },
  factorization: {
    residual: residual.toString(),
    smallFactor: smallFactor.toString(),
    onionFactor: onionFactor.toString(),
    strongProbablePrimeChecks: true
  },
  candidate: {
    torV2Label: onionLabel,
    onion: onionLabel + ".onion"
  },
  status: "CANDIDATE ONLY: syntactically valid Tor-v2 destination; no historical receiver/archival occurrence authenticated"
}, null, 2));
