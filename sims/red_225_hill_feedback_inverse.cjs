'use strict';

/**
 * Source-constrained 15x15 Hill/feedback inverse from all 225 LP2 red runes.
 * Run with Node.js: node sims/red_225_hill_feedback_inverse.cjs
 * No dependencies or fitted cipher keys.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
const english = fs.readFileSync(path.join(root, 'resources/control/shakespeare_first300k.txt'), 'utf8');
const MOD = 29;
const m = x => ((x % MOD) + MOD) % MOD;

/** Invert a 15x15 matrix modulo 29, returning null if singular. */
function inverse(matrix) {
  const n = 15;
  const a = matrix.map((r, i) => r.concat(Array.from({ length: n }, (_, j) => Number(i === j))));
  let rank = 0;
  for (let c = 0; c < n; c++) {
    let pivot = rank;
    while (pivot < n && a[pivot][c] === 0) pivot++;
    if (pivot === n) continue;
    [a[rank], a[pivot]] = [a[pivot], a[rank]];
    let inversePivot = 1;
    while (m(a[rank][c] * inversePivot) !== 1) inversePivot++;
    for (let j = c; j < 2 * n; j++) a[rank][j] = m(a[rank][j] * inversePivot);
    for (let i = 0; i < n; i++) {
      if (i === rank) continue;
      const factor = a[i][c];
      for (let j = c; j < 2 * n; j++) a[i][j] = m(a[i][j] - factor * a[rank][j]);
    }
    rank++;
  }
  return rank === n ? a.map(row => row.slice(n)) : null;
}

/** Left multiplication of 15-rune column by source-defined matrix. */
function multiply(matrix, v) {
  return matrix.map(row => m(row.reduce((sum, x, j) => sum + x * v[j], 0)));
}
const add = (a, b) => a.map((x, j) => m(x + b[j]));
const sub = (a, b) => a.map((x, j) => m(x - b[j]));
const transposed = a => a[0].map((_, j) => a.map(r => r[j]));

const red = [];
for (const page of ink.pages) for (const span of page.red_spans || []) {
  const original = corpus.pages.find(p => p.page === page.page);
  const values = Array.from(span.runes).map(s => corpus.runes.indexOf(s));
  assert.equal(values.length, span.length);
  assert.deepEqual(original.indices.slice(span.start, span.start + span.length), values);
  red.push(...values);
}
assert.equal(red.length, 225);
const cipherPages = corpus.pages.filter(p => p.status === 'unsolved' && p.indices.length > 0).map(p => p.indices);
assert.equal(cipherPages.length, 55);
assert.equal(cipherPages.flat().length, 12956);

/** A specific reversible cipher; all its parameters are public source-derived. */
function encryptBlock(plain, prevC, prevP, mode, matrix) {
  if (mode === 'ECB') return multiply(matrix, plain);
  if (mode === 'CBC') return multiply(matrix, add(plain, prevC));
  if (mode === 'CFB') return add(plain, multiply(matrix, prevC));
  if (mode === 'PCBC') return multiply(matrix, add(add(plain, prevC), prevP));
  throw new Error('Unknown mode ' + mode);
}
function decryptBlock(cipher, prevC, prevP, mode, matrix, inv) {
  if (mode === 'ECB') return multiply(inv, cipher);
  if (mode === 'CBC') return sub(multiply(inv, cipher), prevC);
  if (mode === 'CFB') return sub(cipher, multiply(matrix, prevC));
  if (mode === 'PCBC') return sub(sub(multiply(inv, cipher), prevC), prevP);
  throw new Error('Unknown mode ' + mode);
}

