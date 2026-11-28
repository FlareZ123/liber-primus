"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),mod=x=>((x%29)+29)%29;
const read=r=>fs.readFileSync(path.join(root,r),"utf8").replace(/\r/g,"");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const tr=read("resources/liber-primus/lp2-transcription.txt");
const idx=new Map(corpus.runes.map((r,v)=>[r,v]));
function P(v){assert.equal(v.length,4);const o=[v[0],v[3]],i=[v[1],v[2]],z=[];for(const of of[true,false]){const ps=of?[o,i]:[i,o];for(const lr of[true,false]){const d=ps.map(([a,b])=>mod(lr?a-b:b-a)),s=ps.map(([a,b])=>mod(a+b));for(const df of[true,false]){const f=df?d:s,t=df?s:d;for(const b of[true,false])z.push({outerFirst:of,leftMinusRight:lr,differenceFirst:df,bounce:b,vector:f.concat(b?t.slice().reverse():t)});}}}return z;}
const parts=tr.split(/^\s*%\s*$/m).slice(0,55),groups=[];let cur=[],sp=-1,ep=-1,so=-1;
function flush(){if(!cur.length)return;groups.push({page:sp,endPage:ep,start:so,values:cur.slice()});cur=[];}
for(let b=0;b<parts.length;b++){const page=b>=50?b+1:b;let off=0;for(const ch of parts[b]){const v=idx.get(ch);if(v!==undefined){if(!cur.length){sp=page;so=off;}ep=page;cur.push(v);off++;}else if(!/[\s/]/u.test(ch))flush();}}flush();
const words=groups.filter(w=>w.page===w.endPage),hits=[];let windows=0,tests=0;
for(let page=0;page<=55;page++){const ws=words.filter(w=>w.page===page);for(let i=0;i+3<ws.length;i++){windows++;const four=ws.slice(i,i+4),lp=P(four.map(w=>w.values.length)),rp=P(four.map(w=>w.values.at(-1)));for(let j=0;j<16;j++){tests++;const L=lp[j].vector,R=rp[j].vector,pred=[L[2],L[0],mod(L[2]+L[0]),0];if(R.join(",")===pred.join(","))hits.push({page,wordOrdinal:i+1,start:four[0].start,presentation:lp[j],lengths:four.map(w=>w.values.length),lastRunes:four.map(w=>w.values.at(-1)),transformedLengths:L,transformedLastRunes:R});}}}
assert.equal(windows,2699);assert.equal(tests,43184);assert.equal(hits.length,1);assert.equal(hits[0].page,6);assert.equal(hits[0].start,71);assert.deepEqual(hits[0].lengths,[4,1,4,2]);assert.deepEqual(hits[0].lastRunes,[17,19,17,12]);assert.deepEqual(hits[0].transformedLengths,[2,26,5,6]);assert.deepEqual(hits[0].transformedLastRunes,[5,2,7,0]);assert.deepEqual({outerFirst:hits[0].presentation.outerFirst,leftMinusRight:hits[0].presentation.leftMinusRight,differenceFirst:hits[0].presentation.differenceFirst,bounce:hits[0].presentation.bounce},{outerFirst:true,leftMinusRight:true,differenceFirst:true,bounce:true});
console.log(JSON.stringify({status:"PASS",windowCount:windows,presentationTests:tests,hitCount:hits.length,uniqueHit:hits[0],relation:"R=[L2,L0,L2+L0,0], L=H(widths), R=H(last-rune GP0 indices)",chronology:"Canonical p6 H was committed first; the formula was recognized after opening the held-out title-ending channel."},null,2));
