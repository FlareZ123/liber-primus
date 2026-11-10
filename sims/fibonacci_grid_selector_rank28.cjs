'use strict';
/**
 * Original LP2 inverse: Fibonacci-indexed page15 key selectors sample the
 * 256-byte grid (LP2 49-51) to form an AES-128 key. AES masks the 28-state
 * primitive-root transition implied by red quotients 15,22,78.
 * All 128 choices are finite and source-fixed; no fitted key material.
 * Run: node sims/fibonacci_grid_selector_rank28.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createCipheriv}=require('node:crypto');
const {sourceIVs}=require('./fibonacci_indexed_grid_iv.cjs');
const {powers,logs}=require('./ea_zero_step_reversible.cjs');
const {encode}=require('./grid_keyskip_viterbi.cjs');
const ROOT=path.resolve(__dirname,'..');
const GP=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const PAGES=GP.pages.filter(p=>p.page<56&&p.indices.length);
const N=12956,LENGTHS=[729,1145,1738,1894,1021,1433,1680,3316];
assert.equal(PAGES.length,55);
assert.equal(PAGES.reduce((s,p)=>s+p.indices.length,0),N);
assert.equal(LENGTHS.reduce((s,n)=>s+n,0),N);
const CIPHER=PAGES.flatMap(p=>p.indices);
const PAGE_START=new Set(),SECTION_START=new Set([0]);
let pos=0;
for(const page of PAGES){PAGE_START.add(pos);pos+=page.indices.length;}
assert.equal(pos,N);
pos=0;
for(const length of LENGTHS){pos+=length;SECTION_START.add(pos);}
assert.equal(pos,N);
const KEYS=sourceIVs();
assert.equal(KEYS.length,8);
assert.ok(KEYS.every(k=>k.iv.length===16));
const MODES=KEYS.flatMap(candidate=>
  [-1,1].flatMap(sign=>[false,true].flatMap(scaled=>
    ['book','section'].flatMap(reset=>[false,true].map(skipEA=>
      ({name:candidate.name,key:candidate.iv,sign,scaled,reset,skipEA}))))));
assert.equal(MODES.length,128);
const mod=(n,m)=>(n%m+m)%m;
function pad(key){
  const ci=createCipheriv('aes-128-ctr',key,Buffer.alloc(16));
  return Buffer.concat([ci.update(Buffer.alloc(N)),ci.final()]);
}
function digit(value,scaled,m){
  return scaled?Math.floor(value*m/256):value%m;
}
/** Exact 29-symbol per-page initial + 28-step keyed decrypt.
 * @param {number[]} cipher
 * @param {typeof MODES[number]} mode
 */
function decrypt(cipher,mode){
  assert.equal(cipher.length,N);
  const out=new Array(N),stream=pad(mode.key);
  let cursor=0,previous=0;
  for(let i=0;i<N;i++){
    if(i&&mode.reset==='section'&&SECTION_START.has(i))cursor=0;
    const c=cipher[i];
    if(PAGE_START.has(i)){
      out[i]=mod(c-digit(stream[cursor++],mode.scaled,29),29);
    }else{
      const d=mod(c-previous,29);
      if(!d){out[i]=28;if(!mode.skipEA)cursor++;}
      else{
        assert.ok(logs[d]>=0);
        out[i]=mod(logs[d]+mode.sign*digit(stream[cursor++],mode.scaled,28),28);
      }
    }
    previous=c;
  }
  return out;
}
/** Original-cipher-exact reversible forward operation.
 * @param {number[]} plain
 * @param {typeof MODES[number]} mode
 */
