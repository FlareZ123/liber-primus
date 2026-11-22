"use strict";

/**
 * LP2 original p0 Stage11/FFF-sourced 256-rune window GF(257) receiver.
 * Node.js 22, CommonJS, read-only single-file test. No search parameters.
 *
 * Source original scan 17.jpg (p0); preserved true word parsing joins '/'
 * wraps and exact source GP primes. Stage11 reference points to rune177,
 * where 3 F-starting intact words have prime sums 257,295,48.
 * Table[189] = 3C = 192 points to the next intact p0 word, which begins
 * rune192. Both 177 and 192 are frozen source-selected starts.
 *
 * GF257 primitive g=295 mod257=38; group size256. Test the two formal
 * 256-point inverse/forward NTTs for GP ordinal, actual GP-prime weights,
 * and g^(GP ordinal) as natural field embeddings. No inserted key, free
 * phase, word rearrangement, modulus29 collapse, arbitrary byte shift,
 * padding, or language-optimized transform is allowed.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} relative */
function source(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}
const corpus = JSON.parse(source("resources/liber-primus/lp2-corpus.json"));
const transcript = source("resources/liber-primus/lp2-transcription.txt");
const grid = JSON.parse(source("resources/liber-primus/lp2-grid-256.json"));
const cells = grid.pages.flatMap(page => page.tokens);
const page0 = corpus.pages.find(page => page.page === 0).indices;
const page1 = corpus.pages.find(page => page.page === 1).indices;
const original = corpus.pages
  .filter(page => page.page <= 55)
  .flatMap(page => page.indices);
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));

assert.equal(page0.length, 262);
assert.equal(page1.length, 266);
assert.equal(cells.length, 256);
assert.equal(corpus.prime.length, 29);
assert.equal(original.length, 12956);

/** @param {string} page */
function completeWords(page) {
  /** @type {number[][]} */
  const words = [];
  let cur = [];
  const flush = () => {
    if (cur.length) words.push(cur);
    cur = [];
  };
  for (const char of page) {
    const rune = runeIndex.get(char);
    if (rune !== undefined) cur.push(rune);
    else if (char === "/" || /\s/u.test(char)) {
      // A physical line wrap or typographic space carries the same word.
    } else flush();
  }
  flush();
  return words;
}
const p0Words = completeWords(transcript.split("%")[0]);
assert.equal(p0Words.length, 59);
assert.deepEqual(p0Words.flat(), page0);
let absolute = 0;
const sourceTriplet = [];
for (const [i, word] of p0Words.entries()) {
  if (i >= 40 && i <= 42) sourceTriplet.push({
    wordIndex: i,
    start: absolute,
    length: word.length,
    gpPrime: word.reduce((acc, value) => acc + corpus.prime[value], 0),
    translit: word.map(value => corpus.translit[value]).join(""),
    beginsF: word[0] === 0,
  });
  absolute += word.length;
}
assert.deepEqual(sourceTriplet, [
  { wordIndex: 40, start: 177, length: 6, gpPrime: 257, translit: "FXAEPGX", beginsF: true },
  { wordIndex: 41, start: 183, length: 6, gpPrime: 295, translit: "FLWEOTAE", beginsF: true },
  { wordIndex: 42, start: 189, length: 3, gpPrime: 48, translit: "FGN", beginsF: true },
]);
assert.equal(absolute, 262);
assert.equal(cells[189], "3C"); // source row-major token digit3*60 + C(12)
assert.equal(cells[192], "00");
assert.equal(page0[192], p0Words[43][0]);
assert.equal(3 * 60 + 12, 192);

/** @param {number} x */
const mod = x => ((x % 257) + 257) % 257;
/** @param {number} b @param {number} e */
function pow(b, e) {
  let base = mod(b);
  let out = 1;
  for (let n = e; n > 0; n = Math.floor(n / 2)) {
    if (n % 2) out = mod(out * base);
    base = mod(base * base);
  }
  return out;
}
const generator = 295 % 257; // 38 from the second F-initial word
assert.equal(generator, 38);
assert.equal(pow(generator, 128), 256);
assert.equal(pow(generator, 256), 1);
assert.equal(pow(generator, 24), 15);
assert.equal(pow(generator, 48), 225);
const N = 256;
const roots = Array.from({ length: N }, (_, e) => pow(generator, e));
const invRoots = Array.from({ length: N }, (_, e) => pow(generator, 256 - e));

/**
 * GF257 NTT, primitive order256. Inverse normalization is exactly
 * 256^(-1) == -1 modulo257, since 256 = -1.
 * @param {number[]} input @param {boolean} inverse @returns {number[]}
 */
