'use strict';
/**
 * Source-original QR version-36 checkerboard test for LP2:
 * first 81² unsolved runes occupy even/even sites and the next 80²,
 * including the five red title runes of solved p56, occupy odd/odd sites
 * of a 161x161 QR display.
 *
 * Test 8x8 D4 orientations of the two source squares. The fixed QR finder,
 * finder separator and 46 alignment-pattern modules admit an arbitrary
 * global glyph-to-bit assignment and independent XOR mask per row and column.
 * Every contradiction is exact over GF(2), not English-language evidence.
 *
 * Reproduction: node sims/lp2_161_checkerboard_qr36_gate.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const corpus=read('resources/liber-primus/lp2-corpus.json');
const ink=read('resources/liber-primus/lp2-ink-annotations.json');
const WIDTH=161;
const ALIGNMENT_CENTERS=[6,24,50,76,102,128,154];

/** @returns {number[]} Original source plus solved red title boundary. */
function original() {
  const unsolved=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
  assert.equal(unsolved.length,55);
  const glyphs=unsolved.flatMap(p=>p.indices);
  assert.equal(glyphs.length,12956);
  const title=corpus.pages[56].indices.slice(0,5);
  assert.deepEqual(title,[25,11,22,15,4]);
  const page=ink.pages.find(p=>p.page===56);
  assert.ok(page);
  assert.deepEqual(page.red_spans.map(x=>[x.start,x.length]),[[0,5]]);
  assert.ok(page.large_punctuation.some(x=>x[0]===5&&x[1]===13));
  const all=[...glyphs,...title];
  assert.equal(all.length,81**2+80**2);
  assert.equal(all.length,(WIDTH*WIDTH+1)/2);
  return all;
}

/**
 * QR fixed structural modules, byte-independent: finder+white separators
 * and 46 5x5 alignment targets. We omit data, format, mask, version fields
 * and timing bits, deliberately making the feasibility test more permissive.
 * @returns {{row:number,column:number,required:number}[]}
 */
function fixedCells(all=false) {
  const pixels=new Map();
  /** @param {number} row @param {number} col @param {number} bit */
  function mark(row,col,bit) {
    if(row<0||row>=WIDTH||col<0||col>=WIDTH)return;
    const position=row*WIDTH+col;
    if(pixels.has(position))assert.equal(pixels.get(position),bit);
    pixels.set(position,bit);
  }
  for(const [fr,fc] of [[0,0],[0,WIDTH-7],[WIDTH-7,0]]) {
    for(let dr=-1;dr<=7;dr++)for(let dc=-1;dc<=7;dc++) {
      const inside=dr>=0&&dr<=6&&dc>=0&&dc<=6;
      const black=inside&&(dr===0||dr===6||dc===0||dc===6||
        (dr>=2&&dr<=4&&dc>=2&&dc<=4));
      mark(fr+dr,fc+dc,Number(black));
    }
  }
  let alignment=0;
  for(const row of ALIGNMENT_CENTERS)for(const col of ALIGNMENT_CENTERS) {
    if((row===6&&col===6)||(row===6&&col===154)||
       (row===154&&col===6))continue;
    alignment++;
    for(let dr=-2;dr<=2;dr++)for(let dc=-2;dc<=2;dc++) {
      const black=Math.abs(dr)===2||Math.abs(dc)===2||
        (dr===0&&dc===0);
      mark(row+dr,col+dc,Number(black));
    }
  }
  assert.equal(alignment,46);
  assert.equal(pixels.size,1342);
  if(all) return [...pixels].map(([spot,required])=>({
    row:Math.floor(spot/WIDTH),column:spot%WIDTH,required
  }));
  const visible=[...pixels].filter(([spot])=>
    ((Math.floor(spot/WIDTH)+spot%WIDTH)&1)===0)
    .map(([spot,required])=>({
      row:Math.floor(spot/WIDTH),column:spot%WIDTH,required
    }));
  assert.equal(visible.length,694);
  return visible;
}

/** @param {number} row @param {number} col @param {number} n
 * @param {number} orientation @returns {[number,number]} */
function oriented(row,col,n,orientation) {
  if(orientation&1)row=n-1-row;
  if(orientation&2)col=n-1-col;
  if(orientation&4)[row,col]=[col,row];
  return [row,col];
}

/** @param {number[]} originalSource @param {{row:number,column:number}} cell
 * @param {number} orient81 @param {number} orient80 */
function originalRune(originalSource,cell,orient81,orient80) {
  const {row,column}=cell;
  assert.equal((row+column)%2,0);
  if(!(row&1)) {
    const [r,c]=oriented(row/2,column/2,81,orient81);
    return originalSource[r*81+c];
  }
  const [r,c]=oriented((row-1)/2,(column-1)/2,80,orient80);
  return originalSource[6561+r*80+c];
}

/** Exact minimum Hamming edits under every unrestricted glyph-bit mapping. */
function minMismatch(symbolAt,cells) {
  const counts=Array.from({length:29},()=>[0,0]);
  for(let i=0;i<cells.length;i++)
    counts[symbolAt(i)][cells[i].required]++;
  return counts.reduce((sum,[white,black])=>sum+Math.min(white,black),0);
}

/**
 * Exact GF2 solver: glyphBit[g] XOR rowPad[r] XOR colPad[c] = QRrequired.
 * Produces a GF2 linear-dependence certificate when infeasible.
 * @param {(i:number)=>number} symbolAt
 * @param {{row:number,column:number,required:number}[]} cells
 */
