'use strict';

/**
 * Independent source-typed, source-original AES-128-CTR receiver decision.
 * The visible p50 left-petal stem gap read clockwise = 22; right = 31.
 * Their difference 9 produces the 16 fixed-point-free reflected source
 * row pairs [22-9*i,31+9*i] mod32, one per flower page p40..p55.
 * Use each exact 16-byte record once as its page's AES-128 key.
 *
 * This intentionally tests ONE zero-IV AES-CTR + GP transport receiver.
 * The source does not say AES, CTR, all-zero IV, or which rune transport.
 * Perfect bijective reencryption proves implementation only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} file */
const load = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const grid = load('resources/liber-primus/base60-grid.json');
const corpus = load('resources/liber-primus/lp2-corpus.json');
const rows = grid.byte_rows.map((xs) => Buffer.from(xs));
assert.equal(rows.length, 32);
assert(rows.every((xs) => xs.length === 8));
assert.deepEqual(grid.page_row_counts, [10, 13, 9]);
assert.equal(crypto.createHash('sha256').update(Buffer.concat(rows)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.equal(corpus.pages.length, 58);

const pair = (i) => [(22 - 9 * i % 32 + 32) % 32, (31 + 9 * i) % 32];
const pairs = Array.from({ length: 16 }, (_, i) => pair(i));
assert.deepEqual(pairs[0], [22, 31]);
assert.deepEqual(pairs[15], [15, 6]);
assert.equal(new Set(pairs.flat()).size, 32);
assert(pairs.every(([a, b]) => (a + b) % 32 === 21));

/** @param {Buffer} key @param {number} n */
function stream(key, n) {
  const aes = crypto.createCipheriv('aes-128-ctr', key, Buffer.alloc(16));
  return Buffer.concat([aes.update(Buffer.alloc(n)), aes.final()]);
}

/** GP29 additive direct, or source-p56-inspired literal-F GP28 ring.
 * @param {number[]} input @param {Buffer} keystream
 * @param {1|-1} sign @param {'gp29'|'gp28-f-literal'} model
 * @returns {number[]}
 */
function convert(input, keystream, sign, model) {
  let p = 0;
  return input.map((x) => {
    if (model === 'gp28-f-literal' && x === 0) return 0;
    const m = model === 'gp29' ? 29 : 28;
    const origin = model === 'gp29' ? x : x - 1;
    const y = (((origin + sign * (keystream[p++] % m)) % m) + m) % m;
    return model === 'gp29' ? y : y + 1;
  });
}

/** @param {number[]} values */
function ioc(values) {
  const hist = Array(29).fill(0);
  for (const x of values) {
    assert(Number.isInteger(x) && x >= 0 && x < 29);
    hist[x]++;
  }
  const n = values.length;
  return n < 2 ? 0 : hist.reduce((s, h) => s + h * (h - 1), 0) / (n * (n - 1));
}

const pageKeys = pairs.map(([a, b]) => Buffer.concat([rows[a], rows[b]]));
assert.equal(new Set(pageKeys.map((k) => k.toString('hex'))).size, 16);
assert.equal(pageKeys[0].toString('hex'), 'eb83a6af9028a751719eace6b424bd50');
const originals = Array.from({ length: 16 }, (_, i) => corpus.pages[i + 40].indices);
assert.equal(originals[10].length, 0, 'Physical p50 is rune-free');
assert.equal(originals.reduce((s, a) => s + a.length, 0), 3316);

/** Generate a solved/native-GP control without using source cipher symbols.
 * Solved p57 is printed clear rune text, so its exact indices are native GP.
 */
const known = corpus.pages[57].indices;
assert.equal(known.length, 95);
const native = originals.map((values, i) =>
  Array.from({ length: values.length }, (_, j) => known[(j + 17 * i) % known.length]));
const variants = [];

for (const model of ['gp29', 'gp28-f-literal']) {
  for (const sign of [-1, 1]) {
    const decoded = [];
    const planted = [];
    for (let i = 0; i < 16; i++) {
      const original = originals[i];
      const key = pageKeys[i];
      const ks = stream(key, original.length);
      const out = convert(original, ks, sign, model);
      // The reverse operation is exact for every original symbol, including F.
      assert.deepEqual(convert(out, ks, -sign, model), original,
        'Exact original reencryption failed p' + (i + 40));
      decoded.push(out);
      const sourceNative = native[i];
      const nativeKs = stream(key, sourceNative.length);
      const plantedC = convert(sourceNative, nativeKs, -sign, model);
      assert.deepEqual(convert(plantedC, nativeKs, sign, model), sourceNative);
      planted.push(convert(plantedC, nativeKs, sign, model));
    }
    const first = decoded.slice(0, 14).flat();
    const heldout = decoded.slice(14).flat();
    const entire = decoded.flat();
    const plantedFull = planted.flat();
    assert.equal(first.length, 3008);
    assert.equal(heldout.length, 308);
    assert.equal(entire.length, 3316);
    assert.deepEqual(plantedFull, native.flat());
    const result = {
      model, sign, earlyIoC: ioc(first), holdoutIoC: ioc(heldout),
      fullIoC: ioc(entire), nativeIoC: ioc(plantedFull),
      originalP40First40: decoded[0].slice(0, 40).map((v) => corpus.translit[v]).join(' '),
    };
    variants.push(result);
    console.log(JSON.stringify(result));
  }
}
assert(variants.every((v) => v.fullIoC < 0.046));
assert(variants.every((v) => v.nativeIoC > 0.050));
console.log('PASS one source-22/31 reflection AES128-CTR original receiver, four GP ring/sign variants, all3316 runes; source-native solved-p57 plants and exact reencryption');
