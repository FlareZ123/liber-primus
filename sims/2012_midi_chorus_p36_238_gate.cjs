"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const chorusDoc = read("resources/control/cicada2012_blake_chorus.txt");
const midi = JSON.parse(read("im-results/2012-midi-chorus-p36-238-inputs.json"));
const p36 = corpus.pages.find((page) => page.page === 36).indices;
const sourceText = chorusDoc.split("BEGIN SOURCE TEXT")[1].split("END SOURCE TEXT")[0].trim();
const letters = sourceText.replace(/[^A-Za-z]/g, "").toUpperCase().split("");
const P = 29;

assert.equal(p36.length, 238);
assert.equal(letters.length, 238);
assert.equal(midi.first_cycle_note_plus_delta_sums.length, 238);
assert.equal(midi.source.blob_sha1, "11924e0e195208c2eea757655035e149fb8a190f");
assert.equal(midi.source.track2_note_off_events, 714);
assert.equal(midi.source.track2_unique_note_plus_delta_sums, 23);
assert.equal(midi.source.repeat_count, 3);

const keyAlphabet = midi.source.track2_key_alphabet;
const sums = midi.first_cycle_note_plus_delta_sums;
const sortedSums = [...new Set(sums)].sort((a, b) => a - b);
const rankKey = sums.map((sum) => sortedSums.indexOf(sum));
assert.equal(sortedSums.length, 23);
assert.equal(rankKey.map((rank) => keyAlphabet[rank]).join(""),
  letters.join("").toLowerCase());

const gpMap = new Map(corpus.translit.map((value, index) => [value, index]));
// Standard GP transliteration aliases: K is C; V is U.
gpMap.set("K", gpMap.get("C"));
gpMap.set("V", gpMap.get("U"));
const gpKey = letters.map((letter) => gpMap.get(letter));
assert.ok(gpKey.every(Number.isInteger));

const alphaKey = letters.map((letter) => letter.charCodeAt(0) - 65);
const eventSumMod29 = sums.map((sum) => sum % P);
const primeKey = gpKey.map((index) => corpus.prime[index] % P);
const phiPrimeKey = gpKey.map((index) => (corpus.prime[index] - 1) % P);

function mod(value) {
  return ((value % P) + P) % P;
}

function ioc(values) {
  const counts = Array(P).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0)
    / (values.length * (values.length - 1));
}

function decrypt(key, sign) {
  return p36.map((value, index) => mod(value + sign * key[index]));
}

function preview(values, length = 40) {
  return values.slice(0, length).map((value) => corpus.translit[value]).join(" ");
}

const keyTests = [
  ["Latin A=0, subtract", alphaKey, -1],
  ["Latin A=0, add", alphaKey, 1],
  ["GP-index chorus, subtract", gpKey, -1],
  ["GP-index chorus, add", gpKey, 1],
  ["2012 MIDI alphabet-rank, subtract", rankKey, -1],
  ["2012 MIDI alphabet-rank, add", rankKey, 1],
  ["MIDI note+delta mod29, subtract", eventSumMod29, -1],
  ["MIDI note+delta mod29, add", eventSumMod29, 1],
  ["GP prime-weight, subtract", primeKey, -1],
  ["GP prime-weight, add", primeKey, 1],
  ["GP phi(prime)-weight, subtract", phiPrimeKey, -1],
  ["GP phi(prime)-weight, add", phiPrimeKey, 1],
].map(([name, key, sign]) => {
  const output = decrypt(key, sign);
  return { name, ioc: ioc(output), prefix: preview(output) };
});

function mappingConflicts(source, target) {
  const mapping = new Map();
  let conflicts = 0;
  for (let i = 0; i < source.length; i++) {
    if (mapping.has(source[i]) && mapping.get(source[i]) !== target[i]) conflicts++;
    else mapping.set(source[i], target[i]);
  }
  return { conflicts, source_symbols: mapping.size };
}

const monoalphabetic = mappingConflicts(gpKey, p36);
const homophonic = mappingConflicts(p36, gpKey);

