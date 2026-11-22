"use strict";
/**
 * Source p7 five-trit GP29 ciphertext-feedback alphabet bound.
 * Each of 3^5=243 states has an arbitrary unknown GP29 bijection;
 * state is the last FIVE ciphertext GP ordinal residues mod3.
 * Key-independent maximum count of any one plaintext rune is
 * sum_state max_cipher_count(state,cipherRune).
 * Node22 CommonJS SFT, immutable original sources, no network/writes.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const GP=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const {encodeSourceNativeGP:encode}=
 require("./lp2_native_gp_source_orthography_sft.cjs");
const SOURCE_WORDS=[[23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]];
assert.deepEqual(GP.pages[7].indices.slice(-14),SOURCE_WORDS.flat());
const products=SOURCE_WORDS.map(w=>w.reduce((n,v)=>n*v%29,1));
assert.deepEqual(products,[11,26,8,15,2]);
const INITIAL=products.map(v=>v%3);
assert.deepEqual(INITIAL,[2,2,2,0,2]);
// All nine genuinely solved GP29 source sections jointly instantiate
// a restricted 27-rune plaintext register: EO and OE are absent.
const solved=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const genuineSolved=solved.sections.flatMap(x=>[...x.source_text]
 .filter(g=>GP.runes.includes(g)));
assert.equal(solved.sections.length,9);
assert.equal(genuineSolved.length,2979);
assert.equal(new Set(genuineSolved).size,27);
assert.equal(genuineSolved.filter(g=>g===GP.runes[12]||
  g===GP.runes[22]).length,0);
const chapterBounds=[[8,14],[15,22],[23,26],[27,32],
 [33,39],[40,53],[54,55]];
const byPages=GP.pages.filter(p=>p.page>=8&&p.page<=55&&p.indices.length);
const chapter=chapterBounds.map(([a,b])=>GP.pages.filter(
 p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices));
const page=byPages.map(p=>p.indices);
const all=[chapter.flat()];
assert.equal(all[0].length,11082);
assert.equal(chapter.length,7);
assert.equal(page.length,47);
/** @param {number[]} hist */
function state(hist){
 return ((((hist[0]*3+hist[1])*3+hist[2])*3+hist[3])*3+hist[4]);
}
/**
 * @param {number[][]} groups
 * @param {boolean} skipFirstFive
 * @returns {{n:number,B:number,eq:number,pairs:number}}
 */
function bound(groups,skipFirstFive=false){
 const rows=Array.from({length:243},()=>new Uint16Array(29));
 let n=0;
 for(const part of groups){
  let hist=INITIAL.slice();
  for(let i=0;i<part.length;i++){
   const c=part[i];
   assert(Number.isInteger(c)&&c>=0&&c<29);
   if(!skipFirstFive||i>=5){rows[state(hist)][c]++;n++;}
   hist=[hist[1],hist[2],hist[3],hist[4],c%3];
  }
 }
 let B=0,eq=0,pairs=0;
 for(const row of rows){
  let total=0,max=0;
  for(const c of row){
   total+=c;
   max=Math.max(max,c);
   eq+=c*(c-1)/2;
  }
  B+=max;
  pairs+=total*(total-1)/2;
 }
 return {n,B,eq,pairs};
}
const corpus={continuous:all,chapter,page};
const limits={};
for(const [name,groups] of Object.entries(corpus)){
 const fixed=bound(groups),tail=bound(groups,true);
 const worstInitial=tail.B+5*groups.length;
 const expected={
  continuous:[1136,1136,1141,9087,259210],
  chapter:[1136,1134,1169,9073,258897],
  page:[1126,1115,1350,9018,258488]
 }[name];
 assert.deepEqual([fixed.B,tail.B,worstInitial,fixed.eq,fixed.pairs],expected);
 limits[name]={groups:groups.length,fixedInitial:fixed,
  afterFirst5Each:tail,arbitraryInitialUpper:worstInitial};
}
/**
 * A state-specific GP29 bijection cannot map any <=27-symbol plaintext
 * register to 28 distinct ciphertext symbols in the same state.
 * Remove five seed-dependent positions per group: the remaining states
 * depend ONLY on the preceding five observed source ciphertext glyphs.
 */
