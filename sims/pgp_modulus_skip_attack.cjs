'use strict';
/**
 * Source-anchored Liber Primus LP2 key-recovery attempt:
 * authentic Cicada 3301 RSA public-key modulus bytes as a repeated additive
 * GP keystream, with exact marginalization over collision-triggered key skips.
 *
 * Hypothesis:
 *   provisional = (plaintext + sign * key[j]) mod 29;
 *   key pointer advances one byte;
 *   if provisional equals previous emitted rune, with probability 0.81
 *   retry the SAME plaintext rune with the next key byte, consuming a second
 *   byte. Exactly one retry is allowed.
 *
 * At the start of every physical page the key restarts at one shared unknown
 * offset in its byte string. The offset is selected using even-numbered pages
 * and evaluated unchanged on odd-numbered pages.
 *
 * Test domain: primary and RSA subkey, modulus bytes reduced mod 29, scaled
 * floor(29*byte/256), or rejection byte<232 then modulo 29; both additive signs;
 * all offsets; first 64 runes of each of 55 original unresolved rune pages.
 *
 * Node.js 22, no external packages or network.
 * Execute: node sims/pgp_modulus_skip_attack.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {dearmor, parseKeys} = require('./grid_rsa_pgp_signature.cjs');
const ROOT = path.join(__dirname, '..');
const M = 29, QSKIP = 0.81, LIMIT = 12, PREFIX = 64;
const mod = value => (value % M + M) % M;

/** @returns {{q:number[],n:number}} */
function reference() {
  const corpus = JSON.parse(fs.readFileSync(
    path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
  const lp1 = fs.readFileSync(
    path.join(ROOT,'resources/transcriptions/lp1_wulfic_canonical.txt'),'utf8');
  const indices = new Map(corpus.runes.map((r,i) => [r,i]));
  const freq = Array(M).fill(1);
  const sections = lp1.split('%');
  for(const s of [3,8,9,10,11,14])
    for(const rune of sections[s]) {
      const i = indices.get(rune);
      if(i !== undefined) freq[i]++;
    }
  for(const page of corpus.pages.filter(p => p.status === 'solved'))
    for(const i of page.indices) freq[i]++;
  const total = freq.reduce((a,b) => a+b,0);
  return {q:freq.map(x => x/total),n:total-M};
}

/**
 * Forward likelihood marginalized across unknown key skip decisions.
 * @param {number[]} page
 * @param {number[]} key
 * @param {number} offset
 * @param {number} sign
 * @param {number[]} q
 * @param {number} qskip
 * @returns {number}
 */
function likelihood(page,key,offset,sign,q,qskip=QSKIP) {
  let state = new Float64Array(LIMIT+1);
  let next = new Float64Array(LIMIT+1);
  let ll = 0;
  state[0] = 1;
  for(let i=0;i<page.length;i++) {
    const c=page[i], prev=i ? page[i-1] : -1;
    next.fill(0);
    let sum=0;
    for(let d=0;d<=Math.min(i,LIMIT);d++) {
      const mass=state[d];
      if(mass===0) continue;
      const j=(offset+i+d)%key.length;
      const k=key[j];
      const p=mod(c-sign*k);
      next[d]+=mass*q[p]*(c===prev ? 1-qskip : 1);
      if(prev>=0 && d<LIMIT) {
        const future=key[(j+1)%key.length];
        if(c===mod(prev+sign*(future-k)))
          next[d+1]+=mass*qskip*q[mod(prev-sign*k)];
      }
    }
    for(const x of next)sum+=x;
    assert.ok(sum>0 && Number.isFinite(sum));
    ll+=Math.log(sum);
    for(let d=0;d<next.length;d++)state[d]=next[d]/sum;
  }
  return ll;
}

/** @param {number[]} page */
function nullScore(page) {
  const r = 86 / 12901;
  let ll=-Math.log(M);
  for(let i=1;i<page.length;i++)
    ll+=Math.log(page[i]===page[i-1] ? r : (1-r)/28);
  return ll;
}

/**
 * @param {{page:number,indices:number[]}[]} pages
 * @param {number[]} key
 * @param {number} sign
 * @param {number[]} q
 */
function evaluate(pages,key,sign,q) {
  const train=pages.filter(p=>p.page%2===0).map(p=>p.indices.slice(0,PREFIX));
  const holdout=pages.filter(p=>p.page%2===1).map(p=>p.indices.slice(0,PREFIX));
  const trainNull=train.reduce((s,p)=>s+nullScore(p),0);
  const holdoutNull=holdout.reduce((s,p)=>s+nullScore(p),0);
  let bestOffset=0,bestScore=-Infinity;
  for(let offset=0;offset<key.length;offset++) {
    let score=-trainNull;
    for(const p of train)score+=likelihood(p,key,offset,sign,q);
    if(score>bestScore){bestScore=score;bestOffset=offset;}
  }
  let heldoutScore=-holdoutNull;
  for(const p of holdout)
    heldoutScore+=likelihood(p,key,bestOffset,sign,q);
  return {
    offset:bestOffset,
    trainLLR:Number(bestScore.toFixed(6)),
    heldoutLLR:Number(heldoutScore.toFixed(6)),
    trainRunes:train.reduce((s,p)=>s+p.length,0),
    heldoutRunes:holdout.reduce((s,p)=>s+p.length,0)
  };
}

/** @param {number} seed */
function rng(seed) {
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};
}

/** @param {number[]} q @param {()=>number} random */
function draw(q,random) {
  const v=random();
  let sum=0;
  for(let i=0;i<M;i++){sum+=q[i];if(v<sum)return i;}
  return M-1;
}

/**
 * Independent positive control: original page shapes, actual modulus key,
 * English-like rune frequencies and exact modeled keyskip.
 * @param {{page:number,indices:number[]}[]} original
 * @param {number[]} key
 * @param {number} sign
 * @param {number[]} q
 * @param {number} offset
 */
function plant(original,key,sign,q,offset=107) {
  const random=rng(0x3a1203aa);
  let skips=0;
  const pages=original.map(page=>{
    let j=offset,prev=-1;
    const out=[];
    for(let i=0;i<Math.min(page.indices.length,PREFIX);i++) {
      const p=draw(q,random);
      let c=mod(p+sign*key[j%key.length]);
      j++;
      if(prev>=0 && c===prev && random()<QSKIP) {
        c=mod(p+sign*key[j%key.length]);
        j++;
        skips++;
      }
      out.push(c);
      prev=c;
    }
    return {page:page.page,indices:out};
  });
  return {pages,skips,offset};
}

/** @returns {number[][]} */
function keys() {
  const armor=fs.readFileSync(
    path.join(ROOT,'resources/control/cicada-3301-public-key.asc'),'utf8');
  const parsed=parseKeys(dearmor(armor));
  assert.equal(parsed.length,2);
  assert.equal(parsed[0].fingerprint,'6D854CD7933322A601C3286D181F01E57A35090F');
  assert.ok(parsed.every(x=>x.bits===4096 && x.exponent===65537n));
  return parsed.map(p=>Array.from(Buffer.from(
    p.modulus.toString(16).padStart(1024,'0'),'hex')));
}
function main() {
  const corpus=JSON.parse(fs.readFileSync(
    path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
  const pages=corpus.pages.filter(p=>p.page<=55 && p.indices.length);
  assert.equal(pages.length,55);
  assert.equal(pages.reduce((n,p)=>n+p.indices.length,0),12956);
  const {q,n}=reference();
  const material=keys();
  const keyFamilies=[];
  for(let id=0;id<material.length;id++)
    for(const mode of ['mod','scaled','rejection']) {
      const bytes=material[id];
      const k=mode==='mod' ? bytes.map(b=>b%M) :
        mode==='scaled' ? bytes.map(b=>Math.floor(M*b/256)) :
        bytes.filter(b=>b<232).map(b=>b%M);
      keyFamilies.push({key:id===0?'primary':'subkey',mode,k});
    }
  const real=[];
  for(const x of keyFamilies)
    for(const sign of [1,-1])
      real.push({key:x.key,mode:x.mode,sign,...evaluate(pages,x.k,sign,q)});
  real.sort((a,b)=>b.heldoutLLR-a.heldoutLLR);
  const target=keyFamilies.find(x=>x.key==='primary'&&x.mode==='mod');
  assert.ok(target);
  const positive=plant(pages,target.k,1,q,107);
  const planted=evaluate(positive.pages,target.k,1,q);
  assert.equal(planted.offset,107,'Exact planted key offset must be recovered');
  assert.ok(planted.heldoutLLR>100,'True-key English planted holdout must be strong');
  assert.ok(real.every(x=>x.heldoutLLR<0));
  return {
    hypothesis:'Cicada public RSA moduli as period-paged additive GP keys',
    citation:'resources/control/cicada-3301-public-key.asc; original GP corpus',
    keyMaps:3,publicKeys:2,signs:2,
    offsetsPerKey:'Every modulus byte offset, including rejection-mapped length',
    skipHypothesis:'One optional extra key advance when candidate equals previous published rune, probability 0.81',
    exactLikelihood:'Marginalize all skip histories with at most 12 skips per 64-rune page',
    training:'Even physical pages, choose one globally shared key offset',
    test:'Odd physical pages, frozen key offset',
    prefix: PREFIX, originalRunes:12956, referenceRunes:n,
    authentic:real,
    planted:{trueKey:'primary/mod',sign:1,trueOffset:107,actualRetries:positive.skips,...planted},
    manuscriptDecrypted:false
  };
}
if(require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={reference,likelihood,evaluate,plant,keys,main};
