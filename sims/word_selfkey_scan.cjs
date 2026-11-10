"use strict";

/**
 * Test a self-derived per-word Caesar key on the 29-rune LP2 ciphertext.
 *
 * C[w,i] = P[w,i] + a*F(C[w]) + b*length(w) (mod 29)
 * F is (1) sum of ciphertext rune indices, (2) sum of GP rune primes,
 * (3) first ciphertext rune, or (4) last ciphertext rune.
 *
 * For first- and last-rune key hypotheses, exclude the key-bearing rune
 * from the scoring histogram to prevent a tautological spike at 0.
 *
 * This is a bounded hypothesis test: a large cipher-IoC spike would be
 * necessary, but not sufficient, for ordinary GP-English plaintext.
 * Run: node sims/word_selfkey_scan.cjs --trials 128
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const ROOT = path.join(__dirname, "..");
const MOD = 29;
const FEATURE_NAMES = ["index-sum", "prime-sum", "first", "last"];
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const pages = corpus.pages
  .filter(page => page.page <= 55 && page.indices.length)
  .map(page => page.indices);
const alphabet = new Map(corpus.runes.map((rune, index) => [rune, index]));

/**
 * Page and line separators may split a word. Retain every rune's exact
 * (page-array index, offset) as a stable reference.
 * @returns {Array<Array<[number, number]>>}
 */
function parseWords() {
  const raw = fs.readFileSync(path.join(ROOT, "resources/lp2-transcription.txt"), "utf8");
  const segments = raw.split("%").slice(0, 55);
  const words = [];
  let current = [];
  for (let page = 0; page < segments.length; page++) {
    let offset = 0;
    for (const ch of segments[page]) {
      if (alphabet.has(ch)) {
        assert.equal(pages[page][offset], alphabet.get(ch),
          `Rune mismatch at page ${page}, offset ${offset}`);
        current.push([page, offset]);
        offset++;
      } else if (ch !== "/" && !/\s/u.test(ch)) {
        if (current.length) words.push(current);
        current = [];
      }
    }
    assert.equal(offset, pages[page].length, `Page ${page}`);
  }
  if (current.length) words.push(current);
  assert.equal(words.length, 2896);
  assert.equal(pages.length, 55);
  assert.equal(pages.reduce((sum, page) => sum + page.length, 0), 12956);
  assert.equal(words.reduce((sum, word) => sum + word.length, 0), 12956);
  return words;
}
const words = parseWords();

/** @param {number} seed @returns {() => number} */
function rng(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}
/** @param {number} x @returns {number} */
function mod(x) { return (x % MOD + MOD) % MOD; }

/**
 * @param {number[][]} input
 * @returns {Array<{feature:string, a:number, b:number, ioc:number, n:number}>}
 */
function scan(input) {
  const buckets = FEATURE_NAMES.map(() => new Uint32Array(MOD * MOD * MOD));
  const sizes = [0, 0, 0, 0];
  for (const word of words) {
    const symbols = word.map(([page, offset]) => input[page][offset]);
    const length = symbols.length;
    const features = [
      symbols.reduce((sum, rune) => (sum + rune) % MOD, 0),
      symbols.reduce((sum, rune) => (sum + corpus.prime[rune]) % MOD, 0),
      symbols[0], symbols[length - 1]
    ];
    for (let feature = 0; feature < FEATURE_NAMES.length; feature++) {
      const base = (features[feature] * MOD + length) * MOD;
      for (let i = 0; i < length; i++) {
        if ((feature === 2 && i === 0) ||
            (feature === 3 && i === length - 1)) continue;
        buckets[feature][base + symbols[i]]++;
        sizes[feature]++;
      }
    }
  }
  const results = [];
  for (let feature = 0; feature < FEATURE_NAMES.length; feature++) {
    const source = buckets[feature];
    const groups = [];
    for (let f = 0; f < MOD; f++) {
      for (let length = 1; length <= 28; length++) {
        const base = (f * MOD + length) * MOD;
        let count = 0;
        for (let c = 0; c < MOD; c++) count += source[base + c];
        if (count) groups.push({f, length, base});
      }
    }
    let best = {feature: FEATURE_NAMES[feature], a: 0, b: 0, ioc: -1, n: sizes[feature]};
    for (let a = 0; a < MOD; a++) {
      for (let b = 0; b < MOD; b++) {
        const hist = new Uint32Array(MOD);
        for (const group of groups) {
          const shift = (a * group.f + b * group.length) % MOD;
          for (let c = 0; c < MOD; c++) hist[(c + MOD - shift) % MOD] += source[group.base + c];
        }
        const n = sizes[feature];
        let collision = 0;
        for (const value of hist) collision += value * (value - 1);
        const ioc = collision / (n * (n - 1));
        if (ioc > best.ioc) best = {
          feature: FEATURE_NAMES[feature], a, b, ioc, n
        };
      }
    }
    results.push(best);
  }
  return results;
}

