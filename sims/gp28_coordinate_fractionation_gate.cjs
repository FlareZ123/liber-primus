"use strict";
/**
 * Key-independent two-tap rectangular coordinate fractionation gate.
 *
 * Compress original nonrepeated within-page GP29 predecessor steps into
 * 28 rank symbols. For an arbitrary secret bijection S between the 28
 * symbols and any r-by-c rectangle (r*c=28), a coordinate-mixing inverse
 * of the form
 *
 * P[i] = S^-1(c * floor(S[Y[i]]/c) + (S[Y[j(i)]] % c))
 *
 * obtains a row from observed Y[i] and a column from another observed
 * position j(i). With a fixed secret S, every one plaintext rune has at
 * most c*r=28 distinct ordered ciphertext-pair preimages. Consequently,
 * its total count is at most the sum of the 28 most common ordered pairs.
 * The theorem holds for ALL 28! secret alphabet placements and rectangle
 * orientations; it does not assume a guess at the key.
 *
 * Test a declared finite set of periodic shifted-column clocks under book
 * and page restart modes, two GP28 rank orders, with all three independent
 * source reference corpora checked as contiguous 12,815-rune windows.
 * A real source-shaped secret-key control reconstructs every ciphertext
 * rune, including 55 page IVs and 86 equal-adjacent marker sites.
 *
 * Run: node sims/gp28_coordinate_fractionation_gate.cjs
 * Node 22, CommonJS, built-ins only. No disk writes or external packages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const PAGES = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const REFS = {
  Shakespeare: "resources/control/shakespeare_first300k.txt",
  Gibran: "resources/control/gibran_prophet_58585.txt",
  Emerson: "resources/control/emerson_essays_2944.txt"
};
const WORD = new Map(corpus.translit.map((name, index) => [name, index]));
const PERIODS = [2, 3, 4, 5, 6, 7, 8, 9, 11, 13, 14, 16, 17, 23,
  28, 29, 32, 41, 55, 79, 128, 233, 256, 466];
const SHIFTS = [1, 2, 3, 5, 7, 11];
const N = 12815;
const ALPHABET = 28;

assert.equal(PAGES.length, 55);
assert.equal(PAGES.reduce((n, p) => n + p.indices.length, 0), 12956);

/**
 * @param {number} prev
 * @param {number} next
 * @param {"cyclic"|"sorted"} mode
 * @returns {number|null}
 */
function rank(prev, next, mode) {
  if (prev === next) return null;
  return mode === "cyclic"
    ? (next - prev + 28) % 29
    : next - Number(next > prev);
}

/**
 * @param {number} prev
 * @param {number} step
 * @param {"cyclic"|"sorted"} mode
 * @returns {number}
 */
function putRank(prev, step, mode) {
  assert.ok(step >= 0 && step < 28);
  return mode === "cyclic" ?
    (prev + step + 1) % 29 : step + Number(step >= prev);
}

/**
 * @param {"cyclic"|"sorted"} mode
 * @returns {number[][]}
 */
function pageRanks(mode) {
  return PAGES.map(({indices}) => {
    const out = [];
    for (let i = 1; i < indices.length; i++) {
      const v = rank(indices[i-1], indices[i], mode);
      if (v !== null) out.push(v);
    }
    return out;
  });
}

/**
 * @param {number[][]} parts
 * @param {number} period
 * @param {number} shift
 * @returns {{bound:number,largestPair:number,sites:number}}
 */
function pairCap(parts, period, shift) {
  const counts = new Uint32Array(784);
  let sites = 0;
  for (const part of parts) {
    for (let block = 0; block < part.length; block += period) {
      const len = Math.min(period, part.length - block);
      const delta = shift % len;
      for (let j = 0; j < len; j++) {
        const current = part[block+j];
        const previous = part[block+(j+len-delta)%len];
        counts[28*current+previous]++;
        sites++;
      }
    }
  }
  assert.equal(sites, N);
  const sorted = Array.from(counts).sort((a,b)=>b-a);
  return {
    bound: sorted.slice(0,28).reduce((a,b)=>a+b,0),
    largestPair: sorted[0], sites
  };
}

