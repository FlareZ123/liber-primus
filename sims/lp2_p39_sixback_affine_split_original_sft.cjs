'use strict';

/**
 * Source p39 repeated-root and the original full-corpus word-local six-back
 * affine winner. Freezes T(x) = 24 - 2x (mod29) from G(x)=15(x-24)^2, and
 * independently ranks all 812 invertible affine maps in the disjoint
 * original first/second halves. Tests 3,000 original-word-multiset-preserving
 * shuffles. No claim that the author specified the lag or affine opcode.
 *
 * Run: node sims/lp2_p39_sixback_affine_split_original_sft.cjs
 * Read-only, Node22/CommonJS, no network or external packages.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} p */
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const symbols=new Map(corpus.runes.map((r,i)=>[r,i]));
const rx=new RegExp('['+corpus.runes.join('')+']+','gu');
const transcription=read('resources/lp2-transcription.txt');
const words=(transcription.split('%').slice(0,55).join('%')
 .replace(/\/\r?\n/g,'').replace(/[\r\n%]/g,'').match(rx)||[])
 .map(w=>Array.from(w,r=>symbols.get(r)));
assert.equal(words.length,2896);
assert.equal(words.reduce((s,w)=>s+w.length,0),12956);
const red39=ink.pages.find(p=>p.page===39).red_spans;
assert.deepEqual(red39.map(x=>x.runes),['ᛡᚳᛋ']);
const redIndices=Array.from(red39[0].runes,r=>symbols.get(r));
assert.deepEqual(redIndices,[27,5,15]);
const MOD=29,mod=n=>(n%MOD+MOD)%MOD;
const G=[15,5,27];
assert.equal(mod(G[0]*24*24+G[1]*24+G[2]),0);
assert.equal(mod(2*G[0]*24+G[1]),0);
assert.equal(mod(G[0]*2),1);
const map=x=>mod(24-2*x);
assert.equal(map(8),8);
for(let x=0;x<29;x++){
 let p=x,period=0;
 do{p=map(p);period++}while(p!==x&&period<100);
 assert.equal(period,x===8?1:28);
}
const offsets=[];
let total=0;
for(const word of words){offsets.push(total);total+=word.length}
assert.equal(total,12956);
const SPLIT=6478,lag=6,K=812;
const multiplies=Array.from({length:29},(_,x)=>
 Array.from({length:28},(_,a)=>((a+1)*x)%29));
