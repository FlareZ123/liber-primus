"use strict";
/**
 * All-secret 5x6 coordinate-fractionation exclusion on 29 runes + space.
 *
 * The eight unsolved source sections contain 12,956 GP29 runes and 2,888
 * printed interword separators, a 15,844-token sequence over 30 symbols.
 * The separator is counted once between complete source words, even where
 * the original transcription has adjacent punctuation.
 *
 * Given an arbitrary fixed secret 5x6 grid S of all 30 symbols, consider
 * one encrypted-coordinate-mixing inverse:
 *
 * P[i] = S^-1(6*floor(S[C[i]]/6) + S[C[j(i)]]%6).
 *
 * A fixed plaintext symbol can arise only when C[i] lies in a selected
 * six-symbol row and C[j(i)] in a selected five-symbol column. For any
 * original ordered-pair histogram F[a,b], an upper bound over ALL 30! keys
 * is the smaller of:
 *  1. top6_a (sum top5_b F[a,b])
 *  2. top5_b (sum top6_a F[a,b]).
 * These relax the true grid intersection/partition constraints.
 *
 * Source-native window controls are exhaustive over Shakespeare, Gibran,
 * Emerson. Hidden 30-symbol key / exact inverse plant tests the theorem.
 *
 * Run: node sims/gp30_space_fractionation_gate.cjs
 * Windows Node 22, CommonJS, built-ins only, no filesystem writes.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=name=>fs.readFileSync(path.join(ROOT,name),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const canonical=read("resources/lp2-transcription.txt");
const GLYPHS=new Map(corpus.runes.map((x,i)=>[x,i]));
const ENGLISH=new Map(corpus.translit.map((x,i)=>[x,i]));
const REFS={
  Shakespeare:"resources/control/shakespeare_first300k.txt",
  Gibran:"resources/control/gibran_prophet_58585.txt",
  Emerson:"resources/control/emerson_essays_2944.txt"
};
const PERIODS=[2,3,4,5,6,7,8,9,10,11,13,14,15,16,17,23,
  28,29,30,32,41,55,79,128,233,256,466];
const SHIFTS=[1,2,3,5,7,11];
const ALPHABET=30, ROWS=5, COLUMNS=6, LENGTH=15844;

/** @returns {number[][]} Eight unsolved GP29+word-boundary sections. */
function sourceSections() {
  const sections=canonical.split("$").slice(0,8).map(text=>{
    const out=[];
    for(const ch of text) {
      const rune=GLYPHS.get(ch);
      if(rune!==undefined) out.push(rune);
      else if((ch==="-"||ch===".") && out.length &&
        out[out.length-1]!==29) out.push(29);
    }
    while(out[out.length-1]===29) out.pop();
    return out;
  });
  assert.equal(sections.length,8);
  const all=sections.flat();
  assert.equal(all.length,LENGTH);
  assert.equal(all.filter(x=>x===29).length,2888);
  assert.equal(all.filter(x=>x!==29).length,12956);
  assert.deepEqual(sections.map(x=>x.length),
    [886,1399,2122,2328,1244,1758,2057,4050]);
  return sections;
}

/**
 * @param {number[][]} parts
 * @param {number} period
 * @param {number} shift
 * @returns {{top30Pairs:number,rowRelaxation:number,columnRelaxation:number,allKeyCap:number}}
 */
function pairCapacity(parts,period,shift) {
  const F=Array.from({length:ALPHABET},()=>new Uint32Array(ALPHABET));
  let count=0;
  for(const part of parts)
    for(let st=0;st<part.length;st+=period) {
      const n=Math.min(period,part.length-st);
      const delta=shift%n;
      for(let j=0;j<n;j++) {
        F[part[st+j]][part[st+(j+n-delta)%n]]++;
        count++;
      }
    }
  assert.equal(count,LENGTH);
  const top=(v,k)=>Array.from(v).sort((a,b)=>b-a)
    .slice(0,k).reduce((a,b)=>a+b,0);
  const rowRelaxation=top(F.map(row=>top(row,ROWS)),COLUMNS);
  const colScores=Array.from({length:ALPHABET},(_,column)=>
    top(F.map(row=>row[column]),COLUMNS));
  const columnRelaxation=top(colScores,ROWS);
  const allKeyCap=Math.min(rowRelaxation,columnRelaxation);
  const top30Pairs=top(F.flatMap(row=>Array.from(row)),ALPHABET);
  assert.ok(allKeyCap<=top30Pairs);
  return {top30Pairs,rowRelaxation,columnRelaxation,allKeyCap};
}

/** @param {string} source @returns {number[]} */
function nativeGP30(source) {
  const out=[];
  for(let word of source.toUpperCase().match(/[A-Z]+/g)||[]) {
    word=word.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S");
    for(let i=0;i<word.length;) {
      const two=ENGLISH.get(word.slice(i,i+2));
      if(two!==undefined) {out.push(two);i+=2;}
      else {
        const one=ENGLISH.get(word[i]);
        if(one!==undefined)out.push(one);
        i++;
      }
    }
    out.push(29);
  }
  if(out.length)out.pop();
  return out;
}

/**
 * Exact minimum most-common symbol in every full-length control window.
 * @param {number[]} a
 */
function controlMinFrequency(a) {
  assert.ok(a.length>=LENGTH);
  const counts=new Int32Array(ALPHABET);
  for(let i=0;i<LENGTH;i++)counts[a[i]]++;
  let min=Math.max(...counts),firstAt=0;
  const windows=a.length-LENGTH+1;
  for(let st=1;st<windows;st++) {
    counts[a[st-1]]--;
    counts[a[st+LENGTH-1]]++;
    const maximum=Math.max(...counts);
    if(maximum<min){min=maximum;firstAt=st;}
  }
  return {symbols:a.length,windows,minMostFrequent:min,firstAt};
}

