'use strict';
/**
 * Detect adjacent and lagged word-length dependence in Liber Primus.
 * Preserves the word break conventions of the community-canonical master.
 * No external dependencies; all sampling is deterministic. CommonJS.
 * @module wordlength_order_test
 */
const {runeWords, parseMaster, englishWords, runeLength} = require('./wordlength_crib_scan');

/** @param {number} n Rune word length. @returns {number} 0 for 1-2, 1 for 3-5, 2 for >=6. */
function category(n) {return n<=2?0:n<=5?1:2;}

/** @param {number[]} lengths @param {number} lag @param {number} [start] @param {number} [window] @returns {number[][]} Three-by-three transition contingency table. */
function lengthTransitions(lengths,lag=1,start=0,window=lengths.length-start){
  if(!Number.isInteger(lag)||lag<1||lag>=window)throw new RangeError('lag must satisfy 1 <= lag < window');
  const m=[[0,0,0],[0,0,0],[0,0,0]];
  for(let i=start;i<start+window-lag;i++)m[category(lengths[i])][category(lengths[i+lag])]++;
  return m;
}

/** @param {number[][]} matrix Contingency table. @returns {{pairs:number,chi2:number,pApprox:number,matrix:number[][]}} Pearson independence test, four degrees of freedom. */
function pearsonIndependence(matrix){
  const row=matrix.map(r=>r.reduce((a,b)=>a+b,0));
  const col=[0,1,2].map(j=>matrix.reduce((sum,r)=>sum+r[j],0));
  const n=row.reduce((a,b)=>a+b,0);
  let chi2=0;
  for(let i=0;i<3;i++)for(let j=0;j<3;j++){
    const expected=row[i]*col[j]/n;
    if(expected>0)chi2+=(matrix[i][j]-expected)**2/expected;
  }
  return{pairs:n,chi2,pApprox:Math.exp(-chi2/2)*(1+chi2/2),matrix};
}

/** @param {number[]} lengths @param {number} [lag] @param {number} [start] @param {number} [window] */
function lengthIndependence(lengths,lag=1,start=0,window=lengths.length-start){
  return pearsonIndependence(lengthTransitions(lengths,lag,start,window));
}

/** @param {number[]} lengths @param {number} [lagMaximum] @returns {{lag:number,chi2:number}[]} */
function scanWordLags(lengths,lagMaximum=128){
  return Array.from({length:lagMaximum},(_,k)=>({lag:k+1,chi2:lengthIndependence(lengths,k+1).chi2}));
}

/** @param {number[]} lengths @param {number} seed @returns {number[]} Deterministic, in-memory shuffle. */
function shuffled(lengths,seed){
  const out=lengths.slice();let x=seed>>>0;
  for(let i=out.length-1;i>0;i--){
    x^=x<<13;x^=x>>>17;x^=x<<5;x>>>=0;
    const j=x%(i+1),tmp=out[i];out[i]=out[j];out[j]=tmp;
  }
  return out;
}

/** @param {number[]} lengths @param {number} [lagMaximum] @param {number} [repetitions] */
function lagFamilyNull(lengths,lagMaximum=128,repetitions=300){
  const observed=scanWordLags(lengths,lagMaximum);
  const best=observed.reduce((a,b)=>b.chi2>a.chi2?b:a);
  let nullExceed=0,minNull=Infinity,maxNull=-Infinity;
  const nullMax=[];
  for(let i=1;i<=repetitions;i++){
    const s=shuffled(lengths,(i*2654435761)>>>0);
    const q=scanWordLags(s,lagMaximum).reduce((a,b)=>Math.max(a,b.chi2),-Infinity);
    nullMax.push(q);if(q>=best.chi2)nullExceed++;
    minNull=Math.min(minNull,q);maxNull=Math.max(maxNull,q);
  }
  nullMax.sort((a,b)=>a-b);
  return{best,firstLags:observed.slice(0,3),nullExceed,repetitions,
    familywiseUpperTail:(nullExceed+1)/(repetitions+1),
    nullMin:minNull,nullMedian:nullMax[Math.floor((repetitions-1)/2)],nullMax:maxNull};
}

/** @param {string} master Full canonical master. @returns {{lp1:number[],lp2:number[],sections:number[][]}} */
function parseLengthCorpus(master){
  const corpus=parseMaster(master), lp2=corpus.cipherLengths;
  const first=master.indexOf('ᚱ-ᛝᚱᚪᛗᚹ');
  const lp2Start=master.indexOf('ᛋᚻᛖᚩᚷᛗᛡᚠ');
  if(first<0||lp2Start<first)throw new Error('Expected LP1 and LP2 incipits');
  const lp1=runeWords(master.slice(first,lp2Start)).map(w=>w.length);
  const sections=corpus.pages.slice(0,56).join('%').split('$').map(x=>runeWords(x).map(w=>w.length)).filter(w=>w.length);
  return{lp1,lp2,sections};
}

/** @param {string} text Project Gutenberg UTF-8 source text. @returns {number[]} */
function englishRuneLengths(text){return englishWords(text).map(runeLength);}

/** @param {number[]} lengths @param {number} window @param {number} [repetitions] */
function englishWindows(lengths,window,repetitions=300){
  if(window>lengths.length)throw new RangeError('Reference shorter than target window');
  let x=0x12345678,min=Infinity,max=-Infinity,lessThanTarget=0;
  const values=[];
  for(let i=0;i<repetitions;i++){
    x^=x<<13;x^=x>>>17;x^=x<<5;x>>>=0;
    const begin=x%(lengths.length-window+1);
    const q=lengthIndependence(lengths,1,begin,window).chi2;
    values.push(q);min=Math.min(min,q);max=Math.max(max,q);
  }
  values.sort((a,b)=>a-b);
  return{samples:repetitions,min,median:values[Math.floor((repetitions-1)/2)],max};
}

module.exports={category,lengthTransitions,pearsonIndependence,lengthIndependence,
  scanWordLags,shuffled,lagFamilyNull,parseLengthCorpus,englishRuneLengths,englishWindows};
