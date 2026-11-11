'use strict';
/** A causal preceding-ciphertext-word GP-prime-sum Caesar inverse.
 *  2016 clue motivates this test but does not authenticate the cipher.
 *  Run: node sims/lp2_previous_word_prime_sum_feedback_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {parseSharedCorpus}=require('./lp2_word_pages.cjs');
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const rune=new Map(corpus.runes.map((r,i)=>[r,i]));
const words=parseSharedCorpus().words.map(w=>({page:w.startPage,x:[...w.runes].map(r=>rune.get(r))}));
const cipher=words.flatMap(w=>w.x);
assert.equal(words.length,2896);
assert.equal(cipher.length,12956);
const mod=x=>(x%29+29)%29;
/** @param {number[][]} input
 * @param {-1|1} sign
 * @param {boolean} resetPage
 * @param {boolean} decrypt
 * @returns {number[][]}
 */
function transform(input,sign,resetPage,decrypt){
  let k=3301%29,old=-1;
  return input.map((word,i)=>{
    if(resetPage&&old!==words[i].page) k=3301%29;
    old=words[i].page;
    const out=word.map(x=>mod(x+(decrypt?sign:-sign)*k));
    const ciphertext=decrypt?word:out;
    k=mod(ciphertext.reduce((s,x)=>s+corpus.prime[x],0));
    return out;
  });
}
/** @param {number[]} data */
function ioc(data){
  const n=Array(29).fill(0);
  for(const x of data)n[x]++;
  return n.reduce((s,x)=>s+x*(x-1),0)/(data.length*(data.length-1));
}
const native=corpus.pages.find(p=>p.page===57).indices;
assert.equal(native.length,95);
const plant=cipher.map((_,i)=>native[i%native.length]);
let at=0;
const plantWords=words.map(w=>{
  const x=plant.slice(at,at+w.x.length);
  at+=w.x.length;
  return x;
});
const expected=[
  [-1,false,0.03449105239846911],
  [-1,true,0.0344823181485678],
  [1,false,0.034479255799011684],
  [1,true,0.03448293776793324],
];
assert(Math.abs(ioc(cipher)-0.03447839786450569)<1e-12);
for(const [sign,reset,wanted] of expected){
  const decoded=transform(words.map(w=>w.x),sign,reset,true);
  assert(Math.abs(ioc(decoded.flat())-wanted)<1e-12);
  assert.deepEqual(transform(decoded,sign,reset,false).flat(),cipher);
  const testCipher=transform(plantWords,sign,reset,false);
  assert.deepEqual(transform(testCipher,sign,reset,true),plantWords);
  console.log({sign,pageReset:reset,originalIoC:ioc(decoded.flat()),plantRecovered:plant.length});
}
console.log('Four original inverses and four independent native-plaintext plants pass; no recovered LP2 unknown text.');
