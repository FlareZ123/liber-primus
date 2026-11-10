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

function run(){
  const {first,second}=source();
  const originals=evaluate(first,second);
  const controls=positiveControl(first);
  assert.deepEqual(originals.map(x=>x.models),[32,48,32,8]);
  const three=originals.find(x=>x.arity===3);
  assert.ok(three.minimum>ALLOWED_EDITS);
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
    conclusion:"Every stationary source-to-output stencil of at most three of the four adjacent source-square cells needs at least the reported alterations even under two secret tables, all 8 orientations and all contiguous five-cell gaps; an 86-output-edit repair cannot explain original LP2. Four-input stationary functions are not excluded under an 86-edit allowance.",
    caution:"The hypothetical square border is retrospectively selected. A changing state, nonconsecutive omissions, external input or different coordinate map is not addressed. No original plaintext, key, or destination is recovered."
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={source,orient,tupleKeys,adjust,minTwoTableEdits,evaluate,positiveControl,run};
