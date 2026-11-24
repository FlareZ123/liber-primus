// Agent35: source-defined prime-phrase key and latent-clock inverse controls.
'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const A=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const G=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const ix=new Map(A.runes.map((x,i)=>[x,i]));
const tape=s=>[...s].filter(x=>ix.has(x)).map(x=>ix.get(x));
const units=s=>s.replace(/[\/\s]/g,'').split(/[.&$]+/).map(tape).filter(x=>x.length);
const mod=x=>(x%29+29)%29;
const sum=s=>s.reduce((v,x)=>v+A.prime[x],0);
function prime(n){if(n<2)return false;for(let j=2;j*j<=n;j++)if(n%j===0)return false;return true;}
const lp1=read('resources/transcriptions/lp1_wulfic_canonical.txt');
const p=lp1.trim().split('%');
const q=read('resources/transcriptions/lp2-image-corrected.txt').trim().split('%');
const native=G.sections.map(s=>tape(s.source_text));
const paint=(s,P)=>{let i=0;const o=[...s].map(x=>ix.has(x)?A.runes[P[i++]]:x).join('');assert.equal(i,P.length);return o;};
const W=tape(p[0]),wu=units(p[0]).slice(1);
function affine(u,k){
  const out=[];
  for(let a=1;a<29;a++)for(let b=0;b<29;b++){
    const sums=u.map(s=>sum(s.map(x=>mod(a*x+b))));
    if(sums.slice(0,k).every(prime))out.push({a,b,sums});
  }
  return out;
}
const affineCounts=wu.map((_,i)=>affine(wu,i+1).length);
assert.deepEqual(affineCounts,[75,14,2,1,1,1,1,1,1]);
const chosen=affine(wu,4)[0];
assert.deepEqual(chosen,{a:28,b:28,sums:[757,1009,691,353,769,911,1051,859,677]});
assert(chosen.sums.slice(4).every(prime));
assert.deepEqual(W.map(x=>mod(chosen.a*x+chosen.b)),native[0]);
const P=native[1],C=tape(lp1.split('$')[1]),K=[...'DIUINITY'].map(x=>A.translit.indexOf(x));
const L=K.length,N=C.length;
const encode=P=>{let k=0;return P.map(x=>x===0?0:mod(x+K[k++%L]));};
assert.deepEqual(encode(P),C);
const koan=p.slice(4,8).join('');
const sections=[paint(p[0],native[0]),paint(p.slice(1,3).join(''),native[1]),p[3],
 paint(koan,tape(koan).map(x=>mod(2-x))),p.slice(8,12).join(''),paint(p.slice(12,14).join(''),native[5]),p[14],
 paint(q[55],native[7]),q[56]];
// The native external first-KOAN register differs by two runes: use the
// source ciphertext and exact reversed-Caesar inverse for phrase boundaries.
for(let i=0;i<sections.length;i++)if(i!==3)assert.deepEqual(tape(sections[i]),native[i]);
const u=sections.map(units);
const selected=[[0,[1,2,3,4,5,6,7,8,9]],[1,[9,10,11,12]],[2,[1,2,3]],[3,[21]],[4,[17,18,19,21,22]],[6,[1,2,3,4]],[8,[1,2,3]]];
const body=selected.map(([i,js])=>({section:i,indices:js,sums:js.map(j=>sum(u[i][j]))}));
assert.equal(body.flatMap(x=>x.sums).length,29);
assert(body.every(x=>x.sums.every(prime)));
assert.equal(sum(u[1][13]),1271);
assert.equal(sum(u[1][13].slice(12)),751);
// The separate AN INSTRUCTION rubric on other pages has length12; here the
// rubric and command share one small red line and one terminal punctuation.
const ranges=[[400,422],[422,444],[444,465],[465,485],[497,515]];
assert.deepEqual(ranges.map(([a,b])=>sum(P.slice(a,b))),[1009,991,991,941,751]);
const edges=(t,k)=>{
  const p=mod(C[t]-K[k]);
  return [...(C[t]===0?[[0,k]]:[]),...(p!==0?[[p,(k+1)%L]]:[])];
};
const B=Array.from({length:N+1},()=>Array(L).fill(0n));B[N].fill(1n);
for(let t=N-1;t>=16;t--)for(let k=0;k<L;k++)for(const [,j] of edges(t,k))B[t][k]+=B[t+1][j];
const paths=[],path=P.slice(0,16);
function walk(t,k){
 if(t===N){paths.push(path.slice());return;}
 for(const [p,j] of edges(t,k))if(B[t+1][j]){path.push(p);walk(t+1,j);path.pop();}
}
walk(16,0);
const gold=s=>s.every((x,i)=>x===P[i]);
function stats(pool){return {paths:pool.length,forced:Array.from({length:N-16},(_,j)=>new Set(pool.map(s=>s[j+16])).size===1).filter(Boolean).length,gold:pool.some(gold)};}
const counts=[stats(paths)];let pool=paths;
for(const [a,b] of ranges){pool=pool.filter(s=>prime(sum(s.slice(a,b))));counts.push(stats(pool));}
assert.deepEqual(counts.map(x=>x.paths),[2240,960,480,480,240,90]);
assert.deepEqual(counts.map(x=>x.forced),[143,378,399,399,405,405]);
assert(counts.every(x=>x.gold));
for(const p of pool)assert.deepEqual(encode(p),C);
function rank(ids,order,pool){
 const size=29**(order-1),counts=new Float64Array(size*29),totals=new Float64Array(size);
 for(const id of ids){const s=native[id];for(let i=order-1;i<s.length;i++){
  let ctx=0;for(let j=i-order+1;j<i;j++)ctx=ctx*29+s[j];
  counts[ctx*29+s[i]]++;totals[ctx]++;
 }}
 const log=counts.map((n,i)=>Math.log((n+.1)/(totals[Math.floor(i/29)]+.1*29)));
 const score=p=>{let z=0;for(let i=16;i<p.length;i++){let ctx=0;for(let j=i-order+1;j<i;j++)ctx=ctx*29+p[j];z+=log[ctx*29+p[i]];}return z;};
 const truth=score(P),scores=pool.map(p=>({score:score(p),errors:p.filter((x,i)=>x!==P[i]).length})).sort((a,b)=>b.score-a.score);
 return {rank:1+scores.filter(s=>s.score>truth+1e-9).length,bestErrors:scores[0].errors,margin:scores[0].score-scores[1].score};
}
const models=[[0,2,3,4,6],[0,2,4,6],[7,8]].map(ids=>({ids,orders:[1,2,3].map(order=>({order,raw:rank(ids,order,paths),primeGate:rank(ids,order,pool)}))}));
assert.equal(models[2].orders[1].raw.rank,7);
assert.equal(models[2].orders[1].primeGate.rank,1);
assert.equal(models[2].orders[1].primeGate.bestErrors,0);
const p0=units(q.slice(0,3).join('')).slice(1);
const p0Counts=p0.map((_,i)=>affine(p0,i+1).length);
assert.deepEqual(p0Counts,[92,11,0,0,0,0,0,0]);
console.log(JSON.stringify({body,combinedRedInstruction:1271,commandAlone:751,
 warning:{affineCounts,chosen},welcome:{ranges,counts,models},conditionalP0AffineCounts:p0Counts},null,2));
