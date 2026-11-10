'use strict';

/**
 * Source-frozen p53 and 32x8 printed-grid bridge SFT.
 * Reads the actual original-index corpus and ink annotations.
 * All AES keys and pair layouts are determined without fitting ciphertext.
 * Run: node sims/p53_red256_black128_source_gate.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const annotations = require('../resources/liber-primus/lp2-ink-annotations.json');
const gridSource = require('../resources/liber-primus/lp2-grid-256.json');

const page = corpus.pages.find((p) => p.page === 53);
const ink = annotations.pages.find((p) => p.page === 53);
const sourceBytes = Buffer.from(gridSource.bytes);
assert.equal(page.indices.length, 179);
assert.equal(sourceBytes.length, 256);
assert.equal(crypto.createHash('sha256').update(sourceBytes).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const black = page.indices.slice(0, 128);
const red = ink.red_spans.flatMap((s) => page.indices.slice(s.start, s.start + s.length));
assert.equal(red.length, 51);
assert.equal(ink.red_spans.length, 1);
assert.equal(ink.red_spans[0].start, 128);
assert.equal(ink.red_spans[0].length, 51);

/** @param {bigint} n */
function toKey(n) {
  const hex = n.toString(16);
  assert.ok(hex.length <= 64);
  return Buffer.from(hex.padStart(64, '0'), 'hex');
}

/** @param {bigint} a @param {bigint} b */
function gcd(a, b) {
  while (b !== 0n) {
    const r = a % b;
    a = b;
    b = r;
  }
  return a;
}

const R = red.reduce((v, d) => v * 29n + BigInt(d), 0n);
const fiveBits = red.reduce((v, d) => (v << 5n) | BigInt(d), 0n);
const gridNumber = BigInt('0x' + sourceBytes.toString('hex'));
assert.equal(R % 179n, 0n);
assert.equal(gcd(R, gridNumber), 358n);
assert.equal(toKey(R).toString('hex'),
  '007ac264d43a93abc971be69a2ae06cfc8e3a5af0d33a21257a73beddb6589d6');
assert.equal(toKey(fiveBits).toString('hex'),
  '41a763cf16092832c9bbec585332ea339bc2d04136eba8cc064ca8b8e05091a9');

const keys = [
  ['GP29 red integer', toKey(R)],
  ['GP29 red integer divided by 179', toKey(R / 179n)],
  ['51 zero-padded five-bit symbols', toKey(fiveBits)]
];
const orders = [
  ['row-major', sourceBytes],
  ['column-major', Buffer.from(Array.from({ length: 256 },
    (_, i) => sourceBytes[(i % 32) * 8 + Math.floor(i / 32)]))]
];
const modes = ['ecb', 'cbc', 'ctr'];

/** @param {Buffer} key @param {Buffer} bytes @param {string} mode */
function decode(key, bytes, mode) {
  const iv = mode === 'ecb' ? null : Buffer.alloc(16);
  const d = crypto.createDecipheriv('aes-256-' + mode, key, iv);
  d.setAutoPadding(false);
  const plain = Buffer.concat([d.update(bytes), d.final()]);
  const e = crypto.createCipheriv('aes-256-' + mode, key, iv);
  e.setAutoPadding(false);
  assert.deepEqual(Buffer.concat([e.update(plain), e.final()]), bytes);
  return plain;
}

/** @param {Buffer} bytes */
function printableCount(bytes) {
  let n = 0;
  for (const b of bytes) if ((b >= 32 && b <= 126) || b === 9 || b === 10 || b === 13) n++;
  return n;
}

const aes = [];
for (const [keyName, key] of keys) {
  for (const [orderName, bytes] of orders) {
    for (const mode of modes) {
      const plain = decode(key, bytes, mode);
      aes.push({
        key: keyName, order: orderName, mode,
        printable: printableCount(plain),
        prefix: plain.subarray(0, 16).toString('hex')
      });
    }
  }
}
const aesObserved = Math.max(...aes.map((x) => x.printable));
let aesExceed = 0;
const aesNull = [];
for (let trial = 0; trial < 2000; trial++) {
  let best = 0;
  for (let k = 0; k < 3; k++) {
    const wrong = crypto.createHash('sha256').update(
      'lp2-p53-AES-negative-' + trial + '-' + k).digest();
    for (const [, bytes] of orders) {
      for (const mode of modes) {
        best = Math.max(best, printableCount(decode(wrong, bytes, mode)));
      }
    }
  }
  aesNull.push(best);
  if (best >= aesObserved) aesExceed++;
}

