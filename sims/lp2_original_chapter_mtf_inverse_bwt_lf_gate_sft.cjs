#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const nativeCorpus=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const chapters=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const expectedLengths=[729,1145,1729,1903,1021,1433,1680,3008,308];
const expectedCycles=[
  [2,34,331,362],
  [1,2,35,60,82,187,191,587],
  [1,2,4,5,9,29,33,716,930],
  [1,1,1,9,19,45,56,1771],
  [1,1,2,3,11,30,32,33,50,51,93,93,218,403],
  [1,8,167,267,409,581],
  [1,3,13,15,21,29,45,47,98,119,177,407,705],
  [1,1,1,1,1,1,15,157,577,2253],
  [1,1,1,1,2,46,71,185]
];
const mod=x=>(x%29+29)%29;
const initial=Array.from({length:29},(_,i)=>i);

function mtfDecode(ranks){
  const state=initial.slice(),out=[];
  for(const rank of ranks){
    assert.ok(Number.isInteger(rank)&&rank>=0&&rank<29);
    const symbol=state[rank];
    out.push(symbol);
    state.splice(rank,1);
    state.unshift(symbol);
  }
  return out;
}
function mtfEncode(symbols){
  const state=initial.slice(),out=[];
  for(const symbol of symbols){
    const rank=state.indexOf(symbol);
    assert.ok(rank>=0&&rank<29);
    out.push(rank);
    state.splice(rank,1);
    state.unshift(symbol);
  }
  return out;
}
function lastToFirst(last){
  const counts=Array(29).fill(0),starts=Array(29).fill(0),seen=Array(29).fill(0);
  for(const symbol of last)counts[symbol]++;
  for(let i=1;i<29;i++)starts[i]=starts[i-1]+counts[i-1];
  return last.map(symbol=>starts[symbol]+seen[symbol]++);
}
function cycleLengths(T){
  const visited=new Uint8Array(T.length),lengths=[];
  for(let i=0;i<T.length;i++)if(!visited[i]){
    let row=i,length=0;
    do{visited[row]=1;row=T[row];length++;}while(row!==i);
    lengths.push(length);
  }
  return lengths.sort((a,b)=>a-b);
}
function inverseBWT(last,T,primary){
  let row=primary;
  const out=Array(last.length);
  for(let i=last.length-1;i>=0;i--){out[i]=last[row];row=T[row];}
  return out;
}
// Prefix-doubling sort of cyclic rotations; deterministic tie order for
// equal rotations. This is used only for exact forward-replay validation.
function cyclicBWT(input){
  const n=input.length;
  assert.ok(n>0);
  const order=Array.from({length:n},(_,i)=>i);
  let rank=input.slice();
  for(let width=1;width<n;width*=2){
    order.sort((a,b)=>
      rank[a]-rank[b]||
      rank[(a+width)%n]-rank[(b+width)%n]||
      a-b);
    const next=Array(n).fill(0);
    for(let j=1;j<n;j++){
      const a=order[j-1],b=order[j];
      next[b]=next[a]+Number(
        rank[a]!==rank[b]||
        rank[(a+width)%n]!==rank[(b+width)%n]
      );
    }
    rank=next;
    if(rank[order[n-1]]===n-1)break;
  }
  return {
    last:order.map(i=>input[(i+n-1)%n]),
    primary:order.indexOf(0)
  };
}
function bwtLegality(last){
  const T=lastToFirst(last),cycles=cycleLengths(T);
  const equal=cycles.every(length=>length===cycles[0]);
  if(!equal)return {legal:false,cycles,reason:"unequal LF cycle lengths"};
  const candidate=inverseBWT(last,T,0);
  const replay=cyclicBWT(candidate).last;
  const legal=replay.length===last.length&&replay.every((x,i)=>x===last[i]);
  return {legal,cycles,reason:legal?"equal cycles and exact forward-BWT replay":"equal cycles but no exact forward-BWT replay"};
}

