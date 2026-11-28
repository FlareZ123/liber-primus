'use strict';
// Agent10, Director #3389, source-only original red-span packet controls.
// No signed source, guessed unknown plaintext, or fitted cipher keys.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const source=read('resources/liber-primus/lp2-transcription.txt');
const R=new Map(corpus.runes.map((glyph,i)=>[glyph,i]));
const sequence=corpus.pages.flatMap(p=>p.indices);
let page=0,local=0,index=0,cur=[],words=[];
function emit(){
 if(cur.length) {
  assert(cur.every(x=>x.page===cur[0].page));
  words.push({page:cur[0].page,start:cur[0].pos,length:cur.length});
  cur=[];
 }
}
for(const ch of source) {
 if(R.has(ch)) {
  // Some original pages are pure graphics (p50 has zero transcribed runes).
  while(page<corpus.pages.length && local===corpus.pages[page].indices.length){
   emit();page++;local=0;
  }
  assert(page<corpus.pages.length);
  assert.equal(R.get(ch),sequence[index],'source/transcription mismatch at rune '+index);
  cur.push({page,pos:local});
  index++;local++;
 } else if(/[.\-$%&]/.test(ch)) {
  // The / and newline characters represent only line wraps.
  emit();
 }
}
emit();
assert.equal(index,13136);
assert.equal(index,sequence.length);
const spans=ink.pages.flatMap(p=>(p.red_spans||[]).map(span=>{
 const starts=(p.large_punctuation||[])
   .some(m=>m[0]===span.start && m[1]===13 && m[2]==='red');
 const ends=(p.large_punctuation||[])
   .some(m=>m[0]===span.start+span.length && m[1]===13 && m[2]==='red');
 const lengths=words.filter(w=>w.page===p.page&&w.start>=span.start&&
   w.start+w.length<=span.start+span.length).map(w=>w.length);
 assert.equal(lengths.reduce((a,b)=>a+b,0),span.length);
 return {page:p.page,start:span.start,end:span.start+span.length,
   length:span.length,wordLengths:lengths,
   red13AtStart:starts,red13AtEnd:ends,doubleBracketed:starts&&ends};
}));
const bracketed=spans.filter(x=>x.doubleBracketed);
assert.equal(spans.length,18);
assert.equal(bracketed.length,7);
assert.deepEqual(bracketed.map(x=>[x.page,x.start,x.length]),[
  [3,119,3],[6,71,11],[7,194,14],[15,0,9],[15,9,11],
  [33,91,8],[39,119,3]
]);
const red11bracketed=bracketed.filter(x=>x.length===11);
assert.deepEqual(red11bracketed.map(x=>[x.page,x.start,x.wordLengths]),[
  [6,71,[4,1,4,2]],
  [15,9,[4,2,5]]
]);
const exactlyFour=spans.filter(x=>x.wordLengths.length===4);
assert.deepEqual(exactlyFour.map(x=>[x.page,x.wordLengths]),[
  [6,[4,1,4,2]],[23,[2,6,3,5]]
]);
assert.equal(spans.filter(x=>x.doubleBracketed&&x.wordLengths.length===4).length,1);
assert.equal(spans.filter(x=>x.wordLengths.join(',')==='4,1,4,2').length,1);
const control=spans.filter(x=>x.page>=56);
assert.deepEqual(control.map(x=>[x.page,x.length,x.doubleBracketed]),[
  [56,5,false],[57,7,false]
]);
console.log(JSON.stringify({schema:1,sourceOnly:true,originalRunes:index,
  physicalPages:corpus.pages.length,transcribedWords:words.length,
  redSpans:spans.length,bracketedRed13:bracketed.length,
  red11Bracketed:red11bracketed.map(x=>({page:x.page,start:x.start,
    wordLengths:x.wordLengths})),
  exactlyFourWords:exactlyFour.map(x=>({page:x.page,start:x.start,
    wordLengths:x.wordLengths,bracketed:x.doubleBracketed})),
  bracketed,solvedControls:control,
  decision:'The 11-red-plus-K-to-13-bracket relation repeats at p15; four-word [4,1,4,2] red content and full bracket make p6 specific.'},null,2));
