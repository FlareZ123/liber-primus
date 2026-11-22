'use strict';
/** Direct native 81²→80² source-table neighborhood gate. Node 22 CJS. */
const assert=require('node:assert/strict');
const corpus=require('../resources/liber-primus/lp2-corpus.json');
const grid=require('../resources/liber-primus/lp2-grid-256.json');
const stream=corpus.pages.slice(0,56).flatMap(p=>p.indices);
const A=stream.slice(0,6561), B=stream.slice(6561), table=grid.bytes,pr=corpus.prime;
assert.equal(stream.length,12956);
assert.equal(A.length,81*81);assert.equal(B.length,80*80-5);
assert.equal(table.length,256);
const mod=(a,b)=>(a%b+b)%b;
/** @typedef {(q:number[])=>number} Hash4 */
/** @type {Record<string,Hash4>} */
const hashes={
  sumIndex:q=>q.reduce((s,v)=>s+v,0),
  sumPrime:q=>q.reduce((s,v)=>s+pr[v],0),
  xorIndex:q=>q.reduce((s,v)=>s^v,0),
  xorPrime:q=>q.reduce((s,v)=>s^pr[v],0),
  detIndex:([a,b,c,d])=>a*d-b*c,
  detPrime:([a,b,c,d])=>pr[a]*pr[d]-pr[b]*pr[c],
  gaussIndex:([a,b,c,d])=>a+2*b+2*c+d,
  gaussPrime:([a,b,c,d])=>pr[a]+2*pr[b]+2*pr[c]+pr[d]
};
/** @param {number[]} input @param {Hash4} hash @returns {number[]} */
function predict(input,hash){
  assert.equal(input.length,6561);
  const out=[];
  for(let r=0;r<80;r++)for(let c=0;c<80;c++){
    const x=r*81+c;
    out.push(table[mod(hash([input[x],input[x+1],input[x+81],input[x+82]]),256)]%29);
  }
  return out;
}
/** Maximum exact matches after deleting any five outputs, order intact.
 * @param {number[]} predicted @param {number[]} printed */
function bestFiveDeletions(predicted,printed){
  assert.equal(predicted.length,6400);assert.equal(printed.length,6395);
  let dp=new Int32Array(6).fill(-100000);dp[0]=0;
  for(let i=0;i<6400;i++){
    const next=new Int32Array(6).fill(-100000);
    for(let skips=0;skips<=5;skips++){
      const j=i-skips;
      if(j>=0&&j<6395)next[skips]=Math.max(next[skips],
        dp[skips]+Number(predicted[i]===printed[j]));
      if(skips>0)next[skips]=Math.max(next[skips],dp[skips-1]);
    }
    dp=next;
  }
  return dp[5];
}
const results=Object.entries(hashes).map(([name,hash])=>{
  const predicted=predict(A,hash);
  const direct=predicted.slice(0,B.length).reduce((s,x,i)=>s+Number(x===B[i]),0);
  return {name,direct,withAnyFiveDeletions:bestFiveDeletions(predicted,B)};
});
assert.deepEqual(results.map(x=>x.direct),[239,208,228,226,215,242,249,220]);
assert.deepEqual(results.map(x=>x.withAnyFiveDeletions),[264,261,267,270,281,277,281,294]);
const p57=corpus.pages[57].indices;
assert.equal(p57.length,95);
const planted=predict(Array.from({length:6561},(_,i)=>p57[i%p57.length]),hashes.gaussPrime);
const omit=new Set([0,127,3200,5599,6399]);
const plantedTarget=planted.filter((_,i)=>!omit.has(i));
assert.equal(bestFiveDeletions(planted,plantedTarget),6395);

/**
 * Check the more directly clue-motivated difference and gradient rules:
 * shedding a row and column is exactly a finite-difference 81x81->80x80
 * operation. All eight rotations/reflections and both output registers
 * are granted; no fitted key or extra symbol changes.
 * @param {number[]} predicted
 * @param {number} rotation
 * @param {number} mirror
 * @returns {number[]}
 */
function orient80(predicted, rotation, mirror) {
  const out = new Array(6400);
  for (let r = 0; r < 80; r++) for (let c = 0; c < 80; c++) {
    let x = r, y = mirror ? 79 - c : c;
    for (let k = 0; k < rotation; k++) [x, y] = [y, 79 - x];
    out[r * 80 + c] = predicted[x * 80 + y];
  }
  return out;
}
const stencil = {
  mixedDifference: ([a, b, c, d]) => a - b - c + d,
  primeMixedDifference: ([a, b, c, d]) =>
    prime[a] - prime[b] - prime[c] + prime[d],
  horizontalGradient: ([a, b, c, d]) => a + b - c - d,
  verticalGradient: ([a, b, c, d]) => a + c - b - d,
  primeHorizontalGradient: ([a, b, c, d]) =>
    prime[a] + prime[b] - prime[c] - prime[d],
  primeVerticalGradient: ([a, b, c, d]) =>
    prime[a] + prime[c] - prime[b] - prime[d],
  rectangleProduct: ([a, b, c, d]) => (a - c) * (b - d)
};
const differenceResults = [];
for (const [name, hash] of Object.entries(stencil)) {
  const field = [];
  const tableMapped = [];
  for (let r = 0; r < 80; r++) for (let c = 0; c < 80; c++) {
    const z = r * 81 + c;
    const q = [A[z], A[z + 1], A[z + 81], A[z + 82]];
    const n = hash(q);
    field.push(mod(n, 29));
    tableMapped.push(table[mod(n, 256)] % 29);
  }
  for (const [register, proposed] of [['GF29', field], ['p50Table', tableMapped]]) {
    let optimal = {matching: -1, rotation: -1, mirror: -1};
    for (let rotation = 0; rotation < 4; rotation++) {
      for (let mirror = 0; mirror < 2; mirror++) {
        const matching = bestFiveDeletions(orient80(proposed, rotation, mirror), B);
        if (matching > optimal.matching) {
          optimal = {matching, rotation, mirror};
        }
      }
    }
    differenceResults.push({name, register, ...optimal});
  }
}
assert.deepEqual(differenceResults.map(x => x.matching),
  [296, 290, 292, 296, 297, 275, 285, 295, 295, 283, 271, 298, 287, 287]);
assert(differenceResults.every(x => x.matching < 6400 - 5));

console.log(JSON.stringify({source:'original 12956 GP runes; original p50 256 source bytes',
  test:'2x2 81²->80² with five arbitrary omissions, eight table hashes and seven difference rules in GF29 and source table with eight D4 rotations',
  results, differenceResults, exactPlantMatches:6395,unknownPlaintextRecovered:false},null,2));
