"use strict";
/**
 * Test a historically grounded three-prime Blum-style modular-squaring key.
 *
 * Original 2013 Cicada audio/761.MP3 metadata contains 1,595,277,641,
 * product of solved PARABLE GP clause sums 1259 * 1031 * 1229. Both
 * 1259 and 1031 are Blum primes (3 mod4); their product is the ordinary
 * Blum integer, and the three-prime product is an additional candidate
 * public modulus. This is a hypothesis, not a demonstrated historical KDF.
 *
 * Complete original LP2 12,956-rune inversion, 480 prespecified source
 * configurations, source-native hidden-key plant, and exact re-encoding.
 * Run: node sims/parable_threeprime_bbs_source_inverse.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeGP} = require("./exponent_feedback_lookup_attack.cjs");
const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const pageArrays = corpus.pages.filter(p => p.page <= 55 && p.indices.length)
  .map(p => p.indices);
const lens = pageArrays.map(p => p.length);
const original = pageArrays.flat();
const N = original.length;
const train = lens.slice(0,28).reduce((a,b)=>a+b,0);
assert.equal(lens.length,55);
assert.equal(N,12956);
assert.equal(train,6761);
assert.equal(1259*1031*1229,1595277641);
assert.equal(1259%4,3);
assert.equal(1031%4,3);
assert.equal(1229%4,1);

const mod = (x,m) => (x%m+m)%m;
const moduli = [
  {name:"all-three-Parable-primes",N:BigInt(1259*1031*1229)},
  {name:"two-Blum-primes",N:BigInt(1259*1031)}
];
const sourceSeeds = [761,1033,3301,3299,2013,2014];
const keyFormats = ["state-low8","state-low5","bits5-lsb","bits5-msb","bits8-msb"];
const clocks = ["book","page"];
const emission = ["GP29-add","GP28-step"];
const signs = [-1,1];
const exp = [],log = new Int8Array(29).fill(-1);
for(let i=0,v=1;i<28;i++){
  exp.push(v);log[v]=i;v=(v*15)%29;
}
assert.equal(exp.length,28);
assert.equal(exp[0],1);
assert.equal(log[1],0);

/** @param {bigint} modulus @param {number} seed */
function bbs(modulus,seed) {
  let x=BigInt(seed)**2n%modulus;
  assert(x!==0n);
  return () => {
    x=x*x%modulus;
    return x;
  };
}

/** @param {bigint} modulus @param {number} seed @param {string} mode */
function keyGenerator(modulus,seed,mode) {
  const next=bbs(modulus,seed);
  return () => {
    if(mode==="state-low8")return Number(next()&255n);
    if(mode==="state-low5")return Number(next()&31n);
    const bits=mode.startsWith("bits5")?5:8;
    let value=0;
    for(let i=0;i<bits;i++){
      const bit=Number(next()&1n);
      if(mode.endsWith("lsb"))value|=bit<<i;
      else value=(value<<1)|bit;
    }
    return value;
  };
}

/** @param {{N:bigint}} modulus @param {number} seed @param {string} mode @param {string} clock */
function generateKey(modulus,seed,mode,clock) {
  const pads=new Uint8Array(N);
  let p=0,draw=keyGenerator(modulus.N,seed,mode);
  for(const len of lens){
    if(clock==="page")draw=keyGenerator(modulus.N,seed,mode);
    for(let i=0;i<len;i++)pads[p++]=draw();
  }
  return pads;
}

/**
 * A bijective 29-way GP cipher in additive mode; a bijective
 * transparent-EA alphabet for the 28 nonzero GP29 field steps.
 * Each physical page begins with a literal initialization symbol in
 * the 28-step family; it still consumes its designated key position.
 */
