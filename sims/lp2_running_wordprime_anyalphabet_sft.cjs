"use strict";
/**
 * All-secret previous-word and cumulative-word ciphertext-prime checksum gate.
 * GP29 source words are continuous across page wrap; original nine chapter
 * boundaries reset the public word-clock. No secret key is fitted.
 * SFT: node sims/lp2_running_wordprime_anyalphabet_sft.cjs
 * Node.js 22 CommonJS, no writes or external packages.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {encodeSourceNativeGP}=require("./lp2_native_gp_source_orthography_sft.cjs");
const {minimumWindow}=require("./lp2_running_checksum_anyalphabet_sft.cjs");
const ROOT=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const N=12956,MOD=29,E=gp.translit.indexOf("E"),O=gp.translit.indexOf("O");
const LENGTHS=[729,1145,1729,1903,1021,1433,1680,3008,308];
const cuts=LENGTHS.map((_,i)=>LENGTHS.slice(0,i+1).reduce((s,n)=>s+n,0));
/** @param {number} n */
const mod=n=>(n%MOD+MOD)%MOD;
/** @returns {number[][]} */
function originalWords(){
 const raw=read("resources/liber-primus/lp2-transcription.txt");
 const clean=raw.split("%").slice(0,55).join("%").replace(/[%\r\n/]/g,"");
 const rx=new RegExp("["+gp.runes.join("")+"]+","gu");
 const map=new Map(gp.runes.map((r,i)=>[r,i]));
 const words=(clean.match(rx)||[]).map(w=>[...w].map(r=>map.get(r)));
 assert.equal(words.length,2896);
 assert.deepEqual(words.flat(),gp.pages.filter(p=>p.page<56&&p.indices.length)
   .flatMap(p=>p.indices));
 assert.equal(words.flat().length,N);
 return words;
}
/**
 * Split at original visual chapter boundaries without reinterpreting an
 * already continuous word, rejecting any invented cross-chapter word.
 * @param {number[][]} words
 * @returns {number[][][]}
 */
function nineChapters(words){
 const out=Array.from({length:9},()=>[]);
 let total=0,j=0;
 for(const word of words){
  if(j<8&&total===cuts[j])j++;
  assert.ok(total+word.length<=cuts[j],"word crosses visual heading");
  out[j].push(word);
  total+=word.length;
 }
 assert.equal(total,N);
 assert.deepEqual(out.map(s=>s.flat().length),LENGTHS);
 assert.deepEqual(out.map(s=>s.length),[158,255,383,437,224,326,378,669,66]);
 return out;
}
/**
 * Grant an independent arbitrary GP29 symbol-permutation codebook for every
 * observed state in every independent group. For each state, plaintext E is
 * bounded by the single most frequent ciphertext value, and E+O by the two
 * largest DISTINCT ciphertext-value bins. Both are exact maxima for those
 * isolated statistics when every state may choose its own secret codebook.
 * @param {number[][][]} groups
 * @param {(c:number)=>number} increment
 * @param {"previousWord"|"cumulativeWord"} mode
 */
function capacity(groups,increment,mode){
 let Emax=0,EOmax=0;
 for(const words of groups){
  let state=0,prev=0;
  const hist=Array.from({length:MOD},()=>new Uint16Array(MOD));
  for(const word of words){
   if(mode==="previousWord")state=prev;
   let sum=0;
   for(const c of word){
    hist[state][c]++;
    sum=mod(sum+increment(c));
   }
   prev=sum;
   if(mode==="cumulativeWord")state=mod(state+sum);
  }
  for(const row of hist){
   let a=0,b=0;
   for(const n of row){
    if(n>a){b=a;a=n;}
    else if(n>b)b=n;
   }
   Emax+=a;
   EOmax+=a+b;
  }
 }
 return {E:Emax,EO:EOmax};
}
/**
 * Independently key all nine chapters using a reversible affine plaintext
 * map at each public state. A genuine source-native plaintext plant must
 * be accepted by the blind all-secret occupancy bounds.
 * @param {number[]} plain
 * @param {number[][][]} structure
 * @param {"previousWord"|"cumulativeWord"} mode
 */
