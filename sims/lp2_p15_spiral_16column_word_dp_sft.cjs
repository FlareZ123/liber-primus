"use strict";
/**
 * Exact 16-column printed-word transposition solver for the original LP2
 * 4×4 Fibonacci-prime spiral p15.  Node 22, CommonJS.
 * Run: node sims/lp2_p15_spiral_16column_word_dp_sft.cjs
 *
 * This tests word order only; it does not decode rune substitutions.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");
const {nativeLengths,rankMatch,stats}=require("./lp2_wordlength_order_grammar_sft.cjs");
const {trainWeights}=require("./lp2_8column_allperm_wordgrammar_sft.cjs");
const N=2896,C=16,R=N/C,K=9,FULL=(1<<C)-1;
const SPIRAL=[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12];
const GRID=[3258,3222,3152,3038,3278,3299,3298,2838,
  3288,3294,3296,2472,4516,1206,708,1820];
const PRIMES=[2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817];
/** @param {number[]} a @returns {Uint8Array} */
function categories(a){return Uint8Array.from(a,x=>Math.min(x,9)-1)}
/** @param {Uint8Array} a @param {Float64Array} w @returns {number} */
function score(a,w){let s=0;for(let i=1;i<a.length;i++)s+=w[a[i-1]*K+a[i]];return s}
/** @param {Uint8Array} source @param {number[]} order @returns {Uint8Array} */
function interleave(source,order){
 const out=new Uint8Array(N);
 for(let r=0;r<R;r++)for(let j=0;j<C;j++)out[r*C+j]=source[order[j]*R+r];
 return out;
}
/** @param {Uint8Array} native @param {number[]} order @returns {Uint8Array} */
function plant(native,order){
 const out=new Uint8Array(N);
 for(let r=0;r<R;r++)for(let j=0;j<C;j++)out[order[j]*R+r]=native[r*C+j];
 return out;
}
/**
 * Exact directed Hamiltonian-path Held–Karp DP with a distinct row-wrap
 * score for the final-to-first column. All 16! orders are represented.
 * @param {Uint8Array} source
 * @param {Float64Array} weights
 * @returns {{score:number,order:number[]}}
 */
function optimize(source,weights){
 assert.equal(source.length,N);
 const edge=new Float64Array(C*C),wrap=new Float64Array(C*C);
 for(let a=0;a<C;a++)for(let b=0;b<C;b++){
   let e=0,w=0;
   for(let r=0;r<R;r++){
     e+=weights[source[a*R+r]*K+source[b*R+r]];
     if(r<R-1)w+=weights[source[a*R+r]*K+source[b*R+r+1]];
   }
   edge[a*C+b]=e;wrap[a*C+b]=w;
 }
 const dp=new Float64Array((1<<C)*C),prev=new Int8Array((1<<C)*C);
 let best=-Infinity,bestOrder=[];
 for(let first=0;first<C;first++){
   dp.fill(-Infinity);dp[(1<<first)*C+first]=0;
   for(let mask=1;mask<=FULL;mask++)if(mask&(1<<first)){
     let ends=mask,unused=FULL&~mask;
     while(ends){
       const lastBit=ends&-ends,last=31-Math.clz32(lastBit);
       const current=dp[mask*C+last];
       if(current>-Infinity){
         let options=unused;
         while(options){
           const bit=options&-options,next=31-Math.clz32(bit),
             addr=(mask|bit)*C+next,
             candidate=current+edge[last*C+next];
           if(candidate>dp[addr]){dp[addr]=candidate;prev[addr]=last}
           options-=bit;
         }
       }
       ends-=lastBit;
     }
   }
   for(let last=0;last<C;last++)if(last!==first){
     const candidate=dp[FULL*C+last]+wrap[last*C+first];
     if(candidate>best){
       const order=new Array(C);let mask=FULL,at=last;
       for(let pos=C-1;pos>0;pos--){
         order[pos]=at;const p=prev[mask*C+at];mask^=1<<at;at=p;
       }
       order[0]=first;bestOrder=order;best=candidate;
     }
   }
 }
 assert.ok(Math.abs(best-score(interleave(source,bestOrder),weights))<1e-8);
 return {score:best,order:bestOrder};
}
/** @param {number} seed @returns {()=>number} */
function prng(seed){let s=seed>>>0;return ()=>{
 s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;
}}
/** @param {Uint8Array} a @param {()=>number} next */
function shuffle(a,next){for(let k=a.length-1;k>0;k--){
 const j=next()%(k+1);[a[k],a[j]]=[a[j],a[k]];
}}
function main(){
 const corpus=parseSharedCorpus();
 assert.equal(corpus.runeCount,12956);assert.equal(corpus.words.length,N);
 assert.equal(corpus.crossPageWords,32);assert.equal(R,181);
 for(let k=0;k<16;k++)assert.equal(GRID[SPIRAL[k]],Math.abs(3301-PRIMES[k]));
 const lengths=corpus.words.map(w=>w.length),nativeTarget=lengths.slice().sort((a,b)=>a-b),
   original=categories(lengths);
 assert.ok(Math.abs(stats(lengths).chi-68.27318638192133)<1e-8);
 const {weights,windows}=trainWeights(lengths);
 assert.equal(windows,19);
 const originalScore=score(original,weights),
   spiralScore=score(interleave(original,SPIRAL),weights),
   reverseScore=score(interleave(original,SPIRAL.slice().reverse()),weights),
   best=optimize(original,weights);
 assert.ok(Number.isFinite(originalScore));
 assert.ok(Number.isFinite(spiralScore));
 assert.ok(Number.isFinite(best.score));
 assert.ok(best.score>=spiralScore&&best.score>=reverseScore);
 const positiveControls={};
 for(const name of ["gibran_prophet_58585.txt","emerson_essays_2944.txt"]){
   const input=nativeLengths(fs.readFileSync(path.join(__dirname,"..","resources","control",name),"utf8"));
   let count=0,stronger=0,minimum=Infinity,maximum=-Infinity;
   for(let i=0;i+N<=input.length;i+=N){
     const clear=categories(rankMatch(input.slice(i,i+N),nativeTarget));
     const cipher=plant(clear,SPIRAL);
     assert.deepEqual(interleave(cipher,SPIRAL),clear);
     const result=optimize(cipher,weights);
     if(result.score>best.score)stronger++;
     minimum=Math.min(minimum,result.score);
     maximum=Math.max(maximum,result.score);count++;
   }
   positiveControls[name]={count,stronger,minimum,maximum};
 }
 const next=prng(0x33011601),shuffled=original.slice(),nullScores=[];
 for(let t=0;t<96;t++){
   shuffle(shuffled,next);
   nullScores.push(optimize(shuffled,weights).score);
 }
 nullScores.sort((a,b)=>a-b);
 const above=nullScores.filter(x=>x>=best.score).length;
 const nullModel={seed:0x33011601,trials:96,above,
   upperTailAddOne:(above+1)/97,median:nullScores[48],q95:nullScores[91]};
 console.log(JSON.stringify({originalWords:N,originalRunes:corpus.runeCount,
   rows:R,columns:C,spiral:SPIRAL,trainingWindows:windows,
   originalScore,spiralScore,reverseScore,best,nullModel,positiveControls},null,2));
}
if(require.main===module)main();
module.exports={optimize,interleave,plant,score};
