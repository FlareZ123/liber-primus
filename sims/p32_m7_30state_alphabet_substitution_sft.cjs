'use strict';

/**
 * Test the natural direct action of the source-derived p32 M7 map on
 * P^1(F_29), using the 29 GP runes as finite points and word-boundary as
 * infinity. This is a bounded substitution test, not a claim that the
 * manuscript instructs this encoding.
 *
 * Targets are fixed from source geometry:
 *   1. full physical pp33-39 (the seven-page cuneiform illustration family);
 *   2. the exact three-dot bracket p33 local91 through p39 local119.
 *
 * Only M7 and M7^-1 are tested. No arbitrary infinity assignment, key search,
 * page reset, phase, or additional transformation is allowed.
 *
 * Run: node sims/p32_m7_30state_alphabet_substitution_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const transcription = fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8'
);
const quadgramRaw = fs.readFileSync(
  path.join(root, 'resources', 'control', 'duko_round27_english_quadgrams.txt'), 'utf8'
);
const shakespeareRaw = fs.readFileSync(
  path.join(root, 'resources', 'control', 'shakespeare_first300k.txt'), 'utf8'
);

const P = 29;
const INF = null;
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const pageRuneCounts = Array(100).fill(0);
const words = [];
let page = 0;
let currentWord = [];

function finishWord() {
  if (currentWord.length) {
    words.push(currentWord);
    currentWord = [];
  }
}

// Preserve word boundaries, but not line wraps or page boundaries.
for (const character of transcription) {
  const index = runeIndex.get(character);
  if (index !== undefined) {
    currentWord.push({ page, offset: pageRuneCounts[page], index });
    pageRuneCounts[page]++;
  } else if (character === '%') {
    page++;
  } else if (character === '/' || /\s/u.test(character)) {
    // Line-wrap marker / whitespace is not a symbol.
  } else {
    // Hyphens, punctuation and editorial markers delimit words.
    finishWord();
  }
}
finishWord();

const expectedPageCounts = [214, 261, 271, 238, 228, 228, 240];
for (let i = 0; i < 7; i++) {
  const physicalPage = 33 + i;
  const expected = expectedPageCounts[i];
  assert.equal(pageRuneCounts[physicalPage], expected);
  const record = corpus.pages.find((item) => item.page === physicalPage);
  assert.ok(record);
  assert.equal(record.runic_count, expected);
}

const selectors = {
  full_pp33_39: (rune) => rune.page >= 33 && rune.page <= 39,
  three_dot_bracket: (rune) =>
    (rune.page === 33 && rune.offset >= 91) ||
    (rune.page >= 34 && rune.page <= 38) ||
    (rune.page === 39 && rune.offset < 119)
};

function buildTarget(selector, expectedRunes, expectedSeparators) {
  const stream = [];
  for (const word of words) {
    const selected = word.filter(selector);
    if (!selected.length) continue;
    stream.push(...selected.map((rune) => rune.index));
    // Emit a separator only when this original word ends inside the target.
    if (selector(word[word.length - 1])) stream.push(INF);
  }
  assert.equal(stream.filter((x) => x !== INF).length, expectedRunes);
  assert.equal(stream.filter((x) => x === INF).length, expectedSeparators);
  return stream;
}

const targets = {
  full_pp33_39: buildTarget(selectors.full_pp33_39, 1680, 378),
  three_dot_bracket: buildTarget(selectors.three_dot_bracket, 1468, 326)
};

function mod29(value) {
  return ((value % P) + P) % P;
}

function inverse29(value) {
  for (let candidate = 1; candidate < P; candidate++) {
    if (mod29(value * candidate) === 1) return candidate;
  }
  throw new Error('No inverse in GF(29)');
}

const M7 = [[14, 25], [25, 28]];
const determinant = mod29(M7[0][0] * M7[1][1] - M7[0][1] * M7[1][0]);
assert.equal(determinant, 28);
const inverseDeterminant = inverse29(determinant);
const M7Inverse = [
  [mod29(M7[1][1] * inverseDeterminant), mod29(-M7[0][1] * inverseDeterminant)],
  [mod29(-M7[1][0] * inverseDeterminant), mod29(M7[0][0] * inverseDeterminant)]
];
assert.deepEqual(M7Inverse, [[1, 25], [25, 15]]);

/** Möbius action on P^1(F_29); null represents [1:0] = infinity. */
function applyPGL(matrix, symbol) {
  if (symbol === INF) {
    return matrix[1][0] === 0
      ? INF
      : mod29(matrix[0][0] * inverse29(matrix[1][0]));
  }
  const denominator = mod29(matrix[1][0] * symbol + matrix[1][1]);
  if (denominator === 0) return INF;
  return mod29(
    (matrix[0][0] * symbol + matrix[0][1]) * inverse29(denominator)
  );
}

