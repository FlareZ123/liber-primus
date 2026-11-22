"use strict";
/**
 * P15 Fibonacci-prime spiral continuation -> entire LP2 length -> authentic
 * LP1 SHADOWS magic-square value341, then two source-historical additive
 * GP29 inverses on the 1894-rune p15-post-grid through p22 chapter tail.
 *
 * Run: node sims/lp2_p15_f17prime_lp2length_shadows_key_sft.cjs
 * This is a conjectured cross-artifact operation; the numerical identity
 * is exact, but no Cicada instruction mandates subtracting the rune count
 * or using SHADOWS as a key.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const gp=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const lp1=fs.readFileSync(path.join(root,"resources/liber-primus/lp1-plaintext-reference.txt"),"utf8");
assert.ok(lp1.includes("SHADOWS"));
assert.ok(lp1.includes("341"));
const printed=[3258,3222,3152,3038,3278,3299,3298,2838,3288,3294,3296,2472,4516,1206,708,1820];
const spiral=[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12];
const fib=[0,1,2];
while(fib.length<=16)fib.push(fib.at(-1)+fib.at(-2));
assert.deepEqual(fib,[0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987,1597]);
/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const out=[];
  for(let candidate=2;out.length<count;candidate++){
    let good=true;
    for(let i=0;i<out.length&&out[i]*out[i]<=candidate;i++)if(candidate%out[i]===0){good=false;break;}
    if(good)out.push(candidate);
  }
  return out;
}
const primes=firstPrimes(fib[16]+1);
assert.equal(primes[fib[16]],13477);
for(let i=0;i<16;i++){
  assert.equal(Math.abs(3301-primes[fib[i]]),printed[spiral[i]],
    "Original p15 4x4 numeric spiral does not match Fibonacci-prime formula");
}
const unknownCount=gp.pages.filter(p=>p.page<56).reduce((s,p)=>s+p.indices.length,0);
const allCount=gp.pages.reduce((s,p)=>s+p.indices.length,0);
assert.equal(unknownCount,12956);
assert.equal(allCount,13136);
assert.equal(13477-allCount,341);
const shadow=[15,8,24,23,3,7,15];
assert.deepEqual(shadow.map(i=>gp.translit[i]),["S","H","A","D","O","W","S"]);
assert.equal(shadow.reduce((s,i)=>s+gp.prime[i],0),341);
const target=gp.pages.filter(p=>p.page>=15&&p.page<=22)
  .flatMap(p=>p.page===15?p.indices.slice(9):p.indices);
assert.equal(target.length,1894);
const mod=x=>(x%29+29)%29;
/**
 * @param {number[]} input
 * @param {number} sign
 * @returns {number[]}
 */
function translate(input,sign){
  return input.map((c,i)=>mod(c+sign*shadow[i%shadow.length]));
}
/** @param {number[]} input @returns {number} */
function ioc(input){
  const counts=Array(29).fill(0);
  for(const c of input)counts[c]++;
  return counts.reduce((s,n)=>s+n*(n-1),0)/(input.length*(input.length-1));
}
const solved=gp.pages.find(p=>p.page===57).indices;
assert.equal(solved.length,95);
assert.ok(ioc(solved)>0.06);
const results=[];
for(const sign of [-1,1]){
  const plain=translate(target,sign);
  assert.deepEqual(translate(plain,-sign),target);
  const plant=Array.from({length:target.length},(_,i)=>solved[i%solved.length]);
  assert.deepEqual(translate(translate(plant,-sign),sign),plant,
    "Authentic p57-native positive control failed");
  results.push({
    sign, target:"p15 red heading after 4x4 grid through p22 end",
    decodedIoC:ioc(plain),
    first70:plain.slice(0,70).map(x=>gp.translit[x]).join(" "),
  });
}
assert.ok(results.every(x=>x.decodedIoC<0.045),
  "Potential native plaintext: inspect before rejecting");
console.log(JSON.stringify({
  status:"PASS: exact numerical link, key inverse lacks native-language signal",
  sourceP15Spiral:printed,
  nextFibIndex:fib[16],nextPrimeOrdinal:fib[16]+1,nextPrime:primes[fib[16]],
  totalLP2Runes:allCount,unknownLP2Runes:unknownCount,
  residual:13477-allCount,
  historicalLP1Square:"SHADOWS=341",keyGP0:shadow,
  immediateAdjacentRuneReceiver:target.length,
  unchangedCipherIoC:ioc(target),
  results,
  note:"The numerical identity is exact but its cross-artifact join and key use are conjectural. No unknown LP2 plaintext.",
},null,2));
