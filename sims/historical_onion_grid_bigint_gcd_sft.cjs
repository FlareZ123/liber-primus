'use strict';

/**
 * Historical 2014 onion-stage 256-byte strings and the 256-byte LP2 table:
 * exactly test whether any two source 2048-bit integers share a factor large
 * enough to transfer an RSA-like private multiplier by Euclid GCD.
 *
 * Four source streams, four source-defined read orientations, six pairs.
 * 6 * 4 * 4 = 96 finite exact checks.
 * Run: node sims/historical_onion_grid_bigint_gcd_sft.cjs
 * No external packages or file writes.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const archived = JSON.parse(fs.readFileSync(path.join(root, 'resources/cicada-hiddenservice-256-candidates.json'), 'utf8'));
const table = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/base60-grid.json'), 'utf8'));
const values = archived.sourceServices.map(service => ({
  id: service.id,
  data: [...Buffer.from(service.hex, 'hex')],
}));
values.push({id:'lp2_32x8_grid',data:table.byte_rows.flat()});
assert.deepEqual(values.map(v => v.data.length), [256,256,256,256]);
assert.deepEqual(values.map(v => v.id), ['onion2','onion3','onion4','lp2_32x8_grid']);

/** @param {number[]} bytes @returns {bigint} */
function value(bytes) {
  return bytes.reduce((n, x) => 256n * n + BigInt(x), 0n);
}
/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b) {
  while (b !== 0n) [a,b]=[b,a%b];
  return a;
}
/** @param {number[]} a @returns {[string, bigint][]} */
function versions(a) {
  const byColumn = Array.from({length:256}, (_,i) =>
    a[(i%32)*8+Math.floor(i/32)]);
  return [
    ['row', value(a)],
    ['row_reverse', value([...a].reverse())],
    ['column', value(byColumn)],
    ['column_reverse', value(byColumn.reverse())],
  ];
}
const variants=values.map(v=>({id:v.id, v:versions(v.data)}));
const checks=[];
for (let i=0; i<4; i++) for(let j=i+1; j<4; j++) {
  for (const [aOrder,a] of variants[i].v) for (const [bOrder,b] of variants[j].v) {
    const g=gcd(a,b);
    checks.push({
      first:values[i].id,firstOrder:aOrder,
      second:values[j].id,secondOrder:bOrder,
      sharedFactor:g.toString(),
      bitLength:g.toString(2).length,
    });
  }
}
assert.equal(checks.length,96);
const max=checks.reduce((best,c)=>BigInt(c.sharedFactor)>BigInt(best.sharedFactor)?c:best);
assert.equal(max.sharedFactor,'189');
assert.equal(checks.filter(c => c.bitLength > 8).length,0);
const plantedFactor=(1n<<128n)+51n;
const a=plantedFactor*((1n<<1900n)+3n);
const b=plantedFactor*((1n<<1900n)+7n);
assert.ok(a.toString(2).length<=2048 && b.toString(2).length<=2048);
const plantedGcd=gcd(a,b);
assert.equal(plantedGcd % plantedFactor,0n);
assert.ok(plantedGcd.toString(2).length>=129);
console.log(JSON.stringify({
  scope:'original 2014 256-byte source excerpts and original LP2 32x8 grid',
  sourceCount:values.length,checks:checks.length,
  largestCommonFactor:max,
  otherHighest:checks.sort((a,b)=>Number(BigInt(b.sharedFactor)-BigInt(a.sharedFactor))).slice(0,8),
  plantedPositive:{sharedFactorBits:plantedFactor.toString(2).length,
    recoveredGcdBits:plantedGcd.toString(2).length,matched:true},
  decision:'No shared large integer factor in these 96 source-fixed 2048-bit interpretations.',
},null,2));
