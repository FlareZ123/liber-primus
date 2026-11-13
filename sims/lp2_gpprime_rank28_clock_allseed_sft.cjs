"use strict";
/**
 * Source-prime running clock in the 28-rank predecessor-exclusion register.
 *
 * Original-input, all-initial-state equality invariant:
 *   e_i = log_15((C_i - C_(i-1)) mod 29)
 *   q_i = seed + sum_{t < i} prime[C_t] mod 28
 *   P_i = e_i - sign * q_i mod 28
 * An exactly repeated ciphertext rune is reserved as the 29th EA code.
 *
 * The initial ciphertext rune on each physical page is a transported leader.
 * All remaining nonrepeat ranks are scored by their within-page collision
 * invariant. Any page seed or bijective rank relabeling preserves that score.
 * Input and output are unchanged reference files; this script writes no files.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const CORPUS = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const SHAKESPEARE = fs.readFileSync(
  path.join(ROOT, "resources/control/shakespeare_first300k.txt"), "utf8");
const GP_PRIMES = CORPUS.prime;
const PAGES = CORPUS.pages.filter(page =>
  page.page <= 55 && page.indices.length > 0);
assert.equal(PAGES.length, 55);
assert.equal(PAGES.reduce((sum, page) => sum + page.indices.length, 0), 12956);
assert.equal(GP_PRIMES.length, 29);

/** @param {number} n @param {number} m @returns {number} */
function mod(n, m) {
  return ((n % m) + m) % m;
}

const powers = [];
const logs = new Int8Array(29).fill(-1);
let power = 1;
for (let i = 0; i < 28; i++) {
  assert.equal(logs[power], -1);
  powers.push(power);
  logs[power] = i;
  power = (15 * power) % 29;
}
assert.equal(power, 1);
assert.equal(new Set(powers).size, 28);

/**
 * @param {number[]} cipher
 * @param {-1|1} sign
 * @param {number} seed
 * @returns {number[]}
 */
function decodePage(cipher, sign, seed) {
  const ranks = [cipher[0]];
  let prior = cipher[0];
  let q = mod(seed + GP_PRIMES[prior], 28);
  for (let i = 1; i < cipher.length; i++) {
    const current = cipher[i];
    const difference = mod(current - prior, 29);
    ranks.push(difference === 0 ? 28 : mod(logs[difference] - sign * q, 28));
    q = mod(q + GP_PRIMES[current], 28);
    prior = current;
  }
  return ranks;
}

/**
 * Inverse of decodePage for all 28 native symbols plus reserved EA=28.
 * The leader remains an external page-IV, never mistaken for plaintext.
 * @param {number[]} ranks
 * @param {number} leader
 * @param {-1|1} sign
 * @param {number} seed
 * @returns {number[]}
 */
function encryptPage(ranks, leader, sign, seed) {
  const cipher = [leader];
  let q = mod(seed + GP_PRIMES[leader], 28);
  for (let i = 1; i < ranks.length; i++) {
    const previous = cipher[i - 1];
    const current = ranks[i] === 28
      ? previous : mod(previous + powers[mod(ranks[i] + sign * q, 28)], 29);
    cipher.push(current);
    q = mod(q + GP_PRIMES[current], 28);
  }
  return cipher;
}

/**
 * @param {number[]} ranks
 * @returns {{pairs:number,denominator:number,runeCount:number}}
 */
function pageCollisions(ranks) {
  const counts = new Uint32Array(28);
  let length = 0;
  for (let i = 1; i < ranks.length; i++) {
    if (ranks[i] === 28) continue;
    assert.ok(ranks[i] >= 0 && ranks[i] < 28);
    counts[ranks[i]]++;
    length++;
  }
  return {
    pairs: counts.reduce((sum, n) => sum + n * (n - 1), 0),
    denominator: length * (length - 1),
    runeCount: length,
  };
}

/**
 * @param {Array<{pairs:number,denominator:number,runeCount:number}>} pages
 * @returns {{pairs:number,denominator:number,runeCount:number,ioc:number}}
 */
function combine(pages) {
  const pairs = pages.reduce((sum, page) => sum + page.pairs, 0);
  const denominator = pages.reduce((sum, page) => sum + page.denominator, 0);
  const runeCount = pages.reduce((sum, page) => sum + page.runeCount, 0);
  return {pairs, denominator, runeCount, ioc: pairs / denominator};
}

/**
 * Exact source GP29 normalizer used in the word-order benchmark: QU->CW,
 * K/Q->C, V->U, Z->S, with longest-match historical rune digraphs.
 * @param {string} text
 * @returns {number[]}
 */
