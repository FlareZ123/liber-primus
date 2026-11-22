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

// Source-only five-red-word projection, tested before consuming p8 ciphertext.
const projectedCoeffs=vecMul(projector,coeff);
assert.deepEqual(projectedCoeffs,[26,11,13,11,26]);
assert(ink.pages.find((p)=>p.page===7).large_punctuation.some(
  (mark)=>mark[0]===208 && mark[1]===13 && mark[2]==='red'
));
const sourceKey=fixedRoots.map((root)=>projectedCoeffs[root]);
assert.deepEqual(sourceKey,[26,11]);

// Charge the exact post-observation palindromic/midpoint pattern against
// all complete five-word windows, not only the visually highlighted red one.
const continuous=pages.slice(0,55).join('%');
const textWords=[]; let current='';
const complete=()=>{if(current){textWords.push(current);current='';}};
for(const character of continuous){
  if(glyphToIndex.has(character)) current+=character;
  else if(character==='%'||character==='/'||/\s/u.test(character)){}
  else complete();
}
complete();
assert.equal(textWords.length,2896);
assert.equal(textWords.reduce((sum,w)=>sum+[...w].length,0),12956);
const products=textWords.map((word)=>wordProduct([...word]));
const twoMatch=[],threeMatch=[],center13=[];
for(let i=0;i+5<=products.length;i++){
  const v=products.slice(i,i+5),result=vecMul(projector,v);
  const reverseFirstTwo=result[4]===v[1]&&result[3]===v[0];
  if(reverseFirstTwo)twoMatch.push(i);
  if(result[2]===13)center13.push(i);
  if(reverseFirstTwo&&result[2]===13)threeMatch.push(i);
}
assert.deepEqual(twoMatch,[408,2309]);
assert.deepEqual(threeMatch,[408]);
assert.equal(center13.length,87);
assert.deepEqual(products.slice(408,413),coeff);

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

// The newly identified author-source-only two-value key also admits a direct
// exact historical GP29-Vigenere candidate on the adjacent entire/red-free p8.
const vigenereSourceResults=[];
for(const [keyName,key] of [
  ['two-selected-coordinates',sourceKey],
  ['five-projected-products',projectedCoeffs]
]){
  for(const [label,original] of [
    ['p8-complete255',p8],
    ['p8-black243',p8.slice(12)]
  ]){
    for(const sign of [-1,1]){
      const recovered=original.map((rune,i)=>mod(rune+sign*key[i%key.length]));
      assert.deepEqual(recovered.map((rune,i)=>mod(rune-sign*key[i%key.length])),original);
      const native=Array.from({length:original.length},(_,i)=>
        corpus.pages.find((p)=>p.page===57).indices[i%95]
      );
      const plantedCipher=native.map((rune,i)=>mod(rune-sign*key[i%key.length]));
      assert.deepEqual(plantedCipher.map((rune,i)=>mod(rune+sign*key[i%key.length])),native);
      vigenereSourceResults.push({keyName,label,sign,ioc:ioc(recovered),opening:recovered.slice(0,100).map(x=>corpus.translit[x]).join('')});
    }
  }
}
assert.deepEqual(vigenereSourceResults.map((r)=>Number(r.ioc.toFixed(12))),[
  0.034892697236,0.033441408059,0.035098459341,0.033465972860,
  0.033410529566,0.033503165046,0.033772064075,0.033465972860
]);

