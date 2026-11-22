"use strict";
/**
 * Source-fixed 2016 signed-message 43-word compass route to p32 HOME-X.
 * Node.js 22 SFT: node sims/lp2_2016_43word_compass_sft.cjs
 * Status: reproducible clue hypothesis, no plaintext or key.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const c=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const g=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const s=read("resources/historical/cicada2016-4gq25-outguess.asc");
const signed=s.slice(s.indexOf("Hello."),s.indexOf("-----BEGIN PGP SIGNATURE-----"));
const words=signed.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g)||[];
assert.equal(words.length,43);
assert.equal(g.bytes.length,256);
assert.deepEqual(g.pages.map(p=>p.page),[49,50,51]);
assert.deepEqual([82,83,127,128].map(i=>g.bytes[i]),[201,193,193,201]);
const bytes=g.bytes.slice(84,127);
assert.equal(bytes.length,words.length);
const p32=c.pages.find(p=>p.page===32).indices;
assert.equal(p32.length,121);
assert.equal(p32.slice(33,38).map(i=>c.translit[i]).join(""),"HOMEX");
const prime=p32.map(i=>c.prime[i]);
assert.equal(prime.slice(0,11).reduce((a,b)=>a+b,0),563);
assert.equal(prime.filter((_,i)=>i%11===0).reduce((a,b)=>a+b,0),569);
const dirs=[[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1]];
const mod=(n,m)=>((n%m)+m)%m;
/**
 * 8 columns => clockwise compass remainder; 32 rows => distance quotient.
 * @param {number[]} data
 * @returns {{visited:number[],row:number,col:number,delta:number[]}}
 */
function walk(data){
 let row=3,col=0,dr=0,dc=0,visited=[];
 for(const byte of data){
  assert(Number.isInteger(byte)&&byte>=0&&byte<256);
  const distance=byte>>3,[sr,sc]=dirs[byte&7];
  dr+=sr*distance;dc+=sc*distance;
  row=mod(row+sr*distance,11);
  col=mod(col+sc*distance,11);
  visited.push(row*11+col);
 }
 return {visited,row,col,delta:[dr,dc]};
}
const route=walk(bytes);
const routeRunes=route.visited.map(p=>p32[p]);
assert.deepEqual([route.row,route.col,route.visited.at(-1)],[3,4,37]);
assert.deepEqual(route.delta,[110,-117]);
assert.equal(new Set(route.visited).size,35);
for(const perm of [[...bytes].reverse(),[...bytes].sort((a,b)=>a-b)]){
 const r=walk(perm);
 assert.deepEqual([r.row,r.col],[3,4]);
}
const sameWindow=[];
for(let start=0;start+43<=g.bytes.length;start++){
 const r=walk(g.bytes.slice(start,start+43));
 if(r.row===3&&r.col===4)sameWindow.push(start);
}
assert.deepEqual(sameWindow,[84,95,102,128]);
const cycle=[0,203,68,199,47,76,114,197,115,247,192];
assert.deepEqual(cycle.filter(n=>c.prime.includes(n)),[47]);
assert.equal(c.translit[c.prime.indexOf(47)],"X");
const alphabet=c.translit.map((token,i)=>({token:token.toLowerCase(),i}))
 .sort((a,b)=>b.token.length-a.token.length);
/** @param {string} text @returns {number} */
function firstRune(text){
 const word=text.toLowerCase().replace(/v/g,"u").replace(/k/g,"c").replace(/z/g,"s");
 return alphabet.find(x=>word.startsWith(x.token)).i;
}
const initials=words.map(firstRune);
const wordLengths=words.map(w=>w.length);
const routeMinusWordLengths=routeRunes.map((v,i)=>mod(v-wordLengths[i],29));
const routeMinusInitials=routeRunes.map((v,i)=>mod(v-initials[i],29));
const routeMinusBytes=routeRunes.map((v,i)=>mod(v-bytes[i],29));
assert.deepEqual(routeRunes,
 [8,26,23,17,3,21,25,9,2,20,19,27,19,10,15,8,2,19,20,17,24,17,14,16,17,14,21,19,16,11,19,7,21,23,12,27,8,8,17,0,23,14,14]);
