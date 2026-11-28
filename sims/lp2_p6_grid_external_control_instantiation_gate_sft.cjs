'use strict';
// Agent44, Director #3407: source-only instantiation gate for the frozen p6 L/C/T/R grid.
// No signed-source targets, receiver contents, fitted keys, or language scoring.
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
  if(cur.length){
    assert(cur.every(x=>x.page===cur[0].page));
    words.push({page:cur[0].page,start:cur[0].pos,length:cur.length});
    cur=[];
  }
}
for(const ch of source){
  if(R.has(ch)){
    while(page<corpus.pages.length && local===corpus.pages[page].indices.length){
      emit(); page++; local=0;
    }
    assert(page<corpus.pages.length);
    assert.equal(R.get(ch),sequence[index],'source/transcription mismatch at rune '+index);
    cur.push({page,pos:local}); index++; local++;
  } else if(/[.\-$%&]/.test(ch)) emit();
}
emit();
assert.equal(index,13136);
assert.equal(index,sequence.length);

const spans=ink.pages.flatMap(p=>(p.red_spans||[]).map(span=>{
  const start13=(p.large_punctuation||[]).some(m=>
    m[0]===span.start&&m[1]===13&&m[2]==='red');
  const end13=(p.large_punctuation||[]).some(m=>
    m[0]===span.start+span.length&&m[1]===13&&m[2]==='red');
  const wordLengths=words.filter(w=>w.page===p.page&&w.start>=span.start&&
    w.start+w.length<=span.start+span.length).map(w=>w.length);
  assert.equal(wordLengths.reduce((a,b)=>a+b,0),span.length);
  return {
    page:p.page,start:span.start,length:span.length,wordLengths,
    start13,end13,hasBoundary13:start13||end13,
    hasPrintedSingleton:wordLengths.includes(1),
  };
}));
assert.equal(spans.length,18);

// Minimal source-visible skeleton actually consumed by the frozen #3388 program:
// 1) four red words to supply r0..r3;
// 2) a boundary red13 stencil to type the 4/5/4 output geometry;
// 3) a printed singleton width1 to supply the repeated literal +1 field.
// The Fehu/F=0 anchor is an additional p6-local requirement, so failing this
// three-predicate preflight is already sufficient to reject instantiation.
const fourWord=spans.filter(x=>x.wordLengths.length===4);
assert.deepEqual(fourWord.map(x=>[x.page,x.start,x.wordLengths,x.hasBoundary13]),[
  [6,71,[4,1,4,2],true],
  [23,0,[2,6,3,5],true],
]);
const skeleton=fourWord.filter(x=>x.hasBoundary13&&x.hasPrintedSingleton);
assert.deepEqual(skeleton.map(x=>[x.page,x.start]),[[6,71]]);

// The previously established transformed analogue is exact, but it does not
// create the missing singleton: adjacent H on p6 lengths, then pair swap,
// yields the literal p23 widths [K,a,e,g]=[2,6,3,5].
const mod29=x=>((x%29)+29)%29;
const adjacentH=([a,b,c,d])=>[mod29(a-b),mod29(a+b),mod29(c-d),mod29(c+d)];
const p6=[4,1,4,2];
const h6=adjacentH(p6);
assert.deepEqual(h6,[3,5,2,6]);
const pairSwap=[h6[2],h6[3],h6[0],h6[1]];
assert.deepEqual(pairSwap,[2,6,3,5]);
assert.equal(pairSwap.includes(1),false);

// The strongest bracket control p15 cannot supply four roles.
const p15=spans.filter(x=>x.page===15&&x.hasBoundary13);
assert.deepEqual(p15.map(x=>x.wordLengths),[[4,5],[4,2,5]]);

console.log(JSON.stringify({
  status:'PASS',
  redSpans:spans.length,
  frozenProgramInputs:{
    fourRedFields:'r0..r3',
    boundaryStencil:'red13 -> 4/5/4',
    printedSingleton:'width1 -> literal +1',
    additionalP6Anchor:'adjacent Fehu -> F=0',
  },
  fourWordBoundary13Candidates:fourWord.map(x=>({
    page:x.page,start:x.start,wordLengths:x.wordLengths,
    hasBoundary13:x.hasBoundary13,hasPrintedSingleton:x.hasPrintedSingleton,
  })),
  exactSkeletonCandidates:skeleton.map(x=>({page:x.page,start:x.start})),
  transformedP23:{
    p6AdjacentH:h6,
    pairSwap,
    equalsP23:true,
    suppliesPrintedSingleton:false,
  },
  p15Controls:p15.map(x=>({start:x.start,wordLengths:x.wordLengths})),
  conclusion:'No held-out red object can instantiate the frozen p6 L/C/T/R input extraction. P23 is the only four-word red13-boundary analogue but lacks the printed singleton (and visually lacks the p6 Fehu/F anchor); p15 has the red13 geometry but not four fields. Borrowing p6-only constants would no longer be an unchanged source-local control.',
},null,2));
