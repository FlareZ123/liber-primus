#!/usr/bin/env node
"use strict";
/**
 * Original p3-p7 -> p8 source-word hash-chain gate.
 * The 255 complete printed words and adjacent p8's 255 runes are a unique,
 * original-image-recoverable register alignment, but do not by themselves
 * authorize a hash. Test only hashes attested in contemporary Cicada work,
 * with unmodified original GP rune/prime/ordinal data and natural forward
 * digest chaining. These are hypotheses, NOT decryptions.
 *
 * Run: node sims/lp2_scroll255_historical_hashchain_original_sft.cjs
 * Outputs the entire candidate scope and top receivers, no fitted keys.
 */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto"),assert=require("node:assert/strict");
const dir=path.join(__dirname,"..","resources","liber-primus");
const gp=JSON.parse(fs.readFileSync(path.join(dir,"lp2-corpus.json"),"utf8"));
const grid=JSON.parse(fs.readFileSync(path.join(dir,"lp2-grid-256.json"),"utf8"));
const sections=fs.readFileSync(path.join(dir,"lp2-transcription.txt"),"utf8").split("%");
const runeIndex=new Map(gp.runes.map((r,i)=>[r,i]));
const mod=x=>((x%29)+29)%29;
let words=[],word=[];
for(let page=3;page<=7;page++)for(let c of sections[page]){
  if(runeIndex.has(c))word.push(runeIndex.get(c));
  else if((c==="-"||c===".")&&word.length){words.push(word);word=[];}
}
if(word.length)words.push(word);
assert.equal(words.length,255);
assert.deepEqual(words.flat(),gp.pages.slice(3,8).flatMap(p=>p.indices));
const p8=gp.pages[8].indices;
assert.equal(p8.length,255);
const red5=[[23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]];
assert.deepEqual(gp.pages[7].indices.slice(194),red5.flat());
const products=red5.map(w=>w.reduce((a,v)=>mod(a*v),1));
assert.deepEqual(products,[11,26,8,15,2]);
function mul4(a,b){
  let z=0;for(let i=0;i<2;i++){if((b>>>i)&1)z^=a;a<<=1;if(a&4)a^=7;}return z;
}
let state=[products[4]%4,0,0,0],addresses=[];
for(let i=0;i<255;i++){
  addresses.push(state.reduce((a,v)=>a*4+v,0));
  const next=state.reduce((a,v,j)=>a^mul4(v,products[j]%4),0);
  state=[state[1],state[2],state[3],next];
}
assert.equal(new Set(addresses).size,255);
const alphabet=grid.alphabet.replace("f","");
assert.equal(alphabet.length,59);
const tokens=grid.pages.flatMap(p=>p.tokens);
const byte59=tokens.map(t=>59*alphabet.indexOf(t[0])+alphabet.indexOf(t[1]));
const corrected=p8.map((c,i)=>mod(c+byte59[addresses[i]]));
assert.deepEqual([[47,240],[48,231],[235,236],[88,179]].map(([i,j])=>[corrected[i],corrected[j]]),
  [[20,20],[8,8],[2,2],[9,9]]);
