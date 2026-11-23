#!/usr/bin/env node
'use strict';

/**
 * Source-selected p57 -> p12 -> 2014 LP1 circumference-key transfer gate.
 * Run from the repository root:
 *   node sims/lp2_p12_107_circumference_koan13_key_gate.cjs
 *
 * This is a bounded test of fixed, source-derived operands. It does not search
 * key phases, reverse the key, fit an F mask, or alter original word breaks.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8').replace(/\r\n/g, '\n');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const records = read('resources/liber-primus/lp2-transcription.txt').split('%');
const shakespeare = read('resources/control/shakespeare_first300k.txt');
const runeToIndex = new Map(gp.runes.map((r, i) => [r, i]));
const mod29 = (n) => ((n % 29) + 29) % 29;
const parsePage = (text) => Array.from(text).filter((r) => runeToIndex.has(r)).map((r) => runeToIndex.get(r));
const page = (n) => gp.pages.find((p) => p.page === n).indices;
const ioc = (values) => {
  const counts = new Uint32Array(29);
  for (const v of values) counts[v]++;
  const n = values.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
};
const preview = (values) => values.slice(0, 60).map((v) => gp.translit[v]).join('');

assert.equal(records.length, 57);
const p12 = parsePage(records[12]);
const p13 = parsePage(records[13]);
const p57 = parsePage(records[56]);
assert.equal(p12.length, 261);
assert.equal(p13.length, 272);
assert.equal(p57.length, 95);
assert.deepEqual(p12, page(12));
assert.deepEqual(p13, page(13));
assert.deepEqual(p57, page(57));
assert.equal(records[12].includes('&') || records[12].includes('$'), false);
assert.equal(records[13].includes('&') || records[13].includes('$'), false);
const target = [...p12, ...p13];
assert.equal(target.length, 533);

// The previously recovered LP1 p14-p15 second-koan key and the literal
// GP spelling of the p57 word CIRCUMFERENCE are kept as distinct operands.
const keys = [
  {
    name: 'historical-LP1-key-FIRFUMFERENFE',
    values: [0, 10, 4, 0, 1, 19, 0, 18, 4, 18, 9, 0, 18],
    expectedText: 'FIRFUMFERENFE'
  },
  {
    name: 'literal-GP-key-CIRCUMFERENCE',
    values: [5, 10, 4, 5, 1, 19, 0, 18, 4, 18, 9, 5, 18],
    expectedText: 'CIRCUMFERENCE'
  }
];
for (const k of keys) {
  assert.equal(k.values.map((v) => gp.translit[v]).join(''), k.expectedText);
  assert.equal(k.values.length, 13);
}

// The known LP1/p56 family sometimes leaves a literal ciphertext F untouched
// and does not advance the key. This is a fixed convention, not an inferred
// per-position mask. All-symbols-consume is the other fixed control.
function encode(plain, key, transparentF) {
  let phase = 0;
  const cipher = [];
  for (const p of plain) {
    if (transparentF && p === 0) {
      cipher.push(0);
      continue;
    }
    cipher.push(mod29(p + key[phase % key.length]));
    phase++;
  }
  return { values: cipher, keyTicks: phase };
}
function decode(cipher, key, transparentF) {
  let phase = 0;
  const plain = [];
  for (const c of cipher) {
    if (transparentF && c === 0) {
      plain.push(0);
      continue;
    }
    plain.push(mod29(c - key[phase % key.length]));
    phase++;
  }
  return { values: plain, keyTicks: phase };
}
function nonFToCipherF(plain, key) {
  let phase = 0;
  let collisions = 0;
  for (const p of plain) {
    if (p === 0) continue;
    if (mod29(p + key[phase % key.length]) === 0) collisions++;
    phase++;
  }
  return collisions;
}

// Source-native GP-English trigram model: same 29-token normalization and
// first-80%-training convention used by the repository's previous-word gate.
const tokenMap = gp.translit.map((v, i) => ({ v, i })).sort((a, b) => b.v.length - a.v.length);
function gpEncode(source) {
  const normalized = source.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S').replace(/Q/g, 'C');
  const out = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const token = tokenMap.find((t) => word.startsWith(t.v, i));
      assert.ok(token, 'Unmapped native token ' + word.slice(i));
      out.push(token.i);
      i += token.v.length;
    }
  }
  return out;
}
const native = gpEncode(shakespeare);
assert.equal(native.length, 218800);
const trainEnd = Math.floor(native.length * 0.8);
const triCounts = new Float64Array(29 ** 3).fill(0.01);
const pairCounts = new Float64Array(29 ** 2).fill(29 * 0.01);
for (let i = 2; i < trainEnd; i++) {
  triCounts[841 * native[i - 2] + 29 * native[i - 1] + native[i]]++;
  pairCounts[29 * native[i - 2] + native[i - 1]]++;
}
function trigram(values) {
  let score = 0;
  for (let i = 2; i < values.length; i++) {
    score += Math.log(
      triCounts[841 * values[i - 2] + 29 * values[i - 1] + values[i]] /
      pairCounts[29 * values[i - 2] + values[i - 1]]
    );
  }
  return score / (values.length - 2);
}

const variants = [];
for (const key of keys) {
  for (const transparentF of [false, true]) {
    const planted = encode(p57, key.values, transparentF);
    const replay = decode(planted.values, key.values, transparentF);
    const exact = replay.values.length === p57.length &&
      replay.values.every((v, i) => v === p57[i]);
    const collisions = nonFToCipherF(p57, key.values);

    // The literal-key + transparent-F combination is not injective on the
    // authentic p57 positive plant and is deliberately excluded as a decoder.
    const expectedExact = !(key.name === 'literal-GP-key-CIRCUMFERENCE' && transparentF);
    assert.equal(exact, expectedExact);

    if (!exact) {
      variants.push({
        key: key.name, transparentF, validPositiveControl: false,
        positiveControlNonFToCipherFCollisions: collisions,
        note: 'Excluded: ciphertext F is ambiguous under this key and null convention.'
      });
      continue;
    }

    // One uninterrupted clock begins at p12 rune 0 and continues through p13.
    const decoded = decode(target, key.values, transparentF).values;
    const a = decoded.slice(0, p12.length);
    const b = decoded.slice(p12.length);
    variants.push({
      key: key.name, transparentF, validPositiveControl: true,
      positiveControlRunes: replay.values.length,
      positiveControlKeyTicks: replay.keyTicks,
      targetKeyTicks: decode(target, key.values, transparentF).keyTicks,
      p12: { ioc: ioc(a), trigram: trigram(a), preview: preview(a) },
      p13: { ioc: ioc(b), trigram: trigram(b), preview: preview(b) },
      combined: { ioc: ioc(decoded), trigram: trigram(decoded) }
    });
  }
}

const raw = {
  p12: { ioc: ioc(p12), trigram: trigram(p12), F: p12.filter((v) => v === 0).length },
  p13: { ioc: ioc(p13), trigram: trigram(p13), F: p13.filter((v) => v === 0).length },
  combined: { ioc: ioc(target), trigram: trigram(target) },
  solvedP57: { ioc: ioc(p57), trigram: trigram(p57) }
};
console.log(JSON.stringify({
  source: {
    corpus: 'resources/liber-primus/lp2-corpus.json',
    transcription: 'resources/liber-primus/lp2-transcription.txt',
    shakespeare: 'resources/control/shakespeare_first300k.txt',
    p12Runes: p12.length, p13Runes: p13.length, p57Runes: p57.length,
    continuousP12P13: true
  },
  raw, variants
}, null, 2));
