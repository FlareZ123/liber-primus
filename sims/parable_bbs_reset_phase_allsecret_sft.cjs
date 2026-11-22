"use strict";
/**
 * Exact source BBS bitpack-period 153/306/612 + physical-page/nine-chapter
 * phase reset collision gate against 12956 original GP ciphertext runes.
 * Entire per-phase 29!/28! hidden secret alphabets remain allowed.
 *
 * Source clue: printed p57 three prime sums 1259,1031,1229 multiply to
 * original 2013 ID3 "Parable 1595277641". First two form Blum modulus,
 * third is hypothetical BBS seed; this is NOT authenticated cipher intent.
 *
 * Run: node sims/parable_bbs_reset_phase_allsecret_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {toGematria} = require("./previous_cipher_sbox_invariant.cjs");
const root = path.resolve(__dirname, "..");
/** @param {string} p */
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = gp.pages.filter((p) => p.page <= 55 && p.indices.length);
const nums = pages.map((p) => p.page);
const lengths = pages.map((p) => p.indices.length);
const original = pages.flatMap((p) => p.indices);
assert.equal(pages.length, 55);
assert.equal(original.length, 12956);
const chapters = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]];
const chapterByPage = new Map();
for (let i = 0; i < chapters.length; i++)
  for (let j = chapters[i][0]; j <= chapters[i][1]; j++)
    chapterByPage.set(j, i);
assert(nums.every((n) => chapterByPage.has(n)));
const primeSums = [1259, 1031, 1229];
const BBS = primeSums[0] * primeSums[1];
const START = primeSums[2] ** 2 % BBS;
const bits = [];
let state = START;
do {
  assert(bits.length < BBS);
  bits.push(state & 1);
  state = state * state % BBS;
} while (state !== START);
assert.equal(bits.length, 612);
/** @param {number} n */
function divisors(n) {
  return Array.from({length:n}, (_, i) => i + 1).filter((v) => n % v === 0);
}
/** @param {number[]} arr */
function shortestPeriod(arr) {
  return divisors(arr.length).find((d) =>
    arr.every((v, i) => v === arr[i % d]));
}
/** @param {number} width */
function bitPack(width) {
  const n = 612 / gcd(612, width), out = [];
  for (let i = 0; i < n; i++) {
    let value = 0;
    for (let j = 0; j < width; j++)
      value = (value << 1) | bits[(width * i + j) % 612];
    out.push(value);
  }
  return out;
}
/** @param {number} a @param {number} b */
function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}
const bitWidths = [8, 2, 5];
const periods = bitWidths.map((width) => shortestPeriod(bitPack(width)));
assert.deepEqual(periods, [153, 306, 612]);
const mod = (n, m) => (n % m + m) % m;

/**
 * @typedef {{direct:number,rank:number,pagePos:number,chapterPos:number,
 * pageSkip:number,chapterSkip:number}} Entry
 * @param {number[]} symbols
 * @param {"original"|"native"} mode
 * @returns {Entry[]}
 */
function annotate(symbols, mode) {
  assert.equal(symbols.length, original.length);
  const rows = [];
  let at = 0, chapter = -1, chapterPos = 0, chapterSkip = 0;
  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const currentChapter = chapterByPage.get(nums[pageIndex]);
    if (currentChapter !== chapter) {
      chapter = currentChapter;
      chapterPos = 0;
      chapterSkip = 0;
    }
    let pageSkip = 0;
    for (let i = 0; i < lengths[pageIndex]; i++, at++, chapterPos++) {
      const value = symbols[at];
      const previous = i === 0 ? -1 : symbols[at - 1];
      const available = i > 0 &&
        (mode === "original" ? value !== previous : value !== 28);
      const rank = available ?
        mode === "original" ? mod(value - previous - 1, 29) : value : -1;
      rows.push({direct:value, rank, pagePos:i, chapterPos,
        pageSkip, chapterSkip});
      if (available) {pageSkip++;chapterSkip++;}
    }
  }
  assert.equal(at, original.length);
  return rows;
}

/**
 * @param {Entry[]} rows
 * @param {number} period
 * @param {"page"|"chapter"} reset
 * @param {"direct"|"rank"} domain
 * @param {"Pos"|"Skip"} advance
 */
