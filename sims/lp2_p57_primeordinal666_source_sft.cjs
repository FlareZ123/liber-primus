"use strict";
/**
 * Solved LP2 p57 PARABLE: exact four-period GP prime-sum and ordinal identity.
 * Reproduce: node sims/lp2_p57_primeordinal666_source_sft.cjs
 * Original page and punctuation, no guessed ciphertext or translation.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const c = JSON.parse(fs.readFileSync(
  path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const transcription = fs.readFileSync(
  path.join(root,"resources/liber-primus/lp2-transcription.txt"),"utf8");
const text = transcription.split(/\n%\n/u).at(-1).replaceAll("/\n","");
const segments = text.split(".").slice(0,4);
const runeIndex = new Map(c.runes.map((r,i)=>[r,i]));
const indexed = segments.map(s => [...s].filter(v=>runeIndex.has(v))
  .map(v=>runeIndex.get(v)));
assert.deepEqual(indexed.map(x=>x.length),[7,30,30,28]);
assert.deepEqual(indexed.flat(), c.pages.find(p=>p.page===57).indices);
const sums = indexed.map(v=>v.reduce((s,i)=>s+c.prime[i],0));
assert.deepEqual(sums,[449,1259,1031,1229]);

const limit=8000;
const prime=new Uint8Array(limit+1).fill(1);
prime[0]=prime[1]=0;
for(let i=2;i*i<=limit;i++) if(prime[i])
  for(let j=i*i;j<=limit;j+=i) prime[j]=0;
const rank=new Uint32Array(limit+1);
for(let i=1;i<=limit;i++) rank[i]=rank[i-1]+prime[i];
assert(sums.every(n=>prime[n]===1));
assert.deepEqual(sums.map(n=>rank[n]),[87,205,173,201]);
assert.equal(sums.reduce((s,n)=>s+n,0),3968);
assert.equal(sums.reduce((s,n)=>s+rank[n],0),666);

// Two intentionally simple, matched-inventory diagnostics, never a discovery
// p-value. Preserve the title; randomize full body runes at 30/30/28 lengths
// or the 19 complete original source words at 7/6/6 word counts.
let seed=0x3301666;
/** @returns {number} */
const random=()=>{
  seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  return (seed>>>0)/4294967296;
};
/** @template T @param {T[]} a @returns {T[]} */
const shuffle=a=>{
  a=[...a];
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
};
const words=segments.slice(1).map(s=>s.split("-").filter(Boolean)
  .map(w=>[...w].filter(ch=>runeIndex.has(ch)).map(ch=>c.prime[runeIndex.get(ch)])));
assert.deepEqual(words.map(row=>row.map(w=>w.length)),
  [[4,2,6,7,2,2,7],[2,4,4,3,3,14],[4,2,8,5,3,6]]);
const sourceWords=words.flat(),body=indexed.slice(1).flat().map(i=>c.prime[i]);
assert.equal(body.length,88);
const n=100000;
const tallies={
  runeShuffle:{allThreePrime:0,allThreePrimeAnd666:0},
  wordShuffle:{allThreePrime:0,allThreePrimeAnd666:0},
  wordShufflePreserveRuneLengths:{matchingSamples:0,allThreePrime:0,allThreePrimeAnd666:0}
};
const record=(s,counts)=>{
  const isPrime=counts.every(n=>prime[n]);
  const ordinalSum=rank[449]+counts.reduce((sum,n)=>sum+rank[n],0);
  if(isPrime){
    s.allThreePrime++;
    if(ordinalSum===666)s.allThreePrimeAnd666++;
  }
};
for(let t=0;t<n;t++){
  const r=shuffle(body),a=[0,0,0];
  for(let i=0;i<r.length;i++) a[i<30?0:i<60?1:2]+=r[i];
  record(tallies.runeShuffle,a);
  const w=shuffle(sourceWords);
  const groups=[w.slice(0,7),w.slice(7,13),w.slice(13)];
  const b=groups.map(g=>g.flat().reduce((s,p)=>s+p,0));
  record(tallies.wordShuffle,b);
  if(groups.every((g,i)=>g.reduce((s,p)=>s+p.length,0)===[30,30,28][i])){
    tallies.wordShufflePreserveRuneLengths.matchingSamples++;
    record(tallies.wordShufflePreserveRuneLengths,b);
  }
}
assert.deepEqual(tallies,{
  runeShuffle:{allThreePrime:367,allThreePrimeAnd666:52},
  wordShuffle:{allThreePrime:416,allThreePrimeAnd666:76},
  wordShufflePreserveRuneLengths:{matchingSamples:279,allThreePrime:2,allThreePrimeAnd666:0}
});
console.log(JSON.stringify({
  status:"PASS",
  original:"LP2 p57 original printed title and three full-stop-delimited sentences",
  runeCounts:indexed.map(g=>g.length),
  primeSums:sums,primeOrdinals:sums.map(n=>rank[n]),
  ordinalTotal:666,sourceNativeRuneMatches:indexed.flat().length,
  exploratoryInventoryShuffle:{trials:n,seed:"0x3301666",tallies},
  recoveredUnknownPlaintext:0
},null,2));
