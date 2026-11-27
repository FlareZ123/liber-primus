'use strict';
/**
 * Exact nonlinear symmetric nearest-neighbor inverse and broader repeat gate.
 * All data inputs are the repository's pinned canonical GP corpus and native reference files.
 * Run: node sims/lp2_cubic_center_neighbor_sft.cjs
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {encodeSourceNativeGP:enc}=require('./lp2_native_gp_source_orthography_sft.cjs');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ref=read('resources/liber-primus/lp1-plaintext-reference.txt');
const files=['resources/control/gibran_prophet_58585.txt','resources/control/shakespeare_first300k.txt','resources/control/emerson_essays_2944.txt'];
const train=enc(read(files[0]));
const mod=x=>(x%29+29)%29,cube=Array.from({length:29},(_,x)=>x*x*x%29);
const counts=new Float64Array(24389),den=new Float64Array(841);
for(let i=2;i<train.length;i++){const q=train[i-2]*29+train[i-1];counts[29*q+train[i]]++;den[q]++}
const log=Float64Array.from(counts,(x,i)=>Math.log((x+.5)/(den[Math.floor(i/29)]+14.5)));
const score=(p,lo=2,hi=p.length)=>{let s=0;for(let i=lo;i<hi;i++)s+=log[(p[i-2]*29+p[i-1])*29+p[i]];return s/(hi-lo)};
const sender=(p,k,R)=>p.map((x,i)=>mod((i?p[i-1]:k.L)+k.b*cube[x]+(i+1<p.length?p[i+1]:R)+k.d));
/** @param {number[]} c @param {{b:number,d:number,L:number,p0:number}} k */
function inverse(c,k){const p=[k.p0];let prev=k.L,cur=k.p0;for(const y of c){const next=mod(y-k.d-prev-k.b*cube[cur]);p.push(next);prev=cur;cur=next}return {p:p.slice(0,-1),R:p.at(-1)}}
/** @param {number[]} c @param {number} n @param {{b:number,d:number,L:number,p0:number}|undefined} truth */
function search(c,n,truth){
 let best=-Infinity,bestKey=null,ties=0,betterThanTruth=0,truthTies=0;
 const truthFit=truth?score(inverse(c,truth).p,2,n)*(n-2):null;
 const f=new Uint16Array(n-1);
 for(let b=1;b<29;b++){
  const tab=new Uint8Array(24389);
  for(let y=0;y<29;y++)for(let l=0;l<29;l++)for(let p=0;p<29;p++)tab[y*841+l*29+p]=mod(y-l-b*cube[p]);
  for(let d=0;d<29;d++){
   for(let i=0;i<n-1;i++)f[i]=mod(c[i]-d)*841;
   for(let L=0;L<29;L++)for(let p0=0;p0<29;p0++){
    let prev=p0,cur=tab[f[0]+L*29+p0],v=0;
    for(let i=1;i<n-1;i++){const q=prev*29+cur,next=tab[f[i]+q];v+=log[q*29+next];prev=cur;cur=next}
    if(v>best+1e-10){best=v;bestKey={b,d,L,p0};ties=1}else if(Math.abs(v-best)<=1e-10)ties++;
    if(truth){if(v>truthFit+1e-10)betterThanTruth++;else if(Math.abs(v-truthFit)<=1e-10)truthTies++}
   }
  }
 }
 const inv=inverse(c,bestKey),replay=sender(inv.p,bestKey,inv.R).every((x,i)=>x===c[i]);
 let fixedEndpointPaths=0;if(truth){const R=inverse(c,truth).R;for(let p0=0;p0<29;p0++)if(inverse(c,{...truth,p0}).R===R)fixedEndpointPaths++}
 const trueP=truth?inverse(c,truth).p:null;
 return {key:bestKey,ties,fit:best/(n-2),held:score(inv.p,n,c.length),R:inv.R,replay,bestFitPlain:inv.p.slice(0,60).map(x=>gp.translit[x]).join(' '),heldPlain:inv.p.slice(n).map(x=>gp.translit[x]).join(' '),...(truth?{truth,truthFit:truthFit/(n-2),truthHeld:score(trueP,n,c.length),betterThanTruth,truthTies,fixedEndpointPaths,correct:inv.p.filter((x,i)=>x===trueP[i]).length,heldCorrect:inv.p.slice(n).filter((x,i)=>x===trueP[i+n]).length}:{})};
}
/** All 784 normalized nonlinear forward senders, interior repeats only. */
function repeatGate(p,n,actual){
 const D=Uint8Array.from(p.slice(1),(x,i)=>mod(x-p[i])),E=Uint8Array.from(p.slice(1),(x,i)=>mod(cube[x]-cube[p[i]]));
 const mul=Array.from({length:29},(_,b)=>Uint8Array.from({length:29},(_,x)=>b*x%29));
 const N=D.length-2,W=n-3,hit=new Uint8Array(N);
 let min=Infinity,max=0,which=null,keysPass=0,windowPass=0,symMin=Infinity,symWhich=null;
 for(let b=1;b<29;b++){const B=mul[b];for(let c=1;c<29;c++){const C=mul[c];let sum=0,m=Infinity,localMax=0,at=0,pass=0;
  for(let i=0;i<N;i++){const x=D[i]+B[E[i+1]]+C[D[i+2]],z=+(x===0||x===29||x===58);hit[i]=z;sum+=z;if(i>=W)sum-=hit[i-W];if(i>=W-1){if(sum<m){m=sum;at=i-W+1}if(sum>localMax)localMax=sum;if(sum<=actual)pass++}}
  if(m<min){min=m;which={b,c,at}}if(c===1&&m<symMin){symMin=m;symWhich={b,c,at}}if(localMax>max)max=localMax;if(pass){keysPass++;windowPass+=pass}
 }}
 return {length:p.length,windows:p.length-n+1,keys:784,min,max,which,keysPass,windowPass,symMin,symWhich};
}
/** Construct two different messages with the same ciphertext and fixed endpoints. */
function collisionCertificate(){
 const q=29;
 const sec=Array.from({length:q},(_,h)=>{const m=new Map();for(let x=0;x<q;x++)m.set(mod(cube[(x+h)%q]-cube[x]),x);return [...m.entries()]});
 const lookup=sec.map(row=>new Set(row.map(([s])=>s)));
 const inv=Array.from({length:q},(_,c)=>c?Array.from({length:q},(_,i)=>i).find(i=>c*i%q===1):0);
 assert.deepEqual(sec.map(x=>x.length),[1,...Array(28).fill(15)]);
 assert.deepEqual(Array.from({length:28},(_,j)=>lookup.slice(1).filter(s=>s.has(j+1)).length),Array(28).fill(15));
 const C=(p,L,R,b,c,d)=>p.map((x,i)=>mod((i?p[i-1]:L)+b*cube[x]+c*(i+1<p.length?p[i+1]:R)+d));
 /** @param {number} n @param {number} b @param {number} c @param {number} L @param {number} R @param {number} d */
 function witness(n,b,c,L,R,d){
  const reachable=(t,a,z)=>t===0?a===0&&z!==0:t===1?a!==0&&z!==0&&lookup[a].has(mod(-c*z*inv[b])):t===2?a!==0:(a!==0||z!==0);
  const P=new Array(n),Q=new Array(n);let a=1,z=0;
  for(let t=n;t>=1;t--){
   let found=false;
   for(const [s,x] of sec[a]){
    const v=mod(-b*s-c*z);
    if(!reachable(t-1,v,a))continue;
    P[t-1]=x;Q[t-1]=mod(x+a);z=a;a=v;found=true;break;
   }
   assert(found,'constructive reachability');
  }
  assert.equal(a,0);assert.notEqual(P[0],Q[0]);
  const pC=C(P,L,R,b,c,d);assert.deepEqual(pC,C(Q,L,R,b,c,d));
  return {P,Q,C:pC};
 }
 const nList=[2,3,76,308,3008],counts={},example=witness(2,1,1,7,11,0);
 for(const n of nList){let checked=0;for(let b=1;b<q;b++)for(let c=1;c<q;c++){witness(n,b,c,(b+7)%q,(c+11)%q,(b+c)%q);checked++}counts[n]=checked}
 return {secSizes:sec.map(x=>x.length),nonzeroColumns:Array.from({length:28},(_,j)=>lookup.slice(1).filter(s=>s.has(j+1)).length),counts,example};
}

