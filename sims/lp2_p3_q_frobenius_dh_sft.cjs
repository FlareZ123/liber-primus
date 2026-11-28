"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const MOD = 29;
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-ink-annotations.json"), "utf8"));
const signed2016 = fs.readFileSync(path.join(root, "resources/historical/cicada2016-4gq25-outguess.asc"), "utf8");
const dhSynthesis = fs.readFileSync(path.join(root, "im-results/lp2-p15-signed2013-tcp-dual-example.md"), "utf8");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} x @returns {number} */
function mod(x) {
  return ((x % MOD) + MOD) % MOD;
}

/** @param {number} x @returns {number} */
function inv(x) {
  for (let i = 1; i < MOD; i += 1) {
    if (mod(x * i) === 1) return i;
  }
  throw new Error("no inverse for " + x);
}

/** @param {[number, number]} x @param {[number, number]} y @returns {[number, number]} */
function mul(x, y) {
  const [a, b] = x;
  const [c, d] = y;
  return [mod(a * c + 8 * b * d), mod(a * d + b * c + 3 * b * d)];
}

/** @param {[number, number]} base @param {number} exponent @returns {[number, number]} */
function pow(base, exponent) {
  let result = [1, 0];
  let x = base;
  let n = exponent;
  while (n > 0) {
    if (n & 1) result = mul(result, x);
    x = mul(x, x);
    n = Math.floor(n / 2);
  }
  return result;
}

/** @param {number[]} coefficients @returns {[number, number]} */
function evaluate(coefficients) {
  let acc = [0, 0];
  let power = [1, 0];
  for (const coefficient of coefficients) {
    acc = [mod(acc[0] + coefficient * power[0]), mod(acc[1] + coefficient * power[1])];
    power = mul(power, [0, 1]);
  }
  return acc;
}

/** @param {number[]} numerator @param {number[]} denominator @returns {{quotient:number[], remainder:number[]}} */
function divide(numerator, denominator) {
  const a = numerator.map(mod);
  const quotient = Array(Math.max(0, a.length - denominator.length + 1)).fill(0);
  const leadInv = inv(denominator.at(-1));
  for (let i = a.length - 1; i >= denominator.length - 1; i -= 1) {
    const q = mod(a[i] * leadInv);
    const qi = i - denominator.length + 1;
    quotient[qi] = q;
    for (let j = 0; j < denominator.length; j += 1) {
      a[qi + j] = mod(a[qi + j] - q * denominator[j]);
    }
  }
  return { quotient: quotient.map(mod), remainder: a.slice(0, denominator.length - 1).map(mod) };
}

/** @param {number} page @param {number} start @param {number} length @returns {number[]} */
function redSpan(page, start, length) {
  const pageRecord = ink.pages.find((item) => item.page === page);
  const span = pageRecord.red_spans.find((item) => item.start === start && item.length === length);
  return [...span.runes].map((rune) => runeIndex.get(rune));
}

/** @param {[number, number]} q @returns {number[][]} */
function multiplicationMatrix(q) {
  const [x, y] = q;
  return [[x, mod(8 * y)], [y, mod(x + 3 * y)]];
}

/** @param {number[][]} matrix @returns {{trace:number, determinant:number}} */
function matrixInvariants(matrix) {
  return {
    trace: mod(matrix[0][0] + matrix[1][1]),
    determinant: mod(matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]),
  };
}

/** @param {[number, number]} value @returns {number} */
function multiplicativeOrder(value) {
  let x = [1, 0];
  for (let n = 1; n <= MOD * MOD - 1; n += 1) {
    x = mul(x, value);
    if (x[0] === 1 && x[1] === 0) return n;
  }
  throw new Error("nonzero field element had no finite order");
}

const dhMatch = dhSynthesis.match(/C: DH (\d+)\s+S: 01 OK (\d+) (\d+)\s+C: (\d+)\s+S: 03 DATA (\d+)/);
assert(dhMatch);
const [, pText, gText, AText, BText, KText] = dhMatch;
const dh = { p: Number(pText), g: Number(gText), A: Number(AText), B: Number(BText), K: Number(KText) };
assert.deepStrictEqual(dh, { p: 23, g: 5, A: 8, B: 19, K: 2 });

