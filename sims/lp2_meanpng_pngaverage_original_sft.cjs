'use strict';

/**
 * LP2 original PNG Average-filter hypothesis, frozen source-aligned grids.
 * Node 22, CommonJS, read-only and self-contained with checked-in resources.
 *
 * The conditional p50 fifth-column Bitcoin output begins "1Meanpng", which
 * suggests PNG Average rather than arbitrary two-dimensional transforms.
 * This is a hypothetical reader, NOT an authenticated Cicada opcode.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function load(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
}
const corpus = load('resources/liber-primus/lp2-corpus.json');
const ink = load('resources/liber-primus/lp2-ink-annotations.json');
const panel = load('resources/liber-primus/lp2-grid-256.json');
const byPage = new Map(corpus.pages.map(p => [p.page, p]));
const redSpans = new Map(ink.pages.map(p => [p.page, p.red_spans || []]));
const mod = (x, n) => ((x % n) + n) % n;

/**
 * Decode the literal PNG specification Average filter in a field of size M.
 * Standard PNG uses M=256; GP29 adaptation uses M=29. Left/up missing = 0.
 * The predictor uses already-reconstructed neighbors, not input ciphertext.
 */
function unfilter(cipher, width, modulus) {
  const clear = Array(cipher.length);
  for (let i = 0; i < cipher.length; i++) {
    const a = i % width ? clear[i - 1] : 0;
    const b = i >= width ? clear[i - width] : 0;
    const p = Math.floor((a + b) / 2);
    clear[i] = mod(cipher[i] + p, modulus);
  }
  return clear;
}
function filter(clear, width, modulus) {
  return clear.map((v, i) => {
    const a = i % width ? clear[i - 1] : 0;
    const b = i >= width ? clear[i - width] : 0;
    return mod(v - Math.floor((a + b) / 2), modulus);
  });
}
function ioc(a, alphabet = 29) {
  const f = Array(alphabet).fill(0);
  a.forEach(x => { assert(x >= 0 && x < alphabet); f[x]++; });
  return f.reduce((sum, n) => sum + n * (n - 1), 0) / (a.length * (a.length - 1));
}
function oneRuneTest(label, original, width) {
  const out = unfilter(original, width, 29);
  assert.deepEqual(filter(out, width, 29), original,
    label + ': exact original-cipher forward replay');
  return {
    label, width, runes: original.length,
    originalIoC: ioc(original), decodedIoC: ioc(out),
    decodedFirst40: out.slice(0, 40).map(i => corpus.translit[i]).join('-'),
    forwardReplay: true
  };
}

// First source object: unaltered physical p0-p2, 262+266+201=729=27^2.
const opening = [0, 1, 2].flatMap(p => byPage.get(p).indices);
assert.deepEqual([0, 1, 2].map(p => byPage.get(p).indices.length), [262, 266, 201]);
assert.equal(opening.length, 729);
const openResult = oneRuneTest('opening p0-p2 27x27', opening, 27);

// Second source object: physically original 16 flower pages; remove only
// the exact printed red spans. First p50 base60 token 3N=203 chooses width.
const floral = [];
for (let p = 40; p <= 55; p++) {
  const a = byPage.get(p).indices;
  const spans = redSpans.get(p) || [];
  a.forEach((v, offset) => {
    if (!spans.some(s => offset >= s.start && offset < s.start + s.length))
      floral.push(v);
  });
}
assert.equal(floral.length, 3248);
const panelBytes = panel.bytes || panel.pages.flatMap(p => p.bytes);
const panelTokens = panel.pages.flatMap(p => p.tokens);
assert.equal(panelTokens[0], '3N');
assert.equal(panelBytes[0], 203);
assert.equal(panelBytes.length, 256);
const floralResult = oneRuneTest('floral black 16x203', floral, 203);

// Independent, authentic native-GP *positive*: the known p57 source text.
// This tests encoder/decoder consistency without claiming original decryption.
const native = byPage.get(57).indices;
assert.equal(native.length, 95);
const nativeFiltered = filter(native, 27, 29);
assert.deepEqual(unfilter(nativeFiltered, 27, 29), native,
  'solved original p57 native-GP positive');
const nativeIoC = ioc(native);
assert.ok(nativeIoC > 0.06);
assert.ok(openResult.decodedIoC < 0.04);
assert.ok(floralResult.decodedIoC < 0.04);

// Third independent source object: unchanged p49-p51 32x8 byte panel.
// Here the literal PNG 8-bit predictor is unmodified, not GP29-adapted.
const byteOut = unfilter(panelBytes, 8, 256);
assert.deepEqual(filter(byteOut, 8, 256), panelBytes);
const printable = v => v >= 32 && v <= 126;
const byteResult = {
  label: 'p49-p51 byte panel 32x8', bytes: 256,
  sourcePrintable: panelBytes.filter(printable).length,
  averageUnfilteredPrintable: byteOut.filter(printable).length,
  first16Hex: byteOut.slice(0, 16).map(x => x.toString(16).padStart(2, '0')).join(''),
  forwardReplay: true
};
assert.deepEqual([byteResult.sourcePrintable, byteResult.averageUnfilteredPrintable],
  [103, 87]);
assert.equal(byteResult.first16Hex, 'cb4ccd20712590ffc17f420f3732185f');

console.log(JSON.stringify({
  status: 'PASS', source: 'original unmodified LP2 corpus, ink and numeric table',
  method: 'PNG Average unfilter: clear = filtered + floor((left+above)/2) mod M',
  opening: openResult, floral: floralResult, panel: byteResult,
  independentlySolvedP57IoC: nativeIoC,
  nativePositiveExact: true,
  conclusion: 'These exact source-fixed PNG Average inverses do not recover native GP prose or a recognizably typed panel payload. The Meanpng premise is conditional and unauthenticated.'
}, null, 2));
