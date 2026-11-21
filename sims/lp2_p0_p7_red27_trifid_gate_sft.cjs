'use strict';

/**
 * Frozen source-led complementary red13+red14 as 27-cell Trifid-key test.
 *
 * Independent visible premise: physical LP2 p0 begins with a red 13-rune
 * title, p7 ends with a red 14-rune colophon, and the first three pages
 * total 729=27^2 original GP29 runes. A keyed Trifid is one direct,
 * reversible 27-cell conversion, with F and EA retained as literal
 * exceptions (declared before reading results). This is a HYPOTHESIS
 * without authenticated cross-page glue or a source-specified cube cipher.
 *
 * To run on Windows: Node.js 22 CommonJS, no npm dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.resolve(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const pages = corpus.pages;
const p0 = pages.find((p) => p.page === 0).indices;
const p1 = pages.find((p) => p.page === 1).indices;
const p2 = pages.find((p) => p.page === 2).indices;
const p7 = pages.find((p) => p.page === 7).indices;
assert.deepEqual([p0.length, p1.length, p2.length, p7.length], [262,266,201,208]);
assert.equal(p0.length + p1.length + p2.length, 729);
const red0 = p0.slice(0, 13);
const red7 = p7.slice(194, 208);
assert.deepEqual(red0, [15,8,18,3,6,19,27,0,15,26,18,21,5]);
assert.deepEqual(red7, [23,3,22,16,2,25,5,7,11,14,28,6,28,19]);
const combined = [...red0, ...red7];
assert.equal(combined.length, 27);
const CORE = Array.from({length:27}, (_, i) => i + 1);
const unique = [...new Set(combined.filter((n) => n !== 0 && n !== 28))];
const cube = [...unique, ...CORE.filter((n) => !unique.includes(n))];
assert.equal(cube.length, 27);
assert.deepEqual([...cube].sort((a, b) => a - b), CORE);

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const counts = Array(29).fill(0);
  for (const n of symbols) counts[n] += 1;
  return counts.reduce((sum, count) => sum + count*(count-1), 0) /
    (symbols.length * (symbols.length-1));
}
/** @param {number[]} symbols @returns {string} */
const latin = (symbols) => symbols.map((n) => corpus.translit[n]).join('');
/**
 * Classical keyed Trifid on supplied page-local/crosspage parts.
 * F(index0) and EA(index28) are literal and do not advance its block.
 * @param {number[][]} parts
 * @param {boolean} inverse
 * @returns {number[]}
 */
function trifid(parts, inverse) {
  const lookup = new Int16Array(29).fill(-1);
  cube.forEach((n, index) => { lookup[n] = index; });
  const result = [];
  for (const part of parts) {
    const output = part.slice();
    const positions = [];
    const indices = [];
    part.forEach((n, at) => {
      if (lookup[n] >= 0) {
        positions.push(at);
        indices.push(lookup[n]);
      } else {
        assert.ok(n === 0 || n === 28);
      }
    });
    for (let start = 0; start < indices.length; start += 27) {
      const block = indices.slice(start, start+27);
      const len = block.length;
      const decodedDigits = block.flatMap((n) => [
        Math.floor(n/9), Math.floor(n/3)%3, n%3
      ]);
      const mapped = new Array(len);
      if (inverse) {
        for (let i=0;i<len;i++) {
          mapped[i] = 9*decodedDigits[i] +
            3*decodedDigits[len+i] + decodedDigits[2*len+i];
        }
      } else {
        const rows = [];
        for (let k=0;k<3;k++)
          for (const n of block) rows.push(
            k===0 ? Math.floor(n/9) :
            k===1 ? Math.floor(n/3)%3 : n%3
          );
        for (let i=0;i<len;i++)
          mapped[i] = 9*rows[3*i] + 3*rows[3*i+1] + rows[3*i+2];
      }
      for (let i=0;i<len;i++) output[positions[start+i]] = cube[mapped[i]];
    }
    result.push(...output);
  }
  return result;
}
const orig = [...p0.slice(13), ...p1, ...p2];
assert.equal(orig.length, 716);
assert.equal(orig.slice(0,249).length,249);
const solved = pages.find((p)=>p.page===57).indices;
assert.equal(solved.length,95);
console.log('red13+red14 length:', combined.length,
  'unique keys retained:', unique.length,
  '27-cube:', cube, 'body length:',orig.length);

for (const [reset, parts] of [
  ['continuous-after-red', [orig]],
  ['page-local-after-red', [p0.slice(13),p1,p2]],
]) {
  for (const inverse of [true,false]) {
    const transformed = trifid(parts, inverse);
    const reverse = trifid([transformed], !inverse);
    if (reset === 'continuous-after-red') {
      assert.deepEqual(reverse, orig);
    } else {
      const transformedParts = [
        transformed.slice(0,249), transformed.slice(249,515), transformed.slice(515)
      ];
      assert.deepEqual(trifid(transformedParts,!inverse),orig);
    }
    const plant = [Array.from({length:249}, (_,i)=>solved[i % 95])];
    const roundtrip = trifid([trifid(plant,!inverse)],inverse);
    assert.deepEqual(roundtrip,plant[0]);
    console.log(
      reset, inverse?'decrypt':'encrypt',
      'p0 IoC:',ioc(transformed.slice(0,249)).toFixed(7),
      'p0 head (first100):',latin(transformed.slice(0,100)),
      'all716 IoC:',ioc(transformed).toFixed(7)
    );
  }
}
console.log('source p0 body IoC:',ioc(p0.slice(13)).toFixed(7),
  'solved p57 IoC:',ioc(solved).toFixed(7));
// An independent, simpler 27-character-pad reading: start with the
// previously recovered retrospective title's 13-key, then append the
// unmodified 14-rune p7 red colophon. Because first 13 plaintext symbols
// were used to derive the title key, that opening match is NOT evidence.
const titleKey = [26,24,8,19,27,24,18,3,0,8,0,16,19];
const additive27 = [...titleKey, ...red7];
assert.equal(additive27.length, 27);
const complete = [ ...p0, ...p1, ...p2 ];
assert.equal(complete.length, 27*27);
const mod = (n) => ((n % 29)+29)%29;
const padDecoded = complete.map((n,i)=>mod(n-additive27[i%27]));
assert.equal(latin(padDecoded.slice(0,13)), 'EPIPHANYSEECS');
assert.deepEqual(padDecoded.map((n,i)=>mod(n+additive27[i%27])),complete);
console.log('repeated27-pad title positive by construction:',latin(padDecoded.slice(0,13)),
  'original all-body IoC:',ioc(padDecoded.slice(13)).toFixed(7),
  'p0 body first100:',latin(padDecoded.slice(13,113)));

console.log('PASS: frozen complementary-27 Trifid tests; no plaintext claim');
