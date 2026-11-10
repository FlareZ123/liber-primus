"use strict";

/**
 * Exact all-gap two-square local stencil obstruction.
 *
 * All 8 dihedral orientations of 80x80, all 15 nonempty subsets of
 * the 2x2 source-square neighborhood, and all 6,396 placements of
 * five contiguous unknown cells are covered. Even granting TWO
 * arbitrary independent nonlinear secret 29-ary lookup tables on
 * the two sides of the unknown-cell interval, the minimum number
 * of source-output changes is derived exactly from histogram modes.
 *
 * The source-to-source geometry is hypothetical; the proof is
 * conditional. No unknown plaintext or authentic key is asserted.
 * CommonJS Node22, no network, no writes.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const RADIX=29, OUT=80, IN=81, VISIBLE=6395, HIDDEN=5, ALLOWED_EDITS=86;

function source(){
  const corpus=JSON.parse(fs.readFileSync(path.resolve(
    __dirname,"../resources/liber-primus/lp2-corpus.json"),"utf8"));
  const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length);
  assert.equal(pages.length,55);
  const numbers=pages.flatMap(p=>p.indices);
  assert.equal(numbers.length,12956);
  const first=Uint8Array.from(numbers.slice(0,IN*IN));
  const second=Uint8Array.from(numbers.slice(IN*IN));
  assert.equal(second.length,VISIBLE);
  let repeats=0;
  for(const page of pages)for(let i=1;i<page.indices.length;i++)
    repeats+=Number(page.indices[i]===page.indices[i-1]);
  assert.equal(repeats,ALLOWED_EDITS);
  return {first,second};
}

/** @param {number} index Complete 80-square index. @param {number} op Dihedral op 0..7. */
function orient(index,op){
  let r=Math.floor(index/OUT),c=index%OUT;
  if(op&1)r=OUT-1-r;
  if(op&2)c=OUT-1-c;
  if(op&4)[r,c]=[c,r];
  return [r,c];
}

/**
 * Original 81-square input tuples, with no fitted or known alphabet.
 * @param {Uint8Array} first @param {number} mask Bits TL TR BL BR.
 * @param {number} orientation One of 8 isometries.
 */
function tupleKeys(first,mask,orientation){
  const keys=new Uint32Array(OUT*OUT);
  for(let i=0;i<keys.length;i++){
    const [r,c]=orient(i,orientation),a=r*IN+c;
    const corners=[first[a],first[a+1],first[a+IN],first[a+IN+1]];
    let v=0;
    for(let j=0;j<4;j++)if(mask&(1<<j))v=v*RADIX+corners[j];
    keys[i]=v;
  }
  return keys;
}

/**
 * For each unknown secret tuple->output lookup, minimal edits are
 * sum over tuples of (observations minus largest output count).
 * @param {Map<number,Uint16Array>} counts
 * @param {number} key @param {number} glyph
 * @param {number} sign Exactly +1 or -1.
 */
function adjust(counts,key,glyph,sign){
  let hist=counts.get(key);
  if(!hist){assert.equal(sign,1);hist=new Uint16Array(RADIX);counts.set(key,hist);}
  let before=0,after=0;
  for(let j=0;j<RADIX;j++)if(hist[j]>before)before=hist[j];
  assert.ok(sign===1||hist[glyph]>0);
  hist[glyph]+=sign;
  for(let j=0;j<RADIX;j++)if(hist[j]>after)after=hist[j];
  return sign+before-after;
}

/**
 * Exact minimum over all 6396 five-contiguous-cell hole locations.
 * Two separate unknown lookup tables are fitted on either side of
 * the hole, a more powerful family than the proposed single map.
 * @param {Uint32Array} keys @param {Uint8Array} second
 */
function minTwoTableEdits(keys,second){
  assert.equal(keys.length,OUT*OUT);
  assert.equal(second.length,VISIBLE);
  const left=new Map(),right=new Map();
  let scoreL=0,scoreR=0;
  for(let i=0;i<VISIBLE;i++)
    scoreR+=adjust(right,keys[i+HIDDEN],second[i],1);
  let min=scoreR,gap=0;
  for(let i=0;i<VISIBLE;i++){
    scoreR+=adjust(right,keys[i+HIDDEN],second[i],-1);
    scoreL+=adjust(left,keys[i],second[i],1);
    if(scoreL+scoreR<min){min=scoreL+scoreR;gap=i+1;}
  }
  assert.equal(scoreR,0);
  return {minEdits:min,gap};
}

