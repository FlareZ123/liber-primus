"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8").replace(/\r/g,"");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription=read("resources/liber-primus/lp2-transcription.txt");
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const runeSet=new Set(corpus.runes);
const parts=transcription.split(/^\s*%\s*$/m);
const gpTokens=corpus.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);
const table60=grid.pages.flatMap((p)=>p.bytes);

/** @param {number} page @returns {string} */
function physicalPart(page){assert.notEqual(page,50);return parts[page<=49?page:page-1];}

/** @param {string} text @returns {Array<{start:number,end:number,values:number[]}>} */
function parseWords(text){
  const words=[];let current=[];let start=0;let offset=0;
  const flush=()=>{if(!current.length)return;words.push({start,end:offset-1,values:current.slice()});current=[];};
  for(const char of [...text]){
    if(runeSet.has(char)){if(!current.length)start=offset;current.push(runeIndex.get(char));offset+=1;}
    else if(char==="-"||char===".")flush();
  }
  flush();return words;
}

/** @param {string} word @returns {number[]} */
function gp(word){
  const normalized=word.toUpperCase().replace(/K/g,"C").replace(/V/g,"U").replace(/Q/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");
  const out=[];
  for(let i=0;i<normalized.length;){
    const token=gpTokens.find((item)=>normalized.startsWith(item.symbol,i));
    assert.ok(token,"unmapped GP spelling at "+word+":"+i);
    out.push(token.value);i+=token.symbol.length;
  }
  return out;
}

/** @param {number[]} values @returns {number} */
const gp0=(values)=>values.reduce((sum,value)=>sum+value,0);
/** @param {number[]} values @returns {number} */
const gp1=(values)=>values.reduce((sum,value)=>sum+value+1,0);
/** @param {number[]} values @returns {number} */
const gpPrime=(values)=>values.reduce((sum,value)=>sum+corpus.prime[value],0);
/** @param {number} value @returns {number} */
const mod29=(value)=>((value%29)+29)%29;
/** @param {number} left @param {number} right @returns {[number,number]} */
const H29=(left,right)=>[mod29(left-right),mod29(left+right)];

const ea=gp("EA");
assert.deepEqual(ea,[28]);
const eaPrime=gpPrime(ea);
assert.equal(eaPrime,109);

const p0Words=parseWords(physicalPart(0));
const selected=p0Words.find((word)=>word.start===eaPrime);
assert.ok(selected);
assert.deepEqual(selected,{start:109,end:110,values:[14,26]});

const primeWeights=selected.values.map((value)=>corpus.prime[value]);
assert.deepEqual(primeWeights,[47,103]);
const rawDifference=primeWeights[0]-primeWeights[1];
const rawSum=primeWeights[0]+primeWeights[1];
assert.deepEqual([rawDifference,rawSum],[-56,150]);
assert.deepEqual(H29(primeWeights[0],primeWeights[1]),[2,5]);

assert.equal(gpPrime(gp("FIND")),151);
assert.equal(rawSum,gpPrime(gp("FIND"))-1);
assert.equal(gp0(gp("MAP")),56);
assert.equal(Math.abs(rawDifference),gp0(gp("MAP")));

assert.equal(gp0(selected.values),40);
assert.equal(gp1(selected.values),42);
assert.equal(table60[40],80);
assert.equal(table60[42],28);
assert.equal(gp0(gp("READ")),55);
assert.equal(table60[55],80);
assert.equal(gp0(gp("FIND")),42);

const dh={p:23,g:5,K:2};
assert.deepEqual(H29(primeWeights[0],primeWeights[1]),[dh.K,dh.g]);

let twoRuneWords=0;
let sum150=0;
let diff56=0;
const joint=[];
for(let page=0;page<=55;page+=1){
  if(page===50)continue;
  const words=parseWords(physicalPart(page));
  for(let index=0;index<words.length;index+=1){
    const word=words[index];
    if(word.values.length!==2)continue;
    twoRuneWords+=1;
    const weights=word.values.map((value)=>corpus.prime[value]);
    const sum=weights[0]+weights[1];
    const diff=Math.abs(weights[0]-weights[1]);
    if(sum===150)sum150+=1;
    if(diff===56)diff56+=1;
    if(sum===150&&diff===56){
      joint.push({page,word:index+1,start:word.start,end:word.end,values:word.values,primeWeights:weights,h29:H29(weights[0],weights[1])});
    }
  }
}
assert.equal(twoRuneWords,465);
assert.equal(sum150,8);
assert.equal(diff56,9);
assert.deepEqual(joint,[{page:0,word:24,start:109,end:110,values:[14,26],primeWeights:[47,103],h29:[2,5]}]);

console.log(JSON.stringify({
  status:"PASS",
  frozenPointer:{shedInner:"EA",gpPrime:eaPrime,selectedStart:selected.start},
  selectedWord:{...selected,gp0:gp0(selected.values),gp1:gp1(selected.values),gpPrime:gpPrime(selected.values),primeWeights,rawH:[rawDifference,rawSum],hMod29:H29(primeWeights[0],primeWeights[1])},
  sourceConnections:{
    absPrimeDifference:{value:Math.abs(rawDifference),equals:"GP0(MAP)"},
    primeSum:{value:rawSum,equals:"GP-prime(FIND)-1 = 150"},
    mod29H:{value:H29(primeWeights[0],primeWeights[1]),equals:"[K,g]"},
    p50:{gp0Address:40,gp0Base60:table60[40],equalsReadStart:80,gp1Address:42,gp1Base60:table60[42],equalsPhysicalPage:28}
  },
  controls:{twoRuneWords,sum150,diff56,joint},
  classification:"Prospective content holdout on the EA-prime-selected next word. Its prime-weight H packet simultaneously returns the fixed 56/150 states and [K,g], while GP0/GP1 return to READ-start80/p28. No plaintext is assigned to the selected word."
},null,2));
