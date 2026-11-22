"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) { return fs.readFileSync(path.join(root, relative), "utf8"); }
/** @param {number} value @returns {number} */
function mod29(value) { return ((value % 29) + 29) % 29; }
/** @param {[number, number]} pair @returns {[number, number]} */
function h(pair) { const [x,y]=pair; return [mod29(x-y),mod29(x+y)]; }
/** @param {[number, number]} pair @returns {[number, number]} */
function hInv(pair) {
  const [u,v]=pair;
  const inverse2=15;
  return [mod29((u+v)*inverse2),mod29((v-u)*inverse2)];
}
/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const out=[];
  for(let candidate=2;out.length<count;candidate+=1){
    let prime=true;
    for(let divisor=2;divisor*divisor<=candidate;divisor+=1){
      if(candidate%divisor===0){ prime=false; break; }
    }
    if(prime)out.push(candidate);
  }
  return out;
}

const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription=read("resources/liber-primus/lp2-transcription.txt");
const runeIndex=new Map(corpus.runes.map((rune,index)=>[rune,index]));
const parts=transcription.split(/^\s*%\s*$/m);
const primes=firstPrimes(130);

/**
 * Solved p56 supplies T(n)=phi(p_n) mod29 on positive cardinal ordinals.
 * @param {number} n
 * @returns {number}
 */
