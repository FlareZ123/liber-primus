'use strict';
/**
 * Exact, key-independent source theorem for strict 5 GP29 digits -> 3 bytes.
 * Every physical page may use its OWN ARBITRARY hidden GP29 substitution
 * alphabet, subject only to being a fixed 29-symbol bijection on that page.
 * No key search, language assumption, or historical matrix is involved.
 *
 * CommonJS SFT: node sims/radix29_packed3_page_permutation_invariant.cjs
 */
const assert=require('node:assert/strict');
const zlib=require('node:zlib');
const lib=require('./source_4d_radix29_bytes.cjs');
const packing=require('./source_4d_radix29_packed3.cjs');
const {C,N,pageRanges,plantByteStream,mod}=lib;
const frames=packing.framing(), BASE=29, MAX=2**24-1;
const HIGH_ALLOWED=Math.floor(MAX/(BASE**4));
assert.equal(HIGH_ALLOWED,23);
assert.equal(frames.length,20);

/** Counts distinct observed high-slot glyphs, invariant under a page-fixed bijection. */
function inspect(cipher,frame) {
  const observed=frame.positions.map(p=>p[0]);
  const perPage=pageRanges.map(range=>{
    const distinct=new Set();
    for(const t of observed) {
      if(t>=range.start && t<range.end)distinct.add(cipher[t]);
    }
    return {page:range.p,distinctHighGlyphs:distinct.size,
      excessOverHighDigitCapacity:Math.max(0,distinct.size-(HIGH_ALLOWED+1))};
  });
  return {clock:frame.clock,phase:frame.phase,order:frame.order,
    completePackets:observed.length,
    distinctGlobalHighGlyphs:new Set(observed.map(t=>cipher[t])).size,
    violatingPages:perPage.filter(p=>p.excessOverHighDigitCapacity>0),
    maxPageDistinct:Math.max(...perPage.map(x=>x.distinctHighGlyphs))};
}
function derive() {
  const result=frames.map(frame=>inspect(C,frame));
  assert.equal(result.length,20);
  assert.ok(result.every(x=>x.distinctGlobalHighGlyphs===29));
  assert.ok(result.every(x=>x.violatingPages.length>=14));
  const counts=result.map(x=>x.violatingPages.length);
  assert.equal(Math.min(...counts),14);
  assert.equal(Math.max(...counts),25);
  return result;
}
/**
 * A 29-symbol affine multiplier is bijective for every 1..28, giving
 * 55 independent page-secret alphabets in a separately encoded gzip plant.
 */
function positivePlant() {
  const {compressed}=plantByteStream();
  const frame=frames.find(x=>x.clock==='page'&&x.phase===0&&x.order==='forward');
  const plain=new Array(N).fill(0);
  for(let i=0;i<frame.positions.length;i++){
    const v0=compressed[(3*i)%compressed.length],
      v1=compressed[(3*i+1)%compressed.length],
      v2=compressed[(3*i+2)%compressed.length];
    let value=v0*65536+v1*256+v2;
    const digits=[];
    for(let j=0;j<5;j++){digits.unshift(value%BASE);value=Math.floor(value/BASE)}
    assert.equal(value,0);
    for(let j=0;j<5;j++)plain[frame.positions[i][j]]=digits[j];
  }
  const alphabet=pageRanges.map((range,k)=>({
    ...range,a:1+(k%28),b:(7*k)%29
  }));
  const cipher=new Array(N);
  const recovered=new Array(N);
  for(const {start,end,a,b} of alphabet){
    const inverse=Array.from({length:28},(_,i)=>i+1).find(x=>a*x%29===1);
    assert.ok(inverse);
    for(let t=start;t<end;t++){
      cipher[t]=(a*plain[t]+b)%29;
      recovered[t]=mod((cipher[t]-b)*inverse);
    }
  }
  assert.deepEqual(recovered,plain);
  const inspection=inspect(cipher,frame);
  assert.equal(inspection.violatingPages.length,0);
  assert.ok(inspection.maxPageDistinct<=24);
  const decodedBytes=[];
  for(const packet of frame.positions){
    let value=0;
    for(const t of packet)value=29*value+recovered[t];
    assert.ok(value<=MAX);
    decodedBytes.push((value>>16)&255,(value>>8)&255,value&255);
  }
  assert.deepEqual(Buffer.from(decodedBytes.slice(0,compressed.length)),compressed);
  const expanded=zlib.gunzipSync(compressed);
  assert.ok(expanded.length>1000);
  return {encryptedByIndependentPageAffinePermutations:pageRanges.length,
    uniqueAlphabets:alphabet.length,
    sourceCompressedByteLength:compressed.length,
    decodedBytes:decodedBytes.length,
    decompressedSourceByteLength:expanded.length,
    exactRuneRoundtrip:N,
    pageHighGlyphCapacityViolations:inspection.violatingPages.length};
}
/**
 * Even stronger source-only theorem: 29 independent secret bijections,
 * each indexed by the previous PUBLISHED ciphertext rune.
 * Pageheads have no predecessor and are excluded from this argument.
 */