assert.deepEqual(routeMinusWordLengths,
 [3,23,19,13,27,13,20,6,24,15,13,25,16,7,12,3,28,16,17,12,17,15,11,12,14,9,14,16,13,2,15,4,18,19,10,22,4,4,11,24,18,8,7]);
assert.deepEqual(routeMinusInitials,
 [0,24,10,26,14,3,10,7,8,0,6,17,17,3,5,1,7,17,1,15,5,7,12,12,22,12,12,24,14,17,4,12,24,16,24,27,2,17,0,0,10,13,11]);
assert.deepEqual(routeMinusBytes,
 [9,27,28,10,24,4,1,18,27,23,21,21,0,5,1,3,6,22,17,14,18,12,12,1,3,4,18,20,1,13,25,21,25,26,6,17,24,3,18,4,10,23,25]);
const matches=route.visited.map((p,i)=>p32[p]===initials[i]);
const hits=matches.flatMap((v,i)=>v?[i]:[]);
const sentenceStarts=[0,1,9,14,30,36,38,41];
const matchedStarts=sentenceStarts.filter(i=>matches[i]);
assert.deepEqual(hits,[0,9,38,39]);
assert.deepEqual(matchedStarts,[0,9,38]);

// Preserve p32 row and column prime checksums and the HOMEX landmark.
const fixed=new Set([...Array.from({length:11},(_,i)=>i),
 ...Array.from({length:11},(_,i)=>11*i),33,34,35,36,37]);
const free=Array.from({length:121},(_,i)=>i).filter(i=>!fixed.has(i));
assert.equal(free.length,96);
const perm=p32.slice();
let seed=0x33010021;
function random32(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
let allCount=0,startCount=0,jointCount=0;
const trials=100000;
for(let j=0;j<trials;j++){
 for(const pos of free)perm[pos]=p32[pos];
 for(let i=free.length-1;i>0;i--){
  const k=random32()%(i+1),a=free[i],b=free[k];
  [perm[a],perm[b]]=[perm[b],perm[a]];
 }
 let n=0,m=0;
 for(let i=0;i<43;i++)if(perm[route.visited[i]]===initials[i])n++;
 for(const i of sentenceStarts)if(perm[route.visited[i]]===initials[i])m++;
 if(n>=hits.length)allCount++;
 if(m>=matchedStarts.length)startCount++;
 if(n>=hits.length&&m>=matchedStarts.length)jointCount++;
}
assert.deepEqual([allCount,startCount,jointCount],[4709,371,241]);
console.log(JSON.stringify({
 signedWords:words.length,tableInterval:[84,127],delimiter:[201,193,193,201],
 origin:[3,0],endpoint:[route.row,route.col],rawDelta:route.delta,
 marker:"HOMEX",endpointRunePrime:47,onlyCycleGPPrime:47,
 visitedDistinct:new Set(route.visited).size,
 routeCellReadout:routeRunes.map(i=>c.translit[i]).join(" "),
 routeMinusWordLengths:routeMinusWordLengths.map(i=>c.translit[i]).join(" "),
 routeMinusWordInitials:routeMinusInitials.map(i=>c.translit[i]).join(" "),
 routeMinusTableBytesMod29:routeMinusBytes.map(i=>c.translit[i]).join(" "),
 wordInitialMatchIndices:hits,sentenceStartMatchIndices:matchedStarts,
 matching43Windows:sameWindow,endpointInvariantUnderStepReordering:true,
 shuffle:{trials,seed:"0x33010021",allCount,startCount,jointCount},
 status:"navigation hypothesis; no unknown LP2 plaintext or key recovered"
},null,2));
