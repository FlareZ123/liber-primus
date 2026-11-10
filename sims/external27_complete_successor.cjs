"use strict";
/**
 * Enumerate the exact published Reports 00-15 successor relation on original
 * LP2 pages 0-2 (27 by 27 runes), including complete squarefree-GCD checks.
 * The published route and its plaintext remain unauthenticated hypotheses.
 *
 * Positive control: predecessor AS, proposed I ASK successor (block 38).
 * Prospective gate: predecessor I ASK, every admissible block 39 (no crib).
 *
 * node sims/external27_complete_successor.cjs
 * LP27_DICT=<path-to-textblob-en-spelling.txt> LP27_MONTE=350 node sims/external27_complete_successor.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const GP=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const GRID=GP.pages.filter(p=>p.page<3).flatMap(p=>p.indices);
assert.equal(GRID.length,729);
const RUNES=GP.translit,PRIMES=GP.prime;
const mu=new Int8Array(3000),phi=new Uint16Array(3000);
for(let n=1;n<3000;n++){
 let rem=n,sign=1,res=n;
 for(let p=2;p*p<=rem;p++)if(rem%p===0){
  res-=res/p;rem/=p;sign=-sign;
  if(rem%p===0)sign=0;
  while(rem%p===0)rem/=p;
 }
 if(rem>1){res-=res/rem;if(sign!==0)sign=-sign;}
 mu[n]=sign;phi[n]=res;
}
const c=(r,col)=>[r,col],n0=([r,col])=>27*(r-1)+col;
const n1=([r,col])=>27*(col-1)+28-r;
const n2=x=>730-n0(x),n3=x=>730-n1(x);
const at=([r,col])=>GRID[n0([r,col])-1];
const mod=(a,n)=>((a%n)+n)%n;
const gcd=(a,b)=>{while(b){const t=b;b=a%b;a=t;}return a;};
const same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
const left=cells=>cells.reduce((a,b)=>b[1]<a[1]||(b[1]===a[1]&&b[0]>a[0])?b:a);
const Z=node=>node.reduce((a,b)=>b[0]>a[0]||(b[0]===a[0]&&b[1]>a[1])?b:a);
const score=(L,B)=>{const dr=Math.abs(B[0]-L[0]),dc=Math.abs(B[1]-L[1]);return Math.min(dr,dc,Math.abs(dr-dc));};
const gpSum=node=>node.reduce((s,x)=>s+PRIMES[at(x)],0);
const mode=S=>{const q=Math.floor(S/7)%4;return {reflected:q===1||q===2,offset:q===0||q===2?1:0};};
/** @param {{cipher:number[][],node:number[][],S:number,a:number,phase:number}} prev */
function forecast(prev){
 const [B,E]=[prev.cipher[0],prev.cipher.at(-1)],L=left(prev.cipher),M=prev.node[1],z=Z(prev.node),h=at(M),m=mode(prev.S);
 const nextPhase=mod(m.offset+prev.cipher.reduce((s,x)=>s+mu[m.reflected?n2(x):n0(x)],0),3);
 const nextOuter=mod(prev.a+mu[n1(L)],2),nextS=prev.S+nextPhase;
 const signatures=[[[0,0,0],[1,1,1]],[[0,1,0],[1,-1,1]],[[0,-1,0],[1,0,1]]];
 const qaxis=mu[n2(B)+n0(M)]+mu[gcd(n1(E),n2(E))];
 const cipherAxis=qaxis===0?'horizontal':qaxis>0?'vertical':'diagonal';
 const tau=mod(mu[n3(E)]+phi[h],2);
 const centerCol=mod(1+B[0]+E[0]+M[0],2);
 const centerRow=mod(1+B[1]+E[0]+M[0]+mu[n2(B)],2);
 const endpointRow=mod(1+prev.phase+mu[n2(M)],2);
 const leftRow=mod(centerRow+1+prev.phase+mu[M[0]],2);
 const s90=prev.cipher.reduce((s,x)=>s+mu[n1(x)],0);
 const centerIndex=[n2(M),n3(M),n0(M)][prev.phase];
 const mirror=Number(at(prev.node[0])===at(prev.node[2]));
 const leftCol=mod(B[0]+s90+mirror+mu[centerIndex],2);
 const q=mu[n0(E)]===0&&mu[n3(E)]===0,z0=mu[n0(B)]===0&&mu[n1(B)]===0;
 const ray=Number(q&&!z0),dist=Math.max(Math.abs(z[0]-L[0]),Math.abs(z[1]-L[1]));
 const nextMirror=Number(dist%3!==2);
 const X=n1(M)+n2(z),Y=n1(L)+n2(z),b=Number((mu[X]<0)===(mu[Y]<0));
 const d=Number(mu[gcd(n1(M),n3(z))]<0)^Number(mu[gpSum(prev.node)]>0)^Number(mu[n0(M)+n3(z)]!==0);
 const sourceAxis=2*b+d;
 const radiusParity=mod(M[0]+M[1]+B[0]+B[1],2)^Number(mu[gcd(n2(z),n2(L))]<0)^Number(mu[n1(B)+n1(E)]>0);
 return {nextPhase,nextOuter,nextS,signature:signatures[nextPhase][nextOuter],cipherAxis,tau,centerCol,centerRow,endpointRow,leftRow,leftCol,ray,nextMirror,sourceAxis,radiusParity,mode:mode(nextS),prevLeft:L,forbid:nextPhase===2&&prev.S%7===6};
}
/** Enumerate all original three-rune source nodes and both center operations. */
function sources(f){
 const dirs=[[0,1],[1,1],[1,0],[1,-1]],out=[];
 for(let r=1;r<=27;r++)for(let col=1;col<=27;col++){
  if(r%2!==f.centerRow||col%2!==f.centerCol)continue;
  for(let radius=1;radius<=13;radius++){
   if(radius%2!==f.radiusParity)continue;
   const [dr,dc]=dirs[f.sourceAxis];
   const a=c(r-radius*dr,col-radius*dc),b=c(r+radius*dr,col+radius*dc);
   if([a,b].some(([rr,cc])=>rr<1||rr>27||cc<1||cc>27))continue;
   for(const node of [[a,c(r,col),b],[b,c(r,col),a]]){
    const orig=node.map(at);
    if(orig.some(x=>x===0))continue;
    if(Number(orig[0]===orig[2])!==f.nextMirror)continue;
    for(const transformed of [false,true]){
     const key=[orig[0],transformed?phi[orig[1]]:orig[1],orig[2]];
     if(key.some(x=>!x))continue;
     const signature=key.map(x=>mu[phi[x]]);
     if(!signature.every((x,i)=>x===f.signature[i]))continue;
     const phase=mod(signature.reduce((a,b)=>a+b,0),3);
     assert.equal(phase,f.nextPhase);
     out.push({node,aligned:[...key.slice(phase),...key.slice(0,phase)],transformed});
    }
   }
  }
 }
 return out;
}
/** Enumerate straight-line ciphertext segments independent of next key content. */
function segments(f){
 const dirs=f.cipherAxis==='horizontal'?[[0,f.tau?1:-1]]:f.cipherAxis==='vertical'?[[f.tau?-1:1,0]]:f.tau?[[1,1],[-1,1]]:[[1,-1],[-1,-1]];
 const out=[];
 for(let r=1;r<=27;r++)for(let col=1;col<=27;col++)for(const [dr,dc]of dirs){
  const B=c(r,col);
  if(score(f.prevLeft,B)!==f.ray)continue;
  for(let len=2;len<=27;len++){
   const E=c(r+dr*(len-1),col+dc*(len-1));
   if(E.some(x=>x<1||x>27))break;
   const L=f.tau?B:E;
   if(E[0]%2!==f.endpointRow||L[0]%2!==f.leftRow||L[1]%2!==f.leftCol)continue;
   if(![0,f.mode.reflected?-1:1].includes(mu[n1(L)]))continue;
   const cells=Array.from({length:len},(_,i)=>c(r+dr*i,col+dc*i));
   assert(same(left(cells),L));
   out.push({cells,B,E,L,raw:cells.map(at)});
  }
 }
 return out;
}
/** Complete original-input source/cipher joint filter; all source clocks fixed. */
function find(prev){
 const f=forecast(prev);
 if(f.forbid)return {f,source:[],seg:[],survivors:[]};
 const source=sources(f),seg=segments(f),survivors=[];
 for(const src of source)for(const ciph of seg){
  const M=src.node[1],{B,E,L}=ciph;
  if(mu[gcd(n0(M),n0(B))]===0||mu[gcd(n0(M),n0(L))]===0||mu[gcd(n1(M),n3(E))]===0||mu[gcd(n0(M),n2(E))]===0)continue;
  const indices=ciph.raw.map((x,i)=>mod(x-src.aligned[i%3],29));
  survivors.push({source:src,cipher:ciph,indices,plaintext:indices.map(i=>RUNES[i]).join('')});
 }
 return {f,source,seg,survivors};
}
const prev37={node:[c(4,14),c(6,16),c(8,18)],cipher:[c(22,2),c(22,1)],phase:2,S:32,a:1};
const prev38={node:[c(11,13),c(12,13),c(13,13)],cipher:[c(5,17),c(6,17),c(7,17),c(8,17)],phase:0,S:32,a:0};
assert.deepEqual(prev37.node.map(at),[11,17,14]);
assert.deepEqual(prev38.node.map(at),[16,19,28]);
const block38=find(prev37),block39=find(prev38);
assert.equal(block38.survivors.length,21342);
const hits=block38.survivors.filter(x=>x.plaintext==='IASC');
assert.equal(hits.length,1);
assert.deepEqual(hits[0].cipher.cells,prev38.cipher);
assert.deepEqual(hits[0].source.node,prev38.node);
assert.equal(block39.source.length,172);
assert.equal(block39.seg.length,132);
assert.equal(block39.survivors.length,21818);
console.log('Block38 original-grid control:',block38.source.length,block38.seg.length,block38.survivors.length,'IASC hits',hits.length);
console.log('Block39 full successor:',block39.source.length,'source variants,',block39.seg.length,'cipher segments,',block39.survivors.length,'joint assignments,',new Set(block39.survivors.map(x=>x.plaintext)).size,'distinct strings');
console.log('Block39 forecast:',JSON.stringify(block39.f));
/** Build rune-strict English reference from external TextBlob/Norvig word counts. */
function lexicon(filename){
 const tokens=RUNES.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),words=new Map();
 for(const line of fs.readFileSync(filename,'utf8').split(/\r?\n/u)){
  const a=line.trim().split(/\s+/u);
  if(a.length!==2||!Number.isInteger(+a[1])||!/^[a-z]+$/u.test(a[0])||a[0].length<2)continue;
  const word=a[0].toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S');
  const enc=[];let i=0;
  while(i<word.length){
   const t=tokens.find(x=>word.startsWith(x.s,i));
   if(!t)break;
   enc.push(t.i);i+=t.s.length;
  }
  if(i!==word.length||enc.length<2||enc.length>27)continue;
  const key=enc.join(',');
  if(!words.has(key)||+a[1]>words.get(key).count)words.set(key,{count:+a[1],word:a[0]});
 }
 return words;
}
if(process.env.LP27_DICT){
 const words=lexicon(process.env.LP27_DICT),thresholds=[1,20,100];
 const measure=()=>{
  const res=find(prev38),hits=thresholds.map(th=>{
   const selection=res.survivors.filter(x=>(words.get(x.indices.join(','))?.count||0)>=th);
   return {assignments:selection.length,distinct:new Set(selection.map(x=>x.indices.join(','))).size};
  });
  return {sources:res.source.length,assignments:res.survivors.length,hits};
 };
 const observed=measure(),locked=new Set([...prev38.node,...prev38.cipher].map(x=>n0(x)-1));
 const swappable=Array.from({length:729},(_,i)=>i).filter(i=>!locked.has(i));
 const initial=Array.from(GRID),N=Number(process.env.LP27_MONTE||0);
 let seed=0x9a10c03d;
 const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
 const simulated=[];
 for(let j=0;j<N;j++){
  for(let i=swappable.length-1;i>0;i--){
   const t=random()%(i+1),ia=swappable[i],ib=swappable[t];
   [GRID[ia],GRID[ib]]=[GRID[ib],GRID[ia]];
  }
  simulated.push(measure());
 }
 GRID.splice(0,729,...initial);
 const nulls=thresholds.map((threshold,k)=>{
  const vals=simulated.map(x=>x.hits[k].distinct),v=observed.hits[k].distinct;
  const greaterEqual=vals.filter(x=>x>=v).length;
  return {threshold,mean:vals.reduce((a,b)=>a+b,0)/N,greaterEqual,addOneP:(greaterEqual+1)/(N+1)};
 });
 console.log('Lexical control:',JSON.stringify({seed:'0x9a10c03d',lexiconSize:words.size,locked:locked.size,N,observed,nulls}));
}
