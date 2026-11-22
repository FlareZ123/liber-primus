'use strict';

/**
 * Key-independent lexical feasibility of an original ciphertext feedback law.
 *
 * Each whole printed word may use an entirely secret nonzero GP29 slope and
 * arbitrary plaintext first symbol. For every subsequent position j:
 *   C_j = C_(j-1) + k_word * (P_j - C_(j-1)) mod29.
 *
 * All 28 secret k values are enumerated per word; the first plaintext rune
 * is wholly free and never used as evidence. This is stronger and more
 * permissive than guessing a global constant, including chapter/page resets.
 * A confirmed high-length dictionary match would nominate an actual word
 * under a reproducible operation. No original author instruction selects
 * this recurrence, so even a match is only a mechanism candidate.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const corpus=require('../resources/liber-primus/lp2-corpus.json');
const {parseLP2Words}=require('./lp2_word_pages.cjs');
const raw=fs.readFileSync(path.join(root,'resources/lp2-transcription.txt'),'utf8');
const parsed=parseLP2Words(raw);
assert.equal(parsed.words.length,2896);
assert.equal(parsed.runeCount,12956);
assert.equal(parsed.crossPageWords,32);
const index=new Map(corpus.runes.map((r,i)=>[r,i]));
const words=parsed.words.map(w=>[...w.runes].map(ch=>index.get(ch)));
assert(words.every(a=>a.every(Number.isInteger)));
assert.equal(words.reduce((s,w)=>s+w.length,0),12956);
const sorted=corpus.translit.map((word,i)=>({word,i}))
 .sort((a,b)=>b.word.length-a.word.length);
const mod=x=>((x%29)+29)%29;
const inverse=Array(29).fill(0);
for(let x=1;x<29;x++){
 for(let y=1;y<29;y++)if(x*y%29===1)inverse[x]=y;
 assert(inverse[x]>0);
}
/** @param {string} word */
function gpNative(word){
 let s=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
  .replace(/[KQ]/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG')
  .replace(/IO/g,'IA');
 const out=[];
 for(let j=0;j<s.length;){
  const v=sorted.find(item=>s.startsWith(item.word,j));
  if(!v)return null;
  out.push(v.i);j+=v.word.length;
 }
 return out;
}
const sourceLex=fs.readFileSync(path.join(root,
 'resources/control/english_wordfreq_textblob.txt'),'utf8');
/** @type {Map<number,Map<string,Array<{word:string,freq:number}>>>} */
const endingByLength=new Map();
let wordsRead=0,nativeWords=0;
for(const line of sourceLex.split(/\r?\n/)){
 const m=/^([a-z]+) (\d+)$/.exec(line);
 if(!m)continue;wordsRead++;
 const [_,word,num]=m, freq=Number(num);
 const gp=gpNative(word);
 if(!gp || gp.length<5 || gp.length>14)continue;
 nativeWords++;
 let map=endingByLength.get(gp.length);
 if(!map){map=new Map();endingByLength.set(gp.length,map);}
 const key=gp.slice(1).join(',');
 const list=map.get(key)||[];
 list.push({word,freq}); map.set(key,list);
}
assert(wordsRead>20000 && nativeWords>10000);

/** Enumerate every compatible dictionary suffix, regardless first rune.
 * @param {number[]} cipher
 * @returns {Array<{word:string,freq:number,k:number}>} */
function candidates(cipher){
 const map=endingByLength.get(cipher.length);
 if(!map || cipher.length<5)return [];
 const found=new Map();
 for(let k=1;k<29;k++){
  const inv=inverse[k], dec=[];
  for(let j=1;j<cipher.length;j++)
   dec.push(mod(cipher[j-1]+inv*(cipher[j]-cipher[j-1])));
  const items=map.get(dec.join(','))||[];
  for(const t of items)if(!found.has(t.word))found.set(t.word,{...t,k});
 }
 return [...found.values()];
}

/** @param {number[]} plain @param {number} k @param {number} first */
function encode(plain,k,first){
 const c=[first];
 for(let j=1;j<plain.length;j++)
  c.push(mod(c[j-1]+k*(plain[j]-c[j-1])));
 return c;
}
let positive=0;
const testWords=[];
for(const [length,map] of endingByLength){
 if(length<7)continue;
 const entry=[...map.values()][0]?.[0];
 if(!entry)continue;
 const p=gpNative(entry.word);
 for(const k of [1,2,7,13,27,28]){
  const cipher=encode(p,k,mod(p[0]+length+k));
  assert.deepEqual(cipher.slice(1).map((_,j)=>
   mod(cipher[j]+inverse[k]*(cipher[j+1]-cipher[j]))),p.slice(1));
  assert(candidates(cipher).some(t=>t.word===entry.word),
   'native GP plant must be recovered');
  positive++;
 }
 testWords.push(entry.word);
}
assert(positive>=24);

const originalResults=words.map((w,i)=>({
  index:i,len:w.length,page:parsed.words[i].startPage,
  matches:candidates(w)}));
const lengths=[5,6,7,8,9,10,11,12,13,14];
const byLength=lengths.map(len=>{
 const arr=originalResults.filter(x=>x.len===len);
 return {len, originalCount:arr.length,
  any:arr.filter(x=>x.matches.length).length,
  common20:arr.filter(x=>x.matches.some(y=>y.freq>=20)).length,
  common100:arr.filter(x=>x.matches.some(y=>y.freq>=100)).length};
});
const high=originalResults.filter(x=>x.len>=8&&x.matches.length)
 .map(x=>({wordIndex:x.index,startPage:x.page,length:x.len,
   candidates:x.matches.slice().sort((a,b)=>b.freq-a.freq).slice(0,6)}))
 .slice(0,24);
let rng=0x12303301;
/** @returns {number} */
function random(){
 rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;
 return rng>>>0;
}
/** Source-matched low-doublet null, no hidden GP word lexicon bias.
 * @param {number} n */
function randomWord(n){
 const out=[random()%29];
 for(let i=1;i<n;i++){
  if(random()%10000<67)out.push(out[i-1]);
  else out.push((out[i-1]+1+random()%28)%29);
 }
 return out;
}
const longIndices=words.flatMap((x,i)=>x.length>=7?[i]:[]);
let originalLong=0,originalCommon=0;
for(const i of longIndices){
 const matched=originalResults[i].matches;
 if(matched.length)originalLong++;
 if(matched.some(x=>x.freq>=20))originalCommon++;
}
const trials=250;
let ge=0,geCommon=0,mean=0,meanCommon=0,max=0;
for(let trial=0;trial<trials;trial++){
 let found=0,foundCommon=0;
 for(const i of longIndices){
  const m=candidates(randomWord(words[i].length));
  found+=Number(m.length>0);
  foundCommon+=Number(m.some(x=>x.freq>=20));
 }
 mean+=found;meanCommon+=foundCommon;
 max=Math.max(max,found);
 ge+=Number(found>=originalLong);
 geCommon+=Number(foundCommon>=originalCommon);
}
const output={hypothesis:'free word-private nonzero GP29 feedback multiplier and free initial rune',
 originalRUnes:parsed.runeCount,originalWords:parsed.words.length,
 originalLongWords:longIndices.length,
 lexiconRaw:wordsRead,lexiconGP5to14:nativeWords,
 nativeSourcePlantsRecovered:positive,
 byLength, originalLongWithAnyLexicon:originalLong,
 originalLongWithFreq20:originalCommon,
 null:{seed:'0x12303301',trials, MarkovRepeatPer10000:67,
  meanLongWithAny:mean/trials,maxLongWithAny:max,
  meanLongWithFreq20:meanCommon/trials,empiricalAnyGE:(ge+1)/(trials+1),
  empiricalFreq20GE:(geCommon+1)/(trials+1)},
 longestCandidateExamples:high
};
console.log(JSON.stringify(output));
console.log('PASS complete original word-private predecessor-multiplier native lexicon and source-matched 250-trial baseline');
