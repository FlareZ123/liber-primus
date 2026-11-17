'use strict';

/**
 * Source-original 28-nonzero-step, shared-page-chain-pad inversion SFT.
 *
 * Candidate reversible operator:
 *   D[p,j] = (C[p,j] - C[p,j-1]) mod 29, j>=1
 *   D[p,j] = 0                      if P[p,j] == EA (GP index 28)
 *   D[p,j] = 1 + ((P[p,j]+K[j]+S[p]) mod 28), otherwise.
 *
 * Thus every nonzero step is one of 28 permitted ciphertext increments,
 * and a literal ciphertext doublet represents plaintext EA. The source has
 * exactly 86 original doublets, a rate similar to EA in solved LP1 text.
 *
 * The common 28-valued key K[j] is arbitrarily aperiodic and unknown. S[p]
 * may be one arbitrary additional page-specific Caesar salt (0 for M1).
 * M1 tests held-out recovery; M2 cancels every K[j] algebraically between
 * pages and grants each page pair its individually best secret salt.
 *
 * This is a read-only deterministic Node22 CommonJS single-file test.
 * Page-length control implants are from source-native GP text, not invented
 * target plaintext. Independently random keystream controls must fail.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const data = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const solved = fs.readFileSync(path.join(root, 'lp1-plaintext-reference.txt'), 'utf8');
const M = 29;
const N = 28;
const EX = 28; // EA is the final, index-28 Gematria Primus rune
const pages = data.pages.filter(p => p.page <= 55 && p.indices.length)
  .map(p => p.indices);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((s, p) => s + p.length, 0), 12956);
assert.equal(data.translit[EX], 'EA');

function reference() {
  const symbols = data.translit.map((name, rune) => ({name, rune}))
    .sort((a, b) => b.name.length - a.name.length);
  const words = solved.split('\n').filter(line =>
    !line.startsWith('#') && !line.startsWith('['))
    .join(' ').toUpperCase().match(/[A-Z]+/g) || [];
  const result = [];
  let usedWords = 0;
  for (const word of words) {
    let at = 0;
    const runes = [];
    while (at < word.length) {
      const match = symbols.find(s => word.startsWith(s.name, at));
      if (!match) break;
      runes.push(match.rune);
      at += match.name.length;
    }
    if (at === word.length) {
      result.push(...runes);
      usedWords++;
    }
  }
  result.push(...data.pages.find(p => p.page === 57).indices);
  return {result, usedWords};
}

const ref = reference();
assert.equal(ref.result.length, 3074);
assert.equal(ref.usedWords, 768);
const freq = Array(M).fill(0.5);
for (const rune of ref.result) freq[rune]++;
const norm = freq.reduce((x, y) => x + y);
const logPlain = freq.map(x => Math.log(x / norm));
const probRank = freq.slice(0, N).map(x => x /
  freq.slice(0, N).reduce((a, b) => a + b));
const diffProb = Array(N).fill(0);
for (let x = 0; x < N; x++)
  for (let y = 0; y < N; y++)
    diffProb[(x - y + N) % N] += probRank[x] * probRank[y];
const logDiff = diffProb.map(Math.log);

function steps(rows) {
  return rows.map(row => row.slice(1).map((x, j) =>
    (x - row[j] + M) % M));
}

const originalSteps = steps(pages);
const originalRepeats = originalSteps.reduce((a, row) =>
  a + row.filter(x => x === 0).length, 0);
assert.equal(originalRepeats, 86);

/**
 * Model M1: independently infer each K[j] on training pages and score
 * held-out physical pages, including frozen zero=EA prediction.
 */
function heldout(rows) {
  let total = 0, length = 0;
  const folds = [];
  const maxLength = Math.max(...rows.map(p => p.length));
  for (let fold = 0; fold < 5; fold++) {
    const key = Array(maxLength).fill(0);
    for (let j = 0; j < maxLength; j++) {
      let best = -Infinity;
      for (let k = 0; k < N; k++) {
        let score = 0;
        for (let p = 0; p < rows.length; p++) {
          if (p % 5 === fold || j >= rows[p].length) continue;
          const d = rows[p][j];
          if (d) score += logPlain[(d - 1 - k + N) % N];
        }
        if (score > best) { best = score; key[j] = k; }
      }
    }
    let score = 0, n = 0, zeros = 0;
    for (let p = 0; p < rows.length; p++) {
      if (p % 5 !== fold) continue;
      for (let j = 0; j < rows[p].length; j++) {
        const d = rows[p][j];
        if (d) score += logPlain[(d - 1 - key[j] + N) % N];
        else {score += logPlain[EX]; zeros++;}
        n++;
      }
    }
    folds.push({fold, n, zeros, average: score / n});
    total += score;
    length += n;
  }
  return {mean: total / length, length, folds};
}

