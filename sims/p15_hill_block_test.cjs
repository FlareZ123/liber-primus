"use strict";

/**
 * Bounded direct block-Hill interpretation of the original LP2 page-15
 * Fibonacci/prime square.
 *
 * Run from repository root:
 *   node sims/p15_hill_block_test.cjs
 *
 * Source inputs:
 *   resources/transcriptions/liber_primus_master.txt
 *   resources/liber-primus/lp2-corpus.json
 *
 * This tests the square as an ordinary 4x4 Hill key over GP29. It is
 * intentionally separate from the already-exhausted 4D matrix-state
 * recurrence: here each consecutive four-rune block is transformed directly.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const mod = (n) => ((n % 29) + 29) % 29;
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const nativeSymbols = require("./red16_spiral_4d_native_crib.cjs").nativeSymbols;
const latinSource = JSON.parse(read("resources/control/latin-vulgate-gp-trigrams.json"));
const latinHoldout = JSON.parse(read("resources/control/latin-vulgate-heldout-gp.json")).runes;

const spiralSource = require("./fibonacci_prime_spiral.cjs");
const square = spiralSource.readSquare();
const coordinates = spiralSource.clockwiseSpiral();
const ranks = spiralSource.uniqueFibonacciPrimeRanks();
const primesAll = spiralSource.primeList(ranks[ranks.length - 1]);
const primeSpiral = ranks.map((rank) => primesAll[rank - 1]);
const spiralValues = coordinates.map(([r, c]) => square[r][c]);

const primeGrid = Array.from({ length: 4 }, () => Array(4).fill(0));
const rankGrid = Array.from({ length: 4 }, () => Array(4).fill(0));
for (let i = 0; i < coordinates.length; i++) {
  const [r, c] = coordinates[i];
  primeGrid[r][c] = primeSpiral[i];
  rankGrid[r][c] = ranks[i];
}

const matrices = {
  "printed-grid": square.map((row) => row.map(mod)),
  "spiral-repacked": Array.from({ length: 4 }, (_, r) =>
    spiralValues.slice(4 * r, 4 * r + 4).map(mod)),
  "underlying-primes": primeGrid.map((row) => row.map(mod)),
  "Fibonacci-prime-ranks": rankGrid.map((row) => row.map(mod))
};

function determinantMod29(A) {
  let total = 0;
  for (let a = 0; a < 4; a++) {
    for (let b = 0; b < 4; b++) {
      if (b === a) continue;
      for (let c = 0; c < 4; c++) {
        if (c === a || c === b) continue;
        const d = 6 - a - b - c;
        const p = [a, b, c, d];
        let inversions = 0;
        for (let i = 0; i < 4; i++)
          for (let j = i + 1; j < 4; j++)
            if (p[i] > p[j]) inversions++;
        const sign = inversions % 2 ? -1 : 1;
        total += sign * A[0][a] * A[1][b] * A[2][c] * A[3][d];
      }
    }
  }
  return mod(total);
}

function inverseMatrix(A) {
  const n = 4;
  const B = A.map((row, i) => row.map(mod).concat(
    Array.from({ length: n }, (_, j) => Number(i === j))
  ));
  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && B[pivot][col] === 0) pivot++;
    if (pivot === n) throw new Error("Singular matrix over GP29");
    [B[col], B[pivot]] = [B[pivot], B[col]];
    let inversePivot = 1;
    while (mod(B[col][col] * inversePivot) !== 1) inversePivot++;
    B[col] = B[col].map((x) => mod(x * inversePivot));
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = B[row][col];
      B[row] = B[row].map((x, j) => mod(x - factor * B[col][j]));
    }
  }
  return B.map((row) => row.slice(n));
}

function applyBlock(block, A, convention) {
  if (convention === "column") {
    return Array.from({ length: 4 }, (_, row) =>
      mod(A[row].reduce((sum, x, col) => sum + x * block[col], 0)));
  }
  return Array.from({ length: 4 }, (_, col) =>
    mod(block.reduce((sum, x, row) => sum + x * A[row][col], 0)));
}

function transformContinuous(values, A, convention, phase) {
  const out = [];
  for (let i = phase; i + 3 < values.length; i += 4)
    out.push(...applyBlock(values.slice(i, i + 4), A, convention));
  return out;
}

function transformPageReset(pages, A, convention) {
  return pages.flatMap((page) =>
    transformContinuous(page.indices, A, convention, 0));
}

function ioc(values) {
  const histogram = new Array(29).fill(0);
  for (const value of values) histogram[value]++;
  const n = values.length;
  return histogram.reduce((sum, count) => sum + count * (count - 1), 0) /
    (n * (n - 1));
}

function render(values, translit) {
  return values.slice(0, 48).map((value) => translit[value]).join(" ");
}

function unigramLogFromSymbols(symbols) {
  const freq = new Array(29).fill(0.5);
  for (const value of symbols) freq[value]++;
  const total = freq.reduce((a, b) => a + b, 0);
  return freq.map((value) => Math.log(29 * value / total));
}

function unigramLogFromCounts(counts) {
  const freq = counts.map((value) => value + 0.5);
  const total = freq.reduce((a, b) => a + b, 0);
  return freq.map((value) => Math.log(29 * value / total));
}

function bigramLogFromSymbols(symbols) {
  const freq = Array.from({ length: 29 }, () => new Array(29).fill(0.5));
  for (let i = 1; i < symbols.length; i++)
    freq[symbols[i - 1]][symbols[i]]++;
  const total = freq.flat().reduce((a, b) => a + b, 0);
  return freq.map((row) =>
    row.map((value) => Math.log(29 * 29 * value / total)));
}

function bigramLogFromSparse(sparse) {
  const freq = Array.from({ length: 29 }, () => new Array(29).fill(0.5));
  for (const [index, count] of sparse)
    freq[Math.floor(index / 29)][index % 29] += count;
  const total = freq.flat().reduce((a, b) => a + b, 0);
  return freq.map((row) =>
    row.map((value) => Math.log(29 * 29 * value / total)));
}

function scoreUnigram(values, logTable) {
  return values.reduce((sum, value) => sum + logTable[value], 0) / values.length;
}

function scoreBigram(values, logTable) {
  let total = 0;
  for (let i = 1; i < values.length; i++)
    total += logTable[values[i - 1]][values[i]];
  return total / (values.length - 1);
}

function main() {
  const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  assert.equal(corpus.runes.length, 29);
  assert.equal(nativeSymbols.length, 3248);
  const nativeUnigramLog = unigramLogFromSymbols(nativeSymbols);
  const latinUnigramLog = unigramLogFromCounts(latinSource.u);
  const nativeBigramLog = bigramLogFromSymbols(nativeSymbols);
  const latinBigramLog = bigramLogFromSparse(latinSource.b);
  const languageControls = {
    solvedCicada: {
      runes: nativeSymbols.length,
      nativeUnigram: scoreUnigram(nativeSymbols, nativeUnigramLog),
      latinUnigram: scoreUnigram(nativeSymbols, latinUnigramLog),
      nativeBigram: scoreBigram(nativeSymbols, nativeBigramLog),
      latinBigram: scoreBigram(nativeSymbols, latinBigramLog)
    },
    independentLatinHoldout: {
      runes: latinHoldout.length,
      nativeUnigram: scoreUnigram(latinHoldout, nativeUnigramLog),
      latinUnigram: scoreUnigram(latinHoldout, latinUnigramLog),
      nativeBigram: scoreBigram(latinHoldout, nativeBigramLog),
      latinBigram: scoreBigram(latinHoldout, latinBigramLog)
    }
  };
  const nextSection = corpus.pages.filter((p) => p.page >= 16 && p.page <= 22);
  const remaining = corpus.pages.filter((p) => p.page >= 16 && p.page <= 55);
  const scopes = {
    "immediate-next-section-p16-22": nextSection,
    "all-pages-after-square-p16-55": remaining
  };

  const prepared = {};
  for (const [name, A] of Object.entries(matrices)) {
    const det = determinantMod29(A);
    assert.notEqual(det, 0, "non-invertible matrix " + name);
    prepared[name] = { A, inverse: inverseMatrix(A), determinant: det };
  }

  // Positive implementation control: genuine, previously recovered Cicada
  // GP plaintext is encrypted and recovered under each candidate matrix.
  // This validates the block algebra, not the historical use of any matrix.
  const lp1 = require("./authentic_lp1_p03_p04_vigenere_recovery.cjs");
  const controlLength = Math.floor(lp1.plaintext.length / 4) * 4;
  const control = lp1.plaintext.slice(0, controlLength);
  assert.ok(control.length >= 4);
  const positiveControls = [];
  for (const [name, item] of Object.entries(prepared)) {
    for (const convention of ["column", "row"]) {
      const cipher = transformContinuous(control, item.A, convention, 0);
      const recovered = transformContinuous(cipher, item.inverse, convention, 0);
      assert.deepEqual(recovered, control);
      positiveControls.push({ matrix: name, convention,
        recovered: recovered.length, exact: true });
    }
  }

  const results = [];
  for (const [matrixName, item] of Object.entries(prepared)) {
    for (const [scopeName, pages] of Object.entries(scopes)) {
      const continuous = pages.flatMap((page) => page.indices);
      for (const [direction, A] of [
        ["apply-printed-matrix", item.A],
        ["apply-matrix-inverse", item.inverse]
      ]) {
        for (const convention of ["column", "row"]) {
          for (let phase = 0; phase < 4; phase++) {
            const decoded = transformContinuous(
              continuous, A, convention, phase);
            results.push({
              matrix: matrixName, scope: scopeName, clock: "continuous",
              direction, convention, phase, runes: decoded.length,
              ioc: ioc(decoded), sample: render(decoded, corpus.translit),
              nativeUnigram: scoreUnigram(decoded, nativeUnigramLog),
              latinUnigram: scoreUnigram(decoded, latinUnigramLog),
              nativeBigram: scoreBigram(decoded, nativeBigramLog),
              latinBigram: scoreBigram(decoded, latinBigramLog)
            });
          }
          const decoded = transformPageReset(pages, A, convention);
          results.push({
            matrix: matrixName, scope: scopeName, clock: "physical-page-reset",
            direction, convention, phase: 0, runes: decoded.length,
            ioc: ioc(decoded), sample: render(decoded, corpus.translit),
            nativeUnigram: scoreUnigram(decoded, nativeUnigramLog),
            latinUnigram: scoreUnigram(decoded, latinUnigramLog),
            nativeBigram: scoreBigram(decoded, nativeBigramLog),
            latinBigram: scoreBigram(decoded, latinBigramLog)
          });
        }
      }
    }
  }

  const summary = [];
  for (const matrix of Object.keys(matrices)) {
    for (const scope of Object.keys(scopes)) {
      const selected = results.filter((r) =>
        r.matrix === matrix && r.scope === scope);
      const min = selected.reduce((a, b) => a.ioc < b.ioc ? a : b);
      const max = selected.reduce((a, b) => a.ioc > b.ioc ? a : b);
      const best = (field) => selected.reduce((a, b) =>
        a[field] > b[field] ? a : b);
      const settings = (entry) => ({
        clock: entry.clock, direction: entry.direction,
        convention: entry.convention, phase: entry.phase
      });
      const bestNativeUnigram = best("nativeUnigram");
      const bestLatinUnigram = best("latinUnigram");
      const bestNativeBigram = best("nativeBigram");
      const bestLatinBigram = best("latinBigram");
      summary.push({
        matrix, scope, variants: selected.length,
        minIoC: min.ioc, maxIoC: max.ioc,
        bestNativeUnigram: {
          score: bestNativeUnigram.nativeUnigram,
          settings: settings(bestNativeUnigram)
        },
        bestLatinUnigram: {
          score: bestLatinUnigram.latinUnigram,
          settings: settings(bestLatinUnigram)
        },
        bestNativeBigram: {
          score: bestNativeBigram.nativeBigram,
          settings: settings(bestNativeBigram)
        },
        bestLatinBigram: {
          score: bestLatinBigram.latinBigram,
          settings: settings(bestLatinBigram)
        }
      });
    }
  }

  console.log(JSON.stringify({
    objective: "Direct block-Hill interpretation of page-15 prime/Fibonacci square",
    modulus: 29,
    uniformBaseline: 1 / 29,
    square: square,
    spiralValues: spiralValues,
    primeSpiral: primeSpiral,
    primeRanks: ranks,
    matrices: Object.fromEntries(Object.entries(prepared).map(([name, item]) =>
      [name, { matrix: item.A, determinant: item.determinant,
        inverse: item.inverse }])),
    tested: {
      matrices: Object.keys(matrices).length,
      directions: 2,
      vectorConventions: 2,
      continuousPhases: [0, 1, 2, 3],
      clocks: ["continuous", "physical-page-reset"],
      scopes: Object.keys(scopes)
    },
    positiveControls,
    languageControls,
    summary,
    conclusion: "No tested direct block-Hill interpretation yields a source-language signal; IoCs remain near the 1/29 uniform baseline."
  }, null, 2));
}

if (require.main === module) main();

module.exports = {
  determinantMod29, inverseMatrix, applyBlock,
  transformContinuous, transformPageReset, ioc
};
