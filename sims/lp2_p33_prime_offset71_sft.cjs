"use strict";
/**
 * Source-derived p56 prime/totient offsets on p33's first 81-rune body.
 * Run: node sims/lp2_p33_prime_offset71_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const original=fs.readFileSync(path.join(root,"resources/liber-primus/lp2-transcription.txt"),"utf8");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const alphabet=corpus.runes,translit=corpus.translit,runeSet=new Set(alphabet);
function sha1Blob(s){
  const b=Buffer.from(s,"utf8");
  return crypto.createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex");
}
function isPrime(n){
  if(n<2)return false;
  for(let d=2;d*d<=n;d++)if(n%d===0)return false;
  return true;
}
function primesFromValue(start,count){
  assert.ok(isPrime(start));
  const out=[];
  for(let n=start;out.length<count;n++)if(isPrime(n))out.push(n);
  return out;
}
function primesFromTwo(count){
  const out=[];
  for(let n=2;out.length<count;n++)if(isPrime(n))out.push(n);
  return out;
}
function ioc(values){
  const counts=Array(29).fill(0);
  for(const x of values)counts[x]++;
  return counts.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
}
function decode(cipher,primes,mask,fpos){
  assert.equal(cipher.length,81);
  assert.equal(primes.length,81);
  let clock=0;
  const plain=cipher.map((x,i)=>{
    const f=fpos.indexOf(i);
    if(f>=0&&(mask&(1<<f))){
      assert.equal(x,0);
      return 0;
    }
    return (x-((primes[clock++]-1)%29)+29)%29;
  });
  let check=0;
  for(let i=0;i<plain.length;i++){
    const f=fpos.indexOf(i);
    if(f>=0&&(mask&(1<<f))){
      assert.equal(cipher[i],0);
      continue;
    }
    assert.equal((plain[i]+(primes[check++]-1))%29,cipher[i]);
  }
  return {
    mask,literalF:fpos.filter((_,k)=>mask&(1<<k)),
    usedPrimes:clock,primeStart:primes[0],primeEnd:primes[clock-1],
    ioc:ioc(plain),latin:plain.map(x=>translit[x]).join("")
  };
}
function run(){
  assert.equal(sha1Blob(original),"43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7");
  const all=[...original].filter(ch=>runeSet.has(ch));
  assert.equal(all.length,13136);
  const title=all.slice(7960,7970),body=all.slice(7970,8051);
  assert.equal(title.length,10);
  assert.equal(body.length,81);
  const cipher=body.map(ch=>alphabet.indexOf(ch));
  const fpos=cipher.map((x,i)=>x===0?i:-1).filter(x=>x>=0);
  assert.deepEqual(fpos,[2,38]);
  const value71=primesFromValue(71,81);
  const allPrimes=primesFromTwo(161);
  const index81=allPrimes.slice(80,161);
  assert.equal(index81[0],419);
  const results=[];
  for(let mask=0;mask<4;mask++){
    results.push({model:"prime-value-71",...decode(cipher,value71,mask,fpos)});
    results.push({model:"71st-prime + 10-rune title -> 81st-prime",...decode(cipher,index81,mask,fpos)});
  }
  const out={
    originalBlob:sha1Blob(original),
    sourceRuneOffsets:{title:[7960,7970],body:[7970,8051]},
    titleRunes:title.map(ch=>translit[alphabet.indexOf(ch)]).join(""),
    bodyRunes:body.length,fPositions:fpos,
    models:[
      {name:"prime-value-71",firstPrime:value71[0],lastPrime:value71.at(-1)},
      {name:"71st-prime + 10 title positions",firstPrime:index81[0],lastPrime:index81.at(-1)}
    ],
    outputs:results
  };
  console.log(JSON.stringify(out,null,2));
  return out;
}
if(require.main===module)run();
module.exports={run};
