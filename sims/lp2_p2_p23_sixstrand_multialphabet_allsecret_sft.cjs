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
// The interleaved nullity-six case is explained exactly by one
// UNOBSERVED source coordinate: rune index8 never appears in lane2.
// Removing it leaves 173 observed coordinates and nullity only five,
// identical to the constant-lane kernel. There is no hidden bit signal.
const coverage={};
for(const [name,parts] of Object.entries(layouts)){
  coverage[name]=[p2,...parts].map(stream=>
    Array.from({length:29},(_,r)=>r).filter(r=>!stream.includes(r)));
}
assert.deepEqual(coverage.contiguous,[[],[],[],[],[],[]]);
assert.deepEqual(coverage.interleaved,[[],[],[8],[],[],[]]);
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
/**
 * Exact 201×174 rank over F29. Any GF(29^m) equation breaks into m F29
 * coordinate constraints, so the same codebook impossibility extends
 * to every field with characteristic 29.
 * @param {number[][]} streams
 * @returns {number}
 */
function rank29(streams){
  const inv=Array(29).fill(0);
  for(let a=1;a<29;a++)for(let b=1;b<29;b++)
    if(a*b%29===1)inv[a]=b;
  const pivots=Array(WIDTH).fill(null);
  let rank=0;
  for(let j=0;j<201;j++){
    const row=new Int16Array(WIDTH);
    for(let k=0;k<6;k++)row[k*29+streams[k][j]]=1;
    for(let col=0;col<WIDTH;col++){
      if(!row[col])continue;
      if(pivots[col]){
        const factor=row[col],pivot=pivots[col];
        for(let q=col;q<WIDTH;q++)
          row[q]=(row[q]-factor*pivot[q]+29*29)%29;
      }else{
        const factor=inv[row[col]];
        for(let q=col;q<WIDTH;q++)row[q]=row[q]*factor%29;
        pivots[col]=row;
        rank++;
        break;
      }
    }
  }
  return rank;
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
  const histogram={},hist29={},prefixes=[];
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
    const rankPrime29=rank29(strands);
    hist29[rankPrime29]=(hist29[rankPrime29]||0)+1;
    assert.equal(rankPrime29,rank,"original GP29 field and binary ranks must agree");
    prefixes.push(witnessPrefix);
    assert(rank>=168 && rank<=169,
      "the original secret-lane kernel is unexpectedly larger");
  }
  results[label]={
    orientations:64,rankHistogramGF2:histogram,
    rankHistogramGF29:hist29,
    nullityHistogram:Object.fromEntries(Object.entries(histogram)
      .map(([rank,count])=>[174-Number(rank),count])),
    earliestDecisivePrefix:Math.min(...prefixes),
    latestDecisivePrefix:Math.max(...prefixes),
    maxDifferentRuneValuesInAnyLane:Math.max(...Object.keys(histogram)
      .map(rank=>2**(174-Number(rank)-5))),
    injective29GlyphCodebooksPossible:false
  };
}
assert.equal(results.contiguous.rankHistogramGF2[169],64);
assert.equal(results.interleaved.rankHistogramGF2[168],64);
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
// Independently plant a six-lane F29 additive checksum using six distinct,
// uniformly shuffled complete GP29 field codebooks (arbitrary bijections).
const maps29=[];
for(let lane=0;lane<6;lane++){
  const symbols=Array.from({length:29},(_,k)=>k);
  for(let i=28;i>0;i--){
    const j=rng()%(i+1);
    [symbols[i],symbols[j]]=[symbols[j],symbols[i]];
  }
  maps29.push(symbols);
}
const inverseLast=new Array(29);
maps29[5].forEach((y,x)=>inverseLast[y]=x);
const plant29=Array.from({length:6},()=>[]);
for(let j=0;j<201;j++){
  const first5=Array.from({length:5},()=>rng()%29);
  const target=(29-first5.reduce((sum,x,k)=>sum+maps29[k][x],0)%29)%29;
  const all=[...first5,inverseLast[target]];
  for(let k=0;k<6;k++)plant29[k].push(all[k]);
}
assert(plant29.every(x=>x.length===201));
for(let j=0;j<201;j++){
  assert.equal(plant29.reduce((v,s,k)=>v+maps29[k][s[j]],0)%29,0);
}
const planted29Rank=rank29(plant29);
assert(planted29Rank<=168,"true six-map F29 parity must give one nonconstant kernel direction");
assert(maps29.every(m=>new Set(m).size===29));
console.log(JSON.stringify({
  source:"Original p2=201; pp23–26 red16 plus five 201-rune body strands",
  construction:"Six positionwise XOR shares, SIX independent stationary secret rune-to-GF2^m maps",
  algebra:"201x174 GF2 lane-by-rune incidence; at least five constant-lane kernel dimensions",
  original:results,
  unusedGlyphColumns:coverage,
  exactInterleavedKernelInterpretation:"only five constant lane codes plus one unobserved glyph (lane2 rune8)",
  positiveGF29:{sixIndependentlyPermutedInjectiveMaps:true,
    all201Mod29EquationsHold:true,rank:planted29Rank,nullity:174-planted29Rank},
  positiveGF2:{
    all201ColumnXorEquationsHold:true,
    sixDistinctInjectiveLaneAlphabets:true,
    rank:planted.rank,
    nullity:174-planted.rank
  },
  conclusion:"No individually injective stationary rune codebooks over fields of characteristic 2 OR 29 can support a fixed six-way linear parity of these six original streams"
},null,2));
