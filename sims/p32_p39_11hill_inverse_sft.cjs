'use strict';

/**
 * Test the source-paired p32/p39 121-rune blocks under the standard 11x11
 * Hill cipher. The one-based red-triad page reading is provisional; p32's
 * 11x11 reflow is separately motivated by the signed 2016 image-axis map.
 *
 * Fixed candidates only:
 *   - p32 as key, p39 local 119..end as ciphertext;
 *   - reverse key/cipher direction;
 *   - standard column-vector and row-vector conventions.
 *
 * No D4 search, phase, shift, transposition, fitted parameter, or extra layer.
 * Original re-encryption is an implementation invariant, not key evidence.
 *
 * Run: node sims/p32_p39_11hill_inverse_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const quadgramRaw = fs.readFileSync(
  path.join(root, 'resources', 'control', 'duko_round27_english_quadgrams.txt'), 'utf8'
);
const shakespeareRaw = fs.readFileSync(
  path.join(root, 'resources', 'control', 'shakespeare_first300k.txt'), 'utf8'
);
const ALPHABET = 29;
const N = 11;
const BLOCKS = 11;

function pageIndices(page) {
  const record = corpus.pages.find((item) => item.page === page);
  assert.ok(record, 'Missing physical page ' + page);
  assert.equal(record.indices.length, record.runic_count);
  assert.ok(record.indices.every((x) => Number.isInteger(x) && x >= 0 && x < ALPHABET));
  return record.indices.slice();
}

const p32 = pageIndices(32);
const p39 = pageIndices(39);
const p39SecondUnit = p39.slice(119);
const p56 = pageIndices(56);
const p57 = pageIndices(57);
assert.equal(p32.length, 121);
assert.equal(p39.length, 240);
assert.equal(p39SecondUnit.length, 121);
assert.equal(p56.length + p57.length, 180);

function mod29(value) {
  return ((value % ALPHABET) + ALPHABET) % ALPHABET;
}

function pow29(base, exponent) {
  let result = 1;
  let value = mod29(base);
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = mod29(result * value);
    value = mod29(value * value);
    e >>= 1;
  }
  return result;
}

function matrixFrom(values) {
  assert.equal(values.length, N * N);
  return Array.from({ length: N }, (_, r) => values.slice(r * N, (r + 1) * N));
}

/** Gauss-Jordan inverse and determinant over GF(29). */
function invertMatrix(matrix) {
  const augmented = matrix.map((row, r) =>
    row.map(mod29).concat(Array.from({ length: N }, (_, c) => Number(r === c)))
  );
  let determinant = 1;

  for (let c = 0; c < N; c++) {
    let pivotRow = c;
    while (pivotRow < N && augmented[pivotRow][c] === 0) pivotRow++;
    if (pivotRow === N) return { inverse: null, determinant: 0 };

    if (pivotRow !== c) {
      [augmented[c], augmented[pivotRow]] = [augmented[pivotRow], augmented[c]];
      determinant = mod29(-determinant);
    }

    const pivot = augmented[c][c];
    determinant = mod29(determinant * pivot);
    const inversePivot = pow29(pivot, 27);
    for (let j = 0; j < 2 * N; j++) {
      augmented[c][j] = mod29(augmented[c][j] * inversePivot);
    }

    for (let r = 0; r < N; r++) {
      if (r === c) continue;
      const factor = augmented[r][c];
      if (factor === 0) continue;
      for (let j = 0; j < 2 * N; j++) {
        augmented[r][j] = mod29(augmented[r][j] - factor * augmented[c][j]);
      }
    }
  }

  return {
    inverse: augmented.map((row) => row.slice(N)),
    determinant
  };
}

/**
 * Apply one matrix to eleven consecutive 11-rune vectors.
 * column: output = K * input
 * row:    output = input * K
 */
function applyMatrix(matrix, stream, convention) {
  assert.equal(stream.length, N * BLOCKS);
  const output = [];

  for (let block = 0; block < BLOCKS; block++) {
    const vector = stream.slice(block * N, (block + 1) * N);

    if (convention === 'column') {
      for (let r = 0; r < N; r++) {
        let sum = 0;
        for (let c = 0; c < N; c++) sum += matrix[r][c] * vector[c];
        output.push(mod29(sum));
      }
    } else {
      const transformed = Array(N).fill(0);
      for (let c = 0; c < N; c++) {
        let sum = 0;
        for (let r = 0; r < N; r++) sum += vector[r] * matrix[r][c];
        transformed[c] = mod29(sum);
      }
      output.push(...transformed);
    }
  }
  return output;
}

