#!/usr/bin/env node
'use strict';

// Frozen source-selected test:
// - p50 is a 32 x 8 table of base-60 byte tokens.
// - The eight left-to-right columns are eight 32-byte AES-256 keys.
// - The eight $-terminated LP2 sections are paired with those columns in order.
// - Each section's first ciphertext rune is a clear state seed.
// - A repeated successor emits plaintext F and holds the key clock.
// - Otherwise, rank the successor in ascending GP29 order with the previous
//   ciphertext symbol removed, subtract AES-256-CTR keystream byte mod 28,
//   and map the result to GP29 indices 1..28.
// - AES-256-CTR uses a zero 128-bit initial counter. No fitted phase, IV,
//   section permutation, or alternative radix is searched.

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');

const alphabet = [...grid.alphabet];
const digit = new Map(alphabet.map((ch, i) => [ch, i]));
const byteValue = token => {
  assert.equal(token.length, 2, 'bad p50 token: ' + token);
  const a = digit.get(token[0]), b = digit.get(token[1]);
  assert.notEqual(a, undefined, 'bad first digit: ' + token);
  assert.notEqual(b, undefined, 'bad second digit: ' + token);
  const v = 60 * a + b;
  assert(v >= 0 && v <= 255, 'p50 token is not a byte: ' + token + '=' + v);
  return v;
};
assert.equal(grid.rows.length, 32);
assert(grid.rows.every(row => row.length === 8));
const keys = Array.from({ length: 8 }, (_, col) =>
  Buffer.from(grid.rows.map(row => byteValue(row[col])))
);
assert(keys.every(key => key.length === 32));

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const sections = transcription.split('$').slice(0, 8).map(section =>
  [...section].filter(ch => runeIndex.has(ch)).map(ch => runeIndex.get(ch))
);
const expectedLengths = [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316];
assert.deepEqual(sections.map(s => s.length), expectedLengths);
const canonicalUnknown = corpus.pages
  .filter(p => p.page <= 55)
  .flatMap(p => p.indices);
assert.deepEqual(sections.flat(), canonicalUnknown);
assert.equal(canonicalUnknown.length, 12956);

function aesCtrBytes(key, n) {
  const cipher = crypto.createCipheriv('aes-256-ctr', key, Buffer.alloc(16, 0));
  return Buffer.concat([cipher.update(Buffer.alloc(n, 0)), cipher.final()]);
}

function rank28(cipher, i) {
  const previous = cipher[i - 1], current = cipher[i];
  assert.notEqual(previous, undefined);
  if (current === previous) return -1; // F / hold
  // Ascending alphabet with previous removed: rank in [0,27].
  return current < previous ? current : current - 1;
}

function decodeSection(cipher, key) {
  const transitions = cipher.length - 1;
  let ordinary = 0, repeats = 0;
  for (let i = 1; i < cipher.length; i++) {
    if (cipher[i] === cipher[i - 1]) repeats++;
    else ordinary++;
  }
  const stream = aesCtrBytes(key, ordinary);
  const plain = [null]; // first ciphertext rune is the section state/IV
  let cursor = 0;
  for (let i = 1; i < cipher.length; i++) {
    const r = rank28(cipher, i);
    if (r === -1) {
      plain.push(0); // GP29 F
    } else {
      const k = stream[cursor++] % 28;
      plain.push(1 + ((r - k + 28) % 28));
    }
  }
  assert.equal(cursor, ordinary);
  return { plain, repeats, ordinary, transitions };
}

function encodePlant(plain, key, initialCipher) {
  let ordinary = 0;
  for (let i = 1; i < plain.length; i++) if (plain[i] !== 0) ordinary++;
  const stream = aesCtrBytes(key, ordinary);
  const cipher = [initialCipher];
  let cursor = 0;
  for (let i = 1; i < plain.length; i++) {
    const p = plain[i];
    if (p === 0) {
      cipher.push(cipher[cipher.length - 1]);
    } else {
      const previous = cipher[cipher.length - 1];
      const r = (p - 1 + stream[cursor++] % 28) % 28;
      let seen = 0, next = -1;
      for (let s = 0; s < 29; s++) {
        if (s === previous) continue;
        if (seen++ === r) { next = s; break; }
      }
      assert(next >= 0);
      cipher.push(next);
    }
  }
  return cipher;
}

// Deterministic round-trip control, including F holds.
let seed = 0x3301;
function random29() {
  seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
  return (seed >>> 0) % 29;
}
for (let col = 0; col < 8; col++) {
  const plant = [random29(), ...Array.from({ length: 511 }, random29)];
  const encoded = encodePlant(plant, keys[col], random29());
  const recovered = decodeSection(encoded, keys[col]).plain;
  assert.deepEqual(recovered.slice(1), plant.slice(1));
}

const results = sections.map((cipher, col) => {
  const decoded = decodeSection(cipher, keys[col]);
  return {
    section: col + 1,
    ciphertext_runes: cipher.length,
    first_rune_state: corpus.translit[cipher[0]],
    repeats_to_F: decoded.repeats,
    ordinary_key_advances: decoded.ordinary,
    key_sha256: crypto.createHash('sha256').update(keys[col]).digest('hex'),
    plaintext: decoded.plain,
  };
});
const plain = results.flatMap(r => r.plain.slice(1));
const counts = Array(29).fill(0);
for (const x of plain) counts[x]++;
const n = plain.length;
const ioc = counts.reduce((s, x) => s + x * (x - 1), 0) / (n * (n - 1));
const chi2 = counts.reduce((s, x) => s + (x - n / 29) ** 2 / (n / 29), 0);
const nonF = counts.slice(1);
const nonFCount = nonF.reduce((a, b) => a + b, 0);
const nonFChi2 = nonF.reduce((s, x) => s + (x - nonFCount / 28) ** 2 / (nonFCount / 28), 0);
const transliteration = plain.map(x => corpus.translit[x]).join('');
const samples = results.map(r => ({
  section: r.section,
  prefix: r.plain.slice(1, 81).map(x => corpus.translit[x]).join(''),
}));

console.log(JSON.stringify({
  hypothesis: 'p50 column AES-256-CTR keystream over GP28 successor ranks; repeated ciphertext successor = F/hold',
  parameters: {
    table: 'base60-grid.json; 32 rows x 8 columns; columns read top-to-bottom',
    section_lengths: expectedLengths,
    section_to_key: 'left-to-right, no permutation',
    mode: 'AES-256-CTR',
    initial_counter_hex: '00'.repeat(16),
    rank_order: 'ascending GP29 alphabet with previous ciphertext symbol removed',
    repeat_rule: 'plaintext F; key clock holds',
    first_symbol: 'clear section state; not decoded',
    key_projection: 'AES output byte mod 28',
    phase_search: false,
    alternative_radix_search: false
  },
  controls: { eight_512_symbol_plants_roundtrip: true },
  decoded_runes: n,
  repeats_to_F: results.reduce((s, r) => s + r.repeats, 0),
  key_advances: results.reduce((s, r) => s + r.ordinary_key_advances, 0),
  counts,
  ioc,
  chi2_uniform29: chi2,
  nonF_chi2_uniform28: nonFChi2,
  samples,
  prefix: transliteration.slice(0, 500)
}, null, 2));
