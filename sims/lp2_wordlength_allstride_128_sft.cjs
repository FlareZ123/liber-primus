'use strict';

/**
 * LP2 source-frozen whole-word interleave invariant across widths 1..128.
 * One contiguous native-English prose lane per original within-chapter column
 * predicts ordinary native GP word-length MI at the associated source lag.
 * Run: node sims/lp2_wordlength_allstride_128_sft.cjs (Node 22, CommonJS).
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
/** @param {string} p @returns {string} */
function read(p) { return fs.readFileSync(path.join(root,p), 'utf8'); }
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = corpus.pages.slice(0,56).flatMap((p)=>p.indices);
const rendered = read('resources/liber-primus/lp2-transcription.txt');
const gibran = read('resources/control/gibran_prophet_58585.txt');
assert.equal(source.length,12956);
const starts=[0];
for(let p=0;p<56;p++) starts.push(starts.at(-1)+corpus.pages[p].indices.length);
const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]]
  .map(([first,last])=>[starts[first],starts[last+1]]);
const chapters=Array.from({length:9},()=>[]);
const index=new Map(corpus.runes.map((r,i)=>[r,i]));
let current=0,pending=[];
function flush(){
 if(!pending.length)return;
 const chapter=ranges.findIndex(([a,b])=>pending[0]>=a&&pending[0]<b);
 assert(chapter>=0 && pending.at(-1)<ranges[chapter][1]);
 chapters[chapter].push(Math.min(pending.length,9));
 pending=[];
}
for(const glyph of rendered){
 const value=index.get(glyph);
 if(value!==undefined&&current<source.length){
  assert.equal(value,source[current]);pending.push(current++);
 }else if('-.$&§'.includes(glyph))flush();
}
flush();
assert.equal(current,12956);
assert.deepEqual(chapters.map((x)=>x.length),
 [158,255,383,437,224,326,378,669,66]);
assert.equal(chapters.flat().length,2896);
const alphabet=corpus.translit.map((symbol,i)=>({symbol,i}))
 .sort((a,b)=>b.symbol.length-a.symbol.length);
/** @param {string} word @returns {number[]} */
function gpWord(word){
 const s=word.toUpperCase().replace(/ING/g,'NG').replace(/IO/g,'IA')
  .replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C')
  .replace(/Z/g,'S').replace(/Q/g,'C');
 const out=[];
 for(let i=0;i<s.length;){
  const x=alphabet.find((a)=>s.startsWith(a.symbol,i));
  if(!x)return [];
  out.push(x.i);i+=x.symbol.length;
 }
 return out;
}
const native=(gibran.match(/[A-Za-z]+/g)||[]).map(gpWord)
 .filter((x)=>x.length).slice(0,2896).map((x)=>Math.min(x.length,9));
assert.equal(native.length,2896);
/** @param {number[]} values @param {number} width @returns {Uint8Array} */
function interleave(values,width){
 const lanes=[],out=[];let offset=0;
 for(let i=0;i<width;i++){
  const count=Math.ceil((values.length-i)/width);
  lanes.push(values.slice(offset,offset+count));offset+=count;
 }
 assert.equal(offset,values.length);
 for(let r=0;out.length<values.length;r++)
  for(const lane of lanes)if(r<lane.length)out.push(lane[r]);
 return Uint8Array.from(out);
}
/** @param {number} seed @returns {() => number} */
function rng(seed){let state=seed>>>0;return ()=>{
 state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;
};}
/**
 * @param {Array<ArrayLike<number>>} input
 * @param {() => number} random32
 * @returns {Uint8Array[]}
 */
