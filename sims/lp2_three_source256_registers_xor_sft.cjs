'use strict';
/**
 * Source-ordered three-register XOR SFT: p50 256 bytes, image-confirmed
 * 225 red GP-prime runes + 31 thirteen-dot events, terminal 76+85+95 runes.
 * Original direct 2014 three-stream XOR operation as a bounded hypothesis.
 * Read-only Node22 CommonJS, Windows compatible; never substitutes p55 text.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {any} */
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', file), 'utf8'));
const annotations = read('lp2-ink-annotations.json');
const corpus = read('lp2-corpus.json');
const grid = read('lp2-grid-256.json');
const sourcePages = new Map(corpus.pages.map(p => [p.page, p]));
const events = [];
for (const page of annotations.pages.slice().sort((a, b) => a.page - b.page)) {
  const source = sourcePages.get(page.page);
  const local = [];
  for (const [offset, size] of page.large_punctuation || []) {
    if (size === 13) local.push({offset, order: 0, value: 13});
  }
  for (const span of page.red_spans || []) {
    for (let j = 0; j < span.length; j++) {
      const offset = span.start + j;
      assert.equal(source.indices[offset] >= 0, true);
      assert.equal(corpus.runes[source.indices[offset]], [...span.runes][j]);
      local.push({offset, order: 1, value: corpus.prime[source.indices[offset]]});
    }
  }
  local.sort((a, b) => a.offset - b.offset || a.order - b.order);
  events.push(...local.map(x => x.value));
}
const bytes = grid.bytes;
assert.equal(bytes.length, 256);
assert.equal(events.length, 256);
assert.equal(annotations.counts.red, 225);
assert.deepEqual([55,56,57].map(i => sourcePages.get(i).indices.length), [76,85,95]);
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const p55 = sourcePages.get(55).indices;
const p56 = sourcePages.get(56).indices;
const p57 = sourcePages.get(57).indices;
assert.equal(p56[56], 0);
// Independently authenticated p56 prime-totient key with unencrypted F at 56.
const primes = [];
for (let n = 2; primes.length < 90; n++) {
  if (primes.every(p => n % p !== 0)) primes.push(n);
}
let clock = 0;
const solved56 = p56.map((c, i) => i === 56 ? c : (c - (primes[clock++] - 1) % 29 + 29) % 29);
assert.equal(clock, 84);
assert.ok(solved56.map(i => corpus.translit[i]).join('').startsWith('ANENDWITHINTHEDEEPWEB'));
const hex = values => values.map(n => n.toString(16).padStart(2, '0')).join('');
const ascii = values => values.map(n => n >= 32 && n <= 126 ? String.fromCharCode(n) : '.').join('');
const target = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const observed = [];
for (const knownP56 of [false, true]) {
  for (const terminalValue of ['index', 'prime']) {
    const terminal = [...p55, ...(knownP56 ? solved56 : p56), ...p57]
      .map(i => terminalValue === 'prime' ? corpus.prime[i] : i);
    assert.equal(terminal.length, 256);
    const result = bytes.map((b, i) => b ^ events[i] ^ terminal[i]);
    // All source inputs can be recovered from the XOR output, as planted control.
    assert.deepEqual(result.map((v, i) => v ^ events[i] ^ terminal[i]), bytes);
    const prefix = hex(result.slice(0, 20));
    assert.equal(prefix, terminalValue === 'prime'
      ? 'b195a3a2639f289a2eabf680a30cdf9f37822563'
      : 'ebe9f7b777a504bb7a91d397ed0ba39d47fb096b');
    const printable = result.filter(v => v >= 32 && v <= 126).length / result.length;
    const sha512 = crypto.createHash('sha512').update(Buffer.from(result)).digest('hex');
    const knownHeaders = ['89504e470d0a1a0a', 'ffd8', '504b0304', '1f8b', '25504446', '47494638']
      .some(signature => hex(result.slice(0, signature.length / 2)) === signature);
    assert.equal(knownHeaders, false);
    assert(printable < 0.5);
    assert.notEqual(sha512, target);
    observed.push({knownP56, terminalValue, printable, prefix, sha512, first64:ascii(result.slice(0, 64))});
  }
}
console.log(JSON.stringify({
  input: 'Original source: 256 p50 table bytes, 225 GP-prime red runes plus 31 dot13 events, final 256 GP29 runes',
  variants: observed,
  decision: 'Four direct 3-register XOR outputs yield no legible text, standard file header, or p56 SHA512 preimage. This excludes only the exact two terminal value codings and p56 ciphertext/known-plaintext choices, not other key constructions.',
}, null, 2));
