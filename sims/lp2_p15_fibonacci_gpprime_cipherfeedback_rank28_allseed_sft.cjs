"use strict";

/**
 * Source-selected bounded self-synchronizing Fibonacci rank28 cipher attack.
 *
 * Historical clue: p15 Fibonacci-indexed prime spiral, GP29 prime weights in
 * authenticated LP1 WISDOM, and original LP2 rare equal-adjacent runes.
 * Hypothesis: a second-order key state receives the previous printed
 * ciphertext rune's GP-prime weight at every step.
 *
 * Exhaust every two-symbol secret IV in Z28^2 (784), two signs, three
 * visible resets and two equal-rune clock policies. Include original full
 * 12,956-rune continuous results, a genuine GP-language native positive,
 * and exact forward replay. Windows / Node22 / CommonJS / read-only.
 *
 * No author's instruction selects this combination: one bounded experiment,
 * rather than a claim of historical implementation.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = gp.pages.filter((p) => p.page < 56 && p.indices.length);
assert.equal(pages.length, 55);
const source = pages.flatMap((p) => p.indices);
const N = source.length;
assert.equal(N, 12956);

/** First 29 mathematical primes, as in solved LP1 Gematria Primus. */
const primes = [];
for (let n = 2; primes.length < 29; n++) {
  let p = true;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) { p = false; break; }
  if (p) primes.push(n);
}
assert.deepEqual(primes.slice(0, 7), [2, 3, 5, 7, 11, 13, 17]);
assert.equal(primes[28], 109);
const mod28Prime = primes.map((p) => p % 28);
const firstOfPage = new Uint8Array(N);
const firstOfChapter = new Uint8Array(N);
const free = new Uint8Array(N);
const originalRank = new Int16Array(N).fill(-1);
let at = 0, duplicate = 0;
for (const page of pages) {
  firstOfPage[at] = 1;
  for (let j = 0; j < page.indices.length; j++, at++) {
    const c = page.indices[j];
    if (j === 0 || (j > 0 && c === page.indices[j - 1])) {
      free[at] = 1;
      if (j > 0) duplicate++;
    } else {
      originalRank[at] = (c - page.indices[j - 1] + 28) % 29;
      assert(originalRank[at] < 28);
    }
  }
}
assert.equal(at, N);
assert.equal(duplicate, 86);
const chapters = [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316];
assert.equal(chapters.reduce((a, b) => a + b), N);
let off = 0;
for (const length of chapters) { firstOfChapter[off] = 1; off += length; }
const starts = { book: 0, page: 1, chapter: 2 };
const masks = {
  book: new Uint8Array(N),
  page: firstOfPage,
  chapter: firstOfChapter,
};
const eligible = [];
for (let i = 0; i < N; i++) if (!free[i]) eligible.push(i);
assert.equal(eligible.length, 12815);

/** @param {number} x @returns {number} */
const reduce = (x) => (x % 28 + 28) % 28;
/**
 * All 12,956 positions, one current key value per ordinary event.
 * @param {ArrayLike<number>} ciphertext
 * @param {number} u
 * @param {number} v
 * @param {'book'|'page'|'chapter'} reset
 * @param {boolean} skipEquals
 * @param {1|-1} sign
 * @returns {number[]}
 */
function decrypt(ciphertext, u, v, reset, skipEquals, sign) {
  const output = new Array(N);
  let prev0 = u, prev1 = v;
  for (let i = 0; i < N; i++) {
    if (i === 0 || masks[reset][i]) { prev0 = u; prev1 = v; }
    if (free[i]) {
      output[i] = firstOfPage[i] ? ciphertext[i] : 28;
      if (skipEquals && !firstOfPage[i]) continue;
    }
    const prevCipher = i && !firstOfPage[i]
      ? ciphertext[i - 1] : 0;
    const k = (prev0 + prev1 + mod28Prime[prevCipher]) % 28;
    if (!free[i]) output[i] = reduce(originalRankFor(ciphertext, i) - sign * k);
    prev0 = prev1;
    prev1 = k;
  }
  return output;
}
/** @param {ArrayLike<number>} ciphertext @param {number} i @returns {number} */
function originalRankFor(ciphertext, i) {
  const rank = (ciphertext[i] - ciphertext[i - 1] + 28) % 29;
  assert(rank < 28);
  return rank;
}
/**
 * The exact forward map, preserving visible page-initial and equal-pair
 * positions specified by plaintext GP index 28 (EA).
 * @param {number[]} plaintext
 * @param {number} u
 * @param {number} v
 * @param {'book'|'page'|'chapter'} reset
 * @param {boolean} skipEquals
 * @param {1|-1} sign
 * @returns {number[]}
 */
