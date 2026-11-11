'use strict';

/**
 * Source-frozen RSA inverse on the only unknown LP2 rune pages that fit
 * the 2012 P.S. 432-bit modulus as complete base-29 numerals.
 * Run: node sims/lp2_2012_ps_rsa_terminal_sft.cjs
 * No external dependencies or corpus writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const signedPostscript = '10412790658919985359827898739594318956404425106955675643739226952372682423852959081739834390370374475764863415203423499357108713631';
const p = 99554414790940424414351515490472769096534141749790794321708050837n;
const q = 104593961812606247801193807142122161186583731774511103180935025763n;
const modulus = BigInt(signedPostscript);
const exponent = 65537n;

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

/** @param {bigint} x @param {bigint} m @returns {bigint} */
function inverse(x, m) {
  let [oldR, r, oldT, t] = [m, x % m, 0n, 1n];
  while (r !== 0n) {
    const k = oldR / r;
    [oldR, r] = [r, oldR - k * r];
    [oldT, t] = [t, oldT - k * t];
  }
  assert.equal(oldR, 1n);
  return (oldT % m + m) % m;
}

/** @param {bigint} value @param {bigint} power @param {bigint} m @returns {bigint} */
function modPow(value, power, m) {
  let out = 1n;
  for (value %= m; power > 0n; power >>= 1n, value = value * value % m) {
    if ((power & 1n) !== 0n) out = out * value % m;
  }
  return out;
}

/** @param {number[]} digits @returns {bigint} */
function fromGP29(digits) {
  let out = 0n;
  for (const digit of digits) {
    assert(Number.isInteger(digit) && digit >= 0 && digit < 29);
    out = 29n * out + BigInt(digit);
  }
  return out;
}

/** @param {bigint} num @returns {string} */
function toGP29(num) {
  const symbols = [];
  do {
    symbols.unshift(corpus.translit[Number(num % 29n)]);
    num /= 29n;
  } while (num > 0n);
  return symbols.join(' ');
}

/** @param {bigint} n @returns {Buffer} */
function bigEndian54(n) {
  const hex = n.toString(16).padStart(108, '0');
  assert(hex.length <= 108);
  return Buffer.from(hex, 'hex');
}

assert.equal(p * q, modulus, 'Factors must reproduce the 2012 P.S.');
assert.equal(modulus.toString(2).length, 432);
const phi = (p - 1n) * (q - 1n);
assert.equal(gcd(exponent, phi), 1n);
const privateExponent = inverse(exponent, phi);
assert.equal(exponent * privateExponent % phi, 1n);
const planted = BigInt('0x' + Buffer.from('LIBER PRIMUS RSA POSITIVE CONTROL').toString('hex'));
assert(planted < modulus);
assert.equal(modPow(modPow(planted, exponent, modulus), privateExponent, modulus), planted);

const pages = corpus.pages.slice(0, 56);
const eligible = pages.filter(page => page.indices.length > 0 && fromGP29(page.indices) < modulus);
assert.deepEqual(eligible.map(page => page.page), [49, 55]);

/** @type {Array<Record<string,string|number|boolean>>} */
const tests = [];
for (const page of eligible) {
  for (const orientation of ['printed', 'reversed']) {
    const indices = orientation === 'printed' ? page.indices : [...page.indices].reverse();
    const c = fromGP29(indices);
    const plainInt = modPow(c, privateExponent, modulus);
    assert.equal(modPow(plainInt, exponent, modulus), c);
    const bytes = bigEndian54(plainInt);
    const printable = [...bytes].filter(byte => byte >= 32 && byte <= 126).length;
    const pkcs1v15 = bytes[0] === 0 && (bytes[1] === 1 || bytes[1] === 2);
    const oaepNecessaryZero = bytes[0] === 0;
    tests.push({
      page: page.page, orientation, ciphertextRunes: indices.length,
      ciphertextBits: c.toString(2).length, recoveredBits: plainInt.toString(2).length,
      printableBytes: printable, totalBytes: bytes.length,
      pkcs1v15, oaepNecessaryZero,
      recoveredBytePrefixHex: bytes.subarray(0, 16).toString('hex'),
      recoveredGP29Prefix: toGP29(plainInt).split(' ').slice(0, 30).join(' ')
    });
  }
}
assert.deepEqual(tests.map(t => t.printableBytes), [22, 22, 17, 21]);
assert(tests.every(t => !t.pkcs1v15 && !t.oaepNecessaryZero));

process.stdout.write(JSON.stringify({
  sourceModulusBits: 432,
  exponentAssumption: '65537 (conventional, not supplied by P.S.)',
  sourceInput: 'Only complete original rune pages 49 and 55 fit the modulus as GP29 numbers',
  controls: 'p*q equals P.S.; e*d=1 modulo phi; independent planted RSA round trip',
  tests,
  finding: 'No text or PKCS#1-v1.5/OAEP payload; arbitrary raw binary cannot be excluded'
}, null, 2) + '\n');
