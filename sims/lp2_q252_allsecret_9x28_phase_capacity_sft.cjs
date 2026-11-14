'use strict';
/**
 * Single runnable test: exact all-secret 9x28 phase-key capacity obstruction.
 * Tests two source-rank systems and both marker clock conventions.
 * No fitted secret key or English test statistic on original ciphertext.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'), path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const groups=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]]
 .map(([a,b])=>corpus.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices));
assert.deepEqual(groups.map(x=>x.length),[729,1145,1729,1903,1021,1433,1680,3008,308]);
const N=groups.flat().length;assert.equal(N,12956);
const EA=corpus.translit.indexOf('EA');assert.equal(EA,28);
const E=corpus.translit.indexOf('E');assert.equal(E,18);
const names=corpus.translit.map((word,index)=>({word,index}))
 .sort((a,b)=>b.word.length-a.word.length||a.index-b.index);
/** @param {string} source @returns {number[]} */
function native(source){
 const s=source.toUpperCase().replace(/K/g,'C').replace(/Q/g,'C')
  .replace(/V/g,'U').replace(/Z/g,'S').replace(/[^A-Z]/g,'');
 const out=[];
 for(let i=0;i<s.length;){const m=names.find(x=>s.startsWith(x.word,i));
  assert(m,'unmapped source at '+i);out.push(m.index);i+=m.word.length;}
 return out;
}
/** @param {number[]} seq @returns {number} */
function leastE(seq){
 assert(seq.length>=N);let count=0,best=Infinity;
 for(let i=0;i<seq.length;i++){if(seq[i]===E)count++;
   if(i>=N&&seq[i-N]===E)count--;
   if(i>=N-1)best=Math.min(best,count);
 }return best;
}
const refs=[
 ['Shakespeare','resources/control/shakespeare_first300k.txt',1325],
 ['Gibran','resources/control/gibran_prophet_58585.txt',1317],
 ['Emerson','resources/control/emerson_essays_2944.txt',1362]
];
const controls=refs.map(([name,p,expected])=>{
 const text=native(read(p)),m=leastE(text);
 assert.equal(m,expected);return {name,length:text.length,windows:text.length-N+1,leastE:m};
});
/**
 * For each of 9 original visual chapters, an independently arbitrary 28!
 * map is allowed at EACH 28-period key phase. Repeated ciphertext rune
 * is a reserved plaintext EA marker, not fed through an invertible map.
 * @param {'modular'|'ordered'} rank
 * @param {boolean} skip
 * @returns {{chapters:number[],total:number,repeats:number}}
 */
function ceiling(rank,skip){
 let previous=0,repeats=0;
 const chapterCounts=[];
 for(const group of groups){
  const h=Array.from({length:28},()=>Array(28).fill(0));
  let phase=0;
  for(const c of group){
   const d=(c-previous+29)%29;
   if(d){
    const x=rank==='modular'?d-1:(c>previous?c-1:c);
    assert(x>=0&&x<28);h[phase%28][x]++;
   }else repeats++;
   if(d||!skip)phase++;
   previous=c;
  }
  chapterCounts.push(h.reduce((s,row)=>s+Math.max(...row),0));
 }
 return {chapters:chapterCounts,total:chapterCounts.reduce((a,b)=>a+b,0),repeats};
}
/**
 * Build true source-native cipher using secret chapter x phase permutations.
 * Each state uses the invertible 28-symbol rotation selected independently.
 * @param {number[][]} plaintext
 * @param {'modular'|'ordered'} rank
 * @param {boolean} skip
 * @returns {number[][]}
 */
function encrypt(plaintext,rank,skip){
 let previous=0;
 return plaintext.map((group,j)=>{
  let phase=0;return group.map(symbol=>{
   let next=previous;
   if(symbol!==EA){
    const shift=(3*j+5*(phase%28))%28;
    const x=(symbol-shift+28)%28;
    next=rank==='modular'?(previous+x+1)%29:(x>=previous?x+1:x);
   }
   if(symbol!==EA||!skip)phase++;
   previous=next;return next;
  });
 });
}
/** @param {number[][]} cipher @param {'modular'|'ordered'} rank @param {boolean} skip @returns {number[][]} */
function decrypt(cipher,rank,skip){
 let previous=0;
 return cipher.map((group,j)=>{
  let phase=0;return group.map(c=>{
   const d=(c-previous+29)%29;
   const x=rank==='modular'?d-1:(c>previous?c-1:c);
   const symbol=d?(x+(3*j+5*(phase%28)))%28:EA;
   if(d||!skip)phase++;
   previous=c;return symbol;
  });
 });
}
const sample=native(read(refs[0][1])).slice(0,N);
assert.equal(sample.length,N);
let offset=0;const nativeGroups=groups.map(g=>sample.slice(offset,offset+=g.length));
const results=[];
for(const rank of ['modular','ordered']){
 for(const skip of [true,false]){
  const b=ceiling(rank,skip);
  assert.equal(b.repeats,86);
  assert(b.total<Math.min(...controls.map(x=>x.leastE)));
  const planted=encrypt(nativeGroups,rank,skip);
  assert.deepEqual(decrypt(planted,rank,skip),nativeGroups);
  results.push({rank,skip,total:b.total,chapters:b.chapters});
 }
}
assert.deepEqual(results.map(x=>x.total),[1222,1229,1244,1253]);
console.log('ORIGINAL: '+N+' runes, 9 visual chapters, 86 reserved equal-adjacent deltas');
console.log('ORIGINAL ALL-SECRET 28-period capacity: '+JSON.stringify(results));
console.log('MINIMUM GP E IN EVERY N-RUNE NATIVE WINDOW: '+JSON.stringify(controls));
console.log('POSITIVE: four independent true 29-rune plaintexts with 9x28 secret state permutations round-trip '+N+'/'+N);
console.log('DECISION: none of 4 9x28 reversible phase-state families can match native English GP E frequency on original ciphertext.');