function collision(rows, period, reset, domain, advance) {
  const phaseKey = reset + advance;
  const counts = Array.from({length:period}, () => new Uint16Array(29));
  const phases = new Uint16Array(period);
  let runes = 0;
  for (const row of rows) {
    const value = row[domain];
    if (value < 0) continue;
    const phase = row[phaseKey] % period;
    counts[phase][value]++;
    phases[phase]++;
    runes++;
  }
  let numerator = 0, denominator = 0;
  for (let phase = 0; phase < period; phase++) {
    denominator += phases[phase] * (phases[phase] - 1);
    for (const count of counts[phase])
      numerator += count * (count - 1);
  }
  assert.equal(numerator % 2, 0);
  assert.equal(denominator % 2, 0);
  return {same:numerator / 2, pairs:denominator / 2,
    rate:numerator / denominator, runes};
}
let rng = (0x3301 ^ BBS ^ START) >>> 0;
function random() {
  rng ^= rng << 13;
  rng ^= rng >>> 17;
  rng ^= rng << 5;
  return rng >>> 0;
}
/** @param {number} n */
function permutation(n) {
  const a = Array.from({length:n}, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = random() % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
/** @param {number} period @param {number} alphabetSize */
function alphabet(period, alphabetSize) {
  const forward = Array.from({length:period}, () =>
    permutation(alphabetSize));
  const inverse = forward.map((row) => {
    const result = new Array(alphabetSize);
    for (let i = 0; i < alphabetSize; i++)
      result[row[i]] = i;
    return result;
  });
  return {forward, inverse};
}
/**
 * Exact source-native GP29 or GP28 ciphertext plant under a hidden arbitrary
 * phase-alphabet, with full inverse. Reusable same phase table each reset.
 * @param {number[]} input
 * @param {number} period
 * @param {"page"|"chapter"} reset
 * @param {"direct"|"rank"} domain
 * @param {"Pos"|"Skip"} advance
 */
function plant(input, period, reset, domain, advance) {
  const {forward, inverse} = alphabet(period, domain === "direct" ? 29 : 28);
  const rows = annotate(input, "native");
  const encoded = [], recovered = [];
  let at = 0;
  for (const length of lengths) {
    let previous = -1;
    for (let i = 0; i < length; i++, at++) {
      const value = input[at];
      const phase = rows[at][reset + advance] % period;
      let c, p;
      if (domain === "direct") {
        c = forward[phase][value];
        p = inverse[phase][c];
      } else if (i === 0) {
        c = value;
        p = value;
      } else if (value === 28) {
        c = previous;
        p = 28;
      } else {
        const rank = forward[phase][value];
        c = mod(previous + 1 + rank, 29);
        p = inverse[phase][mod(c - previous - 1, 29)];
      }
      encoded.push(c);
      recovered.push(p);
      previous = c;
    }
  }
  assert.deepEqual(recovered, input);
  assert.equal(encoded.length, 12956);
  return encoded;
}

const sourceRefs = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];
const sourceWindows = [];
for (const [name, filename] of sourceRefs) {
  const source = toGematria(read(filename));
  for (let i = 0; i + original.length <= source.length; i += original.length)
    sourceWindows.push({name, offset:i,
      values:source.slice(i, i + original.length)});
}
assert.equal(sourceWindows.length, 45);
const originalRows = annotate(original, "original");
const variants = [];
for (const period of periods)
  for (const reset of ["page", "chapter"])
    for (const domain of ["direct", "rank"])
      for (const advance of domain === "direct" ? ["Pos"] : ["Pos", "Skip"]) {
        const observed = collision(originalRows, period, reset, domain, advance);
        const controls = [];
        for (const {values} of sourceWindows) {
          const nativeRows = annotate(values, "native");
          const expected = collision(nativeRows, period, reset, domain, advance);
          const encrypted = plant(values, period, reset, domain, advance);
          const encryptedRows = annotate(encrypted, "original");
          const actual = collision(encryptedRows, period, reset, domain, advance);
          assert.equal(actual.same, expected.same);
          assert.equal(actual.pairs, expected.pairs);
          assert.equal(actual.rate, expected.rate);
          controls.push(expected.rate);
        }
        const lowest = Math.min(...controls);
        const highest = Math.max(...controls);
        assert(lowest > 0.055);
        assert(observed.rate < 0.04);
        variants.push({period, reset, domain, advance,
          ...observed, nativeMinimum:lowest, nativeMaximum:highest,
          nativeControls:controls.length});
      }
assert.equal(variants.length, 18);
console.log(JSON.stringify({
  source:{clauses:primeSums,modulus:BBS,seed:primeSums[2],
    originalBBSStates:bits.length,
    derivedGroupWidths:bitWidths,derivedPeriods:periods},
  originalPages:55, originalRunes:12956, originalChapters:9,
  variants, originalRecoveredPlaintext:false,
  exactPlantedDecryptions:variants.length*sourceWindows.length,
  conclusion:"The tested source-derived period153/306/612 shared-secret GP29 and GP28 phase ciphers, reset by physical page or original nine-chapter structure, are inconsistent with direct native-like GP prose in all 45 matched windows."
}, null, 2));
