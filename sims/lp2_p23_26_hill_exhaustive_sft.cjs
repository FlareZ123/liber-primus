'use strict';

/**
 * LP2 physical pp23–26 source-delimited 5-rune Hill inverse gate, two layouts.
 *
 * The source p23 contains an original five-dot figure and a red 16-rune
 * heading; the remaining 1005 GP29 ciphertext runes are exactly 201
 * consecutive five-rune blocks. Search all (29^5-1)/28 = 732541
 * projectively distinct nonzero GF29 linear forms. Every inverse row
 * of a fixed invertible 5x5 Hill cipher is one of these forms up to
 * scalar. Both the original 201 consecutive quintets and the alternative
 * five contiguous 201-rune strands are tested under the identical keyspace. IoC is invariant to multiplying by a nonzero field scalar.
 *
 * Run from any working directory with Node:
 *   node sims/lp2_p23_26_hill_exhaustive_sft.cjs
 *
 * @typedef {{page:number,indices:number[]}} Page
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} p */
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
/** @type {Page[]} */
const pages = corpus.pages.filter(p => p.page >= 23 && p.page <= 26);
assert.deepEqual(pages.map(p => p.indices.length), [213,270,273,265]);
const entire = pages.flatMap(p => p.indices);
assert.equal(entire.length, 1021);
assert.deepEqual(entire.slice(0,16),
  [1,24,7,21,6,14,23,6,10,17,10,12,16,17,10,26]);
const body = entire.slice(16);
assert.equal(body.length, 1005);
const N = 201, Q = 29;
const columns = Array.from({ length:5 },(_,j) =>
  Uint8Array.from(Array.from({ length:N },(_,i) => body[i*5+j])));
// Alternative complete five-strand layout: original body divided into
// five consecutive, nonoverlapping 201-rune shares.
const fiveBlockColumns = Array.from({length:5}, (_,j) =>
  Uint8Array.from(body.slice(j*N,(j+1)*N)));
const times = Array.from({length:Q},(_,x) =>
  Uint8Array.from(Array.from({length:Q},(_,y) => x*y%Q)));
/** @param {number[]} coeff @param {Array<Uint8Array>} cols */
function projectionCounts(coeff,cols=columns) {
  const hist = new Uint16Array(Q);
  for(let i=0;i<N;i++) {
    const y=(times[coeff[0]][cols[0][i]]+
      times[coeff[1]][cols[1][i]]+
      times[coeff[2]][cols[2][i]]+
      times[coeff[3]][cols[3][i]]+
      times[coeff[4]][cols[4][i]])%Q;
    hist[y]++;
  }
  let pairs=0;
  for(let i=0;i<Q;i++) pairs+=hist[i]*(hist[i]-1);
  return pairs;
}
const scored=[], scoredBlocks=[], totalExpected=(Q**5-1)/(Q-1);
let tested=0, maxPairs=0, atLeast045=0;
let maxBlockPairs=0, atLeast045Blocks=0;
function visit(a,b,c,d,e) {
  const coeff=[a,b,c,d,e];
  const pairs=projectionCounts(coeff);
  const blockPairs=projectionCounts(coeff,fiveBlockColumns);
  tested++;
  if(pairs>maxPairs) maxPairs=pairs;
  if(blockPairs>maxBlockPairs) maxBlockPairs=blockPairs;
  if(pairs>=1809) atLeast045++; // 0.045*201*200 = 1809
  if(blockPairs>=1809) atLeast045Blocks++;
  if(scored.length<10||pairs>scored[scored.length-1].pairs){
    scored.push({coeff,pairs});
    scored.sort((x,y)=>y.pairs-x.pairs);
    if(scored.length>10) scored.length=10;
  }
  if(scoredBlocks.length<10||
     blockPairs>scoredBlocks[scoredBlocks.length-1].pairs){
    scoredBlocks.push({coeff,pairs:blockPairs});
    scoredBlocks.sort((x,y)=>y.pairs-x.pairs);
    if(scoredBlocks.length>10) scoredBlocks.length=10;
  }
}

for(let b=0;b<Q;b++)for(let c=0;c<Q;c++)
for(let d=0;d<Q;d++)for(let e=0;e<Q;e++)visit(1,b,c,d,e);
for(let c=0;c<Q;c++)for(let d=0;d<Q;d++)for(let e=0;e<Q;e++)
  visit(0,1,c,d,e);
for(let d=0;d<Q;d++)for(let e=0;e<Q;e++)visit(0,0,1,d,e);
for(let e=0;e<Q;e++)visit(0,0,0,1,e);
visit(0,0,0,0,1);
assert.equal(tested,totalExpected);
assert.equal(maxPairs,1788);
assert.equal(atLeast045,0);
assert.deepEqual(scored[0].coeff,[1,23,7,12,23]);
assert.equal(maxBlockPairs,1770);
assert.equal(atLeast045Blocks,0);
assert.ok(scoredBlocks[0].coeff.some(v=>v!==0));

const vocabulary=corpus.translit.map((s,i)=>({s,i}))
  .sort((x,y)=>y.s.length-x.s.length);
