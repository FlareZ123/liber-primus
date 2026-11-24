"use strict";
const fs=require("node:fs");
function test(corpus,trans,solved,lex,grid){
 const gp=JSON.parse(corpus),g=JSON.parse(grid),mod=x=>((x%29)+29)%29;
 const rune=new Map(gp.runes.map((x,i)=>[x,i])),alpha=new Map(gp.translit.map((x,i)=>[x,i]));
 const parse=s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>Array.from(w,c=>rune.get(c)));
 const original=parse(trans.replace(/[\s/%]/g,"")).slice(0,2896),source=JSON.parse(solved).sections.map(s=>({name:s.name,w:parse(s.source_text)}));
 if(String(original.flat())!==String(gp.pages.slice(0,56).flatMap(x=>x.indices)))throw Error("source alignment");
 const dict=Array.from({length:40},()=>new Set());
 function add(w){if(w.length&&w.length<40)dict[w.length].add(String.fromCharCode(...w))}
 function variants(w){const s=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  function go(i,p){if(i===s.length){add(p);return}for(const n of [1,2,3]){const a=s.slice(i,i+n);if(a.length!==n)continue;const v=n===3?(a==="ING"?21:undefined):alpha.get(a);if(v!==undefined)go(i+n,p.concat(v))}}go(0,[])}
 for(const l of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(l);if(m&&m[1].length>=2)variants(m[1])}for(const w of ["A","I","O"])variants(w);for(const s of source)for(const w of s.w)add(w);
 const counts=Array.from({length:30},()=>Array(29).fill(.5));for(const s of source){let prev=29;for(const p of s.w.flat()){counts[prev][p]++;prev=p}}
 const lm=counts.map(r=>{const t=r.reduce((a,b)=>a+b);return r.map(v=>Math.log(v/t))});
 function encrypt(words,primer,f){let s=primer;return words.map(w=>w.map(p=>{if(!p)return 0;const c=mod(p+s);s=f[p];return c}))}
 function fit(words,f,primer){
  let states=[{s:primer,last:29,score:0,pt:[],words:[],hits:0}];
  for(const w of words){
   const next=new Map();
   for(const a of states){
    function go(i,s,last,score,p){if(i===w.length){const hit=dict[p.length].has(String.fromCharCode(...p));const b={s,last,score,pt:a.pt.concat(p),words:a.words.concat([p]),hits:a.hits+(hit?1:0)};const k=s*30+last;if(!next.has(k)||next.get(k).score<b.score)next.set(k,b);return}
     const c=w[i],v=mod(c-s);if(!c)go(i+1,s,0,score+lm[last][0],p.concat(0));if(v)go(i+1,f[v],v,score+lm[last][v],p.concat(v));}
    go(0,a.s,a.last,a.score,[]);
   }
   states=[...next.values()];if(!states.length)return null
  }
  const a=states.sort((a,b)=>b.score-a.score)[0];if(String(encrypt(a.words,primer,f).flat())!==String(words.flat()))throw Error("replay");
  return {score:a.score/a.pt.length,hits:a.hits,words:a.words.length,plaintext:a.words.map(w=>w.map(x=>gp.translit[x]).join("")).join(" "),pt:a.pt}
 }
 const offsets=[0];for(const w of original)offsets.push(offsets.at(-1)+w.length);const po=[0];for(const p of gp.pages.slice(0,56))po.push(po.at(-1)+p.indices.length);
 const target=[49,51].map(page=>({page,w:original.slice(offsets.findIndex(o=>o>=po[page]),offsets.findLastIndex(o=>o<=po[page+1]))}));
 const out=[],controls=[];
 for(const radix of [59,60]){
 const alphabet=radix===59?g.alphabet.replace("f",""):g.alphabet,T=g.pages.flatMap(p=>p.tokens.map(t=>radix*alphabet.indexOf(t[0])+alphabet.indexOf(t[1])));if(T.length!==256||T.some(v=>v<0||v>255))throw Error("table");
 for(const index of ["gp0","gpprime"])for(const sign of [1,-1]){
 const f=gp.runes.map((_,p)=>mod(sign*T[index==="gp0"?p:gp.prime[p]]));
 const s=source.find(x=>x.name==="0_welcome"),primer=11,ct=encrypt(s.w,primer,f),pred=fit(ct,f,primer);controls.push({radix,index,sign,exact:pred&&pred.pt.filter((v,i)=>v===s.w.flat()[i]).length,n:s.w.flat().length});
 for(const t of target){let candidates=[];for(let primer=0;primer<29;primer++){const r=fit(t.w,f,primer);if(r){const {pt,...result}=r;candidates.push({primer,...result})}}
 candidates.sort((a,b)=>b.score-a.score);out.push({page:t.page,radix,index,sign,legal:candidates.length,best:candidates[0]||null});}
 }
 }
 return {controls,out};
}
const args=["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/liber-primus/lp2-grid-256.json"].map(p=>fs.readFileSync(p,"utf8"));
console.log(JSON.stringify(test(...args),null,2));
