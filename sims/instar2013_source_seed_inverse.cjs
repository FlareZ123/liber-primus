'use strict';
/**
 * Cicada OS 2013 / 761.MP3 source-number inverse on ORIGINAL LP2.
 *
 * The independently published 2013 Instar Emergence ID3 tag contains
 * "Parable 1,595,277,641"; this is 1259*1031*1229, the three
 * GP-prime clause sums on the subsequently published Parable page.
 * These four integers are the only candidate initial seeds tested.
 *
 * Reversible trial:
 *   C[0] is a public initialization rune;
 *   P[i] = 28 (EA) maps to C[i]=C[i-1] with optional RNG consumption;
 *   otherwise ΔC[i] = g^((P[i]+sign*pad[i]) mod28) mod29,
 *   with g=15 or, as alternative, ordinal/cyclic exclusion maps.
 *
 * Explicitly CONDITIONAL: original ciphertext repeats are not proved EA.
 * No assumption is made that the 2013 number was used as the LP2 seed.
 * node sims/instar2013_source_seed_inverse.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {LegacyPhpMt} = require('./php_legacy_mt.cjs');
const ROOT = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const CORPUS = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const PAGES = CORPUS.pages.filter(p=>p.page <= 55 && p.indices.length)
  .map(p=>p.indices);
const SECTION_LENGTHS = [729,1145,1738,1894,1021,1433,1680,3316];
const TOTAL = SECTION_LENGTHS.reduce((a,b)=>a+b,0);
assert.equal(PAGES.length,55);
assert.equal(TOTAL,12956);
const CIPHER = PAGES.flat();
assert.equal(CIPHER.length,TOTAL);
const SEEDS = [1595277641,1259,1031,1229];
const ROOT15 = [], LOG15 = new Int8Array(29).fill(-1);
for(let i=0,v=1;i<28;i++,v=v*15%29){ROOT15.push(v);LOG15[v]=i;}
assert.equal(new Set(ROOT15).size,28);
const SEGMENTS = ['book','section','page'];
const GENERATORS = ['php5-mt','ansi-lcg'];
const REDUCERS = ['mod28','scale28','byte28'];
const RANKS = ['power15','cyclic','sorted'];
const MOD28 = n => (n%28+28)%28;
const MOD29 = n => (n%29+29)%29;

/** A deliberately bounded non-PHP alternative generator. */
class AnsiLcg {
  /** @param {number} seed */
  constructor(seed){this.state=seed>>>0;}
  next31(){this.state=(Math.imul(1103515245,this.state)+12345)>>>0;
    return this.state>>>1;}
}
/** @param {string} generator @param {number} seed */
function makeRng(generator,seed){
  return generator==='php5-mt'?new LegacyPhpMt(seed):new AnsiLcg(seed);
}
/** @param {number} raw @param {string} reducer */
function keyDigit(raw,reducer){
  return reducer==='mod28'?raw%28:
    reducer==='scale28'?Math.floor(raw*28/2147483648):(raw&255)%28;
}
/** @param {string} reset @param {number[]} data */
function split(data,reset){
  if(reset==='book')return [data];
  if(reset==='page'){
    let start=0;
    return PAGES.map(p=>{const out=data.slice(start,start+p.length);
      start+=p.length;return out;});
  }
  let start=0;
  return SECTION_LENGTHS.map(n=>{const out=data.slice(start,start+n);
    start+=n;return out;});
}
/** @param {number} previous @param {number} current @param {string} rank */
function rank28(previous,current,rank){
  if(rank==='power15')return LOG15[MOD29(current-previous)];
  if(rank==='cyclic')return MOD29(current-previous)-1;
  return current-Number(current>previous);
}
/** @param {number} previous @param {number} digit @param {string} rank */
function emit28(previous,digit,rank){
  if(rank==='power15')return MOD29(previous+ROOT15[digit]);
  if(rank==='cyclic')return MOD29(previous+1+digit);
  return digit<previous?digit:digit+1;
}
/**
 * @param {number[]} cipher
 * @param {{seed:number,generator:string,reset:string,reducer:string,rank:string,skipEA:boolean,sign:number}} setup
 * @returns {number[]}
 */
function decode(cipher,setup){
  const out=[];
  for(const seg of split(cipher,setup.reset)){
    const rng=makeRng(setup.generator,setup.seed);
    if(!seg.length)continue;
    out.push(-1);
    for(let j=1;j<seg.length;j++){
      const a=seg[j-1], b=seg[j];
      if(a===b){
        if(!setup.skipEA)rng.next31();
        out.push(28);
        continue;
      }
      const key=keyDigit(rng.next31(),setup.reducer);
      out.push(MOD28(rank28(a,b,setup.rank)-setup.sign*key));
    }
  }
  return out;
}
/** @param {number[]} plaintext @param {ReturnType<typeof setupList>[number]} setup */
function encode(plaintext,setup){
  const out=[];
  let segmentNumber=0;
  for(const seg of split(plaintext,setup.reset)){
    const rng=makeRng(setup.generator,setup.seed);
    if(!seg.length)continue;
    let c=(11+segmentNumber*7)%29;
    segmentNumber++;
    out.push(c);
    for(let j=1;j<seg.length;j++){
      const p=seg[j];
      if(p===28){
        if(!setup.skipEA)rng.next31();
      }else{
        const key=keyDigit(rng.next31(),setup.reducer);
        c=emit28(c,MOD28(p+setup.sign*key),setup.rank);
      }
      out.push(c);
    }
  }
  assert.equal(out.length,plaintext.length);
  return out;
}
/**
 * Source-independent GP-English rune corpus.
 * @returns {number[]}
 */
