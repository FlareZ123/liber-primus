"use strict";
// Exact replay of the six two-phase relaxation witnesses. No search or solver dependency.
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const corpus=JSON.parse(fs.readFileSync(path.resolve(__dirname,"../resources/liber-primus/lp2-corpus.json"),"utf8"));
const c=corpus.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);
let hash=2166136261;for(const a of c)hash=Math.imul(hash^a,16777619)>>>0;
assert.equal(c.length,3008);assert.equal(hash,1862123327);assert.equal(c.filter(a=>a===0).length,125);
const witnesses=[
[1,12,[0,2,5,6,14],[0,14,15,17,25],"10001111111101111001111011000010010111100110100011111111111001001110001001011110110011001111111111111111111111111111001000011",0],
[2,10,[0,6,8,20,22],[0,5,6,27,28],"01010111111111110101110111101101011111111111111010001111111111100110010001111010111101001101110011111011110111101110011111001",1],
[3,0,[0,6,12,13,14],[0,7,8,12,20],"10101001000010000101000001011111111111100000101000011110100011000000111000001111011111100111111001111011111111001111000111011",1],
[4,11,[0,6,14,24,27],[0,5,6,8,14],"00011101111100000000011110011111101111101110011100001111101111100111100001100100101000010001000000000010101001001110100010101",1],
[5,3,[0,5,7,12,23],[0,14,15,17,21],"01011111011011110101111101011111111111110111111111001000110000011111101011110011100111110111111101101000101100010111100101001",1],
[6,10,[0,3,6,8,16],[0,2,12,24,28],"01111010001100001111111111000000001000010101101111111010111101111000111110001110011010001011111101111111101101111011010100011",1]
];
const results=witnesses.map(([d,start,S,T,bits,want])=>{
 assert.equal(new Set(S).size,5);assert.equal(new Set(T).size,5);assert.equal(bits.length,125);assert.match(bits,/^[01]+$/);
 let p=start,j=0,held=0;const hits=[],H=Array.from({length:13},()=>Array(29).fill(0));
 for(let i=0;i<c.length;i++){const a=c[i];if(a===0&&bits[j++]==="1"){held++;continue}H[p][a]++;if((p===0&&S.includes(a))||(p===d&&T.includes(a)))hits.push([i,p,a]);p=(p+1)%13}
 assert.equal(j,125);assert.equal(hits.length,want);
 assert(S.some(a=>H[0][a]===0)&&T.some(a=>H[d][a]===0),"selected-phase forbidden labels");
 return {d,start,S,T,held,hits,selectedCounts:[S.map(a=>H[0][a]),T.map(a=>H[d][a])],bits};
});
console.log(JSON.stringify({n:c.length,hash,q:13,heldLabel:0,results,pairwiseFractionalCoverCeiling:7},null,2));
