'use strict';

/**
 * Source-constrained red119 -> p33/p40 -> p15 follow-up.
 * Run: node sims/lp2_red119_p33_p15_source_gate_sft.cjs
 * Node.js 20+, CommonJS, read-only source inputs.
 *
 * This is a bounded gate, not a proposed solution. It verifies the red-span
 * census and page/rune coordinates, tests the p15 Fibonacci-prime starts
 * against the authentic p56 prime-totient/F-bypass rule on p33, and tests the
 * published p3-polynomial R(M_signed) Hill4 operator on the p33-39 chapter.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.resolve(__dirname,'..');
const read = f => fs.readFileSync(path.join(root,f),'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const mod29 = x => ((x%29)+29)%29;

function firstPrimes(amount) {
  const out=[];
  for (let p=2;out.length<amount;p++) {
    let prime=true;
    for (let d=2;d*d<=p;d++) if (p%d===0) {prime=false;break;}
    if (prime) out.push(p);
  }
  return out;
}
const primeTable = firstPrimes(1400);
const runeIndex = new Map(corpus.runes.map((r,i)=>[r,i]));
const allPageRunes = corpus.pages.flatMap(p=>p.indices);
const transcriptionChars=[];
const transcriptionRunes=[];
for (let i=0;i<transcription.length;i++) {
  const v=runeIndex.get(transcription[i]);
  if (v!==undefined) {
    transcriptionChars.push(i);
    transcriptionRunes.push(v);
  }
}
assert.deepEqual(transcriptionRunes,allPageRunes);

function pageStart(pageNo) {
  return corpus.pages.slice(0,pageNo).reduce((n,p)=>n+p.indices.length,0);
}
function redSpan(pageNo,start,length) {
  const p=ink.pages.find(x=>x.page===pageNo);
  assert(p,'missing ink page '+pageNo);
  const span=(p.red_spans||[]).find(x=>x.start===start&&x.length===length);
  assert(span,'missing red span '+pageNo+':'+start+':'+length);
  const page=corpus.pages.find(x=>x.page===pageNo);
  const indices=page.indices.slice(start,start+length);
  assert.equal(indices.length,length);
  return {page:pageNo,start,length,indices,sum:indices.reduce((s,x)=>s+corpus.prime[x],0)};
}

const redRows=[];
for (const annotated of ink.pages) {
  const page=corpus.pages.find(x=>x.page===annotated.page);
  for (const span of annotated.red_spans||[]) {
    const indices=page.indices.slice(span.start,span.start+span.length);
    redRows.push({
      page:annotated.page,
      start:span.start,
      length:span.length,
      sum:indices.reduce((s,x)=>s+corpus.prime[x],0)
    });
  }
}
redRows.sort((a,b)=>a.page-b.page||a.start-b.start);
assert.equal(redRows.length,18);
const residue15=redRows.filter(x=>x.sum%28===15);
assert.deepEqual(
  residue15.map(x=>[x.page,x.start,x.length,x.sum]),
  [[33,0,10,379],[33,91,8,295],[40,0,8,435]]
);

const triad3=redSpan(3,119,3);
const triad39=redSpan(39,119,3);
assert.deepEqual(triad3.indices,[13,23,2]);
assert.deepEqual(triad39.indices,[27,5,15]);
assert.equal(triad3.sum,137);
assert.equal(triad39.sum,173);
assert.equal(primeTable.indexOf(triad3.sum)+1,33);
assert.equal(primeTable.indexOf(triad39.sum)+1,40);
assert.equal(pageStart(33),7960);
assert.equal(pageStart(40),9640);

function addressedWord(pageNo,oneBasedRuneOffset) {
  const global=pageStart(pageNo)+oneBasedRuneOffset-1;
  const char=transcriptionChars[global];
  assert.equal(transcription[char-1],'-','address is not a printed word start');
  let end=char;
  while (end<transcription.length&&runeIndex.has(transcription[end])) end++;
  const word=transcription.slice(char,end);
  const indices=[...word].map(ch=>runeIndex.get(ch));
  return {
    page:pageNo,
    oneBasedRuneOffset,
    word,
    indices,
    transliteration:indices.map(i=>corpus.translit[i]).join('')
  };
}
const addressed=[
  addressedWord(33,triad3.sum),
  addressedWord(40,triad39.sum)
];
assert.equal(addressed[0].transliteration,'TJ');
assert.equal(addressed[1].transliteration,'DREAG');
assert.deepEqual(addressed[0].indices,[16,11]);
assert.deepEqual(addressed[1].indices,[23,4,28,6]);

const fibonacci=[0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987];
const starts=fibonacci.map(n=>n+1);
assert.deepEqual(starts,[1,2,3,4,6,9,14,22,35,56,90,145,234,378,611,988]);

function feasible(ciphertext,shift) {
  let states=new Set([0]);
  let peak=1;
  for (let i=0;i<ciphertext.length;i++) {
    const next=new Set();
    for (const used of states) {
      if (ciphertext[i]===0) next.add(used); // literal plaintext F: no key consumed
      if (mod29(ciphertext[i]-shift(used))!==0) next.add(used+1); // key-consuming non-F
    }
    if (!next.size) return {possible:false,firstFailure:i,terminal:0,peak};
    states=next;
    peak=Math.max(peak,states.size);
  }
  return {possible:true,firstFailure:-1,terminal:states.size,peak};
}
function encryptTransparentF(plaintext,shift) {
  let used=0;
  const out=[];
  for (const p of plaintext) {
    if (p===0) {out.push(0);continue;}
    out.push(mod29(p+shift(used)));
    used++;
  }
  return out;
}
const p56=corpus.pages.find(p=>p.page===56).indices;
const p56Control=feasible(p56,used=>mod29(primeTable[used]-1));
assert.equal(p56Control.possible,true);
assert.equal(p56Control.terminal,5);

const p33=corpus.pages.find(p=>p.page===33).indices;
assert.equal(p33.length,214);
assert.equal(p33.filter(x=>x===0).length,9);
const gibran=encodeSourceNativeGP(read('resources/control/gibran_prophet_58585.txt'));
const p33Plant=gibran.slice(0,p33.length);
assert.equal(p33Plant.length,p33.length);
const primeTotientRows=[];
for (const start of starts) {
  for (const sign of [-1,1]) {
    const shift=used=>mod29(sign*(primeTable[start-1+used]-1));
    const original=feasible(p33,shift);
    assert.equal(original.possible,false);
    const plant=encryptTransparentF(p33Plant,shift);
    assert.equal(feasible(plant,shift).possible,true);
    primeTotientRows.push({
      start,
      firstPrime:primeTable[start-1],
      sign,
      firstFailure:original.firstFailure
    });
  }
}
assert.equal(primeTotientRows.length,32);
const failurePositions=primeTotientRows.map(x=>x.firstFailure);
assert.equal(Math.min(...failurePositions),0);
assert.equal(Math.max(...failurePositions),137);

const R=[
  [23,19,12,24],
  [21,23,3,10],
  [22,18,0,10],
  [27,19,25,26]
];
const Rinv=[
  [20,2,25,18],
  [3,19,25,16],
  [21,8,5,18],
  [26,2,19,7]
];
const identity=Array.from({length:4},(_,i)=>Array.from({length:4},(_,j)=>Number(i===j)));
function multiply(A,B) {
  return A.map(row=>B[0].map((_,j)=>mod29(row.reduce((s,x,k)=>s+x*B[k][j],0))));
}
assert.deepEqual(multiply(R,Rinv),identity);
assert.deepEqual(multiply(Rinv,R),identity);
function apply4(A,v) {
  return A.map(row=>mod29(row.reduce((s,x,j)=>s+x*v[j],0)));
}
function hill4(data,A) {
  assert.equal(data.length%4,0);
  const out=[];
  for (let i=0;i<data.length;i+=4) out.push(...apply4(A,data.slice(i,i+4)));
  return out;
}
function ioc(data) {
  const counts=Array(29).fill(0);
  for (const x of data) counts[x]++;
  return counts.reduce((s,n)=>s+n*(n-1),0)/(data.length*(data.length-1));
}
const chapterPages=corpus.pages.slice(33,40);
const chapterLengths=chapterPages.map(p=>p.indices.length);
assert.deepEqual(chapterLengths,[214,261,271,238,228,228,240]);
const chapter=chapterPages.flatMap(p=>p.indices);
assert.equal(chapter.length,1680);
const decodedR=hill4(chapter,R);
const decodedRinv=hill4(chapter,Rinv);
assert.deepEqual(hill4(decodedR,Rinv),chapter);
assert.deepEqual(hill4(decodedRinv,R),chapter);
const p57=corpus.pages.find(p=>p.page===57).indices;
const nativePlant=Array.from({length:chapter.length},(_,i)=>p57[i%p57.length]);
assert.equal(nativePlant.length,1680);
assert.deepEqual(hill4(hill4(nativePlant,R),Rinv),nativePlant);
assert.deepEqual(hill4(hill4(nativePlant,Rinv),R),nativePlant);
const iocSummary={
  original:ioc(chapter),
  R:ioc(decodedR),
  Rinv:ioc(decodedRinv),
  nativePlant:ioc(nativePlant)
};
assert(Math.abs(iocSummary.original-0.03436002155478034)<1e-12);
assert(Math.abs(iocSummary.R-0.03447488584475895)<1e-12);
assert(Math.abs(iocSummary.Rinv-0.03439618253495561)<1e-12);
assert(Math.abs(iocSummary.nativePlant-0.071817124706)<1e-9);

console.log(JSON.stringify({
  redSpanCount:redRows.length,
  residue15Spans:residue15,
  sourceTriads:[
    {page:3,indices:triad3.indices,sum:triad3.sum,primeOrdinal:33,targetPage:33,targetRuneOffset1:137},
    {page:39,indices:triad39.indices,sum:triad39.sum,primeOrdinal:40,targetPage:40,targetRuneOffset1:173}
  ],
  addressedWords:addressed,
  p56FeasibilityControl:p56Control,
  p33PrimeTotientStartGate:{
    variants:primeTotientRows.length,
    feasibleOriginals:0,
    firstFailureMin:Math.min(...failurePositions),
    firstFailureMax:Math.max(...failurePositions),
    ciphertextF:p33.filter(x=>x===0).length,
    positivePlantsPassed:32
  },
  p33to39Hill4:{
    pageLengths:chapterLengths,
    runeCount:chapter.length,
    blocks:chapter.length/4,
    determinantOfR:6,
    ioc:iocSummary,
    exactRoundTrips:true
  }
},null,2));
