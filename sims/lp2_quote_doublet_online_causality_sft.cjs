"use strict";
/**
 * Original LP2 source-time necessary-condition test for a hypothetical
 * online 86 quote-word / 86 ciphertext-doublet escape emitter.
 * Uses no secret key, fitted alignment or external modules.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} file */
const read = file => fs.readFileSync(path.join(root,file),"utf8");
const c = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const q = JSON.parse(read("resources/liber-primus/lp2-quote-punctuation-spans.json"));
const source = read("resources/liber-primus/lp2-transcription.txt");
const runeIds = new Map(c.runes.map((v,i)=>[v,i]));
const pages = c.pages.filter(p=>p.page<=55);
const ciphertext = pages.flatMap(p=>p.indices);
assert.equal(ciphertext.length,12956);

const words = [];
let runeOffset = 0, start = -1;
for(const ch of source){
  if(runeIds.has(ch)){
    if(start<0)start=runeOffset;
    runeOffset++;
  }else if("-.$&§".includes(ch) && start>=0){
    words.push({start,end:runeOffset});
    start=-1;
  }
}
if(start>=0)words.push({start,end:runeOffset});
assert.equal(words.filter(w=>w.end<=12956).length,2896);
const selected=q.quotes.flatMap(span=>
  words.filter(w=>w.start>=span.start&&w.end<=span.end));
assert.equal(selected.length,86);
assert.equal(selected.reduce((sum,w)=>sum+w.end-w.start,0),405);

const events=[];
let at=0;
for(const p of pages){
  for(let i=1;i<p.indices.length;i++)if(p.indices[i]===p.indices[i-1])
    events.push({page:p.page,offset:at+i});
  at+=p.indices.length;
}
assert.equal(events.length,86);
const chapters=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const ends=chapters.map(([,last])=>pages.filter(p=>p.page<=last)
  .reduce((a,p)=>a+p.indices.length,0));
/** @param {number} position */
const chapter = position => ends.findIndex(n=>position<n);
const wc=Array(9).fill(0),ec=Array(9).fill(0);
for(const w of selected)wc[chapter(w.start)]++;
for(const e of events)ec[chapter(e.offset)]++;
assert.deepEqual(wc,[0,4,0,5,0,0,0,77,0]);
assert.deepEqual(ec,[4,6,9,10,11,13,12,18,3]);

const delays=selected.map((w,i)=>w.start-events[i].offset);
assert.equal(delays.filter(d=>d>0).length,79);
assert.equal(events[0].offset,122);
assert.equal(selected[0].start,1659);
assert.equal(events.at(-1).offset,12939);
assert.equal(selected.at(-1).end,12592);
assert.equal(Math.min(...delays),-350);
assert.equal(Math.max(...delays),8124);

let genuine=0;
for(const span of q.quotes)
  for(let j=span.start+1;j<span.end;j++)
    if(ciphertext[j]===ciphertext[j-1])genuine++;
const seams=q.quotes.slice(0,-1).filter((span,i)=>
  ciphertext[span.end-1]===ciphertext[q.quotes[i+1].start]);
assert.equal(genuine,1);
assert.equal(seams.length,1);
assert.equal(seams[0].end-1,1676);
assert.equal(q.quotes[1].start,5459);

console.log(JSON.stringify({
 originalCipherRunes:ciphertext.length,
 originalQuoteWords:selected.length,
 originalDoubletEvents:events.length,
 firstEvent:122, firstQuotedWord:1659,
 lastEvent:12939, lastQuotedWordEnd:12592,
 futureQuotedWords:79, alreadyAvailable:7,
 minAndMaxRuneDelays:[-350,8124],
 quotedWordsByVisualChapter:wc,
 doubletsByVisualChapter:ec,
 genuineWithinQuoteDoublets:genuine,
 genuineWithinQuoteAdjacencies:405-q.quotes.length,
 artificialJoinDoublets:seams.length,
 artificialJoinOriginalRuneOffsets:[1676,5459],
 artificialJoinRune:c.translit[ciphertext[1676]],
 inference:"This natural-order online and chapter-local 86-to-86 emitter requires missing external lookahead/selector; whole-book book ciphers remain untested."
},null,2));
