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
const crypto=require("node:crypto");
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
// The actual four selected table bytes also satisfy a source-specific
// XOR checksum, providing a historically plausible candidate operator.
// This relationship was noticed retrospectively, so it is not an
// authenticated 2014 author instruction.
const selectedXorOutputs=selection.map((entry,i)=>ranks[i]^entry.byte);
assert.deepEqual(selectedXorOutputs,[56,15,57,167]);
const prefixXors=[];
let runningXor=0;
for(const entry of selection){
  runningXor^=entry.byte;
  prefixXors.push(runningXor);
}
assert.deepEqual(prefixXors,[111,173,57,87]);
assert.equal(prefixXors[1],ranks[2]); // two cell bytes -> third unit ordinal
assert.equal(prefixXors[2],57);       // final physical LP2 page number
assert.equal(prefixXors[3],ranks[0]); // closes on original title ordinal
const ordinalXorMap=index=>index^table.bytes[index-1];
// The title ordinal starts a closed original-table XOR orbit.
const xorOrbit=[];
let cursor=ranks[0];
do {
  assert(cursor>=1&&cursor<=256);
  assert(!xorOrbit.includes(cursor),"Unexpected shorter XOR loop");
  xorOrbit.push(cursor);
  cursor=ordinalXorMap(cursor);
} while(cursor!==ranks[0]&&xorOrbit.length<256);
assert.equal(cursor,ranks[0]);
assert.equal(xorOrbit.length,20);
assert.deepEqual(xorOrbit.slice(0,3),[87,56,104]);
assert.equal(ordinal(569),104); // signed 2016 image height
assert(xorOrbit.includes(138));  // already noticed LP1 square value
assert.equal(ordinalXorMap(64),115);

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
// The 23 bytes can also be the unknown binary payload rather than a pad.
// Test only the native GP index and prime-value encodings of the 23 p55
// core runes, under conventional XOR / byte-addition / byte-subtraction.
const binaryConsumers=[];
for(const [label,cells] of [["64-86",previous],["65-87",following]]){
  const payload=cells.map(c=>c.byte);
  for(const coding of ["GPindex","GPprime"]){
    const key=core.map(i=>coding==="GPindex"?i:book.prime[i]);
    for(const operation of ["xor","add","subtract"]){
      const output=payload.map((v,i)=>operation==="xor"?(v^key[i]):
        operation==="add"?(v+key[i])%256:(v-key[i]+256)%256);
      const printable=output.filter(v=>v>=32&&v<=126).length;
      const letters=output.filter(v=>(v>=65&&v<=90)||
        (v>=97&&v<=122)).length;
      binaryConsumers.push({window:label,coding,operation,
        printableASCII:printable,ASCIIletters:letters,
        text:output.map(v=>v>=32&&v<=126?String.fromCharCode(v):".").join("")});
      // Reversible binary transforms are trivial wrong-key roundtrips.
      const restored=output.map((v,i)=>operation==="xor"?(v^key[i]):
        operation==="add"?(v-key[i]+256)%256:(v+key[i])%256);
      assert.deepEqual(restored,payload);
    }
  }
}
assert.equal(binaryConsumers.length,12);
assert.equal(Math.max(...binaryConsumers.map(c=>c.printableASCII)),10);

// The immediately preceding p56 challenge prints a 512-bit page digest.
// Test the two source-selected 23-byte spans and the four selected cells
// as literal raw bytes or original base60 token text, under three
// ordinary, historically plausible 512-bit digests. No salt or key search.
const signedPlain=read("resources/liber-primus/lp1-plaintext-reference.txt");
const digestBlock=signedPlain.split("### 56")[1].split("### 57")[0];
const targetHash=digestBlock.match(/[0-9a-f]{32,}/gu).join("");
assert.equal(targetHash.length,128);
const hashPreimageCandidates=[
  ["window64-86/bytes",Buffer.from(previous.map(c=>c.byte))],
  ["window65-87/bytes",Buffer.from(following.map(c=>c.byte))],
  ["p57-four/bytes",Buffer.from(selection.map(c=>c.byte))],
  ["window64-86/tokens",Buffer.from(previous.map(c=>c.token).join(""),"ascii")],
  ["window65-87/tokens",Buffer.from(following.map(c=>c.token).join(""),"ascii")],
  ["p57-four/tokens",Buffer.from(selection.map(c=>c.token).join(""),"ascii")]
];
const hashTrials=[];
for(const [name,payload] of hashPreimageCandidates)
  for(const algorithm of ["sha512","sha3-512","blake2b512"]){
    const digest=crypto.createHash(algorithm).update(payload).digest("hex");
    hashTrials.push({name,algorithm,length:payload.length,
      prefix:digest.slice(0,16),matchesOriginalP56:digest===targetHash});
  }
assert.equal(hashTrials.length,18);
assert(hashTrials.every(x=>!x.matchesOriginalP56));

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
  fourSourceUnitXor:{perUnitOutputs:selectedXorOutputs,
    selectedBytePrefixXors:prefixXors,titleXorOrbit:xorOrbit,
    titleOrbitLength:xorOrbit.length,
    returnToTitle:cursor,
    warning:"XOR operator inferred after observing source byte coincidences; no plaintext."},
  consecutive23TableCells:{slots64to86Sum:3000,slots65to87Sum:3060},
  independentlyArchived2016Image:"563x569",
  originalP55Core:{length:core.length,GPPrimeSum:primeSum(core),
    original:translit(core),consumers,binaryConsumers},
  originalP56DirectHashCandidates:hashTrials,
  diagnosticShuffledTable:{repetitions,seed:"0x5613666",
    pairDifference60:pair60,fourByteSum563:sum563,
    fourByteSum569:sum569,joint:joint,jointEither,
    warning:"Retrospective feature selection and other searched source relationships are not included in this null."},
  recoveredUnknownPlaintext:0
},null,2));
