"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8").replace(/\r/g,"");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-p0-physical-ink-override.json"));
const tx=read("resources/lp2-transcription.txt");
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
const mod=(x)=>((x%29)+29)%29,sum=(v)=>v.reduce((a,b)=>a+b,0);
const ri=new Map(corpus.runes.map((r,i)=>[r,i]));
const tokens=corpus.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);
function gpText(text){
 const s=text.toUpperCase().replace(/K/g,"C").replace(/V/g,"U").replace(/Q/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,""),out=[];
 for(let i=0;i<s.length;){const t=tokens.find(x=>s.startsWith(x.symbol,i));assert.ok(t);out.push(t.value);i+=t.symbol.length;}return out;
}
const body=signed.split("-----BEGIN PGP SIGNATURE-----")[0].replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/,"").replace(/\b3301\b/g,"").replace(/\b[0-9A-F]{8,}\b/g,"");
const sw=(body.match(/[A-Za-z]+/g)||[]).map((text,index)=>({index,text:text.toUpperCase(),v:gpText(text)}));
assert.equal(sw.length,43);
assert.deepEqual(sw.slice(0,7).map(x=>x.text),["HELLO","THE","PATH","LIES","EMPTY","EPIPHANY","SEEKS"]);
assert.deepEqual(sw.slice(5,7).map(x=>x.text),["EPIPHANY","SEEKS"]);
const red=ink.physical_zero_based.red_words.map(x=>x.gp_indices);
assert.deepEqual(red.map(x=>x.length),[8,5]);
assert.equal(ink.physical_zero_based.large_punctuation[0].after_runes,13);
assert.equal(ink.physical_zero_based.large_punctuation[0].dots,13);
const c=red.flat();assert.deepEqual(c,corpus.pages.find(x=>x.page===0).indices.slice(0,13));
const p=[...sw[5].v,...sw[6].v],key=c.map((x,i)=>mod(x-p[i]));
assert.deepEqual(key,[26,24,8,19,27,24,18,3,0,8,0,16,19]);
const H=(x,y)=>[mod(x-y),mod(x+y)];
function hs(v){const o=[];for(let l=0,r=v.length-1;l<r;l++,r--)o.push(...H(v[l],v[r]));if(v.length%2)o.push(v[(v.length-1)/2]);return o;}
function runs(v){const s=new Set(v),o=[];for(let a=0;a<29;){if(!s.has(a)){a++;continue;}let b=a;while(b<29&&s.has(b))b++;o.push([a,b-1]);a=b;}return o;}
function has(v,a,b){const s=new Set(v);for(let i=a;i<=b;i++)if(!s.has(i))return false;return true;}
const cols=[4,5,4],kh=hs(key),groups=[];let off=0;
for(const n of cols){groups.push(mod(sum(kh.slice(off,off+n))));off+=n;}
assert.deepEqual(groups,[13,23,6]);
assert.deepEqual(groups.map(i=>sw[i].text),["WAY","ROAD","SEEKS"]);
assert.deepEqual(hs(groups),[7,19,23]);