function totientPrimeOrdinal(n) {
  assert.ok(Number.isInteger(n)&&n>=1&&n<=primes.length);
  return mod29(primes[n-1]-1);
}
/** @param {number[]} values @returns {string} */
function spell(values){ return values.map((value)=>corpus.translit[value]).join(""); }
/** @param {number} page @returns {string} */
function physicalPart(page){ assert.notEqual(page,50); return parts[page<=49?page:page-1]; }
/** @param {string} text @returns {number[][]} */
function runeWords(text){
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
function wordRows(page){
  let offset=0;
  return runeWords(physicalPart(page)).map((values)=>{
    const row={values,start:offset,end:offset+values.length,length:values.length};
    offset=row.end;
    return row;
  });
}
/** @param {{start:number,end:number,length:number}[]} rows @param {number} start @param {number} end */
function rowsInSpan(rows,start,end){ return rows.filter((row)=>row.start>=start&&row.end<=end); }
/** @param {string} words @returns {number[]} */
function toGpRunes(words){
  const tokens=corpus.translit.map((token,index)=>({token,index}))
    .sort((left,right)=>right.token.length-left.token.length);
  const out=[];
  for(const word of words.split(" ")){
    for(let i=0;i<word.length;){
      const match=tokens.find(({token})=>word.startsWith(token,i));
      assert.ok(match,"No GP spelling for "+word.slice(i));
      out.push(match.index);
      i+=match.token.length;
    }
  }
  return out;
}

// Exact solved-control inverse, 25-rune holdout, and forward replay on p56.
const p56Cipher=corpus.pages.find((page)=>page.page===56).indices;
const p56Plain=toGpRunes("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
assert.equal(p56Cipher.length,85);
assert.equal(p56Plain.length,85);
const literalF=56;
let primeOrdinal=1;
const decoded=p56Cipher.map((cipher,position)=>{
  if(position===literalF)return cipher;
  const plain=mod29(cipher-totientPrimeOrdinal(primeOrdinal));
  primeOrdinal+=1;
  return plain;
});
assert.deepEqual(decoded,p56Plain);
primeOrdinal=1;
const replay=p56Plain.map((plain,position)=>{
  if(position===literalF)return plain;
  const cipher=mod29(plain+totientPrimeOrdinal(primeOrdinal));
  primeOrdinal+=1;
  return cipher;
});
assert.deepEqual(replay,p56Cipher);
assert.deepEqual(decoded.slice(60),p56Plain.slice(60));

// Source-visible p33 title counts.
const page33=wordRows(33);
const p33Ink=ink.pages.find((page)=>page.page===33);
assert.ok(p33Ink);
assert.deepEqual(p33Ink.red_spans.map((span)=>[span.start,span.length]),[[0,10],[91,8]]);
const upperTitle=rowsInSpan(page33,0,10);
const lowerTitle=rowsInSpan(page33,91,99);
const upperLengths=upperTitle.map((row)=>row.length);
const lowerLengths=lowerTitle.map((row)=>row.length);
assert.deepEqual(upperLengths,[2,8]);
assert.deepEqual(lowerLengths,[3,5]);

// Existing p33 H chain fixes direction: forward H maps lower source material upward.
assert.deepEqual(lowerTitle[0].values.slice(0,2),[21,2]);
assert.deepEqual(h(lowerTitle[0].values.slice(0,2)),[19,23]);
assert.deepEqual([corpus.translit.indexOf("M"),upperTitle[0].values[0]],[19,23]);

// Extend each title one H step toward the opposite section.
const upperExtended=[...upperLengths,...hInv(upperLengths)];
const lowerExtended=[...lowerLengths,...h(lowerLengths)];
assert.deepEqual(upperExtended,[2,8,5,3]);
assert.deepEqual(lowerExtended,[3,5,27,8]);

const upperRunes=upperExtended.map(totientPrimeOrdinal);
const lowerRunes=lowerExtended.map(totientPrimeOrdinal);
assert.deepEqual(upperRunes,[2,18,10,4]);
assert.deepEqual(lowerRunes,[4,10,15,18]);
assert.equal(spell(upperRunes),"THEIR");
assert.equal(spell(lowerRunes),"RISE");
assert.equal(spell([...upperRunes,...lowerRunes]),"THEIRRISE");

// Finite convention controls.
function zeroBasedPrimeIndex(n){ return mod29(primes[n]-1); }
const zeroBasedUpper=upperExtended.map(zeroBasedPrimeIndex);
const zeroBasedLower=lowerExtended.map(zeroBasedPrimeIndex);
assert.notEqual(spell(zeroBasedUpper),"THEIR");
assert.notEqual(spell(zeroBasedLower),"RISE");

const polarityTable=[];
for(const upperDirection of ["H","Hinv"]){
  for(const lowerDirection of ["H","Hinv"]){
    const upperTransform=upperDirection==="H"?h(upperLengths):hInv(upperLengths);
    const lowerTransform=lowerDirection==="H"?h(lowerLengths):hInv(lowerLengths);
    const upper=[...upperLengths,...upperTransform].map(totientPrimeOrdinal);
    const lower=[...lowerLengths,...lowerTransform].map(totientPrimeOrdinal);
    polarityTable.push({upperDirection,lowerDirection,upper:spell(upper),lower:spell(lower)});
  }
}
assert.deepEqual(
  polarityTable.filter((row)=>row.upper==="THEIR"&&row.lower==="RISE"),
  [{upperDirection:"Hinv",lowerDirection:"H",upper:"THEIR",lower:"RISE"}]
);

const twoWordRedSpans=[];
for(const page of ink.pages){
  if(page.page===50)continue;
  const rows=wordRows(page.page);
  for(const span of page.red_spans||[]){
    const selected=rowsInSpan(rows,span.start,span.start+span.length);
    if(selected.length!==2||selected[0].start!==span.start||selected[1].end!==span.start+span.length)continue;
    twoWordRedSpans.push({page:page.page,start:span.start,lengths:selected.map((row)=>row.length)});
  }
}
assert.equal(twoWordRedSpans.length,8);
assert.deepEqual(
  twoWordRedSpans.filter((row)=>row.lengths[0]===2&&row.lengths[1]===8),
  [{page:33,start:0,lengths:[2,8]}]
);

console.log(JSON.stringify({
  status:"PASS",
  solvedControl:{
    p56Runes:p56Cipher.length,
    holdoutRunes:25,
    exactInverse:decoded.every((value,index)=>value===p56Plain[index]),
    exactForwardReplay:replay.every((value,index)=>value===p56Cipher[index]),
    serializer:"T(n)=(prime[n-1]-1) mod29 for positive cardinal n"
  },
  p33:{
    upperTitleLengths:upperLengths,
    upperTowardOtherHalf:upperExtended,
    upperSerializedRunes:upperRunes,
    upperText:spell(upperRunes),
    lowerTitleLengths:lowerLengths,
    lowerTowardOtherHalf:lowerExtended,
    lowerSerializedRunes:lowerRunes,
    lowerText:spell(lowerRunes),
    combined:spell([...upperRunes,...lowerRunes]),
    hSpatialPolarityControl:{
      lowerHeadingFirstTwo:lowerTitle[0].values.slice(0,2),
      throughForwardH:h(lowerTitle[0].values.slice(0,2)),
      upperMarkerAndInitial:[corpus.translit.indexOf("M"),upperTitle[0].values[0]]
    }
  },
  finiteControls:{
    zeroBasedPrimeIndex:{upper:spell(zeroBasedUpper),lower:spell(zeroBasedLower)},
    polarityTable,
    twoWordRedSpanCount:twoWordRedSpans.length,
    upperLengthPairGlobalHits:twoWordRedSpans.filter((row)=>row.lengths[0]===2&&row.lengths[1]===8).length
  },
  interpretation:"Solved p56 serializes p33's title counts into THEIR RISE when the already-established p33 H chain supplies spatial direction. No unknown ciphertext or language score selects the inputs, serializer, title order, or H polarity."
},null,2));
