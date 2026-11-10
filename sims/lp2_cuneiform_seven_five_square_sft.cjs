"use strict";
/**
 * Seven original LP2 cuneiform pages + five original numbered clauses:
 * test an independently frozen row-per-page GP29 additive schedule from
 * the historical 2014 OpenPuff 7x7/1033 and 5x5/3301 magic squares.
 * This is a bounded direct-key experiment, not a verified LP2 cipher.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const squares = read("resources/cicada2014-openpuff-magic-squares.txt")
  .trim().split(/\r?\n\s*\r?\n/u)
  .map((body) => body.trim().split(/\r?\n/u)
    .map((row) => row.trim().split(/\s+/u).map(Number)));
const [five, seven] = squares;
const alphabet = new Map(corpus.runes.map((r, i) => [r, i]));
const transcript = read("resources/liber-primus/lp2-transcription.txt");
const numbered = transcript.split("%").slice(36, 39).join("%");
const labels = [...numbered.matchAll(/[1-5]-/gu)];
assert.deepEqual(labels.map((x) => Number(x[0][0])), [1, 2, 3, 4, 5]);
const passages = labels.map((label, i) => {
  const end = i < 4 ? labels[i + 1].index : numbered.indexOf("&", label.index);
  assert.ok(end > label.index);
  return [...numbered.slice(label.index + 2, end)]
    .filter((r) => alphabet.has(r)).map((r) => alphabet.get(r));
});
const itemStarts = [8805, 8944, 9035, 9133, 9229, 9358];

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

function main() {
  assert.deepEqual(squares.map((rows) => rows.length), [5, 7, 5]);
  for (const row of five) assert.equal(row.reduce((a, b) => a + b), 3301);
  for (const row of seven) assert.equal(row.reduce((a, b) => a + b), 1033);
  assert.deepEqual(passages.map((p) => p.length), [139, 91, 98, 96, 129]);
  const cipher = corpus.pages.filter((p) => p.page < 56).flatMap((p) => p.indices);
  assert.equal(cipher.length, 12956);
  assert.deepEqual(passages.flat(), cipher.slice(itemStarts[0], itemStarts[5]));
  const original = [];
  const sevenKeys = [];
  const fiveKeys = [];
  let global = cipher.slice(0, 0).length;
  for (const page of corpus.pages.filter((p) => p.page < 56)) {
    if (page.page > 39) break;
    for (let i = page.page === 33 ? 91 : 0; i < page.indices.length; i++) {
      if (page.page < 33) break;
      const runePosition = global + i;
      const key7 = seven[page.page - 33][i % 7] % 29;
      let key5 = 0;
      for (let k = 0; k < 5; k++) {
        if (runePosition >= itemStarts[k] && runePosition < itemStarts[k + 1]) {
          key5 = five[k][(runePosition - itemStarts[k]) % 5] % 29;
          break;
        }
      }
      original.push(page.indices[i]);
      sevenKeys.push(key7);
      fiveKeys.push(key5);
    }
    global += page.indices.length;
  }
  assert.equal(original.length, 1589);
  assert.equal(sevenKeys.length, 1589);
  assert.equal(fiveKeys.filter((x) => x !== 0).length > 450, true);

  const decrypt = (which) => original.map((c, i) =>
    (c - ((which === "seven" ? sevenKeys[i] : 0) +
          (which === "five" ? fiveKeys[i] : 0) +
          (which === "both" ? sevenKeys[i] + fiveKeys[i] : 0)) % 29 + 29) % 29);
  const full = decrypt("both");
  const syntheticSource = corpus.pages.find((p) => p.page === 56).indices;
  let prime = 2, j = 0;
  const firstPrimes = [];
  while (firstPrimes.length < 85) {
    let valid = true;
    for (let factor = 2; factor * factor <= prime; factor++) {
      if (prime % factor === 0) { valid = false; break; }
    }
    if (valid) firstPrimes.push(prime);
    prime++;
  }
  const sourcePlain = syntheticSource.map((c, i) => i === 56
    ? c : (c - ((firstPrimes[j++] - 1) % 29) + 29) % 29);
  assert.ok(ioc(sourcePlain) > 0.06);
  const synthetic = original.map((_, i) => sourcePlain[i % sourcePlain.length]);
  const seeded = synthetic.map((p, i) => (p + sevenKeys[i] + fiveKeys[i]) % 29);
  assert.deepEqual(seeded.map((c, i) =>
    (c - (sevenKeys[i] + fiveKeys[i]) % 29 + 29) % 29), synthetic);
  assert.deepEqual(full.map((p, i) =>
    (p + sevenKeys[i] + fiveKeys[i]) % 29), original);
  // Distinct, cross-page 7x7 Hill hypothesis. Align the first 123 source
  // runes of each of the seven physical pages, then apply the exact
  // historical square as the simultaneous seven-lane GP29 cipher matrix.
  // Unequal source page lengths mean this tests only the fully populated
  // 123-column rectangle, without inventing a padding/continuation rule.
  const mod = (v) => ((v % 29) + 29) % 29;
  const n = 7;
  const aug = seven.map((row, i) => row.map(mod)
    .concat(Array.from({ length: n }, (_, j) => Number(i === j))));
  for (let col = 0; col < n; col++) {
    const pivot = aug.findIndex((row, i) => i >= col && row[col] !== 0);
    assert.ok(pivot >= col, "Historical 7x7 square must invert modulo29");
    [aug[pivot], aug[col]] = [aug[col], aug[pivot]];
    let inversePivot = 1;
    while (mod(aug[col][col] * inversePivot) !== 1) inversePivot++;
    for (let k = 0; k < 2 * n; k++) aug[col][k] = mod(aug[col][k] * inversePivot);
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = aug[row][col];
      for (let k = 0; k < 2 * n; k++)
        aug[row][k] = mod(aug[row][k] - factor * aug[col][k]);
    }
  }
  const inv = aug.map((row) => row.slice(n));
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const product = mod(seven[i].reduce((sum, v, k) => sum + v * inv[k][j], 0));
    assert.equal(product, Number(i === j), "Inverse identity failed");
  }
  const pageStreams = corpus.pages.filter((p) => p.page >= 33 && p.page <= 39)
    .map((p) => p.indices.slice(p.page === 33 ? 91 : 0));
  const sharedWidth = Math.min(...pageStreams.map((p) => p.length));
  assert.equal(sharedWidth, 123);
  /** @param {number[][]} matrix @param {number[][]} columns */
  const transform = (matrix, columns) => matrix.map((row) =>
    Array.from({ length: sharedWidth }, (_, column) =>
      mod(row.reduce((sum, value, k) => sum + value * columns[k][column], 0))));
  const originalHillRows = pageStreams.map((p) => p.slice(0, sharedWidth));
  const candidateHillRows = transform(inv, originalHillRows);
  assert.deepEqual(transform(seven, candidateHillRows), originalHillRows);
  // The same exact inversion reconstructs an authentic solved-Cicada GP
  // sample planted under the true seven-lane matrix.
  const syntheticHillRows = Array.from({ length: 7 }, (_, lane) =>
    Array.from({ length: sharedWidth }, (_, col) =>
      sourcePlain[(lane * sharedWidth + col) % sourcePlain.length]));
  assert.deepEqual(transform(inv, transform(seven, syntheticHillRows)),
    syntheticHillRows);
  const crossPageHill = {
    originalRuneColumns: sharedWidth,
    originalCipherRunes: sharedWidth * 7,
    originalIoC: Number(ioc(originalHillRows.flat()).toFixed(9)),
    candidateIoC: Number(ioc(candidateHillRows.flat()).toFixed(9)),
    recoveredOriginalText: false,
    sourcePageHeaders: candidateHillRows.map((row, index) => ({
      page: 33 + index,
      preview: row.slice(0, 55).map((v) => corpus.translit[v]).join("")
    }))
  };
  assert.ok(crossPageHill.candidateIoC < 0.04);

  const result = {};
  for (const kind of ["original", "seven", "five", "both"]) {
    const decoded = kind === "original" ? original : decrypt(kind);
    result[kind] = {
      runeCount: decoded.length,
      ioc: Number(ioc(decoded).toFixed(9)),
      first100: decoded.slice(0, 100).map((v) => corpus.translit[v]).join("")
    };
  }
  assert.ok(result.both.ioc < 0.035);
  console.log(JSON.stringify({
    classification: "SOURCE-SPECIFIED DIRECT PAGE/ITEM MAGIC-SQUARE ADDITIVE NEGATIVE",
    sourcePageScope: [33, 39],
    unnumberedSourceRemainder: 1036,
    sourceNumberedItemSpan: itemStarts,
    historicalMagicSums: [1033, 3301],
    knownP56PlainIoC: Number(ioc(sourcePlain).toFixed(9)),
    originalSevenLaneHill: crossPageHill,
    results: result,
    claim: "No recovered original plaintext; invertibility/planted recovery are implementation checks."
  }, null, 2));
}
if (require.main === module) main();
module.exports = { main, ioc };
