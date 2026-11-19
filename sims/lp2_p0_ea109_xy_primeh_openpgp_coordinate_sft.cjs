"use strict";

/**
 * SFT: EA109 raw XY plus GP-prime H selects OPENPGP as a p50 coordinate.
 * Windows Node.js 22, CommonJS, no third-party dependencies.
 */

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=(relative)=>fs.readFileSync(path.join(root,relative),"utf8").replace(/\r/g,"");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription=read("resources/liber-primus/lp2-transcription.txt");
const signedText=read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeSet=new Set(corpus.runes);
const runeIndex=new Map(corpus.runes.map((rune,index)=>[rune,index]));
const mod29=(value)=>((value%29)+29)%29;

function physicalPage(block){return block<50?block:block+1;}

function parseWords(){
  let block=0,page=0,pageOffset=0,startPage=null,startOffset=null,runes=[];
  const words=[];
  function close(){
    if(!runes.length)return;
    words.push({startPage,startOffset,endPage:page,endOffset:pageOffset-1,
      values:runes.map((rune)=>runeIndex.get(rune))});
    startPage=null;startOffset=null;runes=[];
  }
  for(const ch of transcription){
    if(runeSet.has(ch)){
      if(!runes.length){startPage=page;startOffset=pageOffset;}
      runes.push(ch);pageOffset+=1;
    }else if(ch==="-"||ch==="."||ch==="&"||ch==="$"){
      close();
    }else if(ch==="%"){
      block+=1;page=physicalPage(block);pageOffset=0;
    }
  }
  close();
  return words;
}

const clearSigned=signedText
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/,"")
  .replace(/\b3301\b/g,"")
  .replace(/\b[0-9A-F]{8,}\b/g,"");
const signedWords=(clearSigned.match(/[A-Za-z]+/g)||[]).map((word)=>word.toUpperCase());
assert.equal(signedWords.length,43);
assert.equal(signedWords[42],"OPENPGP");

const two=parseWords().filter((word)=>
  word.startPage<56&&word.endPage<56&&word.values.length===2
);
assert.equal(two.length,448);

const ea=corpus.translit.indexOf("EA");
assert.equal(ea,28);
assert.equal(corpus.prime[ea],109);
const selected=two.find((word)=>word.startPage===0&&word.startOffset===109);
assert.ok(selected);
assert.deepEqual(selected.values,[14,26]);
assert.equal(selected.values.map((value)=>corpus.translit[value]).join(""),"XY");

const primePair=selected.values.map((value)=>corpus.prime[value]);
assert.deepEqual(primePair,[47,103]);
const xy=[
  mod29(primePair[0]-primePair[1]),
  mod29(primePair[0]+primePair[1])
];
assert.deepEqual(xy,[2,5]);

const state={K:2,g:5};
assert.deepEqual(xy,[state.K,state.g]);
const address=xy[1]*8+xy[0];
assert.equal(address,42);
const gp1=(selected.values[0]+1)+(selected.values[1]+1);
assert.equal(gp1,42);
assert.equal(address,gp1);
assert.equal(signedWords[address],"OPENPGP");

const table60=grid.pages.flatMap((page)=>page.bytes);
const tokens=grid.pages.flatMap((page)=>page.tokens);
assert.equal(tokens[address],"0S");
assert.equal(table60[address],28);

const rawXY=two.filter((word)=>word.values[0]===14&&word.values[1]===26);
assert.equal(rawXY.length,1);
const rawYX=two.filter((word)=>word.values[0]===26&&word.values[1]===14);
assert.equal(rawYX.length,0);

const equalRows=[];
let validPrimeHCoordinates=0;
for(const word of two){
  const primes=word.values.map((value)=>corpus.prime[value]);
  const coordinate=[
    mod29(primes[0]-primes[1]),
    mod29(primes[0]+primes[1])
  ];
  if(coordinate[0]>=8)continue;
  validPrimeHCoordinates+=1;
  const candidateAddress=coordinate[1]*8+coordinate[0];
  const candidateGp1=(word.values[0]+1)+(word.values[1]+1);
  if(candidateAddress===candidateGp1){
    equalRows.push({
      page:word.startPage,start:word.startOffset,
      values:word.values,raw:word.values.map((value)=>corpus.translit[value]).join(""),
      coordinate,address:candidateAddress,gp1:candidateGp1,
      sourceWord:candidateAddress<signedWords.length?signedWords[candidateAddress]:null
    });
  }
}
assert.equal(validPrimeHCoordinates,120);
assert.equal(equalRows.length,3);
assert.deepEqual(equalRows.map((row)=>[row.page,row.start,row.raw,row.address]),[
  [0,109,"XY",42],
  [20,30,"XC",21],
  [35,164,"XC",21]
]);
assert.equal(equalRows.filter((row)=>row.raw==="XY").length,1);

console.log(JSON.stringify({
  status:"PASS",
  selected:{
    page:0,start:109,end:110,raw:"XY",values:selected.values,
    primePair,primeHXY:xy,dhReading:["K","g"],
    rowMajorAddress:address,gp1,sourceWord:signedWords[address],
    p50Token:tokens[address],p50Base60:table60[address]
  },
  corpusCharge:{
    completeTwoRuneWords:two.length,
    completeXYWords:rawXY.length,
    completeYXWords:rawYX.length,
    validPrimeHCoordinates,
    addressEqualsGp1:equalRows
  },
  route:[
    "EA prime109",
    "raw XY",
    "prime-H -> [K,g]=[2,5]",
    "X=column,Y=row -> address42",
    "source42 OPENPGP",
    "p50[42]=28 -> physical p28"
  ]
},null,2));
