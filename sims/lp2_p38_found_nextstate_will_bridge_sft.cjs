"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const raw = fs.readFileSync(path.join(root,"resources/liber-primus/lp2-transcription.txt"),"utf8");
const grid = JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-grid-256.json"),"utf8"));
const signed = fs.readFileSync(path.join(root,"resources/historical/cicada2016-4gq25-outguess.asc"),"utf8");
const runeIndex = new Map(corpus.runes.map((r,i)=>[r,i]));
const tokens = grid.pages.flatMap((p)=>p.tokens);
const a60 = grid.alphabet;
const a59 = a60.replace("f","");
const gpTokens = corpus.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);

/** @param {number} x @returns {number} */
function mod(x){ return ((x%29)+29)%29; }
/** @param {number} x @param {number} y @returns {number[]} */
function H(x,y){ return [mod(x-y),mod(x+y)]; }
/** @param {number} i @param {string} alphabet @returns {number} */
function low(i,alphabet){ return alphabet.indexOf(tokens[i][1]); }
/** @param {number} i @param {string} alphabet @returns {number} */
function full(i,alphabet){ return alphabet.indexOf(tokens[i][0])*alphabet.length+alphabet.indexOf(tokens[i][1]); }

/** @param {string} word @returns {number[]} */
function gp(word){
  const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");
  const out=[];
  for(let i=0;i<s.length;){
    if(s.startsWith("ING",i)){out.push(21);i+=3;continue;}
    if(s.startsWith("IO",i)){out.push(27);i+=2;continue;}
    const t=gpTokens.find((x)=>s.startsWith(x.symbol,i));
    assert.ok(t,"unmapped GP spelling at "+s.slice(i));
    out.push(t.value); i+=t.symbol.length;
  }
  return out;
}

/**
 * @param {string} text
 * @param {number} page
 * @returns {{page:number,index:number,start:number,end:number,length:number,values:number[],gp0:number}[]}
 */
function parsePage(text,page){
  const words=[],runes=[];
  let current=[],start=0;
  const flush=()=>{
    if(!current.length)return;
    words.push({page,index:words.length,start,end:start+current.length-1,length:current.length,values:current.slice(),gp0:current.reduce((a,b)=>a+b,0)});
    current=[];
  };
  for(const ch of [...text]){
    const value=runeIndex.get(ch);
    if(value!==undefined){
      if(!current.length)start=runes.length;
      current.push(value);runes.push(value);
    }else if((ch==="-"||ch===".")&&current.length)flush();
  }
  flush();
  return words;
}

const clear=signed.split("-----BEGIN PGP SIGNATURE-----")[0].split(/\r?\n\r?\n/).slice(1).join("\n");
const signedWords=clear.split(/[^A-Za-z0-9]+/).filter((x)=>/^[A-Za-z]+$/.test(x))
  .map((word,index)=>({index,word:word.toUpperCase(),gp0:gp(word).reduce((a,b)=>a+b,0)}));
assert.deepEqual(signedWords.slice(32,36).map((w)=>w.word),["YOU","WILL","BE","FOUND"]);
assert.equal(signedWords[33].gp0,57);

const parts=raw.split("%"),words=[];
for(let i=0;i<55;i++){
  const page=i<=49?i:i+1;
  words.push(...parsePage(parts[i],page));
}
assert.equal(words.length,2928);

const stateWord=words.find((w)=>w.page===38&&w.start===54);
assert.ok(stateWord);
assert.deepEqual(stateWord.values,[5,12,19]);
assert.equal(stateWord.end,56);
assert.equal(stateWord.length,3);
assert.equal(stateWord.gp0,36);
assert.equal(low(36,a60),54);
assert.equal(low(54,a60),36);
assert.equal(tokens[36],"0s");
assert.equal(tokens[54],"2a");
assert.deepEqual([low(36,a59),low(54,a59)],[53,36]);

const eligible=words.filter((w)=>w.gp0<256&&w.start<256);
const oneWay=eligible.filter((w)=>low(w.gp0,a60)===w.start);
const reciprocal=oneWay.filter((w)=>low(w.start,a60)===w.gp0);
assert.deepEqual([eligible.length,oneWay.length,reciprocal.length],[2848,13,1]);
assert.deepEqual([reciprocal[0].page,reciprocal[0].start,reciprocal[0].gp0],[38,54,36]);

