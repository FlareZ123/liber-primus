'use strict';

/**
 * Original LP2 p49–51 32x8 grid as 2013-style Shamir finite-field shares.
 *
 * Direct original-source branch: 2013 Cicada puzzle used five-of-ten Shamir
 * secret sharing to recover an onion. Does eight printed byte-columns
 * represent eight consistent shares (x at top or natural columns 1..8)?
 * Positive Shamir 5-of-8 planted dataset must reconstruct losslessly.
 *
 * Run Windows Node22: node sims/lp2_p50_2013_shamir_5of8_source_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const grid=JSON.parse(fs.readFileSync(
  path.join(__dirname,'../resources/liber-primus/lp2-grid-256.json'),'utf8'));
const values=grid.bytes;
assert.equal(values.length,256);
assert(values.every(x=>Number.isInteger(x)&&x>=0&&x<256));
const rows=Array.from({length:32},(_,i)=>values.slice(8*i,8*i+8));
const columns=Array.from({length:8},(_,i)=>rows.map(row=>row[i]));
const prime=257;
/**
 * @param {number} a @param {number} b @param {number} red
 * @returns {number} GF(256) multiplication under x^8+red(x).
 */
function multiply(a,b,red){
  let v=0;
  for(let i=0;i<8;i++){
    if(b&1)v^=a;
    const carry=a&0x80;
    a=(a<<1)&0xff;
    if(carry)a^=red;
    b>>=1;
  }
  return v;
}
/** @param {number} a @param {number} n @param {number} red @returns {number} */
function power(a,n,red){
  let value=1;
  for(;n>0;n>>=1){
    if(n&1)value=multiply(value,a,red);
    a=multiply(a,a,red);
  }
  return value;
}
/** @param {number} n @returns {number} */
const pmod=n=>((n%prime)+prime)%prime;
/** @param {number} a @param {number} e @returns {number} */
function ppower(a,e){
  let v=1;
  for(;e>0;e>>=1){
    if(e&1)v=pmod(v*a);
    a=pmod(a*a);
  }
  return v;
}
/**
 * Evaluate the unique degree-(k-1) Lagrange interpolant.
 * @param {number[]} xs @param {number[]} ys
 * @param {number} at
 * @param {{name:string,red?:number}} field
 * @returns {number}
 */
function interpolate(xs,ys,at,field){
  assert.equal(xs.length,ys.length);
  assert.equal(new Set(xs).size,xs.length);
  let answer=0;
  for(let j=0;j<xs.length;j++){
    let term=ys[j];
    for(let i=0;i<xs.length;i++){
      if(i===j)continue;
      if(field.name==='GF257'){
        const den=pmod(xs[j]-xs[i]);
        term=pmod(term*pmod(at-xs[i])*ppower(den,255));
      }else{
        const den=xs[j]^xs[i];
        term=multiply(term,multiply(at^xs[i],
          power(den,254,field.red),field.red),field.red);
      }
    }
    if(field.name==='GF257')answer=pmod(answer+term);
    else answer^=term;
  }
  return answer;
}
/**
 * @param {number[][]} shares
 * @param {boolean} header
 * @param {{name:string,red?:number}} field
 * @param {number} threshold
 */
function check(shares,header,field,threshold){
  const xs=shares.map((s,i)=>header?s[0]:i+1);
  if(new Set(xs).size!==xs.length)return {validX:false};
  const data=shares.map(s=>header?s.slice(1):s);
  const first=xs.slice(0,threshold);
  let matching=0,total=0;
  /** @type {number[]} */
  const secret=[];
  for(let cell=0;cell<data[0].length;cell++){
    const initial=data.slice(0,threshold).map(s=>s[cell]);
    secret.push(interpolate(first,initial,0,field));
    for(let k=threshold;k<data.length;k++){
      total++;
      const value=interpolate(first,initial,xs[k],field);
      if(value===data[k][cell])matching++;
    }
  }
  return {validX:true,matching,total,secretPreview:secret.slice(0,8)};
}
const fields=[
  {name:'GF256-11b',red:0x1b},
  {name:'GF256-11d',red:0x1d},
  {name:'GF257'}
];
const orientations=[
  {label:'eight columns: first printed row x header',shares:columns,header:true},
  {label:'eight columns: x=1..8',shares:columns,header:false},
  {label:'32 rows: first printed column x header',shares:rows,header:true},
  {label:'32 rows: x=1..32',shares:rows,header:false}
];
const outcomes=[];
for(const field of fields)for(const orientation of orientations){
  const thresholds=[];
  for(let k=2;k<=7;k++){
    const checkResult=check(orientation.shares,orientation.header,field,k);
    thresholds.push({k,validX:checkResult.validX,
      matching:checkResult.matching??0,total:checkResult.total??0});
  }
  outcomes.push({field:field.name,layout:orientation.label,thresholds});
}
function result(field,layout,k){
  return outcomes.find(o=>o.field===field&&o.layout.includes(layout))
    .thresholds.find(o=>o.k===k);
}
assert.deepEqual([0,2,1].map((_,i)=>
  result(fields[i].name,'eight columns: first printed row',5).matching),[0,0,0]);
