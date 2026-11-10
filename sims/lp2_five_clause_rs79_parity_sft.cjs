"use strict";
/**
 * Source-constrained RS(7,5) test for five numbered red LP2 paragraphs.
 *
 * Five marked source items have [139,91,98,96,129] runes, all at least 79;
 * their 158 excess runes equal two more 79-symbol lanes. The source suggests
 * checking whether the five labelled streams 1..5 supply degree<=4
 * evaluations over GF29 and the two overflow lanes are evaluations 6,7.
 * Also test the independently mark-bounded contiguous/interleaved 7x79 frame.
 *
 * This is an exact model exclusion with a one-error-correcting positive plant.
 * It does not claim the original was encoded with Reed-Solomon.
 *
 * Reproduce: node sims/lp2_five_clause_rs79_parity_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const mod = (x) => ((x % 29) + 29) % 29;

/** @param {number} a @returns {number} */
function inverse(a) {
  const x = mod(a);
  assert.notEqual(x, 0);
  for (let k = 1; k < 29; k++) if (mod(k * x) === 1) return k;
  throw Error("No inverse in F29");
}
/**
 * Evaluate a polynomial given its values at original red ordinal
 * labels x=1,2,3,4,5, using exact Lagrange interpolation over F29.
 * @param {number} value
 * @returns {number[]}
 */
function weights(value) {
  return Array.from({ length: 5 }, (_, i) => {
    let num = 1, den = 1;
    for (let j = 0; j < 5; j++) {
      if (i === j) continue;
      num = mod(num * (value - (j + 1)));
      den = mod(den * ((i + 1) - (j + 1)));
    }
    return mod(num * inverse(den));
  });
}
const w6 = weights(6), w7 = weights(7);
assert.deepEqual(w6, [1, 24, 10, 19, 5]);
assert.deepEqual(w7, [5, 5, 16, 18, 15]);
assert.equal(mod(w6.reduce((a, b) => a + b)), 1);
assert.equal(mod(w7.reduce((a, b) => a + b)), 1);
// H is the systematic two-check parity matrix of a seven-position RS(7,5).
const H = Array.from({ length: 7 }, (_, k) => k < 5
  ? [mod(-w6[k]), mod(-w7[k])] : k === 5 ? [1, 0] : [0, 1]);

/** @param {number[]} col @returns {number[]} */
function syndrome(col) {
  assert.equal(col.length, 7);
  return [
    mod(col.reduce((sum, x, i) => sum + H[i][0] * x, 0)),
    mod(col.reduce((sum, x, i) => sum + H[i][1] * x, 0))
  ];
}

/**
 * Correct a source Reed-Solomon word with zero or one bad GP29 glyph.
 * Returns null for a syndrome inconsistent with any single glyph error.
 * The true location and magnitude are unknown to the decoder.
 * @param {number[]} col
 * @returns {number[]|null}
 */
