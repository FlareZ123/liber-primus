'use strict';
/**
 * Label-permutation-invariant spectral test of a shared LP2 keystream.
 *
 * G = sum over pages of Xp Xp^T, where Xp is a one-hot rune matrix
 * centered by that page's measured rune frequencies. Each page may
 * independently permute all 29 glyph labels; its Gram matrix is unchanged.
 *
 * A shared mod29 key plus iid nonuniform GP plaintext creates correlated
 * equality geometry across page offsets. Its top eigenvalue is detectable.
 *
 * Run via Node.js 22: node sims/spectral_pad_synchrony.cjs
 * No packages, downloads, or per-commit jobs required.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const source = JSON.parse(fs.readFileSync(path.join(root,'resources','liber-primus','lp2-corpus.json'),'utf8'));
const pg = source.pages.filter(p=>p.status==='unsolved'&&p.indices.length).map(p=>p.indices);
const master = fs.readFileSync(path.join(root,'resources','transcriptions','liber_primus_master.txt'),'utf8').split('%');
const ord = new Map(source.runes.map((c,i)=>[c,i]));
const plain = [4,9,10,11,12,15,73].flatMap(i=>[...master[i]].filter(c=>ord.has(c)).map(c=>ord.get(c)));
assert.equal(pg.length,55);
assert.equal(pg.reduce((n,p)=>n+p.length,0),12956);
assert.equal(master.length,75);
assert.equal(plain.length,1096);
const A=29;
const L=Math.max(...pg.map(a=>a.length));
const cdf=[],freq=Array(A).fill(0);
for(const x of plain)freq[x]++;
let accum=0;
for(const f of freq){accum+=f/plain.length;cdf.push(accum);}

/** @param {number} seed @returns {()=>number} */
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
/** @param {number[]} a @param {()=>number} random */
function rotate(a,random){const k=Math.floor(random()*a.length);return a.slice(k).concat(a.slice(0,k));}
/** @param {number[][]} pages @param {()=>number} random */
function rotateAll(pages,random){return pages.map(a=>rotate(a,random));}
/** @param {()=>number} random */
function sampleRune(random){const v=random();for(let i=0;i<A-1;i++)if(v<cdf[i])return i;return A-1;}
/** @param {number} seed */
function plant(seed){
 const random=rng(seed);
 const key=Array.from({length:L},()=>Math.floor(random()*A));
 const perms=pg.map(()=>{
  const p=Array.from({length:A},(_,i)=>i);
  for(let i=A-1;i>0;i--){const j=Math.floor(random()*(i+1));[p[i],p[j]]=[p[j],p[i]];}
  return p;
 });
 const sample=pg.map((p,i)=>p.map((unused,t)=>perms[i][(sampleRune(random)+key[t])%A]));
 for(const p of sample)for(let t=1;t<p.length;t++){
  if(p[t]===p[t-1] && random()<.81){
   const v=Math.floor(random()*(A-1));
   p[t]=v>=p[t-1]?v+1:v;
  }
 }
 return sample;
}
/**
 * Power iteration on the implicit PSD Gram operator, without materializing
 * a dense L x L matrix. Under an arbitrary page-wise permutation sigma_p,
 * Xp becomes Xp*Perm(sigma_p), so Xp Xp^T is exactly unchanged.
 * @param {number[][]} pages @param {number} iterations
 * @returns {number}
 */
function topEigen(pages,iterations=115){
 const frequencies=pages.map(a=>{
  const f=Array(A).fill(0);
  for(const x of a)f[x]++;
  return f.map(c=>c/a.length);
 });
 const random=rng(0x1cb7a),n=Math.max(...pages.map(a=>a.length));
 let vec=Float64Array.from({length:n},()=>random()-.5),eigen=0;
 for(let step=0;step<iterations;step++){
  const out=new Float64Array(n);
  for(let p=0;p<pages.length;p++){
   const page=pages[p],f=frequencies[p],s=new Float64Array(A);
   let total=0;
   for(let t=0;t<page.length;t++){s[page[t]]+=vec[t];total+=vec[t];}
   let offset=0;
   for(let j=0;j<A;j++){s[j]-=f[j]*total;offset+=f[j]*s[j];}
   for(let t=0;t<page.length;t++)out[t]+=s[page[t]]-offset;
  }
  let sq=0,dot=0,oldSq=0;
  for(let t=0;t<n;t++){sq+=out[t]*out[t];dot+=vec[t]*out[t];oldSq+=vec[t]*vec[t];}
  eigen=dot/oldSq;
  const norm=Math.sqrt(sq);
  for(let t=0;t<n;t++)vec[t]=out[t]/norm;
 }
 return eigen;
}
/** @param {number[]} xs */
function stats(xs){
 const mean=xs.reduce((a,b)=>a+b,0)/xs.length;
 const sd=Math.sqrt(xs.reduce((a,b)=>a+(b-mean)**2,0)/(xs.length-1));
 return{mean,sd,min:Math.min(...xs),max:Math.max(...xs)};
}
function main(){
 const obs=topEigen(pg);
 const random=rng(1237711);
 const surrogates=[];
 for(let k=0;k<160;k++)surrogates.push(topEigen(rotateAll(pg,random)));
 const controls=[],disrupted=[];
 for(let i=0;i<40;i++){
  const p=plant(i*10093+35);
  controls.push(topEigen(p));
  disrupted.push(topEigen(rotateAll(p,random)));
 }
 const nullStats=stats(surrogates);
 const result={
  hypothesis:'one page-aligned shared key, independent arbitrary 29-glyph permutation per page',
  corpus:{pages:pg.length,runicCount:12956,maxLen:L},
  positivePlaintext:{source:'seven independently readable LP1 manuscript scans',nRunes:plain.length,IoC:freq.reduce((s,f)=>s+f*(f-1),0)/(plain.length*(plain.length-1))},
  spectralIterations:115,
  observedTopEigenvalue:obs,
  circularNullReplicates:surrogates.length,
  circularNull: nullStats,
  zAgainstNull:(obs-nullStats.mean)/nullStats.sd,
  empiricalUpperP:(1+surrogates.filter(v=>v>=obs).length)/(1+surrogates.length),
  syntheticSharedPadReplicates:controls.length,
  plantTopEigenvalues:stats(controls),
  rotatedPlantTopEigenvalues:stats(disrupted),
  plantBeatingAllRealNulls:controls.filter(x=>x>nullStats.max).length
 };
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
 return result;
}
module.exports={rng,rotate,rotateAll,plant,topEigen,stats,main};
if(require.main===module)main();
