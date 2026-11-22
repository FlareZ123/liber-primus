"use strict";
/**
 * Original LP2: exact two-ciphertext-history 16-symbol register capacity.
 * Run from repository root: node sims/lp2_two_cipher_history_16alphabet_capacity_sft.cjs
 * No network, external modules, fitted natural-language model, or file writes.
 * @module lp2_two_cipher_history_16alphabet_capacity_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const physical = gp.pages.filter(p => p.page <= 55 && p.indices.length);
const starts = [0,3,8,15,23,27,33,40,54];
const alphabet = 29;
const n = physical.reduce((sum,p) => sum+p.indices.length, 0);
assert.equal(n, 12956);
assert.equal(physical.length, 55);
/** @param {number} page */
function chapterNumber(page) {
  let ch = 0;
  while (ch + 1 < starts.length && page >= starts[ch+1]) ch++;
  return ch;
}
const chapters = starts.map((first,id) => ({
  id, indices: physical.filter(p => chapterNumber(p.page) === id)
    .flatMap(p => p.indices)
}));
assert.equal(chapters.length,9);
assert.equal(chapters.reduce((sum,x)=>sum+x.indices.length,0),12956);
/**
 * Return observed source-state output supports without fitting plaintext.
 * @param {{id:number,indices:number[]}[]} streams
 */
function measure(streams) {
  const states = new Map();
  let transitions = 0;
  for (const stream of streams) {
    const {id, indices} = stream;
    for (let i=2; i<indices.length; i++) {
      const k = id*841 + indices[i-2]*29 + indices[i-1];
      if (!states.has(k)) states.set(k, new Set());
      states.get(k).add(indices[i]);
      transitions++;
    }
  }
  const supports = Array.from(states.values(),s => s.size);
  return {transitions,states:states.size,maximum:Math.max(...supports),
    observedEdges:supports.reduce((s,x)=>s+x,0),
    above16:supports.filter(x=>x>16).length,
    histogram:Array.from({length:30},(_,i)=>[i,supports.filter(x=>x===i).length])
      .filter(([,count])=>count>0)};
}
const book = measure([{id:0,indices:physical.flatMap(p=>p.indices)}]);
const chapter = measure(chapters);
const pageScopedChapter = measure(physical.map(p=>({
  id:chapterNumber(p.page),indices:p.indices
})));
const pageScopedIndependent = measure(physical.map(p=>({
  id:p.page,indices:p.indices
})));
assert.deepEqual(
  [book.transitions, book.states, book.maximum,book.observedEdges,book.above16],
  [12954,840,19,9945,43]
);
assert.deepEqual(
  [chapter.transitions,chapter.states,chapter.maximum,chapter.observedEdges,
    chapter.above16],
  [12938,5657,11,12464,0]
);
assert.deepEqual(
  [pageScopedChapter.transitions,pageScopedChapter.states,
    pageScopedChapter.maximum,pageScopedChapter.observedEdges],
  [12846,5642,11,12378]
);
assert.deepEqual(
  [pageScopedIndependent.transitions,pageScopedIndependent.states,
    pageScopedIndependent.maximum,pageScopedIndependent.observedEdges],
  [12846,11117,4,12791]
);

const runeIndex=new Map(gp.runes.map((r,i)=>[r,i]));
const originalTranscription=read("resources/liber-primus/lp2-transcription.txt");
const words=[];
let wordPage=0,letters=[];
const flushWord=()=>{if(letters.length){words.push({page:wordPage,indices:letters});letters=[];}};
for(const c of originalTranscription){
  if(runeIndex.has(c))letters.push(runeIndex.get(c));
  else if(c==="%"){flushWord();wordPage++;}
  else if(/[-.&$§]/u.test(c))flushWord();
}
flushWord();
const originalWords=words.filter(w=>w.page<55);
assert.equal(originalWords.length,2928);
for(let p=0;p<55;p++)
  assert.deepEqual(originalWords.filter(w=>w.page===p).flatMap(w=>w.indices),
    physical[p].indices);
/**
 * Word-reset decoder, including start sentinel states. All source words and
 * punctuation are frozen independently of the canonical ciphertext array.
 * @param {(p:number)=>number} sourceScope
 */
function wordResetCapacity(sourceScope) {
  const support=new Map();
  for(const word of originalWords){
    let a=-1,b=-1;
    for(const rune of word.indices){
      const key=sourceScope(word.page)+":"+a+":"+b;
      if(!support.has(key))support.set(key,new Set());
      support.get(key).add(rune);
      a=b;b=rune;
    }
  }
  const counts=Array.from(support.values(),s=>s.size);
  return {states:support.size,maximum:Math.max(...counts),
    above16:counts.filter(x=>x>16).length,
    wordStartSupports:Array.from({length:9},(_,i)=>
      support.get(i+":-1:-1")?.size||0)};
}
const wordGlobal=wordResetCapacity(()=>0);
const wordChapter=wordResetCapacity(p=>chapterNumber(physical[p].page));
const wordPhysical=wordResetCapacity(p=>p);
assert.deepEqual([wordGlobal.states,wordGlobal.maximum,wordGlobal.above16],[867,29,30]);
assert.deepEqual([wordChapter.states,wordChapter.maximum,wordChapter.above16],[4570,29,22]);
assert.deepEqual([wordPhysical.states,wordPhysical.maximum,wordPhysical.above16],[7973,28,51]);
assert.deepEqual(wordChapter.wordStartSupports,[29,29,29,29,29,29,29,29,26]);