const quadgrams = new Map();
let quadgramTotal = 0;
for (const line of quadgramRaw.trim().split(/\r?\n/u)) {
  const match = /^([A-Z]{4})\s+(\d+)$/u.exec(line);
  if (!match) continue;
  const count = Number(match[2]);
  quadgrams.set(match[1], count);
  quadgramTotal += count;
}
assert.equal(quadgrams.size, 79495);
assert.equal(quadgramTotal, 7266795);

/** English-character quadgram score after canonical GP transliteration. */
function scoreLetters(letters) {
  const text = letters.toUpperCase().replace(/[^A-Z]/gu, '');
  let logProbability = 0;
  let missing = 0;
  let count = 0;
  for (let i = 0; i + 4 <= text.length; i++) {
    const gram = text.slice(i, i + 4);
    const observed = quadgrams.get(gram);
    if (observed === undefined) missing++;
    logProbability += Math.log((observed === undefined ? 0.01 : observed) / quadgramTotal);
    count++;
  }
  return {
    mean_nats_per_quadgram: Number((logProbability / count).toFixed(8)),
    quadgrams: count,
    missing_quadgrams: missing,
    missing_rate: Number((missing / count).toFixed(6))
  };
}

function scoreGP(indices) {
  return scoreLetters(indices.map((index) => corpus.translit[index]).join(''));
}

function transliterate(indices) {
  return indices.map((index) => corpus.translit[index]).join('');
}

const p32Matrix = matrixFrom(p32);
const p39Matrix = matrixFrom(p39SecondUnit);
const p32Inverse = invertMatrix(p32Matrix);
const p39Inverse = invertMatrix(p39Matrix);
assert.equal(p32Inverse.determinant, 8);
assert.equal(p39Inverse.determinant, 9);
assert.ok(p32Inverse.inverse && p39Inverse.inverse);

const nativeSolved = p56.concat(p57);
const nativePlant = nativeSolved.slice(0, 121);
assert.equal(nativePlant.length, 121);

const keyCandidates = [
  { keyName: 'p32', cipherName: 'p39 local119..end', key: p32, cipher: p39SecondUnit, inverse: p32Inverse },
  { keyName: 'p39 local119..end', cipherName: 'p32', key: p39SecondUnit, cipher: p32, inverse: p39Inverse }
];

const results = [];
for (const candidate of keyCandidates) {
  const keyMatrix = matrixFrom(candidate.key);
  for (const convention of ['column', 'row']) {
    const decoded = applyMatrix(candidate.inverse.inverse, candidate.cipher, convention);
    const reencrypted = applyMatrix(keyMatrix, decoded, convention);
    assert.deepEqual(reencrypted, candidate.cipher);

    const plantedCipher = applyMatrix(keyMatrix, nativePlant, convention);
    const recoveredPlant = applyMatrix(candidate.inverse.inverse, plantedCipher, convention);
    assert.deepEqual(recoveredPlant, nativePlant);

    results.push({
      key: candidate.keyName,
      ciphertext: candidate.cipherName,
      convention,
      determinant_mod29: candidate.inverse.determinant,
      decoded_score: scoreGP(decoded),
      decoded_transliteration: transliterate(decoded),
      original_reencrypts_exactly: true,
      solved_p56_p57_plant_recovers_exactly: true
    });
  }
}

const nativeShakespeareLetters = shakespeareRaw.toUpperCase().replace(/[^A-Z]/gu, '');
const rawScores = {
  p32: scoreGP(p32),
  p39SecondUnit: scoreGP(p39SecondUnit),
  solved_p56_plus_p57: scoreGP(nativeSolved),
  solved_121_rune_plant: scoreGP(nativePlant),
  native_shakespeare: scoreLetters(nativeShakespeareLetters)
};

assert.equal(results.length, 4);
assert.ok(results.every((item) =>
  item.decoded_score.mean_nats_per_quadgram < rawScores.solved_p56_plus_p57.mean_nats_per_quadgram
));

console.log(JSON.stringify({
  input: 'original p32 (121 runes) and original p39 local119..end (121 runes)',
  matrix_shape: '11x11, row-major; eleven 11-rune blocks',
  determinant_mod29: { p32: p32Inverse.determinant, p39_second_unit: p39Inverse.determinant },
  language_model: {
    source: 'resources/control/duko_round27_english_quadgrams.txt',
    unique_quadgrams: quadgrams.size,
    total_observations: quadgramTotal,
    score_unit: 'mean natural log probability per transliterated English-character quadgram'
  },
  raw_and_native_references: rawScores,
  candidates: results,
  conclusion: 'All four standard 11x11 Hill candidates are nonlinguistic. Exact re-encryption and solved-page plants validate implementation only; neither authenticates a key or operation.'
}, null, 2));
