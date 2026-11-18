'use strict';

/**
 * p34/p36 header-power GP29 keystream gate.
 *
 * Source objects:
 * - p36 numbered item 1: 139 runes, 34 words (139 = prime_34)
 * - p34 partner clause: 138 runes, 36 words (138 = phi(139))
 * - repeated cuneiform header values: 1033 and 3301
 *
 * Modulo 139, 3301 has order138 and 1033 has order46. This test uses the
 * literal successive modular powers as GP29 additive shifts on the exact
 * 138-rune p34 receiver, both signs, with no phase or key search.
 *
 * Run: node sims/lp2_p34_p36_139_header_power_keystream_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const {encodeSourceNativeGP} =
  require('./lp2_native_gp_source_orthography_sft.cjs');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const MOD = 139;

/** @param {number} x */
function mod29(x) { return ((x % 29) + 29) % 29; }

/** @param {number} base @param {number} n */
function powers(base, n) {
  const out = [];
  let x = 1;
  const g = ((base % MOD) + MOD) % MOD;
  for (let i = 0; i < n; i++) {
    out.push(x);
    x = (x * g) % MOD;
  }
  return out;
}

/** @param {number} base */
function order(base) {
  const g = ((base % MOD) + MOD) % MOD;
  let x = 1;
  for (let n = 1; n <= MOD - 1; n++) {
    x = (x * g) % MOD;
    if (x === 1) return n;
  }
  throw new Error('no order');
}

assert.equal(order(3301), 138);
assert.equal(order(1033), 46);
const page34 = corpus.pages.find((p) => p.page === 34).indices;
const page36 = corpus.pages.find((p) => p.page === 36).indices;
const cipher = page34.slice(16, 154);
assert.equal(cipher.length, 138);
assert.equal(page36.slice(99).length, 139);

const keys = [
  {name:'3301-power', values:powers(3301, 138).map((x) => x % 29)},
  {name:'1033-power', values:powers(1033, 138).map((x) => x % 29)}
];

/** @param {number[]} values */
function trigrams(values) {
  const counts = new Uint32Array(29 * 29 * 29);
  for (let i = 0; i + 2 < values.length; i++)
    counts[(values[i] * 29 + values[i + 1]) * 29 + values[i + 2]]++;
  return counts;
}

const source = encodeSourceNativeGP(read(
  'resources/control/shakespeare_first300k.txt'
));
const tri = trigrams(source);
const alpha = 0.25;
const denom = source.length - 2 + alpha * tri.length;
const logP = Array.from(tri, (n) => Math.log((n + alpha) / denom));

/** @param {number[]} values */
function score(values) {
  let ll = 0;
  for (let i = 0; i + 2 < values.length; i++)
    ll += logP[(values[i] * 29 + values[i + 1]) * 29 + values[i + 2]];
  return ll / (values.length - 2);
}

/** @param {number[]} values */
function show(values) {
  return values.map((x) => corpus.translit[x]).join('');
}

const candidates = [];
for (const key of keys) {
  for (const sign of [-1, 1]) {
    const decoded = cipher.map((c, i) => mod29(c + sign * key.values[i]));
    candidates.push({
      key:key.name, sign,
      scorePerTrigram:score(decoded),
      preview:show(decoded).slice(0,220)
    });
  }
}

const ref = [];
for (const file of [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt'
]) {
  const native = encodeSourceNativeGP(read(file));
  for (let i = 0; i + 138 <= native.length; i += 138)
    ref.push(score(native.slice(i, i + 138)));
}
ref.sort((a,b) => a-b);
assert.ok(ref.length > 100);

// Positive plant under the 3301-power key, same exact width.
const plain = encodeSourceNativeGP(read(
  'resources/control/gibran_prophet_58585.txt'
)).slice(0, 138);
const k = keys[0].values;
const planted = plain.map((p,i) => mod29(p + k[i]));
const recovered = planted.map((c,i) => mod29(c - k[i]));
assert.deepEqual(recovered, plain);

console.log(JSON.stringify({
  classification:'source-selected header-power keystream gate',
  source:{
    modulus:MOD,
    receiverRunes:cipher.length,
    headerValues:[1033,3301],
    multiplicativeOrders:[order(1033),order(3301)]
  },
  original:{
    cipherScorePerTrigram:score(cipher),
    candidates
  },
  nativeReference:{
    windows:ref.length,min:ref[0],
    median:ref[Math.floor(ref.length/2)],max:ref.at(-1),
    candidatesAtOrAboveNativeMin:candidates
      .filter(x=>x.scorePerTrigram>=ref[0]).map(x=>[x.key,x.sign])
  },
  positive:{
    exactRecovery:true,
    plainScorePerTrigram:score(plain),
    plantedScorePerTrigram:score(planted),
    recoveredScorePerTrigram:score(recovered)
  }
},null,2));
