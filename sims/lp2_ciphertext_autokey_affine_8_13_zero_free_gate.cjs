'use strict';
const fs=require('node:fs');
const path=require('node:path');
function run(corpus,native){
 const mod=n=>((n%29)+29)%29;
 const params=Array.from({length:28*29},(_,i)=>[1+Math.floor(i/29),i%29]);
 function pairs(c,q){const out=[];let streak=0;for(let i=0;i<c.length;i++){streak=c[i]===0?0:streak+1;if(streak>q)out.push([i,c[i-q],c[i]])}return out}
 function gate(c,q){
  const p=pairs(c,q);const witness=new Map();
  for(const [i,x,y] of p)for(let b=1;b<29;b++){const d=mod(y-b*x),id=(b-1)*29+d;if(!witness.has(id))witness.set(id,i)}
  return {pairs:p.length,viable:params.length-witness.size,standard:witness.get(0)??null,firstAllDead:witness.size===params.length?Math.max(...witness.values()):null,survivors:params.filter(([b,d])=>!witness.has((b-1)*29+d))};
 }
 function enc(p,q,a,b,d){let k=Array.from({length:q},(_,i)=>mod(3+7*i));return p.map(v=>{if(v===0)return 0;const c=mod(a*v+b*k.shift()+d);k.push(c);return c})}
 const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
 const controls=native.sections.filter(s=>s.name==="0_welcome"||s.name==="0_koan_1"||s.name==="0_loss_of_divinity").map(s=>({name:s.name,p:Array.from(s.source_text,c=>native.runes.indexOf(c)).filter(x=>x>=0)}));
 const result={};
 for(const q of [8,13]){
  const rows=pages.map(({page,indices})=>({page,...gate(indices,q)}));
  const totalPairs=rows.reduce((s,r)=>s+r.pairs,0);
  const globalSurv=params.filter(([b,d])=>rows.every(r=>r.survivors.some(([x,y])=>x===b&&y===d)));
  const controlsOut=controls.map(({name,p},idx)=>{const a=[1,7,23][idx],b=[1,11,19][idx],d=[0,19,8][idx];const c=enc(p,q,a,b,d);const g=gate(c,q);if(!g.survivors.some(([x,y])=>x===b&&y===d))throw Error("false negative");const ps=pairs(c,q);if(ps.some(([i,x,y])=>mod(a*p[i]+b*x+d)!==y||p[i]===0))throw Error("control mismatch");return {name,n:p.length,a,b,d,usable:ps.length,survivors:g.viable,correct:true}});
  result[q]={totalPairs,globalSurv,standardRejected:rows.filter(r=>r.standard!==null).map(r=>r.page),allAffineRejected:rows.filter(r=>r.viable===0).map(r=>r.page),pageCounts:rows.map(({page,pairs,viable,standard,firstAllDead})=>({page,pairs,viable,standard,firstAllDead})),controls:controlsOut};
 }
 return result;
}
const root=path.resolve(__dirname,'..');
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
console.log(JSON.stringify(run(load('resources/liber-primus/lp2-corpus.json'),load('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
