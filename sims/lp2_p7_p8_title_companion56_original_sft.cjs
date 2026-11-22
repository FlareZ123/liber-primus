'use strict';
/**
 * LP2 p8 red title -> p7 polynomial backward reconstruction and its canonical
 * 4D companion operator. Checks one new source-typed reversible hypothesis
 * against the complete p8+p9 cross-page receiver. No key fitting.
 *
 * Windows 11: Node.js 22+, standard library only, read-only.
 * This is a mathematical operator candidate, NOT recovered ciphertext.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const corpus=JSON.parse(fs.readFileSync(path.resolve(
  __dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
const p7=corpus.pages[7].indices,p8=corpus.pages[8].indices,
  p9=corpus.pages[9].indices,p57=corpus.pages[57].indices;
const mod=x=>((x%29)+29)%29;
/** @param {number} x @returns {number} */
function inverse(x){
  assert.notEqual(mod(x),0);
  for(let y=1;y<29;y++)if(mod(x*y)===1)return y;
  throw new Error('GF29 inversion impossible');
}
/** @param {number[]} xs @returns {number} */
const prod=xs=>xs.reduce((a,b)=>mod(a*b),1);
/** @param {number[]} x @param {number[]} y @returns {number[]} */
function polynomialMultiply(x,y){
  const z=Array(x.length+y.length-1).fill(0);
  for(let i=0;i<x.length;i++)for(let j=0;j<y.length;j++)
    z[i+j]=mod(z[i+j]+x[i]*y[j]);
  return z;
}
assert.deepEqual([p7.length,p8.length,p9.length,p57.length],
  [208,255,p9.length,95]);
const redLengths=[2,4,3,2,3];
let redOffset=194;
const earlier=redLengths.map(n=>{
  const x=prod(p7.slice(redOffset,redOffset+n));
  redOffset+=n;
  return x;
});
assert.equal(redOffset,208);
assert.deepEqual(earlier,[11,26,8,15,2]);

// A CONDITIONAL grammar, declared before comparing the p7 coefficients:
// p8's two red whole-word products are two fixed points; their ratio is the
// negative constant of a pure quadratic residual x^2-r; the actual last p8
// red rune specifies the derivative P'(u). No original signed instruction
// establishes this grammar as the author's intended one.
const u=prod(p8.slice(0,4)),v=prod(p8.slice(4,12)),terminal=p8[11];
assert.deepEqual([u,v,terminal],[4,3,17]);
const r=mod(v*inverse(u));
const scale=mod((terminal-1)*inverse(mod(u*u-r)));
assert.deepEqual([r,scale],[8,2]);
const q=polynomialMultiply(
  polynomialMultiply([mod(-u),1],[mod(-v),1]),[mod(-r),0,1]);
const polynomial=q.map((x,i)=>mod(scale*x+(i===1?1:0)));
assert.deepEqual(polynomial,earlier);
assert.deepEqual(q,[20,27,4,22,1]);
const evaluate=(coeff,x)=>coeff.reduceRight((a,c)=>mod(a*x+c),0);
const derivative=x=>mod(polynomial.reduce(
  (sum,c,i)=>sum+(i?i*c*Math.pow(x,i-1):0),0));
assert.deepEqual(Array.from({length:29},(_,x)=>x)
  .filter(x=>evaluate(polynomial,x)===x),[3,4]);
assert.equal(derivative(u),terminal);
assert.equal(evaluate(polynomial,19),12);
assert.equal(r,mod(v*inverse(u)));

// The monic quotient q=(P(x)-x)/2 gives a four-dimensional Frobenius companion
// matrix. It has exact order 56 in GL4(GF29), which can act as a 56-stage
// page-state transition without secret offsets. No source requires this role.
const n=4,I=Array.from({length:n},(_,i)=>
  Array.from({length:n},(_,j)=>Number(i===j)));
const M=Array.from({length:n},()=>Array(n).fill(0));
for(let i=0;i<n;i++){
  if(i>0)M[i][i-1]=1;
  M[i][n-1]=mod(-q[i]);
}
assert.deepEqual(M,[
  [0,0,0,9],[1,0,0,2],[0,1,0,25],[0,0,1,7]]);
