"use strict";
/**
 * Fixed original-LP2 GP29 test of the historical GIMP Dissolve MT generator.
 * Node.js 20+, from repo root: node sims/lp2_gimp_dissolve_gp29_original_sft.cjs
 * No guessed seed, phase or clock; no claim that renderer state is an LP2 key.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
/** @param {string} p */
const load=p=>fs.readFileSync(path.join(root,p),"utf8");
const gp=JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const original=gp.pages.filter(p=>p.page<=55&&p.indices.length)
  .flatMap(p=>p.indices);
assert.equal(original.length,12956);
/** @param {number} seed @returns {()=>number} */
function mt19937(seed){
  const state=new Uint32Array(624);
  state[0]=seed>>>0;
  for(let i=1;i<624;i++)
    state[i]=(Math.imul(1812433253,state[i-1]^(state[i-1]>>>30))+i)>>>0;
  let ptr=624;
  return ()=>{
    if(ptr===624){
      for(let j=0;j<624;j++){
        const y=(state[j]&0x80000000)|(state[(j+1)%624]&0x7fffffff);
        state[j]=(state[(j+397)%624]^(y>>>1)^((y&1)?0x9908b0df:0))>>>0;
      }
      ptr=0;
    }
    let y=state[ptr++];
    y^=y>>>11;y^=(y<<7)&0x9d2c5680;y^=(y<<15)&0xefc60000;
    y^=y>>>18;
    return y>>>0;
  };
}
const masterCheck=mt19937(314159265);
assert.deepEqual(Array.from({length:8},()=>mtMaster()),[
  3721122731,618219707,807213306,3144837749,
  3447982176,3230631767,755972506,1398685501
]);
function mtMaster(){return masterCheck();}
function mtRow(){return rowCheck();}
const rowCheck=mt19937(3721122731);
assert.deepEqual(Array.from({length:8},()=>mtRow()),[
  505524582,4277517655,1702989131,912900261,
  1432505218,4108960502,2270003630,316039421
]);
/** @param {number[]} a */
function ioc(a){
  const f=Array(29).fill(0);
  for(const x of a)f[x]++;
  return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
/** @param {number} x */
const mod=x=>(x%29+29)%29;
/** @param {string} raw */
function gpEncode(raw){
  const lookup=new Map(gp.translit.map((s,i)=>[s,i]));
  const clean=raw.toUpperCase().replace(/[KVQZ]/gu,c=>({K:"C",V:"U",Q:"C",Z:"S"})[c])
    .replace(/[^A-Z]/gu,"");
  const out=[];
  for(let i=0;i<clean.length;i++){
    const pair=clean.slice(i,i+2);
    if(lookup.has(pair)){out.push(lookup.get(pair));i++;}
    else out.push(lookup.get(clean[i]));
  }
  assert(out.every(x=>Number.isInteger(x)&&x>=0&&x<29));
  return out;
}
const native=gpEncode(load("resources/control/shakespeare_first300k.txt"));
assert(native.length>20956);
const nativeIoc=[ioc(native.slice(0,12956)),ioc(native.slice(8000,20956))];
assert(nativeIoc.every(x=>x>0.058));
const origIoc=ioc(original);
assert(Math.abs(origIoc-0.03447839786450569)<1e-12);
const results=[];
for(const [name,seed] of [["master",314159265],["row0",3721122731]]){
  const next=mt19937(seed);
  const raw=Array.from({length:12956},()=>next());
  for(const map of ["mod29","scaled"]){
    const key=raw.map(x=>map==="mod29"?x%29:Math.floor(x*29/4294967296));
    for(const sign of [-1,1]){
      const dec=original.map((c,i)=>mod(c+sign*key[i]));
      assert.deepEqual(dec.map((p,i)=>mod(p-sign*key[i])),original);
      const plant=native.slice(0,12956);
      const synthetic=plant.map((p,i)=>mod(p-sign*key[i]));
      assert.deepEqual(synthetic.map((c,i)=>mod(c+sign*key[i])),plant);
      results.push({name,seed,map,sign,ioc:ioc(dec),
        prefix:dec.slice(0,32).map(x=>gp.translit[x]).join("")});
    }
  }
}
assert.equal(results.length,8);
assert.deepEqual(results.map(x=>+x.ioc.toFixed(10)),[
  0.0344640394,0.0344627644,0.0344888003,0.0344914694,
  0.0344628835,0.0344657791,0.0344832118,0.0344990836
]);
console.log(JSON.stringify({source:"original 12956 unknown LP2 runes",
  rawIoc:origIoc,nativeIoc,results,plaintextRecovered:false,
  scope:"8 direct unskipped GP29 additive mappings"},null,2));