let exactAffineSubstitutions = 0;
for (let a = 1; a < P; a++) {
  for (let b = 0; b < P; b++) {
    if (gpKey.every((value, i) => mod(a * value + b) === p36[i])) {
      exactAffineSubstitutions++;
    }
  }
}

function inverse(value) {
  for (let candidate = 1; candidate < P; candidate++) {
    if (mod(value * candidate) === 1) return candidate;
  }
  throw new Error("No inverse in GF(29)");
}

function solve3(matrix, rhs) {
  const augmented = matrix.map((row, index) => [...row, rhs[index]].map(mod));
  for (let column = 0; column < 3; column++) {
    let pivot = column;
    while (pivot < 3 && augmented[pivot][column] === 0) pivot++;
    if (pivot === 3) return null;
    [augmented[column], augmented[pivot]] = [augmented[pivot], augmented[column]];
    const scale = inverse(augmented[column][column]);
    for (let k = column; k < 4; k++) augmented[column][k] = mod(augmented[column][k] * scale);
    for (let row = 0; row < 3; row++) {
      if (row === column) continue;
      const factor = augmented[row][column];
      for (let k = column; k < 4; k++) augmented[row][k] = mod(augmented[row][k] - factor * augmented[column][k]);
    }
  }
  return augmented.map((row) => row[3]);
}

function affinePairGate(plain, cipher) {
  const X = Array.from({ length: plain.length / 2 }, (_, i) => [plain[2 * i], plain[2 * i + 1]]);
  const Y = Array.from({ length: cipher.length / 2 }, (_, i) => [cipher[2 * i], cipher[2 * i + 1]]);
  let i1 = -1;
  for (let i = 1; i < X.length; i++) {
    if (X[i][0] !== X[0][0] || X[i][1] !== X[0][1]) { i1 = i; break; }
  }
  assert.notEqual(i1, -1);
  let i2 = -1;
  const dx1 = [mod(X[i1][0] - X[0][0]), mod(X[i1][1] - X[0][1])];
  for (let i = 1; i < X.length; i++) {
    const dx2 = [mod(X[i][0] - X[0][0]), mod(X[i][1] - X[0][1])];
    if (mod(dx1[0] * dx2[1] - dx1[1] * dx2[0]) !== 0) { i2 = i; break; }
  }
  assert.notEqual(i2, -1);
  const fitIndices = [0, i1, i2];
  const A = fitIndices.map((index) => [X[index][0], X[index][1], 1]);
  const row0 = solve3(A, fitIndices.map((index) => Y[index][0]));
  const row1 = solve3(A, fitIndices.map((index) => Y[index][1]));
  assert.ok(row0 && row1);
  const matrix = [[row0[0], row0[1]], [row1[0], row1[1]]];
  const bias = [row0[2], row1[2]];
  const determinant = mod(matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]);
  const matches = X.reduce((count, point, index) => {
    const out0 = mod(matrix[0][0] * point[0] + matrix[0][1] * point[1] + bias[0]);
    const out1 = mod(matrix[1][0] * point[0] + matrix[1][1] * point[1] + bias[1]);
    return count + (out0 === Y[index][0] && out1 === Y[index][1] ? 1 : 0);
  }, 0);
  return { fit_indices: fitIndices, matrix, bias, determinant, matches, total: X.length };
}

const pairAffine = affinePairGate(gpKey, p36);

