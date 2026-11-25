#!/usr/bin/env node
'use strict';

// Exact p53+p54-start versus p56+p57 terminal-register comparison.
// Run from the repository root: node sims/lp2_p53p54_vs_p56p57_period32_phase_bijection_sft.cjs
// The model grants 32 independent GP29 permutations, one per phase, and
// compares a fixed first-138 training prefix with a 42-rune holdout.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const gp = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const page = n => {
  const p = gp.pages.find(x => x.page === n);
  assert.ok(p, `missing page ${n}`);
  return p.indices;
};
const p53 = page(53);
const p54 = page(54);
const p56Cipher = page(56);
const p57 = page(57);
const p56Text = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const tokens = gp.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);

function encode(text) {
  const out = [];
  for (const word of text.split(/\\s+/u)) {
    let at = 0;
    while (at < word.length) {
      const token = tokens.find(x => word.startsWith(x.s, at));
      assert.ok(token, `unencodable p56 plaintext at ${word.slice(at)}`);
      out.push(token.i);
      at += token.s.length;
    }
  }
  return out;
}
function mod29(x) { return (x % 29 + 29) % 29; }
function firstPrimes(n) {
  const out = [];
  for (let x = 2; out.length < n; x++) {
    let prime = true;
    for (let d = 2; d * d <= x; d++) if (x % d === 0) { prime = false; break; }
    if (prime) out.push(x);
  }
  return out;
}
const p56Plain = encode(p56Text);
const primes = firstPrimes(84);
let keyIndex = 0;
const p56Replay = p56Plain.map((x, i) => i === 56 ? 0 : mod29(x + primes[keyIndex++] - 1));
assert.deepEqual(p56Replay, p56Cipher, 'p56 prime-minus-one/F-hold regression');
assert.equal(keyIndex, 84);

const ciphertext = p53.concat(p54.slice(0, 1));
const plaintext = p56Plain.concat(p57);
const N = 180;
const TRAIN = 138;
assert.deepEqual(
  [p53.length, p54[0], p56Plain.length, p57.length, ciphertext.length, plaintext.length],
  [179, 24, 85, 95, N, N],
  'frozen 180-rune register coordinates'
);

function log10Factorial(n) {
  let sum = 0;
  for (let i = 2; i <= n; i++) sum += Math.log10(i);
  return sum;
}
function phaseSchedule(clock) {
  const phases = [];
  let pointer = 0;
  for (let i = 0; i < N; i++) {
    phases.push(clock === 'full' ? i % 32 : pointer % 32);
    if (clock === 'fhold' && plaintext[i] === 0) continue;
    pointer++;
  }
  return phases;
}
function analyze(candidate, clock) {
  const phases = phaseSchedule(clock);
  const forward = Array.from({ length: 32 }, () => Array(29).fill(-1));
  const inverse = Array.from({ length: 32 }, () => Array(29).fill(-1));
  const trainErrors = [];

  function add(i, maps, inverses, errors) {
    const p = plaintext[i], c = candidate[i], q = phases[i];
    if (clock === 'fhold') {
      if ((p === 0) !== (c === 0)) {
        errors.push({ i, q: q + 1, p, c, kind: 'literal-F mismatch' });
        return;
      }
      if (p === 0) return;
    }
    if (maps[q][p] !== -1 && maps[q][p] !== c) {
      errors.push({ i, q: q + 1, p, c, kind: 'one input has two outputs', old: maps[q][p] });
      return;
    }
    if (inverses[q][c] !== -1 && inverses[q][c] !== p) {
      errors.push({ i, q: q + 1, p, c, kind: 'two inputs share one output', old: inverses[q][c] });
      return;
    }
    maps[q][p] = c;
    inverses[q][c] = p;
  }

  for (let i = 0; i < TRAIN; i++) add(i, forward, inverse, trainErrors);

  let holdoutPredicted = 0;
  let holdoutCorrect = 0;
  let holdoutUnidentified = 0;
  const holdoutErrors = [];
  for (let i = TRAIN; i < N; i++) {
    const p = plaintext[i], c = candidate[i], q = phases[i];
    if (clock === 'fhold' && (p === 0 || c === 0)) {
      holdoutPredicted++;
      if (p === c) holdoutCorrect++;
      else holdoutErrors.push({ i, q: q + 1, p, c, kind: 'literal-F mismatch' });
      continue;
    }
    if (forward[q][p] !== -1) {
      holdoutPredicted++;
      if (forward[q][p] === c) holdoutCorrect++;
      else holdoutErrors.push({ i, q: q + 1, p, c, kind: 'held-out prediction mismatch', expected: forward[q][p] });
    } else {
      holdoutUnidentified++;
      if (inverse[q][c] !== -1 && inverse[q][c] !== p) {
        holdoutErrors.push({ i, q: q + 1, p, c, kind: 'held-out inverse collision', old: inverse[q][c] });
      }
    }
  }

  const allForward = Array.from({ length: 32 }, () => Array(29).fill(-1));
  const allInverse = Array.from({ length: 32 }, () => Array(29).fill(-1));
  const fullErrors = [];
  for (let i = 0; i < N; i++) add(i, allForward, allInverse, fullErrors);

  const phaseSummary = Array.from({ length: 32 }, (_, q) => ({
    phase: q + 1,
    trainingObservations: phases.slice(0, TRAIN).filter(x => x === q).length,
    trainingMappings: forward[q].filter(x => x !== -1).length
  }));
  const domain = clock === 'full' ? 29 : 28;
  const trainingMappings = phaseSummary.reduce((s, x) => s + x.trainingMappings, 0);
  const completionLog10IfConflictsDiscarded = phaseSummary.reduce(
    (s, x) => s + log10Factorial(domain - x.trainingMappings), 0
  );
  const coverage = phaseSummary.map(x => x.trainingMappings);

  return {
    clock,
    trainingConflicts: trainErrors.length,
    trainingExamples: trainErrors.slice(0, 5),
    holdoutPredicted,
    holdoutCorrect,
    holdoutUnidentified,
    holdoutConflicts: holdoutErrors.length,
    holdoutExamples: holdoutErrors.slice(0, 5),
    fullConflicts: fullErrors.length,
    fullExamples: fullErrors.slice(0, 5),
    trainingMappings,
    possiblePhaseInputs: 32 * domain,
    unobservedPhaseInputs: 32 * domain - trainingMappings,
    phaseCoverage: { min: Math.min(...coverage), max: Math.max(...coverage) },
    completionLog10IfConflictsDiscarded: Number(completionLog10IfConflictsDiscarded.toFixed(3)),
    phaseSummary
  };
}