/**
 * Model M2: each pair p,q has D[p,j]-D[q,j] equal to
 * P[p,j]-P[q,j]+S[p]-S[q] modulo28 when both D are nonzero.
 * Optimize each pair's unknown relative salt independently, strictly more
 * permissive than fitting consistent per-page salts.
 */
function pairwise(rows) {
  let sum = 0, n = 0, pairs = 0;
  for (let p = 0; p < rows.length; p++) {
    for (let q = p + 1; q < rows.length; q++) {
      const bins = Array(N).fill(0);
      const length = Math.min(rows[p].length, rows[q].length);
      for (let j = 0; j < length; j++) {
        const a = rows[p][j], b = rows[q][j];
        if (!a || !b) continue;
        bins[(a - b + N) % N]++;
        n++;
      }
      let best = -Infinity;
      for (let shift = 0; shift < N; shift++) {
        let likelihood = 0;
        for (let d = 0; d < N; d++)
          likelihood += bins[d] * logDiff[(d - shift + N) % N];
        if (likelihood > best) best = likelihood;
      }
      sum += best;
      pairs++;
    }
  }
  return {mean: sum / n, n, pairs};
}

function random(seed) {
  let state = seed >>> 0;
  return () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0)
    / 4294967296);
}

function encrypt(plaintext, key, salt, start) {
  const chain = [start];
  for (let j = 0; j < plaintext.length; j++) {
    const p = plaintext[j];
    const step = p === EX ? 0 : 1 + ((p + key[j] + salt) % N);
    chain.push((chain[j] + step) % M);
  }
  return chain;
}

function decrypt(chain, key, salt) {
  const output = [];
  for (let j = 1; j < chain.length; j++) {
    const step = (chain[j] - chain[j - 1] + M) % M;
    output.push(step === 0 ? EX :
      (step - 1 - key[j - 1] - salt + 2 * N) % N);
  }
  return output;
}

function plant(seed) {
  const rand = random(2014 + 3301 * seed);
  const max = Math.max(...pages.map(p => p.length - 1));
  const key = Array.from({length: max}, () => Math.floor(rand() * N));
  const salts = pages.map(() => Math.floor(rand() * N));
  const plain = pages.map(page => {
    const offset = Math.floor(rand() * ref.result.length);
    return Array.from({length: page.length - 1}, (_, j) =>
      ref.result[(offset + j) % ref.result.length]);
  });
  const common = plain.map((p, i) => encrypt(p, key, 0, i % M));
  const salted = plain.map((p, i) => encrypt(p, key, salts[i], i % M));
  for (let i = 0; i < pages.length; i++) {
    assert.deepEqual(decrypt(common[i], key, 0), plain[i]);
    assert.deepEqual(decrypt(salted[i], key, salts[i]), plain[i]);
  }
  const independent = plain.map(p => {
    const result = [Math.floor(rand() * M)];
    for (const rune of p) {
      const next = rune === EX ? 0 : 1 + Math.floor(rand() * N);
      result.push((result[result.length - 1] + next) % M);
    }
    return result;
  });
  return {common: steps(common), salted: steps(salted),
    independent: steps(independent), plain};
}

const original = {heldout: heldout(originalSteps), pairwise: pairwise(originalSteps)};
const controls = [];
for (let seed = 1; seed <= 3; seed++) {
  const p = plant(seed);
  controls.push({seed,
    common: heldout(p.common).mean,
    independent: heldout(p.independent).mean,
    salted: pairwise(p.salted).mean,
    nullPair: pairwise(p.independent).mean,
    repeats: p.common.reduce((n, row) =>
      n + row.filter(x => x === 0).length, 0)
  });
}
assert(original.heldout.mean < -4,
  'Original rank28 shared page-pad generated native GP prose unexpectedly');
assert(original.pairwise.mean < -3.32,
  'Original rank28 shared page-pad plus arbitrary page salt generated native GP prose unexpectedly');
for (const p of controls) {
  assert(p.common > -3.2, 'Failed shared chain-pad plant ' + p.seed);
  assert(p.independent < -4, 'False random-pad hit ' + p.seed);
  assert(p.salted > -3.32, 'Failed salted chain-pad plant ' + p.seed);
  assert(p.nullPair < -3.32, 'False random-pair hit ' + p.seed);
}
console.log(JSON.stringify({
  originalRunes: pages.reduce((n, page) => n + page.length, 0),
  originalStepRunes: originalSteps.reduce((n, row) => n + row.length, 0),
  originalZeroSteps: originalRepeats,
  originalZeroStepRate: originalRepeats /
    originalSteps.reduce((n, row) => n + row.length, 0),
  sourceReferenceEAProbability: freq[EX] / norm,
  sourceReferenceRunes: ref.result.length,
  sourceReferenceWords: ref.usedWords,
  original, controls
}, null, 2));
console.log('PASS: reversible 28-nonzero-step chain fits all native plants; original is null-like');