/** @param {string} source @returns {number[]} */
function toNativeGP28(source) {
  const out = [];
  for (let word of source.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < word.length;) {
      const two = WORD.get(word.slice(i, i+2));
      if (two !== undefined) {
        if (two < 28) out.push(two);
        i += 2;
      } else {
        const one = WORD.get(word[i]);
        if (one !== undefined && one < 28) out.push(one);
        i++;
      }
    }
  }
  return out;
}

/**
 * Exact smallest most-frequent-letter count over every full source window.
 * @param {number[]} source
 * @returns {{runes:number,windows:number,minTopOne:number,firstAt:number}}
 */
function leastTopOne(source) {
  const counts = new Int32Array(28);
  for (let i = 0; i < N; i++) counts[source[i]]++;
  let min = Math.max(...counts), firstAt = 0;
  const windows = source.length-N+1;
  for (let start = 1; start < windows; start++) {
    counts[source[start-1]]--;
    counts[source[start+N-1]]++;
    let top = 0;
    for (const count of counts) if (count > top) top = count;
    if (top < min) {min=top;firstAt=start;}
  }
  return {runes:source.length, windows, minTopOne:min, firstAt};
}

/** @param {number} seed @returns {()=>number} */
function rng(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    return x >>> 0;
  };
}

/**
 * Exact reversible column-coordinate shift on hidden rows x cols = 28 grid.
 * @param {number[]} input
 * @param {number[]} positionOf
 * @param {number[]} pageLengths
 * @param {number} period
 * @param {number} shift
 * @param {boolean} pageReset
 * @param {number} columns
 * @param {boolean} inverse
 * @returns {number[]}
 */
function fractionate(input, positionOf, pageLengths, period, shift,
  pageReset, columns, inverse) {
  const symbolAt = new Array(28);
  for (let i=0;i<28;i++) symbolAt[positionOf[i]]=i;
  assert.ok(symbolAt.every(x=>x!==undefined));
  const chunks = pageReset ? pageLengths : [input.length];
  const result = [];
  let base = 0;
  for (const chunk of chunks) {
    for (let block = 0; block < chunk; block+=period) {
      const len = Math.min(period,chunk-block);
      const delta = shift % len;
      for (let j = 0; j < len; j++) {
        const first=positionOf[input[base+block+j]];
        const secondAt = inverse ? (j+len-delta)%len : (j+delta)%len;
        const second=positionOf[input[base+block+secondAt]];
        result.push(symbolAt[columns*Math.floor(first/columns)+
          second%columns]);
      }
    }
    base+=chunk;
  }
  assert.equal(base,input.length);
  return result;
}

/**
 * Reconstruct a complete, original-layout GP29 ciphertext from 28-way steps,
 * retaining source positions of 55 IVs and 86 no-advance markers.
 * @param {number[]} steps
 * @param {"cyclic"|"sorted"} mode
 * @returns {number[][]}
 */
function emitFull(steps,mode) {
  const out=[];
  let pos=0, marks=0;
  for (const {indices} of PAGES) {
    let prev=indices[0];
    const emitted=[prev];
    for (let j=1;j<indices.length;j++) {
      if (indices[j]===indices[j-1]) marks++;
      else prev=putRank(prev,steps[pos++],mode);
      emitted.push(prev);
    }
    out.push(emitted);
  }
  assert.equal(pos,N);
  assert.equal(marks,86);
  return out;
}

/** @param {number[]} values @returns {number} */
function maxSymbolCount(values) {
  const freq=new Uint32Array(28);
  for (const x of values) freq[x]++;
  return Math.max(...freq);
}