const p3 = redSpan(3, 119, 3);
const p15Second = redSpan(15, 9, 11);
const p57 = redSpan(57, 0, 7);
assert.deepStrictEqual(p3, [13, 23, 2]);
assert.strictEqual(p3[1], dh.p);

const paddedP57 = p57.concat(Array(p15Second.length - p57.length).fill(0));
const difference = p15Second.map((value, i) => mod(value - paddedP57[i]));
const division = divide(difference, p3);
assert.deepStrictEqual(division.remainder, [0, 0]);
assert.deepStrictEqual(division.quotient, [5, 5, 14, 9, 10, 4, 27, 17, 25]);

const Q = evaluate(division.quotient);
assert.deepStrictEqual(Q, [17, 24]);

// p3: 13 + 23u + 2u^2 = 0 => u^2 = 3u + 8.
// Its discriminant is 12, a nonsquare mod29, so this is genuinely GF(29^2).
const squares = new Set(Array.from({ length: MOD }, (_, x) => mod(x * x)));
assert.strictEqual(squares.has(12), false);

// Canonical Frobenius conjugation in GF(29^2). Since the two roots sum to 3,
// u^29 = 3-u. For Q=17+24u this gives 2+5u with no chosen parameter.
const frobenius = pow(Q, MOD);
assert.deepStrictEqual(frobenius, [dh.K, dh.g]);
assert.deepStrictEqual(frobenius, [2, 5]);

const trace = [mod(Q[0] + frobenius[0]), mod(Q[1] + frobenius[1])];
const norm = mul(Q, frobenius);
assert.deepStrictEqual(trace, [dh.B, 0]);
assert.deepStrictEqual(norm, [dh.A, 0]);

const matrix = multiplicationMatrix(Q);
assert.deepStrictEqual(matrix, [[17, 18], [24, 2]]);
assert.deepStrictEqual(matrixInvariants(matrix), { trace: dh.B, determinant: dh.A });

const signedBody = signed2016.split("-----BEGIN PGP SIGNATURE-----")[0];
const words = signedBody.match(/\b[A-Za-z]+\b/g)
  .filter((word) => !["BEGIN", "PGP", "SIGNED", "MESSAGE", "Hash", "SHA"].includes(word))
  .map((word) => word.toUpperCase());
assert.strictEqual(words.length, 43);
assert.strictEqual(words[29], "DIRECTION");
assert.deepStrictEqual(pow(Q, 29), [dh.K, dh.g]);
assert.deepStrictEqual(pow(Q, 30), [dh.A, 0]);
assert.deepStrictEqual(matrix.flat().map((index) => words[index]), ["THE", "MAP", "AND", "PATH"]);

// Maximum possible multiplicative order in GF(29^2)^* is 29^2-1=840.
assert.strictEqual(multiplicativeOrder(Q), 840);
assert.deepStrictEqual(pow(Q, 30), [dh.A, 0]);

// Recover the historical private exponent only after p,g,A are fixed by the transcript.
const exponents = [];
for (let a = 0; a < dh.p - 1; a += 1) {
  let value = 1;
  for (let i = 0; i < a; i += 1) value = (value * dh.g) % dh.p;
  if (value === dh.A) exponents.push(a);
}
assert.deepStrictEqual(exponents, [6]);

/** @param {[number, number]} value @returns {[number, number]} */
function frobeniusMap(value) {
  return pow(value, MOD);
}

/** @param {[number, number]} value @returns {[number, number]} */
function directionStep(value) {
  return frobeniusMap(mul(Q, value));
}

// The signed-source DIRECTION29 operation composes with Q into a sparse
// semilinear navigation map on the complete-red-span state set.
for (let x = 0; x < MOD; x += 1) {
  for (let y = 0; y < MOD; y += 1) {
    const twice = directionStep(directionStep([x, y]));
    assert.deepStrictEqual(twice, [mod(dh.A * x), mod(dh.A * y)]);
  }
}

