"use strict";
/**
 * SFT: Original LP2 81²/80² bookend p50 full 256-cell changing-clock
 * original-data equality/collision theorem across ALL hidden 841! pair maps.
 *
 * Unlike a finite polynomial sweep, this grants a completely arbitrary
 * (29²)! reversible two-rune operation independently at each cell in the
 * physical p50 32x8 numerical table. The first output plaintext P is
 * necessarily a deterministic function of the exact triple
 *   (256-cell source address, original source K, original C).
 * Identical source triples must emit the identical P even when the hidden
 * second output saves all information and even with unlimited key length.
 *
 * If clocks use the full p50 numeric byte value rather than the cell
 * address, repeated source byte values create additional exact constraints.
 *
 * This is a bounded native-GP English-architecture test, not a universal
 * mathematical exclusion of constructed non-English plaintext or a proof
 * that the bookend / p50 clock was authored by Cicada.
 *
 * Windows 11, Node.js 22, CommonJS, read-only.
 * Run as one standalone file through manual-node22-sft-runner.yml.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { encodeSourceNativeGP } =
  require("./lp2_native_gp_source_orthography_sft.cjs");
const ROOT = path.join(__dirname, "..");
const text = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const j = JSON.parse(text("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(text("resources/liber-primus/lp2-grid-256.json"));
const full = j.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const A = full.slice(0, 6561);
const C = full.slice(6561);
assert.deepEqual([full.length,A.length,C.length,grid.bytes.length],
  [12956,6561,6395,256]);
assert.deepEqual(A.slice(-6),C.slice(-6)); // original DJU BEI source echo
const printedHoles = new Set([2244,2384,2476,2575,2672]);
const positions = Array.from({length:6400},(_,i)=>i)
  .filter(i=>!printedHoles.has(i));
assert.equal(positions.length,C.length);

/** x -> (x+1)*x modulo the original p7 GF3 quartic. */
function stepGF81(x) {
  const d=[0,0,0,0,0];
  for(let i=0;i<4;i++){
    const tri=x%3;x=Math.floor(x/3);
    d[i]+=tri;d[i+1]+=tri;
  }
  const hi=d[4]%3;
  for(let i=0;i<3;i++)d[i]-=hi;
  return d.slice(0,4).reduce((s,v,i)=>
    s+((v%3+3)%3)*3**i,0);
}
const GF=[1];
while(GF.length<80)GF.push(stepGF81(GF.at(-1)));
assert.equal(new Set(GF).size,80);
const K={
  field:positions.map(i=>A[
    GF[Math.floor(i/80)]*81+GF[i%80]]),
  crop:positions.map(i=>A[
    (Math.floor(i/80)+1)*81+i%80+1])
};
const cell = C.map((_,i)=>(6560+i)%256);
const numericToken = cell.map(ix=>grid.bytes[ix]);
assert.equal(new Set(cell).size,256);
assert.equal(new Set(numericToken).size,161);
const controls={
  Gibran: encodeSourceNativeGP(
    text("resources/control/gibran_prophet_58585.txt")),
  Shakespeare: encodeSourceNativeGP(
    text("resources/control/shakespeare_first300k.txt"))
};
assert.deepEqual(Object.fromEntries(Object.entries(controls)
  .map(([name,t])=>[name,t.length])),
  {Gibran:62492,Shakespeare:217106});

/**
 * @param {number[]} key Original K from source A, 6395 runes.
 * @param {number[]} state Full p50 cell address or original token.
 * @param {number[]} input Original C or known source-native plant.
 * @returns {{classes:number,groups:number,relations:number,
 *            forcedPositions:number,maximumMultiplicity:number,
 *            collisions:number[][]}}
 */
function forcedEqualities(key,state,input){
  assert.equal(key.length,6395);
  assert.equal(state.length,6395);
  assert.equal(input.length,6395);
  const byInput=new Map();
  for(let i=0;i<input.length;i++){
    const id=state[i]*841+key[i]*29+input[i];
    let ix=byInput.get(id);
    if(!ix){ix=[];byInput.set(id,ix);}
    ix.push(i);
  }
  const collisions=[...byInput.values()].filter(v=>v.length>1);
  const relations=collisions.reduce((sum,ix)=>sum+ix.length-1,0);
  const pairCount=collisions.reduce((sum,ix)=>sum+
    ix.length*(ix.length-1)/2,0);
  return {
    classes:byInput.size,
    groups:collisions.length,
    relations,
    forcedPositions:collisions.reduce((sum,ix)=>sum+ix.length,0),
    maximumMultiplicity:Math.max(1,...collisions.map(x=>x.length)),
    pairCount,
    collisions
  };
}