const FIXED=(27-1)*29+24;
/** @param {Uint16Array} counts */
function top(counts){
 let max=-1,index=-1,ties=0;
 for(let i=0;i<counts.length;i++){
  if(counts[i]>max){max=counts[i];index=i;ties=1}
  else if(counts[i]===max)ties++;
 }
 return {max,index,ties,a:Math.floor(index/29)+1,b:index%29};
}
/** @param {number[][]} source */
function measure(source){
 const halves=[new Uint16Array(K),new Uint16Array(K)];
 let pairs=[0,0],p0={pairs:0,hits:0},terminal={pairs:0,hits:0},adjacentHits=0;
 const eventGlyphs=[];
 for(let wi=0;wi<source.length;wi++){
  const word=source[wi],start=offsets[wi];
  let lastHit=false;
  for(let i=lag;i<word.length;i++){
   const position=start+i;
   const half=Number(position>=SPLIT);
   const x=word[i-lag],y=word[i],mul=multiplies[x],counts=halves[half];
   pairs[half]++;
   for(let a=0;a<28;a++)counts[a*MOD+mod(y-mul[a])]++;
   const fixedHit=y===map(x);
   if(fixedHit){eventGlyphs.push(corpus.translit[y]);if(lastHit)adjacentHits++}
   lastHit=fixedHit;
   if(position<corpus.pages[0].runic_count){
    p0.pairs++; if(fixedHit)p0.hits++;
   }
   if(position>=12956-corpus.pages[54].runic_count-corpus.pages[55].runic_count){
    terminal.pairs++;if(fixedHit)terminal.hits++;
   }
  }
 }
 return {pairs,first:top(halves[0]),second:top(halves[1]),
  fixed:[halves[0][FIXED],halves[1][FIXED]],p0,terminal,
  adjacentHits,hitReadout:eventGlyphs.join('')};
}
const original=measure(words);
assert.deepEqual(original.pairs,[644,646]);
assert.deepEqual(original.fixed,[40,40]);
assert.deepEqual([original.first.index,original.second.index],[FIXED,FIXED]);
assert.deepEqual([original.first.ties,original.second.ties],[1,1]);
assert.deepEqual(original.p0,{pairs:26,hits:4});
assert.deepEqual(original.terminal,{pairs:35,hits:0});
assert.equal(original.adjacentHits,3);
const planted=[0,1,2,3,4,5].concat([0,1,2,3,4,5].map(map));
const plantPairs=Array.from({length:6},(_,i)=>[planted[i],planted[i+6]]);
assert(plantPairs.every(([x,y])=>y===map(x)));
const scored=Array.from({length:812},(_,k)=>({
 key:k,hits:plantPairs.filter(([x,y])=>mod((Math.floor(k/29)+1)*x+k%29)===y).length
}));
assert.equal(scored.filter(s=>s.hits===6).length,1);
assert.equal(scored.find(s=>s.hits===6).key,FIXED);
let seed=0x14530018;
/** @returns {number} */
function rng(){
 seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
 return (seed>>>0)/4294967296;
}
const N=3000;
let repeated=0,bothFixedTop=0,both40=0,fixed80=0;
const highest=[0,0],nullExamples=[];
for(let t=0;t<N;t++){
 const shuffled=words.map(word=>{
  const w=word.slice();
  for(let i=w.length-1;i>0;i--){
   const j=Math.floor(rng()*(i+1));
   [w[i],w[j]]=[w[j],w[i]];
  }
  return w;
 });
 const s=measure(shuffled);
 if(s.first.index===s.second.index)repeated++;
 if(s.first.index===FIXED&&s.second.index===FIXED)bothFixedTop++;
 if(s.fixed[0]>=40&&s.fixed[1]>=40)both40++;
 if(s.fixed[0]+s.fixed[1]>=80)fixed80++;
 highest[0]=Math.max(highest[0],s.first.max);
 highest[1]=Math.max(highest[1],s.second.max);
 if(t<3)nullExamples.push({
  first:{a:s.first.a,b:s.first.b,max:s.first.max},
  second:{a:s.second.a,b:s.second.b,max:s.second.max},
  fixed:s.fixed,
 });
}
assert.equal(repeated,4);
assert.equal(bothFixedTop,0);
assert.equal(both40,0);
assert.equal(fixed80,0);

/**
 * Independent plaintext-directed receiver after freezing T6:
 * full-stream ciphertext feedback P_i=C_i ± T(C_(i-6)), first six
 * runes in the clear. This is a complete reversible model, in contrast
 * to recognizing only the 80 original six-back matches.
 */