function transform(input, inverse) {
  assert.equal(input.length, N);
  assert.ok(input.every(x => Number.isInteger(x) && x >= 0 && x < 257));
  const rootsUsed = inverse ? invRoots : roots;
  const output = [];
  for (let k = 0; k < N; k++) {
    let step = rootsUsed[k], factor = 1, total = 0;
    for (let j = 0; j < N; j++) {
      total = mod(total + input[j] * factor);
      factor = mod(factor * step);
    }
    output.push(mod(inverse ? -total : total));
  }
  return output;
}

const sample = Buffer.alloc(N);
const example = Buffer.from(
  "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG. " +
  "AN END A NEW BEGINNING OF THE WAY HERE. ",
  "ascii",
);
for (let i = 0; i < N; i++) sample[i] = example[i % example.length];
assert.deepEqual(transform(transform([...sample], false), true), [...sample]);
assert.deepEqual(transform(transform([...sample], true), false), [...sample]);

/** @param {number[]} values */
function diagnostics(values) {
  const isAlpha = value => value >= 65 && value <= 90 ||
    value >= 97 && value <= 122;
  let maxAlphaRun = 0, run = 0;
  for (const value of values) {
    run = isAlpha(value) ? run + 1 : 0;
    maxAlphaRun = Math.max(maxAlphaRun, run);
  }
  return {
    printableASCII: values.filter(x => x >= 32 && x <= 126).length,
    asciiAlphabetic: values.filter(isAlpha).length,
    longestAlphabeticRun: maxAlphaRun,
    valuesInGP29OrdinalRange: values.filter(x => x < 29).length,
    valuesInGPPrimeWeightSet: values.filter(x => corpus.prime.includes(x)).length,
    highByteValues: values.filter(x => x >= 127 && x <= 255).length,
    value256OutsideByte: values.filter(x => x === 256).length,
    first32Hex: values.slice(0, 32).map(x => x.toString(16).padStart(2, "0")).join(""),
    first50ASCII: String.fromCharCode(...values.slice(0, 50))
      .replace(/[^\x20-\x7e]/g, "."),
  };
}

/** @type {{start:number,embedding:string,transform:string}&ReturnType<typeof diagnostics>}[] */
const outputs = [];
for (const start of [177, 192]) {
  const window = original.slice(start, start + N);
  assert.equal(window.length, N);
  assert.ok(start < page0.length && start + N > page0.length);
  for (const embedding of ["gp0", "gpPrime", "generatorPowGP0"]) {
    const values = window.map(index => {
      if (embedding === "gp0") return index;
      if (embedding === "gpPrime") return corpus.prime[index];
      return roots[index];
    });
    for (const inverse of [false, true]) {
      const result = transform(values, inverse);
      assert.deepEqual(transform(result, !inverse), values);
      const stats = diagnostics(result);
      // An actual UTF8/ASCII instruction/file would have much higher
      // textual occupancy and a visible text run; all originals miss.
      assert.ok(stats.printableASCII <= 106);
      assert.ok(stats.longestAlphabeticRun <= 4);
      assert.ok(stats.valuesInGP29OrdinalRange <= 40);
      assert.ok(stats.valuesInGPPrimeWeightSet <= 38);
      outputs.push({
        start, embedding,
        transform: inverse ? "inverse" : "forward",
        ...stats,
      });
    }
  }
}
assert.equal(outputs.length, 12);
assert.equal(Math.max(...outputs.map(r => r.printableASCII)), 106);
assert.equal(Math.max(...outputs.map(r => r.longestAlphabeticRun)), 4);
assert.equal(Math.max(...outputs.map(r => r.valuesInGP29OrdinalRange)), 40);
console.log(JSON.stringify({
  source: {
    preservedOriginalRunes: original.length,
    page0Runes: page0.length,
    page1Runes: page1.length,
    sourceTriplet,
    p50Pointer: { index: 189, token: "3C", value: 192, nextToken: "00" },
    field: 257,
    generator,
    phase: 48,
    blockSize: N,
    originallyFixedCandidateStarts: [177, 192],
  },
  exactNativePositive: { bytes: N, inverseRecovered: true, forwardRecovered: true },
  originals: outputs,
  decision: "No direct native-ASCII, GP29, or prime-weight plaintext from two source-fixed 256-rune GF257 receiver starts. A direct 256-point NTT is not an independently supplied Cicada cipher operator.",
}, null, 2));
console.log("PASS lp2_p0_fff_gf257_256rune_window_ntt_sft");
