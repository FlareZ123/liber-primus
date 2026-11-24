"use strict";
// Original GP29 word-wise multiplicative Newton transform; read-only.
// Run: node sims/lp2_word_multiplicative_newton_original_sft.cjs
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const read = p => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcript = read("resources/liber-primus/lp2-transcription.txt");
const mapping = new Map(corpus.runes.map((x,i)=>[x,i]));
/** @param {string} t @returns {number[][]} */
const parse = t => t.replace(/[%/\s]/gu,"").split(/[^\u16a0-\u16ff]+/u).filter(Boolean).map(w=>[...w].map(x=>mapping.get(x)));
const words = parse(transcript.split("%").slice(0,55).join(""));
assert.equal(words.length,2896);
assert.deepEqual(words.flat(),corpus.pages.slice(0,56).flatMap(p=>p.indices));
assert.equal(words.flat().length,12956);
const p57 = parse(transcript.split("%")[56]);
assert.deepEqual(p57.flat(),corpus.pages[57].indices);
assert.equal(p57.flat().length,95);
const di={TH:2,NG:21,ING:21,EO:12,OE:22,AE:25,IA:27,IO:27,EA:28};
const le={A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,K:5,L:20,M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,W:7,X:14,Y:26,Z:15};
/** @param {string} s @returns {number[]} */
function encode(s) {
  const a=[];
  for(let i=0;i<s.length;) {
    const n=[3,2].find(n=>di[s.slice(i,i+n)]!==undefined&&s.slice(i,i+n).length===n);
    if(n){a.push(di[s.slice(i,i+n)]);i+=n;}
    else {a.push(le[s[i]]);i++;}
  }
  return a;
}
const lex=new Set(read("resources/control/english_wordfreq_textblob.txt").split("\n")
 .filter(l=>/^[a-z]+ \d+$/.test(l.trim()))
 .map(l=>encode(l.trim().split(" ")[0].toUpperCase()).join(",")));
assert.equal(lex.size,29059);
const powers=[1];
for(let i=1;i<28;i++)powers.push(powers[i-1]*2%29);
assert.equal(new Set(powers).size,28);
const logs=new Map(powers.map((x,i)=>[x,i]));
const mod=x=>(x%28+28)%28;
/** @param {number[]} w @returns {number[]} */
function diff(w){
 let a=w.slice(),out=[];
 while(a.length){out.push(a[0]);a=a.slice(1).map((x,i)=>mod(x-a[i]));}
 return out;
}
/** @param {number[]} w @returns {number[]} */
function undiff(w){
 let a=[];
 for(let k=w.length-1;k>=0;k--){let b=[w[k]];for(const x of a)b.push(mod(b[b.length-1]+x));a=b;}
 return a;
}
/** @param {number[]} word @param {boolean} reverse @param {boolean} inverse @returns {number[]} */
function trans(word,reverse,inverse){
 let t=reverse?word.slice().reverse():word.slice();
 const nz=t.filter(x=>x!==0).map(x=>logs.get(x));
 const z=(inverse?undiff:diff)(nz).map(x=>powers[x]);
 let k=0;t=t.map(x=>x===0?0:z[k++]);
 return reverse?t.reverse():t;
}
/** @param {number[][]} ws */
function stats(ws){
 const a=ws.flat(),h=Array(29).fill(0);
 a.forEach(x=>h[x]++);
 const long=ws.filter(w=>w.length>=5),hits=long.filter(w=>lex.has(w.join(",")));
 const roman=w=>w.map(x=>corpus.translit[x]).join("");
 return {ioc:h.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1)),
  adj:a.slice(1).filter((x,i)=>x===a[i]).length,long:long.length,hits:hits.length,
  matched:hits.slice(0,30).map(roman),prefix:ws.slice(0,12).map(roman).join(" ")};
}
console.log(JSON.stringify({raw:stats(words),native:stats(p57)},null,2));
for(const reverse of [false,true])for(const inverse of [false,true]){
 const f=w=>trans(w,reverse,inverse),g=w=>trans(w,reverse,!inverse);
 const z=words.map(f);
 assert.deepEqual(z.map(g),words);
 assert.deepEqual(p57.map(g).map(f),p57);
 const s=stats(z);
 console.log(JSON.stringify({reverse,inverse,...s},null,2));
 assert.equal(s.long,1132);
 assert.equal(s.hits,0);
}
console.log("PASS: full original replay and all four native p57 plants.");
