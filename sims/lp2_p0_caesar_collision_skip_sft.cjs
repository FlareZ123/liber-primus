'use strict';

/**
 * An original-cipher test of Caesar, Bellum Civile I.30.1 as the GP29 running
 * key suggested by the *conditional* p0 red-heading SECUENDI RATIO hypothesis.
 *
 * Repro: node sims/lp2_p0_caesar_collision_skip_sft.cjs
 * Inputs are the repository's canonical LP2 rune corpus and solved LP reference.
 * This read-only test uses no external services or output files.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const lp1 = fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', 'lp1-plaintext-reference.txt'), 'utf8');
const symbols = corpus.translit;
const MOD = 29;

// Public-domain classical passage starting at Caesar's actual "sequendi".
// It is an exploratory source choice. Cicada has not authenticated this key.
const caesar = [
  'SEQUENDI RATIONEM OMITTIT IN HISPANIAM PROFICISCI CONSTITUIT',
  'DUUMVIRIS MUNICIPIORUM OMNIUM IMPERAT UT NAVES CONQUIRANT',
  'BRUNDISIUMQUE DEDUCENDAS CURENT MITTIT IN SARDINIAM CUM LEGIONE',
  'UNA VALERIUM LEGATUM IN SICILIAM CURIONEM PRO PRAETORE CUM',
  'LEGIONIBUS DUABUS EUNDEM CUM SICILIAM RECEPISSET PROTINUS IN',
  'AFRICAM TRADUCERE EXERCITUM IUBET SARDINIAM OBTINEBAT M',
  'COTTA SICILIAM M CATO AFRICAM SORTE TUBERO OBTINERE DEBEBAT',
  'CARALITANI SIMUL AD SE VALERIUM MITTI AUDIERUNT NONDUM',
  'PROFECTO EX ITALIA SUA SPONTE COTTAM EX OPPIDO EICIUNT ILLE',
  'PERTERRITUS QUOD OMNEM PROVINCIAM CONSENTIRE INTELLEGEBAT',
  'EX SARDINIA IN AFRICAM PROFUGIT CATO IN SICILIA NAVES LONGAS',
  'VETERES REFICIEBAT NOVAS CIVITATIBUS IMPERABAT HAEC MAGNO',
  'STUDIO AGEBAT IN LUCANIS BRUTIISQUE PER LEGATOS SUOS CIVIUM',
  'ROMANORUM DELECTUS HABEBAT EQUITUM PEDITUMQUE CERTUM NUMERUM',
  'A CIVITATIBUS SICILIAE EXIGEBAT',
].join(' ');

/** @type {Record<string, number>} */
const roman = {};
for (let i = 0; i < symbols.length; i++) {
  if (symbols[i].length === 1) roman[symbols[i]] = i;
}
for (const [from, to] of Object.entries({ Q: 'C', K: 'C', V: 'U', Z: 'S', J: 'I' })) {
  roman[from] = roman[to];
}
const key = [...caesar].filter((ch) => roman[ch] !== undefined).map((ch) => roman[ch]);
const tags = symbols.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);

