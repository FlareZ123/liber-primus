"use strict";
/**
 * Source-fixed Hill11 original-cipher gate from the original p32 11x11 tree matrix.
 * The row/column GP-prime sums 563/569 equal the 2016 signed image dimensions.
 * This selects a finite hypothesis; it does not authenticate Hill encryption.
 * SFT: node sims/lp2_tree121_hill11_source_matrix_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {mod,matrixInverse,stats,encodeEnglishWord}=require("./fibonacci_square_hill4_gate.cjs");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const data=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=data.pages.filter(p=>p.status==="unsolved"&&p.indices.length);
const original=pages.flatMap(p=>p.indices);
assert.equal(pages.length,55);assert.equal(original.length,12956);
const source=data.pages[32].indices;
assert.equal(source.length,121);
const prime=source.map(i=>data.prime[i]);
const rows=Array.from({length:11},(_,r)=>prime.slice(r*11,r*11+11));
assert.equal(rows[0].reduce((s,v)=>s+v,0),563);
assert.equal(rows.reduce((s,r)=>s+r[0],0),569);
/** @param {number[][]} m */
function transpose(m){return m[0].map((_,j)=>m.map(r=>r[j]));}
/** @param {number[][]} m @param {number[]} b */
function multiply(m,b){return m.map(row=>mod(row.reduce((s,v,i)=>s+v*b[i],0)));}
/**
 * Pass through any incomplete 1-10 rune block without loss.
 * @param {number[][]} segments
 * @param {number[][]} m
 * @param {"page"|"continuous"} clock
 */
function transform(segments,m,clock){
  const parts=clock==="page"?segments:[segments.flat()];
  const out=[];
  for(const s of parts)for(let i=0;i<s.length;i+=11){
    const b=s.slice(i,i+11);out.push(...(b.length===11?multiply(m,b):b));
  }
  return out;
}
/** @param {number[]} a @param {number[]} b */
function equal(a,b){return a.length===b.length&&a.every((x,i)=>x===b[i]);}
const words=parseSharedCorpus().words;
assert.equal(words.length,2896);
assert.equal(words.reduce((s,w)=>s+w.length,0),12956);
const controlWords=(read("resources/control/shakespeare_first300k.txt")
  .match(/[A-Za-z]+/g)||[]).map(encodeEnglishWord);
const counts=Array.from({length:29},()=>Array(29).fill(0.1));
for(const w of controlWords)for(let i=1;i<w.length;i++)counts[w[i-1]][w[i]]++;
const logP=counts.map(row=>{const total=row.reduce((a,b)=>a+b,0);
  return row.map(n=>Math.log(n/total));});
/** @param {number[]} symbols */
function wordBigram(symbols){
  let pos=0,sum=0,count=0;
  for(const w of words){
    for(let j=1;j<w.length;j++){sum+=logP[symbols[pos+j-1]][symbols[pos+j]];count++;}
    pos+=w.length;
  }
  assert.equal(pos,symbols.length);return sum/count;
}
/** @param {number} seed */
function rng(seed){let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;
  return (x>>>0)/4294967296;};}
const pools=new Map();
for(const w of controlWords){if(!pools.has(w.length))pools.set(w.length,[]);
  pools.get(w.length).push(w);}
const random=rng(0x32115639);
const native=words.flatMap(w=>{
  const pool=pools.get(w.length);assert.ok(pool&&pool.length);
  return pool[Math.floor(random()*pool.length)];
});
assert.equal(native.length,12956);
const models=[];
const keys=[
  ["gp-prime-mod29",rows.map(r=>r.map(mod))],
  ["literal-gp-index",Array.from({length:11},(_,r)=>source.slice(r*11,r*11+11))]
];
for(const [family,key] of keys){
  const inv=matrixInverse(key);assert.ok(inv);
  const operations=[
    ["K",key],["K-inverse",inv],
    ["K-transpose",transpose(key)],["K-inverse-transpose",transpose(inv)]
  ];
  for(const [operation,decoder] of operations){
    const encoder=matrixInverse(decoder);assert.ok(encoder);
    for(const clock of ["continuous","page"]){
      const segments=clock==="page"?pages.map(p=>p.indices):[original];
      const output=transform(segments,decoder,clock);
      const lengths=segments.map(s=>s.length);
      const split=[];let offset=0;
      for(const n of lengths){split.push(output.slice(offset,offset+n));offset+=n;}
      assert.ok(equal(transform(split,encoder,clock),original));
      models.push({family,operation,clock,ioc:stats(output).ioc,
        wordBigram:wordBigram(output),
        first80:output.slice(0,80).map(x=>data.translit[x]).join("")});
    }
  }
}
const K=keys[0][1],cipher=transform([native],K,"continuous");
const plantRecovered=transform([cipher],matrixInverse(K),"continuous");
assert.ok(equal(native,plantRecovered));
const result={
  sourcePage:32,sourceRunes:source.length,axisSums:[563,569],
  originalRunes:original.length,wordCount:words.length,
  models:models.length,originalExactRoundtrips:models.length,
  raw:{ioc:stats(original).ioc,wordBigram:wordBigram(original)},
  native:{ioc:stats(native).ioc,wordBigram:wordBigram(native)},
  plant:{cipherIoC:stats(cipher).ioc,recoveredIoC:stats(plantRecovered).ioc,
    recoveredBigram:wordBigram(plantRecovered),exact:true},
  originalRange:{
    ioc:[Math.min(...models.map(x=>x.ioc)),Math.max(...models.map(x=>x.ioc))],
    wordBigram:[Math.min(...models.map(x=>x.wordBigram)),
      Math.max(...models.map(x=>x.wordBigram))]
  },
  topOriginal:models.sort((a,b)=>b.wordBigram-a.wordBigram).slice(0,5),
  conclusion:"The 16 source-matrix Hill11 inverses re-encrypt exactly but do not reveal GP-English."
};
console.log(JSON.stringify(result,null,2));
