"use strict";
/**
 * Two-register nonlinear GP29 norm oscillator, derived from archived
 * 2014 onion7 numbers 133 and 331. Their residues 17,12 are conjugate
 * square roots of -1 (mod 29). The norm output u*v is deliberately
 * distinct from the previously exhausted linear oscillator u+v.
 *
 * C_i = P_i + sign*u_i*v_i (mod29)
 * u_(i+1) = 17*u_i + C_i (mod29)
 * v_(i+1) = 12*v_i + C_i (mod29)
 *
 * This is a proposed mechanism and a scoped original-input negative,
 * not historical evidence for a Cicada key.
 *
 * SFT (Windows 11 / Node.js 22): run with node on this file.
 * @module onion7_133331_nonlinear_norm_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const html = read("resources/cicada2014-onion7-index.html");
assert.match(html, /<title>133<\/title>/u);
assert.match(html, /<div id="331">/u);

const pages = gp.pages.filter(p => p.page < 56 && p.indices.length);
const book = pages.flatMap(p => p.indices);
assert.equal(pages.length, 55);
assert.equal(book.length, 12956);

const mod = n => ((n % 29) + 29) % 29;
assert.equal(mod(133), 17);
assert.equal(mod(331), 12);
assert.equal(mod(17 * 17), 28);
assert.equal(mod(12 * 12), 28);
assert.equal(mod(17 * 12), 1);
const labels = gp.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} raw @returns {number[]} */
function encode(raw) {
  const output = [];
  for (let w of raw.toUpperCase().match(/[A-Z]+/gu) || []) {
    w = w.replace(/QU/gu, "CW").replace(/V/gu, "U")
      .replace(/K/gu, "C").replace(/Z/gu, "S")
      .replace(/Q/gu, "C").replace(/ING/gu, "NG");
    for (let i = 0; i < w.length;) {
      const match = labels.find(x => w.startsWith(x.s, i));
      assert.ok(match, "Missing GP token in " + w);
      output.push(match.i);
      i += match.s.length;
    }
  }
  return output;
}
const controls = encode(read("resources/control/shakespeare_first300k.txt"));
assert.equal(controls.length, 217644);
const counts = new Float64Array(29).fill(0.5);
for (const x of controls.slice(0, Math.floor(0.8 * controls.length)))
  counts[x]++;
const sum = counts.reduce((a, b) => a + b, 0);
const score = Array.from(counts, x => Math.log(29 * x / sum));
const native = controls.slice(-book.length);
assert.equal(native.length, book.length);

/**
 * Decode using the actually published C sequence as the state input.
 * @param {number[]} cipher @param {number} u0 @param {number} v0
 * @param {number} sign @returns {number[]}
 */
function decrypt(cipher, u0, v0, sign = 1) {
  let u = u0, v = v0;
  const result = [];
  for (const c of cipher) {
    result.push(mod(c - sign * u * v));
    u = mod(17 * u + c);
    v = mod(12 * v + c);
  }
  return result;
}
/**
 * @param {number[]} plain @param {number} u0 @param {number} v0
 * @param {number} sign @returns {number[]}
 */
function encrypt(plain, u0, v0, sign = 1) {
  let u = u0, v = v0;
  const result = [];
  for (const p of plain) {
    const c = mod(p + sign * u * v);
    result.push(c);
    u = mod(17 * u + c);
    v = mod(12 * v + c);
  }
  return result;
}
/** @param {number[]} sequence */
function recover(sequence) {
  const half = Math.floor(sequence.length / 2);
  let best = { train: -Infinity };
  for (const sign of [1, -1])
    for (let s0 = 0; s0 < 29; s0++)
      for (let s1 = 0; s1 < 29; s1++) {
        let u = s0, v = s1, train = 0, heldout = 0;
        for (let i = 0; i < sequence.length; i++) {
          const c = sequence[i];
          const value = score[mod(c - sign * u * v)];
          if (i < half) train += value;
          else heldout += value;
          u = mod(17 * u + c);
          v = mod(12 * v + c);
        }
        train /= half;
        heldout /= sequence.length - half;
        if (train > best.train)
          best = { sign, s0, s1, train, heldout };
      }
  return best;
}
/** @param {number[]} sequence */
function ioc(sequence) {
  const counts = Array(29).fill(0);
  for (const x of sequence) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (sequence.length * (sequence.length - 1));
}
/** @param {number} a @param {number} b */
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9,
  "Mismatched value: " + a + " != " + b);

