"use strict";
const fs=require("node:fs");
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt","resources/transcriptions/lp2-image-corrected.txt"];
function repairBound(raw){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const assert=(v,m)=>{if(!v)throw Error(m)},mod=x=>(x+29)%29,id=w=>String.fromCharCode(...w.map(x=>65+x)),nums=s=>Array.from(s,x=>x.charCodeAt(0)-65);
 function word(w,alt=true){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));assert(q,"donor spelling");o.push(q.i);j+=q.t.length;}return o;}
 function body(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return t.slice(a?a.index+a[0].length:0,b?b.index:t.length);}
 const donors=raw.slice(2,5).map(t=>(body(t).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>word(w))),training=donors.map(w=>w.slice(0,Math.floor(w.length*.8)));
 for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))training.push((s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(t=>[...t].map(x=>ix.get(x))).filter(w=>w.every(Number.isInteger)));
 const types=new Set(Array.from({length:29},(_,x)=>String.fromCharCode(65+x)));
 for(const a of training)for(const w of a)if(w.length&&w.length<=24)types.add(id(w));
 for(const ln of raw[5].split(/\r?\n/)){const m=ln.match(/^([a-z]+)\s+(\d+)$/i);if(!m)continue;for(const alt of [true,false]){const k=id(word(m[1],alt));if(k.length<=24)types.add(k);}}
 assert(types.size===35944,"dict");
 const bylen=Array.from({length:25},()=>[]);for(const t of types){const w=nums(t);if(w.filter(x=>x!==0).length>=3)bylen[w.length].push(w)}
 let gs=[],w=[],sep="";for(const c of raw[6]){if(ix.has(c)){if(w.length&&/[-.&]/u.test(sep)){gs.push(w);w=[]}w.push(ix.get(c));sep=""}else sep+=c}if(w.length)gs.push(w);
 const target=gp.pages.filter(x=>x.page<56).flatMap(x=>x.indices);assert(gs.flat().slice(0,target.length).join()===target.join(),"tape");
 let n=0,orig=[];for(const w of gs){if(n>=target.length)break;orig.push({off:n,C:w});n+=w.length}assert(n===12956&&orig.length===2896,"counts");
 const scopes=[[0,3],[3,8],[8,15],[15,23],[23,27],[27,33],[33,40],[40,54],[54,56]];
 const blocks=scopes.map(([lo,hi])=>{const s=gp.pages.filter(p=>p.page<lo).reduce((a,p)=>a+p.indices.length,0),e=gp.pages.filter(p=>p.page<hi).reduce((a,p)=>a+p.indices.length,0);return {lo,hi:hi-1,rows:orig.filter(x=>x.off>=s&&x.off<e)}});
 function variants(C){return [C,...C.map((_,i)=>C.slice(0,i).concat(C.slice(i+1)))]}
 function cands(C,kmax){const sets=Array.from({length:kmax+1},()=>new Set);for(const D of variants(C)){if(D.length>24)continue;for(const P of bylen[D.length]){let K=Array(8).fill(-1),t=0,ok=true;for(let i=0;i<D.length;i++){if(P[i]===0){if(D[i]!==0){ok=false;break}continue}const j=t++&7,v=mod(D[i]-P[i]);if(K[j]>=0&&K[j]!==v){ok=false;break}K[j]=v}if(ok){let z=0;for(let k=1;k<=Math.min(t,kmax);k++){z=z*29+K[k-1];if(k>=3)sets[k].add(z)}}}}return sets}
 const top8=m=>{let top=Array(8).fill(0);for(const v of m.values())if(v>top[7]){top[7]=v;top.sort((a,b)=>b-a)}return top.reduce((a,b)=>a+b,0)}
 function gate(rows,budget){let maps=Array.from({length:8},()=>new Map),dis=Array.from({length:8},()=>new Map),counts=Array(8).fill(0),disCounts=Array(8).fill(0);for(const {C} of rows){let kmax=Math.min(7,C.filter(v=>v!==0).length-1);if(kmax<3)continue;let sets=cands(C,kmax);for(let k=3;k<=kmax;k++){counts[k]++;for(const t of sets[k])maps[k].set(t,(maps[k].get(t)||0)+1)}disCounts[kmax]++;for(const t of sets[kmax])dis[kmax].set(t,(dis[kmax].get(t)||0)+1)}
 let cumulative=[],partition=[],def=0;for(let k=3;k<=7;k++){let u=top8(maps[k]),v=top8(dis[k]);cumulative.push({k,anchors:counts[k],upper:u,minAffected:Math.max(0,counts[k]-u)});let d=Math.max(0,disCounts[k]-v);partition.push({k,anchors:disCounts[k],upper:v,minAffected:d});def+=d}
 let minAffected=Math.max(def,...cumulative.map(x=>x.minAffected));return {groups:rows.length,runes:rows.reduce((n,x)=>n+x.C.length,0),budget,cumulative,partition,partitionDeficit:def,minAffected,minRepairedGroups:Math.max(0,minAffected-budget)}}
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
 const controls=[];for(let d=0;d<3;d++){const R=rng(0x12f600+d),pool=donors[d].slice(Math.floor(donors[d].length*.8)).filter(w=>types.has(id(w))&&w.length>=4&&w.length<=16);assert(pool.length,"pool");let K=Array.from({length:8},()=>R()%29),rows=[];for(let i=0;i<100;i++){let P=pool[R()%pool.length],p=R()%8,C=P.map(x=>{if(!x)return 0;let y=mod(x+K[p]);p=(p+1)&7;return y});if(R()%100<45)C.splice(R()%(C.length+1),0,R()%29);rows.push({C})}let clean=gate(rows,0);assert(clean.minAffected===0,"clean false positive");let affected=new Set;for(let i=0;i<20;i++){let j=R()%rows.length,k=R()%rows[j].C.length;rows[j].C[k]=mod(rows[j].C[k]+1+R()%28);affected.add(j)}let repaired=gate(rows,0);assert(repaired.minAffected<=affected.size,"repair bound false positive");controls.push({actualAffected:affected.size,clean:clean.minAffected,lower:repaired.minAffected})}
 const original=blocks.map(b=>({lo:b.lo,hi:b.hi,...gate(b.rows,Math.floor(b.rows.length*.05))}));
 return {controls,original,totalMinimumRepairGroups:original.reduce((s,x)=>s+x.minRepairedGroups,0)};
}
if(require.main===module)console.log(JSON.stringify(repairBound(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
module.exports={repairBound};
