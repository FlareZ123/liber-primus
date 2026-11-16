'use strict';

/**
 * Single-run original LP2 inverse: exact source-table cofactor quotient Q252
 * split across nine visible chapters into 28 BASE29 digits each, packed into
 * low 128 bits as an AES-128-CTR key per chapter, then decoded through a
 * predecessor-excluding GP28/EA cipher. All choices are frozen before reading
 * decoded text. No adaptive language-score search.
 *
 * Historical operations: 2013 signed BASE29 example; GF29 source factors
 * H=[3,26,24], p39 red G=[27,5,15]; LP2's nine visible chapters.
 * Unsupported hypotheses: Q252 is key material, low-128-bit truncation,
 * zero-IV AES-128-CTR, and repeat -> EA escape.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createCipheriv, createHash} = require('node:crypto');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/base60-grid.json'), 'utf8'));
const byteRows = grid.byte_rows;
assert.equal(byteRows.length, 32);
for (const row of byteRows) assert.equal(row.length, 8);
const bytes = Buffer.from(byteRows.flat());
assert.equal(createHash('sha256').update(bytes).digest('hex'), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const mod = n => ((n % 29) + 29) % 29;
const multiply = (a, b) => {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++) out[i + j] = mod(out[i + j] + a[i] * b[j]);
  return out;
};
const sourceH = [3, 26, 24]; // signed 2013 "BASE29 3301 = 3QO"
const sourceG = [27, 5, 15]; // physical LP2 p39 red triad
const factor = multiply(sourceH, sourceG);
assert.deepEqual(factor, [23, 21, 11, 17, 12]);
const remainder = [...bytes].map(mod);
const quotient = Array(252).fill(0);
const descendingDivisor = [...factor].reverse();
for (let i = 0; i < quotient.length; i++) {
  // 17 is the multiplicative inverse of 12 modulo 29.
  const q = mod(remainder[i] * 17);
  quotient[i] = q;
  for (let j = 0; j < descendingDivisor.length; j++) {
    remainder[i + j] = mod(remainder[i + j] - q * descendingDivisor[j]);
  }
}
assert.ok(remainder.every(v => v === 0));
assert.equal(quotient[0], 0);
assert.equal(quotient.length, 9 * 28);

/** @param {number[]} digits @returns {Buffer} */
function base29Low128(digits) {
  let value = 0n;
  for (const digit of digits) {
    assert.ok(digit >= 0 && digit < 29);
    value = value * 29n + BigInt(digit);
  }
  const key = Buffer.alloc(16);
  for (let i = 15; i >= 0; i--) {
    key[i] = Number(value & 255n);
    value >>= 8n;
  }
  return key;
}
const keys = Array.from({length: 9}, (_, j) => base29Low128(quotient.slice(j * 28, (j + 1) * 28)));
assert.ok(keys.every(key => key.length === 16));

/** @param {Buffer} key @param {number} count @returns {Buffer} */
function keyStream(key, count) {
  const aes = createCipheriv('aes-128-ctr', key, Buffer.alloc(16));
  return Buffer.concat([aes.update(Buffer.alloc(count)), aes.final()]);
}

/**
 * @param {number[]} cipher
 * @param {Buffer} key
 * @returns {number[]}
 */
function decode(cipher, key) {
  const stream = keyStream(key, cipher.length);
  const plain = [];
  let previous = 0;
  for (let i = 0; i < cipher.length; i++) {
    const step = mod(cipher[i] - previous);
    plain.push(step === 0 ? 28 : (step - 1 - (stream[i] % 28) + 28) % 28);
    previous = cipher[i];
  }
  return plain;
}

/** @param {number[]} plain @param {Buffer} key @returns {number[]} */
function encode(plain, key) {
  const stream = keyStream(key, plain.length);
  const cipher = [];
  let previous = 0;
  for (let i = 0; i < plain.length; i++) {
    const step = plain[i] === 28 ? 0 : 1 + (plain[i] + stream[i] % 28) % 28;
    previous = mod(previous + step);
    cipher.push(previous);
  }
  return cipher;
}

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const counts = Array(29).fill(0);
  for (const index of symbols) counts[index]++;
  return counts.reduce((n, count) => n + count * (count - 1), 0) / (symbols.length * (symbols.length - 1));
}

/** @param {number[]} symbols @returns {string} */
function spell(symbols) {
  return symbols.map(index => corpus.translit[index]).join('');
}

const pageGroups = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const expectedLengths = [729,1145,1729,1903,1021,1433,1680,3008,308];
const sections = pageGroups.map(([first,last], i) => {
  const cipher = corpus.pages.slice(first, last + 1).flatMap(page => page.indices);
  assert.equal(cipher.length, expectedLengths[i]);
  return cipher;
});
const original = sections.flat();
assert.equal(original.length, 12956);

// The real clear p57 is a 95-rune positive control, including the EA branch.
const knownClear = corpus.pages[57].indices;
assert.equal(knownClear.length, 95);
for (const key of keys) assert.deepEqual(decode(encode(knownClear, key), key), knownClear);
const decoded = sections.map((cipher, i) => {
  const plaintext = decode(cipher, keys[i]);
  assert.deepEqual(encode(plaintext, keys[i]), cipher);
  return plaintext;
});
const joined = decoded.flat();
const summary = decoded.map((text, i) => ({
  section: i + 1,
  pages: pageGroups[i],
  length: text.length,
  key_sha256: createHash('sha256').update(keys[i]).digest('hex'),
  original_ioc: Number(ioc(sections[i]).toFixed(8)),
  decrypted_ioc: Number(ioc(text).toFixed(8)),
  decoded_prefix: spell(text.slice(0, 140))
}));
console.log(JSON.stringify({
  operation: 'Q252 nine GP29 key blocks -> low128 BASE29 AES128-CTR zeroIV -> GP28 predecessor rank; zero-step EA',
  source_byte_sha256: createHash('sha256').update(bytes).digest('hex'),
  original_runes: original.length,
  recovered_native_control: knownClear.length,
  native_p57_ioc: ioc(knownClear),
  original_cipher_ioc: ioc(original),
  decoded_ioc: ioc(joined),
  decoded_ea_count: joined.filter(x => x === 28).length,
  sections: summary,
  limitation: 'The source fixes H/G, 252 quotient slots and nine chapter boundaries, but does not authenticate AES128/CTR/truncation/EA. A reversible decrypt/re-encrypt identity cannot identify the historical key.'
}, null, 2));