function xorshift(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}
function shuffle(values, random) {
  const out = values.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = random() % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
function plant(clock, seed) {
  const random = xorshift(seed);
  const permutations = Array.from({ length: 32 }, () => clock === 'full'
    ? shuffle(Array.from({ length: 29 }, (_, i) => i), random)
    : [0, ...shuffle(Array.from({ length: 28 }, (_, i) => i + 1), random)]);
  let pointer = 0;
  return plaintext.map((p, i) => {
    if (clock === 'fhold' && p === 0) return 0;
    const q = clock === 'full' ? i % 32 : pointer % 32;
    pointer++;
    return permutations[q][p];
  });
}
function positiveControls(clock, rounds = 200) {
  let failures = 0, predictions = 0, correct = 0, unidentified = 0;
  for (let r = 0; r < rounds; r++) {
    const candidate = plant(clock, 0x51a61957 + r * 37);
    const result = analyze(candidate, clock);
    if (result.trainingConflicts || result.holdoutConflicts || result.fullConflicts) failures++;
    predictions += result.holdoutPredicted;
    correct += result.holdoutCorrect;
    unidentified += result.holdoutUnidentified;
  }
  return {
    rounds, failures,
    meanHoldoutPredictions: Number((predictions / rounds).toFixed(2)),
    meanCorrectPredictions: Number((correct / rounds).toFixed(2)),
    meanUnidentifiedHoldout: Number((unidentified / rounds).toFixed(2))
  };
}
function matchedNulls(clock, rounds = 10000) {
  const random = xorshift(0x2765a11);
  let trainingPasses = 0, fullPasses = 0;
  for (let r = 0; r < rounds; r++) {
    const candidate = clock === 'full'
      ? shuffle(ciphertext, random) // preserves the exact p53+p54 symbol histogram
      : plaintext.map(p => p === 0 ? 0 : 1 + (random() % 28)); // preserves the fixed literal-F schedule
    const result = analyze(candidate, clock);
    if (!result.trainingConflicts) trainingPasses++;
    if (!result.trainingConflicts && !result.holdoutConflicts && !result.fullConflicts) fullPasses++;
  }
  return { rounds, trainingPasses, fullPasses };
}

const fPlain = plaintext.flatMap((x, i) => x === 0 ? [i] : []);
const fCipher = ciphertext.flatMap((x, i) => x === 0 ? [i] : []);
const literalFMismatches = Array.from({ length: N }, (_, i) => i)
  .filter(i => (plaintext[i] === 0) !== (ciphertext[i] === 0));

const result = {
  registers: {
    p53Runes: p53.length,
    p54Initial: p54[0],
    p56PlainRunes: p56Plain.length,
    p57ClearRunes: p57.length,
    total: N,
    training: TRAIN,
    holdout: N - TRAIN
  },
  literalF: { plaintextPositions: fPlain, ciphertextPositions: fCipher, mismatchPositions: literalFMismatches },
  fullyConsuming: analyze(ciphertext, 'full'),
  literalFHold: analyze(ciphertext, 'fhold'),
  positiveControls: {
    fullyConsuming: positiveControls('full'),
    literalFHold: positiveControls('fhold')
  },
  matchedNulls: {
    fullyConsuming: matchedNulls('full'),
    literalFHold: matchedNulls('fhold')
  }
};

assert.equal(result.fullyConsuming.trainingConflicts, 26);
assert.equal(result.fullyConsuming.holdoutPredicted, 9);
assert.equal(result.fullyConsuming.holdoutCorrect, 2);
assert.equal(result.fullyConsuming.holdoutConflicts, 12);
assert.equal(result.fullyConsuming.fullConflicts, 40);
assert.equal(result.literalFHold.trainingConflicts, 24);
assert.equal(result.literalFHold.holdoutPredicted, 4);
assert.equal(result.literalFHold.holdoutCorrect, 0);
assert.equal(result.literalFHold.holdoutConflicts, 8);
assert.equal(result.literalFHold.fullConflicts, 33);
assert.equal(literalFMismatches.length, 9);
assert.equal(result.positiveControls.fullyConsuming.failures, 0);
assert.equal(result.positiveControls.literalFHold.failures, 0);
assert.equal(result.matchedNulls.fullyConsuming.trainingPasses, 0);
assert.equal(result.matchedNulls.literalFHold.trainingPasses, 0);

console.log(JSON.stringify(result, null, 2));
