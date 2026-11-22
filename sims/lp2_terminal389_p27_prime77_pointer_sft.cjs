"use strict";

/**
 * Source-fixed, read-only LP2 seven-rune / 77th-prime pointer test.
 * Node 22 CommonJS SFT; all observations refer to original GP29 runes.
 *
 * Candidate: a seven-rune echo across the p55/p56 boundary has GP-prime
 * sum 389 = prime #77. Follow that one-based ordinal to p27 rune #77
 * and read the next 76 GP runes as the full p55 key. Test both source
 * registers, both arithmetic signs, and the historically authenticated
 * literal-F, non-key-consuming p56 rule. The complete final ciphertext
 * chapter p54||p55 supplies the independent phase-zero rejection.
 *
 * The pointer and 23-factor identities were recognized retrospectively.
 * They are clues to investigate, not an authenticated cipher algorithm.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const file = path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json");
const gp = JSON.parse(fs.readFileSync(file, "utf8"));
const page = n => gp.pages.find(p => p.page === n).indices;
const p27 = page(27);
const p54 = page(54);
const p55 = page(55);
const p56 = page(56);
const p57 = page(57);
const mod = n => ((n % 29) + 29) % 29;

/** @param {number} count @returns {number[]} */
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
const primes = firstPrimes(100);
const weights = gp.prime;
assert.equal(p27.length, 234);
assert.equal(p54.length, 232);
assert.equal(p55.length, 76);
assert.equal(p56.length, 85);
assert.equal(p57.length, 95);
assert.deepEqual(p55.slice(-6), p27.slice(28, 34));
const seam = [...p55.slice(-6), p56[0]];
assert.deepEqual(seam, p27.slice(28, 35));
assert.deepEqual(seam, [23, 11, 1, 17, 18, 10, 25]);
const sum = arr => arr.reduce((s, x) => s + weights[x], 0);
assert.equal(sum(seam), 389);
assert.equal(primes[76], 389);
assert.equal(p27[76], 6);  // G is GP prime 17
assert.equal(weights[p27[76]], 17);
assert.equal((5 ** p27[76]) % 23, 8);
assert.equal((19 ** p27[76]) % 23, 2);
assert.equal(p27[35], 0);  // next p27 rune is F, GP prime 2
assert.equal(weights[p27[35]], 2);
assert.equal(17 * 23 - 389, weights[p27[35]]);
assert.equal(sum(p27.slice(34, 36)), 103);
assert.equal(primes[26], 103);
assert.equal(p56[0], 25); // AE, the first ciphertext rune of AN END

// Recover the independently solved p56 with the actual F-transparent
// Euler-totient-of-consecutive-primes clock, not a fitted test key.
let clock = 0;
const known = p56.map((x, i) =>
  i === 56 ? x : mod(x - primes[clock++] + 1));
assert.equal(clock, 84);
assert.equal(known[56], 0);
assert.equal(known.map(x => gp.translit[x]).join(""),
  "ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTO" +
  "ITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE");

// All source choices are fixed before looking for candidate plaintext.
const key77 = p27.slice(76, 152);
assert.equal(key77.length, 76);
const keyRegisters = [
  ["ordinal", key77],
  ["prime-mod29", key77.map(x => weights[x] % 29)]
];

/** @param {number[]} xs @returns {number} */
function scaledIoC(xs) {
  const f = Array(29).fill(0);
  for (const x of xs) f[x]++;
  return 29 * f.reduce((s, n) => s + n * (n - 1), 0) /
    (xs.length * (xs.length - 1));
}

/**
 * Decode with the historical p56 literal-plaintext-F bypass.
 * A plaintext F must be a literal ciphertext F and consume no key.
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} sign
 * @returns {{deadAt:number|null,states:Array<{ptr:number,plaintext:number[],bypass:number[]}>}}
 */
function decode(cipher, key, sign) {
  let states = [{ptr: 0, plaintext: [], bypass: []}];
  for (let i = 0; i < cipher.length; i++) {
    const next = [];
    for (const state of states) {
      const C = cipher[i];
      const P = mod(C + sign * key[state.ptr % key.length]);
      if (P !== 0) {
        next.push({ptr: state.ptr + 1,
          plaintext: [...state.plaintext, P], bypass: state.bypass});
      }
      if (C === 0) {
        next.push({ptr: state.ptr,
          plaintext: [...state.plaintext, 0], bypass: [...state.bypass, i]});
      }
    }
    if (next.length === 0) return {deadAt: i, states: []};
    states = next;
  }
  return {deadAt: null, states};
}

/**
 * Forward encoder for an independent solved-p57 plant, under the same
 * non-consuming literal-F rule as the decoder.
 * @param {number[]} plain
 * @param {number[]} key
 * @param {number} sign
 * @returns {number[]}
 */
