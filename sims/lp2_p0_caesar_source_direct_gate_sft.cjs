"use strict";

/**
 * SFT: source-motivated direct Caesar/POMPEI interpretations of the candidate
 * red heading SECUENDI RATIO.
 *
 * The recovered Latin phrase has a classical near-match in Caesar,
 * De Bello Civili I.30.1: "Pompei sequendi rationem ...". This test gives
 * the two cheapest Cicada-historical interpretations a finite gate:
 *   1) any fixed GP29 Caesar shift on the p0 body;
 *   2) repeating GP29 POMPEI, all six phases, both arithmetic directions,
 *      with and without literal ciphertext-F bypass/no key advance.
 *
 * It does not test book ciphers or running text from Caesar.
 *
 * Run: node sims/lp2_p0_caesar_source_direct_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const translit = corpus.translit;
const p0Body = corpus.pages.find(p => p.page === 0).indices.slice(13);
const solvedP57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(p0Body.length, 249);
assert.equal(solvedP57.length, 95);

const counts = new Map();
let quadgramTotal = 0;
for (const line of read("resources/control/dukotah_english_quadgrams.txt").split(/\r?\n/)) {
  const match = /^([A-Z]{4})\s+(\d+)$/.exec(line.trim());
  if (!match) continue;
  const count = Number(match[2]);
  counts.set(match[1], count);
  quadgramTotal += count;
}
const floor = Math.log10(0.01 / quadgramTotal);
const denominator = Math.log10(quadgramTotal);

/** @param {number} value */
const mod29 = value => (value % 29 + 29) % 29;

/** @param {number[]} runes */
function quadgramScore(runes) {
  const text = runes.map(value => translit[value]).join("");
  let score = 0;
  let n = 0;
  for (let i = 0; i + 4 <= text.length; i++) {
    const gram = text.slice(i, i + 4);
    if (!/^[A-Z]{4}$/.test(gram)) continue;
    n++;
    score += counts.has(gram)
      ? Math.log10(counts.get(gram)) - denominator
      : floor;
  }
  return score / n;
}

/** @param {number[]} runes */
function ioc(runes) {
  const histogram = Array(29).fill(0);
  for (const value of runes) histogram[value]++;
  return histogram.reduce((sum, count) => sum + count * (count - 1), 0)
    / (runes.length * (runes.length - 1));
}

const solvedScore = quadgramScore(solvedP57);
assert.ok(solvedScore > -5);
assert.ok(ioc(solvedP57) > 0.05);
assert.ok(ioc(p0Body) < 0.04);

// Fixed Caesar shifts preserve the p0 rune histogram and cannot approach the
// solved p57 English control under the same transliteration/quadgram scorer.
const caesar = [];
for (let shift = 0; shift < 29; shift++) {
  const plaintext = p0Body.map(value => mod29(value - shift));
  caesar.push({shift, score: quadgramScore(plaintext), ioc: ioc(plaintext)});
  assert.equal(ioc(plaintext), ioc(p0Body));
}
caesar.sort((a, b) => b.score - a.score);
assert.equal(caesar[0].shift, 22);
assert.ok(Math.abs(caesar[0].score - (-7.105222084775565)) < 1e-9);

// Caesar I.30.1 places POMPEI immediately before SEQUENDI RATIONEM.
// Test that exact missing word as the obvious repeating GP29 key.
const pompei = [..."POMPEI"].map(letter => translit.indexOf(letter));
assert.deepEqual(pompei, [13, 3, 19, 13, 18, 10]);

const repeating = [];
for (const sign of [-1, 1]) {
  for (let phase = 0; phase < pompei.length; phase++) {
    const plaintext = p0Body.map((value, i) =>
      mod29(value + sign * pompei[(i + phase) % pompei.length]));
    repeating.push({sign, phase, score: quadgramScore(plaintext)});
  }
}
repeating.sort((a, b) => b.score - a.score);
assert.deepEqual([repeating[0].sign, repeating[0].phase], [-1, 0]);
assert.ok(Math.abs(repeating[0].score - (-7.2788573704280894)) < 1e-9);

// Historically licensed LP variant: every literal ciphertext F may bypass
// decryption and does not advance the key. This generous all-F-bypass model
// also fails to approach solved plaintext.
const bypass = [];
for (const sign of [-1, 1]) {
  for (let phase = 0; phase < pompei.length; phase++) {
    let consumed = 0;
    const plaintext = [];
    for (const value of p0Body) {
      if (value === 0) {
        plaintext.push(0);
        continue;
      }
      plaintext.push(mod29(value + sign * pompei[(phase + consumed) % pompei.length]));
      consumed++;
    }
    bypass.push({sign, phase, score: quadgramScore(plaintext)});
  }
}
bypass.sort((a, b) => b.score - a.score);
assert.deepEqual([bypass[0].sign, bypass[0].phase], [-1, 3]);
assert.ok(Math.abs(bypass[0].score - (-7.321958399214647)) < 1e-9);

console.log(JSON.stringify({
  status: "direct Caesar/POMPEI interpretations rejected; source-book hypothesis remains open",
  sourceLead: "Caesar, De Bello Civili I.30.1: Pompei sequendi rationem ...",
  p0BodyIoC: ioc(p0Body),
  solvedP57IoC: ioc(solvedP57),
  solvedP57Quadgram: solvedScore,
  bestFixedCaesar: caesar[0],
  bestRepeatingPompei: repeating[0],
  bestAllCipherFBypassPompei: bypass[0],
}, null, 2));
