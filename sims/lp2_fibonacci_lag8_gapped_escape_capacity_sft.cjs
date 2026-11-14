"use strict";

/**
 * Source-shape matched (nine page-IV gaps) exhaustive English-register test.
 * Proves how many local rune overrides a page-secret lag8 scalar cipher
 * would need to encode any native-English window from three pinned corpora.
 *
 * Run: node sims/lp2_fibonacci_lag8_gapped_escape_capacity_sft.cjs
 * Node 22 CommonJS. Source inputs remain unchanged.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.join(__dirname, "..");
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const {encodeSourceGP} = require("./lp2_fibonacci_lag8_allsecret_pagewise_capacity_sft.cjs");
const {allSecretCapacity} = require("./lp2_fibonacci_lag8_source_scalar_feedback_sft.cjs");
const FIB = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55];
const LENGTHS = FIB.map(p => corpus.pages[p].indices.length);

/**
 * For every full 2346-rune reference window, remove the first nine positions
 * of each of the ten original source page lengths. The surviving 2256 runes
 * are exactly the positions the candidate feedback inverse could encode.
 *
 * A sliding window moves ten disjoint interval endpoints at each step, so all
 * original reference positions are checked without copying 2256 symbols
 * for every start. Time O(29 * source length).
 *
 * @param {number[]} native
 * @returns {{sourceRunes:number,windows:number,minOne:number,minTwo:number,
 *   within177:number,within316:number,within376:number}}
 */
function scanGapped(native) {
  const begins = [], ends = [];
  let window = 0, surviving = 0;
  for (const length of LENGTHS) {
    begins.push(window + 9);
    ends.push(window + length);
    window += length;
    surviving += length - 9;
  }
  assert.equal(window, 2346);
  assert.equal(surviving, 2256);
  assert.ok(native.length >= window);
  const hist = Array(29).fill(0);
  for (let t = 0; t < begins.length; t++)
    for (let k = begins[t]; k < ends[t]; k++) hist[native[k]]++;
  let minOne=Infinity, minTwo=Infinity, within177=0,within316=0,within376=0;
  let windows=0;
  for (let s = 0; s + window <= native.length; s++) {
    if (s > 0) {
      for (let t = 0; t < begins.length; t++) {
        hist[native[s - 1 + begins[t]]]--;
        hist[native[s - 1 + ends[t]]]++;
      }
    }
    let a=0,b=0;
    for (const n of hist) {
      if (n >= a) {b=a; a=n;}
      else if (n > b) b=n;
    }
    minOne=Math.min(minOne,a);
    minTwo=Math.min(minTwo,a+b);
    within177+=Number(a<=177);
    within316+=Number(a+b<=316);
    within376+=Number(a+b<=376);
    windows++;
  }
  return {sourceRunes:native.length,windows,minOne,minTwo,
    within177,within316,within376};
}

/** @param {number[]} cipher @returns {{zero:number,lag8Echo:number,union:number}} */
function visibleMarkers(cipher) {
  let zero=0,lag8Echo=0,union=0;
  for (let i=9;i<cipher.length;i++) {
    const now=(cipher[i]-cipher[i-1]+29)%29;
    const lag=(cipher[i-8]-cipher[i-9]+29)%29;
    const first=now===0;
    const second=now!==0 && lag!==0 && now===lag;
    zero+=Number(first);
    lag8Echo+=Number(second);
    union+=Number(first||second);
  }
  return{zero,lag8Echo,union};
}
function main() {
  assert.deepEqual(LENGTHS,[262,266,201,217,263,255,272,273,261,76]);
  const capacity=allSecretCapacity(FIB);
  assert.deepEqual([capacity.one,capacity.two,capacity.n],[177,316,2256]);
  const markers=FIB.map(p=>visibleMarkers(corpus.pages[p].indices))
    .reduce((a,m)=>({zero:a.zero+m.zero,lag8Echo:a.lag8Echo+m.lag8Echo,
      union:a.union+m.union}),{zero:0,lag8Echo:0,union:0});
  assert.deepEqual(markers,{zero:15,lag8Echo:45,union:60});
  // An override at one source position can increase any fixed two-letter
  // occupancy by at most one, regardless of page-secret alphabet and slope.
  const repairedUpper=capacity.two+markers.union;
  assert.equal(repairedUpper,376);
  const refs=[
    ["Shakespeare","resources/control/shakespeare_first300k.txt",214761,193,384],
    ["Gibran","resources/control/gibran_prophet_58585.txt",60147,223,402],
    ["Emerson","resources/control/emerson_essays_2944.txt",318982,211,402]
  ];
  const checks=[];
  for(const [name,file,windows,minOne,minTwo] of refs){
    const scan=scanGapped(encodeSourceGP(read(file)));
    assert.deepEqual([scan.windows,scan.minOne,scan.minTwo],
      [windows,minOne,minTwo],name);
    assert.deepEqual([scan.within177,scan.within316,scan.within376],
      [0,0,0]);
    checks.push({name,...scan});
  }
  assert.equal(checks.reduce((n,x)=>n+x.windows,0),593890);
  assert.ok(Math.min(...checks.map(x=>x.minTwo))>repairedUpper);
  console.log(JSON.stringify({
    fixedSourcePageLengths:LENGTHS,actualEncodedTail:2256,
    pageSecretScalarAndPermutationCapacity:capacity,
    sourceVisibleMarkerCounts:markers,
    maxTwoLettersAfterEveryVisibleMarkerIsArbitrarilyOverridden:repairedUpper,
    minimumRequiredOverrides:Math.min(...checks.map(x=>x.minTwo))-capacity.two,
    controls:checks,checkedNativeWindows:593890,
    conclusion:"At least 68 local outputs must change to match any of these source-native English windows; the 60 original zero/lag8-echo markers cannot by themselves supply that capacity."
  },null,2));
}
if(require.main===module)main();
module.exports={scanGapped,visibleMarkers};
