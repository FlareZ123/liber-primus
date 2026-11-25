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
const directBase29 = function directBase29(corpus, previous) {
  const check=(ok,msg)=>{if(!ok)throw Error(msg)};
  const a=corpus.pages.slice(15,23).flatMap((p,i)=>i===0?p.indices.slice(20):p.indices);
  const clear=corpus.pages[57].indices;
  const to29=(n)=>{const d=[];while(n){d.unshift(n%29);n=Math.floor(n/29)}return d};
  const pairs=(a)=>new Set(a.slice(1).map((v,i)=>29*a[i]+v));
  function stats(a,hold){
    const d=new Set(a.filter(v=>!hold||v!==0));
    const b=new Set([...pairs(a)].filter(v=>!hold||(Math.floor(v/29)!==0&&v%29!==0)));
    const pred=Array.from({length:29},()=>new Set()),succ=Array.from({length:29},()=>new Set());
    for(const p of b){const u=Math.floor(p/29),v=p%29;pred[v].add(u);succ[u].add(v)}
    return {digits:d.size,bigrams:b.size,pred:pred.map(s=>[...s].sort((a,b)=>a-b)),succ:succ.map(s=>[...s].sort((a,b)=>a-b))};
  }
  function grammar(codes,hold){
    const c=hold?codes.slice(1):codes;
    const digits=new Set(c.flat()),start=new Set(c.map(w=>w[0])),end=new Set(c.map(w=>w.at(-1)));
    const b=new Set();
    for(const w of c)for(let j=1;j<w.length;j++)b.add(29*w[j-1]+w[j]);
    for(const u of end)for(const v of start)b.add(29*u+v);
    return {digits:digits.size,allowedBigrams:b.size};
  }
  function encode(a,codes,hold,pi){
    return a.flatMap(v=>hold&&v===0?[0]:codes[v].map(d=>pi[d]));
  }
  function reach(a,codes,hold){
    const c=hold?[[0],...codes.slice(1)]:codes;
    const dp=Array(a.length+1).fill(0n);dp[0]=1n;
    let edges=0;
    for(let i=0;i<a.length;i++){
      if(!dp[i])continue;
      for(const w of c){
        if(i+w.length<=a.length&&w.every((v,k)=>a[i+k]===v)){dp[i+w.length]+=dp[i];edges++}
      }
    }
    return {edges,maxPrefix:dp.findLastIndex(v=>v>0n),completePaths:dp.at(-1).toString()};
  }
  function ordinalObstruction(s,hold){
    const all=Array.from({length:29},(_,i)=>i);
    // A putative printed digit-zero must have only one possible immediate encoded predecessor.
    // In mandatory-F mode, digit-one exists only in codeword [1,0].
    if(!hold)return !all.some(z=>s.pred[z].length<=1);
    return !all.slice(1).some(z=>s.pred[z].length<=1)&&!all.slice(1).some(o=>s.succ[o].length===0);
  }
  const originalStats={ordinary:stats(a,false),mandatoryF:stats(a,true)};
  const perms=[Array.from({length:29},(_,i)=>i),Array.from({length:29},(_,i)=>(7*i+11)%29),Array.from({length:29},(_,i)=>(5*i+24)%29)];
  const results=[];
  for(const {name,map} of previous.results){
    const codes=map.map(to29);
    check(new Set(codes.map(w=>w.join(","))).size===29,"direct codebook injectivity");
    for(const hold of [false,true]){
      const g=grammar(codes,hold),s=originalStats[hold?"mandatoryF":"ordinary"];
      const fixed=reach(a,codes,hold);
      const controlFixed=reach(encode(clear,codes,hold,perms[0]),codes,hold);
      check(BigInt(controlFixed.completePaths)>0n,"fixed native direct inverse");
      for(const pi of perms){
        const plant=stats(encode(clear,codes,hold,pi),hold);
        check(plant.digits<=g.digits&&plant.bigrams<=g.allowedBigrams,"all-permutation adjacency bound on plant");
        if(name==="ordinal")check(!ordinalObstruction(plant,hold),"ordinal structural plant");
      }
      const reason=name==="ordinal"?"forced predecessor/successor":s.digits>g.digits?"digit capacity and bigram capacity":"bigram capacity";
      const excluded=name==="ordinal"?ordinalObstruction(s,hold):s.digits>g.digits||s.bigrams>g.allowedBigrams;
      check(excluded&&fixed.completePaths==="0","original direct decoder "+name+" "+hold);
      results.push({name,hold,grammar:g,fixed,controlFixed,permutedNativeControls:perms.length,allPermutationsExcluded:excluded,reason});
    }
  }
  return {originalRunes:a.length,ordinaryDistinct:originalStats.ordinary.digits,ordinaryBigrams:originalStats.ordinary.bigrams,minimumOrdinaryPredecessors:Math.min(...originalStats.ordinary.pred.map(s=>s.length)),nonzeroDistinct:originalStats.mandatoryF.digits,nonzeroBigrams:originalStats.mandatoryF.bigrams,minimumNonzeroPredecessors:Math.min(...originalStats.mandatoryF.pred.slice(1).map(s=>s.length)),minimumNonzeroSuccessors:Math.min(...originalStats.mandatoryF.succ.slice(1).map(s=>s.length)),results};
};
const output = run(corpus);
output.directBase29 = directBase29(corpus,output);
console.log(JSON.stringify(output,null,2));