const plant = encrypt(native, 17, 12);
assert.deepEqual(decrypt(plant, 17, 12), native);
const bookResult = recover(book);
const plantedResult = recover(plant);
assert.deepEqual([bookResult.sign, bookResult.s0, bookResult.s1],
  [-1, 1, 6]);
close(bookResult.train, -0.8333338366456938);
close(bookResult.heldout, -0.9288762325659812);
assert.deepEqual([plantedResult.sign, plantedResult.s0, plantedResult.s1],
  [1, 17, 12]);
close(plantedResult.heldout, 0.375691913746194);
close(ioc(decrypt(book, 17, 12)), 0.0344577597733337);
close(ioc(native), 0.05927834124082829);

let offset = 0, exact = 0;
let originalTrain = 0, originalHoldout = 0;
let plantedTrain = 0, plantedHoldout = 0;
for (const page of pages) {
  const n = page.indices.length;
  const nativePart = native.slice(offset, offset + n);
  const r = recover(page.indices);
  const planted = recover(encrypt(nativePart, 17, 12));
  originalTrain += r.train * n;
  originalHoldout += r.heldout * n;
  plantedTrain += planted.train * n;
  plantedHoldout += planted.heldout * n;
  if (planted.sign === 1 && planted.s0 === 17 && planted.s1 === 12)
    exact++;
  offset += n;
}
assert.equal(offset, book.length);
assert.equal(exact, 55);
close(originalTrain / offset, -0.3601750483505353);
close(originalHoldout / offset, -0.8934286551429071);
close(plantedTrain / offset, 0.38591517057723224);
close(plantedHoldout / offset, 0.39150719767314635);

// The exact original printed word-length inventory is fixed in this
// independent forward-generator prediction, with no resegmentation.
const rm = new Set(gp.runes);
const words = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%")
  .split(/[-.&$§]/u)
  .map(w => [...w].filter(c => rm.has(c))).filter(w => w.length);
assert.equal(words.length, 2896);
assert.equal(words.reduce((s, w) => s + w.length, 0), book.length);
/** @param {number[]} cipher */
function sourceCounts(cipher) {
  let repeat = 0, lag5 = 0, opportunities = 0, start = 0;
  for (const page of pages) {
    for (let i = 1; i < page.indices.length; i++)
      if (cipher[start + i] === cipher[start + i - 1]) repeat++;
    start += page.indices.length;
  }
  start = 0;
  for (const w of words) {
    for (let i = 5; i < w.length; i++) {
      opportunities++;
      if (cipher[start + i] === cipher[start + i - 5]) lag5++;
    }
    start += w.length;
  }
  return { repeat, lag5, opportunities };
}
assert.deepEqual(sourceCounts(book),
  { repeat: 86, lag5: 104, opportunities: 2105 });
assert.deepEqual(sourceCounts(plant),
  { repeat: 470, lag5: 65, opportunities: 2105 });

const result = {
  family: "source-conjugate-GF29-nonlinear-norm",
  source: { title: 133, id: 331, roots: [17, 12] },
  modelsPerUnit: 1682,
  original: {
    book: bookResult,
    pageWeightedTrain: originalTrain / offset,
    pageWeightedHeldout: originalHoldout / offset,
    fixedSeedPlainIoC: ioc(decrypt(book, 17, 12)),
    counts: sourceCounts(book)
  },
  planted: {
    book: plantedResult,
    recoveredPageKeys: exact,
    pageWeightedTrain: plantedTrain / offset,
    pageWeightedHeldout: plantedHoldout / offset,
    plaintextIoC: ioc(native),
    counts: sourceCounts(plant),
    recoveredRunes: native.length
  }
};
process.stdout.write(JSON.stringify(result, null, 2) + "\n");
