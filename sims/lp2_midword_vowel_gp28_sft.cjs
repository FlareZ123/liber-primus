'use strict';
/**
 * Single-file test of one fully specified, lossless mid-word insertion codec.
 * Cipher hypothesis, not a claimed historical LP2 decipherment. Node.js 22.
 * The solved-p56 literal-F non-consuming clock is preserved. The other 28
 * symbols use a reserved-zero, mod-28 transport, unlike actual p56's mod29.
 * Every >=3-rune plaintext word starting in U/O/I/E/A receives exactly one
 * internal unkeyed marker at floor(length/2). It carries no external flag.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const gp=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const source=fs.readFileSync(path.join(root,'resources/liber-primus/lp2-transcription.txt'),'utf8');
const ids=new Map(gp.runes.map((x,i)=>[x,i]));
/** Preserve original printed word boundaries across line and page wraps. */
function parse(s){
  const out=[];let w=[];
  for(const ch of s){
    if(ids.has(ch)){w.push(ids.get(ch));continue;}
    if(ch==='/'||ch==='%'||/\s/u.test(ch))continue;
    if(w.length){out.push(w);w=[];}
  }
  if(w.length)out.push(w);
  return out;
}
const cipherWords=parse(source.split('%').slice(0,55).join('%'));
assert.equal(cipherWords.length,2896);
assert.equal(cipherWords.flat().length,12956);
assert.deepEqual(cipherWords.flat(),gp.pages.filter(x=>x.page<=55).flatMap(x=>x.indices));
const p57=gp.pages.find(x=>x.page===57).indices;
const original57=source.split('%').map(parse).findLast(ws=>ws.flat().length===95&&
  ws.flat().every((n,i)=>n===p57[i]));
assert.ok(original57);
assert.equal(original57.length,20);
/** Generate first 15,000 standard consecutive primes. */
function firstPrimes(){
  const max=200000,sieve=new Uint8Array(max+1),out=[];
  for(let p=2;p<=max&&out.length<15000;p++)if(!sieve[p]){
    out.push(p);if(p*p<=max)for(let i=p*p;i<=max;i+=p)sieve[i]=1;
  }
  assert.equal(out.length,15000);
  return out;
}
const primes=firstPrimes(),vowels=new Set([1,3,10,18,24]);
const k28=j=>(primes[j]-1)%28;
const mark=j=>(primes[j]-1)%29;
/** GP28 reversible non-F emission, literal GP F zero never consumes key. */
function emit(p,j){
  return p===0?{c:0,j}:{c:1+(p-1+k28(j))%28,j:j+1};
}
function take(c,j){
  return c===0?{p:0,j}:{p:1+(c-1-k28(j)+28)%28,j:j+1};
}
/** @param {number[][]} words */
function encode(words){
  let j=0;const rows=[],inserts=[];
  for(let wi=0;wi<words.length;wi++){
    const w=words[wi];assert.ok(w.length);
    const add=w.length>=3&&vowels.has(w[0]),at=Math.floor(w.length/2),row=[];
    for(let i=0;i<w.length;i++){
      if(add&&i===at){inserts.push([wi,row.length]);row.push(mark(j));}
      const x=emit(w[i],j);row.push(x.c);j=x.j;
    }
    rows.push(row);
  }
  return {rows,inserts,j};
}
/**
 * Exact inverse. Given printed word lengths, the first decoded rune decides
 * the unique insertion flag; the flag and word length fix the marker position.
 * A three-rune vowel-initial ciphertext word has no possible preimage.
 * For uniform source plaintext P of length N, the model gives probability
 * 29^(-N) to a legal ciphertext and zero to an illegal ciphertext.
 */
function decode(rows){
  let j=0;const out=[];
  for(let wi=0;wi<rows.length;wi++){
    const row=rows[wi];assert.ok(row.length);
    const first=take(row[0],j),isVowel=vowels.has(first.p);
    if(isVowel&&row.length===3)
      throw Error('impossible vowel-first length3 at word '+wi);
    const add=isVowel&&row.length>=4, n=row.length-Number(add);
    let ci=0;const w=[];
    for(let i=0;i<n;i++){
      if(add&&i===Math.floor(n/2)){
        if(row[ci]!==mark(j))throw Error('wrong marker at word '+wi+
          ', ciphertext position '+ci+', got '+row[ci]+', expected '+mark(j));
        ci++;
      }
      const x=take(row[ci++],j);w.push(x.p);j=x.j;
    }
    assert.equal(ci,row.length);
    assert.equal(w[0],first.p);
    out.push(w);
  }
  return {rows:out,j};
}
const known=Array.from({length:3},()=>original57).flat();
assert.equal(known.flat().length,285);
const planted=encode(known),again=decode(planted.rows);
assert.deepEqual(again.rows,known);
assert.equal(again.j,planted.j);
assert.equal(planted.rows.flat().length,285+planted.inserts.length);
assert.ok(planted.inserts.length);
const wrong=planted.rows.map(row=>row.slice()),[wi,ci]=planted.inserts[0];
wrong[wi][ci]=(wrong[wi][ci]+1)%29;
assert.throws(()=>decode(wrong),/wrong marker/);
console.log('NATIVE PLANT: 285/285 recovered runes, '+planted.inserts.length+
  ' internal non-consuming markers, '+known.length+' real-word slots, exact roundtrip');
console.log('WRONG PROTOCOL: changed first insertion marker, strict rejection');
/** Known original p56 from independent historical plaintext. */
const tokens=gp.translit.map((glyph,i)=>({glyph,i})).sort((a,b)=>b.glyph.length-a.glyph.length);
const originalText='AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO '+
  'IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const clear56=[];
for(const word of originalText.split(' '))for(let i=0;i<word.length;){
  const hit=tokens.find(t=>word.startsWith(t.glyph,i));assert.ok(hit);
  clear56.push(hit.i);i+=hit.glyph.length;
}
assert.equal(clear56.length,85);
let j=0;const native56=clear56.map((p,i)=>{
  if(i===56){assert.equal(p,0);return 0;}
  return (p+primes[j++]-1)%29;
});
assert.deepEqual(native56,gp.pages.find(x=>x.page===56).indices);
assert.equal((28+primes[0]-1)%29,0);
console.log('AUTHENTIC CONTROL: solved p56 matches 85/85, with F at rune 56 unkeyed');
console.log('NATIVE GF29 AMBIGUITY: at key prime2, F(0) and EA(28) both emit F(0); skip bit needed');
let off=0;const start=new Map();
for(const page of gp.pages.filter(x=>x.page<=55)){start.set(page.page,off);off+=page.indices.length;}
assert.equal(off,12956);
function sliceWords(lo,hi){
  let offset=0;const words=[];
  for(const w of cipherWords){
    const next=offset+w.length;
    if(offset>=lo&&next<=hi)words.push(w);
    offset=next;
  }
  return words;
}
for(const spec of [
  {name:'p0-2 original',lo:0,hi:start.get(3)},
  {name:'p40-41 untouched',lo:start.get(40),hi:start.get(42)}
]){
  const words=sliceWords(spec.lo,spec.hi),n=words.flat().length;
  assert.ok(n>=150);
  try{
    const result=decode(words);
    assert.deepEqual(encode(result.rows).rows,words);
    console.log(spec.name+': survived '+n+' runes, independent linguistic validation needed');
  }catch(err){
    console.log(spec.name+': REJECT after original '+n+'-rune / '+words.length+
      '-word input; '+err.message);
  }
}
