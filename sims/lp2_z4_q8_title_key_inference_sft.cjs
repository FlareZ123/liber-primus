'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(raw){
const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),ix=new Map(gp.runes.map((x,i)=>[x,i]));
const P=[18,13,10,13,8,24,9,26,15,18,18,5,15],C=gp.pages.filter(x=>x.page<=2).flatMap(x=>x.indices),native=[...gold.sections.find(s=>s.name==="p57_parable").source_text].filter(c=>ix.has(c)).map(c=>ix.get(c));
if(C.slice(0,13).join()!=="15,8,18,3,6,19,27,0,15,26,18,21,5"||C.length!==729)throw Error("source mismatch");
function step(key,m,i,last,p,mode){
 if(mode&&p===0)return [0,i,mode===2?0:last];
 for(let k=0;k<2*key.length;k++){let c=(p+key[i])%m;i=(i+1)%key.length;if(c===last)continue;last=c;if(c<29)return [c,i,last];}return null;
}
function reach(key,m,i,last,C,j,mode){
 const q=key.length;let states=new Set([i*(m+1)+last]);for(;j<C.length;j++){const next=new Set();for(const s of states)for(let p=0;p<29;p++){const v=step(key,m,Math.floor(s/(m+1)),s%(m+1),p,mode);if(v&&v[0]===C[j])next.add(v[1]*(m+1)+v[2]);}if(!next.size)break;states=next;}return j;
}
function infer(P,C,m,q,truth){
 const key=Array(q).fill(0),modes=[0,1,2];let nodes=0,leaves=0,matching=0,truthFound=false;const survived=[0,0,0],longest=[0,0,0],samples=[];
 function dfs(d,j,last){
  nodes++;if(d===q){leaves++;if(j===0)return;let i=0;for(;j<P.length;j++){const v=step(key,m,i,last,P[j],0);if(!v||v[0]!==C[j])return;i=v[1];last=v[2];}matching++;if(truth&&key.every((v,k)=>v===truth[k]))truthFound=true;for(const mode of modes){const n=reach(key,m,i,last,C,j,mode);longest[mode]=Math.max(longest[mode],n);if(n===C.length){survived[mode]++;if(samples.length<10)samples.push({mode,key:[...key],phase:i});}}return;}
  const p=P[j],desired=C[j];for(let c=29;c<m;c++){key[d]=(c-p+m)%m;dfs(d+1,j,c);}
  if(last<29&&last!==desired){key[d]=(last-p+m)%m;dfs(d+1,j,last);}
  if(last!==desired){key[d]=(desired-p+m)%m;dfs(d+1,j+1,desired);}else if(last<29){key[d]=(last-p+m)%m;dfs(d+1,j,last);}
 }
 dfs(0,0,m);return {m,q,nodes,leaves,matching,truthFound,survived,longest,samples};
}
const results=[];for(const m of [35,36,37]){
 const key=[23,10,1,10,9,10,16,26].map(x=>x%m),p=Array.from({length:729},(_,i)=>native[i%native.length]);let i=0,last=m,ct=[];for(const x of p){const v=step(key,m,i,last,x,0);if(!v)throw Error("plant stalled");ct.push(v[0]);i=v[1];last=v[2];}if(p.slice(0,13).includes(0))throw Error("control title F");
 const control=infer(p.slice(0,13),ct,m,8,key);if(!control.truthFound||!control.survived[0])throw Error("lost plant");const original=infer(P,C,m,8,null);results.push({control,original});
}
return results;
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));