const redStates = [];
for (const page of ink.pages) {
  for (const span of page.red_spans || []) {
    const coefficients = [...span.runes].map((rune) => runeIndex.get(rune));
    redStates.push({
      page: page.page,
      start: span.start,
      length: span.length,
      state: evaluate(coefficients),
    });
  }
}
assert.strictEqual(redStates.length, 18);
const redStateIndex = new Map();
for (const row of redStates) {
  const key = row.state.join(",");
  if (!redStateIndex.has(key)) redStateIndex.set(key, []);
  redStateIndex.get(key).push(row);
}
const directionEdges = [];
for (const source of redStates) {
  const targetState = directionStep(source.state);
  for (const target of redStateIndex.get(targetState.join(",")) || []) {
    directionEdges.push({
      source: [source.page, source.start, source.length],
      target: [target.page, target.start, target.length],
      sourceState: source.state,
      targetState,
    });
  }
}
const signedRun = words.slice(25, 32);
assert.deepStrictEqual(signedRun, ["THEIR", "NUMBERS", "ARE", "THE", "DIRECTION", "SEEK", "AND"]);

const p7State = redStates.find((row) => row.page === 7 && row.start === 194).state;
/** @param {[number, number]} value @param {number} count @returns {[number, number]} */
function directionPower(value, count) {
  let result = value;
  for (let i = 0; i < count; i += 1) result = directionStep(result);
  return result;
}
assert.deepStrictEqual(directionPower(p7State, 25), [24, 6]);
assert.deepStrictEqual(directionPower(p7State, 26), [18, 21]);
assert.deepStrictEqual(directionPower(p7State, 27), [18, 19]);
assert.deepStrictEqual(directionPower(p7State, 28), [28, 23]);
assert.deepStrictEqual([words[28], words[23]], ["THE", "ROAD"]);

const offset2527Starts = [];
for (let a = 0; a < MOD; a += 1) {
  for (let b = 0; b < MOD; b += 1) {
    if (a === 0 && b === 0) continue;
    const start = [a, b];
    const states = [25, 26, 27].map((offset) => directionPower(start, offset));
    if (states.every((state) => redStateIndex.has(state.join(",")))) {
      offset2527Starts.push({ start, states });
    }
  }
}
assert.deepStrictEqual(offset2527Starts, [{
  start: [1, 6],
  states: [[24, 6], [18, 21], [18, 19]],
}]);

const qInverse = pow(Q, 839);
const compositionVariants = [
  { name: "F(Q*x)", step: (x) => frobeniusMap(mul(Q, x)) },
  { name: "Q*F(x)", step: (x) => mul(Q, frobeniusMap(x)) },
  { name: "F(Q^-1*x)", step: (x) => frobeniusMap(mul(qInverse, x)) },
  { name: "Q^-1*F(x)", step: (x) => mul(qInverse, frobeniusMap(x)) },
];
const compositionCharge = compositionVariants.map(({ name, step }) => {
  const starts = [];
  for (let a = 0; a < MOD; a += 1) {
    for (let b = 0; b < MOD; b += 1) {
      if (a === 0 && b === 0) continue;
      const start = [a, b];
      let state = start;
      const at = {};
      for (let offset = 1; offset <= 27; offset += 1) {
        state = step(state);
        if (offset >= 25) at[offset] = state;
      }
      if ([25, 26, 27].every((offset) => redStateIndex.has(at[offset].join(",")))) {
        starts.push({
          start,
          startIsRed: redStateIndex.has(start.join(",")),
          targets: [25, 26, 27].map((offset) => at[offset]),
        });
      }
    }
  }
  return { name, starts };
});
assert.deepStrictEqual(compositionCharge, [
  {
    name: "F(Q*x)",
    starts: [{
      start: [1, 6],
      startIsRed: true,
      targets: [[24, 6], [18, 21], [18, 19]],
    }],
  },
  { name: "Q*F(x)", starts: [] },
  { name: "F(Q^-1*x)", starts: [] },
  {
    name: "Q^-1*F(x)",
    starts: [{
      start: [5, 1],
      startIsRed: false,
      targets: [[18, 19], [18, 21], [24, 6]],
    }],
  },
]);

assert.deepStrictEqual(directionPower([24, 6], 31), p7State);
assert.deepStrictEqual(directionPower([18, 21], 30), p7State);
assert.deepStrictEqual(directionPower([18, 19], 29), p7State);
assert.deepStrictEqual(directionPower(p7State, 28), [mod(-p7State[0]), mod(-p7State[1])]);

