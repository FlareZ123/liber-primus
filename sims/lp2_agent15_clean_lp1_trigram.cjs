'use strict';

/**
 * LP1 GP29 trigram calibration using the historically supported source-only
 * reference selection (corrected Critic 17 Nov). No editorial duplicated pages.
 * Sections 1,3,5,6,9..16 are reference sections, not asserted physical pages.
 */
const assert=require('node:assert/strict');

/**
 * @param {{translit:string[],runes:string[]}} corpus
 * @param {string} referenceText
 * @returns {{training:number[],trainingSegments:number[][],scoreStream:(a:number[])=>{mean:number,ngrams:number},spell:(a:number[])=>string,sourceRunes:number,sections:number}}
 */
function buildCleanNativeTrigram({corpus,referenceText}){
 const alphabet=corpus.translit.map((s,i)=>({s,i}))
   .sort((a,b)=>b.s.length-a.s.length);
 /** @param {string} text @returns {number[]} */
 function encode(text){
  const source=text.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const result=[];
  for(const word of source.match(/[A-Z]+/g)||[]){
   for(let i=0;i<word.length;){
    if(word.startsWith('ING',i)){result.push(21);i+=3;}
    else if(word.startsWith('IO',i)){result.push(27);i+=2;}
    else{
     const t=alphabet.find(x=>word.startsWith(x.s,i));
     assert(t,'Unmapped LP1 reference word: '+word);
     result.push(t.i);i+=t.s.length;
    }
   }
  }
  return result;
 }
 assert.deepEqual(encode('FUNCTION'),[0,1,9,5,16,27,9]);
 assert.deepEqual(encode('DECEPTION'),[23,18,5,18,13,16,27,9]);
 const chunks=[...referenceText.matchAll(/^###\s+(\d+)\s*$/gm)];
 const selected=chunks.map((match,index)=>{
  const begin=match.index+match[0].length;
  const end=index+1<chunks.length?chunks[index+1].index:referenceText.length;
  return {page:Number(match[1]),text:referenceText.slice(begin,end)
   .replace(/^#.*$/gm,'').replace(/^\s*\[.*\]\s*$/gm,'')};
 }).filter(s=>s.page>=1&&s.page<=16&&![4,7,8].includes(s.page));
 assert.deepEqual(selected.map(x=>x.page),[1,3,5,6,9,10,11,12,13,14,15,16]);
 const trainingSegments=selected.map(s=>encode(s.text));
 const training=trainingSegments.flat();
 assert.equal(training.length,2797,'source-native noneditorial GP29 reference must be 2797 runes');
 const two=new Int32Array(29*29),three=new Int32Array(29*29*29);
 for(const seq of trainingSegments)for(let i=2;i<seq.length;i++){
  const b=29*seq[i-2]+seq[i-1];
  two[b]++;three[29*b+seq[i]]++;
 }
 const logs=new Float64Array(29*29*29);
 for(let b=0;b<29*29;b++)for(let s=0;s<29;s++)
  logs[29*b+s]=Math.log((three[29*b+s]+1)/(two[b]+29));
 /** @param {number[]} arr @returns {{mean:number,ngrams:number}} */
 function scoreStream(arr){
  let sum=0;
  for(let i=2;i<arr.length;i++)
   sum+=logs[29*(29*arr[i-2]+arr[i-1])+arr[i]];
  return {mean:sum/(arr.length-2),ngrams:arr.length-2};
 }
 /** @param {number[]} arr @returns {string} */
 function spell(arr){
  return arr.map(x=>x===21?'ING':x===27?'IO':corpus.translit[x]).join('');
 }
 return {training,trainingSegments,scoreStream,spell,sourceRunes:training.length,
  sections:trainingSegments.length};
}

module.exports={buildCleanNativeTrigram};
