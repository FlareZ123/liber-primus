'use strict';
const fs=require('node:fs'),path=require('node:path');
function recover(d,trans,native,lex,ink){
 const gp=d.runes,mp=new Map(gp.map((v,i)=>[v,i])),alpha=new Map(d.translit.map((v,i)=>[v,i]));
 const parse=s=>[...s].filter(c=>mp.has(c)).map(c=>mp.get(c));
 const words=s=>(s.replace(/[\/%\r\n'’]/g,"").match(new RegExp("["+gp.join("")+"]+","gu"))||[]).map(parse);
 const ws=words(trans.split("%").slice(0,55).join("")),C=d.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
 const eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]),check=(v,m)=>{if(!v)throw Error(m)};
 check(C.length===12956&&ws.length===2896&&eq(C,ws.flat()),"canonical source");
 const canonical=Array.from({length:29},(_,i)=>i), nativeWords=native.sections.map(s=>({name:s.name,w:words(s.source_text)}));
 const dict=new Set(),tries=Array.from({length:32},()=>new Map());
 function add(w){const k=w.join(",");if(!w.length||w.length>=32||dict.has(k))return;dict.add(k);let node=tries[w.length];
  for(const v of w){if(!node.has(v))node.set(v,new Map());node=node.get(v);}}
 function variants(word){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  function walk(i,w){if(i===s.length){add(w);return;}for(const n of [1,2,3]){const a=s.slice(i,i+n);if(a.length!==n)continue;
   const v=n===3?(a==="ING"?alpha.get("NG"):undefined):alpha.get(a);if(v!==undefined)walk(i+n,[...w,v]);}}walk(0,[]);}
 for(const l of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(l);if(m&&m[1].length>=2)variants(m[1]);}
 for(const s of ["A","I","O"])variants(s);for(const s of nativeWords)for(const w of s.w)add(w);
 function swap(a,i){const j=Math.max(0,i-1);[a[i],a[j]]=[a[j],a[i]];}
 function encode(plain,rankToCipher){const a=canonical.slice();return plain.map(v=>{const i=a.indexOf(v),c=rankToCipher[i];swap(a,i);return c;});}
 function decode(cipher,cipherToRank){const a=canonical.slice();return cipher.map(c=>{const i=cipherToRank[c],v=a[i];swap(a,i);return v;});}
 /** Exact rank-label key search, using mutable state and fixed-length word tries. */
 function solve(wds,cap=3000000){
  let nodes=0,deepest=0,capped=false;const a=canonical.slice(),key=Array(29).fill(-1),inv=Array(29).fill(-1),levels=Array(wds.length+1).fill(0);
  function dfs(i,j,node){
   if(++nodes>cap){capped=true;return null;}
   deepest=Math.max(deepest,i);
   if(i===wds.length)return key.slice();
   if(j===wds[i].length){levels[i+1]++;return dfs(i+1,0, i+1===wds.length?null:tries[wds[i+1].length]);}
   const c=wds[i][j],r=key[c];
   if(r>=0){const child=node.get(a[r]);if(!child)return null;swap(a,r);const z=dfs(i,j+1,child);swap(a,r);return z;}
   for(const [p,child] of node){
    const rank=a.indexOf(p);if(inv[rank]>=0)continue;
    key[c]=rank;inv[rank]=c;swap(a,rank);
    const z=dfs(i,j+1,child);
    swap(a,rank);key[c]=-1;inv[rank]=-1;
    if(z)return z;if(capped)return null;
   }
   return null;
  }
  const k=dfs(0,0,tries[wds[0].length]);
  return {status:k?"found":capped?"capped":"impossible",nodes,deepest,levels:levels.slice(0,deepest+2),key:k};
 }
 function prefix(wds,n){let len=0;const a=[];for(const w of wds){if(len+w.length>n)break;a.push(w);len+=w.length;}return a;}
 const section=[];let off=0;for(const w of ws){if(off>=12648)section.push(w);off+=w.length;}
 const out={lexicon:dict.size,original:[],controls:[]};
 const red=ink.physical_zero_based.red_words;const start=ink.physical_zero_based.large_punctuation[0].after_runes;
 check(start===13&&red.length===2&&eq(ws.slice(0,2).flat(),red.flatMap(w=>w.gp_indices)),"p0 original rubric boundary");
 for(const [name,w] of [["opening",ws],["p0-black-body",ws.slice(2)],["terminal",section]]){
  const fit=prefix(w,200),s=solve(fit);out.original.push({name,fitWords:fit.length,fitRunes:fit.flat().length,...s});
 }
 for(const [name,seed] of [["0_welcome",7],["jpg107-167",11]]){
  const w=nativeWords.find(s=>s.name===name).w, p=w.flat(),trueRankToCipher=canonical.map(i=>(seed*i+9)%29),trueCipherToRank=canonical.map(i=>trueRankToCipher.indexOf(i));
  const c=encode(p,trueRankToCipher);check(eq(decode(c,trueCipherToRank),p),"native known key");
  let j=0;const cw=w.map(x=>{const a=c.slice(j,j+x.length);j+=x.length;return a;});
  const fit=prefix(cw,Math.floor(p.length*2/3)),b=fit.flat().length,s=solve(fit);
  let recovered=0,scored=0,keyMatches=0;
  if(s.key){
   const unknown=canonical.filter(x=>!s.key.includes(x)),k=s.key.map(x=>x<0?unknown.shift():x);
   const pred=decode(c,k);recovered=pred.slice(b).filter((v,i)=>v===p[b+i]).length;scored=p.length-b;keyMatches=k.filter((v,i)=>v===trueCipherToRank[i]).length;
   check(eq(encode(pred,canonical.map(i=>k.indexOf(i))),c),"candidate replay");
  }
  out.controls.push({name,fitWords:fit.length,fitRunes:b,...s,keyMatches,heldout:scored,recovered});
 }
 return out;
}
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
console.log(JSON.stringify(recover(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/liber-primus/lp2-transcription.txt"),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),read("resources/control/english_wordfreq_textblob.txt"),JSON.parse(read("resources/liber-primus/lp2-p0-physical-ink-override.json"))),null,2));