function shuffle(input,random32){
 return input.map((src)=>{
  const arr=Uint8Array.from(src);
  for(let i=arr.length-1;i>0;i--){
   const j=random32()%(i+1);[arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
 });
}
/**
 * @param {Array<ArrayLike<number>>} words
 * @param {number} lag
 * @returns {number}
 */
function mi(words,lag){
 const pairs=new Uint32Array(81),L=new Uint32Array(9),R=new Uint32Array(9);
 let n=0;
 for(const arr of words)for(let i=lag;i<arr.length;i++){
  const a=arr[i-lag]-1,b=arr[i]-1;
  pairs[a*9+b]++;L[a]++;R[b]++;n++;
 }
 let out=0;
 for(let a=0;a<9;a++)for(let b=0;b<9;b++){
  const v=pairs[a*9+b];
  if(v)out+=v/n*Math.log(v*n/(L[a]*R[b]));
 }
 return out;
}
const WIDTH=128,TRIALS=400;
const actual=Array.from({length:WIDTH},(_,i)=>mi(chapters,i+1));
assert(Math.abs(actual[0]-0.012156100972938996)<1e-12);
assert(Math.abs(actual[7]-0.013170932593083362)<1e-12);
assert(Math.abs(actual[31]-0.014882025341942702)<1e-12);
const sums=new Float64Array(WIDTH),sq=new Float64Array(WIDTH);
const exceed=new Uint16Array(WIDTH),nullRows=[];
const rnd=rng(0x33110055);
for(let t=0;t<TRIALS;t++){
 const shuffled=shuffle(chapters,rnd),row=Array.from({length:WIDTH},
  (_,i)=>mi(shuffled,i+1));
 nullRows.push(row);
 for(let i=0;i<WIDTH;i++){
  sums[i]+=row[i];sq[i]+=row[i]*row[i];
  if(row[i]>=actual[i])exceed[i]++;
 }
}
const scores=actual.map((value,i)=>{
 const mean=sums[i]/TRIALS;
 const sd=Math.sqrt(Math.max(1e-18,sq[i]/TRIALS-mean*mean));
 return {width:i+1,observed:value,mean,sd,z:(value-mean)/sd,
  p:(exceed[i]+1)/(TRIALS+1)};
});
const ranked=scores.toSorted((a,b)=>b.z-a.z);
assert.equal(ranked[0].width,70);
assert(Math.abs(ranked[0].z-3.1940493525193054)<1e-9);
const nullMax=nullRows.map((row)=>Math.max(...row.map(
 (value,i)=>(value-scores[i].mean)/scores[i].sd)));
const familyExceed=nullMax.filter((v)=>v>=ranked[0].z).length;
assert.equal(familyExceed,114);

let start=0;
const plant=chapters.map((ch)=>{
 const x=interleave(native.slice(start,start+ch.length),70);
 start+=ch.length;return x;
});
assert.equal(start,native.length);
const plant70=mi(plant,70),plantRnd=rng(0x33011270);
let pm=0,pq=0,plantExceed=0;
for(let t=0;t<TRIALS;t++){
 const z=mi(shuffle(plant,plantRnd),70);
 pm+=z;pq+=z*z;
 if(z>=plant70)plantExceed++;
}
pm/=TRIALS;
const psd=Math.sqrt(Math.max(1e-18,pq/TRIALS-pm*pm));
assert.equal(plantExceed,0);
assert(Math.abs(plant70-0.0556933698211349)<1e-12);
console.log(JSON.stringify({
 original:{runes:12956,words:2896,chapterWords:chapters.map((x)=>x.length),
  widths:[1,128],trials:TRIALS,seed:'0x33110055',
  grid8:scores[7],grid32:scores[31],topEight:ranked.slice(0,8),
  familyMaxAbove:familyExceed,familywiseP:(familyExceed+1)/(TRIALS+1)},
 nativePositive:{source:'Gibran, GP-native ING/IO spellings',
  chapterwiseContiguousLanes:70,observedMI:plant70,shuffleMean:pm,
  shuffleSD:psd,z:(plant70-pm)/psd,shufflesAbove:plantExceed,
  trials:TRIALS,seed:'0x33011270'},
 conclusion:'No fixed-width 1..128 contiguous-lane English transport evidenced by original source under corrected joint width null; no unknown original plaintext recovered.'
},null,2));
