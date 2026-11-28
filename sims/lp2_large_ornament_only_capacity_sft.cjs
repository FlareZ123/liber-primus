'use strict';
/**
 * Source-location-and-glyph-type upper bound on a *large ornament only*
 * constrained-code exception sidecar for all 56 unknown LP2 pages.
 *
 * Same original-source GP29 exhaustive-coding model as the preexisting
 * enumerative-repeats audit; NEW question is whether all 31 independently
 * image-confirmed large ornaments alone could carry the missing side bits
 * by arbitrary placement at printed word ends and glyph-type/color variation.
 *
 * A full-alphabet universal-capacity theorem, NOT unknown plaintext.
 *
 * Run: node sims/lp2_large_ornament_only_capacity_sft.cjs
 */
const fs=require('node:fs'),path=require('node:path');
const assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const book=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const source=read('resources/liber-primus/lp2-transcription.txt');
const pages=book.pages.filter(p=>p.page<=55 && p.indices.length);
assert.equal(pages.length,55);
const text=pages.flatMap(p=>p.indices),N=text.length;
assert.equal(N,12956);
const repeats=text.slice(1).reduce((sum,x,i)=>sum+(x===text[i]),0);
assert.equal(repeats,86);
const chunks=source.split('%');
assert.equal(chunks.length,57);
const words=chunks.slice(0,55).join('%')
  .replace(/[\/\n\r%&$\s]/g,'').split(/[-.]/)
  .filter(s=>/[\u16a0-\u16ff]/u.test(s));
const W=words.length;
assert.equal(W,2896);
const ornaments=ink.pages.filter(p=>p.page<=55)
  .flatMap(p=>(p.large_punctuation||[]).map(([offset,dots,color])=>
    ({page:p.page,offset,dots,color})))
  .filter(x=>[10,13].includes(x.dots));
const observed=ornaments.reduce((s,x)=>s+x.dots,0),M=ornaments.length;
assert.equal(M,31);assert.equal(observed,394);
assert.deepEqual(ornaments.reduce((a,x)=>{
  const k=x.dots+'-'+x.color;a[k]=(a[k]||0)+1;return a;
},{}),{'13-red':27,'13-black':1,'10-red':3});
function choose(n,k) {
  assert(Number.isInteger(n)&&Number.isInteger(k)&&n>=k&&k>=0);
  let z=1n;
  for(let i=1;i<=k;i++)z=z*BigInt(n-i+1)/BigInt(i);
  return z;
}
function log2Big(z) {
  assert(z>0n);
  const bits=z.toString(2);
  const take=Math.min(53,bits.length);
  return bits.length-take+Math.log2(parseInt(bits.slice(0,take),2));
}
const GP29=29n**BigInt(N);
const noRepeatSize=29n*choose(N-1,repeats)*(28n**BigInt(N-1-repeats));
const universalSideStates=(GP29+noRepeatSize-1n)/noRepeatSize;
const minimumBits=(universalSideStates-1n).toString(2).length;
assert.equal(minimumBits,328);

// Upper bound: ALL 2,896 original word ends may be relocation targets, with
// unlimited collisions among at most 31 glyphs (ordered types remain distinct).
// Assume SIX possible physical appearance types at every marker (all of
// 10/13/23 dots in either black or red), much more freedom than observed.
const categories=6n,positions=choose(W+M-1,M);
const exactlyM=positions*(categories**BigInt(M));
const upToM=Array.from({length:M+1},(_,k)=>
  choose(W+k-1,k)*(categories**BigInt(k))).reduce((a,b)=>a+b,0n);
assert(exactlyM<universalSideStates);
assert(upToM<universalSideStates);
assert(noRepeatSize*upToM < GP29);

// Actual observed ink/type inventory fixed but allowed to relocate;
// ordering of 27 red13, 3 red10 and one black13 freely permuted.
const fixedInventoryVariants=BigInt(M)*choose(M-1,3);
const withExactInventory=positions*fixedInventoryVariants;
assert(withExactInventory<exactlyM);
console.log(JSON.stringify({
  schema:'LP2 large-ornament-only constrained sidecar capacity v1',
  source:{unknownPhysicalPages:56,runeBearingPages:pages.length,
    GP29Runes:N,adjacentEquals:repeats,printedWords:W,
    originalOrnaments:M,physicalDots:observed,
    occurrenceClasses:{red13:27,black13:1,red10:3}},
  required:{model:'Unrestricted GP29 length N; one full-book fixed-repeat constrained code',
    minimumBits,log2RequiredSideStates:log2Big(universalSideStates)},
  maximalCarrier:{
    address:'all 2,896 original printed word ends, with replacement',
    classes:'six freely assignable color×10/13/23-dot groups for EACH mark',
    counts:'zero to 31 marks, variable',
    log2Exactly31Positions:log2Big(positions),
    log2Exactly31MarkerStates:log2Big(exactlyM),
    log2UpTo31MarkerStates:log2Big(upToM),
    log2FixedInventoryMarkerStates:log2Big(withExactInventory),
    necessarilyInsufficient:true},
  caveat:'Only large glyph placement and six visibly distinct type/color classes, preserving the original complete-word boundary register. Does not exclude extra unprinted pixels/DCT signals, 180 small punctuation marks, movable word breaks, or restricted plaintext alphabets.',
},null,2));
