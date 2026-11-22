"use strict";
/**
 * LP2 pp36-38: original 1-to-5 one-GP-rune interleave of 553 printed glyphs.
 * Exact inverse, original source-page/rune/ink mapping and native LP1 control.
 * Run: node sims/lp2_five_numbered_passages_single_rune_roundrobin_original_sft.cjs
 * Source: original printed numerals 1-5 and original page-glyph transcript.
 * Physical punctuation, source word boundaries and source ink remain attached
 * to the original rune coordinates; only the rune visitation order changes.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
/** @param {string} name */
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source=read("resources/liber-primus/lp2-transcription.txt")
  .replace(/\r\n/g,"\n").split("\n%\n");
assert.equal(source.length,57);
const numberedSource=source.slice(36,39).join("\n");
const marks=[...numberedSource.matchAll(/(?:^|\n)([1-5])-/gu)];
assert.deepEqual(marks.map(m=>Number(m[1])),[1,2,3,4,5]);
const runeIndex=new Map(gp.runes.map((r,i)=>[r,i]));
/** @param {string} s @returns {number[]} */
function takeRunes(s) {
  return [...s].flatMap(ch=>runeIndex.has(ch)?[runeIndex.get(ch)]:[]);
}
const units=marks.map((mark,i)=>{
  const begin=mark.index+mark[0].length;
  const end=i===4?numberedSource.indexOf("\n&\n",begin):marks[i+1].index;
  assert(end>begin);
  const src=numberedSource.slice(begin,end).trim();
  const runes=takeRunes(src);
  // Printed hyphen and full stop delimit complete physical words.
  // "/" + newline is just a line wrap; it does NOT create a word.
  const words=src.replace(/\/\n/gu,"").split(/[.\-]/u)
    .map(takeRunes).filter(v=>v.length>0);
  // For a separate physically fixed reading, keep the actual hard wraps,
  // including the true p37/p38 page break within unit4.
  const lines=src.split("\n").map(takeRunes).filter(v=>v.length>0);
  assert.deepEqual(words.flat(),runes);
  assert.deepEqual(lines.flat(),runes);
  return {number:i+1,runes,words,lines,src,absoluteStart:begin};
});
assert.deepEqual(units.map(u=>u.runes.length),[139,91,98,96,129]);
assert.deepEqual(units.map(u=>u.words.length),[30,20,25,19,28]);
assert.deepEqual(units.map(u=>u.lines.length),[6,4,5,5,6]);
assert.equal(units.reduce((n,u)=>n+u.runes.length,0),553);
const original=units.flatMap(u=>u.runes);

const inks=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const physicalPages=source.slice(36,39);
const pageStarts=[0,physicalPages[0].length+1,physicalPages[0].length+physicalPages[1].length+2];
/** @param {number} page @param {number} offset */
function inkAt(page,offset) {
  const row=inks.pages.find(x=>x.page===page);
  return row?.red_spans.some(x=>offset>=x.start&&offset<x.start+x.length)?"red":"black";
}
const origins=units.map(unit=>{
  const positions=[];
  let previousEnd=0;
  for(const m of unit.src.matchAll(/./gu)) {
    const rune=runeIndex.get(m[0]);
    if(rune===undefined)continue;
    const absolute=unit.absoluteStart+m.index;
    const pageIndex=absolute<pageStarts[1]?0:absolute<pageStarts[2]?1:2;
    const physicalPage=36+pageIndex;
    const offset=takeRunes(physicalPages[pageIndex].slice(0,absolute-pageStarts[pageIndex])).length;
    assert.equal(gp.pages[physicalPage].indices[offset],rune);
    positions.push({rune,lane:unit.number,withinLane:positions.length,physicalPage,offset,
      ink:inkAt(physicalPage,offset),preceding:unit.src.slice(previousEnd,m.index)});
    previousEnd=m.index+m[0].length;
  }
  assert.deepEqual(positions.map(x=>x.rune),unit.runes);
  return positions;
});
const sourceCoverage=origins.flat().length;
assert.equal(sourceCoverage,553);
const order=[];
const maxLength=Math.max(...origins.map(x=>x.length));
for(let at=0;at<maxLength;at++)
  for(let lane=0;lane<5;lane++)
    if(at<origins[lane].length)order.push({lane,at});
const merged=order.map(({lane,at})=>origins[lane][at].rune);
assert.equal(merged.length,553);
const separated=origins.map(()=>[]);
order.forEach(({lane,at},i)=>{separated[lane][at]=merged[i];});
assert.deepEqual(separated,units.map(x=>x.runes));
const sourceHistogram=Array(29).fill(0),mergedHistogram=Array(29).fill(0);
units.flatMap(x=>x.runes).forEach(x=>sourceHistogram[x]++);
merged.forEach(x=>mergedHistogram[x]++);
assert.deepEqual(mergedHistogram,sourceHistogram);

