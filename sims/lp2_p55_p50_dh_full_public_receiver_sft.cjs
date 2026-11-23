'use strict';
/**
 * Conditional original p55 finite-field DH -> original p50 256-byte receiver.
 * Pre-registered BEFORE completion of the bounded full-discrete-log search.
 *
 * Type roles from the 16 full p55 words under the stated conditional SHED
 * model: prime p=N/8, primitive g=E/43, Alice public A=8, Bob public B=E.
 * Recover Bob private b=log_g(B) via CADO-NFS and small-subgroup CRT;
 * then the standard DH shared value is S=A^b (mod p).
 *
 * A separate historical 2013 Cicada signed example motivates DH grammar.
 * SHA256(26-byte big-endian S), AES256, zero IV and original p50 byte
 * recipient are additional UNAUTHENTICATED choices, frozen in this test.
 *
 * Node 22 CommonJS, Windows-compatible. Read-only SFT, no dependencies.
 * Usage: node sims/lp2_p55_p50_dh_full_public_receiver_sft.cjs <decimal_b>
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash, createCipheriv, createDecipheriv} = require('node:crypto');

const root = path.resolve(__dirname, '..');
const P = 63755441409934721069036418908763882578170591536653256311514221n;
const Q = 1268532719737981052966698570711268391040527137n;
const B = 54546906948733185277568038540584540814742666891n;
const A = 8n;
const M = 630311729907820n;
const R = 101149063843788281988908603592862658065019147521n;
const smoothLog = 483581994079670n;
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/base60-grid.json'), 'utf8'));
assert.equal(P - 1n, M * R);
assert.equal(B, 43n * Q);
assert.equal(corpus.pages.find(page => page.page === 55).indices.length, 76);
const table = grid.rows.flat();
assert.equal(table.length, 256);
assert.equal(grid.alphabet.length, 60);

/** @param {bigint} base @param {bigint} exp @param {bigint} prime */
function power(base, exp, prime) {
  let result = 1n;
  for (base %= prime; exp > 0n; exp >>= 1n, base = base * base % prime) {
    if (exp & 1n) result = result * base % prime;
  }
  return result;
}

/** @param {Buffer} plaintext @param {string} alg @param {Buffer} key */
function aes(plaintext, alg, key, encrypt) {
  const iv = alg.endsWith('-ecb') ? null : Buffer.alloc(16, 0);
  const op = encrypt ? createCipheriv(alg, key, iv) : createDecipheriv(alg, key, iv);
  op.setAutoPadding(false);
  return Buffer.concat([op.update(plaintext), op.final()]);
}

/** @param {Buffer} b */
function stats(b) {
  const printable = [...b].filter(x => x >= 32 && x < 127).length;
  const directGP29 = [...b].filter(x => x < 29).length;
  const ascii = b.toString('latin1')
    .replace(/[^\x20-\x7e]/g, '.');
  return {
    printable, directGP29, hexPrefix32: b.subarray(0, 32).toString('hex'),
    asciiPrefix80: ascii.slice(0, 80),
    knownFileMagic: ['%PDF-', 'PK\x03\x04', '\x89PNG', 'GIF8', '-----BEGIN PGP', 'MZ']
      .filter(header => b.toString('latin1').startsWith(header)),
  };
}
if (process.argv.length === 2) {
  // A read-only planted block-cipher control without pretending to know b.
  const fakeSecret = power(A, 43n, P);
  const secretBytes = Buffer.from(fakeSecret.toString(16).padStart(52, '0'), 'hex');
  const testKey = createHash('sha256').update(secretBytes).digest();
  assert.equal(testKey.length, 32);
  const testPlain = Buffer.from('A DEFINITE AUTHENTICATED PLAINTEXT CONTROL. '.repeat(8)
    .slice(0, 256).padEnd(256, ' '), 'ascii');
  assert.equal(testPlain.length, 256);
  for (const mode of ['aes-256-ctr', 'aes-256-cbc', 'aes-256-ecb']) {
    assert.deepEqual(aes(aes(testPlain, mode, testKey, true), mode, testKey, false), testPlain);
  }
  console.log('PASS: original p55/p50 typed values, 256-byte ciphertext lengths, AES256 plant');
  console.log('No original Bob private exponent; original p50 remains encrypted.');
} else {
  assert.equal(process.argv.length, 3,
    'Pass exactly one full field exponent b recovered by CADO + CRT');
  assert.match(process.argv[2], /^[0-9]+$/);
  const b = BigInt(process.argv[2]);
  assert.ok(b > 0n && b < P - 1n);
  assert.equal(b % M, smoothLog);
  assert.equal(power(Q, b, P), B, 'Full source Bob public-key equation failed');
  const S = power(A, b, P);
  const secretBytes = Buffer.from(S.toString(16).padStart(52, '0'), 'hex');
  assert.equal(secretBytes.length, 26);
  const key = createHash('sha256').update(secretBytes).digest();
  console.log('Original source typed conditional DH:', {
    private_b: b.toString(), shared_S: S.toString(), SHA256_AES256_key: key.toString('hex')
  });
  for (const [radixName, alphabet] of [
    ['printed-radix60', grid.alphabet],
    ['omitted-f-radix59', grid.alphabet.replace('f', '')],
  ]) {
    const radix = alphabet.length;
    const bytes = table.map(cell => {
      assert.equal(cell.length, 2);
      const head = alphabet.indexOf(cell[0]);
      const tail = alphabet.indexOf(cell[1]);
      assert.ok(head >= 0 && tail >= 0);
      const value = head * radix + tail;
      assert.ok(value >= 0 && value < 256);
      return value;
    });
    const ciphertext = Buffer.from(bytes);
    for (const mode of ['aes-256-ctr', 'aes-256-cbc', 'aes-256-ecb']) {
      const plaintext = aes(ciphertext, mode, key, false);
      assert.deepEqual(aes(plaintext, mode, key, true), ciphertext);
      console.log(radixName + ' ' + mode, JSON.stringify(stats(plaintext)));
    }
  }
  console.log('No unknown-LP2 plaintext is claimed unless native content is reproducibly legible.');
}
