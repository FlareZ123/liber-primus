'use strict';

/**
 * Source-known-only, original-terminal GF257 polynomial codeword exclusion
 * with a completely UNKNOWN injective GP29-to-GF257 alphabet embedding.
 *
 * Original known p56 plaintext + clear p57 occupy 180 positions. Their
 * repeated rune classes impose homogeneous linear equations on all non-
 * constant polynomial coefficients; the 23 known rune classes leave at most
 * 6 new field values for ALL unknown p55 positions. Test just the first 20
 * unknown positions (without reading their actual ciphertext values).
 *
 * Two frozen assignments: original p55..57 consecutive order, and the
 * stable ascending ranks of all 256 printed p50 table bytes. The numeric
 * mapping of GP rune indices is intentionally NOT used for field values.
 *
 * Run: node sims/lp2_terminal256_gf257_unlabeled_degree160_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const sourceRoot = path.join(__dirname, '..','resources','liber-primus');
const corpus = JSON.parse(fs.readFileSync(
  path.join(sourceRoot,'lp2-corpus.json'), 'utf8'
));
const table = JSON.parse(fs.readFileSync(
  path.join(sourceRoot,'lp2-grid-256.json'), 'utf8'
));
const p = 257;
const degreeCeiling = 160;

/** @param {number} v @returns {number} */
const residue = v => ((v % p) + p) % p;

/** @param {number} a @param {number} n @returns {number} */
function fieldPower(a,n) {
  let z = 1;
  let base = residue(a);
  for(let e=n;e>0;e=Math.floor(e/2)){
    if(e%2)z=residue(z*base);
    base=residue(base*base);
  }
  return z;
}

const inverse = Array.from({length:p}, (_,i) =>
  i===0?0:fieldPower(i,p-2)
);

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  /** @type {number[]} */
  const list=[];
  for(let n=2;list.length<count;n++){
    let prime=true;
    for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break;}
    if(prime)list.push(n);
  }
  return list;
}

const shifts = firstPrimes(84);
let clock=0;
const p56=corpus.pages[56].indices.map((cipher,i)=>{
  if(i===56){assert.equal(cipher,0);return 0;}
  const key=shifts[clock++]-1;
  const plain=((cipher-key)%29+29)%29;
  assert.equal((plain+key)%29,cipher);
  return plain;
});
assert.equal(clock,84);
assert.deepEqual(p56.slice(0,5),[24,9,18,9,23]);
const known=[...p56,...corpus.pages[57].indices];
assert.equal(known.length,180);
const labels=[...new Set(known)];
assert.equal(labels.length,23);
const representatives=labels.map(v=>known.indexOf(v));
assert.equal(29-labels.length,6);
assert.equal(table.bytes.length,256);
const sorting=Array.from({length:256},(_,i)=>i)
  .sort((i,j)=>table.bytes[i]-table.bytes[j]||i-j);
const stableRanks=new Array(256);
sorting.forEach((original,rank)=>{stableRanks[original]=rank;});
assert.equal(new Set(stableRanks).size,256);

/**
 * Consecutive equality conditions P(x_i) = P(x_firstOfSameRune).
 * The constant coefficient cancels. Matrix columns are powers x^1..x^160.
 *
 * @param {number[]} positions 256 distinct field evaluation positions
 * @param {number[]} wordLabels 180 symbolic class identifiers
 * @returns {Uint16Array[]}
 */
function equalityRows(positions, wordLabels) {
  const representative = new Map();
  /** @type {Uint16Array[]} */
  const rows=[];
  for(let i=0;i<wordLabels.length;i++){
    const symbol=wordLabels[i];
    const x=positions[76+i];
    if(!representative.has(symbol)){representative.set(symbol,x);continue;}
    const first=representative.get(symbol);
    const row=new Uint16Array(degreeCeiling);
    let a=1,b=1;
    for(let j=0;j<degreeCeiling;j++){
      a=residue(a*x);
      b=residue(b*first);
      row[j]=residue(a-b);
    }
    rows.push(row);
  }
  return rows;
}

