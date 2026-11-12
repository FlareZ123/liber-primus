'use strict';

/**
 * LP2 original botanical seven-page chapter pp8–14:
 * all-offset six-page shared GP29 additive-pad exclusion.
 *
 * Any seven-page pad reused at the same page-local rune position is
 * also reused on the first six pages. These six original pages each
 * contain >=255 runes. Test 255 aligned positions from each page.
 * Permit independent constant page offsets, arbitrary common key K[i],
 * all 29^5 relative offset assignments, and four source-visible
 * direction conventions (printed, either alternating tree side, all
 * reversed). No key is fitted to a plaintext sample.
 *
 * A common pad disappears exactly in each pairwise difference:
 *   (C[a,i] - C[b,i]) mod29
 *     = (P[a,i] - P[b,i] + shift[a] - shift[b]) mod29
 * Therefore the 29^5 phase optimization is exhaustive, including
 * unknown shifts and every possible pad K[i].
 *
 * Run: node sims/lp2_tree6_sharedpad_alloffset_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} file */
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.filter(p => p.page >= 8 && p.page <= 14);
assert.deepEqual(pages.map(p => p.indices.length),
  [255, 268, 263, 273, 261, 272, 137]);

const Q = 29, N = 255, LANES = 6, SAMPLES = 1000;
const layouts = [
  { name:'printed', reverse:() => false },
  { name:'right-tree-reversed', reverse:j => j % 2 === 1 },
  { name:'left-tree-reversed', reverse:j => j % 2 === 0 },
  { name:'all-reversed', reverse:() => true },
];

/** @param {number} x */
const mod = x => (x % Q + Q) % Q;

/** @param {string} raw */
function toGP(raw) {
  const normalized = raw.toUpperCase().replace(/QU/g,'CW')
    .replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const vocab = corpus.translit.map((s,i)=>({s,i}))
    .sort((x,y)=>y.s.length-x.s.length);
  /** @type {number[]} */
  const out = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for(let i=0;i<word.length;) {
      const token = vocab.find(t=>word.startsWith(t.s,i));
      assert.ok(token,word.slice(i));
      out.push(token.i);
      i += token.s.length;
    }
  }
  return out;
}

const sources = [
  { name:'Shakespeare', file:'resources/control/shakespeare_first300k.txt' },
  { name:'Gibran', file:'resources/control/gibran_prophet_58585.txt' },
  { name:'Emerson', file:'resources/control/emerson_essays_2944.txt' },
].map(s=>({...s,gp:toGP(read(s.file))}));

// Fix the differential language model on Shakespeare only.
// Gibran and Emerson are genuinely independent heldout sources.
const freq = new Float64Array(Q);
for(const v of sources[0].gp)freq[v]++;
const p = Array.from(freq,v=>(v+1)/(sources[0].gp.length+Q));
const logQ = Array.from({length:Q},(_,d)=>
  Math.log(p.reduce((sum,v,j)=>sum+v*p[mod(j-d)],0)));
const lengths = pages.map(p=>p.indices.length);
const span = lengths.reduce((s,x)=>s+x,0);
assert.equal(span,1729);

/** @param {number[][]} streams */
function fixedLogScore(streams) {
  let score = 0;
  for(let a=0;a<LANES;a++)for(let b=a+1;b<LANES;b++)
    for(let i=0;i<N;i++)
      score += logQ[mod(streams[a][i]-streams[b][i])];
  return score;
}

/** @param {number[][]} streams */
function equalityCount(streams) {
  let count = 0;
  for(let a=0;a<LANES;a++)for(let b=a+1;b<LANES;b++)
    for(let i=0;i<N;i++)
      count += Number(streams[a][i] === streams[b][i]);
  return count;
}

/**
 * Exact exhaustive pairwise-difference likelihood optimizer.
 * Offset on lane0 is fixed zero without loss of generality.
 * Exactly 29^5 assignments are evaluated. No stochastic search.
 * @param {number[][]} streams
 */
function bestScore(streams) {
  /** @type {Float64Array[][]} */
  const table = Array.from({length:LANES},()=>
    Array.from({length:LANES},()=>new Float64Array(Q)));
  for(let a=0;a<LANES;a++)for(let b=a+1;b<LANES;b++) {
    const hist = new Float64Array(Q);
    for(let i=0;i<N;i++)hist[mod(streams[a][i]-streams[b][i])]++;
    for(let shift=0;shift<Q;shift++)
      for(let d=0;d<Q;d++)
        table[a][b][shift]+=hist[d]*logQ[mod(d-shift)];
  }
  let best=-Infinity, offsets=[];
  let tested=0;
  const h=table;
  for(let s1=0;s1<Q;s1++) {
    const a=h[0][1][mod(-s1)];
    for(let s2=0;s2<Q;s2++) {
      const b=a+h[0][2][mod(-s2)]+h[1][2][mod(s1-s2)];
      for(let s3=0;s3<Q;s3++) {
        const c=b+h[0][3][mod(-s3)]+h[1][3][mod(s1-s3)]
          +h[2][3][mod(s2-s3)];
        for(let s4=0;s4<Q;s4++) {
          const d=c+h[0][4][mod(-s4)]+h[1][4][mod(s1-s4)]
            +h[2][4][mod(s2-s4)]+h[3][4][mod(s3-s4)];
          for(let s5=0;s5<Q;s5++) {
            const score=d+h[0][5][mod(-s5)]
              +h[1][5][mod(s1-s5)]+h[2][5][mod(s2-s5)]
              +h[3][5][mod(s3-s5)]+h[4][5][mod(s4-s5)];
            tested++;
            if(score>best) {
              best=score;
              offsets=[0,s1,s2,s3,s4,s5];
            }
          }
        }
      }
    }
  }
  assert.equal(tested,Q**(LANES-1));
  return {best,offsets,tested};
}