function encrypt(plaintext, u, v, reset, skipEquals, sign) {
  const out = new Array(N);
  let prev0 = u, prev1 = v;
  for (let i = 0; i < N; i++) {
    if (i === 0 || masks[reset][i]) { prev0 = u; prev1 = v; }
    if (firstOfPage[i]) out[i] = plaintext[i];
    else if (plaintext[i] === 28) {
      out[i] = out[i - 1];
      if (skipEquals) continue;
    } else assert(plaintext[i] < 28);
    const prevCipher = i && !firstOfPage[i] ? out[i - 1] : 0;
    const k = (prev0 + prev1 + mod28Prime[prevCipher]) % 28;
    if (!firstOfPage[i] && plaintext[i] !== 28) {
      const rank = reduce(plaintext[i] + sign * k);
      out[i] = (out[i - 1] + 1 + rank) % 29;
    }
    prev0 = prev1;
    prev1 = k;
  }
  return out;
}
/** @param {ArrayLike<number>} v @param {number} from @param {number} until @returns {number} */
function ioc(v, from, until) {
  const counts = new Uint16Array(28);
  let eligibleCount = 0;
  for (let i = from; i < until; i++) if (!free[i]) {
    assert(v[i] >= 0 && v[i] < 28);
    counts[v[i]]++;
    eligibleCount++;
  }
  let n = 0;
  for (const x of counts) n += x * (x - 1);
  return n / (eligibleCount * (eligibleCount - 1));
}

/** @param {string} raw @returns {number[]} */
function native(raw) {
  const alpha = gp.translit.map((value, index) => ({ value, index }))
    .sort((a, b) => b.value.length - a.value.length);
  const values = [];
  const normalized = raw.toUpperCase().replace(/QU/gu, "CW")
    .replace(/V/gu, "U").replace(/[KQ]/gu, "C").replace(/Z/gu, "S");
  for (const word of normalized.match(/[A-Z]+/gu) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith("ING", i)) { values.push(21); i += 3; continue; }
      if (word.startsWith("IO", i)) { values.push(27); i += 2; continue; }
      const t = alpha.find((v) => word.startsWith(v.value, i));
      assert(t);
      values.push(t.index); i += t.value.length;
    }
  }
  return values;
}
assert.deepEqual(native("PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE"), gp.pages[57].indices);
const sourceNative = native(read("resources/control/shakespeare_first300k.txt"));
assert(sourceNative.length > N);
const plant = Array.from({ length: N }, (_, i) => free[i]
  ? (firstOfPage[i] ? sourceNative[i] : 28)
  : (sourceNative[i] === 28 ? 18 : sourceNative[i]));
for (const reset of /** @type {Array<'book'|'page'|'chapter'>} */ (["book", "page", "chapter"])) {
  for (const skip of [false, true]) {
    const cipher = encrypt(plant, 13, 21, reset, skip, -1);
    assert.deepEqual(decrypt(cipher, 13, 21, reset, skip, -1), plant);
    let duplicates = 0;
    for (let i = 1; i < N; i++) if (!firstOfPage[i] && cipher[i] === cipher[i - 1]) duplicates++;
    assert.equal(duplicates, 86);
  }
}
const SLICE = 6561;
const winners = [];
const counts = new Float64Array(28);
for (const reset of /** @type {Array<'book'|'page'|'chapter'>} */ (["book", "page", "chapter"])) {
  for (const skip of [false, true]) {
    for (const sign of /** @type {Array<1|-1>} */ ([-1, 1])) {
      let bestTrain = { train: -Infinity };
      let bestTest = { test: -Infinity };
      for (let u = 0; u < 28; u++) {
        for (let v = 0; v < 28; v++) {
          const plain = decrypt(source, u, v, reset, skip, sign);
          const train = ioc(plain, 0, SLICE);
          const test = ioc(plain, SLICE, N);
          if (train > bestTrain.train) bestTrain = { u, v, train, test };
          if (test > bestTest.test) bestTest = { u, v, train, test };
        }
      }
      winners.push({ reset, skip, sign, bestTrain, retrospectiveBestTest: bestTest });
      assert(bestTrain.test < 0.045, "unexpected native-like held-out result");
      assert(bestTest.test < 0.045, "unexpected source-native result");
    }
  }
}
assert.equal(winners.length, 12);

/**
 * Algebraic upgrade: differences between any two source-forced Fibonacci
 * key streams obey the homogeneous Fibonacci recurrence modulo 28.
 * Its exact 2-dimensional state has period 48. Therefore candidate
 * plaintexts under different unknown IVs are merely different additive
 * *phase-48* relabelings of one another, and every equality collision
 * within the same phase and reset scope is unchanged for all 784 seeds.
 * The following grants an arbitrary 28! relabeling per phase, strictly
 * more freedom than any possible source-forced secret seed.
 */
