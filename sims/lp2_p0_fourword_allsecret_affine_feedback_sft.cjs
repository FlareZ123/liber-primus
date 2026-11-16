'use strict';
/**
 * Exact original p0 four F-free word SFT for word-IV-free, page-keyed
 * affine five-back feedback. Node.js 22, no third-party dependencies.
 * Source words 6/22/41/51, GP lengths 11/8/8/8, all C != F.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {encodeSourceNativeGP}=require('./lp2_native_gp_source_orthography_sft.cjs');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const idx=new Map(gp.runes.map((r,i)=>[r,i]));
const re=new RegExp('['+gp.runes.join('')+']+','gu');
const all=(read('resources/lp2-transcription.txt').split('%')[0].match(re)||[])
  .map(w=>Array.from(w,r=>idx.get(r)));
assert.equal(all.length,65);
assert.equal(all.flat().length,262);
const ids=[5,21,40,50];
const offsets=[23,95,158,203];
const src=ids.map((i,k)=>{
  assert.equal(all.slice(0,i).flat().length,offsets[k]);
  const w=all[i]; assert(!w.includes(0)); return w;
});
assert.deepEqual(src.map(w=>w.length),[11,8,8,8]);
assert.deepEqual(src.map(w=>w.map(i=>gp.runes[i]).join('')),[
 'ᚾᛖᚹᛒᚪᛋᛟᛇᛁᛝᚢ','ᚦᚪᛗᛁᛝᛁᛡᚣ',
 'ᛝᚷᛗᛄᚱᚩᛚᛇ','ᛠᛗᛝᛉᛉᛇᛞᛒ'
]);
const dict=read('resources/control/english_wordfreq_textblob.txt')
 .split(/\r?\n/).filter(x=>/^[a-z]+ \d+$/.test(x))
 .map(x=>x.split(' ')[0]);
assert.equal(dict.length,29157);
const long=[],short=[],suffix8=new Set();
for(const word of dict){
 const p=encodeSourceNativeGP(word);
 if(p.length===11)long.push(p);
 if(p.length===8){short.push(p);suffix8.add(p.slice(5).join('.'));}
}
assert.equal(long.length,1453);
assert.equal(short.length,4331);
const mod=x=>((x%29)+29)%29;
const inverses=Array.from({length:29},(_,n)=>{
 for(let i=1;i<29;i++)if(i*n%29===1)return i;return 0;
});
/**
 * @param {number[]} c Source word with arbitrary five-rune IV
 * @param {number} A Page-wide invertible plaintext multiplier
 * @param {number} B Page-wide feedback multiplier
 * @param {number[]} K Five page-wide phase shifts
 * @returns {boolean} Has any native English 8-rune plaintext?
 */
function nativeSuffix(c,A,B,K){
 const v=[5,6,7].map(j=>
  mod(inverses[A]*(c[j]-K[j%5]-B*c[j-5])));
 return suffix8.has(v.join('.'));
}
/**
 * @param {number[][]} c Four full source words
 * @param {{A:number,B:number,K:number[]}|null} expected For positive control
 */
function exhaust(c,expected=null){
 const [anchor,...holdouts]=c;
 const counts=[0,0,0,0];let recovered=false;
 for(let B=0;B<29;B++)for(let A=1;A<29;A++)for(const p of long){
  const K=[5,6,7,8,9].map(j=>
   mod(anchor[j]-A*p[j]-B*anchor[j-5]));
  if(mod(A*p[10]+K[0]+B*anchor[5])!==anchor[10])continue;
  counts[0]++;
  if(!nativeSuffix(holdouts[0],A,B,K))continue;
  counts[1]++;
  if(!nativeSuffix(holdouts[1],A,B,K))continue;
  counts[2]++;
  if(!nativeSuffix(holdouts[2],A,B,K))continue;
  counts[3]++;
  if(expected&&expected.A===A&&expected.B===B
   &&K.every((x,i)=>x===expected.K[i]))recovered=true;
 }
 return {counts,recovered};
}
const actual=exhaust(src);
assert.deepEqual(actual.counts,[40684,1405,42,0]);
// Construct four English word ciphertexts with the same hidden page key,
// with four unrelated first-five ciphertext IVs.
const key={A:7,B:18,K:[2,3,5,7,11]};
const originals=[long.find(p=>!p.includes(0)),
 ...short.filter(p=>!p.includes(0)).slice(0,3)];
const planted=originals.map((p,i)=>{
 const c=src[i].slice(0,5);
 for(let j=5;j<p.length;j++)
  c.push(mod(key.A*p[j]+key.K[j%5]+key.B*c[j-5]));
 for(let j=5;j<p.length;j++)
  assert.equal(mod(inverses[key.A]*
   (c[j]-key.K[j%5]-key.B*c[j-5])),p[j]);
 return c;
});
const positive=exhaust(planted,key);
assert(positive.recovered);
assert(positive.counts[3]>0);
console.log(JSON.stringify({
 result:'No shared A/B/K across four original F-free p0 words',
 sourceWordOrdinals:ids.map(i=>i+1),sourceRuneOffsets:offsets,
 originalGPWordLengths:src.map(w=>w.length),originalFCounts:[0,0,0,0],
 dictionaryWords:dict.length,native11:long.length,native8:short.length,
 survivors:actual.counts,plantedPositive:positive.recovered,
 plantedAllSurvivors:positive.counts[3],authenticNewPlaintext:false
},null,2));
