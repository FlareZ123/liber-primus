'use strict';

/**
 * SFT: original 2014 3301-sum square and original LP2 p7/p8 clue as a
 * mathematically fixed GF29 eigenspace projection (source-first hypothesis).
 * Dependencies: Node.js 22 built-ins; read-only, deterministic, CommonJS.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname,'..','resources');
const get = (name) => fs.readFileSync(path.join(root,name),'utf8');
const corpus = JSON.parse(get('liber-primus/lp2-corpus.json'));
const ink = JSON.parse(get('liber-primus/lp2-ink-annotations.json'));
const pages = get('liber-primus/lp2-transcription.txt').split('%');
const squareText = get('cicada2014-openpuff-magic-squares.txt');
const matrices = squareText.trim().split(/\r?\n\s*\r?\n/).map((block) =>
  block.trim().split(/\r?\n/).map((line)=>line.trim().split(/\s+/).map(Number))
);
assert.deepEqual(matrices.map((matrix)=>matrix.length),[5,7,5]);
assert.equal(matrices[0][0].reduce((a,b)=>a+b,0),3301);

const mod=(x)=>(x%29+29)%29;
const inverse=(x)=>{
  const result=Array.from({length:29},(_,i)=>i).find((i)=>mod(x*i)===1);
  assert(result!==undefined,'Nonzero divisor expected over GF29');
  return result;
};
const I=(n)=>Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>Number(i===j)));
const zero=(n)=>I(n).map((row)=>row.map(()=>0));
const scale=(M,k)=>M.map((row)=>row.map((v)=>mod(v*k)));
const add=(A,B)=>A.map((row,i)=>row.map((v,j)=>mod(v+B[i][j])));
const mul=(A,B)=>A.map((row)=>B[0].map((_,j)=>mod(row.reduce((sum,a,k)=>sum+a*B[k][j],0))));
const eq=(A,B)=>assert.deepEqual(A,B);
const vecMul=(M,v)=>M.map((row)=>mod(row.reduce((sum,a,j)=>sum+a*v[j],0)));
const rank=(M)=>{
  const A=M.map((row)=>row.map(mod)),m=A.length,n=A[0].length;
  let q=0;
  for(let c=0;c<n && q<m;c++){
    const pivot=A.findIndex((row,i)=>i>=q && row[c]!==0);
    if(pivot<0)continue;
    [A[q],A[pivot]]=[A[pivot],A[q]];
    const k=inverse(A[q][c]);
    A[q]=A[q].map((v)=>mod(v*k));
    for(let r=0;r<m;r++){
      if(r===q)continue;
      const mult=A[r][c];
      A[r]=A[r].map((v,j)=>mod(v-mult*A[q][j]));
    }
    q++;
  }
  return q;
};
/** @returns {number[]} coefficients in high-to-low order */
function characteristic(M){
  const n=M.length, trace=[],coeff=[1];let power=I(n);
  for(let k=1;k<=n;k++){
    power=mul(power,M);
    trace.push(mod(power.reduce((sum,row,i)=>sum+row[i],0)));
    let total=0;
    for(let j=1;j<=k;j++)total+=coeff[k-j]*trace[j-1];
    coeff.push(mod(-total*inverse(k)));
  }
  return coeff;
}
function polyProduct(a,b){
  const out=Array(a.length+b.length-1).fill(0);
  for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)out[i+j]=mod(out[i+j]+a[i]*b[j]);
  return out;
}
const A=matrices[0].map((row)=>row.map(mod));
const char=characteristic(A);
assert.deepEqual(char,[1,5,17,27,27,19]);
let factor=[1];
for(const polynomial of [[1,5],[1,3],[1,26],[1,0,26]])factor=polyProduct(factor,polynomial);
assert.deepEqual(factor,char); // (x+5)(x+3)(x-3)(x^2-3) over GF29

const glyphToIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const splitWords=(source)=>source.split(/[-.]/).map((token)=>
  [...token].filter((rune)=>glyphToIndex.has(rune))
).filter((word)=>word.length);
const p7red = ink.pages.find((p)=>p.page===7).red_spans[0];
const p8red = ink.pages.find((p)=>p.page===8).red_spans[0];
assert.deepEqual([p7red.start,p7red.length,p8red.start,p8red.length],[194,14,0,12]);
const originalP7Words = splitWords(pages[7].split('&')[1]);
const originalP8Words = splitWords(pages[8].slice(0,pages[8].indexOf('.')+1));
assert.equal(originalP7Words.length,5);
assert.equal(originalP8Words.length,2);
assert.equal(originalP7Words.flat().join(''),p7red.runes);
assert.equal(originalP8Words.flat().join(''),p8red.runes);
const wordProduct=(word)=>word.reduce((acc,rune)=>mod(acc*glyphToIndex.get(rune)),1);
const coeff=originalP7Words.map(wordProduct);
const fixedRoots=originalP8Words.map(wordProduct);
assert.deepEqual(coeff,[11,26,8,15,2]);
assert.deepEqual(fixedRoots,[4,3]);
function polyValue(coeffs,x){
  return coeffs.reduceRight((sum,a)=>mod(sum*x+a),0);
}
for(let x=0;x<29;x++){
  const source=mod(polyValue(coeff,x)-x);
  const expanded=mod(2*(x-3)*(x-4)*(x*x-8));
  assert.equal(source,expanded);
}
assert.equal(mod(3*inverse(4)),8);
assert.equal(inverse(2),15);

