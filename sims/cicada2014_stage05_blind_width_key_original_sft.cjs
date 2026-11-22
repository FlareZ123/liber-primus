'use strict';

/**
 * Blind historical 2014 fourth-onion column order recovery.
 * Original source: neuroretransmit/cicada@ade9a028 (2014/006-fourth-onion).
 *
 * Only the first source line of 14 digrams (28 ciphertext characters)
 * and an independent Shakespeare text choose the width and key.
 * The other 28 source characters are withheld until prediction is frozen.
 * No historical plaintext or actual 7-column permutation is read by scoring.
 *
 * All 2!, 4!, 7! and 8! permutations are enumerated, corresponding to
 * every divisor of the full 56-character carrier in [2, 8].
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const HISTORICAL_SOURCE = [
  'TL BE IE OV UT HT RE ID TS EO ST PO SO YR',
  'SL BT II IY T4 DG UQ IM NU 44 2I 15 33 9M'
];

const EXPECTED_ORDER = [0, 6, 2, 5, 1, 4, 3];
const EXPECTED_FULL =
  'TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133';
const EXPECTED_HELD_OUT = EXPECTED_FULL.slice(28);
const TRAIN_PATH = path.join(
  __dirname, '..', 'resources', 'control', 'shakespeare_first300k.txt'
);
const ALPHABET = 26;
const NGRAM = 4;
const SMOOTH = 0.1;

function gramScore(source) {
  const corpus = source.toUpperCase().replace(/[^A-Z]/g, '');
  assert.equal(corpus.length, 229448, 'Pinned independent Shakespeare source changed');
  const counts = new Map();
  for (let i = 0; i + NGRAM <= corpus.length; i++) {
    const gram = corpus.slice(i, i + NGRAM);
    counts.set(gram, (counts.get(gram) || 0) + 1);
  }
  const denominator = corpus.length - NGRAM + 1 +
    SMOOTH * ALPHABET ** NGRAM;
  return (text) => {
    let total = 0;
    const k = text.length - NGRAM + 1;
    assert.ok(k > 0);
    for (let i = 0; i < k; i++) {
      const gram = text.slice(i, i + NGRAM);
      total += Math.log(((counts.get(gram) || 0) + SMOOTH) / denominator);
    }
    return total / k;
  };
}

function decode(ciphertext, width, permutation) {
  assert.equal(ciphertext.length % width, 0);
  const output = [];
  for (let i = 0; i < ciphertext.length; i += width) {
    const row = ciphertext.slice(i, i + width);
    output.push(permutation.map((column) => row[column]).join(''));
  }
  return output.join('');
}

function encode(plain, width, permutation) {
  assert.equal(plain.length % width, 0);
  const result = [];
  for (let i = 0; i < plain.length; i += width) {
    const encoded = Array(width);
    permutation.forEach((index, j) => {
      encoded[index] = plain[i + j];
    });
    result.push(encoded.join(''));
  }
  return result.join('');
}

/** Exhaust the bounded, source-length-compatible width and order family. */
function exhaust(source, score) {
  const eligibleWidths = [];
  for (let width = 2; width <= 8; width++) {
    if (source.length % width === 0) eligibleWidths.push(width);
  }
  assert.deepEqual(eligibleWidths, [2, 4, 7, 8]);
  const fit = source.slice(0, source.length / 2);
  const candidates = [];

  for (const width of eligibleWidths) {
    // For width=8, 24 of 28 first-half characters form complete blocks;
    // all 28 held-out characters are still predicted from the full object.
    const train = fit.slice(0, fit.length - fit.length % width);
    const permutation = [];
    const rec = (used) => {
      if (permutation.length === width) {
        const text = decode(train, width, permutation);
        candidates.push({
          width,
          key: permutation.slice(),
          score: score(text),
          firstPart: text
        });
        return;
      }
      for (let x = 0; x < width; x++) {
        if (used & (1 << x)) continue;
        permutation.push(x);
        rec(used | (1 << x));
        permutation.pop();
      }
    };
    rec(0);
  }

  assert.equal(candidates.length, 45386);
  candidates.sort((a, b) => b.score - a.score);
  return candidates;
}

function main() {
  const lines = HISTORICAL_SOURCE.map((line) => {
    const tokens = line.split(' ');
    assert.equal(tokens.length, 14);
    assert.ok(tokens.every((token) => /^[A-Z0-9]{2}$/.test(token)));
    return tokens.join('');
  });
  const original = lines.join('');
  assert.equal(original.length, 56);
  const training = fs.readFileSync(TRAIN_PATH, 'utf8');
  const positiveModel = gramScore(training);
  const ranked = exhaust(original, positiveModel);
  const best = ranked[0];
  assert.equal(best.width, 7);
  assert.deepEqual(best.key, EXPECTED_ORDER);
  assert.equal(best.firstPart, EXPECTED_FULL.slice(0, 28));

  // Reveal the second original source line only after the key was selected.
  const recovered = decode(original, best.width, best.key);
  assert.equal(recovered, EXPECTED_FULL);
  assert.equal(recovered.slice(28), EXPECTED_HELD_OUT);
  assert.equal(recovered.slice(36, 52), 'Q4UTGDI2N4M4UIM5');
  assert.equal(recovered.slice(52), '9133');
  assert.equal(encode(recovered, best.width, best.key), original);

  // Directionality control: reversing the same independent training text
  // creates a model for backward English, and does not select the true key.
  const reversedModel = gramScore([...training].reverse().join(''));
  const reversed = exhaust(original, reversedModel)[0];
  assert.equal(reversed.width, 8);
  assert.deepEqual(reversed.key, [2, 1, 6, 7, 5, 4, 0, 3]);
  assert.notDeepEqual(reversed.key, EXPECTED_ORDER);

  process.stdout.write(JSON.stringify({
    status: 'historically solved control, NOT unknown LP2 plaintext',
    source: '2014 fourth-onion original 28 two-character groups',
    train: 'first original 14 digrams, Shakespeare English tetragrams',
    holdout: 'second original 14 digrams, withheld from model selection',
    candidates: ranked.length,
    recoveredWidth: best.width,
    recoveredZeroBasedOrder: best.key,
    first28: best.firstPart,
    heldOut28: recovered.slice(28),
    fullHistoricalPlaintext: recovered,
    recoveredOnion: recovered.slice(36, 52).toLowerCase() + '.onion',
    exactRoundTrip: true,
    topScorePerTetragram: best.score,
    runnerUpScorePerTetragram: ranked[1].score,
    wrongDirectionWidth: reversed.width,
    wrongDirectionKey: reversed.key
  }, null, 2) + '\n');
}

main();
