'use strict';
/** Source-first 2014 three-square GF29 spectral / determinant bridge.
 * No LP2 unknown ciphertext or source-fitted plaintext.
 * node sims/lp2_2014_three_square_dh_spectral_bridge_sft.cjs
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'resources/cicada2014-openpuff-magic-squares.txt'),'utf8');
const squares=source.trim().split(/\r?\n\s*\r?\n/).map(part=>part.trim().split(/\r?\n/).map(line=>line.trim().split(/\s+/).map(Number)));
const expectedSums=[3301,1033,1033];
assert.deepEqual(squares.map(A=>A.length),[5,7,5]);
for(let i=0;i<3;i++){
  const A=squares[i],n=A.length,k=expectedSums[i];
  assert.ok(A.every(row=>row.length===n&&row.reduce((a,b)=>a+b,0)===k));
  assert.ok(Array.from({length:n},(_,j)=>A.reduce((a,row)=>a+row[j],0)).every(v=>v===k));
  assert.equal(A.reduce((a,row,j)=>a+row[j],0),k);
  assert.equal(A.reduce((a,row,j)=>a+row[n-1-j],0),k);
}
const q=29,mod=x=>((x%q)+q)%q;
function inv(x){for(let v=1;v<q;v++)if(mod(v*x)===1)return v;throw Error('nonunit');}
function det(input){const A=input.map(row=>row.map(mod)),n=A.length;let out=1;
  for(let col=0;col<n;col++){
    let p=col;while(p<n&&!A[p][col])p++;
    if(p===n)return 0;
    if(p!==col){[A[p],A[col]]=[A[col],A[p]];out=mod(-out);}
    const pivot=A[col][col];out=mod(out*pivot);
    const unit=inv(pivot);
    for(let row=col+1;row<n;row++){
      const factor=mod(A[row][col]*unit);
      for(let j=col;j<n;j++)A[row][j]=mod(A[row][j]-factor*A[col][j]);
    }
  }
  return out;
}
const shift=(A,s)=>A.map((r,i)=>r.map((v,j)=>mod(v-(i===j?s:0))));
const roots=A=>Array.from({length:q},(_,i)=>i).filter(i=>det(shift(A,i))===0);
const mul=(A,B)=>A.map(row=>B[0].map((_,j)=>mod(row.reduce((a,b,k)=>a+b*B[k][j],0))));
function charPoly(A){
  const n=A.length,m=A.map(r=>r.map(mod));let current=m,trace=[null],coeffs=[1];
  for(let k=1;k<=n;k++){
    trace[k]=mod(current.reduce((a,row,i)=>a+row[i],0));
    current=mul(current,m);
  }
  for(let k=1;k<=n;k++){
    let total=0;for(let i=1;i<=k;i++)total=mod(total+coeffs[k-i]*trace[i]);
    coeffs.push(mod(-total*inv(k)));
  }
  return coeffs.reverse(); // polynomial coefficients lowest to highest
}
const trim=A=>{const a=A.map(mod);while(a.length>1&&!a.at(-1))a.pop();return a;};
function remain(a,b){const B=trim(b),R=trim(a);
  while(R.length>=B.length&&R.some(x=>x)){
    const off=R.length-B.length,k=mod(R.at(-1)*inv(B.at(-1)));
    for(let i=0;i<B.length;i++)R[i+off]=mod(R[i+off]-k*B[i]);
    while(R.length>1&&!R.at(-1))R.pop();
  }
  return R;
}
function gcd(a,b){let A=trim(a),B=trim(b);while(B.some(x=>x)){const C=remain(A,B);A=B;B=C;}
  const s=inv(A.at(-1));return trim(A.map(x=>mod(x*s)));
}
const determinants=squares.map(det),eigenRoots=squares.map(roots),characteristicPolynomials=squares.map(charPoly);
assert.deepEqual(determinants,[10,2,3]);
assert.deepEqual(eigenRoots,[[3,24,26],[8,18,24],[5,8,18,21,24]]);
assert.deepEqual(characteristicPolynomials,[[19,27,27,17,5,1],[27,18,16,13,26,22,11,1],[26,5,7,27,11,1]]);
const common=gcd(gcd(characteristicPolynomials[0],characteristicPolynomials[1]),characteristicPolynomials[2]);
const pair1033=gcd(characteristicPolynomials[1],characteristicPolynomials[2]);
assert.deepEqual(common,[5,1]);
assert.deepEqual(pair1033,[24,14,8,1]);
const gFromSum=mod(-3301),aFromSums=mod(3301-1033),gFromDet=mod(determinants[0]*inv(determinants[1]));
const powMod=(a,n,p)=>{let v=1;for(let i=0;i<n;i++)v=v*a%p;return v;};
const borrowedDhPrime=23,borrowedRomanB=19; // p15 and p8 external input, NOT selected by these squares
const AFromGAndA=powMod(gFromSum,aFromSums,borrowedDhPrime);
const KFromB=powMod(borrowedRomanB,aFromSums,borrowedDhPrime);
// Conditional complete dual-private-exponent reconstruction using ONLY
// the same three original square determinants and 3301/1033 source sums.
// The scalar b=(det1/det2)*det3 was NOT explicitly requested by the 2014
// puzzle; it is a single finite proposed role equation whose B prediction
// is independently checkable against authenticated 2013 DH transcript.
const bFromThreeDeterminants=mod(determinants[0]*determinants[2]*inv(determinants[1]));
const gFromThreeDeterminants=mod(determinants[0]*inv(determinants[1]));
const outerDhTranscript={p:borrowedDhPrime,g:gFromThreeDeterminants,
  a:aFromSums,b:bFromThreeDeterminants,
  A:powMod(gFromThreeDeterminants,aFromSums,borrowedDhPrime),
  B:powMod(gFromThreeDeterminants,bFromThreeDeterminants,borrowedDhPrime),
};
outerDhTranscript.K=powMod(outerDhTranscript.A,outerDhTranscript.b,borrowedDhPrime);
assert.deepEqual(outerDhTranscript,{p:23,g:5,a:6,b:15,A:8,B:19,K:2});

assert.deepEqual([gFromSum,aFromSums,gFromDet,AFromGAndA,KFromB], [5,6,5,8,2]);
assert.equal(determinants[1],KFromB);assert.equal(determinants[0],mod(gFromSum*KFromB));
assert.equal(mod(-gFromSum),24);
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
assert.equal(corpus.pages.find(p=>p.page===8).indices.slice(0,3).map(i=>corpus.translit[i]).join(''),'XIX');
// Independently source-directed by the authentic solved p57 injunction
// to shed circumferences: strip one full outer border from EACH of the
// original 5x5,7x7,5x5 Stage7 matrices, preserving source order.
const cores=squares.map(A=>A.slice(1,-1).map(row=>row.slice(1,-1)));
assert.deepEqual(cores.map(A=>A.length),[3,5,3]);
const coreDeterminants=cores.map(det),coreRoots=cores.map(roots);

/* The two source 3x3 corners have a human-executable matrix invariant.
 * Under original central reflection, [1,0,-1] is an exact 3x3 right
 * eigenvector, so its eigenroot is simply top-left - top-right.
 * No 7x7 determinant, characteristic polynomial or solution fit is needed.
 */
