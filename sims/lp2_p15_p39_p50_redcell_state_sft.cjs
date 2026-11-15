'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = process.cwd();
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const readJSON = (p) => JSON.parse(read(p));
const mod = (x, p = 29) => ((x % p) + p) % p;
const powMod = (a, n, p = 29) => {
  let r = 1;
  while (n > 0) {
    if (n & 1) r = (r * a) % p;
    a = (a * a) % p;
    n = Math.floor(n / 2);
  }
  return r;
};

function zero4() {
  return Array.from({ length: 4 }, () => [0, 0, 0, 0]);
}
function identity4() {
  return [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
}
function mul4(A, B) {
  return A.map((row) => B[0].map((_, j) =>
    row.reduce((s, v, k) => mod(s + v * B[k][j]), 0)
  ));
}
function addScalarI(A, a) {
  return A.map((row, i) => row.map((v, j) => mod(v + (i === j ? a : 0))));
}
function equal4(A, B) {
  return A.every((row, i) => row.every((v, j) => mod(v) === mod(B[i][j])));
}
function detMod(A, p = 29) {
  const a = A.map((row) => row.map((v) => mod(v, p)));
  let det = 1;
  for (let c = 0; c < 4; c++) {
    let pivot = c;
    while (pivot < 4 && a[pivot][c] === 0) pivot++;
    if (pivot === 4) return 0;
    if (pivot !== c) {
      [a[pivot], a[c]] = [a[c], a[pivot]];
      det = mod(-det, p);
    }
    const pv = a[c][c];
    det = mod(det * pv, p);
    const inv = powMod(pv, p - 2, p);
    for (let j = c; j < 4; j++) a[c][j] = mod(a[c][j] * inv, p);
    for (let i = c + 1; i < 4; i++) {
      const f = a[i][c];
      for (let j = c; j < 4; j++) a[i][j] = mod(a[i][j] - f * a[c][j], p);
    }
  }
  return det;
}
function matrixOrder(A, max = 10000) {
  let S = identity4();
  const I = identity4();
  for (let n = 1; n <= max; n++) {
    S = mul4(S, A);
    if (equal4(S, I)) return n;
  }
  return null;
}
function matrixVector(A, v) {
  return A.map((row) => mod(row.reduce((s, x, j) => s + x * v[j], 0)));
}
function evalPolynomial(coefficients, M) {
  let R = zero4();
  for (const a of coefficients) R = addScalarI(mul4(R, M), a);
  return R;
}
function scalarSequence(A, n, row = 1, col = 1) {
  let S = identity4();
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push(S[row][col]);
    S = mul4(S, A);
  }
  return out;
}
function minimalPeriod(sequence) {
  for (let p = 1; p <= sequence.length; p++) {
    if (sequence.length % p !== 0) continue;
    if (sequence.every((v, i) => v === sequence[i % p])) return p;
  }
  return null;
}
function ioc(a) {
  const f = Array(29).fill(0);
  for (const x of a) f[x]++;
  return f.reduce((s, x) => s + x * (x - 1), 0) / (a.length * (a.length - 1));
}
function decode(cipher, key, sign) {
  return cipher.map((v, i) => mod(v - sign * key[i]));
}
function stats(cipher, key, sign) {
  const plain = decode(cipher, key, sign);
  const reencrypted = plain.every((v, i) => mod(v + sign * key[i]) === cipher[i]);
  return {
    length: cipher.length,
    original_ioc: ioc(cipher),
    decoded_ioc: ioc(plain),
    exact_reencrypt: reencrypted,
    first_32: plain.slice(0, 32),
  };
}
function extractRunes(text, runeToIndex) {
  return Array.from(text).filter((ch) => runeToIndex.has(ch)).map((ch) => runeToIndex.get(ch));
}
function findMarkerPositions(text, marker) {
  const positions = [];
  let at = -1;
  while ((at = text.indexOf(marker, at + 1)) >= 0) positions.push(at);
  return positions;
}

// Source table: 32 x 8 two-character base-60 tokens from original scans 66–68.
const grid = readJSON('resources/liber-primus/base60-grid.json');
const corpus = readJSON('resources/liber-primus/lp2-corpus.json');
const master = read('resources/transcriptions/liber_primus_master.txt');
const lp1 = read('resources/transcriptions/lp1_wulfic_canonical.txt');
const alphabet = grid.alphabet;
const digit = (ch) => alphabet.indexOf(ch);
const tokens = grid.rows.flat();
assert.equal(tokens.length, 256);
const bytes = tokens.map((token) => {
  assert.equal(token.length, 2);
  assert.ok(digit(token[0]) >= 0 && digit(token[1]) >= 0);
  return 60 * digit(token[0]) + digit(token[1]);
});

