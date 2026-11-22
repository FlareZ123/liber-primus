'use strict';

/**
 * Exact source-original 180-data/76-perimeter Reed–Solomon-style gate.
 * Windows Node.js 22: node sims/lp2_grid_inner180_rs_perimeter76_original_sft.cjs
 *
 * The 32×8 original table contains 256 bytes. Its one-cell perimeter is 76
 * positions; the 30×6 interior is 180 positions, matching terminal p55
 * (unknown 76) and p56+p57 (known 85+95). Historical Cicada also used
 * finite-field secret sharing. Check whether these bytes, read under six
 * natural source layouts, form evaluations of ANY polynomial of degree<180.
 * Fit 180 inside points and predict all 76 independently withheld rim points.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {gf256, prime257} = require('./grid_shamir_rs_inverse.cjs');

const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const values = grid.bytes;
const width = 8;
const height = 32;
assert.equal(values.length, 256);
assert.deepEqual([55,56,57].map(n => corpus.pages[n].indices.length), [76,85,95]);
assert.equal(createHash('sha256').update(Buffer.from(values)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/** @param {number} idx @returns {boolean} */
const isInside = idx => {
  const row = Math.floor(idx / width), col = idx % width;
  return row > 0 && row < height - 1 && col > 0 && col < width - 1;
};
assert.equal(Array.from({length:256}, (_,i) => i).filter(isInside).length, 180);

/**
 * @param {boolean} clockwise
 * @returns {number[]}
 */
function spiral(clockwise) {
  const dirs = clockwise
    ? [[0,1],[1,0],[0,-1],[-1,0]]
    : [[1,0],[0,1],[-1,0],[0,-1]];
  let row = 0, col = 0, direction = 0;
  const visited = new Set();
  const order = [];
  for (let i = 0; i < 256; i++) {
    const slot = row * width + col;
    assert(!visited.has(slot));
    order.push(slot);
    visited.add(slot);
    let nextRow = row + dirs[direction][0], nextCol = col + dirs[direction][1];
    if (nextRow < 0 || nextRow >= height || nextCol < 0 || nextCol >= width
        || visited.has(nextRow * width + nextCol)) {
      direction = (direction + 1) % 4;
      nextRow = row + dirs[direction][0];
      nextCol = col + dirs[direction][1];
    }
    row = nextRow;
    col = nextCol;
  }
  assert.equal(new Set(order).size, 256);
  assert(order.slice(0, 76).every(i => !isInside(i)));
  return order;
}
const printOrder = Array.from({length:256}, (_,i) => i);
const spiralCW = spiral(true), spiralCCW = spiral(false);
const orders = [
  ['printed',printOrder],
  ['reverse-printed',printOrder.slice().reverse()],
  ['spiral-clockwise',spiralCW],
  ['spiral-counterclockwise',spiralCCW],
  ['reverse-spiral-clockwise',spiralCW.slice().reverse()],
  ['reverse-spiral-counterclockwise',spiralCCW.slice().reverse()]
];

/**
 * Newton divided differences over the given finite field, no fitted key.
 * @param {number[]} xs
 * @param {number[]} ys
 * @param {{mul:Function, inverse:Function, sub:Function}} field
 * @returns {number[]}
 */
function fit(xs, ys, field) {
  const coefficients = ys.slice();
  for (let degree = 1; degree < ys.length; degree++) {
    for (let i = ys.length-1; i >= degree; i--) {
      const numerator = field.sub(coefficients[i], coefficients[i-1]);
      const denominator = field.sub(xs[i], xs[i-degree]);
      coefficients[i] = field.mul(numerator, field.inverse(denominator));
    }
  }
  return coefficients;
}

/**
 * @param {number[]} xs
 * @param {number[]} coefficients
 * @param {number} x
 * @param {{mul:Function, add:Function, sub:Function}} field
 * @returns {number}
 */
function evaluate(xs, coefficients, x, field) {
  let value = coefficients[coefficients.length - 1];
  for (let i = coefficients.length - 2; i >= 0; i--) {
    value = field.add(coefficients[i], field.mul(field.sub(x, xs[i]), value));
  }
  return value;
}

/**
 * @param {number[]} ordering
 * @param {{id:string, mul:Function, inverse:Function, sub:Function, add:Function}} field
 * @returns {{original:number, control:number, withheld:number}}
 */
function run(ordering, field) {
  const known = [], withheld = [];
  for (let x = 0; x < ordering.length; x++) {
    const slot = {x, value:values[ordering[x]]};
    (isInside(ordering[x]) ? known : withheld).push(slot);
  }
  assert.equal(known.length, 180);
  assert.equal(withheld.length, 76);
  const xs = known.map(p => p.x);
  const coefficients = fit(xs, known.map(p=>p.value), field);
  const original = withheld.filter(p=>evaluate(xs,coefficients,p.x,field)===p.value).length;

  // Source-shaped positive: degree-179 planted polynomial, all original
  // coordinates kept, all 76 perimeter values recovered without fitting them.
  const sample = Array.from({length:180}, (_,i)=>(i%7===0?i*11+23:0)%256);
  const sampleXs = Array.from({length:180},(_,i)=>i);
  const synthetic = Array.from({length:256},(_,x)=>evaluate(sampleXs,sample,x,field));
  const plantedCoefficients = fit(xs,known.map(p=>synthetic[p.x]),field);
  const control = withheld.filter(p=>
    evaluate(xs,plantedCoefficients,p.x,field)===synthetic[p.x]).length;
  assert.equal(control, 76);
  assert.equal(original, 0, 'Unexpected original field-codeword survivor: investigate!');
  return {original,control,withheld:76};
}
const fields = [gf256(0x11b),gf256(0x11d),prime257()];
const results = [];
for (const [name,order] of orders) {
  for (const field of fields) {
    results.push({layout:name,field:field.id,...run(order,field)});
  }
}
assert.equal(results.length, 18);
console.log(JSON.stringify({
  finding:'Every exact degree<180 field-polynomial codeword hypothesis fails all 76 independently withheld perimeter bytes',
  originalBytes:256,knownInterior:180,withheldPerimeter:76,
  results
},null,2));