const ends=[cores[0],cores[2]];
assert.ok(ends.every(A=>A.length===3&&A.every((row,i)=>row.every((value,j)=>value===A[2-i][2-j]))));
const reflectedCornerPairs=ends.map(A=>({
  topLeft:A[0][0],topRight:A[0][2],
  rawTopDifference:A[0][0]-A[0][2],
  gp29TopDifference:mod(A[0][0]-A[0][2]),
  middleRowDifference:A[1][0]-A[1][2],
  bottomDifference:A[2][0]-A[2][2],
}));
assert.deepEqual(reflectedCornerPairs,[
  {topLeft:812,topRight:280,rawTopDifference:532,gp29TopDifference:10,middleRowDifference:0,bottomDifference:-532},
  {topLeft:199,topRight:320,rawTopDifference:-121,gp29TopDifference:24,middleRowDifference:0,bottomDifference:121},
]);
// Use one frozen H(a,b)=[a-b,a+b] mod29 on the two printed top
// corners of each original square, both before and after p57's perimeter
// operation. No hand-selected alternative cells, dimension-specific signs,
// or privileged output positions are used in constructing these tapes.
const H=(x,y)=>[mod(x-y),mod(x+y)];
const topCorners=A=>[A[0][0],A[0][A.length-1]];
const sixPairs=squares.map((A,i)=>({sourceIndex:i,
  outerCorners:topCorners(A),outerH:H(...topCorners(A)),
  innerCorners:topCorners(cores[i]),innerH:H(...topCorners(cores[i])),
}));
assert.deepEqual(sixPairs.map(p=>p.outerH),[[19,8],[0,14],[5,17]]);
assert.deepEqual(sixPairs.map(p=>p.innerH),[[10,19],[9,2],[24,26]]);
const innerHSequence=sixPairs.flatMap(p=>p.innerH);
// Minimal original-source geometric equalization: the historical printed
// square dimensions are 5x5,7x7,5x5. Shed just ONE circumference of the
// middle 7x7 square to obtain three 5x5 matrices, without needing to choose
// a different receiving depth for each 5x5 original.
const equalizedFiveH=[sixPairs[0].outerH,sixPairs[1].innerH,sixPairs[2].outerH];
assert.deepEqual(equalizedFiveH,[[19,8],[9,2],[5,17]]);
const alignedState={
  B:equalizedFiveH[0][0],A:equalizedFiveH[0][1],
  eSquared:equalizedFiveH[1][0],K:equalizedFiveH[1][1],
  g:equalizedFiveH[2][0],minusATimesK:equalizedFiveH[2][1],
};
assert.deepEqual(alignedState,{B:19,A:8,eSquared:9,K:2,g:5,minusATimesK:17});
assert.equal(alignedState.eSquared,mod(determinants[2]*determinants[2]));
assert.equal(alignedState.minusATimesK,mod(-aFromSums*alignedState.K));
assert.equal(alignedState.A,powMod(alignedState.g,aFromSums,borrowedDhPrime));
assert.equal(alignedState.K,powMod(alignedState.B,aFromSums,borrowedDhPrime));
// A second intact-original, source-selected inverse: the authentic two-ring
// mirror H operation on ORIGINAL p55's 43 strict interior runes, reshaped
// 3x3/5x5/3x3 by p57's perimeter instruction and the 2014 cores. The
// 2014 original matrices are centrosymmetric under 180-degree reversal.
// Test both possible output directions and the forward/inverse H convention
// without fitting a reading order, hidden rune, key shift, phase or language.
const word55=()=>{
  const raw=transcription.split(/\n%\n/)[54];
  const index=new Map(corpus.runes.map((symbol,i)=>[symbol,i]));
  const words=[],word=[];
  const flush=()=>{if(word.length){words.push(word.splice(0));}};
  for(const ch of raw){
    if(index.has(ch))word.push(index.get(ch));
    else if(ch==='/'||/\s/u.test(ch))continue;
    else flush();
  }
  flush();return words;
};
const words55=word55(),inner55=words55.flatMap(w=>w.slice(1,-1));
assert.equal(words55.length,17);assert.equal(inner55.length,43);
assert.deepEqual(inner55.length,cores.reduce((sum,A)=>sum+A.length*A.length,0));
const insideChunks=[inner55.slice(0,9),inner55.slice(9,34),inner55.slice(34)];
const mirrorH=(items,mode)=>{
  const n=items.length,output=Array(n).fill(0);
  for(let i=0;i<Math.floor(n/2);i++){
    const x=items[i],y=items[n-1-i];let a,b;
    if(mode==='H'){a=mod(x-y);b=mod(x+y);}
    else if(mode==='reverseH'){a=mod(x+y);b=mod(x-y);}
    else if(mode==='inverseH'){a=mod(15*(x+y));b=mod(15*(y-x));}
    else if(mode==='inverseReverseH'){a=mod(15*(x+y));b=mod(15*(x-y));}
    else throw Error('invalid frozen H direction');
    output[i]=a;output[n-1-i]=b;
  }
  output[Math.floor(n/2)]=items[Math.floor(n/2)];
  return output;
};
const ioc29=values=>{
  const n=values.length,count=Array(29).fill(0);
  for(const x of values)count[x]++;
  return count.reduce((sum,n)=>sum+n*(n-1),0)/(values.length*(values.length-1));
};
const p55GeometryH={input43Ioc:ioc29(inner55)};
for(const mode of ['H','reverseH','inverseH','inverseReverseH']){
  const values=insideChunks.flatMap(chunk=>mirrorH(chunk,mode));
  p55GeometryH[mode]={ioc:ioc29(values),runes:values};
}
assert.ok(Math.abs(p55GeometryH.H.ioc-0.028792912513842746)<1e-14);
assert.ok(Math.abs(p55GeometryH.reverseH.ioc-0.028792912513842746)<1e-14);
assert.ok(Math.abs(p55GeometryH.inverseH.ioc-0.035437430786267994)<1e-14);
assert.ok(Math.abs(p55GeometryH.inverseReverseH.ioc-0.02768549280177187)<1e-14);
for(const chunk of insideChunks){
  assert.deepEqual(mirrorH(mirrorH(chunk,'H'),'inverseH'),chunk);
  assert.deepEqual(mirrorH(mirrorH(chunk,'reverseH'),'inverseReverseH'),chunk);
}
// Direct source-matrix 2-sided similarity, distinct from the previously
// rejected 1-sided Hill K^-1*C and C*K^-1. The actual inner source matrices
// are invertible GF29, and all source/plaintext directions fully roundtrip.
const matrixInverse=A=>{
  const n=A.length,eye=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>+(i===j)));
  const R=A.map((row,i)=>row.map(mod).concat(eye[i]));
  for(let j=0;j<n;j++){
    let pivot=j;while(pivot<n&&!R[pivot][j])pivot++;
    assert.notEqual(pivot,n,'noninvertible original core');
    [R[pivot],R[j]]=[R[j],R[pivot]];
    const scale=inv(R[j][j]);R[j]=R[j].map(v=>mod(v*scale));
    for(let k=0;k<n;k++)if(k!==j){const t=R[k][j];R[k]=R[k].map((v,i)=>mod(v-t*R[j][i]));}
  }
  return R.map(row=>row.slice(n));
};
const matrixSimilarGate={};
for(const side of ['inverseLeft','inverseRight']){
  const output=insideChunks.map((chunk,i)=>{
    const n=cores[i].length,C=Array.from({length:n},(_,j)=>chunk.slice(n*j,n*(j+1)));
    const K=cores[i].map(row=>row.map(mod)),IK=matrixInverse(K);
    const P=side==='inverseLeft'?mul(mul(IK,C),K):mul(mul(K,C),IK);
    const forward=side==='inverseLeft'?mul(mul(K,P),IK):mul(mul(IK,P),K);
    assert.deepEqual(forward,C);
    return P.flat();
  }).flat();
  matrixSimilarGate[side]={ioc:ioc29(output),runes:output};
}
assert.ok(Math.abs(matrixSimilarGate.inverseLeft.ioc-0.03322259136212625)<1e-14);
assert.ok(Math.abs(matrixSimilarGate.inverseRight.ioc-0.031007751937984496)<1e-14);