// p39 red triad [27,5,15] gives 27 + 5X + 15X^2 = 15(X-24)^2.
// Use the monic repeated-root factor X^2 + 10X + 25.
let polynomial = bytes.map((b) => mod(b));
const monicDivisor = [1, 10, 25];
const quotient = [];
for (let k = 0; k < 254; k++) {
  const a = polynomial[k];
  quotient.push(a);
  for (let j = 0; j < 3; j++) polynomial[k + j] = mod(polynomial[k + j] - a * monicDivisor[j]);
}
const remainder = polynomial.slice(254);
assert.deepEqual(remainder, [0, 0]);
assert.equal(quotient.length, 254);

// p15 printed magnitudes in row-major order. The independently reconstructed
// signed form uses the two negative entries at flat positions 12 and 13.
const printed = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820],
];
const signed = printed.map((row) => row.slice());
signed[3][0] = -signed[3][0];
signed[3][1] = -signed[3][1];
const M = signed.map((row) => row.map((v) => mod(v)));
const MUnsigned = printed.map((row) => row.map((v) => mod(v)));
const R = evalPolynomial(quotient, M);
const expectedR = [
  [21, 27, 22, 0],
  [28, 10, 13, 22],
  [12, 0, 9, 13],
  [12, 24, 7, 3],
];
assert.ok(equal4(R, expectedR));

// A cyclic vector proves the centralizer of M is exactly F_29[M].
// For a cyclic matrix, every commuting matrix is a polynomial in M.
let v = [1, 0, 0, 0];
const krylovColumns = [];
for (let i = 0; i < 4; i++) {
  krylovColumns.push(v);
  v = matrixVector(M, v);
}
const krylov = Array.from({ length: 4 }, (_, i) => krylovColumns.map((col) => col[i]));
const krylovDet = detMod(krylov);
assert.equal(krylovDet, 15);
assert.ok(equal4(mul4(M, R), mul4(R, M)));
assert.equal(detMod(R), 23);
assert.equal(matrixOrder(R, 1000), 812);

// Source-marked red 3299 is at zero-based matrix coordinate [1,1].
// The natural zero-step is I; the infinity ornament motivates iteration.
const target = corpus.pages.filter((p) => p.page >= 33 && p.page <= 39).flatMap((p) => p.indices);
const holdout = corpus.pages.filter((p) => p.page >= 40 && p.page <= 53).flatMap((p) => p.indices);
assert.equal(target.length, 1680);
assert.equal(holdout.length, 3008);
const key = scalarSequence(R, Math.max(target.length, holdout.length));
const period = minimalPeriod(key.slice(0, 812));
assert.equal(period, 28);
assert.equal(new Set(key.slice(0, 812)).size, 16);
assert.equal(target.length, 60 * period);

// Closed-form scalar projection; checked across the full 812-step matrix orbit.
const scalarFormula = Array.from({ length: 812 }, (_, t) =>
  mod(17 * powMod(12, t) + 7 * powMod(8, t) + 6 * powMod(26, t))
);
assert.deepEqual(key.slice(0, 812), scalarFormula);

const targetMinus = stats(target, key, 1);
const targetPlus = stats(target, key, -1);
const holdoutMinus = stats(holdout, key, 1);
const holdoutPlus = stats(holdout, key, -1);
assert.ok(targetMinus.exact_reencrypt && targetPlus.exact_reencrypt);
assert.ok(holdoutMinus.exact_reencrypt && holdoutPlus.exact_reencrypt);

// Authentic solved controls: exact p56 and p57 rune plaintexts from the master transcription.
const runeToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const marker = '&\n$\n%\n';
const markerPositions = findMarkerPositions(master, marker);
assert.ok(markerPositions.length >= 3);
const p56Text = master.slice(markerPositions[markerPositions.length - 3] + marker.length, markerPositions[markerPositions.length - 2]);
const p57Text = master.slice(markerPositions[markerPositions.length - 2] + marker.length, markerPositions[markerPositions.length - 1]);
const p56Plain = extractRunes(p56Text, runeToIndex);
const p57Plain = extractRunes(p57Text, runeToIndex);
assert.equal(p56Plain.length, 85);
assert.equal(p57Plain.length, 95);
assert.deepEqual(p57Plain, corpus.pages.find((p) => p.page === 57).indices);
assert.equal(corpus.pages.find((p) => p.page === 56).indices.length, 85);

