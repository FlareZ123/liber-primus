"use strict";
/**
 * Original p32 blurred botanical tree and p55 same tree source art: test a
 * genuinely matching, source-visible two-time reuse of a 28-ary changing
 * predecessor key over all 75 matched original transitions, with the
 * literal 0-delta steps treated as an explicit native EA reserved escape.
 *
 * Model hypothesis: delta C_i=0 iff plaintext GP29 symbol is EA (index28);
 * otherwise delta C_i=1+((P_i+K_i) mod28), with P_i in GP indices0..27.
 * One unobserved arbitrary pad K_i at each original matched local position,
 * reused on the two source-tree images p32 and p55.
 *
 * Native GP29 word/unigram/bigram frequencies are trained exclusively on
 * Gibran; independently sampled original-word-geometry Shakespeare native
 * positives and whole-source shuffled nulls calibrate full-text scores.
 * Read-only, CommonJS Node 22.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const raw=read("resources/liber-primus/lp2-transcription.txt");
const parts=raw.split("%");
const gp=new Map(corpus.translit.map((s,i)=>[s,i]));
const character=/[\u16A0-\u16FF]/u;
/** @param {string} word @returns {number[]} Native GP29 symbol indices. */
function encode(word){
  word=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/K/g,"C").replace(/Z/g,"S");
  const letters=[];
  for(let i=0;i<word.length;){
    const two=word.slice(i,i+2);
    if(gp.has(two)){letters.push(gp.get(two));i+=2;}
    else{if(gp.has(word[i]))letters.push(gp.get(word[i]));i++;}
  }
  return letters;
}
/** @param {number} p */
function pageAndGeometry(p){
  const source=corpus.pages.find(x=>x.page===p).indices;
  const wordLengths=[];
  const starts=[];
  let currentLen=0;
  let startOffset=-1;
  let cursor=0;
  const finish=()=>{
    if(startOffset>=0){wordLengths.push({start:startOffset,length:currentLen});startOffset=-1;}
    currentLen=0;
  };
  // The rune-only community transcript omits physical p50, unlike the
  // original physical-page-numbered corpus.
  const transcriptionIndex=p>=51?p-1:p;
  for(const ch of parts[transcriptionIndex]){
    if(character.test(ch)){
      if(startOffset<0){startOffset=cursor;starts.push(cursor);}
      currentLen++;cursor++;
    }else if(!(/[/\s]/u.test(ch)))finish();
  }
  finish();
  assert.equal(cursor,source.length);
  assert.equal(wordLengths.reduce((n,w)=>n+w.length,0),source.length);
  return {p,source,wordLengths,starts:new Set(starts)};
}
const A=pageAndGeometry(32),B=pageAndGeometry(55);
const N=75;
assert.deepEqual([A.source.length,B.source.length],[121,76]);
const delta=record=>Array.from({length:N},(_,i)=>
  (record.source[i+1]-record.source[i]+29)%29);
const ca=delta(A),cb=delta(B);
assert(ca.every(x=>x>=0&&x<=28));
assert(cb.every(x=>x>=0&&x<=28));
assert.deepEqual(ca.flatMap((x,i)=>x===0?[i+1]:[]),[30]);
assert.deepEqual(cb.flatMap((x,i)=>x===0?[i+1]:[]),[59]);
const equal=ca.filter((x,i)=>x===cb[i]).length;
const gibran=read("resources/control/gibran_prophet_58585.txt");
const shakespeare=read("resources/control/shakespeare_first300k.txt");
const tokens=s=>(s.toUpperCase().match(/[A-Z]+/g)||[])
  .map(encode).filter(x=>x.length);
