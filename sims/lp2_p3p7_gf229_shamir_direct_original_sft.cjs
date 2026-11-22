'use strict';
/**
 * Original p3-p7 5 x 229 scroll, field GF(229) Shamir f(0) candidate.
 * Motivation: source five-page scroll, five dots, 1145 = 5*229, prime229.
 * Unlike previously tested GF29/GF256, this tests the *length prime* as field.
 * Direct plaintext only; a high-entropy 229-byte secret is still possible.
 * Node.js 22 CommonJS / Windows 11, read-only, no third-party dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const src = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(src, 'lp2-corpus.json'),'utf8'));
const scroll = corpus.pages.filter(p => p.page >= 3 && p.page <= 7)
  .flatMap(p => p.indices);
assert.deepEqual(corpus.pages.filter(p => p.page >= 3 && p.page <= 7)
  .map(p => p.indices.length), [217, 261, 263, 196, 208]);
assert.equal(scroll.length, 1145);
const F = 229;
/** @param {number} x @returns {number} */
const mod = x => ((x % F) + F) % F;
/** @param {number} x @returns {number} */
function invert(x) {
  for (let y = 1; y < F; y++) if (mod(x * y) === 1) return y;
  throw Error('zero denominator');
}
/**
 * Full interpolation at zero, with exact source ordered five-dot x registers.
 * @param {number[]} xs @returns {number[]}
 */
function weights(xs) {
  return xs.map((x, i) => xs.reduce((v, y, j) =>
    i === j ? v : mod(v * mod(-y) * invert(mod(x - y))), 1));
}
/**
 * @param {number[]} stream
 * @param {number[]} w
 * @param {'strips'|'interleaved'} layout
 * @returns {number[]}
 */
function extract(stream, w, layout) {
  const answer = [];
  for (let j = 0; j < 229; j++) {
    let value = 0;
    for (let i = 0; i < 5; i++) {
      const position = layout === 'strips' ? i * 229 + j : 5 * j + i;
      value += w[i] * stream[position];
    }
    answer.push(mod(value));
  }
  return answer;
}
const cases = [];
for (const [name, xs] of [
  ['horizontal-dot-ranks', [1, 2, 3, 4, 5]],
  ['vertical-dot-ranks', [3, 5, 1, 4, 2]]
]) for (const layout of ['strips', 'interleaved']) {
  const w = weights(xs);
  const wLastInverse = invert(w[4]);
  for (const feature of ['GP29-ordinal', 'GP-prime-value']) {
    const input = feature === 'GP29-ordinal' ?
      scroll : scroll.map(i => corpus.prime[i]);
    assert(input.every(v => v >= 0 && v < F));
    const result = extract(input, w, layout);
    const nativeRuneCount = result.filter(x => x < 29).length;
    const asciiPrintable = result.filter(x => x >= 32 && x <= 126).length;
    const upperASCII = result.filter(x => x >= 65 && x <= 90).length;
    const expected = {
      'horizontal-dot-ranks|strips|GP29-ordinal': [25,86,21],
      'horizontal-dot-ranks|strips|GP-prime-value': [26,90,20],
      'horizontal-dot-ranks|interleaved|GP29-ordinal': [30,96,35],
      'horizontal-dot-ranks|interleaved|GP-prime-value': [24,89,23],
      'vertical-dot-ranks|strips|GP29-ordinal': [29,92,33],
      'vertical-dot-ranks|strips|GP-prime-value': [30,109,34],
      'vertical-dot-ranks|interleaved|GP29-ordinal': [25,99,26],
      'vertical-dot-ranks|interleaved|GP-prime-value': [25,94,25]
    }[name + '|' + layout + '|' + feature];
    assert.deepEqual([nativeRuneCount,asciiPrintable,upperASCII],expected);
    assert.deepEqual(
      w, name === 'horizontal-dot-ranks' ?
      [5,219,10,224,1] : [10,1,5,224,219]);

    // Strong source-native positive: each target GP symbol of the known solved
    // p57 stream is encoded as five *source-register-legal* GP29 shares.
    // Four shares are sampled from 0..28; fifth is solved modulo229 and only
    // accepted when 0..28. All original geometry and length are retained.
    const native = corpus.pages.find(p => p.page === 57).indices;
    const target = Array.from({length:229},(_,j)=>native[j % native.length]);
    const planted = Array(1145).fill(0);
    let rng = 0x3301 + (name === 'vertical-dot-ranks' ? 113 : 0) +
      (layout === 'interleaved' ? 7 : 0);
    /** @returns {number} */
    function random() {
      rng ^= rng << 13;
      rng ^= rng >>> 17;
      rng ^= rng << 5;
      return rng >>> 0;
    }
    for (let j = 0; j < 229; j++) {
      let shared;
      do {
        const first = Array.from({length:4},()=>random() % 29);
        const last = mod((target[j] - first.reduce((v,y,i)=>
          v + w[i]*y,0)) * wLastInverse);
        if (last <= 28) shared = [...first,last];
      } while (!shared);
      for(let i=0;i<5;i++){
        const position=layout==='strips' ? i*229+j : 5*j+i;
        planted[position]=shared[i];
      }
    }
    assert(planted.every(v => v >= 0 && v < 29));
    assert.deepEqual(extract(planted,w,layout),target);
    cases.push({name,layout,feature, nativeRuneCount,asciiPrintable,
      upperASCII,positiveRecovered:229});
  }
}
assert.equal(cases.length,8);
assert.equal(Math.max(...cases.map(x=>x.nativeRuneCount)),30);
assert.equal(Math.max(...cases.map(x=>x.asciiPrintable)),109);
console.log('GF229_ORIGINAL_SCROLL_SHAMIR '+JSON.stringify({
  sourcePhysicalPages:[3,7],sourceRunes:scroll.length,
  fiveShares:5,eachShare:229,field:F,cases
},null,2));
console.log('PASS: all original field229 direct plaintext readings negative, 8/8 source-native plants recover 229/229.');
