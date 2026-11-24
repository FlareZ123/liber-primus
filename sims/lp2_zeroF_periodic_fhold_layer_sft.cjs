"use strict";
function experiment(raw,createSolver,encode,decodeFixed){
 const [gp,grid,trans,lex,native]=[JSON.parse(raw[0]),JSON.parse(raw[1]),raw[2],raw[3],JSON.parse(raw[4])];
 const assert=(x,m)=>{if(!x)throw Error(m)},map=new Map(gp.runes.map((r,i)=>[r,i])),alpha=new Map(gp.translit.map((s,i)=>[s,i]));
 const parse=s=>(s.replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>map.get(x)));
 const words=parse(trans).slice(0,2896),original=words.flat();assert(String(original)===String(gp.pages.slice(0,56).flatMap(p=>p.indices)),"original source");
 const tokens=grid.pages.flatMap(p=>p.tokens),special=[0,2,12,21,22,25,27,28];assert(tokens.length===256,"grid");
 const marker=i=>tokens[i][0]==="0"?0:special[grid.bytes[i]&7],swap=(v,a,b)=>v===a?b:v===b?a:v;
 function unwrap(c,off=0,prev=0){return c.map((v,i)=>i+off===0?v:swap(v,i?c[i-1]:prev,marker((i+off-1)&255)))}
 function wrap(m,off=0,prev=0){const c=[];for(let i=0;i<m.length;i++)c.push(i+off===0?m[i]:swap(m[i],i?c[i-1]:prev,marker((i+off-1)&255)));return c}
 const mid=unwrap(original);assert(mid.filter((v,i)=>v!==original[i]).length===549,"frozen edits");assert(String(wrap(mid))===String(original),"outer original replay");
 const split=(seq,ws)=>{let n=0;return ws.map(w=>{const x=seq.slice(n,n+w.length);n+=w.length;return x})};
 const target=split(mid,words).slice(-66),off=original.length-308;assert(target.flat().length===308,"target length");
 const solved=native.sections.map(s=>(s.source_text.match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>map.get(x))));
 const dict=Array.from({length:32},()=>new Map()),add=w=>{if(w.length&&w.length<32)dict[w.length].set(String(w),w)};
 function variants(word){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function walk(i,w){if(i===s.length){add(w);return;}for(const n of [1,2,3]){const a=s.slice(i,i+n);if(a.length!==n)continue;const v=n===3?(a==="ING"?alpha.get("NG"):undefined):alpha.get(a);if(v!==undefined)walk(i+n,[...w,v]);}}walk(0,[]);}
 for(const l of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(l);if(m&&m[1].length>=2)variants(m[1]);}
 for(const s of ["A","I","O"])variants(s);for(const sec of solved)for(const w of sec)add(w);
 const splitAt=(ws,n)=>{let i=0,k=0;while(k<n&&i<ws.length)k+=ws[i++].length;return [i,k]};
 const show=r=>({...r,keys:r.keys.map(x=>({key:x.key,paths:x.paths,endPhases:x.endPhases,p:x.p.map(w=>w.map(v=>gp.translit[v]).join("")).join(" ")}))});
 const results=[];
 for(const q of [8,13]){
  const solver=createSolver(q,dict);
  const controls=[];
  for(const [j,s] of [solved[3].slice(135),solved[3].slice(20),solved[3].slice(85)].entries()){
   const p=s.slice(0,Math.min(140,s.length));let seed=0x12345678+q*100+j;const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%29},key=Array.from({length:q},rand);
   const [cut,train]=splitAt(p,200);if(cut===p.length)continue;
   const m=encode(p,key),c=wrap(m.flat(),off,original[off-1]),recovered=split(unwrap(c,off,original[off-1]),p);assert(String(recovered.flat())===String(m.flat()),"outer control");
   const r=solver.solve(recovered.slice(0,cut),{limit:3000});
   const good=r.keys.length===1&&r.exact&&String(r.keys[0].key)===String(key);
   let continuation=null;
   if(good){const d=decodeFixed(recovered,r.keys[0].key,dict),flat=d?.p.flat()||[],truth=p.flat();continuation={matched:flat.slice(train).filter((x,i)=>x===truth[train+i]).length,total:truth.length-train,paths:d?.paths,replay:String(wrap(encode(d.p,key).flat(),off,original[off-1]))===String(c)}}
   controls.push({j,key,train,good,continuation,result:show(r)});
  }
  const [cut,train]=splitAt(target,200);const r=solver.solve(target.slice(0,cut),{limit:3000});
  let continuation=null;if(r.exact&&r.keys.length===1){const d=decodeFixed(target,r.keys[0].key,dict);if(d)continuation={...d,p:d.p.map(w=>w.map(v=>gp.translit[v]).join("")).join(" "),replay:String(wrap(encode(d.p,r.keys[0].key).flat(),off,original[off-1]))===String(original.slice(off))}}
  const wildcardResults=[];if(!r.keys.length&&r.exact){for(let wi=0;wi<cut;wi++){const w=solver.solve(target.slice(0,cut),{limit:3000,wildcard:new Set([wi])});wildcardResults.push({wi,count:w.keys.length,exact:w.exact,nodes:w.nodes,failure:w.failure})}}
  results.push({q,controls,target:{train,held:308-train,changed:mid.slice(off).filter((v,i)=>v!==original[off+i]).length,zeros:target.slice(0,cut).flat().filter(x=>x===0).length,result:show(r),continuation,wildcardResults}})
 }
 return {vocabulary:dict.reduce((n,d)=>n+d.size,0),results};
}
const fs=require("node:fs"),path=require("node:path");
const {createSolver,encode,decodeFixed}=require("./lp2_fhold_word_relation_csp.cjs");
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-grid-256.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8")),createSolver,encode,decodeFixed),null,2));
