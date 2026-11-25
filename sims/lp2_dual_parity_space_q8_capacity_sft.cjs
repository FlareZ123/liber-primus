'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const SPACE_ODD=12, SPACE_EVEN=22, ALL=(1<<29)-1;
const type=(v,k)=>{const x=(v-k+29)%29;return x===SPACE_ODD?1:x===SPACE_EVEN?2:0;};
/** @param {number[]} c @param {number[]} key */
function valid(c,key){
 let last=-1;
 for(let i=0;i<c.length;i++){
  const t=type(c[i],key[i%8]);
  if(!t)continue;
  if(last>=0&&(i-last===1||t!==((i-last)%2===0?1:2)))return false;
  last=i;
 }
 return true;
}
/** Exact upper bounds, and optional complete maximum-capacity search above floor. */
function solve(c,floor,enumerate=true){
 const W=Array.from({length:8},()=>Array(29).fill(0));
 const A=Array.from({length:8},()=>Array.from({length:8},()=>Array(29).fill(ALL)));
 for(let i=0;i<c.length;i++)for(let k=0;k<29;k++)if(type(c[i],k))W[i%8][k]++;
 for(let i=0;i<c.length;i++)for(let d=1;d<=4&&i+d<c.length;d++){
  const j=i+d,p=i%8,q=j%8;
  for(const a of [(c[i]-12+29)%29,(c[i]-22+29)%29])for(const b of [(c[j]-12+29)%29,(c[j]-22+29)%29]){
   if(d===1||type(c[j],b)!==(d%2===0?1:2)){
    A[p][q][a]&=~(1<<b); A[q][p][b]&=~(1<<a);
   }
  }
 }
 const pair=Array.from({length:8},()=>Array(8).fill(0));
 for(let p=0;p<8;p++)for(let q=p+1;q<8;q++){
  let b=-1;for(let x=0;x<29;x++)for(let y=0;y<29;y++)if(A[p][q][x]&(1<<y))b=Math.max(b,W[p][x]+W[q][y]);
  pair[p][q]=pair[q][p]=b;
 }
 function matching(mask){
  if(!mask)return 0;
  const p=31-Math.clz32(mask&-mask);let v=Infinity;
  for(let q=p+1;q<8;q++)if(mask&(1<<q))v=Math.min(v,pair[p][q]+matching(mask^(1<<p)^(1<<q)));
  return v;
 }
 const phase=W.map(w=>Math.max(...w)), phaseBound=phase.reduce((a,b)=>a+b,0),jointBound=matching(255);
 if(!enumerate||jointBound<floor)return {phase,phaseBound,jointBound,floor,solutions:[],nodes:0,leaves:0};
 const key=Array(8).fill(-1);
 const order=W.map(w=>Array.from({length:29},(_,i)=>i).sort((a,b)=>w[b]-w[a]));
 let best=floor-1,solutions=[],nodes=0,leaves=0;
 function rec(dom,mask,score){
  nodes++;let upper=score,p=-1,min=30;
  for(let q=0;q<8;q++)if(!(mask&(1<<q))){
   const x=dom[q];if(!x)return;
   let n=0;for(let z=x;z;z&=z-1)n++;
   if(n<min){p=q;min=n;}
   upper+=W[q][order[q].find(k=>x&(1<<k))];
  }
  if(upper<Math.max(best,floor))return;
  if(p<0){
   leaves++;if(!valid(c,key))return;
   if(score>best){best=score;solutions=[];}
   if(score===best)solutions.push(key.slice());
   return;
  }
  for(const k of order[p])if(dom[p]&(1<<k)){
   const next=dom.slice();
   for(let q=0;q<8;q++)if(q!==p&&!(mask&(1<<q)))next[q]&=A[p][q][k];
   key[p]=k;rec(next,mask|1<<p,score+W[p][k]);key[p]=-1;
  }
 }
 rec(Array(8).fill(ALL),0,0);
 return {phase,phaseBound,jointBound,floor,best:solutions.length?best:null,solutions,nodes,leaves};
}
const count=v=>v.filter(x=>x===12||x===22).length;
function experiment(c,n){
 const orig=c.pages.find(x=>x.page===54).indices.slice(9).concat(c.pages.find(x=>x.page===55).indices);
 assert.equal(orig.length,299);
 const natives=n.sections.map(s=>({name:s.name,v:(s.source_text.match(/[ᚠ-ᛠ]+/g)||[]).flatMap(w=>{
  const v=Array.from(w,x=>n.runes.indexOf(x));
  assert(v.every(x=>x>=0&&x!==12&&x!==22));return [...v,w.length%2?12:22];
 })}));
 function windows(len,exclude){
  const out=[];
  for(const {v,name} of natives)if(name!==exclude&&v.length>=len){
   const counts=Array.from({length:v.length-len+1},(_,i)=>count(v.slice(i,i+len)));
   out.push({name,windows:counts.length,min:Math.min(...counts),max:Math.max(...counts)});
  }
  return out;
 }
 const floor=(len,exclude)=>Math.min(...windows(len,exclude).map(x=>x.min));
 let seed=2712;
 function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
 const plants=[];
 for(const {name,v} of natives.filter(x=>x.v.length>=299)){
  const offset=rand()%(v.length-298),p=v.slice(offset,offset+299),key=Array.from({length:8},()=>rand()%29);
  const cipher=p.map((x,i)=>(x+key[i%8])%29);
  const fitFloor=floor(223,name),r=solve(cipher.slice(0,223),fitFloor);
  const exact=r.solutions.length===1&&r.solutions[0].every((x,i)=>x===key[i]);
  const recovered=r.solutions.length===1?cipher.map((x,i)=>(x-r.solutions[0][i%8]+29)%29):[];
  const holdout=recovered.slice(223).filter((x,i)=>x===p[223+i]).length;
  assert(exact);assert.equal(holdout,76);assert(valid(cipher,key));
  assert(recovered.every((x,i)=>(x+key[i%8])%29===cipher[i]));
  plants.push({name,offset,key,fitFloor,fitSpaces:count(p.slice(0,223)),r,exact,holdout});
 }
 const original=solve(orig,floor(299));assert(original.jointBound<original.floor);
 return {windows:windows(299),original,plants};
}
if(require.main===module)console.log(JSON.stringify(experiment(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
module.exports={solve,valid,experiment};
