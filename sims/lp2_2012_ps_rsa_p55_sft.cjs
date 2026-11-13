'use strict';

/**
 * Source-fixed p55 against the factored 2012 Cicada P.S. RSA modulus.
 * Run: node sims/lp2_2012_ps_rsa_p55_sft.cjs
 * Reads the repository's physical-page GP29 corpus.
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

const P = 99554414790940424414351515490472769096534141749790794321708050837n;
const Q = 104593961812606247801193807142122161186583731774511103180935025763n;
const N = 10412790658919985359827898739594318956404425106955675643739226952372682423852959081739834390370374475764863415203423499357108713631n;
const E = 65537n;

/** @param {bigint} a @param {bigint} b */
function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

/** @param {bigint} a @param {bigint} modulus */
function modInverse(a, modulus) {
  let b = modulus;
  let x = 1n;
  let y = 0n;
  while (b !== 0n) {
    const quotient = a / b;
    [a, b] = [b, a % b];
    [x, y] = [y, x - quotient * y];
  }
  assert.equal(a, 1n);
  return (x % modulus + modulus) % modulus;
}

/** @param {bigint} base @param {bigint} exponent @param {bigint} modulus */
function modPow(base, exponent, modulus) {
  let result = 1n;
  while (exponent > 0n) {
    if (exponent & 1n) result = result * base % modulus;
    base = base * base % modulus;
    exponent >>= 1n;
  }
  return result;
}

/** @param {number[]} runes */
function base29(runes) {
  return runes.reduce((value, rune) => value * 29n + BigInt(rune), 0n);
}

assert.equal(P * Q, N, 'independently published factorization must agree');
assert.equal(N.toString(2).length, 432);
const phi = (P - 1n) * (Q - 1n);
assert.equal(gcd(E, phi), 1n);
const D = modInverse(E, phi);

const page = corpus.pages.find((p) => p.page === 55);
assert.ok(page, 'physical LP2 page 55 exists');
assert.equal(page.runic_count, 76);
assert.equal(page.indices.length, 76);

const cases = [
  ['full_76', page.indices, '02da37be27f7d1a5d315b42eeeef52b04a1d74bb86f9cd6480cf56b40befcaf3db85281f1944a1aef07a2fb0328c5790f57b8ced226c'],
  ['body_75', page.indices.slice(1), '01150a6938b95e7a401b110e65b836dd46f188edbff2e17d0a87531aebfef1b90c61f7d0f681a8243971b3cbc9859d1fcd867f513a85']
];

for (const [name, runes, expected] of cases) {
  const ciphertext = base29(runes);
  assert.ok(ciphertext < N);
  const message = modPow(ciphertext, D, N);
  assert.equal(modPow(message, E, N), ciphertext, 'RSA arithmetic inverse');
  const decoded = Buffer.from(message.toString(16).padStart(108, '0'), 'hex');
  assert.equal(decoded.length, 54);
  assert.equal(decoded.toString('hex'), expected, 'frozen original-p55 regression');
  assert.notEqual(decoded[0], 0, 'OAEP needs a leading zero octet');
  const printable = [...decoded].filter((v) => v >= 32 && v <= 126).length;
  console.log(name, JSON.stringify({
    ciphertext_bits: ciphertext.toString(2).length,
    modulus_bits: 432,
    decrypted_hex: decoded.toString('hex'),
    printable_ascii: printable,
    oaep_or_pkcs1v15_possible: false
  }));
}


/*
 * The independent 2014 first-onion RSA-OAEP original challenge is in the
 * same 2014 puzzle round that subsequently delivered Liber Primus.
 * Its e=65537, 432-bit modulus and factors were printed in contemporary
 * solver documentation. This is an additional direct original-p55 gate.
 */
const P2014 = 97513779050322159297664671238670850085661086043266591739338007321n;
const Q2014 = 77506098606928780021829964781695212837195959082370473820509360759n;
const N2014 = 7557912574608535164426718292058021255641310207187633095795069445700059210248050757270234679993673844203148013173091173786572116639n;
assert.equal(P2014 * Q2014, N2014);
assert.equal(N2014.toString(2).length, 432);
const D2014 = modInverse(E, (P2014 - 1n) * (Q2014 - 1n));
const direct2014 = [
  ['full_76', page.indices, '941ae5138da36a3ecc6dcc6763c0eaaa420dc07531598795f925381cecff28695822489df23d499ad53a132f3fb9f22ac9f44403fc73'],
  ['body_75', page.indices.slice(1), '34db54889da71924b3f8cce02164690bdf4d1fbb355fb7347a43669af84890c867aa78c2ccca2baada008189cea6f6ad2410becce440']
];
for (const [name, runes, expected] of direct2014) {
  const ciphertext = base29(runes);
  assert.ok(ciphertext < N2014);
  const message = modPow(ciphertext, D2014, N2014);
  assert.equal(modPow(message, E, N2014), ciphertext);
  const decoded = Buffer.from(message.toString(16).padStart(108, '0'), 'hex');
  assert.equal(decoded.length, 54);
  assert.equal(decoded.toString('hex'), expected);
  assert.notEqual(decoded[0], 0, '2014 RSA OAEP leading 0x00 unavailable');
  const printable = [...decoded].filter((v) => v >= 32 && v <= 126).length;
  console.log('2014_' + name, JSON.stringify({
    ciphertext_bits: ciphertext.toString(2).length,
    modulus_bits: 432,
    decrypted_hex: decoded.toString('hex'),
    printable_ascii: printable,
    oaep_or_pkcs1v15_possible: false
  }));
}

// A source-size, 54-byte PKCS#1 v1.5 formatting plant tests RSA itself.
// This is an implementation control, never evidence of historical use.
const encodedPlant = Buffer.concat([
  Buffer.from([0, 2]), Buffer.alloc(8, 0xaa), Buffer.from([0]), Buffer.alloc(43, 0x41)
]);
assert.equal(encodedPlant.length, 54);
const plant = BigInt('0x' + encodedPlant.toString('hex'));
assert.ok(plant < N);
assert.equal(modPow(modPow(plant, E, N), D, N), plant);
console.log('PASS: RSA plant and four source-fixed original p55 candidates; no decoded LP2 plaintext.');
