'use strict';
/**
 * Source-fixed original-LP2 challenge of the recovered Cicada-2014 RSA-432
 * factors as 256-bit stream keys. Source: 2014 Cicada 432-bit factoring stage.
 * Factorization is historical, and no link to an LP2 cipher is assumed.
 *
 * Reuses the existing collision-keyskip exact Viterbi and Shakespeare GP
 * language control. The real ciphertext is never used to derive key bytes.
 * Tests standard SHA-256 derivations of p, q, n, d and their concatenation,
 * plus direct 32-byte high/low slices of the two large RSA integers.
 * Fixed original train pages: 0,3,8,23,27,40, rune offsets [0,130).
 * Frozen original continuations: offsets [130,210) on those same pages.
 *
 * SFT: node sims/rsa2014_factored_key_inverse.cjs
 * @module rsa2014_factored_key_inverse
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {streamKey,viterbi} = require('./grid_stream_collision_viterbi.cjs');
const {train,encode} = require('./grid_keyskip_viterbi.cjs');

const ROOT=path.resolve(__dirname,'..');
const read=x=>fs.readFileSync(path.join(ROOT,x),'utf8');
const GP=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const P=97513779050322159297664671238670850085661086043266591739338007321n;
const Q=77506098606928780021829964781695212837195959082370473820509360759n;
const E=65537n;
const N=P*Q;
const PHI=(P-1n)*(Q-1n);
const EXPECTED_N=7557912574608535164426718292058021255641310207187633095795069445700059210248050757270234679993673844203148013173091173786572116639n;
assert.equal(N, EXPECTED_N);
assert.equal(N.toString(2).length, 432);

/** @param {bigint} a @param {bigint} mod @returns {bigint} */
function modInverse(a,mod) {
  let t=0n, u=1n, r=mod, s=a;
  while(s!==0n){
    const k=r/s;
    [t,u]=[u,t-k*u];
    [r,s]=[s,r-k*s];
  }
  assert.equal(r,1n);
  return ((t%mod)+mod)%mod;
}
const D=modInverse(E,PHI);
assert.equal((E*D)%PHI,1n);

/** @param {bigint} v @returns {Buffer} */
function bigEndian(v) {
  const h=v.toString(16);
  return Buffer.from(h.length%2?'0'+h:h,'hex');
}
/** @param {Buffer|string} bytes @returns {Buffer} */
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest();
const pBytes=bigEndian(P),qBytes=bigEndian(Q),nBytes=bigEndian(N),dBytes=bigEndian(D);
const keySources={
  sha256_p:sha(pBytes),
  sha256_q:sha(qBytes),
  sha256_n:sha(nBytes),
  sha256_d:sha(dBytes),
  sha256_pq:sha(Buffer.concat([pBytes,qBytes])),
  sha256_qp:sha(Buffer.concat([qBytes,pBytes])),
  sha256_n_decimal:sha(N.toString(10)),
  sha256_d_decimal:sha(D.toString(10)),
  n_first32:nBytes.subarray(0,32),
  n_last32:nBytes.subarray(nBytes.length-32),
  d_first32:dBytes.subarray(0,32),
  d_last32:dBytes.subarray(dBytes.length-32)
};
assert.equal(Object.keys(keySources).length,12);
assert.ok(Object.values(keySources).every(x=>x.length===32));
const pageIds=[0,3,8,23,27,40],T=130,H=80;
const pages=pageIds.map(i=>GP.pages[i]);
assert.ok(pages.every(p=>p.page!==50&&p.indices.length>=T+H));
assert.equal(pageIds.length,6);
const source=read('resources/control/shakespeare_first300k.txt');
const lm=train(source.slice(0,210000));
const modes=[];
for(const [name,key] of Object.entries(keySources))
for(const algo of ['aes-256-ctr','chacha20'])
for(const nonce of ['zero','page-index'])
for(const reducer of ['mod29','scaled29'])
for(const sign of [1,-1])
  modes.push({name,key,algo,nonce,reducer,sign});
assert.equal(modes.length,192);

