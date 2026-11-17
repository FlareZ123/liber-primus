"use strict";
/**
 * Frozen 2016 signed 43-word address hypothesis meets signed-2013 H *
 * original-p39 G 252-symbol source quotient: 42 in-bounds rune words ×
 * six quotient key runes per word. Prove or reject direct ± GP29 additive
 * word-local inverses, including all legal authentic p56 literal-F bypasses.
 *
 * Independent source-shared checks: repeated signed words must decode the
 * SAME physical ciphertext word to the SAME plaintext word, and p56 END/DEEP
 * are independently solved. Node22 CommonJS, read-only, original inputs.
 * Run: node sims/lp2_2016_signed42_grid252_sixkey_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.join(__dirname, "..");
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const original = read("resources/liber-primus/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const gp = corpus.translit.map((token, i) => ({token:token.toLowerCase(),i}))
  .sort((a,b) => b.token.length-a.token.length);
const mod = x => ((x%29)+29)%29;
/** Source-attested ING is a single GP rune; use it in MEANING only. */
function encode(word,ing=false) {
  const text = word.toLowerCase().replace(/v/g,"u")
    .replace(/k/g,"c").replace(/z/g,"s");
  const out=[];
  for(let i=0;i<text.length;) {
    if (ing && text.startsWith("ing",i)) {out.push(21);i+=3;continue;}
    const t=gp.find(z => text.startsWith(z.token,i));
    assert.ok(t,word);
    out.push(t.i);i+=t.token.length;
  }
  return out;
}
/** Physical page-local true word segmentation, joining page and line visuals. */
const scans=original.split("%").slice(0,57);
const pages=Array.from({length:58},(_,p) =>
  p===50 ? [] : scans[p>50?p-1:p].replace(/[/\r\n]/g,"")
    .split(/[-.&$§,:!?]/u).map(w =>
      (w.match(/[ᚠ-᛿]+/gu)||[]).join("")).filter(Boolean)
    .map(w => [...w].map(ch => corpus.runes.indexOf(ch))));
assert.equal(pages.length,58);
assert.deepEqual(pages[56][1],encode("OESR"));
const signedBody=signed.slice(signed.indexOf("Hello."),
  signed.indexOf("-----BEGIN PGP SIGNATURE-----"));
const words=signedBody.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g)||[];
assert.equal(words.length,43);
const mapping=words.map((word,index)=>{
  const sum=encode(word,word.toLowerCase()==="meaning")
    .reduce((s,v)=>s+corpus.prime[v],0);
  const page=sum%58,localWord=Math.floor(sum/58);
  return {word,index,page,localWord,cipher:pages[page][localWord]||null};
});
assert.deepEqual(mapping.filter(x=>!x.cipher).map(x=>
  [x.word,x.index,x.page,x.localWord]),[["lies",3,50,3]]);
const mapped=mapping.filter(x=>x.cipher);
assert.equal(mapped.length,42);

/** Original p50 table bytes interpreted as GP29 high-first coefficients. */
const factor=[23,21,11,17,12]; // (3+26x+24x²)(27+5x+15x²)
const dividend=grid.pages.flatMap(p=>p.bytes).map(x=>x%29).reverse();
assert.equal(dividend.length,256);
const q=Array(252).fill(0),remainder=dividend.slice();
for(let i=255;i>=4;i--){
  const coefficient=mod(remainder[i]*17); // 12^{-1} mod29=17
  q[i-4]=coefficient;
  for(let j=0;j<5;j++)remainder[i-4+j]=mod(
    remainder[i-4+j]-coefficient*factor[j]);
}
assert.deepEqual(remainder.slice(0,4),[0,0,0,0]);
const key=q.reverse();
assert.equal(key.length,252);
mapped.forEach((x,i)=>{x.key=key.slice(6*i,6*i+6);x.block=i;});
assert.ok(mapped.every(x=>x.key.length===6));
const grouped=new Map();
for(const x of mapped){
  const label=x.page+":"+x.localWord;
  if(!grouped.has(label))grouped.set(label,[]);
  grouped.get(label).push(x);
}
/**
 * All possible plaintext outputs of exact, word-local length-six key under
 * literal-F bypass. A plaintext-F emits F and consumes no key.
 * Other runes consume the next key rune (period six if word is longer).
 * @param {number[]} cipher @param {number[]} key @param {1|-1} sign
 */
function inverseOptions(cipher,key,sign) {
  let paths=[{used:0,plain:[]}];
  for(const c of cipher){
    const next=[];
    for(const p of paths){
      if(c===0)next.push({used:p.used,plain:p.plain.concat(0)});
      const v=mod(c-sign*key[p.used%6]);
      if(v!==0)next.push({used:p.used+1,plain:p.plain.concat(v)});
    }
    paths=next;
    if(!paths.length)break;
  }
  return new Set(paths.map(p=>p.plain.join(",")));
}
/** Native original p56 positive: F bypass and matching known synthetic key. */
const native=encode("FINDTHEWAY");
const plantKey=[1,2,3,5,8,13],planted=[];
let used=0;
for(const x of native){
  planted.push(x===0?0:mod(x+plantKey[used++%6]));
}
assert.ok(inverseOptions(planted,plantKey,1).has(native.join(",")));
const results={};
for(const sign of [1,-1]){
  const duplicates=[];
  for(const [label,copies] of grouped){
    if(copies.length<2)continue;
    const outputs=copies.map(x=>inverseOptions(x.cipher,x.key,sign));
    const common=[...outputs[0]].filter(s=>outputs.slice(1)
      .every(set=>set.has(s)));
    duplicates.push({address:label,count:copies.length,
      sources:copies.map(x=>x.word),options:outputs.map(x=>x.size),
      commonPlaintexts:common.length});
  }
  const known=mapped.filter(x=>x.page===56).map(x=>{
    const goal=encode(x.localWord===1?"END":"DEEP").join(",");
    return {word:x.word,sourceIndex:x.index,
      target:x.page+":"+x.localWord,key:x.key,
      independentlyKnownPlaintext:goal,
      survives:inverseOptions(x.cipher,x.key,sign).has(goal)};
  });
  assert.equal(duplicates.length,6);
  assert.ok(duplicates.every(x=>x.commonPlaintexts===0));
  assert.equal(known.length,3);
  assert.ok(known.every(x=>!x.survives));
  results[sign===1?"cipherMinusKey":"cipherPlusKey"]={duplicates,known};
}
console.log(JSON.stringify({signedWords:words.length,
  exception:"lies → physical p50 numerical cell3",
  mappedRuneWords:mapped.length,
  sourceQuotientLength:key.length,
  keySymbolsPerMappedWord:key.length/mapped.length,
  repeatsChecked:6,independentlyKnownChecks:3,results},null,2));
console.log("PASS: 42×6 source-sourced direct transfer fails all repeated-word consistency and all genuine p56 solved controls under both signs and F transparency.");
