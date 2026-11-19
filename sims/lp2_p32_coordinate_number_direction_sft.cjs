"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8").replace(/\r/g,"");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription=read("resources/liber-primus/lp2-transcription.txt");
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
const pageTexts=transcription.split(/\n%\n/u),runeSet=new Set(corpus.runes);
const dh={p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3};
const gpTokens=corpus.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);
/** @param {string} word @returns {number[]} */
function gp(word){
  const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");
  const out=[];let i=0;
  while(i<s.length){
    if(s.startsWith("ING",i)){out.push(21);i+=3;continue;}
    if(s.startsWith("IO",i)){out.push(27);i+=2;continue;}
    const t=gpTokens.find(x=>s.startsWith(x.symbol,i));assert.ok(t);out.push(t.value);i+=t.symbol.length;
  }
  return out;
}
const clear=signed.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);assert.ok(clear);
const source=(clear[1].match(/\b[A-Za-z]+\b/gu)||[]).map(x=>x.toUpperCase());assert.equal(source.length,43);
const vocab=[];for(const word of source)if(!vocab.some(x=>x.word===word))vocab.push({word,gp:gp(word)});
/** @param {number} page @returns {Array<{start:number,end:number,length:number}>} */
function ranges(page){
  const txt=pageTexts[page].replace(/\/\n/gu,"").replace(/\n/gu,"");let off=0,start=null;const out=[];
  for(const ch of [...txt]){
    if(runeSet.has(ch)){if(start===null)start=off;off++;continue;}
    if("-.&$".includes(ch)&&start!==null){out.push({start,end:off-1,length:off-start});start=null;}
  }
  if(start!==null)out.push({start,end:off-1,length:off-start});return out;
}
const arePairs=[[dh.e**2,dh.a],[dh.a,dh.K],[dh.K**2,dh.e**2]];
const C=[...new Set(arePairs.flat().concat([dh.e]))].sort((a,b)=>a-b);assert.deepEqual(C,[2,3,4,6,9]);
/** @param {{page:number,indices:number[]}} page */
function analyze(page){
  const wr=ranges(page.page),byRune=new Map();
  for(const w of C)for(const pos of C){
    const r=wr[w-1];if(!r||pos>r.length)continue;
    const offset=r.start+pos-1,value=page.indices[offset];
    if(!byRune.has(value))byRune.set(value,[]);
    byRune.get(value).push({wordNumber:w,runePosition:pos,offset});
  }
  const uniqueWords=[],events=[];
  for(const target of vocab){
    const choices=target.gp.map(v=>byRune.get(v)||[]);
    if(!choices.every(x=>x.length))continue;
    if(choices.reduce((n,x)=>n*x.length,1)!==1)continue;
    const coords=choices.map(x=>x[0]);
    const wordNumberSum=coords.reduce((n,x)=>n+x.wordNumber,0);
    const runePositionSum=coords.reduce((n,x)=>n+x.runePosition,0);
    uniqueWords.push({word:target.word,coords,wordNumberSum,runePositionSum});
    for(const [kind,value] of [["word-number-sum",wordNumberSum],["rune-position-sum",runePositionSum]]){
      if(value<source.length)events.push({value,kind,from:target.word,target:source[value]});
    }
  }
  const values=new Set(events.map(x=>x.value)),runs=[];
  for(const start of [...values].sort((a,b)=>a-b)){
    if(values.has(start-1))continue;let end=start;while(values.has(end+1))end++;
    runs.push({start,end,length:end-start+1,words:source.slice(start,end+1)});
  }
  runs.sort((a,b)=>b.length-a.length||a.start-b.start);
  return {page:page.page,uniqueWords,events,bestRun:runs[0]||{start:null,end:null,length:0,words:[]}};
}
const analyses=corpus.pages.filter(p=>p.page<=55&&p.indices.length).map(analyze);
const p32=analyses.find(x=>x.page===32);assert.ok(p32);
assert.deepEqual(p32.uniqueWords.map(x=>x.word),["THE","PATH","ARE","MAP","BE"]);
const byWord=Object.fromEntries(p32.uniqueWords.map(x=>[x.word,x]));
const coords=w=>byWord[w].coords.map(x=>[x.wordNumber,x.runePosition,x.offset]);
assert.deepEqual(coords("ARE"),[[9,6,49],[6,2,26],[4,9,17]]);
assert.deepEqual(coords("THE"),[[6,4,28],[4,9,17]]);
assert.deepEqual(coords("PATH"),[[3,3,6],[9,6,49],[6,4,28]]);
assert.deepEqual(coords("MAP"),[[4,6,14],[9,6,49],[3,3,6]]);
assert.deepEqual(p32.bestRun,{start:15,end:19,length:5,words:["WORDS","ARE","THE","MAP","THEIR"]});
const event=(kind,from,value)=>p32.events.find(x=>x.kind===kind&&x.from===from&&x.value===value);
assert.equal(event("rune-position-sum","MAP",15).target,"WORDS");
assert.equal(event("word-number-sum","MAP",16).target,"ARE");
assert.equal(event("rune-position-sum","ARE",17).target,"THE");
assert.equal(event("word-number-sum","PATH",18).target,"MAP");
assert.equal(event("word-number-sum","ARE",19).target,"THEIR");
const others=analyses.filter(x=>x.page!==32),maxOther=Math.max(...others.map(x=>x.bestRun.length));
assert.equal(maxOther,3);
assert.deepEqual(others.filter(x=>x.bestRun.length===3).map(x=>({page:x.page,run:x.bestRun})),[
  {page:43,run:{start:7,end:9,length:3,words:["THE","DEVOTED","LIBER"]}}
]);
const widened=[...new Set(C.concat([dh.g]))].sort((a,b)=>a-b);assert.deepEqual(widened,[2,3,4,5,6,9]);
console.log(JSON.stringify({status:"PASS",C,arePairs,p32,maxOther,nextBest:others.filter(x=>x.bestRun.length===3),widened},null,2));
