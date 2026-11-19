"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}
/** @param {number} value @returns {number} */
function mod29(value) { return ((value % 29) + 29) % 29; }
/** @param {[number,number]} pair @returns {[number,number]} */
function H(pair) {
  const [x,y]=pair;
  return [mod29(x-y),mod29(x+y)];
}
/** @param {[number,number]} pair @returns {[number,number]} */
function Hinv(pair) {
  const [u,v]=pair;
  return [mod29((u+v)*15),mod29((v-u)*15)];
}
/** @param {number} n @returns {number[]} */
function firstPrimes(n) {
  const out=[];
  for(let x=2;out.length<n;x+=1){
    let prime=true;
    for(let d=2;d*d<=x;d+=1){ if(x%d===0){ prime=false; break; } }
    if(prime)out.push(x);
  }
  return out;
}

const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const grid=JSON.parse(read("resources/liber-primus/base60-grid.json"));
const transcription=read("resources/liber-primus/lp2-transcription.txt");
const signed2016=read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex=new Map(corpus.runes.map((rune,index)=>[rune,index]));
const parts=transcription.split(/^\s*%\s*$/m);
const state={p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3,q:4};
const primes=firstPrimes(130);

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page,50);
  return parts[page<=49?page:page-1];
}
/** @param {string} text @returns {number[][]} */
function runeWords(text) {
  const normalized=text.replace(/\/\s*/gu,"");
  return (normalized.match(/[\u16A0-\u16FF]+/gu)||[]).map((word)=>
    [...word].map((rune)=>{
      const value=runeIndex.get(rune);
      assert.notEqual(value,undefined);
      return value;
    })
  );
}
/** @param {number} page @returns {{values:number[],start:number,end:number,length:number}[]} */
function wordRows(page) {
  let offset=0;
  return runeWords(physicalPart(page)).map((values)=>{
    const row={values,start:offset,end:offset+values.length,length:values.length};
    offset=row.end;
    return row;
  });
}
/** @param {{start:number,end:number,length:number}[]} rows @param {number} start @param {number} end */
function rowsInSpan(rows,start,end) {
  return rows.filter((row)=>row.start>=start&&row.end<=end);
}
/** @param {number[]} left @param {number[]} right @returns {boolean} */
function same(left,right) {
  return left.length===right.length&&left.every((v,i)=>v===right[i]);
}
/** @param {number} page @returns {number[]} */
function lineCounts(page) {
  return physicalPart(page).split(/^\s*&\s*$/m).map((section)=>
    section.split(/\n/u).filter((line)=>/[\u16A0-\u16FF]/u.test(line)).length
  );
}
/** @param {number} n @returns {number} */
function T(n) { return mod29(primes[n-1]-1); }
/** @param {number[]} values @returns {string} */
function spell(values) { return values.map((value)=>corpus.translit[value]).join(""); }

const redSpans=[];
const exactTwoWord=[];
for(const page of ink.pages) {
  if(page.page===50)continue;
  const rows=wordRows(page.page);
  for(const span of page.red_spans||[]) {
    const values=[...span.runes].map((rune)=>{
      const value=runeIndex.get(rune);
      assert.notEqual(value,undefined);
      return value;
    });
    const selected=rowsInSpan(rows,span.start,span.start+span.length);
    const row={
      page:page.page,
      start:span.start,
      end:span.start+span.length,
      spanLength:span.length,
      values,
      firstRune:values[0],
      first2:values.slice(0,2),
      completeWords:selected,
      exactTwoWord:selected.length===2 &&
        selected[0].start===span.start &&
        selected[1].end===span.start+span.length,
    };
    redSpans.push(row);
    if(row.exactTwoWord) exactTwoWord.push(row);
  }
}
assert.equal(redSpans.filter((row)=>row.values.length>=2).length,18);
assert.equal(exactTwoWord.length,8);

