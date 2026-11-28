'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const MOD = 29;
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const gibran = fs.readFileSync(path.join(ROOT, 'resources/control/gibran_prophet_58585.txt'), 'utf8');
const N = 12956;
const R = 3;
const T = 8;

/** @param {number} x @returns {number} */
const mod = (x) => ((x % MOD) + MOD) % MOD;

/** @param {[number, number]} x @param {[number, number]} y @returns {[number, number]} */
function mul(x, y) {
  const [a, b] = x;
  const [c, d] = y;
  return [mod(a * c + T * b * d), mod(a * d + b * c + R * b * d)];
}

/** @param {[number, number]} x @returns {[number, number]} */
function inverse(x) {
  for (let a = 0; a < MOD; a += 1) {
    for (let b = 0; b < MOD; b += 1) {
      if (a === 0 && b === 0) continue;
      if (mul(x, [a, b]).join(',') === '1,0') return [a, b];
    }
  }
  throw new Error('no field inverse');
}

const Q = /** @type {[number, number]} */ ([17, 24]);
const Qinv = inverse(Q);
assert.deepStrictEqual(mul(Q, Qinv), [1, 0]);

const tape = corpus.pages.filter((p) => p.page >= 0 && p.page <= 55).flatMap((p) => p.indices);
assert.equal(tape.length, N);
assert.equal(N % 2, 0);

const DIGRAPHS = ['TH', 'EO', 'NG', 'OE', 'AE', 'IA', 'EA'];
/** @param {string} word @returns {number[]} */
function gpWord(word) {
  const s = word.toUpperCase().replace(/QU/g, 'CW').replace(/[KV]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    let token = null;
    let step = 1;
    if (s.slice(i, i + 3) === 'ING') {
      token = 'NG';
      step = 3;
    } else {
      for (const d of DIGRAPHS) {
        if (s.slice(i, i + d.length) === d) {
          token = d;
          step = d.length;
          break;
        }
      }
      if (!token) token = s[i];
    }
    const index = corpus.translit.indexOf(token);
    if (index >= 0) out.push(index);
    i += step;
  }
  return out;
}

/** @param {string} text @returns {number[]} */
function gpText(text) {
  return (text.match(/[A-Za-z]+/g) || []).flatMap(gpWord);
}

const native = gpText(gibran);
const trainLength = 20000;
assert.ok(native.length >= trainLength + N, 'native source too short for disjoint train/plant');
const train = native.slice(0, trainLength);
const plant = native.slice(trainLength, trainLength + N);

const counts = Array.from({ length: MOD }, () => Array(MOD).fill(0.25));
for (let i = 1; i < train.length; i += 1) counts[train[i - 1]][train[i]] += 1;
const logp = counts.map((row) => {
  const total = row.reduce((a, b) => a + b, 0);
  return row.map((v) => Math.log(v / total));
});

/** @param {number[]} plain @returns {number} */
function score(plain) {
  let s = 0;
  for (let i = 1; i < plain.length; i += 1) s += logp[plain[i - 1]][plain[i]];
  return s / (plain.length - 1);
}

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const f = Array(MOD).fill(0);
  for (const x of a) f[x] += 1;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
}

/** @param {number[]} input @param {[number, number]} factor @returns {number[]} */
function pairMultiply(input, factor) {
  assert.equal(input.length % 2, 0);
  const out = new Array(input.length);
  for (let i = 0; i < input.length; i += 2) {
    const z = mul(factor, /** @type {[number, number]} */ ([input[i], input[i + 1]]));
    out[i] = z[0];
    out[i + 1] = z[1];
  }
  return out;
}

const multipliers = [];
for (let a = 0; a < MOD; a += 1) {
  for (let b = 0; b < MOD; b += 1) {
    if (a !== 0 || b !== 0) multipliers.push(/** @type {[number, number]} */ ([a, b]));
  }
}
assert.equal(multipliers.length, 840);

/** @param {number[]} cipher */
function census(cipher) {
  const rows = multipliers.map((factor) => {
    const plain = pairMultiply(cipher, factor);
    return { factor, score: score(plain), ioc: ioc(plain) };
  });
  rows.sort((a, b) => b.score - a.score || a.factor[0] - b.factor[0] || a.factor[1] - b.factor[1]);
  return rows;
}

/** @param {{factor:[number,number]}[]} rows @param {[number,number]} factor */
function rankOf(rows, factor) {
  return rows.findIndex((row) => row.factor[0] === factor[0] && row.factor[1] === factor[1]) + 1;
}

const encodedPlant = pairMultiply(plant, Q);
const plantRows = census(encodedPlant);
const plantTruthRank = rankOf(plantRows, Qinv);
assert.equal(plantTruthRank, 1, 'held native plant must recover Q inverse as rank1');

const originalRows = census(tape);
const qRank = rankOf(originalRows, Q);
const qInvRank = rankOf(originalRows, Qinv);
const decodedByQ = pairMultiply(tape, Q);
const decodedByQinv = pairMultiply(tape, Qinv);

const result = {
  schema: 1,
  classification: 'exact all-840 constant GF(29^2) pair-multiplier census; source field u^2=3u+8',
  input: {
    unknownRunes: tape.length,
    pairing: 'continuous printed-order pairs from p0 rune0 through p55 final rune',
    field: 'u^2=3u+8 over GF(29)',
    Q,
    Qinv,
    score: 'smoothed GP29 bigram log likelihood from disjoint Gibran training prefix',
    trainingRunes: train.length,
  },
  heldNativePlant: {
    plainRunes: plant.length,
    encoder: Q,
    expectedDecoder: Qinv,
    expectedDecoderRank: plantTruthRank,
    best: plantRows.slice(0, 5),
    truePlainScore: score(plant),
    truePlainIoC: ioc(plant),
  },
  original: {
    qAsDecoder: {
      factor: Q,
      rank: qRank,
      score: score(decodedByQ),
      ioc: ioc(decodedByQ),
      translitPrefix: decodedByQ.slice(0, 120).map((x) => corpus.translit[x]).join(''),
    },
    qInverseAsDecoder: {
      factor: Qinv,
      rank: qInvRank,
      score: score(decodedByQinv),
      ioc: ioc(decodedByQinv),
      translitPrefix: decodedByQinv.slice(0, 120).map((x) => corpus.translit[x]).join(''),
    },
    best: originalRows.slice(0, 10),
    worst: originalRows.slice(-3),
  },
  decision: 'Q and Q^-1 are tested without phase/key fitting against the complete global pairwise field-multiplier family. Promotion requires native-like original output and a competitive source-Q rank; otherwise this direct global GF(29^2) body cipher is rejected while the red-span state map remains open.',
};

const json = JSON.stringify(result, null, 2);
console.log(json);
if (process.env.RUNNER_TEMP) {
  fs.writeFileSync(path.join(process.env.RUNNER_TEMP, 'source-test-output.json'), json);
}
