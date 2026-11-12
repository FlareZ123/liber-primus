"use strict";

/**
 * Source-constrained GF(29^2) degree-119 recurrence gate.
 *
 * Inputs:
 *   - the original 256-byte pp49-51 table and its established Q238 factor;
 *   - p3's red [13,23,2] quadratic, defining u^2 = 3u + 8;
 *   - the 119-rune prefixes before the red triads on p3 and p39;
 *   - the complete 238-rune physical p36 page.
 *
 * Candidate: pair p3_i + u*p39_i into a 119-element GF(29^2) seed.
 * Factor Q238 over GF(29^2), then use either degree-119 factor (and its
 * reciprocal) as an LFSR recurrence. Test the NEXT 119 field elements,
 * not the seed itself, against p36's 119 adjacent or half-block rune pairs.
 * Both additive signs are tested. Direct use of the seed is retained as
 * a separate one-time-pad baseline.
 *
 * Run: node sims/lp2_q238_gf841_119_lfsr_gate_sft.cjs
 * This is a bounded hypothesis test, not an authenticated Cicada decoder.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");

const root = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const mod29 = (x) => ((x % 29) + 29) % 29;
const DEGREE = 238;
const HALF = 119;

const bytes = grid.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.equal(
  createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
);

// GF(29^2) = GF(29)[u]/(u^2 - 3u - 8).
// Encode a + b*u as a + 29*b, with a,b in [0,28].
const add = (x, y) =>
  mod29((x % 29) + (y % 29)) +
  29 * mod29(Math.floor(x / 29) + Math.floor(y / 29));
const sub = (x, y) =>
  mod29((x % 29) - (y % 29)) +
  29 * mod29(Math.floor(x / 29) - Math.floor(y / 29));
const neg = (x) => sub(0, x);
const mul = (x, y) => {
  const a = x % 29;
  const b = Math.floor(x / 29);
  const c = y % 29;
  const d = Math.floor(y / 29);
  return (
    mod29(a * c + 8 * b * d) +
    29 * mod29(a * d + b * c + 3 * b * d)
  );
};
function powField(x, exponent) {
  let output = 1;
  while (exponent > 0n) {
    if (exponent & 1n) output = mul(output, x);
    exponent >>= 1n;
    if (exponent > 0n) x = mul(x, x);
  }
  return output;
}
const inverse = (x) => {
  assert.notEqual(x, 0);
  return powField(x, 839n);
};
const conjugate = (x) => {
  const a = x % 29;
  const b = Math.floor(x / 29);
  // u^29 = 3-u.
  return mod29(a + 3 * b) + 29 * mod29(-b);
};
const u = 29;
assert.equal(mul(u, u), 8 + 29 * 3);
assert.equal(add(add(13, mul(23, u)), mul(2, mul(u, u))), 0);

// Reconstruct the exact monic Q238 in ascending coefficient order.
// The four smaller factors and the conditional base60 interpretation are
// inherited from the established full-table factorization.
function multiply29(a, b) {
  const result = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result[i + j] = mod29(result[i + j] + a[i] * b[j]);
    }
  }
  return result;
}
const smallFactors = [
  [25, 10, 1],
  [11, 18, 1],
  [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]
];
const smallProduct = smallFactors.reduce(multiply29, [28]);
assert.equal(smallProduct.length, 17);
assert.equal(smallProduct[16], 28);
const remainder = bytes.map(mod29).reverse();
const Q = Array(239).fill(0);
for (let i = DEGREE; i >= 0; i--) {
  const coefficient = mod29(remainder[i + 16] * 28);
  Q[i] = coefficient;
  for (let j = 0; j < 17; j++) {
    remainder[i + j] = mod29(remainder[i + j] - coefficient * smallProduct[j]);
  }
}
assert.equal(Q[DEGREE], 1);
assert(remainder.every((x) => x === 0));
const qHash = createHash("sha256")
  .update(Buffer.from(Q.slice().reverse()))
  .digest("hex");
assert.equal(
  qHash,
  "9cb443bed228623bbd522efcd73888d3a4870c3db0ddcc147011765f3c8a9eb3"
);

// Polynomial multiplication modulo the base-field Q238.
// Since Q's coefficients are in GF(29), reduction is componentwise.
function multiplyModQ(a, b) {
  const real = new Int32Array(2 * DEGREE - 1);
  const imag = new Int32Array(2 * DEGREE - 1);
  for (let i = 0; i < DEGREE; i++) {
    const x = a[i];
    if (!x) continue;
    const ar = x % 29;
    const ai = Math.floor(x / 29);
    for (let j = 0; j < DEGREE; j++) {
      const y = b[j];
      if (!y) continue;
      const br = y % 29;
      const bi = Math.floor(y / 29);
      const k = i + j;
      real[k] += ar * br + 8 * ai * bi;
      imag[k] += ar * bi + ai * br + 3 * ai * bi;
    }
  }
  for (let k = 2 * DEGREE - 2; k >= DEGREE; k--) {
    const aHigh = mod29(real[k]);
    const bHigh = mod29(imag[k]);
    if (aHigh || bHigh) {
      for (let j = 0; j < DEGREE; j++) {
        real[k - DEGREE + j] -= aHigh * Q[j];
        imag[k - DEGREE + j] -= bHigh * Q[j];
      }
    }
  }
  return Array.from(
    { length: DEGREE },
    (_, i) => mod29(real[i]) + 29 * mod29(imag[i])
  );
}
const trim = (poly) => {
  let length = poly.length;
  while (length && poly[length - 1] === 0) length--;
  return poly.slice(0, length);
};
function remainderPoly(a, b) {
  let r = a.slice();
  const divisor = trim(b);
  assert(divisor.length > 0);
  const inverseLead = inverse(divisor[divisor.length - 1]);
  while (r.length >= divisor.length) {
    const shift = r.length - divisor.length;
    const coefficient = mul(r[r.length - 1], inverseLead);
    for (let j = 0; j < divisor.length; j++) {
      r[shift + j] = sub(r[shift + j], mul(coefficient, divisor[j]));
    }
    r = trim(r);
  }
  return r;
}
function gcdPoly(a, b) {
  a = trim(a);
  b = trim(b);
  while (b.length) {
    const r = remainderPoly(a, b);
    a = b;
    b = r;
  }
  const inverseLead = inverse(a[a.length - 1]);
  return a.map((x) => mul(x, inverseLead));
}
function powerModQ(base, exponent) {
  let output = Array(DEGREE).fill(0);
  output[0] = 1;
  let x = base.slice();
  while (exponent > 0n) {
    if (exponent & 1n) output = multiplyModQ(output, x);
    exponent >>= 1n;
    if (exponent > 0n) x = multiplyModQ(x, x);
  }
  return output;
}

// Cantor-Zassenhaus splits Q over GF(29^2). X+2u is a deterministic
// computational witness, not a cipher parameter. The two conjugate factors
// are both tested below, so the arbitrary choice of which factor is called F
// cannot select a favorable plaintext.
const splitWitness = Array(DEGREE).fill(0);
splitWitness[0] = 58; // 2u
splitWitness[1] = 1;  // X
const characterExponent = (29n ** 238n - 1n) / 2n;
const character = powerModQ(splitWitness, characterExponent);
character[0] = sub(character[0], 1);
const F = gcdPoly(character, Q);
assert.equal(F.length, HALF + 1);
assert.equal(F[HALF], 1);
const Fconjugate = F.map(conjugate);
assert.notDeepEqual(F, Fconjugate);

function multiplyPoly(a, b) {
  const result = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result[i + j] = add(result[i + j], mul(a[i], b[j]));
    }
  }
  return result;
}
assert.deepEqual(multiplyPoly(F, Fconjugate), Q);

function reciprocalMonic(poly) {
  const reversed = poly.slice().reverse();
  const inverseLead = inverse(reversed[HALF]);
  return reversed.map((x) => mul(x, inverseLead));
}
const polynomialChoices = [
  { name: "F", coefficients: F },
  { name: "F-reciprocal", coefficients: reciprocalMonic(F) },
  { name: "F-conjugate", coefficients: Fconjugate },
  { name: "F-conjugate-reciprocal", coefficients: reciprocalMonic(Fconjugate) }
];
for (const choice of polynomialChoices) {
  assert.equal(choice.coefficients.length, HALF + 1);
  assert.equal(choice.coefficients[HALF], 1);
}

// Original source pages and red-marked prefixes.
const page = (number) => {
  const result = corpus.pages.find((candidate) => candidate.page === number);
  assert(result, "missing physical page " + number);
  return result;
};
const p3 = page(3);
const p39 = page(39);
const p36 = page(36).indices;
const p3Prefix = p3.indices.slice(0, HALF);
const p39Prefix = p39.indices.slice(0, HALF);
assert.equal(p3Prefix.length, HALF);
assert.equal(p39Prefix.length, HALF);
assert.deepEqual(p3.indices.slice(HALF, HALF + 3), [13, 23, 2]);
assert.deepEqual(p39.indices.slice(HALF, HALF + 3), [27, 5, 15]);
assert.equal(p36.length, DEGREE);

// p3 is the constant coordinate; p39 is the u coordinate, in source order.
const seed = p3Prefix.map((value, i) => value + 29 * p39Prefix[i]);
assert.equal(seed.length, HALF);

function generateNextBlock(coefficients) {
  const state = seed.slice();
  for (let i = 0; i < HALF; i++) {
    let sum = 0;
    for (let j = 0; j < HALF; j++) {
      sum = add(sum, mul(coefficients[j], state[i + j]));
    }
    state.push(neg(sum));
  }
  return {
    initial: state.slice(0, HALF),
    next: state.slice(HALF, 2 * HALF)
  };
}
function pairRunes(runes, layout) {
  return Array.from({ length: HALF }, (_, i) =>
    layout === "adjacent"
      ? runes[2 * i] + 29 * runes[2 * i + 1]
      : runes[i] + 29 * runes[i + HALF]
  );
}
function flattenPairs(pairs) {
  return pairs.flatMap((value) => [value % 29, Math.floor(value / 29)]);
}
function ioc(runes) {
  const counts = Array(29).fill(0);
  for (const value of runes) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (runes.length * (runes.length - 1));
}
function decodeCase(cipherPairs, key, sign, metadata) {
  const decodedPairs = cipherPairs.map((value, i) =>
    sign < 0 ? sub(value, key[i]) : add(value, key[i])
  );
  const replay = decodedPairs.map((value, i) =>
    sign < 0 ? add(value, key[i]) : sub(value, key[i])
  );
  assert.deepEqual(replay, cipherPairs);
  const plaintext = flattenPairs(decodedPairs);
  const transliteration = plaintext.map((value) => corpus.translit[value]).join("");
  return {
    ...metadata,
    sign,
    roundtrip: true,
    ioc: ioc(plaintext),
    text: transliteration
  };
}

const directSeedCases = [];
for (const layout of ["adjacent", "halves"]) {
  const ciphertext = pairRunes(p36, layout);
  for (const sign of [-1, 1]) {
    directSeedCases.push(decodeCase(ciphertext, seed, sign, {
      phase: "direct-seed",
      layout
    }));
  }
}

const recurrenceCases = [];
for (const choice of polynomialChoices) {
  const stream = generateNextBlock(choice.coefficients).next;
  for (const layout of ["adjacent", "halves"]) {
    const ciphertext = pairRunes(p36, layout);
    for (const sign of [-1, 1]) {
      recurrenceCases.push(decodeCase(ciphertext, stream, sign, {
        phase: "next-119-state-symbols",
        polynomial: choice.name,
        layout
      }));
    }
  }
}
assert.equal(directSeedCases.length, 4);
assert.equal(recurrenceCases.length, 16);
assert([...directSeedCases, ...recurrenceCases].every((x) => x.roundtrip));

const rawP36Ioc = ioc(p36);
const directIocs = directSeedCases.map((x) => x.ioc);
const recurrenceIocs = recurrenceCases.map((x) => x.ioc);
assert(Math.min(...directIocs) > 0.03 && Math.max(...directIocs) < 0.04);
assert(Math.min(...recurrenceIocs) > 0.03 && Math.max(...recurrenceIocs) < 0.04);

// Positive control: a 238-rune native-GP plant from solved p57 is encrypted
// and recovered exactly under every direct-seed and recurrence candidate.
const p57 = page(57).indices;
const plantedPlain = Array.from({ length: DEGREE }, (_, i) => p57[i % p57.length]);
const plantChecks = [];
for (const candidate of [
  ...directSeedCases.map((x) => ({ key: seed, layout: x.layout, sign: x.sign })),
  ...recurrenceCases.map((x) => ({
    key: generateNextBlock(
      polynomialChoices.find((p) => p.name === x.polynomial).coefficients
    ).next,
    layout: x.layout,
    sign: x.sign
  }))
]) {
  const plainPairs = pairRunes(plantedPlain, candidate.layout);
  const cipherPairs = plainPairs.map((value, i) =>
    candidate.sign < 0 ? add(value, candidate.key[i]) : sub(value, candidate.key[i])
  );
  const recovered = cipherPairs.map((value, i) =>
    candidate.sign < 0 ? sub(value, candidate.key[i]) : add(value, candidate.key[i])
  );
  assert.deepEqual(recovered, plainPairs);
  assert.deepEqual(flattenPairs(recovered), plantedPlain);
  plantChecks.push(true);
}
assert.equal(plantChecks.length, 20);

const allIocs = [...directIocs, ...recurrenceIocs];
const best = [...directSeedCases, ...recurrenceCases]
  .slice()
  .sort((a, b) => b.ioc - a.ioc)[0];

console.log(JSON.stringify({
  source: {
    gridBytes: bytes.length,
    gridSha256: "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290",
    q238Degree: DEGREE,
    q238CoefficientSha256HighToLow: qHash,
    q238ConditionalBase60Factorization: true,
    p3RedTriad: p3.indices.slice(HALF, HALF + 3),
    p39RedTriad: p39.indices.slice(HALF, HALF + 3),
    p3PrefixLength: p3Prefix.length,
    p39PrefixLength: p39Prefix.length,
    p36Runes: p36.length,
    p36MarginalNumeral: "1 after rune 99; not inserted into this 238-rune pair stream"
  },
  extension: {
    field: "GF(29^2)",
    definingRelation: "u^2 = 3u + 8",
    p3QuadraticCheck: true,
    factorizationWitness: "X + 2u (computational split witness only)",
    factorDegrees: [HALF, HALF],
    conjugateProductEqualsQ238: true,
    bothFactorsAndBothReciprocalsTested: true
  },
  rawP36Ioc,
  directSeed: {
    cases: directSeedCases,
    iocRange: [Math.min(...directIocs), Math.max(...directIocs)]
  },
  nextBlockLfsr: {
    cases: recurrenceCases,
    iocRange: [Math.min(...recurrenceIocs), Math.max(...recurrenceIocs)]
  },
  bestCandidate: {
    phase: best.phase,
    polynomial: best.polynomial || "direct seed",
    layout: best.layout,
    sign: best.sign,
    ioc: best.ioc,
    text: best.text
  },
  nativeP57PositiveControls: plantChecks.length,
  nativeP57AllRecoverExactly: true,
  status: "No coherent p36 plaintext or reusable key recovered; this bounded GF(29^2) seed-pad/LFSR family remains ciphertext-like."
}, null, 2));
console.log("PASS: exact GF(29^2) factorization, 20 original-source inverses, and 20 native-GP positive controls.");
