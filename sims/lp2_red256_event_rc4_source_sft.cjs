'use strict';

// Read-only, source-frozen test of the LP2 225 red-rune +31 thirteen-dot event
// tape as an RC4 key. No original ciphertext, image, or repo file is modified.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
/** @param {string} name */
function source(name) {
  return JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', name), 'utf8'));
}
const corpus = source('lp2-corpus.json');
const ink = source('lp2-ink-annotations.json');
const grid = source('base60-grid.json');

/** @param {readonly number[]} key @param {number} length */
function rc4(key, length) {
  assert.ok(key.length > 0);
  const state = Uint8Array.from({ length: 256 }, (_, i) => i);
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + state[i] + key[i % key.length]) & 255;
    [state[i], state[j]] = [state[j], state[i]];
  }
  const stream = new Uint8Array(length);
  let i = 0;
  j = 0;
  for (let t = 0; t < length; t++) {
    i = (i + 1) & 255;
    j = (j + state[i]) & 255;
    [state[i], state[j]] = [state[j], state[i]];
    stream[t] = state[(state[i] + state[j]) & 255];
  }
  return stream;
}

assert.equal(Buffer.from(rc4([...Buffer.from('Key')], 10)).toString('hex'),
  'eb9f7781b734ca72a7');

/** @typedef {{page:number,position:number,value:number}} Event */
/** @type {Event[]} */
const events = [];
for (const annotation of ink.pages) {
  const page = corpus.pages.find(p => p.page === annotation.page);
  assert.ok(page);
  for (const span of annotation.red_spans || []) {
    assert.ok(span.start >= 0 && span.start + span.length <= page.indices.length);
    for (let i = 0; i < span.length; i++) {
      events.push({ page: page.page, position: span.start + i + 0.5,
        value: page.indices[span.start + i] });
    }
  }
  for (const [offset, size] of annotation.large_punctuation || []) {
    if (size === 13) {
      events.push({ page: page.page, position: offset, value: 29 });
    }
  }
}
events.sort((a, b) => a.page - b.page || a.position - b.position);
assert.equal(events.length, 256);
assert.equal(events.filter(e => e.value === 29).length, 31);
assert.equal(events.filter(e => e.value !== 29).length, 225);
assert.deepEqual(events.slice(0, 13).map(e => e.value),
  [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);

const byteTable = Uint8Array.from(grid.byte_rows.flat());
assert.equal(byteTable.length, 256);
assert.equal(crypto.createHash('sha256').update(byteTable).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const unknown = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(unknown.length, 12956);

/** @param {readonly number[]} values */
function ioc(values) {
  const n = Array(29).fill(0);
  for (const x of values) {
    assert.ok(x >= 0 && x <= 28);
    n[x]++;
  }
  return n.reduce((v, c) => v + c * (c - 1), 0) / (values.length * (values.length - 1));
}
/** @param {number} x */
function mod(x) { return ((x % 29) + 29) % 29; }

/**
 * sign=+1 decrypts by adding, sign=-1 by subtracting.
 * For differential, output P_i = C_i-C_(i-1) + sign*((stream_i%28)+1).
 * @param {readonly number[]} cipher
 * @param {Uint8Array} stream
 * @param {'direct'|'differential'} mode
 * @param {-1|1} sign
 */
function decode(cipher, stream, mode, sign) {
  let previous = 0;
  return cipher.map((current, i) => {
    const step = mode === 'direct' ? stream[i] % 29 : stream[i] % 28 + 1;
    const value = mode === 'direct' ? current : mod(current - previous);
    previous = current;
    return mod(value + sign * step);
  });
}
/**
 * @param {readonly number[]} clear
 * @param {Uint8Array} stream
 * @param {'direct'|'differential'} mode
 * @param {-1|1} sign
 */
function encode(clear, stream, mode, sign) {
  let previous = 0;
  return clear.map((plain, i) => {
    const step = mode === 'direct' ? stream[i] % 29 : stream[i] % 28 + 1;
    const value = mod(plain - sign * step);
    const current = mode === 'direct' ? value : mod(previous + value);
    previous = current;
    return current;
  });
}

const natural = corpus.pages.find(p => p.page === 57).indices;
assert.equal(natural.length, 95);
console.log('source:', JSON.stringify({
  originalRunes: unknown.length, eventCount: events.length,
  red: 225, thirteenDot: 31, originalIoC: ioc(unknown)
}));
for (const [name, key] of [
  ['chronological', events.map(e => e.value)],
  ['reversed', events.map(e => e.value).reverse()]
]) {
  const tableStream = rc4(key, 256);
  const payload = byteTable.map((b, i) => b ^ tableStream[i]);
  const printable = [...payload].filter(b => b >= 32 && b <= 126).length;
  console.log('table-XOR:', JSON.stringify({ key: name, printable,
    first24hex: Buffer.from(payload.slice(0, 24)).toString('hex') }));
  const stream = rc4(key, unknown.length);
  for (const mode of ['direct', 'differential']) {
    for (const sign of [-1, 1]) {
      const clear = decode(unknown, stream, mode, sign);
      const plant = encode(natural, stream, mode, sign);
      assert.deepEqual(decode(plant, stream, mode, sign), natural);
      assert.deepEqual(encode(clear, stream, mode, sign), unknown);
      console.log('runes:', JSON.stringify({ key: name, mode, sign, ioc: ioc(clear),
        prefix: clear.slice(0, 20).map(i => corpus.translit[i]).join(' ') }));
    }
  }
}
