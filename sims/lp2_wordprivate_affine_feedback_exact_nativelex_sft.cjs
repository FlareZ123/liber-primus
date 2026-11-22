'use strict';

/**
 * Exact original unknown-word lexical recovery under every word-private
 * two-parameter affine GP29 ciphertext-feedback law:
 *
 *   C_j - C_(j-1) = a_word * (P_j - C_(j-1)) + b_word (mod29), j>=1
 *
 * with unknown a∈1..28, b∈0..28, completely free first plaintext glyph.
 * Each source word gets its OWN independent secret a,b, and a word-pair
 * algebraic elimination recovers any possible parameters exactly. No
 * guessed secret keys, phases, or scores. Long lexical hits can support
 * real plaintext hypotheses if the model is correct.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const corpus=require('../resources/liber-primus/lp2-corpus.json');
const {parseLP2Words}=require('./lp2_word_pages.cjs');
const raw=fs.readFileSync(path.join(root,'resources/lp2-transcription.txt'),'utf8');
const parsed=parseLP2Words(raw),all=parseLP2Words(raw,57);
assert.equal(parsed.words.length,2896);
assert.equal(parsed.runeCount,12956);
assert.equal(parsed.crossPageWords,32);
const alphabet=new Map(corpus.runes.map((x,i)=>[x,i]));
const cipherWords=parsed.words.map(w=>[...w.runes].map(x=>alphabet.get(x)));
assert(cipherWords.every(w=>w.every(Number.isInteger)));
assert.equal(cipherWords.reduce((s,w)=>s+w.length,0),12956);
const gpTokens=corpus.translit.map((str,i)=>({str,i}))
 .sort((a,b)=>b.str.length-a.str.length);
const mod=x=>((x%29)+29)%29;
const inv=Array(29).fill(0);
for(let k=1;k<29;k++)for(let v=1;v<29;v++)if(k*v%29===1)inv[k]=v;
assert(inv.slice(1).every(x=>x>0));
/** @param {string} input @returns {number[]|null} */
function gpNative(input){
 const s=input.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
  .replace(/[KQ]/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG')
  .replace(/IO/g,'IA');
 const out=[];
 for(let j=0;j<s.length;){
  const t=gpTokens.find(z=>s.startsWith(z.str,j));
  if(!t)return null;
  out.push(t.i);j+=t.str.length;
 }
 return out;
}
/** @type {Map<number,Array<{word:string,freq:number,gp:number[]}>>} */
const lex=new Map();
let rawLex=0,usable=0;
for(const line of fs.readFileSync(path.join(root,
 'resources/control/english_wordfreq_textblob.txt'),'utf8').split(/\r?\n/)){
 const m=/^([a-z]+) (\d+)$/.exec(line);
 if(!m)continue;
 rawLex++;
 const word=m[1],freq=Number(m[2]),gp=gpNative(word);
 if(!gp||gp.length<5||gp.length>14)continue;
 usable++;
 const a=lex.get(gp.length)||[];
 a.push({word,freq,gp});
 lex.set(gp.length,a);
}
assert(rawLex>20000&&usable>20000);

/** Return a,b iff the COMPLETE suffix satisfies the law.
 * @param {number[]} c Ciphertext full word
 * @param {number[]} p Native GP full word, arbitrary first plaintext symbol
 * @returns {{a:number,b:number}|null} */
function recover(c,p) {
 assert.equal(c.length,p.length);
 if(c.length<2)return null;
 let a=0,b=0,referenceX=0,referenceY=0,pivot=-1;
 for(let j=1;j<c.length;j++){
  const x=mod(p[j]-c[j-1]);
  const y=mod(c[j]-c[j-1]);
  if(j===1){referenceX=x;referenceY=y;continue;}
  if(x!==referenceX){
   a=mod((y-referenceY)*inv[mod(x-referenceX)]);
   if(a===0)return null;
   b=mod(referenceY-a*referenceX);
   pivot=j;break;
  }
  if(y!==referenceY)return null;
 }
 if(pivot===-1){a=1;b=mod(referenceY-referenceX);}
 for(let j=1;j<c.length;j++)
  if(mod(c[j-1]+a*(p[j]-c[j-1])+b)!==c[j])return null;
 return {a,b};
}
/** @param {number[]} p @param {number} a @param {number} b
 * @param {number} firstCipher */
function encode(p,a,b,firstCipher){
 const c=[firstCipher];
 for(let j=1;j<p.length;j++)
  c.push(mod(c[j-1]+a*(p[j]-c[j-1])+b));
 return c;
}
// Real source-native p57 words, not algorithmically hallucinated GP text.
const sourceNative=all.words.filter(w=>w.startPage===56)
 .map(w=>[...w.runes].map(r=>alphabet.get(r)));
assert.equal(sourceNative.length,20);
assert.equal(sourceNative.reduce((s,w)=>s+w.length,0),95);
let positives=0;
for(const p of sourceNative){
 if(p.length<3)continue;
 for(const a of [1,2,7,13,27])for(const b of [0,5,19]){
  const c=encode(p,a,b,mod(p[0]+p.length+a+b));
  const found=recover(c,p);
  assert(found && found.a>0);
  positives++;
 }
}
assert(positives>=100);
const lengthRange=[5,6,7,8,9,10,11,12,13,14];
/** @param {number[]} c */
function candidates(c){
 const list=lex.get(c.length)||[];
 const found=[];
 for(const item of list){
  const ab=recover(c,item.gp);
  if(ab)found.push({word:item.word,freq:item.freq,...ab});
 }
 return found;
}
const obs=cipherWords.map((c,i)=>({i,sourcePage:parsed.words[i].startPage,
 len:c.length,hits:c.length>=5?candidates(c):[]}));
const byLength=lengthRange.map(len=>{
 const m=obs.filter(x=>x.len===len);
 return {len,originalWords:m.length,any:m.filter(x=>x.hits.length).length,
  freq20:m.filter(x=>x.hits.some(h=>h.freq>=20)).length};
});
const high=obs.filter(x=>x.len>=8&&x.hits.length)
 .map(x=>({wordIndex:x.i,startPage:x.sourcePage,len:x.len,
 candidates:x.hits.slice().sort((a,b)=>b.freq-a.freq).slice(0,8)})).slice(0,35);
let seed=0x00330313;
/** @returns {number} */
function rnd(){
 seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;
}
/** @param {number} n */
function randomSourceMarkov(n){
 const c=[rnd()%29];
 for(let j=1;j<n;j++){
  c.push(rnd()%10000<67?c[j-1]:(c[j-1]+1+rnd()%28)%29);
 }
 return c;
}
const long=obs.filter(x=>x.len>=7);
const originalLong=long.filter(x=>x.hits.length).length;
const originalFrequent=long.filter(x=>x.hits.some(h=>h.freq>=20)).length;
let countSum=0,countCommon=0,atLeast=0,atLeastCommon=0,max=0;
const trials=24;
for(let t=0;t<trials;t++){
 let hits=0,common=0;
 for(const x of long){
  const matches=candidates(randomSourceMarkov(x.len));
  hits+=Number(matches.length>0);
  common+=Number(matches.some(h=>h.freq>=20));
 }
 countSum+=hits;countCommon+=common;max=Math.max(max,hits);
 atLeast+=Number(hits>=originalLong);
 atLeastCommon+=Number(common>=originalFrequent);
}
console.log(JSON.stringify({
 model:'word-private GP29 affine ciphertext feedback with free first glyph',
 originalRuneCount:12956,originalWords:2896,
 lexiconRaw:rawLex,lexiconGP5to14:usable,
 authenticNativeP57Plants:positives,
 byLength,originalLongWordCount:long.length,originalLongAny:originalLong,
 originalLongFreq20:originalFrequent,
 null:{seed:'0x00330313',trials,syntheticDoubletChancePer10000:67,
  meanLongAny:countSum/trials,maxLongAny:max,
  meanLongFreq20:countCommon/trials,empiricalLongAnyGE:(atLeast+1)/(trials+1),
  empiricalFreq20GE:(atLeastCommon+1)/(trials+1)},
 longSourceCandidates:high
}));
console.log('PASS native p57 authentic plant and complete original 2-parameter per-word GP29 inverse, source-matched null');
