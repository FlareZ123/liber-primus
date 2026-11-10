'use strict';
/**
 * Phase-marginalized likelihood for a 29-state key with collision skips.
 * A GP plaintext rune P ~ q emits C=P+K_j (mod 29), K_j=a*j.
 * On equality to the preceding C, consume K_j and try K_(j+1)
 * with probability 0.81. Since a != 0, one retry always differs.
 * The exact backward algorithm sums over skipped-key histories.
 * Starting phases can be integrated out or optimized independently
 * for each page; the optimized model is an upper bound for fixed reset.
 *
 * Node.js 18+, no packages, no network. Execute: node sims/skip_phase_hmm.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const M=29, R=0.81, SEED=0x1d4ea21b, PLANTED_SLOPE=9;
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const lp1=fs.readFileSync(path.join(root,'resources/transcriptions/lp1_wulfic_canonical.txt'),'utf8');
const runeId=new Map(corpus.runes.map((r,i)=>[r,i]));
const pages=corpus.pages.filter(p=>p.status==='unsolved'&&p.indices.length).map(p=>p.indices);
assert.equal(pages.length,55);
assert.equal(pages.reduce((n,p)=>n+p.length,0),12956);
assert.equal(corpus.pages[50].status,'numeric_grid_only');

/**
 * LP1 genuinely plaintext pages only: 3,8–11,14; plus solved LP2 56–57.
 * Add-one smoothing prevents unsupported zero-emission probabilities.
 * @returns {{q:number[],n:number}}
 */
function reference(){
  const freq=Array(M).fill(1),segments=lp1.split('%');
  for(const s of [3,8,9,10,11,14])for(const ch of segments[s]){
    const id=runeId.get(ch);if(id!==undefined)freq[id]++;
  }
  for(const page of corpus.pages.filter(p=>p.status==='solved'))
    for(const id of page.indices)freq[id]++;
  const n=freq.reduce((sum,x)=>sum+x,0);
  return {q:freq.map(x=>x/n),n:n-M};
}
/**
 * Backward dynamic program for all 29 unknown initial key phases.
 * @param {number[]} cipher
 * @param {number} slope
 * @param {number[]} q
 * @param {number} rejection
 * @returns {{marginal:number,best:number,phase:number}}
 */
function profile(cipher,slope,q,rejection=R){
  assert.ok(slope>0&&slope<M);
  const current=new Float64Array(M);
  const beta=new Float64Array(M).fill(1);
  let logScale=0;
  for(let i=cipher.length-1;i>=0;i--){
    const prev=i>0?cipher[i-1]:-1;
    const value=cipher[i],difference=(value-prev+M)%M;
    let maximum=0;
    for(let j=0;j<M;j++){
      const key=slope*j%M;
      let v=q[(value-key+M)%M]*beta[(j+1)%M]*
        (prev<0||difference!==0?1:1-rejection);
      if(prev>=0&&difference===slope)
        v+=rejection*q[(prev-key+M)%M]*beta[(j+2)%M];
      current[j]=v;
      if(v>maximum)maximum=v;
    }
    assert.ok(maximum>0);
    logScale+=Math.log(maximum);
    for(let j=0;j<M;j++)beta[j]=current[j]/maximum;
  }
  const mean=beta.reduce((s,x)=>s+x,0)/M;
  let largest=0,start=0;
  for(let j=0;j<M;j++)if(beta[j]>largest){largest=beta[j];start=j;}
  return {marginal:logScale+Math.log(mean),best:logScale+Math.log(largest),phase:start};
}
/**
 * Uniform output-avoiding-adjacent-duplicates baseline, with the 86
 * observed doublets among 12,901 within-page pairs.
 * @param {number[]} cipher
 * @returns {number}
 */
function nullScore(cipher){
  const repeat=86/12901;
  let ll=-Math.log(M);
  for(let i=1;i<cipher.length;i++)
    ll+=Math.log(cipher[i]===cipher[i-1]?repeat:(1-repeat)/28);
  return ll;
}
/**
 * Test all nonzero arithmetic slopes with two start-phase rules.
 * @param {number[][]} candidatePages
 * @param {number[]} q
 */
function scan(candidatePages,q){
  const base=candidatePages.reduce((s,p)=>s+nullScore(p),0),output=[];
  for(let a=1;a<M;a++){
    let marginal=0,best=0;
    for(const p of candidatePages){
      const result=profile(p,a,q);
      marginal+=result.marginal;
      best+=result.best;
    }
    output.push({slope:a,marginalLLR:marginal-base,freePhaseLLR:best-base});
  }
  output.sort((x,y)=>y.freePhaseLLR-x.freePhaseLLR);
  return {baseline:base,candidates:output};
}
/** @param {number} seed */
function rng(seed){
  let state=seed>>>0;
  return ()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296;};
}
/** @param {number[]} q @param {()=>number} random */
function sampleRune(q,random){
  const x=random();let p=0;
  for(let i=0;i<M;i++){p+=q[i];if(x<p)return i;}
  return M-1;
}
/**
 * Control encrypts iid plaintext from the same independently measured q.
 * Each physical page starts in its own random key phase.
 * @param {number[][]} original
 * @param {number[]} q
 * @param {number} slope
 * @param {number} seed
 */
function plant(original,q,slope,seed){
  const random=rng(seed);
  return original.map(p=>{
    let j=Math.floor(random()*M),previous=-1;
    const out=[];
    for(let i=0;i<p.length;i++){
      const plain=sampleRune(q,random);
      let value=(plain+slope*j)%M;
      j=(j+1)%M;
      if(previous>=0&&value===previous&&random()<R){
        value=(plain+slope*j)%M;
        j=(j+1)%M;
      }
      out.push(value);
      previous=value;
    }
    return out;
  });
}
function study(){
  const {q,n}=reference();
  const observed=scan(pages,q);
  const positive=scan(plant(pages,q,PLANTED_SLOPE,SEED),q);
  assert.equal(positive.candidates[0].slope,PLANTED_SLOPE);
  assert.ok(positive.candidates[0].marginalLLR>0);
  assert.ok(observed.candidates[0].freePhaseLLR<0);
  return {
    hypothesis:'29-state additive arithmetic-ramp Vigenere key, repeated-output rejection probability 0.81',
    coverage:'28 slopes; start-phase marginalized or freely optimized on all 55 pages',
    inputRunes:12956,referenceRunes:n,plaintextPrior:'known LP1 literal pages and solved LP2, iid rune q, add-one smoothing',
    antiRepeatNull:'uniform Markov with 86 doublets among 12901 physical page pairs',
    observed:{baseline:observed.baseline,best:observed.candidates.slice(0,5)},
    positive:{trueSlope:PLANTED_SLOPE,seed:SEED,best:positive.candidates.slice(0,3)},
    conclusion:'This bounded model is incompatible with an LP1-like iid rune distribution on LP2; neither plaintext nor a general cipher family was recovered.'
  };
}
if(require.main===module)console.log(JSON.stringify(study(),null,2));
module.exports={reference,profile,nullScore,scan,plant,study};
