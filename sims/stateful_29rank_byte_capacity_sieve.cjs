"use strict";
/**
 * Exact original-LP2 capacity impossibility for arbitrary 29-choice
 * previous-ciphertext-state byte encoders. Each of the 29 possible outgoing
 * runes has one fixed but unknown base-29 rank 0..28 for that predecessor.
 *
 * Five-n base-29 digits encode exactly three-n bytes for n=1..6.
 * Every phase, direction, book/page restart, and conservative repeated-rune
 * marker/drop setting is checked against all 12,956 original unknown runes.
 *
 * node sims/stateful_29rank_byte_capacity_sieve.cjs
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const {getPages,packets}=require("./stateful_28rank_allwidth.cjs");
const M=29,WIDTHS=[5,10,15,20,25,30];

/** @param {number} D @returns {number} */
function leadingCeiling(D){
  assert.equal(D%5,0);
  return Number((256n**BigInt(3*D/5)-1n)/(29n**BigInt(D-1)));
}

/**
 * For a fixed framing, any one preceding-rune state can output at most
 * ceiling+1 distinct next-runic identities as its codeword leader.
 * This is invariant under all 29! orderings of that state's 29 outputs.
 * @param {ReturnType<typeof packets>} blocks
 * @param {number} D
 * @returns {{leadingDistinct:number,maximumAllowed:number,excluded:boolean,cleanLeaders:number}}
 */
function screen(blocks,D){
  const observed=Array.from({length:M},()=>new Set());
  let cleanLeaders=0;
  for(const block of blocks){
    const first=block[0];
    if(first.marker)continue;
    observed[first.a].add(first.b);
    cleanLeaders++;
  }
  const leadingDistinct=Math.max(...observed.map(s=>s.size));
  const maximumAllowed=leadingCeiling(D)+1;
  return {leadingDistinct,maximumAllowed,
    excluded:leadingDistinct>maximumAllowed,cleanLeaders};
}

/** @param {number} initial @returns {()=>number} */
function random32(initial){
  let state=initial>>>0;
  return ()=>{
    state^=state<<13;
    state^=state>>>17;
    state^=state<<5;
    return state>>>0;
  };
}

/**
 * Fixed-seed authentic byte-to-base29 encoder using independent secret
 * shuffled 29-output rows, with literal rune repeats allowed.
 * Re-invert exact original bytes, and verify the capacity sieve accepts.
 * @param {number} D
 */
function positive(D){
  const next=random32((0x293305af+D)>>>0),bytes=3*D/5;
  const rows=Array.from({length:M},()=>Array.from({length:M},(_,i)=>i));
  for(const row of rows){
    for(let i=M-1;i>0;i--){
      const j=next()%(i+1);
      [row[i],row[j]]=[row[j],row[i]];
    }
  }
  const stream=[next()%M],whole=[];
  let trueRepeats=0;
  for(let block=0;block<600;block++){
    let value=0n;
    for(let b=0;b<bytes;b++)value=value*256n+BigInt(next()&255);
    const stored=value,digits=Array(D).fill(0);
    for(let j=D-1;j>=0;j--){
      digits[j]=Number(value%29n);
      value/=29n;
    }
    assert.equal(value,0n);
    let decoded=0n;
    for(const digit of digits){
      const before=stream.at(-1),glyph=rows[before][digit];
      stream.push(glyph);
      if(glyph===before)trueRepeats++;
      const recovered=rows[before].indexOf(glyph);
      assert.equal(recovered,digit);
      decoded=decoded*29n+BigInt(recovered);
    }
    assert.equal(decoded,stored);
    assert(stored<256n**BigInt(bytes));
    whole.push(stored);
  }
  const source=packets([stream],false,false,D,0,false);
  assert.equal(source.length,600);
  const checked=screen(source,D);
  assert(!checked.excluded,
    "Synthetic genuine byte encoder must not fail rank-invariant capacity");
  return {D,bytes,roundtrippedPackets:whole.length,
    genuineRepeatedGlyphs:trueRepeats,leadingDistinct:checked.leadingDistinct,
    limit:checked.maximumAllowed};
}

/** @returns {object} */
function study(){
  const pages=getPages();
  const results=[];
  for(const D of WIDTHS){
    let impossible=0,lowestObserved=Infinity,highestObserved=0;
    let smallestMargin=Infinity,checkedPackets=0;
    for(const reset of [false,true])for(const drop of [false,true])
      for(const reverse of [false,true])for(let phase=0;phase<D;phase++){
        const blocks=packets(pages,reset,drop,D,phase,reverse);
        const found=screen(blocks,D);
        if(found.excluded)impossible++;
        lowestObserved=Math.min(lowestObserved,found.leadingDistinct);
        highestObserved=Math.max(highestObserved,found.leadingDistinct);
        smallestMargin=Math.min(smallestMargin,
          found.leadingDistinct-found.maximumAllowed);
        checkedPackets+=found.cleanLeaders;
      }
    assert.equal(impossible,8*D,
      "A source framing unexpectedly survives the exact base29 obstruction");
    results.push({digits:D,bytes:3*D/5,leadingCeiling:leadingCeiling(D),
      maximumDistinctFirstOutputsAllowed:leadingCeiling(D)+1,
      lowestObservedMaxDistinct:lowestObserved,
      highestObservedMaxDistinct:highestObserved,
      minimumCapacityViolationGlyphs:smallestMargin,
      variants:8*D,impossible,
      cleanLeaderPacketChecks:checkedPackets});
  }
  const planted=WIDTHS.map(positive);
  assert.equal(results.reduce((sum,x)=>sum+x.variants,0),840);
  return {source:"resources/liber-primus/lp2-corpus.json",
    unsolvedPhysicalRunes:12956,unsolvedRunePages:55,
    family:"fixed-block 5n base29 digits -> 3n raw bytes, one arbitrary previous-state-specific 29-rune output permutation",
    assumption:"literal repeated ciphertext glyphs may occupy their normal rank, be skipped as markers, or be retained as unknown markers",
    exactExclusions:840,configurations:840,
    classification:"bounded source-original impossibility, no novel LP2 plaintext or authentic key",
    widths:results,byteEncodingPositiveControls:planted};
}
if(require.main===module)console.log(JSON.stringify(study(),null,2));
module.exports={leadingCeiling,screen,positive,study};
