'use strict';

/**
 * The original p55 body has 75 GP29 runes = 25 positional BASE29 triplets.
 * Resolve each triple modulo the *source-selected* 1,136-byte 2016 signed
 * packet (matching the original p32 inner-ring GP-prime sum). Extract 25
 * literal ASCII bytes, test them as a fixed repeating GP29 additive key.
 *
 * Both natural GP digit registers are fixed before reading any plaintext:
 * canonical GP ordinal and GP prime residue modulo29. No shifts, source
 * offsets, key phases, per-word fits, or short-phrase selection.
 *
 * Run from repository root:
 * node sims/p32_ring1136_p55_base29_triplet_signed2016_inverse_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.join(__dirname, '..');
/** @param {string} relative */
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');
assert.equal(signed.length, 1136);
assert.equal(crypto.createHash('sha256').update(signed, 'utf8').digest('hex'),
  'fe89e77519dfaca998a257ed39c2861303029de2a49183db00eea0fda3a28010');
const p55 = corpus.pages.find((page) => page.page === 55);
const p57 = corpus.pages.find((page) => page.page === 57);
assert.ok(p55 && p57);
assert.equal(p55.indices.length, 76);
assert.equal(p57.indices.length, 95);
const ciphertext = p55.indices.slice(1);
assert.equal(ciphertext.length, 75);

/** @param {number[]} digits */
function addresses(digits) {
  assert.equal(digits.length, 75);
  for (const x of digits) assert.ok(Number.isInteger(x) && x >= 0 && x < 29);
  const raw = [];
  for (let i = 0; i < digits.length; i += 3) {
    raw.push(digits[i] * 841 + digits[i + 1] * 29 + digits[i + 2]);
  }
  return raw;
}
assert.deepEqual(addresses(ciphertext), [
  21586, 6339, 12340, 10289, 2407, 23420, 4241, 3885, 416,
  16013, 11186, 17187, 13309, 10950, 7081, 10642, 15434,
  11963, 15585, 1758, 12695, 5027, 16138, 19663, 14829,
]);

/**
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {1|-1} direction
 * @returns {number[]}
 */
function transform(cipher, key, direction) {
  return cipher.map((x, i) => (x + 29 + direction * key[i % key.length]) % 29);
}

/** @param {number[]} values */
function transliterate(values) {
  return values.map((v) => corpus.translit[v]).join('');
}

/** @param {number[]} values */
function ioc(values) {
  const hist = new Array(29).fill(0);
  for (const x of values) hist[x]++;
  return hist.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

const outcomes = [];
const sourceValues = [
  ['ordinal', ciphertext],
  ['primeResidue', ciphertext.map((x) => corpus.prime[x] % 29)],
];
const solvedPlant = p57.indices.slice(0, 75);
for (const [name, digits] of sourceValues) {
  const raw = addresses(digits);
  const offsets = raw.map((n) => n % signed.length);
  const packetReadout = offsets.map((n) => signed[n]).join('');
  const key = offsets.map((n) => signed.charCodeAt(n) % 29);
  assert.equal(key.length, 25);
  assert.ok(key.every((n) => n >= 0 && n < 29));
  if (name === 'ordinal') {
    assert.deepEqual(offsets.slice(0, 8), [2, 659, 980, 65, 135, 700, 833, 477]);
    assert.equal(packetReadout, '-ZoiwBnVur7esQ1HLyTV oiit');
  } else {
    assert.deepEqual(offsets.slice(0, 8), [793, 774, 771, 363, 69, 73, 815, 272]);
    assert.equal(packetReadout, 'uTM1eyzaz/=t\nkgpc1IRktKu+');
  }
  const results = [];
  for (const direction of [-1, 1]) {
    const output = transform(ciphertext, key, direction);
    const recomputed = transform(output, key, /** @type {1|-1} */(-direction));
    assert.deepEqual(recomputed, ciphertext);
    const plantedCipher = transform(solvedPlant, key,
      /** @type {1|-1} */(-direction));
    assert.deepEqual(transform(plantedCipher, key,
      /** @type {1|-1} */(direction)), solvedPlant);
    results.push({
      inverse: direction === -1 ? 'subtract' : 'add',
      ioc: ioc(output),
      gp_readout: transliterate(output),
      plantedRecovery: '75/75',
    });
  }
  outcomes.push({name, packetReadout, packetOffsets: offsets, results});
}
assert.equal(outcomes[0].results[0].gp_readout,
  'NTSEEONLLXXNNOTHNPGEOHTHRNEAIFIAWAEOTHCXOEMXOEUAROESEAOSGNDIFIMJJYSWEOULEBDJHAEUFBAHGEAFI');
assert.equal(outcomes[0].results[1].gp_readout,
  'EOOECAEEAEHETIOHUMLEOPOETHFIEAGBFUPXMHNGTHLNGITFOENGRXGPNRSPBWIOEBURNGDGUOTEOTNGEAMAHIJOEXAEGWI');
assert.equal(outcomes[1].results[0].gp_readout,
  'AOELTUEOHNNDODNGCPTHEOYMGTRFIASPPFILHTHJXDTSPWYRCBYINGEJBAECBTARIGNGAEFEOTHEOXEOXWXEAEALUFBAE');
assert.equal(outcomes[1].results[1].gp_readout,
  'YTFIAFOELFNGUNDEOTTDWHLAEIARCFXSWNNGMEXTHYUOESREFAEFEAIAFOETMAWJAEGOLEEOHWETHOAESGTHAEFETHUCMA');
console.log(JSON.stringify({
  scope: 'actual physical p55 75-rune body',
  source: 'p32 GP-prime inner-ring 1136 == 2016 signed ASCII length',
  candidate: '25 GP29 triplets into signed message, mod1136, repeated key period25',
  status: 'no original plaintext or authenticated key',
  outcomes,
}, null, 2));