/** @param {string} s */
function transliterate(s){
  const normalized=s.toUpperCase().replace(/QU/g,'CW')
    .replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const out=[];
  for(const word of normalized.match(/[A-Z]+/g)||[]) {
    for(let i=0;i<word.length;){
      const token=vocabulary.find(t=>word.startsWith(t.s,i));
      assert.ok(token,word.slice(i));
      out.push(token.i);i+=token.s.length;
    }
  }
  return out;
}
/** @param {number[]} values */
function ioc(values){
  const hist=Array(Q).fill(0);
  for(const v of values)hist[v]++;
  return hist.reduce((acc,n)=>acc+n*(n-1),0)/
    (values.length*(values.length-1));
}
const controlFiles=[
 'resources/control/shakespeare_first300k.txt',
 'resources/control/gibran_prophet_58585.txt',
 'resources/control/emerson_essays_2944.txt',
];
const controls=[];
for(const file of controlFiles){
  const plain=transliterate(read(file)), values=[];
  assert.ok(plain.length>1005);
  for(let n=0;n<30;n++){
    const from=Math.floor((plain.length-1005)*n/29);
    const sample=plain.slice(from,from+1005);
    for(let strand=0;strand<5;strand++)values.push(
      ioc(sample.filter((_,j)=>j%5===strand)));
  }
  controls.push({
    corpus:file,runicLength:plain.length,
    n:values.length,min:Math.min(...values),max:Math.max(...values),
  });
}
assert.equal(controls.reduce((n,x)=>n+x.n,0),450);
const minNative=Math.min(...controls.map(x=>x.min));
assert.ok(minNative>0.05);
assert.ok(minNative>maxPairs/(N*(N-1)));

// Synthetic positive plant: source-native Shakespeare GP runes are mixed
// in five-rune blocks by a dense Vandermonde 5x5 GF29 matrix.
// This test proves five-rune linear mixing can flatten true English
// while all five inverse projection rows remain statistically detectable.
const plant=transliterate(read(controlFiles[0])).slice(0,1005);
const poly=(base,exponent)=>{
  let result=1;
  for(let i=0;i<exponent;i++) result=result*base%Q;
  return result;
};
const mixer=Array.from({length:5},(_,i)=>
  Array.from({length:5},(_,j)=>poly(i+1,j)));
/** @param {number} n */
const mod29=n=>(n%Q+Q)%Q;
/** @param {number} x */
const inverse29=x=>poly(x,Q-2);
/** @param {number[][]} matrix */
function invertMatrix(matrix){
  const a=matrix.map((row,i)=>[
    ...row, ...Array.from({length:5},(_,j)=>+(i===j))]);
  for(let col=0;col<5;col++){
    let p=col;
    while(p<5 && a[p][col]===0)p++;
    assert.ok(p<5,'Matrix not invertible');
    [a[col],a[p]]=[a[p],a[col]];
    const inverse=inverse29(a[col][col]);
    for(let j=col;j<10;j++)a[col][j]=mod29(a[col][j]*inverse);
    for(let row=0;row<5;row++){
      if(row===col)continue;
      const factor=a[row][col];
      for(let j=col;j<10;j++)
        a[row][j]=mod29(a[row][j]-factor*a[col][j]);
    }
  }
  return a.map(row=>row.slice(5));
}
const inverse=invertMatrix(mixer);
const encrypted=Array.from({length:5},()=>new Uint8Array(N));
for(let i=0;i<N;i++)for(let row=0;row<5;row++)
  encrypted[row][i]=mod29(
    mixer[row].reduce((s,k,j)=>s+k*plant[5*i+j],0));
const recovered=[];
for(let col=0;col<5;col++){
  const inverseRow=inverse[col];
  const normalized=inverseRow.map(x=>x);
  const lead=normalized.find(x=>x!==0);
  const leadInv=inverse29(lead);
  const projective=normalized.map(x=>mod29(x*leadInv));
  const observed=projectionCounts(projective,encrypted)/(N*(N-1));
  const output=Array.from({length:N},(_,i)=>mod29(inverseRow.reduce(
    (s,v,j)=>s+v*encrypted[j][i],0)));
  const original=Array.from({length:N},(_,i)=>plant[5*i+col]);
  assert.deepEqual(output,original);
  assert.ok(observed>maxPairs/(N*(N-1)));
  recovered.push({row:col,projective,observedIoC:observed});
}
console.log(JSON.stringify({
  input:{physicalPages:[23,24,25,26],headingRunes:16,bodyRunes:1005,
    blockSize:5,blocks:201},
  model:'all fixed invertible 5x5 GF29 Hill ciphers',
  fiveBlockLayout:{fiveNonoverlapping201RuneBlocks:true,
    maximumPairs:maxBlockPairs,maximumIoC:maxBlockPairs/(N*(N-1)),
    classes:tested,atLeast045:atLeast045Blocks,
    top10:scoredBlocks.map(r=>({...r,ioc:r.pairs/(N*(N-1))}))},
  classCount:tested,highestOriginalPairs:maxPairs,
  highestOriginalIoC:maxPairs/(N*(N-1)),atLeast045,
  top10:scored.map(r=>({...r,ioc:r.pairs/(N*(N-1))})),
  controls,minNative,suggestedNativeLowerIoC:0.05,
  positiveVandermondePlant:recovered,
  result:'No original linear projection has a native GP29-English control-level IoC'
},null,2));