assert.deepEqual(fields.map(f=>result(f.name,'eight columns: x=1..8',5).matching),[2,0,0]);
assert.deepEqual(fields.map(f=>result(f.name,'32 rows: x=1..32',5).matching),[1,1,2]);
assert(outcomes.every(o=>o.thresholds.every(x=>!x.validX||x.matching<x.total)));
assert(outcomes.filter(o=>o.layout.includes('first printed column')).every(o=>o.thresholds.every(x=>!x.validX)),
  'repeated x-coordinate invalidates 32 row-header share mode');

// A complete positive 31-byte source-native secret distributed into exactly
// eight 32-byte share columns with a fifth-order Shamir threshold.
const field=fields[0],nBytes=31,k=5;
const secret=Array.from({length:nBytes},(_,i)=>(19+43*i)&255);
const planted=Array.from({length:8},(_,i)=>[i+1]);
for(let cell=0;cell<nBytes;cell++){
  const coefs=[secret[cell],(cell*3+5)&255,(cell*7+11)&255,
    (cell*13+17)&255,(cell*29+23)&255];
  for(let x=1;x<=8;x++){
    let y=0;
    for(let j=coefs.length-1;j>=0;j--)
      y=multiply(y,x,field.red)^coefs[j];
    planted[x-1].push(y);
  }
}
const positive=check(planted,true,field,5);
assert.equal(positive.total,93);
assert.equal(positive.matching,positive.total);
assert.deepEqual(positive.secretPreview,secret.slice(0,8));
for(let cell=0;cell<nBytes;cell++){
  const xs=planted.slice(0,5).map(s=>s[0]);
  const ys=planted.slice(0,5).map(s=>s[cell+1]);
  assert.equal(interpolate(xs,ys,0,field),secret[cell]);
}
// Exact coordinate-free bound on the NEW source hypothesis after removing
// the top printed row as eight possible column-share x-coordinate bytes.
// Any same-coordinate degree<=6 sharing design, even with independent fixed
// affine scaling and shifting per share, has centered Y-matrix rank<=7.
// Reuse the established field arithmetic, elimination and positive plants.
const sourceRank=require('./grid_coordinate_free_share_rank.cjs');
const rankChecks=sourceRank.fields.map(field=>{
  const stripped=rows.slice(1);
  const centered=sourceRank.differences(stripped,field);
  const originalRank=sourceRank.elimination(stripped,field).rank;
  const affineInvariantRank=sourceRank.elimination(centered,field).rank;
  assert.equal(originalRank,8);
  assert.equal(affineInvariantRank,8);
  const planted=sourceRank.control(field,0x3301a6d1).slice(1);
  const plantedRaw=sourceRank.elimination(planted,field).rank;
  const plantedCentered=sourceRank.elimination(
    sourceRank.differences(planted,field),field).rank;
  assert.equal(plantedRaw,8);
  assert.equal(plantedCentered,7);
  return {field:field.name,headerStrippedOriginalRank:originalRank,
    headerStrippedAffineInvariantRank:affineInvariantRank,
    trueUnknownXDegree6MaskedPlantRawRank:plantedRaw,
    trueUnknownXDegree6MaskedPlantCenteredRank:plantedCentered};
});
console.log(JSON.stringify({
  status:'PASS; original p50 byte columns fail 2013-style Shamir share consistency; no plaintext',
  sourceCellCount:values.length,sourceShape:'32 rows x 8 columns',
  naturalColumnXs:rows[0],
  firstColumnDistinctX:new Set(rows.map(r=>r[0])).size,
  tests:outcomes,
  sourceHeaderXCoordinateFreeRank:rankChecks,
  syntheticPositive:{threshold:5,shareCount:8,secretBytes:31,all93Constraints:positive.matching},
  limitation:'No original 2014 instruction equates the grid to Shamir shares. A threshold of eight is untestable by redundancy; the source-derived 2013 five-of-ten scheme is what is rejected.'
},null,2));
