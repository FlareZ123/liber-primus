'use strict';

/**
 * Source-fixed GP29/Mobius feedback SFT.
 * Run: node sims/lp1_mobius_lag6_feedback_sft.cjs
 * No third-party packages, no network access, no writes.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const MOD = 29;
const M05 = [[11, 6], [6, 11]];
const M16 = [[28, 9], [9, 28]];
const mod = (a) => ((a % MOD) + MOD) % MOD;
const inv = (a) => {
  assert.notEqual(mod(a), 0, 'zero denominator in F29');
  for (let i = 1; i < MOD; i++) if (mod(a * i) === 1) return i;
  throw new Error('noninvertible nonzero F29 element');
};
const mm = (a, b) => [0, 1].map(i => [0, 1].map(j => mod(a[i][0] * b[0][j] + a[i][1] * b[1][j])));
const mpow = (a, n) => {
  let o = [[1, 0], [0, 1]], b = a;
  while (n) {
    if (n % 2) o = mm(o, b);
    b = mm(b, b);
    n = Math.floor(n / 2);
  }
  return o;
};
const applyMatrix = (a, x) => {
  const numerator = x === null ? a[0][0] : mod(a[0][0] * x + a[0][1]);
  const denominator = x === null ? a[1][0] : mod(a[1][0] * x + a[1][1]);
  return denominator === 0 ? null : mod(numerator * inv(denominator));
};
const embed = (x) => {
  const z = mod(x - 8);
  return mod(1 - z) === 0 ? null : mod((1 + z) * inv(1 - z));
};
const unembed = (y) => {
  if (y === null) return 9;
  assert.notEqual(mod(y + 1), 0, 'M05 orbit entered omitted fixed point -1');
  return mod(8 + mod(y - 1) * inv(y + 1));
};
const T = (x) => mod(24 - 2 * x);
const orbit = [0];
for (let i = 1; i < 28; i++) orbit.push(T(orbit[i - 1]));
assert.equal(new Set(orbit).size, 28);
assert(!orbit.includes(8));
const position = Array(MOD).fill(-1);
orbit.forEach((x, i) => { position[x] = i; });
const advance = (x, n) => x === 8 ? 8 : orbit[mod28(position[x] + n)];
function mod28(x) { return ((x % 28) + 28) % 28; }

const M05power6 = mpow(M05, 6);
assert.deepEqual(M05power6.map(row => row.map(x => mod(21 * x))), M16);
for (let x = 0; x < MOD; x++) {
  assert.equal(unembed(applyMatrix(mpow(M05, 15), embed(x))), T(x));
  assert.equal(unembed(applyMatrix(M16, embed(x))), advance(x, 6));
}
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const physicalPages = corpus.pages.filter(p => p.page <= 55 && p.indices.length > 0);
const original = physicalPages.flatMap(p => p.indices);
assert.equal(physicalPages.length, 55);
assert.equal(original.length, 12956);

const native = fs.readFileSync(path.join(root, 'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8')
  .replace(/^#.*$/gm, '').toUpperCase()
  .replace(/QU/g, 'CW').replace(/V/g, 'U').replace(/K/g, 'C')
  .replace(/Z/g, 'S').replace(/Q/g, 'CW').replace(/[^A-Z]/g, '');
const spellings = corpus.translit.map((s, i) => [s, i]).sort((a, b) => b[0].length - a[0].length);
const reference = [];
for (let i = 0; i < native.length;) {
  const found = spellings.find(([s]) => native.startsWith(s, i));
  assert(found, 'untransliterable reference token');
  reference.push(found[1]);
  i += found[0].length;
}
assert(reference.length > 3000);

/**
 * @typedef {{ feedback: 'cipher'|'plain',reset: 'book'|'page',
 * source: 'index'|'prime'|'phi',seed: number,scale: number,
 * direction: number }} Model
 */
/** @param {number} v @param {Model} m */
function sourceValue(v, m) {
  if (m.source === 'index') return v;
  return corpus.prime[v] - (m.source === 'phi' ? 1 : 0);
}
/**
 * @param {number[][]} groups @param {Model} m
 * @param {'encrypt'|'decrypt'} mode
 */
function transform(groups, m, mode) {
  let prev = 8, clock = 0;
  return groups.map(group => {
    if (m.reset === 'page') { prev = 8; clock = 0; }
    return group.map(v => {
      const exponent = m.direction * (m.seed + m.scale * clock + sourceValue(prev, m));
      const out = advance(v, mode === 'encrypt' ? exponent : -exponent);
      if (m.feedback === 'cipher') prev = mode === 'encrypt' ? out : v;
      else prev = mode === 'encrypt' ? v : out;
      clock++;
      return out;
    });
  });
}
function ioc(s) {
  const counts = Array(MOD).fill(0);
  for (const v of s) counts[v]++;
  return counts.reduce((a, n) => a + n * (n - 1), 0) / (s.length * (s.length - 1));
}
const nativeGroups = [];
let offset = 0;
for (const page of physicalPages) {
  const a = [];
  for (let i = 0; i < page.indices.length; i++) a.push(reference[(offset + i) % reference.length]);
  nativeGroups.push(a);
  offset += a.length;
}
const models = [];
for (const feedback of ['cipher', 'plain'])
for (const reset of ['book', 'page'])
for (const source of ['index', 'prime', 'phi'])
for (const seed of [0, 13, 15])
for (const scale of [0, 6])
for (const direction of [-1, 1])
  models.push({feedback, reset, source, seed, scale, direction});

const results = [];
for (const m of models) {
  const cipher = transform(nativeGroups, m, 'encrypt');
  const recovered = transform(cipher, m, 'decrypt');
  assert.deepEqual(recovered, nativeGroups, 'source-native decrypt failed');
  assert.deepEqual(transform(recovered, m, 'encrypt'), cipher, 'source-native reencrypt failed');
  const decrypted = transform(physicalPages.map(p => p.indices), m, 'decrypt');
  assert.deepEqual(transform(decrypted, m, 'encrypt'), physicalPages.map(p => p.indices), 'original reencryption failed');
  results.push({model: m, ioc: ioc(decrypted.flat()), plaintext: decrypted.flat().slice(0, 45).map(i => corpus.translit[i]).join('')});
}
results.sort((a, b) => b.ioc - a.ioc);
const best = results[0];
console.log(JSON.stringify({
  title: 'LP1 source Mobius / LP2 lag-six exact bridge; keyless feedback SFT',
  source: 'LP1 p05, p16 corner matrices; LP2 lag-six map 24-2x',
  matrixM05: M05, matrixM16: M16,
  M05power6: M05power6,
  orbitCount: orbit.length,
  imageCount: 29,
  models: results.length,
  originalRunes: original.length,
  originalIoC: ioc(original),
  nativeReferenceIoC: ioc(nativeGroups.flat()),
  best,
  worstIoC: results[results.length - 1].ioc,
  positivesRecovered: models.length,
  maxOriginalPlaintextFound: false,
  notes: 'All models are deterministic invertible hypotheses, not authentic Cicada keys. Reencryption alone does not identify a true cipher.'
}, null, 2));
