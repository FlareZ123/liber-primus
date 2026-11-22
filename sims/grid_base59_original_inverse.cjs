'use strict';
/**
 * Source-printed base59 alternative for the 32x8 Liber Primus numeric grid.
 *
 * Test four exact original-source byte readings: base60 and base59, each
 * with or without the five independently image-audited token corrections.
 * Train all AES-256-CTR / ChaCha20, key-order, byte-map, sign and 8! section
 * assignments only on the first 300 ciphertext runes of eight sections.
 * Freeze the fitted model for the following 300 and a further unseen
 * 300-rune continuation (seven eligible sections). Select the source variant
 * on training alone. Calibrate the ENTIRE variant/model selection against
 * source-token position shuffles, with the same shuffle shared across all
 * four correlated source interpretations.
 *
 * An English-GP original-length AES positive, encrypted using the real
 * source-derived corrected base59 key columns, must exactly roundtrip.
 *
 * Node22 CommonJS. Run: node sims/grid_base59_original_inverse.cjs
 * No original LP2 plaintext or authentic key is assumed.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const grid = require('../resources/liber-primus/base60-grid.json');
const { inputs, cipherBytes, ioc } = require('./grid_section_column_keys.cjs');
const { evaluateSource, positiveControl } =
  require('./grid_five_cell_corrected_inversion.cjs');

const RADICES = [60, 59];
const CORRECTED = [false, true];
const TRAIN = 300, WINDOW = 300, THIRD = TRAIN + WINDOW;
const SHUFFLES = 120;
const ALPHABET60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const ALPHABET59 = ALPHABET60.replace('f', '');
const PRINTED = grid.rows.flat();
const REPAIRS = [[45, 107, 81], [50, 47, 21],
  [165, 18, 47], [172, 148, 174], [246, 198, 224]];
assert.equal(grid.alphabet, ALPHABET60);
assert.equal(PRINTED.length, 256);
assert.equal(ALPHABET59.length, 59);
assert.equal(PRINTED.some(token => token.includes('f')), false);

/** @param {number} byteValue */
function token60(byteValue) {
  assert(Number.isInteger(byteValue) && byteValue >= 0 && byteValue < 256);
  return ALPHABET60[Math.floor(byteValue / 60)] + ALPHABET60[byteValue % 60];
}

/** @param {string} token @param {string} alphabet */
function parseByte(token, alphabet) {
  assert.equal(token.length, 2);
  const hi = alphabet.indexOf(token[0]), lo = alphabet.indexOf(token[1]);
  assert(hi >= 0 && lo >= 0);
  const value = hi * alphabet.length + lo;
  assert(value >= 0 && value < 256);
  return value;
}

/** @param {boolean} corrected */
function sourceTokens(corrected) {
  const tokens = PRINTED.slice();
  if (corrected) {
    for (const [index, oldByte, newByte] of REPAIRS) {
      assert.equal(parseByte(tokens[index], ALPHABET60), oldByte);
      tokens[index] = token60(newByte);
    }
  }
  return tokens;
}

/**
 * @param {number} radix
 * @param {boolean} corrected
 * @param {number[]|null} permutation
 * @returns {number[][]}
 */
function columns(radix, corrected, permutation = null) {
  assert(RADICES.includes(radix));
  const tokens = sourceTokens(corrected);
  const ordered = permutation ? permutation.map(index => tokens[index]) : tokens;
  const alphabet = radix === 59 ? ALPHABET59 : ALPHABET60;
  const bytes = ordered.map(token => parseByte(token, alphabet));
  return Array.from({ length: 8 }, (_, column) =>
    Array.from({ length: 32 }, (_, row) => bytes[row * 8 + column]));
}

/**
 * @param {number[][]} groups
 * @param {number[][]} sourceColumns
 * @param {ReturnType<typeof evaluateSource>['model']} model
 */
function thirdIoC(groups, sourceColumns, model) {
  let total = 0, sampled = 0, eligible = 0;
  for (let section = 0; section < groups.length; section++) {
    if (groups[section].length < THIRD + WINDOW) continue;
    eligible++;
    const col = sourceColumns[model.assignment[section]];
    const key = model.reverse ? col.slice().reverse() : col;
    const pad = cipherBytes(key, model.algorithm, THIRD + WINDOW)
      .subarray(THIRD, THIRD + WINDOW);
    const cipher = groups[section].slice(THIRD, THIRD + WINDOW);
    assert.equal(cipher.length, WINDOW);
    total += WINDOW * ioc(cipher, pad, model.sign, model.scaled);
    sampled += WINDOW;
  }
  assert.equal(eligible, 7);
  assert.equal(sampled, 2100);
  return total / sampled;
}

