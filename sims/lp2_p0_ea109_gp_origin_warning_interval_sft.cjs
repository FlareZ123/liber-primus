"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=(relative)=>fs.readFileSync(path.join(root,relative),"utf8").replace(/\\r/g,"");

const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription=read("resources/liber-primus/lp2-transcription.txt");
const signedText=read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeSet=new Set(corpus.runes);
const runeIndex=new Map(corpus.runes.map((rune,index)=>[rune,index]));

function physicalPage(block){return block<50?block:block+1;}

function parseWords(){
  let block=0,page=0,pageOffset=0,startPage=null,startOffset=null,runes=[];
  const words=[];
  function close(){
    if(runes.length===0)return;
    words.push({startPage,startOffset,endPage:page,endOffset:pageOffset-1,
      values:runes.map((rune)=>runeIndex.get(rune))});
    startPage=null;startOffset=null;runes=[];
  }
  for(const ch of transcription){
    if(runeSet.has(ch)){
      if(runes.length===0){startPage=page;startOffset=pageOffset;}
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

const gp0=(values)=>values.reduce((sum,value)=>sum+value,0);
const gp1=(values)=>values.reduce((sum,value)=>sum+value+1,0);

const clearSigned=signedText
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/,"")
  .replace(/\b3301\b/g,"")
  .replace(/\b[0-9A-F]{8,}\b/g,"");
const signedWords=(clearSigned.match(/[A-Za-z]+/g)||[]).map((word)=>word.toUpperCase());
assert.equal(signedWords.length,43);
assert.deepEqual(signedWords.slice(40,43),["PATHS","VERIFY","OPENPGP"]);

const words=parseWords();
const unknownWords=words.filter((word)=>word.startPage<56&&word.endPage<56);
const twoRuneWords=unknownWords.filter((word)=>word.values.length===2);
assert.equal(unknownWords.length,2896);
assert.equal(twoRuneWords.length,448);

const ea=corpus.translit.indexOf("EA");
assert.equal(ea,28);
assert.equal(corpus.prime[ea],109);
const selected=twoRuneWords.find((word)=>word.startPage===0&&word.startOffset===109);
assert.ok(selected);
assert.deepEqual(selected.values,[14,26]);
assert.equal(selected.endOffset,110);
assert.equal(selected.values.map((value)=>corpus.translit[value]).join(""),"XY");

const zeroSum=gp0(selected.values);
const oneSum=gp1(selected.values);
assert.equal(zeroSum,40);
assert.equal(oneSum,42);
assert.equal((zeroSum+oneSum)/2,41);
assert.deepEqual(signedWords.slice(zeroSum,oneSum+1),["PATHS","VERIFY","OPENPGP"]);

const gp040=twoRuneWords.filter((word)=>gp0(word.values)===40);
assert.equal(gp040.length,9);
const primeStarts=new Set(corpus.prime);
const gp040PrimeStart=gp040.filter((word)=>primeStarts.has(word.startOffset));
assert.equal(gp040PrimeStart.length,1);
assert.equal(gp040PrimeStart[0].startPage,0);
assert.equal(gp040PrimeStart[0].startOffset,109);

const rawXY=twoRuneWords.filter((word)=>word.values[0]===14&&word.values[1]===26);
assert.equal(rawXY.length,1);
assert.equal(rawXY[0].startPage,0);
assert.equal(rawXY[0].startOffset,109);

const table60=grid.pages.flatMap((page)=>page.bytes);
const tokens=grid.pages.flatMap((page)=>page.tokens);
assert.equal(table60[40],80);
assert.equal(tokens[40],"1K");
assert.equal(table60[42],28);
assert.equal(tokens[42],"0S");

const gpTokens=corpus.translit
  .map((symbol,value)=>({symbol,value}))
  .sort((left,right)=>right.symbol.length-left.symbol.length);

function gpWord(word){
  const normalized=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");
  const values=[];
  for(let offset=0;offset<normalized.length;){
    if(normalized.startsWith("ING",offset)){values.push(21);offset+=3;continue;}
    if(normalized.startsWith("IO",offset)){values.push(27);offset+=2;continue;}
    const token=gpTokens.find((candidate)=>normalized.startsWith(candidate.symbol,offset));
    assert.ok(token,"unmapped GP spelling "+normalized.slice(offset));
    values.push(token.value);offset+=token.symbol.length;
  }
  return values;
}

assert.equal(gp0(gpWord("OPENPGP")),75);
assert.equal(tokens[75],"2v");
assert.equal(table60[75],177);
assert.deepEqual([table60[75]-11,table60[75]+11],[166,188]);

console.log(JSON.stringify({
  status:"PASS",
  frozenSelector:{eaValue:ea,eaPrime:109,receiver:{page:0,start:109,end:110,values:selected.values,raw:"XY"}},
  originInterval:{gp0:40,midpoint:41,gp1:42,signedWords:signedWords.slice(40,43)},
  corpusCharge:{
    canonicalUnknownWords:unknownWords.length,
    completeTwoRuneWords:twoRuneWords.length,
    gp0Equals40:gp040.length,
    gp0Equals40AndPrimeStart:gp040PrimeStart.map((word)=>({page:word.startPage,start:word.startOffset,values:word.values})),
    completeRawXYWords:rawXY.length
  },
  endpointConsumers:{
    paths40:{token:tokens[40],base60:table60[40]},
    openpgp42:{token:tokens[42],base60:table60[42]},
    openpgpGp0:{address:75,token:tokens[75],base60:table60[75],packet:[166,188]}
  }
},null,2));
