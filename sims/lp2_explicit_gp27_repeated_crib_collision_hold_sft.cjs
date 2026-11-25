"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
function recover(gp,native){
 const mod=x=>(x+29)%29,rs=native.runes;
 function chunks(s){let p=[],result=[];function add(x){if(p.at(-1)===12&&x===12)return;if(p.at(-1)===22&&x===22)return;if(x===22&&p.at(-1)===12)p.pop();p.push(x)}function flush(){while(p.at(-1)===12)p.pop();if(p.length)result.push(p);p=[]}for(const ch of s){const x=rs.indexOf(ch);if(x>=0){if(x===12||x===22)throw Error("reserved");add(x)}else if(ch==="•"||ch==="⁚"){add(12)}else if(ch==="⁘"||ch==="⁜"){add(22);add(12)}else if(/\d/.test(ch)){flush()}else if(ch==='"'||ch==="'"||/\s/.test(ch))continue;else{flush()}}flush();return result}
 const source=native.sections.filter(x=>!x.name.startsWith("p5")).flatMap(s=>chunks(s.source_text).map((p,chunk)=>({name:s.name,chunk,p})));
 const phrases=[];
 for(const s of source){const seen=new Set(),p=s.p;for(let i=0;i<p.length;i++)for(let j=i+1;j<p.length;j++){
  if(i>0&&p[i-1]===p[j-1])continue;let k=0;while(j+k<p.length&&p[i+k]===p[j+k])k++;
  if(k<20)continue;const c=p.slice(i,i+k),key=c.join(",");if(seen.has(key)||c.filter(x=>x!==0).length<15)continue;seen.add(key);phrases.push({name:s.name,chunk:s.chunk,i,j,c})
 }}
 const contains=(p,c)=>p.some((x,i)=>i+c.length<=p.length&&c.every((v,j)=>v===p[i+j]));
 const motifs=phrases.filter((p,i)=>!phrases.some((m,j)=>i!==j&&(m.c.length<p.c.length||(m.c.length===p.c.length&&j<i))&&contains(p.c,m.c)));
 // For a complete key, exact all legal continuations of the crib. Use the
 // physical predecessor and optional collision rejection; a complete cycle
 // of rejected key digits returns to the same state and can be removed.
 function exactSuffix(C,start,P,key,i,phase,run,ends,stats){
  const q=key.length;
  while(i<P.length){const p=P[i],c=C[start+i];
   if(p===0){if(c!==0)return;i++;run=0;continue}
   const a=mod(p+key[phase]),prev=start+i>0?C[start+i-1]:-1,advance=(phase+1)%q;
   if(a===c){
    if(a===prev&&run<q-1)exactSuffix(C,start,P,key,i,advance,run+1,ends,stats);
    i++;phase=advance;run=0;
   }else if(a===prev&&run<q-1){phase=advance;run++}
   else return;
  }
  ends.add(phase);stats.suffixMatches++;
 }
 function search(C,P,q,onlyStart=null){
  const rows=[],stats={starts:0,prefiltered:0,keysTested:0,suffixMatches:0};const key=new Int8Array(q);
  const fpos=P.flatMap((x,i)=>x===0?[i]:[]);let first=P.findIndex(x=>x!==0);
  // The unknown initial key rotation can be normalized to the first
  // accepted consuming emission; any prior redraws are immaterial to
  // the existence of a matching key and outgoing phase.
  function firstCycle(start,i,j,run){
   while(i<P.length&&P[i]===0){if(C[start+i]!==0)return;i++;run=0}
   if(i===P.length)throw Error("too few consuming symbols");
   if(j===q){stats.keysTested++;const ends=new Set();exactSuffix(C,start,P,key,i,0,run,ends,stats);
    if(ends.size)rows.push({start,key:Array.from(key),ends:[...ends]});return}
   const p=P[i],c=C[start+i],prev=start+i>0?C[start+i-1]:-1;
   key[j]=mod(c-p);firstCycle(start,i+1,j+1,0);
   if(prev>=0&&run<q-1){key[j]=mod(prev-p);firstCycle(start,i,j+1,run+1)}
  }
  const begin=onlyStart===null?0:onlyStart,end=onlyStart===null?C.length-P.length:onlyStart;
  for(let start=begin;start<=end;start++){
   stats.starts++;if(fpos.some(i=>C[start+i]!==0)){stats.prefiltered++;continue}
   key[0]=mod(C[start+first]-P[first]);firstCycle(start,first+1,1,0)
  }
  const dedup=new Map();for(const row of rows){const id=row.start+":"+row.key.join(",");if(!dedup.has(id))dedup.set(id,{...row,ends:new Set()});for(const p of row.ends)dedup.get(id).ends.add(p)}
  return {stats,rows:[...dedup.values()].map(x=>({...x,ends:[...x.ends]}))};
 }
 let seed=0x15082213;const rng=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
 function plant(P,K){let phase=rng()%K.length,prev=-1,redraws=0,holds=0;const accepted=[],C=[];
  for(let i=0;i<P.length;i++){
   const p=P[i];if(p===0){C.push(0);prev=0;accepted.push(null);holds++;continue}
   let a=mod(p+K[phase]),skip=0;while(a===prev&&skip<K.length-1&&(i%5!==0)){phase=(phase+1)%K.length;skip++;a=mod(p+K[phase])}
   accepted.push(phase);C.push(a);prev=a;phase=(phase+1)%K.length;redraws+=skip;
  }
  return {C,accepted,redraws,holds}
 }
 // Control recovery on complete independent key plants using actual native
 // source chunks. Search every possible crib location, not known location.
 const controls=[];
 for(const q of [8,13])for(const p of motifs.slice(0,3)){
  const s=source.find(x=>x.name===p.name&&x.chunk===p.chunk),K=Array.from({length:q},()=>rng()%29),z=plant(s.p,K);
  const r=search(z.C,p.c,q);
  const first=p.c.findIndex(x=>x!==0),phase=z.accepted[p.i+first],rot=K.slice(phase).concat(K.slice(0,phase));
  const hit=r.rows.find(x=>x.start===p.i&&x.key.every((v,i)=>v===rot[i]));
  if(!hit)throw Error("planted key missed");
  controls.push({q,source:p.name,offset:p.i,cribLength:p.c.length,key:rot,redraws:z.redraws,holds:z.holds,found:r.rows.length,exact:true,stats:r.stats})
 }
 const C=gp.pages.filter(x=>x.page<=55).flatMap(x=>x.indices),original=[];
 for(const q of [8,13])for(const p of motifs){
  const r=search(C,p.c,q);original.push({q,source:p.name,chunk:p.chunk,offsets:[p.i,p.j],length:p.c.length,F:p.c.filter(x=>x===0).length,crib:p.c,render:p.c.map(x=>x===12?" ":x===22?".":rs[x]).join(""),...r});
 }
 return {phrases:phrases.map(p=>({...p,length:p.c.length})),motifs:motifs.map(p=>({...p,length:p.c.length})),controls,original};
}
console.log(JSON.stringify(recover(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json")),null,2));
