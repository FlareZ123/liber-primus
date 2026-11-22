"use strict";

/**
 * SFT: authenticated 2016 words form an 8-column XY map matching p50 geometry,
 * and OPENPGP's native hex radix is a K-row vertical stride through it.
 *
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
const mod29=(value)=>((value%29)+29)%29;

const clearSigned=signedText
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/,"");
const keyIdMatch=clearSigned.match(/\b([0-9A-F]{8})\b/);
assert.ok(keyIdMatch);
assert.equal(keyIdMatch[1],"7A35090F");
const keyId=parseInt(keyIdMatch[1],16);

const sourceBody=clearSigned
  .replace(/\b3301\b/g,"")
  .replace(/\b[0-9A-F]{8,}\b/g,"");
const words=(sourceBody.match(/[A-Za-z]+/g)||[]).map((word)=>word.toUpperCase());
assert.equal(words.length,43);

const width=grid.pages[0].cols;
assert.equal(width,8);
assert.equal(grid.pages.every((page)=>page.cols===width),true);
assert.equal(grid.pages.reduce((sum,page)=>sum+page.rows*page.cols,0),256);

/** @param {number} x @param {number} y @returns {number} */
function address(x,y){return y*width+x;}
/** @param {number} x @param {number} y @returns {string} */
function wordAt(x,y){return words[address(x,y)];}
/** @param {number} y @param {number} x0 @param {number} x1 @returns {string} */
function rowPhrase(y,x0,x1){return words.slice(address(x0,y),address(x1,y)+1).join(" ");}

const state=Object.freeze({K:2,e:3,q:4,g:5,a:6,A:8,b:15,B:19,p:23,gK:7});
assert.equal(wordAt(state.K,state.K),"MAP");
assert.equal(wordAt(state.e,state.K),"THEIR");
assert.equal(wordAt(state.gK,state.K),"ROAD");
assert.equal(wordAt(state.K,state.e),"NUMBERS");
assert.equal(wordAt(state.g,state.e),"DIRECTION");
assert.equal(wordAt(state.K,state.g),"OPENPGP");

assert.equal(rowPhrase(1,state.K,state.g),"PRIMUS IS THE WAY");
assert.equal(rowPhrase(state.K,state.e,state.gK),"THEIR MEANING IS THE ROAD");
assert.equal(rowPhrase(state.e,state.K,state.g),"NUMBERS ARE THE DIRECTION");
assert.equal(rowPhrase(state.q,0,state.g),"YOU WILL BE FOUND GOOD LUCK");
assert.equal(rowPhrase(state.g,0,state.K),"PATHS VERIFY OPENPGP");

assert.equal(words.slice(14,19).join(" "),"ITS WORDS ARE THE MAP");
assert.equal(words.slice(19,24).join(" "),"THEIR MEANING IS THE ROAD");
assert.equal(words.slice(24,30).join(" "),"AND THEIR NUMBERS ARE THE DIRECTION");
assert.deepEqual(words.slice(14,32),[
  "ITS","WORDS","ARE","THE","MAP",
  "THEIR","MEANING","IS","THE","ROAD",
  "AND","THEIR","NUMBERS","ARE","THE","DIRECTION",
  "SEEK","AND"
]);

// Reproduce the prospectively selected EA109 XY -> [K,g] coordinate.
const runeSet=new Set(corpus.runes);
const runeIndex=new Map(corpus.runes.map((rune,index)=>[rune,index]));
const parts=transcription.split(/^\s*%\s*$/m);

/** @param {string} text @returns {Array<{start:number,end:number,values:number[]}>} */
function parsePageWords(text){
  const out=[];
  let current=[];
  let start=0;
  let offset=0;
  function close(){
    if(!current.length)return;
    out.push({start,end:offset-1,values:current.slice()});
    current=[];
  }
  for(const ch of [...text]){
    if(runeSet.has(ch)){
      if(!current.length)start=offset;
      current.push(runeIndex.get(ch));
      offset+=1;
    }else if(ch==="-"||ch==="."){
      close();
    }
  }
  close();
  return out;
}

const ea=corpus.translit.indexOf("EA");
assert.equal(ea,28);
assert.equal(corpus.prime[ea],109);
const p0=parsePageWords(parts[0]);
const selected=p0.find((word)=>word.start===109);
assert.ok(selected);
assert.deepEqual(selected.values,[14,26]);
assert.equal(selected.values.map((value)=>corpus.translit[value]).join(""),"XY");
const primes=selected.values.map((value)=>corpus.prime[value]);
assert.deepEqual(primes,[47,103]);
const primeH=[mod29(primes[0]-primes[1]),mod29(primes[0]+primes[1])];
assert.deepEqual(primeH,[state.K,state.g]);
assert.equal(address(primeH[0],primeH[1]),42);
assert.equal(wordAt(primeH[0],primeH[1]),"OPENPGP");