// FULL EXISTENCE WITNESS. The following tables deliberately FIT observed
// ciphertext support. They are NOT an authentic 3301 key or plaintext.
const seen = new Map();
const stateName = (id,a,b) => id+":"+a+":"+b;
for (const ch of chapters) {
  let a=-1,b=-1;
  for (const rune of ch.indices) {
    const state = stateName(ch.id,a,b);
    if (!seen.has(state)) seen.set(state,new Set());
    seen.get(state).add(rune);
    a=b;b=rune;
  }
}
assert.equal(seen.size,5675);
assert.equal(Array.from(seen.values(),s=>s.size).reduce((a,b)=>a+b,0),12482);
const tables = new Map();
for (const [state,outputs] of seen) {
  const ordered = [...outputs].sort((a,b)=>a-b);
  for (let rune=0; rune<alphabet && ordered.length<16; rune++)
    if (!outputs.has(rune)) ordered.push(rune);
  assert.equal(ordered.length,16);
  assert.equal(new Set(ordered).size,16);
  tables.set(state,ordered);
}
let fittedPositions=0;
let fittedMaxSourceSymbol=0;
for (const ch of chapters) {
  let a=-1,b=-1;
  for (const actual of ch.indices) {
    const allowed=tables.get(stateName(ch.id,a,b));
    const source=allowed.indexOf(actual);
    assert(source>=0 && source<16);
    const encrypted=allowed[source];
    const decrypted=allowed.indexOf(encrypted);
    assert.equal(encrypted,actual);
    assert.equal(decrypted,source);
    fittedMaxSourceSymbol=Math.max(fittedMaxSourceSymbol,source);
    fittedPositions++;
    a=b;b=encrypted;
  }
}
assert.equal(fittedPositions,n);
assert(fittedMaxSourceSymbol<16);
// A separate predeclared 16-symbol source: UTF-8 bytes split into nibbles.
// Real English input bytes are held wholly independently of the LP2 corpus.
const shakespeare=read("resources/control/shakespeare_first300k.txt");
const bytes=Buffer.from(shakespeare,"utf8").subarray(0,n/2);
assert.equal(bytes.length*2,n);
const nibbles=Array.from(bytes,b=>[b>>>4,b&15]).flat();
assert(nibbles.every(x=>x>=0&&x<16));
const restored=Buffer.from(Array.from({length:bytes.length},(_,i)=>
  (nibbles[2*i]<<4)|nibbles[2*i+1]));
assert.deepEqual(restored,bytes);
/**
 * Independent bijective source-control coder, no fitted mapping table.
 * For m=16 only sixteen of its 29 rune outputs can occur at a fixed state.
 * For m=29 the same constructor is a full GP29 bijection.
 * @param {number[]} source
 * @param {number} size
 */
function plant(source,size) {
  assert.equal(source.length,n);
  let pos=0, changes=0;
  for (const ch of chapters) {
    let a=-1,b=-1;
    for (let i=0;i<ch.indices.length;i++) {
      const symbol=source[pos++];
      assert(symbol>=0&&symbol<size);
      const shift=((ch.id+1)*7+(a+1)*3+(b+1)*5)%29;
      const cipher=(symbol+shift)%29;
      const inverse=(cipher-shift+29)%29;
      assert.equal(inverse,symbol);
      if (cipher !== symbol) changes++;
      a=b;b=cipher;
    }
  }
  assert.equal(pos,n);
  return {symbols:n,changedCipherPositions:changes,exact:true};
}
const hexPlant=plant(nibbles,16);
const choices=gp.translit.map((v,i)=>({v,i})).sort((a,b)=>b.v.length-a.v.length);
/** @param {string} text */
function toGP(text) {
  const normalized=text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/K/g,"C").replace(/Z/g,"S").replace(/Q/g,"C");
  const out=[];
  for (const word of normalized.match(/[A-Z]+/g)||[])
    for(let i=0;i<word.length;) {
      const ch=choices.find(x=>word.startsWith(x.v,i));
      if(ch){out.push(ch.i);i+=ch.v.length;}else i++;
    }
  return out;
}
const gpSource=toGP(shakespeare).slice(0,n);
const gpPlant=plant(gpSource,29);
const bitsPer16Injection=Array.from({length:16},(_,i)=>
  Math.log2(29-i)).reduce((a,b)=>a+b,0);
assert(Math.abs(bitsPer16Injection-70.26628179414841)<1e-9);
console.log(JSON.stringify({
  source:"Original LP2 55 rune-bearing pages 0..55; 9 source-red chapters",
  corpusRunes:n, sourceAlphabetTarget:16,
  fullBook:book,sourceChapter:chapter,
  physicalPageWithChapterKey:pageScopedChapter,
  physicalPageWithOwnKey:pageScopedIndependent,
  printedWordResets:{book:wordGlobal,chapters:wordChapter,physicalPages:wordPhysical},
  necessaryAndSufficient:"16-symbol injective map exists per state exactly iff every state has <=16 distinct outputs",
  fittedOriginalExistence:{states:seen.size,edges:12482,
    positions:fittedPositions,maximumSourceIndex:fittedMaxSourceSymbol,
    completeOriginalForwardInverse:true,meaningfulPlaintext:false},
  keyBudget:{observedStateCount:seen.size,bitsPerComplete16InputRow:bitsPer16Injection,
    fullSecretLookupBits:seen.size*bitsPer16Injection,
    fullSecretLookupBytes:seen.size*bitsPer16Injection/8,
    genuineSourceKeyFound:false},
  nativeGPControl:gpPlant,distinctNibbleUTF8Control:hexPlant,
  decision:"Full-book stationary two-ciphertext-history 16-symbol encoder impossible (19 successors). Source-chapter reset makes an arbitrary 16-symbol injective encoder possible, but requires unprovided state tables/PRNG and yields no original plaintext or key."
},null,2));
