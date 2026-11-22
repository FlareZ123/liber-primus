'use strict';
/**
 * Source-exact, all-secret-IV recurrence-invariant original LP2 test.
 * This does not require plaintext word breaks, dictionary, known words,
 * vowel assumptions, IV guessing or whole-output English scoring.
 *
 * For P_b = M^-1(C_b - P_(b-1)), the arbitrary GP29 initial state enters
 * each 5-rune block with coefficient R^(b+1), R=-M^-1. The historical
 * five-squares have exact R orders 56 and 28 respectively. Therefore
 * every GP29 equality at rune positions separated by T*5 is IV-invariant.
 *
 * Windows Node.js 22 SFT:
 * node sims/lp2_2014_fivesquare_feedback_periodic_alliv_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const sourceSquares = read('resources/cicada2014-openpuff-magic-squares.txt')
  .trim().split(/\r?\n\s*\r?\n/).map(block =>
    block.trim().split(/\r?\n/).map(line =>
      line.trim().split(/\s+/).map(Number)));
assert.deepEqual(sourceSquares.map(A => A.length),[5,7,5]);
const mod = x => ((x % 29) + 29) % 29;
const I = Array.from({length:5},(_,i) =>
  Array.from({length:5},(_,j) => +(i===j)));
function invScalar(x) {
  const v = Array.from({length:28},(_,i) => i+1)
    .find(k => mod(x*k)===1);
  assert(v !== undefined);
  return v;
}
function inverse(M) {
  const a = M.map((r,i) => [...r,...I[i]]);
  for (let j=0;j<5;j++) {
    const pivot = a.findIndex((r,i) => i>=j && r[j]!==0);
    assert(pivot>=j,'source 5x5 matrix must be invertible over GF29');
    [a[j],a[pivot]]=[a[pivot],a[j]];
    const v=invScalar(a[j][j]);
    a[j]=a[j].map(x=>mod(x*v));
    for(let i=0;i<5;i++){
      if(i===j)continue;
      const factor=a[i][j];
      a[i]=a[i].map((x,k)=>mod(x-factor*a[j][k]));
    }
  }
  return a.map(r=>r.slice(5));
}
function mv(M,x){
  return M.map(r=>mod(r.reduce((s,v,i)=>s+v*x[i],0)));
}
function mm(A,B){
  return A.map(row=>Array.from({length:5},(_,j)=>
    mod(row.reduce((s,v,k)=>s+v*B[k][j],0))));
}
function matrixOrder(R){
  let v=I;
  for(let k=1;k<=1000;k++){
    v=mm(v,R);
    if(v.every((r,i)=>r.every((x,j)=>x===I[i][j])))return k;
  }
  throw new Error('No short source period');
}
function decrypt(C,J,initial){
  assert.equal(C.length%5,0);
  let previous=initial.slice();
  const out=[];
  for(let i=0;i<C.length;i+=5){
    const p=mv(J,C.slice(i,i+5)
      .map((v,j)=>mod(v-previous[j])));
    out.push(...p);
    previous=p;
  }
  return out;
}
function encrypt(P,M,initial){
  assert.equal(P.length%5,0);
  let previous=initial.slice();
  const out=[];
  for(let i=0;i<P.length;i+=5){
    const p=P.slice(i,i+5);
    out.push(...mv(M,p).map((v,j)=>mod(v+previous[j])));
    previous=p;
  }
  return out;
}
/** Counts each unordered pair exactly once at separations k*periodRune. */
function fixedPairCollisions(data,periodRune){
  let pairs=0,identical=0;
  for(let i=0;i<data.length;i++){
    for(let j=i+periodRune;j<data.length;j+=periodRune){
      pairs++;
      if(data[i]===data[j])identical++;
    }
  }
  return {pairs,identical};
}
const tokens=corpus.translit.map((t,i)=>({t,i}))
  .sort((a,b)=>b.t.length-a.t.length);
