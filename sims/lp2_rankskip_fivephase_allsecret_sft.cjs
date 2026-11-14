'use strict';
/**
 * Nonlinear predecessor-exclusion plus arbitrary five-phase page alphabets.
 * Fully reversible for all GP29 plaintext and every fixed marker/key.
 * Run on Windows Node.js 22: node sims/lp2_rankskip_fivephase_allsecret_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {encodeSourceNativeGP}=require('./lp2_native_gp_source_orthography_sft.cjs');
const root=path.join(__dirname,'..');
/** @param {string} rel @returns {string} */
function read(rel){return fs.readFileSync(path.join(root,rel),'utf8');}
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const glyphIndex=new Map(gp.runes.map((r,i)=>[r,i]));
const pat=new RegExp('['+gp.runes.join('')+']+','gu');
const transcript=read('resources/lp2-transcription.txt');
const words=(transcript.split('%').slice(0,55).join('%')
  .replace(/\/\r?\n/g,'').replace(/[\r\n%]/g,'').match(pat)||[])
  .map(w=>Array.from(w,r=>glyphIndex.get(r)));
const pages=gp.pages.filter(p=>p.page<56&&p.indices.length);
const pageAt=pages.flatMap(p=>Array(p.indices.length).fill(p.page));
const lengths=words.map(w=>w.length);
assert.equal(words.length,2896);
assert.equal(words.flat().length,12956);
assert.deepEqual(words.flat(),pages.flatMap(p=>p.indices));
assert.equal(Math.max(...lengths),14);

/** GP29 bijection: marker becomes repeated ciphertext, all other
 * symbols are order-ranked while excluding previous ciphertext.
 * @param {number} symbol @param {number} prev @param {number} marker */
function emit(symbol,prev,marker){
  if(symbol===marker)return prev;
  const rank=symbol-(symbol>marker?1:0);
  return rank+(rank>=prev?1:0);
}
/** @param {number} cipher @param {number} prev @param {number} marker */
function undo(cipher,prev,marker){
  if(cipher===prev)return marker;
  const rank=cipher-(cipher>prev?1:0);
  return rank+(rank>=marker?1:0);
}
/**
 * Original observed noninitial ciphertext, converted to unskip rank.
 * For any marker the 29-symbol output differs by a single fixed global
 * permutation, so the per-class equality counts are marker-invariant.
 * @param {number[][]} input
 * @param {boolean} observedCipher
 * @param {number} marker
 * @returns {{n:number,pairs:number,hits:number,rate:number,classes:number}}
 */
function collisionIndex(input,observedCipher,marker=28){
  const rows=Array.from({length:56*5},()=>new Uint32Array(29));
  let offset=0,n=0;
  for(const word of input){
    for(let j=1;j<word.length;j++){
      const value=observedCipher
        ?undo(word[j],word[j-1],marker):word[j];
      assert(Number.isInteger(value)&&value>=0&&value<29);
      rows[5*pageAt[offset+j]+j%5][value]++;
      n++;
    }
    offset+=word.length;
  }
  assert.equal(offset,12956);
  let pairs=0,hits=0,classes=0;
  for(const h of rows){
    let size=0;
    for(const c of h){size+=c;hits+=c*(c-1)/2;}
    if(size)classes++;
    pairs+=size*(size-1)/2;
  }
  return {n,pairs,hits,rate:hits/pairs,classes};
}
/** @param {number} seed */
function random(seed){
  let s=seed>>>0;
  return ()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
}
/** @param {string} rel */
function nativeBuckets(rel){
  const out=Array.from({length:15},()=>[]);
  const clean=read(rel).split(/\r?\n/).filter(s=>!s.startsWith('#')).join(' ');
  for(const token of clean.match(/[a-zA-Z]+/g)||[]){
    const w=encodeSourceNativeGP(token);
    if(w.length<=14)out[w.length].push(w);
  }
  for(const n of lengths)assert(out[n].length,'missing control word length '+n);
  return out;
}
/** @param {number[][][]} buckets @param {()=>number} rng */
function sample(buckets,rng){
  return lengths.map(n=>{
    const b=buckets[n];
    return b[Math.floor(rng()*b.length)];
  });
}
const actual=collisionIndex(words,true,28);
assert.deepEqual([actual.n,actual.pairs,actual.hits,actual.classes],
  [10060,231190,8218,275]);
for(let marker=0;marker<29;marker++){
  const result=collisionIndex(words,true,marker);
  assert.deepEqual([result.n,result.pairs,result.hits],
    [actual.n,actual.pairs,actual.hits]);
}
const sourceList=[
  {name:'Shakespeare',path:'resources/control/shakespeare_first300k.txt',seed:0x2805d1ff},
  {name:'Gibran',path:'resources/control/gibran_prophet_58585.txt',seed:0x2805d200},
  {name:'Emerson',path:'resources/control/emerson_essays_2944.txt',seed:0x2805d201},
  {name:'Latin Vulgate',path:'resources/control/latin-vulgate-latin26-wholewords.txt',seed:0x2805d202}
];
const controls=[];
let plantPlain;
for(const s of sourceList){
  const buckets=nativeBuckets(s.path),rng=random(s.seed);
  let min=Infinity,max=-Infinity,mean=0,under=0;
  for(let trial=0;trial<250;trial++){
    const trialWords=sample(buckets,rng);
    if(!plantPlain)plantPlain=trialWords;
    const rate=collisionIndex(trialWords,false).rate;
    min=Math.min(min,rate);max=Math.max(max,rate);mean+=rate;
    if(rate<=actual.rate)under++;
  }
  controls.push({source:s.name,trials:250,seed:s.seed,
    min,mean:mean/250,max,atOrBelowOriginal:under});
  assert.equal(under,0);
}
assert(plantPlain);
const rng=random(0x5311beef);
const maps=Array.from({length:56*5},()=>{
  const p=Array.from({length:29},(_,i)=>i);
  for(let i=28;i>0;i--){
    const j=Math.floor(rng()*(i+1));
    [p[i],p[j]]=[p[j],p[i]];
  }
  return p;
});
for(const marker of [0,6,28]){
  let off=0;
  const encrypted=[],decoded=[];
  for(const word of plantPlain){
    const cipher=[],plain=[];
    for(let j=0;j<word.length;j++){
      const map=maps[5*pageAt[off+j]+j%5];
      const sym=map[word[j]];
      cipher.push(j===0?sym:emit(sym,cipher[j-1],marker));
      plain.push(map.indexOf(j===0?cipher[j]:undo(cipher[j],cipher[j-1],marker)));
    }
    off+=word.length;
    encrypted.push(cipher);
    decoded.push(plain);
  }
  assert.equal(off,12956);
  assert.deepEqual(decoded,plantPlain);
  const before=collisionIndex(plantPlain,false);
  const after=collisionIndex(encrypted,true,marker);
  assert.deepEqual([before.n,before.pairs,before.hits],
    [after.n,after.pairs,after.hits]);
}
console.log(JSON.stringify({
  hypothesis:'per-word feedback, GP29 predecessor-excluding rank bijection; 29 marker choices; 275 arbitrary physical-page x word-phase secret alphabets',
  original:{words:2896,runes:12956,allMarkers:29,observed:actual},
  sourceNativeControls:controls,
  positiveControl:{plainRunes:12956,markers:[0,6,28],
    independentSecretAlphabets:275,exactlyRecovered:true},
  decision:'Source-native English/Latin excluded for this fixed word-feedback family. No unknown plaintext or key recovered.'
},null,2));
