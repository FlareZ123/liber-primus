'use strict';

/**
 * SFT: original 32x8 LP2 numeral table as 32 TEA/XTEA 64-bit round states.
 * Source geometry: 10 rows p49 + 13 rows p50 + 9 rows p51.
 * Original data: resources/liber-primus/base60-grid.json (printed tokens).
 * The proposed round-state semantics are a deliberately narrow hypothesis.
 *
 * Run with Node.js 22. No dependencies, guessed key, or mutable corpus input.
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json'),
  'utf8'
));
const U = x => x >>> 0;
const DELTA = 0x9e3779b9;
const ALPHABET60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const HASH60 = '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290';

function byteRows(radix) {
  const alphabet = radix === 60 ? ALPHABET60 : ALPHABET60.replace('f', '');
  assert.equal(alphabet.length, radix);
  return source.rows.map(row => row.map(token => {
    assert.equal(token.length, 2);
    const a = alphabet.indexOf(token[0]);
    const b = alphabet.indexOf(token[1]);
    assert(a >= 0 && b >= 0);
    const v = a * radix + b;
    assert(v >= 0 && v <= 255);
    return v;
  }));
}

function wordRows(bytes, endian, swapped) {
  return bytes.map(row => {
    const halves = [0, 4].map(offset => {
      const group = row.slice(offset, offset + 4);
      if (endian === 'LE') group.reverse();
      return group.reduce((acc, value) => U((acc << 8) | value), 0);
    });
    return swapped ? halves.reverse() : halves;
  });
}

/**
 * TEA full cycle:
 * sum+=DELTA;
 * v0 += ((v1<<4)+k0) ^ (v1+sum) ^ ((v1>>>5)+k1);
 * v1 += ((v0<<4)+k2) ^ (v0+sum) ^ ((v0>>>5)+k3);
 *
 * Low bit of unsigned addition is XOR, and (v<<4)&1 is zero. Thus
 * (change0 ^ (v1+sum) ^ (v1>>>5))&1 equals (k0^k1)&1,
 * identically for each transition with the SAME 128-bit key.
 * The v1 equation similarly yields (k2^k3)&1.
 * This is an exact all-secret necessary condition.
 */
function teaInvariant(rows, offset = 0) {
  const left = [], right = [];
  for (let t = 0; t < rows.length - 1; t++) {
    const [v0, v1] = rows[t];
    const [w0, w1] = rows[t + 1];
    const sum = U(Math.imul(t + offset + 1, DELTA));
    left.push((U(w0 - v0) ^ U(v1 + sum) ^ (v1 >>> 5)) & 1);
    right.push((U(w1 - v1) ^ U(w0 + sum) ^ (w0 >>> 5)) & 1);
  }
  const count = arr => [arr.filter(x => x === 0).length, arr.filter(x => x === 1).length];
  return {
    valid: left.every(x => x === left[0]) && right.every(x => x === right[0]),
    left: count(left),
    right: count(right)
  };
}

function f(x) {
  return U(U((x << 4) ^ (x >>> 5)) + x);
}

/**
 * XTEA full cycle:
 * v0+= F(v1) ^ (sum+k[sum&3]);
 * sum+=DELTA;
 * v1+= F(v0) ^ (sum+k[(sum>>>11)&3]);
 *
 * Each observed transition yields its required key word exactly,
 * independent of the other three key words. A global fixed key must
 * agree with every repeated observation of a key index.
 */
function xteaRecover(rows, offset = 0) {
  const key = [null, null, null, null];
  let seen = 0, agrees = 0, firstConflict = null;
  for (let t = 0; t < rows.length - 1; t++) {
    const [v0, v1] = rows[t];
    const [w0, w1] = rows[t + 1];
    const sum = U(Math.imul(t + offset, DELTA));
    const sum2 = U(sum + DELTA);
    const candidates = [
      [sum & 3, U((U(w0 - v0) ^ f(v1)) - sum)],
      [(sum2 >>> 11) & 3, U((U(w1 - v1) ^ f(w0)) - sum2)]
    ];
    for (const [index, value] of candidates) {
      seen++;
      if (key[index] === null) key[index] = value;
      if (key[index] === value) agrees++;
      else if (firstConflict === null) firstConflict = { transition: t, keyIndex: index };
    }
  }
  return { valid: firstConflict === null, agrees, seen, key, firstConflict };
}