/**
 * GF257 reduced row echelon form. A column basis of the homogeneous kernel
 * is computed by setting each free coefficient to 1 and all others to 0.
 * Constants remain a separate free affine translation and are not counted.
 *
 * @param {Uint16Array[]} originalRows
 * @returns {{rank:number,pivots:number[],basis:Uint16Array[]}}
 */
function nullSpace(originalRows) {
  const rows=originalRows.map(row=>row.slice());
  const pivots=[];
  let rank=0;
  for(let col=0;col<degreeCeiling && rank<rows.length;col++){
    let choice=rank;
    while(choice<rows.length && rows[choice][col]===0)choice++;
    if(choice===rows.length)continue;
    [rows[rank],rows[choice]]=[rows[choice],rows[rank]];
    const scale=inverse[rows[rank][col]];
    for(let j=col;j<degreeCeiling;j++)
      rows[rank][j]=residue(rows[rank][j]*scale);
    for(let r=0;r<rows.length;r++){
      if(r===rank)continue;
      const factor=rows[r][col];
      if(factor===0)continue;
      for(let j=col;j<degreeCeiling;j++)
        rows[r][j]=residue(rows[r][j]-factor*rows[rank][j]);
    }
    pivots.push(col);
    rank++;
  }
  const taken=new Set(pivots);
  const free=Array.from({length:degreeCeiling},(_,i)=>i)
    .filter(i=>!taken.has(i));
  const basis=free.map(column=>{
    const coefficients=new Uint16Array(degreeCeiling);
    coefficients[column]=1;
    for(let r=0;r<rank;r++)
      coefficients[pivots[r]]=residue(-rows[r][column]);
    return coefficients;
  });
  return {rank,pivots,basis};
}

/**
 * Exhaustively enumerate all 1D subspaces of a 3-dimensional GF257
 * homogeneous nonconstant coefficient kernel. Affine rescaling P→aP+b,
 * a!=0, does not change class equality or the number of new output labels;
 * hence the projective representative set is COMPLETE, not a heuristic.
 *
 * @param {Uint16Array[]} basis
 * @param {number[]} positions
 * @returns {{tested:number,injective:number,survived:number,minNew:number}}
 */
function projectiveGate(basis,positions) {
  assert.equal(basis.length,3);
  const inspect=[
    ...representatives.map(i=>positions[76+i]),
    ...positions.slice(0,20)
  ];
  const evaluations=basis.map(coeff=>inspect.map(x=>{
    let result=0;
    for(let i=coeff.length-1;i>=0;i--)
      result=residue(result*x+coeff[i]);
    return result;
  }));
  let tested=0,injective=0,survived=0,minNew=Infinity;
  const knownStamps=new Uint32Array(p);
  const newStamps=new Uint32Array(p);
  let mark=0;

  /** @param {number} a @param {number} b @param {number} c */
  function test(a,b,c) {
    tested++;
    mark++;
    let uniqueKnown=0;
    for(let i=0;i<labels.length;i++){
      const v=residue(a*evaluations[0][i]+
        b*evaluations[1][i]+c*evaluations[2][i]);
      if(knownStamps[v]!==mark) {
        knownStamps[v]=mark;uniqueKnown++;
      }
    }
    // An injective GP29 embedding must distinguish all 23 known runes.
    if(uniqueKnown!==23)return;
    injective++;
    let newly=0;
    for(let i=labels.length;i<inspect.length;i++){
      const value=residue(a*evaluations[0][i]+
        b*evaluations[1][i]+c*evaluations[2][i]);
      if(knownStamps[value]!==mark && newStamps[value]!==mark){
        newStamps[value]=mark;newly++;
      }
    }
    minNew=Math.min(minNew,newly);
    if(newly<=6)survived++;
  }

  // Every nonzero vector is uniquely represented after scalar normalization
  // as [1,a,b], [0,1,b] or [0,0,1].
  for(let a=0;a<p;a++)for(let b=0;b<p;b++)test(1,a,b);
  for(let b=0;b<p;b++)test(0,1,b);
  test(0,0,1);
  assert.equal(tested,p*p+p+1);
  return {tested,injective,survived,minNew};
}

