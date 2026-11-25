#!/usr/bin/env node
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words, physicalLP2Page} = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const parsed = parseLP2Words(read("resources/liber-primus/lp2-transcription.txt"), 55);
const annotations = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const chapters = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const expectedGroups = [158,255,383,437,224,326,378,669,66];
const expectedRunes = [729,1145,1729,1903,1021,1433,1680,3008,308];
const expectedFailures = [
  [1,8,"first phrase must have length 1"],
  [1,2,"first phrase must have length 1"],
  [1,4,"first phrase must have length 1"],
  [1,4,"first phrase must have length 1"],
  [1,2,"first phrase must have length 1"],
  [1,3,"first phrase must have length 1"],
  [1,2,"first phrase must have length 1"],
  [1,3,"first phrase must have length 1"],
  [2,8,"no earlier length 7 parent"]
];
assert.equal(parsed.runeCount,12956);
assert.equal(parsed.words.length,2896);
assert.equal(parsed.crossPageWords,32);
assert.equal(corpus.pages.find(p=>p.page===50).runic_count,0);

const chapterOf = p => chapters.findIndex(([a,b])=>p>=a&&p<=b);
const byChapter = chapters.map(()=>[]);
for(const w of parsed.words){
  const a=physicalLP2Page(w.startPage), b=physicalLP2Page(w.endPage);
  const k=chapterOf(a);
  assert.notEqual(k,-1);
  assert.equal(chapterOf(b),k,"a printed group crosses a visual chapter boundary");
  byChapter[k].push(w);
}
function gate(words){
  const seen=new Set(), counts=new Map();
  let failure=null;
  for(let i=0;i<words.length;i++){
    const L=words[i].length;
    counts.set(L,(counts.get(L)||0)+1);
    const terminalExisting=i===words.length-1&&seen.has(L);
    if(i===0&&L!==1){failure=[i+1,L,"first phrase must have length 1"];break;}
    if(i>0&&!terminalExisting&&L>1&&!seen.has(L-1)){
      failure=[i+1,L,"no earlier length "+(L-1)+" parent"];break;
    }
    if(!terminalExisting)seen.add(L);
  }
  const capacityFailures=[];
  for(const [L,n] of counts)if(BigInt(n)>29n**BigInt(L))capacityFailures.push([L,n,String(29n**BigInt(L))]);
  return {failure,capacityFailures,groups:words.length,runes:words.reduce((s,w)=>s+w.length,0),first:words.slice(0,3).map(w=>w.length)};
}
const results=chapters.map(([a,b],i)=>{
  const r=gate(byChapter[i]);
  assert.equal(r.groups,expectedGroups[i]);
  assert.equal(r.runes,expectedRunes[i]);
  assert.deepEqual(r.failure,expectedFailures[i]);
  assert.deepEqual(r.capacityFailures,[]);
  return {pages:a+"-"+b,groups:r.groups,runes:r.runes,firstLengths:r.first,firstFailure:r.failure};
});

const p54=byChapter[8], p54ann=annotations.pages.find(p=>p.page===54);
const red=p54ann.red_spans.find(s=>s.start===0);
assert.equal(red.length,9);
assert.equal(p54[0].length,1);
assert.equal(p54[1].length,8);
assert.equal(p54[2].length,8);
assert.equal(p54[0].runes+p54[1].runes,red.runes);
assert.deepEqual(gate(p54).failure,[2,8,"no earlier length 7 parent"]);
assert.deepEqual(gate(p54.slice(2)).failure,[1,8,"first phrase must have length 1"]);

const key=a=>a.join(",");
function encodeLZ78(input){
  const dict=new Set([""]), phrases=[];
  let i=0;
  while(i<input.length){
    let prefix=[];
    while(i+prefix.length<input.length){
      const candidate=input.slice(i,i+prefix.length+1);
      if(!dict.has(key(candidate)))break;
      prefix=candidate;
    }
    if(i+prefix.length<input.length){
      const phrase=[...prefix,input[i+prefix.length]];
      assert.ok(dict.has(key(prefix)));
      assert.ok(!dict.has(key(phrase)));
      phrases.push({phrase,parent:prefix,terminal:false});
      dict.add(key(phrase)); i+=phrase.length;
    }else{
      assert.ok(prefix.length>0&&dict.has(key(prefix)));
      phrases.push({phrase:prefix,parent:null,terminal:true});
      i+=prefix.length;
    }
  }
  return phrases;
}
const native=corpus.pages.find(p=>p.page===57).indices;
assert.equal(native.length,95);
const plant=encodeLZ78(native);
assert.deepEqual(plant.flatMap(p=>p.phrase),native);
assert.equal(plant[0].phrase.length,1);
assert.equal(plant.at(-1).terminal,true);
const created=new Set([""]);
for(let i=0;i<plant.length;i++){
  const p=plant[i];
  if(p.terminal){assert.equal(i,plant.length-1);assert.ok(created.has(key(p.phrase)));}
  else{
    assert.ok(created.has(key(p.parent)));
    assert.equal(p.phrase.length,p.parent.length+1);
    assert.ok(!created.has(key(p.phrase)));
    created.add(key(p.phrase));
  }
}
const output={
  source:{unknownRunes:parsed.runeCount,printedGroups:parsed.words.length,crossPageGroups:parsed.crossPageWords,p50Runes:0},
  chapters:results,
  p54Rubric:{redRunes:red.length,firstTwoGroupLengths:[1,8],firstBlackBodyGroupLength:8,includeRubricFailure:gate(p54).failure,excludeRubricFailure:gate(p54.slice(2)).failure},
  nativeP57Control:{runes:native.length,phrases:plant.length,finalExistingPhrase:true,exactReplay:true,parentLengthGate:true},
  decision:"REJECT this conventional greedy LZ78 phrase-per-printed-group model with empty resets at the nine source-visible chapters; the key-independent length condition fails before key search."
};
process.stdout.write(JSON.stringify(output,null,2)+"\n");
