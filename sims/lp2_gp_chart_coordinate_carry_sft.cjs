"use strict";
// Exact finite source-first test for Director #3299.
// Run from repository root: node sims/lp2_gp_chart_coordinate_carry_sft.cjs
const fs = require("fs");
const assert = require("assert");
const data = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
assert.strictEqual(data.runes.length, 29);
assert.strictEqual(data.translit.length, 29);
assert.strictEqual(data.pages.length, 58);
const N = data.pages.reduce((s,p) => s+p.indices.length, 0);
function primes(n) {
  const a = [];
  for (let x=2; a.length<n; x++) {
    let prime = true;
    for (let j=0; j<a.length && a[j]*a[j]<=x; j++)
      if (x%a[j]===0) {prime=false;break;}
    if (prime) a.push(x);
  }
  return a;
}
const prime = primes(N+100);
const mod = (x,n) => (x%n+n)%n;
function pages(lo,hi) {return data.pages.filter(p=>p.page>=lo&&p.page<=hi).flatMap(p=>p.indices);}
function entropy(indices) {
  const counts=Array(29).fill(0);
  for(const i of indices) counts[i]++;
  return -counts.reduce((s,n)=>n?s+(n/indices.length)*Math.log2(n/indices.length):s,0);
}
// Literal chart: left column 15, right column 14; blank cell index29.
// Row r=i%15, column c=floor(i/15). Carry row sum into the column,
// wrapping column modulo 2 => exactly (p+k) mod30.
function directDecode(ct, sign=1, radix=30) {
  let states = new Map([[0,1n]]);
  for(let i=0; i<ct.length; i++) {
    const next = new Map();
    for(const [t,count] of states) {
      const c=ct[i];
      // p56-style transparent plaintext F can emit a cipher F and
      // leave the prime clock unchanged.
      if(c===0) next.set(t,(next.get(t)||0n)+count);
      // A non-F plaintext consumes the prime. Other sources of cipher F
      // are generously allowed; the receiver is not assumed injective.
      const k=mod(prime[t]-1,radix);
      const p=mod(c-sign*k,radix);
      if(p>=1 && p<=28) next.set(t+1,(next.get(t+1)||0n)+count);
    }
    states=next;
    if(states.size===0) return {complete:false,firstImpossibleOffset:i,firstImpossibleOrdinal:i+1};
  }
  return {
    complete:true,terminalClockStates:states.size,
    totalPaths:[...states.values()].reduce((x,y)=>x+y,0n).toString(),
    minClock:Math.min(...states.keys()),maxClock:Math.max(...states.keys())
  };
}
// Unique source-minimal closure: cycle-walk a 30-cell rotation over
// BOTH unavailable cells, F=0 (transparent) and gap29. This is not the
// direct Nihilist cipher and is NOT historically authenticated.
function walk(x,k,direction) {
  if(x===0) return 0;
  let y=x;
  for(let step=0;step<30;step++) {
    y=mod(y+direction*k,30);
    if(y>=1 && y<=28) return y;
  }
  throw Error("Unreachable allowed cell");
}
function transform(input,direction,initialClock=0) {
  let t=initialClock;
  return input.map(x=>x===0?0:walk(x,mod(prime[t++]-1,30),direction));
}
function same(a,b) {return a.length===b.length&&a.every((v,i)=>v===b[i]);}
function literalClosure() {
  const rows=[];
  for(let k=0;k<=28;k++) {
    const output=Array.from({length:29},(_,p)=>p===0?0:mod(p+k,30));
    const present=new Set(output.filter(x=>x!==29));
    rows.push({
      key:k,invalidOutputCount:output.filter(x=>x===29).length,
      missingValidOutputs:Array.from({length:29},(_,i)=>i).filter(x=>!present.has(x)),
      duplicateValidOutputs:Array.from(present).filter(x=>output.filter(y=>y===x).length>1)
    });
  }
  return {
    nonzeroKeysWithBlankOutput:rows.slice(1).filter(x=>x.invalidOutputCount>0).length,
    nonzeroKeysWithCollision:rows.slice(1).filter(x=>x.duplicateValidOutputs.length>0).length,
    examples:[rows[0],rows[1],rows[2],rows[6]]
  };
}
function nativeP56() {
  const ct=data.pages[56].indices;
  let clock=0;
  const p=ct.map((c,i)=>i===56?0:mod(c-(prime[clock++]-1),29));
  assert.strictEqual(clock,84);
  const text=p.map(i=>data.translit[i]).join("");
  assert(text.startsWith("ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTO"));
  // This independently recovers the known one-F transparent control,
  // not any unknown LP2 text.
  assert.strictEqual(p.filter(x=>x===0).length,1);
  const enc=transform(p,+1),dec=transform(enc,-1);
  assert(same(p,dec));
  return {runes:p.length,primeSteps:clock,transparentFPosition:56,
    knownText:text,roundtrip:true,
    directMod29PrimeDP:directDecode(ct,+1,29)};
}
function main() {
  const control=nativeP56();
  // Exhaustive single-symbol reversibility for every prime-residue key:
  for(let k=0;k<30;k++) {
    const outs=Array.from({length:29},(_,p)=>walk(p,k,+1));
    assert.strictEqual(new Set(outs).size,29);
    for(let p=0;p<29;p++) assert.strictEqual(walk(walk(p,k,+1),k,-1),p);
  }
  const first=pages(8,14),held=pages(15,22);
  const out=transform(first,-1),heldPlain=transform(held,-1);
  assert(same(transform(out,+1),first));
  assert(same(transform(heldPlain,+1),held));
  const native57=data.pages[57].indices;
  assert(same(transform(transform(native57,+1),-1),native57));
  const result={
    model:"15x2 GP chart coordinate addition with row carry and p56 prime-minus-one clock",
    chart:"indices 0..14 left; 15..28 right; 29 blank; plaintext F0 transparent",
    nativeP56:control,
    fullSourceClosure:literalClosure(),
    direct30:{plusGlobal:directDecode(first,+1,30),
      minusGlobal:directDecode(first,-1,30),
      byPage:data.pages.filter(p=>p.page>=8&&p.page<=14).map(p=>({
        page:p.page,len:p.indices.length,
        plus:directDecode(p.indices,+1,30),
        minus:directDecode(p.indices,-1,30)
      }))},
    cycleWalk30:{
      meaning:"explicit exploratory repair, not source-authenticated",
      exhaustivePermutationKeys:30,
      fitPages:"p8-p14",fitRunes:first.length,fitReplay:true,
      fitCipherEntropy:entropy(first),fitPlainEntropy:entropy(out),
      fitPlainFirst180:out.slice(0,180).map(i=>data.translit[i]).join(""),
      heldPages:"p15-p22",heldRunes:held.length,heldReplay:true,
      heldCipherEntropy:entropy(held),heldPlainEntropy:entropy(heldPlain),
      heldPlainFirst90:heldPlain.slice(0,90).map(i=>data.translit[i]).join(""),
      native57PlantReplay:true
    }
  };
  process.stdout.write(JSON.stringify(result,null,2)+"\n");
}
main();
