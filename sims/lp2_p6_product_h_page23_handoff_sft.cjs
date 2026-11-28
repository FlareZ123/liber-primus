"use strict";
/** SFT: p6 product-H page address selects p23 by arity + length-state replay. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),J=n=>JSON.parse(fs.readFileSync(path.join(root,n),"utf8"));
const corpus=J("resources/liber-primus/lp2-corpus.json"),ink=J("resources/liber-primus/lp2-ink-annotations.json");
const segs=fs.readFileSync(path.join(root,"resources/lp2-transcription.txt"),"utf8").split("%");
const rune=new Map(corpus.runes.map((r,i)=>[r,i])),m=x=>((x%29)+29)%29;
const prod=a=>a.reduce((x,y)=>m(x*y),1),H4=v=>[m(v[0]-v[1]),m(v[0]+v[1]),m(v[2]-v[3]),m(v[2]+v[3])];
function part(p){return p===50?"":segs[p<50?p:p-1]||"";}
function words(p){const pg=corpus.pages.find(x=>x.page===p),out=[];let a=[],o=0;const f=()=>{if(a.length){out.push({start:o-a.length,end:o,len:a.length,vals:a.slice(),product:prod(a)});a=[];}};for(const ch of Array.from(part(p))){const v=rune.get(ch);if(v!==undefined){a.push(v);o++;}else if("-.$&§".includes(ch))f();}f();assert.equal(o,pg.runic_count,`p${p}`);return out;}
const all=new Map(corpus.pages.map(p=>[p.page,words(p.page)]));
function redSpans(p){const ip=ink.pages.find(x=>x.page===p);if(!ip)return[];return (ip.red_spans||[]).map(sp=>{const ws=all.get(p).filter(w=>w.start>=sp.start&&w.end<=sp.start+sp.length);return{start:sp.start,length:sp.length,words:ws};});}
const p6=redSpans(6).find(x=>x.start===71).words,p23=redSpans(23).find(x=>x.start===0).words;
const L6=p6.map(w=>w.len),P6=p6.map(w=>w.product),L23=p23.map(w=>w.len);
assert.deepEqual(L6,[4,1,4,2]);assert.deepEqual(P6,[13,19,14,23]);
const hL=H4(L6),hP=H4(P6);
assert.deepEqual(hL,[3,5,2,6]);assert.deepEqual(hP,[23,3,20,8]);
assert.deepEqual([hL[2],hL[3],hL[0],hL[1]],L23);
const candidates=hP.map(page=>({page,redWordCounts:redSpans(page).map(x=>x.words.length)}));
assert.deepEqual(candidates,[
 {page:23,redWordCounts:[4]},
 {page:3,redWordCounts:[3,1]},
 {page:20,redWordCounts:[]},
 {page:8,redWordCounts:[2]}
]);
assert.deepEqual(candidates.filter(x=>x.redWordCounts.includes(4)).map(x=>x.page),[23]);
console.log(JSON.stringify({p6:{lengths:L6,lengthH:hL,products:P6,productH:hP},pageCandidates:candidates,p23:{lengths:L23,relation:"pairSwap(p6 length-H)"},decision:"p23 sole same-arity red-rubric page among p6 product-H coordinates"},null,2));
