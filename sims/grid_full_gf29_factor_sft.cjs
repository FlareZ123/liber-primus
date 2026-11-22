"use strict";
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
/**
 * Source-original LP2 GF29 factorization certificate and exact p36 monoalphabetic gate.
 * Node22, no external dependencies: node sims/grid_full_gf29_factor_sft.cjs
 */
const root=path.resolve(__dirname,"..");
const bytes=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-grid-256.json"),"utf8")).bytes;
assert.equal(bytes.length,256);
const digest=crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex");
assert.equal(digest,"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
/** @param {number} x @returns {number} */
function mod(x){return ((x%29)+29)%29;}
/** @param {number[]} a @returns {number[]} */
function trim(a){while(a.length>1&&a.at(-1)===0)a.pop();return a;}
/** @param {number} x @returns {number} */
function inv(x){for(let i=1;i<29;i++)if(mod(x*i)===1)return i;throw Error("zero pivot");}
/** @param {number[]} a @param {number[]} b @returns {{quotient:number[],remainder:number[]}} */
function divmod(a,b){
  const r=a.slice(),d=b.length-1,q=Array(Math.max(1,a.length-d)).fill(0),pivot=inv(b[d]);
  for(let i=a.length-1;i>=d;i--){const v=mod(r[i]*pivot);q[i-d]=v;for(let j=0;j<=d;j++)r[i-d+j]=mod(r[i-d+j]-v*b[j]);}
  return {quotient:trim(q),remainder:trim(r.slice(0,d)||[0])};
}
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function mul(a,b){
  const c=Array(a.length+b.length-1).fill(0);
  for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)c[i+j]=mod(c[i+j]+a[i]*b[j]);
  return trim(c);
}
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function minus(a,b){
  const c=Array(Math.max(a.length,b.length)).fill(0);
  for(let i=0;i<c.length;i++)c[i]=mod((a[i]||0)-(b[i]||0));
  return trim(c);
}
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function gcd(a,b){while(b.some(Boolean)){const r=divmod(a,b).remainder;a=b;b=r;}return a.map(x=>mod(x*inv(a.at(-1))));}
/** @param {number[]} a @param {number} n @param {number[]} f @returns {number[]} */
function power(a,n,f){
  let z=[1],v=a.slice();
  for(let k=n;k>0;k=Math.floor(k/2)){if(k%2)z=divmod(mul(z,v),f).remainder;if(k>1)v=divmod(mul(v,v),f).remainder;}
  return z;
}
/** @param {number} n @returns {number[]} */
function primeDivisors(n){
  const p=[];for(let d=2;d*d<=n;d++)if(n%d===0){p.push(d);while(n%d===0)n/=d;}if(n>1)p.push(n);return p;
}
/** Rabin irreducibility test. @param {number[]} f @returns {boolean} */
function irreducible(f){
  const n=f.length-1;if(n===1)return true;
  const gates=new Set(primeDivisors(n).map(p=>n/p));let x=[0,1];
  for(let i=1;i<=n;i++){x=power(x,29,f);if(gates.has(i)&&gcd(f,minus(x,[0,1])).length!==1)return false;}
  return minus(x,[0,1]).every(v=>v===0);
}
const original=trim(bytes.slice().reverse().map(mod));
assert.equal(original.length-1,254);
const factors=[
  {degree:1,multiplicity:2,poly:[5,1]},
  {degree:2,multiplicity:1,poly:[11,18,1]},
  {degree:3,multiplicity:1,poly:[24,16,14,1]},
  {degree:9,multiplicity:1,poly:[11,15,0,9,1,5,10,20,12,1]}
];
let residual=original.slice();
for(const factor of factors){
  for(let k=0;k<factor.multiplicity;k++){const d=divmod(residual,factor.poly);assert.deepEqual(d.remainder,[0]);residual=d.quotient;}
  assert(irreducible(factor.poly));
}
assert.equal(residual.length-1,238);assert.equal(residual.at(-1),28);
const monic238=residual.map(x=>mod(x*28));
assert(irreducible(monic238));
let reconstructed=monic238.slice();
for(const f of factors)for(let k=0;k<f.multiplicity;k++)reconstructed=mul(reconstructed,f.poly);
assert.deepEqual(reconstructed.map(x=>mod(x*28)),original);
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const matchingPages=corpus.pages.filter(p=>p.page<=55&&p.indices.length===238);
assert.deepEqual(matchingPages.map(p=>p.page),[36]);
const p36=matchingPages[0].indices;
/** Exact all-secret 29-symbol substitution maximum by Hungarian assignment.
 * @param {number[]} input @param {number[]} target @returns {number} */
function bestBijectionMatches(input,target){
  assert.equal(input.length,target.length);
  const w=Array.from({length:29},()=>Array(29).fill(0));
  for(let i=0;i<input.length;i++)w[input[i]][target[i]]++;
  const n=29,u=Array(n+1).fill(0),v=Array(n+1).fill(0),p=Array(n+1).fill(0),way=Array(n+1).fill(0);
  for(let i=1;i<=n;i++){
    p[0]=i;let j0=0;const minv=Array(n+1).fill(Infinity),used=Array(n+1).fill(false);
    do{
      used[j0]=true;const i0=p[j0];let delta=Infinity,j1=0;
      for(let j=1;j<=n;j++)if(!used[j]){
        const cur=-w[i0-1][j-1]-u[i0]-v[j];
        if(cur<minv[j]){minv[j]=cur;way[j]=j0;}
        if(minv[j]<delta){delta=minv[j];j1=j;}
      }
      for(let j=0;j<=n;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta;}else minv[j]-=delta;
      j0=j1;
    }while(p[j0]!==0);
    do{const j1=way[j0];p[j0]=p[j1];j0=j1;}while(j0!==0);
  }
  let matched=0;for(let j=1;j<=n;j++)matched+=w[p[j]-1][j-1];
  return matched;
}
/** @param {number[]} a @param {number[]} b @returns {number} */
function exactMatches(a,b){return a.reduce((n,x,i)=>n+(x===b[i]),0);}
const forward=monic238.slice(0,238),reverse=forward.slice().reverse();
assert.equal(exactMatches(forward,p36),11);assert.equal(exactMatches(reverse,p36),14);
const fmax=bestBijectionMatches(forward,p36),rmax=bestBijectionMatches(reverse,p36);
assert.equal(fmax,45);assert.equal(rmax,49);
assert.equal(bestBijectionMatches(forward,forward.map(x=>mod(5*x+7))),238);
let seed=0x3301;
/** @returns {number} */
function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;}
/** @param {number[]} originalArray @returns {number[]} */
function shuffle(originalArray){
  const a=originalArray.slice();
  for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
const trials=2000;let fge=0,rge=0,fsum=0,rsum=0;
for(let k=0;k<trials;k++){
  const a=shuffle(p36),f=bestBijectionMatches(forward,a),r=bestBijectionMatches(reverse,a);
  fsum+=f;rsum+=r;fge+=(f>=fmax);rge+=(r>=rmax);
}
console.log(JSON.stringify({
  source_sha256:digest,original_degree:254,scalar:28,
  irreducible_degrees:[1,2,3,9,238],multiplicities:[2,1,1,1,1],
  full_reconstruction:true,p36_source_matches:{forward:fmax,reversed:rmax},planted:238,
  p36_shuffle:{trials,forward_mean:fsum/trials,reversed_mean:rsum/trials,forward_ge:fge,reversed_ge:rge,
    forward_p:(fge+1)/(trials+1),reversed_p:(rge+1)/(trials+1)}
},null,2));
