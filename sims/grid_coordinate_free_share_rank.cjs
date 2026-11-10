'use strict';
/**
 * Source-invariant rank exclusion for interpreting LP2's 32 x 8 numeral grid
 * as eight Shamir/Reed-Solomon shares with UNKNOWN fixed column coordinates.
 *
 * If each printed row is evaluations of degree <= 6 with one common set
 * of arbitrary coordinates, the row matrix rank is <= 7 over the underlying
 * field, irrespective of those coordinates, polynomial coefficients, column
 * permutations, and nonzero fixed column scales.
 *
 * Unknown fixed per-column additive offsets are removed by subtracting the
 * first row: the 31 x 8 difference matrix must still have rank <= 7.
 * This also holds independently for each printed page (10,13,9 rows).
 *
 * Neither conclusion assumes that the first share coordinate is 1.
 * Node.js 22, CommonJS, no third-party packages.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const INPUT=path.join(__dirname,'..','resources','liber-primus','lp2-grid-256.json');

/** @param {number} a @param {number} b @param {number} polynomial */
function binaryMultiply(a,b,polynomial){
  let result=0;
  for(let i=0;i<8;i++){
    if(b&1)result^=a;
    b>>>=1;
    a=(a<<1)^((a&0x80)?(polynomial&255):0);
    a&=255;
  }
  return result;
}
/** @param {number} a @param {number} exponent @param {object} field */
function power(a,exponent,field){
  let result=1;
  for(let x=a;exponent>0;exponent=Math.floor(exponent/2),x=field.mul(x,x)){
    if(exponent%2)result=field.mul(result,x);
  }
  return result;
}
/** @param {number} polynomial */
function gf256(polynomial){
  return {name:'GF256-'+polynomial.toString(16),order:256,
    mul:(a,b)=>binaryMultiply(a,b,polynomial),sub:(a,b)=>a^b};
}
const fields=[
  gf256(0x11b),gf256(0x11d),
  {name:'GF257',order:257,mul:(a,b)=>a*b%257,
    sub:(a,b)=>(a-b+257)%257}
];

/**
 * Exact Gaussian elimination. Preserve source rows while returning the
 * independent pivot row indices and final diagonal-pivot determinant.
 * @param {number[][]} input
 * @param {{order:number,mul:Function,sub:Function}} field
 */
function elimination(input,field){
  const a=input.map(x=>x.slice());
  const originalRow=Array.from({length:a.length},(_,i)=>i);
  const pivots=[];
  let determinant=1,rank=0;
  for(let col=0;col<8&&rank<a.length;col++){
    let where=rank;
    while(where<a.length&&a[where][col]===0)where++;
    if(where===a.length)continue;
    if(where!==rank){
      [a[where],a[rank]]=[a[rank],a[where]];
      [originalRow[where],originalRow[rank]]=[originalRow[rank],originalRow[where]];
      if(field.order===257)determinant=field.sub(0,determinant);
    }
    const pivot=a[rank][col],inverse=power(pivot,field.order-2,field);
    assert.equal(field.mul(pivot,inverse),1);
    determinant=field.mul(determinant,pivot);
    for(let j=col;j<8;j++)a[rank][j]=field.mul(a[rank][j],inverse);
    for(let i=rank+1;i<a.length;i++){
      const factor=a[i][col];
      if(factor===0)continue;
      for(let j=col;j<8;j++)a[i][j]=field.sub(
        a[i][j],field.mul(factor,a[rank][j]));
    }
    pivots.push({row:originalRow[rank],col,pivot});
    rank++;
  }
  return {rank,pivots,determinant:rank===8?determinant:0};
}

/** @param {number[][]} rows @param {object} field */
function differences(rows,field){
  return rows.slice(1).map(row=>row.map((v,i)=>field.sub(v,rows[0][i])));
}

