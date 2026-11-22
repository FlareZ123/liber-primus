'use strict';
/**
 * An all-secret, grid-anchored 8x8 GF(29) convolution gate on the authentic
 * terminal p55-p57 76+85+95 rune alignment.
 *
 * A source-visible 32x8 table suggests a toroidal 8x8 translation-invariant
 * field stencil. Grant all 64 coefficients and a free constant: the solved
 * 180 terminal runes must lie in the 65-dimensional output space.
 * Reconstruct p56 under its authentic prime-totient rule; p57 is clear.
 *
 * Run: node sims/lp2_terminal256_8x8_allsecret_kernel_sft.cjs
 * Node 22 built-ins only; no randomization.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} location */
const readJSON = location => JSON.parse(
  fs.readFileSync(path.join(ROOT,location),'utf8')
);
const corpus = readJSON('resources/liber-primus/lp2-corpus.json');
const grid = readJSON('resources/liber-primus/lp2-grid-256.json');
const [c55,c56,c57] = [55,56,57].map(i => corpus.pages[i].indices);
const mod = x => (x%29+29)%29;
assert.deepEqual([c55.length,c56.length,c57.length,grid.bytes.length],
  [76,85,95,256]);
assert.equal(grid.bytes.every(x => Number.isInteger(x) && x>=0 && x<256),true);
const bytes = grid.bytes.map(x => x%29);
const primes = [];
for(let p=2;primes.length<100;p++){
  let prime=true;
  for(let q=2;q*q<=p;q++){if(p%q===0){prime=false;break;}}
  if(prime)primes.push(p);
}
let primeIndex=0;
const p56=c56.map((cipher,i)=>
  i===56 ? 0 : mod(cipher-(primes[primeIndex++]-1))
);
assert.equal(primeIndex,84);
/** @param {string} words */
function nativeGP(words){
  const entries=corpus.translit.map((token,index)=>({token,index}))
    .sort((a,b)=>b.token.length-a.token.length);
  const out=[];
  for(const word of words.split(' ')){
    for(let pos=0;pos<word.length;){
      const next=entries.find(x=>word.startsWith(x.token,pos));
      assert(next, 'No GP rune matches '+word.slice(pos));
      out.push(next.index);
      pos+=next.token.length;
    }
  }
  return out;
}
assert.deepEqual(p56, nativeGP(
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE'
),'p56 independently solved prime-totient native-GP positive control');
const targets=[
  {name:'solved-p56-plus-clear-p57',runes:p56.concat(c57)},
  {name:'encrypted-p56-plus-clear-p57',runes:c56.concat(c57)}
];
assert.equal(targets.every(t=>t.runes.length===180),true);
const rings=[];
for(let d=0;d<4;d++){
  const r=[], top=d,bottom=31-d,left=d,right=7-d;
  for(let x=left;x<=right;x++)r.push(8*top+x);
  for(let y=top+1;y<=bottom;y++)r.push(8*y+right);
  for(let x=right-1;x>=left;x--)r.push(8*bottom+x);
  for(let y=bottom-1;y>top;y--)r.push(8*y+left);
  rings.push(r);
}
assert.deepEqual(rings.map(x=>x.length),[76,68,60,52]);
const corners=[[0,0],[0,7],[31,7],[31,0]];
/** @param {number} corner @param {number} direction */
function walk(corner,direction){
  const [cy,cx]=corners[corner];
  return rings.flatMap((ring,d)=>{
    const y=Math.max(d,Math.min(31-d,cy));
    const x=Math.max(d,Math.min(7-d,cx));
    const offset=ring.indexOf(8*y+x);
    assert(offset>=0);
    return ring.map((_,i)=>
      ring[(offset+direction*i+ring.length*2)%ring.length]);
  });
}
/** @param {number} tableCell @returns {number[]} */
function features(tableCell){
  const y=Math.floor(tableCell/8),x=tableCell%8;
  const row=[1];
  for(let dy=0;dy<8;dy++){
    for(let dx=0;dx<8;dx++){
      row.push(bytes[8*((y+dy)%32)+(x+dx)%8]);
    }
  }
  assert.equal(row.length,65);
  return row;
}
const inv=Array.from({length:29},(_,x)=>{
  if(x===0)return 0;
  for(let y=1;y<29;y++)if(x*y%29===1)return y;
  throw Error('GF29 nonzero inverse missing');
});
/** Solve the overdetermined affine 65-variable system over GF29.
 * @param {number[][]} augmented
 */
