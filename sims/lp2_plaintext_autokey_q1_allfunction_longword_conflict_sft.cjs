'use strict';
const fs=require('node:fs');
function experiment(corpus,trans,solved,lex,injective=true){
 const gp=JSON.parse(corpus),mod=x=>(x+29)%29,assert=(x,m)=>{if(!x)throw Error(m)};
 const rune=new Map(gp.runes.map((x,i)=>[x,i])),alpha=new Map(gp.translit.map((x,i)=>[x,i]));
 const parse=s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>Array.from(w,c=>rune.get(c)));
 const original=parse(trans.replace(/[\s/%]/g,"")).slice(0,2896);
 assert(String(original.flat())===String(gp.pages.slice(0,56).flatMap(x=>x.indices)),"original alignment");
 const source=JSON.parse(solved).sections.map(s=>({name:s.name,w:parse(s.source_text)}));
 const dict=Array.from({length:40},()=>new Set());
 function add(w){if(w.length&&w.length<40)dict[w.length].add(String.fromCharCode(...w))}
 function variants(w){
  const s=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  function go(i,p){if(i===s.length){add(p);return}for(const len of [1,2,3]){const a=s.slice(i,i+len);if(a.length!==len)continue;const v=len===3?(a==="ING"?21:undefined):alpha.get(a);if(v!==undefined)go(i+len,p.concat(v));}}
  go(0,[]);
 }
 for(const line of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(line);if(m&&m[1].length>=2)variants(m[1]);}
 for(const w of ["A","I","O"])variants(w);for(const s of source)for(const w of s.w)add(w);
 const tries=rev=>dict.map(d=>{const root=new Map();for(const str of d){const p=Array.from(str,x=>x.charCodeAt(0));if(rev)p.reverse();let t=root;for(const x of p){if(!t.has(x))t.set(x,new Map());t=t.get(x)}}return root});
 const forward=tries(false),back=tries(true);
 function encrypt(words,primer,f){let s=primer;return words.map(w=>w.map(p=>{if(!p)return 0;const c=mod(p+s);s=f[p];return c}))}
 function perm(seed){const p=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[p[i],p[j]]=[p[j],p[i]]}return p}

 const offsets=[0];for(const w of original)offsets.push(offsets.at(-1)+w.length);
 function domain(w){
  const out=[];
  for(const str of dict[w.length]){
   const p=Array.from(str,x=>x.charCodeAt(0)),m=new Int8Array(29).fill(-1),edges=[];let prev=-1,ok=true;
   for(let j=0;j<w.length;j++){if(!p[j]){if(w[j]){ok=false;break}continue}const h=mod(w[j]-p[j]);if(prev>=0){if(m[prev]>=0&&m[prev]!==h){ok=false;break}if(m[prev]<0){m[prev]=h;edges.push([prev,h])}}prev=p[j]}
   if(ok&&prev>=0)out.push({m,edges});
  }return out;
 }
 const ds=original.map((w,i)=>w.length>=8?{i,offset:offsets[i],length:w.length,d:domain(w)}:null).filter(Boolean);
 function compatible(a,b){for(const x of a.d)for(const y of b.d){if(y.edges.every(([k,v])=>x.m[k]<0||x.m[k]===v))return true}return false}
 function pageOf(off){let j=0;for(const p of gp.pages.slice(0,56)){if(off<j+p.indices.length)return p.page;j+=p.indices.length}return null}
 function inspect(a,b){
  const ws=ds.filter(x=>x.offset>=a&&x.offset+x.length<=b),zero=ws.filter(x=>!x.d.length),v=ws.filter(x=>x.d.length).sort((a,b)=>a.d.length-b.d.length);
  const used=new Set(),pairs=[],edges=[];let checks=0;
  for(let i=0;i<v.length;i++)for(let j=i+1;j<v.length;j++){checks++;if(!compatible(v[i],v[j])){edges.push([v[i].i,v[j].i]);if(!used.has(v[i].i)&&!used.has(v[j].i)){used.add(v[i].i);used.add(v[j].i);pairs.push([v[i],v[j]].map(({i,offset,length,d})=>({i,offset,page:pageOf(offset),length,candidates:d.length})))}}}
  return {range:[a,b],longWords:ws.length,zero:zero.map(({i,offset,length})=>({i,offset,page:pageOf(offset),length})),checks,edgeCount:edges.length,pairs,lowerBound:zero.length+pairs.length};
 }
 const pg=[0];for(const p of gp.pages.slice(0,56))pg.push(pg.at(-1)+p.indices.length);
 const ranges=[[0,201],[pg[54],pg[54]+205],[0,pg[3]],[pg[54],pg[56]],[0,pg[56]]];
 return {lexicon:dict.reduce((a,d)=>a+d.size,0),scope:ds.length,results:ranges.map(([a,b])=>inspect(a,b))};
}
console.log(JSON.stringify(experiment(...["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt"].map(p=>fs.readFileSync(p,'utf8')),false),null,2));
