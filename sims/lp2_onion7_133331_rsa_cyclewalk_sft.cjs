'use strict';
/**
 * 2014 Onion7 HTML title 133 / id 331 original LP2 RSA-cyclewalk source gate.
 * Single-file Windows Node 22 test: node sims/lp2_onion7_133331_rsa_cyclewalk_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'resources/cicada2014-onion7-index.html'),'utf8');
const j=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const title=/<title>\s*(\d+)\s*<\/title>/i.exec(html)[1];
const identifier=/<div\s+id="(\d+)"/i.exec(html)[1];
assert.equal(title,'133');assert.equal(identifier,'331');
const N=Number(title+identifier),PHI=105600,WIDTH=29**3;
assert.equal(N,133331);
assert.equal(N,11*17*23*31);
assert.deepEqual([4,6,8,10].map(i=>j.prime[i]),[11,17,23,31]);
assert(WIDTH<N&&N<29**4);
/** @param {number} base @param {number} exponent @returns {number} */
function powmod(base,exponent){
  let result=1;
  while(exponent>0){
    if(exponent%2)result=result*base%N;
    base=base*base%N;exponent=Math.floor(exponent/2);
  }return result;
}
/** @param {number} exponent @returns {number} */
function privateExponent(exponent){
  assert(exponent===133||exponent===331);
  const d=exponent===133?53197:9571;
  assert.equal(exponent*d%PHI,1);
  return d;
}
/**
 * Apply source-hypothetical format-preserving RSA, three GP digits per packet.
 * @param {number[]} src
 * @param {number} exponent
 * @param {boolean} lowFirst
 * @returns {{data:number[],fixed:number,blocks:number,maxWalk:number}}
 */
function transport(src,exponent,lowFirst){
  const data=src.slice();let fixed=0,blocks=0,maxWalk=0;
  for(let i=0;i+2<src.length;i+=3){
    const x=lowFirst?src[i]+29*src[i+1]+841*src[i+2]:841*src[i]+29*src[i+1]+src[i+2];
    let y=x,walk=0;
    do {y=powmod(y,exponent);walk++;assert(walk<=N);} while(y>=WIDTH);
    maxWalk=Math.max(maxWalk,walk);blocks++;if(y===x)fixed++;
    const triple=lowFirst
      ?[y%29,Math.floor(y/29)%29,Math.floor(y/841)%29]
      :[Math.floor(y/841)%29,Math.floor(y/29)%29,y%29];
    data.splice(i,3,...triple);
  }
  return {data,fixed,blocks,maxWalk};
}
/** @param {number[]} symbols @returns {number} */
function ioc(symbols){
  const f=Array(29).fill(0);
  for(const x of symbols)f[x]++;
  return f.reduce((acc,n)=>acc+n*(n-1),0)/(symbols.length*(symbols.length-1));
}
const pages=j.pages.filter(p=>p.page<=55);
const original=pages.flatMap(p=>p.indices);
const known=j.pages.find(p=>p.page===57).indices;
assert.equal(pages.length,56);assert.equal(original.length,12956);assert.equal(known.length,95);
assert(Math.abs(ioc(original)-0.03447839786450569)<1e-14);
assert(Math.abs(ioc(known)-0.06270996640537514)<1e-14);
const results=[];
for(const e of [133,331]){
  const d=privateExponent(e);
  for(const exp of [e,d])for(const little of [false,true]){
    const encrypted=transport(known,e,little).data;
    assert.deepEqual(transport(encrypted,d,little).data,known);
    for(const scope of ['book','page']){
      const units=scope==='book'?[original]:pages.map(p=>p.indices);
      const decoded=units.map(x=>transport(x,exp,little));
      const inverse=exp===e?d:e;
      assert.deepEqual(decoded.flatMap(x=>transport(x.data,inverse,little).data),original);
      const plain=decoded.flatMap(x=>x.data);
      const score=ioc(plain);
      assert(score>0.0344&&score<0.0346);
      results.push({e,exp,scope,orientation:little?'little':'big',ioc:score,
        fixed:decoded.reduce((n,x)=>n+x.fixed,0),
        blocks:decoded.reduce((n,x)=>n+x.blocks,0),
        maxWalk:Math.max(...decoded.map(x=>x.maxWalk)),
        first24:plain.slice(0,24).map(x=>j.translit[x]).join(' ')});
    }
  }
}
assert.equal(results.length,16);
const scores=results.map(x=>x.ioc);
assert(Math.abs(Math.min(...scores)-0.03444567719570804)<1e-8);
assert(Math.abs(Math.max(...scores)-0.0344840816806079)<1e-8);
console.log(JSON.stringify({source:'2014 Onion7 HTML title 133 id 331',
  number:N,factors:[11,17,23,31],gpPrimeIndices:[4,6,8,10],
  runes:original.length,rawIoC:ioc(original),p57ClearIoC:ioc(known),
  originalRoundTrips:results.length,sourceClearPlantRoundTrips:4,
  decodedIoCRange:[Math.min(...scores),Math.max(...scores)],
  authenticUnknownPlaintextRecovered:false,results},null,2));
