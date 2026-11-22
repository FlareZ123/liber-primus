"use strict";
/**
 * All 29^2 coefficient keys for one source-motivated but unauthenticated
 * adjacent COMPLETE GP29 word-number two-shear cipher:
 *   C1=(P1+a*P2) mod(29^n1)
 *   C2=(P2+b*C1) mod(29^n2)
 * Thus P2=(C2-b*C1) mod(29^n2), P1=(C1-a*P2) mod(29^n1).
 *
 * The p0 first two original red words anchor word pairing; all 32 genuine
 * cross-page words are kept whole. Both coefficients are globally constant;
 * this grants ALL 841 keys, more than the p7 first-two-product proposal.
 * Source: signed 2013 BASE29 integer + signed 2016 word numbers/direction.
 * This does not claim that Cicada selected these two shears.
 * Windows 11 / Node 22 / CommonJS. Pure read-only SFT.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} p */
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const physical = read("resources/liber-primus/lp2-transcription.txt").split("%");
const runeIds = new Map(corpus.runes.map((v, i) => [v, i]));
/** @param {string} s @returns {{start:number,codes:number[]}[]} */
function readWords(s) {
  const clean = s.replace(/\/\r?\n/g, "").replace(/[\r\n%]/g, "");
  let offset = 0, current = [];
  const out = [];
  for (const ch of clean) {
    if (runeIds.has(ch)) {
      current.push(runeIds.get(ch));
    } else if (current.length) {
      out.push({start:offset,codes:current});
      offset += current.length;
      current = [];
    }
  }
  if (current.length) out.push({start:offset,codes:current});
  return out;
}
const sourceWords = readWords(physical.slice(0,55).join(""));
const originalTape = corpus.pages.slice(0,56).flatMap(p => p.indices);
assert.equal(sourceWords.length,2896);
assert.equal(originalTape.length,12956);
assert.deepEqual(sourceWords.flatMap(w=>w.codes),originalTape);
const pstarts = [];
let pos=0;
for(const page of corpus.pages){pstarts.push(pos);pos+=page.indices.length;}
const windows = [
  {page:16,offset:pstarts[16],count:300},
  {page:40,offset:pstarts[40],count:200}
];
for(const w of windows) assert(w.offset+w.count<=originalTape.length);
const powers = Array.from({length:15},(_,i)=>29n**BigInt(i));
/** @param {number[]} a @returns {bigint} */
function asInt(a){let n=0n;for(const x of a)n=n*29n+BigInt(x);return n;}
/** @param {bigint} x @param {number} len @returns {number[]} */
function asWord(x,len){
  const out=Array(len);
  for(let i=len-1;i>=0;i--){out[i]=Number(x%29n);x/=29n;}
  assert.equal(x,0n);
  return out;
}
/** @param {bigint} n @param {bigint} m @returns {bigint} */
function rem(n,m){return (n%m+m)%m;}
const pairs=[];
for(let i=0;i<sourceWords.length;i+=2){
  const left=sourceWords[i].codes,right=sourceWords[i+1]?.codes;
  if(!right){pairs.push({i,last:left});continue;}
  pairs.push({i,x:asInt(left),y:asInt(right),n1:left.length,n2:right.length,m1:powers[left.length],m2:powers[right.length]});
}
/** @param {number} a @param {number} b @param {any[]} sourcePairs @returns {number[][]} */
function decode(a,b,sourcePairs=pairs){
  const out=[];
  const k=BigInt(a),q=BigInt(b);
  for(const p of sourcePairs){
    if(p.last){out.push([...p.last]);continue;}
    const y=rem(p.y-q*p.x,p.m2);
    const x=rem(p.x-k*y,p.m1);
    out.push(asWord(x,p.n1),asWord(y,p.n2));
  }
  return out;
}
/** @param {number[][]} input @param {number} a @param {number} b @returns {number[][]} */
function encode(input,a,b){
  const out=[];
  const k=BigInt(a),q=BigInt(b);
  for(let i=0;i<input.length;i+=2){
    if(!input[i+1]){out.push([...input[i]]);break;}
    const L=input[i],R=input[i+1];
    const x=rem(asInt(L)+k*asInt(R),powers[L.length]);
    const y=rem(asInt(R)+q*x,powers[R.length]);
    out.push(asWord(x,L.length),asWord(y,R.length));
  }
  return out;
}
/** @param {number[]} glyphs @returns {number} */
function ioc(glyphs){
  const counts=Array(29).fill(0);
  for(const x of glyphs)counts[x]++;
  return counts.reduce((s,n)=>s+n*(n-1),0)/(glyphs.length*(glyphs.length-1));
}
const lex = new Set();
const tokens = corpus.translit.map((str,value)=>({str,value})).sort((a,b)=>b.str.length-a.str.length);
/** @param {string} w @returns {number[]} */
function native(w){
  const s=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const result=[];
  for(let i=0;i<s.length;){
    if(s.startsWith("ING",i)){result.push(21);i+=3;}
    else if(s.startsWith("IO",i)){result.push(27);i+=2;}
    else{const item=tokens.find(t=>s.startsWith(t.str,i));assert(item);result.push(item.value);i+=item.str.length;}
  }
  return result;
}
const pools=new Map();
for(const w of read("resources/control/shakespeare_first300k.txt").match(/[A-Za-z]+/g)||[]){
  const g=native(w);const key=g.join(",");
  lex.add(key);
  let p=pools.get(g.length);
  if(!p){p=[];pools.set(g.length,p);}
  p.push(g);
}
let randState=0x33012665;
/** @returns {number} */
function nextRandom(){
  randState^=randState<<13;
  randState^=randState>>>17;
  randState^=randState<<5;
  return randState>>>0;
}
const nativePlant=sourceWords.map(w=>{
  const options=pools.get(w.codes.length);
  assert(options&&options.length,"native control every actual source length");
  return options[nextRandom()%options.length];
});
const [SOURCE_A,SOURCE_B]=[11,26];
const plantCipher=encode(nativePlant,SOURCE_A,SOURCE_B);
const plantPairs=[];
for(let i=0;i<plantCipher.length;i+=2){
  const l=plantCipher[i],r=plantCipher[i+1];
  if(!r){plantPairs.push({i,last:l});continue;}
  plantPairs.push({i,x:asInt(l),y:asInt(r),n1:l.length,n2:r.length,m1:powers[l.length],m2:powers[r.length]});
}
assert.deepEqual(decode(SOURCE_A,SOURCE_B,plantPairs),nativePlant);
const solved=readWords(physical[56]).map(w=>w.codes);
assert.deepEqual(solved.flat(),corpus.pages[57].indices);
assert.deepEqual(decode(SOURCE_A,SOURCE_B,Array.from({length:solved.length/2},(_,i)=>{
  const x=encode(solved.slice(2*i,2*i+2),SOURCE_A,SOURCE_B);
  return {i:2*i,x:asInt(x[0]),y:asInt(x[1]),n1:x[0].length,n2:x[1].length,m1:powers[x[0].length],m2:powers[x[1].length]};
})),solved);
assert.deepEqual(encode(sourceWords.map(w=>w.codes),0,0),sourceWords.map(w=>w.codes));

