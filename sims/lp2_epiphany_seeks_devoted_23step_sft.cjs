"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");

/** @param {string} relative @returns {string} */
function read(relative){return fs.readFileSync(path.join(root,relative),"utf8").replace(/\r/g,"");}

const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed2016=read("resources/historical/cicada2016-4gq25-outguess.asc");
const tokens=grid.pages.flatMap((page)=>page.tokens);
const alphabet60=grid.alphabet;
const alphabet59=alphabet60.replace("f","");

/** @param {string} token @param {string} alphabet @returns {number|null} */
function decodeToken(token,alphabet){
 const high=alphabet.indexOf(token[0]);
 const low=alphabet.indexOf(token[1]);
 return high<0||low<0?null:high*alphabet.length+low;
}

const tables={
 base60:tokens.map((token)=>decodeToken(token,alphabet60)),
 base59:tokens.map((token)=>decodeToken(token,alphabet59)),
};

const gpTokens=corpus.translit
 .map((symbol,value)=>({symbol,value}))
 .sort((left,right)=>right.symbol.length-left.symbol.length);

/** @param {string} word @returns {number} */
function gp0(word){
 const normalized=word.toUpperCase()
  .replace(/QU/g,"CW")
  .replace(/V/g,"U")
  .replace(/[KQ]/g,"C")
  .replace(/Z/g,"S")
  .replace(/[^A-Z]/g,"");
 let offset=0;
 let sum=0;
 while(offset<normalized.length){
  if(normalized.startsWith("ING",offset)){sum+=21;offset+=3;continue;}
  if(normalized.startsWith("IO",offset)){sum+=27;offset+=2;continue;}
  const token=gpTokens.find((item)=>normalized.startsWith(item.symbol,offset));
  assert.ok(token,"unmapped GP word "+word+" at "+offset);
  sum+=token.value;
  offset+=token.symbol.length;
 }
 return sum;
}

/** @param {Array<number|null>} table @param {number} start @param {number} steps @returns {number[]|null} */
function walk(table,start,steps){
 const route=[start];
 let state=start;
 for(let index=0;index<steps;index+=1){
  if(state<0||state>=256)return null;
  const next=table[state];
  if(next===null||next===undefined)return null;
  state=next;
  route.push(state);
 }
 return route;
}

const clear=signed2016.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);
assert.ok(clear);
const words=(clear[1].match(/\b[A-Za-z]+\b/gu)||[])
 .map((word,index)=>({index,word:word.toUpperCase(),gp0:gp0(word)}));
assert.equal(words.length,43);
assert.deepEqual(words.slice(5,9).map((row)=>row.word),["EPIPHANY","SEEKS","THE","DEVOTED"]);
assert.deepEqual(words.slice(5,9).map((row)=>row.gp0),[121,71,20,102]);

const pageCounts=new Map(corpus.pages.map((page)=>[page.page,page.indices.length]));
assert.equal(pageCounts.get(32),121);

const dh={p:23,g:5,a:6,b:15,A:8,B:19,K:2};
const hits=[];
let tested=0;
for(let index=0;index<=words.length-4;index+=1){
 const [w0,w1,w2,w3]=words.slice(index,index+4);
 for(const [field,depth] of Object.entries(dh)){
  if(depth<2)continue;
  for(const [radix,table] of Object.entries(tables)){
   tested+=1;
   const route=walk(table,w1.gp0,depth);
   if(!route)continue;
   const terminal=route[depth];
   if(route[depth-2]!==w2.gp0)continue;
   if(route[depth-1]!==w3.gp0)continue;
   if(!pageCounts.has(terminal))continue;
   if(pageCounts.get(terminal)!==w0.gp0)continue;
   hits.push({
    index,
    words:[w0.word,w1.word,w2.word,w3.word],
    gp0:[w0.gp0,w1.gp0,w2.gp0,w3.gp0],
    field,depth,radix,terminal,
    pageRuneCount:pageCounts.get(terminal),
    route,
   });
  }
 }
}
assert.equal(tested,560);
assert.equal(hits.length,1);
assert.deepEqual(hits[0],{
 index:5,
 words:["EPIPHANY","SEEKS","THE","DEVOTED"],
 gp0:[121,71,20,102],
 field:"p",
 depth:23,
 radix:"base60",
 terminal:32,
 pageRuneCount:121,
 route:[71,108,14,183,81,58,146,92,236,238,129,179,175,18,15,212,70,169,228,144,125,20,102,32],
});

const weaker=[];
for(const [field,depth] of Object.entries(dh)){
 if(depth<2)continue;
 for(const [radix,table] of Object.entries(tables)){
  for(const word of words){
   const route=walk(table,word.gp0,depth);
   if(route&&route[depth]===32){
    weaker.push({field,depth,radix,index:word.index,word:word.word,gp0:word.gp0});
   }
  }
 }
}
assert.ok(weaker.length>1);
assert.ok(weaker.some((row)=>row.field==="p"&&row.depth===23&&row.radix==="base60"&&row.word==="SEEKS"));

console.log(JSON.stringify({
 status:"PASS",
 tested,
 uniqueHit:hits[0],
 weakerTerminalOnlyHits:weaker,
 decision:"EPIPHANY SEEKS THE DEVOTED uniquely encodes the base60 p=23 p50 route to physical p32.",
},null,2));
