#!/usr/bin/env node
'use strict';

/*
 * Terminal chapter OUT=3 pointer semantics gate.
 *
 * This intentionally does NOT inspect p3's field arithmetic. It reconstructs
 * the already-frozen nine-chapter SUM->PRODUCT graph from original resources,
 * then charges the natural address semantics named in Director issue #3421.
 *
 * Usage: node sims/lp2_chapter_terminal3_pointer_semantics_sft.cjs
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');

const root=path.resolve(__dirname,'..');
const load=p=>fs.readFileSync(path.join(root,p),'utf8');
const book=JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const red=JSON.parse(load('resources/liber-primus/lp2-ink-annotations.json'));
const transcript=load('resources/liber-primus/lp2-transcription.txt').replace(/\r/g,'').split('%');
const ids=new Map(book.runes.map((r,i)=>[r,i]));
const chapters=[0,3,8,15,23,27,33,40,54];

function firstBlackRecord(page){
  const source=book.pages.find(x=>x.page===page).indices;
  const ink=red.pages.find(x=>x.page===page);
  assert.equal(ink.red_spans[0].start,0);
  let titleEnd=ink.red_spans[0].length;
  for(let j=1;j<ink.red_spans.length&&ink.red_spans[j].start===titleEnd;j++){
    titleEnd+=ink.red_spans[j].length;
  }

  const segment=transcript[page>=51?page-1:page];
  const words=[];
  let current=[];
  let offset=0;
  const flush=()=>{if(current.length){words.push(current);current=[];}};
  for(const ch of segment){
    if(ids.has(ch)){
      assert.equal(source[offset],ids.get(ch),`transcription mismatch p${page}@${offset}`);
      current.push(offset++);
    }else if(ch==='/'||/\s/u.test(ch)){
      continue;
    }else{
      flush();
    }
  }
  flush();
  assert.equal(offset,source.length);
  const first=words.find(w=>w[0]===titleEnd);
  assert.ok(first,`missing first black word p${page}`);
  const values=first.map(i=>source[i]);
  return {
    page,
    in:values.reduce((s,x)=>s+x,0)%29,
    out:values.reduce((s,x)=>s*x%29,1),
    length:values.length,
    firstBlackStart:first[0],
  };
}

const records=chapters.map(firstBlackRecord);
assert.deepEqual(records.map(x=>x.in), [15,9,23,22,25,2,5,27,19]);
assert.deepEqual(records.map(x=>x.out),[23,11,2,13,16,19,3,3,27]);

const route=[0];
const hops=[];
let cursor=0;
while(true){
  const current=records.find(x=>x.page===cursor);
  const targets=records.filter(x=>x.in===current.out);
  if(!targets.length)break;
  assert.equal(targets.length,1);
  const next=targets[0].page;
  hops.push({from:cursor,value:current.out,to:next});
  route.push(next);
  cursor=next;
}
assert.deepEqual(route,[0,8,27,54,40]);
assert.deepEqual(hops,[
  {from:0,value:23,to:8},
  {from:8,value:2,to:27},
  {from:27,value:19,to:54},
  {from:54,value:27,to:40},
]);
const terminal=records.find(x=>x.page===40);
assert.equal(terminal.out,3);
assert.equal(records.filter(x=>x.in===terminal.out).length,0);

const uniformPhysical=hops.map(h=>({
  from:h.from,
  value:h.value,
  physicalPage:h.value,
  routeTarget:h.to,
  match:h.value===h.to,
  physicalIsChapter:chapters.includes(h.value),
}));
assert.equal(uniformPhysical.filter(x=>x.match).length,0);
assert.deepEqual(uniformPhysical.filter(x=>x.physicalIsChapter).map(x=>x.value),[23,27]);

const fallback={
  stop:null,
  physicalPage:terminal.out,
  chapterOrdinalZero:chapters[terminal.out],
  chapterOrdinalOne:chapters[terminal.out-1],
  stateValue:'e',
  currentPageWordIndex:terminal.out,
};
assert.deepEqual(fallback,{
  stop:null,
  physicalPage:3,
  chapterOrdinalZero:15,
  chapterOrdinalOne:8,
  stateValue:'e',
  currentPageWordIndex:3,
});

const deadEnds=records.filter(r=>!records.some(t=>t.in===r.out));
assert.deepEqual(deadEnds.map(x=>[x.page,x.out]),[
  [3,11],[15,13],[23,16],[33,3],[40,3],
]);
assert(deadEnds.every(x=>x.out>=0&&x.out<=55));
assert.deepEqual(deadEnds.filter(x=>x.out===3).map(x=>x.page),[33,40]);

const redSpanCount=page=>{
  const x=red.pages.find(z=>z.page===page);
  return x?.red_spans?.length||0;
};
const candidatePageDestinations=[
  fallback.physicalPage,
  fallback.chapterOrdinalZero,
  fallback.chapterOrdinalOne,
];
assert.deepEqual(candidatePageDestinations,[3,15,8]);
assert(candidatePageDestinations.every(p=>redSpanCount(p)>0));

console.log(JSON.stringify({
  classification:'bounded negative: terminal OUT=3 does not source-select physical p3',
  chapterRecords:records,
  frozenRoute:route,
  hops,
  terminal:{page:40,out:terminal.out,inRecipient:null},
  uniformPhysical,
  fallback,
  deadEnds:deadEnds.map(x=>({page:x.page,out:x.out,physicalFallback:x.out})),
  competingMarkedPageDestinations:candidatePageDestinations.map(page=>({
    page,redSpanCount:redSpanCount(page)
  })),
  decision:'retain p40 OUT=3 as a graph stop/state value; physical p3 requires an extra unlicensed fallback type switch',
},null,2));
