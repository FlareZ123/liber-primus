'use strict';

/**
 * Agent46, 28 Nov 2026.
 * Frozen original-input test of the direct p50 K=2 column as an additive
 * 32-state pad on the independently identified p40 PATHS page.
 *
 * This is a SOURCE-MOTIVATED NEGATIVE, not a decryption.  There is no
 * authenticated instruction choosing column-as-key or byte modulo 29.
 * Run: node sims/lp2_p6_p50_kcolumn_p40_direct_receiver_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8').replace(/\r/g, '');
const c = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const g = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const native = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const source = read('resources/liber-primus/lp2-transcription.txt');
const M = x => ((x % 29) + 29) % 29;

const red6 = ink.pages.find(p => p.page === 6).red_spans.find(s => s.start === 71);
assert.equal(red6.length, 11);
const title6 = source.split('%')[6].split('&')[1].trim().split(/[.⁘]/)[0];
const titleWords = title6.split('-').map(x => [...x].filter(ch => c.runes.includes(ch)).length);
assert.deepEqual(titleWords, [4, 1, 4, 2]);
assert.equal(titleWords.reduce((a,b)=>a+b,0), red6.length);
const H4 = a => [M(a[0] - a[3]), M(a[1] - a[2]),
                  M(a[1] + a[2]), M(a[0] + a[3])];
const h = H4(titleWords);
assert.deepEqual(h, [2, 26, 5, 6]); // [K,-e,g,a]
const K = h[0];
const p40 = c.pages.find(p => p.page === 40).indices;
assert.equal(p40.length, 231);
const red40 = ink.pages.find(p => p.page === 40).red_spans.find(s => s.start === 0);
assert.equal(red40.length, 8);
const bodyStart = red40.length;
const body = p40.slice(bodyStart);
assert.equal(body.length, 223);
assert.deepEqual(p40.slice(71, 75), [4,15,14,21]);
const expectedPaths = [13,24,2,15]; // canonical GP29 PATHS, published prior
const tokens = g.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
assert.equal(g.alphabet.length, 60);
assert.equal(K, 2);
assert.equal(tokens[23 * 8 + K], '0J');
assert.equal(tokens[2 * 8 + K], '0F');
assert.equal(tokens[26 * 8 + K], '06');

const alphabet59 = g.alphabet.replace('f', '');
assert.equal(alphabet59.length, 59);
const byte = (token, alphabet) => {
  assert.equal(token.length, 2);
  const a = alphabet.indexOf(token[0]);
  const b = alphabet.indexOf(token[1]);
  assert.ok(a >= 0 && b >= 0);
  return a * alphabet.length + b;
};
const column = Array.from({length: 32}, (_, row) => tokens[row * 8 + K]);
const ioc = values => {
  const freq = Array(29).fill(0);
  values.forEach(x => { assert.ok(Number.isInteger(x) && x >= 0 && x < 29); freq[x]++; });
  return freq.reduce((sum,x)=>sum + x*(x-1),0)/(values.length*(values.length-1));
};
const nativeIndex = new Map(c.runes.map((r,i) => [r,i]));
const nativeTape = native.sections.flatMap(s =>
  [...s.source_text].map(ch => nativeIndex.get(ch)).filter(v => v !== undefined)
);
assert.equal(nativeTape.length, 2979);
const windows = [];
for (let pos = 0; pos + body.length <= nativeTape.length; pos += 31) {
  windows.push(ioc(nativeTape.slice(pos, pos + body.length)));
}
assert.equal(windows.length, 89);
const nativeMin = Math.min(...windows);
assert.ok(nativeMin > 0.05445 && nativeMin < 0.05447);

const cases = [];
for (const [codec, alphabet] of [['base60', g.alphabet], ['base59', alphabet59]]) {
  const forward = column.map(token => M(byte(token, alphabet)));
  for (const orientation of ['top-down', 'bottom-up']) {
    const key = orientation === 'top-down' ? forward : forward.slice().reverse();
    // No fitted phase, no skip, no word reset, no plaintext crib.
    const plain = body.map((cv, i) => M(cv - key[i % 32]));
    assert.deepEqual(plain.map((pv, i) => M(pv + key[i % 32])), body);

    // The original signed source selects PATHS / physical p40.  At original
    // offset71, the source-selected direct column key predicts an explicit
    // four-rune output; none equals the candidate canonical PATHS.
    const targetOffset = 71 - bodyStart;
    const target = plain.slice(targetOffset, targetOffset + 4);
    assert.equal(target.length, 4);
    assert.notDeepEqual(target, expectedPaths);

    // The exact SAME 32-rune key must recover independent solved text when
    // used for both forward encryption and blind inverse.
    const control = nativeTape.slice(400, 400 + body.length);
    const encrypted = control.map((v,i)=>M(v + key[i%32]));
    assert.deepEqual(encrypted.map((v,i)=>M(v - key[i%32])), control);
    cases.push({
      codec, orientation, key, ioc: ioc(plain),
      target, targetTranslit: target.map(x => c.translit[x]).join(''),
      first32: plain.slice(0,32).map(x => c.translit[x]).join(' '),
      outputSize: plain.length
    });
  }
}
assert.equal(cases.length, 4);
assert.ok(cases.every(x => x.ioc < nativeMin));
assert.ok(cases.every(x => x.target.join(',') !== expectedPaths.join(',')));

console.log(JSON.stringify({
  status: 'PASS BOUNDED NEGATIVE: direct p50 K-column GP29 pad does not recover p40',
  claim: 'not an exclusion of nonlinear/stateful table use, F bypass or another key clock',
  source: {titleWords, H4: h, K, bodyStart, fullPage40: p40.length,
           bodyLength: body.length, targetOffset:71, ciphertextPATHS:p40.slice(71,75),
           expectedPATHS:expectedPaths},
  originalIoc: ioc(body), nativeWindowIoc: {
    length:body.length, count:windows.length,
    min:nativeMin, median:windows.slice().sort((a,b)=>a-b)[Math.floor(windows.length/2)],
    max:Math.max(...windows)
  }, cases
}, null, 2));