'use strict';
/**
 * Exact original source-word-boundary profile of 86 repeated LP2 rune steps.
 *
 * If a single plaintext GP rune EA (the omitted 29th label from a 28-step
 * exclusion cipher) directly emits a repeated cipher rune, its complete
 * position-in-word distribution must resemble GP EA in author-native prose.
 * Test four mutually exclusive bins: first, last (excluding first), second
 * (excluding last), and other. Draw whole solved Cicada words matching each
 * of the original 2,896 word lengths. A seeded null evaluates the full
 * four-bin chi-square, preserving authored GP digraph segmentation.
 *
 * A negative result is conditional on the finite solved vocabulary; no
 * hypothesis about unknown historical plaintext has been established.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'), read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeMap=new Map(corpus.runes.map((r,i)=>[r,i]));
const tokenMap=new Map(corpus.translit.map((r,i)=>[r,i]));
const words=read('resources/lp2-transcription.txt').split('%').slice(0,55).join('%')
  .split(/[-.&$§]/u).map(w=>[...w].filter(c=>runeMap.has(c)).map(c=>runeMap.get(c)))
  .filter(w=>w.length);
assert.equal(words.length,2896);
assert.equal(words.reduce((n,w)=>n+w.length,0),12956);
const old=read('resources/liber-primus/lp1-plaintext-reference.txt');
const source=old.split(/\r?\n/u).filter(line=>{
  const x=line.trim();
  return !x.startsWith('#')&&!x.startsWith('[')&&!/^[0-9a-f]{25,}$/iu.test(x);
}).join(' ');
/** @param {string} input */
function encode(input){
  const s=input.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/K/g,'C').replace(/Z/g,'S');
  const result=[];
  for(let i=0;i<s.length;){
    const digraph=tokenMap.get(s.slice(i,i+2));
    if(digraph!==undefined){result.push(digraph);i+=2;}
    else{const x=tokenMap.get(s[i]);assert.notEqual(x,undefined);result.push(x);i++;}
  }
  return result;
}
/** Mutually exclusive bin for 1..14 rune words. */
function position(i,n){return i===0?0:i===n-1?1:i===1?2:3;}
const original=[0,0,0,0];let previous=-1;
const lengths=new Map();
for(const word of words){
  lengths.set(word.length,(lengths.get(word.length)||0)+1);
  for(let i=0;i<word.length;i++){
    if(word[i]===previous)original[position(i,word.length)]++;
    previous=word[i];
  }
}
assert.deepEqual(original,[23,19,11,33]);
const sourceWords=(source.match(/[A-Za-z]+/g)||[]).map(encode).filter(w=>w.length);
const buckets=new Map();
for(const word of sourceWords){
  const n=word.length;
  if(!buckets.has(n))buckets.set(n,[]);
  const v=[0,0,0,0];
  for(let i=0;i<n;i++)if(word[i]===28)v[position(i,n)]++;
  buckets.get(n).push(v);
}
const means=[0,0,0,0];
for(const [length,count] of lengths){
  const pool=buckets.get(length);
  assert(pool&&pool.length,'Missing source length '+length);
  for(const w of pool)for(let k=0;k<4;k++)means[k]+=count*w[k]/pool.length;
}
assert.equal(means[1],0); // A zero-count literal EA word-ending source bin
assert.ok(Math.abs(means.reduce((a,b)=>a+b,0)-82.82698042564263)<1e-7);
function score(hist){
  return hist.reduce((s,v,i)=>s+(v-means[i])**2/(means[i]||1),0);
}
let seed=0x456aa15;
function random(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
const REPS=2000;
let greater=0,max=-Infinity,mean=0;
for(let rep=0;rep<REPS;rep++){
  const hist=[0,0,0,0];
  for(const [length,count] of lengths){
    const pool=buckets.get(length);
    for(let j=0;j<count;j++){
      const w=pool[random()%pool.length];
      for(let k=0;k<4;k++)hist[k]+=w[k];
    }
  }
  const value=score(hist);
  greater+=Number(value>=score(original));
  max=Math.max(max,value);mean+=value;
}
const result={
  source:'editor-normalized solved LP1/LP2 Cicada prose, GP EA=index28',
  original:{words:words.length,runes:12956,totalRepeated:86,
    bins:['first','last-not-first','second-not-last','other'],counts:original},
  model:'Exactly one unchanged plaintext EA rune causes a repeated ciphertext rune',
  matchedSource:{referenceWords:sourceWords.length,expected:means},
  score:{observed:score(original),draws:REPS,seed:'0x456aa15',
    randomSourceMean:mean/REPS,randomSourceMaximum:max,
    controlsAtLeastOriginal:greater,upperTailAddOne:(greater+1)/(REPS+1)},
  limitation:'The solved author source has zero word-final EA in each matched source length. Novel unknown Cicada words can contain it; the rejection is a source-vocabulary conditional constraint, not a universal cipher proof.'
};
console.log(JSON.stringify(result,null,2));