function polyMultiply(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) out[i + j] = mod(out[i + j] + a[i] * b[j]);
  }
  return out;
}
function polyDivide(dividend, divisor) {
  const remainder = dividend.slice();
  while (remainder.length && remainder[remainder.length - 1] === 0) remainder.pop();
  const quotient = Array(Math.max(1, remainder.length - divisor.length + 1)).fill(0);
  while (remainder.length >= divisor.length) {
    const shift = remainder.length - divisor.length;
    const coefficient = mod(remainder[remainder.length - 1] * inverse(divisor[divisor.length - 1]));
    quotient[shift] = coefficient;
    for (let i = 0; i < divisor.length; i++) remainder[i + shift] = mod(remainder[i + shift] - coefficient * divisor[i]);
    while (remainder.length && remainder[remainder.length - 1] === 0) remainder.pop();
  }
  while (quotient.length && quotient[quotient.length - 1] === 0) quotient.pop();
  return { quotient, remainder };
}
const knownFactors = [
  [25, 10, 1],
  [11, 18, 1],
  [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1],
];
const knownProduct = knownFactors.reduce((product, factor) => polyMultiply(product, factor), [1]);
const p50Polynomial = grid.byte_rows.flat().reverse().map((value) => value % P);
const divided = polyDivide(p50Polynomial, knownProduct);
assert.equal(divided.remainder.length, 0);
assert.equal(divided.quotient.length, 239);
const q238Ascending = divided.quotient.map((value) => mod(value * 28));
assert.equal(q238Ascending[238], 1);
const q238Descending = q238Ascending.slice().reverse();
const q238High = q238Descending.slice(1);
const q238Low = q238Ascending.slice(0, 238);
const knownPlaintextKeyStream = p36.map((value, index) => mod(value - gpKey[index]));
function bestAffineMatch(source, target) {
  let best = { matches: -1, scale: null, offset: null };
  for (let scale = 1; scale < P; scale++) for (let offset = 0; offset < P; offset++) {
    let matches = 0;
    for (let i = 0; i < source.length; i++) if (mod(scale * source[i] + offset) === target[i]) matches++;
    if (matches > best.matches) best = { matches, scale, offset };
  }
  return best;
}
const q238Candidates = [
  ["GP-index chorus", gpKey],
  ["Latin A=0 chorus", alphaKey],
  ["2012 MIDI alphabet rank", rankKey],
  ["MIDI note+delta mod29", eventSumMod29],
  ["p36 known-plaintext keystream", knownPlaintextKeyStream],
];
const q238CrossRoundTests = q238Candidates.map(([name, sequence]) => ({
  name,
  exact_high_to_low: sequence.every((value, index) => value === q238High[index]),
  exact_low_to_high: sequence.every((value, index) => value === q238Low[index]),
  best_affine_high_to_low: bestAffineMatch(q238High, sequence),
  best_affine_low_to_high: bestAffineMatch(q238Low, sequence),
}));
const pageWords = parseSharedCorpus().byStartPage[36];
const chorusWords = sourceText.split(/\s+/).map((word) => word.replace(/[^A-Za-z]/g, "")).filter(Boolean);
const matching238Pages = corpus.pages.filter((page) => page.runic_count === 238).map((page) => page.page);

function columnarEncrypt(values, width, order) {
  assert.equal(values.length % width, 0);
  const columns = Array.from({ length: width }, () => []);
  for (let index = 0; index < values.length; index++) columns[index % width].push(values[index]);
  return order.flatMap((column) => columns[column]);
}

function columnarDecrypt(values, width, order) {
  assert.equal(values.length % width, 0);
  const rows = values.length / width;
  const columns = Array(width);
  let cursor = 0;
  for (const column of order) {
    columns[column] = values.slice(cursor, cursor + rows);
    cursor += rows;
  }
  const output = [];
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < width; column++) output.push(columns[column][row]);
  }
  return output;
}

// Exact historical column orders from workplace/2012-845145127-lp2-cross-round-route.md.
const sourceFixedColumnarOrders = [
  { name: "2012 seven-column", width: 7, order: [0, 6, 2, 5, 1, 4, 3] },
  { name: "2014 fourteen-column", width: 14, order: [2, 8, 9, 1, 12, 13, 11, 4, 5, 7, 3, 0, 6, 10] },
];
const sourceFixedTranspositionTests = [];
for (const { name, width, order } of sourceFixedColumnarOrders) {
  for (const direction of ["forward", "inverse"]) {
    const transformedKey = direction === "forward"
      ? columnarEncrypt(gpKey, width, order)
      : columnarDecrypt(gpKey, width, order);
    const cipherDirection = direction === "forward" ? "inverse" : "forward";
    const transformedCipher = cipherDirection === "forward"
      ? columnarEncrypt(p36, width, order)
      : columnarDecrypt(p36, width, order);
    for (const sign of [-1, 1]) {
      const keyOutput = decrypt(transformedKey, sign);
      const cipherOutput = transformedCipher.map((value, index) => mod(value + sign * gpKey[index]));
      const cipherOutputReordered = direction === "forward"
        ? columnarEncrypt(cipherOutput, width, order)
        : columnarDecrypt(cipherOutput, width, order);
      const exactCiphertextSideEquivalence = keyOutput.every((value, index) => value === cipherOutputReordered[index]);
      assert.ok(exactCiphertextSideEquivalence);
      assert.equal(ioc(keyOutput), ioc(cipherOutput));
      sourceFixedTranspositionTests.push({
        operation: name, direction, sign, ioc: ioc(keyOutput),
        ciphertext_side_ioc: ioc(cipherOutput),
        exact_ciphertext_side_equivalence: exactCiphertextSideEquivalence,
        prefix: preview(keyOutput, 60),
      });
    }
  }
}