/**
 * @param {number[][]} groups
 * @param {number[]|null} permutation
 */
function evaluateVariants(groups, permutation) {
  const variants = [];
  for (const radix of RADICES) for (const corrected of CORRECTED) {
    const keys = columns(radix, corrected, permutation);
    const estimate = evaluateSource(groups, keys);
    const third = thirdIoC(groups, keys, estimate.model);
    variants.push({
      name: 'base' + radix + (corrected ? '-five-token-audited' : '-as-transcribed'),
      radix, corrected,
      trainIoC: estimate.trainIoC,
      secondIoC: estimate.holdIoC,
      thirdIoC: third,
      model: estimate.model,
      keySha256: crypto.createHash('sha256')
        .update(Buffer.from(keys[0].flatMap((_, row) =>
          keys.map(col => col[row])))).digest('hex')
    });
  }
  variants.sort((a, b) => b.trainIoC - a.trainIoC);
  return variants;
}

/** @param {number} seed */
function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {()=>number} next */
function shuffledPositions(next) {
  const positions = Array.from({ length: 256 }, (_, i) => i);
  for (let i = positions.length - 1; i > 0; i--) {
    const j = next() % (i + 1);
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  return positions;
}

function main() {
  assert.equal(process.env.LP2_GRID_RADIX, undefined);
  assert.equal(process.env.LP2_GRID_FIVE_CORRECTIONS, undefined);
  const { groups, columnKeys } = inputs();
  assert.deepEqual(columns(60, false), columnKeys);
  assert.equal(groups.length, 8);
  assert.equal(groups.reduce((sum, group) => sum + group.length, 0), 12956);

  // Check that the shared old inversion also consumes the alternative
  // correctly through its opt-in input contract, without touching defaults.
  process.env.LP2_GRID_RADIX = '59';
  process.env.LP2_GRID_FIVE_CORRECTIONS = '1';
  const optional = inputs();
  delete process.env.LP2_GRID_RADIX;
  delete process.env.LP2_GRID_FIVE_CORRECTIONS;
  assert.deepEqual(optional.columnKeys, columns(59, true));

  const counts = columns(60, false).flatMap((_, index) => []);
  const flat60 = sourceTokens(false).map(token => parseByte(token, ALPHABET60));
  const flat59 = sourceTokens(false).map(token => parseByte(token, ALPHABET59));
  assert.equal(flat60.filter((v, i) => v !== flat59[i]).length, 220);
  assert.equal(counts.length, 0);

  const original = evaluateVariants(groups, null);
  const selected = original[0];
  const positive = positiveControl(groups, columns(59, true));
  assert.equal(positive.symbolsRoundTripped, 12956);
  assert(positive.correctModelRecovered,
    'A genuine source-key English control must recover algorithm and all eight key assignments');

  const next = seededRandom(0x90593301);
  const nullScores = [];
  let exceed = 0;
  for (let trial = 0; trial < SHUFFLES; trial++) {
    const selectedNull = evaluateVariants(groups, shuffledPositions(next))[0];
    nullScores.push(selectedNull.thirdIoC);
    if (selectedNull.thirdIoC >= selected.thirdIoC) exceed++;
  }
  const output = {
    hypothesis: 'Original 256 printed numeric-grid tokens in base59 versus base60, with both source-transcription variants',
    source: 'resources/liber-primus/base60-grid.json; independently reported five audited token corrections',
    originalRuneCount: 12956,
    changedBytesBetweenUncorrectedRadices: 220,
    finiteOriginalModels: '4 source variants x 16 AES/ChaCha key/mode/sign variants x exact 8! assignment',
    trainRunes: 2400, secondRunes: 2400, thirdRunes: 2100,
    sourceVariantsSelectedOnTrainOnly: original,
    selectedOnTrain: selected.name,
    genuineSourceControl: positive,
    null: {
      repetitions: SHUFFLES,
      input: '256 original printed token positions jointly permuted for all four source variants',
      modelSelection: 'best train IoC of four variants and their 16 exact-assignment fits',
      meanThirdIoC: nullScores.reduce((sum, v) => sum + v, 0) / SHUFFLES,
      maxThirdIoC: Math.max(...nullScores),
      outrankingOriginalOnUnseenThird: exceed,
      addOneUpperTail: (exceed + 1) / (SHUFFLES + 1)
    },
    note: 'Model-specific AES/ChaCha direct-GP attack; correct source radix is not established by this test alone. Exact forward original re-encryption needs genuinely recovered plaintext.'
  };
  console.log(JSON.stringify(output, null, 2));
  return output;
}

if (require.main === module) main();
module.exports = { columns, evaluateVariants, thirdIoC, main };