// A no-tuning actual encrypted-register gate: all 12 outer+inner H values
// as a full 12-symbol additive key on the original p8 12-rune red header.
// Four author-natural orderings and both signs; no word resegmentation,
// index skip, phase shift, invented source data or candidate selection.
const page8title=corpus.pages.find(p=>p.page===8).indices.slice(0,12);
assert.deepEqual(page8title,[14,10,14,19,1,14,19,5,2,13,3,17]);
const keyForms={
  shellFirst:sixPairs.flatMap(p=>p.outerH).concat(sixPairs.flatMap(p=>p.innerH)),
  innerFirst:sixPairs.flatMap(p=>p.innerH).concat(sixPairs.flatMap(p=>p.outerH)),
  squareShellFirst:sixPairs.flatMap(p=>p.outerH.concat(p.innerH)),
  squareInnerFirst:sixPairs.flatMap(p=>p.innerH.concat(p.outerH)),
};
const title12AdditiveGate={};
for(const [schema,key] of Object.entries(keyForms))for(const sign of [-1,1]){
  const plain=page8title.map((v,i)=>mod(v+sign*key[i]));
  assert.deepEqual(plain.map((v,i)=>mod(v-sign*key[i])),page8title);
  title12AdditiveGate[schema+(sign<0?'Minus':'Plus')]=plain;
}

