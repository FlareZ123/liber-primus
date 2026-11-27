"use strict";
const assert = require("node:assert/strict");
/** @param {number} a @param {number} b */
function gcd(a,b){while(b){[a,b]=[b,a%b];}return a;}
/** @param {number} a @param {number} b */
function cf(a,b){const q=[];while(b){q.push(Math.floor(a/b));[a,b]=[b,a%b];}return q;}
/** @param {number[]} q */
function fraction(q){let n=1,d=0;for(let i=q.length-1;i>=0;i--){[n,d]=[q[i]*n+d,n];}return [n,d];}
const grid=[[3258,3222,3152,3038],[3278,3299,3298,2838],[3288,3294,3296,2472],[4516,1206,708,1820]];
const steps="ESWWNNEEESSSWWW", moves={E:[0,1],S:[1,0],W:[0,-1],N:[-1,0]};
let r=1,c=1;const printed=[grid[r][c]],seen=new Set(["1,1"]);
for(const s of steps){r+=moves[s][0];c+=moves[s][1];assert(!seen.has(r+","+c));seen.add(r+","+c);printed.push(grid[r][c]);}
assert.equal(seen.size,16);
const fib=[0,1,2];while(fib.length<16)fib.push(fib.at(-1)+fib.at(-2));
const ord=fib.map(v=>v+1), primes=[];
for(let n=2;primes.length<ord.at(-1);n++)if(!primes.some(p=>p*p<=n&&n%p===0))primes.push(n);
const prime=ord.map(n=>primes[n-1]);
assert.deepEqual(prime.map(p=>Math.abs(3301-p)),printed);
assert.deepEqual(cf(13,8),[1,1,1,1,2]);
assert.deepEqual(fraction([1,3,2]),[9,7]);
/** @param {number[]} seq */
function analyze(seq){
 const pairs=seq.slice(1).map((b,i)=>{const a=seq[i],g=gcd(a,b),q=cf(b,a),reduced=[b/g,a/g];assert.deepEqual(fraction(q),reduced);return {g,q,reduced};});
 const determinants=pairs.slice(1).map((b,i)=>{const a=pairs[i].reduced;return Math.abs(a[0]*b.reduced[1]-b.reduced[0]*a[1]);});
 const golden=pairs.map(({q})=>q.at(-1)===2&&q.slice(0,-1).every(v=>v===1));
 return {pairs,determinants,unit:determinants.filter(v=>v===1).length,golden:golden.filter(Boolean).length};
}
const result={printed:analyze(printed),prime:analyze(prime),ordinal:analyze(ord),fib:analyze(fib.slice(1))};
assert.deepEqual(Object.values(result).map(x=>x.unit),[1,1,7,13]);
assert.equal(result.fib.golden,14);
assert.deepEqual(result.fib.pairs.map(x=>x.q.length),Array.from({length:14},(_,i)=>i+1));
console.log(JSON.stringify({printed,prime,ord,fib,result},null,2));
