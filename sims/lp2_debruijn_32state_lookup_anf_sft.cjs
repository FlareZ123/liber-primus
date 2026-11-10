"use strict";
/**
 * LP2 32x8 table as a 5-bit-state -> 64-bit Boolean lookup.
 * Run: node sims/lp2_debruijn_32state_lookup_anf_sft.cjs
 * Node 22; no third-party dependencies or fitted parameters.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const raw = fs.readFileSync(path.join(__dirname, "../resources/liber-primus/base60-grid.json"));
const blob = crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob " + raw.length + "\0"), raw])).digest("hex");
assert.equal(blob, "4698c0806e6bab06a39cfbc3c3283b862de58b35");
const rows = JSON.parse(raw.toString("utf8")).byte_rows;
assert.equal(rows.length, 32);
assert(rows.every(r => r.length === 8 && r.every(x => Number.isInteger(x) && x >= 0 && x <= 255)));

const PRINTED = Array.from({length:32}, (_,i)=>i);
const UNROTATED = [31,30,28,25,19,6,13,26,20,9,18,4,8,16,0,1,2,5,10,21,11,23,14,29,27,22,12,24,17,3,7,15];
const BLACK = [13,26,20,9,18,4,8,16,0,1,2,5,10,21,11,23,14,29,27,22,12,24,17,3,7,15,31,30,28,25,19,6];
const inverse = order => {
  const map = Array(32).fill(-1);
  order.forEach((s,r)=>{assert(map[s]===-1);map[s]=r;});
  assert(map.every(x=>x>=0));
  for(let i=0;i<32;i++) assert.equal(order[i]&15,order[(i+1)%32]>>>1);
  return map;
};
const maps = {
  printed: PRINTED,
  unrotatedDeBruijn: inverse(UNROTATED),
  blackAnchoredDeBruijn: inverse(BLACK)
};
const pop = x => {let n=0;for(;x;x&=x-1)n++;return n;};

function analyze(byteRows, stateToRow, details=false) {
  let totalTerms=0, low3=0, low2=0;
  const degrees=Array(6).fill(0), terms=Array(33).fill(0), planes=[];
  for(let c=0;c<8;c++) for(let b=0;b<8;b++) {
    const a=new Uint8Array(32);
    let weight=0;
    for(let s=0;s<32;s++){a[s]=(byteRows[stateToRow[s]][c]>>>b)&1;weight+=a[s];}
    // Boolean Möbius transform: truth table -> algebraic normal form.
    for(let bit=0;bit<5;bit++) for(let m=0;m<32;m++) if(m&(1<<bit)) a[m]^=a[m^(1<<bit)];
    let d=-1,n=0;const monomials=[];
    for(let m=0;m<32;m++) if(a[m]){n++;d=Math.max(d,pop(m));monomials.push(m);}
    totalTerms+=n;terms[n]++;degrees[Math.max(0,d)]++;
    if(d<=3)low3++;if(d<=2)low2++;
    if(details)planes.push({column:c,bit:b,weight,degree:d,terms:n,monomials});
  }
  return {totalTerms,lowDegree3:low3,lowDegree2:low2,degreeHistogram:degrees,
    termHistogram:terms.map((n,i)=>n?{terms:i,count:n}:null).filter(Boolean),
    ...(details?{planes}:{})};
}
const observed=Object.fromEntries(Object.entries(maps).map(([k,m])=>[k,analyze(rows,m,true)]));
const familyMin=Math.min(...Object.values(observed).map(x=>x.totalTerms));
const familyMaxLow3=Math.max(...Object.values(observed).map(x=>x.lowDegree3));
const weights=[];
for(let c=0;c<8;c++)for(let b=0;b<8;b++)weights.push(rows.reduce((n,r)=>n+((r[c]>>>b)&1),0));

// Positive control: construct 64 independent quadratic Boolean functions.
let plantSeed=0x2016;
function plantRand(){plantSeed^=plantSeed<<13;plantSeed^=plantSeed>>>17;plantSeed^=plantSeed<<5;return plantSeed>>>0;}
const plantRows=Array.from({length:32},()=>Array(8).fill(0)),plantCoeffs=[];
for(let c=0;c<8;c++)for(let b=0;b<8;b++){
  const coeff=[];
  for(let m=0;m<32;m++)if(pop(m)<=2&&(plantRand()&1))coeff.push(m);
  if(!coeff.some(m=>pop(m)===2))coeff.push(3);
  coeff.sort((a,b)=>a-b);plantCoeffs.push(coeff);
  for(let r=0;r<32;r++){const s=BLACK[r];let v=0;for(const m of coeff)if((s&m)===m)v^=1;if(v)plantRows[r][c]|=1<<b;}
}
const plant=analyze(plantRows,maps.blackAnchoredDeBruijn,true);
assert.equal(plant.lowDegree2,64);
assert(plant.planes.every((p,i)=>JSON.stringify(p.monomials)===JSON.stringify(plantCoeffs[i])));

let rng=0x3301;
function next32(){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0;}
function randInt(max){const lim=Math.floor(0x100000000/max)*max;let x;do{x=next32();}while(x>=lim);return x%max;}
const N=10000, nullTerms=[],nullLow3=[];
let tailTerms=0,tailLow3=0;
for(let t=0;t<N;t++){
  const p=PRINTED.slice();
  for(let i=31;i>0;i--){const j=randInt(i+1);[p[i],p[j]]=[p[j],p[i]];}
  const family=Object.values(maps).map(m=>analyze(rows,m.map(r=>p[r])));
  const mt=Math.min(...family.map(x=>x.totalTerms));
  const ml=Math.max(...family.map(x=>x.lowDegree3));
  nullTerms.push(mt);nullLow3.push(ml);
  if(mt<=familyMin)tailTerms++;
  if(ml>=familyMaxLow3)tailLow3++;
}
function summary(a){const s=a.slice().sort((x,y)=>x-y),mean=a.reduce((x,y)=>x+y,0)/N;
  const sd=Math.sqrt(a.reduce((x,y)=>x+(y-mean)**2,0)/N);
  return {mean,sd,q01:s[99],median:s[4999],q99:s[9899]};}
const pTerms=(tailTerms+1)/(N+1),pLow3=(tailLow3+1)/(N+1);
const out={
  source:{path:"resources/liber-primus/base60-grid.json",gitBlobSha:blob,shape:[32,8]},
  hypothesis:"five-bit state indexes one row; eight bytes are 64 Boolean output planes",
  stateOrders:{printed:PRINTED,unrotatedDeBruijn:UNROTATED,blackAnchoredDeBruijn:BLACK},
  observed,family:{minTotalTerms:familyMin,maxDegreeLE3:familyMaxLow3},
  outputBitBalance:{ones:weights.reduce((a,b)=>a+b,0),total:2048,
    meanPlaneWeight:weights.reduce((a,b)=>a+b,0)/64,minPlaneWeight:Math.min(...weights),maxPlaneWeight:Math.max(...weights)},
  null:{kind:"shared row permutation preserving each plane's weight and all cross-plane row associations",
    samples:N,seed:"0x3301",
    familyMinTotalTerms:{...summary(nullTerms),tailCount:tailTerms,pAddOne:pTerms},
    familyMaxDegreeLE3:{...summary(nullLow3),tailCount:tailLow3,pAddOne:pLow3},
    bonferroniTwoSummaries:Math.min(1,2*Math.min(pTerms,pLow3))},
  positiveControl:{kind:"64 independently generated quadratic Boolean functions",
    recoveredDegreeLE2Planes:plant.lowDegree2,totalPlanes:64,exactAnfCoefficientsRecovered:true}
};
console.log(JSON.stringify(out,null,2));
