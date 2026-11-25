/**
 * Source-constrained period-15 GP29/F-hold test for the p23–26 black body.
 * The p23 five-dot marker selects specimen 5 from the 1977 mayfly plate;
 * the source image identifies specimen 5 as Ephemerella ignita. A 1978
 * study reports 15 developmental stages for that species. The p23–26
 * black body is exactly 1005 runes = 15 * 67 after the 16-rune red heading.
 * Hypothesis: the black body uses a continuous period-15 additive GP29 key
 * with transparent F and intact printed word boundaries. The 15-stage fact
 * is an exploratory source clue, not proof of the cipher family.
 */
"use strict";
const {createSolver,encode,decodeFixed}=require("./lp2_fhold_word_relation_csp.cjs");
/** @param {string[]} inputs */
function experiment(inputs){
 const [gp,trans,lex,native]=[JSON.parse(inputs[0]),inputs[1],inputs[2],JSON.parse(inputs[3])];
 const assert=(x,m)=>{if(!x)throw Error(m)},map=new Map(gp.runes.map((r,i)=>[r,i])),alpha=new Map(gp.translit.map((s,i)=>[s,i]));
 const parse=s=>(s.replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>map.get(x)));
 const originalWords=parse(trans).slice(0,2896);assert(String(originalWords.flat())===String(gp.pages.slice(0,56).flatMap(p=>p.indices)),"original source");
 const solved=native.sections.map(s=>(s.source_text.replace(/['’]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>map.get(x))));
 const cipherSections=inputs[6].split("$").map(parse);
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
 function authentic(section,period,trainLength,expectedKey){
  const dict=buildLexicon(section),engine=createSolver(period,dict),ws=cipherSections[section],{cut,n}=cutAt(ws,trainLength),prefix=ws.slice(0,cut);
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

 const controls=[authentic(1,8,255,[23,10,1,10,9,10,16,26]),authentic(5,13,155,[0,10,4,0,1,19,0,18,4,18,9,0,18])];
 assert(controls.every(x=>x.correctKey&&x.continuation?.exactMatches===x.held&&x.continuation.paths===1&&x.replay),"authentic key/holdout gate");
 const dict=buildLexicon(-1),engine=createSolver(15,dict);
 const syntheticKey=[2,7,11,3,19,5,23,13,17,1,24,6,14,8,20];
 const syntheticPlain=solved[1],syntheticCipher=encode(syntheticPlain,syntheticKey),syntheticResult=engine.solve(syntheticCipher);
 const syntheticHasKey=syntheticResult.keys.some(k=>String(k.key)===String(syntheticKey));
 assert(syntheticHasKey,"period15 synthetic positive control did not recover the planted key");
 const synthetic={period:15,runicCount:syntheticPlain.flat().length,key:syntheticKey,recovered:syntheticHasKey,candidateKeys:syntheticResult.keys.length,exact:syntheticResult.exact};
 const begin=gp.pages.slice(0,23).reduce((n,p)=>n+p.indices.length,0),end=gp.pages.slice(0,27).reduce((n,p)=>n+p.indices.length,0);let off=0;
 const pageWords=originalWords.filter(w=>{const i=off;off+=w.length;return i>=begin&&off<=end});
 assert(pageWords.flat().length===1021&&String(pageWords.flat())===String(gp.pages.slice(23,27).flatMap(p=>p.indices)),"p23-26 original chapter");
 const ink=JSON.parse(inputs[7]),redSpan=ink.pages.find(p=>p.page===23).red_spans[0],redIndices=Array.from(redSpan.runes,x=>map.get(x));
 assert(redSpan.start===0&&redSpan.length===16&&pageWords[0].length===16&&String(pageWords[0])===String(redIndices),"p23 16-rune red heading boundary");
 const ws=pageWords.slice(1);
 assert(ws.flat().length===1005&&1005===15*67,"p23-26 black body is exactly 15x67");
 const {cut,n}=cutAt(ws,500),prefix=ws.slice(0,cut),strict=engine.solve(prefix),target={chapter:"p23-26 black body",sourceSelector:"specimen5 Ephemerella ignita; 15 instars; 1005=15x67",period:15,vocabulary:dict.reduce((n,d)=>n+d.size,0),redHeadingRunes:redIndices.length,bodyRunes:ws.flat().length,trainWords:cut,trainRunes:n,held:1005-n,synthetic,strict:summary(strict)};
 let chosen=strict;if(strict.exact&&!strict.keys.length&&strict.failure){const escape=strict.failure.word;chosen=engine.solve(prefix,{wildcard:new Set([escape])});target.escape={word:escape,result:summary(chosen)}}
 if(chosen.exact&&chosen.keys.length===1&&chosen.keys[0].endPhases.length===1){const k=chosen.keys[0],held=decodeFixed(ws.slice(cut),k.key,dict,k.endPhases[0]);target.continuation=held?{score:held.score,paths:held.paths,plaintext:held.p.map(w=>w.map(v=>gp.translit[v]).join("")).join(" "),replay:String(encode(k.p.concat(held.p),k.key).flat())===String(ws.flat())}:null}
 target.conflict=conflictBound(prefix,15,dict);
 return {controls,target};

}
const fs=require("node:fs"),path=require("node:path");
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/transcriptions/lp1_wulfic_canonical.txt","resources/liber-primus/lp2-ink-annotations.json"];
console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
