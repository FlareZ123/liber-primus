#!/usr/bin/env node
'use strict';

// Source-fixed PGL2 rank-differential register test.
// Run from repository root: node sims/lp1_mobius_rank_differential_sft.cjs

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.resolve(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const corpus = read('resources/liber-primus/lp2-corpus.json');
const pages = corpus.pages.filter(p => p.page <= 55).map(p => p.indices);
const ciphertext = pages.flat();
const translit = corpus.translit;
assert.equal(pages.length, 56);
assert.equal(ciphertext.length, 12956);

const gp = new Map(translit.map((s, i) => [s, i]));
gp.set('ING', 21);
function englishToGP(text) {
  const s = text.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (const word of s.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      let found = false;
      for (const n of [3, 2, 1]) {
        const token = word.slice(i, i + n);
        if (gp.has(token)) {
          out.push(gp.get(token));
          i += n;
          found = true;
          break;
        }
      }
      if (!found) throw new Error('unmapped control text at ' + word.slice(i));
    }
  }
  return out;
}
const controlText = fs.readFileSync(path.join(ROOT, 'resources/control/emerson_essays_2944.txt'), 'utf8');
const control = englishToGP(controlText);
const controlNonEA = control.filter(x => x !== 28);
assert.ok(controlNonEA.length >= ciphertext.length);

const mod = (x, p) => ((x % p) + p) % p;
function inv(a, p = 29) {
  a = mod(a, p);
  for (let x = 1; x < p; x++) if (mod(a * x, p) === 1) return x;
  throw new Error('noninvertible residue ' + a);
}
function matInv(A) {
  const d = inv(mod(A[0][0] * A[1][1] - A[0][1] * A[1][0]));
  return [
    [mod(A[1][1] * d), mod(-A[0][1] * d)],
    [mod(-A[1][0] * d), mod(A[0][0] * d)]
  ];
}
function applyPGL2(A, x) {
  const [a, b] = A[0], [c, d] = A[1];
  if (x === null) return c === 0 ? null : mod(a * inv(c));
  const den = mod(c * x + d);
  return den === 0 ? null : mod((a * x + b) * inv(den));
}

// Opposite-corner matrix of the LP1 p05 MOBIUS square.
const M05 = [[272, 151], [151, 272]].map(row => row.map(x => mod(x, 29)));
const M05inv = matInv(M05);

// The p05 MOBIUS cell is 226; 226 mod 29 = 23.
// The projective action has two fixed points 1 and 28 (EA).
// Replacing the omitted fixed coordinate 1 by projective infinity gives
// the source-selected 28-symbol orbit over every non-EA GP index.
function cycleFor(A) {
  const symbols = [];
  let point = 23;
  for (let i = 0; i < 28; i++) {
    assert.notEqual(point, 1);
    assert.notEqual(point, 28);
    symbols.push(point === null ? 1 : point);
    point = applyPGL2(A, point);
  }
  assert.equal(point, 23);
  assert.equal(new Set(symbols).size, 28);
  assert.deepEqual(symbols.slice().sort((a, b) => a - b), [...Array(28).keys()]);
  return symbols;
}

const tri = new Map();
for (let i = 0; i + 2 < control.length; i++) {
  const k = control[i] * 841 + control[i + 1] * 29 + control[i + 2];
  tri.set(k, (tri.get(k) || 0) + 1);
}
function metrics(a) {
  const f = Array(29).fill(0);
  for (const x of a) f[x]++;
  const ioc = f.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
  const top12 = f.slice().sort((x, y) => y - x).slice(0, 12).reduce((s, n) => s + n, 0) / a.length;
  const alpha = 0.05, den = control.length - 2 + alpha * 29 ** 3;
  let score = 0;
  for (let i = 0; i + 2 < a.length; i++) {
    const k = a[i] * 841 + a[i + 1] * 29 + a[i + 2];
    score += Math.log(((tri.get(k) || 0) + alpha) / den);
  }
  return {
    ioc, top12, trigram: score / (a.length - 2),
    preview: a.slice(0, 100).map(i => translit[i]).join('')
  };
}

