'use strict';

/**
 * Original-cipher GP29 reused-page-pad screen, including secret page Caesar salts.
 * Node.js 22, read-only, deterministic single-file test.
 *
 * Independent original physical pages are the rows; rune position is the column.
 * M1: C[p,j] = (P[p,j] + K[j]) mod 29.
 * M2: C[p,j] = (P[p,j] + K[j] + S[p]) mod 29.
 * A held-out M1 unigram screen estimates K only from other pages.
 * For M2, each page pair is given its own OPTIMAL salt difference, an
 * overpowered relaxation of consistent global page salts. The remaining
 * pairwise rune differences cancel the completely arbitrary unknown K[j].
 *
 * The LP1 reference is editor-normalized English; unsupported Latin words are
 * omitted rather than inventing GP transliterations. Native clear LP2 p57 is
 * appended to the reference. The tests apply to native GP29 English only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const source = fs.readFileSync(path.join(root, 'lp1-plaintext-reference.txt'), 'utf8');
const MOD = 29;
const pages = corpus.pages.filter(p => p.page >= 0 && p.page <= 55 && p.indices.length)
  .map(p => p.indices);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((a, p) => a + p.length, 0), 12956);
assert.equal(corpus.translit.length, MOD);

function makeReference(text) {
  const alphabet = corpus.translit.map((s, i) => ({s, i}))
    .sort((a, b) => b.s.length - a.s.length);
  const words = text.split('\n').filter(line => !line.startsWith('#') &&
    !line.startsWith('[')).join(' ').toUpperCase().match(/[A-Z]+/g) || [];
  const out = [];
  let used = 0;
  for (const word of words) {
    const symbols = [];
    let valid = true;
    for (let at = 0; at < word.length;) {
      const match = alphabet.find(a => word.startsWith(a.s, at));
      if (!match) { valid = false; break; }
      symbols.push(match.i);
      at += match.s.length;
    }
    if (valid) { out.push(...symbols); used++; }
  }
  out.push(...corpus.pages.find(p => p.page === 57).indices);
  return {out, used};
}
const reference = makeReference(source);
assert.equal(reference.out.length, 3074);
const count = Array(MOD).fill(0.5);
for (const x of reference.out) count[x]++;
const total = count.reduce((a, b) => a + b, 0);
const logProb = count.map(c => Math.log(c / total));

function logScore(rows, subset, key) {
  let sum = 0;
  let n = 0;
  for (const p of subset) {
    const row = rows[p];
    for (let j = 0; j < row.length; j++) {
      sum += logProb[(row[j] - key[j] + MOD) % MOD];
      n++;
    }
  }
  return {mean: sum / n, runes: n};
}

function fivefold(rows) {
  let holdSum = 0;
  let holdN = 0;
  const folds = [];
  const maxLength = Math.max(...rows.map(r => r.length));
  for (let fold = 0; fold < 5; fold++) {
    const train = rows.map((_, i) => i).filter(i => i % 5 !== fold);
    const hold = rows.map((_, i) => i).filter(i => i % 5 === fold);
    const key = Array(maxLength);
    for (let j = 0; j < maxLength; j++) {
      let best = -Infinity;
      for (let k = 0; k < MOD; k++) {
        let score = 0;
        for (const i of train) {
          const symbol = rows[i][j];
          if (symbol !== undefined) score += logProb[(symbol - k + MOD) % MOD];
        }
        if (score > best) { best = score; key[j] = k; }
      }
    }
    const tested = logScore(rows, hold, key);
    const fitted = logScore(rows, train, key);
    holdN += tested.runes;
    holdSum += tested.mean * tested.runes;
    folds.push({fold, train: fitted.mean, hold: tested.mean,
      heldoutRunes: tested.runes});
  }
  return {heldoutMean: holdSum / holdN, folds};
}

const diffProb = Array(MOD).fill(0);
for (let a = 0; a < MOD; a++)
  for (let b = 0; b < MOD; b++)
    diffProb[(a - b + MOD) % MOD] +=
      (count[a] / total) * (count[b] / total);
const logDiff = diffProb.map(Math.log);

/**
 * Source-only M2 necessary-condition test. The arbitrary K[j] cancels from
 * C[p,j]-C[q,j], even when K is entirely aperiodic and unknown.
 * Give EACH of the 1485 page pairs its own best salt, independently.
 */
