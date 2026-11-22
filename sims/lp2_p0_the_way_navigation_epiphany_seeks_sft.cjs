"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=r=>fs.readFileSync(path.join(root,r),"utf8").replace(/\r/g,"");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const tx=read("resources/liber-primus/lp2-transcription.txt");
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
const p0=JSON.parse(read("resources/liber-primus/lp2-p0-physical-ink-override.json"));
const ri=new Map(corpus.runes.map((r,i)=>[r,i]));
const gpTokens=corpus.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);
const mod29=x=>((x%29)+29)%29;
/** @param {number[]} v @returns {number[]} */
function H(v){const o=[];for(let l=0,r=v.length-1;l<r;l++,r--)o.push(mod29(v[l]-v[r]),mod29(v[l]+v[r]));if(v.length%2)o.push(v[(v.length-1)/2]);return o;}
/** @param {number[]} v @returns {number} */
function hsum(v){return mod29(H(v).reduce((a,b)=>a+b,0));}
/** @param {number[]} v @returns {boolean} */
function unit(v){if(v.length<2)return false;const s=v[1]-v[0];return Math.abs(s)===1&&v.every((x,i)=>i===0||x-v[i-1]===s);}
/** @param {string} word @returns {number[]} */
function gp(word){const n=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");const o=[];for(let i=0;i<n.length;){if(n.startsWith("ING",i)){o.push(21);i+=3;continue;}if(n.startsWith("IO",i)){o.push(27);i+=2;continue;}const t=gpTokens.find(x=>n.startsWith(x.symbol,i));assert.ok(t,"unmapped "+n.slice(i));o.push(t.value);i+=t.symbol.length;}return o;}

const parts=tx.split(/^\s*%\s*$/m).slice(0,55),pages=parts.map((_,s)=>({page:s>=50?s+1:s,words:[],offset:0}));
let cur=[],ss=0,es=0,so=0,crossing=0;
function flush(){if(!cur.length)return;if(ss===es){const p=pages[ss];p.words.push({ordinal:p.words.length+1,start:so,values:cur.slice()});}else crossing++;cur=[];}
for(let s=0;s<parts.length;s++)for(const ch of [...parts[s]]){const v=ri.get(ch);if(v!==undefined){if(!cur.length){ss=s;so=pages[s].offset;}es=s;cur.push(v);pages[s].offset++;}else if(ch!=="/"&&!/\s/u.test(ch))flush();}flush();
const all=pages.flatMap(p=>p.words.map(w=>({page:p.page,...w}))),byPage=new Map(pages.map(p=>[p.page,p.words]));
assert.equal(crossing,32);assert.equal(all.length,2864);

const clear=signed.split("-----BEGIN PGP SIGNATURE-----")[0].split(/\n\n/u).slice(1).join("\n");
const source=clear.split(/[^A-Za-z0-9]+/u).filter(x=>/^[A-Za-z]+$/u.test(x)).map((word,index)=>({index,word:word.toUpperCase()}));
assert.equal(source.length,43);

const red=p0.physical_zero_based.red_words.map(w=>w.gp_indices),readout=red.map(hsum);
assert.deepEqual(red.map(w=>w.length),[8,5]);assert.deepEqual(readout,[1,13]);assert.deepEqual(readout.map(i=>source[i].word),["THE","WAY"]);
const pairs=[];
for(const p of pages)for(let i=0;i+1<p.words.length;i++){const a=p.words[i],b=p.words[i+1];if(a.values.length===8&&b.values.length===5)pairs.push({page:p.page,ordinals:[a.ordinal,b.ordinal],starts:[a.start,b.start],sums:[hsum(a.values),hsum(b.values)]});}
assert.equal(pairs.length,19);assert.deepEqual(pairs.filter(x=>x.sums[0]===1&&x.sums[1]===13),[{page:0,ordinals:[1,2],starts:[0,8],sums:[1,13]}]);

const diagonal=source.map(r=>({...r,object:(byPage.get(r.index)||[])[r.index]||null}));
assert.equal(diagonal.filter(r=>r.object).length,42);assert.deepEqual(diagonal.filter(r=>!r.object).map(r=>[r.index,r.word]),[[32,"YOU"]]);
/** @param {object} r @returns {object} */
function outer(r){const v=r.object.values,h=H([v[0],v.at(-1)]);return{index:r.index,word:r.word,start:r.object.start,values:v,h,labels:h.map(x=>source[x].word)};}
const directed=readout.map(i=>outer(diagonal[i]));
assert.deepEqual(directed[0],{index:1,word:"THE",start:13,values:[22,24,25,21,15,23,13,16],h:[6,9],labels:["SEEKS","LIBER"]});
assert.deepEqual(directed[1],{index:13,word:"WAY",start:52,values:[18,3,25,6,26,20],h:[27,9],labels:["ARE","LIBER"]});
const ao=diagonal.filter(r=>r.object&&r.object.values.length>=2).map(outer);
assert.equal(ao.filter(x=>x.h.join(",")==="6,9").length,1);assert.equal(ao.filter(x=>x.h.join(",")==="27,9").length,1);assert.equal(ao.filter(x=>x.h[1]===9).length,3);

const branches=[...new Set(directed.flatMap(x=>x.h))];assert.deepEqual(branches,[6,9,27]);
/** @param {object} r @returns {object|null} */
function shed(r){if(!r.object||r.object.values.length<4)return null;const inside=r.object.values.slice(1,-1),h=H(inside);return{index:r.index,word:r.word,start:r.object.start,values:r.object.values,inside,h,unit:unit(h),labels:h.map(x=>source[x].word)};}
const bt=branches.map(i=>shed(diagonal[i]));assert.ok(bt.every(Boolean));assert.deepEqual(bt.filter(x=>x.unit).map(x=>[x.index,x.h]),[[27,[5,6]]]);
const eligible=diagonal.map(shed).filter(Boolean),hits=eligible.filter(x=>x.unit);
assert.equal(eligible.length,24);assert.deepEqual(hits.map(x=>[x.index,x.word,x.h,x.labels]),[[27,"ARE",[5,6],["EPIPHANY","SEEKS"]]]);

const stateKey=[26,24,8,19,27,24,18,3,0,8,0,16,19];
const inverse=red.flat().map((x,i)=>mod29(x-stateKey[i])),target=[...gp("EPIPHANY"),...gp("SEEKS")];
assert.deepEqual(inverse,target);assert.deepEqual(hits[0].h.flatMap(i=>gp(source[i].word)),target);
console.log(JSON.stringify({status:"PASS",p0Readout:{values:readout,labels:["THE","WAY"],chargedPairs:pairs.length},directed,branches,globalOneShed:{eligible:eligible.length,hits:hits.map(x=>({index:x.index,word:x.word,h:x.h,labels:x.labels}))},convergence:{navigation:[5,6],labels:["EPIPHANY","SEEKS"],stateKeyInverseMatch:true}},null,2));