function sourcePlaintext(){
  const dict = new Map(CORPUS.translit.map((v,i)=>[v,i]));
  const two=['TH','EO','OE','AE','IA','EA','NG'];
  const out=[];
  for(const word of read('resources/control/shakespeare_first300k.txt').match(/[A-Za-z]+/g)||[]){
    const src=word.toUpperCase().replace(/QU/g,'CW')
      .replace(/ING/g,'NG').replace(/V/g,'U')
      .replace(/K/g,'C').replace(/Z/g,'S').replace(/Q/g,'C');
    for(let i=0;i<src.length;){
      const pair=two.find(x=>src.startsWith(x,i));
      const token=pair||src[i],r=dict.get(token);
      assert.notEqual(r,undefined,'unencodable GP rune: '+token);
      out.push(r);i+=token.length;
    }
  }
  assert(out.length>90000);
  return out;
}
/** @returns {ReturnType<typeof decode>[]} */
function setupList(){
  const out=[];
  for(const seed of SEEDS)for(const generator of GENERATORS)
  for(const reset of SEGMENTS)for(const reducer of REDUCERS)
  for(const rank of RANKS)for(const skipEA of [false,true])
  for(const sign of [-1,1])
    out.push({seed,generator,reset,reducer,rank,skipEA,sign});
  assert.equal(out.length,864);
  return out;
}
/** @param {number[]} original @param {number[]} weights */
function measure(original,weights){
  let log=0,n=0;
  const hist=new Uint32Array(29);
  for(const i of original)if(i>=0){
    n++;hist[i]++;log+=weights[i];
  }
  let matched=0;
  for(const count of hist)matched+=count*(count-1);
  return {n,logPerRune:log/n,ioc:matched/(n*(n-1))};
}
/**
 * @param {number[]} ciphertext
 * @param {ReturnType<typeof setupList>} setups
 * @param {number[]} weights
 */
function search(ciphertext,setups,weights){
  const list=[];
  for(const s of setups){
    const plain=decode(ciphertext,s);
    assert.equal(plain.length,TOTAL);
    list.push({...s,...measure(plain,weights)});
  }
  list.sort((a,b)=>b.logPerRune-a.logPerRune);
  return list;
}
function main(){
  const originalMt=new LegacyPhpMt(0);
  assert.deepEqual(Array.from({length:3},()=>originalMt.next31()),
    [963932192,1273124119,1535857466]);
  const originalMt3301=new LegacyPhpMt(3301);
  assert.equal(originalMt3301.next31(),1405942902);
  const train=sourcePlaintext();
  const priors=new Uint32Array(29).fill(1);
  for(const x of train.slice(0,30000))priors[x]++;
  const total=priors.reduce((a,b)=>a+b,0);
  const weights=Array.from(priors,n=>Math.log(n/total));
  const baseline=weights.reduce((a,b)=>a+b,0)/29;
  const setups=setupList();
  const real=search(CIPHER,setups,weights);
  const trueSetup={seed:1595277641,generator:'php5-mt',reset:'section',
    reducer:'scale28',rank:'power15',skipEA:true,sign:1};
  const plain=train.slice(50000,50000+TOTAL);
  assert.equal(plain.length,TOTAL);
  const plant=encode(plain,trueSetup);
  const reconstructed=decode(plant,trueSetup);
  assert.equal(reconstructed.length,TOTAL);
  let recovered=0,unknown=0,at=0;
  for(const seg of split(plain,'section')){
    unknown++;
    for(let j=1;j<seg.length;j++){
      assert.equal(reconstructed[at+j],seg[j]);
      recovered++;
    }
    at+=seg.length;
  }
  assert.equal(recovered,TOTAL-8);
  assert.deepEqual(encode(reconstructed.map((x,i)=>x<0?plain[i]:x),
    trueSetup),plant);
  const positives=search(plant,setups,weights);
  const plantRank=positives.findIndex(x=>SEEDS.includes(x.seed) &&
    Object.keys(trueSetup).every(k=>x[k]===trueSetup[k]))+1;
  assert(plantRank>0 && plantRank<=3,
    'planted rank unexpected: '+plantRank);
  const realMax=real[0].logPerRune;
  const first=real.slice(0,3).map(x=>({...x}));
  const bestBySeed=SEEDS.map(seed=>real.find(x=>x.seed===seed));
  process.stdout.write(JSON.stringify({
    source:{cipherRunes:TOTAL,nonemptyPages:PAGES.length,
      number2013:1595277641,primeFactors:[1259,1031,1229]},
    family:{modelCount:setups.length,baselines:{
      uniform29:Math.log(1/29),referenceCrossEntropy:baseline}},
    original:{best:first,bestBySeed,
      maxLearnedUnigramLogLikelihood:realMax,
      bestVsUniform:realMax-Math.log(1/29)},
    positive:{setup:trueSetup,rank:plantRank,exactRecoveredRunes:recovered,
      freeSectionInitialRunes:unknown,
      best:positives[0],
      correctModelScore:positives[plantRank-1].logPerRune},
    conclusion:'No source-seeded GP-English plaintext recovery on original LP2 in the specified 864 fixed reversible models.'
  },null,2)+'\n');
}
if(require.main===module)main();
module.exports={decode,encode,search,setupList,sourcePlaintext,main};
