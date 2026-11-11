'use strict';

/**
 * Source-composed 70-state field transition from the two marked red triads.
 *
 * p3: u^2 = 3u + 8 in GF(29^2), with ord(u)=840.
 * p39: G(X)=27+5X+15X^2=15(X-24)^2.
 * Therefore beta=G(u)=15(u-24)^2=2+21u=u^348 and ord(beta)=70.
 *
 * Test two clue-minimal maps on all 12,956 original LP2 runes:
 *   additive: C_i = P_i + Tr(lambda * beta^i) mod 29
 *   affine:   C_i = Norm(lambda * beta^i) * P_i
 *                         + Tr(lambda * beta^i) mod 29
 * Scan every nonzero initial field state lambda (840), with either a
 * continuous-book or physical-page-reset clock. The lambda scan includes
 * every phase and every nonzero GF29-linear trace observation for this
 * fixed beta transition. Both signs of the trace term are included because
 * lambda and -lambda have equal norms and opposite traces.
 *
 * A full-length native-GP Shakespeare plant verifies exact key recovery.
 * This is a finite source-derived test, not a claim of historical intent.
 *
 * Run: node sims/lp2_red_triad_composed_multiplier70_inverse.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  source, multiply, power, trace, norm
} = require('./lp2_red_triad_primitive_field_inverse.cjs');
const { nativeGP } = require('./red_triad_gf841_127cycle_inverse.cjs');

const ROOT = path.resolve(__dirname, '..');
const P = 29;
const RUNES = 12956;
const PERIOD = 70;
const mod = x => ((x % P) + P) % P;
const keyOf = x => x.join(',');

function ioc(arr) {
  const hist = new Uint32Array(P);
  for (const value of arr) hist[value]++;
  return hist.reduce((sum, n) => sum + n * (n - 1), 0) /
    (arr.length * (arr.length - 1));
}

function inverse29(x) {
  for (let i = 1; i < P; i++) if (mod(x * i) === 1) return i;
  throw new Error('noninvertible GF29 multiplier');
}

function fieldSchedule(lambda, betaPowers) {
  return betaPowers.map(betaPower => {
    const state = multiply(lambda, betaPower);
    return { trace: trace(state), norm: norm(state) };
  });
}

function lambdas() {
  const out = [];
  for (let a = 0; a < P; a++) {
    for (let b = 0; b < P; b++) {
      if (a !== 0 || b !== 0) out.push([a, b]);
    }
  }
  assert.equal(out.length, P * P - 1);
  return out;
}

function transform(pages, schedule, clock, model, encode) {
  const out = [];
  let global = 0;
  for (const page of pages) {
    const row = [];
    for (let j = 0; j < page.indices.length; j++) {
      const state = schedule[(clock === 'page' ? j : global + j) % PERIOD];
      const value = page.indices[j];
      if (model === 'additive') {
        row.push(mod(encode ? value + state.trace : value - state.trace));
      } else {
        const scale = state.norm;
        assert.notEqual(scale, 0);
        row.push(mod(encode
          ? scale * value + state.trace
          : (value - state.trace) * inverse29(scale)));
      }
    }
    out.push(row);
    global += page.indices.length;
  }
  return out.flat();
}

function splitPages(flat, pages) {
  let offset = 0;
  return pages.map(page => {
    const out = flat.slice(offset, offset + page.indices.length);
    offset += page.indices.length;
    return {indices: out};
  });
}

function loadScorer(corpus) {
  const letters = corpus.translit.map(s =>
    Array.from(s, ch => ch.charCodeAt(0) - 65));
  const counts = new Uint32Array(26 ** 4);
  let total = 0;
  const lines = fs.readFileSync(
    path.join(ROOT, 'resources/control/duko_round27_english_quadgrams.txt'),
    'utf8').trim().split(/\r?\n/);
  for (const line of lines) {
    const match = line.trim().match(/^([A-Z]{4})\s+(\d+)$/);
    if (!match) continue;
    const q = match[1];
    const n = Number(match[2]);
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
  function score(indices) {
    let sum = 0, missing = 0, n = 0, filled = 0;
    let a = 0, b = 0, c = 0;
    for (const rune of indices) {
      for (const ch of letters[rune]) {
        n++;
        if (filled === 0) { a = ch; filled++; continue; }
        if (filled === 1) { b = ch; filled++; continue; }
        if (filled === 2) { c = ch; filled++; continue; }
        const ix = (((a * 26 + b) * 26 + c) * 26) + ch;
        sum += logs[ix];
        if (!present[ix]) missing++;
        a = b; b = c; c = ch;
      }
    }
    return {
      scorePerLetter: sum / Math.max(1, n - 3),
      missingQuadgrams: missing,
      letters: n
    };
  }
  return score;
}

function scan(pages, betaPowers, allLambda, score, model, clock, targetLambda) {
  const rows = [];
  for (const lambda of allLambda) {
    const schedule = fieldSchedule(lambda, betaPowers);
    const decoded = transform(pages, schedule, clock, model, false);
    const scored = score(decoded);
    rows.push({
      lambda: keyOf(lambda),
      scorePerLetter: scored.scorePerLetter,
      missingQuadgrams: scored.missingQuadgrams,
      ioc: ioc(decoded)
    });
  }
  rows.sort((a, b) => b.scorePerLetter - a.scorePerLetter);
  const target = targetLambda ? keyOf(targetLambda) : null;
  const targetRank = target === null ? null :
    rows.findIndex(row => row.lambda === target) + 1;
  const oneRank = rows.findIndex(row => row.lambda === '1,0') + 1;
  const bestDecoded = transform(
    pages, fieldSchedule(rows[0].lambda.split(',').map(Number), betaPowers),
    clock, model, false);
  return {
    tested: rows.length,
    best: rows[0],
    topFive: rows.slice(0, 5),
    sourceFixedLambdaOneRank: oneRank,
    targetLambdaRank: targetRank,
    bestPreview: bestDecoded.slice(0, 160).map(x => corpusTranslit[x]).join('')
  };
}

let corpusTranslit = [];

function main() {
  const input = source();
  const corpus = JSON.parse(fs.readFileSync(
    path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
  corpusTranslit = corpus.translit;
  const score = loadScorer(corpus);
  const pages = input.pages;
  const cipher = input.cipher;
  assert.equal(cipher.length, RUNES);

  const u = [0, 1];
  const beta = multiply([15, 0], multiply([5, 1], [5, 1]));
  assert.deepEqual(beta, [2, 21]);
  assert.deepEqual(power(u, 348), beta);
  assert.deepEqual(power(beta, PERIOD), [1, 0]);
  for (const divisor of [2, 5, 7]) {
    assert.notDeepEqual(power(beta, PERIOD / divisor), [1, 0]);
  }
  assert.equal(trace(beta), 9);
  assert.equal(norm(beta), 24);
  assert.equal(mod(24 ** 7), 1); // 24 has exact order seven
  let normPower = 1;
  for (let i = 0; i < 7; i++) normPower = mod(normPower * 24);
  assert.equal(normPower, 1);
  assert.notEqual(24, 1);

  const betaPowers = [];
  let state = [1, 0];
  for (let i = 0; i < PERIOD; i++) {
    betaPowers.push(state);
    state = multiply(state, beta);
  }
  assert.deepEqual(state, [1, 0]);
  assert.equal(new Set(betaPowers.map(keyOf)).size, PERIOD);

  const allLambda = lambdas();
  const traceSchedules = new Set();
  for (const lambda of allLambda) {
    traceSchedules.add(fieldSchedule(lambda, betaPowers)
      .map(x => x.trace).join(','));
  }
  assert.equal(traceSchedules.size, 840,
    'all nonzero linear trace observations must be distinct');

  const rawScore = score(cipher);
  const raw = {
    ioc: ioc(cipher),
    scorePerLetter: rawScore.scorePerLetter,
    missingQuadgrams: rawScore.missingQuadgrams
  };
  const original = [];
  for (const model of ['additive', 'affine']) {
    for (const clock of ['global', 'page']) {
      original.push({
        model, clock,
        ...scan(pages, betaPowers, allLambda, score, model, clock, null)
      });
    }
  }

  const shakespeare = fs.readFileSync(
    path.join(ROOT, 'resources/control/shakespeare_first300k.txt'), 'utf8');
  const native = nativeGP(shakespeare).slice(50000, 50000 + RUNES);
  assert.equal(native.length, RUNES);
  const nativePages = splitPages(native, pages);
  const plantLambda = [4, 13];
  const plants = [];
  for (const model of ['additive', 'affine']) {
    for (const clock of ['global', 'page']) {
      const schedule = fieldSchedule(plantLambda, betaPowers);
      const encrypted = transform(nativePages, schedule, clock, model, true);
      const plantedPages = splitPages(encrypted, pages);
      const recovered = transform(plantedPages, schedule, clock, model, false);
      assert.deepEqual(recovered, native);
      const result = scan(
        plantedPages, betaPowers, allLambda, score, model, clock, plantLambda);
      assert.equal(result.targetLambdaRank, 1,
        'source-native plant must recover the exact initial field state');
      plants.push({
        model, clock, trueLambda: keyOf(plantLambda),
        ...result,
        exactRecovery: recovered.length
      });
    }
  }

  console.log(JSON.stringify({
    classification: 'Source-derived 70-state model; original test only; no plaintext unless independently scored',
    source: {
      p3Field: 'u^2=3u+8 over GF(29^2)',
      p39Polynomial: 'G(X)=27+5X+15X^2=15(X-24)^2',
      composedMultiplier: 'beta=G(u)=2+21u=u^348',
      orderU: 840,
      orderBeta: PERIOD,
      traceBeta: trace(beta),
      normBeta: norm(beta),
      normPeriod: 7,
      states: betaPowers.length,
      initialStatesTested: allLambda.length,
      distinctTraceSchedules: traceSchedules.size
    },
    original: {
      runes: cipher.length,
      raw,
      candidates: original,
      maximumCandidateDeltaFromRaw: Math.max(
        ...original.map(x => x.best.scorePerLetter - raw.scorePerLetter))
    },
    positiveControls: plants,
    interpretation: 'The scan exhausts every nonzero initial GF(29^2) state for this fixed beta transition and the stated additive/trace-norm affine maps. It does not exclude other transitions, output registers, or plaintext languages.'
  }, null, 2));
}

if (require.main === module) main();
module.exports = {main, fieldSchedule, transform, lambdas};
