'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const MOD=29;
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const ink=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-ink-annotations.json'),'utf8'));
const segs=fs.readFileSync(path.join(ROOT,'resources/lp2-transcription.txt'),'utf8').split('%');
const signed=fs.readFileSync(path.join(ROOT,'resources/historical/cicada2016-4gq25-outguess.asc'),'utf8');
const glyph=new Map(corpus.runes.map((r,i)=>[r,i]));
const mod=x=>((x%MOD)+MOD)%MOD;
const mul=(x,y)=>[mod(x[0]*y[0]+8*x[1]*y[1]),mod(x[0]*y[1]+x[1]*y[0]+3*x[1]*y[1])];
const ev=a=>{let z=[0,0],p=[1,0];for(const c of a){z=[mod(z[0]+c*p[0]),mod(z[1]+c*p[1])];p=mul(p,[0,1]);}return z;};

function segment(p){return p===50?'':segs[p<50?p:p-1]||'';}
function wordsFor(p){
 const pg=corpus.pages.find(x=>x.page===p);assert(pg);
 const out=[];let a=[],o=0;
 const flush=()=>{if(a.length){out.push({start:o-a.length,end:o,len:a.length});a=[];}};
 for(const ch of Array.from(segment(p))){
   const v=glyph.get(ch);
   if(v!==undefined){a.push(v);o++;}
   else if('-.$&§'.includes(ch))flush();
 }
 flush();assert.equal(o,pg.runic_count,`physical p${p} rune count`);return out;
}

const words=signed.split('-----BEGIN PGP SIGNATURE-----')[0].match(/\b[A-Za-z]+\b/g)
 .filter(w=>!['BEGIN','PGP','SIGNED','MESSAGE','Hash','SHA'].includes(w)).map(w=>w.toUpperCase());
assert.equal(words.length,43);

const Q=[17,24],dlog=new Map();let state=[1,0];
for(let k=0;k<840;k++){dlog.set(state.join(','),k);state=mul(state,Q);}
assert.deepEqual(state,[1,0]);

const allWords=new Map(corpus.pages.map(p=>[p.page,wordsFor(p.page)]));
const twoWord=[];
for(const pr of ink.pages)for(const sp of(pr.red_spans||[])){
 const ws=allWords.get(pr.page).filter(w=>w.start>=sp.start&&w.end<=sp.start+sp.length);
 if(ws.length!==2)continue;
 const residue=ev([...sp.runes].map(r=>glyph.get(r)));
 if(residue[0]===0&&residue[1]===0)continue;
 const k=dlog.get(residue.join(','));assert.notEqual(k,undefined);
 const coord=[Math.floor(k/29),k%29],lens=ws.map(w=>w.len);
 const variants={
   canonical:coord,
   reversed:[coord[1],coord[0]],
   plus1:coord.map(x=>x+1),
   plus1Reversed:[coord[1]+1,coord[0]+1],
   minus1:coord.every(x=>x>0)?coord.map(x=>x-1):null,
   minus1Reversed:coord.every(x=>x>0)?[coord[1]-1,coord[0]-1]:null,
 };
 const hits=Object.entries(variants).filter(([,v])=>v&&v[0]===lens[0]&&v[1]===lens[1]).map(([name])=>name);
 twoWord.push({page:pr.page,start:sp.start,spanLength:sp.length,wordLengths:lens,residue,k,coord,endpointWords:coord.map(i=>words[i]),hits});
}
assert.deepEqual(twoWord.map(x=>[x.page,x.start,x.wordLengths,x.coord,x.hits]),[
 [0,0,[8,5],[8,26],[]],
 [8,0,[4,8],[7,19],[]],
 [15,0,[4,5],[8,4],[]],
 [33,0,[2,8],[27,27],[]],
 [33,91,[3,5],[21,26],[]],
 [40,0,[3,5],[5,8],[]],
 [54,0,[1,8],[22,8],[]],
 [56,0,[2,3],[4,5],[]],
]);

const held=twoWord.find(x=>x.page===8&&x.start===0);assert(held);
assert.deepEqual(held.wordLengths,[4,8]);
assert.deepEqual(held.coord,[7,19]);
assert.deepEqual(held.endpointWords,['THE','THEIR']);
assert.equal(held.hits.length,0);

const result={
 schema:'director-3461-p8-q-interval-holdout-v1',
 classification:'prospective negative interval-typing test; endpoint words opened only after p8 and [4,8] consequence were committed',
 preregistration:'workplace/agent5-issue3461-p8-interval-preregister.md',
 heldout:{
   selector:'physical p8 red0..11; unique independently established two-word [4,8] H→DH packet',
   predictedCanonicalCoordinate:[4,8],
   observedCoordinate:held.coord,
   observedEndpointWords:held.endpointWords,
   result:'MISS',
 },
 classCharge:{
   completeNonzeroTwoWordRedSpans:twoWord.length,
   conventions:['canonical','reversed','plus1','plus1Reversed','minus1','minus1Reversed'],
   exactLengthPairHits:twoWord.reduce((n,x)=>n+x.hits.length,0),
   rows:twoWord,
 },
 decision:'The prospectively selected p8 holdout does not encode its source-visible two-word lengths as Q interval endpoints under canonical, reversed, or ±1-origin conventions; the entire eight-span complete-two-word red class has zero such hits. Do not reinterpret p8 [7,19]=THE...THEIR semantically after reveal. Existing attractive Q intervals remain post-discovery observations until a different prospective source-typed consequence succeeds.',
};
const json=JSON.stringify(result,null,2);
console.log(json);
if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,'source-test-output.json'),json);
