"use strict";
/**
 * Native solved-Cicada adversarial control for proposed transparent EA anchors.
 *
 * Tests whether *the entire visible marker geometry* of original ciphertext
 * equality events resembles literal GP EA positions sampled from the native
 * author's known word vocabulary, while independently rotating the known
 * source runes relative to all visible LP2 ciphertext word boundaries.
 *
 * Exactly conditions the controls on the original observed 86 marker count.
 * The distribution of total marker count and same-boundary assumptions are
 * separately covered by sims/ea_zero_step_reversible.cjs.
 *
 * A conditional source-language probe, not a discovery probability or proof
 * that the original ciphertext repeats actually encode EA.
 *
 * Run: node sims/native_ea_marker_geometry_heldout.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {samplePlain} = require("./ea_zero_step_reversible.cjs");

const root = path.resolve(__dirname, "..");
const json = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const pages = json.pages.filter(p => p.status === "unsolved" && p.indices.length)
  .map(p => p.indices);
const lengths = pages.map(p => p.length);
assert.equal(lengths.length, 55);
assert.equal(lengths.reduce((a,b)=>a+b),12956);

function rng(seed) {
  let state=seed>>>0;
  return ()=>{state^=state<<13;state^=state>>>17;state^=state<<5;
    return state>>>0;};
}

/**
 * @param {number[][]} plain
 * @returns {number[]}
 */
function literalEAPositions(plain) {
  let offset=0;
  const out=[];
  for (const page of plain) {
    for (let i=1;i<page.length;i++) if (page[i]===28)
      out.push(offset+i);
    offset+=page.length;
  }
  return out;
}

/** Actual repeated original LP2 runes are conditional, *not* confirmed EA. */
function actualPositions() {
  let offset=0;
  const result=[];
  for (const page of pages) {
    for (let i=1;i<page.length;i++)if(page[i]===page[i-1])
      result.push(offset+i);
    offset+=page.length;
  }
  assert.equal(result.length,86);
  return result;
}

function features(markers) {
  const perPage=[];
  let global=0, start=0;
  for (const n of lengths) {
    let count=0;
    while (start<markers.length && markers[start]<global+n) {
      count++; start++;
    }
    perPage.push(count);
    global+=n;
  }
  assert.equal(start,markers.length);
  const intervals=[];
  for (let i=1;i<markers.length;i++)
    intervals.push(markers[i]-markers[i-1]);
  const rates=[6,28,79,256].map(gap=>
    intervals.filter(v=>v<=gap).length);
  const emptyPages=perPage.filter(x=>x===0).length;
  let dispersion=0;
  for (let i=0;i<lengths.length;i++) {
    const exp=markers.length*lengths[i]/12956;
    dispersion+=(perPage[i]-exp)**2/exp;
  }
  return [...rates,emptyPages,dispersion,Math.max(...intervals)];
}

function evaluate() {
  const originalMarkers=actualPositions();
  const target=features(originalMarkers);
  const random=rng(0x71a7e015);
  const wanted=86;
  const maxDraws=30000,train=[],test=[];
  let candidates=0,accepted=0;
  for (let j=0;j<maxDraws;j++) {
    const source=samplePlain(random);
    const markers=literalEAPositions(source);
    if (markers.length!==wanted)continue;
    (j<maxDraws/2?train:test).push(features(markers));
    accepted++;candidates++;
  }
  assert.ok(train.length>80&&test.length>80);
  const mu=Array.from({length:target.length},(_,k)=>
    train.reduce((s,row)=>s+row[k],0)/train.length);
  const sd=mu.map((mean,k)=>Math.sqrt(
    train.reduce((s,row)=>s+(row[k]-mean)**2,0)/(train.length-1)));
  const keys=["gapsAtMost6","gapsAtMost28","gapsAtMost79",
    "gapsAtMost256","pagesWithNoMarkers","pageCountDispersion",
    "largestMarkerGap"];
  assert.ok(sd.every(x=>x>0));
  const score=xs=>Math.max(...xs.map((x,k)=>Math.abs((x-mu[k])/sd[k])));
  const observedScore=score(target);
  const nullScore=test.map(score);
  const larger=nullScore.filter(x=>x>=observedScore).length;
  const summary=keys.map((key,k)=>{
    const ge=test.filter(row=>row[k]>=target[k]).length;
    const le=test.filter(row=>row[k]<=target[k]).length;
    return {key,original:target[k],nullMean:mu[k],
      nullSd:sd[k],originalZ:(target[k]-mu[k])/sd[k],
      upperTail:(1+ge)/(test.length+1),
      lowerTail:(1+le)/(test.length+1)};
  });
  const result={
    classification:"native GP source-conditioned EA anchor geometry, not confirmed original plaintext",
    source:"solved Cicada LP1/LP2 original words via the shared Agent50 exact native samplePlain",
    control:"original exact 55 physical page lengths, 2896 word lengths; random independent cyclic text rotation to break visible cipher spacing; exactly 86 literal EAs after excluding physical page heads",
    seed:"0x71a7e015",trials:maxDraws,accepted,trainCount:train.length,
    calibrationCount:test.length,
    originalMarkers:originalMarkers.length,
    sourceCondition:"exactly 86 markers; independent native draws and heldout calibration",
    features:summary,
    multifeatureMaxAbsZ:observedScore,
    matchedNullExceeds:larger,
    familywiseUpperP:(1+larger)/(test.length+1),
    caution:"Only assesses this finite native vocabulary sampling process; a language source with different EA placements can evade it."
  };
  process.stdout.write(JSON.stringify(result,null,2)+"\n");
  return result;
}
if(require.main===module)evaluate();
module.exports={literalEAPositions,actualPositions,features,evaluate};