/** @returns {number} */
function fibonacciPeriod28() {
  let a = 0, b = 1;
  for (let i = 1; i <= 28 * 28 * 2; i++) {
    const c = (a + b) % 28;
    a = b; b = c;
    if (a === 0 && b === 1) return i;
  }
  throw Error("unexpected period");
}
const keyPeriod = fibonacciPeriod28();
assert.equal(keyPeriod, 48);
/**
 * @param {'book'|'page'|'chapter'} reset
 * @param {boolean} skipEquals
 * @returns {{state:Int16Array,stateCount:number}}
 */
function keyPhase(reset, skipEquals) {
  const state = new Int16Array(N);
  let epoch = -1, consumed = 0;
  for (let i = 0; i < N; i++) {
    if (i === 0 || masks[reset][i]) { epoch++; consumed = 0; }
    state[i] = epoch * keyPeriod + consumed % keyPeriod;
    if (!skipEquals || !free[i] || firstOfPage[i]) consumed++;
  }
  return { state, stateCount: (epoch + 1) * keyPeriod };
}
/**
 * @param {ArrayLike<number>} values
 * @param {{state:Int16Array,stateCount:number}} phases
 * @returns {{equal:number,denom:number,q:number}}
 */
function hiddenStateCollision(values, phases) {
  const histogram = new Uint16Array(phases.stateCount * 28);
  const total = new Uint16Array(phases.stateCount);
  for (const i of eligible) {
    const value = values[i], state = phases.state[i];
    assert(value >= 0 && value < 28);
    histogram[state * 28 + value]++;
    total[state]++;
  }
  let equal = 0, denom = 0;
  for (let state = 0; state < phases.stateCount; state++) {
    denom += total[state] * (total[state] - 1);
    for (let symbol = 0; symbol < 28; symbol++) {
      const count = histogram[state * 28 + symbol];
      equal += count * (count - 1);
    }
  }
  return { equal, denom, q: equal / denom };
}
const nativeControls = [
  { name: "Shakespeare", runes: sourceNative },
  { name: "Gibran", runes: native(read("resources/control/gibran_prophet_58585.txt")) },
];
const phaseCertificates = [];
for (const reset of /** @type {Array<'book'|'page'|'chapter'>} */ (["book", "page", "chapter"])) {
  for (const skipEquals of [false, true]) {
    const phases = keyPhase(reset, skipEquals);
    const fixed = hiddenStateCollision(decrypt(source, 0, 0, reset, skipEquals, 1), phases);
    // An unseen initial state may be distinct in every page or chapter
    // because each reset scope receives independent 48-phase bins.
    for (const [u, v] of [[0, 1], [1, 0], [13, 21], [27, 27]]) {
      for (const sign of /** @type {Array<1|-1>} */ ([-1, 1])) {
        const other = hiddenStateCollision(decrypt(source, u, v, reset, skipEquals, sign), phases);
        assert.equal(other.equal, fixed.equal);
        assert.equal(other.denom, fixed.denom);
      }
    }
    const controls = nativeControls.map(({ name, runes }) => {
      let minimum = Infinity, maximum = -Infinity;
      for (let n = 0; n < 80; n++) {
        const offset = Math.floor((runes.length - N) * n / 79);
        const sample = Array.from({ length: N }, (_, i) =>
          free[i] ? 0 : (runes[offset + i] === 28 ? 18 : runes[offset + i]));
        const value = hiddenStateCollision(sample, phases).q;
        minimum = Math.min(minimum, value);
        maximum = Math.max(maximum, value);
      }
      return { name, windows: 80, min: minimum, max: maximum };
    });
    phaseCertificates.push({ reset, skipEquals, phaseCount: phases.stateCount,
      source: fixed, controls, allUnknownSeedsPreserveExactCollision: true });
  }
}
assert.equal(phaseCertificates.length, 6);
console.log(JSON.stringify({
  status: "PASS: no native GP heldout plaintext under exhaustive original Fibonacci cipher-feedback seeds",
  source: { N, duplicates: duplicate, ordinary: eligible.length, gpPrimeWeights: primes,
    spiralPage: 15, fibonacciState: "k_i=k_(i-1)+k_(i-2)+prime(c_prev) modulo28" },
  tested: { seedPairs: 784, signs: 2, resetModes: 3, repeatPolicies: 2, receivers: 9408 },
  nativePlant: { length: N, resetPolicies: 6, exactRoundTrips: 6 },
  winners, fibonacciPeriod28: keyPeriod, phaseCertificates,
}, null, 2));
