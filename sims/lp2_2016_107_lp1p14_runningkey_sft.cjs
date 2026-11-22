"use strict";
/**
 * One source-constrained multi-stage key transfer:
 * 2016 signed HHMMSS=000107 -> 2014 Stage10 107.jpg -> identical LP1 p14
 * -> p14's independently solved runic prose as repeating GP29 key.
 * The source does not specify this final cipher transfer.
 *
 * Run: node sims/lp2_2016_107_lp1p14_runningkey_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {encode,train}=require("./grid_keyskip_viterbi.cjs");
const root=path.resolve(__dirname,"..");
const read=f=>fs.readFileSync(path.join(root,f),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const src=read("resources/liber-primus/lp1-plaintext-reference.txt");
const start=src.indexOf("### 14\n");
const end=src.indexOf("### 15\n");
assert(start>=0&&end>start);
const p14Plain=src.slice(start+"### 14\n".length,end);
const key=encode(p14Plain);
assert(key.length>200&&key.length<750);
const raw=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
assert.equal(raw.length,12956);
const firstChapter=raw.slice(0,729);
const p55=corpus.pages.find(p=>p.page===55).indices;
assert.equal(p55.length,76);
const english=encode(read("resources/control/shakespeare_first300k.txt"));
const model=train(read("resources/control/shakespeare_first300k.txt"));
const mod=x=>(x%29+29)%29;
function inverse(cipher,sign){
 return cipher.map((c,i)=>mod(c+sign*key[i%key.length]));
}
function forward(plain,sign){
 return plain.map((p,i)=>mod(p-sign*key[i%key.length]));
}
function ioc(a){
 const h=Array(29).fill(0);
 for(const x of a)h[x]++;
 return h.reduce((v,n)=>v+n*(n-1),0)/(a.length*(a.length-1));
}
function score(a){
 let value=0;
 for(let i=2;i<a.length;i++)
 value+=model.trigram[(a[i-2]*29+a[i-1])*29+a[i]];
 return value/(a.length-2);
}
const tests=[];
for(const [name,cipher] of [["first729",firstChapter],["last76",p55]]){
 for(const sign of [-1,1]){
  const plaintext=inverse(cipher,sign);
  assert.deepEqual(forward(plaintext,sign),cipher);
  const plant=english.slice(0,cipher.length);
  assert.deepEqual(inverse(forward(plant,sign),sign),plant);
  tests.push({name,sign,length:plaintext.length,
    ioc:ioc(plaintext),englishTrigramLogScore:score(plaintext),
    first70:plaintext.slice(0,70).map(i=>corpus.translit[i]).join("")});
 }
}
console.log(JSON.stringify({
 premise:"2016 signed HHMMSS=000107 may refer to archived 2014 Stage10 107.jpg, byte-identical LP1 p14. Try its independently established LP1 plaintext as native GP29 repeating Vigenere key on LP2 first chapter and last encrypted page.",
 weakLink:"Neither signed 2016 instruction nor original p14 names a GP29 repeating running key or its target in LP2. Treat exact Stage10 image identity and probable time numeral as separate observations.",
 keyRunes:key.length,
 sourceKeyBeginning:key.slice(0,40).map(i=>corpus.translit[i]).join(""),
 control:{sourceEnglishLength:english.length,nativeIOC:ioc(english.slice(0,729)),
  nativeEnglishTrigramScore:score(english.slice(0,729)),
  originalFirstChapterIOC:ioc(firstChapter),originalFirstChapterTrigramScore:score(firstChapter)},
 tests,
 interpretation:"Readable original output and full forward inverse needed to establish a genuine key. Random-looking outputs reject only these four direct repeating-key trials."
},null,2));