/** On the last incomplete block, leave runes untransformed and unscored. */
function apply(groups, matrix, inv, mode, phase, operation) {
  const output = [];
  for (const group of groups) {
    let prevC = Array(15).fill(0);
    let prevP = Array(15).fill(0);
    for (let start = phase; start + 15 <= group.length; start += 15) {
      const b = group.slice(start, start + 15);
      const cur = operation === 'encrypt' ? encryptBlock(b, prevC, prevP, mode, matrix) : decryptBlock(b, prevC, prevP, mode, matrix, inv);
      output.push(...cur);
      prevC = operation === 'encrypt' ? cur : b;
      prevP = operation === 'encrypt' ? b : cur;
    }
  }
  return output;
}
function ioc(symbols) {
  const n = symbols.length;
  if (n < 2) return 0;
  const f = Array(29).fill(0);
  for (const s of symbols) f[s]++;
  return f.reduce((sum, k) => sum + k * (k - 1), 0) / (n * (n - 1));
}
/** Encode English sample in canonical GP transliteration for positive controls. */
function englishGP(s) {
  const x = s.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S');
  const labels = corpus.translit.map((v, i) => [v, i]).sort((a, b) => b[0].length - a[0].length);
  const result = [];
  for (let i = 0; i < x.length;) {
    let matched = false;
    for (const [label, value] of labels) if (x.startsWith(label, i)) {
      result.push(value); i += label.length; matched = true; break;
    }
    if (!matched) i++;
  }
  return result;
}
const gp = englishGP(english);
assert.ok(gp.length > 12956);
const original = cipherPages.flat();
const results = [];
const plants = [];
for (const alphabet of ['index', 'prime']) {
  const values = red.map(i => alphabet === 'index' ? i : m(corpus.prime[i]));
  const rows = Array.from({ length: 15 }, (_, i) => values.slice(15 * i, 15 * (i + 1)));
  for (const order of ['rows', 'columns']) {
    const matrix = order === 'rows' ? rows : transposed(rows);
    const inv = inverse(matrix);
    assert.ok(inv, alphabet + '/' + order + ' is singular');
    for (const mode of ['ECB', 'CBC', 'CFB', 'PCBC']) {
      for (const clock of ['book', 'page']) {
        const groups = clock === 'book' ? [original] : cipherPages;
        for (let phase = 0; phase < 15; phase++) {
          const d = apply(groups, matrix, inv, mode, phase, 'decrypt');
          const cut = Math.floor(d.length / 2);
          results.push({
            alphabet, order, mode, clock, phase, n: d.length,
            ioc: ioc(d), trainIoC: ioc(d.slice(0, cut)), heldoutIoC: ioc(d.slice(cut))
          });
        }
        const lengths = groups.map(g => Math.floor(g.length / 15) * 15);
        const need = lengths.reduce((a, b) => a + b, 0);
        let at = 1000;
        const clear = lengths.map(n => { const s = gp.slice(at, at + n); at += n; return s; });
        const ciphertext = [];
        for (const g of clear) ciphertext.push(apply([g], matrix, inv, mode, 0, 'encrypt'));
        const recovered = apply(ciphertext, matrix, inv, mode, 0, 'decrypt');
        const target = clear.flat();
        assert.deepEqual(recovered, target, 'planted roundtrip mismatch');
        plants.push({alphabet, order, mode, clock, recovered: recovered.length, accuracy:1, plaintextIoC:ioc(target)});
      }
    }
  }
}
const byTrain = results.slice().sort((a,b) => b.trainIoC - a.trainIoC);
const byHeldout = results.slice().sort((a,b) => b.heldoutIoC - a.heldoutIoC);
console.log(JSON.stringify({
  study: 'red-225-source-hill-feedback', seed: null,
  source: {red:225, nUnsolvedRunes:original.length, nPages:cipherPages.length, matrixSize:15, mod:29},
  tested: results.length, observedCipherIoC:ioc(original),
  bestByTraining:byTrain.slice(0,15),
  bestByHeldout:byHeldout.slice(0,5),
  originalHeldoutAtTrainWinner:byTrain[0].heldoutIoC,
  englishGPSourceIoC:ioc(gp),
  plantedModes:plants.length,
  plantedAccuracyMin:Math.min(...plants.map(p=>p.accuracy)),
  plantedPlaintextIoCMin:Math.min(...plants.map(p=>p.plaintextIoC)),
  plantedPlaintextIoCMax:Math.max(...plants.map(p=>p.plaintextIoC))
},null,2));
