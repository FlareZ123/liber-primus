#!/usr/bin/env node
'use strict';

// Bounded no-skip H1 pilot: p50 remainder stream + source-known short word.
// Run from repository root: node sims/lp2_p50_h1_shortkey_no_skip_screen.cjs
// This does NOT implement R4, key-pointer skips, or inserted nulls.

const fs = require('node:fs');
const assert = require('node:assert/strict');

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const grid = read('resources/liber-primus/lp2-grid-256.json');
const corpus = read('resources/liber-primus/lp2-corpus.json');
const ink = read('resources/liber-primus/lp2-ink-annotations.json');

const mod = (x) => ((x % 29) + 29) % 29;
const alpha = corpus.translit;
const index = Object.fromEntries(alpha.map((s, i) => [s, i]));
const bytes = grid.pages.flatMap((p) => p.bytes);
const stream = bytes.map((b) => b % 29);
const unknownPages = corpus.pages.filter((p) => p.page <= 55);
const allCipher = unknownPages.flatMap((p) => p.indices);
const tailCipher = corpus.pages
  .filter((p) => p.page >= 51 && p.page <= 55)
  .flatMap((p) => p.indices);
const p57 = corpus.pages.find((p) => p.page === 57).indices;

assert.equal(bytes.length, 256);
assert.equal(allCipher.length, 12956);
assert.equal(tailCipher.length, 842);
assert.equal(p57.length, 95);

// Source orthography: QU->CW, V->U, K/Q->C, Z->S; longest GP tokens first.
// ING is the single GP rune labelled NG.
function encodeSourceWord(word) {
  let s = word.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C')
    .replace(/Z/g, 'S')
    .replace(/IO/g, 'IA');
  const tokens = ['ING', 'TH', 'EO', 'OE', 'AE', 'IA',
    'F', 'U', 'O', 'R', 'C', 'G', 'W', 'H', 'N', 'I', 'J',
    'P', 'X', 'S', 'T', 'B', 'E', 'M', 'L', 'D', 'A', 'Y'];
  const out = [];
  for (let i = 0; i < s.length;) {
    const token = tokens.find((t) => s.startsWith(t, i));
    if (!token) throw new Error('Unmapped source token: ' + word + ' at ' + s.slice(i));
    out.push(token === 'ING' ? index.NG : index[token]);
    i += token.length;
  }
  return out;
}

const keys = {
  DIVINITY: encodeSourceWord('DIVINITY'), // GP spelling DIUINITY
  INSTAR: encodeSourceWord('INSTAR'),
  ANEND: encodeSourceWord('ANEND'),
  PARABLE: encodeSourceWord('PARABLE'),
};
const p6 = ink.pages.find((p) => p.page === 6);
const p6Span = p6.red_spans.find((s) => s.start === 71 && s.length === 11);
assert.ok(p6Span, 'source p6 red span 71..81 must exist');
keys.P6_RED = Array.from(p6Span.runes).map((r) => corpus.runes.indexOf(r));
assert.equal(keys.P6_RED.length, 11);
assert.deepEqual(keys.DIVINITY.map((i) => alpha[i]).join(''), 'DIUINITY');
assert.deepEqual(keys.INSTAR.map((i) => alpha[i]).join(''), 'INSTAR');
assert.deepEqual(keys.ANEND.map((i) => alpha[i]).join(''), 'ANEND');
assert.deepEqual(keys.PARABLE.map((i) => alpha[i]).join(''), 'PARABLE');

function ioc(xs) {
  const f = Array(29).fill(0);
  for (const x of xs) f[x]++;
  return f.reduce((sum, n) => sum + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}
function periodicIoc(xs, period) {
  let numerator = 0;
  let denominator = 0;
  for (let r = 0; r < period; r++) {
    const f = Array(29).fill(0);
    let n = 0;
    for (let i = r; i < xs.length; i += period) {
      f[xs[i]]++;
      n++;
    }
    numerator += f.reduce((sum, count) => sum + count * (count - 1), 0);
    denominator += n * (n - 1);
  }
  return numerator / denominator;
}
function decode(cipher, key, sign) {
  return cipher.map((c, i) => mod(c + sign * mod(stream[i % stream.length] + key[i % key.length])));
}
function opening(xs, n = 45) {
  return xs.slice(0, n).map((i) => alpha[i]).join(' ');
}
function plantRoundTrip(plain, key) {
  const cipher = plain.map((p, i) => mod(p + mod(stream[i % stream.length] + key[i % key.length])));
  const recovered = decode(cipher, key, -1);
  assert.deepEqual(recovered, plain);
  return true;
}

const results = [];
for (const [name, key] of Object.entries(keys)) {
  plantRoundTrip(p57, key);
  for (const [region, cipher] of [['all-p0-p55', allCipher], ['tail-p51-p55', tailCipher]]) {
    for (const sign of [-1, 1]) {
      const plain = decode(cipher, key, sign);
      results.push({
        key: name,
        keyLength: key.length,
        region,
        sign,
        keyIoC: ioc(cipher.map((_, i) => mod(stream[i % stream.length] + key[i % key.length]))),
        plaintextIoC: ioc(plain),
        opening: opening(plain),
      });
    }
  }
}

const residual = allCipher.map((c, i) => mod(c - stream[i % stream.length]));
const residualPeriods = [];
for (let period = 2; period <= 30; period++) {
  residualPeriods.push({ period, ioc: periodicIoc(residual, period) });
}
residualPeriods.sort((a, b) => b.ioc - a.ioc);

let seed = 0x51a7c0de;
function rand29() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  seed >>>= 0;
  return seed % 29;
}
const nullCipher = Array.from({ length: allCipher.length }, rand29);
const nullResidual = nullCipher.map((c, i) => mod(c - stream[i % stream.length]));
const nullPeriods = [];
for (let period = 2; period <= 30; period++) {
  nullPeriods.push({ period, ioc: periodicIoc(nullResidual, period) });
}
nullPeriods.sort((a, b) => b.ioc - a.ioc);

console.log(JSON.stringify({
  model: 'raw additive p50-remainder stream + short periodic keyword; no R4/skip/null',
  counts: { p50Bytes: bytes.length, unknownRunes: allCipher.length, tailRunes: tailCipher.length, p57PlantRunes: p57.length },
  keys: Object.fromEntries(Object.entries(keys).map(([name, key]) => [name, key.map((i) => alpha[i]).join('')])),
  ciphertextIoC: ioc(allCipher),
  residualIoC: ioc(residual),
  maxResidualPeriod: residualPeriods[0],
  maxNullPeriod: nullPeriods[0],
  results,
  controls: { p57PositivePlantRoundTrips: Object.keys(keys).length, deterministicNullSeed: '0x51a7c0de' },
}, null, 2));
