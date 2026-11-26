'use strict';
// Agent43, Director #2879. Exact integer constraints, no GP prime sums.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const lp1 = fs.readFileSync(path.join(root, 'resources/transcriptions/lp1_wulfic_canonical.txt'), 'utf8');
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const numeric = x => /^\d+$/.test(x);
const squares = lp1.split("ᚳᚾᚩᚹ-ᚦᛁᛋ./\n").slice(1).map(s => s.split('\n').slice(0, 5).map(l => l.replace(/\/$/, '').split('-')));
assert.equal(squares.length, 2);
const [train, held] = squares;
const words = [...new Set(train.flat().filter(x => !numeric(x)))];
assert.equal(words.length, 11);
const lines = s => [...s, ...s[0].map((_, i) => s.map(r => r[i])), s.map((r,i) => r[i]), s.map((r,i) => r[s.length-1-i])];
const gcd = (a,b) => { a=a<0n?-a:a; b=b<0n?-b:b; while(b) [a,b]=[b,a%b]; return a; };
const normalize = r => { const g=r.reduce(gcd,0n)||1n; return r.map(x=>x/g); };
/** @param {bigint[][]} input */
function reduce(input) {
  const rows=input.map(r=>r.slice()), pivots=[];
  let rank=0;
  for(let c=0;c<12;c++){
    const i=rows.findIndex((r,i)=>i>=rank&&r[c]!==0n);
    if(i<0) continue;
    [rows[i],rows[rank]]=[rows[rank],rows[i]];
    const p=rows[rank]=normalize(rows[rank]);
    for(let j=0;j<rows.length;j++) if(j!==rank&&rows[j][c]!==0n){
      const r=rows[j]; rows[j]=normalize(r.map((x,k)=>x*p[c]-r[c]*p[k]));
    }
    pivots.push(c); rank++;
  }
  assert(rows.every(r=>r.slice(0,12).some(x=>x!==0n)||r[12]===0n));
  return {rank,pivots,rows};
}
const magic=lines(train).map(l=>[...words.map(v=>BigInt(l.filter(x=>x===v).length)),-1n,-l.reduce((s,x)=>s+(numeric(x)?BigInt(x):0n),0n)]);
const flat=train.flat();
const sym=Array.from({length:12},(_,i)=>{
  const x=flat[i], y=flat[24-i];
  return [...words.map(v=>BigInt(Number(x===v)-Number(y===v))),0n,(numeric(y)?BigInt(y):0n)-(numeric(x)?BigInt(x):0n)];
});
const bare=reduce(magic), one=reduce([...magic,sym[11]]), full=reduce([...magic,...sym]);
assert.deepEqual([bare.rank,one.rank,full.rank],[11,12,12]);
const solve=r=>r.pivots.map((c,i)=>{const a=r.rows[i][c],b=r.rows[i][12];assert.equal(b%a,0n);return b/a;});
const x=solve(one);
assert.deepEqual(x,solve(full));
const valid=(r,x)=>r.slice(0,12).reduce((s,a,i)=>s+a*x[i],0n)===r[12];
assert([...magic,...sym].every(r=>valid(r,x)));
const totals=[];
for(let t=761n;t<=1227n;t++){
  const v=bare.pivots.map((c,i)=>{const r=bare.rows[i],n=r[12]-r[11]*t;return n%r[c]===0n?n/r[c]:null;});
  if(v.every(a=>a!==null&&a>0n)&&magic.every(r=>valid(r,[...v,t]))) totals.push(Number(t));
}
assert.equal(totals.length,78);
const heldSums=lines(held).map(l=>l.reduce((s,a)=>s+Number(a),0));
assert(heldSums.every(v=>v===heldSums[0]));
assert(held.flat().every((v,i)=>v===held.flat()[24-i]));
// Original owner ZIP image 32.jpg, p15: printed values and established spiral.
const p15=[[3258,3222,3152,3038],[3278,3299,3298,2838],[3288,3294,3296,2472],[4516,1206,708,1820]];
const route=[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12], spiral=route.map(i=>p15.flat()[i]);
const ring=[];
for(const sign of [1,-1]) for(let start=0;start<16;start++){
  const a=Array.from({length:16},(_,i)=>spiral[(start+sign*i+16)%16]);
  const sums=[0,4,8,12].map(k=>Array.from({length:5},(_,i)=>a[(k+i)%16]).reduce((x,y)=>x+y,0));
  ring.push({sign,start,sums,spread:Math.max(...sums)-Math.min(...sums)});
}
const tokens=grid.pages.flatMap(p=>p.tokens);
assert.equal(tokens.length,256);
assert.equal(new Set(tokens).size,161);
const out={train:{ranks:[bare.rank,one.rank,full.rank],wordValues:Object.fromEntries(words.map((w,i)=>[w,Number(x[i])])),total:Number(x[11]),positiveTotals:totals,otherOppositePairsSatisfied:11},heldout:{lineTotals:heldSums,oppositePairs:12},p15:{distinct:new Set(p15.flat()).size,directLines:lines(p15).map(l=>l.reduce((s,x)=>s+x,0)),ring,minSpread:Math.min(...ring.map(r=>r.spread)),validCompletions:ring.filter(r=>r.spread===0).length,centro5x5MaxDistinct:13},p49to51:{distinct:new Set(tokens).size,centroMaxDistinct:128}};
assert.equal(out.p15.minSpread,4926);
assert.equal(out.p15.validCompletions,0);
console.log(JSON.stringify(out,null,2));
