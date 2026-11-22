"use strict";
/**
 * LP2 pp36-38 five numbered units: physically fixed word/line parallel merge.
 * Original rune conservation, exact inverse, native LP1 GP29 positive plants.
 * Run: node sims/lp2_five_numbered_passages_parallel_read_original_sft.cjs
 * Source: printed numerals 1-5, authentic words and hard visual line wraps.
 * Does not try arbitrary rune permutation or secretly fit cipher keys.
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
  return {number:i+1,runes,words,lines};
});
assert.deepEqual(units.map(u=>u.runes.length),[139,91,98,96,129]);
assert.deepEqual(units.map(u=>u.words.length),[30,20,25,19,28]);
assert.deepEqual(units.map(u=>u.lines.length),[6,4,5,5,6]);
assert.equal(units.reduce((n,u)=>n+u.runes.length,0),553);
const original=units.flatMap(u=>u.runes);
/**
 * Source-motivated 1->5 round robin, skipping exhausted units, consuming
 * whole original units (words OR printed lines); unmatched tails remain.
 * @param {"words"|"lines"} kind
 */
function visitOrder(kind) {
  const visits=[];
  const max=Math.max(...units.map(u=>u[kind].length));
  for(let at=0;at<max;at++)for(let lane=0;lane<5;lane++)
    if(units[lane][kind][at])visits.push({lane,at,size:units[lane][kind][at].length});
  return visits;
}
/**
 * @param {number[][]} contents
 * @param {"words"|"lines"} kind
 */
function merge(contents,kind) {
  const cuts=units.map(u=>u[kind].map(x=>x.length));
  const partial=contents.map((content,i)=>{
    const segments=[];let at=0;
    for(const n of cuts[i]){segments.push(content.slice(at,at+n));at+=n;}
    assert.equal(at,content.length);
    return segments;
  });
  return visitOrder(kind).flatMap(({lane,at})=>partial[lane][at]);
}
/**
 * @param {number[]} joined
 * @param {"words"|"lines"} kind
 */
function unmerge(joined,kind) {
  const received=units.map(()=>[]);
  let position=0;
  for(const item of visitOrder(kind)){
    received[item.lane].push(...joined.slice(position,position+item.size));
    position+=item.size;
  }
  assert.equal(position,joined.length);
  return received;
}
const parallel={};
for(const kind of ["words","lines"]){
  const stream=merge(units.map(u=>u.runes),kind);
  assert.equal(stream.length,553);
  assert.deepEqual(unmerge(stream,kind),units.map(u=>u.runes));
  const originalCounts=Array(29).fill(0),mergedCounts=Array(29).fill(0);
  for(const x of original)originalCounts[x]++;
  for(const x of stream)mergedCounts[x]++;
  assert.deepEqual(originalCounts,mergedCounts);
  parallel[kind]=stream;
}
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
// Exact source-native positive for every original word/line shape: use the
// same fixed physical visit order, reverse into lanes, then merge again.
for(const kind of ["words","lines"]) {
  const planted=unmerge(plant,kind);
  assert.deepEqual(merge(planted,kind),plant);
  assert.equal(planted.flat().length,553);
}
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
const candidates=[
  {kind:"source-serial-five",stream:original},
  {kind:"source-whole-word-roundrobin-1to5",stream:parallel.words},
  {kind:"source-physical-line-roundrobin-1to5",stream:parallel.lines},
  {kind:"solved-LP1-553-plant",stream:plant},
  {kind:"solved-LP2-p56",stream:gp.pages[56].indices},
  {kind:"solved-LP2-p57",stream:gp.pages[57].indices},
];
console.log("SOURCE",JSON.stringify({
  originalPages:[36,37,38],originalRuneCounts:units.map(u=>u.runes.length),
  originalWords:units.map(u=>u.words.length),
  physicalLineCounts:units.map(u=>u.lines.length),
  mergedWords:visitOrder("words").length,
  mergedLines:visitOrder("lines").length,
  totalOriginal:original.length,allOriginalSymbolsPreserved:true,
  completeForwardReverse553:true,nativeLP1Plant553:true,
}));
for(const item of candidates) {
  const stream=item.stream;
  const score=bigramNats(stream);
  const window=stream.length>=150?maximumWindow(stream,150):null;
  console.log("CANDIDATE",JSON.stringify({
    kind:item.kind,n:stream.length,IoC:ioc(stream),
    sourceNativeBigramLogRatioNats:score,
    bestContiguous150:window,
    first95LiteralGP:preview(stream),
  }));
}
const bestOriginal=Math.max(...candidates.slice(0,3).map(x=>bigramNats(x.stream)));
assert(bestOriginal<bigramNats(plant));
console.log("PASS: two exact physically fixed 553-rune merges, no original prose; positive native plants preserved.");
