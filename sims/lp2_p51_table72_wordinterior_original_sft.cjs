'use strict';
/**
 * Original-image p51: nine numeric rows of eight cells = 72 printed tokens.
 * The source physical p51 ciphertext has 92 GP runes in 20 separate
 * word-start fragments, hence exactly 72 within-word successors.
 *
 * Test the one-cell/one-successor direct GP29 shift and GP29 plaintext
 * difference ("word initial = IV") inverses. The corpus does not specify
 * either operation, token radix, sign or a key; this is a bounded original
 * source test, not an invented plaintext.
 *
 * Windows 11 / Node.js 22 / CommonJS. Run from repository root:
 *   node sims/lp2_p51_table72_wordinterior_original_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'), path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const text=read('resources/liber-primus/lp2-transcription.txt');
const lookup=new Map(corpus.runes.map((ch,i)=>[ch,i]));
const physicalSources=text.split('%');
assert.equal(physicalSources.length,57);
const phys51=physicalSources[50];
// A '%' physical page boundary is transparent to complete words, so the
// physical fragment PLF on p51 continues into p52 as source 'P-'.
const p52=physicalSources[51];
assert(p52.trimStart().startsWith(corpus.runes[13]));
const fragments=phys51.split(/[-.$&]/)
  .map(block=>[...block].filter(ch=>lookup.has(ch)).map(ch=>lookup.get(ch)))
  .filter(word=>word.length>0);
const flat=fragments.flat();
assert.equal(fragments.length,20);
assert.equal(flat.length,92);
assert.deepEqual(flat,corpus.pages[51].indices);
const sourceSection=table.pages.find(p=>p.page===51);
assert(sourceSection);
assert.equal(sourceSection.rows,9);
assert.equal(sourceSection.cols,8);
const keys=sourceSection.bytes;
assert.deepEqual(sourceSection.tokens.slice(0,6),
  ['28','2a','0J','1L','0c','3C']);
assert.equal(keys.length,72);
assert.equal(sourceSection.tokens.length,72);
assert.equal(fragments.reduce((n,w)=>n+w.length-1,0),keys.length);
// Independently verify this is unique among all 55 physical rune pages.
const pageCounts=[];
for(let i=0;i<55;i++){
  const segment=physicalSources[i];
  const bits=segment.split(/[-.$&]/)
    .map(x=>[...x].filter(ch=>lookup.has(ch)))
    .filter(x=>x.length>0);
  const page=i>=50?i+1:i;
  const n=bits.reduce((acc,word)=>acc+word.length-1,0);
  pageCounts.push({page,runes:bits.flat().length,starts:bits.length,
    successors:n});
}
assert.deepEqual(pageCounts.filter(x=>x.successors===72)
  .map(x=>x.page),[51]);
const diff=(a,b)=>((a-b)%29+29)%29;
/**
 * The source-visible 20 word starts are preserved as literal IVs;
 * one of 72 keys advances for each non-initial rune. When feedback is
 * on, previous c (ciphertext) is the word-local state.
 * @param {number[][]} original
 * @param {number[]} bytes
 * @param {1|-1} sign
 * @param {boolean} feedback
 * @returns {number[][]}
 */
function decode(original,bytes,sign,feedback){
  let index=0;
  const out=original.map(word=>word.map((c,i)=>{
    if(i===0)return c;
    const k=bytes[index++]%29;
    return diff(c,(feedback?word[i-1]:0)+sign*k);
  }));
  assert.equal(index,72);
  return out;
}
/**
 * Forward re-encrypt according to corresponding fixed, fully invertible
 * cipher model. Positives must recover all 92 GP symbols and exact word
 * boundaries; key output is byte indices reduced mod29.
 * @param {number[][]} plain
 * @param {number[]} bytes
 * @param {1|-1} sign
 * @param {boolean} feedback
 * @returns {number[][]}
 */
function encode(plain,bytes,sign,feedback){
  let index=0;
  const out=plain.map(word=>{
    const current=[word[0]];
    for(let i=1;i<word.length;i++){
      const k=bytes[index++]%29;
      const prev=feedback?current[i-1]:0;
      current.push((word[i]+prev+sign*k)%29);
    }
    return current;
  });
  assert.equal(index,72);
  return out;
}
function score(words){
  const arr=words.flat(),f=Array(29).fill(0);
  for(const x of arr)f[x]++;
  return {n:arr.length,ioc:f.reduce((n,x)=>n+x*(x-1),0)/(arr.length*(arr.length-1)),
    topFive:f.slice().sort((a,b)=>b-a).slice(0,5).reduce((a,b)=>a+b,0),
    sample:words.slice(0,9).map(word=>word.map(v=>corpus.translit[v]).join(' ')).join(' / ')};
}
const source=score(fragments);
const variants=[];
for(const sign of [-1,1]){
  for(const feedback of [false,true]){
    const plain=decode(fragments,keys,sign,feedback);
    assert.deepEqual(encode(plain,keys,sign,feedback),fragments);
    const test=score(plain);
    variants.push({sign,feedback,...test});
  }
}
const trueGP=corpus.pages[57].indices;
assert.equal(trueGP.length,95);
const native=(()=>{
  let n=0;
  return fragments.map(word=>word.map(()=>trueGP[n++]));
})();
assert.deepEqual(native.flat(),trueGP.slice(0,92));
const plants=[];
for(const sign of [-1,1])for(const feedback of [false,true]){
  const encoded=encode(native,keys,sign,feedback);
  assert.deepEqual(decode(encoded,keys,sign,feedback),native);
  const wrongKey=table.pages.find(x=>x.page===49).bytes.slice(0,72);
  const wrongDecoded=decode(encoded,wrongKey,sign,feedback);
  const correct=wrongDecoded.flat().filter((v,i)=>v===native.flat()[i]).length;
  assert(correct<70);
  plants.push({sign,feedback,sourceNativeGPRecovered:92,
    wrongPage49KeyRecovered:correct});
}
const clear57=score([corpus.pages[57].indices]);
assert(clear57.ioc>0.05);
assert(variants.every(v=>v.ioc<0.04));
console.log(JSON.stringify({
  hypothesis:'One source printed numeric cell for each following rune within the same printed word, first rune as a carried clear/IV',
  geometry:{tableRows:9,tableColumns:8,tableCells:72,
    p51OriginalRunes:92,printedP51Fragments:20,
    p51Interiors:72,uniqueAmong55PhysicalRunePages:true,
    p51ToP52CrossPageWord:'PLF + P',
    p49NumeralCells:80,p50NumeralCells:104},
  source,realP51CandidateInverses:variants,
  solvedP57NativeReference:clear57,
  genuineNative92RunePlants:plants,
  result:'The physical 72-to-72 equality is exact, not an authored mapping. Under actual printed base60 bytes in row-major order, both direct additive GP29 and word-initial-IV difference, each sign, remain non-GP-prose and have source IoC <0.04; exact forward re-encryption and real solved-native positive plants pass. No authentic unknown plaintext, instruction, key or destination.'
},null,2));
