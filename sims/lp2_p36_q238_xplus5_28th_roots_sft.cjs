/**
 * Original LP2 p36 / source-table x+5 norm and exact 28th-root SFT.
 * Node.js 22, CommonJS, repository-relative inputs, no file writes.
 * Source polynomial factorization and gp29 mapping are fixed; no fitted keys.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(base,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const grid=JSON.parse(fs.readFileSync(path.join(base,'resources/liber-primus/base60-grid.json'),'utf8'));
const N=238, mod=x=>((x%29)+29)%29;
const one=[1,...Array(N-1).fill(0)];
const equal=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
/** @param {number[]} a @param {number[]} b */
function polynomialProduct(a,b){const c=Array(a.length+b.length-1).fill(0);for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)c[i+j]=mod(c[i+j]+a[i]*b[j]);return c;}
let g16=[1];
for(const f of [[5,1],[5,1],[11,18,1],[24,16,14,1],[11,15,0,9,1,5,10,20,12,1]])g16=polynomialProduct(g16,f);
assert.equal(g16.length,17);
const remain=grid.byte_rows.flat().reverse().map(x=>x%29);
const quotient=Array(N+1).fill(0);
for(let k=255;k>=16;k--){
 const v=remain[k];
 if(k===255){assert.equal(v,0);continue;}
 quotient[k-16]=v;
 for(let j=0;j<17;j++)remain[k-16+j]=mod(remain[k-16+j]-v*g16[j]);
}
assert.deepEqual(remain.slice(0,16),Array(16).fill(0));
assert.equal(quotient[N],28);
const Q=quotient.map(x=>mod(x*28));
assert.equal(Q[0],5);
assert.equal(Q[N],1);
/** @param {number[]} a @param {number[]} b */
function multiply(a,b){
 const c=new Int32Array(2*N-1);
 for(let i=0;i<N;i++)if(a[i])for(let j=0;j<N;j++)c[i+j]+=a[i]*b[j];
 for(let k=2*N-2;k>=N;k--){const v=mod(c[k]);if(v)for(let j=0;j<N;j++)c[k-N+j]=mod(c[k-N+j]-v*Q[j]);}
 return Array.from(c.slice(0,N),mod);
}
/** @param {number[]} a @param {bigint} exponent */
function power(a,exponent){
 let result=one,term=a;
 while(exponent){if(exponent&1n)result=multiply(result,term);exponent>>=1n;if(exponent)term=multiply(term,term);}
 return result;
}
function modInverse(a,m){
 let x=1n,y=0n,u=a,v=m;
 while(v){const q=u/v;[u,v]=[v,u-q*v];[x,y]=[y,x-q*y];}
 assert.equal(u,1n);
 return (x%m+m)%m;
}
const order=29n**238n-1n,n2=8n,n7=49n,nrest=order/(n2*n7);
assert.equal(order%(n2*n7),0n);
assert.equal(nrest%28n,3n);
function projection(value,subgroupOrder){
 const factor=order/subgroupOrder;
 return power(value,factor*modInverse(factor%subgroupOrder,subgroupOrder));
}
let gen2,gen7;
for(let k=0;k<29;k++){
 const z=[k,1,...Array(N-2).fill(0)];
 if(!gen2&&!equal(power(z,order/2n),one))gen2=projection(z,n2);
 if(!gen7&&!equal(power(z,order/7n),one))gen7=projection(z,n7);
 if(gen2&&gen7)break;
}
assert.ok(gen2&&gen7);
const twist=[5,1,...Array(N-2).fill(0)];
function linearNorm(k){
 let n=0;
 for(let j=N;j>=0;j--)n=mod(n*(-k)+Q[j]);
 return n;
}
assert.equal(linearNorm(5),2); // Norm(x+5)=Q(-5)
function divideByTwist(input){
 let atMinus5=0;
 for(let i=N-1;i>=0;i--)atMinus5=mod(atMinus5*(-5)+input[i]);
 const correction=mod(-atMinus5*15); // inv Norm(x+5)=inv 2=15
 const tmp=Array.from({length:N+1},(_,i)=>mod((input[i]||0)+correction*Q[i]));
 const out=Array(N).fill(0);
 for(let i=N;i>=1;i--){out[i-1]=tmp[i];tmp[i]=0;tmp[i-1]=mod(tmp[i-1]-5*out[i-1]);}
 assert.equal(tmp[0],0);
 assert.ok(equal(multiply(out,twist),input));
 return out;
}
function smallSubgroupRoots(generator,target,size){
 let z=one;const roots=[];
 for(let i=0;i<size;i++){if(equal(power(z,28n),target))roots.push(z);z=multiply(z,generator);}
 return roots;
}
function recoverAll28(input){
 const normalized=divideByTwist(input);
 const x2=projection(normalized,n2),x7=projection(normalized,n7),xr=projection(normalized,nrest);
 const r2=smallSubgroupRoots(gen2,x2,8);
 const r7=smallSubgroupRoots(gen7,x7,49);
 assert.equal(r2.length,4);
 assert.equal(r7.length,7);
 const rrest=power(xr,modInverse(28n,nrest));
 const roots=r2.flatMap(a=>r7.map(b=>multiply(rrest,multiply(a,b))));
 assert.equal(roots.length,28);
 for(const root of roots)assert.ok(equal(multiply(twist,power(root,28n)),input));
 return roots;
}
function stats(indices){
 const counts=Array(29).fill(0);
 for(const id of indices)counts[id]++;
 return {
  ioc:counts.reduce((s,v)=>s+v*(v-1),0)/(N*(N-1)),
  top12:counts.slice().sort((a,b)=>b-a).slice(0,12).reduce((s,v)=>s+v,0)/N
 };
}
const original=corpus.pages[36].indices;
assert.equal(original.length,N);
const sourceNorm=power(original,order/28n);
assert.ok(equal(sourceNorm,[2,...Array(N-1).fill(0)]),'already documented source norm 2');
const originalRoots=recoverAll28(original);
assert.ok(originalRoots.every(x=>stats(x).ioc===stats(originalRoots[0]).ioc),
 '29-scalar root-orbit must have invariant coincidence');
assert.equal(Number(stats(originalRoots[0]).ioc.toFixed(12)),0.035811793072);
const plant=Array.from({length:N},(_,i)=>corpus.pages[57].indices[i%95]);
const encrypted=multiply(twist,power(plant,28n));
const recovered=recoverAll28(encrypted);
assert.ok(recovered.some(r=>equal(r,plant)),'positive solved native-GP plant must be among 28 roots');
console.log(JSON.stringify({
 source:'original p36 238-rune ascending polynomial and pp49-51 GF29 field',
 Q238Constant:Q[0],NormOfXplus5:linearNorm(5),NormOfOriginalP36:sourceNorm[0],
 direct28thRootCount:originalRoots.length,positiveNativePlantRecovered:N,
 originalIoC:stats(original).ioc,allOriginalRootIoC:stats(originalRoots[0]).ioc,
 recoveredRunePreview:originalRoots[0].slice(0,75).map(i=>corpus.translit[i]).join(' '),
 allOriginalRootsReencrypt:true,
 verdict:'Exact source factor and p36 norm match; 28 source-twist roots ciphertext-like, no new original plaintext.'
},null,2));
