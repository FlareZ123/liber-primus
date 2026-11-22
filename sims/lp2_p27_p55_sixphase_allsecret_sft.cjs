"use strict";

/**
 * Exact key-independent GP29 coincidence ceiling over the original
 * p27/p55 repeated 6-rune footer. The source footer alignment is the
 * same page-reset phase modulo six on both physical pages.
 *
 * Any one shared substitution alphabet per phase, including every
 * possible 6-symbol Vigenere key, can only permute phase-local counts.
 * Sorting and aligning all six 29-bin histograms gives an achievable
 * upper bound on pooled plaintext IoC over all (29!)^6 alphabets.
 *
 * SFT: node sims/lp2_p27_p55_sixphase_allsecret_sft.cjs
 * Node.js 22, CommonJS, read-only, no third-party packages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = f => fs.readFileSync(path.join(root, f), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const p27 = gp.pages.find(p => p.page === 27).indices;
const p55 = gp.pages.find(p => p.page === 55).indices;
assert.equal(p27.length, 234);
assert.equal(p55.length, 76);

// Physical p55's last two complete 3-rune words exactly match p27 28..33.
assert.deepEqual(p27.slice(28, 34), [23, 11, 1, 17, 18, 10]);
assert.deepEqual(p55.slice(70), [23, 11, 1, 17, 18, 10]);
assert.equal(28 % 6, 70 % 6);

/** @param {number[]} sequence */
function counts(sequence) {
  const h = Array(29).fill(0);
  for (const v of sequence) h[v]++;
  return h;
}

/** @param {number[]} h */
function ioc(h) {
  const n = h.reduce((a, b) => a + b, 0);
  return h.reduce((sum, c) => sum + c * (c - 1), 0) / (n * (n - 1));
}

/**
 * Sort all six original phase histograms and align same-ranked bins.
 * By the rearrangement inequality, this gives the exact highest
 * pooled IoC achievable by independently permuting all six phase
 * output alphabets, much stronger than allowing only Caesar shifts.
 * @param {number[]} first
 * @param {number[]} second
 */
function allSecretCeiling(first, second) {
  const phase = Array.from({length: 6}, () => Array(29).fill(0));
  for (const page of [first, second]) {
    for (let j = 0; j < page.length; j++) phase[j % 6][page[j]]++;
  }
  const sorted = phase.map(h => h.slice().sort((a, b) => b - a));
  const maximalCounts = Array.from({length: 29}, (_, i) =>
    sorted.reduce((sum, h) => sum + h[i], 0));
  return {
    upperIoC: ioc(maximalCounts),
    counts: maximalCounts,
    literalIoC: ioc(counts(first.concat(second)))
  };
}

const original = allSecretCeiling(p27, p55);
assert.deepEqual(original.counts, [
  30, 24, 23, 18, 18, 18, 16, 15, 15, 13, 12, 12,
  11, 10, 10, 10, 8, 6, 6, 6, 6, 6, 6, 5, 5, 1, 0, 0, 0
]);
assert(Math.abs(original.upperIoC - 0.04783380311097192) < 1e-14);
assert(Math.abs(original.literalIoC - 0.03388662699655497) < 1e-14);

const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/**
 * Source-calibrated GP29 encoder using original solved-LP1 convention:
 * ING and IO take one rune; Q/K/V/Z follow known Latin normalization.
 * @param {string} source
 * @returns {number[]}
 */
function nativeGP(source) {
  const normalized = source.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C")
    .replace(/Z/g, "S");
  const out = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith("ING", i)) {
        out.push(21);
        i += 3;
      } else if (word.startsWith("IO", i)) {
        out.push(27);
        i += 2;
      } else {
        const token = tokens.find(x => word.startsWith(x.s, i));
        assert(token, "GP-native input must encode into 29 runes");
        out.push(token.i);
        i += token.s.length;
      }
    }
  }
  return out;
}

const controls = [
  ["Gibran", "resources/control/gibran_prophet_58585.txt", 2006],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", 6994]
];
const summaries = [];
let sourceGibran;
for (const [name, filename, expectedWindows] of controls) {
  const encoded = nativeGP(read(filename));
  if (name === "Gibran") sourceGibran = encoded;
  let windows = 0, below = 0, minimum = Infinity;
  for (let start = 0; start + 310 <= encoded.length; start += 31) {
    const stat = allSecretCeiling(
      encoded.slice(start, start + 234),
      encoded.slice(start + 234, start + 310)
    );
    minimum = Math.min(minimum, stat.upperIoC);
    if (stat.upperIoC <= original.upperIoC) below++;
    windows++;
  }
  assert.equal(windows, expectedWindows, name + " matched windows");
  assert.equal(below, 0, name + " 310-rune source-native IoC");
  summaries.push({name, windows, minimumUpperIoC: minimum, below});
}

// A genuine native-English plant with precisely the same two page
// lengths, the same six-symbol plaintext phrase at both source anchor
// offsets, and one shared nontrivial six-digit page-reset Vigenere key.
// Correct decryption must regain the entire planted source-native pair.
const first = sourceGibran.slice(0, 234);
const second = sourceGibran.slice(234, 310);
const phrase = [26, 3, 1, 24, 4, 18]; // YOU ARE
first.splice(28, 6, ...phrase);
second.splice(70, 6, ...phrase);
const key = [5, 13, 0, 11, 27, 19];
const encryption = plaintext => plaintext.map(
  (p, i) => (p + key[i % 6]) % 29);
const decryption = ciphertext => ciphertext.map(
  (c, i) => (c - key[i % 6] + 29) % 29);
const encFirst = encryption(first);
const encSecond = encryption(second);
assert.deepEqual(encFirst.slice(28, 34), encSecond.slice(70));
assert.deepEqual(decryption(encFirst), first);
assert.deepEqual(decryption(encSecond), second);
const planted = allSecretCeiling(encFirst, encSecond);
const nativePlainIoC = ioc(counts(first.concat(second)));
assert(nativePlainIoC > original.upperIoC);
assert(planted.upperIoC >= nativePlainIoC);
assert(Math.abs(planted.upperIoC - 0.08485228103142291) < 1e-14);
assert(Math.abs(nativePlainIoC - 0.06303371959494727) < 1e-14);

console.log(JSON.stringify({
  model: "one shared unknown alphabet per rune phase modulo six",
  exactOriginalSourceRunes: p27.length + p55.length,
  sourceAnchor: {p27Offset: 28, p55Offset: 70,
    commonCipherRunes: "D-J-U B-E-I"},
  original, controls: summaries,
  originalSourceNativeControlWindows: summaries.reduce(
    (n, row) => n + row.windows, 0),
  planted: {sharedCipherFooter: true, knownKeyFullInverse: true,
    nativePlainIoC, allSecretUpperIoC: planted.upperIoC},
  unknownPlaintextRecovered: false,
  period6SourceSelectedByPublisher: false
}, null, 2));
