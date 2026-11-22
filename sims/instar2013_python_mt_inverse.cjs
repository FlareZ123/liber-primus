'use strict';
/**
 * Original LP2 source-seeded inverse using CPython 2.7 Random/MT19937.
 *
 * Repeats are hypothetical GP EA transparent positions, not authenticated
 * plaintext. This is a finite, 720-parameter original-input test.
 * The source seeds are the 2013 761.MP3 Parable number and its three
 * historically observed factors, not values fitted to LP2 ciphertext.
 *
 * CPython 2.7 seed and output source:
 * https://github.com/certik/python-2.7/blob/master/Modules/_randommodule.c
 * https://github.com/certik/python-2.7/blob/master/Lib/random.py
 * Node.js 22, CommonJS. SFT: node sims/instar2013_python_mt_inverse.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {sourcePlaintext} = require('./instar2013_source_seed_inverse.cjs');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length)
  .map(p => p.indices);
const CIPHER = pages.flat();
const SECTIONS = [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316];
assert.equal(CIPHER.length, 12956);
assert.equal(SECTIONS.reduce((s,n)=>s+n,0), CIPHER.length);
const SEEDS = [1595277641,1259,1031,1229];
const MOD28 = n => (n % 28 + 28) % 28;
const MOD29 = n => (n % 29 + 29) % 29;
const POW15 = [];
const LOG15 = Array(29).fill(-1);
for (let k = 0, v = 1; k < 28; k++, v = v*15%29) {
  POW15.push(v); LOG15[v] = k;
}
assert.equal(new Set(POW15).size,28);

class Python27MT {
  /** @param {number} seed Nonnegative 32-bit Python integer seed. */
  constructor(seed) {
    assert(Number.isInteger(seed) && seed >= 0 && seed <= 0xffffffff);
    const mt = new Uint32Array(624);
    mt[0] = 19650218;
    for (let i=1; i<624; i++) {
      const prev=mt[i-1];
      mt[i]=(Math.imul(1812433253,prev^(prev>>>30))+i)>>>0;
    }
    let i=1;
    for (let k=0; k<624; k++) {
      const prev=mt[i-1];
      mt[i]=((mt[i]^Math.imul(prev^(prev>>>30),1664525))+seed)>>>0;
      i++;
      if(i===624){mt[0]=mt[623];i=1;}
    }
    for(let k=623; k>0; k--){
      const prev=mt[i-1];
      mt[i]=((mt[i]^Math.imul(prev^(prev>>>30),1566083941))-i)>>>0;
      i++;
      if(i===624){mt[0]=mt[623];i=1;}
    }
    mt[0]=0x80000000;
    this.mt=mt;
    this.index=624;
  }
  twist(){
    const mt=this.mt;
    for(let j=0;j<624;j++){
      const y=((mt[j]&0x80000000)|(mt[(j+1)%624]&0x7fffffff))>>>0;
      mt[j]=(mt[(j+397)%624]^(y>>>1)^((y&1)?0x9908b0df:0))>>>0;
    }
    this.index=0;
  }
  /** @returns {number} MT19937 tempered unsigned 32-bit result. */
  next32(){
    if(this.index===624)this.twist();
    let y=this.mt[this.index++];
    y^=y>>>11;
    y^=(y<<7)&0x9d2c5680;
    y^=(y<<15)&0xefc60000;
    y^=y>>>18;
    return y>>>0;
  }
  /** @returns {number} CPython 2.7 getrandbits(31). */
  get31(){return this.next32()>>>1;}
  /** @returns {number} CPython 2.7 getrandbits(5). */
  get5(){return this.next32()>>>27;}
  /** @returns {number} CPython 2.7 random() in [0,1). */
  random(){
    const a=this.next32()>>>5,b=this.next32()>>>6;
    return (a*67108864+b)/9007199254740992;
  }
  /** @param {string} reducer @returns {number} 0..27 */
  digit(reducer){
    if(reducer==='bits5'){
      let value=this.get5();
      while(value>=28)value=this.get5();
      return value;
    }
    if(reducer==='float28')return Math.floor(28*this.random());
    const x=this.get31();
    if(reducer==='word31mod')return x%28;
    if(reducer==='word31scale')return Math.floor(x*28/2147483648);
    return (x&255)%28;
  }
}
/** @param {string} scope @returns {number[]} */
function lengths(scope){
  if(scope==='book')return [CIPHER.length];
  if(scope==='page')return pages.map(p=>p.length);
  return SECTIONS;
}
/** @param {number} prev @param {number} cur @param {string} rank */
function rank28(prev,cur,rank){
  if(rank==='power15')return LOG15[MOD29(cur-prev)];
  if(rank==='cyclic')return MOD29(cur-prev)-1;
  return cur-Number(cur>prev);
}
/** @param {number} prev @param {number} digit @param {string} rank */
function emit28(prev,digit,rank){
  if(rank==='power15')return MOD29(prev+POW15[digit]);
  if(rank==='cyclic')return MOD29(prev+digit+1);
  return digit<prev?digit:digit+1;
}
/**
 * @param {number[]} data
 * @param {{seed:number,scope:string,reducer:string,rank:string,skipEA:boolean,sign:number}} cfg
 * @returns {number[]}
 */