/** @param {number[][]} raw @param {(index:number)=>boolean} reverse */
function oriented(raw,reverse) {
  return raw.slice(0,LANES).map((seq,j)=>{
    const s=seq.slice();
    if(reverse(j))s.reverse();
    return s.slice(0,N);
  });
}

/** @param {number[]} runes @param {number} start */
function nativePages(runes,start) {
  let at=start;
  return lengths.map(len=>{
    const slice=runes.slice(at,at+len);
    at+=len;
    return slice;
  });
}

const results=[];
const pinnedBest=[
  -12903.521977187022,
  -12895.66847305486,
  -12897.317090507737,
  -12895.836213933682,
];
for(let j=0;j<layouts.length;j++){
  const layout=layouts[j];
  const original=oriented(pages.map(p=>p.indices),layout.reverse);
  const best=bestScore(original);
  assert.ok(Math.abs(best.best-pinnedBest[j]) < 1e-5);
  /** @type {Array<{source:string,min:number,max:number,nativeWindows:number,nBelowOriginal:number}>} */
  const controls=[];
  for(const source of sources) {
    let min=Infinity,max=-Infinity,nBelowOriginal=0;
    const maxStart=source.gp.length-span;
    assert.ok(maxStart>=0);
    for(let n=0;n<SAMPLES;n++){
      const start=Math.floor(maxStart*n/(SAMPLES-1));
      const sampled=oriented(nativePages(source.gp,start),layout.reverse);
      const score=fixedLogScore(sampled);
      if(score<min)min=score;
      if(score>max)max=score;
      if(score<=best.best)nBelowOriginal++;
    }
    assert.equal(nBelowOriginal,0,layout.name+' '+source.name);
    controls.push({
      source:source.name,min,max,nativeWindows:SAMPLES,nBelowOriginal,
    });
  }
  results.push({
    layout:layout.name,
    original:{
      zeroPhase:fixedLogScore(original),
      maximumOverAllPageShifts:best.best,
      bestRelativeOffsets:best.offsets,
      testedOffsetAssignments:best.tested,
      equalityAtPrintedOffsets:equalityCount(original),
    },
    nativeControls:controls,
  });
}

// A full 255-column source-native encrypted positive control.
// Exactly one nonconstant common pad is reused on all six lanes,
// plus six distinct secret offsets. It must be recognized by the
// exhaustive discriminator and decode/re-encrypt exactly.
const plantedPlain=nativePages(sources[0].gp,12011).slice(0,LANES)
  .map(a=>a.slice(0,N));
const secretOffsets=[0,7,13,19,23,11];
const key=Array.from({length:N},(_,i)=>mod(13*i*i+19*i+1));
const plantedCipher=plantedPlain.map((lane,j)=>lane.map((v,i)=>
  mod(v+key[i]+secretOffsets[j])));
const decrypted=plantedCipher.map((lane,j)=>lane.map((v,i)=>
  mod(v-key[i]-secretOffsets[j])));
assert.deepEqual(decrypted,plantedPlain);
const plantedScore=bestScore(plantedCipher);
const knownKeyScore=fixedLogScore(plantedPlain);
assert.ok(plantedScore.best >= knownKeyScore-1e-5);
assert.ok(knownKeyScore > Math.max(...pinnedBest));
assert.equal(equalityCount(plantedPlain),218);
assert.equal(equalityCount(plantedCipher),123);

console.log(JSON.stringify({
  decision:'seven-page equal-position shared GP29 additive pad with' +
    ' arbitrary page shifts excluded under finite native-English controls',
  scope:{physicalPages:[8,9,10,11,12,13],sourceChapterEnd:14,
    originalLengths:lengths,positionsPerPage:N,lanes:LANES,
    commonPadKey:'arbitrary 255 values',
    pageShifts:'all 29^5 choices, one global phase fixed',
    directions:layouts.map(x=>x.name),
    modelSource:sources[0].file,
    nativeControls:sources.map(s=>s.file),
    samplesPerSourcePerDirection:SAMPLES},
  results,
  plantedControl:{secretOffsets,correctTrueKeyScore:knownKeyScore,
    exhaustiveOptimum:plantedScore.best,
    exactPlaintextRecovery:true,correctOffsetEquality:218,
    rawCipherEquality:123},
  caveat:'No original unknown plaintext or authentic key. No claim about' +
    ' unrelated pads per page, nonlinear states or non-English plaintext.',
},null,2));
