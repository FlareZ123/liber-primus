"use strict";
/** SFT: p6 -> p23 schedule -> p25 unique [K,g] side receiver. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),J=n=>JSON.parse(fs.readFileSync(path.join(root,n),"utf8"));
const corpus=J("resources/liber-primus/lp2-corpus.json"),ink=J("resources/liber-primus/lp2-ink-annotations.json");
const segs=fs.readFileSync(path.join(root,"resources/liber-primus/lp2-transcription.txt"),"utf8").split(/^\s*%\s*$/m);
const signed=fs.readFileSync(path.join(root,"resources/historical/cicada2016-4gq25-outguess.asc"),"utf8");
const rune=new Map(corpus.runes.map((r,i)=>[r,i])),m=x=>((x%29)+29)%29,H=(a,b)=>[m(a-b),m(a+b)];
function pow(b,e,n){let r=1%n,x=((b%n)+n)%n;while(e){if(e%2)r=r*x%n;x=x*x%n;e=Math.floor(e/2);}return r;}
function part(p){assert.notEqual(p,50);return segs[p<=49?p:p-1];}
function parse(p){const words=[],runes=[];let cur=[],start=0;const f=()=>{if(cur.length){words.push({start,values:cur});cur=[];}};for(const ch of Array.from(part(p))){const v=rune.get(ch);if(v!==undefined){if(!cur.length)start=runes.length;cur.push(v);runes.push(v);}else if(ch==="-"||ch===".")f();}f();return{words,runes};}
function redLengths(p,start){const ip=ink.pages.find(x=>x.page===p),sp=ip.red_spans.find(x=>x.start===start),parsed=parse(p);return parsed.words.filter(w=>w.start>=sp.start&&w.start+w.values.length<=sp.start+sp.length).map(w=>w.values.length);}
const L6=redLengths(6,71),L23=redLengths(23,0);
assert.deepEqual(L6,[4,1,4,2]);assert.deepEqual(L23,[2,6,3,5]);
const hL6=[...H(L6[0],L6[1]),...H(L6[2],L6[3])];
assert.deepEqual(hL6,[3,5,2,6]);assert.deepEqual([hL6[2],hL6[3],hL6[0],hL6[1]],L23);
const rise=[L23[2],L23[3]];assert.deepEqual(rise,[3,5]);assert.equal(23+(rise[1]-rise[0]),25);
const target=[L23[0],L23[3]];assert.deepEqual(target,[2,5]);
function boundary(parsed,word,side){const pos=side==="predecessor"?word.start-1:word.start+word.values.length;return pos>=0&&pos<parsed.runes.length?parsed.runes[pos]:null;}
const hits=[];let objects=0;
for(let p=0;p<=55;p++){if(p===50)continue;const parsed=parse(p);for(let wi=0;wi<parsed.words.length;wi++){const w=parsed.words[wi];if(w.values.length!==5)continue;for(const side of ["predecessor","successor"]){const b=boundary(parsed,w,side);if(b===null)continue;objects++;const source=side==="predecessor"?[b,...w.values]:[...w.values,b],outer=H(source[0],source.at(-1));if(outer[0]===target[0]&&outer[1]===target[1])hits.push({page:p,word:wi+1,start:w.start,side,boundary:b,values:w.values,source,outer});}}}
assert.equal(objects,627);
assert.deepEqual(hits,[{page:25,word:30,start:145,side:"predecessor",boundary:18,values:[3,20,10,11,16],source:[18,3,20,10,11,16],outer:[2,5]}]);
const selected=hits[0],e=L23[2],g=L23[3],direction=29,wordExp=pow(e,e,28);
assert.equal(wordExp,27);
const output=[pow(selected.boundary,e,direction),...selected.values.map(v=>pow(v,wordExp,direction))];
assert.deepEqual(output,[3,10,16,3,8,20]);
const left=output.slice(0,g).reduce((a,b)=>a+b,0),right=output.slice(g).reduce((a,b)=>a+b,0);
assert.deepEqual([left,right],[40,20]);
const clear=signed.split("-----BEGIN PGP SIGNATURE-----")[0],body=clear.slice(clear.indexOf("Hello."));
const words=body.split(/[^A-Za-z0-9]+/).filter(x=>/^[A-Za-z]+$/.test(x)).map(x=>x.toUpperCase());
assert.equal(words[40],"PATHS");assert.equal(words[20],"MEANING");
console.log(JSON.stringify({p6:{lengths:L6,H:hL6},p23:{lengths:L23,rise,outer:target},navigation:"23+(5-3)=25",receiverFamily:objects,uniqueHit:hits[0],cube:{output,cut:g,sums:[left,right],signedLabels:[words[left],words[right]]},decision:"p23 page + outer-state schedule selects exact p25 side receiver without GOOD LUCK GP0->p50"},null,2));