const signedRangeTripleHits = [];
for (const source of redStates) {
  if (source.state[0] === 0 && source.state[1] === 0) continue;
  for (let offset = 0; offset <= 40; offset += 1) {
    const targets = [0, 1, 2].map((delta) => directionPower(source.state, offset + delta));
    if (targets.every((state) => redStateIndex.has(state.join(",")))) {
      signedRangeTripleHits.push({
        source: [source.page, source.start, source.length],
        offset,
        targets,
      });
    }
  }
}
assert.deepStrictEqual(signedRangeTripleHits, [
  {
    source: [7, 194, 14],
    offset: 25,
    targets: [[24, 6], [18, 21], [18, 19]],
  },
  {
    source: [15, 0, 9],
    offset: 0,
    targets: [[24, 6], [18, 21], [18, 19]],
  },
]);


assert.deepStrictEqual(directionEdges, [
  { source: [3, 119, 3], target: [3, 119, 3], sourceState: [0, 0], targetState: [0, 0] },
  { source: [15, 0, 9], target: [40, 0, 8], sourceState: [24, 6], targetState: [18, 21] },
  { source: [40, 0, 8], target: [27, 0, 19], sourceState: [18, 21], targetState: [18, 19] },
]);

let traceNormMatches = 0;
let traceNormPrimitiveMatches = 0;
let exactFrobeniusMatches = 0;
let primitiveElements = 0;
for (let x = 0; x < MOD; x += 1) {
  for (let y = 0; y < MOD; y += 1) {
    if (x === 0 && y === 0) continue;
    const candidate = [x, y];
    const order = multiplicativeOrder(candidate);
    if (order === 840) primitiveElements += 1;
    const conjugate = pow(candidate, MOD);
    const candidateTrace = [mod(x + conjugate[0]), mod(y + conjugate[1])];
    const candidateNorm = mul(candidate, conjugate);
    if (candidateTrace[0] === dh.B && candidateTrace[1] === 0 &&
        candidateNorm[0] === dh.A && candidateNorm[1] === 0) {
      traceNormMatches += 1;
      if (order === 840) traceNormPrimitiveMatches += 1;
    }
    if (conjugate[0] === dh.K && conjugate[1] === dh.g) exactFrobeniusMatches += 1;
  }
}
assert.strictEqual(primitiveElements, 192);
assert.strictEqual(traceNormMatches, 2);
assert.strictEqual(traceNormPrimitiveMatches, 2);
assert.strictEqual(exactFrobeniusMatches, 1);

console.log(JSON.stringify({
  p3,
  quotient: division.quotient,
  E_Q: Q,
  frobenius_Q29: frobenius,
  field_trace: trace,
  field_norm: norm,
  multiplication_matrix: matrix,
  matrix_words: matrix.flat().map((index) => words[index]),
  direction_word: {
    zero_based_index: 29,
    one_based_ordinal: 30,
    word: words[29],
    Q29: pow(Q, 29),
    Q30: pow(Q, 30),
  },
  matrix_invariants: matrixInvariants(matrix),
  multiplicative_order: multiplicativeOrder(Q),
  Q30: pow(Q, 30),
  historical_dh: { ...dh, a: exponents[0] },
  direction_red_span_edges: directionEdges,
  signed_25_31: signedRun,
  offset25_28_from_p7: [25, 26, 27, 28].map((offset) => ({
    offset,
    state: directionPower(p7State, offset),
    words: directionPower(p7State, offset).map((index) => words[index] || null),
  })),
  offset25_27_all_field_starts: offset2527Starts,
  composition_charge: compositionCharge,
  signed_range_triple_hits: signedRangeTripleHits,
  next_after_p27: directionStep([18, 19]),
  finite_charge: {
    nonzero_field_elements: 840,
    primitive_elements: primitiveElements,
    trace_B_norm_A_elements: traceNormMatches,
    trace_B_norm_A_primitive_elements: traceNormPrimitiveMatches,
    exact_frobenius_K_g_elements: exactFrobeniusMatches,
  },
}, null, 2));
