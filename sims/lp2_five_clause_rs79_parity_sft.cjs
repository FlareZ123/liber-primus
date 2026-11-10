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
const w0 = weights(0), w6 = weights(6), w7 = weights(7);
assert.deepEqual(w0, [5, 19, 10, 24, 1]);
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

/**
 * Every GP-native five-share degree-four Shamir candidate has one completely
 * determined 91-rune secret p(0) from the first 91 runes of all five labelled
 * original items. Count exact 91-rune English control IoCs using a sliding
 * histogram, not a sampled subset or a fitted cipher parameter.
 * @param {string} sourceFile
 * @param {number} originalPairs
 */
function fullSource91Reference(sourceFile, originalPairs) {
  const source = toGp(read(sourceFile));
  const width = 91;
  const counts = Array(29).fill(0);
  for (let i = 0; i < width; i++) counts[source[i]]++;
  let orderedPairs = counts.reduce((sum, n) => sum + n * (n - 1), 0);
  let minPairs = orderedPairs;
  let atOrBelow = Number(orderedPairs <= originalPairs);
  for (let i = width; i < source.length; i++) {
    const leaving = source[i - width], entering = source[i];
    orderedPairs -= 2 * (counts[leaving] - 1);
    counts[leaving]--;
    orderedPairs += 2 * counts[entering];
    counts[entering]++;
    minPairs = Math.min(minPairs, orderedPairs);
    atOrBelow += Number(orderedPairs <= originalPairs);
  }
  return { sourceFile, windows: source.length - width + 1,
    minIoC: minPairs / (width * (width - 1)), atOrBelow };
}

function main() {
  const book = corpus.pages.filter((p) => p.page < 56).flatMap((p) => p.indices);
  assert.equal(book.length, 12956);
  const starts = [8805, 8944, 9035, 9133, 9229, 9358];
  const items = starts.slice(0, 5).map((start, i) => book.slice(start, starts[i + 1]));
  assert.deepEqual(items.map((item) => item.length), [139, 91, 98, 96, 129]);
  assert.equal(items.reduce((sum, row) => sum + row.length, 0), 553);

  // Full threshold-five Shamir secret at x=0. The red labels 1..5
  // themselves fix this one inverse; any random polynomial coefficients
  // at degrees 1..4 cancel exactly without key hunting.
  const possibleSecret = Array.from({ length: 91 }, (_, j) =>
    mod(items.reduce((sum, item, k) => sum + w0[k] * item[j], 0)));
  const valueCounts = Array(29).fill(0);
  for (const x of possibleSecret) valueCounts[x]++;
  const secretPairs = valueCounts.reduce((sum, count) =>
    sum + count * (count - 1), 0);
  assert.equal(secretPairs, 320);
  const shamir0Original = {
    availableRunes: possibleSecret.length,
    interpolationCoefficients: w0,
    ioc: secretPairs / (91 * 90),
    preview: possibleSecret.map((x) => corpus.translit[x]).join("")
  };

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
    [[0, 23], [0, 11], [0, 18], [0, 20], [0, 20], [0, 17]]);

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

  // Full five-of-five Shamir control: an authentic 91-rune GP-English
  // message is hidden at polynomial value x=0; independently varying
  // degree1..4 coefficients are unknown to the secret extractor.
  const secret91 = shakespeare.slice(37123, 37214);
  assert.equal(secret91.length, 91);
  const shares = Array.from({ length: 5 }, () => []);
  for (let j = 0; j < 91; j++) {
    const coeffs = [
      secret91[j], (7*j+3)%29, (11*j*j+5)%29,
      (17*j+2*j*j+1)%29, (19*j*j*j+13)%29
    ];
    for (let x = 1; x <= 5; x++) {
      let value = 0, power = 1;
      for (const a of coeffs) {
        value += a * power;
        power = mod(power * x);
      }
      shares[x - 1].push(mod(value));
    }
  }
  const recoveredSecret = Array.from({ length: 91 }, (_, j) =>
    mod(shares.reduce((sum, share, k) => sum + w0[k] * share[j], 0)));
  assert.deepEqual(recoveredSecret, secret91);

  const shamir91Controls = [
    fullSource91Reference("resources/control/shakespeare_first300k.txt", secretPairs),
    fullSource91Reference("resources/control/emerson_essays_2944.txt", secretPairs),
    fullSource91Reference("resources/control/gibran_prophet_58585.txt", secretPairs)
  ];
  assert.deepEqual(shamir91Controls.map((r) => r.atOrBelow), [0, 0, 0]);
  assert.deepEqual(shamir91Controls.map((r) => r.windows),
    [213701, 318577, 61777]);

  console.log(JSON.stringify({
    status: "EXACT RS(7,5) SOURCE-PARITY MODEL EXCLUDED; NO ORIGINAL PLAINTEXT",
    sourceMarkedCounts: items.map((p) => p.length),
    field: 29, interpolationPositions: [1, 2, 3, 4, 5, 6, 7],
    parity6: w6, parity7: w7, original,
    directThresholdFiveShamirSecret: shamir0Original,
    shamir91NativeLanguageControls: shamir91Controls,
    sourceNativePlant: "395 GP-English runes, arbitrary 79-step pad, one unknown error per column: 553/553 repaired and reencoded"
  }, null, 2));
}
main();