const originalResults=chapters.map(([start,end],index)=>{
  const ranks=corpus.pages
    .filter(page=>page.page>=start&&page.page<=end)
    .flatMap(page=>page.indices);
  assert.equal(ranks.length,expectedLengths[index]);
  const last=mtfDecode(ranks);
  assert.deepEqual(mtfEncode(last),ranks);
  const gate=bwtLegality(last);
  assert.deepEqual(gate.cycles,expectedCycles[index]);
  assert.equal(gate.legal,false);
  return {
    pages:start+"-"+end,
    runes:ranks.length,
    mtfRankReplay:true,
    lfCycleLengths:gate.cycles,
    legalBwtLastColumn:false,
    reason:gate.reason
  };
});

// Exact p56 prime-minus-one/F-hold clock, first-prime origin.
const primeMinusOne=[];
for(let n=2;primeMinusOne.length<13000;n++){
  let prime=true;
  for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break;}
  if(prime)primeMinusOne.push((n-1)%29);
}
function p56Cipher(plain){
  let keyIndex=0;
  return plain.map(symbol=>symbol===0?0:mod(symbol+primeMinusOne[keyIndex++]));
}
const glyphIndex=new Map(corpus.runes.map((rune,index)=>[rune,index]));
function nativeGP(section){
  return Array.from(section.source_text)
    .map(glyph=>glyphIndex.get(glyph))
    .filter(index=>index!==undefined);
}
const p56Section=nativeCorpus.sections.find(section=>section.name==="p56_an_end");
assert.ok(p56Section);
const p56Plain=nativeGP(p56Section);
const p56Authentic=p56Cipher(p56Plain);
assert.equal(p56Plain.length,85);
assert.deepEqual(p56Authentic,corpus.pages.find(page=>page.page===56).indices);

const controls=nativeCorpus.sections.map(section=>{
  const plain=nativeGP(section);
  const cipher=p56Cipher(plain);
  const transformed=cyclicBWT(cipher);
  const ranks=mtfEncode(transformed.last);
  const recoveredLast=mtfDecode(ranks);
  assert.deepEqual(recoveredLast,transformed.last);
  const gate=bwtLegality(recoveredLast);
  assert.equal(gate.legal,true);
  assert.deepEqual(gate.cycles,[plain.length]);
  const T=lastToFirst(recoveredLast);
  const recoveredCipher=inverseBWT(recoveredLast,T,transformed.primary);
  assert.deepEqual(recoveredCipher,cipher);
  const replay=cyclicBWT(recoveredCipher);
  assert.deepEqual(replay.last,recoveredLast);
  assert.equal(replay.primary,transformed.primary);
  return {
    name:section.name,
    runes:plain.length,
    p56Cipher:true,
    bwtThenMtf:true,
    mtfInverseExact:true,
    lfCycles:gate.cycles,
    inverseBwtExact:true,
    forwardReplayExact:true,
    plantedPrimary:transformed.primary
  };
});
assert.equal(controls.length,9);
assert.deepEqual(controls.map(x=>x.runes),[184,515,157,780,755,319,89,85,95]);

// Primitive and periodic controls: equal-length multiple LF cycles are
// accepted only when exact cyclic-BWT replay succeeds.
const toyInputs=[
  [0,1,0,1],
  [2,2,2],
  [0,1,2,0,1,2],
  [2,1,0,1,0,2]
];
const periodicControls=toyInputs.map(input=>{
  const transformed=cyclicBWT(input);
  const gate=bwtLegality(transformed.last);
  assert.equal(gate.legal,true);
  const recovered=inverseBWT(transformed.last,lastToFirst(transformed.last),transformed.primary);
  assert.deepEqual(recovered,input);
  return {inputLength:input.length,lfCycles:gate.cycles,exactReplay:true};
});

process.stdout.write(JSON.stringify({
  hypothesis:"Original GP29 values are standard MTF ranks; decode from [0..28] per original-image chapter; decoded symbols are a circular BWT last column.",
  original:originalResults,
  originalChapterCount:originalResults.length,
  originalValidBlocks:originalResults.filter(result=>result.legalBwtLastColumn).length,
  controls:{
    p56CipherAuthentic85of85:true,
    nativeSections:controls,
    allNinePass:controls.length===9&&controls.every(result=>result.legalBwtLastColumn!==false)
  },
  periodicControls,
  decision:"REJECT the standard MTF-rank -> symbol decode -> circular-BWT-last-column architecture on all nine exact source-visible chapters. No primary-row enumeration or p56 inner-key search is eligible."
},null,2)+"\n");
