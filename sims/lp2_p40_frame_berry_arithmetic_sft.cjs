#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const trans=read('resources/liber-primus/lp2-transcription.txt').split('%');
const rid=new Map(gp.runes.map((r,i)=>[r,i])),chapters=[0,3,8,15,23,27,33,40,54],mod=x=>((x%29)+29)%29;
function pageRecord(page){
 const source=gp.pages[page].indices,ann=ink.pages.find(x=>x.page===page),spans=ann.red_spans.slice().sort((a,b)=>a.start-b.start);
 assert.equal(spans[0].start,0);let redEnd=spans[0].length;
 for(let i=1;i<spans.length&&spans[i].start===redEnd;i++)redEnd+=spans[i].length;
 const words=[];let current=[],offset=0;
 for(const glyph of trans[page>=51?page-1:page]){
  if(rid.has(glyph)){assert.equal(source[offset],rid.get(glyph),'page'+page);current.push(offset++);}
  else if('-.&$§'.includes(glyph)&&current.length){words.push(current);current=[];}
 }
 if(current.length)words.push(current);assert.equal(offset,source.length);
 const redWords=words.filter(w=>w[0]<redEnd&&w.at(-1)<redEnd),black=words.filter(w=>w[0]>=redEnd);
 const summarize=w=>{const runes=w.map(i=>source[i]);return{length:runes.length,sum:runes.reduce((a,b)=>a+b,0)%29,product:runes.reduce((a,b)=>a*b%29,1),runes};};
 const target=summarize(black[0]),sameLength=black.filter(w=>w.length===target.length).map(summarize);
 return{page,redWordLengths:redWords.map(w=>w.length),target,sameLength};
}
const records=chapters.map(pageRecord),relation=r=>mod(r.target.sum+r.target.length)===r.target.product;
assert.deepEqual(records.filter(relation).map(r=>r.page),[40,54]);
const framedChapterStarts=chapters.filter(p=>p>=40&&p<=55);assert.deepEqual(framedChapterStarts,[40,54]);
const p40=records.find(r=>r.page===40),p54=records.find(r=>r.page===54);
assert.deepEqual(p40.redWordLengths,[3,5]);
assert.deepEqual([p40.target.length,p40.target.sum,p40.target.product],[5,27,3]);
assert.deepEqual([p54.target.length,p54.target.sum,p54.target.product],[8,19,27]);
assert.equal(mod(5+27),3);assert.equal(mod(8+19),27);
const p40Pool=p40.sameLength.filter(x=>mod(x.sum+x.length)===x.product),p54Pool=p54.sameLength.filter(x=>mod(x.sum+x.length)===x.product);
assert.deepEqual([p40.sameLength.length,p40Pool.length],[8,1]);
assert.deepEqual([p54.sameLength.length,p54Pool.length],[5,1]);
const route=[0,8,27,54,40],routeRecords=route.map(p=>records.find(r=>r.page===p));
assert.deepEqual(routeRecords.map(r=>r.target.product),[23,2,19,27,3]);assert.ok(routeRecords.slice(-2).every(relation));
const visual={leftFilled:3,rightFilled:5,removed:2};
assert.equal(visual.rightFilled-visual.removed,visual.leftFilled);
assert.deepEqual([visual.leftFilled,visual.rightFilled],p40.redWordLengths);
assert.deepEqual([visual.rightFilled,mod(-visual.removed),visual.leftFilled],[p40.target.length,p40.target.sum,p40.target.product]);
console.log(JSON.stringify({
 status:'PASS',classification:'source-visible typed operation cue; no unknown plaintext',framedSection:[40,55],framedChapterStarts,
 p40:{visual,redWordLengths:p40.redWordLengths,firstBlack:[p40.target.length,p40.target.sum,p40.target.product],equation:'5 + 27 = 3 (mod29), i.e. 5 - 2 = 3',sameLengthPool:{size:8,relationHits:1}},
 p54:{redWordLengths:p54.redWordLengths,firstBlack:[p54.target.length,p54.target.sum,p54.target.product],equation:'8 + 19 = 27 (mod29)',sameLengthPool:{size:5,relationHits:1}},
 allChapterFirstBlack:records.map(r=>({page:r.page,length:r.target.length,sum:r.target.sum,product:r.target.product,additiveRelation:relation(r)})),
 route,routeOutputs:routeRecords.map(r=>r.target.product),
 decision:'Frame supplies literal 3/5 mirror cardinality and two-slot subtraction matching p40 [5,27,3]; p40 and p54 are exactly the framed chapter starts and additive-relation chapter starts.'
},null,2));