function makeCodec(A, eaMode, clock) {
  const symbols = cycleFor(A);
  const rank = Array(29).fill(-1);
  symbols.forEach((symbol, i) => { rank[symbol] = i; });
  const modulus = eaMode === 'full29' ? 29 : 28;
  if (eaMode === 'full29') rank[28] = 28;

  function decode(cipherPages) {
    let previous = 0;
    return cipherPages.map(page => {
      if (clock === 'page') previous = 0;
      const out = [];
      for (const c of page) {
        if (eaMode === 'transparent28' && c === 28) {
          out.push(28);
          continue;
        }
        const d = mod(rank[c] - previous, modulus);
        out.push(d);
        previous = rank[c];
      }
      return out;
    });
  }
  function encode(plainPages) {
    let previous = 0;
    return plainPages.map(page => {
      if (clock === 'page') previous = 0;
      const out = [];
      for (const p of page) {
        if (eaMode === 'transparent28' && p === 28) {
          out.push(28);
          continue;
        }
        const r = mod(previous + p, modulus);
        out.push(eaMode === 'full29' && r === 28 ? 28 : symbols[r]);
        previous = r;
      }
      return out;
    });
  }
  return { symbols, rank, decode, encode };
}

function flatten(pages) { return pages.flat(); }
function same(a, b) { return a.length === b.length && a.every((x, i) => x === b[i]); }
function plantWithOriginalEAMask() {
  let at = 0;
  return pages.map(page => page.map(c => c === 28 ? 28 : controlNonEA[at++ % controlNonEA.length]));
}
function countSourceDoublets() {
  let n = 0;
  for (const page of pages) for (let i = 1; i < page.length; i++) if (page[i] === page[i - 1]) n++;
  return n;
}

const baseline = metrics(ciphertext);
const reference = metrics(control);
const doublets = countSourceDoublets();
const plantPages = plantWithOriginalEAMask();
const results = [];

for (const [direction, A, opposite] of [
  ['M05', M05, M05inv],
  ['M05-inverse', M05inv, M05]
]) {
  for (const eaMode of ['transparent28', 'full29']) {
    for (const clock of ['global', 'page']) {
      const codec = makeCodec(A, eaMode, clock);
      const decodedPages = codec.decode(pages);
      const decoded = flatten(decodedPages);
      const reencoded = flatten(codec.encode(decodedPages));
      assert.ok(same(reencoded, ciphertext), 'original exact re-encryption failed');

      const encodedPlant = codec.encode(plantPages);
      const recoveredPlant = flatten(codec.decode(encodedPlant));
      assert.ok(same(recoveredPlant, flatten(plantPages)), 'native-GP plant failed');

      const wrongCodec = makeCodec(opposite, eaMode, clock);
      const wrongDirectionPlant = flatten(wrongCodec.decode(encodedPlant));
      const wrongDirectionExact = same(wrongDirectionPlant, flatten(plantPages));
      assert.ok(!wrongDirectionExact, 'wrong-orientation decoder unexpectedly recovered plant');

      let zeroTransitions = 0, withinPageZeroTransitions = 0;
      for (let p = 0; p < decodedPages.length; p++) {
        const page = decodedPages[p];
        for (let i = 0; i < page.length; i++) {
          if (page[i] === 0) {
            zeroTransitions++;
            if (i > 0) withinPageZeroTransitions++;
          }
        }
      }
      results.push({
        direction, eaMode, clock,
        sourceDoublets: doublets,
        zeroTransitions, withinPageZeroTransitions,
        originalEA: ciphertext.filter(x => x === 28).length,
        originalRoundtrip: true,
        nativeGPPlantExact: true,
        wrongDirectionPlantExact: wrongDirectionExact,
        metrics: metrics(decoded)
      });
    }
  }
}

const output = {
  source: {
    p05Matrix: M05,
    p05SeedCell: 226,
    p05SeedGPIndex: 23,
    pageCount: pages.length,
    runeCount: ciphertext.length,
    originalEA: ciphertext.filter(x => x === 28).length,
    sourceDoublets: doublets
  },
  baseline, reference, results,
  verdict: 'The source-fixed rank-differential register is reversible and planted controls pass, but every original inverse remains ciphertext-like; zero differences restate symbol equality and do not explain the repeat-suppression mechanism.'
};
console.log(JSON.stringify(output, null, 2));