function decode(data,cfg){
  const out=[];
  let offset=0;
  for(const n of lengths(cfg.scope)){
    const gen=new Python27MT(cfg.seed);
    out.push(-1);
    for(let j=1;j<n;j++){
      const prev=data[offset+j-1],cur=data[offset+j];
      if(prev===cur){
        if(!cfg.skipEA)gen.digit(cfg.reducer);
        out.push(28);
      }else{
        const digit=rank28(prev,cur,cfg.rank);
        assert(digit>=0&&digit<28);
        out.push(MOD28(digit-cfg.sign*gen.digit(cfg.reducer)));
      }
    }
    offset+=n;
  }
  assert.equal(offset,data.length);
  return out;
}
/**
 * @param {number[]} data Candidate GP plaintext indices.
 * @param {{seed:number,scope:string,reducer:string,rank:string,skipEA:boolean,sign:number}} cfg
 * @param {number[]} initials Initial ciphertext rune per segment.
 * @returns {number[]}
 */
function encode(data,cfg,initials){
  const out=[];
  let offset=0,segment=0;
  for(const n of lengths(cfg.scope)){
    const gen=new Python27MT(cfg.seed);
    let prev=initials[segment++];
    out.push(prev);
    for(let j=1;j<n;j++){
      const p=data[offset+j];
      if(p===28){
        if(!cfg.skipEA)gen.digit(cfg.reducer);
      }else{
        const digit=MOD28(p+cfg.sign*gen.digit(cfg.reducer));
        prev=emit28(prev,digit,cfg.rank);
      }
      out.push(prev);
    }
    offset+=n;
  }
  assert.equal(offset,data.length);
  return out;
}
function configs(){
  const values=[];
  for(const seed of SEEDS)
  for(const scope of ['book','section','page'])
  for(const reducer of ['word31mod','word31scale','byte31','bits5','float28'])
  for(const rank of ['power15','cyclic','sorted'])
  for(const skipEA of [true,false])
  for(const sign of [1,-1])values.push({seed,scope,reducer,rank,skipEA,sign});
  assert.equal(values.length,720);
  return values;
}
/** @param {number[]} data @param {number[]} weights */
function score(data,weights){
  const counts=new Uint32Array(29);let sum=0,count=0;
  for(const v of data)if(v>=0){count++;counts[v]++;sum+=weights[v];}
  let pairs=0;
  for(const v of counts)pairs+=v*(v-1);
  return {n:count,logPerRune:sum/count,ioc:pairs/(count*(count-1))};
}
/** @param {number[]} cipher @param {number[]} weights */
function search(cipher,weights){
  return configs().map(cfg=>({...cfg,...score(decode(cipher,cfg),weights)}))
    .sort((a,b)=>b.logPerRune-a.logPerRune);
}
/** @param {number[]} source @param {string} scope */
function initials(source,scope){
  const out=[];let offset=0;
  for(const n of lengths(scope)){out.push(source[offset]);offset+=n;}
  return out;
}
function selfTest(){
  const m=new Python27MT(0);
  assert.deepEqual(Array.from({length:5},()=>m.get31()),
    [1813382118,827307999,1627694678,1911784257,903170602]);
  const bits=new Python27MT(1595277641);
  assert.deepEqual(Array.from({length:8},()=>bits.get5()),
    [30,4,18,30,17,21,11,24]);
  const r=new Python27MT(0);
  assert.ok(Math.abs(r.random()-0.8444218515250481)<1e-15);
  const rr=new Python27MT(1595277641);
  assert.deepEqual(Array.from({length:10},()=>rr.digit('bits5')),
    [4,18,17,21,11,24,9,2,10,7]);
}
function main(){
  selfTest();
  const train=sourcePlaintext();
  const priors=new Uint32Array(29).fill(1);
  for(const v of train.slice(0,30000))priors[v]++;
  const mass=priors.reduce((s,v)=>s+v,0);
  const weights=Array.from(priors,v=>Math.log(v/mass));
  const ref=score(train.slice(50000,50000+CIPHER.length),weights);
  const tested=search(CIPHER,weights);
  const best=tested[0];
  const decoded=decode(CIPHER,best);
  assert.deepEqual(encode(decoded.map(v=>Math.max(0,v)),
    best,initials(CIPHER,best.scope)),CIPHER);
  const trueConfig={seed:1595277641,scope:'section',
    reducer:'bits5',rank:'power15',skipEA:true,sign:1};
  const plaintext=train.slice(50000,50000+CIPHER.length);
  const synthetic=encode(plaintext,trueConfig,[2,3,5,7,11,13,17,19]);
  const recovered=decode(synthetic,trueConfig);
  let originalOffset=0,recoveredRunes=0;
  for(const n of lengths(trueConfig.scope)){
    for(let j=1;j<n;j++){
      assert.equal(recovered[originalOffset+j],plaintext[originalOffset+j]);
      recoveredRunes++;
    }
    originalOffset+=n;
  }
  assert.equal(recoveredRunes,12948);
  const planted=search(synthetic,weights);
  const rank=planted.findIndex(v=>Object.entries(trueConfig)
    .every(([key,value])=>v[key]===value))+1;
  assert(rank>=1&&rank<=3,'true planted configuration rank: '+rank);
  assert.deepEqual(encode(recovered.map(v=>Math.max(0,v)),
    trueConfig,initials(synthetic,trueConfig.scope)),synthetic);
  const output={
    hypothesis:'2013 independently sourced seed with CPython 2.7 MT19937',
    originalCipherRunes:CIPHER.length,
    candidateCount:tested.length,
    original:{best:tested.slice(0,3),
      bestBySeed:SEEDS.map(seed=>tested.find(v=>v.seed===seed)),
      exactOriginalReencipher:true,
      recoveredUnknownPlaintext:false},
    nativeGpReference:ref,
    planted:{configuration:trueConfig,blindRank:rank,
      exactRecoveredRuneCount:recoveredRunes,
      perRuneLogScore:planted[rank-1].logPerRune,
      exactRecipher:true},
    qualification:'Repeats interpreted conditionally as GP EA. Original best inverse is an algebraic roundtrip, not an authenticated key.'
  };
  process.stdout.write(JSON.stringify(output,null,2)+'\n');
  return output;
}
if(require.main===module)main();
module.exports={Python27MT,decode,encode,main};
