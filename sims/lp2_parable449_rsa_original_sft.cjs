/**
 * Original-source test of the LP2 PARABLE-derived RSA public key.
 *
 * Node 22 CommonJS SFT:
 * Source GP-prime unit sums: PARABLE 449; body 1259, 1031, 1229.
 * ID3 historical 2013 number: 1,595,277,641 = 1259*1031*1229.
 *
 * This tests one proposed, unauthenticated RSA operation. No unknown
 * plaintext is presumed and source word divisions are left untouched.
 * Source: resources/liber-primus/lp2-corpus.json.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const PRIME_FACTORS = [1259n, 1031n, 1229n];
const MODULUS = PRIME_FACTORS.reduce((a, b) => a * b, 1n);
const PHI = PRIME_FACTORS.reduce((a, b) => a * (b - 1n), 1n);
const PUBLIC_EXPONENT = 449n;
const PRIVATE_EXPONENT = 283504449n;
const BLOCK_LENGTH = 6;
const DOMAIN = 29n ** BigInt(BLOCK_LENGTH);

function powerMod(base, exponent, modulus) {
  let acc = 1n;
  for (let b = base, e = exponent; e > 0n; e >>= 1n, b = b * b % modulus) {
    if ((e & 1n) !== 0n) acc = acc * b % modulus;
  }
  return acc;
}

function toInteger(digits) {
  return digits.reduce((acc, d) => acc * 29n + BigInt(d), 0n);
}

function toDigits(value, length) {
  const output = new Array(length).fill(0);
  let x = value;
  for (let i = length - 1; i >= 0; i--) {
    output[i] = Number(x % 29n);
    x /= 29n;
  }
  assert.equal(x, 0n, 'decoded RSA block overflows its GP29 width');
  return output;
}

/**
 * Cycle-walk the RSA permutation onto exactly six GP29 symbols.
 * All proper divisors are fixed independently by PARABLE; the choice
 * to interpret them as an RSA key remains a hypothesis.
 */
function permuteBlock(digits, exponent, reversed) {
  const printed = reversed ? [...digits].reverse() : digits;
  let x = powerMod(toInteger(printed), exponent, MODULUS);
  let walks = 1;
  while (x >= DOMAIN) {
    x = powerMod(x, exponent, MODULUS);
    walks++;
  }
  const result = toDigits(x, BLOCK_LENGTH);
  return { digits: reversed ? result.reverse() : result, walks };
}

function transformSegment(sequence, exponent, reversed) {
  const output = [...sequence];
  let blocks = 0;
  let walks = 0;
  for (let i = 0; i + BLOCK_LENGTH <= output.length; i += BLOCK_LENGTH) {
    const converted = permuteBlock(output.slice(i, i + BLOCK_LENGTH), exponent, reversed);
    output.splice(i, BLOCK_LENGTH, ...converted.digits);
    blocks++;
    walks += converted.walks;
  }
  return { output, blocks, walks };
}

function coincidence(values) {
  const counts = new Array(29).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((acc, count) => acc + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}

function readSource() {
  assert.equal(corpus.pages.length, 58);
  assert.equal(corpus.runes.length, 29);
  const unknown = corpus.pages.filter(p => p.page <= 55 && p.indices.length > 0);
  assert.equal(unknown.length, 55);
  assert.equal(unknown.reduce((total, p) => total + p.indices.length, 0), 12956);
  assert.equal(corpus.pages[54].indices.length + corpus.pages[55].indices.length, 308);
  assert.equal(corpus.pages[56].indices.length, 85);
  assert.equal(corpus.pages[57].indices.length, 95);
  return unknown;
}

function checkNativePositive() {
  const known = corpus.pages[57].indices;
  for (const reversed of [false, true]) {
    const encrypted = transformSegment(known, PUBLIC_EXPONENT, reversed);
    const recovered = transformSegment(encrypted.output, PRIVATE_EXPONENT, reversed);
    assert.deepEqual(recovered.output, known);
    const inverseCipher = transformSegment(known, PRIVATE_EXPONENT, reversed);
    const inverseRecovery = transformSegment(inverseCipher.output, PUBLIC_EXPONENT, reversed);
    assert.deepEqual(inverseRecovery.output, known);
    assert.equal(encrypted.blocks, 15);
  }
  console.log('Positive: both RSA directions and orientations recover all 95 clear p57 runes.');
}

function checkOriginal(unknown) {
  const all = unknown.flatMap(p => p.indices);
  console.log('Original unknown GP IoC:', coincidence(all).toFixed(9));
  for (const scope of ['book', 'page', 'terminal']) {
    const segments = scope === 'book' ? [all] :
      scope === 'page' ? unknown.map(p => p.indices) :
      [[...corpus.pages[54].indices, ...corpus.pages[55].indices]];
    for (const [name, exponent, opposite] of [
      ['public449', PUBLIC_EXPONENT, PRIVATE_EXPONENT],
      ['private283504449', PRIVATE_EXPONENT, PUBLIC_EXPONENT]
    ]) {
      for (const reversed of [false, true]) {
        const computed = segments.map(s => transformSegment(s, exponent, reversed));
        const output = computed.flatMap(s => s.output);
        for (let i = 0; i < segments.length; i++) {
          assert.deepEqual(
            transformSegment(computed[i].output, opposite, reversed).output,
            segments[i]
          );
        }
        const count = computed.reduce((acc, s) => acc + s.blocks, 0);
        const steps = computed.reduce((acc, s) => acc + s.walks, 0);
        console.log(
          scope.padEnd(8),
          name.padEnd(16),
          reversed ? 'reverse' : 'forward',
          'symbols=' + output.length,
          'blocks=' + count,
          'walks/block=' + (steps / count).toFixed(3),
          'IoC=' + coincidence(output).toFixed(9)
        );
      }
    }
  }
}

function checkSevenRunePacketObstruction() {
  const ciphertext = [...corpus.pages[54].indices, ...corpus.pages[55].indices];
  assert.equal(ciphertext.length % 7, 0);
  assert.equal(29n ** 6n < MODULUS, true);
  assert.equal(MODULUS < 29n ** 7n, true);
  for (const [reversed, expected] of [
    [false, [22, 25, 36, 39]],
    [true, [1, 5, 9, 27]]
  ]) {
    const valid = [];
    for (let i = 0; i < ciphertext.length; i += 7) {
      const block = ciphertext.slice(i, i + 7);
      if (toInteger(reversed ? block.reverse() : block) < MODULUS) {
        valid.push(i / 7);
      }
    }
    assert.deepEqual(valid, expected);
    console.log(
      'Seven-rune canonical packet direction=' + (reversed ? 'reversed' : 'printed') +
      ': ' + valid.length + '/' + (ciphertext.length / 7) +
      ' original blocks lie below the historical modulus.'
    );
  }
}

function main() {
  assert.equal(MODULUS, 1595277641n);
  assert.equal(PHI, 1591168720n);
  assert.equal(PUBLIC_EXPONENT * PRIVATE_EXPONENT % PHI, 1n);
  assert.equal(DOMAIN, 594823321n);
  const unknown = readSource();
  checkNativePositive();
  checkOriginal(unknown);
  checkSevenRunePacketObstruction();
  console.log('All PARABLE-derived RSA original-input tests passed; no plaintext claimed.');
}

main();