const triples=words.filter((w)=>w.length===3);
assert.equal(triples.length,726);
const permKey=[5,12,19].sort((a,b)=>a-b).join(",");
const permHits=triples.filter((w)=>w.values.slice().sort((a,b)=>a-b).join(",")===permKey);
assert.deepEqual(permHits.map((w)=>[w.page,w.start,w.values]),[[38,54,[5,12,19]]]);
const extendedSet=new Set([23,5,6,15,8,19,2,12]);
assert.equal(triples.filter((w)=>w.values.every((v)=>extendedSet.has(v))).length,11);
assert.deepEqual([...H(5,19),12],[15,24,12]);

const primary=[["p",23],["g",5],["a",6],["b",15],["A",8],["B",19],["K",2]];
const extended=[...primary,["Ka",12],["Kg",10]];

/**
 * @param {Array<[string,number]>} fields
 * @param {(i:number)=>number} fn
 * @returns {{gpField:string,indexField:string,gpValue:number,index:number,word:string}[]}
 */
function statePairHits(fields,fn){
  const hits=[];
  for(const [gx,x] of fields)for(const [iy,y] of fields){
    const gpValue=fn(x), index=fn(y), word=signedWords[index];
    if(word&&word.gp0===gpValue)hits.push({gpField:gx,indexField:iy,gpValue,index,word:word.word});
  }
  return hits;
}
assert.deepEqual(statePairHits(primary,(i)=>low(i,a60)),[
  {gpField:"g",indexField:"B",gpValue:57,index:33,word:"WILL"}
]);
assert.deepEqual(statePairHits(extended,(i)=>low(i,a60)),[
  {gpField:"g",indexField:"B",gpValue:57,index:33,word:"WILL"}
]);

const modeHits={
  low60:statePairHits(extended,(i)=>low(i,a60)),
  low59:statePairHits(extended,(i)=>low(i,a59)),
  full60:statePairHits(extended,(i)=>full(i,a60)),
  full59:statePairHits(extended,(i)=>full(i,a59))
};
assert.deepEqual(modeHits.low59,[{gpField:"K",indexField:"p",gpValue:46,index:27,word:"ARE"}]);
assert.deepEqual(modeHits.full60,[]);
assert.deepEqual(modeHits.full59,[]);

const residueHits=[];
for(let x=0;x<29;x++)for(let y=0;y<29;y++){
  const gpValue=low(x,a60),index=low(y,a60),word=signedWords[index];
  if(word&&word.gp0===gpValue)residueHits.push({x,y,gpValue,index,word:word.word});
}
assert.deepEqual(residueHits,[
  {x:5,y:19,gpValue:57,index:33,word:"WILL"},
  {x:28,y:8,gpValue:30,index:32,word:"YOU"},
  {x:28,y:15,gpValue:30,index:32,word:"YOU"}
]);

const f=(i)=>low(i,a60);
assert.deepEqual([f(19),f(f(19)),f(f(f(19))),f(f(f(f(19))))],[33,54,36,54]);
assert.deepEqual([f(10),f(f(10)),f(f(f(10)))],[36,54,36]);
const cycleEntrants=[];
for(let start=0;start<29;start++){
  let x=start,seen=new Set([x]),hit=false;
  for(let step=0;step<20;step++){
    x=f(x);
    if(x===54||x===36)hit=true;
    if(seen.has(x))break;
    seen.add(x);
  }
  if(hit)cycleEntrants.push(start);
}
assert.deepEqual(cycleEntrants,[10,19]);

console.log(JSON.stringify({
  stateWord:{page:38,start:54,end:56,values:stateWord.values,gp0:stateWord.gp0,hShell:[...H(5,19),12]},
  reciprocal:{eligible:eligible.length,oneWay:oneWay.length,reciprocal:reciprocal.length,base59:[low(36,a59),low(54,a59)]},
  triples:{count:triples.length,extendedPool:11,exactPermutationHits:permHits.length},
  endpointSelector:{primary:statePairHits(primary,(i)=>low(i,a60)),extended:statePairHits(extended,(i)=>low(i,a60)),residueHits},
  modeHits,
  lowDynamics:{B:[19,33,54,36,54],Kg:[10,36,54,36],cycleEntrants}
},null,2));