const makeMap = (matrix) =>
  Array.from({ length: 30 }, (_, state) => applyPGL(matrix, state === 29 ? INF : state));
const forwardMap = makeMap(M7);
const inverseMap = makeMap(M7Inverse);
const stateId = (symbol) => symbol === INF ? 29 : symbol;

assert.equal(new Set(forwardMap.map(stateId)).size, 30);
assert.equal(new Set(inverseMap.map(stateId)).size, 30);
for (let state = 0; state < 30; state++) {
  const symbol = state === 29 ? INF : state;
  const roundTrip = inverseMap[stateId(forwardMap[state])];
  assert.equal(stateId(roundTrip), state);
}

function applyMap(stream, map) {
  return stream.map((symbol) => map[stateId(symbol)]);
}

const plant = Array.from({ length: 600 }, (_, i) => i % 30 === 29 ? INF : i % 29);
assert.deepEqual(applyMap(applyMap(plant, forwardMap), inverseMap), plant);

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

function textOf(stream) {
  return stream.map((symbol) => symbol === INF ? ' ' : corpus.translit[symbol]).join('');
}

function scoreText(text) {
  const letters = text.toUpperCase().replace(/[^A-Z]/gu, '');
  let logProbability = 0;
  let missing = 0;
  let count = 0;
  for (let i = 0; i + 4 <= letters.length; i++) {
    const gram = letters.slice(i, i + 4);
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

function wordStats(stream) {
  const lengths = [];
  let length = 0;
  let spaces = 0;
  for (const symbol of stream) {
    if (symbol === INF) {
      spaces++;
      if (length) lengths.push(length);
      length = 0;
    } else {
      length++;
    }
  }
  if (length) lengths.push(length);
  return {
    runes: stream.filter((symbol) => symbol !== INF).length,
    spaces,
    words: lengths.length,
    mean_runes_per_word: Number((lengths.reduce((a, b) => a + b, 0) / lengths.length).toFixed(3)),
    maximum_word_length: Math.max(...lengths)
  };
}

const results = {};
for (const [name, stream] of Object.entries(targets)) {
  const forward = applyMap(stream, forwardMap);
  const inverse = applyMap(stream, inverseMap);
  assert.deepEqual(applyMap(forward, inverseMap), stream);
  assert.deepEqual(applyMap(inverse, forwardMap), stream);
  const rawLetters = stream.filter((x) => x !== INF).map((x) => corpus.translit[x]).join('');
  results[name] = {
    source: wordStats(stream),
    raw_score: scoreText(rawLetters),
    M7: {
      output: wordStats(forward),
      score: scoreText(textOf(forward)),
      sample: textOf(forward).slice(0, 220)
    },
    M7_inverse: {
      output: wordStats(inverse),
      score: scoreText(textOf(inverse)),
      sample: textOf(inverse).slice(0, 220)
    }
  };
}

const solved = corpus.pages.find((item) => item.page === 56).indices
  .concat(corpus.pages.find((item) => item.page === 57).indices);
const controls = {
  solved_p56_plus_p57: scoreText(solved.map((x) => corpus.translit[x]).join('')),
  native_shakespeare: scoreText(shakespeareRaw)
};

for (const result of Object.values(results)) {
  assert.ok(result.M7.score.mean_nats_per_quadgram < result.raw_score.mean_nats_per_quadgram);
  assert.ok(result.M7_inverse.score.mean_nats_per_quadgram < result.raw_score.mean_nats_per_quadgram);
}

console.log(JSON.stringify({
  source_operation: 'M7=[[14,25],[25,28]] over P^1(F_29), with infinity assigned to word boundary',
  inverse_matrix: M7Inverse,
  determinant_mod29: determinant,
  forward_map_states_0_to_28_then_infinity: forwardMap.map(stateId),
  inverse_map_states_0_to_28_then_infinity: inverseMap.map(stateId),
  language_model: {
    source: 'resources/control/duko_round27_english_quadgrams.txt',
    unique_quadgrams: quadgrams.size,
    total_observations: quadgramTotal
  },
  controls,
  targets: results,
  conclusion: 'The direct 30-state M7 and inverse substitutions collapse source word boundaries and score below raw ciphertext. The exact bijection and planted round trips validate implementation only. Retire this embedding; no plaintext or authentic key is recovered.'
}, null, 2));