// Original 32x8 cell geometry: the 76-cell clockwise border is the
// unknown p55 register, the 30x6 row-major interior is the known 180.
// Unlike terminal page-order coordinates, this variant directly follows
// the source-visible "shed our own circumferences" geometric conjecture.
const gridRows=Array.from({length:32},(_,r)=>
  Array.from({length:8},(_,c)=>8*r+c));
const clockwiseBorder=[
  ...gridRows[0],
  ...gridRows.slice(1).map(row=>row[7]),
  ...gridRows[31].slice(0,7).reverse(),
  ...gridRows.slice(1,31).reverse().map(row=>row[0])
];
const rowMajorInterior=gridRows.slice(1,31)
  .flatMap(row=>row.slice(1,7));
assert.equal(clockwiseBorder.length,76);
assert.equal(rowMajorInterior.length,180);
const geometricSourceSlots=[...clockwiseBorder,...rowMajorInterior];
assert.equal(new Set(geometricSourceSlots).size,256);

for(const variant of [
  {name:'original contiguous LP2 terminal positions',
    positions:Array.from({length:256},(_,i)=>i),
    expectedInjective:23974,expectedMinNew:10},
  {name:'stable ascending original p50 numeric-table rank positions',
    positions:stableRanks,
    expectedInjective:23998,expectedMinNew:10},
  {name:'p50 geometric clockwise shell and original row-major interior',
    positions:geometricSourceSlots},
  {name:'p50 clockwise shell / row-major interior, stable numeric table rank',
    positions:geometricSourceSlots.map(cell=>stableRanks[cell])}
]) {
  const positions=variant.positions;
  const rows=equalityRows(positions,known);
  assert.equal(rows.length,157);
  const kernel=nullSpace(rows);
  assert.equal(kernel.rank,157);
  assert.deepEqual(kernel.pivots,Array.from({length:157},(_,i)=>i));
  assert.equal(kernel.basis.length,3);

  // Positive algebraic control: x^16 over GF257 has just 17 distinct
  // outputs over all 256 x in 0..255 (the zero and 16th powers).
  // It is an authentic low-degree nonconstant, 29-symbol-compatible
  // field codeword; equality tests must accept this class configuration.
  const plantAll=positions.map(x=>fieldPower(x,16));
  assert.equal(new Set(plantAll).size,17);
  const plantRows=equalityRows(positions,plantAll.slice(76));
  assert(plantRows.every(row=>row[15]===0),
    'synthetic x^16 must solve every planted equality condition');
  assert(new Set(plantAll.slice(0,20)).size<=17);

  const result=projectiveGate(kernel.basis,positions);
  if(variant.expectedInjective!==undefined)
    assert.equal(result.injective,variant.expectedInjective);
  if(variant.expectedMinNew!==undefined)
    assert.equal(result.minNew,variant.expectedMinNew);

  console.log(JSON.stringify({
    source:variant.name,
    knownRuneClasses:labels.length,
    unusedRuneClasses:29-labels.length,
    originalEqualityConstraints:rows.length,
    homogeneousRank:kernel.rank,
    degreeAtMost157NonconstantPossible:false,
    nonconstantKernelDimensionAtDegree160:kernel.basis.length,
    testedProjectiveDirections:result.tested,
    directionsWithInjectiveKnownRuneValues:result.injective,
    bestAdditionalDistinctValuesAmongFirst20:result.minNew,
    maxAvailableNewRuneValues:6,
    survivingValidAlphabetCodewords:result.survived,
    plantedDegree16CodewordDistinctValues:17
  }));
  assert.equal(result.survived,0,
    'A candidate survives: inspect its coefficient direction before declaring an exclusion');
  assert(result.minNew>6);
}

console.log('PASS: four source-readable GP-embedding-free GF257 codeword families of degree <=160 excluded by the first 20 withheld coordinates.');