function encodeGP(text) {
  const positions = new Map(CORPUS.translit.map((symbol, i) => [symbol, i]));
  const normalized = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C").replace(/V/g, "U").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < normalized.length;) {
    const two = normalized.slice(i, i + 2);
    if (positions.has(two)) {
      result.push(positions.get(two));
      i += 2;
    } else {
      if (positions.has(normalized[i])) result.push(positions.get(normalized[i]));
      i++;
    }
  }
  return result;
}

/** GP EA is a reserved repeat marker in this particular model, so fold
 *  English-control EA into E for the remaining 28-way content alphabet.
 *  @param {number} rune @returns {number}
 */
function asRank28(rune) {
  return rune === 28 ? 18 : rune;
}

/** Test the complete original source under both clock signs. */
const observed = {};
for (const sign of [1, -1]) {
  const atZero = PAGES.map(page =>
    pageCollisions(decodePage(page.indices, sign, 0)));
  for (let pageIndex = 0; pageIndex < PAGES.length; pageIndex++) {
    const source = PAGES[pageIndex].indices;
    // Every independently secret page seed is checked, not optimized.
    for (let seed = 1; seed < 28; seed++) {
      const shifted = pageCollisions(decodePage(source, sign, seed));
      assert.equal(shifted.pairs, atZero[pageIndex].pairs);
      assert.equal(shifted.denominator, atZero[pageIndex].denominator);
    }
    const exactlyRecovered = decodePage(source, sign, 0);
    assert.deepEqual(encryptPage(exactlyRecovered, source[0], sign, 0), source);
  }
  observed[sign] = combine(atZero);
}
assert.deepEqual(observed["1"], {
  pairs: 111854, denominator: 3130300, runeCount: 12815,
  ioc: 111854 / 3130300,
});
assert.deepEqual(observed["-1"], {
  pairs: 111130, denominator: 3130300, runeCount: 12815,
  ioc: 111130 / 3130300,
});
const native = encodeGP(SHAKESPEARE);
assert.equal(native.length, 218800);
const layout = PAGES.map(page => page.indices.map((current, i) =>
  i === 0 ? false : current !== page.indices[i - 1]));
const eligible = layout.flat().filter(Boolean).length;
assert.equal(eligible, 12815);
assert.equal(PAGES.reduce((sum, page) => sum + page.indices.length - 1, 0)
  - eligible, 86);

/** A fitted native-page-shape benchmark with no unknown source-key choice. */
function sourceWindow(start) {
  let index = start;
  const perPage = layout.map(mask => {
    const ranks = [0];
    for (let i = 1; i < mask.length; i++) {
      ranks.push(mask[i] ? asRank28(native[index++]) : 28);
    }
    return pageCollisions(ranks);
  });
  return combine(perPage);
}
const controls = [];
for (let start = 0; start + eligible <= native.length; start += 199) {
  controls.push({start, score: sourceWindow(start).ioc});
}
assert.equal(controls.length, 1036);
controls.sort((a, b) => a.score - b.score);
assert.equal(controls[0].start, 172931);
assert.equal(controls[0].score, 0.06007283646934799);

/** Full source-shaped positive encryption with unknown per-page clock seeds. */
let at = 45000;
const encrypted = PAGES.map((page, pageIndex) => {
  const mask = layout[pageIndex];
  const desired = [page.indices[0]];
  for (let i = 1; i < mask.length; i++) {
    desired.push(mask[i] ? asRank28(native[at++]) : 28);
  }
  const secret = mod(17 * page.page + 5, 28);
  const cipher = encryptPage(desired, page.indices[0], 1, secret);
  assert.deepEqual(decodePage(cipher, 1, secret), desired);
  assert.deepEqual(cipher.map((x, i) =>
    i === 0 ? false : x !== cipher[i - 1]), mask);
  // Invariant even when positive-control seed is withheld from the scorer.
  assert.equal(pageCollisions(decodePage(cipher, 1, 0)).pairs,
    pageCollisions(desired).pairs);
  return cipher;
});
const positive = combine(encrypted.map(page =>
  pageCollisions(decodePage(page, 1, 0))));
assert.deepEqual(positive, {
  pairs: 197900, denominator: 3130300, runeCount: 12815,
  ioc: 197900 / 3130300,
});

const result = {
  status: "direct native-GP plaintext not recovered",
  original: {
    rune_count: 12956, page_count: PAGES.length,
    doublet_markers: 86, measured_ranks: eligible,
    all_initial_seeds_tested_per_page: 28,
    plus_clock: observed["1"], minus_clock: observed["-1"],
  },
  native_shakespeare: {
    original_gp_rune_count: native.length,
    fixed_shape_positive: positive,
    window_stride: 199,
    window_count: controls.length,
    minimum: controls[0],
    median: controls[Math.floor(controls.length / 2)],
    maximum: controls[controls.length - 1],
  },
  exact_roundtrip: "PASS on every original page and all synthetic 12,956-rune pages",
};
console.log(JSON.stringify(result, null, 2));