const training=tokens(gibran);
const testing=tokens(shakespeare);
const trainingStarts=new Float64Array(29).fill(0.3);
const trainingAll=new Float64Array(29).fill(0.3);
const transitions=Array.from({length:29},()=>new Float64Array(29).fill(0.3));
const controlPools=new Map();
for(const token of training){
  trainingStarts[token[0]]++;
  for(let j=0;j<token.length;j++){
    trainingAll[token[j]]++;
    if(j)transitions[token[j-1]][token[j]]++;
  }
}
for(const token of testing){
  if(!controlPools.has(token.length))controlPools.set(token.length,[]);
  controlPools.get(token.length).push(token);
}
for(const record of [A,B])for(const word of record.wordLengths){
  assert(controlPools.get(word.length)?.length>0,
    "no external source-native word of original length "+word.length);
}
const norm=v=>{
  const d=v.reduce((a,b)=>a+b,0);
  return Array.from(v,x=>Math.log(x/d));
};
const logAll=norm(trainingAll);
const logStart=norm(trainingStarts);
const logStep=transitions.map(norm);
/** @param {number[]} d1 @param {number[]} d2 */
function viterbi(d1,d2){
  const trace=[];
  let last=new Float64Array(28);
  // Native EA is the zero-step escape, no GP28 key consumed for its label.
  const symbol=(d,k)=>d===0?28:(d-1-k+28)%28;
  for(let k=0;k<28;k++){
    last[k]=logAll[symbol(d1[0],k)]+logAll[symbol(d2[0],k)];
  }
  for(let i=1;i<N;i++){
    const next=new Float64Array(28);
    const back=new Int16Array(28);
    const boundaryA=A.starts.has(i+1),boundaryB=B.starts.has(i+1);
    for(let k=0;k<28;k++){
      const p=symbol(d1[i],k),q=symbol(d2[i],k);
      let max=-Infinity,arg=-1;
      for(let j=0;j<28;j++){
        const p0=symbol(d1[i-1],j),q0=symbol(d2[i-1],j);
        const z=last[j]+(boundaryA?logStart[p]:logStep[p0][p])
          +(boundaryB?logStart[q]:logStep[q0][q]);
        if(z>max){max=z;arg=j;}
      }
      next[k]=max;back[k]=arg;
    }
    last=next;trace.push(back);
  }
  let best=-Infinity,arg=-1;
  for(let k=0;k<28;k++)if(last[k]>best){best=last[k];arg=k;}
  const key=new Int16Array(N);
  key[N-1]=arg;
  for(let i=N-1;i>0;i--)key[i-1]=trace[i-1][key[i]];
  const plainA=d1.map((d,i)=>symbol(d,key[i]));
  const plainB=d2.map((d,i)=>symbol(d,key[i]));
  const reencrypt=(p,i)=>p===28?0:1+(p+key[i])%28;
  assert.deepEqual(plainA.map(reencrypt),d1);
  assert.deepEqual(plainB.map(reencrypt),d2);
  return {score:best/N,plainA,plainB,key};
}
let state=0x33014747;
/** @returns {number} */
function rand(){
  state^=state<<13;state^=state>>>17;state^=state<<5;
  return (state>>>0)/4294967296;
}
const integer=n=>Math.floor(rand()*n);
function sampleNative(record){
  const out=[];
  for(const word of record.wordLengths){
    const pool=controlPools.get(word.length);
    const token=pool[integer(pool.length)];
    out.push(...token);
  }
  assert.equal(out.length,record.source.length);
  return out.slice(1,N+1);
}
const scoreSource=viterbi(ca,cb);
const originalNativeA=scoreSource.plainA.map(x=>corpus.translit[x]).join("");
const originalNativeB=scoreSource.plainB.map(x=>corpus.translit[x]).join("");
const positives=[],nullScores=[],posEqual=[];
for(let t=0;t<120;t++){
  const pA=sampleNative(A),pB=sampleNative(B);
  // Condition positive texts on the exact two immutable original 0-delta
  // positions: source-native EA there, any alternative GP token elsewhere.
  const aNative=pA.map((x,i)=>ca[i]===0?28:x===28?18:x);
  const bNative=pB.map((x,i)=>cb[i]===0?28:x===28?18:x);
  const shared=Array.from({length:N},()=>integer(28));
  const emit=(p,i)=>p===28?0:1+(p+shared[i])%28;
  const a=aNative.map(emit);
  const b=bNative.map(emit);
  assert.deepEqual(a.flatMap((v,i)=>v===0?[i+1]:[]),[30]);
  assert.deepEqual(b.flatMap((v,i)=>v===0?[i+1]:[]),[59]);
  posEqual.push(a.filter((x,i)=>x===b[i]).length);
  const pos=viterbi(a,b);
  positives.push(pos.score);
  const perm=cb.slice();
  for(let i=perm.length-1;i>0;i--){
    const j=integer(i+1);[perm[i],perm[j]]=[perm[j],perm[i]];
  }
  nullScores.push(viterbi(ca,perm).score);
}
const stats=v=>({
  count:v.length,min:Math.min(...v),max:Math.max(...v),
  mean:v.reduce((a,b)=>a+b,0)/v.length,
  higherThanOriginal:v.filter(x=>x>scoreSource.score).length,
  p95:v.slice().sort((a,b)=>a-b)[Math.floor(v.length*.95)]
});
const equalityRate=posEqual.reduce((a,b)=>a+b,0)/(N*posEqual.length);
assert.equal(equal,ca.filter((x,i)=>x===cb[i]).length);
assert.equal(positives.length,120);
console.log(JSON.stringify({
  sourcePages:[32,55],sourcePageLengths:[A.source.length,B.source.length],
  originalZeroDeltaSites:{p32:[30],p55:[59]},
  frozenConsumedPositions:N,originalEqualDelta:equal,
  naturalSourceMatchedEqualityRate:equalityRate,
  originalScorePerStep:scoreSource.score,
  originalDecodedP32First75:originalNativeA,
  originalDecodedP55All75AfterFirstRune:originalNativeB,
  independentlyTrainedGibranAndTestedShakespeare:true,
  nativePositiveControls:stats(positives),
  originalP55PermutationNull:stats(nullScores),
  allOriginalAndPlantedCipherInverseTestsPass:true,
  decision:"Original matched p32/p55 tree artwork leads to testable same-index GP28 chain-pad model; compare all original score with native plants and shuffled original."
},null,2));
