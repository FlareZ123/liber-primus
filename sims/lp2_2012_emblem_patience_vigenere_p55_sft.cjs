'use strict';

/**
 * 2012 Cicada emblem caption -> LP2 p55 exact historical GP29 cipher gate.
 *
 * The archived 2012 coordinates page labels the reused cicada.jpg emblem
 * "Patience is a virtue."  This tests the literal source words PATIENCE and
 * PATIENCEISAVIRTUE as old LP1 Vigenere keys for the last unknown p55 page.
 *
 * No arbitrary phase/key search; source-obvious carrier starts are p55:0
 * (physical page) and p55:1 (first complete word after p54 carry).
 *
 * node sims/lp2_2012_emblem_patience_vigenere_p55_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
const page55 = corpus.pages.find((x)=>x.page===55);
const page57 = corpus.pages.find((x)=>x.page===57);
assert(page55 && page57);
assert.equal(page55.indices.length,76);
assert.equal(page57.indices.length,95);
assert.deepEqual(page55.indices.slice(0,2),[21,25]);
assert.deepEqual(page55.indices.map((n,i)=>n===0?i:-1).filter(i=>i>=0),[15,25,41]);

/** @param {string} literal */
function gp(literal){
  const index=new Map(corpus.translit.map((s,i)=>[s,i]));
  return [...literal.replaceAll('V','U')].map((s)=>{
    assert(index.has(s),s);
    return index.get(s);
  });
}
const words=[
  {label:'PATIENCE',key:gp('PATIENCE')},
  {label:'PATIENCEISAVIRTUE',key:gp('PATIENCEISAVIRTUE')}
];
assert.equal(words[0].key.length,8);
assert.equal(words[1].key.length,17);

/**
 * GP-F-transparent encryption from historical solved LP1 and p56.
 * @param {number[]} plain
 * @param {number[]} key
 * @param {number} sign
 */
function encrypt(plain,key,sign){
  let used=0;
  return plain.map((x)=>{
    if(x===0)return 0;
    const out=(x+29+sign*key[used%key.length])%29;
    used++;
    return out;
  });
}
/**
 * Exhaustively branch legal literal-F ambiguity.
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} sign
 * @returns {{plain:number[],consumed:number}[]}
 */
function decrypt(cipher,key,sign){
  let paths=[{plain:[],consumed:0}];
  for(const c of cipher){
    const next=[];
    for(const s of paths){
      if(c===0)next.push({plain:[...s.plain,0],consumed:s.consumed});
      const p=(c+29-sign*key[s.consumed%key.length])%29;
      if(p!==0)next.push({plain:[...s.plain,p],consumed:s.consumed+1});
    }
    paths=next;
  }
  for(const s of paths)assert.deepEqual(encrypt(s.plain,key,sign),cipher);
  return paths;
}
/** @param {number[]} xs */
function ioc(xs){
  const count=Array(29).fill(0);
  xs.forEach(x=>count[x]++);
  return count.reduce((s,n)=>s+n*(n-1),0)/(xs.length*(xs.length-1));
}
/** @param {number[]} xs */
function asGP(xs){return xs.map(x=>corpus.translit[x]).join('');}
const outcomes=[];
for(const {label,key} of words){
  for(const start of [0,1]){
    const cipher=page55.indices.slice(start);
    for(const sign of [1,-1]){
      const variants=decrypt(cipher,key,sign);
      const scored=variants.map(s=>({...s,ioc:ioc(s.plain)}))
        .sort((a,b)=>b.ioc-a.ioc);
      const best=scored[0];
      const planted=page57.indices.slice(0,cipher.length);
      const plantCipher=encrypt(planted,key,sign);
      assert(decrypt(plantCipher,key,sign).some(s=>
        s.plain.length===planted.length &&
        s.plain.every((v,i)=>v===planted[i])));
      outcomes.push({label,start,sign,candidates:variants.length,
        maxIoC:best.ioc,openingGP:asGP(best.plain.slice(0,50)),
        fullCandidateContains:asGP(best.plain),
        plantedExact:planted.length});
    }
  }
}
const actual= ioc(page55.indices);
const solved = ioc(page57.indices.slice(0,76));
const max=Math.max(...outcomes.map(x=>x.maxIoC));
assert(outcomes.length===8);
assert(max<solved);
console.log(JSON.stringify({
  historicalSource:'2012 Cicada emblem 845145127.com/cicada.jpg title',
  input:'unaltered 76-runic original p55, authentic plaintext-F bypass',
  labels:words.map(w=>({label:w.label,gpLength:w.key.length})),
  rawP55IoC:actual,sourceSolvedP57First76IoC:solved,maxCandidateIoC:max,
  totalCandidates:outcomes.reduce((s,x)=>s+x.candidates,0),
  outcomes,result:'No sustained GP-native plaintext or authorial selector'
},null,2));
