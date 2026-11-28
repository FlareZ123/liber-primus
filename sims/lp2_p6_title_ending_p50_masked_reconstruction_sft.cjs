"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),M=x=>((x%29)+29)%29,read=r=>fs.readFileSync(path.join(root,r),"utf8").replace(/\r/g,"");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json")),tr=read("resources/liber-primus/lp2-transcription.txt");
const tokens=grid.pages.flatMap(p=>p.tokens),A59=grid.alphabet.replace("f",""),b59=t=>59*A59.indexOf(t[0])+A59.indexOf(t[1]);
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i])),parts=tr.split(/^\s*%\s*$/m).slice(0,55),groups=[];let cur=[],sp=-1,ep=-1,so=-1;
function flush(){if(!cur.length)return;groups.push({page:sp,endPage:ep,start:so,values:cur.slice()});cur=[];}
for(let block=0;block<parts.length;block++){const page=block>=50?block+1:block;let off=0;for(const ch of parts[block]){const v=runeIndex.get(ch);if(v!==undefined){if(!cur.length){sp=page;so=off;}ep=page;cur.push(v);off++;}else if(!/[\s/]/u.test(ch))flush();}}flush();
const local=groups.filter(w=>w.page===w.endPage);
function cell(row,col,radix){const index=8*row+col;return M(radix==="base59"?b59(tokens[index]):grid.bytes[index]);}
function reconstruct(words,col,radix){
 const [w0,w1,w2,w3]=words;if(w2.values.length<2)return null;
 const x0=w0.values.at(-1),x2=w2.values.at(-1),x3=w3.values.at(-1);
 const outerRows=[M(x0-x3),M(x0+x3)];
 const outerRead=outerRows.map(row=>cell(row,col,radix));
 const recoveredW1Last=outerRead[1];
 const innerRows=[M(recoveredW1Last-x2),M(recoveredW1Last+x2)];
 const innerRead=innerRows.map(row=>cell(row,col,radix));
 return{outerRows,outerRead,recoveredW1Last,innerRows,innerRead,actualW1Last:w1.values.at(-1),actualW2Penultimate:w2.values.at(-2),
   ok:outerRead[0]===28&&recoveredW1Last===w1.values.at(-1)&&innerRead[0]===w2.values.at(-2)&&innerRead[1]===28};
}
let windows=0,eligible=0;const selectedHits=[],configs=[];
for(let page=0;page<=55;page++){const ws=local.filter(w=>w.page===page);for(let i=0;i+3<ws.length;i++){windows++;const four=ws.slice(i,i+4);if(four[2].values.length<2)continue;eligible++;const r=reconstruct(four,2,"base59");if(r.ok)selectedHits.push({page,wordOrdinal:i+1,start:four[0].start,lengths:four.map(w=>w.values.length),...r});}}
assert.equal(windows,2699);assert.equal(eligible,2623);assert.equal(selectedHits.length,1);assert.equal(selectedHits[0].page,6);assert.equal(selectedHits[0].start,71);
assert.deepEqual(selectedHits[0].outerRows,[5,0]);assert.deepEqual(selectedHits[0].outerRead,[28,19]);assert.equal(selectedHits[0].actualW1Last,19);
assert.deepEqual(selectedHits[0].innerRows,[2,7]);assert.deepEqual(selectedHits[0].innerRead,[15,28]);assert.equal(selectedHits[0].actualW2Penultimate,15);
for(const radix of["base59","base60"])for(let col=0;col<8;col++){let hits=0,p6=false;for(let page=0;page<=55;page++){const ws=local.filter(w=>w.page===page);for(let i=0;i+3<ws.length;i++){const four=ws.slice(i,i+4),r=reconstruct(four,col,radix);if(r&&r.ok){hits++;if(page===6&&four[0].start===71)p6=true;}}}configs.push({radix,col,hits,p6});}
assert.deepEqual(configs.filter(x=>x.hits),[{radix:"base59",col:2,hits:1,p6:true}]);
assert.equal(eligible*16,41968);
console.log(JSON.stringify({status:"PASS",windows,eligible,selectedHits,configTests:eligible*16,nonzeroConfigs:configs.filter(x=>x.hits),conclusion:"Using only p6 W1/W3/W4 ending runes, canonical H pair arithmetic, p57-selected base59 and independently selected p50 column K, the outer pair recovers W2=19 and the recovered W2 then lets the inner pair recover W3 penultimate=15. Across all 2,623 eligible LP2 four-word windows and all 8 columns x 2 radices, only p6/base59/columnK succeeds."},null,2));