function supportAfterIV(groups){
 const rows=Array.from({length:243},()=>new Uint16Array(29));
 for(const part of groups){
  let hist=INITIAL.slice();
  for(let i=0;i<part.length;i++){
   const s=state(hist),c=part[i];
   if(i>=5)rows[s][c]++;
   hist=[hist[1],hist[2],hist[3],hist[4],c%3];
  }
 }
 const sizes=rows.map(r=>r.filter(n=>n>0).length);
 return {
  maxDistinctCipherGlyphsPerState:Math.max(...sizes),
  statesWith28PlusCipherGlyphs:sizes.flatMap((n,i)=>n>=28?[i]:[])
 };
}
const support=Object.fromEntries(Object.entries(corpus).map(([name,groups])=>
  [name,supportAfterIV(groups)]));
for(const s of Object.values(support)){
 assert.equal(s.maxDistinctCipherGlyphsPerState,28);
 assert.deepEqual(s.statesWith28PlusCipherGlyphs,
  [32,33,41,85,96,103,173]);
}

/** Minimum maximum-rune count in independently source-native windows. */
const N=all[0].length;
function nativeWindow(name,file,count,min,max){
 const native=encode(read(file));
 let seen=0,low=Infinity,high=-Infinity,rare=null;
 for(let start=0;start+N<=native.length;start+=Math.floor(N/2)){
  const freq=Array(29).fill(0);
  native.slice(start,start+N).forEach(x=>freq[x]++);
  const top=Math.max(...freq);
  if(top<low){low=top;rare=freq.indexOf(top);}
  high=Math.max(high,top);
  seen++;
 }
 assert.deepEqual([seen,low,high],[count,min,max]);
 return {name,windowCount:seen,minimumTopRune:low,
   maximumTopRune:high,minimumTopRuneOrdinal:rare};
}
const controls=[
 nativeWindow("Gibran","resources/control/gibran_prophet_58585.txt",
   10,1217,1366),
 nativeWindow("Shakespeare","resources/control/shakespeare_first300k.txt",
   38,1234,1435),
 nativeWindow("Emerson","resources/control/emerson_essays_2944.txt",
   56,1285,1473)
];
assert(controls.every(x=>x.minimumTopRune>limits.continuous.arbitraryInitialUpper));
assert(controls.every(x=>x.minimumTopRune>limits.chapter.arbitraryInitialUpper));
assert(controls.every(x=>x.minimumTopRune>limits.page.fixedInitial.B));
/**
 * Majorization extends the top-one alphabet capacity theorem to top-k.
 * For every plaintext subset of k distinct GP symbols, Q[state] maps
 * it to exactly k distinct ciphertext symbols in each state. A
 * plaintext top-k prefix therefore cannot exceed U[k-1] below.
 * Each epoch has its own full secret 243-state codebook.
 * Unknown 5-trit IVs are handled by excluding the first five runes
 * from every epoch and adding five to every upper bound for that epoch.
 */
function majorization(epochs){
 const U=Array(29).fill(0);
 let first=0;
 for(const p of epochs){
  const rows=Array.from({length:243},()=>new Uint16Array(29));
  let h=INITIAL.slice();
  for(let i=0;i<p.length;i++){
   const c=p[i],s=state(h);
   if(i>=5)rows[s][c]++;
   h=[h[1],h[2],h[3],h[4],c%3];
  }
  first+=Math.min(5,p.length);
  for(const row of rows){
   let total=0;
   const ordered=[...row].sort((a,b)=>b-a);
   for(let k=0;k<29;k++){total+=ordered[k];U[k]+=total;}
  }
 }
 return U.map(v=>v+first);
}
const epochCuts={global:[[8,55]],at15:[[8,14],[15,55]],
 at23:[[8,22],[23,55]],at27:[[8,26],[27,55]],
 at33:[[8,32],[33,55]],at40:[[8,39],[40,55]],
 at54:[[8,53],[54,55]]};
const epochParts=(a,b)=>GP.pages.filter(p=>p.page>=a&&p.page<=b)
 .flatMap(p=>p.indices);
const prefixBounds=Object.fromEntries(Object.entries(epochCuts)
 .map(([name,intervals])=>[name,majorization(intervals.map(
 ([a,b])=>epochParts(a,b)))]));