const write={
  "rune-UTF8":w=>Buffer.from(w.map(v=>gp.runes[v]).join(""),"utf8"),
  "translit-ASCII":w=>Buffer.from(w.map(v=>gp.translit[v]).join(""),"ascii"),
  "ordinal-bytes":w=>Buffer.from(w),
  "prime-bytes":w=>Buffer.from(w.map(v=>gp.prime[v]))
};
const sha=(name,bytes)=>crypto.createHash(name).update(bytes).digest();
const readDigest={
  "first-byte":buf=>buf[0]%29,
  "last-byte":buf=>buf.at(-1)%29,
  "whole-digest":buf=>{let v=0;for(const byte of buf)v=(v*256+byte)%29;return v;}
};
function ioc(a){
  let counts=Array(29).fill(0);for(const x of a)counts[x]++;
  return counts.reduce((n,x)=>n+x*(x-1),0)/(a.length*(a.length-1));
}
function decode(c,key,sign){return c.map((x,i)=>mod(x+sign*key[i]));}
function sourceChain(algorithm,serializer,seed,mode){
  let previous=seed==="empty"?Buffer.alloc(0):Buffer.from("3301","ascii");
  let register=[];
  for(const w of words){
    const buf=serializer(w);
    let digest;
    if(mode==="prefix")digest=sha(algorithm,Buffer.concat([previous,buf]));
    else if(mode==="suffix")digest=sha(algorithm,Buffer.concat([buf,previous]));
    else if(mode==="cumulative"){
      previous=Buffer.concat([previous,buf]);digest=sha(algorithm,previous);
      register.push(digest);continue;
    }else throw Error("invalid chaining");
    previous=digest;
    register.push(digest);
  }
  return register;
}
let originalResults=[];
for(const [serialization,serialize] of Object.entries(write))
for(const hash of ["sha1","sha256","sha512"])
for(const seed of ["empty","3301"])
for(const chain of ["prefix","suffix","cumulative"]){
  const digests=sourceChain(hash,serialize,seed,chain);
  for(const [output,project] of Object.entries(readDigest)){
    const stream=digests.map(project);
    const hitsSource=p8.reduce((n,v,i)=>n+Number(v===stream[i]),0);
    const hitsCorrected=corrected.reduce((n,v,i)=>n+Number(v===stream[i]),0);
    for(const [receiver,c] of [["literal-p8",p8],["conditional-GF4-p50-radix59",corrected]]){
      const plus=decode(c,stream,1),minus=decode(c,stream,-1);
      const best= Math.max(ioc(plus),ioc(minus));
      const sign= ioc(plus)>=ioc(minus)?1:-1;
      originalResults.push({serialization,hash,seed,chain,output,receiver,
        checksumHits:receiver==="literal-p8"?hitsSource:hitsCorrected,
        bestDecodedIoC:+best.toFixed(8),sign,
        first80GP:decode(c,stream,sign).slice(0,80).map(x=>gp.translit[x]).join("")});
      // Ciphertext/keystream inverse is exact, including all 255 positions.
      const p=decode(c,stream,sign);
      assert.deepEqual(p.map((v,i)=>mod(v-sign*stream[i])),c);
    }
  }
}
assert.equal(originalResults.length,4*3*2*3*3*2);
const byHits=originalResults.slice().sort((a,b)=>b.checksumHits-a.checksumHits);
const byIoc=originalResults.slice().sort((a,b)=>b.bestDecodedIoC-a.bestDecodedIoC);
const bestHit=byHits[0],bestIoC=byIoc[0];
const matched=originalResults.filter(x=>x.checksumHits===255);
const native=gp.pages[57].indices;
assert(ioc(native)>0.06);
console.log(JSON.stringify({
  description:"Historically plausible hash-chained 255-word source register against original p8, without a fitted key",
  original:{sourceWords:255,sourceRunes:1145,receiverRunes:255,
    solvedP57IoC:+ioc(native).toFixed(8)},
  conditionalReceiver:"Retrospectively fitted GF4 / radix59 LFSR, included as separate secondary",
  scope:{serializations:Object.keys(write),hashes:["sha1","sha256","sha512"],
    seeds:["empty","3301"],chains:["prefix","suffix","cumulative"],
    digestReaders:Object.keys(readDigest),receiverModes:2,total:originalResults.length},
  bestChecksum:bestHit,topChecksum:byHits.slice(0,8),
  bestNativeInverse:bestIoC,topNativeInverse:byIoc.slice(0,8),
  exact255WordChecksumModels:matched,
  original251WordKeysInverted:"255/255 source-preserving inverse per tested model",
  result:matched.length||bestIoC.bestDecodedIoC>=0.055
     ?"INVESTIGATE: potential original hit needs independent source confirmation"
     :"NO DIRECT FULL-WORD HASHCHAIN OR NATIVE GP PLAINTEXT IN STATED FINITE FAMILY"
},null,2));
