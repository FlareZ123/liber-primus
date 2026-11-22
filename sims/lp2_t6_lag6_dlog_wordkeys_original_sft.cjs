'use strict';
/**
 * Exact all-secret word-key GP29 T6 orbit transport test.
 * A single 29-symbol alphabet permutation is chosen independently for
 * each printed word. The first six runes encode that same permutation
 * from orbit exponent zero. Later runes use lag-six ciphertext feedback.
 *
 * This family leaks exact equality masks inside each word under every
 * possible (29!)^2896 key selection; compare with GP-English controls.
 * A genuinely arbitrary six-rune IV would be a DIFFERENT model, so this
 * SFT separately reports the post-IV suffix-only equality signal.
 *
 * SFT: node sims/lp2_t6_lag6_dlog_wordkeys_original_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {encodeSourceNativeGP}=require('./lp2_native_gp_source_orthography_sft.cjs');
const root=path.resolve(__dirname,'..');
/** @param {string} f @returns {string} */
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeIndex=new Map(gp.runes.map((r,i)=>[r,i]));
const src=read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0,55).join('%').replace(/\/\r?\n/g,'')
  .replace(/[\r\n%]/g,'');
const words=(src.match(new RegExp('['+gp.runes.join('')+']+','gu'))||[])
  .map(w=>Array.from(w,r=>runeIndex.get(r)));
const original=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(words.length,2896);
assert.equal(original.length,12956);
assert.deepEqual(words.flat(),original);
const mod29=x=>((x%29)+29)%29;
const orbit=[],log=Array(29).fill(-1);
let x=21;
for(let i=0;i<28;i++){assert.equal(log[x],-1);log[x]=i;orbit.push(x);x=mod29(24-2*x);}
assert.equal(x,21);
assert.equal(log[8],-1);
/**
 * @param {number[]} c Cipher rune word
 * @returns {number[]} Key-permuted plaintext rune codes
 */
function recoverCode(c) {
  return c.map((v,j)=>v===8?28:(log[v]-
    (j<6||c[j-6]===8?0:log[c[j-6]])+28)%28);
}
/**
 * @param {number[]} plain Source-native GP word
 * @param {number} wordIndex Independent word key offset
 * @returns {number[]} Encoded GP29 ciphertext word
 */
function encryptWord(plain,wordIndex) {
  const c=[];
  for(let j=0;j<plain.length;j++) {
    const k=mod29(11*plain[j]+7*wordIndex+3);
    const prior=j<6||c[j-6]===8?0:log[c[j-6]];
    c.push(k===28?8:orbit[(prior+k)%28]);
  }
  return c;
}
/**
 * @param {number[]} c Source ciphertext word
 * @param {number} wordIndex Per-word secret key
 * @returns {number[]} Fully recovered plaintext word
 */
function decryptWord(c,wordIndex){
  return recoverCode(c).map(k=>mod29(8*(k-7*wordIndex-3)));
}
/**
 * @param {number[]} values GP29 symbols of one word
 * @returns {number} Unordered identical-rune pairs
 */
function collisions(values){
  const counts=new Uint32Array(29);
  for(const v of values){assert(v>=0&&v<29);counts[v]++;}
  let hits=0;
  for(const n of counts)hits+=n*(n-1)/2;
  return hits;
}
/**
 * @param {number[][]} book 2896 original-length words
 * @param {boolean} encoded Input is ciphertext in orbit code
 * @param {boolean} suffixOnly Restrict to positions j>=6
 * @returns {{pairs:number,hits:number,rate:number}}
 */
function wordInvariant(book,encoded,suffixOnly){
  let hits=0,pairs=0;
  for(const word of book) {
    const values=encoded?recoverCode(word):word;
    const tail=suffixOnly?values.slice(6):values;
    pairs+=tail.length*(tail.length-1)/2;
    hits+=collisions(tail);
  }
  return {pairs,hits,rate:hits/pairs};
}
const originalFull=wordInvariant(words,true,false);
const originalSuffix=wordInvariant(words,true,true);
assert.deepEqual(originalFull,{pairs:30281,hits:793,rate:793/30281});
assert.deepEqual(originalSuffix,{pairs:1460,hits:57,rate:57/1460});

