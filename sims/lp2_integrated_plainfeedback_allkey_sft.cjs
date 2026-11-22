"use strict";

/**
 * SFT: all-key integrated first-order plaintext-feedback GP29 inverse.
 * Read-only. Node 22 CommonJS, Windows compatible, no dependencies.
 *
 * Proposed encoder: C[i] = C[i-1] + P[i] + a*P[i-1] + b (mod 29).
 * First cipher rune in a continuous/chapter register is an arbitrary IV.
 *
 * The all-secret key search has 29*29=841 collision-equivalence classes:
 * for a != 28, b is absorbed into a constant plaintext rotation and
 * the free initial plaintext produces all 29 classes. For a = 28 (-1),
 * the free initial plaintext is a constant rotation and b produces 29.
 * The collision statistic is invariant under those plaintext rotations.
 * Source-native blind plants also verify the exact recurrence and search.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pageRows = corpus.pages.filter((p) => p.page < 56 && p.indices.length > 0);
const original = pageRows.flatMap((p) => p.indices);
const pageLengths = pageRows.map((p) => p.indices.length);
const CHAPTERS = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]];
const chapterCipher = CHAPTERS.map(([first, last]) => corpus.pages
  .filter((p) => p.page >= first && p.page <= last)
  .flatMap((p) => p.indices));
const chapterLengths = chapterCipher.map((p) => p.length);
assert.equal(original.length, 12956);
assert.equal(pageRows.length, 55);
assert.deepEqual(chapterLengths,
  [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);
assert.equal(pageLengths.reduce((a, b) => a + b, 0), 12956);

/** @param {number} n @returns {number} */
function mod(n) {
  return ((n % 29) + 29) % 29;
}

/**
 * Fixed GP29 transliteration used in the project's native English controls.
 * @param {string} text
 * @returns {number[]}
 */
function nativeGP(text) {
  const token = new Map(corpus.translit.map((s, i) => [s, i]));
  const out = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/[KQ]/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < word.length;) {
      let value;
      if (word.startsWith("ING", i)) {
        value = token.get("NG");
        i += 3;
      } else if (word.startsWith("IO", i)) {
        value = token.get("IA");
        i += 2;
      } else if (token.has(word.slice(i, i + 2))) {
        value = token.get(word.slice(i, i + 2));
        i += 2;
      } else {
        value = token.get(word[i]);
        i++;
      }
      if (value !== undefined) out.push(value);
    }
  }
  return out;
}

/**
 * @param {number[]} plain
 * @param {number} a
 * @param {number} b
 * @returns {number[]}
 */
function encrypt(plain, a, b) {
  const cipher = [plain[0]];
  for (let i = 1; i < plain.length; i++) {
    cipher.push(mod(cipher[i - 1] + plain[i] + a * plain[i - 1] + b));
  }
  return cipher;
}

/**
 * @param {number[]} cipher
 * @param {number} a
 * @param {number} b
 * @param {number} first
 * @returns {number[]}
 */
function decrypt(cipher, a, b, first) {
  const plain = [first];
  for (let i = 1; i < cipher.length; i++) {
    plain.push(mod(cipher[i] - cipher[i - 1] - a * plain[i - 1] - b));
  }
  return plain;
}

/**
 * @param {Int16Array} counts
 * @param {number} n
 * @returns {number}
 */
function ioc(counts, n) {
  let collisions = 0;
  for (const v of counts) collisions += v * (v - 1);
  return collisions / (n * (n - 1));
}

/**
 * Complete search of 841 rotational equivalence classes.
 * Training and test splits are independent contiguous plaintext windows.
 * Exclude only the unconstrained first source symbol in each register.
 * @param {number[]} cipher
 * @param {number} cut
 * @returns {{a:number,param:number,train:number,held:number}}
 */
function scan(cipher, cut) {
  const diff = new Uint8Array(cipher.length);
  for (let i = 1; i < cipher.length; i++) {
    diff[i] = mod(cipher[i] - cipher[i - 1]);
  }
  let best = null;
  let checked = 0;
  for (let a = 0; a < 29; a++) {
    for (let param = 0; param < 29; param++) {
      const training = new Int16Array(29);
      const held = new Int16Array(29);
      let previous = a === 28 ? 0 : param;
      for (let i = 1; i < cipher.length; i++) {
        previous = mod(diff[i] - a * previous - (a === 28 ? param : 0));
        (i < cut ? training : held)[previous]++;
      }
      const row = {
        a, param,
        train: ioc(training, cut - 1),
        held: ioc(held, cipher.length - cut),
      };
      checked++;
      if (best === null || row.train > best.train) best = row;
    }
  }
  assert.equal(checked, 841);
  return best;
}