function sampleTrace(cipher) {
  const key = [0x12345678, 0x90abcdef, 0xfedcba98, 0x10203040];
  let [v0, v1] = [0xdeadbeef, 0x2468ace0];
  let sum = 0;
  const trace = [[v0, v1]];
  for (let t = 0; t < 31; t++) {
    if (cipher === 'TEA') {
      sum = U(sum + DELTA);
      v0 = U(v0 + (U((v1 << 4) + key[0]) ^ U(v1 + sum) ^ U((v1 >>> 5) + key[1])));
      v1 = U(v1 + (U((v0 << 4) + key[2]) ^ U(v0 + sum) ^ U((v0 >>> 5) + key[3])));
    } else {
      v0 = U(v0 + (f(v1) ^ U(sum + key[sum & 3])));
      sum = U(sum + DELTA);
      v1 = U(v1 + (f(v0) ^ U(sum + key[(sum >>> 11) & 3])));
    }
    trace.push([v0, v1]);
  }
  return { key, trace };
}

function main() {
  assert.equal(source.rows.length, 32);
  assert(source.rows.every(row => row.length === 8));
  const b60 = byteRows(60).flat();
  assert.deepEqual(b60, source.byte_rows.flat());
  assert.equal(crypto.createHash('sha256').update(Buffer.from(b60)).digest('hex'), HASH60);

  const teaPlant = sampleTrace('TEA');
  const xteaPlant = sampleTrace('XTEA');
  assert(teaInvariant(teaPlant.trace).valid, 'TEA positive must pass');
  assert(xteaRecover(xteaPlant.trace).valid, 'XTEA positive must pass');
  assert.deepEqual(xteaRecover(xteaPlant.trace).key, xteaPlant.key, 'recover source-independent XTEA key');
  for (const [name, plant, check] of [
    ['TEA', teaPlant, teaInvariant],
    ['XTEA', xteaPlant, xteaRecover]
  ]) {
    const corrupted = plant.trace.map(row => row.slice());
    corrupted[9][0] ^= 1;
    assert(!check(corrupted).valid, name + ' tampered positive must fail');
  }

  const rows = [];
  for (const radix of [60, 59]) {
    for (const endian of ['BE', 'LE']) {
      for (const swapped of [false, true]) {
        for (const reverse of [false, true]) {
          for (const offset of [0, 1]) {
            const bytes = byteRows(radix);
            const arranged = (reverse ? bytes.reverse() : bytes);
            const candidate = wordRows(arranged, endian, swapped);
            const tea = teaInvariant(candidate, offset);
            const xtea = xteaRecover(candidate, offset);
            rows.push({
              radix, endian, swapped, reverse, offset,
              teaLeft: tea.left.join('/'), teaRight: tea.right.join('/'),
              teaValid: tea.valid, xteaAgrees: xtea.agrees,
              xteaSeen: xtea.seen, xteaValid: xtea.valid,
              xteaFirstConflict: xtea.firstConflict
            });
          }
        }
      }
    }
  }
  assert.equal(rows.length, 32);
  assert(rows.every(row => !row.teaValid && !row.xteaValid),
    'One complete original trace survived: investigate instead of declaring a negative');
  const minTEAContradictions = Math.min(...rows.map(row => {
    const [l0, l1] = row.teaLeft.split('/').map(Number);
    const [r0, r1] = row.teaRight.split('/').map(Number);
    return Math.min(l0, l1) + Math.min(r0, r1);
  }));
  assert(rows.every(row => row.xteaAgrees === 4 && row.xteaSeen === 62),
    'Unexpected repeated inferred XTEA key agreement on original source');
  console.log(JSON.stringify({
    source: 'original p49-p51, 32x8, sha256=' + HASH60,
    cases: rows.length,
    originalTEACompatible: rows.filter(row => row.teaValid).length,
    originalXTEACompatible: rows.filter(row => row.xteaValid).length,
    originalXTEAKeyAgreement: '4/62 observations (first observation for each of 4 key words only)',
    minTEABitContradictions: minTEAContradictions,
    syntheticTEA: 'PASS',
    syntheticXTEARecoveredKey: xteaPlant.key.map(k => k.toString(16)),
    bitFlipNegativeControls: 'PASS',
    details: rows
  }, null, 2));
}

if (require.main === module) main();
