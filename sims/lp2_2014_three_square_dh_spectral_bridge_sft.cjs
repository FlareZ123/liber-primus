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
assert.deepEqual([gFromSum,aFromSums,gFromDet,AFromGAndA,KFromB], [5,6,5,8,2]);
assert.equal(determinants[1],KFromB);assert.equal(determinants[0],mod(gFromSum*KFromB));
assert.equal(mod(-gFromSum),24);
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
assert.equal(corpus.pages.find(p=>p.page===8).indices.slice(0,3).map(i=>corpus.translit[i]).join(''),'XIX');
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
console.log(JSON.stringify({status:'PASS',sources:['resources/cicada2014-openpuff-magic-squares.txt','resources/liber-primus/lp2-corpus.json'],modulus:q,expectedSums,determinants,eigenRoots,characteristicPolynomials,commonGcdAscending:common,commonOf1033SquaresAscending:pair1033,sourceOnly:gFromSum===gFromDet?{gFromSum,gFromDet,aFromSums,firstDetAsGTimesSecond:mod(gFromSum*determinants[1]),thirdDet:determinants[2],sharedEigenvalue:24}:null,borrowedExternalChecks:{p15Prime:borrowedDhPrime,p8RomanB:borrowedRomanB,AFromGAndA,KFromB},columnDiagnostics,classification:'exact arithmetic, unselected eigen/determinant opcode, no unknown LP2 plaintext'},null,2));