function solve(augmented){
  const nvars=65,A=augmented.map(r=>r.slice()),pivots=[];
  let rank=0;
  for(let col=0;col<nvars&&rank<A.length;col++){
    let next=rank;
    while(next<A.length&&A[next][col]===0)next++;
    if(next===A.length)continue;
    [A[next],A[rank]]=[A[rank],A[next]];
    const scale=inv[A[rank][col]];
    for(let j=col;j<=nvars;j++)A[rank][j]=mod(scale*A[rank][j]);
    for(let i=0;i<A.length;i++){
      if(i===rank||A[i][col]===0)continue;
      const factor=A[i][col];
      for(let j=col;j<=nvars;j++){
        A[i][j]=mod(A[i][j]-factor*A[rank][j]);
      }
    }
    pivots.push(col);
    rank++;
  }
  const contradictions=A.slice(rank).filter(row=>row[nvars]!==0).length;
  const coeffs=Array(nvars).fill(0);
  for(let i=0;i<pivots.length;i++)coeffs[pivots[i]]=A[i][nvars];
  return {rank,contradictions,coeffs};
}
/** @param {number[]} features0 @param {number[]} coeffs */
function apply(features0,coeffs){
  return mod(features0.reduce((sum,x,i)=>sum+x*coeffs[i],0));
}
const records=[];
const fixedNativeCoeffs=Array.from({length:65},(_,i)=>(7*i+11)%29);
for(let corner=0;corner<4;corner++){
  for(const direction of [-1,1]){
    const positions=walk(corner,direction);
    assert.equal(positions.length,256);
    assert.equal(new Set(positions).size,256);
    const inner=positions.slice(76).map(features);
    for(const target of targets){
      const equations=inner.map((x,i)=>x.concat(target.runes[i]));
      const solved=solve(equations);
      assert.equal(solved.rank,65);
      assert(solved.contradictions>=100);
      records.push({
        corner,direction,knownTarget:target.name,
        rank:solved.rank,contradictions:solved.contradictions
      });
    }
    // Independently construct complete 256-rune source-native plant.
    const planted=positions.map(pos=>apply(features(pos),fixedNativeCoeffs));
    const recovered=solve(inner.map((x,i)=>x.concat(planted[76+i])));
    assert.equal(recovered.rank,65);
    assert.equal(recovered.contradictions,0);
    assert.deepEqual(recovered.coeffs,fixedNativeCoeffs);
    const inferredOuter=positions.slice(0,76)
      .map(pos=>apply(features(pos),recovered.coeffs));
    assert.deepEqual(inferredOuter,planted.slice(0,76));
  }
}
assert.equal(records.length,16);
console.log(JSON.stringify({
  source:{terminalRunes:[76,85,95],table:[32,8],
    knownRuneCount:180,unknownOuterCount:76,
    gridResidue:'conventional base60 bytes modulo 29',
    stencil:'8x8 toroidal convolution + intercept',
    freeCoefficients:65},
  tested:records,
  summary:{
    independentKnownEquations:180,
    minRank:Math.min(...records.map(x=>x.rank)),
    minContradictions:Math.min(...records.map(x=>x.contradictions)),
    maxContradictions:Math.max(...records.map(x=>x.contradictions)),
    positivePlants:8,plantOuterRecovered:76
  },
  decision:'All eight fixed perimeter orientations contradict the solved 180-rune target for every 65-parameter toroidal 8x8 GF29 filter. This is a conditional finite family exclusion; no unknown p55 plaintext or authentic key.'
},null,2));