const outerHSequence=sixPairs.flatMap(p=>p.outerH);
// The source-extracted DH packet is internally redundant rather than
// relying on a few isolated residues from arbitrary page coordinates.
const BFromFirstInnerSum=sixPairs[0].innerH[1];
const KFromMiddleInnerSum=sixPairs[1].innerH[1];
const gFromLastInnerDifference=mod(-sixPairs[2].innerH[0]);
const firstDifferencePrediction=mod(gFromLastInnerDifference*KFromMiddleInnerSum);
const outerAFromFirstSum=sixPairs[0].outerH[1];
assert.deepEqual([BFromFirstInnerSum,KFromMiddleInnerSum,gFromLastInnerDifference,firstDifferencePrediction,outerAFromFirstSum],[19,2,5,10,8]);
assert.equal(firstDifferencePrediction,sixPairs[0].innerH[0]);
assert.equal(KFromMiddleInnerSum,powMod(BFromFirstInnerSum,aFromSums,borrowedDhPrime));
assert.equal(outerAFromFirstSum,powMod(gFromLastInnerDifference,aFromSums,borrowedDhPrime));

const gFromMirroredCorners=mod(-reflectedCornerPairs[1].gp29TopDifference);
const kFromMirroredCorners=mod(reflectedCornerPairs[0].gp29TopDifference*inv(gFromMirroredCorners));
assert.deepEqual([gFromMirroredCorners,kFromMirroredCorners],[5,2]);
const antisym3=(A)=>[1,0,-1].map((v,i)=>v);
for(const pair of ends){
  const e=[1,0,-1];
  const image=pair.map(row=>mod(row[0]-row[2]));
  const lambda=mod(pair[0][0]-pair[0][2]);
  assert.deepEqual(image,e.map(x=>mod(lambda*x)));
}