/**
 * @param {number[][]} plain
 * @returns {{ioc:number,wordHits:number,wordSlots:number,first:string}[]}
 */
function stats(plain){
  const tape=plain.flat();
  const out=[];
  for(const w of windows){
    const used=sourceWords.map((src,i)=>({src,i}))
      .filter(row=>row.src.start>=w.offset && row.src.start+row.src.codes.length<=w.offset+w.count && row.src.codes.length>=4);
    out.push({
      ioc:ioc(tape.slice(w.offset,w.offset+w.count)),
      wordHits:used.filter(row=>lex.has(plain[row.i].join(","))).length,
      wordSlots:used.length,
      first:tape.slice(w.offset,w.offset+26).map(g=>corpus.translit[g]).join(".")
    });
  }
  return out;
}
const rawStats=stats(sourceWords.map(w=>w.codes));
const plantStats=stats(nativePlant);
const fixedStats=stats(decode(SOURCE_A,SOURCE_B));
const ranks=[];
const summary={
  keys:0,bothIocAtLeast050:0,bothIocAtLeast045:0,
  maxJointIoc:0,maxJointWordHits:0,maxFirstIoc:0,maxSecondIoc:0,
  maxFirstHits:0,maxSecondHits:0,
  bestJointIoc:null,bestJointHits:null
};
for(let a=0;a<29;a++)for(let b=0;b<29;b++){
  const v=stats(decode(a,b));summary.keys++;
  const minIoc=Math.min(v[0].ioc,v[1].ioc);
  const bothHits=v[0].wordHits+v[1].wordHits;
  summary.bothIocAtLeast050+=(minIoc>=0.05);
  summary.bothIocAtLeast045+=(minIoc>=0.045);
  if(minIoc>summary.maxJointIoc){summary.maxJointIoc=minIoc;summary.bestJointIoc={a,b,stats:v};}
  if(bothHits>summary.maxJointWordHits){summary.maxJointWordHits=bothHits;summary.bestJointHits={a,b,stats:v};}
  summary.maxFirstIoc=Math.max(summary.maxFirstIoc,v[0].ioc);
  summary.maxSecondIoc=Math.max(summary.maxSecondIoc,v[1].ioc);
  summary.maxFirstHits=Math.max(summary.maxFirstHits,v[0].wordHits);
  summary.maxSecondHits=Math.max(summary.maxSecondHits,v[1].wordHits);
}
assert.equal(summary.keys,841);
assert.equal(plantStats[0].wordHits,plantStats[0].wordSlots);
assert.equal(plantStats[1].wordHits,plantStats[1].wordSlots);
console.log(JSON.stringify({
  premise:"All 841 arbitrarily unknown constant coefficient pairs in a two-word mixed-radix 2013 BASE29 shearing cipher",
  originalScope:"2,896 intact printed words, 32 whole page-crossing words, 12,956 GP29 runes",
  sourceKey:[SOURCE_A,SOURCE_B],
  windows,
  originalCipherStats:rawStats,
  actualOriginalWithSourceKey:fixedStats,
  nativeSolvedTextGenuineShakespeare_LengthMatchedPositive:plantStats,
  all841OriginalKeyResults:summary,
  plantedSourceKeyRecoverOriginalNative12956:true,
  solvedP57NaturalWords95_Roundtrip:true,
  wrongKeysNotRepresentedAsPlaintxt:true,
  conclusion:"If source-native control register requires two heldout 0.05 IoC windows and many original-length lexical words, no original key within this precise two-shear family produces the required genuine plaintext. Not a universal claim about mixed-radix Feistel designs."
},null,2));