/** @param {number} seed @returns {()=>number} */
function random(seed) {
  let x=seed>>>0;
  return ()=>{
    x^=x<<13; x^=x>>>17; x^=x<<5;
    return x>>>0;
  };
}

/**
 * Exactly reversible 5x6 column shift; a synthetic control is deliberately
 * encoded under an unknown permutation of ALL 30 symbols.
 * @param {number[]} input
 * @param {number[]} key
 * @param {number[]} sections
 * @param {number} period
 * @param {number} shift
 * @param {boolean} reset
 * @param {boolean} inverse
 * @returns {number[]}
 */
function fractionate(input,key,sections,period,shift,reset,inverse) {
  const inverseKey=Array(ALPHABET);
  for(let x=0;x<ALPHABET;x++)inverseKey[key[x]]=x;
  const chunks=reset?sections:[input.length];
  let base=0;
  const result=[];
  for(const len0 of chunks) {
    for(let st=0;st<len0;st+=period) {
      const len=Math.min(period,len0-st),delta=shift%len;
      for(let j=0;j<len;j++) {
        const current=key[input[base+st+j]];
        const neighbor=j+(inverse?len-delta:delta);
        const other=key[input[base+st+neighbor%len]];
        result.push(inverseKey[COLUMNS*Math.floor(current/COLUMNS)+
          other%COLUMNS]);
      }
    }
    base+=len0;
  }
  assert.equal(base,input.length);
  return result;
}

/** @param {number[]} a @returns {number} */
function largestCount(a) {
  const counts=new Uint32Array(ALPHABET);
  for(const x of a)counts[x]++;
  return Math.max(...counts);
}

/** @param {number[]} source @param {number[]} lengths */
function positiveControl(source,lengths) {
  const key=Array.from({length:ALPHABET},(_,i)=>i);
  const rng=random(0x33013005);
  for(let i=ALPHABET-1;i>0;i--) {
    const j=rng()%(i+1);
    [key[i],key[j]]=[key[j],key[i]];
  }
  const plain=source.slice(1000,1000+LENGTH);
  const period=15,shift=11,reset=true;
  const ciphertext=fractionate(plain,key,lengths,period,shift,reset,false);
  const decoded=fractionate(ciphertext,key,lengths,period,shift,reset,true);
  assert.deepEqual(decoded,plain);
  assert.deepEqual(fractionate(decoded,key,lengths,period,shift,reset,false),
    ciphertext);
  const cap=pairCapacity(split(ciphertext,lengths),period,shift);
  assert.ok(largestCount(decoded)<=cap.allKeyCap,
    "A true hidden-key original-length control must pass this relaxation");
  return {hiddenSecretAlphabetPositions:ALPHABET,plaintextRecovered:LENGTH,
    ciphertextReencrypted:LENGTH,period,shift,pageSections:lengths.length,
    mostFrequentTruePlaintextSymbol:largestCount(plain),
    generousSecretKeyCap:cap.allKeyCap};
}

/** @param {number[]} whole @param {number[]} lengths @returns {number[][]} */
function split(whole,lengths) {
  let at=0;
  const out=lengths.map(n=>{const r=whole.slice(at,at+n);at+=n;return r;});
  assert.equal(at,whole.length);
  return out;
}

function main() {
  const parts=sourceSections(),original=parts.flat();
  const lengths=parts.map(x=>x.length);
  const refs=Object.fromEntries(Object.entries(REFS).map(
    ([name,filename])=>[name,controlMinFrequency(nativeGP30(read(filename)))]));
  const smallest=Math.min(...Object.values(refs).map(x=>x.minMostFrequent));
  let n=0,max=null,min=null,passed=0;
  for(const clock of ["global","section"]) {
    const chunks=clock==="global"?[original]:parts;
    for(const period of PERIODS)for(const shift of
      new Set(SHIFTS.map(value=>value%period).filter(Boolean))) {
      const values=pairCapacity(chunks,period,shift);
      const record={clock,period,shift,...values};
      if(!max||record.allKeyCap>max.allKeyCap)max=record;
      if(!min||record.allKeyCap<min.allKeyCap)min=record;
      if(record.allKeyCap>=smallest)passed++;
      n++;
    }
  }
  assert.equal(n,280);
  assert.equal(max.allKeyCap,1867);
  assert.ok(max.allKeyCap<smallest);
  const plant=positiveControl(nativeGP30(
    read("resources/control/shakespeare_first300k.txt")),lengths);
  return {
    classification:"All-secret original GP29+spaces 5x6 two-tap coordinate fractionation: finite conditional exclusion",
    source:{runes:12956,wordSpaces:2888,sections:8,symbols:LENGTH,
      sectionLengths:lengths},
    theorem:"Every decoded symbol requires current ciphertext in a six-element row and shifted ciphertext in a five-element column. Upper bound is min(top6 of row-top5 counts, top5 of column-top6 counts), valid for every secret 30-symbol square.",
    tests:{count:n,maximum: max, minimum:min,
      referenceWindowsThatCouldFit:passed===0?0:null},
    references:refs,minimumAcrossAllReferences:smallest,
    referenceWindowsExcluded:
      Object.values(refs).reduce((a,b)=>a+b.windows,0),
    hiddenKeyPositive:plant,
    limits:"Static 5x6 key, two ciphertext coordinates, fixed period/shift/restart, source-native ordinary GP prose with explicit word spaces; dynamic keys, alternate source text, more taps and variable segmentation remain open."
  };
}

if(require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={sourceSections,pairCapacity,nativeGP30,controlMinFrequency,
  fractionate,largestCount,positiveControl,main};
