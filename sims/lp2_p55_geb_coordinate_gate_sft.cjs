"use strict";

/**
 * Single-file test of source-fixed 2014 GEB-coordinate interpretations
 * of the 43 p55 interior runes, including a p57-motivated p05 inner-3x3 Hill candidate.
 * @returns {void}
 */
function main() {
  const assert = require("node:assert/strict");
  const fs = require("node:fs");
  const path = require("node:path");
  const base = path.join(__dirname, "..", "resources", "liber-primus");
  const corpus = JSON.parse(fs.readFileSync(path.join(base, "lp2-corpus.json"), "utf8"));
  const transcript = fs.readFileSync(path.join(base, "lp2-transcription.txt"), "utf8");
  const pages = transcript.split(/\r?\n%\r?\n/);
  assert.equal(pages.length, 57, "LP2 transcription has 57 rune-bearing/source pages");
  const section = pages.at(-3).split(/\r?\n[&$]/)[0];
  const alphabet = new Set(corpus.runes);
  const words = section.replace(/[\n/.]/g, "").split("-")
    .filter(Boolean).map(w => [...w].filter(g => alphabet.has(g)));
  const glyphs = words.flat();
  const source = corpus.pages.find(p => p.page === 55).indices;
  assert.deepEqual(glyphs.map(g => corpus.runes.indexOf(g)), source);
  assert.equal(glyphs.length, 76);
  assert.equal(words.length, 17);
  assert.deepEqual(words.map(w => w.length),
    [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
  const inner = words.flatMap(w => w.slice(1, -1)).map(g => corpus.runes.indexOf(g));
  const outer = words.flatMap(w => w.length === 1 ? [w[0]] : [w[0], w.at(-1)]);
  assert.equal(inner.length, 43);
  assert.equal(outer.length, 33);
  assert.equal(inner[42] + 1, 19);

  // Author-signed 2014 Fifth-Onion GEB code: fourteen numeric triples
  // with chapter-title abbreviations, two literal digits and ONION marker.
  // First-party witness mirrored at neuroretransmit/cicada, pinned commit
  // ade9a02889ef8acbc8cde8edbfd0a785c369f4c3,
  // 2014/007-fifth-onion/README.md.
  const triples = [
    [6, 1, 3], [1, 1, 1], [19, 9, 1], [5, 3, 1],
    [13, 10, 1], [8, 6, 1], [3, 7, 2], [5, 23, 6],
    [1, 8, 1], [4, 5, 3], [6, 2, 1], [2, 17, 5],
    [3, 17, 1], [2, 8, 1],
  ];
  const fields = triples.flat();
  assert.equal(fields.length, 42);

  /** @param {number[]} items @returns {Map<number, number>} */
  function counts(items) {
    const tally = new Map();
    for (const item of items) tally.set(item, (tally.get(item) || 0) + 1);
    return tally;
  }
  const cipherCounts = counts(inner);
  const fieldCounts = counts(fields);
  const maxCipherMultiplicity = Math.max(...cipherCounts.values());
  const repeatedOne = fieldCounts.get(1);
  assert.equal(repeatedOne, 13);
  assert.equal(maxCipherMultiplicity, 4);
  assert.equal(cipherCounts.size, 21);
  assert.equal(fieldCounts.size, 14);
  assert.equal(repeatedOne - maxCipherMultiplicity, 9);


  const mod29 = n => ((n % 29) + 29) % 29;
  const directZero = inner.slice(0, 42)
    .reduce((sum, value, i) => sum + (mod29(value) === mod29(fields[i]) ? 1 : 0), 0);
  const directOne = inner.slice(0, 42)
    .reduce((sum, value, i) => sum + (mod29(value + 1) === mod29(fields[i]) ? 1 : 0), 0);
  assert.equal(directZero, 4);
  assert.equal(directOne, 2);

  // Lossless source-native 43 -> (one anchor, 42 consecutive differences).
  const differences = inner.slice(1).map((value, i) => mod29(value - inner[i]));
  assert.equal(differences.length, fields.length);
  const restored = [inner[0]];
  for (const difference of differences) restored.push(mod29(restored.at(-1) + difference));
  assert.deepEqual(restored, inner);
  const differenceCounts = counts(differences);
  assert.equal(differenceCounts.size, 24);
  assert.equal(Math.max(...differenceCounts.values()), 4);
  const differentialVariants = [
    ["forward-zero", differences],
    ["forward-one", differences.map(v => v + 1)],
    ["reverse-zero", differences.map(v => mod29(-v))],
    ["reverse-one", differences.map(v => mod29(-v) + 1)],
  ].map(([name, values]) => ({
    name,
    matches: values.filter((value, i) => value === fields[i]).length,
    triples: triples.filter((triple, i) =>
      triple.every((value, j) => values[3 * i + j] === value)).length,
  }));
  assert.deepEqual(differentialVariants.map(v => v.matches), [0, 1, 0, 1]);
  assert.deepEqual(differentialVariants.map(v => v.triples), [0, 0, 0, 0]);

  /** @param {number} n @returns {number} */
  function phi(n) {
    let result = n;
    let remaining = n;
    for (let p = 2; p * p <= remaining; p++) {
      if (remaining % p === 0) {
        while (remaining % p === 0) remaining /= p;
        result -= result / p;
      }
    }
    if (remaining > 1) result -= result / remaining;
    return result;
  }

  /** @param {number} a @returns {number} */
  function inverseMod29(a) {
    for (let x = 1; x < 29; x++) if (mod29(a * x) === 1) return x;
    throw new Error("non-invertible pivot modulo 29: " + a);
  }

  /** @param {number[][]} matrix @returns {number[][]} */
  function inverseMatrix(matrix) {
    const n = 3;
    const a = matrix.map((row, i) => [
      ...row.map(mod29),
      ...Array.from({ length: n }, (_, j) => i === j ? 1 : 0),
    ]);
    for (let col = 0; col < n; col++) {
      let pivot = col;
      while (pivot < n && mod29(a[pivot][col]) === 0) pivot++;
      assert.ok(pivot < n, "matrix must be invertible modulo 29");
      [a[col], a[pivot]] = [a[pivot], a[col]];
      const scale = inverseMod29(a[col][col]);
      a[col] = a[col].map(v => mod29(v * scale));
      for (let row = 0; row < n; row++) {
        if (row === col) continue;
        const factor = a[row][col];
        a[row] = a[row].map((v, j) => mod29(v - factor * a[col][j]));
      }
    }
    return a.map(row => row.slice(n));
  }

  /** @param {number[][]} a @param {number[][]} b @returns {number[][]} */
  function multiplyMatrices(a, b) {
    return a.map(row => b[0].map((_, col) =>
      mod29(row.reduce((sum, value, k) => sum + value * b[k][col], 0))));
  }

  /** @param {number[][]} matrix @param {number[]} vector @returns {number[]} */
  function multiplyVector(matrix, vector) {
    return matrix.map(row =>
      mod29(row.reduce((sum, value, k) => sum + value * vector[k], 0)));
  }

  /** @param {number[][]} matrix @returns {number} */
  function determinant3(matrix) {
    const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
    return mod29(a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g));
  }

  // Original 2014 LP1 p05 Wisdom 5x5 square. The p57 "shed circumferences"
  // wording motivates testing the central 3x3, but does not authenticate a Hill use.
  const wisdom = [
    [272, 138, 341, 131, 151],
    [366, 199, 130, 320, 18],
    [226, 245, 91, 245, 226],
    [18, 320, 130, 199, 366],
    [151, 131, 341, 138, 272],
  ];
  const core = wisdom.slice(1, 4).map(row => row.slice(1, 4));
  const coreMod = core.map(row => row.map(mod29));
  const phiCoreMod = core.map(row => row.map(value => mod29(phi(value))));
  const coreInverse = inverseMatrix(coreMod);
  const phiCoreInverse = inverseMatrix(phiCoreMod);
  assert.deepEqual(coreMod, [[25, 14, 1], [13, 4, 13], [1, 14, 25]]);
  assert.deepEqual(coreInverse, [[28, 15, 5], [16, 26, 16], [5, 15, 28]]);
  assert.deepEqual(phiCoreMod, [[24, 19, 12], [23, 14, 23], [12, 19, 24]]);
  assert.deepEqual(phiCoreInverse, [[24, 18, 7], [5, 1, 5], [7, 18, 24]]);
  assert.equal(determinant3(coreMod), 24);
  assert.equal(determinant3(phiCoreMod), 26);
  assert.deepEqual(multiplyMatrices(coreMod, coreInverse),
    [[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
  assert.deepEqual(multiplyMatrices(phiCoreMod, phiCoreInverse),
    [[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
  assert.deepEqual(coreMod, coreMod.map((_, i) => coreMod.map(row => row[i])));

  const matrixVariants = [];
  const matrices = [
    ["core", coreMod],
    ["core-inverse", coreInverse],
    ["phi-core", phiCoreMod],
    ["phi-core-inverse", phiCoreInverse],
  ];
  for (const [name, matrix] of matrices) {
    for (const inputOffset of [0, 1]) {
      for (const outputOffset of [0, 1]) {
        const output = [];
        for (let record = 0; record < 14; record++) {
          const input = inner.slice(3 * record, 3 * record + 3)
            .map(value => mod29(value + inputOffset));
          output.push(...multiplyVector(matrix, input)
            .map(value => mod29(value + outputOffset)));
        }
        const matches = output.reduce((sum, value, i) =>
          sum + (mod29(value) === mod29(fields[i]) ? 1 : 0), 0);
        const exactTriples = Array.from({ length: 14 }, (_, i) =>
          output.slice(3 * i, 3 * i + 3)
            .every((value, j) => mod29(value) === mod29(fields[3 * i + j])))
          .filter(Boolean).length;
        matrixVariants.push({ name, inputOffset, outputOffset, matches, exactTriples });
      }
    }
  }
  const bestMatches = Math.max(...matrixVariants.map(v => v.matches));
  const bestExactTriples = Math.max(...matrixVariants.map(v => v.exactTriples));
  assert.equal(matrixVariants.length, 16);
  assert.equal(bestMatches, 5);
  assert.equal(bestExactTriples, 0);

  // Synthetic positive: a planted affine GP29 encoder maps all 42 fields.
  const planted = fields.map(v => (5 * v + 7) % 29);
  const decoded = planted.map(v => (((v - 7) * 6) % 29 + 29) % 29);
  assert.deepEqual(decoded, fields);
  assert.equal(Math.max(...counts(planted).values()), 13);
  const hillPlant = triples.map(t => multiplyVector(coreMod, t));
  const hillRecovered = hillPlant.flatMap(t => multiplyVector(coreInverse, t));
  assert.deepEqual(hillRecovered, triples.flat());

  console.log("ORIGINAL p55: 76 runes / 17 words / 43 interiors / 33 exteriors");
  console.log("Original p55 interior indices:", inner.join(","));
  console.log("First-party 2014 GEB: 14 records / 42 fields / 14 values");
  console.log("Numeric coordinate 1 multiplicity:", repeatedOne);
  console.log("Maximum original interior rune multiplicity:", maxCipherMultiplicity);
  console.log("DIRECT STATIONARY ONE-RUNE CODE REJECTED:",
    "at least 9 conflicts independently of permutation, reversal, one marker.");
  console.log("Direct coordinate field matches (zero/one origin):", directZero, directOne);
  console.log("Lossless p55 inner43 -> anchor+42 differences: 43/43 exact recovered.");
  console.log("Maximum original difference multiplicity:", Math.max(...differenceCounts.values()));
  console.log("Source-ordered difference-to-GEB variants:", JSON.stringify(differentialVariants));
  console.log("p05 inner core mod29:", JSON.stringify(coreMod), "inverse:", JSON.stringify(coreInverse), "det:", determinant3(coreMod));
  console.log("phi(core) mod29:", JSON.stringify(phiCoreMod), "inverse:", JSON.stringify(phiCoreInverse), "det:", determinant3(phiCoreMod));
  console.log("Inner-core Hill variants:", JSON.stringify(matrixVariants));
  console.log("BEST INNER-CORE HILL RESULT:", bestMatches + "/42 fields;", bestExactTriples + "/14 complete triples.");
  console.log("SYNTHETIC POSITIVES PASS: affine 42/42; Hill round-trip 42/42.");
  console.log("Other stateful, homophonic or exterior-keyed models remain untested.");
}
main();