/** @param {string} string */
function nativeGP(string) {
  const clean=string.toUpperCase().replace(/QU/gu,"CW")
    .replace(/V/gu,"U").replace(/[KQ]/gu,"C").replace(/Z/gu,"S");
  const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  const out=[];
  for(const match of clean.match(/[A-Z]+/gu)||[]){
    for(let i=0;i<match.length;){
      if(match.startsWith("ING",i)){out.push(21);i+=3;continue;}
      if(match.startsWith("IO",i)){out.push(27);i+=2;continue;}
      const token=tokens.find(t=>match.startsWith(t.s,i));
      assert(token, "Unexpected source GP mapping "+match.slice(i,10));
      out.push(token.i);i+=token.s.length;
    }
  }
  return out;
}
assert.deepEqual(nativeGP("FUNCTION"),[0,1,9,5,16,27,9]);
const reference=read("resources/liber-primus/lp1-plaintext-reference.txt");
const headings=[...reference.matchAll(/^###\s+(\d+)\s*$/gmu)];
const sections=headings.map((m,i)=>{
  const end=headings[i+1]?.index??reference.length;
  return {page:Number(m[1]),text:reference.slice(m.index+m[0].length,end)
    .replace(/^#.*$/gmu,"").replace(/^\s*\[.*\]\s*$/gmu,"")};
}).filter(x=>x.page>=1&&x.page<=16&&![4,7,8].includes(x.page));
assert.deepEqual(sections.map(s=>s.page),[1,3,5,6,9,10,11,12,13,14,15,16]);
const native=sections.flatMap(s=>nativeGP(s.text));
assert.equal(native.length,2797);
const plant=native.slice(0,553);
assert.equal(plant.length,553);

// Sealed native-GP plant is unmerged through the same 553-entry map.
// Re-merging must recover all runes exactly without tuning a phase.
const planted=origins.map(()=>[]);
order.forEach(({lane,at},i)=>{planted[lane][at]=plant[i];});
assert.deepEqual(order.map(({lane,at})=>planted[lane][at]),plant);
assert.equal(planted.reduce((n,x)=>n+x.length,0),553);

/** @param {number[]} src */
function ioc(src) {
  const f=Array(29).fill(0);
  for(const v of src)f[v]++;
  return f.reduce((n,c)=>n+c*(c-1),0)/(src.length*(src.length-1));
}
// GP29 bigram likelihood trained exclusively on native LP1 runes held out
// from the exact first553 sample that supplies the reversible native plant.
const training=native.slice(553);
const pairs=Array.from({length:29},()=>Array(29).fill(0));
const parent=Array(29).fill(0);
for(let i=1;i<training.length;i++){pairs[training[i-1]][training[i]]++;parent[training[i-1]]++;}
/** @param {number[]} src */
function bigramNats(src) {
  let z=0;
  for(let i=1;i<src.length;i++){
    const prev=src[i-1],letter=src[i];
    z+=Math.log(29*(pairs[prev][letter]+0.5)/(parent[prev]+14.5));
  }
  return z/(src.length-1);
}
/** @param {number[]} src @param {number} len */
function maximumWindow(src,len) {
  let highest={score:-Infinity,offset:-1};
  for(let start=0;start+len<=src.length;start++){
    const score=bigramNats(src.slice(start,start+len));
    if(score>highest.score)highest={score,offset:start};
  }
  return highest;
}
/** @param {number[]} src */
const preview=src=>src.slice(0,95).map(x=>gp.translit[x]).join("");

const output=merged.map(x=>gp.runes[x]).join("");
const serial=units.flatMap(x=>x.runes);
const candidates=[
  {kind:"original-physical-serial",stream:serial},
  {kind:"original-rune-roundrobin-1to5",stream:merged},
  {kind:"solved-LP1-553-native-plant",stream:plant},
  {kind:"p56-known-encrypted",stream:gp.pages[56].indices},
  {kind:"p57-known-clear",stream:gp.pages[57].indices},
];
const stats=candidates.map(x=>({
  kind:x.kind,n:x.stream.length,IoC:ioc(x.stream),
  GP29BigramNatsPerRune:bigramNats(x.stream),
  best150:x.stream.length>=150?maximumWindow(x.stream,150):null,
}));
const shown=[...output].reduce((arr,ch,i)=>{
  if(i%79===0)arr.push("");
  arr[arr.length-1]+=ch;
  return arr;
},[]);
const red=origins.flat().filter(x=>x.ink==="red").length;
console.log("SOURCE",JSON.stringify({
  pages:[36,37,38],printedNumerals:marks.map(x=>Number(x[1])),
  laneRuneLengths:origins.map(x=>x.length),total:sourceCoverage,
  originalGlyphsConserved:true,wholeStreamReverseReplay:true,
  positionMapPreservesPageOffset:true,redRuneCount:red,
  originalPunctuationAndDigitLabels:"retained at the printed positions in source; rune-only output",
  nativeSolvedLP1PlantExact:553
}));
for(const s of stats)console.log("SCORE",JSON.stringify(s));
console.log("ORIGINAL_553_RUNES\n"+shown.join("\n"));
assert(stats[1].GP29BigramNatsPerRune<0);
assert(stats[2].GP29BigramNatsPerRune>0);
console.log("PASS: exactly one original-source 1-to-5 single-rune reading with preserved origin mapping and native plant.");