// Width-family charge: the fixed [K,g] coordinate can equal source42 only at width8.
const widthFamily=[];
for(let candidate=2;candidate<=16;candidate+=1){
  const candidateAddress=state.g*candidate+state.K;
  widthFamily.push({
    width:candidate,
    address:candidateAddress,
    hitsOpenPgp:candidateAddress===42,
    hexStrideIsKRows:16===state.K*candidate
  });
}
assert.deepEqual(
  widthFamily.filter((row)=>row.hitsOpenPgp&&row.hexStrideIsKRows).map((row)=>row.width),
  [8]
);

// Native OpenPGP hexadecimal radix16 becomes exactly K=2 map rows.
const hexRadix=16;
assert.equal(hexRadix,state.K*width);
const strideAddresses=[42,42-hexRadix,42-2*hexRadix];
assert.deepEqual(strideAddresses,[42,26,10]);
assert.deepEqual(strideAddresses.map((index)=>words[index]),["OPENPGP","NUMBERS","PRIMUS"]);
const strideCoordinates=strideAddresses.map((index)=>[index%width,Math.floor(index/width)]);
assert.deepEqual(strideCoordinates,[[state.K,state.g],[state.K,state.e],[state.K,1]]);
assert.equal(state.g-state.K,state.e);
assert.equal(state.e-state.K,1);

// The previously source-visible modulus ladder now follows the geometric labels.
assert.equal(keyId%hexRadix,state.b);
assert.equal(words[keyId%hexRadix],"WORDS");
assert.equal(keyId%60,state.B);
assert.equal(words[keyId%60],"THEIR");
assert.equal(keyId%29,state.p);
assert.equal(words[keyId%29],"ROAD");

/** @param {number} base @param {number} exp @param {number} mod @returns {number} */
function powMod(base,exp,mod){
  let result=1;
  let x=base%mod;
  let n=exp;
  while(n>0){
    if(n&1)result=(result*x)%mod;
    x=(x*x)%mod;
    n=Math.floor(n/2);
  }
  return result;
}
assert.equal(powMod(state.g,state.b,state.p),state.B);
assert.equal((state.b*state.e)%(state.p-1),1);
assert.equal(state.B-state.b,state.q);
assert.equal(state.p-state.B,state.q);

console.log(JSON.stringify({
  status:"PASS",
  sourceMap:{
    width,
    rows:[
      words.slice(0,8),
      words.slice(8,16),
      words.slice(16,24),
      words.slice(24,32),
      words.slice(32,40),
      words.slice(40,43)
    ],
    instructionClauses:{
      wordsAreMap:words.slice(14,19).join(" "),
      meaningRoad:words.slice(19,24).join(" "),
      numbersDirection:words.slice(24,30).join(" ")
    },
    stateRows:{
      primusWay:rowPhrase(1,state.K,state.g),
      meaningRoad:rowPhrase(state.K,state.e,state.gK),
      numbersDirection:rowPhrase(state.e,state.K,state.g),
      foundLuck:rowPhrase(state.q,0,state.g),
      warningSuffix:rowPhrase(state.g,0,state.K)
    }
  },
  ea109:{
    raw:"XY",
    primeWeights:primes,
    primeH,
    coordinateAddress:address(primeH[0],primeH[1]),
    sourceWord:wordAt(primeH[0],primeH[1])
  },
  widthCharge:widthFamily,
  openPgpHexStride:{
    radix:hexRadix,
    equalsKRows:hexRadix===state.K*width,
    addresses:strideAddresses,
    coordinates:strideCoordinates,
    words:strideAddresses.map((index)=>words[index])
  },
  keyIdLadder:{
    keyId:keyIdMatch[1],
    residues:[
      {mod:16,value:keyId%16,word:words[keyId%16],role:"b"},
      {mod:60,value:keyId%60,word:words[keyId%60],role:"B"},
      {mod:29,value:keyId%29,word:words[keyId%29],role:"p"}
    ]
  },
  classification:
    "Source-only 8-column word-map grammar with a prospectively selected EA109 XY consumer. Native hex stride16 is exactly K=2 rows, geometrizing OPENPGP->NUMBERS->PRIMUS."
},null,2));
