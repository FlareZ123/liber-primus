'use strict';

/**
 * Source-fixed cross-round arithmetic tests for Cicada's 2013 AUDIO/761.MP3.
 *
 * The known audio integer 1,595,277,641 factors as 1259*1031*1229.
 * Modulo the 29-symbol GP alphabet the factor residues are [12,16,11],
 * with multiplicative orders [4,7,28] and product 24. Also 761 mod 29 = 7,
 * ord_29(16)=ord_29(24)=7, and 24=11^16 mod 29.
 *
 * This script tests finite, clue-motivated uses of those exact values:
 *  - 28-cycle additive/multiplicative keys from seed 24 and primitive root 11;
 *  - period-3 factor and totient residue keys;
 *  - the order-28 third-order recurrence with roots 12,16,11;
 *  - seed-24 / multiplier-11 plaintext- and ciphertext-feedback recurrences;
 *  - period-7 keys from seed 24, generator 16 or 24, forward/reverse;
 *  - the same period-7 keys on the 127 terminal red runes (p53 red 51 + p55 76);
 *  - 3x3 Hill matrices from the factor-residue eigenvalues: companion, transpose,
 *    and diagonal, including inverse/transpose/phase/page-clock variants.
 *
 * All mappings and clocks are declared in advance; no LP2 language fitting,
 * arbitrary key rotations, or unconstrained key search is used. This is a
 * bounded test of candidate mechanisms, not evidence of intended use.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const referenceText = read('resources/liber-primus/lp1-plaintext-reference.txt');
const MOD = 29;
const mod = x => ((x % MOD) + MOD) % MOD;

const AUDIO_INTEGER = 1595277641;
const FACTORS = [1259, 1031, 1229];
const FACTOR_RESIDUES = FACTORS.map(x => mod(x));
const FACTOR_TOTIENT_RESIDUES = FACTORS.map(x => mod(x - 1));

function multiplicativeOrder(a) {
  let x = 1;
  for (let k = 1; k < MOD; k++) {
    x = mod(x * a);
    if (x === 1) return k;
  }
  throw new Error('nonzero field element did not return to one');
}
function inverse(x) {
  for (let y = 1; y < MOD; y++) if (mod(x * y) === 1) return y;
  throw new Error('non-invertible key symbol ' + x);
}
assert.equal(FACTORS.reduce((a, b) => a * b, 1), AUDIO_INTEGER);
assert.deepEqual(FACTOR_RESIDUES, [12, 16, 11]);
assert.equal(mod(AUDIO_INTEGER), 24);
assert.equal(mod(761), 7);
assert.deepEqual(FACTOR_RESIDUES.map(multiplicativeOrder), [4, 7, 28]);
assert.equal(multiplicativeOrder(24), 7);
assert.equal(mod(24 * inverse(1)), 24);
let power24 = 1;
for (let i = 0; i < 16; i++) power24 = mod(power24 * 11);
assert.equal(power24, 24);

function parseGp(text) {
  const prose = text.split(/\r?\n/)
    .filter(line => !line.trim().startsWith('#') && !line.trim().startsWith('['))
    .join(' ')
    .replace(/[0-9a-f]{64,}/gi, ' ')
    .toUpperCase();
  const tokens = corpus.translit
    .map((s, i) => ({ s, i }))
    .sort((a, b) => b.s.length - a.s.length);
  const out = [];
  for (const word of prose.match(/[A-Z]+/g) || []) {
    let i = 0;
    while (i < word.length) {
      const token = tokens.find(t => word.startsWith(t.s, i));
      if (token) {
        out.push(token.i);
        i += token.s.length;
      } else {
        i++;
      }
    }
  }
  return out;
}

const pages = corpus.pages.filter(p => p.status === 'unsolved' && p.indices?.length);
const positions = [];
for (const page of pages) {
  for (const c of page.indices) positions.push({ page: page.page, c });
}
const original = positions.map(p => p.c);
assert.equal(pages.length, 55);
assert.equal(original.length, 12956);

const reference = parseGp(referenceText);
const split = Math.floor(reference.length * 0.8);
const train = reference.slice(0, split);
const holdout = reference.slice(split);
const trigramCounts = new Map();
let trigramTotal = 0;
for (let i = 0; i + 2 < train.length; i++) {
  const k = train[i] * 841 + train[i + 1] * 29 + train[i + 2];
  trigramCounts.set(k, (trigramCounts.get(k) || 0) + 1);
  trigramTotal++;
}
const SMOOTH = 0.05;
const TRIGRAM_SPACE = 29 ** 3;

function score(sequence) {
  const counts = Array(29).fill(0);
  for (const x of sequence) counts[x]++;
  const n = sequence.length;
  let logp = 0;
  for (let i = 0; i + 2 < n; i++) {
    const k = sequence[i] * 841 + sequence[i + 1] * 29 + sequence[i + 2];
    logp += Math.log(
      ((trigramCounts.get(k) || 0) + SMOOTH) /
      (trigramTotal + SMOOTH * TRIGRAM_SPACE)
    );
  }
  return {
    length: n,
    ioc: counts.reduce((s, c) => s + c * (c - 1), 0) / (n * (n - 1)),
    top12Mass: counts.slice().sort((a, b) => b - a).slice(0, 12)
      .reduce((s, c) => s + c, 0) / n,
    trigramNatsPerRune: logp / (n - 2)
  };
}

function streamAdditive(key, sign, clock) {
  const pageOffset = new Map();
  let bookOffset = 0;
  const decoded = [];
  const usedKeys = [];
  for (const position of positions) {
    let offset;
    if (clock === 'book') {
      offset = bookOffset++;
    } else {
      offset = pageOffset.get(position.page) || 0;
      pageOffset.set(position.page, offset + 1);
    }
    const k = key[offset % key.length];
    usedKeys.push(k);
    decoded.push(mod(position.c - sign * k));
  }
  assert.ok(decoded.every((p, i) => mod(p + sign * usedKeys[i]) === original[i]));
  return decoded;
}

function streamMultiplicative(key, sign, clock) {
  assert.ok(key.every(k => k !== 0), 'multiplicative key contains zero');
  const pageOffset = new Map();
  let bookOffset = 0;
  const decoded = [];
  const usedKeys = [];
  for (const position of positions) {
    let offset;
    if (clock === 'book') {
      offset = bookOffset++;
    } else {
      offset = pageOffset.get(position.page) || 0;
      pageOffset.set(position.page, offset + 1);
    }
    const k = key[offset % key.length];
    usedKeys.push(k);
    decoded.push(mod(position.c * (sign === 1 ? inverse(k) : k)));
  }
  assert.ok(decoded.every((p, i) =>
    mod(p * (sign === 1 ? usedKeys[i] : inverse(usedKeys[i]))) === original[i]
  ));
  return decoded;
}

const fullResults = [];
function recordFull(family, parameters, decoded) {
  fullResults.push({ family, ...parameters, ...score(decoded) });
}

// 1. 28-cycle from the unique primitive residue 11, seeded by product residue 24;
//    plus direct prime/totient projections and the period-3 factor controls.
const key28 = [];
let v28 = 24;
for (let i = 0; i < 28; i++) {
  key28.push(v28);
  v28 = mod(v28 * 11);
}
assert.equal(new Set(key28).size, 28);
const period3Keys = [
  ['28cycle-GP', key28],
  ['28cycle-prime-mod29', key28.map(k => mod(corpus.prime[k]))],
  ['28cycle-phi-prime-mod29', key28.map(k => mod(corpus.prime[k] - 1))],
  ['period3-factor-residues', FACTOR_RESIDUES],
  ['period3-factor-totients', FACTOR_TOTIENT_RESIDUES]
];
let directCount = 0;
for (const [name, key] of period3Keys) {
  for (const op of ['add', 'mul']) {
    if (op === 'mul' && key.some(k => k === 0)) continue;
    for (const sign of [1, -1]) {
      for (const clock of ['book', 'page']) {
        const decoded = op === 'add'
          ? streamAdditive(key, sign, clock)
          : streamMultiplicative(key, sign, clock);
        recordFull('periodic-key', { name, op, sign, clock }, decoded);
        directCount++;
      }
    }
  }
}
assert.equal(directCount, 32);

// 2. Third-order recurrence whose characteristic roots are the three residues.
const recurrence = FACTOR_RESIDUES.slice();
while (recurrence.length < 28) {
  const n = recurrence.length;
  recurrence.push(mod(
    10 * recurrence[n - 1] - 7 * recurrence[n - 2] + 24 * recurrence[n - 3]
  ));
}
assert.equal(recurrence.length, 28);
for (const sign of [1, -1]) {
  for (const clock of ['book', 'page']) {
    recordFull('third-order-factor-recurrence', { sign, clock },
      streamAdditive(recurrence, sign, clock));
  }
}

// 3. Simple reversible affine feedback seeded by 24 and multiplied by 11.
for (const feedback of ['ciphertext', 'plaintext']) {
  for (const sign of [1, -1]) {
    for (const clock of ['book', 'page']) {
      const decoded = [];
      let state = 24;
      let lastPage = null;
      for (let i = 0; i < positions.length; i++) {
        if (clock === 'page' && positions[i].page !== lastPage) {
          state = 24;
          lastPage = positions[i].page;
        }
        const c = original[i];
        const p = mod(c - sign * state);
        decoded.push(p);
        state = mod(11 * state + (feedback === 'ciphertext' ? c : p));
      }
      let verifyState = 24;
      lastPage = null;
      for (let i = 0; i < positions.length; i++) {
        if (clock === 'page' && positions[i].page !== lastPage) {
          verifyState = 24;
          lastPage = positions[i].page;
        }
        const c = mod(decoded[i] + sign * verifyState);
        assert.equal(c, original[i]);
        verifyState = mod(11 * verifyState +
          (feedback === 'ciphertext' ? c : decoded[i]));
      }
      recordFull('seed24-multiplier11-feedback', { feedback, sign, clock }, decoded);
    }
  }
}

// 4. Period-7 keys: ord(16)=ord(24)=7, and 761 mod29 = 7.
//    Test seed 24 or identity, factor16 or product24 as generator, both directions.
const period7Candidates = [];
for (const [generatorName, generator] of [['factor16', 16], ['product24', 24]]) {
  for (const start of [24, 1]) {
    for (const direction of [1, -1]) {
      const key = [];
      let x = start;
      const step = direction === 1 ? generator : inverse(generator);
      for (let i = 0; i < 7; i++) {
        key.push(x);
        x = mod(x * step);
      }
      period7Candidates.push({ generatorName, start, direction, key });
    }
  }
}
assert.equal(period7Candidates.length, 8);
const period7Full = [];
for (const candidate of period7Candidates) {
  for (const op of ['add', 'mul']) {
    for (const sign of [1, -1]) {
      for (const clock of ['book', 'page']) {
        const decoded = op === 'add'
          ? streamAdditive(candidate.key, sign, clock)
          : streamMultiplicative(candidate.key, sign, clock);
        const result = {
          family: 'period7-audio-key',
          generatorName: candidate.generatorName,
          start: candidate.start,
          direction: candidate.direction,
          key: candidate.key,
          op, sign, clock,
          ...score(decoded)
        };
        period7Full.push(result);
        fullResults.push(result);
      }
    }
  }
}
assert.equal(period7Full.length, 64);

// 5. Same period-7 key on the source-selected terminal red target:
//    p53 red local [128,179) = 51 runes, then p55 = 76 runes.
const p53 = corpus.pages.find(p => p.page === 53).indices.slice(128, 179);
const p55 = corpus.pages.find(p => p.page === 55).indices;
const redTarget = p53.concat(p55);
assert.equal(p53.length, 51);
assert.equal(p55.length, 76);
assert.equal(redTarget.length, 127);
const redResults = [];
for (const [generatorName, generator] of [['factor16', 16], ['product24', 24]]) {
  for (const direction of [1, -1]) {
    const key = [];
    let x = 24;
    const step = direction === 1 ? generator : inverse(generator);
    for (let i = 0; i < 7; i++) {
      key.push(x);
      x = mod(x * step);
    }
    for (const sign of [1, -1]) {
      for (const reset of ['continuous', 'p55-reset']) {
        const decoded = [];
        let offset = 0;
        for (const c of p53) decoded.push(mod(c - sign * key[offset++ % 7]));
        if (reset === 'p55-reset') offset = 0;
        for (const c of p55) decoded.push(mod(c - sign * key[offset++ % 7]));
        const check = [];
        let verifyOffset = 0;
        for (const p of decoded.slice(0, 51)) check.push(mod(p + sign * key[verifyOffset++ % 7]));
        if (reset === 'p55-reset') verifyOffset = 0;
        for (const p of decoded.slice(51)) check.push(mod(p + sign * key[verifyOffset++ % 7]));
        assert.deepEqual(check, redTarget);
        redResults.push({
          family: 'period7-terminal-red-target',
          generatorName, direction, key, sign, reset,
          ...score(decoded),
          p53Score: score(decoded.slice(0, 51)),
          p55Score: score(decoded.slice(51))
        });
      }
    }
  }
}
assert.equal(redResults.length, 16);

// 6. 3x3 Hill candidates from the same three eigenvalue residues.
//    Companion polynomial: (X-12)(X-16)(X-11) = X^3-10X^2+7X-24.
function matrixInverse(A) {
  const n = A.length;
  const a = A.map((r, i) => r.concat(Array.from({ length: n }, (_, j) => i === j ? 1 : 0)));
  for (let c = 0; c < n; c++) {
    let r = c;
    while (r < n && mod(a[r][c]) === 0) r++;
    if (r === n) throw new Error('singular Hill matrix');
    [a[c], a[r]] = [a[r], a[c]];
    const di = inverse(a[c][c]);
    a[c] = a[c].map(v => mod(v * di));
    for (let i = 0; i < n; i++) if (i !== c) {
      const f = a[i][c];
      a[i] = a[i].map((v, j) => mod(v - f * a[c][j]));
    }
  }
  return a.map(r => r.slice(n));
}
function matrixVector(A, v) {
  return A.map(row => mod(row.reduce((s, x, i) => s + x * v[i], 0)));
}
function transformSegment(input, matrix, align) {
  const out = [];
  let i = 0;
  while (i < Math.min(align, input.length)) out.push(input[i++]);
  while (i + 3 <= input.length) {
    out.push(...matrixVector(matrix, input.slice(i, i + 3)));
    i += 3;
  }
  while (i < input.length) out.push(input[i++]);
  return out;
}
function transformBlocks(input, matrix, align, resetAtPages) {
  if (!resetAtPages) return transformSegment(input, matrix, align);
  const out = [];
  let offset = 0;
  for (const page of pages) {
    const segment = input.slice(offset, offset + page.indices.length);
    out.push(...transformSegment(segment, matrix, align));
    offset += page.indices.length;
  }
  if (offset < input.length) out.push(...input.slice(offset));
  return out;
}
const companion = [[0, 1, 0], [0, 0, 1], [24, 22, 10]];
const companionT = companion[0].map((_, i) => companion.map(r => r[i]));
const diagonal = [[12, 0, 0], [0, 16, 0], [0, 0, 11]];
const hillMatrices = [['companion', companion], ['companion-transpose', companionT], ['diagonal', diagonal]];
const hillResults = [];
for (const [matrixName, matrix] of hillMatrices) {
  for (const [direction, keyMatrix] of [['key-as-decrypt', matrix], ['inverse-key', matrixInverse(matrix)]]) {
    for (const transpose of [false, true]) {
      const decryptMatrix = transpose
        ? keyMatrix[0].map((_, i) => keyMatrix.map(r => r[i]))
        : keyMatrix;
      for (const align of [0, 1, 2]) {
        for (const clock of ['book', 'page']) {
          const decoded = transformBlocks(original, decryptMatrix, align, clock === 'page');
          const reencryption = transformBlocks(
            decoded, matrixInverse(decryptMatrix), align, clock === 'page'
          );
          assert.deepEqual(reencryption, original);
          const result = {
            family: 'three-by-three-Hill',
            matrixName, direction, transpose, align, clock,
            ...score(decoded)
          };
          hillResults.push(result);
          fullResults.push(result);
        }
      }
    }
  }
}
assert.equal(hillResults.length, 72);

// Positive control: the canonical companion matrix encrypts/decrypts a planted
// 12,954-symbol GP-English sequence exactly, with no partial block.
const plant = reference.slice(0, 12954);
const plantedCipher = transformBlocks(plant, companion, 0, false);
const plantedPlain = transformBlocks(plantedCipher, matrixInverse(companion), 0, false);
assert.deepEqual(plantedPlain, plant);

function bestOf(results) {
  return results.slice().sort((a, b) =>
    b.trigramNatsPerRune - a.trigramNatsPerRune
  )[0];
}
function bestByFamily(results) {
  const out = {};
  for (const item of results) {
    if (!out[item.family] || item.trigramNatsPerRune > out[item.family].trigramNatsPerRune) {
      out[item.family] = item;
    }
  }
  return out;
}

const result = {
  historicalSource: {
    integer: AUDIO_INTEGER,
    factors: FACTORS,
    factorResiduesMod29: FACTOR_RESIDUES,
    factorOrders: FACTOR_RESIDUES.map(multiplicativeOrder),
    productResidue: mod(AUDIO_INTEGER),
    fileIdResidue: mod(761),
    order24: multiplicativeOrder(24),
    order16: multiplicativeOrder(16),
    order11: multiplicativeOrder(11),
    relation24Equals11To16: true,
    period7Seed24Generator16: (() => {
      const a = [];
      let x = 24;
      for (let i = 0; i < 7; i++) { a.push(x); x = mod(x * 16); }
      return a;
    })()
  },
  source: { pages: pages.length, unknownRunes: original.length },
  reference: {
    gpSymbols: reference.length,
    trainSymbols: train.length,
    holdoutSymbols: holdout.length,
    holdoutScore: score(holdout)
  },
  rawCiphertextScore: score(original),
  testedVariants: {
    directPeriod28AndPeriod3: directCount,
    thirdOrderRecurrence: 4,
    affineFeedback: 8,
    period7FullStream: period7Full.length,
    period7TerminalRedTarget: redResults.length,
    threeByThreeHill: hillResults.length,
    total: directCount + 4 + 8 + period7Full.length + redResults.length + hillResults.length
  },
  bestFullStreamByFamily: bestByFamily(fullResults),
  bestFullStreamOverall: bestOf(fullResults),
  bestTerminalRedTarget: bestOf(redResults),
  hillPositiveControlExact: true,
  allCandidateOriginalReencryptionsExact: true,
  interpretation: 'The modulo-29 cross-round relation is exact, but all declared source-fixed key, recurrence, and Hill uses remain ciphertext-like; no LP2 plaintext was recovered.'
};
console.log(JSON.stringify(result, null, 2));
