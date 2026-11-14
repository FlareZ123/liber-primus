/**
 * Exact LP2 P50 LCG difference test. Node22 CommonJS, repository root.
 * For fixed multiplier a, arbitrary secret increment c and secret seed,
 * D[t+1] = a*D[t] modulo 2^32 for D[t]=s[t+1]-s[t].
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const source = JSON.parse(fs.readFileSync(
  path.join('resources','liber-primus','base60-grid.json'), 'utf8'));
/** @type {number[][]} */
const rows=source.byte_rows;
assert.equal(rows.length,32);
assert(rows.every(row=>row.length===8 && row.every(x=>Number.isInteger(x)&&x>=0&&x<=255)));
const native=rows.flat();
assert.equal(createHash('sha256').update(Buffer.from(native)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/** @param {number} mode @returns {number[]} */
function traverse(mode) {
  const out=[];
  for(let i=0;i<256;i++){
    const row=mode===1?i%32:Math.floor(i/8);
    let col=mode===1?Math.floor(i/32):i%8;
    if(mode===2 && row%2===1) col=7-col;
    out.push(rows[row][col]);
  }
  return out;
}
/**
 * Any byte y[i]=(s[i]>>>shift)&255 obeys:
 * highbyte(s[i+1]-s[i]) = (y[i+1]-y[i]) + epsilon (mod256)
 * for epsilon in {-1,0,1}, because of lower-bit borrow.
 * A fixed multiplier a implies D[i+1]=a*D[i] independent of c.
 * Enumerate all first differences modulo 2^(shift+8) and reject if
 * any later observed difference violates the forced high-byte window.
 * @param {number[]} values
 * @param {number} multiplier
 * @param {number} shift
 * @param {number} steps
 * @returns {number}
 */
function candidateDeltas(values,multiplier,shift,steps){
  const limit=2**shift;
  const mask=shift===24?0xffffffff:2**(shift+8)-1;
  const first=(values[1]-values[0])&255;
  let survivors=0;
  for(let offset=-1;offset<=1;offset++){
    const high=(first+offset)&255;
    for(let low=0;low<limit;low++){
      let delta=(high*limit+low)>>>0;
      for(let j=1;j<steps;j++){
        delta=Math.imul(multiplier,delta)>>>0;
        if(shift!==24)delta&=mask;
        const observed=(values[j+1]-values[j])&255;
        const difference=(((delta>>>shift)&255)-observed)&255;
        if(difference!==0 && difference!==1 && difference!==255)break;
        if(j===steps-1)survivors++;
      }
    }
  }
  return survivors;
}
/** @type {{name:string,a:number,c:number}[]} */
const models=[
 {name:'MSVC',a:214013,c:2531011},
 {name:'ANSI',a:1103515245,c:12345},
 {name:'NumericalRecipes',a:1664525,c:1013904223}
];
// Genuine full-state positive: high-byte of the authentic LCG recurrence.
let state=0x3301;
const plant=[];
for(let i=0;i<256;i++){
  state=(Math.imul(models[0].a,state)+models[0].c)>>>0;
  plant.push(state>>>24);
}
const planted=candidateDeltas(plant,models[0].a,24,15);
assert.equal(planted,1);
console.log('PLANTED full LCG: unique compatible first difference across first16 bytes');
let originals=0;
for(let order=0;order<3;order++){
  const bytes=traverse(order);
  for(const model of models)for(const shift of [16,23,24]){
    const hits=candidateDeltas(bytes,model.a,shift,15);
    originals+=hits;
    console.log('SOURCE order='+order+' a='+model.name+' shift='+shift+' compatible='+hits);
  }
}
assert.equal(originals,0);
console.log(JSON.stringify({bytes:256,models:27,unrestrictedIncrement:true,
  unrestrictedSeed:true,originalCompatibleFirstDifferences:originals,planted},null,2));