/** @param {number[][]} A @param {number[][]} B @returns {number[][]} */
function matrixMultiply(A,B){
  return A.map(row=>B[0].map((_,j)=>
    mod(row.reduce((s,x,k)=>s+x*B[k][j],0))));
}
/** @param {number[][]} T @returns {number[][]} */
function matrixInverse(T){
  const a=T.map((row,i)=>row.concat(I[i]));
  for(let col=0;col<n;col++){
    const pivot=a.findIndex((row,j)=>j>=col&&row[col]!==0);
    assert.ok(pivot>=col);
    [a[col],a[pivot]]=[a[pivot],a[col]];
    const factor=inverse(a[col][col]);
    a[col]=a[col].map(x=>mod(x*factor));
    for(let j=0;j<n;j++)if(j!==col){
      const z=a[j][col];
      a[j]=a[j].map((x,k)=>mod(x-z*a[col][k]));
    }
  }
  return a.map(row=>row.slice(n));
}
let order=0,current=I;
for(let i=1;i<=56;i++){
  current=matrixMultiply(current,M);
  if(JSON.stringify(current)===JSON.stringify(I)){order=i;break;}
}
assert.equal(order,56);
const Minv=matrixInverse(M);
assert.deepEqual(matrixMultiply(M,Minv),I);
assert.deepEqual(matrixMultiply(Minv,M),I);
const transpose=T=>T[0].map((_,j)=>T.map(row=>row[j]));
/** @param {number[]} text @param {number[][]} T @returns {number[]} */
function transform(text,T){
  assert.equal(text.length%4,0);
  const out=[];
  for(let i=0;i<text.length;i+=4)
    for(const row of T)out.push(mod(
      row.reduce((s,x,j)=>s+x*text[i+j],0)));
  return out;
}
/** @param {number[]} text @returns {number} */
function ioc(text){
  const f=Array(29).fill(0);
  for(const x of text)f[x]++;
  return 29*f.reduce((s,x)=>s+x*(x-1),0)/
    (text.length*(text.length-1));
}
/** @param {number[]} text @returns {string} */
const spell=text=>text.map(x=>corpus.translit[x]).join('');
const original=[
  {label:'p8 entire255 + first p9',xs:p8.concat(p9[0])},
  {label:'p8 black243 + first p9',xs:p8.slice(12).concat(p9[0])}
];
const matrices=[
  ['inverse',Minv],['forward',M],
  ['inverse-transposed',transpose(Minv)],['forward-transposed',transpose(M)]
];
const tests=[];
for(const {label,xs} of original)for(const [direction,T] of matrices){
  const decoded=transform(xs,T);
  assert.deepEqual(transform(decoded,matrixInverse(T)),xs);
  tests.push({receiver:label,direction,
    normalizedIoC:Number(ioc(decoded).toFixed(9)),
    originalIoC:Number(ioc(xs).toFixed(9)),
    first40:spell(decoded.slice(0,40))});
}
assert.equal(tests.length,8);
assert(tests.every(x=>x.normalizedIoC<1.02));
const planted=p57.concat(p57[0]); // complete 96-rune *authentic* GP source
assert.deepEqual(transform(transform(planted,M),Minv),planted);
assert.deepEqual(transform(transform(planted,transpose(M)),
  transpose(Minv)),planted);
const matches56=original.map(({label,xs})=>({
  receiver:label,
  equalLag56:xs.slice(56).filter((x,j)=>x===xs[j]).length,
  requiredEqualForRaw56StepLFSR:xs.length-56
}));
assert.deepEqual(matches56.map(x=>x.equalLag56),[6,6]);

/**
 * The only further low-complexity consumer motivated by the number 56 is
 * one full GP29 four-rune Hill matrix power per physical page, derived
 * from the same p7/p8 operator. For cross-page quartets, assign the
 * power using the first actual rune's source page; p50 is rune-free.
 * Explicitly predeclare two natural anchors and direction/transposition.
 * The source does not tell the solver to apply this cipher.
 */
const unknown=corpus.pages.filter(p=>p.page<=55);
const all=unknown.flatMap(p=>p.indices);
const firstPageByRune=unknown.flatMap(p=>
  Array(p.indices.length).fill(p.page));
assert.equal(all.length,12956);
assert.equal(all.length%4,0);
const powers=[I];
for(let j=1;j<=56;j++)powers.push(matrixMultiply(powers.at(-1),M));
assert.deepEqual(powers[56],I);
const clockCases=[];
for(const anchor of [0,8])
for(const sign of [-1,1])
for(const transposed of [false,true]){
  const plain=[];
  for(let i=0;i<all.length;i+=4){
    const exponent=((sign*(firstPageByRune[i]-anchor))%56+56)%56;
    const transformMatrix=transposed
      ? transpose(powers[exponent]) : powers[exponent];
    const input=all.slice(i,i+4);
    const output=transform(input,transformMatrix);
    assert.deepEqual(transform(output,matrixInverse(transformMatrix)),input);
    plain.push(...output);
  }
  clockCases.push({anchor,sign,transposed,
    normalizedIoC:Number(ioc(plain).toFixed(9)),
    firstP8:spell(plain.slice(unknown.filter(p=>p.page<8)
      .reduce((total,p)=>total+p.indices.length,0),
      unknown.filter(p=>p.page<8)
      .reduce((total,p)=>total+p.indices.length,0)+40))});
}
assert.equal(clockCases.length,8);
assert(clockCases.every(x=>x.normalizedIoC<1.002));
const pageClockBest=Math.max(...clockCases.map(x=>x.normalizedIoC));
assert(Math.abs(pageClockBest-1.000907790)<1e-8);

console.log(JSON.stringify({
  source: {
    p7LastFiveWholeRedWordProducts:earlier,
    p8TwoWholeRedHeadingProducts:[u,v],
    p8LastRedRune:terminal,
    independentlyDerivedQuadraticResidual:r,
    reconstructedEarlierPolynomial:polynomial
  },
  monicCompanionPolynomial:q,
  companionMatrix:M,
  exactMatrixOrder:order,
  unknownPageCount:56,
  originalTests:tests,
  rawPeriod56Exclusion:matches56,
  completeBookPageClock:clockCases,
  solvedP57Control:{nativeIoC:Number(ioc(p57).toFixed(9)),
    authenticRunesReconstructed96:96},
  interpretation:'Exact conditional p8->p7 arithmetic and reversible order56 operator. Direct four-rune and full 56-page clock cipher gates nonlinguistic; no unknown plaintext or authenticated decoder.'
},null,2));
console.log('PASS: p8 reconstructs p7; companion order56; 8 direct plus 8 whole-book page-clock gates; native planted control');