function bookFixedPreviousCipherRows(cipher,frame) {
  const heads=new Set(pageRanges.map(x=>x.start));
  const successorSets=Array.from({length:29},()=>new Set());
  for(const packet of frame.positions){
    const t=packet[0];
    if(t===0||heads.has(t))continue;
    successorSets[cipher[t-1]].add(cipher[t]);
  }
  const counts=successorSets.map((glyphs,prev)=>({
    predecessor:prev,distinctSuccessors:glyphs.size,
    excessOver24:Math.max(0,glyphs.size-(HIGH_ALLOWED+1))
  }));
  return {clock:frame.clock,phase:frame.phase,order:frame.order,
    maxDistinctNextRune:Math.max(...counts.map(x=>x.distinctSuccessors)),
    violatingPreviousRuneStates:counts.filter(x=>x.excessOver24>0),
    allPreviousRuneStates:counts};
}
/**
 * A genuine secret preceding-ciphertext indexed alphabet control:
 * C[t]=(7*P[t]+C[t-1]) mod29, pageheads C=7*P, which is an
 * independently chosen bijective GP29 row for each predecessor.
 */
function sourceRowPlant() {
  const {compressed}=plantByteStream();
  const frame=frames.find(x=>x.clock==='page'&&x.phase===0&&x.order==='forward');
  const plain=new Array(N).fill(0);
  for(let i=0;i<frame.positions.length;i++) {
    let value=compressed[(3*i)%compressed.length]*65536+
      compressed[(3*i+1)%compressed.length]*256+
      compressed[(3*i+2)%compressed.length];
    const digits=Array(5);
    for(let j=4;j>=0;j--){digits[j]=value%29;value=Math.floor(value/29)}
    assert.equal(value,0);
    frame.positions[i].forEach((t,j)=>{plain[t]=digits[j]});
  }
  const cipher=new Array(N), recovered=new Array(N);
  for(const {start,end} of pageRanges){
    for(let t=start;t<end;t++){
      const prev=t===start?0:cipher[t-1];
      cipher[t]=(7*plain[t]+prev)%29;
      recovered[t]=mod((cipher[t]-prev)*25);
    }
  }
  assert.deepEqual(recovered,plain);
  const originalLike=bookFixedPreviousCipherRows(cipher,frame);
  assert.equal(originalLike.violatingPreviousRuneStates.length,0);
  const bytes=[];
  for(const packet of frame.positions){
    let value=0;
    for(const t of packet)value=value*29+recovered[t];
    assert.ok(value<=MAX);
    bytes.push(value>>16 &255,value>>8 &255,value&255);
  }
  assert.deepEqual(Buffer.from(bytes.slice(0,compressed.length)),compressed);
  assert.ok(zlib.gunzipSync(compressed).length>1000);
  return {secretPredecessorRows:29,
    exactRoundtripGpRunes:N,decodedBytes:bytes.length,
    gzipSourceBytes:compressed.length,
    artificialSourceViolatingRows:0};
}

/**
 * Strongest fixed-predecessor result for a 2GP29-rune/one-byte transport:
 * high digit <= 8, so only 9 possible next-symbol outputs per secret row.
 * Allows every predecessor rune an arbitrary unknown 29-symbol permutation.
 */