const prefixExpected={
 global:[1141,2072,4328,7094,11075],
 at15:[1403,2506,5136,7913,11081],
 at23:[1481,2628,5256,8303,11082],
 at27:[1478,2647,5328,8299,11082],
 at33:[1474,2647,5377,8350,11082],
 at40:[1475,2645,5308,8343,11082],
 at54:[1316,2304,4548,7251,11078]
};
for(const [name,expected] of Object.entries(prefixExpected)){
 assert.deepEqual([0,1,4,9,26].map(k=>prefixBounds[name][k]),expected);
}
function topK(runes){
 const counts=Array(29).fill(0);
 runes.forEach(x=>counts[x]++);
 let sum=0;
 return counts.sort((a,b)=>b-a).map(x=>sum+=x);
}
const referenceSources=[
 ["Gibran","resources/control/gibran_prophet_58585.txt"],
 ["Shakespeare","resources/control/shakespeare_first300k.txt"],
 ["Emerson","resources/control/emerson_essays_2944.txt"]
];
const referenceMajorization={};
for(const [label,file] of referenceSources){
 const text=encode(read(file));
 let windows=0,fail=Object.fromEntries(
  Object.keys(epochCuts).map(k=>[k,0]));
 for(let start=0;start+N<=text.length;start+=Math.floor(N/2)){
  const freq=topK(text.slice(start,start+N));
  for(const [name,upper] of Object.entries(prefixBounds)){
   if(upper.some((b,k)=>b<freq[k]))fail[name]++;
  }
  windows++;
 }
 referenceMajorization[label]={windows,fail};
}
assert.deepEqual(referenceMajorization,{
 Gibran:{windows:10,fail:{global:10,at15:10,at23:0,at27:0,
  at33:0,at40:0,at54:10}},
 Shakespeare:{windows:38,fail:{global:38,at15:38,at23:0,at27:0,
  at33:0,at40:1,at54:38}},
 Emerson:{windows:56,fail:{global:56,at15:54,at23:0,at27:0,
  at33:0,at40:0,at54:56}}
});

// Positive cipher: all 243 unknown state bijections may be different.
// Use a seeded family of genuine invertible affine GP29 permutations.
const native=encode(read("resources/control/gibran_prophet_58585.txt"))
 .slice(0,N);
function modInv(a){for(let b=1;b<29;b++)if(a*b%29===1)return b;
 throw Error("nonunit");}
function crypto(groups,seed){
 let reconstructed=[],encrypted=[];
 for(const plain of groups){
  let hist=INITIAL.slice(),cipher=[],decoded=[];
  for(const symbol of plain){
   const s=state(hist),a=1+(s*11+seed*7)%28,
    b=(s*s+seed*19+s*seed)%29,c=(a*symbol+b)%29;
   cipher.push(c);
   decoded.push(modInv(a)*(c-b+29)%29);
   hist=[hist[1],hist[2],hist[3],hist[4],c%3];
  }
  assert.deepEqual(decoded,plain);
  encrypted.push(cipher);
  reconstructed.push(...decoded);
 }
 assert.deepEqual(reconstructed,groups.flat());
 const maxNative=Math.max(...Array.from({length:29},(_,i)=>
  reconstructed.filter(x=>x===i).length));
 assert(bound(encrypted).B>=maxNative);
 const trialUpper=majorization(encrypted),truth=topK(reconstructed);
 assert(trialUpper.every((b,k)=>b>=truth[k]));
 return {keySeed:seed,plaintextMostCommonRune:maxNative,
   ciphertextBound:bound(encrypted).B};
}
const geometry=chapter.map(x=>x.length);
function splitNative(){
 let offset=0;
 return geometry.map(n=>{const a=native.slice(offset,offset+n);offset+=n;return a;});
}
const positive=[crypto([native],1),crypto(splitNative(),17),
 crypto(splitNative(),71)];
console.log(JSON.stringify({
 classification:"key-independent conditional exclusion, no recovered original plaintext",
 sourceP7RedProducts:products,sourceTritIV:INITIAL,
 originalRuns:limits,solved27RuneSourceAlphabet:{authenticRunes:genuineSolved.length,used:27,unseenIndices:[12,22]},sevenStateAlphabetObstructions:support,nativeControls:controls,
 positiveNativeCipherPlants:positive,allSecretTopKOriginal:prefixBounds,nativeTopKWindowViolations:referenceMajorization,
 result:"all-secret 243-state feedback alphabet excluded under source-native 27-rune support for continuous, chapter and page reset with any IV; a weaker frequency bound additionally excludes 29-rune English-like prose for continuous and chapter shared keys"
},null,2));
