'use strict';
// Agent45, Director #3284. Source: results/2013-original-gp29-source-map.md.
const assert = require('node:assert/strict');
const P = 29;
const primes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
const mod = x => ((x % P) + P) % P;
const directions = [...Array.from({length:P},(_,k)=>[1,k]),[0,1]];
const points = primes.map(v=>[Math.floor(v/P),v%P]);
const hist = (S,[a,b]) => {
  const counts = Array(P).fill(0);
  for(const [q,r] of S) counts[mod(a*q+b*r)]++;
  return counts;
};
const support = h=>h.filter(Boolean).length;
const equalOnSupport = (h,s) => support(h)===s && h.every(v=>v===0||v===h.reduce((a,b)=>a+b,0)/s);
function convolution(a,b,k) {
  const h=Array(P).fill(0);
  for(let i=0;i<P;i++) if(a[i]) for(let j=0;j<P;j++) if(b[j]) h[mod(i+k*j)]+=a[i]*b[j];
  return h;
}
function powmod(a,b) {let z=1; while(b--) z=z*a%P; return z;}
assert.equal(Array.from({length:28},(_,i)=>i+1).filter(i=>powmod(2,i)===1).join(','),'28');
function check(S) {
  const H=directions.map(d=>hist(S,d));
  const sizes=H.map(support), target=S.length;
  assert.equal(Math.max(...sizes),24);
  assert.deepEqual(directions.filter((_,i)=>sizes[i]===4),[[1,0]]);
  assert.equal(H.filter(h=>h.some(v=>v%2)).length,30);
  const rows=Array.from({length:4},(_,q)=>S.filter(v=>v[0]===q).map(v=>v[1]));
  const row0=rows[0]; const row0set=new Set(row0); const row0stabilizers=[];
  for(let d=1;d<P;d++) for(let e=0;e<P;e++) if(row0.every(r=>row0set.has(mod(d*r+e)))) row0stabilizers.push([d,e]);
  assert.deepEqual(row0stabilizers,[[1,0]]);
  const fullStabilizers=[];
  for(const [d,e] of row0stabilizers) for(let c=0;c<P;c++) if(rows.every((row,q)=>row.every(r=>row.includes(mod(c*q+d*r+e))))) fullStabilizers.push([c,d,e]);
  assert.deepEqual(fullStabilizers,[[0,1,0]]);
  // Overall output scale and translation preserve target uniform-on-support.
  // Each nonzero coefficient vector is a scalar times exactly one direction.
  let tested=0,uniform=0;
  for(const a of H) for(const b of H) for(let k=1;k<P;k++) {
    const h=convolution(a,b,k); tested++; uniform+=Number(equalOnSupport(h,target));
  }
  assert.equal(tested,25200); assert.equal(uniform,0);
  return {target,projectionSupport:sizes,oddHistogramDirections:H.filter(h=>h.some(v=>v%2)).length,rowSizes:rows.map(r=>r.length),row0Stabilizers:row0stabilizers,fullStabilizers,twoInputRowsTested:tested,twoInputUniformRows:uniform};
}
const all=check(points), held=check(points.slice(1));
const line=Array.from({length:P},(_,i)=>[0,i]);
assert(equalOnSupport(hist(line,[0,1]),P));
assert(equalOnSupport(convolution(hist(line,[0,1]),hist(line,[0,1]),7),P));
assert(equalOnSupport(hist(line.slice(1),[0,1]),28));
assert(!equalOnSupport(convolution(hist(line.slice(1),[0,1]),hist(line.slice(1),[0,1]),7),28));
console.log(JSON.stringify({directions,all,held,ordinalControlsPassed:4,orderOf2Mod29:28},null,2));
