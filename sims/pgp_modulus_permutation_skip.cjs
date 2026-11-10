'use strict';
/**
 * PGP modulus external-key attack with an unknown outer GP rune permutation
 * and approximate collision-skip phase uncertainty.
 *
 * Cipher hypothesis, repeated independently on each original physical page:
 *   C_i = sigma((P_i + sign*K_j) mod 29).
 *   If the tentative C_i equals the previous ciphertext rune, retry once
 *   using the next key symbol with probability 0.81.
 *
 * Sigma can be any fixed or page-specific bijection, so same-page equality
 * C_i === C_(i-d) survives unknown sigma. Conditioned on a candidate key,
 * equality likelihood is derived from GP-English pair-difference frequency.
 *
 * Unknown key skips before each position are marginalized as binomial counts
 * (probability 0.81/29 per emitted rune), an approximation rather than exact
 * ciphertext-conditioned skip inference. Fit key offset on even pages, freeze
 * it for odd pages, and score each prefix without refitting.
 *
 * 55 original LP2 pages, 12,956 runes; two 4096-bit Cicada PGP RSA moduli,
 * three original-byte reduction maps, both signs, every byte alignment.
 * This is a source-anchored test of one finite cipher family, not plaintext.
 *
 * Node.js 22, no third-party packages. Manual CI only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {corpusWords} = require('./relative_key_english_probe.cjs');
const {keys:pgpKeys} = require('./pgp_modulus_skip_attack.cjs');
const ROOT = path.join(__dirname,'..');
const M=29, MAX_LAG=16, NOISE=0.08, P_SKIP=0.81/29;
const mod=x=>(x%M+M)%M;
/** @param {number} seed */
function rng(seed){
  let s=seed>>>0;
  return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;};
}
/** @param {number} n */
function binomial(n){
  const p=P_SKIP,prob=[Math.pow(1-p,n)];
  const max=Math.min(14,n);
  for(let k=1;k<=max;k++)
    prob.push(prob[k-1]*(n-k+1)/k*p/(1-p));
  const total=prob.reduce((a,b)=>a+b,0);
  return prob.map(x=>x/total);
}
/** @param {string} text */
function reference(text){
  const known=corpusWords(text.slice(0,240000)).flat();
  const heldout=corpusWords(text.slice(240000)).flat();
  const profiles=Array.from({length:MAX_LAG+1},()=>null);
  for(let d=2;d<=MAX_LAG;d++){
    const values=new Float64Array(M);
    for(let i=d;i<known.length;i++)
      values[mod(known[i]-known[i-d])]++;
    profiles[d]=Array.from(values,v=>(1-NOISE)*v/(known.length-d)+NOISE/M);
  }
  return {profiles,heldout,trainRunes:known.length};
}
/** @param {{page:number,indices:number[]}[]} pages @param {number} prefix */
function counts(pages,prefix){
  const groups=[0,1].map(()=>({
    hits:Array.from({length:MAX_LAG+1},()=>new Uint16Array(prefix)),
    total:Array.from({length:MAX_LAG+1},()=>new Uint16Array(prefix))
  }));
  for(const page of pages){
    const group=groups[page.page%2];
    const length=Math.min(prefix,page.indices.length);
    for(let d=2;d<=MAX_LAG;d++)
      for(let i=d;i<length;i++){
        group.total[d][i]++;
        if(page.indices[i]===page.indices[i-d])
          group.hits[d][i]++;
      }
  }
  return groups;
}
/**
 * Composite equality-likelihood ratio against a uniform 29-rune equality
 * process. Overlapping pairs are correlated, so scores are not chi-squares
 * or calibrated p-values.
 * @param {{hits:Uint16Array[],total:Uint16Array[]}} data
 * @param {number[]} key
 * @param {number} offset
 * @param {number} sign
 * @param {number[][]} profiles
 * @param {number[][]} bins
 */
function score(data,key,offset,sign,profiles,bins){
  const len=key.length,logYes=Math.log(M),logNo=1-1/M;
  let ll=0;
  for(let d=2;d<=MAX_LAG;d++){
    const yes=profiles[d],h=data.hits[d],n=data.total[d],bb=bins[d];
    for(let i=d;i<n.length;i++){
      const count=n[i];
      if(count===0)continue;
      const aa=bins[i-d],left=(offset+i-d)%len,right=(offset+i)%len;
      let rate=0;
      for(let a=0;a<aa.length;a++){
        const p=aa[a],l=key[(left+a)%len],r=(right+a)%len;
        for(let b=0;b<bb.length;b++)
          rate+=p*bb[b]*yes[mod(-sign*(key[(r+b)%len]-l))];
      }
      ll+=h[i]*(logYes+Math.log(rate))+
        (count-h[i])*Math.log((1-rate)/logNo);
    }
  }
  return ll;
}
/**
 * @param {{page:number,indices:number[]}[]} pages
 * @param {number[]} key
 * @param {number} sign
 * @param {number[][]} profiles
 * @param {number} prefix
 */