function twoRuneBytePriorRows() {
  const heads=new Set(pageRanges.map(x=>x.start));
  const result=[];
  for(const clock of ['global','page'])
  for(let phase=0;phase<2;phase++)
  for(const order of ['high-first','low-first']) {
    const prefixes=[];
    const ranges=clock==='global'?[{start:0,end:N}]:pageRanges;
    for(const {start,end} of ranges)
      for(let t=start+phase;t+1<end;t+=2)
        prefixes.push(t+(order==='low-first'?1:0));
    const observed=Array.from({length:29},()=>new Set());
    for(const t of prefixes) {
      if(t===0||heads.has(t))continue;
      observed[C[t-1]].add(C[t]);
    }
    const sizes=observed.map(x=>x.size);
    result.push({clock,phase,order,packets:prefixes.length,
      minPreviousStateDistinct:Math.min(...sizes),
      maxPreviousStateDistinct:Math.max(...sizes),
      forbiddenPreviousStates:sizes.filter(x=>x>9).length});
  }
  assert.equal(result.length,8);
  assert.ok(result.every(x=>x.forbiddenPreviousStates===29));
  assert.ok(result.every(x=>x.minPreviousStateDistinct>=27));
  return result;
}

if(require.main===module) {
  const source=derive(),plant=positivePlant();
  const rowBounds=frames.map(frame=>bookFixedPreviousCipherRows(C,frame));
  assert.ok(rowBounds.every(x=>x.violatingPreviousRuneStates.length>=27));
  const rowPlant=sourceRowPlant();
  const byteOneRows=twoRuneBytePriorRows();
  const summary=source.map(x=>({
    clock:x.clock,phase:x.phase,order:x.order,
    packets:x.completePackets,
    pageAlphabetsForcedToExceed24:x.violatingPages.length,
    maxOnePageDistinct:x.maxPageDistinct,
    globalAlphabetDistinct:x.distinctGlobalHighGlyphs,
    sampleImpossiblePages:x.violatingPages.slice(0,4)
  }));
  console.log(JSON.stringify({
    status:'exact original-cipher impossibility under any fixed per-page GP29 bijections',
    theorem:'Every high digit of a five-rune base29 packet holding 3 bytes lies in 0..23; a page-fixed bijection cannot map 25+ different high-slot ciphertext glyphs into only 24 allowed high digits.',
    originalRunes:N,sourceFramings:frames.length,
    originalRejectedFramings:summary.length,
    pageViolationRange:[Math.min(...summary.map(x=>x.pageAlphabetsForcedToExceed24)),
      Math.max(...summary.map(x=>x.pageAlphabetsForcedToExceed24))],
    original:summary,
    nativeGzipPositive:plant,
    predecessorRowsKeyFree:{all20FramesExcluded:rowBounds.length,
      minimumImpossiblePredecessorRows:Math.min(...rowBounds.map(x=>x.violatingPreviousRuneStates.length)),
      maximumImpossiblePredecessorRows:Math.max(...rowBounds.map(x=>x.violatingPreviousRuneStates.length)),
      models:rowBounds.map(x=>({clock:x.clock,phase:x.phase,order:x.order,
        rowsExceeding24:x.violatingPreviousRuneStates.length,
        maximumDistinctNextCipherGlyphs:x.maxDistinctNextRune}))},
    predecessorRowSyntheticControl:rowPlant,
    twoRuneOneByteOriginalBookFixedPredecessorRows:{allEightFramesImpossible:byteOneRows.length,
      all29PreviousRuneStatesImpossibleInEveryFrame:true,
      original:byteOneRows},
    scope:'strict 5-rune per 3-byte packet frames, global or page reset, five phases, two digit orders. Allows each page its own unknown fixed alphabet. Excludes neither dynamically evolving alphabets nor other binary coding ratios, hidden marker deletion or entropy coding.'
  },null,2));
}
module.exports={derive,inspect,positivePlant,bookFixedPreviousCipherRows,sourceRowPlant,twoRuneBytePriorRows};
