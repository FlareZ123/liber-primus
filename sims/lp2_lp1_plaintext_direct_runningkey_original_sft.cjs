"use strict";

/**
 * Source-grounded direct LP1-cleartext running-key test on original unsolved LP2.
 * Run: node sims/lp2_lp1_plaintext_direct_runningkey_original_sft.cjs
 * All writes: none. Input files are repository-pinned text artifacts.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const CHAPTER_STARTS = [0, 729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956];

/**
 * @param {number[]} xs GP29 indices
 * @returns {number} Unbiased index of coincidence
 */
function ioc(xs) {
  const counts = new Int32Array(29);
  for (const x of xs) counts[x]++;
  let pairs = 0;
  for (const n of counts) pairs += n * (n - 1);
  return pairs / (xs.length * (xs.length - 1));
}

/**
 * Original solved-LP1 source is the seven first-release sections in order.
 * @returns {{ key: number[], cipher: number[] }}
 */
function load() {
  const lp1 = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/external/relikd-solved-gp29-native-v1.json"), "utf8"));
  const lp2 = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
  const gp = new Map(lp1.runes.map((r, i) => [r, i]));
  const key = lp1.sections.slice(0, 7).flatMap(
    (section) => Array.from(section.source_text).filter((r) => gp.has(r)).map((r) => gp.get(r))
  );
  const cipher = lp2.pages.slice(0, 56).flatMap((page) => page.indices);
  assert.equal(key.length, 2799);
  assert.equal(cipher.length, 12956);
  assert.deepEqual(CHAPTER_STARTS.slice(1).map((end, i) => end - CHAPTER_STARTS[i]), [729,1145,1729,1903,1021,1433,1680,3008,308]);
  return { key, cipher };
}

/**
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} offset
 * @param {-1|1} sign
 * @param {boolean} bypassCipherF If true, a literal ciphertext rune index zero consumes no key.
 * @returns {number[]}
 */
function decode(cipher, key, offset, sign, bypassCipherF) {
  let skip = 0;
  const plain = [];
  for (let i = 0; i < cipher.length; i++) {
    if (bypassCipherF && cipher[i] === 0) {
      plain.push(0);
      skip++;
      continue;
    }
    const k = key[offset + i - skip];
    plain.push((cipher[i] + 29 + sign * k) % 29);
  }
  return plain;
}

/**
 * Fully known source GP29 plaintext, exact old-style additive encryption,
 * independent of the original unknown LP2 input.
 * @param {number[]} key
 */
function positiveControls(key) {
  const source = key.slice(0, 729);
  const offset = 500;
  const directC = source.map((p, i) => (p + key[offset + i]) % 29);
  assert.deepEqual(decode(directC, key, offset, -1, false), source);
  // Native-F bypass requires an encoder to avoid accidental ciphertext F.
  let ptr = 0;
  const adjusted = [];
  const bypassC = [];
  for (let p of source) {
    if (p === 0) {
      adjusted.push(p);
      bypassC.push(0);
      continue;
    }
    while ((p + key[offset + ptr]) % 29 === 0 || p === 0) p = (p + 1) % 29;
    adjusted.push(p);
    bypassC.push((p + key[offset + ptr]) % 29);
    ptr++;
  }
  assert.deepEqual(decode(bypassC, key, offset, -1, true), adjusted);
  assert(ioc(source) > 0.05);
  console.log("SOURCE-POSITIVE direct=729/729 F-bypass=729/729 native-English-IoC=" + ioc(source).toFixed(8));
}

/**
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {-1|1} sign
 * @param {boolean} bypass
 * @returns {{ offset: number, ioc: number }}
 */
function exhaustiveBest(cipher, key, sign, bypass) {
  let best = { offset: -1, ioc: -Infinity };
  for (let offset = 0; offset <= key.length - cipher.length; offset++) {
    const sample = decode(cipher, key, offset, sign, bypass);
    const score = ioc(sample);
    if (score > best.ioc) best = { offset, ioc: score };
  }
  return best;
}

function main() {
  const { key, cipher } = load();
  positiveControls(key);
  let largest = 0;
  for (let ch = 0; ch < 9; ch++) {
    const n = ch === 8 ? 308 : 729;
    const fragment = cipher.slice(CHAPTER_STARTS[ch], CHAPTER_STARTS[ch] + n);
    assert.equal(fragment.length, n);
    for (const bypass of [false, true]) {
      for (const sign of [-1, 1]) {
        const best = exhaustiveBest(fragment, key, sign, bypass);
        if (best.ioc > largest) largest = best.ioc;
        console.log(JSON.stringify({ chapter: ch, firstRunes: n, keySource: "original solved LP1 text", sign, bypassCipherF: bypass, bestOffset: best.offset, bestIoc: Number(best.ioc.toFixed(9)) }));
      }
    }
  }
  // Direct additive original source has no native-English-looking 729-rune
  // opening for any visible chapter, even with a freely selected source offset.
  assert(largest < 0.045, "Unexpected LP1-running-key original candidate; investigate before concluding");
  console.log("PASS: 36 original-input scans, maximum IoC " + largest.toFixed(9) + "; no candidate reaches 0.045");
}

if (require.main === module) main();
module.exports = { load, ioc, decode, exhaustiveBest };