/** @param {Uint8Array} first @param {Uint8Array} second */
function evaluate(first,second){
  const scored=[];
  for(let orientation=0;orientation<8;orientation++)
    for(let mask=1;mask<16;mask++){
      const arity=[0,1,2,3].reduce((s,j)=>s+((mask>>>j)&1),0);
      scored.push({orientation,mask,arity,
        ...minTwoTableEdits(tupleKeys(first,mask,orientation),second)});
    }
  return [1,2,3,4].map(arity=>{
    const subset=scored.filter(x=>x.arity===arity)
      .sort((a,b)=>a.minEdits-b.minEdits);
    return {arity,models:subset.length,best:subset[0],
      minimum:subset[0].minEdits,maximum:subset.at(-1).minEdits};
  });
}

/** @param {number} seed Fixed positive-control RNG seed. */
function xorshift(seed){
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}

/** Create known genuinely stationary three-corner cipher with 86 edits. */
function positiveControl(first){
  const mask=13,orientation=5,gap=3472,keys=tupleKeys(first,mask,orientation);
  const next=xorshift(0x81515e38);
  const secret=Uint8Array.from({length:RADIX**3},()=>next()%RADIX);
  const planted=new Uint8Array(VISIBLE);
  for(let i=0;i<VISIBLE;i++)
    planted[i]=secret[keys[i<gap?i:i+HIDDEN]];
  const damaged=Uint8Array.from(planted);
  const changed=[];
  for(let j=0;j<ALLOWED_EDITS;j++){
    const i=Math.floor((j+0.5)*VISIBLE/ALLOWED_EDITS);
    assert.ok(!changed.includes(i));
    changed.push(i);
    damaged[i]=(planted[i]+1+j%28)%RADIX;
    assert.notEqual(damaged[i],planted[i]);
  }
  const observed=evaluate(first,damaged);
  const three=observed.find(x=>x.arity===3);
  assert.ok(three.minimum<=ALLOWED_EDITS);
  return {trueCornerMask:mask,trueOrientation:orientation,trueGap:gap,
    unknownSecretTableEntries:secret.length,actualEdits:changed.length,
    exactKnownKeyUnchangedOutputSymbols:VISIBLE-changed.length,
    recoveredUnknownKeyFreeLossLowerBound:three.minimum,
    acceptsGenuine86EditPlant:three.minimum<=ALLOWED_EDITS};
}


/**
 * The four-input stationary nonlinear loophole can be restricted by the
 * actual arithmetic clue: every GF(29) polynomial of total degree <= 3
 * in the four adjacent source-square symbols (35 free coefficients).
 * Partition the visible B symbols into 177 disjoint blocks of 36.
 *
 * For every block, test if the augmented 36x36 matrix [X|B] has higher
 * rank than the 36x35 monomial matrix X. This key-independent witness
 * proves at least one output correction is needed in that block, even
 * if each block uses its own unrelated secret degree-three polynomial.
 * For any five-cell gap, use unshifted features before the gap and
 * five-shifted features after it; discard the at most one block that
 * crosses it. All 6396 gap positions and eight orientations are covered.
 */
function cubicMonomials() {
  const exponents=[];
  for(let a=0;a<=3;a++)for(let b=0;b<=3-a;b++)
    for(let c=0;c<=3-a-b;c++)for(let d=0;d<=3-a-b-c;d++)
      exponents.push([a,b,c,d]);
  assert.equal(exponents.length,35);
  return exponents;
}
const CUBIC=cubicMonomials();
const INVERSE=new Uint8Array(RADIX);
for(let i=1;i<RADIX;i++)for(let j=1;j<RADIX;j++)
  if(i*j%RADIX===1){INVERSE[i]=j;break;}
assert.ok(Array.from(INVERSE).slice(1).every(x=>x>0));

