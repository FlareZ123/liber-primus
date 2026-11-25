'use strict';
// Director #2681. Run: node sims/lp2_p50_python27_sample_rows_sft.cjs <path-to-pinned-TIMESTAMP-SEED-CANDIDATES.json>
const fs=require('node:fs');
function experiment(grid,seedDoc){
 const assert=(x,m)=>{if(!x)throw Error(m)},same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 function random27(seed){
  let v=BigInt(seed);if(v<0n)v=-v;const key=[];do{key.push(Number(v&0xffffffffn));v>>=32n}while(v);
  const mt=new Uint32Array(624);mt[0]=19650218;
  for(let i=1;i<624;i++)mt[i]=(Math.imul(mt[i-1]^(mt[i-1]>>>30),1812433253)+i)>>>0;
  let i=1,j=0;
  for(let k=Math.max(624,key.length);k>0;k--){mt[i]=((mt[i]^Math.imul(mt[i-1]^(mt[i-1]>>>30),1664525))+key[j]+j)>>>0;if(++i>=624){mt[0]=mt[623];i=1}if(++j>=key.length)j=0}
  for(let k=623;k>0;k--){mt[i]=((mt[i]^Math.imul(mt[i-1]^(mt[i-1]>>>30),1566083941))-i)>>>0;if(++i>=624){mt[0]=mt[623];i=1}}
  mt[0]=0x80000000;let index=624;
  function word(){if(index>=624){for(let k=0;k<624;k++){const y=(mt[k]&0x80000000)|(mt[(k+1)%624]&0x7fffffff);mt[k]=(mt[(k+397)%624]^(y>>>1)^((y&1)?0x9908b0df:0))>>>0}index=0}let y=mt[index++];y^=y>>>11;y^=(y<<7)&0x9d2c5680;y^=(y<<15)&0xefc60000;y^=y>>>18;return y>>>0}
  return ()=>((word()>>>5)*67108864+(word()>>>6))/9007199254740992;
 }
 // CPython v2.7.6 Lib/random.py sample, n=256, k=8:
 // setsize = 21 + 4**ceil(log(24,4)) = 85; uses selected-set rejection.
 function table(seed){const random=random27(seed),out=[];for(let row=0;row<32;row++){const selected=new Set();while(selected.size<8){const j=Math.floor(random()*256);if(!selected.has(j)){selected.add(j);out.push(j)}}}return out}
 const vectors=[[0,[216,194,107,66,130,103,200,77,122,149,232,129,72,193,158,64]],[1,[34,216,195,65,126,115,166,201,24,7,213,110,195,0,114,184]],[3301,[55,116,110,122,151,223,204,100,157,188,134,126,228,41,170,97]],[1325734783,[145,229,170,75,171,95,154,155,224,210,26,72,222,45,226,53]],[1325734783000,[213,251,118,139,180,234,186,156,140,0,152,242,197,94,93,80]]];
 for(const [seed,expected] of vectors)assert(same(table(seed).slice(0,16),expected),"independent MT/sample vectors "+seed);
 const seeds=seedDoc.candidates.map(x=>x.seed);assert(seeds.length===433&&new Set(seeds).size===433&&seeds.every(Number.isSafeInteger),"frozen seed domain");
 const tests=seeds.map(seed=>({seed,out:table(seed)}));
 function scan(target){let firstRows=[],full=[],maxPrefix=0,maxAgreement=0,bestAgreement=[];for(const {seed,out} of tests){let p=0;while(p<256&&out[p]===target[p])p++;if(p>=8)firstRows.push(seed);if(p===256)full.push(seed);maxPrefix=Math.max(maxPrefix,p);const agree=out.reduce((n,x,i)=>n+(x===target[i]),0);if(agree>maxAgreement){maxAgreement=agree;bestAgreement=[seed]}else if(agree===maxAgreement)bestAgreement.push(seed)}return {firstRows,full,maxPrefix,maxAgreement,bestAgreement}}
 const tokens=grid.pages.flatMap(p=>p.tokens);assert(tokens.length===256,"table length");
 const actual=[grid.alphabet.replace("f",""),grid.alphabet].map(alphabet=>{const radix=alphabet.length,values=tokens.map(t=>radix*alphabet.indexOf(t[0])+alphabet.indexOf(t[1]));assert(values.every(v=>v>=0&&v<256),"range");for(let j=0;j<256;j+=8)assert(new Set(values.slice(j,j+8)).size===8,"distinct row");return {radix,first:values.slice(0,8),...scan(values)}});
 const plants=[0,101,211,432].map(i=>{let seed=seeds[i],q=scan(table(seed));assert(q.full.length===1&&q.full[0]===seed,"planted full table");return {seed,...q}});
 const denom=Array.from({length:8},(_,i)=>256-i).reduce((a,b)=>a*b,1);
 return {seedCount:seeds.length,vectorCount:vectors.length,actual,plants,unionBoundFirstRow:2*seeds.length/denom,log10UnionBoundFullTable:Math.log10(2*seeds.length)-32*Math.log10(denom)};
}
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
console.log(JSON.stringify(experiment(read('resources/liber-primus/lp2-grid-256.json'),read(process.argv[2])),null,2));