// A's quadratic eigenfactor x²−3 matches p7's x²−8 after dividing A by 2.
const R=scale(A,inverse(2));
const I5=I(5),R2=mul(R,R);
const F=scale(mul(mul(add(R,scale(I5,-3)),add(R,scale(I5,-4))),add(R2,scale(I5,-8))),2);
let Rp=I5,Pmatrix=zero(5);
for(const k of coeff){
  Pmatrix=add(Pmatrix,scale(Rp,k));
  Rp=mul(Rp,R);
}
Pmatrix=add(Pmatrix,scale(R,-1));
eq(F,Pmatrix);
assert.equal(rank(F),3); // exact two-dimensional fixed subspace

// Canonical spectral projector onto A²=3, where p7's scaled fixed roots live.
const A2=mul(A,A);
const projector=scale(mul(add(A2,scale(I5,-25)),add(A2,scale(I5,-9))),20);
eq(mul(projector,projector),projector);
assert.equal(rank(projector),2);
eq(mul(F,projector),zero(5));
assert.deepEqual(projector,[
  [9,23,23,23,9],
  [23,9,23,9,23],
  [23,23,24,23,23],
  [23,9,23,9,23],
  [9,23,23,23,9],
]);

// p8 has 12 actual red + 243 black runes, exactly 255=51*5.
const p8=corpus.pages.find((p)=>p.page===8).indices;
assert.equal(p8.length,255);
assert.deepEqual(p8.slice(0,12),[...p8red.runes].map((r)=>glyphToIndex.get(r)));
assert.equal(rank(fixedRoots.map((r)=>projector[r])),2);
function extract(input){
  assert.equal(input.length%5,0);
  const result=[];
  for(let i=0;i<input.length;i+=5){
    const projected=vecMul(projector,input.slice(i,i+5));
    for(const position of fixedRoots)result.push(projected[position]);
  }
  return result;
}
const output=extract(p8);
assert.equal(output.length,102);
const ioc=(data)=>{
  const count=Array(29).fill(0);
  for(const value of data)count[value]++;
  return count.reduce((sum,v)=>sum+v*(v-1),0)/(data.length*(data.length-1));
};
assert(Math.abs(ioc(output)-0.0364977674238012)<1e-13);
assert(Math.abs(ioc(p8)-0.03427512737378416)<1e-13);

// Exact authentic-source plaintext plant: the 2x5 map has a fixed right inverse.
const solved=corpus.pages.find((p)=>p.page===57).indices;
assert.equal(solved.length,95);
const plant=Array.from({length:102},(_,i)=>solved[i%solved.length]);
const E0=projector[fixedRoots[0]],E1=projector[fixedRoots[1]];
const [a,b,c,d]=[E0[0],E0[1],E1[0],E1[1]];
const det=mod(a*d-b*c),detInv=inverse(det);
assert.equal(det,16);
const packed=[];
for(let i=0;i<plant.length;i+=2){
  const y=plant.slice(i,i+2);
  packed.push(
    mod(detInv*(d*y[0]-b*y[1])),
    mod(detInv*(-c*y[0]+a*y[1])),
    0,0,0
  );
}
assert.deepEqual(extract(packed),plant);
console.log('PASS source_GP29_p7red_products='+coeff+' p8_title_products='+fixedRoots);
console.log('PASS exact_2014_square_charpoly='+char+' factored_(x+5)(x+3)(x-3)(x2-3)');
console.log('PASS p7_fixedpoint_factor=2(x-3)(x-4)(x2-8), 8=3/4 mod29');
console.log('PASS scaled_historic_square_quadratic_fixedspace_rank=2 projector_is_idempotent');
console.log('PASS original_p8=255 native_runic_symbols extracted_register=102, positive_plant=102/102');
console.log('SOURCE: GP29 original p8 IoC='+ioc(p8).toFixed(12));
console.log('EXTRACTED: GP29 rank2 image IoC='+ioc(output).toFixed(12));
console.log('EXTRACTED full GP spelling='+output.map((rune)=>corpus.translit[rune]).join(''));
console.log('RESULT: source-selected projection is a mathematical 2/5 extraction, no authenticated unknown p8 plaintext; output is ciphertext-like.');