const parts=ref.split(/### (\d+)\n/),sec=Object.fromEntries(Array.from({length:(parts.length-1)/2},(_,i)=>[Number(parts[2*i+1]),enc(parts[2*i+2].replace(/^\[[^\n]*\]$/gm,''))]));
const samples=[sec[3].slice(40,348),sec[6].slice(120,428),[...sec[10],...sec[11],...sec[12],...sec[13]].slice(70,378)];
const keys=[{b:7,d:19,L:4,R:13},{b:23,d:3,L:16,R:25},{b:11,d:9,L:22,R:6}];
const controls=samples.map((p,i)=>{assert.equal(p.length,308);const k={...keys[i],p0:p[0]},c=sender(p,k,k.R);return {plant:i,repeat:c.filter((x,j)=>j&&x===c[j-1]).length,...search(c,232,k)}});
for(const c of controls){assert.equal(c.correct,308);assert.equal(c.heldCorrect,76);assert.equal(c.betterThanTruth,0);assert.equal(c.ties,1);assert(c.replay)}
assert.deepEqual(controls.map(c=>c.fixedEndpointPaths),[3,1,2]);
const original=[...gp.pages[54].indices,...gp.pages[55].indices];assert.equal(gp.pages[54].indices.length,232);assert.equal(original.length,308);
const originalResult={repeat:original.filter((x,i)=>i&&x===original[i-1]).length,...search(original,232)};
assert.deepEqual(originalResult.key,{b:28,d:9,L:3,p0:1});assert(originalResult.replay);
const ct=gp.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices),actual=ct.filter((x,i)=>i&&x===ct[i-1]).length;
assert.deepEqual([ct.length,actual],[3008,18]);
const repeats=files.map(file=>({file,...repeatGate(enc(read(file)),ct.length,actual)}));
assert.deepEqual(repeats.map(x=>[x.min,x.symMin,x.keysPass,x.windowPass]),[[34,63,0,0],[50,53,0,0],[34,63,0,0]]);
console.log(JSON.stringify({train:train.length,keys:28*29**3,controls,original:originalResult,repeatGate:{n:ct.length,actual,output:repeats},collisionCertificate:collisionCertificate()},null,2));
