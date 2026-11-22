'use strict';
/**
 * SFT: test 2014 Shamir-style polynomial coding at the original p0 red 8+5
 * title and the red thirteen-dot 5-center/8-outer printed glyph.
 * Original GP29 word values; no key or plaintext is fit from the output.
 * Node.js 22 CommonJS: node sims/lp2_p0_dot13_shamir_5_8_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'lp2-ink-annotations.json'), 'utf8'));
const title = corpus.pages.find(p => p.page === 0).indices.slice(0, 13);
assert.deepEqual(title, [15,8,18,3,6,19,27,0,15,26,18,21,5]);
assert.deepEqual(ink.pages.find(p => p.page === 0).large_punctuation, [[13,13,'red']]);

/** @param {number} n @returns {number} */
const mod = n => ((n % 29) + 29) % 29;
/** @param {number} a @returns {number} */
const inv = a => {
  const value = Array.from({length:28}, (_,i)=>i+1).find(x=>mod(a*x)===1);
  assert.notEqual(value, undefined);
  return value;
};
/** @param {number[]} values @param {number[]} positions
 * @param {number[]} targets @returns {number[]} */
function interpolate(values, positions, targets) {
  assert.equal(values.length, positions.length);
  assert.equal(new Set(positions).size, positions.length);
  return targets.map(z => {
    let y = 0;
    for (let j = 0; j < values.length; j++) {
      let term = values[j];
      for (let k = 0; k < positions.length; k++) {
        if (j !== k) term = mod(term * mod(z - positions[k]) *
          inv(mod(positions[j] - positions[k])));
      }
      y = mod(y + term);
    }
    return y;
  });
}
/** @param {number[]} c @param {number} x @returns {number} */
const evalPoly = (c, x) => c.reduceRight((a, b) => mod(a * x + b), 0);
/** @param {number[]} values @param {number[]} prediction @returns {number} */
const exact = (values, prediction) =>
  values.filter((x, i) => x === prediction[i]).length;

const center = [0,3,6,9,12];
const rowOuter = [1,2,4,5,7,8,10,11];
const colOuter = [1,4,7,10,2,5,8,11];
const cases = [];
for (const [layout, outer] of [['physical-row', rowOuter],
                               ['physical-column', colOuter]]) {
  for (const reverseOuter of [false, true]) {
    for (const reverseCenter of [false, true]) {
      const outside = reverseOuter ? title.slice(0,8).reverse() : title.slice(0,8);
      const inside = reverseCenter ? title.slice(8,13).reverse() : title.slice(8,13);
      const outputOutside = interpolate(inside, center, outer);
      const outputCenter = interpolate(outside, outer, center);
      cases.push({layout, reverseOuter, reverseCenter, type:'degree4-center-to-outer',
        actual:outside, prediction:outputOutside, matches:exact(outside, outputOutside)});
      cases.push({layout, reverseOuter, reverseCenter, type:'degree7-outer-to-center',
        actual:inside, prediction:outputCenter, matches:exact(inside, outputCenter)});
    }
  }
}
for (const k of [5,8]) {
  const actual = title.slice(k);
  const prediction = interpolate(title.slice(0,k),
    Array.from({length:k},(_,i)=>i),Array.from({length:13-k},(_,i)=>i+k));
  cases.push({layout:'straight-printed', type:'degree'+(k-1), actual,
    prediction, matches:exact(actual,prediction)});
}
assert.equal(cases.length,18);
assert(cases.every(c=>c.matches===0), 'Unexpected original polynomial match');
assert.deepEqual(cases.find(c=>c.layout==='physical-row' &&
  !c.reverseCenter && !c.reverseOuter &&
  c.type==='degree4-center-to-outer').prediction, [14,23,17,0,8,4,26,25]);
assert.deepEqual(cases.find(c=>c.layout==='physical-row' &&
  !c.reverseCenter && !c.reverseOuter &&
  c.type==='degree7-outer-to-center').prediction, [14,9,10,8,19]);

// Exact positive plants: authentic 13-dot coordinates and the two relevant degrees.
const planted4 = [3,5,7,1,2], planted7 = [5,3,2,4,1,9,8,6];
for (const [coefficients, dataPos, checkedPos] of [
  [planted4,center,rowOuter], [planted7,rowOuter,center]
]) {
  const shares = dataPos.map(x => evalPoly(coefficients, x));
  const expected = checkedPos.map(x => evalPoly(coefficients, x));
  assert.deepEqual(interpolate(shares,dataPos,checkedPos),expected);
}
console.log(JSON.stringify({
  source:'original LP2 p0 scan17 red8/red5 and 13-dot C,L,R visual rows',
  originalTitle: title, geometry: {center,rowOuter,colOuter},
  historicalMechanism:'Shamir-style GF29 polynomial shares: degree4 or degree7',
  originalCases:cases, originalExactCodewords:0,
  positiveControls:'degree4 (5 shares) and degree7 (8 shares) both reconstruct every withheld share',
  inference:'The literal original red title is not an unmasked GF29 polynomial share/codeword in any tested source-natural order. Does not exclude a separate encrypted codeword or unseen state.'
},null,2));