function bestPairMean(rows) {
  let overall = 0;
  let n = 0;
  let pairs = 0;
  for (let p = 0; p < rows.length; p++)
    for (let q = p + 1; q < rows.length; q++) {
      const bins = Array(MOD).fill(0);
      const length = Math.min(rows[p].length, rows[q].length);
      for (let j = 0; j < length; j++)
        bins[(rows[p][j] - rows[q][j] + MOD) % MOD]++;
      let best = -Infinity;
      for (let salt = 0; salt < MOD; salt++) {
        let score = 0;
        for (let d = 0; d < MOD; d++)
          score += bins[d] * logDiff[(d - salt + MOD) % MOD];
        if (score > best) best = score;
      }
      overall += best;
      n += length;
      pairs++;
    }
  return {mean: overall / n, pairs, pairedRunes: n};
}

function random(seed) {
  let state = seed >>> 0;
  return () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) /
    4294967296);
}

function plants(seed) {
  const rand = random(2016 + seed * 3301);
  const max = Math.max(...pages.map(r => r.length));
  const key = Array.from({length: max}, () => Math.floor(rand() * MOD));
  const plaintext = pages.map(row => {
    const offset = Math.floor(rand() * reference.out.length);
    return Array.from({length: row.length},
      (_, j) => reference.out[(offset + j) % reference.out.length]);
  });
  const salt = pages.map(() => Math.floor(rand() * MOD));
  const shared = plaintext.map(row =>
    row.map((x, j) => (x + key[j]) % MOD));
  const salted = plaintext.map((row, p) =>
    row.map((x, j) => (x + key[j] + salt[p]) % MOD));
  const unique = plaintext.map(row =>
    row.map(x => (x + Math.floor(rand() * MOD)) % MOD));
  return {shared, salted, unique};
}

const originalFivefold = fivefold(pages);
const originalPairs = bestPairMean(pages);
const outcomes = [];
for (let seed = 1; seed <= 6; seed++) {
  const p = plants(seed);
  outcomes.push({
    seed,
    sharedHoldout: fivefold(p.shared).heldoutMean,
    randomHoldout: fivefold(p.unique).heldoutMean,
    saltedBestPairs: bestPairMean(p.salted).mean,
    randomBestPairs: bestPairMean(p.unique).mean
  });
}

assert(originalFivefold.heldoutMean < -4.0,
  'Original matches a native-GP repeated no-salt page pad unexpectedly');
assert(originalPairs.mean < -3.35,
  'Original matches a native-GP repeated page pad with per-page salts unexpectedly');
for (const x of outcomes) {
  assert(x.sharedHoldout > -3.2, 'Missing planted M1 recovery: seed ' + x.seed);
  assert(x.randomHoldout < -4.0, 'M1 false positive: seed ' + x.seed);
  assert(x.saltedBestPairs > -3.35, 'Missing planted M2 signal: seed ' + x.seed);
  assert(x.randomBestPairs < -3.35, 'M2 false positive: seed ' + x.seed);
}
console.log(JSON.stringify({
  source: 'resources/liber-primus/lp2-corpus.json',
  reference: 'resources/liber-primus/lp1-plaintext-reference.txt + clear LP2 p57',
  pages: pages.length,
  runes: pages.reduce((a, p) => a + p.length, 0),
  referenceRunes: reference.out.length,
  referenceWords: reference.used,
  originalFivefold,
  originalPairs,
  outcomes
}, null, 2));
console.log('PASS: original direct GP29 page-pad M1/M2 screens are null-like; plants pass');