function transform(input,key,model,sign,decrypt) {
  const output = new Uint8Array(N);
  let p=0;
  for(const len of lens){
    for(let i=0;i<len;i++,p++){
      const k=key[p],value=input[p];
      if(model==="GP29-add") {
        output[p]=mod(value+(decrypt?-sign:sign)*k,29);
      } else if(i===0) {
        output[p]=value;
      } else if(decrypt){
        const step=mod(value-input[p-1],29);
        output[p]=step===0?28:mod(log[step]-sign*k,28);
      } else {
        output[p]=value===28?output[p-1]:
          mod(output[p-1]+exp[mod(value+sign*k,28)],29);
      }
    }
  }
  return output;
}

function ioc(indices,start,end){
  const h=new Uint32Array(29);
  for(let i=start;i<end;i++)h[indices[i]]++;
  let s=0;for(const n of h)s+=n*(n-1);
  return s/((end-start)*(end-start-1));
}

function settings(){
  const out=[];
  for(const modulus of moduli)for(const seed of sourceSeeds)
    for(const mode of keyFormats)for(const clock of clocks)
      for(const model of emission)for(const sign of signs)
        out.push({modulus:modulus.name,seed,mode,clock,model,sign});
  assert.equal(out.length,480);
  return out;
}

function evaluate(cipher) {
  const results=[],models=settings();
  for(const modulus of moduli)for(const seed of sourceSeeds)
    for(const mode of keyFormats)for(const clock of clocks){
      const key=generateKey(modulus,seed,mode,clock);
      for(const model of emission)for(const sign of signs){
        const plain=transform(cipher,key,model,sign,true);
        results.push({modulus:modulus.name,seed,mode,clock,model,sign,
          train:ioc(plain,0,train),hold:ioc(plain,train,N)});
      }
    }
  results.sort((a,b)=>b.train-a.train);
  assert.equal(results.length,models.length);
  return results;
}

function planted(){
  const control=encodeGP(fs.readFileSync(path.join(root,
    "resources/control/shakespeare_first300k.txt"),"utf8"));
  assert(control.length>N);
  const source=Uint8Array.from(control.slice(0,N));
  const chosen={modulus:"all-three-Parable-primes",seed:3301,
    mode:"bits5-msb",clock:"page",model:"GP28-step",sign:1};
  const key=generateKey(moduli[0],chosen.seed,chosen.mode,chosen.clock);
  const cipher=transform(source,key,chosen.model,chosen.sign,false);
  const restored=transform(cipher,key,chosen.model,chosen.sign,true);
  assert.deepEqual(Array.from(restored),Array.from(source),
    "correct seeded original-shape GP source must invert exactly");
  const ranked=evaluate(cipher);
  const best=ranked[0];
  assert.ok(Object.entries(chosen).every(([k,v])=>best[k]===v),
    "blind original-shape control failed to identify planted BBS key");
  return {chosen,best:{...best,
    exactRunes:restored.reduce((n,x,i)=>n+Number(x===source[i]),0)},
    wrongKeyTop:ranked[1]};
}

function main(){
  const originalRanked=evaluate(Uint8Array.from(original));
  const control=planted();
  const bestByModulus=moduli.map(m=>{
    const xs=originalRanked.filter(c=>c.modulus===m.name);
    return xs.slice(0,3);
  });
  const output={source:"2013 original 761.MP3 Parable ID3 primes and solved LP2 text",
    sourcePrimeFactors:[1259,1031,1229],
    moduli:moduli.map(m=>({name:m.name,N:String(m.N)})),
    seedCandidates:sourceSeeds,keyFormats,clocks,emission,signs,
    totalOriginalRunes:N,trainRunes:train,heldoutRunes:N-train,
    tested:originalRanked.length,originalBestTen:originalRanked.slice(0,10),
    bestByModulus,uniformIoC:1/29,planted:control,
    status:"No historical key or plaintext asserted; bounded source-derived test"};
  console.log(JSON.stringify(output,null,2));
  return output;
}
if(require.main===module)main();
module.exports={bbs,keyGenerator,generateKey,transform,settings,evaluate,planted,main};
