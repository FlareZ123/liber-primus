"use strict";

/**
 * Original-source selector gate for the proposed 32x8 grid ring -> pp53,55 map.
 * Node.js 22, CommonJS, read-only. No cipher search or guessed orientation.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const ROOT = path.resolve(__dirname,"..");
/** @param {string} p */
const read = p => fs.readFileSync(path.join(ROOT,p),"utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription = read("resources/lp2-transcription.txt");
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const page = n => corpus.pages.find(p=>p.page===n);
const annotation = n => ink.pages.find(p=>p.page===n);
const pageSummary = corpus.pages.map(p=>{
  const spans=annotation(p.page)?.red_spans || [];
  const red=spans.reduce((n,s)=>n+s.length,0);
  return {page:p.page,total:p.indices.length,red,black:p.indices.length-red};
});
assert.equal(pageSummary.length,58);
assert.equal(ink.counts.red,225);
const p53=pageSummary.find(p=>p.page===53);
const p54=pageSummary.find(p=>p.page===54);
const p55=pageSummary.find(p=>p.page===55);
assert.deepEqual([p53.total,p53.black,p53.red,p54.total,p54.red,p55.total],
  [179,128,51,232,9,76]);
assert.equal(p53.total+p55.total,255);
assert.equal(ink.pages.flatMap(p=>p.red_spans||[]).filter(s=>s.length===51).length,1);
assert.deepEqual(pageSummary.filter(p=>p.black===128).map(p=>p.page),[53]);
assert.deepEqual(pageSummary.filter(p=>p.red===51).map(p=>p.page),[53]);
assert.deepEqual(pageSummary.filter(p=>p.total===76).map(p=>p.page),[55]);

const rings=[];
let rows=32,cols=8;
for (;cols>=2;rows-=2,cols-=2)
  rings.push(2*(rows+cols)-4);
assert.deepEqual(rings,[76,68,60,52]);
assert.equal(rings.reduce((a,b)=>a+b,0),256);
assert.equal(grid.shape,"32 rows by 8 columns across LP2 pages 49, 50, 51");

const p53Ink=annotation(53);
const p55Ink=annotation(55);
assert.deepEqual(p53Ink.red_spans.map(s=>[s.start,s.length]),[[128,51]]);
assert.ok(p53Ink.large_punctuation.some(t=>t[0]===179&&t[1]===13));
assert.ok(p55Ink.large_punctuation.some(t=>t[0]===76&&t[1]===13));
assert.equal(page(54).indices[0],24); // original oversized red Ac24
assert.equal(annotation(54).red_spans[0].start,0);
assert.equal(annotation(54).red_spans[0].length,9);

// The two admissible 52-event choices both reproduce the same arithmetic.
// They are materially different source readouts and prove non-uniqueness.
const event52 = [
  {choice:"p53 red51 + p53 terminal 13-dot punctuation",events:51+1},
  {choice:"p53 red51 + p54 oversized Ac24 rune",events:51+1},
  {choice:"p53 red51 + p55 terminal 13-dot punctuation",events:51+1}
];
assert.ok(event52.every(x=>x.events===52));

// Physical LP2 p53 is transcript segment 52 because the printed p50 is rune-free.
const unit=transcription.split("%")[52].split("&")[0];
const runeSet=new Set(corpus.runes);
/** @param {string} s */
const runeCount = s => [...s].filter(c=>runeSet.has(c)).length;
assert.equal(runeCount(unit),179);
const words=(unit.replace(/\/\s*/g,"").match(/[\u16A0-\u16FF]+/gu)||[]);
const blackWordLengths=[];
let consumed=0;
for (const word of words){
  if(consumed>=128)break;
  const n=Math.min([...word].length,128-consumed);
  blackWordLengths.push(n);
  consumed+=n;
}
assert.equal(consumed,128);
assert.equal(blackWordLengths.length,28);
const boundaries=[];
let acc=0;
for(const n of blackWordLengths){acc+=n;boundaries.push(acc);}
assert.ok(!boundaries.includes(68));
assert.equal(boundaries.filter(n=>n<68).at(-1),67);
assert.equal(boundaries.find(n=>n>68),70);

// 68 falls *inside* the three-rune EFS word, rather than a printed separator.
const p53CutWord=blackWordLengths.findIndex((n,i)=>boundaries[i]>68);
assert.equal(p53CutWord,15);
assert.equal([...words[p53CutWord]].length,3);
let at=0, lineBreaks=[], fullStops=[];
for(const ch of unit){
  if(runeSet.has(ch))at++;
  else if(ch==="/")lineBreaks.push(at);
  else if(ch===".")fullStops.push(at);
}
assert.ok(!lineBreaks.includes(68));
assert.deepEqual(fullStops,[53,128,179]);

// Matched random-partition check: re-order just the 28 measured black word
// lengths, maintaining exactly 128 original rune slots. No fitted keywords.
// The result only calibrates whether the 68 split is typographically special.
let state=0x38165311;
/** @returns {number} */
function random(){
  state^=state<<13;
  state^=state>>>17;
  state^=state<<5;
  return (state>>>0)/4294967296;
}
const trials=100000;
let boundaryAt68=0;
for(let t=0;t<trials;t++){
  const shuffled=blackWordLengths.slice();
  for(let i=shuffled.length-1;i>0;i--){
    const j=Math.floor(random()*(i+1));
    [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
  }
  let total=0;
  for(const length of shuffled){
    total+=length;
    if(total===68){boundaryAt68++;break;}
    if(total>68)break;
  }
}
assert.equal(boundaryAt68,21903);
console.log(JSON.stringify({
  source:{p53,p54,p55,
    uniqueFull76:pageSummary.filter(p=>p.total===76).map(p=>p.page),
    uniqueBlack128:pageSummary.filter(p=>p.black===128).map(p=>p.page),
    uniqueRed51:pageSummary.filter(p=>p.red===51).map(p=>p.page),
    otherLargePunctuationChoices:event52},
  originalGrid:{shape:[32,8],rings,tableCells:256},
  p53BlackBreak:{requestedIndex:68,isPrintedBoundary:false,
    precedingWordBoundary:67,followingWordBoundary:70,
    blackWordLengths,printedFullStops:fullStops,printedLineBreaks:lineBreaks},
  matchedWordShuffle:{seed:"0x38165311",trials,boundaryAt68,
    proportion:boundaryAt68/trials},
  consequence:"Ring slots 68 and 60 require an unmarked within-word cut. Extra event and ring orientation are unselected. No source-fixed inverse."
},null,2));
