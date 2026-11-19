"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=r=>fs.readFileSync(path.join(root,r),"utf8").replace(/\r/g,"");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const tx=read("resources/liber-primus/lp2-transcription.txt");
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
const p0=JSON.parse(read("resources/liber-primus/lp2-p0-physical-ink-override.json"));
const ri=new Map(corpus.runes.map((r,i)=>[r,i]));
const mod=x=>((x%29)+29)%29;
/** @param {number[]} v @returns {number[]} */
function H(v){const o=[];for(let l=0,r=v.length-1;l<r;l++,r--)o.push(mod(v[l]-v[r]),mod(v[l]+v[r]));if(v.length%2)o.push(v[(v.length-1)/2]);return o;}
/** @param {number[]} v @returns {number} */
function hsum(v){return mod(H(v).reduce((a,b)=>a+b,0));}
/** @param {number[]} v @returns {boolean} */
function unit(v){if(v.length<2)return false;const d=v[1]-v[0];return Math.abs(d)===1&&v.every((x,i)=>i===0||x-v[i-1]===d);}

const parts=tx.split(/^\s*%\s*$/m).slice(0,55),pages=parts.map((_,s)=>({page:s>=50?s+1:s,words:[],offset:0}));
let cur=[],ss=0,es=0,so=0,cross=0;
function flush(){if(!cur.length)return;if(ss===es){const p=pages[ss];p.words.push({ordinal:p.words.length+1,start:so,values:cur.slice()});}else cross++;cur=[];}
for(let s=0;s<parts.length;s++)for(const ch of [...parts[s]]){const v=ri.get(ch);if(v!==undefined){if(!cur.length){ss=s;so=pages[s].offset;}es=s;cur.push(v);pages[s].offset++;}else if(ch!=="/"&&!/\s/u.test(ch))flush();}flush();
const byPage=new Map(pages.map(p=>[p.page,p.words]));
assert.equal(cross,32);

const clear=signed.split("-----BEGIN PGP SIGNATURE-----")[0].split(/\n\n/u).slice(1).join("\n");
const source=clear.split(/[^A-Za-z0-9]+/u).filter(x=>/^[A-Za-z]+$/u.test(x)).map(w=>w.toUpperCase());
assert.equal(source.length,43);
const diagonal=source.map((word,i)=>({i,word,obj:(byPage.get(i)||[])[i]||null}));
assert.equal(diagonal.filter(r=>r.obj).length,42);
assert.deepEqual(diagonal.filter(r=>!r.obj).map(r=>[r.i,r.word]),[[32,"YOU"]]);

const red=p0.physical_zero_based.red_words.map(w=>w.gp_indices);
assert.deepEqual(red.map(w=>w.length),[8,5]);
assert.deepEqual(red.map(hsum),[1,13]);
assert.deepEqual([source[1],source[13]],["THE","WAY"]);

/** @param {object} r @returns {number[]} */
function outer(r){const v=r.obj.values;return H([v[0],v.at(-1)]);}
assert.deepEqual(outer(diagonal[1]),[6,9]);
assert.deepEqual(outer(diagonal[13]),[27,9]);
const branches=[...new Set([...outer(diagonal[1]),...outer(diagonal[13])])];
assert.deepEqual(branches,[6,9,27]);

/** @param {object} r @returns {object|null} */
function shed(r){if(!r.obj||r.obj.values.length<4)return null;const inside=r.obj.values.slice(1,-1),h=H(inside);return{i:r.i,word:r.word,h,unit:unit(h)};}
const eligible=diagonal.map(shed).filter(Boolean),shedHits=eligible.filter(r=>r.unit);
assert.equal(eligible.length,24);
assert.deepEqual(shedHits.map(r=>[r.i,r.word,r.h]),[[27,"ARE",[5,6]]]);
assert.deepEqual(shedHits[0].h.map(i=>source[i]),["EPIPHANY","SEEKS"]);
assert.deepEqual(source.slice(5,9),["EPIPHANY","SEEKS","THE","DEVOTED"]);

/** @param {object} r @returns {object|null} */
function rawSumRow(r){if(!r.obj)return null;const h=H(r.obj.values),sum=h.reduce((a,b)=>a+b,0);return{i:r.i,word:r.word,h,sum,inRange:sum>=0&&sum<=42};}
const raw=diagonal.map(rawSumRow);
assert.deepEqual([raw[7].sum,raw[8].sum],[42,41]);
assert.deepEqual([source[raw[7].sum],source[raw[8].sum]],["OPENPGP","VERIFY"]);
assert.deepEqual(raw[7].h,[16,24,2]);
assert.deepEqual(raw[8].h,[21,9,11,0]);

const adjacent=[];
for(let i=0;i+1<raw.length;i++){
 const a=raw[i],b=raw[i+1];if(!a||!b||!a.inRange||!b.inRange)continue;
 if(Math.abs(a.sum-b.sum)===1)adjacent.push({input:[i,i+1],inputWords:[source[i],source[i+1]],sums:[a.sum,b.sum],outputWords:[source[a.sum],source[b.sum]]});
}
assert.deepEqual(adjacent,[
 {input:[7,8],inputWords:["THE","DEVOTED"],sums:[42,41],outputWords:["OPENPGP","VERIFY"]},
 {input:[26,27],inputWords:["NUMBERS","ARE"],sums:[39,40],outputWords:["FALSE","PATHS"]},
]);

const openpgp=diagonal[42];
assert.ok(openpgp.obj);
assert.equal(openpgp.obj.start,206);
assert.deepEqual(openpgp.obj.values,[16,0,14]);
assert.deepEqual(H(openpgp.obj.values),[2,1,0]);
assert.deepEqual(H(openpgp.obj.values).map(i=>source[i]),["PATH","THE","HELLO"]);

const three=diagonal.filter(r=>r.obj&&r.obj.values.length===3).map(r=>({i:r.i,word:r.word,h:H(r.obj.values)}));
assert.equal(three.length,8);
assert.deepEqual(three.filter(r=>unit(r.h)).map(r=>[r.i,r.word,r.h]),[[42,"OPENPGP",[2,1,0]]]);

const hello=diagonal[0];
assert.ok(hello.obj);
assert.equal(hello.obj.start,0);
assert.deepEqual(hello.obj.values,red[0]);
assert.equal(hsum(hello.obj.values),1);
assert.equal(source[1],"THE");
assert.deepEqual((byPage.get(0)||[])[1].values,red[1]);

console.log(JSON.stringify({
 status:"PASS",
 p0:{readout:[1,13],labels:["THE","WAY"]},
 firstBranch:{eligible:eligible.length,hit:shedHits[0]},
 continuation:{input:[7,8],inputWords:["THE","DEVOTED"],rawSums:[42,41],outputs:["OPENPGP","VERIFY"],adjacentConsecutiveHits:adjacent},
 openpgp:{index:42,cipher:openpgp.obj.values,h:[2,1,0],labels:["PATH","THE","HELLO"],threeRuneFamily:three.length},
 closure:{hello0:{page:0,word:1,start:0,cipher:hello.obj.values},returnsTo:"p0 original red title"}
},null,2));
