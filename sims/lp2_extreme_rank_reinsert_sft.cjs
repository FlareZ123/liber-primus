'use strict';
// Exact all-initial-deck endpoint reinsert (MTF/MTB) original-input gate.
// Inputs: canonical physical LP2 corpus and the same 3 GP29 literary donors
// used by the general rank synchronizer.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const A=29;
const donorFiles=[
 'resources/control/gibran_prophet_58585.txt',
 'resources/control/shakespeare_first300k.txt',
 'resources/control/emerson_essays_2944.txt'
];
const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
function native(t){
 const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);
 const b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);
 const p=[];
 for(const w0 of t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]){
  const w=w0.replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
  for(let j=0;j<w.length;){
   const v=w.startsWith('ING',j)?{i:21,t:'ING'}:w.startsWith('IO',j)?{i:27,t:'IO'}:tokens.find(x=>w.startsWith(x.t,j));
   assert(v,'cannot convert '+w.slice(j));p.push(v.i);j+=v.t.length;
  }
 }return p;
}
function inverse(c,k){
 assert(k===0||k===28);
 const deck=Array.from({length:A},(_,i)=>i);
 const rank=[],hist=Array(A).fill(0),seen=new Set();
 let sync=-1;
 for(let i=0;i<c.length;i++){
  const x=c[i],v=deck.indexOf(x);
  assert(v>=0);
  rank.push(seen.size===A?v:-1);
  if(seen.size===A)hist[v]++;
  deck.splice(v,1);deck.splice(k,0,x);
  seen.add(x);
  if(sync<0&&seen.size===A)sync=i+1;
 }
 if(sync<0)return {sync:null,n:0,mode:null,top3:null,rank,hist};
 const n=c.length-sync,h=hist.slice().sort((a,b)=>b-a);
 assert.equal(hist.reduce((a,b)=>a+b,0),n);
 return {sync,n,mode:h[0],top3:h[0]+h[1]+h[2],rank,hist};
}
function encrypt(p,k,initial){
 const d=initial.slice();
 return p.map(q=>{const x=d[q];d.splice(q,1);d.splice(k,0,x);return x});
}
function exactWindows(p,n,mode,top3){
 assert(n>1&&n<=p.length);
 const counts=new Int32Array(A);let windows=0,pass=0,minMode=Infinity,minTop3=Infinity;
 for(let i=0;i<p.length;i++){
  counts[p[i]]++;if(i>=n)counts[p[i-n]]--;
  if(i+1<n)continue;
  windows++;let a=0,b=0,c=0;
  for(const x of counts){
   if(x>=a){c=b;b=a;a=x}else if(x>=b){c=b;b=x}else if(x>c)c=x;
  }
  if(a<minMode)minMode=a;
  if(a+b+c<minTop3)minTop3=a+b+c;
  if(a<=mode&&a+b+c<=top3)pass++;
 }
 return {windows,pass,minMode,minTop3};
}
let seed=3301;
function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
function shuffled(){
 const a=Array.from({length:A},(_,i)=>i);
 for(let i=A-1;i>0;i--){const j=rng()%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;
}
const clear=Array.from(read('resources/transcriptions/lp1_wulfic_canonical.txt')).filter(c=>gp.runes.includes(c)).map(c=>gp.runes.indexOf(c));
const plants=[];
for(const k of [0,28])for(let t=0;t<4;t++){
 const p=clear.slice(0,1700),c=encrypt(p,k,shuffled()),d=inverse(c,k);
 assert(d.sync!==null);
 for(let i=d.sync;i<c.length;i++)assert.equal(d.rank[i],p[i]);
 plants.push({k,trial:t,sync:d.sync,exactSuffix:d.n});
}
const donors=donorFiles.map(file=>({file,native:native(read(file))}));
const scopes=[[0,55],[0,2],[8,14],[15,22],[40,53],[54,55]];
const results=[];
for(const [lo,hi] of scopes){
 const c=gp.pages.filter(p=>p.page>=lo&&p.page<=hi).flatMap(p=>p.indices);
 for(const k of [0,28]){
  const d=inverse(c,k);
  if(!d.n)continue;
  const benchmark=donors.map(x=>({file:x.file,...exactWindows(x.native,d.n,d.mode,d.top3)}));
  results.push({pages:[lo,hi],k,cipherN:c.length,sync:d.sync,n:d.n,mode:d.mode,top3:d.top3,benchmark});
 }
}

function pageResetMask(pages,k){
 let intervals=[],h=Array(A).fill(0),off=0,retainedN=0,unsynchronized=[];
 for(const pg of pages){
  const d=inverse(pg.indices,k);
  if(d.sync===null)unsynchronized.push(pg.page);
  else if(d.n){
   intervals.push([off+d.sync,off+pg.indices.length-1]);retainedN+=d.n;
   for(let x=0;x<A;x++)h[x]+=d.hist[x];
  }
  off+=pg.indices.length;
 }
 let sorted=h.slice().sort((x,y)=>y-x);
 assert.equal(h.reduce((a,b)=>a+b,0),retainedN);
 return {N:off,retainedN,intervals,hist:h,unsynchronized,mode:sorted[0],top3:sorted[0]+sorted[1]+sorted[2]};
}
function maskedNativeWindows(p,m){
 const h=new Int32Array(A),end=p.length-m.N;
 assert(end>=0);
 for(const [a,b] of m.intervals)for(let j=a;j<=b;j++)h[p[j]]++;
 let windows=0,pass=0,minMode=Infinity,minTop3=Infinity;
 for(let shift=0;shift<=end;shift++){
  windows++;let a=0,b=0,c=0;
  for(const v of h){if(v>=a){c=b;b=a;a=v}else if(v>=b){c=b;b=v}else if(v>c)c=v;}
  minMode=Math.min(minMode,a);minTop3=Math.min(minTop3,a+b+c);
  if(a<=m.mode&&a+b+c<=m.top3)pass++;
  if(shift<end)for(const [lo,hi] of m.intervals){h[p[shift+lo]]--;h[p[shift+hi+1]]++;}
 }
 return {windows,pass,minMode,minTop3};
}
const pageReset=[];
for(const k of [0,28]){
 const pages=gp.pages.filter(p=>p.page<=55),m=pageResetMask(pages,k);
 const benchmark=donors.map(x=>({file:x.file,...maskedNativeWindows(x.native,m)}));
 const planted=[];
 for(let t=0;t<2;t++){
  const plain=donors[t].native.slice(0,m.N);assert.equal(plain.length,m.N);
  let off=0,coveredPages=0,recovered=0;
  for(const pg of pages){
   const p=plain.slice(off,off+pg.indices.length),cipher=encrypt(p,k,shuffled()),d=inverse(cipher,k);
   if(d.sync!==null){coveredPages++;for(let i=d.sync;i<p.length;i++){assert.equal(d.rank[i],p[i]);recovered++;}}
   off+=pg.indices.length;
  }
  planted.push({trial:t,coveredPages,exactSuffix:recovered});
 }
 pageReset.push({k,N:m.N,retainedN:m.retainedN,mode:m.mode,top3:m.top3,unsynchronized:m.unsynchronized,benchmark,planted});
}

console.log(JSON.stringify({schema:'lp2-endpoint-reinsert-v2',plants,results,pageReset},null,2));
module.exports={inverse,encrypt,exactWindows,native,pageResetMask,maskedNativeWindows};