// Source-level controls already implicit in the earlier p33 state report.
const upperSpanHits=exactTwoWord.filter((row)=>
  same(row.completeWords.map((word)=>word.length),[state.K,state.A]) &&
  row.firstRune===state.p &&
  same(H(row.completeWords.map((word)=>word.length)),[state.p,state.A+state.K])
);
assert.deepEqual(
  upperSpanHits.map((row)=>[row.page,row.start]),
  [[33,0]]
);
const headingHits=redSpans.filter((row)=>
  row.first2.length===2 && same(H(row.first2),[state.B,state.p])
);
assert.deepEqual(
  headingHits.map((row)=>[row.page,row.start]),
  [[33,91]]
);

// Pair every exact two-word red span on the same page in source order.
// This charges the only manuscript-wide packet family that has the same
// operand type as p33's two red headings.
const packetRows=[];
for(const upper of exactTwoWord) {
  for(const lower of exactTwoWord) {
    if(upper.page!==lower.page||upper.start>=lower.start)continue;
    const rows=wordRows(upper.page);
    const pageInk=ink.pages.find((p)=>p.page===upper.page);
    const upperLengths=upper.completeWords.map((word)=>word.length);
    const lowerLengths=lower.completeWords.map((word)=>word.length);
    const upperBody=rowsInSpan(rows,upper.end,lower.start);
    const lowerBody=rowsInSpan(rows,lower.end,rows.at(-1).end);
    const punct=(pageInk.large_punctuation||[]).find(([offset])=>offset===upper.end);
    const lines=lineCounts(upper.page);

    for(const upperMode of ["H","Hinv"]) {
      for(const lowerMode of ["H","Hinv"]) {
        for(const headingMode of ["H","Hinv"]) {
          const upperMap=upperMode==="H"?H(upperLengths):Hinv(upperLengths);
          const lowerMap=lowerMode==="H"?H(lowerLengths):Hinv(lowerLengths);
          const headingMap=headingMode==="H"?H(lower.first2):Hinv(lower.first2);
          const checks={
            upperLengths:same(upperLengths,[state.K,state.A]),
            upperFirstRune:upper.firstRune===state.p,
            upperTotal:upper.spanLength===state.A+state.K,
            upperTransform:same(upperMap,[state.p,state.A+state.K]),
            upperBodyWords:upperBody.length===state.p-state.K,
            upperBodyRunes:upperBody.reduce((s,w)=>s+w.length,0)===state.e**state.q,
            lowerLengths:same(lowerLengths,[state.e,state.g]),
            lowerFirstRune:lower.firstRune===state.p-state.K,
            lowerTotal:lower.spanLength===state.A,
            lowerTransform:same(lowerMap,[mod29(-state.K),state.A]),
            lowerBodyWords:lowerBody.length===state.p+state.g,
            lowerBodyRunes:lowerBody.reduce((s,w)=>s+w.length,0)===state.p*state.g,
            headingTransform:same(headingMap,[state.B,state.p]),
            upperPunctuation:Boolean(punct)&&punct[1]===13&&punct[2]==="red",
            sectionLines:same(lines,[state.g,state.a]),
          };
          const score=Object.values(checks).filter(Boolean).length;
          packetRows.push({
            page:upper.page,
            upperStart:upper.start,
            lowerStart:lower.start,
            upperMode,lowerMode,headingMode,
            score,total:Object.keys(checks).length,checks
          });
        }
      }
    }
  }
}
packetRows.sort((a,b)=>b.score-a.score||a.page-b.page||a.upperStart-b.upperStart);
const fullHits=packetRows.filter((row)=>row.score===row.total);
assert.deepEqual(
  fullHits.map((row)=>[row.page,row.upperStart,row.lowerStart,row.upperMode,row.lowerMode,row.headingMode]),
  [[33,0,91,"H","H","H"]]
);
assert.equal(packetRows[0].score,15);
const runnerUpScore=packetRows.find((row)=>row.score<15)?.score??null;

// Independent solved-control serialization discovered after the original
// state-layout report. It uses no p33 body ciphertext.
const p33=wordRows(33);
const upper=p33.filter((row)=>row.start>=0&&row.end<=10);
const lower=p33.filter((row)=>row.start>=91&&row.end<=99);
const upperLengths=upper.map((row)=>row.length);
const lowerLengths=lower.map((row)=>row.length);
const hiddenUpper=[...upperLengths,...Hinv(upperLengths)].map(T);
const hiddenLower=[...lowerLengths,...H(lowerLengths)].map(T);
assert.equal(spell(hiddenUpper),"THEIR");
assert.equal(spell(hiddenLower),"RISE");