/** @param {number} seed @returns {()=>number} */
const random=seed=>{let z=seed>>>0;return ()=>(z=(Math.imul(z,1664525)+1013904223)>>>0)/4294967296;};
const lengths=words.map(w=>w.length);
const references=[
  ['Gibran','resources/control/gibran_prophet_58585.txt'],
  ['Shakespeare','resources/control/shakespeare_first300k.txt'],
  ['Emerson','resources/control/emerson_essays_2944.txt']
];
const repetitions=1000;
const summary=[];
for(const [name,filename] of references) {
  const pool=Array.from({length:15},()=>[]);
  for(const token of read(filename).toUpperCase().match(/[A-Z]+/g)||[]){
    const a=encodeSourceNativeGP(token);
    if(a.length>0&&a.length<=14)pool[a.length].push(a);
  }
  for(const L of new Set(lengths))assert(pool[L].length>0,name+' missing GP length');
  const rng=random(0x33012026);
  let minFull=Infinity,minSuffix=Infinity,maxSuffix=-Infinity;
  let sumFull=0,sumSuffix=0,fullAtMost=0,suffixAtMost=0;
  for(let rep=0;rep<repetitions;rep++){
    const book=lengths.map(L=>pool[L][Math.floor(rng()*pool[L].length)]);
    if(rep===0){
      const encrypted=book.map((w,i)=>encryptWord(w,i));
      const decrypted=encrypted.map((w,i)=>decryptWord(w,i));
      assert.deepEqual(decrypted,book,name+' per-word planted inverse');
      assert.deepEqual(decrypted.map((w,i)=>encryptWord(w,i)),encrypted,
        name+' per-word planted re-encryption');
      const plantedFull=wordInvariant(encrypted,true,false);
      const naturalFull=wordInvariant(book,false,false);
      const plantedSuffix=wordInvariant(encrypted,true,true);
      const naturalSuffix=wordInvariant(book,false,true);
      assert.deepEqual(plantedFull,naturalFull,name+' secret key invariant');
      assert.deepEqual(plantedSuffix,naturalSuffix,name+' post-IV invariant');
    }
    const full=wordInvariant(book,false,false);
    const suffix=wordInvariant(book,false,true);
    minFull=Math.min(minFull,full.hits);
    minSuffix=Math.min(minSuffix,suffix.hits);
    maxSuffix=Math.max(maxSuffix,suffix.hits);
    sumFull+=full.hits;
    sumSuffix+=suffix.hits;
    fullAtMost+=+(full.hits<=originalFull.hits);
    suffixAtMost+=+(suffix.hits<=originalSuffix.hits);
  }
  assert.equal(fullAtMost,0,name+' original full decoded word patterns are language-like');
  summary.push({
    name,repetitions,
    full:{originalHits:originalFull.hits,pairs:originalFull.pairs,
      minControlHits:minFull,meanControlHits:sumFull/repetitions,
      controlsAtOrBelowOriginal:fullAtMost},
    suffix:{originalHits:originalSuffix.hits,pairs:originalSuffix.pairs,
      minControlHits:minSuffix,maxControlHits:maxSuffix,
      meanControlHits:sumSuffix/repetitions,
      controlsAtOrBelowOriginal:suffixAtMost},
    plantedRuneRecovery:12956
  });
}
console.log(JSON.stringify({
  status:'simple six-back orbit full-word-code all-word-secret exclusion; arbitrary independent six-IV remains open',
  originalFull,originalSuffix,secretKeyFamilies:'all (29!)^2896 word alphabets',
  controls:summary,authenticPlaintextRecovered:false
},null,2));