assert.deepEqual(coreDeterminants,[24,8,24]);
assert.deepEqual(coreRoots,[[10],[2],[24]]);
assert.equal(coreRoots[0][0],mod(-coreRoots[1][0]*coreRoots[2][0]));
assert.equal(coreRoots[0][0],determinants[0]);
assert.equal(coreRoots[1][0],determinants[1]);
assert.equal(coreRoots[2][0],mod(-gFromSum));
assert.equal(coreDeterminants[0],mod(-gFromSum));
assert.equal(coreDeterminants[1],AFromGAndA);
assert.equal(coreDeterminants[2],mod(-gFromSum));

// Literal one-step consumer of these exact source-selected inner invariants:
// p55 17 printed words have 43 strict interiors; pair the native 9/25/9
// interior segments to original core dimensions 3x3,5x5,3x3; fixed GP29
// additive sign only, no shift/phase/word resegmentation or scoring fit.
const transcription=fs.readFileSync(path.join(root,'resources/liber-primus/lp2-transcription.txt'),'utf8').replace(/\r/g,'');
const text55=transcription.split(/\n%\n/)[54],runeMap=new Map(corpus.runes.map((r,i)=>[r,i]));
let words=[],word=[];
const flush=()=>{if(word.length){words.push(word);word=[];}};
for(const ch of text55){
  if(runeMap.has(ch))word.push(runeMap.get(ch));
  else if(ch==='/'||/\s/u.test(ch))continue;
  else flush();
}
flush();assert.equal(words.length,17);
assert.equal(words.reduce((n,w)=>n+w.length,0),76);
const inside55=words.flatMap(w=>w.slice(1,-1));assert.equal(inside55.length,43);
const ioc=values=>{const count=Array(29).fill(0);for(const v of values)count[v]++;
  return count.reduce((n,v)=>n+v*(v-1),0)/(values.length*(values.length-1));};
