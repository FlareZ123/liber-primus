"use strict";
/** Exact GF29 intersection of the p32 11x11 rune matrix and original 256-byte table.
 *  Node 22: node sims/p32_grid_common_eigen_gate.cjs
 *  Source-fixed finite calculations, not an LP2 decryption.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const json=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const corpus=json("resources/liber-primus/lp2-corpus.json");
const grid=json("resources/liber-primus/lp2-grid-256.json");
const n=11,p=29,mod=x=>((x%p)+p)%p;
function inv(x){for(let i=1;i<p;i++)if(mod(x*i)===1)return i;throw Error("zero pivot");}
const eye=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>+(i===j)));
function mul(a,b){return a.map(row=>row.map((_,j)=>mod(row.reduce((s,x,k)=>s+x*b[k][j],0))));}
function charpoly(a){
  let b=eye,coef=[1];
  for(let k=1;k<=n;k++){
    b=mul(a,b);
    const c=mod(-b.reduce((s,row,i)=>s+row[i],0)*inv(k));
    coef.push(c);
    b=b.map((row,i)=>row.map((x,j)=>mod(x+(i===j?c:0))));
  }
  return coef.reverse();
}
function trim(a){let n=a.length;while(n>1&&a[n-1]===0)n--;return a.slice(0,n);}
function rem(a,b){
  let r=trim(a),f=trim(b);
  while(r.length>=f.length&&r.some(Boolean)){
    const delta=r.length-f.length,m=mod(r.at(-1)*inv(f.at(-1)));
    for(let i=0;i<f.length;i++)r[i+delta]=mod(r[i+delta]-m*f[i]);
    r=trim(r);
  }
  return r;
}
function gcd(a,b){
  let x=trim(a),y=trim(b);
  while(y.some(Boolean))[x,y]=[y,rem(x,y)];
  const k=inv(x.at(-1));return x.map(v=>mod(v*k));
}
function evalPoly(a,x){return a.reduceRight((s,c)=>mod(s*x+c),0);}
function kernel(a,lambda){
  const m=a.map((row,i)=>row.map((x,j)=>mod(x-(i===j?lambda:0))));
  let rank=0,pivots=[];
  for(let j=0;j<n;j++){
    let i=rank;
    while(i<n&&!m[i][j])i++;
    if(i===n)continue;
    [m[rank],m[i]]=[m[i],m[rank]];
    const k=inv(m[rank][j]);
    for(let h=0;h<n;h++)m[rank][h]=mod(m[rank][h]*k);
    for(let r=0;r<n;r++)if(r!==rank){
      const f=m[r][j];
      for(let h=0;h<n;h++)m[r][h]=mod(m[r][h]-f*m[rank][h]);
    }
    pivots.push(j);rank++;
  }
  assert.equal(rank,10);
  const f=Array.from({length:n},(_,i)=>i).find(i=>!pivots.includes(i));
  const v=Array(n).fill(0);v[f]=1;
  for(let i=rank-1;i>=0;i--)
    v[pivots[i]]=mod(-m[i].reduce((s,x,j)=>s+x*v[j],0));
  assert.deepEqual(a.map(row=>mod(row.reduce((s,x,j)=>s+x*v[j],0))),v.map(x=>mod(x*lambda)));
  return v;
}
function ioc(a){const f=Array(p).fill(0);for(const x of a)f[x]++;return f.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1));}
const original=corpus.pages.find(x=>x.page===32).indices;
assert.equal(original.length,121);
assert.equal(grid.bytes.length,256);
const A=Array.from({length:n},(_,i)=>original.slice(i*n,(i+1)*n));
const B=A.map(row=>row.map(v=>corpus.prime[v]%p));
const ca=charpoly(A),cb=charpoly(B);
const P=grid.bytes.map(v=>v%p).reverse(); // original table is DESCENDING coefficients
assert.deepEqual(ca,[21,26,22,18,27,10,0,28,19,8,26,1]);
assert.deepEqual(cb,[8,13,28,6,20,5,19,16,2,9,3,1]);
assert.deepEqual(Array.from({length:p},(_,i)=>i).filter(v=>!evalPoly(ca,v)),[24,25]);
assert.equal(evalPoly(P,24),0);
assert.deepEqual(gcd(ca,P),[5,1]); // X+5, equivalent to X-24 mod29
assert.deepEqual(gcd(cb,P),[1]);
const v=kernel(A,24);
const left=kernel(A[0].map((_,j)=>A.map(row=>row[j])),24);
assert.deepEqual(v,[13,3,26,3,2,8,12,3,26,21,1]);
assert.deepEqual(left,[2,23,27,4,26,9,20,22,2,9,1]);
const pages=corpus.pages.filter(x=>x.status==="unsolved"&&x.indices?.length).map(x=>x.indices);
const all=pages.flat();
assert.equal(all.length,12956);
const candidates=[];
for(const clock of ["book","page"])for(const sign of [-1,1]){
  const out=clock==="book"
    ?all.map((x,i)=>mod(x+sign*v[i%n]))
    :pages.flatMap(page=>page.map((x,i)=>mod(x+sign*v[i%n])));
  candidates.push({clock,sign,ioc:ioc(out)});
}
console.log(JSON.stringify({source:"p32 ordinal 11x11 and original grid GF29",
  commonFactor:[5,1],eigenvalues:[24,25],rightEigenvector:v,
  leftEigenvector:left,originalIoC:ioc(all),directKeyScreens:candidates,
  conclusion:"exact source algebra; no original LP2 plaintext"},null,2));