const result = {
  classification: "Source-motivated cross-round length match; bounded negative for direct and source-fixed historical columnar running-key operations, plus full-block field-key transfers; no plaintext or key recovered.",
  source_alignment: {
    p36_runes: p36.length,
    p36_is_only_238_rune_page: matching238Pages.length === 1 && matching238Pages[0] === 36,
    chorus_alphabetic_letters: letters.length,
    track2_note_off_events: midi.source.track2_note_off_events,
    track2_cycle_length: midi.source.cycle_length,
    track2_repeat_count: midi.source.repeat_count,
    track2_unique_note_plus_delta_sums: sortedSums.length,
    p36_page_local_words: pageWords.length,
    chorus_words: chorusWords.length,
  },
  statistics: {
    uniform_ioc_1_over_29: 1 / P,
    p36_ciphertext_ioc: ioc(p36),
    chorus_gp_ioc: ioc(gpKey),
    p36_distinct_runes: new Set(p36).size,
    chorus_gp_distinct_symbols: new Set(gpKey).size,
  },
  direct_running_key_tests: keyTests,\n  source_fixed_historical_columnar_tests: {\n    orders: sourceFixedColumnarOrders,\n    tests: sourceFixedTranspositionTests,\n    note: "The corresponding inverse permutation on p36 with the untransposed chorus is exactly permutation-equivalent; the script verifies this identity. No arbitrary column orders or phases are searched."\n  },
  source_crib_tests: {
    plaintext_symbol_to_cipher_conflicts: monoalphabetic.conflicts,
    plaintext_symbols: monoalphabetic.source_symbols,
    cipher_symbol_to_plaintext_conflicts: homophonic.conflicts,
    cipher_symbols: homophonic.source_symbols,
    exact_affine_monoalphabetic_maps: exactAffineSubstitutions,
    adjacent_pair_affine_GF29: pairAffine,
  },
  q238_2014_table_crossround_tests: q238CrossRoundTests,
  decision: "Do not extend this into phase/reversal/permutation sweeps. Retain the 238 alignment as an unresolved clue only; a new attempt needs an independently source-selected reversible operation."
};

assert.equal(pairAffine.matches, 3);
assert.equal(pairAffine.determinant, 3);
assert.equal(monoalphabetic.conflicts, 207);
assert.equal(homophonic.conflicts, 191);
assert.equal(exactAffineSubstitutions, 0);
assert.equal(q238CrossRoundTests.find((x) => x.name === "2012 MIDI alphabet rank").best_affine_high_to_low.matches, 19);
assert.equal(q238CrossRoundTests.find((x) => x.name === "p36 known-plaintext keystream").best_affine_low_to_high.matches, 20);
assert.equal(sourceFixedTranspositionTests.length, 8);
const expectedTranspositionIocs = [
  0.03623727972201539, 0.033826188703329436,
  0.03559904974648087, 0.03481899088749424,
  0.03517356309612452, 0.03527993475871361,
  0.03503173421267241, 0.034358047016274866,
];
sourceFixedTranspositionTests.forEach((test, index) => {
  assert.ok(Math.abs(test.ioc - expectedTranspositionIocs[index]) < 1e-14);
  assert.equal(test.exact_ciphertext_side_equivalence, true);
});
console.log(JSON.stringify(result, null, 2));
