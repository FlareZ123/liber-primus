'use strict';

/**
 * Authentic F (GP index0) as a hypothetical five-back output marker.
 *
 * Solved Liber Primus uses F as a sometimes-transparent interrupter.
 * Hypothesis tested here: for j>=5 in a printed word, and where
 * previous ciphertext differs from ciphertext j-5, the output
 * C[j]=C[j-5] is exclusively the encipherment of native plaintext F.
 * This is a motivated but explicitly UNAUTHENTICATED extension.
 *
 * The original has 103 such unambiguous return events out of 2105.
 * Fixed source-native English spelling and the exact original word
 * lengths provide a direct, key-independent source-F capacity test.
 * No plaintext values, original keys or cipher parameters are fit.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const base=path.resolve(__dirname,'..');
/** @param {string} file @returns {string} */
const read=file=>fs.readFileSync(path.join(base,file),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const rune=new Map(gp.runes.map((v,i)=>[v,i]));
const index=new Map(gp.translit.map((v,i)=>[v,i]));

/** @returns {number[][]} */
function originalWords(){
  const out=[];let cur=[];
  for(const ch of read('resources/lp2-transcription.txt')
    .split('%').slice(0,55).join('%')){
    const v=rune.get(ch);
    if(v!==undefined)cur.push(v);
    else if('-.$&§0123456789'.includes(ch)&&cur.length){
      out.push(cur);cur=[];
    }
  }
  if(cur.length)out.push(cur);
  assert.equal(out.length,2896);
  const flat=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
  assert.equal(flat.length,12956);
  assert.deepEqual(out.flat(),flat);
  return out;
}

/** @param {string} raw @returns {number[] | null} */
function encodeNative(raw){
  const s=raw.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/K/g,'C').replace(/Z/g,'S');
  const out=[];
  for(let i=0;i<s.length;){
    let token,code;
    if(s.slice(i,i+3)==='ING'){token='ING';code=21;}
    else if(s.slice(i,i+2)==='IO'){token='IO';code=27;}
    else {
      token=s.slice(i,i+2);code=index.get(token);
      if(code===undefined){token=s[i];code=index.get(token);}
    }
    if(code===undefined)return null;
    out.push(code);i+=token.length;
  }
  return out;
}

/** @param {string} source @returns {Map<number, number[]>} */
function poolF(source){
  const pool=new Map();
  for(const token of read(source).match(/[A-Za-z]+/g)||[]){
    const word=encodeNative(token);
    if(!word)continue;
    const values=pool.get(word.length)||[];
    values.push(word.slice(5).filter(v=>v===0).length);
    pool.set(word.length,values);
  }
  return pool;
}

/** @param {number} seed @returns {() => number} */
function random32(seed){
  let state=seed>>>0;
  return ()=>{
    state^=state<<13;state^=state>>>17;state^=state<<5;
    return state>>>0;
  };
}

const words=originalWords();
let prev=8,returns=0,overlaps=0,eligible=0;
for(const word of words){
  for(let j=0;j<word.length;j++){
    if(j>=5){
      eligible++;
      if(word[j]===word[j-5]){
        if(prev===word[j-5])overlaps++;
        else returns++;
      }
    }
    prev=word[j];
  }
}
assert.equal(eligible,2105);
assert.equal(returns,103);
assert.equal(overlaps,1);
const lengthCounts=new Map();
for(const word of words){
  if(word.length>=6)lengthCounts.set(word.length,
    (lengthCounts.get(word.length)||0)+1);
}
const sources=[
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/shakespeare_first300k.txt',
  'resources/control/emerson_essays_2944.txt'
];
const controls=[];
for(let idx=0;idx<sources.length;idx++){
  const source=sources[idx],pool=poolF(source);
  const getMean=a=>a.reduce((sum,v)=>sum+v,0)/a.length;
  let exactExpected=0;
  for(const [length,count] of lengthCounts){
    const p=pool.get(length);
    assert(p?.length,source+' missing length '+length);
    exactExpected+=count*getMean(p);
  }
  const next=random32(0x3301^((idx+2)*101));
  const samples=[];
  for(let j=0;j<1000;j++){
    let total=0;
    for(const [length,count] of lengthCounts){
      const p=pool.get(length);
      for(let k=0;k<count;k++)total+=p[next()%p.length];
    }
    samples.push(total);
  }
  const range=[Math.min(...samples),Math.max(...samples)];
  assert(range[1]<returns);
  assert(exactExpected<returns);
  controls.push({source,exactExpected,
    empiricalMean:getMean(samples),sampleCount:samples.length,
    min:range[0],max:range[1]});
}
console.log(JSON.stringify({
  originalRunes:12956,originalWords:words.length,eligible,
  fiveBackUnambiguousReturnEvents:returns,
  fiveBackAndPreviousCoincide:overlaps,
  necessaryNativePlainF:returns,
  originalSourceSpelling:'ING->NG, IO->IA',
  sourceMatchedControls:controls,
  decision:'Direct GP-F-exclusive five-back-copy trigger is inconsistent with every independently native word-length-matched English control; no original plaintext or key.'
},null,2));