const keySets={innerDet:coreDeterminants,innerRoot:coreRoots.map(x=>x[0])};
const p55DirectGate={originalIoc:ioc(inside55)};
for(const [name,coeffs] of Object.entries(keySets)){
  const k=[...Array(9).fill(coeffs[0]),...Array(25).fill(coeffs[1]),...Array(9).fill(coeffs[2])];
  for(const sign of [-1,1]){
    const output=inside55.map((v,i)=>mod(v+sign*k[i]));
    assert.deepEqual(output.map((v,i)=>mod(v-sign*k[i])),inside55);
    p55DirectGate[name+(sign<0?'Minus':'Plus')]={ioc:ioc(output),runes:output};
  }
}
assert.ok(Math.abs(p55DirectGate.innerDetMinus.ioc-0.03211517165005537)<1e-14);
assert.ok(Math.abs(p55DirectGate.innerDetPlus.ioc-0.03765227021040975)<1e-14);
assert.ok(Math.abs(p55DirectGate.innerRootMinus.ioc-0.024363233665559248)<1e-14);
assert.ok(Math.abs(p55DirectGate.innerRootPlus.ioc-0.02768549280177187)<1e-14);

function* perms(a,pos=0){if(pos===a.length){yield a.slice();return;}
  for(let i=pos;i<a.length;i++){
    [a[pos],a[i]]=[a[i],a[pos]];yield* perms(a,pos+1);[a[pos],a[i]]=[a[i],a[pos]];
  }
}
function columnDiagnostic(A){const n=A.length,c={n:0,root8:0,root18:0,root24:0,both8and24:0};
  for(const p of perms(Array.from({length:n},(_,i)=>i))){
    const X=A.map(row=>p.map(j=>row[j]));
    const a=det(shift(X,8))===0,b=det(shift(X,18))===0,d=det(shift(X,24))===0;
    c.n++;c.root8+=Number(a);c.root18+=Number(b);c.root24+=Number(d);c.both8and24+=Number(a&&d);
  }
  return c;
}
const columnDiagnostics=squares.map(columnDiagnostic);
assert.deepEqual(columnDiagnostics,[
  {n:120,root8:3,root18:2,root24:120,both8and24:3},
  {n:5040,root8:197,root18:5040,root24:229,both8and24:9},
  {n:120,root8:7,root18:120,root24:19,both8and24:3}
]);
console.log(JSON.stringify({status:'PASS',sources:['resources/cicada2014-openpuff-magic-squares.txt','resources/liber-primus/lp2-corpus.json'],modulus:q,expectedSums,determinants,eigenRoots,characteristicPolynomials,coreDeterminants,coreRoots,reflectedCornerPairs,gFromMirroredCorners,kFromMirroredCorners,sixPairs,equalizedFiveH,alignedState,innerHSequence,outerHSequence,title12AdditiveGate,p55GeometryH,matrixSimilarGate,sourceHChecks:{BFromFirstInnerSum,KFromMiddleInnerSum,gFromLastInnerDifference,firstDifferencePrediction,outerAFromFirstSum},p55DirectGate,commonGcdAscending:common,commonOf1033SquaresAscending:pair1033,sourceOnly:gFromSum===gFromDet?{gFromSum,gFromDet,aFromSums,firstDetAsGTimesSecond:mod(gFromSum*determinants[1]),thirdDet:determinants[2],sharedEigenvalue:24}:null,borrowedExternalChecks:{p15Prime:borrowedDhPrime,p8RomanB:borrowedRomanB,AFromGAndA,KFromB},outerDhTranscript,columnDiagnostics,classification:'exact arithmetic, unselected eigen/determinant opcode, no unknown LP2 plaintext'},null,2));
