"use strict";
/** Original LP2 full GP29+hyphen 30-symbol differentiating transducer, #1208. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.join(__dirname,"..");
const load=p=>fs.readFileSync(path.join(root,p),"utf8");
const gp=JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const original=load("resources/liber-primus/lp2-transcription.txt");
const alphabet=new Map(gp.runes.map((r,i)=>[r,i]));
/** @param {string} text @returns {number[][][]} */
function parse(text){
  const spans=[];let words=[],word=[];
  function finishWord(){if(word.length){words.push(word);word=[];}}
  function finishSpan(){finishWord();if(words.length){spans.push(words);words=[];}}
  for(const ch of text){
    if(alphabet.has(ch))word.push(alphabet.get(ch));
    else if(ch==="-")finishWord();
    else if(".$&§".includes(ch))finishSpan();
  }
  finishSpan();return spans;
}
/** @param {number[][]} words @returns {number[]} */
function pack(words){return words.flatMap((w,i)=>i?[29,...w]:w);}
/** @param {number[]} cells @param {number} [seed] @returns {number[]} */
function decode(cells,seed=29){let prev=seed;return cells.map(c=>{const p=(c-prev+30)%30;prev=c;return p;});}
/** @param {number[]} cells @param {number} [seed] @returns {number[]} */
function encode(cells,seed=29){let prev=seed;return cells.map(p=>{prev=(prev+p)%30;return prev;});}
/** @param {number[]} list @returns {number} */
function ioc(list){const f=Array(29).fill(0);for(const v of list)f[v]++;return f.reduce((s,n)=>s+n*(n-1),0)/(list.length*(list.length-1));}
const all=parse(original), unknown=all.slice(0,175),trueRunes=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(all.length,183);assert.equal(unknown.flat().length,2896);
assert.equal(trueRunes.length,12956);assert.deepEqual(unknown.flat(2),trueRunes);
const C=unknown.map(pack),P=C.map(x=>decode(x));
C.forEach((span,i)=>assert.deepEqual(encode(P[i]),span));
const cipherTape=C.flat(),plainTape=P.flat(),native=plainTape.filter(x=>x!==29);
assert.equal(cipherTape.length,15677);
assert.equal(cipherTape.filter(x=>x===29).length,2721);
assert.equal(plainTape.filter(x=>x===29).length,513);
assert.equal(native.length,15164);
assert.ok(Math.abs(ioc(native)-0.03543450888283658)<1e-12);
assert.equal(P.filter(p=>!p.includes(29)).length,40);
const lengths=P.flatMap(p=>{let len=0;const out=[];for(const v of p){if(v===29){out.push(len);len=0;}else len++;}out.push(len);return out;});
assert.equal(lengths.filter(x=>x>14).length,310);
assert.equal(lengths.filter(x=>x===0).length,13);
assert.equal(Math.max(...lengths),201);
// Original-published p57 is independently readable native GP29 English.
const sourcePages=original.split(/\r?\n%\r?\n/);
assert.equal(sourcePages.length,57);
const p57=parse(sourcePages.at(-1)),p57Words=p57.flat();
assert.equal(p57Words.length,20);
assert.deepEqual(p57Words.flat(),gp.pages.find(p=>p.page===57).indices);
assert.equal(p57Words.flat().length,95);
for(const span of p57){const t=pack(span);assert.deepEqual(decode(encode(t)),t);}
// Full original-size native-GP plant: source-authenticated p57 English
// words repeated, GP A fills the per-span residual rune budget.
let next=0;
const plant=unknown.map(span=>{
  let remaining=span.flat().length,words=[];
  while(remaining){
    const word=p57Words[next%p57Words.length];
    if(word.length<=remaining){words.push(word);remaining-=word.length;next++;}
    else {words.push([gp.translit.indexOf("A")]);remaining--;}
  }
  return words;
});
assert.equal(plant.flat(2).length,12956);
plant.forEach(span=>{const t=pack(span);assert.deepEqual(decode(encode(t)),t);});
assert.equal(C.filter(span=>encode(decode(span,0))[0]!==span[0]).length,175);
// Track original rune carriers, preserving page-carry rather than
// resetting state at physical leaf boundaries.
const projected=[];
C.forEach((span,i)=>span.forEach((x,j)=>{if(x!==29)projected.push(P[i][j]);}));
assert.equal(projected.length,12956);
let offset=0;const pageStats=[];
for(const page of gp.pages.filter(x=>x.page<=55)){
  const slice=projected.slice(offset,offset+page.indices.length);
  pageStats.push({page:page.page,n:slice.length,spaces:slice.filter(x=>x===29).length});
  offset+=page.indices.length;
}
const count=(lo,hi)=>pageStats.filter(x=>x.page>=lo&&x.page<=hi).reduce((v,x)=>({n:v.n+x.n,spaces:v.spaces+x.spaces}),{n:0,spaces:0});
assert.deepEqual(count(0,2),{n:729,spaces:28});
assert.deepEqual(count(40,53),{n:3008,spaces:92});
console.log("LP2 original 12956 runes, 2896 words, 175 transcript-fixed stops");
console.log("Source tape 15677 units / 2721 hyphens; decoded 513 spaces / 15164 runes; IoC",ioc(native));
console.log("No-space punctuation spans: 40; word runs >14: 310; longest run: 201");
console.log("p0-2",JSON.stringify(count(0,2)),"blind p40-53",JSON.stringify(count(40,53)));
console.log("Exact ciphertext and hyphen round-trip / p57 / full-size native-GP plant / 175 wrong-seed negatives: PASS");
console.log("No source-selected 30-ary opcode or genuine plaintext recovered.");