const byPage=new Map(),offsets=Array(58).fill(0);let seg=0,cur=[],br=[];
function pageOf(s){return s>=50?s+1:s;}
function finish(){
 if(!cur.length)return;
 if(new Set(cur.map(x=>x.s)).size===1){const page=pageOf(cur[0].s);if(page<=55){if(!byPage.has(page))byPage.set(page,[]);const a=byPage.get(page);a.push({page,word:a.length+1,start:cur[0].o,v:cur.map(x=>x.v),br:br.slice()});}}
 cur=[];br=[];
}
for(const ch of tx){
 if(ch==="%")seg++;
 else if(ri.has(ch)){cur.push({s:seg,o:offsets[seg],v:ri.get(ch)});offsets[seg]++;}
 else if(ch==="/"){if(cur.length)br.push(cur.length);}
 else if(/\s/u.test(ch)){}
 else finish();
}finish();
function receiver(page,wi){
 const w=byPage.get(page)?.[wi];if(!w||w.br.length!==1||w.br[0]<=0||w.br[0]>=w.v.length)return null;
 const s=w.br[0],whole=hs(w.v),pre=hs(w.v.slice(0,s)),post=hs(w.v.slice(s)),u=[...whole,...pre,...post];
 return {page,word:wi+1,start:w.start,v:w.v,split:s,whole,pre,post,runs:runs(u),r012:has(u,0,2),r345:has(u,3,5),r012345:has(u,0,5)};
}
const coords=[];
for(const page of groups)for(const wi of groups){
 const w=byPage.get(page)?.[wi];assert.ok(w);
 coords.push(receiver(page,wi)||{page,word:wi+1,start:w.start,v:w.v,br:w.br,lineWrapped:false});
}
assert.equal(coords.length,9);
const wrapped=coords.filter(x=>x.whole);assert.equal(wrapped.length,2);
assert.deepEqual(wrapped.map(x=>[x.page,x.word]).sort((a,b)=>a[0]-b[0]),[[6,14],[23,24]]);
const p6=wrapped.find(x=>x.page===6&&x.word===14),p23=wrapped.find(x=>x.page===23&&x.word===24);
assert.deepEqual(p6.v,[1,3,10,28]);assert.equal(p6.split,1);
assert.deepEqual(p6.whole,[2,0,22,13]);assert.deepEqual(p6.pre,[1]);assert.deepEqual(p6.post,[4,2,10]);
assert.deepEqual(p6.runs,[[0,2],[4,4],[10,10],[13,13],[22,22]]);assert.ok(p6.r012&&!p6.r345);
assert.deepEqual(p23.v,[22,7,0,26,21,1,26,10]);assert.equal(p23.split,6);
assert.deepEqual(p23.whole,[12,3,10,4,28,1,5,18]);assert.deepEqual(p23.pre,[21,23,15,28,3,26]);assert.deepEqual(p23.post,[16,7]);
assert.deepEqual(p23.runs,[[1,1],[3,5],[7,7],[10,10],[12,12],[15,16],[18,18],[21,21],[23,23],[26,26],[28,28]]);
assert.ok(p23.r345&&!p23.r012);

const all=[];
for(const [page,ws] of byPage)for(const w of ws){
 if(w.br.length!==1||w.br[0]<=0||w.br[0]>=w.v.length)continue;
 const u=[...hs(w.v),...hs(w.v.slice(0,w.br[0])),...hs(w.v.slice(w.br[0]))];
 all.push({r012:has(u,0,2),r345:has(u,3,5),r012345:has(u,0,5)});
}
assert.equal(all.length,388);assert.equal(all.filter(x=>x.r012).length,20);
assert.equal(all.filter(x=>x.r345).length,15);assert.equal(all.filter(x=>x.r012345).length,0);

function evalTriple(T){
 const rows=[];for(const page of T)for(const wi of T){const x=receiver(page,wi);if(x)rows.push(x);}
 const a=rows.filter(x=>x.r012),b=rows.filter(x=>x.r345);
 return {T,rows,a,b,exactTwo:rows.length===2&&a.length===1&&b.length===1&&a[0]!==b[0]};
}
let both=0;const exact=[];
for(let a=0;a<43;a++)for(let b=a+1;b<43;b++)for(let d=b+1;d<43;d++){
 const x=evalTriple([a,b,d]);if(x.a.length&&x.b.length)both++;if(x.exactTwo)exact.push(x);
}
assert.equal(12341,43*42*41/6);assert.equal(both,118);assert.equal(exact.length,15);
assert.equal(exact.filter(x=>x.T.join(",")==="6,13,23").length,1);
assert.deepEqual(exact.filter(x=>x.T.includes(6)&&x.T.includes(23)).map(x=>x.T),[[6,13,23]]);
const third=[];
for(let x=0;x<43;x++){if(x===6||x===23)continue;const r=evalTriple([6,23,x].sort((a,b)=>a-b));if(r.exactTwo)third.push(x);}
assert.deepEqual(third,[13]);

console.log(JSON.stringify({
 status:"PASS",candidate:"EPIPHANY SEEKS",
 keyMarker:{columns:cols,groups,groupWords:groups.map(i=>sw[i].text),H3Packet:hs(groups)},
 coordinateRows:coords,recoveredRegister:"HELLO THE PATH LIES EMPTY EPIPHANY",
 overlap:"EPIPHANY SEEKS",
 controls:{allLineWrapped:all.length,run012Occurrences:20,run345Occurrences:15,
  anySingleObjectContaining012345:0,sourceIndexTriples:12341,triplesWithBothRuns:both,
  exactTwoReceiverTriples:exact.length,
  exactTwoTripleContainingPages6and23:exact.filter(x=>x.T.includes(6)&&x.T.includes(23)).map(x=>x.T),
  fixedPages6and23ThirdCompletions:third}
},null,2));