function sourceInvariant(symbolAt,cells) {
  const variables=29+2*WIDTH;
  const basis=Array(variables).fill(0n);
  const rhs=Array(variables).fill(0);
  const ancestry=Array(variables).fill(0n);
  let rank=0,contradictions=0;
  let first=null;
  for(let i=0;i<cells.length;i++) {
    const {row,column,required}=cells[i],g=symbolAt(i);
    assert.ok(Number.isInteger(g)&&g>=0&&g<29);
    let coefficients=(1n<<BigInt(g))^
      (1n<<BigInt(29+row))^
      (1n<<BigInt(29+WIDTH+column));
    let bit=required;
    let provenance=1n<<BigInt(i);
    for(let j=variables-1;j>=0;j--) {
      if(!((coefficients>>BigInt(j))&1n))continue;
      if(basis[j]) {
        coefficients^=basis[j];
        bit^=rhs[j];
        provenance^=ancestry[j];
      } else {
        basis[j]=coefficients;
        rhs[j]=bit;
        ancestry[j]=provenance;
        rank++;
        break;
      }
    }
    if(coefficients===0n&&bit===1) {
      contradictions++;
      if(!first) {
        const witness=[];
        for(let k=0;k<cells.length;k++)
          if((provenance>>BigInt(k))&1n)
            witness.push({...cells[k],glyph:symbolAt(k)});
        first={firstContradictionAt:i+1,witness};
      }
    }
  }
  if(first) {
    const witness=first.witness;
    assert.equal(witness.reduce((v,x)=>v^x.required,0),1);
    for(const fn of [x=>x.glyph,x=>x.row,x=>x.column]) {
      const counts=new Map();
      for(const cell of witness) {
        const key=fn(cell);counts.set(key,(counts.get(key)||0)+1);
      }
      for(const n of counts.values())assert.equal(n%2,0);
    }
  }
  return {rank,consistent:contradictions===0,contradictions,
    ...first};
}

/** Test whether the source actually supplies a QR version-36 fixed pattern. */
function main() {
  const src=original();
  const cells=fixedCells();
  const evaluations=[];
  let best=Infinity;
  for(let a=0;a<8;a++)for(let b=0;b<8;b++) {
    const map=i=>originalRune(src,cells[i],a,b);
    const errors=minMismatch(map,cells);
    const result=sourceInvariant(map,cells);
    best=Math.min(best,errors);
    evaluations.push({square81Orientation:a,square80Orientation:b,errors,
      consistent:result.consistent,rank:result.rank,
      firstContradictionAt:result.firstContradictionAt,
      firstWitnessSize:result.witness?.length});
  }
  assert.equal(best,222);
  assert.equal(evaluations.filter(x=>x.consistent).length,0);

  const identity=sourceInvariant(
    i=>originalRune(src,cells[i],0,0),cells);
  assert.equal(minMismatch(
    i=>originalRune(src,cells[i],0,0),cells),229);
  assert.equal(identity.rank,112);
  assert.equal(identity.witness.length,10);
  assert.equal(identity.firstContradictionAt,47);
  const simpleWitness=identity.witness;

  // Construct a secret binary glyph class and arbitrary row/column pads;
  // the original-source geometry and all mandatory QR structural cells stay.
  const planted=src.slice();
  for(let i=0;i<cells.length;i++) {
    const {row,column,required}=cells[i];
    const bit=required^((3*row+1)&1)^((7*column+1)&1);
    const [r,c]=row%2===0
      ? oriented(row/2,column/2,81,0)
      : oriented((row-1)/2,(column-1)/2,80,0);
    const index=row%2===0?r*81+c:6561+r*80+c;
    planted[index]=bit?14:0;
  }
  const positive=sourceInvariant(
    i=>originalRune(planted,cells[i],0,0),cells);
  assert.equal(positive.consistent,true);
  assert.equal(minMismatch(
    i=>originalRune(planted,cells[i],0,0),cells),0);

  const result={classification:'key-independent conditional QR36 source gate',
    originalUnsolvedRunes:12956,
    addedSolvedRedTitleRunes:5,
    redTitle:corpus.pages[56].indices.slice(0,5),
    fullCheckerboardPositions:src.length,
    QRVersion:36,displayWidth:WIDTH,
    mappedSquares:[81,80],
    knownStructuralCells:cells.length,
    testedIndependentSquareOrientations:evaluations.length,
    fewestUnmaskedStructuralBitEdits:best,
    fullGlyphRowColumnXorFeasibleOrientations:0,
    unrotated:{unmaskedMinimumEdits:229,rank:identity.rank,
      firstContradictionAt:identity.firstContradictionAt,
      certificate:simpleWitness},
    minimumContradictionSizeAmongFirstWitnesses:Math.min(
      ...evaluations.map(x=>x.firstWitnessSize)),
    plantedExactFeasible:positive.consistent,
    interpretation:'The source-fixed 81^2 plus 80^2 visual grouping cannot be a direct QR v36 function pattern under one secret glyph-bit alphabet, even allowing independent row/column XOR pads. Does not rule out nonlinear coding, reshuffled modules, other routes or other intermediates. No unknown LP2 plaintext/key recovered.'};
  console.log(JSON.stringify(result,null,2));
}
if(require.main===module)main();
module.exports={original,fixedCells,oriented,originalRune,minMismatch,
  sourceInvariant,main};