function encrypt(plain,mode){
  assert.equal(plain.length,N);
  const out=new Array(N),stream=pad(mode.key);
  let cursor=0,previous=0;
  for(let i=0;i<N;i++){
    if(i&&mode.reset==='section'&&SECTION_START.has(i))cursor=0;
    const v=plain[i];
    if(PAGE_START.has(i)){
      out[i]=mod(v+digit(stream[cursor++],mode.scaled,29),29);
    }else if(v===28){
      out[i]=previous;
      if(!mode.skipEA)cursor++;
    }else{
      assert.ok(v>=0&&v<28);
      const r=mod(v-mode.sign*digit(stream[cursor++],mode.scaled,28),28);
      out[i]=mod(previous+powers[r],29);
    }
    previous=out[i];
  }
  return out;
}
const SPLIT=PAGES.slice(0,28).reduce((s,p)=>s+p.indices.length,0);
assert.ok(SPLIT>6000&&SPLIT<7200);
function ioc(plain,begin,end){
  const freq=new Uint32Array(28);
  let n=0;
  for(let i=begin;i<end;i++)if(!PAGE_START.has(i)&&plain[i]!==28){
    freq[plain[i]]++;
    n++;
  }
  return freq.reduce((s,x)=>s+x*(x-1),0)/(n*(n-1));
}
function rank(cipher){
  return MODES.map(mode=>{
    const plain=decrypt(cipher,mode);
    return {mode,train:ioc(plain,0,SPLIT),held:ioc(plain,SPLIT,N),plain};
  }).sort((a,b)=>b.train-a.train);
}
function run(){
  const real=rank(CIPHER);
  const top=real.slice(0,5).map(({mode,train,held,plain})=>({
    key:mode.name,keyHex:mode.key.toString('hex'),sign:mode.sign,
    scaled:mode.scaled,reset:mode.reset,skipEA:mode.skipEA,
    trainIoC:train,heldoutIoC:held,
    heldoutPreview:plain.slice(SPLIT,SPLIT+40).map(i=>GP.translit[i]).join('')
  }));
  const truthMode=MODES.find(m=>m.name==='row-major/fibonacci-rank-one-based'&&
    m.sign===-1&&!m.scaled&&m.reset==='book'&&!m.skipEA);
  assert.ok(truthMode);
  const shakespeare=fs.readFileSync(path.join(ROOT,
    'resources/control/shakespeare_first300k.txt'),'utf8');
  const source=encode(shakespeare.slice(240000));
  assert.ok(source.length>=N);
  const truth=source.slice(0,N);
  const synthetic=encrypt(truth,truthMode);
  assert.deepEqual(decrypt(synthetic,truthMode),truth);
  const syntheticRanking=rank(synthetic);
  assert.equal(syntheticRanking[0].mode,truthMode,
    'Synthetic true-source AES128 key must rank first');
  assert.deepEqual(encrypt(real[0].plain,real[0].mode),CIPHER);
  let repeats=0;
  for(const p of PAGES)for(let i=1;i<p.indices.length;i++)
    repeats+=Number(p.indices[i]===p.indices[i-1]);
  assert.equal(repeats,86);
  const result={
    classification:'Reversible source-derived original cipher key test, not yet recovered plaintext',
    source:{runes:N,pages:PAGES.length,repeatSteps:repeats,
      sourceAES128Keys:KEYS.length,modeCount:MODES.length,
      trainPhysicalPages:28,splitRune:SPLIT,
      derivation:'p15 Fibonacci ordinals -> p49-51 grid bytes -> AES128-CTR',
      transform:'p40/15/53 red-source F29 log15 and transparent GP EA'},
    original:{topTraining:top,
      frozenBestHeldoutIoC:real[0].held,
      retrospectiveBestHeldoutIoC:Math.max(...real.map(r=>r.held)),
      inverseReencryptsAllCipherRunes:true},
    knownKeyControl:{source:'heldout Shakespeare GP transliteration',
      runes:truth.length,correct:truth.length,
      trueKeyRank:1,trueModeName:truthMode.name,
      trueModeTrainIoC:syntheticRanking[0].train,
      trueModeHeldoutIoC:syntheticRanking[0].held},
    candidateQualified:real[0].held>0.045&&real[0].train>0.045
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)run();
module.exports={decrypt,encrypt,ioc,rank,run};