/** @param {number[]} reference @returns {object} */
function hiddenKeyPlant(reference) {
  const plaintext=reference.slice(1000,1000+N);
  assert.equal(plaintext.length,N);
  const random=rng(0x33012026);
  const key=Array.from({length:28},(_,i)=>i);
  for (let i=27;i>0;i--) {
    const j=random()%(i+1);
    [key[i],key[j]]=[key[j],key[i]];
  }
  const original=pageRanks("cyclic");
  const lengths=original.map(x=>x.length);
  const period=7, shift=1, pageReset=false, columns=7;
  const ciphertext=fractionate(plaintext,key,lengths,period,shift,
    pageReset,columns,false);
  const sourceShape=emitFull(ciphertext,"cyclic");
  const regather=[];
  for (const emitted of sourceShape)
    for (let i=1;i<emitted.length;i++) {
      const v=rank(emitted[i-1],emitted[i],"cyclic");
      if (v!==null) regather.push(v);
    }
  assert.deepEqual(regather,ciphertext);
  const recovered=fractionate(regather,key,lengths,period,shift,
    pageReset,columns,true);
  assert.deepEqual(recovered,plaintext);
  const reencoded=fractionate(recovered,key,lengths,period,shift,
    pageReset,columns,false);
  assert.deepEqual(emitFull(reencoded,"cyclic"),sourceShape);
  const cap=pairCap([ciphertext],period,shift);
  const top=maxSymbolCount(plaintext);
  assert.ok(cap.bound>=top, "A genuine source-native control must pass");
  return {
    sourceNativeRecovered:N, reconstructedOriginalRuneSites:12956,
    markersRecreated:86, IVsRecreated:55,
    secretAlphabetSize:28, grid:"4x7", period, shift,
    truePlaintextMostFrequent:top, syntheticPairBound:cap.bound
  };
}

function main() {
  const references=Object.fromEntries(Object.entries(REFS).map(
    ([name, filename])=>[name,leastTopOne(toNativeGP28(read(filename)))]));
  const minRef=Math.min(...Object.values(references).map(v=>v.minTopOne));
  const tests=[];
  for (const mode of ["cyclic","sorted"]) {
    const pages=pageRanks(mode);
    assert.equal(pages.reduce((n,p)=>n+p.length,0),N);
    for (const clock of ["global","page"]) {
      const parts=clock==="page"?pages:[pages.flat()];
      for (const period of PERIODS) for (const shift0 of SHIFTS) {
        const shift=shift0%period;
        if (shift===0) continue;
        tests.push({mode,clock,period,shift,...pairCap(parts,period,shift)});
      }
    }
  }
  const best=tests.reduce((a,b)=>a.bound>=b.bound?a:b);
  const worst=tests.reduce((a,b)=>a.bound<=b.bound?a:b);
  assert.equal(tests.length,556);
  assert.equal(best.bound,766);
  assert.ok(best.bound<minRef);
  const planted=hiddenKeyPlant(toNativeGP28(
    read("resources/control/shakespeare_first300k.txt")));
  return {
    classification:"Finite original-cipher exclusion for stationary rectangular two-tap coordinate fractionation with native-GP28 prose",
    theorem:"For any 28-symbol secret rectangle, each plaintext rune has at most 28 ciphertext ordered-pair preimages; its count cannot exceed the 28 largest pair histogram bins.",
    original:{GP29Runes:12956,pageIVs:55,repeatedMarkerSites:86,
      GP28PayloadSites:N, examinedClocks:tests.length,
      bestPossibleMostFrequentPlaintextRune:best.bound,
      maxCase:best, minCase:worst},
    references, allSourceWindowsExcluded:best.bound<minRef,
    controls:{sourceNativeHiddenKey:planted},
    limits:"Only frozen global secret grid, two ciphertext source coordinates, declared clocks and direct native GP28 source windows. Hidden evolving alphabets, extra ciphertext taps, binary intermediates and other text may differ."
  };
}

if(require.main===module) console.log(JSON.stringify(main(),null,2));
module.exports={rank,pageRanks,pairCap,toNativeGP28,leastTopOne,
  fractionate,emitFull,maxSymbolCount,hiddenKeyPlant,main};
