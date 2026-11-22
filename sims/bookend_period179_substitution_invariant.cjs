'use strict';

/**
 * Key-free equality invariant for the source-suggested 179/1432-word clocks.
 *
 * Candidate model:
 *   C[i,j] = pi[(i mod 179),j](P[i,j])
 * where pi is an arbitrary bijection of the 29-symbol GP alphabet, fixed for
 * each word-index phase and within-word position. Thus words i and i+179
 * (also i+1432) use the same bijection at every shared position, so equality
 * of aligned symbols is preserved independently of every secret key.
 *
 * A calibrated output repair then overwrites 81% of within-page adjacent
 * ciphertext repeats, matching the existing bookend plant's soft-repair
 * assumption. The original repeated two-word anchor is excluded from the
 * lag-1432 comparison. Three independent GP-English references are used.
 *
 * Node 22, CommonJS, read-only source inputs, no external dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const TRIALS = 2000;
const SEED = 0x21917981;
const PERIOD = 179;
const REPAIR_PROBABILITY = 0.81;
const PHRASE = [23, 11, 1, 17, 18, 10];

function loadOriginal() {
  const corpus = JSON.parse(fs.readFileSync(
    path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
  const transcript = fs.readFileSync(
    path.join(ROOT, 'resources/lp2-transcription.txt'), 'utf8');
  const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
  const words = [];
  let current = [];
  // Page and printed-line wraps are transparent; actual punctuation ends a word.
  for (const glyph of transcript.split('%').slice(0, 55).join('%')) {
    if (runeIndex.has(glyph)) current.push(runeIndex.get(glyph));
    else if (glyph === '%' || glyph === '/' || /\s/u.test(glyph)) {
      // Continue a word across line/page layout.
    } else if (current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  const flat = words.flat();
  const source = corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices);
  assert.equal(words.length, 2896);
  assert.equal(flat.length, 12956);
  assert.deepEqual(flat, source);
  assert.deepEqual(words[1462], [23, 11, 1]);
  assert.deepEqual(words[1463], [17, 18, 10]);
  assert.deepEqual(words[2894], [23, 11, 1]);
  assert.deepEqual(words[2895], [17, 18, 10]);
  assert.equal(2894 - 1462, 1432);
  assert.equal(1432, 8 * PERIOD);

  const lengths = words.map(w => w.length);
  const offsets = [];
  let at = 0;
  for (const length of lengths) {
    offsets.push(at);
    at += length;
  }
  assert.equal(at, 12956);

  const pageRanges = [];
  let pageOffset = 0;
  for (const page of corpus.pages.filter(p => p.page < 56)) {
    const end = pageOffset + page.indices.length;
    if (end > pageOffset) pageRanges.push([pageOffset, end]);
    pageOffset = end;
  }
  assert.equal(pageOffset, 12956);

  return { corpus, words, lengths, offsets, original: flat, pageRanges };
}

function buildPairs(lengths, offsets, lag, excludeAnchor) {
  const pairs = [];
  for (let i = 0; i + lag < lengths.length; i++) {
    // Do not let the selected six-rune repeat validate itself.
    if (excludeAnchor && lag === 1432 && (i === 1462 || i === 1463)) continue;
    const overlap = Math.min(lengths[i], lengths[i + lag]);
    pairs.push([offsets[i], offsets[i + lag], overlap]);
  }
  return pairs;
}

function tally(stream, pairs) {
  let equal = 0;
  let total = 0;
  for (const [left, right, length] of pairs) {
    for (let j = 0; j < length; j++) {
      total++;
      if (stream[left + j] === stream[right + j]) equal++;
    }
  }
  return { equal, total, rate: equal / total };
}

function encodeEnglish(text, spelling) {
  const normalized = text.toUpperCase()
    .replace(/QU/g, 'CW').replace(/K/g, 'C')
    .replace(/V/g, 'U').replace(/Z/g, 'S')
    .replace(/Q/g, 'C').replace(/[^A-Z]/g, '');
  const tokens = spelling.map((label, index) => ({ label, index }))
    .sort((a, b) => b.label.length - a.label.length);
  const output = [];
  for (let i = 0; i < normalized.length;) {
    const token = tokens.find(t => normalized.startsWith(t.label, i));
    assert.ok(token, 'Unmapped native-English letter at ' + i);
    output.push(token.index);
    i += token.label.length;
  }
  return output;
}

function makeRng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

function randomPermutation(random32) {
  const permutation = Array.from({ length: 29 }, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = random32() % (i + 1);
    [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
  }
  return permutation;
}

function encryptByWordPhase(plain, lengths, random32, maxWordLength) {
  const maps = Array.from({ length: PERIOD }, () =>
    Array.from({ length: maxWordLength }, () => randomPermutation(random32)));
  const cipher = new Array(plain.length);
  let offset = 0;
  for (let word = 0; word < lengths.length; word++) {
    for (let j = 0; j < lengths[word]; j++) {
      cipher[offset] = maps[word % PERIOD][j][plain[offset]];
      offset++;
    }
  }
  return cipher;
}

function repairWithinPages(cipher, pageRanges, random32) {
  let overwritten = 0;
  let residual = 0;
  for (const [start, end] of pageRanges) {
    for (let i = start + 1; i < end; i++) {
      if (cipher[i] === cipher[i - 1] &&
          random32() / 4294967296 < REPAIR_PROBABILITY) {
        cipher[i] = (cipher[i] + 1) % 29;
        overwritten++;
      }
      if (cipher[i] === cipher[i - 1]) residual++;
    }
  }
  return { overwritten, residual };
}

function summarize(values, observed) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sd = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) /
    (values.length - 1));
  const lowerTail = values.filter(v => v <= observed).length;
  return {
    mean,
    sd,
    min: Math.min(...values),
    max: Math.max(...values),
    lowerTail,
    addOneLowerTailP: (lowerTail + 1) / (values.length + 1)
  };
}

function countWithinPageRepeats(stream, pageRanges) {
  let count = 0;
  for (const [start, end] of pageRanges)
    for (let i = start + 1; i < end; i++)
      if (stream[i] === stream[i - 1]) count++;
  return count;
}

function run() {
  const { corpus, words, lengths, offsets, original, pageRanges } = loadOriginal();
  const pairs179 = buildPairs(lengths, offsets, 179, false);
  const pairs1432 = buildPairs(lengths, offsets, 1432, true);
  const observed179 = tally(original, pairs179);
  const observed1432 = tally(original, pairs1432);
  const originalRepeats = countWithinPageRepeats(original, pageRanges);

  assert.equal(pairs179.length, 2717);
  assert.equal(observed179.total, 8717);
  assert.equal(observed179.equal, 303);
  assert.equal(pairs1432.length, 1462);
  assert.equal(observed1432.total, 4691);
  assert.equal(observed1432.equal, 154);
  assert.equal(originalRepeats, 86);

  const referencePaths = [
    ['Shakespeare', 'resources/control/shakespeare_first300k.txt'],
    ['Emerson', 'resources/control/emerson_essays_2944.txt'],
    ['Gibran', 'resources/control/gibran_prophet_58585.txt']
  ];
  const references = referencePaths.map(([name, file]) => ({
    name,
    values: encodeEnglish(fs.readFileSync(path.join(ROOT, file), 'utf8'),
      corpus.translit)
  }));
  assert.deepEqual(references.map(r => r.values.length), [216874, 320945, 62550]);

  const random32 = makeRng(SEED);
  const maxWordLength = Math.max(...lengths);
  const controls = [];

  for (const reference of references) {
    const values179 = [];
    const values1432 = [];
    let overwrittenTotal = 0;
    let residualTotal = 0;
    const maxStart = reference.values.length - original.length;
    assert.ok(maxStart >= 0, reference.name + ' reference is too short');

    for (let trial = 0; trial < TRIALS; trial++) {
      const start = random32() % (maxStart + 1);
      const plain = reference.values.slice(start, start + original.length);
      const cipher = encryptByWordPhase(plain, lengths, random32, maxWordLength);

      // Exact invariant before the calibrated output repair.
      if (trial === 0) {
        assert.deepEqual(tally(cipher, pairs179), tally(plain, pairs179));
        assert.deepEqual(tally(cipher, pairs1432), tally(plain, pairs1432));
      }

      const repair = repairWithinPages(cipher, pageRanges, random32);
      values179.push(tally(cipher, pairs179).equal);
      values1432.push(tally(cipher, pairs1432).equal);
      overwrittenTotal += repair.overwritten;
      residualTotal += repair.residual;
    }

    const lag179 = summarize(values179, observed179.equal);
    const lag1432 = summarize(values1432, observed1432.equal);
    assert.equal(lag179.lowerTail, 0);
    assert.equal(lag1432.lowerTail, 0);
    controls.push({
      reference: reference.name,
      referenceGpRunes: reference.values.length,
      trials: TRIALS,
      lag179,
      lag1432,
      meanOverwrites: overwrittenTotal / TRIALS,
      meanResidualWithinPageRepeats: residualTotal / TRIALS
    });
  }

  const output = {
    model: 'arbitrary bijection for each (wordIndex mod 179, intraWordPosition), followed by 81% within-page adjacent-repeat overwrite',
    source: {
      originalRunes: original.length,
      printedWords: words.length,
      p27p55RepeatedPair: PHRASE,
      wordIndexes: [1462, 1463, 2894, 2895],
      wordGap: 1432,
      period: PERIOD,
      lag179Pairs: pairs179.length,
      lag179AlignedPositions: observed179.total,
      lag1432PairsExcludingAnchor: pairs1432.length,
      lag1432AlignedPositionsExcludingAnchor: observed1432.total,
      originalWithinPageRepeats: originalRepeats
    },
    observed: { lag179: observed179, lag1432: observed1432 },
    controls,
    interpretation: 'A source-English plaintext under a periodic bijective word-position substitution is strongly disfavored even after the calibrated repeat repair. This does not exclude non-bijective, nonlinear, nonperiodic, resegmented, or non-English-register mechanisms; no plaintext or key is recovered.'
  };
  console.log(JSON.stringify(output, null, 2));
  return output;
}

if (require.main === module) run();
module.exports = { loadOriginal, buildPairs, tally, run };
