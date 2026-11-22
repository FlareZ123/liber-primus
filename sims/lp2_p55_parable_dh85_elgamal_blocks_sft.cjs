'use strict';

/**
 * A complete candidate p55 source-DH ElGamal block decoder and positive,
 * answering whether 76 original p55 GP29 runes can be 19 four-rune
 * ciphertext pairs in GF(1259)* with authenticated PARABLE parameters.
 * Windows Node22 SFT. From repository root:
 * node sims/lp2_p55_parable_dh85_elgamal_blocks_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.resolve(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const p55 = corpus.pages.find((entry) => entry.page === 55).indices;
const p57 = corpus.pages.find((entry) => entry.page === 57).indices;
assert.deepEqual([p55.length, p57.length], [76, 95]);
const P = 1259, G = 1031, PRIVATE = 85, PUBLIC = 1229, ORDER = 629, RADIX = 29;

/**
 * @param {number} base
 * @param {number} exponent
 * @returns {number}
 */
function powMod(base, exponent) {
  let result = 1;
  for (let x = base; exponent > 0; exponent = Math.floor(exponent / 2), x = x * x % P) {
    if (exponent % 2 === 1) result = result * x % P;
  }
  return result;
}
assert.equal(powMod(G, PRIVATE), PUBLIC);
assert.equal(powMod(G, ORDER), 1);
assert.notEqual(powMod(G, 1), 1);

/** @param {number} v @returns {number} */
function inverse(v) {
  assert.ok(v > 0 && v < P);
  return powMod(v, P - 2);
}

/**
 * @param {number[]} pair
 * @param {boolean} reversed
 * @returns {number}
 */
function pack(pair, reversed) {
  assert.equal(pair.length, 2);
  return reversed ? pair[1] * RADIX + pair[0] : pair[0] * RADIX + pair[1];
}

/**
 * @param {number} n
 * @param {boolean} reversed
 * @returns {number[]}
 */
function unpack(n, reversed) {
  assert.ok(n >= 0 && n < RADIX ** 2);
  const x = [Math.floor(n / RADIX), n % RADIX];
  return reversed ? x.reverse() : x;
}

/**
 * @param {number[]} source 76 GP29 original ciphertext runes
 * @param {boolean} reversed Pair-local digit order
 * @param {boolean} switchFields Swap the two base29 fields in each quadruple.
 * @returns {{eligible:number,printable:number,zero:number,allValid:boolean,runes:number[],reasons:string[]}}
 */
function decode(source, reversed, switchFields) {
  assert.equal(source.length, 76);
  let eligible = 0, printable = 0, zero = 0;
  const runes = [], reasons = [];
  for (let index = 0; index < 19; index++) {
    const q = source.slice(4 * index, 4 * index + 4);
    const left = pack(q.slice(0, 2), reversed), right = pack(q.slice(2, 4), reversed);
    const c1 = switchFields ? right : left, c2 = switchFields ? left : right;
    const validC1 = c1 > 0 && powMod(c1, ORDER) === 1;
    if (validC1) eligible++;
    else reasons.push(index + ':c1-out-of-G-subgroup');
    if (!c1 || !c2) zero++;
    const plain = c1 ? c2 * inverse(powMod(c1, PRIVATE)) % P : -1;
    if (plain >= 0 && plain < RADIX ** 2) {
      printable++;
      runes.push(...unpack(plain, reversed));
    } else {
      // Sentinel outside original GP29 range for unrepresentable field output.
      runes.push(-1, -1);
      reasons.push(index + ':m-exceeds-base29-pair-range');
    }
  }
  return { eligible, printable, zero, allValid: eligible === 19 && printable === 19,
    runes, reasons };
}

// All four frozen source-geometry reading conventions. No fitted blocks,
// word segmentation, secret exponents, language score or arbitrary start.
const matrix = [];
for (const [name, reversed] of [['big', false], ['little', true]]) {
  for (const [role, switched] of [['c1c2', false], ['c2c1', true]]) {
    const decoded = decode(p55, reversed, switched);
    matrix.push({ name, role, eligible: decoded.eligible,
      printable: decoded.printable, nonzeroFields: 19 - decoded.zero,
      fullyValid: decoded.allValid,
      opening: decoded.runes.slice(0, 16)
        .map((v) => v < 0 ? '?' : corpus.translit[v]).join('') });
    console.log('ORIGINAL', JSON.stringify(matrix.at(-1)));
  }
}
assert.deepEqual(matrix.map((r) => r.eligible), [8, 8, 12, 9]);
assert.deepEqual(matrix.map((r) => r.printable), [13, 14, 14, 11]);
assert.ok(matrix.every((r) => !r.fullyValid));

/** @param {number} m @returns {[number,number]} */
function encryptElGamal(m) {
  for (let nonce = 1; nonce < ORDER; nonce++) {
    const c1 = powMod(G, nonce), c2 = m * powMod(PUBLIC, nonce) % P;
    if (c1 > 0 && c1 < RADIX ** 2 && c2 > 0 && c2 < RADIX ** 2) {
      return [c1, c2];
    }
  }
  throw Error('No source-compatible ElGamal nonce for plaintext field ' + m);
}

// Source-native positive: 19 2-rune GP29 source chunks from original solved
// p57, 19 deterministic ElGamal ciphertext pairs -> exactly 76 GP29 runes,
// then identical original decoder reconstructs all 38 clear runes.
const clear38 = p57.slice(0, 38);
const coded76 = [];
for (let i = 0; i < 19; i++) {
  const message = pack(clear38.slice(2 * i, 2 * i + 2), false);
  const [c1, c2] = encryptElGamal(message);
  coded76.push(...unpack(c1, false), ...unpack(c2, false));
}
assert.equal(coded76.length, 76);
const control = decode(coded76, false, false);
assert.ok(control.allValid);
assert.deepEqual(control.runes, clear38);
console.log('POSITIVE: ElGamal public source group encrypts and recovers all 38 actual p57 native GP29 runes from a source-sized 76-rune cipher.');
console.log('PASS: all four fixed original p55 quartet interpretations violate original source-DH subgroup membership and/or GP29 field output range; no new plaintext.');