/** @param {number} n */
function mod29(n) {
  const r = n % 29;
  return r < 0 ? r + 29 : r;
}
const layouts = [];
for (const [orderName, bytes] of orders) {
  for (const pairing of ['adjacent', 'opposite-halves']) {
    const pairs = Array.from({ length: 128 }, (_, i) =>
      pairing === 'adjacent' ? [bytes[2 * i], bytes[2 * i + 1]]
        : [bytes[i], bytes[i + 128]]);
    const previous = new Map();
    let repeated = 0;
    let conflicting = 0;
    for (let i = 0; i < pairs.length; i++) {
      const id = pairs[i].join(',');
      if (previous.has(id)) {
        repeated++;
        if (previous.get(id) !== black[i]) conflicting++;
      } else {
        previous.set(id, black[i]);
      }
    }
    const matches = {
      base256: pairs.filter(([a, b], i) => mod29(256 * a + b) === black[i]).length,
      sum: pairs.filter(([a, b], i) => mod29(a + b) === black[i]).length,
      difference: pairs.filter(([a, b], i) => mod29(a - b) === black[i]).length,
      xor: pairs.filter(([a, b], i) => mod29(a ^ b) === black[i]).length
    };
    layouts.push({
      order: orderName, pairing, pairs: pairs.map(([a, b]) => [a % 29, b % 29]),
      repeated, conflicting, matches
    });
  }
}

/** @param {number[]} target */
function bestAffine(target) {
  let best = 0;
  for (const layout of layouts) {
    for (let a = 0; a < 29; a++) {
      for (let b = 0; b < 29; b++) {
        const counts = new Uint16Array(29);
        for (let i = 0; i < 128; i++) {
          const [x, y] = layout.pairs[i];
          const c = mod29(target[i] - a * x - b * y);
          if (++counts[c] > best) best = counts[c];
        }
      }
    }
  }
  return best;
}

const affineObserved = bestAffine(black);
const plant = layouts[0].pairs.map(([x, y]) => mod29(17 * x + 4 * y + 9));
assert.equal(bestAffine(plant), 128);

let seed = 0x53179;
/** @returns {number} */
function rng() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}
let affineExceed = 0;
const affineNull = [];
for (let trial = 0; trial < 250; trial++) {
  const control = black.slice();
  for (let i = control.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [control[i], control[j]] = [control[j], control[i]];
  }
  const best = bestAffine(control);
  affineNull.push(best);
  if (best >= affineObserved) affineExceed++;
}

console.log(JSON.stringify({
  input: {
    page53Runes: page.indices.length, blackRunes: black.length,
    redRunes: red.length, printedGridBytes: sourceBytes.length,
    gcd: String(gcd(R, gridNumber))
  },
  aes: {
    tested: aes.length,
    maxPrintableBytes: aesObserved,
    maxPrintableFraction: aesObserved / 256,
    best: aes.filter((x) => x.printable === aesObserved),
    matchedWrongKeyControls: aesNull.length,
    wrongKeyFamilyUpperTail: (aesExceed + 1) / (aesNull.length + 1),
    wrongKeyFamilyExceedances: aesExceed
  },
  affine: {
    testedLayouts: layouts.map(({ order, pairing, repeated, conflicting, matches }) =>
      ({ order, pairing, repeated, conflicting, matches })),
    bestAllSecretMatch: affineObserved, sourceNativePlant: bestAffine(plant),
    sourceMultisetControls: affineNull.length,
    sourceMultisetExceedances: affineExceed,
    familyUpperTail: (affineExceed + 1) / (affineNull.length + 1)
  }
}, null, 2));
