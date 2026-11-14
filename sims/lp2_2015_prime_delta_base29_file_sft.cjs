'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const M = 29;
const N = 729;

/** @param {number} x @returns {number} */
function mod(x) { return (x % M + M) % M; }

/** @param {number} count @returns {number[]} */
function primes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let composite = false;
    for (const p of out) {
      if (p * p > n) break;
      if (n % p === 0) { composite = true; break; }
    }
    if (!composite) out.push(n);
  }
  return out;
}

/** @param {number[]} source @param {number[]} ps @returns {number[]} */
function primeDelta(source, ps) {
  let previous = mod(-ps[0]);
  return source.map((value, i) => {
    const shifted = mod(value - ps[i + 1]);
    const delta = mod(shifted - previous);
    previous = shifted;
    return delta;
  });
}

/** @param {number[]} deltas @param {number[]} ps @returns {number[]} */
function inversePrimeDelta(deltas, ps) {
  let previous = mod(-ps[0]);
  return deltas.map((delta, i) => {
    const shifted = mod(previous + delta);
    previous = shifted;
    return mod(shifted + ps[i + 1]);
  });
}

/** @param {number[]} digits @param {number} width @returns {Buffer} */
function base29ToBytes(digits, width) {
  let value = 0n;
  for (const digit of digits) {
    assert(Number.isInteger(digit) && digit >= 0 && digit < M);
    value = value * 29n + BigInt(digit);
  }
  const out = Buffer.alloc(width);
  for (let i = width - 1; i >= 0; i--) {
    out[i] = Number(value & 255n);
    value >>= 8n;
  }
  assert.equal(value, 0n);
  return out;
}

/** @param {Buffer} bytes @param {number} count @returns {number[]} */
function bytesToBase29(bytes, count) {
  let value = BigInt('0x' + bytes.toString('hex'));
  const digits = Array(count).fill(0);
  for (let i = count - 1; i >= 0; i--) {
    digits[i] = Number(value % 29n);
    value /= 29n;
  }
  assert.equal(value, 0n);
  return digits;
}

/** @param {number[]} symbols @returns {number} */
function adjacentEquals(symbols) {
  let n = 0;
  for (let i = 1; i < symbols.length; i++) n += Number(symbols[i] === symbols[i - 1]);
  return n;
}

function main() {
  const corpus = JSON.parse(fs.readFileSync(
    path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
  const source = [0, 1, 2].flatMap(n => corpus.pages.find(p => p.page === n).indices);
  assert.equal(source.length, N);
  const ps = primes(N + 1);
  assert.deepEqual(ps.slice(0, 5), [2, 3, 5, 7, 11]);
  const deltas = primeDelta(source, ps);
  assert.deepEqual(inversePrimeDelta(deltas, ps), source);
  assert.equal(adjacentEquals(source), 4);
  assert.equal(adjacentEquals(deltas), 40);

  const width = Math.ceil(N * Math.log2(M) / 8);
  assert.equal(width, 443);
  const bytes = base29ToBytes(deltas, width);
  assert.equal(bytes.subarray(0, 16).toString('hex'), '16701bee70c4b19d90abf1d05127911a');
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),
    '6e81c23349c766eaabeab0fbe4caba13ae791077083ec64f43f5417873e8682');

  const hasSignature = {
    gzip: bytes.subarray(0, 3).equals(Buffer.from('1f8b08', 'hex')),
    bzip2: bytes.subarray(0, 3).equals(Buffer.from('425a68', 'hex')),
    png: bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')),
    zip: bytes.subarray(0, 4).equals(Buffer.from('504b0304', 'hex')),
    pdf: bytes.subarray(0, 4).equals(Buffer.from('25504446', 'hex')),
    openpgp: (bytes[0] & 128) !== 0,
  };
  assert(Object.values(hasSignature).every(value => value === false));

  // Exact same source-sized two-stage inverse: a full GZIP positive plant.
  const message = Buffer.from('WE MUST SHED OUR OWN CIRCUMFERENCES. '
    .repeat(20).slice(0, 420), 'ascii');
  const gzip = zlib.gzipSync(message, { level: 0, mtime: 0 });
  assert.equal(gzip.length, width);
  const plantedDigits = bytesToBase29(gzip, N);
  const plantedCipher = inversePrimeDelta(plantedDigits, ps);
  assert.deepEqual(primeDelta(plantedCipher, ps), plantedDigits);
  const recoveredGzip = base29ToBytes(primeDelta(plantedCipher, ps), width);
  assert.deepEqual(recoveredGzip, gzip);
  assert.deepEqual(zlib.gunzipSync(recoveredGzip), message);

  console.log(JSON.stringify({
    originalPhysicalPages: [0, 1, 2],
    runes: N, sourceAdjacentEquals: 4, transformedAdjacentEquals: 40,
    bytes: width, sourceSha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    first32Bytes: bytes.subarray(0, 32).toString('hex'),
    hasSignature, completeGzipPlant: true,
    unknownPlaintextRecovered: false
  }, null, 2));
}

main();
