'use strict';

/**
 * Exact projective-alphabet automorphism test for prime-valued GP runes.
 *
 * The canonical 29 GP prime weights define S_q = {prime_i mod q}. Of the
 * 29 source-GP prime moduli q, only nine permit an injective 29-symbol
 * embedding. For every such q, exhaustively enumerate projective linear
 * transformations over F_q that permute S_q:
 *
 *           y = (a*x+b)/(c*x+d)  (mod q), ad-bc != 0.
 *
 * A projective line transformation is uniquely fixed by its images at
 * any three distinct finite x values. Instead of scanning q^3 matrices,
 * assign all 29*28*27 = 21,924 ordered image triples and use cross-ratio
 * to check the other 26 GP runes. No fitted key or manuscript ciphertext
 * is needed. Every actual GP prime-residue field has trivial stabilizer:
 * identity alone. Thus no nonidentity Möbius/affine/multiplicative field
 * permutation acts directly on the 29 GP-prime-valued source alphabet.
 *
 * Synthetic positive: 29 nonzero quadratic residues modulo59 form a
 * multiplicative subgroup and have exactly 58 projective automorphisms
 * (29 unit scalings and 29 inversions), including nonidentity affine
 * and nonaffine maps. Recovered by exactly the same exhaustive program.
 *
 * Node.js 22 CommonJS; no working tree modifications.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT=path.resolve(__dirname,'..');
const source=JSON.parse(fs.readFileSync(path.join(
  ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const GP=source.prime;
assert.equal(GP.length,29);

const mod=(x,q)=>(x%q+q)%q;

/**
 * Multiplicative inverses for F_q. Prime q is a source fact or synthetic q59.
 * @param {number} q @returns {Uint16Array}
 */
function inverses(q) {
  const inverse=new Uint16Array(q);
  for(let x=1;x<q;x++) {
    const found=Array.from({length:q-1},(_,i)=>i+1)
      .find(y=>x*y%q===1);
    assert.ok(found);
    inverse[x]=found;
  }
  return inverse;
}

/**
 * Images of the first three distinct reference residues identify every
 * possible projective transformation uniquely. The remaining 26 images
 * are fixed by the cross-ratio:
 *
 * lambda_x = (x-x0)(x1-x2) / ((x-x2)(x1-x0)) ;
 * A = lambda_x(y1-y0), B = y1-y2 ;
 * y = (A*y2-B*y0)/(A-B).
 *
 * The denominator A-B must be nonzero because the ciphertext alphabet
 * contains no infinity symbol. Any attempted map that hits infinity at
 * an original rune is invalid.
 *
 * @param {number} q Prime modulus.
 * @param {number[]} sourceResidues Exactly 29 distinct finite residues.
 * @returns {{field:number,imagesScanned:number,accepted:Array<number[]>}}
 */
function scan(q,sourceResidues) {
  assert.equal(sourceResidues.length,29);
  assert.equal(new Set(sourceResidues).size,29);
  assert.ok(sourceResidues.every(x=>x>=0 && x<q));
  const set=new Set(sourceResidues), inv=inverses(q);
  const [x0,x1,x2]=sourceResidues;
  const xCross=sourceResidues.slice(3).map(x=>{
    const den=mod((x-x2)*(x1-x0),q);
    assert.notEqual(den,0);
    return mod((x-x0)*(x1-x2),q)*inv[den]%q;
  });
  const accepted=[];
  let scanned=0;
  for(const y0 of sourceResidues)
    for(const y1 of sourceResidues)
      for(const y2 of sourceResidues) {
        if(y0===y1 || y0===y2 || y1===y2)continue;
        scanned++;
        let valid=true;
        for(const lambda of xCross) {
          const A=mod(lambda*(y1-y0),q);
          const B=mod(y1-y2,q);
          const divisor=mod(A-B,q);
          if(divisor===0){valid=false;break;}
          const y=mod((A*y2-B*y0)*inv[divisor],q);
          if(!set.has(y)){valid=false;break;}
        }
        if(valid)accepted.push([y0,y1,y2]);
      }
  assert.equal(scanned,29*28*27);
  return {field:q,imagesScanned:scanned,accepted};
}

/**
 * Verify the same scan detects nontrivial projective automorphisms when
 * the field-alphabet subset really has them.
 * @returns {object}
 */
function syntheticControl(){
  const q=59;
  const squareSubgroup=[...new Set(Array.from(
    {length:q-1},(_,i)=>(i+1)**2%q))].sort((a,b)=>a-b);
  assert.equal(squareSubgroup.length,29);
  const result=scan(q,squareSubgroup);
  const inv=inverses(q);
  const [x0,x1,x2]=squareSubgroup;
  const has=triple=>result.accepted.some(
    actual=>actual.every((y,i)=>y===triple[i]));
  assert.equal(result.accepted.length,58);
  assert.ok(has([x0,x1,x2]));
  assert.ok(has([4*x0%q,4*x1%q,4*x2%q]));
  assert.ok(has([inv[x0],inv[x1],inv[x2]]));
  return {source:'quadratic-residue subgroup of F59*',
    field:q,alphabetSymbols:29,mapsFound:result.accepted.length,
    projectiveImageTriplesScanned:result.imagesScanned,
    nonidentityMultiplicationDetected:true,
    nonaffineReciprocalDetected:true};
}

function run(){
  const legal=GP.flatMap((q,i)=>{
    const residues=GP.map(x=>x%q);
    return new Set(residues).size===29?[{q,index:i,residues}]:[];
  });
  assert.deepEqual(legal.map(x=>x.q),
    [61,67,73,79,83,89,97,103,109]);
  const original=legal.map(({q,index,residues})=>{
    const result=scan(q,residues);
    assert.deepEqual(result.accepted,[residues.slice(0,3)]);
    return {q,zeroRuneIndex:index,zeroRune:source.translit[index],
      sourceResidues:residues.length,
      imageTriplesExamined:result.imagesScanned,
      projectiveSymmetries:result.accepted.length,
      symmetries:[{imageFirst3:result.accepted[0],type:'identity'}]};
  });
  const positive=syntheticControl();
  const report={
    originalGPPrimeSource:GP,
    possibleSourcePrimeModuli:GP.length,
    injectivePrimeModuli:legal.length,
    collidingPrimeModuli:GP.length-legal.length,
    original,syntheticPositive:positive,
    testedFamily:'Every projective linear (Möbius) bijection of each literal prime-residue GP alphabet over every GP-source prime modulus',
    conclusion:'Nine injective prime-residue alphabets have identity as their only projective automorphism. No nontrivial direct field Möbius, affine or scalar cipher can permute all 29 GP symbols. Alternative embeddings, plaintext-dependent skips and external encodings remain possible.'
  };
  console.log(JSON.stringify(report,null,2));
  return report;
}
if(require.main===module)run();
module.exports={inverses,scan,syntheticControl,run};
