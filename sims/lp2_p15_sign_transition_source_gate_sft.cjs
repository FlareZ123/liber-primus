"use strict";
/**
 * P15 signed-prime transition and historical NUMBER/KOAN source gate.
 * Reproduce from the repository root:
 *   node sims/lp2_p15_sign_transition_source_gate_sft.cjs
 *
 * NUMBER below mirrors a participant-reconstructed 2013 first-onion server,
 * not an authenticated Cicada server implementation.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const image = fs.readFileSync(path.join(root, "resources/liber-primus/32.jpg"));
const imageSHA256 = crypto.createHash("sha256").update(image).digest("hex");
assert.equal(imageSHA256, "5543cfce96493b86eece3195b3f5ea6e779ff41551676600b0c2479fc18c0ec5");
const grid = [[3258,3222,3152,3038],[3278,3299,3298,2838],[3288,3294,3296,2472],[4516,1206,708,1820]];
const spiral = [[1,1],[1,2],[2,2],[2,1],[2,0],[1,0],[0,0],[0,1],[0,2],[0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[3,0]];
const fib = [0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987];
function isPrime(n) { if (!Number.isSafeInteger(n) || n < 2) return false; for (let d=2;d*d<=n;d++) if(n%d===0)return false; return true; }
const primes=[]; for(let n=2;n<=10000;n++) if(isPrime(n)) primes.push(n);
const primeIndex=new Map(primes.map((p,i)=>[p,i+1]));
function divisors(n) { const a=[]; for(let d=1;d<=n;d++) if(n%d===0)a.push(d); return a; }
function numberOutcome(n) {
  if(isPrime(n)) { const rev=Number(String(n).split("").reverse().join("")); return isPrime(rev)?{kind:"plus"}:{kind:"factors",target:rev,divisors:divisors(rev)}; }
  return {kind:"factors",target:n,divisors:divisors(n)};
}
// The reconstructed handler strips '-' before parsing its numeric argument.
function numberInput(command) {
  const cleaned=command.toLowerCase().replace(/[^a-z0-9_ \t]/g,"").replace(/q/g,"");
  const parts=cleaned.trim().split(/\s+/);
  if(parts.length===2&&parts[0]==="number"&&/^\d+$/.test(parts[1])) return Number(parts[1]);
  throw new Error("not a reconstructed NUMBER command: "+command);
}
let primeCandidateCount=0;
const rows=fib.map((f,i)=>{
  const p=primes[f]; // p_(F+1): zero-based array index F
  const signed=3301-p, [r,c]=spiral[i], printed=grid[r][c];
  assert.equal(Math.abs(signed),printed,"source cell "+r+","+c);
  const candidates=[3301-printed,3301+printed].filter(isPrime).map(q=>({prime:q,ordinalMinusOne:primeIndex.get(q)-1}));
  primeCandidateCount+=candidates.length;
  assert.equal(candidates.filter(x=>fib.includes(x.ordinalMinusOne)).length,1,"inverse step "+i);
  assert.equal(candidates.find(x=>fib.includes(x.ordinalMinusOne)).prime,p);
  return {step:i,fibonacci:f,primeIndex:f+1,prime:p,signed,printed,sign:signed<0?"-":"+",numberKind:numberOutcome(p).kind};
});
assert.equal(primeCandidateCount,17);
assert.deepEqual(rows.map(x=>x.signed),[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,-1206,-4516]);
assert.equal(rows.filter(x=>x.sign==="+").length,14);
assert.equal(rows.filter(x=>x.sign==="-").length,2);
for(const sign of ["+","-"]) assert.deepEqual([...new Set(rows.filter(x=>x.sign===sign).map(x=>x.numberKind))].sort(),["factors","plus"]);
assert.equal(numberInput("number -1206"),numberInput("number 1206"));
assert.equal(numberInput("number -4516"),numberInput("number 4516"));
const distanceKinds=spiral.map(([r,c])=>({value:grid[r][c],kind:numberOutcome(grid[r][c]).kind}));
assert.equal(distanceKinds.filter(x=>x.kind==="plus").length,1);
assert.equal(distanceKinds.filter(x=>x.kind==="factors").length,15);
console.log(JSON.stringify({
  classification:"BOUNDED NEGATIVE: NO SOURCE-SELECTED SIGN STATE OR RECEIVER",
  source:"resources/liber-primus/32.jpg",imageSHA256,
  formula:"signed[n] = 3301 - prime(distinctFibonacci[n] + 1)",
  signedSequence:rows,signMask:rows.map(x=>x.sign==="-"?"1":"0").join(""),
  inverse:{primeCandidates:primeCandidateCount,selectedCandidates:16,rule:"For each printed distance, exactly one of 3301±distance has prime ordinal minus one in the distinct Fibonacci set. The sign is recovered by the established grid formula, not independent payload."},
  participantNumberControl:{
    source:"neuroretransmit/cicada@ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/004-first-onion/server.py",
    classification:"participant reconstruction, not authenticated original server",
    positiveSignedTerms:{plus:rows.filter(x=>x.sign==="+"&&x.numberKind==="plus").length,factors:rows.filter(x=>x.sign==="+"&&x.numberKind==="factors").length},
    negativeSignedTerms:{plus:rows.filter(x=>x.sign==="-"&&x.numberKind==="plus").length,factors:rows.filter(x=>x.sign==="-"&&x.numberKind==="factors").length},
    printedDistanceOutcomes:distanceKinds,
    parser:"'-' is stripped before integer parsing; -1206 and 1206 become the same input"
  },
  decision:"The signed 2013 TCP specification defines BASE29 and participant-supplied KOAN, not NUMBER; KOAN is arbitrary participant text and supplies no sign/state rule. The 2016 signed message says numbers are direction but fixes no signed-number operation or ciphertext receiver. No p15 sign-controlled LP2 inverse is selected."
},null,2));
