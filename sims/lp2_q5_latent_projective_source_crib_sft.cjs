'use strict';
const fs=require('node:fs');
const {core,paths}=require('./lp2_q8_latent_independent_phase_sft.cjs');
/** Exact source-crib projective q5 inverse. Word-private a,b,t, phase and direction. */
function projectiveCribs(raw,env,mode="original",hold=false){
 const {corpus,latin,rng}=env,native=JSON.parse(raw[1]),alphabet=corpus.alphabet??native.runes,q=5,mod=x=>(x%29+29)%29;
 const inv=Array(29).fill(0);for(let i=1;i<29;i++)for(let j=1;j<29;j++)if(i*j%29===1){inv[i]=j;break;}
 function canon(a){if(a.every(x=>!x))return 0;let best=Infinity;for(const d of [1,-1])for(let r=0;r<q;r++){let scale=0;for(let j=0;j<q;j++){const x=a[(r+d*j+q)%q];if(x){scale=inv[x];break;}}let id=0;for(let j=0;j<q;j++)id=id*29+(a[(r+d*j+q)%q]*scale%29);best=Math.min(best,id);}return best;}
 const keys=new Map();for(let id=0;id<29**4;id++){let x=id,a=Array(q);for(let j=0;j<4;j++){a[j]=x%29;x=Math.floor(x/29);}a[4]=mod(-a.slice(0,4).reduce((s,x)=>s+x,0));const v=canon(a);if(!keys.has(v)){let b=Array(q),t=v;for(let j=q-1;j>=0;j--){b[j]=t%29;t=Math.floor(t/29);}const k=[0];for(let j=0;j<q-1;j++)k.push(mod(k[j]+b[j]));keys.set(v,k);}}
 const keyIds=[...keys.keys()],keyIndex=new Map(keyIds.map((x,i)=>[x,i]));
 const recs=native.sections.filter(r=>!r.name.startsWith("p56")&&!r.name.startsWith("p57")).map(r=>({name:r.name,words:(r.source_text.replace(/\/\s*/gu,"").match(/[\u16A0-\u16FF]+/gu)||[]).map(w=>[...w].map(c=>alphabet.indexOf(c)))}));
 const patterns=new Map();for(const r of recs){const a=r.words.map(w=>w.join(","));for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){if(a[i]!==a[j]||(i>0&&a[i-1]===a[j-1]))continue;let n=0;while(j+n<a.length&&a[i+n]===a[j+n])n++;const words=r.words.slice(i,i+n),length=words.flat().length;if(length>=20){const k=words.map(w=>w.join(",")).join(";");if(!patterns.has(k))patterns.set(k,{source:r.name,i,j,words,length});}}}
 const cribs=[...patterns.values()].sort((a,b)=>b.length-a.length);
 // Eliminate constant and P columns. For each K, R(C)=t R(K). Retain a!=0 and t!=0 by exact local witness.
 function projector(p){const j=p.findIndex(x=>x!==p[0]);if(j<0)return {j:-1,project:v=>v.slice(1).map(x=>mod(x-v[0])),slope:()=>null};const a=inv[mod(p[j]-p[0])];return {j,project:v=>v.map((x,i)=>mod(x-v[0]-(v[j]-v[0])*mod(p[i]-p[0])*a)).filter((_,i)=>i!==0&&i!==j),slope:v=>mod((v[j]-v[0])*a)};}
 function shape(v){const z=v.find(x=>x!==0);return z===undefined?"z":v.map(x=>x*inv[z]%29).join(",");}
 const index=new Map();
 function build(w){const id=w.join(",");if(index.has(id))return index.get(id);const p=w.filter(x=>!hold||x!==0),pos=w.map((_,i)=>i).filter(i=>!hold||w[i]!==0),f=w.map((_,i)=>i).filter(i=>hold&&w[i]===0),pr=projector(p),table=new Map();
  if(!p.length){const x={p,pos,f,pr,table,all:true};index.set(id,x);return x;}
  for(let k=0;k<keyIds.length;k++){const key=keys.get(keyIds[k]);for(const d of [1,-1])for(let r=0;r<q;r++){const v=p.map((_,i)=>key[(r+d*(i%q)+q)%q]),res=pr.project(v),sh=shape(res),first=res.find(x=>x!==0)??0,ks=pr.slope(v);let a=table.get(sh);if(!a){a=[];table.set(sh,a);}a.push({k,first,ks});}}
  const x={p,pos,f,pr,table,all:false};index.set(id,x);return x;
 }
 const wordCache=new Map();for(const crib of cribs){let off=0;crib.parts=crib.words.map(w=>{const a={off,length:w.length,word:build(w),text:w.map(x=>latin[x]).join("")};off+=w.length;return a;}).sort((a,b)=>b.word.p.length-a.word.p.length);}
 function match(c,start,part,allowed){const {p,pos,f,pr,table,all}=part.word;for(const i of f)if(c[start+i]!==0)return new Set();if(all)return allowed??new Set(keyIds.map((_,i)=>i));const v=pos.map(i=>c[start+i]),rv=pr.project(v),first=rv.find(x=>x!==0)??0,cs=pr.slope(v),candidates=table.get(shape(rv))??[],out=new Set();for(const e of candidates){if(allowed&&!allowed.has(e.k))continue;if(first){const t=first*inv[e.first]%29;if(pr.j>=0&&mod(cs-t*e.ks)===0)continue;}else if(pr.j>=0&&e.ks===0&&cs===0)continue;out.add(e.k);}return out;}
 function scan(scopes){const hits=[],stats={alignments:0,wordChecks:0,allSurvivors:0},byScope=new Map();
  for(const scope of scopes){for(let ci=0;ci<cribs.length;ci++){const crib=cribs[ci];for(let i=0;i+crib.length<=scope.c.length;i++){stats.alignments++;let allowed=null;for(const part of crib.parts){stats.wordChecks++;allowed=match(scope.c,i+part.off,part,allowed);if(!allowed.size)break;}if(allowed?.size){stats.allSurvivors+=allowed.size;const found=[...allowed].map(k=>keyIds[k]);hits.push({scope:scope.name,offset:i,crib:ci,keys:found});for(const k of found){const id=scope.name+":"+k;let s=byScope.get(id);if(!s){s={scope:scope.name,id:k,key:keys.get(k),anchors:[]};byScope.set(id,s);}s.anchors.push({offset:i,end:i+crib.length,crib:ci});}}}}}
  return {stats,hits,keys:[...byScope.values()].sort((a,b)=>b.anchors.length-a.anchors.length)};
 }
 const desc=cribs.map(c=>({source:c.source,i:c.i,j:c.j,length:c.length,text:c.words.map(w=>w.map(x=>latin[x]).join("")).join(" ")}));
 if(mode!=="original"){const n=Number(mode),crib=cribs[n%cribs.length],rec=recs.find(r=>r.name===crib.source),rnd=rng(0x29f5511+n+(hold?1000:0)),key=Array.from({length:q},()=>Math.floor(rnd()*29)),delta=key.map((x,i)=>mod(key[(i+1)%q]-x)),id=canon(delta);const c=rec.words.flatMap(w=>{let r=Math.floor(rnd()*q);const a=1+Math.floor(rnd()*28),b=Math.floor(rnd()*29),t=1+Math.floor(rnd()*28),d=rnd()<.5?1:-1;return w.map(p=>{if(hold&&!p)return 0;const x=mod(a*p+b+t*key[r]);r=(r+d+q)%q;return x;});});const out=scan([{name:rec.name,c}]),trueKey=out.keys.find(x=>x.id===id);return {mode,hold,classes:keyIds.length,patterns:desc,trueId:id,trueFound:!!trueKey,trueAnchors:trueKey?.anchors.length??0,stats:out.stats,keys:out.keys.length,hits:out.hits.length,top:out.keys.slice(0,5)};}
 const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]],scopes=ranges.map(([a,b])=>({name:"p"+a+"-"+b,c:corpus.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices)}));
 return {mode,hold,classes:keyIds.length,patterns:desc,...scan(scopes)};
}
const raw=paths.map(p=>fs.readFileSync(p,'utf8')),mode=process.argv[2]??"original",hold=process.argv[3]==="hold";console.log(JSON.stringify(core(raw,e=>projectiveCribs(raw,e,mode,hold)),null,2));
