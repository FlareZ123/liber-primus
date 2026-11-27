"use strict";
/** Reproduce the Singer chapter-17 / p22 quotation boundary gate.
 * Run from any directory: node sims/lp2_singer_p22_quotation_sft.cjs
 * Source quote fingerprints are fixed from the cited literary witness.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");
const root = path.join(__dirname,"..");
const raw = fs.readFileSync(path.join(root,"resources/transcriptions/lp2-image-corrected.txt"),"utf8");
const corpus = JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const alphabet = corpus.translit;
const glyphs = corpus.runes;
let pos=0,start=0,word="",words=[];
function flush(){if(word){words.push({start,end:pos,word});word="";}}
for(const ch of raw){
  if(glyphs.includes(ch)){if(!word)start=pos;word+=ch;pos++;}
  else if(ch==="%"||ch==="/"||/\s/u.test(ch)){}
  else flush();
}
flush();
const q=words.filter(w=>w.start>=5459&&w.end<=5478);
assert.equal(q[0].start,5459);assert.equal(q.at(-1).end,5478);
const shape=q.map(w=>w.word.length);
assert.deepEqual(shape,[3,3,4,5,4]);
const tape=q.map(w=>w.word).join("");
assert.equal(createHash("sha256").update(tape).digest("hex"),
  "4f6afe50dd170c5f13fd7ac120084a6660396bead790e11bbf36a2919e58dcd0");
const c=[...tape].map(g=>glyphs.indexOf(g));
const flat=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.deepEqual(c,flat.slice(5459,5478));
// Full chapter: only two outer quotation pairs have five words.
// The remaining ten contain more than five words. The cited Bible verse
// is twelve words; its two questions are six each.
const tests={
  angel:[4,3,4,2,2],
  borrowed:[3,4,2,8,4],
  lease:[2,3,1,3,4,2,4],
  paul:[2,3,5,2,2,3,2,5,5,2,2,7],
  paulFirst:[2,3,5,2,2,3],
  paulSecond:[2,5,5,2,2,7]
};
for(const [name,s] of Object.entries(tests)){
  assert.notDeepEqual(s,shape);
  console.log(name,JSON.stringify(s),s.reduce((a,b)=>a+b,0));
}
// The seven-word idiom alone shares total length in this bounded set.
// Explicit native GP encoding; no unknown letters, no fitting.
const p="H E G O T A N E W L EA S E O N L I F E".split(" ").map(g=>alphabet.indexOf(g));
assert.ok(p.every(x=>x>=0));assert.equal(p.length,c.length);
assert.equal(p[17],0);assert.equal(c[17],28);assert.ok(!c.includes(0));
const mod=x=>(x%29+29)%29;
const periods=a=>Array.from({length:a.length},(_,i)=>i+1).filter(k=>a.every((v,i)=>i<k||v===a[i-k]));
const additive=periods(p.map((v,i)=>mod(c[i]-v)));
const beaufort=periods(p.map((v,i)=>mod(c[i]+v)));
assert.deepEqual(additive,[19]);assert.deepEqual(beaufort,[19]);
assert.ok(p.some((v,i)=>p.some((w,j)=>v===w&&c[i]!==c[j])));
console.log(JSON.stringify({offsets:[5459,5478],shape,additive,beaufort,
  fSkipCompatible:false,monoalphabeticCompatible:false,authenticatedCrib:false}));