// Positive plant: authentic p56 plaintext encrypted under the frozen candidate stream
// and decrypted again. This validates the inverse implementation, not historical use.
const p56PlantCipher = p56Plain.map((v, i) => mod(v + key[i]));
const p56PlantRecovered = decode(p56PlantCipher, key, 1);
assert.deepEqual(p56PlantRecovered, p56Plain);

// LP1 known-plaintext control is used only as a native-English frequency baseline.
const lp1Plain = extractRunes(lp1, runeToIndex);
assert.equal(lp1Plain.length, 2797);

// Wrong-normalization null: divide by the full non-monic p39 polynomial 15(X-24)^2.
const inv15 = powMod(15, 27);
const quotientFull = quotient.map((x) => mod(x * inv15));
const RFull = evalPolynomial(quotientFull, M);
assert.equal(matrixOrder(RFull, 1000), 203);
const keyFull = scalarSequence(RFull, target.length);
const fullMinus = stats(target, keyFull, 1);
const fullPlus = stats(target, keyFull, -1);

// Literal-image null: omit the two source-derived sign restorations on p15.
const RUnsigned = evalPolynomial(quotient, MUnsigned);
assert.equal(detMod(RUnsigned), 11);
const keyUnsigned = scalarSequence(RUnsigned, target.length);
const unsignedMinus = stats(target, keyUnsigned, 1);
const unsignedPlus = stats(target, keyUnsigned, -1);

const translit = (indices) => indices.map((i) => corpus.translit[i]).join(' ');
const output = {
  inputs: {
    base60_token_count: tokens.length,
    base60_byte_count: bytes.length,
    p15_signed_matrix: M,
    p39_monic_divisor_descending: monicDivisor,
    quotient_slots: quotient.length,
    quotient_prefix_12: quotient.slice(0, 12),
    quotient_remainder: remainder,
    quotient_matrix_R_of_M: R,
    p15_krylov_determinant_mod29: krylovDet,
    commutator_MR_is_zero: equal4(mul4(M, R), mul4(R, M)),
  },
  state: {
    determinant_R_mod29: detMod(R),
    matrix_order_R: matrixOrder(R, 1000),
    red_cell_coordinate: [1, 1],
    zero_state: 'I_4',
    scalar_period: period,
    scalar_distinct_symbols: new Set(key.slice(0, 812)).size,
    scalar_formula: '17*12^t + 7*8^t + 6*26^t (mod 29)',
    scalar_formula_matches_all_812_steps: true,
    target_length: target.length,
    target_equals_60_scalar_periods: target.length === 60 * period,
    first_28_key_values: key.slice(0, 28),
  },
  target_p33_p39: {
    original_ioc: ioc(target),
    subtract_stream: targetMinus,
    add_stream: targetPlus,
    first_100_subtract_transliteration: translit(decode(target, key, 1).slice(0, 100)),
    first_100_add_transliteration: translit(decode(target, key, -1).slice(0, 100)),
  },
  blind_holdout_p40_p53: {
    original_ioc: ioc(holdout),
    subtract_stream: holdoutMinus,
    add_stream: holdoutPlus,
  },
  controls: {
    p56_plaintext_runes: p56Plain.length,
    p56_synthetic_positive_plant_recovered: p56PlantRecovered.length,
    p56_synthetic_positive_plant_exact: p56PlantRecovered.every((v, i) => v === p56Plain[i]),
    p57_plaintext_runes: p57Plain.length,
    p57_matches_canonical_corpus: true,
    p56_plaintext_ioc: ioc(p56Plain),
    p57_plaintext_ioc: ioc(p57Plain),
    lp1_plaintext_runes: lp1Plain.length,
    lp1_plaintext_ioc: ioc(lp1Plain),
  },
  nulls: {
    full_p39_polynomial_divisor: {
      matrix_order: matrixOrder(RFull, 1000),
      subtract_ioc: fullMinus.decoded_ioc,
      add_ioc: fullPlus.decoded_ioc,
    },
    literal_unsigned_p15_matrix: {
      determinant_R_mod29: detMod(RUnsigned),
      subtract_ioc: unsignedMinus.decoded_ioc,
      add_ioc: unsignedPlus.decoded_ioc,
    },
  },
  conclusion: 'The frozen red-cell additive state stream is reversible and reproduces exactly, but it yields no native plaintext on p33-p39 or the blind p40-p53 holdout. The source polynomial quotient is a polynomial in the same cyclic p15 matrix, so its matrix algebra is commutative; no source-selected nonlinear or noncommuting rune update follows from these inputs alone.',
};

console.log(JSON.stringify(output, null, 2));