/** @param {Uint8Array} first @param {number} orientation */
function cubicFeatures(first,orientation) {
  const rows=new Array(OUT*OUT);
  for(let i=0;i<rows.length;i++){
    const [r,c]=orient(i,orientation),a=r*IN+c;
    const v=[first[a],first[a+1],first[a+IN],first[a+IN+1]];
    const powers=v.map(x=>[1,x,x*x%RADIX,x*x*x%RADIX]);
    rows[i]=Uint8Array.from(CUBIC.map(([a,b,c,d])=>
      powers[0][a]*powers[1][b]*powers[2][c]*powers[3][d]%RADIX));
  }
  return rows;
}

/**
 * Linear consistency over the prime field of 29 elements.
 * A true return certifies at least one incorrect output in this
 * disjoint 36-observation block for EVERY secret cubic coefficient set.
 * @param {Uint8Array[]} features 6400 x 35 source-only feature matrix.
 * @param {Uint8Array} observed 6395 source original or plant runes.
 * @param {number} start Start of 36-symbol output block.
 * @param {0|5} offset Candidate shift across unobserved five cells.
 */
function cubicBlockInconsistent(features,observed,start,offset) {
  const basis=new Array(CUBIC.length);
  const width=CUBIC.length+1;
  for(let i=start;i<start+width;i++){
    const row=new Int16Array(width);
    row.set(features[i+offset]);
    row[CUBIC.length]=observed[i];
    let independent=false;
    for(let j=0;j<CUBIC.length;j++){
      const pivot=row[j];
      if(!pivot)continue;
      const previous=basis[j];
      if(previous) {
        for(let k=j;k<width;k++)
          row[k]=(row[k]-(pivot*previous[k])%RADIX+RADIX)%RADIX;
      } else {
        const inv=INVERSE[pivot];
        for(let k=j;k<width;k++)row[k]=row[k]*inv%RADIX;
        basis[j]=row;
        independent=true;
        break;
      }
    }
    if(!independent&&row[CUBIC.length]!==0)return true;
  }
  return false;
}

/**
 * Minimum number of independent violated disjoint source-to-output
 * polynomial consistency certificates under all missing-gap locations.
 * The output is a rigorous LOWER bound on rune changes, not an
 * estimate of the minimum Hamming distance to any one polynomial.
 * @param {Uint8Array[]} features
 * @param {Uint8Array} observed
 */
function cubicAllGapCertificates(features,observed) {
  const size=CUBIC.length+1,blocks=Math.floor(observed.length/size);
  const left=new Uint16Array(blocks+1),right=new Uint16Array(blocks+1);
  for(let i=0;i<blocks;i++)
    left[i+1]=left[i]+Number(cubicBlockInconsistent(
      features,observed,i*size,0));
  for(let i=blocks-1;i>=0;i--)
    right[i]=right[i+1]+Number(cubicBlockInconsistent(
      features,observed,i*size,HIDDEN));
  let minimum=Infinity,bestGap=0;
  for(let gap=0;gap<=observed.length;gap++){
    // At most one 36-symbol block intersects this unknown five-cell gap.
    // Throw it out altogether; other groups remain independent witnesses.
    const before=Math.floor(gap/size);
    const after=Math.min(blocks,Math.ceil(gap/size));
    const lower=left[before]+right[after];
    if(lower<minimum){minimum=lower;bestGap=gap;}
  }
  return {blockSize:size,independentBlocks:blocks,
    unshiftedFailures:left[blocks],shiftedFailures:right[0],
    minIncompatibleDisjointBlocks:minimum,bestGap};
}

/** Full original cubic gate over eight square orientations. */
function cubicOriginal(first,second) {
  const perOrientation=[];
  for(let orientation=0;orientation<8;orientation++){
    const certificate=cubicAllGapCertificates(
      cubicFeatures(first,orientation),second);
    perOrientation.push({orientation,...certificate});
  }
  const best=perOrientation.reduce((a,b)=>
    a.minIncompatibleDisjointBlocks<=b.minIncompatibleDisjointBlocks?a:b);
  return {monomialCount:CUBIC.length,totalDegreeAtMost:3,
    unrestrictedPolynomialKeyCount:RADIX**CUBIC.length,
    bestLowerBound:best.minIncompatibleDisjointBlocks,
    bestOrientation:best.orientation,bestGap:best.bestGap,
    perOrientation};
}

