"use strict";
// Director #2602: orthographic sensitivity of the existing #2536 q13 gate.
// Baseline parser, lexicon, conflict bound and authentic control logic adapted
// verbatim from lp2_p23_26_period13_word_relation_sft.cjs; see that report.
const {createSolver,encode,decodeFixed}=require("./lp2_fhold_word_relation_csp.cjs");
function experiment(inputs){
 const [gp,trans,lex,native]=[JSON.parse(inputs[0]),inputs[1],inputs[2],JSON.parse(inputs[3])];
 const assert=(x,m)=>{if(!x)throw Error(m)},map=new Map(gp.runes.map((r,i)=>[r,i])),alpha=new Map(gp.translit.map((s,i)=>[s,i]));
 const parse=s=>(s.replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>map.get(x)));
 const originalWords=parse(trans).slice(0,2896);assert(String(originalWords.flat())===String(gp.pages.slice(0,56).flatMap(p=>p.indices)),"original source");
 const solved=native.sections.map(s=>(s.source_text.replace(/['’]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>map.get(x))));
 const cipherSections=inputs[6].split("$").map(parse);
 assert(solved[3].flat().length===780,"external KOAN1 donor");
 solved[3]=cipherSections[3].map(w=>w.map(v=>(2-v+29)%29));assert(solved[3].flat().length===778,"source KOAN1");
 function buildLexicon(excluded){
  const dict=Array.from({length:32},()=>new Map()),add=w=>{if(w.length&&w.length<32)dict[w.length].set(String(w),w)};
  function variants(word){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/['’]/g,"");
   function walk(i,w){if(i===s.length){add(w);return}for(const n of [1,2,3]){const a=s.slice(i,i+n);if(a.length!==n)continue;const v=n===3?(a==="ING"?alpha.get("NG"):undefined):a==="IO"?alpha.get("IA"):alpha.get(a);if(v!==undefined)walk(i+n,[...w,v])}}walk(0,[])}
  for(const l of lex.split(/\r?\n/)){const m=/^([a-z']+)\s+(\d+)$/.exec(l);if(m&&m[1].length>=2)variants(m[1])}
  for(const s of ["A","I","O"])variants(s);
  for(const [i,sec] of solved.entries())if(i!==excluded)for(const w of sec)add(w);
  const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  for(const source of inputs.slice(4,6))for(let w of source.toUpperCase().match(/[A-Z]+(?:['’][A-Z]+)*/g)||[]){const p=[];w=w.replace(/['’]/g,"").replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));if(!t)throw Error("donor token "+w);p.push(t.i);w=w.slice(t.s.length)}add(p)}
  return dict;
 }
 function cutAt(ws,min){let cut=0,n=0;while(n<min&&cut<ws.length)n+=ws[cut++].length;return {cut,n}}
 function summary(x){return {...x,keys:x.keys.map(v=>({key:v.key,paths:v.paths,endPhases:v.endPhases,runes:v.p.flat().length}))}}

 /** Optimistic pairwise word compatibility with arbitrary legal intervening F holds. */
 function conflictBound(ws,period,dict,minLength=4){
  const mod=(x,n)=>(x%n+n)%n,groups=[],start=[],zeros=[0];let offset=0;
  for(const c of ws){start.push(offset);offset+=c.length;zeros.push(zeros.at(-1)+c.filter(v=>v===0).length);const a=new Map();
   if(c.length>=minLength)for(const p of (dict[c.length]||new Map()).values()){const d=[];let legal=true;for(let i=0;i<c.length;i++){if(p[i]===0){if(c[i]!==0){legal=false;break}}else d.push(mod(c[i]-p[i],29))}if(!legal||d.some((v,i)=>i>=period&&v!==d[i%period]))continue;
    const holds=c.length-d.length;if(!a.has(holds))a.set(holds,[]);a.get(holds).push(d.slice(0,period))}
   groups.push(a)
  }
  const eligible=ws.flatMap((w,i)=>w.length>=minLength?[i]:[]),mandatory=eligible.filter(i=>!groups[i].size),edges=[];
  function compatible(i,j){const gapF=zeros[j]-zeros[i+1],distance=start[j]-start[i];
   for(const [ha,as] of groups[i])for(const [hb,bs] of groups[j])for(let h=0;h<=Math.min(gapF,period-1);h++){
    const phase=mod(distance-ha-h,period),pairs=[];for(let b=0;b<bs[0].length;b++){const a=mod(phase+b,period);if(a<as[0].length)pairs.push([a,b])}
    if(!pairs.length)return true;const sig=(row,k)=>pairs.map(p=>row[p[k]]).join(",");const hashes=new Set(as.map(a=>sig(a,0)));if(bs.some(b=>hashes.has(sig(b,1))))return true
   }return false
  }
  for(let a=0;a<eligible.length;a++){const i=eligible[a];if(!groups[i].size)continue;for(let b=a+1;b<eligible.length;b++){const j=eligible[b];if(groups[j].size&&!compatible(i,j))edges.push([i,j])}}
  let best=edges.length,bestCover=null,nodes=0;const memo=new Map();
  function cover(es,chosen){nodes++;const n=chosen.length;if(!es.length){if(n<=best){best=n;bestCover=chosen.slice()}return}if(n>=best)return;const used=new Set();let matching=0;for(const [u,v] of es)if(!used.has(u)&&!used.has(v)){used.add(u);used.add(v);matching++}if(n+matching>best)return;const id=es.map(e=>e.join(":")).join(",");if((memo.get(id)??Infinity)<=n)return;memo.set(id,n);const deg=new Map();for(const [u,v] of es){deg.set(u,(deg.get(u)||0)+1);deg.set(v,(deg.get(v)||0)+1)}const v=[...deg].sort((a,b)=>b[1]-a[1])[0][0],neigh=new Set(es.filter(e=>e.includes(v)).map(e=>e[0]===v?e[1]:e[0]));cover(es.filter(e=>!e.includes(v)),[...chosen,v]);cover(es.filter(e=>!e.some(u=>neigh.has(u))),[...chosen,...neigh])}
  cover(edges,[]);return {eligible:eligible.length,minLength,mandatory,edges,minimumOOVLowerBound:mandatory.length+best,cover:bestCover,nodes};
 }
 function authentic(section,period,trainLength,expectedKey,expanded=false){
  const dict=expanded?expand(buildLexicon(section)):buildLexicon(section),engine=createSolver(period,dict),ws=cipherSections[section],{cut,n}=cutAt(ws,trainLength),prefix=ws.slice(0,cut);
  const strict=engine.solve(prefix);let result=strict,escape=null;
  if(strict.exact&&!strict.keys.length&&strict.failure){escape=strict.failure.word;result=engine.solve(prefix,{wildcard:new Set([escape])})}
  const out={section:native.sections[section].name,period,vocabulary:dict.reduce((n,d)=>n+d.size,0),trainWords:cut,trainRunes:n,held:ws.flat().length-n,strict:summary(strict),escape,result:summary(result)};
  // Comparator after the prefix-only key search.
  assert(String(ws.map(w=>w.length))===String(solved[section].map(w=>w.length)),"authentic source boundaries "+section);
  out.truthOOV=solved[section].slice(0,cut).flatMap((w,i)=>dict[w.length].has(String(w))?[]:[i]);
  out.correctKey=result.keys.length===1&&result.exact&&String(result.keys[0].key)===String(expectedKey);
  if(out.correctKey&&result.keys[0].endPhases.length===1){const learned=result.keys[0],held=decodeFixed(ws.slice(cut),learned.key,dict,learned.endPhases[0]),full=learned.p.concat(held?.p||[]).flat();out.continuation=held?{runes:held.p.flat().length,score:held.score,paths:held.paths,exactMatches:held.p.flat().filter((v,i)=>v===solved[section].flat()[n+i]).length}:null;out.correctFull=String(full)===String(solved[section].flat());out.replay=String(encode(learned.p.concat(held?.p||[]),learned.key).flat())===String(ws.flat())}
  out.conflict=conflictBound(prefix,period,dict);return out;
 }


 /** One internal adjacent non-F rune transposition; no chaining. */
 function expand(dict){
  const next=dict.map(d=>new Map(d));
  for(const [len,d] of dict.entries())if(len>=5)for(const w of d.values())for(let i=1;i<len-2;i++){
   if(w[i]===0||w[i+1]===0||w[i]===w[i+1])continue;
   const v=w.slice();[v[i],v[i+1]]=[v[i+1],v[i]];next[len].set(String(v),v);
  }return next;
 }
 const display=w=>w.map(v=>gp.translit[v]).join("");
 const folds=solved.map((sec,i)=>{
  const d=buildLexicon(i),e=expand(d),oov=sec.filter(w=>!d[w.length].has(String(w))),remaining=oov.filter(w=>!e[w.length].has(String(w)));
  const nullBefore=sec.reduce((n,w)=>n+d[w.length].size/29**w.length,0),nullAfter=sec.reduce((n,w)=>n+e[w.length].size/29**w.length,0);
  const long=sec.filter(w=>w.length>=4);
  return {i,name:native.sections[i].name,words:sec.length,longWords:long.length,longOOVBefore:oov.filter(w=>w.length>=4).length,longOOVAfter:remaining.filter(w=>w.length>=4).length,runes:sec.flat().length,before:oov.map(display),after:remaining.map(display),nullBefore,nullAfter,base:d.reduce((n,m)=>n+m.size,0),expanded:e.reduce((n,m)=>n+m.size,0)};
 });
 const controls=[authentic(1,8,255,[23,10,1,10,9,10,16,26],true),authentic(5,13,155,[0,10,4,0,1,19,0,18,4,18,9,0,18],true)];
 const dict=buildLexicon(-1),expanded=expand(dict),engine=createSolver(13,expanded);
 const begin=gp.pages.slice(0,23).reduce((n,p)=>n+p.indices.length,0),end=gp.pages.slice(0,27).reduce((n,p)=>n+p.indices.length,0);let off=0;
 const ws=originalWords.filter(w=>{const i=off;off+=w.length;return i>=begin&&off<=end});assert(ws.flat().length===1021&&String(ws.flat())===String(gp.pages.slice(23,27).flatMap(p=>p.indices)),"p23-26 original chapter");
 const {cut,n}=cutAt(ws,500),prefix=ws.slice(0,cut);
 const before=conflictBound(prefix,13,dict),after=conflictBound(prefix,13,expanded);
 assert(before.minimumOOVLowerBound===16&&after.minimumOOVLowerBound===5,"fixed baseline and expanded bounds");
 const covers=new Map();
 function enumerate(es,chosen){
  if(chosen.size>5)return;
  if(!es.length){const v=[...chosen].sort((a,b)=>a-b);covers.set(String(v),v);return}
  for(const u of es[0]){const next=new Set(chosen);next.add(u);enumerate(es.filter(e=>!e.includes(u)),next)}
 }
 enumerate(after.edges,new Set(after.mandatory));
 const strict=summary(engine.solve(prefix,{limit:3000}));
 const runs=[...covers.values()].map(c=>({c,result:summary(engine.solve(prefix,{limit:3000,wildcard:new Set(c)}))}));
 const allFiveCoverTestsComplete=runs.length===covers.size&&runs.every(x=>x.result.exact&&!x.result.keys.length);
 assert(covers.size===2&&allFiveCoverTestsComplete,"all budget-five covers");
 return {folds,controls,vocabByLength:dict.map((d,i)=>[i,d.size,expanded[i].size]).filter(x=>x[1]),target:{cut,n,before,after,removed:before.edges.filter(x=>!after.edges.some(y=>String(y)===String(x))),added:after.edges.filter(x=>!before.edges.some(y=>String(y)===String(x))),strict,coverCount:covers.size,runs,allFiveCoverTestsComplete,certifiedOOVLowerBound:6}};
}

const fs=require("node:fs"),path=require("node:path");
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/transcriptions/lp1_wulfic_canonical.txt"];
console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
