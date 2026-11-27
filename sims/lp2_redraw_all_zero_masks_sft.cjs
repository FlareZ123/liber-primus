"use strict";
// Exact q8 strict one-redraw difference-ring search, rotation quotient.
// GP29; no transparent F; continuous tape; mandatory single redraw on collision.
function run(c,cut=9640,only=0){
const mod=x=>((x%29)+29)%29,rot=(x,k)=>((x<<k)|(x>>(8-k)))&255;
const R1=Uint8Array.from({length:256},(_,x)=>rot(x,1)),R2=Uint8Array.from({length:256},(_,x)=>rot(x,2));
const d=Uint8Array.from(c.slice(1),(x,i)=>mod(x-c[i]));
function partition(v){let prev=-1,blocks=[];for(let i=0;i<v.length;i++)if(!v[i]){blocks.push({a:prev,b:i,v:v.slice(prev+1,i)});prev=i;}return {blocks,tail:v.slice(prev+1)};}
const tr=partition(d.slice(0,cut-1)),ho=partition(d.slice(cut-1));
const masks=new Uint8Array(29),D=new Int8Array(8),out=[];
function adv(S,v){if(S===255)return S;for(let i=0;i<v.length;i++){S=R1[S]|R2[S&masks[v[i]]];if(S===255)break;}return S;}
function phase(S,p,Z){for(let x of p.blocks){S=R2[adv(S,x.v)&Z];if(!S)return 0;}return adv(S,p.tail);}
function keyCode(){let n=0;for(let x of D)n=n*29+x;return n}
for(let Z=1;Z<=255;Z++){
 if(only&&Z!==only)continue;
 if(Array.from({length:7},(_,i)=>rot(Z,i+1)).some(x=>x<Z))continue;
 let start=R2[Z],idx=Array.from({length:8},(_,i)=>i).filter(i=>!(Z&(1<<i)));
 let filters=tr.blocks.slice(1).filter(x=>!(rot(start,x.v.length%8)&Z)).sort((a,b)=>a.v.length-b.v.length);
 let patterns=[],anchor=null;
 D.fill(-1);for(let j=0;j<8;j++)if(Z&(1<<j))D[j]=0;
 // Enumerate every phase path in a short constraining prefix interval; choose
 // the interval with the smallest upper bound on completions, independent of holdout.
 let best=Infinity;
 for(let a of filters.filter(x=>x.v.length<=12)){
  let ps=[],seen=new Set();
  function walk(i,j){
   if(i===a.v.length){if(Z&(1<<j)){let k=Array.from(D).join(",");if(!seen.has(k)){seen.add(k);ps.push(Array.from(D));}}return;}
   walk(i+1,(j+1)&7);
   const x=a.v[i],v=D[j];
   if(v===-1||v===x){D[j]=x;walk(i+1,(j+2)&7);D[j]=v;}
  }
  for(let j=0;j<8;j++)if(start&(1<<j))walk(0,j);
  let upper=ps.reduce((s,p)=>s+28**Math.max(0,p.filter(x=>x<0).length-1),0);
  if(upper<best){best=upper;patterns=ps;anchor=a;}
 }
 if(!anchor)patterns=[Array.from(D)];
 let tested=0,dup=0,independent=0,connected=0,held=0;
 const candidates=[],survivorSet=new Set(), seen=anchor?new Set():null;
 const sym=Array.from({length:7},(_,i)=>i+1).filter(k=>rot(Z,k)===Z);
 function examine(){
  tested++;
  for(let k of sym){
   let cmp=0;for(let j=0;j<8;j++){cmp=D[j]-D[(j+k)&7];if(cmp)break;}if(cmp>0)return;
  }
  if(seen){let n=keyCode();if(seen.has(n)){dup++;return;}seen.add(n);}
  for(let j=0;j<8;j++)masks[D[j]]|=1<<j;
  let ok=true;
  for(let x of filters){if(!(adv(start,x.v)&Z)){ok=false;break;}}
  if(ok){independent++;let S=phase(255,tr,Z);if(S){connected++;let H=phase(S,ho,Z);if(H)held++;
   if(candidates.length<100000){let n=keyCode();if(survivorSet.has(n))throw Error("duplicate survivor");survivorSet.add(n);candidates.push({D:Array.from(D),prefixPhase:S,heldPhase:H});}
  }}
  for(let j=0;j<8;j++)masks[D[j]]=0;
 }
 function fill(unknown,i,sum){
  if(i===unknown.length){if(!mod(sum))examine();return;}
  let j=unknown[i];
  if(i===unknown.length-1){let v=mod(-sum);if(v){D[j]=v;examine();}D[j]=-1;return;}
  for(let v=1;v<29;v++){D[j]=v;fill(unknown,i+1,sum+v);}D[j]=-1;
 }
 for(let p of patterns){D.set(p);let unknown=idx.filter(j=>D[j]<0),sum=Array.from(D).reduce((s,x)=>s+(x<0?0:x),0);fill(unknown,0,sum);}
 out.push({Z,nonzero:idx.length,filters:filters.length,anchor:anchor?{a:anchor.a,b:anchor.b,gap:anchor.b-anchor.a}:null,patterns:patterns.length,tested,dup,independent,connected,held,candidates,truncated:connected>candidates.length});
}
return {n:c.length,cut,repeats:tr.blocks.length,masks:out};
}
if(typeof module!=="undefined"){module.exports=run;if(require.main===module){const fs=require("node:fs"),path=require("node:path"),co=JSON.parse(fs.readFileSync(path.resolve(__dirname,"../resources/liber-primus/lp2-corpus.json"),"utf8"));console.log(JSON.stringify(run(co.pages.slice(0,56).flatMap(p=>p.indices),9640,Number(process.argv[2]||0)),null,2));}}
