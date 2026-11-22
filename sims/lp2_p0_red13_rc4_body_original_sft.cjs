#!/usr/bin/env node
'use strict';

// p0 source-frozen receiver: original red13 heading as RC4 key for the
// following 249 black runes. Test ordinary additive GP29 reduction and the
// exact p56 plaintext-F-transparent rule (with ciphertext-F ambiguity DP).

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = (p) => JSON.parse(fs.readFileSync(path.join(process.cwd(), p), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const ink = read('resources/liber-primus/lp2-p0-physical-ink-override.json');
const p0 = corpus.pages.find((p) => p.page === 0);
assert(p0);
assert.equal(p0.indices.length, 262);
const source = ink.physical_zero_based;
assert.equal(source.red_words.reduce((n, w) => n + w.length, 0), 13);
assert.equal(source.large_punctuation[0].after_runes, 13);
assert.equal(source.large_punctuation[0].dots, 13);
const key = source.red_words.flatMap((w) => w.gp_indices);
assert.deepEqual(key, [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);
assert.deepEqual(p0.indices.slice(0, 13), key);
const cipher = p0.indices.slice(13);
assert.equal(cipher.length, 249);
const mod = (x) => ((x % 29) + 29) % 29;

function rc4(k, n) {
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
assert.equal(Buffer.from(rc4([...Buffer.from('Key')], 9)).toString('hex'), 'eb9f7781b734ca72a7');
const stream = rc4(key, cipher.length);
const decodeOrdinary = (sign) => cipher.map((c, i) => mod(c + sign * (stream[i] % 29)));
const encodeOrdinary = (plain, sign) => plain.map((p, i) => mod(p - sign * (stream[i] % 29)));

function decodeTransparentDP(ct, sign) {
  let states = [{ j: 0, p: [] }];
  for (const c of ct) {
    const next = [];
    for (const state of states) {
      const k = stream[state.j] % 29;
      if (c !== 0) {
        const p = mod(c + sign * k);
        if (p !== 0) next.push({ j: state.j + 1, p: state.p.concat(p) });
      } else {
        // A ciphertext F can be a transparent plaintext F (no clock advance)...
        next.push({ j: state.j, p: state.p.concat(0) });
        // ...or a non-F plaintext shifted to F (clock advances).
        const p = mod(sign * k);
        if (p !== 0) next.push({ j: state.j + 1, p: state.p.concat(p) });
      }
    }
    states = next;
  }
  return states;
}
function encodeTransparent(plain, sign) {
  let j = 0;
  return plain.map((p) => {
    if (p === 0) return 0;
    const k = stream[j++] % 29;
    return mod(p - sign * k);
  });
}

const tokens = corpus.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
function toGp(raw) {
  const cleaned = raw.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (const word of cleaned.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith('ING', i)) { out.push(21); i += 3; }
      else if (word.startsWith('IO', i)) { out.push(27); i += 2; }
      else {
        const t = tokens.find((x) => word.startsWith(x.s, i));
        assert(t);
        out.push(t.i);
        i += t.s.length;
      }
    }
  }
  return out;
}
const reference = fs.readFileSync('resources/control/shakespeare_first300k.txt', 'utf8');
assert.equal(reference.length, 300000);
const train = toGp(reference.slice(0, 150000));
const heldout = toGp(reference.slice(150000));
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
const ioc = (xs) => {
  const f = Array(29).fill(0);
  for (const x of xs) f[x]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (xs.length * (xs.length - 1));
};
const translit = (xs) => xs.map((x) => corpus.translit[x]).join('');
const ordinary = [];
for (const sign of [-1, 1]) {
  const plain = decodeOrdinary(sign);
  assert.deepEqual(encodeOrdinary(plain, sign), cipher);
  ordinary.push({
    direction: sign < 0 ? 'C-minus-K' : 'C-plus-K',
    ioc: ioc(plain),
    gp4_mean_log_score: score(plain),
    first120: translit(plain.slice(0, 120)),
    round_trip_runes: cipher.length
  });
}
const transparent = [];
for (const sign of [-1, 1]) {
  const states = decodeTransparentDP(cipher, sign);
  const ranked = states.map((s) => ({ j: s.j, score: score(s.p), first120: translit(s.p.slice(0, 120)) }))
    .sort((a, b) => b.score - a.score);
  transparent.push({
    direction: sign < 0 ? 'C-minus-K' : 'C-plus-K',
    valid_plaintext_paths: states.length,
    best_score: ranked[0]?.score ?? null,
    best_first120: ranked[0]?.first120 ?? null
  });
}
const heldoutScores = [];
for (let i = 0; i < 300; i++) {
  const offset = Math.floor(i * (heldout.length - cipher.length) / 299);
  heldoutScores.push(score(heldout.slice(offset, offset + cipher.length)));
}
heldoutScores.sort((a, b) => a - b);

const clear = corpus.pages.find((p) => p.page === 57).indices;
const planted = Array.from({ length: cipher.length }, (_, i) => clear[i % clear.length]);
const transparentPositive = [];
for (const sign of [-1, 1]) {
  const plantedCipher = encodeTransparent(planted, sign);
  const states = decodeTransparentDP(plantedCipher, sign);
  const found = states.some((s) => s.p.length === planted.length && s.p.every((v, i) => v === planted[i]));
  assert(found);
  transparentPositive.push({ direction: sign < 0 ? 'C-minus-K' : 'C-plus-K', candidate_count: states.length, planted_recovered: found });
}
const byteXorOutOfRange = cipher.filter((c, i) => (c ^ stream[i]) > 28).length;

console.log(JSON.stringify({
  source: 'resources/liber-primus/17.jpg via lp2-p0-physical-ink-override.json',
  red_key_gp29: key,
  marker: { after_runes: 13, dots: 13 },
  black_body_runes: cipher.length,
  body_F_runes: cipher.filter((x) => x === 0).length,
  rc4_standard_known_vector: 'passed',
  raw_body: { ioc: ioc(cipher), gp4_mean_log_score: score(cipher) },
  ordinary_clock_outputs: ordinary,
  exact_p56_plaintext_F_transparent_DP: transparent,
  heldout_shakespeare_300_window_gp4_min_median_max: [heldoutScores[0], heldoutScores[149], heldoutScores[299]],
  direct_byte_xor_values_outside_gp29: byteXorOutOfRange,
  exact_transparent_planted_p57_controls: transparentPositive
}, null, 2));
