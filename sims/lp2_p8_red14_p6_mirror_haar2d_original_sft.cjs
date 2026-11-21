'use strict';

/**
 * Issue #2072: source-first p8 red square196 -> p6 exact 14x14 receiver,
 * p6 bilateral scrolls + p8 tree suggesting an outside-in Haar-like mix.
 * This tests one complete reversible GP29 operator, not an authored cipher.
 * Windows: node sims/lp2_p8_red14_p6_mirror_haar2d_original_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} rel @returns {string} */
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages=read('resources/liber-primus/lp2-transcription.txt').split('%');
const ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const p6=gp.pages.find(p=>p.page===6).indices;
const p8=gp.pages.find(p=>p.page===8).indices;
const red=p8.slice(0,4);
assert.equal(p6.length,196);
assert.deepEqual(red,[14,10,14,19]);
assert.equal(red.reduce((s,k)=>s+gp.prime[k],0),196);
assert.equal(red[0],14);
assert.equal(red[2],14);
assert(ink.pages.find(p=>p.page===8).red_spans.some(
  s=>s.start===0&&s.length>=4));
const mod=x=>(x%29+29)%29;
/** @param {number[]} src @returns {number[]} */
function inverseFold(src) {
  assert.equal(src.length,14);
  const out=src.slice();
  for(let j=0;j<7;j++) {
    const d=src[j],s=src[13-j];
    out[j]=mod(15*(d+s)); // 15 = inverse of 2 modulo29
    out[13-j]=mod(15*(s-d));
  }
  return out;
}
/** @param {number[]} src @returns {number[]} */
function forwardFold(src) {
  assert.equal(src.length,14);
  const out=src.slice();
  for(let j=0;j<7;j++) {
    const a=src[j],b=src[13-j];
    out[j]=mod(a-b);
    out[13-j]=mod(a+b);
  }
  return out;
}
/** @param {number[]} src @param {(row:number[])=>number[]} transform */
function squareOp(src,transform) {
  assert.equal(src.length,196);
  const columns=Array.from({length:14},(_,i)=>
    src.slice(14*i,14*i+14)).map(transform);
  const transposed=Array.from({length:14},(_,j)=>columns.map(row=>row[j]))
    .map(transform);
  return Array.from({length:14},(_,i)=>
    Array.from({length:14},(_,j)=>transposed[j][i])).flat();
}
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const hist=Array(29).fill(0);
  values.forEach(k=>hist[k]++);
  return hist.reduce((acc,n)=>acc+n*(n-1),0)/
    (values.length*(values.length-1));
}
const proposed=squareOp(p6,inverseFold);
assert.deepEqual(squareOp(proposed,forwardFold),p6);
const p57=gp.pages.find(p=>p.page===57).indices;
assert.equal(p57.length,95);
const planted=Array.from({length:196},(_,i)=>p57[i%p57.length]);
assert.deepEqual(squareOp(squareOp(planted,forwardFold),inverseFold),planted);
const runeMap=new Map(gp.runes.map((ch,i)=>[ch,i]));
const p6scan=Array.from(pages[6]).filter(ch=>runeMap.has(ch))
  .map(ch=>runeMap.get(ch));
assert.deepEqual(p6scan,p6);
/** @param {number[]} values */
function printedWordBounds(values) {
  let pos=0,start=0,open=false;
  const out=[];
  for(const char of pages[6]) {
    if(runeMap.has(char)) {pos++;open=true;}
    else if('-.$&§'.includes(char)&&open) {
      out.push(values.slice(start,pos));start=pos;open=false;
    }
  }
  if(open)out.push(values.slice(start,pos));
  assert.equal(pos,196);
  return out;
}
const originalWords=printedWordBounds(p6);
const plainWords=printedWordBounds(proposed);
assert.equal(originalWords.length,plainWords.length);
const spell=arr=>arr.map(k=>gp.translit[k]).join(' ');
// Length and sentence punctuation are preserved; every 196 ciphertext rune
// is consumed, and the proposed inverse is static and exactly reversible.

/**
 * More constrained reading of literal p8 red IXIX word [14,10,14,19]:
 * (axis width14, pair mixing weight10), (axis width14, mixing weight19).
 * These values are fixed from source, not optimized for GP language.
 * @param {number[]} row @param {number} k
 */
function weightedInverse(row,k) {
  assert.equal(row.length,14);
  const out=row.slice();
  let inverse=1;
  while(k*inverse%29!==1)inverse++;
  for(let j=0;j<7;j++) {
    const d=row[j],s=row[13-j];
    out[j]=mod(15*(d+s));
    out[13-j]=mod(15*inverse*(s-d));
  }
  return out;
}
/** @param {number[]} row @param {number} k */
function weightedForward(row,k) {
  assert.equal(row.length,14);
  const out=row.slice();
  for(let j=0;j<7;j++) {
    const a=row[j],b=row[13-j];
    out[j]=mod(a-k*b);
    out[13-j]=mod(a+k*b);
  }
  return out;
}
/**
 * @param {number[]} source
 * @param {(row:number[])=>number[]} rowFn
 * @param {(row:number[])=>number[]} colFn
 */
function weighted2D(source,rowFn,colFn) {
  assert.equal(source.length,196);
  const rows=Array.from({length:14},(_,i)=>source.slice(14*i,14*i+14))
    .map(rowFn);
  const trans=Array.from({length:14},(_,j)=>rows.map(row=>row[j]))
    .map(colFn);
  return Array.from({length:14},(_,i)=>
    Array.from({length:14},(_,j)=>trans[j][i])).flat();
}
const weighted=weighted2D(p6,r=>weightedInverse(r,10),r=>weightedInverse(r,19));
assert.deepEqual(weighted2D(weighted,r=>weightedForward(r,10),
  r=>weightedForward(r,19)),p6);
const weightedPlant=weighted2D(planted,r=>weightedForward(r,10),
  r=>weightedForward(r,19));
assert.deepEqual(weighted2D(weightedPlant,r=>weightedInverse(r,10),
  r=>weightedInverse(r,19)),planted);
assert(Math.abs(ioc(weighted)-0.034170591313448455)<1e-12);

const report={
  source:'p8 original red heading GP prime sum196 = 14^2 = p6 original196',
  p6BilateralMirroredSpirals:true,
  claimedSourceOpcode:'none; conjectural 2D outside-in mirror sum/difference',
  exactGrid:[14,14],
  originalIoC:ioc(p6),
  inverseIoC:ioc(proposed),
  sourceRed4AxisWeights:[14,10,14,19],
  sourceWeightedInverseIoC:ioc(weighted),
  sourceWeightedOpening:spell(weighted.slice(0,150)),
  sourceWeightedReencrypted:196,
  solvedP57ControlIoC:ioc(p57),
  nativeSolvedPlantRecovered:planted.length,
  reencryptRecovered:p6.length,
  originalWords:originalWords.length,
  originalOpening:spell(p6.slice(0,80)),
  inverseOpening:spell(proposed.slice(0,150)),
  decision:'Original 196-rune inverse does not yield source-native GP prose; p8 fixes a square shape but no cipher operation.'
};
assert(Math.abs(report.originalIoC-0.03233908948194662)<1e-12);
assert(Math.abs(report.inverseIoC-0.034850863422291996)<1e-12);
console.log(JSON.stringify(report,null,2));
