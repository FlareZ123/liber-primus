'use strict';
/** Exact all-F-history test of the 2014 7×7 source square on LP2 p33–39. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const bytes = fs.readFileSync('resources/cicada2014-openpuff-magic-squares.txt');
assert.equal(bytes.length, 745);
assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),
  '9e5c3004eec652c89027e99aa6f31c53a84c1f8c327c04ca9aa6acf7884b6c7f');
const rows = bytes.toString('ascii').split('\r\n').filter(line => /\d/.test(line))
  .map(line => [...line.matchAll(/\d+/g)].map(m => Number(m[0])));
assert.deepEqual(rows.map(x => x.length),
  [...Array(5).fill(5), ...Array(7).fill(7), ...Array(5).fill(5)]);
const source = rows.slice(5, 12);
assert.ok(source.every(row => row.reduce((a,b) => a+b, 0) === 1033));
const keys = source.map(row => row.map(x => x % 29));
const page = p => corpus.pages.find(x => x.page === p).indices;
const originals = Array.from({length: 7}, (_, k) =>
  page(k+33).slice(k === 0 ? 91 : 0, k === 6 ? 119 : undefined));
assert.deepEqual(originals.map(x => x.length), [123,261,271,238,228,228,119]);
assert.equal(originals.flat().length, 1468);

/**
 * Enumerate all legal histories of the authentic solved-page plaintext-F bypass.
 * @param {number[]} ciphertext GP29 original symbols
 * @param {number[]} key Original row modulo29
 * @param {1|-1} sign C=P+sign*key
 * @returns {number|null} First impossible 0-indexed symbol, else null
 */
function firstImpossible(ciphertext, key, sign) {
  let phases = new Set([0]);
  for (let position = 0; position < ciphertext.length; position++) {
    const next = new Set();
    for (const j of phases) {
      if (ciphertext[position] === 0) next.add(j);
      const plain = ((ciphertext[position] - sign*key[j])%29+29)%29;
      if (plain !== 0) next.add((j+1)%7);
    }
    if (next.size === 0) return position;
    phases = next;
  }
  return null;
}

/** @param {number[]} plaintext GP29 native plaintext symbols
 * @param {number[]} key Row key @param {1|-1} sign @returns {number[]} */
function encrypt(plaintext, key, sign) {
  let clock = 0;
  return plaintext.map(p => {
    if (p === 0) return 0;
    const c = ((p + sign*key[clock])%29+29)%29;
    clock = (clock+1)%7;
    return c;
  });
}
assert.equal(page(57).length, 95, 'solved p57 native GP source');
const firstFails = {'1':[17,8,0,57,21,94,47], '-1':[1,64,66,11,18,66,2]};
for (const sign of [1,-1]) {
  for (let k = 0; k < 7; k++) {
    const failure = firstImpossible(originals[k], keys[k], sign);
    assert.equal(failure, firstFails[sign][k], 'unaltered source original');
    const sourcePlain = Array.from({length: originals[k].length},
      (_, i) => page(57)[i % 95]);
    assert.equal(firstImpossible(encrypt(sourcePlain, keys[k], sign), keys[k], sign),
      null, 'solved-p57 GP control must pass with real key');
    console.log(JSON.stringify({page:k+33, sign, sourceRunes:originals[k].length,
      firstImpossibleIndex:failure, nativePositive:true}));
  }
}
console.log('PASS: 14 source-keyed full-original inverses impossible; 14 GP-native plants feasible');