// The same two selected rows plus the three complementary projector rows
// form a canonical full 5x5 reversible change of source coordinates.
const K=add(I5,scale(projector,-1));
assert.equal(rank(K),3);
const completeBasis=fixedRoots.map((position)=>projector[position]).concat(
  [0,1,2].map((position)=>K[position])
);
assert.equal(rank(completeBasis),5);
function matrixInverse(source){
  const n=source.length;
  const augmented=source.map((row,i)=>row.map(mod).concat(I(n)[i]));
  for(let column=0;column<n;column++){
    const pivot=augmented.findIndex((row,i)=>i>=column&&row[column]!==0);
    assert(pivot>=column);
    [augmented[column],augmented[pivot]]=[augmented[pivot],augmented[column]];
    const factor=inverse(augmented[column][column]);
    augmented[column]=augmented[column].map((value)=>mod(value*factor));
    for(let r=0;r<n;r++){
      if(r===column)continue;
      const multiplier=augmented[r][column];
      augmented[r]=augmented[r].map((value,k)=>mod(value-multiplier*augmented[column][k]));
    }
  }
  return augmented.map((row)=>row.slice(n));
}
const completeInverse=matrixInverse(completeBasis);
eq(mul(completeBasis,completeInverse),I5);
eq(mul(completeInverse,completeBasis),I5);
function applyBlocks(input,matrix){
  assert.equal(input.length%5,0);
  const result=[];
  for(let i=0;i<input.length;i+=5)result.push(...vecMul(matrix,input.slice(i,i+5)));
  return result;
}
// The direct polynomial evaluation F(A/2) is a second source-exact
// reversible candidate distinct from the rank-two projector and full T.
// Its determinant is exactly one modulo 29, not an assumed key.
const composedPolynomial=add(Pmatrix,R);
assert.deepEqual(composedPolynomial,[
  [15,6,7,12,10],
  [17,12,28,4,18],
  [19,16,9,16,19],
  [18,4,28,12,17],
  [10,12,7,6,15]
]);
const composedInverse=matrixInverse(composedPolynomial);
assert.deepEqual(composedInverse,[
  [0,28,17,21,10],
  [5,14,16,13,28],
  [4,0,10,0,4],
  [28,13,16,14,5],
  [10,21,17,28,0]
]);
eq(mul(composedPolynomial,composedInverse),I5);
eq(mul(composedInverse,composedPolynomial),I5);
const sourcePolynomialOrbit=[];

const sourceReceivers=[
  ['p8 complete (255)',p8],
  ['p3-p7 five-scroll (1145)',corpus.pages.filter((p)=>p.page>=3&&p.page<=7).flatMap((p)=>p.indices)],
  ['p33-p39 3301/1033 chapter (1680)',corpus.pages.filter((p)=>p.page>=33&&p.page<=39).flatMap((p)=>p.indices)],
];
const fullReceiverResults=[];
for(const [label,cipher] of sourceReceivers){
  const candidate=applyBlocks(cipher,completeBasis);
  assert.deepEqual(applyBlocks(candidate,completeInverse),cipher);
  const native=Array.from({length:cipher.length},(_,i)=>
    corpus.pages.find((p)=>p.page===57).indices[i%95]
  );
  assert.deepEqual(applyBlocks(applyBlocks(native,completeInverse),completeBasis),native);
  const first2=candidate.filter((_,i)=>i%5<2);
  const other3=candidate.filter((_,i)=>i%5>=2);
  fullReceiverResults.push({label,original: cipher.length,completeIoC:ioc(candidate),first2IoC:ioc(first2),other3IoC:ioc(other3),start:candidate.slice(0,75).map(x=>corpus.translit[x]).join('')});
}
// Two literal directions on each of the three complete original page
// registers. Neither changes input length or drops any original rune.
for(const [label,cipher] of sourceReceivers){
  const native=Array.from({length:cipher.length},(_,i)=>
    corpus.pages.find((p)=>p.page===57).indices[i%95]
  );
  for(const [direction,operator,opposite] of [
    ['polynomial-F',composedPolynomial,composedInverse],
    ['polynomial-F-inverse',composedInverse,composedPolynomial]
  ]){
    const recovered=applyBlocks(cipher,operator);
    assert.deepEqual(applyBlocks(recovered,opposite),cipher);
    assert.deepEqual(applyBlocks(applyBlocks(native,opposite),operator),native);
    sourcePolynomialOrbit.push({
      label,direction,ioc:ioc(recovered),
      opening:recovered.slice(0,75).map((rune)=>corpus.translit[rune]).join('')
    });
  }
}
assert.deepEqual(sourcePolynomialOrbit.map((v)=>Number(v.ioc.toFixed(12))),[
  0.032638567238,0.034614790798,
  0.034595535469,0.034374141143,
  0.034458577952,0.034287699594
]);

assert.deepEqual(fullReceiverResults.map((v)=>Number(v.completeIoC.toFixed(12))),[
  0.033317894087,0.034357345711,0.034450778525
]);
assert(Math.abs(fullReceiverResults[0].first2IoC-0.0364977674238012)<1e-12);
assert(Math.abs(fullReceiverResults[0].other3IoC-0.032593739250086)<1e-12);

