'use strict';
const fs=require('node:fs');
const {core,paths}=require('./lp2_q8_latent_independent_phase_sft.cjs');
/** Exact word-boundary crib alignment under a shared periodic additive key with independent word phases. */
function cribSearch(raw, env, q, mode="original"){
 const {corpus,latin,decode,encodeWord,rng}=env, native=JSON.parse(raw[1]),alphabet=corpus.alphabet??native.runes,mod=x=>(x%29+29)%29;
 const recs=native.sections.filter(r=>!r.name.startsWith("p56")&&!r.name.startsWith("p57")).map(r=>({name:r.name,words:(r.source_text.replace(/\/\s*/gu,"").match(/[\u16A0-\u16FF]+/gu)||[]).map(w=>[...w].map(c=>alphabet.indexOf(c)))}));
 if(recs.some(r=>r.words.some(w=>w.some(x=>x<0))))throw Error("alphabet");
 const wordsKey=w=>w.join(","), cribs=new Map();
 for(const r of recs){const a=r.words.map(wordsKey);for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){if(a[i]!==a[j]||(i>0&&a[i-1]===a[j-1]))continue;let n=0;while(j+n<a.length&&a[i+n]===a[j+n])n++;const w=r.words.slice(i,i+n),length=w.reduce((s,x)=>s+x.length,0);if(length>=20){const k=w.map(wordsKey).join(";");if(!cribs.has(k))cribs.set(k,{words:w,length,source:r.name,i,j});}}}
 const patterns=[...cribs.values()].sort((a,b)=>b.length-a.length);
 function canon(a){let best=null;for(let r=0;r<q;r++){const b=a.slice(r).concat(a.slice(0,r));const id=b.map(x=>x<0?"_":String.fromCharCode(65+x)).join("");if(best===null||id<best.id)best={id,key:b};}return best;}
 function align(c,start,crib,stats){
  let pos=start,frags=[];
  for(const w of crib.words){const f=[];for(const p of w){const x=c[pos++];if(!p){if(x!==0){stats.holdReject++;return [];}continue;}f.push(mod(x-p));}
   if(f.length>q){for(let j=q;j<f.length;j++)if(f[j]!==f[j%q]){stats.periodReject++;return [];}f.length=q;}
   if(f.length)frags.push(f);
  }
  // Each observed symbol/pair and within-fragment multiplicity must occur in one cyclic key.
  const counts=new Uint8Array(29),edges=new Uint8Array(29*29);let numEdges=0;
  for(const f of frags){const cnt=new Uint8Array(29);for(let j=0;j<f.length;j++){cnt[f[j]]++;if(j){const e=f[j-1]*29+f[j];if(!edges[e]){edges[e]=1;numEdges++;}}}for(let x=0;x<29;x++)counts[x]=Math.max(counts[x],cnt[x]);}
  if(counts.reduce((s,x)=>s+x,0)>q||numEdges>q){stats.lowerReject++;return [];}
  let bound=0;for(let a=0;a<29;a++){let o=0,i=0;for(let b=0;b<29;b++){o+=edges[a*29+b];i+=edges[b*29+a];}bound+=Math.max(o,i,counts[a]);}if(bound>q){stats.lowerReject++;return [];}
  frags.sort((a,b)=>b.length-a.length);const kept=[];
  for(const f of frags){if(!kept.some(k=>{for(let j=0;j+f.length<=k.length;j++)if(f.every((x,i)=>x===k[j+i]))return true;return false;}))kept.push(f);}
  if(!kept.length)return [];
  const initial=Array(q).fill(-1);kept[0].forEach((x,i)=>initial[i]=x);
  let states=[initial];
  for(const f of kept.slice(1)){
   const next=new Map();
   for(const a of states)for(let r=0;r<q;r++){let ok=true;for(let j=0;j<f.length;j++){const x=a[(r+j)%q];if(x>=0&&x!==f[j]){ok=false;break;}}if(!ok)continue;const b=a.slice();f.forEach((x,j)=>b[(r+j)%q]=x);next.set(b.join(","),b);}
   if(!next.size){stats.joinReject++;return [];}if(next.size>100000)throw Error("state limit; no exhaustive claim");
   states=[...next.values()];stats.maxStates=Math.max(stats.maxStates,states.length);
  }
  return [...new Map(states.map(a=>{const k=canon(a);return [k.id,k.key];})).values()];
 }
 function scan(scopes){
  const stats={comparisons:0,holdReject:0,periodReject:0,lowerReject:0,joinReject:0,maxStates:0},hits=[],complete=new Map(),partial=new Map();
  for(const scope of scopes)for(let k=0;k<patterns.length;k++){const crib=patterns[k];for(let start=0;start+crib.length<=scope.c.length;start++){stats.comparisons++;const candidates=align(scope.c,start,crib,stats);if(!candidates.length)continue;const hit={scope:scope.name,start,crib:k,full:0,partial:0,keys:[]};for(const a of candidates){const missing=a.filter(x=>x<0).length,id=canon(a).id;const m=missing?partial:complete;const group=scope.name+":"+id;if(!m.has(group))m.set(group,{scope:scope.name,key:a,missing,anchors:[]});m.get(group).anchors.push({start,crib:k,end:start+crib.length});if(missing)hit.partial++;else hit.full++;if(hit.keys.length<20)hit.keys.push(a);}hits.push(hit);}}
  return {stats,hits,complete:[...complete.values()],partial:[...partial.values()]};
 }
 const desc=patterns.map(p=>({source:p.source,i:p.i,j:p.j,length:p.length,text:p.words.map(w=>w.map(x=>latin[x]).join("")).join(" ")}));
 if(mode!=="original"){const n=Number(mode),crib=patterns[n%patterns.length],r=recs.find(x=>x.name===crib.source),rand=rng(0x29aa2511+q*100+n),key=Array.from({length:q},()=>Math.floor(rand()*29)),truth=r.words.flat(),c=r.words.flatMap(w=>encodeWord(w,key,Math.floor(rand()*q))),result=scan([{name:r.name,c}]),id=canon(key).id,found=result.complete.find(x=>canon(x.key).id===id),compatible=result.partial.filter(x=>{for(let r=0;r<q;r++)if(x.key.every((v,i)=>v<0||v===key[(r+i)%q]))return true;return false;});const anchor=found?.anchors[0],end=anchor?.end??0,suffix=found?c.slice(end,Math.min(end+150,c.length)):[],d=suffix.length?decode(suffix,found.key,Math.max(1,Math.floor(suffix.length/2))):null;return {q,mode,patterns:desc,trueKey:canon(key).key,trueFound:!!found,truePartial:compatible.length,complete:result.complete.length,partial:result.partial.length,stats:result.stats,held:d?{length:suffix.length,accuracy:d.plain.filter((x,i)=>x===truth[end+i]).length/suffix.length,score:d.full/suffix.length}:null};}
 const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
 const scopes=ranges.map(([a,b])=>({name:"p"+a+"-"+b,c:corpus.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices)}));
 const result=scan(scopes),rank=[];
 for(const x of result.complete){const c=scopes.find(s=>s.name===x.scope).c;let after=Math.max(...x.anchors.map(a=>a.end)),before=Math.min(...x.anchors.map(a=>a.start));const held=after+100<=c.length?c.slice(after,Math.min(after+150,c.length)):c.slice(Math.max(0,before-150),before);if(held.length<50)continue;const d=decode(held,x.key,Math.max(1,Math.floor(held.length/2)));rank.push({...x,heldLength:held.length,heldScore:d.full/held.length,text:d.words.map(w=>w.plain.map(x=>latin[x]).join("")).join(" ")});}
 rank.sort((a,b)=>b.heldScore-a.heldScore);
 return {q,mode,patterns:desc,...result,rank};
}
const raw=paths.map(p=>fs.readFileSync(p,'utf8')),q=Number(process.argv[2]??8),mode=process.argv[3]??"original";
console.log(JSON.stringify(core(raw,e=>cribSearch(raw,e,q,mode)),null,2));
