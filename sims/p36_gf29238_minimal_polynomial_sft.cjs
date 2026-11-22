'use strict';
/** Canonical GF(29^238) source p36 minimal polynomial, all 238 coefficients.
 * Run: node sims/p36_gf29238_minimal_polynomial_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..','resources','liber-primus');
const table=JSON.parse(fs.readFileSync(path.join(root,'base60-grid.json'),'utf8')).byte_rows.flat();
const corpus=JSON.parse(fs.readFileSync(path.join(root,'lp2-corpus.json'),'utf8'));
const d=238,mod=x=>(x%29+29)%29;
const inv=x=>{for(let n=1;n<29;n++)if(mod(n*x)===1)return n;throw Error('zero divisor')};
const trim=a=>{while(a.length&&a.at(-1)===0)a.pop();return a};
/** @param {number[]} a @param {number[]} b @returns {[number[],number[]]} */
function divide(a,b){
 const r=trim(a.slice()),q=Array(Math.max(0,r.length-b.length+1)).fill(0),scale=inv(b.at(-1));
 while(r.length>=b.length){
  const off=r.length-b.length,c=mod(r.at(-1)*scale);q[off]=c;
  for(let i=0;i<b.length;i++)r[off+i]=mod(r[off+i]-c*b[i]);
  trim(r);
 }
 return [trim(q),r];
}
let p=trim(table.slice().reverse().map(x=>x%29));
for(const f of [[5,1],[5,1],[11,18,1],[24,16,14,1],[11,15,0,9,1,5,10,20,12,1]]){
 const [q,r]=divide(p,f);assert.deepEqual(r,[]);p=q;
}
const R=p.map(x=>mod(x*inv(p.at(-1))));
assert.equal(R.length,d+1);assert.equal(R[d],1);
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function mul(a,b){
 const c=Array(2*d-1).fill(0);
 for(let i=0;i<a.length;i++)if(a[i])for(let j=0;j<b.length;j++)if(b[j])c[i+j]+=a[i]*b[j];
 for(let k=2*d-2;k>=d;k--){const z=mod(c[k]);if(z)for(let j=0;j<d;j++)c[k-d+j]-=z*R[j];c[k]=0}
 return Array.from({length:d},(_,i)=>mod(c[i]));
}
const t=Array(d).fill(0);t[0]=d%29;
for(let k=1;k<d;k++){
 let v=k*R[d-k];for(let j=1;j<k;j++)v+=R[d-j]*t[k-j];
 t[k]=mod(-v);
}
const trace=a=>mod(a.reduce((s,x,i)=>s+x*t[i],0));
const a=corpus.pages[36].indices;assert.equal(a.length,d);
const moments=[];let current=Array(d).fill(0);current[0]=1;
for(let i=0;i<2*d;i++){moments.push(trace(current));current=mul(current,a)}
assert.equal(moments[0],d%29);assert.equal(moments[1],11);
let C=[1],B=[1],L=0,shift=1,oldDelta=1;
for(let n=0;n<moments.length;n++){
 let delta=moments[n];for(let j=1;j<=L;j++)delta+=C[j]*moments[n-j];delta=mod(delta);
 if(!delta){shift++;continue}
 const saved=C.slice(),scale=mod(delta*inv(oldDelta));
 while(C.length<B.length+shift)C.push(0);
 for(let j=0;j<B.length;j++)C[shift+j]=mod(C[shift+j]-scale*B[j]);
 if(2*L<=n){L=n+1-L;B=saved;oldDelta=delta;shift=1}else shift++;
}
assert.equal(L,d);
const pol=C.slice().reverse().map(mod);
assert.equal(pol.length,d+1);assert.equal(pol[0],2);assert.equal(pol[d-1],18);assert.equal(pol[d],1);
let v=Array(d).fill(0);v[0]=1;
for(let i=d-1;i>=0;i--){v=mul(v,a);v[0]=mod(v[0]+pol[i])}
assert.ok(v.every(x=>x===0),'minimal polynomial re-evaluates to zero at original p36');
const output=pol.slice(0,d),bins=Array(29).fill(0);
for(const x of output)bins[x]++;
const ioc=bins.reduce((s,n)=>s+n*(n-1),0)/(d*(d-1));
assert.ok(Math.abs(ioc-0.03506719143353544)<1e-10);
console.log(JSON.stringify({
 source:'Original p50 numeric table and original p36 runes',
 degree:L,trace:11,norm:2,verifiedRoot:true,coefficients:output,
 ioc,gpReadout:output.map(x=>corpus.translit[x]).join(' '),
 result:'Source-selected full-degree minimal polynomial is ciphertext-like; no plaintext recovered.'
},null,2));
