'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function analyze(corpus,transcription,sourceChapters){
 const check=(x,m)=>{if(!x)throw Error(m)},sum=a=>a.reduce((s,v)=>s+v,0);
 const obj=corpus.pages[25].indices.slice(144,150),transformed=obj.map((v,i)=>Number(BigInt(v)**BigInt(i?27:3)%29n)),cuts=transformed.slice(0,-1).map((_,i)=>[sum(transformed.slice(0,i+1)),sum(transformed.slice(i+1))]);
 check(obj.join()==="18,3,20,10,11,16"&&transformed.join()==="3,10,16,3,8,20","p25 transform");
 const ri=new Map(corpus.runes.map((x,i)=>[x,i])),parts=transcription.replace(/\r/g,"").split(/^\s*%\s*$/m).slice(0,57);
 let groups=[],w=[],sp=-1,ep=-1,st=0;
 function flush(){if(w.length)groups.push({page:sp,endPage:ep,start:st,v:w});w=[]}
 for(let s=0;s<parts.length;s++){const p=s>=50?s+1:s;let o=0;for(const ch of parts[s]){if(ri.has(ch)){if(!w.length){sp=p;st=o}ep=p;w.push(ri.get(ch));o++}else if(!/[\s/]/u.test(ch))flush()}check(o===corpus.pages[p].indices.length,"page "+p)}
 flush();
 const canon=groups.filter(w=>w.page===w.endPage);
 check(groups.length===2941&&canon.length===2909,"full corpus groups");
 const lp2=[];
 for(const reverse of [false,true])for(const pageOrigin of [0,1])for(const offsetOrigin of [0,1]){
  const points=cuts.map(pair=>{const [p,o]=reverse?[pair[1]-pageOrigin,pair[0]-offsetOrigin]:[pair[0]-pageOrigin,pair[1]-offsetOrigin];const a=corpus.pages[p]?.indices;const word=canon.filter(w=>w.page===p)[o];return {p,o,rune:a?.[o]??null,word:word?{start:word.start,v:word.v}:null}});
  lp2.push({reverse,pageOrigin,offsetOrigin,points,runeText:points.map(v=>v.rune===null?"?":corpus.translit[v.rune]).join(" "),wordText:points.map(v=>v.word?v.word.v.map(i=>corpus.translit[i]).join(""):"?").join(" | ")});
 }
 const ch=sourceChapters.map(y=>y.split(/\d+\. /).filter(Boolean).map(s=>s.replace(/[ \n]/g,''))),vs=ch.flatMap((v,c)=>v.map((s,i)=>({c:c+1,v:i+1,s})));
 check(ch.map(v=>v.length).join()==="66,79,75","historical verse counts");
 function lookup(chapter,v,k){const i=vs.findIndex(x=>x.c===chapter&&x.v===v),s=vs[i]?.s,c=s?.[k-1];return c===undefined?{v,k,error:"invalid"}:{v,k,c,firstIndex:s.indexOf(c)+1,first:s.indexOf(c)+1===k}}
 function next(c,cursor){let j=vs.findIndex((x,i)=>i>=cursor&&x.s.includes(c));if(j<0)j=vs.findIndex(x=>x.s.includes(c));return j<0?{cursor:0,coord:null}:{cursor:j+1,coord:[vs[j].c,vs[j].v,vs[j].s.indexOf(c)+1]}}
 const historic=[];
 for(let chapter=1;chapter<=3;chapter++)for(const reverse of [false,true]){
  let cursor=0;const records=cuts.map(pair=>{const [v,k]=reverse?[pair[1],pair[0]]:pair,z=lookup(chapter,v,k);if(z.error)return z;const g=next(z.c,cursor);cursor=g.cursor;return {...z,actual:g.coord,match:g.coord?.join()===[chapter,v,k].join()}});
  historic.push({chapter,reverse,records,text:records.map(x=>x.c??"?").join(""),allFirst:records.every(x=>x.first),allSender:records.every(x=>x.match)});
 }
 const necessary=[false,true].map(reverse=>({reverse,perCut:cuts.map(pair=>{const [v,k]=reverse?[pair[1],pair[0]]:pair;return {v,k,chapters:[1,2,3].map(chapter=>({chapter,...lookup(chapter,v,k)}))}})}));
 check(necessary.every(row=>row.perCut[1].chapters.every(x=>!x.first)),"chapter-independent second-cut obstruction");
 // A valid historical sender always chooses the first occurrence, with arbitrary initial cursor.
 let plantCount=0;
 for(let cursor=0;cursor<vs.length;cursor++)for(const c of ["a","e","R","t",","]){const q=next(c,cursor);if(q.coord){const z=lookup(...q.coord);check(z.first&&z.c===c,"sender invariant");plantCount++}}
 return {obj,transformed,cuts,groups:groups.length,canonical:canon.length,lp2,historic,necessary,plantCount};
}
const specs=[
  [
    "resources/liber-primus/lp2-corpus.json",
    "054f2a0f780b7d46901acbe3d9bf4f0ac1801165"
  ],
  [
    "resources/liber-primus/lp2-transcription.txt",
    "43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7"
  ],
  [
    "resources/external/2013-liber-al-bookcode-I.txt",
    "64876892683fab1467481fe87d85743a8ea17982"
  ],
  [
    "resources/external/2013-liber-al-bookcode-II.txt",
    "cb4353b080d7584441f85502aeccb60796e6fe0f"
  ],
  [
    "resources/external/2013-liber-al-bookcode-III.txt",
    "36e716252a271d31f5c4ba25b3cb78199ccc1114"
  ]
];
const raw=specs.map(([p,sha])=>{const b=fs.readFileSync(path.join(__dirname,'..',p));const got=crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');if(got!==sha)throw Error('input hash mismatch '+p);return b.toString('utf8')});
console.log(JSON.stringify(analyze(JSON.parse(raw[0]),raw[1],raw.slice(2)),null,2));