/** Encode readable solved LP control into GP29, honoring native digraphs. */
function encodeNative(s) {
  const up = s.toUpperCase().replace(/^#.*$/gm, '');
  /** @type {number[]} */
  const out = [];
  for (let k = 0; k < up.length;) {
    const ch = up[k];
    if (!/[A-Z]/.test(ch)) {
      k++;
      continue;
    }
    const found = tags.find((t) => up.slice(k, k + t.s.length) === t.s);
    if (found) {
      out.push(found.i);
      k += found.s.length;
    } else {
      if (roman[ch] !== undefined) out.push(roman[ch]);
      k++;
    }
  }
  return out;
}
const sourceNative = encodeNative(lp1);
const train = sourceNative.slice(0, Math.floor(sourceNative.length * 0.7));
const plantPlain = sourceNative.slice(-249);
const cipher = corpus.pages[0].indices.slice(13);

const u = Array(MOD).fill(0);
const big = new Map();
const tri = new Map();
for (let i = 0; i < train.length; i++) {
  u[train[i]]++;
  if (i > 0) {
    const code = train[i - 1] * MOD + train[i];
    big.set(code, (big.get(code) || 0) + 1);
  }
  if (i > 1) {
    const code = (train[i - 2] * MOD + train[i - 1]) * MOD + train[i];
    tri.set(code, (tri.get(code) || 0) + 1);
  }
}
const total = u.reduce((a, b) => a + b, 0);
const prior = u.map((n) => (n + 0.2) / (total + MOD * 0.2));

/** Smoothed native-LP first/second/third-order log-likelihood. */
function score(a, b, x) {
  assert(Number.isInteger(x) && x >= 0 && x < MOD);
  if (b === MOD) return Math.log(prior[x]);
  const alpha = 12;
  const pr2 = ((big.get(b * MOD + x) || 0) + alpha * prior[x]) / (u[b] + alpha);
  if (a === MOD) return Math.log(pr2);
  const abc = (a * MOD + b) * MOD + x;
  return Math.log(((tri.get(abc) || 0) + alpha * pr2) /
    ((big.get(a * MOD + b) || 0) + alpha));
}

/** Index of coincidence for a GP rune sequence. */
function ioc(arr) {
  const counts = Array(MOD).fill(0);
  for (const value of arr) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (arr.length * (arr.length - 1));
}

/** Plant a real native GP text with one key redraw on any same-output collision. */
function encrypt(plain) {
  const out = [];
  let j = 0;
  let skips = 0;
  for (const p of plain) {
    let value = (p + key[j]) % MOD;
    if (out.length && value === out[out.length - 1]) {
      j++;
      skips++;
      value = (p + key[j]) % MOD;
    }
    assert(Number.isInteger(value));
    out.push(value);
    j++;
  }
  return { out, j, skips };
}

/**
 * Beam inversion, tracking previous two recovered GP symbols and live key clock.
 * A skip is permitted only when the *observable* cipher adjacent difference
 * equals the change between the skipped and accepted key glyphs.
 * One extra draw per output is the stated, bounded model.
 */
function invert(crypt, penalty, width = 500) {
  let beam = [{ j: 0, a: MOD, b: MOD, score: 0, plain: [], skips: 0 }];
  let legalSkipBranches = 0;
  for (let i = 0; i < crypt.length; i++) {
    const proposals = [];
    for (const state of beam) {
      for (let skip = 0; skip <= 1; skip++) {
        const k = state.j + skip;
        if (k >= key.length) continue;
        if (skip) {
          if (i === 0 || (key[state.j] - key[k] + MOD) % MOD !==
              (crypt[i - 1] - crypt[i] + MOD) % MOD) continue;
          legalSkipBranches++;
        }
        const p = (crypt[i] - key[k] + MOD) % MOD;
        proposals.push({
          j: k + 1, a: state.b, b: p,
          score: state.score + score(state.a, state.b, p) + (skip ? penalty : 0),
          plain: [...state.plain, p],
          skips: state.skips + skip,
        });
      }
    }
    assert(proposals.length > 0, 'no original-cipher paths at rune ' + i);
    proposals.sort((a, b) => b.score - a.score);
    const seen = new Set();
    const next = [];
    for (const state of proposals) {
      const sig = state.j + '/' + state.a + '/' + state.b;
      if (seen.has(sig)) continue;
      seen.add(sig);
      next.push(state);
      if (next.length === width) break;
    }
    beam = next;
  }
  return { ...beam[0], legalSkipBranches };
}

assert.equal(corpus.pages[0].runic_count, 262);
assert.equal(cipher.length, 249);
assert.equal(sourceNative.length, 3560);
assert.equal(train.length, 2492);
assert.equal(key.length, 748);

const originalNoSkip = cipher.map((c, i) => (c - key[i] + MOD) % MOD);
const planted = encrypt(plantPlain);
assert.equal(planted.skips, 11);
const plant = invert(planted.out, -2.1);
const correct = plant.plain.filter((p, i) => p === plantPlain[i]).length;
assert.equal(correct, 245);

const original = invert(cipher, -2.1);
const originalMorePenalty = invert(cipher, -3.4);
assert.equal(original.skips, 0);
assert.equal(originalMorePenalty.skips, 0);
assert.deepEqual(original.plain, originalNoSkip);
assert(Math.abs(ioc(original.plain) - 0.03397460810985879) < 1e-12);
assert(Math.abs(original.score - (-1311.0341654002332)) < 1e-7);

const read = (arr) => arr.slice(0, 72).map((i) => symbols[i]).join('');
console.log(JSON.stringify({
  frozen: { page: 0, redTitleRunes: 13, blackBodyRunes: 249, sourceKeyRunes: key.length },
  control: {
    plantedSkipEvents: planted.skips, recovered: correct, of: plantPlain.length,
    decryptedIoC: ioc(plant.plain), score: plant.score,
  },
  original: {
    legalSkipBranches: original.legalSkipBranches, selectedSkipEvents: original.skips,
    decryptedIoC: ioc(original.plain), score: original.score, head: read(original.plain),
    penaltyChangePreservesPath: originalMorePenalty.skips === original.skips,
  },
  decision: 'The specified Caesar-text key and single-rejection redraw cipher do not recover p0.',
}, null, 2));
