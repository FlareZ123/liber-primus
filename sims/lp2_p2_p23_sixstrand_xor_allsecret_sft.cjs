"use strict";
/**
 * Original LP2 p2 and p23–26 six-strand all-secret characteristic-two parity gate.
 *
 * Test every per-strand reversal, both simple 201×5 body partitions, and
 * every stationary injective rune→GF(2^m) map, for any m>0, without searching
 * 29! labels or selecting a GP29 field.
 *
 * Run: node sims/lp2_p2_p23_sixstrand_xor_allsecret_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const corpus=JSON.parse(fs.readFileSync(
  path.resolve(__dirname,"../resources/liber-primus/lp2-corpus.json"),"utf8"
));
const p2=corpus.pages[2].indices;
const chapters=corpus.pages.slice(23,27);
const section=chapters.flatMap(p=>p.indices);
const heading=section.slice(0,16),body=section.slice(16);
assert.deepEqual(chapters.map(p=>p.indices.length),[213,270,273,265]);
assert.equal(p2.length,201);
assert.equal(heading.length,16);
assert.equal(body.length,1005);

const layouts={
  contiguous:Array.from({length:5},(_,k)=>body.slice(201*k,201*(k+1))),
  interleaved:Array.from({length:5},(_,k)=>
    Array.from({length:201},(_,j)=>body[5*j+k]))
};

/**
 * Each row is a GF2 parity equation on 29 unknown glyph encodings.
 * @param {number[][]} strands six strands of identical length
 * @returns {bigint[]} equation bitmasks
 */
function equations(strands){
  const n=strands[0].length;
  assert.equal(strands.length,6);
  assert(strands.every(a=>a.length===n&&a.every(v=>
    Number.isInteger(v)&&v>=0&&v<29)));
  return Array.from({length:n},(_,j)=>
    strands.reduce((bits,s)=>bits^(1n<<BigInt(s[j])),0n));
}

/**
 * GF(2) elimination of a 29-column system, recording the shortest original
 * source prefix that attains the system's ultimate rank.
 * @param {bigint[]} rows
 * @returns {{rank:number,witnessPrefix:number,pivots:bigint[]}}
 */
function eliminate(rows){
  const pivots=Array(29).fill(0n);
  let rank=0,witnessPrefix=0;
  for(let row=0;row<rows.length;row++){
    let v=rows[row];
    for(let col=28;col>=0;col--){
      if(!(v&(1n<<BigInt(col))))continue;
      if(pivots[col])v^=pivots[col];
      else{
        pivots[col]=v;
        rank++;
        witnessPrefix=row+1;
        break;
      }
    }
  }
  return {rank,witnessPrefix,pivots};
}

/** @param {number[][]} strands */
function sortedRank(strands){
  const result=eliminate(equations(strands));
  assert(result.rank<=28,"six equal XOR terms imply a constant mapping kernel");
  return result;
}

const original={};
for(const [name,groups] of Object.entries(layouts)){
  const ranks=[],witnessPrefixes=[];
  let firstWitness=null;
  for(let mask=0;mask<64;mask++){
    const streams=[p2,...groups].map((a,k)=>
      mask&(1<<k)?[...a].reverse():a);
    const {rank,witnessPrefix}=sortedRank(streams);
    ranks.push(rank);
    witnessPrefixes.push(witnessPrefix);
    if(mask===0)firstWitness={orientationMask:mask,
      witnessPrefix,rank};
  }
  assert(ranks.every(r=>r===28));
  original[name]={
    sixSymbolCount:201,
    orientations:64,
    rankHistogram:{"28":ranks.length},
    nullity:1,
    minimalWitnessPrefix:Math.min(...witnessPrefixes),
    maximalWitnessPrefix:Math.max(...witnessPrefixes),
    printedForward:firstWitness,
    anyInjectiveStationaryBinaryRuneEncoding:false
  };
}

// The universal all-ones label vector is always in the kernel:
// the XOR of six copies of a constant cancels.
const ones=(1n<<29n)-1n;
for(const [name,groups] of Object.entries(layouts)){
  for(const mask of [0,1,63]){
    const stream=[p2,...groups].map((a,k)=>mask&(1<<k)?[...a].reverse():a);
    const rows=equations(stream);
    assert(rows.every(r=>{
      let v=r&ones,onesCount=0;
      while(v){v&=v-1n;onesCount++;}
      return onesCount%2===0;
    }),"all-constant mapping must be a kernel vector");
  }
}

// A genuinely binary-linear six-strand parity fixture with a fully
// injective natural 5-bit glyph map (identity 0..28).
let seed=0x33012014;
function next(){
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  return seed;
}
const synthetic=Array.from({length:6},()=>[]);
for(let j=0;j<201;j++){
  let five,sixth;
  do{
    five=Array.from({length:5},()=>next()%29);
    sixth=five.reduce((v,n)=>v^n,0);
  }while(sixth>=29);
  for(let k=0;k<5;k++)synthetic[k+1].push(five[k]);
  synthetic[0].push(sixth);
}
assert(synthetic.every(a=>a.length===201));
assert(synthetic.flat().every(v=>v>=0&&v<=28));
const planted=sortedRank(synthetic);
assert(planted.rank<=24,"five independent identity bits must be in kernel");
assert(equations(synthetic).every(mask=>{
  let value=0;
  for(let k=0;k<29;k++)if(mask&(1n<<BigInt(k)))value^=k;
  return value===0;
}),"original synthetic parity relation must vanish");

console.log(JSON.stringify({
  source:"original LP2 physical p2 201 GP29 runes, original pp23–26 16 rubric plus five 201-rune strands",
  candidate:"positionwise XOR of six rune-encoded symbols equals zero",
  mapFamily:"every stationary rune→GF(2^m) assignment, any m>=1, with injectivity required",
  untested:"position-dependent maps, nonzero offsets, non-XOR weighted SSSS, new strands/rotations",
  result:original,
  plant:{rank:planted.rank,nullity:29-planted.rank,
    genuineInjectiveGF32Map:true,equations:synthetic[0].length},
  decision:"No injective stationary binary rune alphabet can make p2 the six-way XOR parity of either five-strand layout"
},null,2));
