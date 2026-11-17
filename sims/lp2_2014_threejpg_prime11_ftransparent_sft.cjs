/**
 * Original 2014 107/167/229.jpg prime-index stride-11 key-transfer test.
 * SFT: Node 22 CommonJS; original repo files only, no dependencies or writes.
 * All legal plaintext-F-transparent branches retained. Fixed starts, no search.
 */
'use strict';
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const html = read("resources/external/2014-stage10-post-square-response.html");
const imageNames = [...html.matchAll(/<img\s+src="\/(\d+)\.jpg"/g)].map(m => Number(m[1]));
assert.deepEqual(imageNames, [107, 167, 229]);
const LIMIT = 100000;
const composite = new Uint8Array(LIMIT + 1);
const primes = [];
for (let n = 2; n <= LIMIT; n++) {
  if (composite[n]) continue;
  primes.push(n);
  if (n * n <= LIMIT) for (let k = n * n; k <= LIMIT; k += n) composite[k] = 1;
}
const ordinal = n => { const i = primes.indexOf(n); assert(i >= 0); return i + 1; };
const starts = imageNames.map(ordinal);
assert.deepEqual(starts, [28, 39, 50]);
assert.equal(starts[1] - starts[0], 11);
assert.equal(starts[2] - starts[1], 11);
const runeMap = new Map(corpus.runes.map((ch, i) => [ch, i]));
const solvedP56 = solved.sections.find(s => s.name === "p56_an_end");
assert(solvedP56);
const plaintext56 = [...solvedP56.source_text].filter(ch => runeMap.has(ch)).map(ch => runeMap.get(ch));
const cipher56 = corpus.pages[56].indices;
assert.equal(plaintext56.length, 85);
assert.deepEqual(cipher56.length, 85);
const mod29 = n => (n % 29 + 29) % 29;
/** The GP prime minus one is Euler phi(p) for prime p. */
const nativeKey = t => primes[t] - 1;
const encipher = (plaintext, key, sign) => {
  let clock = 0;
  return plaintext.map(p => p === 0 ? 0 : mod29(p + sign * key(clock++)));
};
assert.deepEqual(encipher(plaintext56, nativeKey, +1), cipher56);
assert.equal(plaintext56.filter(x => x === 0).length, 1);
/**
 * Every exact algebraically permitted current non-F plaintext branch consumes
 * one key step; a plaintext-F branch exists only when C is literal F and
 * consumes no step. No language fitting, independent skip mask, or greediness.
 */
const exhaustiveStates = (cipher, key, sign) => {
  let states = new Set([0]);
  for (let position = 0; position < cipher.length; position++) {
    const c = cipher[position];
    const next = new Set();
    for (const t of states) {
      const p = mod29(c - sign * key(t));
      if (p !== 0) next.add(t + 1);
      if (c === 0) next.add(t);
    }
    states = next;
    if (!states.size) return { rejected_at_zero_based: position, c_index: c };
  }
  return { allowed_terminal_clocks: [...states].sort((a, b) => a - b) };
};
const positive56 = exhaustiveStates(cipher56, nativeKey, +1);
assert(positive56.allowed_terminal_clocks.includes(84));
const targetPages = [0, 15, 55];
const results = [];
let plantCount = 0;
for (const variant of ["prime-index-step11", "three-filename-loop"]) {
  for (const startIndex of [0, 1, 2]) {
    const startOrdinal = starts[startIndex];
    const key = t => variant === "prime-index-step11"
      ? primes[startOrdinal + 11 * t - 1] - 1
      : imageNames[(startIndex + t) % 3] - 1;
    for (const sign of [-1, +1]) {
      const planted = encipher(plaintext56, key, sign);
      const control = exhaustiveStates(planted, key, sign);
      assert(control.allowed_terminal_clocks.includes(84));
      plantCount++;
      for (const page of targetPages) {
        const observed = exhaustiveStates(corpus.pages[page].indices, key, sign);
        if (page === 0 || page === 15) assert("rejected_at_zero_based" in observed);
        results.push({ variant, start_prime_ordinal: startOrdinal, sign, page, ...observed });
      }
    }
  }
}
assert.equal(plantCount, 12);
assert.equal(results.length, 36);
assert.equal(results.filter(x => x.page === 0 && x.rejected_at_zero_based !== undefined).length, 12);
assert.equal(results.filter(x => x.page === 15 && x.rejected_at_zero_based !== undefined).length, 12);
console.log(JSON.stringify({
  source_filenames: imageNames, one_based_prime_ordinals: starts,
  key_index_step: 11, first_party_positive: {
    p56_encrypted_and_verified_runes: plaintext56.length,
    p56_nonF_prime_clock_consumptions: 84,
    deterministic_source_key_plants_passed: plantCount,
  },
  untouched_original_pages: targetPages.map(page => ({page, runes: corpus.pages[page].indices.length})),
  total_original_variant_page_tests: results.length,
  p0_rejections: results.filter(x => x.page === 0).length,
  p15_rejections: results.filter(x => x.page === 15).length,
  p55_surviving_variants: results.filter(x => x.page === 55 && x.allowed_terminal_clocks),
  exact_results: results,
  conclusion: "Historical filename prime-step is source-derived; transfer of solved p56 GP prime-totient F-transparent law fails on p0 and p15 for every source phase/sign. No LP2 plaintext.",
}, null, 2));
