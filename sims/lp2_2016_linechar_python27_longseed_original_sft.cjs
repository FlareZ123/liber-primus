'use strict';
/**
 * Source-frozen 2016 word/line candidate -> 63-bit Python 2.7 integer seed.
 * Test the historical CPython MT19937 byte/GP projection against original
 * LP2 GP29, then against predecessor-excluding GP28 (doublets as markers).
 *
 * The source-selected-coordinate and candidate seed are unconfirmed.
 * Run on Windows/Linux: node sims/lp2_2016_linechar_python27_longseed_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {sourcePlaintext} = require('./instar2013_source_seed_inverse.cjs');
const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length);
const cipher = pages.flatMap(p => p.indices);
const SEED = 7144649572585460758n;
const WORDS = 'LCBPNGPARRTHBPC';
const REF = [1854244114,2391108977,1268134153,2010639657,
  4028966162,3243037425,1176963656,584020998];
assert.equal(cipher.length, 12956);
assert.equal(pages.length, 55);
assert.equal(WORDS.length, 15); // 13 GP tokens; NG and TH are digraphs.
const chunks = {
  book: [cipher],
  page: pages.map(p => p.indices),
  chapter: [[0,2],[3,7],[8,14],[15,22],[23,26],
    [27,32],[33,39],[40,53],[54,55]].map(([a,b]) =>
    pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices))
};
const mod = (x, n) => ((x % n) + n) % n;

/** Exact CPython 2.7 MT19937 init_by_array for arbitrary nonnegative int. */
class MT {
  /** @param {bigint} seed */
  constructor(seed) {
    assert(seed>=0n);
    const key=[];
    let n=seed;
    do {key.push(Number(n & 0xffffffffn));n>>=32n;} while(n);
    const m=new Uint32Array(624);
    m[0]=19650218;
    for(let i=1;i<624;i++){
      const x=m[i-1];
      m[i]=(Math.imul(1812433253,x^(x>>>30))+i)>>>0;
    }
    let i=1,j=0;
    for(let k=Math.max(624,key.length);k>0;k--){
      const x=m[i-1];
      m[i]=((m[i]^Math.imul(x^(x>>>30),1664525))+key[j]+j)>>>0;
      i++;j++;
      if(i===624){m[0]=m[623];i=1;}
      if(j===key.length)j=0;
    }
    for(let k=623;k>0;k--){
      const x=m[i-1];
      m[i]=((m[i]^Math.imul(x^(x>>>30),1566083941))-i)>>>0;
      i++;
      if(i===624){m[0]=m[623];i=1;}
    }
    m[0]=0x80000000;
    this.m=m;
    this.i=624;
  }
  twist(){
    const m=this.m;
    for(let j=0;j<624;j++){
      const y=(m[j]&0x80000000)|(m[(j+1)%624]&0x7fffffff);
      m[j]=(m[(j+397)%624]^(y>>>1)^((y&1)?0x9908b0df:0))>>>0;
    }
    this.i=0;
  }
  /** @returns {number} An unsigned 32-bit output. */
  next32(){
    if(this.i===624)this.twist();
    let x=this.m[this.i++];
    x^=x>>>11;
    x^=(x<<7)&0x9d2c5680;
    x^=(x<<15)&0xefc60000;
    x^=x>>>18;
    return x>>>0;
  }
  /** @param {number} radix 28 or 29. */
  draw(radix, projection){
    if(projection==='bits5'){
      let n=this.next32()>>>27;
      while(n>=radix)n=this.next32()>>>27;
      return n;
    }
    if(projection==='float53'){
      const a=this.next32()>>>5,b=this.next32()>>>6;
      return Math.floor(radix*(a*67108864+b)/9007199254740992);
    }
    const x=this.next32();
    return projection==='scale32' ? Math.floor(x*radix/4294967296) : x%radix;
  }
}
/** @param {number[]} values @param {number} alphabet */
function ioc(values,alphabet){
  const counts=new Uint32Array(alphabet);
  for(const v of values){assert(v>=0&&v<alphabet);counts[v]++;}
  let numerator=0;
  for(const n of counts)numerator+=n*(n-1);
  return numerator/(values.length*(values.length-1));
}
function decode29(groups,projection,sign){
  const output=[];
  for(const g of groups){
    const gen=new MT(SEED);
    for(const c of g)output.push(mod(c+sign*gen.draw(29,projection),29));
  }
  return output;
}
function encode29(plaintext,groups,projection,sign){
  let offset=0;
  const output=[];
  for(const g of groups){
    const gen=new MT(SEED);
    for(let j=0;j<g.length;j++)
      output.push(mod(plaintext[offset++]-sign*gen.draw(29,projection),29));
  }
  return output;
}
/** GP28 symbols 0..27; literal source repeats become 28 and consume/hold. */
function decode28(groups,projection,sign,rank,hold){
  const output=[];
  for(const g of groups){
    const gen=new MT(SEED);
    output.push(28); // transmitted initial rune
    for(let j=1;j<g.length;j++){
      const prev=g[j-1],cur=g[j];
      if(prev===cur){
        if(!hold)gen.draw(28,projection);
        output.push(28);
      }else{
        const digit=rank==='sorted' ? cur-Number(cur>prev) : mod(cur-prev,29)-1;
        output.push(mod(digit+sign*gen.draw(28,projection),28));
      }
    }
  }
  return output;
}
function encode28(plaintext,groups,projection,sign,rank,hold){
  let offset=0;
  const output=[];
  for(const g of groups){
    const gen=new MT(SEED);
    let prev=g[0];
    output.push(prev);
    offset++;
    for(let j=1;j<g.length;j++){
      const p=plaintext[offset++];
      if(p===28){
        if(!hold)gen.draw(28,projection);
      }else{
        const digit=mod(p-sign*gen.draw(28,projection),28);
        prev=rank==='sorted' ? digit+Number(digit>=prev) :
          mod(prev+digit+1,29);
      }
      output.push(prev);
    }
  }
  assert.equal(offset,plaintext.length);
  return output;
}
const projections=['mod32','scale32','bits5','float53'];
const resets=['book','chapter','page'];
function run(){
  assert.deepEqual(Array.from({length:8},()=>new MT(SEED)).length ? 
    (()=>{const g=new MT(SEED);return Array.from({length:8},()=>g.next32());})() : [],REF);
  const native=sourcePlaintext().slice(50000,50000+cipher.length);
  assert.equal(native.length,cipher.length);
  const direct=[];
  for(const reset of resets)for(const projection of projections)
  for(const sign of [-1,1]){
    const decoded=decode29(chunks[reset],projection,sign);
    direct.push({reset,projection,sign,ioc:ioc(decoded,29),
      first16:decoded.slice(0,16).map(x=>corpus.translit[x]).join('')});
  }
  direct.sort((a,b)=>b.ioc-a.ioc);
  const best=direct[0];
  const rec=decode29(chunks[best.reset],best.projection,best.sign);
  assert.deepEqual(encode29(rec,chunks[best.reset],best.projection,best.sign),
    cipher);
  const positive=encode29(native,chunks[best.reset],
    best.projection,best.sign);
  assert.deepEqual(decode29(
    (()=>{let off=0;return chunks[best.reset].map(g=>positive.slice(
      off,off+=g.length));})(),best.projection,best.sign),native);
  assert(ioc(native,29)>0.05);
  const rankRuns=[];
  for(const reset of resets)for(const projection of projections)
  for(const rank of ['sorted','cyclic'])for(const hold of [false,true])
  for(const sign of [-1,1]){
    const decoded=decode28(chunks[reset],projection,sign,rank,hold);
    const valid=decoded.filter(v=>v!==28);
    rankRuns.push({reset,projection,rank,hold,sign,
      ioc:ioc(valid,28),decoded:valid.length,erased:decoded.length-valid.length});
  }
  rankRuns.sort((a,b)=>b.ioc-a.ioc);
  const best28=rankRuns[0];
  const groups=chunks[best28.reset];
  const original=decode28(groups,best28.projection,best28.sign,
    best28.rank,best28.hold);
  assert.deepEqual(encode28(original,groups,best28.projection,
    best28.sign,best28.rank,best28.hold),cipher);
  let off=0;
  const native28=original.map(v=>{
    const i=off++;
    return v===28 ? 28 : native[i]===28 ? 0 : native[i];
  });
  const plant=encode28(native28,groups,best28.projection,
    best28.sign,best28.rank,best28.hold);
  let start=0;
  const plantedGroups=groups.map(g=>plant.slice(start,start+=g.length));
  assert.deepEqual(decode28(plantedGroups,best28.projection,best28.sign,
    best28.rank,best28.hold),native28);
  const native28Ioc=ioc(native28.filter(v=>v!==28),28);
  assert(native28Ioc>0.05);
  const result={
    hypothesis:'2016 conditional PRNG mnemonic -> 63-bit Python 2.7 MT',
    seedDecimal:String(SEED),keyWords:WORDS,originalRunes:cipher.length,
    originalAdjacentRepeats:86,
    Python27LongIntegerSeedReference:REF,
    gp29:{models:direct.length,rawIoc:ioc(cipher,29),
      best,range:[direct.at(-1).ioc,best.ioc],
      plantedNativeIoc:ioc(native,29),positiveRecovery:12956},
    gp28:{models:rankRuns.length,best:best28,
      range:[rankRuns.at(-1).ioc,best28.ioc],
      plantedNativeIoc:native28Ioc,positiveRecovery:best28.decoded},
    decision:'No decoded unknown LP2 plaintext or independently selected operation.'
  };
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  return result;
}
if(require.main===module)run();
module.exports={MT,run,decode29,decode28};
