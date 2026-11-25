"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
function experiment(gp,native){
 const mod=x=>(x+29)%29;
 const sections=native.sections.filter(x=>!x.name.startsWith("p5")).map(s=>({name:s.name,p:Array.from(s.source_text,ch=>native.runes.indexOf(ch)).filter(x=>x>=0)}));
 const motifs=[],seen=new Set();
 for(const s of sections)for(let i=0;i<s.p.length;i++)for(let j=i+1;j<s.p.length;j++){
  if(i&&s.p[i-1]===s.p[j-1])continue;
  let n=0;while(j+n<s.p.length&&s.p[i+n]===s.p[j+n])n++;
  if(n<20)continue;const p=s.p.slice(i,i+n),id=p.join(",");
  if(!seen.has(id)){seen.add(id);motifs.push({name:s.name,i,j,p})}
 }
 function scan(C,P,q,literal){
  const key=new Int8Array(q);key.fill(-1);
  const stats={starts:0,prefiltered:0,nodes:0,partialPaths:0,fullPaths:0},hits=new Map();
  function dfs(start,i,phase){
   stats.nodes++;
   if(i===P.length){const k=Array.from(key),complete=k.every(x=>x>=0);stats[complete?"fullPaths":"partialPaths"]++;const id=[start,phase,...k].join(",");hits.set(id,{start,phase,key:k});return}
   const p=P[i],c=C[start+i],prev=start+i?C[start+i-1]:-1;
   if(literal&&p===0){if(c===0)dfs(start,i+1,phase);return}
   const old=key[phase],normal=mod(c-p);
   if(old<0||old===normal){key[phase]=normal;dfs(start,i+1,(phase+1)%q);key[phase]=old}
   if(prev>=0&&prev!==c){const repair=mod(prev-p);if(old<0||old===repair){key[phase]=repair;dfs(start,i+1,phase);key[phase]=old}}
  }
  const fs=literal?P.flatMap((p,i)=>p===0?[i]:[]):[];
  for(let start=0;start<=C.length-P.length;start++){stats.starts++;if(fs.some(i=>C[start+i]!==0)){stats.prefiltered++;continue}dfs(start,0,0)}
  return {stats,hits:[...hits.values()]};
 }
 let seed=0x5a04c11d;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 function plant(P,K,literal){const C=[],phaseAt=[],q=K.length;let phase=rng()%q,repairs=0;for(const p of P){phaseAt.push(phase);let c=mod(p+K[phase]);if(literal&&p===0)c=0;else if(C.length&&c===C.at(-1)&&rng()%5!==0){c=mod(c+1+rng()%28);repairs++}else phase=(phase+1)%q;C.push(c)}return {C,phaseAt,repairs}}
 const C=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
 const original=[],controls=[];
 for(const q of [8,13])for(const m of motifs){
  const literal=m.p.includes(0);
  for(const mode of literal?[true,false]:[false]){
   const r=scan(C,m.p,q,mode);original.push({literal:mode,alsoLiteralF:!literal,q,name:m.name,offset:m.i,len:m.p.length,...r});
  }
 }
 for(const literal of [true,false])for(const q of [8,13])for(const m of motifs){
  const P=sections.find(s=>s.name===m.name).p,K=Array.from({length:q},()=>rng()%29),z=plant(P,K,literal),r2=scan(z.C,m.p,q,literal),phase=z.phaseAt[m.i],rot=K.slice(phase).concat(K.slice(0,phase));
  const good=r2.hits.filter(h=>h.start===m.i&&h.key.every((x,i)=>x===-1||x===rot[i]));if(!good.length)throw Error("missed control");
  controls.push({literal,q,name:m.name,offset:m.i,len:m.p.length,repairs:z.repairs,hitCount:r2.hits.length,completeTruth:good.some(h=>h.key.every(x=>x>=0)),truth:rot});
 }
 const extra=[];
 for(const q of [8,13]){
  const s=sections.find(x=>x.p.includes(0)),i=Math.max(0,s.p.indexOf(0)-10),P=s.p.slice(i,i+40),K=Array.from({length:q},()=>rng()%29),z=plant(s.p,K,true),r=scan(z.C,P,q,true),phase=z.phaseAt[i],rot=K.slice(phase).concat(K.slice(0,phase));
  const good=r.hits.filter(h=>h.start===i&&h.key.every((x,j)=>x===-1||x===rot[j]));if(!good.length)throw Error("missed F control");
  extra.push({q,name:s.name,len:P.length,F:P.filter(x=>x===0).length,completeTruth:good.some(h=>h.key.every(x=>x>=0)),hits:r.hits.length});
 }
 return {N:C.length,motifs:motifs.map(m=>({name:m.name,offsets:[m.i,m.j],len:m.p.length,p:m.p})),original,controls,extra};
}
console.log(JSON.stringify(experiment(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json")),null,2));
