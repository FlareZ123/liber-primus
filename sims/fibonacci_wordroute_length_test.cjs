'use strict';
/**
 * Fixed 16-cell Fibonacci-prime-square orderings as whole-word transpositions.
 * Tests all directed routes between five source-inspired square readouts with
 * 16 possible manuscript-block phases. Exact manuscript word boundaries are
 * supplied by the shared page-crossing parser.
 *
 * Null: reshuffle the complete observed word-length categories, redo the
 * full 320-candidate search, and retain each shuffled maximum. This controls
 * selecting a favourable source route and block phase from this family.
 * Node.js 22 CommonJS: node sims/fibonacci_wordroute_length_test.cjs.
 */
const assert = require('node:assert/strict');
const {parseSharedCorpus} = require('./lp2_word_pages.cjs');
const {readSquare, clockwiseSpiral} = require('./fibonacci_prime_spiral.cjs');

const CELL_COUNT = 16;
const SAMPLES = 200;
const SEED = 0x15f1b0ac;

/** @param {number} n Rune word length. */
function category(n) { return n <= 2 ? 0 : n <= 5 ? 1 : 2; }

/** @returns {Object<string,number[]>} Source-derived square reading orders. */
function orders() {
  const square = readSquare().flat();
  const row = Array.from({length:CELL_COUNT}, (_,i) => i);
  const column = Array.from({length:CELL_COUNT}, (_,i) =>
    (i % 4) * 4 + Math.floor(i / 4));
  const spiral = clockwiseSpiral().map(([r,c]) => 4*r+c);
  const valueAscending = row.slice().sort((a,b) => square[a]-square[b]);
  const boustrophedon = row.map(i =>
    Math.floor(i/4)%2 ? 4*Math.floor(i/4)+3-(i%4) : i);
  const result = {row,column,spiral,valueAscending,boustrophedon};
  for (const v of Object.values(result)) {
    assert.equal(v.length, CELL_COUNT);
    assert.equal(new Set(v).size,CELL_COUNT);
  }
  assert.deepEqual(spiral,[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12]);
  return result;
}

/**
 * Position map: inverse ordering of one 16-symbol block.
 * @param {number} count Whole manuscript word count.
 * @param {number[]} from
 * @param {number[]} to
 * @param {number} phase
 */
function mapPositions(count, from, to, phase) {
  const local = to.map(v => from.indexOf(v));
  const map = Array.from({length:count}, (_,i) => i);
  for(let start=phase;start+CELL_COUNT<=count;start+=CELL_COUNT)
    for(let i=0;i<CELL_COUNT;i++)map[start+i]=start+local[i];
  assert.equal(new Set(map).size,count);
  return map;
}

/**
 * Pearson chi-square of adjacent 3-category original rune-word lengths.
 * @param {Uint8Array} v Categories of original complete rune words.
 * @param {number[]} pos Source positions in proposed reading order.
 */
function chi(v,pos) {
  const n=pos.length-1;
  const freq=new Uint32Array(9), left=new Uint32Array(3),right=new Uint32Array(3);
  let prev=v[pos[0]];
  for(let i=1;i<pos.length;i++){
    const current=v[pos[i]];
    freq[3*prev+current]++;left[prev]++;right[current]++;
    prev=current;
  }
  let statistic=0;
  for(let i=0;i<3;i++)for(let j=0;j<3;j++){
    const expected=left[i]*right[j]/n;
    if(expected)statistic+=(freq[3*i+j]-expected)**2/expected;
  }
  return statistic;
}

/** @param {number} seed Unsigned nonzero seed. */
function seeded(seed) {
  let x=seed>>>0;
  assert.notEqual(x,0);
  return function random32() {
    x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;
  };
}

/** Fisher-Yates resampling, preserving category counts exactly. */
function shuffled(v, random32) {
  const t=Uint8Array.from(v);
  for(let i=t.length-1;i>0;i--){
    const j=random32()%(i+1);
    const a=t[i];t[i]=t[j];t[j]=a;
  }
  return t;
}

function run() {
  const words=parseSharedCorpus().words;
  assert.equal(words.length,2896);
  assert.equal(words.reduce((n,w)=>n+w.length,0),12956);
  const real=Uint8Array.from(words, w => category(w.length));
  const o=orders(),candidates=[];
  for(const [from, a] of Object.entries(o))
    for(const [to,b] of Object.entries(o)) {
      if(from===to)continue;
      for(let phase=0;phase<CELL_COUNT;phase++)candidates.push(
        {from,to,phase,pos:mapPositions(real.length,a,b,phase)});
    }
  assert.equal(candidates.length,320);
  const ranked=candidates.map(({from,to,phase,pos}) =>
    {return {from,to,phase,chi:chi(real,pos)};})
    .sort((a,b)=>b.chi-a.chi);
  const originalChi=chi(real,Array.from(real,(_,i)=>i));
  assert.ok(Math.abs(originalChi-3.949446088360591)<1e-10);
  assert.ok(Math.abs(ranked[0].chi-14.225593900489274)<1e-10);
  const random32=seeded(SEED),maxNull=[];
  let exceed=0;
  for(let rep=0;rep<SAMPLES;rep++){
    const sample=shuffled(real,random32);
    let best=-Infinity;
    for(const c of candidates)
      best=Math.max(best,chi(sample,c.pos));
    maxNull.push(best);
    if(best>=ranked[0].chi)exceed++;
  }
  maxNull.sort((a,b)=>a-b);
  assert.equal(exceed,116);
  const output={
    scope:'Global 16-complete-word square-route block transpositions; fixed word boundaries, short/medium/long GP categories',
    completeWords:real.length,originalAdjacentChiSquare:originalChi,
    sourceSquareOrders:o,configurations:candidates.length,
    selectedMaximum:ranked[0],topEight:ranked.slice(0,8),
    null:{replicates:SAMPLES,seed:'0x15f1b0ac',
      controls:'Each sample shuffles all 2,896 source word-length categories and scans all 320 routes/phases',
      exceedances:exceed,wholeFamilyUpperP:(exceed+1)/(SAMPLES+1),
      median:maxNull[Math.floor(SAMPLES/2)],
      p95:maxNull[Math.floor(0.95*SAMPLES)],
      max:maxNull.at(-1)},
    conclusion:'No significant whole-word ordering recovery within the prescribed 320 Fibonacci-square readout/phase configurations; no plaintext or key.'
  };
  console.log(JSON.stringify(output,null,2));
  return output;
}
if(require.main===module)run();
module.exports={orders,mapPositions,category,chi,seeded,shuffled,run};
