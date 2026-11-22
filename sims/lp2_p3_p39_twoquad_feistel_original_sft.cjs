'use strict';

/**
 * Test keyed-free 29x29 Feistel permutations selected by source p3/p39
 * red GP29 quadratic triads and the p15 repeat/infinity diagram.
 *
 * The p39 polynomial Q(x)=27+5x+15*x^2 mod29 is nonbijective, so a
 * two-rune Feistel permutation is the simplest reversible consumer.
 * Original p3 red [13,23,2] gives the independent P round.
 *
 * Exact original contiguous 12,956-rune input; both pair orientations;
 * all source-simple four schedules, 1/2/4/8/16 rounds. Exact native
 * solved-p57 planted inverse for every variant.
 *
 * Node.js 22 CJS, no dependencies or file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const gp = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const source = gp.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const page55 = gp.pages.find(p => p.page === 55).indices;
const solved = gp.pages.find(p => p.page === 57).indices.slice(0, 94);
assert.equal(source.length, 12956);
assert.equal(page55.length, 76);
assert.equal(solved.length, 94);
assert.equal(source.length % 2, 0);
assert.equal(page55.length % 2, 0);

/** @param {number} n @returns {number} */
const mod29 = n => ((n % 29) + 29) % 29;
/** @param {number} x @returns {number} */
const Q = x => (27 + 5*x + 15*x*x) % 29;
/** @param {number} x @returns {number} */
const P = x => (13 + 23*x + 2*x*x) % 29;

/**
 * @param {number[]} x GP29 stream of even length
 * @param {((n:number)=>number)[]} fs Feistel round functions
 * @param {boolean} invert
 * @param {number} orientation 0 normal, 1 reversed pair
 * @returns {number[]}
 */
function feistel(x, fs, invert, orientation) {
  assert.equal(x.length % 2, 0);
  const out = [];
  for (let i = 0; i < x.length; i += 2) {
    let L = x[i+orientation], R = x[i+1-orientation];
    if (invert) {
      for (let j = fs.length-1; j >= 0; j--) {
        const nextL = mod29(R - fs[j](L));
        R = L;
        L = nextL;
      }
    } else {
      for (let j = 0; j < fs.length; j++) {
        const nextR = mod29(L + fs[j](R));
        L = R;
        R = nextR;
      }
    }
    if (!orientation) out.push(L,R);
    else out.push(R,L);
  }
  return out;
}

/** @param {number[]} stream @returns {number} */
function ioc(stream) {
  const counts = Array(29).fill(0);
  for (const s of stream) counts[s]++;
  return counts.reduce((a,b) => a+b*(b-1),0)
    /(stream.length*(stream.length-1));
}

/** @param {number} len @param {string} variant */
function rounds(len,variant) {
  return Array.from({length:len},(_,i) =>
    variant === 'Q' ? Q : variant === 'P' ? P :
    variant === 'QP' ? [Q,P][i%2] : [P,Q][i%2]);
}

const results = [];
for (const len of [1,2,4,8,16]) {
  for (const variant of ['Q','P','QP','PQ']) {
    const fs = rounds(len,variant);
    for (const orientation of [0,1]) {
      const decoded = feistel(source,fs,true,orientation);
      assert.deepEqual(feistel(decoded,fs,false,orientation),source);
      const plant = feistel(solved,fs,false,orientation);
      assert.deepEqual(feistel(plant,fs,true,orientation),solved);
      results.push({len,variant,orientation,
        IoC:ioc(decoded),
        p55IoC:ioc(feistel(page55,fs,true,orientation)),
        opening:decoded.slice(0,25).map(i=>gp.translit[i]).join(' ')});
    }
  }
}
assert.equal(results.length,40);
const maximum = results.reduce((a,b)=>a.IoC>b.IoC?a:b);
const minimum = results.reduce((a,b)=>a.IoC<b.IoC?a:b);
assert(Math.abs(ioc(source)-0.03447839786450569)<1e-12);
assert(maximum.IoC < 0.035);
assert(minimum.IoC > 0.0344);
console.log(JSON.stringify({
  originalRunes:source.length,variantCount:results.length,
  nativePositiveControlRunes:solved.length,
  sourceRedQuadratics:{p3:[13,23,2],p39:[27,5,15]},
  originalIoC:ioc(source),minimum,maximum,
  p55IoCRange:[Math.min(...results.map(r=>r.p55IoC)),
    Math.max(...results.map(r=>r.p55IoC))],
  conclusion:'No direct plaintext or source-selected round key identified'
},null,2));