/** Lower bound on errors relative to any fixed deterministic local map. */
function originalNativeDisagreements(groups,source,offset){
  let contradictions=0;
  for(const ix of groups){
    const hits=new Uint16Array(29);
    for(const i of ix)hits[source[offset+i]]++;
    contradictions+=ix.length-Math.max(...hits);
  }
  return contradictions;
}
const mod=x=>(x%29+29)%29;

/**
 * Fully reversible first output under a two-rune triangular mixer
 * (K,C)->(P,K), keyed by every physical p50 cell and source K.
 * Parameters have NOTHING in common with fitted original C.
 * @param {number} z physical cell address (0..255)
 * @param {number} k original GP29 source K
 */
function plantShift(z,k){
  return mod(3*z+7*k*k+5*z*k+11);
}

const sourceReports={};
for(const [sourceName,key] of Object.entries(K)){
  const report={};
  for(const [clockName,clockValues] of
    Object.entries({cellAddress256:cell,numericToken161:numericToken})){
    const E=forcedEqualities(key,clockValues,C);
    const windows={};
    for(const [name,source] of Object.entries(controls)){
      let count=0,min=Infinity,max=0,sum=0,compatible=0;
      for(let offset=0;offset+C.length<=source.length;offset+=2131){
        const bad=originalNativeDisagreements(
          E.collisions,source,offset);
        count++;
        min=Math.min(min,bad);
        max=Math.max(max,bad);
        sum+=bad;
        if(bad===0)compatible++;
      }
      windows[name]={
        count,zeroContradictions:compatible,
        mandatoryDisagreements:[min,max],
        mean:sum/count
      };
      assert.equal(compatible,0);
    }
    report[clockName]={
      distinctInputTriples:E.classes,
      repeatedInputTriples:E.groups,
      equalityConstraints:E.relations,
      sourcePositionPairs:E.pairCount,
      maximumMultiplicity:E.maximumMultiplicity,
      nativeSourceControlWindows:windows
    };
  }
  const expected=sourceName==="field"
    ?[[6208,185,187,189,3],[6305,90,90,90,2]]
    :[[6224,167,171,175,3],[6307,87,88,89,3]];
  for(let i=0;i<2;i++){
    const key=i===0?"numericToken161":"cellAddress256";
    const r=report[key],want=expected[i];
    assert.deepEqual([
      r.distinctInputTriples,r.repeatedInputTriples,
      r.equalityConstraints,r.sourcePositionPairs,
      r.maximumMultiplicity
    ],want);
    assert.equal(r.nativeSourceControlWindows.Gibran.count,27);
    assert.equal(r.nativeSourceControlWindows.Shakespeare.count,99);
  }
  // Positive, source-paired, full-length GP29 plaintext plant under
  // a source cell-dependent unknown 841-pair invertible triangular mapping.
  const sourcePlain=controls.Gibran.slice(0,C.length);
  const plant=sourcePlain.map((p,i)=>mod(
    p-plantShift(cell[i],key[i])));
  const inverse=plant.map((c,i)=>mod(
    c+plantShift(cell[i],key[i])));
  assert.deepEqual(inverse,sourcePlain);
  for(const [name,state] of Object.entries({
    cellAddress256:cell,numericToken161:numericToken
  })){
    // For cellAddress256, exactly the planted local map is stationary;
    // the numeric token case has multiple cells with the same numeric
    // value and different keys, so that plant is NOT a positive test
    // of a token-only map. Use a separate indexed-by-token plant below.
    const cipher=name==="cellAddress256"?plant:
      sourcePlain.map((p,i)=>mod(p-plantShift(state[i],key[i])));
    const checked=forcedEqualities(key,state,cipher);
    const bad=originalNativeDisagreements(
      checked.collisions,sourcePlain,0);
    assert.equal(bad,0);
    const recovered=cipher.map((c,i)=>mod(
      c+plantShift(state[i],key[i])));
    assert.deepEqual(recovered,sourcePlain);
  }
  report.nativeGPIndependentPlantRecovered=sourcePlain.length;
  sourceReports[sourceName]=report;
}

console.log(JSON.stringify({
  status:"PASS",
  firstPartyClues:"original p27/p55 repeated DJU BEI 81²/80²; physical five missing ordinals; original 32x8 p50 source table",
  theorem:"A deterministic local original-source first-output map f(state,K,C) MUST reproduce the same plaintext rune for every identical source triple. This is true for ANY secret 841! reversible paired mixer, even with arbitrary 256 cell-state keys and a hidden second output.",
  fullCellPhaseInvariance:"Rotating the starting p50 table cell only bijectively relabels its 256 source addresses, preserving all collision constraints.",
  originalSource:sourceReports,
  caveat:"A source-native-GP language contradiction for specified original operand alignments, not a universal exclusion of atypical text or evolving cipher state. No real plaintext or key recovered."
},null,2));