// The first original 2014 A square also defines a period-56 source orbit.
// The five original red-word products and their proven source projection are
// two independent, entirely source-visible five-rune initial states. No seed fit.
const invHistorical=matrixInverse(A);
eq(mul(A,invHistorical),I5);
let powerHistorical=I5;
for(let step=0;step<56;step++)powerHistorical=mul(powerHistorical,A);
eq(powerHistorical,I5);
const orbitResults=[];
for(const [seedName,seed] of [
  ['five-original-red-word-products',coeff],
  ['five-projected-source-products',projectedCoeffs]
]){
  for(const [direction,operator] of [['forward',A],['inverse',invHistorical]]){
    let state=seed.slice(),keystream=[];
    for(let packet=0;packet<51;packet++){
      keystream.push(...state);
      state=vecMul(operator,state);
    }
    assert.equal(keystream.length,255);
    for(const sign of [-1,1]){
      const result=p8.map((rune,i)=>mod(rune+sign*keystream[i]));
      assert.deepEqual(result.map((rune,i)=>mod(rune-sign*keystream[i])),p8);
      const native=Array.from({length:255},(_,i)=>
        corpus.pages.find((p)=>p.page===57).indices[i%95]
      );
      const plant=native.map((rune,i)=>mod(rune-sign*keystream[i]));
      assert.deepEqual(plant.map((rune,i)=>mod(rune+sign*keystream[i])),native);
      orbitResults.push({seedName,direction,sign,ioc:ioc(result),opening:result.slice(0,80).map(r=>corpus.translit[r]).join('')});
    }
  }
}
assert.deepEqual(orbitResults.map((r)=>Number(r.ioc.toFixed(12))),[
  0.034614790798,0.035541145592,0.034645669291,0.034985332716,
  0.033750192991,0.033287015594,0.035016211209,0.034676547784
]);

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
console.log('PASS projected_p7_word_coefficients='+projectedCoeffs+' observed_trailing_marker13 source_key='+sourceKey);
console.log('PASS fiveword_windows=2892 two_reversal_hits='+twoMatch+' full_reversal_center13_hits='+threeMatch);
console.log('PASS original_p8_two_and_five_value_Vigenere_eight_roundtrips_and_eight_solved_native_plants');
for(const output of vigenereSourceResults)console.log('native_GP_attempt source_key='+output.keyName+' scope='+output.label+' sign='+output.sign+' IoC='+output.ioc.toFixed(12)+' opening='+output.opening);
console.log('PASS canonical_same-source full_5x5_basis source_selected_rows=[4,3]/[0,1,2] exact_3_full_original_roundtrips_and_3_native_GP_plants');
for(const res of fullReceiverResults)console.log('full-receiver='+res.label+' runes='+res.original+' IoC='+res.completeIoC.toFixed(12)+' two_component_IoC='+res.first2IoC.toFixed(12)+' three_component_IoC='+res.other3IoC.toFixed(12)+' start='+res.start);
console.log('PASS first_2014_A_square_order56 historical_5seed_orbit eight_original_p8_decoders_eight_native_positive_plants');
for(const r of orbitResults)console.log('source-A-orbit seed='+r.seedName+' direction='+r.direction+' sign='+r.sign+' IoC='+r.ioc.toFixed(12)+' original-opening='+r.opening);
console.log('PASS source_composed_full_polynomial_F(A_over_2) SL5_GF29 six_exact_original_roundtrips six_native_positive_plants');
for(const r of sourcePolynomialOrbit)console.log('full-source-polynomial receiver='+r.label+' direction='+r.direction+' GP29_IoC='+r.ioc.toFixed(12)+' opening='+r.opening);
console.log('SOURCE: GP29 original p8 IoC='+ioc(p8).toFixed(12));
console.log('EXTRACTED: GP29 rank2 image IoC='+ioc(output).toFixed(12));
console.log('EXTRACTED full GP spelling='+output.map((rune)=>corpus.translit[rune]).join(''));
console.log('RESULT: source-selected projection is a mathematical 2/5 extraction, no authenticated unknown p8 plaintext; output is ciphertext-like.');
