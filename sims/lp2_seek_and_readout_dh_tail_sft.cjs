"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");

/** @param {string} relative @returns {string} */
function read(relative){return fs.readFileSync(path.join(root,relative),"utf8").replace(/\r/g,"");}

const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription=read("resources/liber-primus/lp2-transcription.txt");
const signed2016=read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex=new Map(corpus.runes.map((rune,index)=>[rune,index]));
const gpTokens=corpus.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);
const tableTokens=grid.pages.flatMap((page)=>page.tokens);
const alphabet60=grid.alphabet;
const alphabet59=alphabet60.replace("f","");
const parts=transcription.split(/^\s*%\s*$/m);

/** @param {string} word @returns {number[]} */
function gp(word){
 const normalized=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");
 const out=[];
 for(let offset=0;offset<normalized.length;){
  if(normalized.startsWith("ING",offset)){out.push(21);offset+=3;continue;}
  if(normalized.startsWith("IO",offset)){out.push(27);offset+=2;continue;}
  const token=gpTokens.find((item)=>normalized.startsWith(item.symbol,offset));
  assert.ok(token);
  out.push(token.value);
  offset+=token.symbol.length;
 }
 return out;
}

/** @param {string} word @returns {number} */
function gp0(word){return gp(word).reduce((sum,value)=>sum+value,0);}

/** @param {string} source @param {number} page @returns {Array<{page:number,index:number,start:number,end:number,length:number,values:number[]}>} */
function parsePage(source,page){
 const words=[];let current=[];let start=0;let runeOffset=0;
 function flush(){if(!current.length)return;words.push({page,index:words.length,start,end:runeOffset-1,length:current.length,values:current.slice()});current=[];}
 for(const char of [...source]){
  const value=runeIndex.get(char);
  if(value!==undefined){if(!current.length)start=runeOffset;current.push(value);runeOffset+=1;}
  else if((char==="-"||char===".")&&current.length)flush();
 }
 flush();return words;
}

/** @param {string} token @param {string} alphabet @returns {number} */
function decodeToken(token,alphabet){return alphabet.indexOf(token[0])*alphabet.length+alphabet.indexOf(token[1]);}

const clear=signed2016.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);
assert.ok(clear);
const signed=(clear[1].match(/\b[A-Za-z]+\b/gu)||[]).map((word,index)=>({index,word:word.toUpperCase(),gp:gp(word)}));
assert.deepEqual(signed.slice(30,34).map((row)=>row.word),["SEEK","AND","YOU","WILL"]);
assert.equal(gp0("SEEK"),56);
assert.equal(tableTokens[56],"4E");

const p0=parsePage(parts[0],0);
const p0ByStart=new Map(p0.map((word)=>[word.start,word]));
const modes=[];
for(const [radix,alphabet] of [[60,alphabet60],[59,alphabet59]]){
 for(const origin of [0,1]){
  const raw=decodeToken(tableTokens[56],alphabet);
  const offset=raw-origin;
  const word=p0ByStart.get(offset);
  modes.push({radix,origin,raw,offset,length:word?word.length:null});
 }
}
assert.deepEqual(modes,[
 {radix:60,origin:0,raw:254,offset:254,length:3},
 {radix:60,origin:1,raw:254,offset:253,length:null},
 {radix:59,origin:0,raw:250,offset:250,length:null},
 {radix:59,origin:1,raw:250,offset:249,length:null},
]);

const receiver=p0ByStart.get(254);
assert.ok(receiver);
assert.deepEqual(receiver.values,[19,4,21]);
assert.deepEqual(gp("AND"),[24,9,23]);

const dh={p:23,g:5,a:6,b:15,A:8,B:19,K:2};
const packet=[19,23,25,4,16,12,9,6,10,14,15,8,24,5,21,5,28,26,22,9,0,18,2];
const stateValues=new Set(Object.values(dh));
const filtered=packet.filter((value)=>stateValues.has(value));
assert.deepEqual(filtered,[19,23,6,15,8,5,5,2]);
const key=filtered.slice(-3);
assert.deepEqual(key,[5,5,2]);
const plain=receiver.values.map((value,index)=>(value+key[index])%29);
assert.deepEqual(plain,gp("AND"));
assert.deepEqual(plain.map((value,index)=>(value-key[index]+29)%29),receiver.values);

const signedThree=[...new Map(signed.filter((row)=>row.gp.length===3).map((row)=>[row.word,row])).values()];
assert.deepEqual(signedThree.map((row)=>row.word),["PATH","WAY","ITS","ARE","MAP","AND","YOU"]);
const fields=Object.entries(dh).map(([name,value])=>({name,value}));
const familyHits=[];
for(const x of fields)for(const y of fields)for(const sign of [-1,1]){
 const trial=[x.value,x.value,y.value];
 const out=receiver.values.map((value,index)=>((value+sign*trial[index])%29+29)%29);
 const target=signedThree.find((row)=>row.gp.join(",")===out.join(","));
 if(target)familyHits.push({x:x.name,y:y.name,sign,key:trial,target:target.word});
}
assert.deepEqual(familyHits,[{x:"g",y:"K",sign:1,key:[5,5,2],target:"AND"}]);

const manuscriptThree=[];
for(let page=0;page<55;page+=1){
 if(page===50)continue;
 const segment=page<50?page:page-1;
 for(const word of parsePage(parts[segment],page))if(word.length===3)manuscriptThree.push(word);
}
assert.equal(manuscriptThree.length,724);
const fixedHits=[];
for(const sign of [-1,1])for(const word of manuscriptThree){
 const out=word.values.map((value,index)=>((value+sign*key[index])%29+29)%29);
 const target=signedThree.find((row)=>row.gp.join(",")===out.join(","));
 if(target)fixedHits.push({sign,page:word.page,wordIndex:word.index,start:word.start,target:target.word});
}
assert.deepEqual(fixedHits,[
 {sign:-1,page:24,wordIndex:46,start:188,target:"ITS"},
 {sign:1,page:0,wordIndex:56,start:254,target:"AND"},
]);

console.log(JSON.stringify({
 status:"PASS",
 seek:{gp0:56,token:tableTokens[56],modes},
 receiver:{start:receiver.start,end:receiver.end,cipher:receiver.values},
 readoutStateFilter:filtered,
 key,
 plaintext:"AND",
 directDhFamily:{tested:98,hits:familyHits},
 manuscriptControl:{threeRuneWords:724,hits:fixedHits},
 decision:"Strong conditional AND candidate; packet-tail/sign rule still needs independent authentication."
},null,2));