function correctOne(col) {
  const [s0, s1] = syndrome(col);
  if (s0 === 0 && s1 === 0) return col.slice();
  for (let location = 0; location < 7; location++) {
    const [h0, h1] = H[location];
    const digit = h0 === 0 ? mod(s1 * inverse(h1)) : mod(s0 * inverse(h0));
    if (!digit) continue;
    if (mod(h0 * digit) !== s0 || mod(h1 * digit) !== s1) continue;
    const repaired = col.slice();
    repaired[location] = mod(repaired[location] - digit);
    assert.deepEqual(syndrome(repaired), [0, 0]);
    return repaired;
  }
  return null;
}
/** @param {number[][]} rows */
function audit(rows) {
  assert.equal(rows.length, 7);
  rows.forEach((row) => assert.equal(row.length, 79));
  let exact = 0, recoverable = 0;
  for (let j = 0; j < 79; j++) {
    const col = rows.map((row) => row[j]);
    if (syndrome(col).every((x) => x === 0)) exact++;
    if (correctOne(col)) recoverable++;
  }
  return { exact, zeroOrOneError: recoverable, moreThanOneError: 79 - recoverable };
}
/** @param {number[][]} data */
function encodeFive(data) {
  assert.equal(data.length, 5);
  data.forEach((row) => assert.equal(row.length, 79));
  const parity = [w6, w7].map((weight) =>
    Array.from({ length: 79 }, (_, j) =>
      mod(data.reduce((sum, row, k) => sum + row[j] * weight[k], 0))));
  return [...data.map((row) => row.slice()), ...parity];
}
/** @param {string} text @returns {number[]} */
function toGp(text) {
  const index = new Map(corpus.translit.map((name, i) => [name, i]));
  const upper = text.toUpperCase();
  const out = [];
  for (let i = 0; i < upper.length; i++) {
    const digraph = upper.slice(i, i + 2);
    if (index.has(digraph)) { out.push(index.get(digraph)); i++; }
    else if (index.has(upper[i])) out.push(index.get(upper[i]));
  }
  return out;
}
function main() {
  const book = corpus.pages.filter((p) => p.page < 56).flatMap((p) => p.indices);
  assert.equal(book.length, 12956);
  const starts = [8805, 8944, 9035, 9133, 9229, 9358];
  const items = starts.slice(0, 5).map((start, i) => book.slice(start, starts[i + 1]));
  assert.deepEqual(items.map((item) => item.length), [139, 91, 98, 96, 129]);
  assert.equal(items.reduce((sum, row) => sum + row.length, 0), 553);

  const span = book.slice(starts[0], starts[5]);
  const layouts = [
    { label: "seven successive 79-rune lanes",
      rows: Array.from({ length: 7 }, (_, k) => span.slice(79 * k, 79 * (k + 1))) },
    { label: "seven interleaved 79-rune lanes",
      rows: Array.from({ length: 7 }, (_, k) =>
        Array.from({ length: 79 }, (_, j) => span[7 * j + k])) }
  ];
  for (const leading of [true, false]) {
    const data = items.map((item) =>
      leading ? item.slice(0, 79) : item.slice(-79));
    const surplus = items.flatMap((item) =>
      leading ? item.slice(79) : item.slice(0, -79));
    assert.equal(surplus.length, 158);
    for (const backwards of [false, true]) {
      const rest = backwards ? surplus.slice().reverse() : surplus;
      layouts.push({
        label: `five ${leading ? "first" : "last"}-79 source-labelled items plus ${backwards ? "reversed" : "forward"} surplus`,
        rows: [...data, rest.slice(0, 79), rest.slice(79)]
      });
    }
  }
  const original = layouts.map(({ label, rows }) => ({ label, ...audit(rows) }));
  assert.deepEqual(original.map((r) => [r.exact, r.zeroOrOneError]),
    [[0, 28], [0, 16], [0, 18], [0, 20], [0, 20], [0, 17]]);

  // True native GP source plant, unknown pad per column, plus one corrupt
  // ciphertext rune at a secret and changing location in EVERY column.
  const shakespeare = toGp(read("resources/control/shakespeare_first300k.txt"));
  const raw = shakespeare.slice(27000, 27395);
  assert.equal(raw.length, 395);
  const data = Array.from({ length: 5 }, (_, k) => raw.slice(k * 79, (k + 1) * 79));
  const trueCode = encodeFive(data);
  const pad = Array.from({ length: 79 }, (_, j) => (11 * j + 7) % 29);
  const padded = trueCode.map((row) => row.map((x, j) => mod(x + pad[j])));
  assert.deepEqual(audit(padded), { exact: 79, zeroOrOneError: 79, moreThanOneError: 0 });
  const damaged = padded.map((row) => row.slice());
  for (let j = 0; j < 79; j++) {
    const site = (3 * j + 2) % 7;
    const error = 1 + ((11 * j) % 28);
    damaged[site][j] = mod(damaged[site][j] + error);
  }
  assert.deepEqual(audit(damaged), { exact: 0, zeroOrOneError: 79, moreThanOneError: 0 });
  const repaired = Array.from({ length: 7 }, () => []);
  for (let j = 0; j < 79; j++) {
    const recovered = correctOne(damaged.map((row) => row[j]));
    assert.ok(recovered);
    for (let k = 0; k < 7; k++) repaired[k].push(recovered[k]);
  }
  assert.deepEqual(repaired, padded);
  const recoveredPlain = repaired.map((row) => row.map((x, j) => mod(x - pad[j])));
  assert.deepEqual(recoveredPlain, trueCode);
  assert.deepEqual(recoveredPlain.slice(0, 5), data);
  assert.deepEqual(encodeFive(recoveredPlain.slice(0, 5)), trueCode);

  console.log(JSON.stringify({
    status: "EXACT RS(7,5) SOURCE-PARITY MODEL EXCLUDED; NO ORIGINAL PLAINTEXT",
    sourceMarkedCounts: items.map((p) => p.length),
    field: 29, interpolationPositions: [1, 2, 3, 4, 5, 6, 7],
    parity6: w6, parity7: w7, original,
    sourceNativePlant: "395 GP-English runes, arbitrary 79-step pad, one unknown error per column: 553/553 repaired and reencoded"
  }, null, 2));
}
main();