/**
 * Rotate each physical rune page independently; hold page multiset,
 * near-neighbor structure, word layout, and page lengths fixed.
 * @param {number[][]} input
 * @param {() => number} random
 * @returns {number[][]}
 */
function rotate(input, random) {
  return input.map(page => {
    const offset = random() % page.length;
    return page.slice(offset).concat(page.slice(0, offset));
  });
}

/**
 * Construct an actual self-keyed word cipher with F = sum(cipher rune indices).
 * For a=7 no observed length 1..14 makes 1-a*length zero modulo 29,
 * so its implicit checksum equation is uniquely solvable.
 * @param {() => number} random
 * @returns {number[][]}
 */
function plantIndexSum(random) {
  const a = 7, b = 11;
  const input = pages.map(page => page.slice());
  const weighted = [15,6,4,5,13,2,3,1,6,6,7,1,3,2,2,7,9,2,12,2,5,2,3,1,9,1,2,1,1];
  const total = weighted.reduce((sum, v) => sum + v, 0);
  function sample() {
    let draw = random() % total;
    for (let c = 0; c < MOD; c++) {
      if (draw < weighted[c]) return c;
      draw -= weighted[c];
    }
    throw Error("unreachable");
  }
  for (const word of words) {
    const plain = word.map(() => sample());
    const len = word.length;
    const sum = plain.reduce((acc, value) => (acc + value) % MOD, 0);
    const denominator = mod(1 - a * len);
    assert.notEqual(denominator, 0);
    let inverse = 0;
    for (let x = 1; x < MOD; x++) if ((denominator * x) % MOD === 1) inverse = x;
    assert.notEqual(inverse, 0);
    const key = mod((a * sum + b * len) * inverse);
    for (let i = 0; i < word.length; i++) {
      const [page, offset] = word[i];
      input[page][offset] = mod(plain[i] + key);
    }
  }
  return input;
}

function main() {
  const args = process.argv.slice(2);
  const ix = args.indexOf("--trials");
  const trials = ix < 0 ? 128 : Number(args[ix + 1]);
  assert(Number.isInteger(trials) && trials >= 0 && trials <= 10000);
  const seed = 0x3301a15f;
  const random = rng(seed);
  const observed = scan(pages);
  const nullMax = [];
  for (let i = 0; i < trials; i++) {
    const scores = scan(rotate(pages, random));
    nullMax.push(Math.max(...scores.map(item => item.ioc)));
  }
  const familyMax = Math.max(...observed.map(item => item.ioc));
  const mean = trials ? nullMax.reduce((sum, value) => sum + value, 0) / trials : null;
  const sd = trials ? Math.sqrt(nullMax.reduce((sum, value) =>
    sum + (value - mean) ** 2, 0) / trials) : null;
  const positive = scan(plantIndexSum(rng(0xa11c3301)));
  const plantedWinner = positive.find(item => item.feature === "index-sum");
  assert.equal(plantedWinner.a, 7);
  assert.equal(plantedWinner.b, 11);
  assert(plantedWinner.ioc > 0.045);
  console.log(JSON.stringify({
    model: "per-word self-derived Caesar key a*F(cipher_word)+b*word_length modulo 29",
    data: "resources/liber-primus/lp2-corpus.json; resources/lp2-transcription.txt",
    words: words.length, runePages: pages.length, runes: 12956, seed, trials,
    observed, observedFamilyMax: familyMax,
    rotatedNull: {
      mean, sd, min: trials ? Math.min(...nullMax) : null,
      max: trials ? Math.max(...nullMax) : null,
      upperTailP: (1 + nullMax.filter(value => value >= familyMax).length) / (trials + 1)
    },
    plantedIndexSum: plantedWinner
  }, null, 2));
}
if (require.main === module) main();
module.exports = {parseWords, scan, rotate, plantIndexSum};
