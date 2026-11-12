"use strict";
/**
 * Source-original all-secret six-strand XOR parity gate permitting six
 * DIFFERENT arbitrary injective rune→GF(2^m) codebooks and unrestricted m.
 * This strictly generalizes the shared-codebook 29-column obstruction.
 * Reproduction: node sims/lp2_p2_p23_sixstrand_multialphabet_allsecret_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const corpus=JSON.parse(fs.readFileSync(path.resolve(
  __dirname,"../resources/liber-primus/lp2-corpus.json"),"utf8"));
const p2=corpus.pages[2].indices;
const pieces=corpus.pages.slice(23,27).flatMap(p=>p.indices);
assert.equal(p2.length,201);
assert.deepEqual(corpus.pages.slice(23,27).map(p=>p.indices.length),[213,270,273,265]);
assert.equal(pieces.length,1021);
const body=pieces.slice(16);
assert.equal(body.length,1005);
const layouts={
  contiguous:Array.from({length:5},(_,i)=>body.slice(201*i,201*(i+1))),
  interleaved:Array.from({length:5},(_,i)=>Array.from({length:201},(_,j)=>body[5*j+i]))
};
const WIDTH=6*29;
assert.equal(WIDTH,174);
/** @param {number[][]} streams six original rune strands */
function parityRows(streams){
  assert(streams.length===6&&streams.every(s=>s.length===201));
  return Array.from({length:201},(_,j)=>{
    let row=0n;
    for(let k=0;k<6;k++){
      const symbol=streams[k][j];
      assert(Number.isInteger(symbol)&&symbol>=0&&symbol<29);
      row|=1n<<BigInt(k*29+symbol);
    }
    return row;
  });
}
/** @param {bigint[]} rows */
function rowRank(rows){
  const pivots=Array(WIDTH).fill(0n);
  let rank=0,witnessPrefix=0;
  for(let r=0;r<rows.length;r++){
    let value=rows[r];
    for(let k=WIDTH-1;k>=0;k--){
      if(!(value&(1n<<BigInt(k))))continue;
      if(pivots[k])value^=pivots[k];
      else{
        pivots[k]=value;
        rank++;
        witnessPrefix=r+1;
        break;
      }
    }
  }
  return {rank,witnessPrefix};
}
// Every choice of six lane constants with zero XOR is a codebook solution,
// giving a canonical 5-dimensional binary subspace. If rank >= 168, kernel
// dimension <=6, leaving <=1 bit of nonconstant variation across glyphs
// for ALL six lane maps, regardless of field size.
function constantBasis(k){
  let mask=0n;
  for(let rune=0;rune<29;rune++){
    mask|=1n<<BigInt(29*k+rune);
    mask|=1n<<BigInt(29*5+rune);
  }
  return mask;
}
const constant=Array.from({length:5},(_,i)=>constantBasis(i));
const results={};
for(const [label,parts] of Object.entries(layouts)){
  const histogram={},prefixes=[];
  for(let orient=0;orient<64;orient++){
    const strands=[p2,...parts].map((s,k)=>
      orient&(1<<k)?[...s].reverse():s);
    const rows=parityRows(strands);
    for(const basis of constant){
      assert(rows.every(r=>{
        let x=r&basis,parity=0;
        while(x){x&=x-1n;parity^=1;}
        return parity===0;
      }),"constant-shared offsets must satisfy each original equation");
    }
    const {rank,witnessPrefix}=rowRank(rows);
    histogram[rank]=(histogram[rank]||0)+1;
    prefixes.push(witnessPrefix);
    assert(rank>=168 && rank<=169,
      "the original secret-lane kernel is unexpectedly larger");
  }
  results[label]={
    orientations:64,rankHistogram:histogram,
    nullityHistogram:Object.fromEntries(Object.entries(histogram)
      .map(([rank,count])=>[174-Number(rank),count])),
    earliestDecisivePrefix:Math.min(...prefixes),
    latestDecisivePrefix:Math.max(...prefixes),
    maxDifferentRuneValuesInAnyLane:Math.max(...Object.keys(histogram)
      .map(rank=>2**(174-Number(rank)-5))),
    injective29GlyphCodebooksPossible:false
  };
}
assert.equal(results.contiguous.rankHistogram[169],64);
assert.equal(results.interleaved.rankHistogram[168],64);
assert.equal(results.contiguous.maxDifferentRuneValuesInAnyLane,1);
assert.equal(results.interleaved.maxDifferentRuneValuesInAnyLane,2);
assert.equal(results.contiguous.earliestDecisivePrefix,169);
assert.equal(results.contiguous.latestDecisivePrefix,175);
assert.equal(results.interleaved.earliestDecisivePrefix,168);
assert.equal(results.interleaved.latestDecisivePrefix,176);

// Plant actual XOR shares, with six independently secret, independently
// shuffled and injective rune→GF(32) codebooks.
let state=0x3301fa17;
function rng(){
  state=(Math.imul(state,1664525)+1013904223)>>>0;
  return state;
}
const maps=[];
for(let lane=0;lane<6;lane++){
  const permutation=Array.from({length:32},(_,k)=>k);
  for(let i=31;i>0;i--){
    const j=rng()%(i+1);
    [permutation[i],permutation[j]]=[permutation[j],permutation[i]];
  }
  maps.push(permutation.slice(0,29));
}
const lastInverse=new Map(maps[5].map((value,idx)=>[value,idx]));
const synthetic=Array.from({length:6},()=>[]);
for(let i=0;i<201;i++){
  let row;
  do{
    row=Array.from({length:5},()=>rng()%29);
    const result=row.reduce((a,x,k)=>a^maps[k][x],0);
    if(lastInverse.has(result)){
      row.push(lastInverse.get(result));
      break;
    }
  }while(true);
  for(let k=0;k<6;k++)synthetic[k].push(row[k]);
}
const plantRows=parityRows(synthetic);
assert(plantRows.every((_,j)=>
  synthetic.reduce((acc,stream,k)=>acc^maps[k][stream[j]],0)===0));
const planted=rowRank(plantRows);
assert(planted.rank<=164,
  "five nonconstant identity bits plus five constant directions must survive");
assert(maps.every(m=>new Set(m).size===29));
console.log(JSON.stringify({
  source:"Original p2=201; pp23–26 red16 plus five 201-rune body strands",
  construction:"Six positionwise XOR shares, SIX independent stationary secret rune-to-GF2^m maps",
  algebra:"201x174 GF2 lane-by-rune incidence; at least five constant-lane kernel dimensions",
  original:results,
  positive:{
    all201ColumnXorEquationsHold:true,
    sixDistinctInjectiveLaneAlphabets:true,
    rank:planted.rank,
    nullity:174-planted.rank
  },
  conclusion:"No individually injective stationary binary rune alphabets, even secret and lane-specific, support a six-way parity of the original six 201-rune strands"
},null,2));