function evaluate(pages,key,sign,profiles,prefix){
  const [train,heldout]=counts(pages,prefix);
  const bins=Array.from({length:prefix},(_,n)=>binomial(n));
  let highest=-Infinity,offset=0;
  for(let j=0;j<key.length;j++){
    const s=score(train,key,j,sign,profiles,bins);
    if(s>highest){highest=s;offset=j;}
  }
  return {offset,training:Number(highest.toFixed(6)),
    heldout:Number(score(heldout,key,offset,sign,profiles,bins).toFixed(6))};
}
/**
 * @param {{page:number,indices:number[]}[]} pages
 * @param {number[]} key
 * @param {number} sign
 * @param {number[]} english
 * @param {number} offset
 */
function plant(pages,key,sign,english,offset){
  const random=rng(0x5d121157),perm=Array.from({length:M},(_,i)=>i);
  for(let j=M-1;j>0;j--){
    const k=Math.floor(random()*(j+1));
    [perm[k],perm[j]]=[perm[j],perm[k]];
  }
  let skips=0;
  const out=pages.map(page=>{
    let j=offset,prev=-1;
    const length=page.indices.length;
    const begin=Math.floor(random()*(english.length-length-1));
    const indices=[];
    for(let i=0;i<length;i++){
      const p=english[begin+i];
      let c=perm[mod(p+sign*key[j%key.length])];
      j++;
      if(prev>=0&&c===prev&&random()<0.81){
        c=perm[mod(p+sign*key[j%key.length])];
        j++;
        skips++;
      }
      indices.push(c);prev=c;
    }
    return {page:page.page,indices};
  });
  return {pages:out,offset,skips};
}
function main(){
  const corpus=JSON.parse(fs.readFileSync(
    path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
  const original=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
  assert.equal(original.length,55);
  const source=reference(fs.readFileSync(
    path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8'));
  const bytes=pgpKeys();
  const candidates=[];
  for(let id=0;id<2;id++)
    for(const map of ['mod','scaled','rejection']){
      const b=bytes[id];
      const key=map==='mod'?b.map(x=>x%M):
        map==='scaled'?b.map(x=>Math.floor(x*M/256)):
        b.filter(x=>x<232).map(x=>x%M);
      for(const sign of [1,-1])candidates.push({
        source:id===0?'primary':'subkey',map,sign,key});
    }
  const originalResults=[];
  for(const candidate of candidates) {
    const rows={source:candidate.source,map:candidate.map,sign:candidate.sign};
    for(const n of [64,128])
      rows['prefix'+n]=evaluate(original,candidate.key,candidate.sign,source.profiles,n);
    originalResults.push(rows);
  }
  const positiveKey=candidates[0];
  assert.equal(positiveKey.map,'mod');
  assert.equal(positiveKey.source,'primary');
  assert.equal(positiveKey.sign,1);
  const expectedOffset=107;
  const planted=plant(original,positiveKey.key,1,source.heldout,expectedOffset);
  const controls={};
  for(const n of [64,128])
    controls['prefix'+n]=evaluate(planted.pages,positiveKey.key,1,source.profiles,n);
  // This detector is only useful if it recovers both the planted offset
  // and a strong independent-page positive under its modeled skips.
  assert.equal(controls.prefix128.offset,expectedOffset);
  assert.ok(controls.prefix128.heldout>100);
  return {
    hypothesis:'PGP public-key modulus GP pad, unknown fixed/page-local rune permutation, marginal binomial skip drift',
    keyFamilies:'Two authentic 512-byte RSA moduli, three byte->GP maps, both signs, every offset',
    sourceGPTrainRunes:source.trainRunes,
    GPReference:'Shakespeare first240k characters, 8% uniform difference smoothing',
    model:'Within-page rune equality at each lag 2..16; beta-binomial skip count approximate with per-rune p=0.81/29',
    fitting:'Even original physical page IDs; one key offset fitted, no ciphertext-label assignment',
    heldout:'Odd physical page IDs, same fitted offset; equality indicators across i and d overlap',
    original:originalResults,
    planted:{trueOffset:expectedOffset,actualRetries:planted.skips,
      labelPermutation:'Secret seeded independent 29-rune bijection',
      ...controls},
    recoveredLP2Plaintext:false
  };
}
if(require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={binomial,reference,counts,score,evaluate,plant,main};
