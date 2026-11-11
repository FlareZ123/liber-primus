'use strict';

/**
 * Two-rune GF(29^2) original-cipher test.
 *
 * The p3 red triad defines the quadratic field u^2=3u+8.
 * The p39 red triad supplies beta=15(u-24)^2=G(u)=u^348, ord(beta)=70.
 * A field element is represented by the adjacent GP29 pair [a,b] = a+bu.
 *
 * Test the source-minimal stream maps:
 *   pair-additive:       C_i = P_i + lambda * g^i
 *   pair-multiplicative: C_i = P_i * (lambda * g^i)
 *
 * where g is either u (period 840) or beta (period 70), in forward and
 * reverse order. All 840 nonzero initial states lambda are exhausted.
 * Pairing starts at the first LP2 rune and runs continuously across physical
 * pages, consistent with the shared transcription's continuous word stream.
 *
 * Native-GP English plants must recover the exact lambda at rank one.
 * This is a finite, source-derived original-input test, not a claim of intent.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  source, multiply, power, norm
} = require('./lp2_red_triad_primitive_field_inverse.cjs');
const { nativeGP } = require('./red_triad_gf841_127cycle_inverse.cjs');
const { lambdas } = require('./lp2_red_triad_composed_multiplier70_inverse.cjs');

const ROOT = path.resolve(__dirname, '..');
const P = 29;
const RUNES = 12956;
const mod = x => ((x % P) + P) % P;
const keyOf = x => x.join(',');

const INVERSE29 = new Uint8Array(P);
for (let x = 1; x < P; x++) {
  for (let y = 1; y < P; y++) if (mod(x * y) === 1) {
    INVERSE29[x] = y;
    break;
  }
}
function fieldInverse(x) {
  const n = norm(x);
  assert.notEqual(n, 0);
  const ni = INVERSE29[n];
  const conjugate = [mod(x[0] + 3 * x[1]), mod(-x[1])];
  const inverse = [mod(conjugate[0] * ni), mod(conjugate[1] * ni)];
  return inverse;
}

function ioc(arr) {
  const hist = new Uint32Array(P);
  for (const value of arr) hist[value]++;
  return hist.reduce((sum, n) => sum + n * (n - 1), 0) /
    (arr.length * (arr.length - 1));
}

function powers(base, period) {
  const out = [];
  let state = [1, 0];
  for (let i = 0; i < period; i++) {
    out.push(state);
    state = multiply(state, base);
  }
  assert.deepEqual(state, [1, 0]);
  assert.equal(new Set(out.map(keyOf)).size, period);
  return out;
}

function transformPairs(input, schedule, model, encode) {
  assert.equal(input.length % 2, 0);
  const out = new Uint8Array(input.length);
  const decodeKeys = model === 'multiplicative' && !encode
    ? schedule.map(fieldInverse) : schedule;
  for (let i = 0; i < input.length; i += 2) {
    const pair = [input[i], input[i + 1]];
    const key = decodeKeys[(i / 2) % decodeKeys.length];
    let result;
    if (model === 'additive') {
      result = encode
        ? [mod(pair[0] + key[0]), mod(pair[1] + key[1])]
        : [mod(pair[0] - key[0]), mod(pair[1] - key[1])];
    } else {
      result = multiply(key, pair);
    }
    out[i] = result[0];
    out[i + 1] = result[1];
  }
  return Array.from(out);
}

function loadScorer(corpus) {
  const letters = corpus.translit.map(s =>
    Array.from(s, ch => ch.charCodeAt(0) - 65));
  const counts = new Uint32Array(26 ** 4);
  let total = 0;
  for (const line of fs.readFileSync(
    path.join(ROOT, 'resources/control/duko_round27_english_quadgrams.txt'),
    'utf8').trim().split(/\r?\n/)) {
    const match = line.trim().match(/^([A-Z]{4})\s+(\d+)$/);
    if (!match) continue;
    const q = match[1], n = Number(match[2]);
    const ix = (((q.charCodeAt(0) - 65) * 26 +
      q.charCodeAt(1) - 65) * 26 + q.charCodeAt(2) - 65) * 26 +
      q.charCodeAt(3) - 65;
    counts[ix] = n;
    total += n;
  }
  const logs = new Float64Array(26 ** 4);
  const present = new Uint8Array(26 ** 4);
  logs.fill(Math.log(0.01 / total));
  for (let i = 0; i < counts.length; i++) {
    if (counts[i]) {
      logs[i] = Math.log(counts[i] / total);
      present[i] = 1;
    }
  }
  return indices => {
    let sum = 0, missing = 0, n = 0, filled = 0;
    let a = 0, b = 0, c = 0;
    for (const rune of indices) for (const ch of letters[rune]) {
      n++;
      if (filled === 0) { a = ch; filled++; continue; }
      if (filled === 1) { b = ch; filled++; continue; }
      if (filled === 2) { c = ch; filled++; continue; }
      const ix = (((a * 26 + b) * 26 + c) * 26) + ch;
      sum += logs[ix];
      if (!present[ix]) missing++;
      a = b; b = c; c = ch;
    }
    return {
      scorePerLetter: sum / Math.max(1, n - 3),
      missingQuadgrams: missing,
      letters: n
    };
  };
}

function scan(input, basePowers, allLambda, score, model, targetLambda) {
  const rows = [];
  for (const lambda of allLambda) {
    const schedule = basePowers.map(base => multiply(lambda, base));
    const decoded = transformPairs(input, schedule, model, false);
    const result = score(decoded);
    rows.push({
      lambda: keyOf(lambda),
      scorePerLetter: result.scorePerLetter,
      missingQuadgrams: result.missingQuadgrams,
      ioc: ioc(decoded)
    });
  }
  rows.sort((a, b) => b.scorePerLetter - a.scorePerLetter);
  const target = targetLambda ? keyOf(targetLambda) : null;
  const targetRank = target === null ? null :
    rows.findIndex(row => row.lambda === target) + 1;
  const sourceFixedRank = rows.findIndex(row => row.lambda === '1,0') + 1;
  const bestLambda = rows[0].lambda.split(',').map(Number);
  const bestSchedule = basePowers.map(base => multiply(bestLambda, base));
  const bestDecoded = transformPairs(input, bestSchedule, model, false);
  return {
    tested: rows.length,
    best: rows[0],
    topFive: rows.slice(0, 5),
    sourceFixedLambdaOneRank: sourceFixedRank,
    targetLambdaRank: targetRank,
    bestPreview: bestDecoded.slice(0, 160)
      .map(x => corpusTranslit[x]).join('')
  };
}

let corpusTranslit = [];

function main() {
  const input = source();
  const corpus = JSON.parse(fs.readFileSync(
    path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
  corpusTranslit = corpus.translit;
  const score = loadScorer(corpus);
  const cipher = input.cipher;
  assert.equal(cipher.length, RUNES);
  assert.equal(cipher.length % 2, 0);

  const u = [0, 1];
  const beta = multiply([15, 0], multiply([5, 1], [5, 1]));
  assert.deepEqual(beta, [2, 21]);
  assert.deepEqual(power(u, 348), beta);
  assert.equal(norm(beta), 24);
  const betaOrder = powers(beta, 70);
  const uOrder = powers(u, 840);
  const generators = [
    {name: 'p3-primitive-u', period: 840, powers: uOrder},
    {name: 'p39-on-p3-beta', period: 70, powers: betaOrder}
  ];
  const allLambda = lambdas();
  assert.equal(allLambda.length, 840);

  const rawScore = score(cipher);
  const raw = {
    ioc: ioc(cipher),
    scorePerLetter: rawScore.scorePerLetter,
    missingQuadgrams: rawScore.missingQuadgrams
  };
  const original = [];
  for (const generator of generators) {
    for (const direction of ['forward', 'reverse']) {
      const basePowers = direction === 'forward'
        ? generator.powers
        : powers(power(generator.powers[1], generator.period - 1),
          generator.period);
      for (const model of ['additive', 'multiplicative']) {
        original.push({
          generator: generator.name,
          period: generator.period,
          direction,
          model,
          ...scan(cipher, basePowers, allLambda, score, model, null)
        });
      }
    }
  }

  const shakespeare = fs.readFileSync(
    path.join(ROOT, 'resources/control/shakespeare_first300k.txt'), 'utf8');
  const native = nativeGP(shakespeare).slice(50000, 50000 + RUNES);
  assert.equal(native.length, RUNES);
  const plantLambda = [4, 13];
  const plants = [];
  for (const generator of generators) {
    for (const direction of ['forward', 'reverse']) {
      const basePowers = direction === 'forward'
        ? generator.powers
        : powers(power(generator.powers[1], generator.period - 1),
          generator.period);
      for (const model of ['additive', 'multiplicative']) {
        const schedule = basePowers.map(base => multiply(plantLambda, base));
        const encrypted = transformPairs(native, schedule, model, true);
        const recovered = transformPairs(encrypted, schedule, model, false);
        assert.deepEqual(recovered, native);
        const result = scan(
          encrypted, basePowers, allLambda, score, model, plantLambda);
        assert.equal(result.targetLambdaRank, 1,
          'native-GP pair plant must recover the exact field state');
        plants.push({
          generator: generator.name,
          period: generator.period,
          direction,
          model,
          trueLambda: keyOf(plantLambda),
          ...result,
          exactRecovery: recovered.length
        });
      }
    }
  }

  console.log(JSON.stringify({
    classification: 'Original-input two-rune field test; no plaintext unless independently scored',
    source: {
      alphabet: 'GP29',
      pairBasis: 'first rune + second rune * u',
      p3Field: 'u^2=3u+8',
      p39Composition: 'beta=15(u-24)^2=2+21u=u^348',
      generatorPeriods: generators.map(g => ({name: g.name, period: g.period})),
      initialStates: allLambda.length,
      originalRunes: cipher.length,
      fieldPairs: cipher.length / 2,
      pairAlignment: 'global from the first rune, continuous across physical pages'
    },
    original: {
      raw,
      candidateFamilies: original,
      maximumCandidateDeltaFromRaw: Math.max(
        ...original.map(x => x.best.scorePerLetter - raw.scorePerLetter))
    },
    positiveControls: plants,
    interpretation: 'The scan exhausts every nonzero initial GF(29^2) state for the stated pair-additive and pair-multiplicative transitions, both generator directions, and the continuous pair clock. It does not exclude other block alignments, nonlinear registers, other plaintext languages, or other mechanisms.'
  }, null, 2));
}

if (require.main === module) main();
module.exports = {main, fieldInverse, transformPairs};