function positivePlant(plain,structure,mode){
 const encoded=[],groups=[];
 let pos=0;
 for(let j=0;j<structure.length;j++){
  let state=0,prev=0;
  const words=[];
  for(const shape of structure[j]){
   if(mode==="previousWord")state=prev;
   let wordSum=0;
   const cipherWord=[];
   for(let i=0;i<shape.length;i++){
    const c=mod(11*plain[pos++]+7*state+3*j);
    encoded.push(c);cipherWord.push(c);
    wordSum=mod(wordSum+gp.prime[c]);
   }
   words.push(cipherWord);
   prev=wordSum;
   if(mode==="cumulativeWord")state=mod(state+wordSum);
  }
  groups.push(words);
 }
 assert.equal(pos,N);
 let decoded=[];
 for(let j=0;j<groups.length;j++){
  let state=0,prev=0;
  for(const word of groups[j]){
   if(mode==="previousWord")state=prev;
   let sum=0;
   for(const c of word){
    decoded.push(mod(8*(c-7*state-3*j)));
    sum=mod(sum+gp.prime[c]);
   }
   prev=sum;
   if(mode==="cumulativeWord")state=mod(state+sum);
  }
 }
 assert.deepEqual(decoded,plain);
 const originalE=plain.filter(c=>c===E).length;
 const originalEO=plain.filter(c=>c===E||c===O).length;
 const blind=capacity(groups,c=>gp.prime[c],mode);
 assert.ok(originalE<=blind.E&&originalEO<=blind.EO);
 return {decodedRunes:decoded.length,exact:true,plaintextE:originalE,
   plaintextEO:originalEO,blind};
}
function main(){
 const all=originalWords(),nine=nineChapters(all),result={};
 const clocks={
  gpIndex:c=>c,
  gpPrime:c=>gp.prime[c],
  gpTotient:c=>gp.prime[c]-1
 };
 const expected={
  gpIndex:{previousWord:[[687,1318],[1193,2202]],
    cumulativeWord:[[695,1339],[1187,2194]]},
  gpPrime:{previousWord:[[688,1319],[1207,2206]],
    cumulativeWord:[[671,1292],[1202,2210]]},
  gpTotient:{previousWord:[[696,1330],[1188,2189]],
    cumulativeWord:[[676,1313],[1209,2208]]}
 };
 for(const [name,inc] of Object.entries(clocks)){
  result[name]={};
  for(const mode of ["previousWord","cumulativeWord"]){
   const single=capacity([all],inc,mode);
   const chapters=capacity(nine,inc,mode);
   assert.deepEqual([[single.E,single.EO],[chapters.E,chapters.EO]],
     expected[name][mode]);
   result[name][mode]={wholeBook:single,nineVisualChapters:chapters};
  }
 }
 const controls=[
  ["Gibran","resources/control/gibran_prophet_58585.txt",1416,2548],
  ["Shakespeare","resources/control/shakespeare_first300k.txt",1408,2441],
  ["Emerson","resources/control/emerson_essays_2944.txt",1491,2408]
 ].map(([name,file,e,eo])=>{
  const plain=encodeSourceNativeGP(read(file));
  const minE=minimumWindow(plain,N,c=>c===E);
  const minEO=minimumWindow(plain,N,c=>c===E||c===O);
  assert.deepEqual([minE.count,minEO.count],[e,eo]);
  return {name,nativeRuneCount:plain.length,minE:minE.count,minEO:minEO.count};
 });
 const largestE=Math.max(...Object.values(result)
   .flatMap(o=>Object.values(o).map(x=>x.nineVisualChapters.E)));
 const largestEO=Math.max(...Object.values(result)
   .flatMap(o=>Object.values(o).map(x=>x.nineVisualChapters.EO)));
 assert.deepEqual([largestE,largestEO],[1209,2210]);
 assert.ok(controls.every(x=>x.minE>largestE&&x.minEO>largestEO));
 const native=encodeSourceNativeGP(read(
  "resources/control/gibran_prophet_58585.txt")).slice(0,N);
 const plants={
  previousWord:positivePlant(native,nine,"previousWord"),
  cumulativeWord:positivePlant(native,nine,"cumulativeWord")
 };
 assert.deepEqual([
  plants.previousWord.plaintextE,plants.previousWord.plaintextEO,
  plants.previousWord.blind.E,plants.previousWord.blind.EO,
  plants.cumulativeWord.blind.E,plants.cumulativeWord.blind.EO
 ],[1529,2661,1832,3285,1850,3287]);
 const output={
  original:{runes:N,printedWords:all.length,chapterWordCounts:nine.map(g=>g.length)},
  mechanism:"C=sigma_(visibleChapter,publicPreviousWordOrCumulativeWordChecksum)(P)",
  originalAllSecretBounds:result,sourceNativeControls:controls,
  positivePlants:plants,
  conclusion:"No recovered original plaintext. All independently secret GP29 alphabet tables under the six frozen public word-sum state rules cannot directly produce the three tested English registers."};
 console.log(JSON.stringify(output,null,2));
 return output;
}
if(require.main===module)main();
module.exports={main,originalWords,nineChapters,capacity,positivePlant};
