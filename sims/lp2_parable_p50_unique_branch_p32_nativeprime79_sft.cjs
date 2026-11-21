"use strict";
/**
 * New source-selected p32 key candidate, using the 2013 PARABLE root and
 * the signed-2016 p32 path as an independent physical-page holdout.
 * Fully reversible original-input Node22 CommonJS SFT.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const dir=path.resolve(__dirname,"..");
const readJson=name=>JSON.parse(fs.readFileSync(path.join(dir,name),"utf8"));
const c=readJson("resources/liber-primus/lp2-corpus.json");
const g=readJson("resources/liber-primus/lp2-grid-256.json");
const signed=fs.readFileSync(path.join(dir,"resources/historical/cicada2016-4gq25-outguess.asc"),"utf8");
assert(signed.includes("epiphany seeks the devoted."));
const originalTokens=g.pages.flatMap(p=>p.tokens);
assert.equal(originalTokens.length,256);
const T=originalTokens.map(s=>60*g.alphabet.indexOf(s[0])+g.alphabet.indexOf(s[1]));
assert(T.every(x=>Number.isInteger(x)&&x>=0&&x<256));
const p57=c.pages[57].indices;
const factors=[p57.slice(7,37),p57.slice(37,67),p57.slice(67,95)]
  .map(s=>s.reduce((a,v)=>a+c.prime[v],0));
assert.deepEqual(factors,[1259,1031,1229]);
assert.equal(factors.reduce((a,b)=>a*b,1),1595277641);

/** @param {number} n @returns {boolean} */
function prime(n){if(n<2)return false;for(let i=2;i*i<=n;i++)if(n%i===0)return false;return true;}
/** @param {number} n */
function ordinal(n){assert(prime(n));let z=0;for(let i=2;i<=n;i++)if(prime(i))z++;return z;}
assert.deepEqual(factors.map(ordinal),[205,173,201]);
assert.deepEqual([T[201],T[74],T[205]],[74,205,76]);

/** @param {number} n */
function orbit(n){const found=new Set();while(!found.has(n)){found.add(n);n=T[n];}return found;}
const subtree=(n)=>Array.from({length:256},(_,i)=>i).filter(i=>orbit(i).has(n));
const nodes=subtree(205);
assert.equal(nodes.length,58);
const members=new Set(nodes);
const children=new Map(nodes.map(i=>[i,[]]));
for(const i of nodes)if(i!==205){assert(members.has(T[i]));children.get(T[i]).push(i);}
const sizes=new Map();
/** @param {number} n */
function count(n){let s=1;for(const x of children.get(n))s+=count(x);sizes.set(n,s);return s;}
assert.equal(count(205),58);
assert.deepEqual([201,74,205].map(i=>sizes.get(i)),[56,57,58]);
assert.deepEqual([82,128].map(i=>sizes.get(i)),[50,5]);
const order=[];
/** Traverse largest child first, then node, then smaller children; source-address tie breaks. @param {number} n */
function walk(n){
  const ch=children.get(n).slice().sort((a,b)=>sizes.get(b)-sizes.get(a)||a-b);
  if(ch.length)walk(ch[0]);
  order.push(n);
  for(const child of ch.slice(1))walk(child);
}
walk(205);
assert.equal(order.length,58);
assert.equal(new Set(order).size,58);
assert.equal(order[50],201);
assert.equal(order[56],74);
assert.equal(order[57],205);
assert.equal(order[32],73);

