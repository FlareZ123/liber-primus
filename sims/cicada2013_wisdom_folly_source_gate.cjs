'use strict';

/**
 * Exact 2013 Cicada OS wisdom/folly binary source as a hypothetical
 * key for the original unsolved LP2 corpus.
 *
 * Run: node sims/cicada2013_wisdom_folly_source_gate.cjs
 * Source: resources/historical/cicada2013-wisdom-folly.b64
 * No original plaintext or true key is claimed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const key = Buffer.from(read('resources/historical/cicada2013-wisdom-folly.b64').replace(/\s/g, ''), 'base64');
assert.equal(key.length, 3368);
const blobHeader = Buffer.from('blob ' + key.length + '\0');
assert.equal(crypto.createHash('sha1')
  .update(Buffer.concat([blobHeader, key])).digest('hex'),
  '62b1b949a1e4e4a346e75b1c34101000d3c53220');

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const sourcePages = corpus.pages.filter(p => p.status === 'unsolved');
const pages = sourcePages.map(p => p.indices);
const sourceCipher = pages.flat();
assert.equal(pages.length, 55); // physical p50 has no runes
assert.equal(sourceCipher.length, 12956);
const native = corpus.pages.find(p => p.page === 56).indices;
assert.equal(native.length, 85);
/** @param {number} x @param {number} m */
const mod = (x, m) => (x % m + m) % m;
/** @param {number[]} x @param {number} width */
function ioc(x, width) {
  const f = Array(width).fill(0);
  for (const k of x) f[k]++;
  return f.reduce((s, k) => s + k * (k - 1), 0) / (x.length * (x.length - 1));
}
/** @param {number} v @param {number} n @param {string} reduction */
function scaled(v, n, reduction) {
  return reduction === 'mod' ? v % n : Math.floor(v * n / 256);
}
/** @param {number} global @param {number} local @param {string} clock */
function byte(global, local, clock) {
  return key[(clock === 'page' ? local : global) % key.length];
}
/** @param {number[][]} input @param {number} sign @param {string} reduction @param {string} clock */
function gp29(input, sign, reduction, clock) {
  let offset = 0;
  const out = [];
  for (const src of input) {
    out.push(src.map((x, i) => mod(x + sign * scaled(
      byte(offset + i, i, clock), 29, reduction), 29)));
    offset += src.length;
  }
  return out;
}
const pow15 = Array(28).fill(1), log15 = Array(29).fill(-1);
for (let i = 0; i < 28; i++) {
  if (i) pow15[i] = pow15[i - 1] * 15 % 29;
  log15[pow15[i]] = i;
}
assert.equal(new Set(pow15).size, 28);

/**
 * Exact source-key lossless predecessor-difference model.
 * First page rune is a standalone IV, and equal ciphertext outputs
 * expose index28 as a transparent non-consuming rune.
 * @param {number[][]} input
 * @param {'sorted'|'log15'} codec
 * @param {number} sign
 * @param {string} reduction
 * @param {string} clock
 */
function gp28decode(input, codec, sign, reduction, clock) {
  let offset = 0;
  const out = [];
  for (const page of input) {
    const decoded = [];
    for (let i = 0; i < page.length; i++) {
      const k = scaled(byte(offset + i, i, clock), 28, reduction);
      if (i === 0) decoded.push(mod(page[i] + sign * k, 29));
      else {
        const d = mod(page[i] - page[i - 1], 29);
        decoded.push(d === 0 ? 28
          : mod((codec === 'sorted' ? d - 1 : log15[d]) + sign * k, 28));
      }
    }
    offset += page.length;
    out.push(decoded);
  }
  return out;
}
/** @param {number[][]} input @param {'sorted'|'log15'} codec @param {number} sign @param {string} reduction @param {string} clock */
function gp28encode(input, codec, sign, reduction, clock) {
  let offset = 0;
  const out = [];
  for (const page of input) {
    const encrypted = [];
    for (let i = 0; i < page.length; i++) {
      const k = scaled(byte(offset + i, i, clock), 28, reduction);
      if (i === 0) encrypted.push(mod(page[i] - sign * k, 29));
      else if (page[i] === 28) encrypted.push(encrypted[i - 1]);
      else {
        const rank = mod(page[i] - sign * k, 28);
        encrypted.push(mod(encrypted[i - 1] + (codec === 'sorted'
          ? rank + 1 : pow15[rank]), 29));
      }
    }
    offset += page.length;
    out.push(encrypted);
  }
  return out;
}

