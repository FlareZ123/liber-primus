"use strict";
// Single-file reproducible p15 Fibonacci-code / BASE29 inverse.
const fs = require("node:fs");
const path = require("node:path");
const run = function run(corpus) {
  const check=(ok,msg)=>{if(!ok)throw Error(msg)};
  const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const fibonacci=[1,2];
  while(fibonacci.at(-1)<10000000)fibonacci.push(fibonacci.at(-1)+fibonacci.at(-2));
  const ord=Array.from({length:29},(_,i)=>i+1);
  const f=[0,1,2];
  while(f.length<29)f.push(f.at(-1)+f.at(-2));
  const sieve=new Uint8Array(9000001),primes=[];
  for(let i=2;i<sieve.length&&primes.length<=f.at(-1);i++){
    if(sieve[i])continue;
    primes.push(i);
    if(i*i<sieve.length)for(let j=i*i;j<sieve.length;j+=i)sieve[j]=1;
  }
  const fp=f.map(i=>primes[i]), diff=fp.map(p=>Math.abs(3301-p));
  check(eq(diff.slice(0,16),[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516]),"p15 source sequence");
  const maps=[["ordinal",ord],["gematria-prime",corpus.prime],["p15-fibonacci-prime",fp],["p15-absolute-difference",diff]];
  function base29(n) {
    const a=[];
    while(n){a.unshift(Number(n%29n));n/=29n}
    return a;
  }
  function integer(a) {
    let n=0n;
    for(const d of a)n=n*29n+BigInt(d);
    return n;
  }
  function encode(a,map) {
    let n=0n,k=0n;
    for(const c of a){
      let v=map[c],j=fibonacci.findIndex(t=>t>v)-1;
      check(j>=0,"positive code value");
      const top=j;
      let bits=0n;
      for(;j>=0;j--)if(fibonacci[j]<=v){bits|=1n<<BigInt(j);v-=fibonacci[j]}
      check(v===0,"Zeckendorf remainder");
      bits|=1n<<BigInt(top+1);
      n|=bits<<k;
      k+=BigInt(top+2);
    }
    return base29(n);
  }
  function decode(n,map) {
    if(!n)return null;
    let v=0,f=1,g=2,prev=0;
    const out=[],max=Math.max(...map),index=new Map(map.map((v,i)=>[v,i]));
    while(n){
      const bit=Number(n&1n); n>>=1n;
      if(bit&&prev){
        const sym=index.get(v);
        if(sym===undefined)return null;
        out.push(sym);v=0;f=1;g=2;prev=0;
        continue;
      }
      if(bit)v+=f;
      if(v>max||f>max)return null;
      [f,g]=[g,f+g];
      prev=bit;
    }
    return prev===0&&f===1?out:null;
  }
  // Independent unrestricted parser; binary strings and BigInt Fibonacci weights.
  function raw(n) {
    if(!n)return {values:[],complete:false,bits:0};
    const bits=n.toString(2).split("").reverse().join("");
    let v=0n,f=1n,g=2n,prev="0",start=0;
    const values=[];
    for(let i=0;i<bits.length;i++){
      if(bits[i]==="1"&&prev==="1"){
        values.push(v.toString());v=0n;f=1n;g=2n;prev="0";start=i+1;
      }else{
        if(bits[i]==="1")v+=f;
        [f,g]=[g,f+g];prev=bits[i];
      }
    }
    return {values,complete:start===bits.length,bits:bits.length};
  }
  function rawDecode(n,map){
    const r=raw(n);
    if(!r.complete)return null;
    const a=r.values.map(v=>map.indexOf(Number(v)));
    return a.includes(-1)?null:a;
  }
  // Complete reachability with every possible nonempty contiguous frame.
  // Leading zero is impossible in the historical minimal-width BASE29 representation.
  function reach(a,map){
    const N=a.length,dp=Array(N+1).fill(0n),pred=Array(N+1).fill(null);
    dp[0]=1n;
    let tested=0,edges=0,reachable=0;
    for(let i=0;i<N;i++){
      if(dp[i]===0n)continue;
      reachable++;
      if(a[i]===0)continue;
      let n=0n;
      for(let j=i;j<N;j++){
        n=n*29n+BigInt(a[j]);tested++;
        const d=decode(n,map);
        if(d===null)continue;
        edges++;dp[j+1]+=dp[i];
        if(pred[j+1]===null)pred[j+1]=[i,d];
      }
    }
    const best=dp.findLastIndex(v=>v>0n),path=[];
    for(let k=best;k>0;){
      const [i,d]=pred[k];
      check(eq(encode(d,map),a.slice(i,k)),"exact frame replay");
      path.unshift({start:i,end:k,plaintext:d.map(q=>corpus.translit[q]).join(" ")});
      k=i;
    }
    return {tested,edges,reachable,maxPrefix:best,completePaths:dp[N].toString(),longestPrefixPaths:dp[best].toString(),witness:path};
  }
  const frames=corpus.pages.slice(15,23).map((p,i)=>[p.page,i===0?p.indices.slice(20):p.indices]);
  const original=frames.flatMap(([,a])=>a);
  check(original.length===1883,"original length");
  const clear=corpus.pages[57].indices;
  check(clear.length===95,"PARABLE length");
  const results=[];
  for(const [name,map] of maps){
    check(new Set(map).size===29&&map.every(Number.isSafeInteger),"injective codebook "+name);
    for(let n=1n;n<=8191n;n++)check(eq(decode(n,map),rawDecode(n,map)),"independent parser "+name+" "+n);
    for(let i=0;i<29;i++){
      const a=[i],c=encode(a,map);
      check(eq(decode(integer(c),map),a),"single symbol "+name+" "+i);
    }
    const c=encode(clear,map);
    check(eq(decode(integer(c),map),clear),"full native control "+name);
    const plainParts=[clear.slice(0,31),clear.slice(31,63),clear.slice(63)];
    const cipherParts=plainParts.map(a=>encode(a,map));
    for(let i=0;i<plainParts.length;i++)check(eq(decode(integer(cipherParts[i]),map),plainParts[i]),"planted frame "+name);
    const plant=reach(cipherParts.flat(),map);
    check(BigInt(plant.completePaths)>0n,"hidden planted cuts "+name);
    const result=reach(original,map);
    check(result.completePaths==="0","unexpected original complete decoder "+name);
    results.push({name,map,nativeEncoded:c.length,plantedCipher:cipherParts.reduce((n,p)=>n+p.length,0),plantedCompletePaths:plant.completePaths,original:result});
  }
  const rawFrames=[["p15body-p22",original],...frames.map(([p,a])=>["p"+p,a])].map(([label,a])=>{
    const r=raw(integer(a));
    return {label,runes:a.length,bits:r.bits,canonical:a[0]!==0,complete:r.complete,decoded:r.values.length,distinct:new Set(r.values).size,first16:r.values.slice(0,16),max:r.values.reduce((m,v)=>BigInt(v)>BigInt(m)?v:m,"0")};
  });
  check(rawFrames.every(r=>r.distinct>29),"fixed-frame unknown codebook bound");
  return {source:{fib:f,prime:fp,difference:diff},control:{nativeRunes:clear.length,independentIntegersPerCodebook:8191,singleSymbolsPerCodebook:29,plantedPlainFrameLengths:[31,32,32]},rawFrames,results};
};
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname,"../resources/liber-primus/lp2-corpus.json"),"utf8"));
console.log(JSON.stringify(run(corpus),null,2));
