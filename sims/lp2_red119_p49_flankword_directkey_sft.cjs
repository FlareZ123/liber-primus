"use strict";

/**
 * Source-locked red119-triad -> complete table-adjacent 33/40-word gate.
 * Run from repo root with Node.js 22. Never edits input. Complete independent
 * solved-p57 plants verify all additive inverse variants.
 * This is a hypothesis screen, not authenticated LP2 plaintext.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const c = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const original = fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-transcription.txt"), "utf8");
const parts = original.split(/^%$/m);
assert.equal(parts.length, 57);
const runeMap = new Map(c.runes.map((r, i) => [r, i]));

/** @param {string} s @returns {number[]} */
const numbers = s => [...s].flatMap(ch => runeMap.has(ch) ? [runeMap.get(ch)] : []);
/** @param {number} n @returns {string} */
const pageText = n => parts[n < 50 ? n : n - 1].replace(/[\/\r\n]/g, "");
/** @param {string} s @returns {number[][]} */
const words = s => s.split(/[-.&$§]/g).map(numbers).filter(a => a.length);
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const x of a) counts[x] += 1;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
}
/** @param {number[]} a @returns {string} */
const translit = a => a.map(i => c.translit[i]).join("");
/** @param {number[]} ct @param {number[]} key @param {number} sign @returns {number[]} */
const decode = (ct, key, sign) => ct.map((x, i) => (x + 29 + sign * key[i % 3]) % 29);

for (const page of c.pages) {
  if (page.page !== 50) assert.deepEqual(numbers(pageText(page.page)), page.indices);
}

const p48 = pageText(48), p49 = pageText(49);
const p51 = pageText(51), p52 = pageText(52);
const beforeText = p48.slice(p48.lastIndexOf(".") + 1) +
  p49.slice(0, p49.lastIndexOf(".") + 1);
const afterText = p51 + p52.slice(0, p52.indexOf(".") + 1);
const receivers = [numbers(beforeText), numbers(afterText)];
const lengths = [words(beforeText).length, words(afterText).length];
assert.deepEqual(lengths, [33, 40]);
assert.deepEqual(receivers.map(a => a.length), [138, 170]);

const red = [c.pages[3].indices.slice(119, 122), c.pages[39].indices.slice(119, 122)];
assert.deepEqual(red, [[13, 23, 2], [27, 5, 15]]);
const sums = red.map(a => a.reduce((n, x) => n + c.prime[x], 0));
assert.deepEqual(sums, [137, 173]);

/** @param {number} x @returns {number} */
function primeOrdinal(x) {
  let ordinal = 0;
  for (let n = 2; n <= x; n++) {
    let isPrime = true;
    for (let f = 2; f * f <= n; f++) if (n % f === 0) isPrime = false;
    if (isPrime) ordinal++;
  }
  return ordinal;
}
assert.deepEqual(sums.map(primeOrdinal), lengths);

const solved = c.pages[57].indices;
assert.equal(solved.length, 95);
const result = [];
for (let j = 0; j < 2; j++) {
  const ct = receivers[j];
  for (const kind of ["gp-index", "gp-prime-mod29"]) {
    const key = kind === "gp-index" ? red[j] : red[j].map(i => c.prime[i] % 29);
    for (const sign of [-1, 1]) {
      const out = decode(ct, key, sign);
      const plant = Array.from({ length: ct.length }, (_, i) => solved[i % solved.length]);
      const encrypted = decode(plant, key, -sign);
      assert.deepEqual(decode(encrypted, key, sign), plant);
      assert.deepEqual(decode(out, key, -sign), ct);
      result.push({
        sentence: j === 0 ? "p48-49 before table" : "p51-52 after table",
        words: lengths[j],
        runes: ct.length,
        key_kind: kind,
        key,
        sign,
        output_ioc: Number(ioc(out).toFixed(12)),
        original_first64: translit(out.slice(0, 64))
      });
    }
  }
}
assert.ok(result.every(v => v.output_ioc < 0.038));
const knownIoc = ioc(solved);
assert.ok(knownIoc > 0.06);
console.log(JSON.stringify({
  source: "original LP2 unmodified p3/p39 red triads and p48-49/p51-52 sentences",
  red_triads: red,
  prime_sums: sums,
  prime_ordinals: sums.map(primeOrdinal),
  sentence_wordcounts: lengths,
  authentic_p57_clear_ioc: knownIoc,
  source_results: result,
  verdict: "Clue-aligned 33/40 word count, no plaintext by these eight direct period-3 additive consumers"
}, null, 2));