/** Deterministic generator of full-rank positive random-degree-6 matrices. */
function control(field,seed){
  const next=()=>{
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    return seed;
  };
  const coordinates=[9,17,33,42,58,73,91,121];
  const scale=[1,2,3,5,7,11,13,17],offset=[21,33,45,57,69,81,93,105];
  const rows=[];
  for(let i=0;i<32;i++){
    const coeff=Array.from({length:7},()=>next()%field.order);
    const evalAt=x=>coeff.reduceRight((v,c)=>field.sub(
      c,field.sub(0,field.mul(v,x))),0);
    rows.push(coordinates.map((x,j)=>field.sub(
      field.mul(evalAt(x),scale[j]),field.sub(0,offset[j]))));
  }
  return rows;
}

/** @returns {object} 32x8 source, all field exclusions, and valid controls. */
function run(){
  const parsed=JSON.parse(fs.readFileSync(INPUT,'utf8'));
  assert.equal(parsed.pages.length,3);
  assert.deepEqual(parsed.pages.map(p=>p.rows),[10,13,9]);
  const original=parsed.pages.flatMap(p=>p.bytes);
  assert.equal(original.length,256);
  const rows=Array.from({length:32},(_,i)=>original.slice(i*8,i*8+8));
  const tests=[];
  for(const field of fields){
    for(let v=1;v<field.order;v++){
      assert.equal(field.mul(v,power(v,field.order-2,field)),1);
    }
    const full=elimination(rows,field);
    const affine=elimination(differences(rows,field),field);
    const perPage=parsed.pages.map(page=>{
      const pageRows=Array.from({length:page.rows},(_,i)=>
        page.bytes.slice(8*i,8*i+8));
      return {page:page.page,printedRows:page.rows,
        rank:elimination(pageRows,field).rank,
        rowDifferenceRank:elimination(differences(pageRows,field),field).rank};
    });
    const independentEightBlocks=[0,8,16,24].map(start=>
      elimination(rows.slice(start,start+8),field).rank);
    const synthetic=control(field,0x3301a6d1);
    const syntheticRaw=elimination(synthetic,field);
    const syntheticCentered=elimination(differences(synthetic,field),field);
    assert.equal(full.rank,8);
    assert.equal(affine.rank,8);
    assert.deepEqual(perPage.map(x=>x.rank),[8,8,8]);
    assert.deepEqual(perPage.map(x=>x.rowDifferenceRank),[8,8,8]);
    assert.deepEqual(independentEightBlocks,[8,8,8,8]);
    assert.equal(syntheticRaw.rank,7);
    assert.equal(syntheticCentered.rank,7);
    tests.push({
      field:field.name,
      originalRank:full.rank,
      originalPivotRows:full.pivots.map(x=>x.row),
      originalFirstEightRowsDeterminant:elimination(rows.slice(0,8),field).determinant,
      additiveOffsetInvariantRank:affine.rank,
      perPrintedPage:perPage,
      disjointEightRowRanks:independentEightBlocks,
      positiveUnknownCoordinates:{
        degree:6,coordinatesHiddenFromDecoder:true,
        perColumnScaleAndShift:true,
        rank:syntheticRaw.rank,differenceRank:syntheticCentered.rank
      }
    });
  }
  return {hypothesis:'Eight Shamir/RS shares with shared arbitrary unknown x coordinates and degree<=6, even with fixed column affine encodings',
    source:'resources/liber-primus/lp2-grid-256.json, full 32 by 8 row matrix',
    tests,
    conclusion:'Excluded exactly over the three specified fields and this source grid. Full row and difference rank8 rules out common-coordinate polynomial degree<=6 even with unknown coordinates and per-column affine shifts/scales. Four disjoint 8x8 invertible row blocks require at least four entire rows to be altered before rank can drop below8.',
    limits:'Does not test 8-of-8 degree7 shares (vacuous), row-specific evaluation coordinates, nonlinear per-column maps, encrypted bytes, different fields, or altered original transcription.'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={binaryMultiply,power,gf256,fields,elimination,differences,control,run};