function plant(plain, key, sign) {
  let ptr = 0;
  return plain.map(p => {
    if (p === 0) return 0;
    const c = mod(p - sign * key[ptr % key.length]);
    ptr++;
    return c;
  });
}

// Complete manuscript sections give a fixed, original-input holdout for
// direct use of the 76-rune p27 tape beyond the terminal chapter. The 2013
// signed DH worked example independently supplies T(x) = 24-2x mod29;
// the transfer of T to source-key values is strictly a test hypothesis.
const sectionBounds = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const sourceAffine = [
  ...keyRegisters,
  ...keyRegisters.map(([name, values]) =>
    ["DH-T-" + name, values.map(x => mod(24 - 2 * x))])
];
const sectionCandidates = [];
for (const [start, end] of sectionBounds) {
  const cipher = gp.pages.filter(p =>
    p.page >= start && p.page <= end).flatMap(p => p.indices);
  for (const [name, key] of sourceAffine) {
    for (const sign of [-1, 1]) {
      const plain = cipher.map((c, i) => mod(c + sign * key[i % 76]));
      sectionCandidates.push({
        section: "p" + start + "-" + end,
        count: cipher.length, register: name, sign,
        scaledIoC: scaledIoC(plain)
      });
    }
  }
}
const sourceSectionBest = [...sectionCandidates]
  .sort((a, b) => b.scaledIoC - a.scaledIoC)[0];
assert.equal(sectionCandidates.length, 72);
assert.equal(sectionBounds.reduce((n, [a, b]) =>
  n + gp.pages.filter(p => p.page >= a && p.page <= b)
    .reduce((k, p) => k + p.indices.length, 0), 0), 12956);
assert.ok(sourceSectionBest.scaledIoC < 1.1);

const chapter = [...p54, ...p55];
assert.equal(chapter.length, 308);
const details = [];
for (const [register, key] of keyRegisters) {
  for (const sign of [-1, 1]) {
    const nativePlant = p57.slice(0, 76);
    const recovered = decode(plant(nativePlant, key, sign), key, sign);
    assert.equal(recovered.deadAt, null);
    assert.ok(recovered.states.some(s =>
      s.plaintext.every((x, i) => x === nativePlant[i])));
    const end = decode(p55, key, sign);
    const full = decode(chapter, key, sign);
    const plainDirect = p55.map((c, i) => mod(c + sign * key[i]));
    assert.ok(plainDirect.every((p, i) =>
      mod(p - sign * key[i]) === p55[i]));
    details.push({
      register, sign,
      p55_direct_scaled_ioc: Number(scaledIoC(plainDirect).toFixed(7)),
      p55_Fskip_complete_paths: end.states.length,
      p55_Fskip_best_scaled_ioc: end.states.length
        ? Number(Math.max(...end.states.map(s => scaledIoC(s.plaintext))).toFixed(7))
        : null,
      p55_Fskip_bypasses: end.states.map(s => s.bypass),
      p55_Fskip_first_dead_offset: end.deadAt,
      chapter_308_first_dead_offset: full.deadAt,
      chapter_308_complete_paths: full.states.length,
      p55_direct_first_40: plainDirect.slice(0, 40).map(x => gp.translit[x]).join("")
    });
    assert.notEqual(full.deadAt, null);
    assert.equal(full.states.length, 0);
  }
}
assert.deepEqual(
  details.map(x => x.chapter_308_first_dead_offset),
  [39, 6, 47, 20]);
assert.deepEqual(details.map(x => x.p55_Fskip_complete_paths),
  [2, 1, 0, 0]);
assert.deepEqual(details.map(x => x.p55_Fskip_first_dead_offset),
  [null, null, 67, 49]);

console.log(JSON.stringify({
  run: "original terminal77 p27 pointer and GP29 inverse",
  original_rune_counts: {p27: p27.length, p54: p54.length,
    p55: p55.length, p56: p56.length, p57: p57.length},
  echoed_gp_values: seam.map(x => gp.translit[x]),
  echoed_gp_prime_sum: sum(seam),
  echo_prime_rank: 77,
  p27_pointer_gp_prime: weights[p27[76]],
  next_p27_gp_prime: weights[p27[35]],
  signed_2013_modulus: 23,
  source_103_prime_rank: 27,
  p56_known_plaintext: known.map(x => gp.translit[x]).join(""),
  native_p57_76_scaled_ioc: scaledIoC(p57.slice(0, 76)),
  source_section_direct_models: sectionCandidates.length,
  source_section_best: sourceSectionBest,
  results: details,
  status: "No authenticated unknown plaintext or decryption key."
}, null, 2));