/** @param {typeof modes[number]} mode @param {number} page */
function pad(mode,page) {
  const iv=Buffer.alloc(16);
  if(mode.nonce==='page-index')iv.writeUInt32BE(page,12);
  return streamKey(mode.key,{algo:mode.algo,reducer:mode.reducer,reverseKey:false},320,iv);
}
/** @param {number[][]} cipher @returns {object[]} */
function evaluate(cipher) {
  const outputs=[];
  for(const mode of modes) {
    let trainSum=0,holdSum=0;
    const pagesDetail=[];
    for(let j=0;j<pages.length;j++){
      const stream=pad(mode,pages[j].page);
      const start=viterbi(cipher[j].slice(0,T),stream,mode.sign,lm);
      const continuation=viterbi(cipher[j].slice(T,T+H),
        stream.slice(T+start.skips),mode.sign,lm);
      trainSum+=start.score;
      holdSum+=continuation.score;
      pagesDetail.push({page:pages[j].page,skips:start.skips,
        first:start.perRune,next:continuation.perRune,
        candidate:continuation.plaintext.slice(0,25).map(i=>GP.runes[i]).join('')});
    }
    outputs.push({
      name:mode.name,algo:mode.algo,nonce:mode.nonce,
      reducer:mode.reducer,sign:mode.sign,
      train:trainSum/(pages.length*T),
      heldout:holdSum/(pages.length*H),pages:pagesDetail
    });
  }
  return outputs.sort((a,b)=>b.train-a.train);
}
/** @param {typeof modes[number]} mode @returns {object} */
function controlPlant(mode){
  const plain=encode(source.slice(220000));
  assert.ok(plain.length>pageIds.length*(T+H));
  let state=0x20143301;
  /** @returns {number} */
  function next(){
    state^=state<<13;state^=state>>>17;state^=state<<5;
    return state>>>0;
  }
  const actual=[],ciphers=[],rejected=[];
  for(let j=0;j<pages.length;j++){
    const symbols=plain.slice(j*(T+H),(j+1)*(T+H));
    const stream=pad(mode,pages[j].page),c=[];
    let at=0,previous=-1,skip=0;
    for(const symbol of symbols){
      let value=(symbol+mode.sign*stream[at]+58)%29;
      if(value===previous&&next()/4294967296<.81){
        at++;
        value=(symbol+mode.sign*stream[at]+58)%29;
        skip++;
      }
      c.push(value);
      previous=value;at++;
    }
    assert.ok(at<stream.length);
    actual.push(symbols);ciphers.push(c);rejected.push(skip);
  }
  const ranked=evaluate(ciphers);
  const first=ranked[0];
  assert.equal(first.name,mode.name);
  assert.equal(first.algo,mode.algo);
  assert.equal(first.nonce,mode.nonce);
  assert.equal(first.reducer,mode.reducer);
  assert.equal(first.sign,mode.sign);
  let recovered=0;
  for(let j=0;j<pages.length;j++){
    const result=viterbi(ciphers[j],pad(mode,pages[j].page),mode.sign,lm);
    for(let i=0;i<T+H;i++)recovered+=Number(result.plaintext[i]===actual[j][i]);
  }
  assert.equal(recovered,6*(T+H),'Must recover all planted true-key GP runes');
  return {trueRank:1,actualRejected:rejected,recovered,
    total:6*(T+H),train:first.train,heldout:first.heldout};
}
function compact(row){return {
  name:row.name,algo:row.algo,nonce:row.nonce,
  reducer:row.reducer,sign:row.sign,train:row.train,
  heldout:row.heldout,pages:row.pages
};}
function main(){
  const trueModel=modes.find(m=>m.name==='sha256_pq'&&m.algo==='aes-256-ctr'&&
    m.nonce==='page-index'&&m.reducer==='mod29'&&m.sign===1);
  assert.ok(trueModel);
  const plant=controlPlant(trueModel);
  const original=evaluate(pages.map(p=>p.indices.slice(0,T+H)));
  const heldBest=original.reduce((a,b)=>a.heldout>b.heldout?a:b);
  console.log(JSON.stringify({
    hypothesis:'2014 source RSA-432 factor bytes as 256-bit AES/ChaCha keys with ciphertext-collision-rejected draws',
    origin:'2014 Cicada solved RSA challenge, source p and q, e=65537',
    historicalN:N.toString(),factorBits:[P,Q].map(x=>x.toString(2).length),
    sourceKeyDerivations:Object.keys(keySources),
    pages:pageIds,trainingPerPage:T,heldoutPerPage:H,
    candidates:modes.length,control:plant,
    originalTop:original.slice(0,4).map(compact),
    originalBestHeldoutPostselected:compact(heldBest),
    status:'A bounded original-cipher source-key test. Never infer plaintext from model-ranked gibberish.'
  },null,2));
}
if(require.main===module)main();
module.exports={keySources,pad,evaluate,controlPlant,main};
