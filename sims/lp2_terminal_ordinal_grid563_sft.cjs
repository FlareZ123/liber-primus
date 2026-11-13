"use strict";
/**
 * Terminal solved-heading prime ordinals -> original 256-cell table -> 2016
 * signed-image dimension. Original-input source handoff and bounded p55 inverse.
 * Reproduce with Node 22:
 *   node sims/lp2_terminal_ordinal_grid563_sft.cjs
 *
 * The arithmetic correspondences are observations, not an authenticated
 * operation or plaintext recovery.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=f=>fs.readFileSync(path.join(ROOT,f),"utf8");
const book=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcripts=read("resources/liber-primus/lp2-transcription.txt").split("%");
const runeToIndex=new Map(book.runes.map((r,i)=>[r,i]));
const indices=text=>[...text].filter(ch=>runeToIndex.has(ch)).map(ch=>runeToIndex.get(ch));
const primeSum=values=>values.reduce((sum,i)=>sum+book.prime[i],0);
const isPrime=n=>{
  if(n<2)return false;
  for(let d=2;d*d<=n;d++)if(n%d===0)return false;
  return true;
};
const ordinal=n=>{
  let count=0;
  for(let i=2;i<=n;i++)count+=Number(isPrime(i));
  return count;
};
assert.equal(transcripts.length,57);
assert.equal(table.bytes.length,256);
const p57=transcripts.at(-1).split("&")[0];
const clauses=p57.split(".").map(indices).filter(x=>x.length>0);
assert.deepEqual(clauses.map(x=>x.length),[7,30,30,28]);
assert.deepEqual(clauses.flat(),book.pages[57].indices);
const sums=clauses.map(primeSum);
const ranks=sums.map(ordinal);
assert.deepEqual(sums,[449,1259,1031,1229]);
assert.deepEqual(ranks,[87,205,173,201]);
assert(sums.every(isPrime));
assert.equal(ranks.reduce((a,b)=>a+b),666);
const p56=book.pages[56].indices;
assert.deepEqual(p56.slice(0,5),[25,11,22,15,4]);
const title56=p56.slice(0,5).map((v,i)=>(v-([2,3,5,7,11][i]-1)+29)%29);
assert.deepEqual(title56,[24,9,18,9,23]);
assert.equal(primeSum(title56),311);
assert.equal(ordinal(311),64);

const tokens=table.pages.flatMap(p=>p.tokens);
const atOneBased=i=>({slot:i,token:tokens[i-1],byte:table.bytes[i-1]});
assert.deepEqual([atOneBased(64),atOneBased(87)],[
  {slot:64,token:"0p",byte:51},{slot:87,token:"1p",byte:111}
]);
assert.equal(table.bytes[86]-table.bytes[63],60);
const selection=ranks.map(atOneBased);
assert.deepEqual(selection.map(x=>x.byte),[111,194,148,110]);
const quadSum=selection.reduce((sum,x)=>sum+x.byte,0);
assert.equal(quadSum,563);
const previous=Array.from({length:23},(_,i)=>atOneBased(64+i));
const following=Array.from({length:23},(_,i)=>atOneBased(65+i));
assert.equal(previous.reduce((sum,x)=>sum+x.byte,0),3000);
assert.equal(following.reduce((sum,x)=>sum+x.byte,0),3060);
// This is independently established by the signed-image inventory script.
assert.match(read("resources/historical/cicada2016-4gq25.md"),
  /Dimensions:\s*563\s*×\s*569\s*pixels/u);

const pages=transcripts.slice();
pages.splice(50,0,"");
assert.equal(pages.length,58);
const p55Body=pages[55].split("&")[0].replace(/[\r\n/]/gu,"");
const words=p55Body.split(/[-.]/u).map(indices).filter(x=>x.length>0);
assert.deepEqual(words.map(x=>x.length),
  [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
const core=words.slice(1).flatMap(w=>w.slice(2,-2));
assert.equal(core.length,23);
assert.equal(primeSum(core),1020);
const translit=a=>a.map(i=>book.translit[i]).join(" ");
const consumers=[];
for(const [label,cells] of [["64-86",previous],["65-87",following]]){
  const key=cells.map(c=>c.byte%29);
  for(const sign of [-1,1]){
    const result=core.map((cipher,i)=>(cipher+29+sign*key[i])%29);
    const enc=result.map((plain,i)=>(plain+29-sign*key[i])%29);
    assert.deepEqual(enc,core);
    const control=book.pages[57].indices.slice(0,23);
    const syntheticCipher=control.map((v,i)=>(v+29-sign*key[i])%29);
    assert.deepEqual(syntheticCipher.map((v,i)=>(v+29+sign*key[i])%29),control);
    consumers.push({window:label,sign,coreOutput:translit(result),
      originalReencrypted:23,solvedP57PlantRecovered:23});
  }
}
// A single frozen, artificial table-location null. It is diagnostic,
// because the 60/563 relationships were noticed after source exploration.
// Sample five distinct locations without replacement from the exact
// multiset of original 256 byte values, preserving all source symbol counts.
let state=0x5613666;
function random(){
  state^=state<<13;
  state^=state>>>17;
  state^=state<<5;
  return state>>>0;
}
const repetitions=3000000;
let pair60=0,sum563=0,sum569=0,joint=0,jointEither=0;
for(let rep=0;rep<repetitions;rep++){
  const places=[];
  for(let j=0;j<5;j++){
    let k;
    do{k=random()%256;}while(places.includes(k));
    places.push(k);
  }
  const [first,second,a,b,c]=places.map(k=>table.bytes[k]);
  const pair=second-first===60;
  const total=second+a+b+c;
  pair60+=Number(pair);
  sum563+=Number(total===563);
  sum569+=Number(total===569);
  joint+=Number(pair&&total===563);
  jointEither+=Number(pair&&(total===563||total===569));
}
assert.deepEqual([pair60,sum563,sum569,joint,jointEither],
  [9254,7657,7460,26,54]);
console.log(JSON.stringify({
  status:"SOURCE LINK EXISTS; NO AUTHENTICATED CIPHER OR UNKNOWN PLAINTEXT",
  solvedP56:{titleGPPrimeSum:311,ordinal:64,table:atOneBased(64)},
  solvedP57:{printedClauseSums:sums,primeOrdinals:ranks,
    tableSelection:selection,tableByteSum:quadSum},
  tablePair:{ordinalGap:23,base60ByteDifference:60},
  consecutive23TableCells:{slots64to86Sum:3000,slots65to87Sum:3060},
  independentlyArchived2016Image:"563x569",
  originalP55Core:{length:core.length,GPPrimeSum:primeSum(core),
    original:translit(core),consumers},
  diagnosticShuffledTable:{repetitions,seed:"0x5613666",
    pairDifference60:pair60,fourByteSum563:sum563,
    fourByteSum569:sum569,joint:joint,jointEither,
    warning:"Retrospective feature selection and other searched source relationships are not included in this null."},
  recoveredUnknownPlaintext:0
},null,2));
