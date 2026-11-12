#!/usr/bin/env node
"use strict";

// Tests one fixed reading: p50 state index = (13-dot fragment, compass column),
// and the byte stored there points to the next state. The signed 2016 sentence
// supplies 16 words after the "lies" start-cell selector. No offsets, rotations,
// phases, row reversals, or alternative moduli are searched.

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const transcription = read("resources/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");

const sentence = "Its words are the map, their meaning is the road, and their numbers are the direction.";
assert.ok(signed.replace(/\s+/gu, " ").includes(sentence));
const messageWords = ["Its","words","are","the","map","their","meaning","is","the","road","and","their","numbers","are","the","direction"];
const tokens = corpus.translit.map((token,index)=>({token:token.toLowerCase(),index})).sort((a,b)=>b.token.length-a.token.length);

function encodeWord(word) {
  const s=word.toLowerCase().replace(/v/gu,"u").replace(/k/gu,"c").replace(/z/gu,"s");
  const out=[];
  for(let i=0;i<s.length;){
    const t=tokens.find(x=>s.startsWith(x.token,i));
    assert.ok(t, `unmapped token ${word} at ${i}`);
    out.push(t.index); i+=t.token.length;
  }
  return out;
}
function runeIds(word) {
  const out=Array.from(word).map(r=>corpus.runes.indexOf(r));
  assert.ok(out.every(x=>x>=0), `unknown rune in ${word}`);
  return out;
}
function printedWords(page) {
  return page.replaceAll("/","").replaceAll("\n","").replaceAll("\r","")
    .split(/[-.&$§,:!?]/u)
    .map(p=>(p.match(/[ᚠ-᛿]+/gu)||[]).join(""))
    .filter(Boolean);
}
const srcPages=transcription.split("%");
assert.equal(srcPages.length,57);
const pages=Array.from({length:58},(_,p)=>p===50?[]:printedWords(srcPages[p>50?p-1:p]));
const pageBase=new Map();
let total=0;
for(const p of corpus.pages){pageBase.set(p.page,total);total+=p.indices.length;}
assert.equal(total,13136);
assert.ok(pages.every((ws,p)=>ws.reduce((n,w)=>n+Array.from(w).length,0)===corpus.pages.find(x=>x.page===p).indices.length));

const markers=[];
for(const p of ink.pages) for(const m of p.large_punctuation||[]) if(m[1]===13) markers.push(pageBase.get(p.page)+m[0]);
markers.sort((a,b)=>a-b);
assert.equal(markers.length,31);

function address(word) {
  const ids=encodeWord(word);
  const sum=ids.reduce((n,id)=>n+corpus.prime[id],0);
  const page=sum%58, wordIndex=Math.floor(sum/58);
  const selected=pages[page][wordIndex];
  assert.ok(selected, `missing address ${word} => ${page}:${wordIndex}`);
  const local=pages[page].slice(0,wordIndex).reduce((n,w)=>n+Array.from(w).length,0);
  const global=pageBase.get(page)+local;
  const fragment=markers.filter(x=>x<=global).length;
  const selectedSum=runeIds(selected).reduce((n,id)=>n+corpus.prime[id],0);
  return {word,sum,page,wordIndex,selected,global,fragment,signedDir:sum%8,selectedSum,selectedDir:selectedSum%8};
}
const lies=address("lies");
assert.deepEqual([lies.sum,lies.page,lies.wordIndex],[224,50,3]);
const start=grid.page_row_counts[0]*8+lies.wordIndex;
assert.equal(grid.page_row_counts[0],10);
assert.equal(start,83);

const words=messageWords.map(address);
const fragmentRows=words.map(x=>x.fragment);
const signedDirs=words.map(x=>x.signedDir);
const selectedDirs=words.map(x=>x.selectedDir);
assert.deepEqual(fragmentRows,[17,5,1,10,22,28,18,16,10,18,25,28,5,1,10,25]);
assert.deepEqual(signedDirs,[7,3,7,0,3,2,7,4,0,4,7,2,7,7,0,1]);
assert.deepEqual(selectedDirs,[6,5,0,3,2,3,5,0,3,4,0,3,6,5,3,1]);

const table=grid.byte_rows.flat();
assert.equal(table.length,256);
const route=[],seen=new Map();
let state=start;
while(!seen.has(state)){seen.set(state,route.length);route.push(state);state=table[state];}
const cycleStart=seen.get(state),cycle=route.slice(cycleStart);
assert.deepEqual(route.slice(0,17),[83,193,155,112,73,79,82,201,74,205,76,114,197,115,247,192,0]);
assert.equal(cycleStart,10);
assert.equal(cycle.length,11);

function score(states,rows,signedColumns,selectedColumns){
  const pairs=states.map(s=>({row:Math.floor(s/8),column:s%8}));
  return {
    rowMatches:pairs.filter((x,i)=>x.row===rows[i]).length,
    signedDirectionMatches:pairs.filter((x,i)=>x.column===signedColumns[i]).length,
    mappedWordDirectionMatches:pairs.filter((x,i)=>x.column===selectedColumns[i]).length,
    exactSignedStateMatches:pairs.filter((x,i)=>x.row===rows[i]&&x.column===signedColumns[i]).length,
    pairs
  };
}
const destination=score(route.slice(1,17),fragmentRows,signedDirs,selectedDirs);
const current=score(route.slice(0,16),fragmentRows,signedDirs,selectedDirs);
const cycleTail=score(cycle,fragmentRows.slice(5),signedDirs.slice(5),selectedDirs.slice(5));
assert.deepEqual([destination.rowMatches,destination.signedDirectionMatches,destination.mappedWordDirectionMatches],[0,5,2]);
assert.deepEqual([current.rowMatches,current.signedDirectionMatches,current.mappedWordDirectionMatches],[0,2,0]);
assert.deepEqual([cycleTail.rowMatches,cycleTail.signedDirectionMatches,cycleTail.mappedWordDirectionMatches],[0,0,2]);

console.log(JSON.stringify({
  start:{word:"lies",sum:lies.sum,page:lies.page,wordIndex:lies.wordIndex,tableIndex:start},
  route,cycleStart,cycleLength:cycle.length,
  mappedWords:words,
  destinationStateScore:destination,
  currentStateScore:current,
  cycleVs11WordSuffix:cycleTail,
  conclusion:"The fixed row=13-dot fragment, column=8-way direction, byte=next-state registration does not align with the 16 signed 2016 words."
},null,2));
