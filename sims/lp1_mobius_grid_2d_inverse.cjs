"use strict";
/**
 * Source-motivated two-dimensional Möbius/zeta inversion of the LP2 32x8
 * base60 table.
 *
 * The LP1 p05 grid contains the literal MOBIUS token; p16 explicitly names
 * prime/totient arithmetic. The LP2 byte table is physically a 32x8 matrix.
 * This tests the natural product-divisor-lattice extension of the existing
 * 1D Dirichlet transform:
 *
 *   M(r,c) = sum_{a|r,b|c} mu(r/a) mu(c/b) B(a,b)
 *   Z(r,c) = sum_{a|r,b|c} B(a,b)
 *
 * Both outputs are reduced mod 29 and used as a periodic additive GP29 key.
 * Fixed variants: both transforms, row/column-major flattening, both signs,
 * and book-global/page-reset clocks (16 configurations). No phase fitting,
 * arbitrary permutations, or ciphertext-selected parameters.
 *
 * Run from the repository root with Node.js 22:
 *   node sims/lp1_mobius_grid_2d_inverse.cjs
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
const cipherPages = pages.map((p) => p.indices);
const cipher = cipherPages.flat();
assert.equal(pages.length, 56);
assert.equal(cipher.length, 12956);
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every((row) => row.length === 8));
assert.equal(grid.byte_rows.flat().length, 256);
assert.ok(grid.byte_rows.flat().every((x) =>
  Number.isInteger(x) && x >= 0 && x <= 255
));

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

function divisors(n) {
  const out = [];
  for (let d = 1; d <= n; d++) if (n % d === 0) out.push(d);
  return out;
}

const rowDivisors = Array.from({ length: 33 }, (_, n) => divisors(n || 1));
const colDivisors = Array.from({ length: 9 }, (_, n) => divisors(n || 1));

function transform2D(kind) {
  return Array.from({ length: 32 }, (_, rowIndex) =>
    Array.from({ length: 8 }, (_, colIndex) => {
      const r = rowIndex + 1;
      const c = colIndex + 1;
      let value = 0;
      for (const a of rowDivisors[r]) {
        for (const b of colDivisors[c]) {
          const weight = kind === "mobius-inverse"
            ? mobius(r / a) * mobius(c / b)
            : 1;
          value += weight * grid.byte_rows[a - 1][b - 1];
        }
      }
      return ((value % 29) + 29) % 29;
    })
  );
}

function flatten(matrix, order) {
  if (order === "row-major") return matrix.flat();
  if (order === "column-major") {
    return Array.from({ length: 8 }, (_, col) =>
      matrix.map((row) => row[col])
    ).flat();
  }
  throw new Error("unknown flattening " + order);
}

function applyPages(inputPages, key, sign, clock, encrypt) {
  let globalOffset = 0;
  return inputPages.map((page) => page.map((symbol, localOffset) => {
    const offset = clock === "page-reset" ? localOffset : globalOffset;
    const delta = sign * key[offset % key.length];
    globalOffset++;
    return ((symbol + (encrypt ? delta : -delta)) % 29 + 29) % 29;
  }));
}

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
for (const kind of ["mobius-inverse", "zeta-forward"]) {
  const matrix = transform2D(kind);
  for (const order of ["row-major", "column-major"]) {
    const key = flatten(matrix, order);
    assert.equal(key.length, 256);
    for (const sign of [-1, 1]) {
      for (const clock of ["book-global", "page-reset"]) {
        let plantPosition = 0;
        const plantedPages = pages.map((page) => Array.from(
          { length: page.indices.length },
          () => controls.p56[plantPosition++ % controls.p56.length]
        ));
        const encryptedPlant = applyPages(
          plantedPages, key, sign, clock, true
        );
        const decodedPlant = applyPages(
          encryptedPlant, key, sign, clock, false
        );
        assert.deepEqual(decodedPlant, plantedPages);
        plantedRoundTrips++;

        const decoded = applyPages(
          cipherPages, key, sign, clock, false
        ).flat();
        variants.push({
          transform: kind,
          flattening: order,
          sign,
          clock,
          ...metrics(decoded),
          preview80: decoded.slice(0, 80)
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

console.log(JSON.stringify({
  status: "PASS: bounded negative; no LP2 plaintext recovered",
  input: {
    grid: "resources/liber-primus/base60-grid.json",
    shape: "32x8",
    bytes: 256,
    corpus: "resources/liber-primus/lp2-corpus.json",
    pages: pages.length,
    originalCipherRunes: cipher.length,
    languageModel: "resources/control/emerson_essays_2944.txt",
    languageModelRunes: train.length
  },
  transforms: {
    mobiusInverse:
      "M(r,c) = sum_{a|r,b|c} mu(r/a) mu(c/b) B(a,b) mod 29",
    zetaForward:
      "Z(r,c) = sum_{a|r,b|c} B(a,b) mod 29",
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
}, null, 2));