/** Independent hidden full cubic key and original-square 86-edited plant. */
function cubicPositive(first) {
  const orientation=4,gap=3385,next=xorshift(0x38181565);
  const coeff=Uint8Array.from(CUBIC,()=>next()%RADIX);
  const features=cubicFeatures(first,orientation);
  const unedited=new Uint8Array(VISIBLE);
  for(let i=0;i<VISIBLE;i++){
    const row=features[i<gap?i:i+HIDDEN];
    let value=0;
    for(let j=0;j<CUBIC.length;j++)
      value=(value+coeff[j]*row[j])%RADIX;
    unedited[i]=value;
  }
  const edited=Uint8Array.from(unedited);
  for(let j=0;j<ALLOWED_EDITS;j++){
    const i=Math.floor((j+0.5)*VISIBLE/ALLOWED_EDITS);
    edited[i]=(edited[i]+1+j%28)%RADIX;
    assert.notEqual(edited[i],unedited[i]);
  }
  const report=cubicAllGapCertificates(features,edited);
  assert.ok(report.minIncompatibleDisjointBlocks<=ALLOWED_EDITS);
  return {secretPolynomialDegree:3,coefficientCount:CUBIC.length,
    trueOrientation:orientation,trueGap:gap,
    sourceCorrectUnchangedGlyphs:VISIBLE-ALLOWED_EDITS,
    modifiedGlyphs:ALLOWED_EDITS,
    invariantLowerBoundOnPlantedGlyphEdits:
      report.minIncompatibleDisjointBlocks,positiveAccepted:true};
}

function run(){
  const {first,second}=source();
  const originals=evaluate(first,second);
  const controls=positiveControl(first);
  const cubic=cubicOriginal(first,second);
  const cubicPlant=cubicPositive(first);
  assert.deepEqual(originals.map(x=>x.models),[32,48,32,8]);
  const three=originals.find(x=>x.arity===3);
  assert.ok(three.minimum>ALLOWED_EDITS);
  assert.ok(cubic.bestLowerBound>ALLOWED_EDITS);
  return {
    label:"Source-original key-independent conditional 81-square to 80-square nonlinear stencil capacity",
    sourceRunes:first.length+second.length,
    sourceSquareSymbols:first.length,
    observedOutputSquareSymbols:second.length,
    unknownContiguousOutputCells:HIDDEN,
    orientations:8,allFiveCellGapPositions:VISIBLE+1,
    testedCornerSubsets:15,totalStencilModels:120,
    outputSecretFunction:"Completely unrestricted stationary 29-ary lookup table",
    strongerBound:"Two independent arbitrary lookup tables before and after unknown gap",
    observedAdjacentEqualRunePairs:ALLOWED_EDITS,
    originalMinimumRequiredChanges:originals,
    sourceThreeCornerHardMinimum:three.minimum,
    sourceThreeCornerExcessChangesAbove86:three.minimum-ALLOWED_EDITS,
    syntheticPositive:controls,
    originalFullFourCornerCubicDegreeAtMostThreeBound:cubic,
    independentCubicPositive:cubicPlant,
    conclusion:"Every stationary source-to-output stencil of at most three of the four adjacent source-square cells needs at least the reported alterations even under two secret tables, all 8 orientations and all contiguous five-cell gaps; an 86-output-edit repair cannot explain original LP2. Arbitrary four-input stationary tables are not excluded by the 86-edit gate, but ALL four-input total-degree-3 GF29 polynomial maps are separately excluded by the disjoint-block rank certificate.",
    caution:"The hypothetical square border is retrospectively selected. A changing state, nonconsecutive omissions, external input or different coordinate map is not addressed. No original plaintext, key, or destination is recovered."
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={source,orient,tupleKeys,adjust,minTwoTableEdits,evaluate,positiveControl,cubicMonomials,cubicFeatures,cubicBlockInconsistent,cubicAllGapCertificates,cubicOriginal,cubicPositive,run};
