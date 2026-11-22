"use strict";

/**
 * GF(257) Reed-Solomon erasure interpretation of the LP2 p50 32x8 panel.
 * Tests the source-fixed 180-interior / 76-border split against solved
 * p56+p57 plaintext and the 76-rune p55 target.
 *
 * Run: node sims/lp2_gf257_inner180_rs_erasure_sft.cjs
 * Node 22 / CommonJS / read-only / no dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const MOD = 257;
const mod = n => ((n % MOD) + MOD) % MOD;

function power(a, e) {
  let result = 1;
  a = mod(a);
  while (e) {
    if (e % 2) result = mod(result * a);
    a = mod(a * a);
    e = Math.floor(e / 2);
  }
  return result;
}
const inverse = a => {
  assert.notEqual(mod(a), 0, "cannot invert zero");
  return power(a, 255);
};

function interpolateNewton(xs, ys) {
  assert.equal(xs.length, ys.length);
  assert.equal(new Set(xs).size, xs.length, "evaluation coordinates must be distinct");
  const divided = ys.map(mod);
  for (let j = 1; j < divided.length; j++) {
    for (let i = divided.length - 1; i >= j; i--) {
      divided[i] = mod(
        (divided[i] - divided[i - 1]) * inverse(xs[i] - xs[i - j])
      );
    }
  }
  return { xs: xs.slice(), divided };
}

function evaluateNewton(poly, x) {
  let value = poly.divided[poly.divided.length - 1];
  for (let i = poly.divided.length - 2; i >= 0; i--) {
    value = mod(value * (x - poly.xs[i]) + poly.divided[i]);
  }
  return value;
}

function evaluateCoefficients(coefficients, x) {
  let value = 0;
  for (let i = coefficients.length - 1; i >= 0; i--) {
    value = mod(value * x + coefficients[i]);
  }
  return value;
}

const page = n => {
  const found = corpus.pages.find(p => p.page === n);
  assert(found, "missing physical LP2 page " + n);
  return found;
};
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
function nativeRunes(sectionName) {
  const section = solved.sections.find(s => s.name === sectionName);
  assert(section, "missing solved native source section " + sectionName);
  return Array.from(section.source_text)
    .filter(character => runeIndex.has(character))
    .map(character => runeIndex.get(character));
}

const p0 = page(0);
const p23 = page(23);
const p55 = page(55);
const p56 = page(56);
const p57 = page(57);
const p56Plain = nativeRunes("p56_an_end");
const p57Plain = nativeRunes("p57_parable");
const knownPlain = [...p56Plain, ...p57Plain];

assert.equal(p55.indices.length, 76);
assert.equal(p56.indices.length, 85);
assert.equal(p57.indices.length, 95);
assert.deepEqual([p56Plain.length, p57Plain.length, knownPlain.length], [85, 95, 180]);

// Recheck the original p0 FFF source packet that motivates GF(257), g=38,
// and phase 48. The interpretation remains a hypothesis, not an authored key.
const fffStarts = [177, 183, 189];
const fffEnds = [183, 189, 192];
const fffWords = fffStarts.map((start, i) => p0.indices.slice(start, fffEnds[i]));
assert(fffWords.every(word => word[0] === 0));
const fffSums = fffWords.map(word =>
  word.reduce((sum, rune) => sum + corpus.prime[rune], 0)
);
assert.deepEqual(fffSums, [257, 295, 48]);
const generator = fffSums[1] % MOD;
const phase = fffSums[2];
assert.equal(generator, 38);
assert.equal(phase, 48);
assert.equal(new Set(Array.from({ length: 256 }, (_, i) => power(generator, i))).size, 256);
assert.equal(power(generator, 180), 213);
assert.equal(power(generator, 76), 146);
assert.equal(p23.indices.length, 213);

// Reconstruct the source panel's physical 32x8 layout and its one-shed
// interior/border split. The base60 byte interpretation is a derived
// hypothesis, so byte-dependent conclusions are reported separately.
assert.equal(grid.bytes.length, 256);
assert.equal(grid.pages.reduce((sum, p) => sum + p.rows, 0), 32);
assert(grid.pages.every(p => p.cols === 8 && p.tokens.length === p.rows * 8));
const alphabet60 = Array.from(grid.alphabet);
const digit = new Map(alphabet60.map((c, i) => [c, i]));
const tokenBytes = grid.pages.flatMap(p => p.tokens).map(token => {
  assert.equal(token.length, 2);
  assert(digit.has(token[0]) && digit.has(token[1]));
  return 60 * digit.get(token[0]) + digit.get(token[1]);
});
assert.deepEqual(tokenBytes, grid.bytes);
const bytes = grid.bytes;

const interior = [];
const borderRowMajor = [];
for (let row = 0; row < 32; row++) {
  for (let col = 0; col < 8; col++) {
    const position = row * 8 + col;
    if (row > 0 && row < 31 && col > 0 && col < 7) interior.push(position);
    else borderRowMajor.push(position);
  }
}
const borderClockwise = [
  ...Array.from({ length: 8 }, (_, col) => col),
  ...Array.from({ length: 30 }, (_, i) => (i + 1) * 8 + 7),
  ...Array.from({ length: 8 }, (_, i) => 31 * 8 + 7 - i),
  ...Array.from({ length: 30 }, (_, i) => (30 - i) * 8)
];
assert.deepEqual([interior.length, borderRowMajor.length, borderClockwise.length], [180, 76, 76]);

const coordinateModes = [
  { name: "cell ordinal", x: position => position },
  { name: "GF257 primitive-root phase48", x: position => power(generator, position + phase) }
];
const primeMap = new Map(corpus.prime.map((value, index) => [value, index]));
const symbolModes = [
  { name: "GP index", values: knownPlain, valid: value => value >= 0 && value < 29,
    decode: value => value },
  { name: "GP prime weight", values: knownPlain.map(index => corpus.prime[index]),
    valid: value => primeMap.has(value), decode: value => primeMap.get(value) }
];

function ioc(values) {
  const histogram = Array(29).fill(0);
  values.forEach(value => histogram[mod(value) % 29]++);
  return histogram.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}
function transliterate(values) {
  return values.map(value => corpus.translit[mod(value) % 29]).join("");
}
function directAlphabetCount(values, symbolMode) {
  return values.filter(symbolMode.valid).length;
}

const degree179 = [];
const degree75 = [];
for (const coordinates of coordinateModes) {
  const interiorX = interior.map(coordinates.x);
  for (const symbols of symbolModes) {
    // Dimension 180: the 180 known interior symbols determine degree <=179;
    // evaluate the 76 border positions as the candidate p55 plaintext.
    const fullPoly = interpolateNewton(interiorX, symbols.values);
    const borderValues = borderRowMajor.map(position =>
      evaluateNewton(fullPoly, coordinates.x(position))
    );
    const borderClockwiseValues = borderClockwise.map(position =>
      evaluateNewton(fullPoly, coordinates.x(position))
    );
    degree179.push({
      coordinates: coordinates.name,
      embedding: symbols.name,
      directAlphabetCount: directAlphabetCount(borderValues, symbols),
      totalBorder: 76,
      mod29IoC: ioc(borderValues),
      rowMajorMod29Preview: transliterate(borderValues).slice(0, 32),
      clockwiseMod29Preview: transliterate(borderClockwiseValues).slice(0, 32),
      rawBorderFirst12: borderValues.slice(0, 12)
    });

    // Dimension 76: fit degree <=75 from the first 76 interior symbols,
    // then use the remaining 104 original known symbols as a blind holdout.
    const reducedPoly = interpolateNewton(interiorX.slice(0, 76), symbols.values.slice(0, 76));
    const heldoutPredictions = interiorX.slice(76).map(x =>
      evaluateNewton(reducedPoly, x)
    );
    const heldoutMatches = heldoutPredictions.reduce((sum, value, i) =>
      sum + (value === symbols.values[i + 76] ? 1 : 0), 0
    );
    const firstMismatchOffset = heldoutPredictions.findIndex((value, i) =>
      value !== symbols.values[i + 76]
    );
    const candidateBorder = borderRowMajor.map(position =>
      evaluateNewton(reducedPoly, coordinates.x(position))
    );
    degree75.push({
      coordinates: coordinates.name,
      embedding: symbols.name,
      heldoutMatches,
      heldoutCount: 104,
      firstMismatchOffset,
      firstMismatch: firstMismatchOffset < 0 ? null : {
        interiorPosition: interior[76 + firstMismatchOffset],
        expected: symbols.values[76 + firstMismatchOffset],
        predicted: heldoutPredictions[firstMismatchOffset]
      },
      directAlphabetCount: directAlphabetCount(candidateBorder, symbols),
      totalBorder: 76,
      rawBorderFirst12: candidateBorder.slice(0, 12)
    });
  }
}

// Directly treating the decoded p50 base60 bytes as field abscissas is
// impossible for the known interior stream: repeated x values disagree.
const byteCoordinateGroups = new Map();
interior.forEach((position, i) => {
  const x = bytes[position];
  if (!byteCoordinateGroups.has(x)) byteCoordinateGroups.set(x, []);
  byteCoordinateGroups.get(x).push(knownPlain[i]);
});
const conflictingByteCoordinateGroups = [...byteCoordinateGroups.values()]
  .filter(values => new Set(values).size > 1).length;

// Also test whether the p50 byte vector itself is a degree <=179 RS word
// on either source-fixed coordinate clock.
const p50ByteCodeword = coordinateModes.map(coordinates => {
  const poly = interpolateNewton(
    interior.map(coordinates.x),
    interior.map(position => bytes[position])
  );
  const matches = borderRowMajor.filter(position =>
    evaluateNewton(poly, coordinates.x(position)) === bytes[position]
  ).length;
  return { coordinates: coordinates.name, borderMatches: matches, borderCount: 76 };
});

// Synthetic positive controls: the interpolation implementation must
// recover held-out interior and border symbols from genuine RS codewords.
const positiveControls = [];
for (const coordinates of coordinateModes) {
  for (const dimension of [76, 180]) {
    const coefficients = Array.from({ length: dimension }, (_, i) =>
      mod(i * 73 + 19)
    );
    const allInteriorValues = interior.map(position =>
      evaluateCoefficients(coefficients, coordinates.x(position))
    );
    const fit = interpolateNewton(
      interior.slice(0, dimension).map(coordinates.x),
      allInteriorValues.slice(0, dimension)
    );
    const heldoutInterior = interior.slice(dimension);
    const interiorRecovered = heldoutInterior.filter((position, i) =>
      evaluateNewton(fit, coordinates.x(position)) === allInteriorValues[dimension + i]
    ).length;
    const borderRecovered = borderRowMajor.filter(position =>
      evaluateNewton(fit, coordinates.x(position)) ===
      evaluateCoefficients(coefficients, coordinates.x(position))
    ).length;
    assert.equal(interiorRecovered, heldoutInterior.length);
    assert.equal(borderRecovered, 76);
    positiveControls.push({
      coordinates: coordinates.name,
      dimension,
      heldoutInteriorRecovered: interiorRecovered,
      heldoutInteriorCount: heldoutInterior.length,
      borderRecovered,
      borderCount: 76
    });
  }
}

const result = {
  kind: "GF257 RS(256,76/180) p50 circumference erasure gate",
  source: {
    p0FFFPrimeSums: fffSums,
    modulus: MOD,
    primitiveGenerator: generator,
    phase: phase,
    p23Runes: p23.indices.length,
    p50Shape: [32, 8],
    interiorCells: interior.length,
    borderCells: borderRowMajor.length,
    p55CipherRunes: p55.indices.length,
    p56PlainRunes: p56Plain.length,
    p57PlainRunes: p57Plain.length,
    knownPlainRunes: knownPlain.length,
    p50ByteUniqueValues: new Set(bytes).size,
    interiorByteCoordinateUniqueValues: byteCoordinateGroups.size,
    conflictingInteriorByteCoordinateGroups: conflictingByteCoordinateGroups
  },
  degree75: degree75,
  degree179: degree179,
  p50ByteVectorAsRSCodeword: p50ByteCodeword,
  syntheticPositiveControls: positiveControls,
  authenticatedUnknownPlaintext: false
};

assert.deepEqual(degree75.map(x => x.heldoutMatches), [1, 0, 0, 1]);
assert(degree75.every(x => x.firstMismatchOffset === 0));
assert.deepEqual(degree179.map(x => x.directAlphabetCount), [7, 9, 13, 6]);
assert.deepEqual(p50ByteCodeword.map(x => x.borderMatches), [0, 0]);
assert.equal(conflictingByteCoordinateGroups, 35);
assert.equal(positiveControls.length, 4);

console.log(JSON.stringify(result, null, 2));
