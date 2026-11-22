"use strict";
/**
 * Source-original p50 32×8 byte 256-cell as a hypothetical all-secret
 * complete-GP-word-pair endpoint substitution receiver. A 256-phase index,
 * 161 duplicated table token values, 32 row, 8 column, 5/3 bit components
 * each define independent context labels; one entirely arbitrary secret
 * 841-way bijection per context is granted. Equal source endpoint pairs
 * must remain equal in any decrypted GP-native text. This exact invariant
 * tests all possible hidden maps without searching them.
 *
 * All source bytes/tokens are read unchanged. The pairing clock and
 * interpreting p50 values as 29² codebooks remain unselected conjectures.
 * Node.js22 CommonJS; Windows11 read-only one-file SFT.
 */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
/** @param {string} p @returns {string} */
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const lut=new Map(corpus.runes.map((r,i)=>[r,i]));
let glyphCount=0,current=[];
const original=[];
for(const ch of read("resources/liber-primus/lp2-transcription.txt").split("%").slice(0,55).join("").replace(/\/\r?\n/g,"").replace(/[\r\n]/g,"")){
 if(lut.has(ch))current.push(lut.get(ch));
 else if(current.length){original.push(current);glyphCount+=current.length;current=[];}
}
if(current.length){original.push(current);glyphCount+=current.length;}
assert.equal(glyphCount,12956);
assert.equal(original.length,2896);
assert.deepEqual(original.flat(),corpus.pages.slice(0,56).flatMap(p=>p.indices));
const printed=table.pages.flatMap(p=>p.tokens);
assert.equal(table.bytes.length,256);
assert.equal(printed.length,256);
assert.equal(new Set(printed).size,161);
const PAIRS=1448;
const indices=Array.from({length:PAIRS},(_,i)=>2*i);
const kinds=["cell256","token161","high5","low3","row32","column8"];
/** @param {number} p @param {string} kind */
function context(p,kind){
 const at=p%256,byte=table.bytes[at];
 switch(kind){
  case "cell256": return at;
  case "token161": return printed[at];
  case "high5": return Math.floor(byte/8);
  case "low3": return byte%8;
  case "row32": return Math.floor(at/8);
  case "column8": return at%8;
  default: throw Error("unknown frozen context");
 }
}
/** @param {number[][]} words @param {string} kind */
function score(words,kind){
 const groups=new Map();
 let repeats=0;
 for(let i=0;i<PAIRS;i++){
  const ctx=context(i,kind);
  let bins=groups.get(ctx);
  if(!bins){bins=new Uint16Array(841);groups.set(ctx,bins);}
  const a=words[2*i].at(-1),b=words[2*i+1].at(-1);
  const pair=a*29+b;
  repeats+=bins[pair];bins[pair]++;
 }
 return {repeats,contexts:groups.size};
}
const originalScores=Object.fromEntries(kinds.map(k=>[k,score(original,k)]));
assert.deepEqual(kinds.map(k=>originalScores[k].repeats),[3,5,41,158,33,183]);
assert.deepEqual(kinds.map(k=>originalScores[k].contexts),[256,161,32,8,32,8]);
/** @param {number} seed */
function rng(seed){let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};}
const gpLabels=corpus.translit.map((str,value)=>({str,value})).sort((a,b)=>b.str.length-a.str.length);
/** @param {string} word */
function gp(word){
 const v=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
 let out=[];
 for(let i=0;i<v.length;){
  if(v.startsWith("ING",i)){out.push(21);i+=3;}
  else if(v.startsWith("IO",i)){out.push(27);i+=2;}
  else{const z=gpLabels.find(x=>v.startsWith(x.str,i));assert(z);out.push(z.value);i+=z.str.length;}
 }
 return out;
}
const DONORS=[
 {label:"Shakespeare",path:"resources/control/shakespeare_first300k.txt",seed:0x33012562},
 {label:"Gibran",path:"resources/control/gibran_prophet_58585.txt",seed:0x33012563},
 {label:"Emerson",path:"resources/control/emerson_essays_2944.txt",seed:0x33012564}
], COUNT=2000;
const controls=[];
let planted=null;
for(const donor of DONORS){
 const pool=new Map();
 for(const v of read(donor.path).match(/[A-Za-z]+/g)||[]){
  const letters=gp(v),p=pool.get(letters.length)||[];
  p.push(letters);
  pool.set(letters.length,p);
 }
 for(const w of original)assert(pool.get(w.length)?.length);
 const random=rng(donor.seed);
 const entries=kinds.map(kind=>({
  kind,original:originalScores[kind].repeats,
  min:Infinity,max:0,sum:0,atMost:0
 }));
 for(let t=0;t<COUNT;t++){
  const book=original.map(w=>{
   const p=pool.get(w.length);
   return p[random()%p.length];
  });
  if(t===0&&donor.label==="Shakespeare")planted=book.map(w=>[...w]);
  for(const entry of entries){
   const r=score(book,entry.kind).repeats;
   entry.min=Math.min(entry.min,r);
   entry.max=Math.max(entry.max,r);
   entry.sum+=r;
   entry.atMost+=r<=entry.original;
  }
 }
 controls.push({
  donor:donor.label,
  tests:entries.map(({kind,original,min,max,sum,atMost})=>({
   kind,original,min,max,mean:sum/COUNT,atMost,
   samples:COUNT,addOneLowerTail:(atMost+1)/(COUNT+1)
  }))
 });
}
assert(planted);
const plantedReports=[];
for(const kind of ["cell256","token161","high5"]){
 const rand=rng(0x33012578+kinds.indexOf(kind));
 const secrets=new Map(),inverse=new Map();
 for(let i=0;i<PAIRS;i++){
  const label=context(i,kind);
  if(secrets.has(label))continue;
  const a=Array.from({length:841},(_,j)=>j);
  for(let j=840;j>0;j--){const n=rand()%(j+1);[a[n],a[j]]=[a[j],a[n]];}
  const back=Array(841);
  for(let j=0;j<841;j++)back[a[j]]=j;
  secrets.set(label,a);inverse.set(label,back);
 }
 /** @param {number[][]} input @param {Map<any,number[]>} lookup */
 function apply(input,lookup){
  const out=input.map(w=>[...w]);
  for(let i=0;i<PAIRS;i++){
   const code=lookup.get(context(i,kind));
   assert(code);
   const k=29*out[2*i].at(-1)+out[2*i+1].at(-1),v=code[k];
   out[2*i][out[2*i].length-1]=Math.floor(v/29);
   out[2*i+1][out[2*i+1].length-1]=v%29;
  }
  return out;
 }
 const ciphertext=apply(planted,secrets);
 const decoded=apply(ciphertext,inverse);
 assert.deepEqual(decoded,planted);
 assert.deepEqual(score(ciphertext,kind),score(planted,kind));
 plantedReports.push({kind,independentSecret841WayPermutations:secrets.size,
  trueGPsourceSymbols:decoded.flat().length,
  plaintextEqualities:score(planted,kind).repeats,
  ciphertextEqualities:score(ciphertext,kind).repeats,
  exactTrueGPRecovered:decoded.flat().length});
}
console.log(JSON.stringify({
 premise:"2014 original p50 32×8=256-cell token matrix as a hypothetical 2-complete-word-pair cipher-map clock",
 source:"Full unchanged 2,896 printed GP29 words and all 12,956 p0-p55 runes; p50 tokens and bytes unchanged",
 originalSourceScores:originalScores,
 exactOriginalLengthNativeGPDonorControls:controls,
 actualFullNativeGPAllSecretPlantedInverses:plantedReports,
 scope:"Any static unknown bijection of paired word-terminal 29×29 symbols for each source-selected p50 phase/token/row/column or cell byte 5/3 bit class. Genuine inferred 256-phase wordpair clock and two-terminal-digit channel are NOT source-selected. A per-pair changing state or high-to-low diffusion evades the equality theorem. No decrypted LP2."
},null,2));
