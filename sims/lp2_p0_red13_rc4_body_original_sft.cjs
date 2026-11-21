#!/usr/bin/env node
'use strict';

// Source-frozen test: use p0's own 13 red GP29 runes as a standard RC4 key
// for the 249 black body runes immediately following the original 13-dot mark.
// The GP29 adaptation reduces each RC4 byte modulo 29 and tests both additive
// directions. No key phase, RC4-drop count, F bypass, or fitted parameter.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const readJson = (p) => JSON.parse(fs.readFileSync(path.join(process.cwd(), p), 'utf8'));
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const ink = readJson('resources/liber-primus/lp2-p0-physical-ink-override.json');
const p0 = corpus.pages.find((p) => p.page === 0);
assert(p0);
assert.equal(p0.indices.length, 262);

const source = ink.physical_zero_based;
assert.equal(source.red_words.reduce((n, w) => n + w.length, 0), 13);
assert.equal(source.large_punctuation.length, 1);
assert.equal(source.large_punctuation[0].after_runes, 13);
assert.equal(source.large_punctuation[0].dots, 13);
const key = source.red_words.flatMap((w) => w.gp_indices);
assert.deepEqual(key, [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);
assert.deepEqual(p0.indices.slice(0, 13), key);

const cipher = p0.indices.slice(13);
assert.equal(cipher.length, 249);
assert(cipher.every((x) => Number.isInteger(x) && x >= 0 && x < 29));

const mod = (x, m) => ((x % m) + m) % m;

/** Standard RC4 KSA/PRGA; returns n keystream bytes. */
function rc4(k, n) {
  assert(k.length >= 1 && k.length <= 256);
  assert(k.every((x) => Number.isInteger(x) && x >= 0 && x <= 255));
  const s = Array.from({ length: 256 }, (_, i) => i);
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + k[i % k.length]) & 255;
    [s[i], s[j]] = [s[j], s[i]];
  }
  let i = 0;
  j = 0;
  const out = [];
  for (let z = 0; z < n; z++) {
    i = (i + 1) & 255;
    j = (j + s[i]) & 255;
    [s[i], s[j]] = [s[j], s[i]];
    out.push(s[(s[i] + s[j]) & 255]);
  }
  return out;
}

const known = rc4([...Buffer.from('Key', 'ascii')], 9);
assert.equal(Buffer.from(known).toString('hex'), 'eb9f7781b734ca72a7');

const stream = rc4(key, cipher.length);
const ioc = (xs) => {
  const f = Array(29).fill(0);
  for (const x of xs) f[x]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (xs.length * (xs.length - 1));
};
const decode = (sign) => cipher.map((c, i) => mod(c + sign * (stream[i] % 29), 29));
const encode = (plain, sign) => plain.map((p, i) => mod(p - sign * (stream[i] % 29), 29));

const toGp = (raw) => {
  const cleaned = raw.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const tokens = corpus.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
  const out = [];
  for (const w of cleaned.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < w.length;) {
      if (w.startsWith('ING', i)) { out.push(21); i += 3; }
      else if (w.startsWith('IO', i)) { out.push(27); i += 2; }
      else {
        const t = tokens.find((x) => w.startsWith(x.s, i));
        assert(t, 'Unmapped GP spelling: ' + w.slice(i));
        out.push(t.i);
        i += t.s.length;
      }
    }
  }
  return out;
};

const ref = fs.readFileSync(path.join(process.cwd(), 'resources/control/shakespeare_first300k.txt'), 'utf8');
assert.equal(ref.length, 300000);
const train = toGp(ref.slice(0, 150000));
const heldout = toGp(ref.slice(150000));
const gram = (a, i) => (((a[i] * 29 + a[i + 1]) * 29 + a[i + 2]) * 29 + a[i + 3]);
const freq = new Map();
for (let i = 0; i + 4 <= train.length; i++) {
  const g = gram(train, i);
  freq.set(g, (freq.get(g) || 0) + 1);
}
const denominator = train.length - 3 + 0.1 * (29 ** 4);
const floor = Math.log(0.1 / denominator);
const logs = new Map([...freq].map(([g, n]) => [g, Math.log((n + 0.1) / denominator)]));
const score = (xs) => {
  let sum = 0;
  for (let i = 0; i + 4 <= xs.length; i++) sum += logs.get(gram(xs, i)) ?? floor;
  return sum / xs.length;
};
const translit = (xs) => xs.map((x) => corpus.translit[x]).join('');

const outcomes = [];
for (const [name, sign] of [['C-minus-K', -1], ['C-plus-K', 1]]) {
  const plain = decode(sign);
  assert.deepEqual(encode(plain, sign), cipher);
  outcomes.push({
    operation: name,
    ioc: ioc(plain),
    gp4_mean_log_score: score(plain),
    first120: translit(plain.slice(0, 120)),
    round_trip_runes: encode(plain, sign).length
  });
}
const rawScore = score(cipher);
const rawIoc = ioc(cipher);
const heldoutScores = [];
for (let i = 0; i < 300; i++) {
  const offset = Math.floor(i * (heldout.length - cipher.length) / 299);
  heldoutScores.push(score(heldout.slice(offset, offset + cipher.length)));
}
heldoutScores.sort((a, b) => a - b);
const byteXorOutOfRange = cipher.filter((c, i) => (c ^ stream[i]) > 28).length;

// Independent planted control: either GP29 additive direction decrypts exactly.
const clear = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(clear.length, 95);
const planted = Array.from({ length: cipher.length }, (_, i) => clear[i % clear.length]);
for (const sign of [-1, 1]) {
  const plantedCipher = planted.map((p, i) => mod(p - sign * (stream[i] % 29), 29));
  const recovered = plantedCipher.map((c, i) => mod(c + sign * (stream[i] % 29), 29));
  assert.deepEqual(recovered, planted);
}

console.log(JSON.stringify({
  source: 'resources/liber-primus/17.jpg via lp2-p0-physical-ink-override.json',
  p0_total_runes: p0.indices.length,
  red_key_gp29: key,
  marker: { after_runes: 13, dots: 13 },
  black_body_runes: cipher.length,
  rc4_standard_known_vector: 'passed',
  raw_body: { ioc: rawIoc, gp4_mean_log_score: rawScore },
  outputs: outcomes,
  heldout_shakespeare_300_window_gp4_min_median_max: [
    heldoutScores[0], heldoutScores[149], heldoutScores[299]
  ],
  direct_byte_xor_values_outside_gp29: byteXorOutOfRange,
  planted_p57_round_trip_runes_each_direction: planted.length
}, null, 2));