const allCipher=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
assert.equal(allCipher.length,12956);
const lexicon=new Map(corpus.translit.map((str,index)=>[str,index]));
/** @param {string} text */
function nativeGP(text){
 const result=[];
 for(let word of text.toUpperCase().match(/[A-Z]+/g)||[]){
  word=word.replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/K/g,'C').replace(/Z/g,'S');
  for(let i=0;i<word.length;){
   let symbol,span=0;
   for(const width of [3,2,1]){
    const v=lexicon.get(word.slice(i,i+width));
    if(v!==undefined){symbol=v;span=width;break}
   }
   if(symbol!==undefined)result.push(symbol);
   i+=span||1;
  }
 }
 return result;
}
const shakespeare=nativeGP(read('resources/control/shakespeare_first300k.txt'));
const trainEnd=Math.floor(shakespeare.length*.75);
const c3=new Float64Array(MOD*MOD*MOD).fill(.1);
const c2=new Float64Array(MOD*MOD).fill(2.9);
for(let i=2;i<trainEnd;i++){
 const code=(shakespeare[i-2]*MOD+shakespeare[i-1])*MOD+shakespeare[i];
 c3[code]++;c2[Math.floor(code/MOD)]++;
}
/** @param {number[]} a */
function nativeScore(a){
 let score=0;
 for(let i=2;i<a.length;i++){
  const k=(a[i-2]*MOD+a[i-1])*MOD+a[i];
  score+=Math.log(c3[k]/c2[Math.floor(k/MOD)]);
 }
 return score/(a.length-2);
}
/** @param {number[]} a */
function nativeIoC(a){
 const hist=Array(MOD).fill(0);
 for(const symbol of a)hist[symbol]++;
 return hist.reduce((sum,v)=>sum+v*(v-1),0)/(a.length*(a.length-1));
}
const heldout=[];
for(let i=trainEnd;i+400<=shakespeare.length;i+=400)
 heldout.push(nativeScore(shakespeare.slice(i,i+400)));
assert(heldout.length>=100);
const nativePlant=Array.from({length:allCipher.length},(_,i)=>
 corpus.pages[57].indices[i%corpus.pages[57].indices.length]);
const feedback=[];
for(const sign of [-1,1]){
 const inverse=allCipher.map((c,i)=>
  i<6?c:mod(c+sign*map(allCipher[i-6])));
 const synthesized=nativePlant.slice(0,6);
 for(let i=6;i<nativePlant.length;i++)
  synthesized.push(mod(nativePlant[i]-sign*map(synthesized[i-6])));
 assert.deepEqual(synthesized.map((c,i)=>
  i<6?c:mod(c+sign*map(synthesized[i-6]))),nativePlant);
 const score=nativeScore(inverse);
 feedback.push({sign,score,IoC:nativeIoC(inverse),
  p0First160:inverse.slice(0,160).map(i=>corpus.translit[i]).join(''),
  originalSymbolsReconstructed:inverse.length,plantedSymbolsRecovered:nativePlant.length});
}
const nativeFeedback={
 original:feedback,
 heldoutMin400:Math.min(...heldout),
 heldoutMax400:Math.max(...heldout),
 heldoutWindows:heldout.length,
 scoreMeasure:'mean interpolated native GP29 trigram log probability',
 directGlobalCiphertextFeedbackRecoverPlaintext:false,
};
assert(feedback.every(x=>x.score<nativeFeedback.heldoutMin400));

console.log(JSON.stringify({
 source:{
  p39RedIndices:redIndices,GHighFirst:G,root:24,doubleRoot:true,
  reciprocalLeading:2,candidateAffine:[27,24],
  originalPageLengths:corpus.pages.slice(0,56).map(p=>p.runic_count),
  originalWords:words.length,totalRunes:12956,
  sourceChosenSixBackOpcode:false,
 },
 original:{
  firstHalf:{pairs:original.pairs[0],...original.first},
  secondHalf:{pairs:original.pairs[1],...original.second},
  fixedT6Hits:original.fixed,totalHits:80,
  independentP0:original.p0,terminalP54P55:original.terminal,
  contiguousTwoHitEvents:original.adjacentHits,
  extractedEventGP:original.hitReadout,
 },
 controls:{
  seed:0x14530018,wordInternalMultisetsPreserved:true,iterations:N,
  anyIdenticalWinner:repeated,bothFixedTop,bothFixed40:both40,
  fixedTotal80:fixed80,highestNullHalfMax:highest,
  firstThree:nullExamples,
  syntheticSixbackPlant:true,
  nativeFeedback,
 },
 interpretation:'Unusual stable six-back affine correspondence, not a plaintext or authenticated creator-selected reversible cipher'
},null,2));
