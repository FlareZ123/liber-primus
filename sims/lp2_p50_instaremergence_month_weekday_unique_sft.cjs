"use strict";
/**
 * Source-selected p50 prime-rank date pointer: a blinded language-register
 * uniqueness check and exact finite inventory-permutation counterfactual.
 * Exploratory historical interpretation only: never a decoded LP2 page.
 * Run: node sims/lp2_p50_instaremergence_month_weekday_unique_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/base60-grid.json"), "utf8"));
const old = JSON.parse(fs.readFileSync(path.join(root,
  "resources/cicada2014-sexagesimal-source.json"), "utf8"));
const bytes = grid.byte_rows.flat();
const historic = old.decimal_values;
assert.equal(bytes.length, 256);
assert.equal(historic.length, 256);
const GP = ["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X",
  "S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
assert.equal(GP.length, 29);

/** @param {number} n */
function rank(n) {
  let count = 0;
  for (let value = 2; value <= n; value++) {
    let prime = true;
    for (let d = 2; d * d <= value; d++) {
      if (value % d === 0) { prime = false; break; }
    }
    if (prime) count++;
  }
  return count;
}
const sentenceSums = [1259, 1031, 1229];
const offsets = sentenceSums.map(rank);
const titleRank = rank(761);
assert.deepEqual(offsets, [205,173,201]);
assert.equal(titleRank,135);
const selected = offsets.map((i) => bytes[i]);
const historicalSelected = offsets.map((i) => historic[i]);
assert.deepEqual(selected,[76,117,74]);
assert.deepEqual(historicalSelected,selected);
assert.equal(bytes[titleRank],171);
assert.equal(historic[titleRank],171);

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep",
  "Oct","Nov","Dec"];
const weekdayAbbreviations = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
const alphabet = new Map(GP.map((v,i)=>[v,i]));
/** @param {string} word */
function weekdayRunes(word) {
  return Array.from(word).map((ch) => alphabet.get(ch));
}
/** @param {number[]} values */
function matchMonthWeekday(values) {
  const literal = String.fromCharCode(...values);
  const runeNumbers = values.map(v => v % 29);
  return {
    literal,
    runeText:runeNumbers.map(i=>GP[i]).join(""),
    weekday:weekdayAbbreviations.find(
      v=>JSON.stringify(weekdayRunes(v))===JSON.stringify(runeNumbers))??null,
    month:months.find(v=>v.toLowerCase()===literal.toLowerCase())??null
  };
}
const uniquePairs=[];
for (const month of months) {
  for(let mask=0;mask<8;mask++){
    const str=Array.from(month,(c,j)=>mask&(1<<j)?c.toUpperCase():c.toLowerCase()).join("");
    const m=matchMonthWeekday(Array.from(str, c=>c.charCodeAt(0)));
    if(m.weekday) uniquePairs.push({...m,canonicalMonth:month});
  }
}
assert.equal(uniquePairs.length,1);
assert.deepEqual(uniquePairs[0],{
  literal:"JuL",runeText:"TUE",weekday:"TUE",month:"Jul",canonicalMonth:"Jul"
});

const rowMajor = bytes;
const colMajor = Array.from({length:8},(_,j)=>
  grid.byte_rows.map(row=>row[j])).flat();
const cases=[];
for(const [layout,register] of [
  ["row-major",rowMajor],["column-major",colMajor]
]){
  for(const displacement of [0,-1]){
    const positions=offsets.map(i=>i+displacement);
    for(const reversed of [false,true]){
      const current=positions.map(i=>register[i]);
      if(reversed)current.reverse();
      cases.push({
        layout,displacement,reversed,
        byteTriple:current,
        ...matchMonthWeekday(current)
      });
    }
  }
}
const hits=cases.filter(c=>c.month&&c.weekday);
assert.equal(hits.length,1);
assert.deepEqual(
  [hits[0].layout,hits[0].displacement,hits[0].reversed],
  ["row-major",0,true]
);

const counts=Array(256).fill(0);
for(const b of bytes)counts[b]++;
const total=256*255*254;
const targetProbability3=counts[76]*counts[117]*counts[74]/total;
const targetProbability4=counts[76]*counts[117]*counts[74]
  *counts[171]/(total*253);
assert.equal(counts[74],1);
assert.equal(counts[76],2);
assert.equal(counts[117],2);
assert.equal(counts[171],3);
assert.deepEqual(bytes.filter((v,i)=>v!==historic[i]).length,10);
assert.ok(Math.abs(targetProbability3-1/4145280)<1e-18);
assert.ok(Math.abs(targetProbability4-1/349585280)<1e-18);
const result={
  input:"unaltered p50 table and independent archived 2014 sexagesimal bytes",
  frozenSentenceSums:sentenceSums,
  primeRanks:offsets,
  titlePrimeRank:titleRank,
  historicByteTriplesAgree:true,
  numberOfTranscriptionDifferences:10,
  originalTableSelected: selected,
  reversedAscii:"JuL",
  reversedGP29:"TUE",
  titleRankMarkerLatin1:String.fromCharCode(bytes[titleRank]),
  allPossibleMixedCaseEnglishMonthToGPWeekdayMatches:uniquePairs,
  finiteNaturalVariants:cases,
  originalNaturalVariantHits:hits.length,
  conditionalExactMultisetProbabilityOneFixedTriple:targetProbability3,
  conditionalExactMultisetProbabilityFourFixedBytes:targetProbability4,
  warning:"Post-hoc selected cross-year route; these fixed-index probabilities are neither look-elsewhere-adjusted nor evidence of plaintext, key, future-year selection or author intent."
};
if(require.main===module)console.log(JSON.stringify(result,null,2));
module.exports={rank,matchMonthWeekday,uniquePairs,run:()=>result};