// Literal source interpretation of THEIR RISE against the authenticated 2016
// message. The first THEIR is B=19; the second is 25; their rise is a=6.
// P33's pre-existing H chain independently emits 25 and its lower unit has
// exactly a=6 physical lines.
const clear=signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u).slice(1).join("\n");
const sourceWords=clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token)=>/^[A-Za-z]+$/u.test(token))
  .map((word)=>word.toUpperCase());
assert.equal(sourceWords.length,43);
const theirPositions=sourceWords
  .map((word,index)=>word==="THEIR"?index:-1)
  .filter((index)=>index>=0);
assert.deepEqual(theirPositions,[19,25]);
const rise=theirPositions[1]-theirPositions[0];
const gp0WE=corpus.translit.indexOf("W")+corpus.translit.indexOf("E");
assert.equal(theirPositions[0],state.B);
assert.equal(theirPositions[1],gp0WE);
assert.equal(rise,state.a);
assert.equal(lineCounts(33)[1],rise);
assert.deepEqual(H([state.B,state.p]),[theirPositions[1],13]);

// Prospective continuation was precommitted in Issue #1782 before this cell
// was opened: reuse the exact B=19 p50 address->base60-byte->physical-page
// consumer at the second THEIR position 25. It cleanly misses.
const tokens=grid.rows.flat();
const bytes=grid.byte_rows.flat();
assert.equal(tokens[state.B],"0X");
assert.equal(bytes[state.B],33);
assert.equal(tokens[theirPositions[1]],"3I");
assert.equal(bytes[theirPositions[1]],198);
const blindPageHit=bytes[theirPositions[1]]>=0&&bytes[theirPositions[1]]<=57;
assert.equal(blindPageHit,false);

console.log(JSON.stringify({
  status:"PASS",
  matchedFamily:{
    redSpansAtLeast2Runes:redSpans.filter((row)=>row.values.length>=2).length,
    exactTwoWordRedSpans:exactTwoWord.length,
    upperStateSpanHits:upperSpanHits.map((row)=>({page:row.page,start:row.start})),
    headingStateHits:headingHits.map((row)=>({page:row.page,start:row.start})),
    orderedSamePagePacketCandidates:packetRows.length/8,
    chargedOrientationVariants:packetRows.length,
    fullPacketHits:fullHits.map((row)=>({
      page:row.page,upperStart:row.upperStart,lowerStart:row.lowerStart,
      upperMode:row.upperMode,lowerMode:row.lowerMode,headingMode:row.headingMode,
      score:row.score,total:row.total
    })),
    runnerUpScore
  },
  solvedControlHoldout:{
    serializer:"T(n)=(prime[n-1]-1) mod29",
    upper:spell(hiddenUpper),
    lower:spell(hiddenLower),
    combined:spell([...hiddenUpper,...hiddenLower])
  },
  theirRise:{
    signed2016Positions:theirPositions,
    firstEqualsB:theirPositions[0]===state.B,
    secondEqualsGp0WE:theirPositions[1]===gp0WE,
    rise,
    riseEqualsA:rise===state.a,
    p33LowerLines:lineCounts(33)[1],
    hChainFromBAndP:H([state.B,state.p])
  },
  precommittedContinuation:{
    address:theirPositions[1],
    token:tokens[theirPositions[1]],
    byte:bytes[theirPositions[1]],
    predictedPhysicalPageRange:"0..57",
    hit:blindPageHit
  },
  interpretation:"P33 is the sole full state-layout packet in the charged same-operand red-span/H-orientation family. The later solved-p56 serializer independently recovers THEIR RISE. That phrase closes a source loop: signed-2016 THEIR positions are 19 and25, matching p33 entry B=19 and its H-chain output25, while the rise6 matches a and p33's lower line count. The prospectively frozen attempt to reuse p50 address25 as the next physical-page pointer fails (3I=198), so no continuation is claimed."
},null,2));