/** Source-calibrated GP spelling verified independently on 181 LP1 words. */
function encodeNativeGP(source){
  const result=[];
  for(let w of source.toUpperCase().match(/[A-Z]+/g)||[]){
    w=w.replace(/QU/g,'CW').replace(/V/g,'U')
      .replace(/[KQ]/g,'C').replace(/Z/g,'S');
    for(let i=0;i<w.length;){
      if(w.startsWith('ING',i)){
        result.push(21);
        i+=3;
      } else if(w.startsWith('IO',i)){
        result.push(27);
        i+=2;
      } else {
        const matched=tokens.find(t=>w.startsWith(t.t,i));
        if(!matched)break;
        result.push(matched.i);
        i+=matched.t.length;
      }
    }
  }
  return result;
}
const sourceFiles=[
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt'
];
const controls=sourceFiles.map(file=>({
  name:file, tape:encodeNativeGP(read(file)), samples:128
}));
const lp1=read('resources/liber-primus/lp1-plaintext-reference.txt')
  .replace(/### \d+\n/g,'').replace(/^\[[^\n]*\]$/gm,'');
controls.push({name:'LP1 solved native GP plaintext',
  tape:encodeNativeGP(lp1),samples:10});
assert.deepEqual(controls.map(x=>x.tape.length),
  [217106,62492,321327,3632]);
const cases=[
  {matrix:0,pages:[3,7],period:56,runelen:1145,pairs:1780,observed:58,
    minNative:75},
  {matrix:0,pages:[33,39],period:56,runelen:1680,pairs:4200,observed:137,
    minNative:207},
  {matrix:2,pages:[3,7],period:28,runelen:1145,pairs:4120,observed:147,
    minNative:200},
  {matrix:2,pages:[33,39],period:28,runelen:1680,pairs:9240,observed:328,
    minNative:474}
];
for(const test of cases){
  const M=sourceSquares[test.matrix].map(r=>r.map(mod));
  assert(M.every(r=>r.length===5));
  const J=inverse(M);
  const R=J.map(row=>row.map(v=>mod(-v)));
  assert.equal(matrixOrder(R),test.period,
    'actual matrix coefficient order, not guessed from label');
  const C=corpus.pages.filter(p=>
    p.page>=test.pages[0]&&p.page<=test.pages[1])
    .flatMap(p=>p.indices);
  assert.equal(C.length,test.runelen);
  const original=decrypt(C,J,Array(5).fill(0));
  const wrongSecret=decrypt(C,J,[1,6,13,19,24]);
  assert.deepEqual(encrypt(original,M,Array(5).fill(0)),C);
  const lag=5*test.period;
  const counts=fixedPairCollisions(original,lag);
  const other=fixedPairCollisions(wrongSecret,lag);
  assert.deepEqual(counts,other,
    'all-secret-IV coefficient cancellation at source period');
  assert.deepEqual(counts,
    {pairs:test.pairs,identical:test.observed});
  let lower=Infinity,upper=-Infinity,sum=0,seen=0;
  for(const source of controls){
    const n=source.samples;
    assert(source.tape.length>=C.length);
    for(let j=0;j<n;j++){
      const offset=Math.floor(j*(source.tape.length-C.length)/(n-1));
      const native=source.tape.slice(offset,offset+C.length);
      const scored=fixedPairCollisions(native,lag);
      assert.equal(scored.pairs,counts.pairs);
      lower=Math.min(lower,scored.identical);
      upper=Math.max(upper,scored.identical);
      sum+=scored.identical;
      seen++;
      if(j===0){
        // A real planted English tape has its high collision rate
        // *even after decrypting with an intentionally WRONG secret IV*.
        const hidden=encrypt(native,M,M[0]);
        const found=decrypt(hidden,J,[1,6,13,19,24]);
        assert.deepEqual(
          fixedPairCollisions(found,lag),
          fixedPairCollisions(native,lag),
          'positive native GP29 source plant survives arbitrary wrong IV'
        );
        assert.deepEqual(decrypt(hidden,J,M[0]),native,
          'known secret IV exactly reconstructs planted original GP text');
      }
    }
  }
  assert.equal(seen,394);
  assert.equal(lower,test.minNative);
  assert(counts.identical<lower,
    'original invariant below all independently sourced English controls');
  console.log('Historical square '+test.matrix+
    ', complete LP2 p'+test.pages[0]+'–'+test.pages[1]+
    ', order '+test.period+', span '+lag+' GP runes, immutable pairs '+
    counts.identical+'/'+counts.pairs+
    ', native controls '+seen+' range '+lower+'–'+upper+
    ', control mean '+(sum/seen).toFixed(3)+
    ', secret-IV-independent via exact coefficient order');
}
console.log('PASS four exact all-IV native-language invariants without word boundaries');
