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
  return out;
 }

 const controls=[authentic(1,8,255,[23,10,1,10,9,10,16,26]),authentic(5,13,155,[0,10,4,0,1,19,0,18,4,18,9,0,18])];
 assert(controls.every(x=>x.correctKey&&x.continuation?.exactMatches===x.held&&x.continuation.paths===1&&x.replay),"authentic key/holdout gate");
 const dict=buildLexicon(-1),engine=createSolver(13,dict);
 const begin=gp.pages.slice(0,23).reduce((n,p)=>n+p.indices.length,0),end=gp.pages.slice(0,27).reduce((n,p)=>n+p.indices.length,0);let off=0;
 const ws=originalWords.filter(w=>{const i=off;off+=w.length;return i>=begin&&off<=end});assert(ws.flat().length===1021&&String(ws.flat())===String(gp.pages.slice(23,27).flatMap(p=>p.indices)),"p23-26 original chapter");
 const {cut,n}=cutAt(ws,500),prefix=ws.slice(0,cut),strict=engine.solve(prefix),target={chapter:"p23-26",vocabulary:dict.reduce((n,d)=>n+d.size,0),trainWords:cut,trainRunes:n,held:1021-n,strict:summary(strict)};
 let chosen=strict;if(strict.exact&&!strict.keys.length&&strict.failure){const escape=strict.failure.word;chosen=engine.solve(prefix,{wildcard:new Set([escape])});target.escape={word:escape,result:summary(chosen)}}
 if(chosen.exact&&chosen.keys.length===1&&chosen.keys[0].endPhases.length===1){const k=chosen.keys[0],held=decodeFixed(ws.slice(cut),k.key,dict,k.endPhases[0]);target.continuation=held?{score:held.score,paths:held.paths,plaintext:held.p.map(w=>w.map(v=>gp.translit[v]).join("")).join(" "),replay:String(encode(k.p.concat(held.p),k.key).flat())===String(ws.flat())}:null}
 return {controls,target};

}
const fs=require("node:fs"),path=require("node:path");
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/transcriptions/lp1_wulfic_canonical.txt"];
console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