const variants = [];
const localVariants = [];
/** @param {number[][]} decoded @param {string} family @param {string} clock @param {string} reduction @param {number} sign */
function recordLocal(decoded, family, clock, reduction, sign) {
  for (let i = 0; i < decoded.length; i++) {
    if (decoded[i].length < 140) continue;
    localVariants.push({page: sourcePages[i].page,
      length: decoded[i].length, family, clock, reduction, sign,
      ioc: ioc(decoded[i], 29)});
  }
}
for (const clock of ['book', 'page'])
  for (const reduction of ['mod', 'scale'])
    for (const sign of [-1, 1]) {
      const decoded = gp29(pages, sign, reduction, clock);
      assert.deepEqual(gp29(decoded, -sign, reduction, clock), pages);
      const planted = gp29([native], -sign, reduction, clock);
      assert.deepEqual(gp29(planted, sign, reduction, clock), [native]);
      recordLocal(decoded, 'GP29 additive', clock, reduction, sign);
      variants.push({family: 'GP29 additive', clock, reduction, sign,
        ioc: ioc(decoded.flat(), 29)});
    }

for (const codec of ['sorted', 'log15'])
  for (const clock of ['book', 'page'])
    for (const reduction of ['mod', 'scale'])
      for (const sign of [-1, 1]) {
        const decoded = gp28decode(pages, codec, sign, reduction, clock);
        assert.deepEqual(gp28encode(decoded, codec, sign, reduction, clock), pages);
        const plantPlain = native.slice();
        for (const i of [10, 30, 55]) plantPlain[i] = 28;
        const planted = gp28encode([plantPlain], codec, sign, reduction, clock);
        assert.deepEqual(gp28decode(planted, codec, sign, reduction, clock),
          [plantPlain]);
        recordLocal(decoded, 'GP28 ' + codec, clock, reduction, sign);
        variants.push({family: 'GP28 ' + codec, clock, reduction, sign,
          ioc: ioc(decoded.flat(), 29)});
      }

assert.equal(variants.length, 24);
const sorted = variants.slice().sort((a, b) => b.ioc - a.ioc);
localVariants.sort((a,b) => b.ioc - a.ioc);
const firstThree = localVariants.filter(v => v.page <= 2);
assert.ok(sorted[0].ioc < 0.038);
assert.ok(localVariants[0].ioc < 0.045);
assert.ok(firstThree[0].ioc < 0.040);
const hist = Array(256).fill(0);
for (const v of key) hist[v]++;
const entropy = hist.reduce((h, n) => n
  ? h - (n / key.length) * Math.log2(n / key.length) : h, 0);
assert.ok(Math.abs(entropy - 7.937666443515688) < 1e-10);
console.log(JSON.stringify({
  sourceGitBlobSha: '62b1b949a1e4e4a346e75b1c34101000d3c53220',
  sourceLength: key.length,
  sourceSha256: crypto.createHash('sha256').update(key).digest('hex'),
  sourceEntropy: entropy,
  originalLength: sourceCipher.length,
  originalIoc: ioc(sourceCipher, 29),
  testedSourceKeyInverses: variants.length,
  bestOriginalDecodedIoc: sorted[0].ioc,
  topSeven: sorted.slice(0, 7),
  strongestLocalPage: localVariants[0],
  firstThreeBest: firstThree[0],
  localPageComparisons: localVariants.length,
  allVariants: variants,
  positiveControl: 'Solved-page56 native-GP hidden-key plants exact across all 24 variants.',
  interpretation: 'No coherent original plaintext or supported key recovered. ' +
    'Reject only cyclic direct byte-pad additive GP29 and transparent-repeat ' +
    'GP28 rank families with the declared two byte reductions and two clocks.'
}, null, 2));
