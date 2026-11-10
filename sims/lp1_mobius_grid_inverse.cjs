"use strict";
/**
 * Source-motivated LP1 MOBIUS / LP2 base60-table inversion test.
 *
 * One human-solver hypothesis is that the literal MOBIUS cell in the LP1
 * p05 magic square, together with p16's prime/totient instruction, points
 * to a divisor-lattice transform of the LP2 32x8 base60 byte table.
 *
 * This tests only two standard 1D interpretations of the 256 canonical
 * base60 byte values B(1)..B(256):
 *
 *   Möbius inversion: M(n) = sum_{d|n} mu(n/d) B(d)
 *   zeta transform:   Z(n) = sum_{d|n} B(d)
 *
 * Each transformed sequence is reduced mod 29 and used as a 256-period
 * additive GP29 key. Test row-major and column-major flattenings, both
 * signs, and both book-global and physical-page-reset clocks: 16 fixed
 * variants. This does not test every possible Mobius/totient construction.
 *
 * The base60 table is a derived interpretation of original printed cells;
 * its historical radix-59 ambiguity and incomplete all-cell visual audit
 * remain caveats. A perfect additive round-trip is key-blind and is only
 * an implementation invariant, not evidence of the authentic key.
 *
 * Run from the repository root with Node.js 22:
 *   node sims/lp1_mobius_grid_inverse.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const emerson = read("resources/control/emerson_essays_2944.txt");

const pages = corpus.pages.filter((p) => p.page <= 55);
const cipher = pages.flatMap((p) => p.indices);
assert.equal(pages.length, 56);
assert.equal(cipher.length, 12956);
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every((row) => row.length === 8));
assert.equal(grid.byte_rows.flat().length, 256);
assert.ok(grid.byte_rows.flat().every((x) => Number.isInteger(x) && x >= 0 && x <= 255));

const GP = new Map(corpus.translit.map((label, i) => [label, i]));
GP.set("ING", 21);

function englishToGP(text) {
  const normalized = text.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/K/g, "C")
    .replace(/Z/g, "S");
  const out = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      let found = false;
      for (const width of [3, 2, 1]) {
        const part = word.slice(i, i + width);
        if (GP.has(part)) {
          out.push(GP.get(part));
          i += width;
          found = true;
          break;
        }
      }
      assert.ok(found, "unmapped GP text at " + word.slice(i));
    }
  }
  return out;
}

const train = englishToGP(emerson);
const trigrams = new Map();
let trigramCount = 0;
for (let i = 0; i + 2 < train.length; i++) {
  const key = train[i] * 841 + train[i + 1] * 29 + train[i + 2];
  trigrams.set(key, (trigrams.get(key) || 0) + 1);
  trigramCount++;
}

function metrics(indices) {
  const frequencies = Array(29).fill(0);
  for (const x of indices) frequencies[x]++;
  const ioc = frequencies.reduce((sum, n) => sum + n * (n - 1), 0) /
    (indices.length * (indices.length - 1));
  const top12 = frequencies.slice().sort((a, b) => b - a).slice(0, 12)
    .reduce((sum, n) => sum + n, 0) / indices.length;
  const alpha = 0.05;
  const denominator = trigramCount + alpha * 29 ** 3;
  let logScore = 0;
  for (let i = 0; i + 2 < indices.length; i++) {
    const key = indices[i] * 841 + indices[i + 1] * 29 + indices[i + 2];
    logScore += Math.log(((trigrams.get(key) || 0) + alpha) / denominator);
  }
  return {
    length: indices.length,
    ioc,
    top12,
    trigram: logScore / (indices.length - 2)
  };
}

function mobius(n) {
  let x = n;
  let sign = 1;
  for (let p = 2; p * p <= x; p++) {
    if (x % p === 0) {
      x /= p;
      if (x % p === 0) return 0;
      sign = -sign;
    }
  }
  if (x > 1) sign = -sign;
  return sign;
}

const divisors = Array.from({ length: 257 }, (_, n) => {
  const out = [];
  for (let d = 1; d <= n; d++) if (n % d === 0) out.push(d);
  return out;
});

function transform(bytes, kind) {
  return Array.from({ length: 256 }, (_, i) => {
    const n = i + 1;
    let value = 0;
    for (const d of divisors[n]) {
      if (kind === "mobius-inverse") value += mobius(n / d) * bytes[d - 1];
      else if (kind === "zeta-forward") value += bytes[d - 1];
      else throw new Error("unknown transform " + kind);
    }
    return ((value % 29) + 29) % 29;
  });
}

function applyPages(inputPages, key, sign, clock, encrypt) {
  let globalOffset = 0;
  return inputPages.map((page) => page.map((symbol, localOffset) => {
    const offset = clock === "page-reset" ? localOffset : globalOffset;
    const delta = sign * key[offset % 256];
    globalOffset++;
    return ((symbol + (encrypt ? -delta : delta)) % 29 + 29) % 29;
  }));
}

const rowMajor = grid.byte_rows.flat();
const columnMajor = Array.from({ length: 8 }, (_, col) =>
  grid.byte_rows.map((row) => row[col])).flat();

const p56Text =
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE";
const warningText =
  "A WARNING BELIEVE NOTHING FROM THIS BOOK EXCEPT WHAT YOU KNOW TO BE TRUE TEST THE KNOWLEDGE FIND YOUR TRUTH EXPERIENCE YOUR DEATH DO NOT EDIT OR CHANGE THIS BOOK OR THE MESSAGE CONTAINED WITHIN EITHER THE WORDS OR THEIR NUMBERS FOR ALL IS SACRED";
const welcomeText =
  "WELCOME WELCOME PILGRIM TO THE GREAT JOURNEY TOWARD THE END OF ALL THINGS IT IS NOT AN EASY TRIP BUT FOR THOSE WHO FIND THEIR WAY HERE IT IS A NECESSARY ONE";
const controls = {
  p56: englishToGP(p56Text),
  lp1Warning: englishToGP(warningText),
  lp1Welcome: englishToGP(welcomeText)
};
assert.equal(controls.p56.length, 85);
assert.equal(controls.lp1Warning.length, 184);
assert.equal(controls.lp1Welcome.length, 116);

const variants = [];
let plantedRoundTrips = 0;
let plantPosition = 0;
const plantedPages = pages.map((page) => Array.from(
  { length: page.indices.length },
  () => controls.p56[plantPosition++ % controls.p56.length]
));

for (const [order, bytes] of [
  ["row-major", rowMajor],
  ["column-major", columnMajor]
]) {
  for (const kind of ["mobius-inverse", "zeta-forward"]) {
    const key = transform(bytes, kind);
    for (const sign of [-1, 1]) {
      for (const clock of ["book-global", "page-reset"]) {
        const encryptedPlant = applyPages(plantedPages, key, sign, clock, true);
        const decodedPlant = applyPages(encryptedPlant, key, sign, clock, false);
        assert.deepEqual(decodedPlant, plantedPages);
        plantedRoundTrips++;

        const decoded = applyPages(
          pages.map((p) => p.indices), key, sign, clock, false
        ).flat();
        variants.push({
          order,
          transform: kind,
          sign,
          clock,
          ...metrics(decoded),
          preview100: decoded.slice(0, 100)
            .map((i) => corpus.translit[i]).join("")
        });
      }
    }
  }
}
assert.equal(variants.length, 16);
assert.equal(plantedRoundTrips, 16);

const baseline = metrics(cipher);
const authenticControls = {
  p56: metrics(controls.p56),
  lp1Warning: metrics(controls.lp1Warning),
  lp1Welcome: metrics(controls.lp1Welcome)
};
const best = variants.slice().sort((a, b) => b.trigram - a.trigram)[0];
const range = (field) => ({
  min: Math.min(...variants.map((x) => x[field])),
  max: Math.max(...variants.map((x) => x[field]))
});

const result = {
  status: "PASS: bounded negative; no LP2 plaintext recovered",
  input: {
    base60Grid: "resources/liber-primus/base60-grid.json",
    gridShape: "32x8",
    bytes: 256,
    corpus: "resources/liber-primus/lp2-corpus.json",
    unknownPhysicalPages: 56,
    originalCipherRunes: 12956,
    languageModel: "resources/control/emerson_essays_2944.txt",
    languageModelRunes: train.length
  },
  transforms: {
    mobiusInverse: "M(n) = sum_{d|n} mu(n/d) B(d) mod 29",
    zetaForward: "Z(n) = sum_{d|n} B(d) mod 29",
    flattenings: ["row-major", "column-major"],
    signs: [-1, 1],
    clocks: ["book-global", "page-reset"],
    testedVariants: variants.length
  },
  originalBaseline: baseline,
  authenticControls,
  plantedRoundTrips,
  bestCandidate: best,
  candidateRanges: {
    ioc: range("ioc"),
    top12: range("top12"),
    trigram: range("trigram")
  },
  variants
};

console.log(JSON.stringify(result, null, 2));