/**
 * Minimum possible repeated-cipher count in any direct nonzero-feedback
 * integrated emitter: a in 1..28 and b in 0..28, fully optimized.
 * Preserve the authentic 55 page lengths and exclude 54 page seams.
 * @param {number[]} plain
 * @param {number} start
 * @returns {{count:number,a:number,b:number}}
 */
function nativeMinDoublets(plain, start) {
  const hist = Array.from({length: 29}, () => new Uint16Array(29));
  let base = start;
  for (const length of pageLengths) {
    for (let i = 1; i < length; i++) {
      const now = plain[base + i], previous = plain[base + i - 1];
      for (let a = 1; a < 29; a++) hist[a][(now + a * previous) % 29]++;
    }
    base += length;
  }
  let best = {count: Infinity, a: -1, b: -1};
  for (let a = 1; a < 29; a++) {
    for (let target = 0; target < 29; target++) {
      const count = hist[a][target];
      if (count < best.count) {
        best = {count, a, b: mod(-target)};
      }
    }
  }
  return best;
}

const sources = [
  {name: "Shakespeare", text: "resources/control/shakespeare_first300k.txt"},
  {name: "Gibran", text: "resources/control/gibran_prophet_58585.txt"},
  {name: "Emerson", text: "resources/control/emerson_essays_2944.txt"},
].map((s) => ({name: s.name, gp: nativeGP(read(s.text))}));
assert.deepEqual(sources.map((s) => s.gp.length), [217106, 62492, 321327]);

const observedDoublets = pageRows.reduce((sum, page) => sum
  + page.indices.reduce((count, value, i, arr) =>
    count + Number(i > 0 && value === arr[i - 1]), 0), 0);
assert.equal(observedDoublets, 86);
const nativeWindows = sources.map((s) => {
  const counts = [];
  for (let start = 0; start + original.length <= s.gp.length;
    start += original.length) {
    counts.push(nativeMinDoublets(s.gp, start).count);
  }
  return {name: s.name, count: counts.length,
    minimum: Math.min(...counts), maximum: Math.max(...counts)};
});
assert.deepEqual(nativeWindows.map((x) => x.count), [16, 4, 24]);
assert.deepEqual(nativeWindows.map((x) => x.minimum), [123, 149, 130]);

const globalCut = pageRows.slice(0, 27)
  .reduce((n, page) => n + page.indices.length, 0);
assert.equal(globalCut, 6527);
const globalOriginal = scan(original, globalCut);
assert.equal(globalOriginal.a, 0);
assert.ok(Math.abs(globalOriginal.train - 0.03533823444800227) < 1e-12);
assert.ok(globalOriginal.held < 0.04);
const clear = sources[0].gp.slice(50000, 50000 + original.length);
assert.equal(clear.length, original.length);

const globalPlantKey = {a: 9, b: 13};
const globalPlantCipher = encrypt(clear, globalPlantKey.a, globalPlantKey.b);
assert.deepEqual(
  decrypt(globalPlantCipher, globalPlantKey.a, globalPlantKey.b, clear[0]),
  clear
);
const globalPlant = scan(globalPlantCipher, globalCut);
assert.equal(globalPlant.a, globalPlantKey.a);
assert.ok(globalPlant.held > 0.055);

const chapters = [];
let at = 0;
for (let j = 0; j < chapterCipher.length; j++) {
  const c = chapterCipher[j];
  const n = c.length;
  const cut = Math.floor(0.6 * n);
  const result = scan(c, cut);
  const plain = clear.slice(at, at + n);
  const a = (3 + 5 * j) % 29;
  const b = (11 + 7 * j) % 29;
  const cipherPlant = encrypt(plain, a, b);
  assert.deepEqual(decrypt(cipherPlant, a, b, plain[0]), plain);
  const planted = scan(cipherPlant, cut);
  assert.equal(planted.a, a);
  assert.ok(planted.held > 0.055);
  assert.ok(result.held < 0.04);
  chapters.push({
    sourcePages: CHAPTERS[j], length: n, original: result,
    positive: {a, b, recoveredA: planted.a,
      train: planted.train, held: planted.held},
  });
  at += n;
}
assert.equal(at, original.length);

console.log(JSON.stringify({
  model: "C[i]=C[i-1]+P[i]+a*P[i-1]+b mod29",
  classification: "original-input full-key negative; no plaintext recovered",
  runes: original.length, runePages: pageRows.length,
  allRotationalClasses: 841, observedPageLocalDoublets: observedDoublets,
  nativeNonzeroFeedbackDoubletMinima: nativeWindows,
  global: {trainRunes: globalCut - 1,
    heldRunes: original.length - globalCut, original: globalOriginal,
    planted: {a: globalPlantKey.a, b: globalPlantKey.b,
      recoveredA: globalPlant.a, train: globalPlant.train,
      held: globalPlant.held, exactRecovered: original.length}},
  chapters,
}, null, 2));
