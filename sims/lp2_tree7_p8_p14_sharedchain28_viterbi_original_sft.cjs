"use strict";
/**
 * First/last botanical-tree pages p8/p14, a source-motivated two-time
 * predecessor cipher attack. 106 unchanged original adjacent-rune steps;
 * begins at each physical page's first source rune and stops BEFORE the
 * first original p8 ciphertext repeat. No key / plaintext / word shift fitted.
 *
 * Model (hypothesis only): for plaintext GP29 symbol != F,
 * delta C_i = 1 + ((P_i-1 + K_i) mod28) modulo29;
 * the same unknown arbitrary K_i reused on the two illustrated bookends.
 *
 * Train independent GP28 native word first-character and transition
 * probabilities on Gibran, test on original and independent Shakespeare
 * native-word positive controls with exact original physical word geometry.
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
/** @param {string} word @returns {number[]} GP28 symbols; [] if includes F. */
function encode(word){
  word=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/K/g,"C").replace(/Z/g,"S");
  const letters=[];
  for(let i=0;i<word.length;){
    const two=word.slice(i,i+2);
    if(gp.has(two)){letters.push(gp.get(two));i+=2;}
    else{if(gp.has(word[i]))letters.push(gp.get(word[i]));i++;}
  }
  if(letters.includes(0))return [];
  return letters.map(x=>x-1);
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
  for(const ch of parts[p]){
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
const A=pageAndGeometry(8),B=pageAndGeometry(14);
const N=106;
assert.deepEqual([A.source.length,B.source.length],[255,137]);
for(const record of [A,B])for(let j=1;j<=N;j++)
  assert.notEqual(record.source[j],record.source[j-1],"no original repeat in candidate prefix");
const delta=record=>Array.from({length:N},(_,i)=>
  (record.source[i+1]-record.source[i]+29)%29-1);
const ca=delta(A),cb=delta(B);
assert(ca.every(x=>x>=0&&x<28));
assert(cb.every(x=>x>=0&&x<28));
const equal=ca.filter((x,i)=>x===cb[i]).length;
const gibran=read("resources/control/gibran_prophet_58585.txt");
const shakespeare=read("resources/control/shakespeare_first300k.txt");
const tokens=s=>(s.toUpperCase().match(/[A-Z]+/g)||[])
  .map(encode).filter(x=>x.length);
const training=tokens(gibran);
const testing=tokens(shakespeare);
const trainingStarts=new Float64Array(28).fill(0.3);
const trainingAll=new Float64Array(28).fill(0.3);
const transitions=Array.from({length:28},()=>new Float64Array(28).fill(0.3));
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
  const logs=[], trace=[];
  let last=new Float64Array(28);
  const symbol=(d,k)=>(d-k+28)%28;
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
  const plainA=d1.map((d,i)=>symbol(d,key[i])+1);
  const plainB=d2.map((d,i)=>symbol(d,key[i])+1);
  assert.deepEqual(plainA.map((p,i)=>(p-1+key[i])%28),d1);
  assert.deepEqual(plainB.map((p,i)=>(p-1+key[i])%28),d2);
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
  const shared=Array.from({length:N},()=>integer(28));
  const a=pA.map((x,i)=>(x-1+shared[i])%28);
  const b=pB.map((x,i)=>(x-1+shared[i])%28);
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
  sourcePages:[8,14],sourcePageLengths:[A.source.length,B.source.length],
  originalFirstRepeatA:107,originalNoRepeatsB:true,
  frozenConsumedPositions:N,originalEqualDelta:equal,
  naturalSourceMatchedEqualityRate:equalityRate,
  originalScorePerStep:scoreSource.score,
  originalDecodedAFirst106:originalNativeA,
  originalDecodedBFirst106:originalNativeB,
  independentlyTrainedGibranAndTestedShakespeare:true,
  nativePositiveControls:stats(positives),
  originalPage14PermutationNull:stats(nullScores),
  allOriginalAndPlantedCipherInverseTestsPass:true,
  decision:"A source-motivated first/last botanical-page shared chain-pad has no demonstrated original GP28 prose; compare original score to native controls."
},null,2));