// The one degree-4 vertex in the PARABLE 56-core lands on independent signed p32.
const coreSet=new Set(subtree(201));
const degreeFour=Array.from(coreSet).filter(n=>children.get(n).length===4);
assert.deepEqual(degreeFour,[73]);
const branchSizes=children.get(73).map(n=>sizes.get(n)).sort((a,b)=>b-a);
assert.deepEqual(branchSizes,[32,8,1,1]);
assert.equal(order.indexOf(73),32);
assert.equal(sizes.get(73),43);
// Signed independently selects physical p32, without equating numeric node32 to73.
function gp0(word){
  const normalized=word.toUpperCase().replaceAll("V","U").replaceAll("K","C").replaceAll("Z","S").replaceAll("Q","C");
  const keys=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  let n=0;
  for(let i=0;i<normalized.length;){
    const match=keys.find(k=>normalized.startsWith(k.s,i));
    assert(match,"source signed word must be GP-normalizable");
    n+=match.i;i+=match.s.length;
  }
  return n;
}
assert.deepEqual([gp0("THE"),gp0("DEVOTED")],[20,102]);
assert.deepEqual([T[20],T[102]],[102,32]);
assert(!coreSet.has(32));
assert(coreSet.has(73));

// The exact p50 cell at the provisionally mapped node is a natural prime start.
// Only the historically demonstrated p56 phi(prime) cipher is transferred here.
assert.equal(originalTokens[73],"1J");
assert.equal(T[73],79);
assert(prime(79));
const original=c.pages[32].indices;
assert.equal(original.length,121);
const body=original.slice(1);
assert.equal(body.length,120);
const mod=n=>((n%29)+29)%29;
/** @param {number} n */
function nextPrime(n){do{n++;}while(!prime(n));return n;}
const primes=[79];
for(let k=0;k<=121;k++)primes.push(nextPrime(primes.at(-1)));
const shift=primes.map(n=>(n-1)%29);
/**
 * Exhaust all possible legal F transparency clock states on a ciphertext
 * without discarding possibilities because of unknown plaintext.
 * @param {number[]} cipher
 * @param {1|-1} sign
 */
function feasible(cipher,sign){
  let states=new Set([0]);
  for(let i=0;i<cipher.length;i++){
    const next=new Set();
    for(const consumed of states){
      const p=mod(cipher[i]-sign*shift[consumed]);
      if(p!==0)next.add(consumed+1);
      if(cipher[i]===0)next.add(consumed);
    }
    if(next.size===0)return {firstImpossible:i,endingCount:0};
    states=next;
  }
  return {firstImpossible:null,endingCount:states.size};
}
/** @param {number[]} clear @param {1|-1} sign */
function encrypt(clear,sign){
  let consumed=0;
  return clear.map(p=>p===0?0:mod(p+sign*shift[consumed++]));
}
const controls=p57.concat(p57.slice(0,25));
assert.equal(controls.length,120);
const result=[];
for(const sign of [1,-1]){
  const actual=feasible(body,sign);
  const planted=encrypt(controls,sign);
  let consumed=0;
  const replay=planted.map((x,i)=>{
    const p=controls[i];
    if(p===0){assert.equal(x,0);return 0;}
    const dec=mod(x-sign*shift[consumed++]);
    assert.equal(dec,p);
    return dec;
  });
  assert.deepEqual(replay,controls);
  assert(feasible(planted,sign).endingCount>0);
  result.push({sign,firstImpossible:actual.firstImpossible,trueNativePlant:"120/120"});
}
assert.deepEqual(result.map(x=>x.firstImpossible),[18,105]);
console.log(JSON.stringify({
  status:"PASS",
  original2013FactorPrimes:factors,
  root201Subtree:56,
  candidateInorderPageNode:{p32:73,p50:201,p56:74,p57:205},
  uniqueDegreeFourNode:73,
  degreeFourChildSizes:branchSizes,
  independentSigned2016GraphPath:[20,102,32],
  originalP50AtNode73:{token:originalTokens[73],base60Value:T[73]},
  sourceP32PhysicalRunes:121,
  sourceP32CompleteCoreRunes:120,
  fullFClockOriginalPrimeTotient:result,
  authenticUnsolvedPlaintextRecovered:false,
  interpretation:"A conditional independent page32 alignment, followed by two failed native p56 source-prime inverse signs."
},null,2));
