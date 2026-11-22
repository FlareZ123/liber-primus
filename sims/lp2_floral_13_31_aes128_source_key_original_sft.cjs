'use strict';

/**
 * Source-led exploratory consumer: literal LP2 floral 13/31 selectors choose
 * two original p50 base60 byte rows, combined as one AES-128-CTR key.
 * Tests only fixed no-nonce GP29 keystream receiver on whole p40–53.
 *
 * This operation is hypothetical; original art does not authenticate AES,
 * the CTR IV, the byte→rune map, or forward row ordering.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createCipheriv } = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} relativePath */
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const { pages, translit } = corpus;

/** Original published base60 digit order, no guessed alphabet. */
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
assert.equal(grid.alphabet, alphabet);
assert.equal(grid.rows.length, 32);
assert(grid.rows.every((row) => row.length === 8));

/** @param {string[]} row */
function parseRow(row) {
  return Buffer.from(row.map((word) => {
    assert.equal(word.length, 2);
    const a = alphabet.indexOf(word[0]);
    const b = alphabet.indexOf(word[1]);
    assert(a >= 0 && b >= 0);
    const n = a * 60 + b;
    assert(n >= 0 && n <= 255);
    return n;
  }));
}

/** @param {number[]} plaintext @param {Buffer} key */
function keystream(plaintext, key) {
  const cipher = createCipheriv('aes-128-ctr', key, Buffer.alloc(16));
  return Buffer.concat([cipher.update(Buffer.alloc(plaintext.length)), cipher.final()]);
}

function originalCiphertext() {
  /** @type {number[]} */
  const data = [];
  for (let p = 40; p <= 53; p += 1) data.push(...pages[p].indices);
  assert.equal(data.length, 3008);
  return data;
}

/** @param {number[]} xs */
function indexOfCoincidence(xs) {
  const h = Array(29).fill(0);
  for (const x of xs) h[x] += 1;
  return h.reduce((n, k) => n + k * (k - 1), 0) / (xs.length * (xs.length - 1));
}

/** @param {number[]} values @param {Buffer} stream @param {number} sign */
function apply(values, stream, sign) {
  return values.map((x, i) => (((x + sign * (stream[i] % 29)) % 29) + 29) % 29);
}

/** Encode source-native LP1 text as canonical GP runes for a planted proof. */
function gpNative(text) {
  const alphabetByTranslit = new Map(translit.map((x, i) => [x, i]));
  for (const [a, b] of [['K', 'C'], ['Q', 'C'], ['V', 'U'], ['Z', 'S']]) {
    alphabetByTranslit.set(a, alphabetByTranslit.get(b));
  }
  const tokens = Array.from(alphabetByTranslit.keys()).sort((a, b) => b.length - a.length);
  /** @type {number[]} */
  const result = [];
  for (const match of text.toUpperCase().matchAll(/[A-Z]+/g)) {
    const word = match[0];
    for (let i = 0; i < word.length;) {
      const token = tokens.find((t) => word.startsWith(t, i));
      assert(token);
      result.push(alphabetByTranslit.get(token));
      i += token.length;
    }
  }
  return result;
}

function main() {
  const data = originalCiphertext();
  const left = parseRow(grid.rows[13]);
  const right = parseRow(grid.rows[31]);
  assert.equal(left.toString('hex'), '7a3f1fda0eb82073');
  assert.equal(right.toString('hex'), '719eace6b424bd50');
  const keys = [
    ['natural', Buffer.concat([left, right])],
    ['mirrored-right', Buffer.concat([left, Buffer.from(right).reverse()])],
  ];
  let best = { ioc: 0, name: '' };
  for (const [name, key] of keys) {
    const stream = keystream(data, key);
    for (const sign of [-1, 1]) {
      const plain = apply(data, stream, sign);
      const ioc = indexOfCoincidence(plain);
      const head = plain.slice(0, 48).map((n) => translit[n]).join(' ');
      assert.deepEqual(apply(plain, stream, -sign), data);
      console.log(name, 'sign', sign, 'original IoC', ioc.toFixed(9), 'first48 GP', head);
      if (ioc > best.ioc) best = { ioc, name: name + '/sign' + sign };
    }
  }
  const reference = read('resources/liber-primus/lp1-plaintext-reference.txt');
  const natural = gpNative(reference);
  assert(natural.length >= 3008);
  const sample = natural.slice(0, 3008);
  const key = keys[0][1];
  const stream = keystream(sample, key);
  const encrypted = apply(sample, stream, 1);
  const recovered = apply(encrypted, stream, -1);
  assert.deepEqual(recovered, sample);
  console.log('PASS full 3008-rune native GP AES-CTR plant', 'plain IoC', indexOfCoincidence(sample).toFixed(9));
  // Wrong key is deliberately distinct from both preselected row orientations.
  const wrong = Buffer.concat([parseRow(grid.rows[12]), right]);
  const falsePlain = apply(encrypted, keystream(sample, wrong), -1);
  assert.notDeepEqual(falsePlain, sample);
  console.log('PASS wrong-source-row negative; best original', best.name, best.ioc);
  assert(best.ioc < 0.045, 'A source GP-language signal warrants independent original review');
}
main();
