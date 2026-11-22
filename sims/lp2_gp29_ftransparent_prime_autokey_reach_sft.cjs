"use strict";
/**
 * Complete GP29 transparent-plaintext-F prime/autokey finite grammar gate.
 *
 * 5 previous-plaintext taps (absent or +/- rune-index/GP-prime at lag 1)
 * x 9 previous-ciphertext taps (absent or +/- rune-index/GP-prime at lags 1,5)
 * x 29 constant shifts = 1,305 short, fully specified programs.
 *
 * Encoder: P[i] = F(index 0) emits C[i]=F, bypassing the additive cipher;
 * otherwise C[i] = (P[i] + plainTap + cipherTap + k) mod29.
 * Ciphertext F can also encrypt non-F. Both inverse branches are represented.
 * Physical page interiors are continuous. Before the first position all taps
 * contribute 0, even GP-prime lookup taps. No arbitrary state/key resets.
 *
 * The concrete grammar tests clue-constrained prime-value feedback, but
 * neither 2014 clues nor earlier Cicada solved controls explicitly select
 * this particular cipher family. A negative applies only to this family.
 *
 * Windows Node 22: node sims/lp2_gp29_ftransparent_prime_autokey_reach_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT,file),"utf8");
const book = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const M = 29;
assert.equal(book.runes.length,M);
const gpPrime = book.prime.map(x => x % M);
const mod = x => ((x % M) + M) % M;
const pTaps = [
  {name:"none",prime:false,sign:0},
  {name:"+Pprev",prime:false,sign:1},
  {name:"-Pprev",prime:false,sign:-1},
  {name:"+GPprime(Pprev)",prime:true,sign:1},
  {name:"-GPprime(Pprev)",prime:true,sign:-1}
];
const cTaps = [{name:"none",delay:0,prime:false,sign:0}];
for(const delay of [1,5])
  for(const isPrime of [false,true])
    for(const sign of [1,-1])
      cTaps.push({name:(sign===1?"+":"-")+
        (isPrime?"GPprime(C)":"C")+"[-"+delay+"]",
        delay,prime:isPrime,sign});
assert.equal(pTaps.length*cTaps.length*M,1305);

/** @param {number} previous @param {number} i @param {object} tap */
function prevPlain(previous,i,tap) {
  return i===0?0:tap.sign*(tap.prime?gpPrime[previous]:previous);
}
/** @param {ArrayLike<number>} ciphertext @param {number} i @param {object} tap */
function prevCipher(ciphertext,i,tap) {
  return !tap.delay||i<tap.delay?0:
    tap.sign*(tap.prime?gpPrime[ciphertext[i-tap.delay]]:
      ciphertext[i-tap.delay]);
}

/**
 * Forward cipher with authentic transparent plaintext F behavior.
 * @param {ArrayLike<number>} plaintext
 * @param {object} p Plaintext tap
 * @param {object} c Ciphertext tap
 * @param {number} k Key
 * @returns {Uint8Array}
 */
function encrypt(plaintext,p,c,k) {
  const ciphertext = new Uint8Array(plaintext.length);
  for(let i=0;i<plaintext.length;i++){
    const plain=plaintext[i];
    ciphertext[i]=plain===0?0:
      mod(plain+prevPlain(plaintext[i-1],i,p)+
        prevCipher(ciphertext,i,c)+k);
  }
  return ciphertext;
}

/**
 * Exact all-state reachability over last plaintext symbol; no language model.
 * This is sound because the only plaintext dependency is the previous rune.
 * It branches on C=F into literal-F and non-F consuming possibilities.
 * @param {ArrayLike<number>} ciphertext
 * @param {object} p
 * @param {object} c
 * @param {number} k
 * @param {boolean} assertIdentity Assert every viable state is C[i]
 * @returns {number} Largest original prefix admitting a full inverse
 */
function furthest(ciphertext,p,c,k,assertIdentity=false) {
  let active=new Uint8Array(M);
  active[0]=1;
  for(let i=0;i<ciphertext.length;i++){
    const current=ciphertext[i];
    const ct=prevCipher(ciphertext,i,c);
    const next=new Uint8Array(M);
    for(let old=0;old<M;old++) if(active[old]){
      if(current===0) next[0]=1; // plaintext F bypass
      const plain=mod(current-prevPlain(old,i,p)-ct-k);
      if(plain!==0) next[plain]=1; // consuming branch forbids P=F
    }
    let count=0;
    for(const v of next) count+=v;
    if(count===0)return i;
    if(assertIdentity){
      assert.equal(count,1,"Only one plain-state path");
      assert.equal(next[current],1,"Self-cancelling input identity");
    }
    active=next;
  }
  return ciphertext.length;
}

/** Original, unmodified page/rune source, no derived reconstructions. */
function chapter(first,last){
  return book.pages.filter(p=>p.page>=first&&p.page<=last)
    .flatMap(p=>p.indices);
}
const original=chapter(0,2);
const holdA=chapter(8,14);
const holdB=chapter(40,53);
assert.deepEqual([original.length,holdA.length,holdB.length],
  [729,1729,3008]);

const survivors=[];
const failedAt=[];
for(let pi=0;pi<pTaps.length;pi++)
  for(let ci=0;ci<cTaps.length;ci++)
    for(let k=0;k<M;k++){
      const n=furthest(original,pTaps[pi],cTaps[ci],k);
      if(n!==original.length) failedAt.push(n);
      else survivors.push({pi,ci,k,
        holdA:furthest(holdA,pTaps[pi],cTaps[ci],k),
        holdB:furthest(holdB,pTaps[pi],cTaps[ci],k)});
    }
assert.equal(failedAt.length,1300);
assert.deepEqual(survivors.map(({pi,ci,k})=>[pi,ci,k]),[
  [0,0,0],[1,2,0],[2,1,0],[3,4,0],[4,3,0]
]);
for(const key of survivors){
  assert.deepEqual([key.holdA,key.holdB],[1729,3008]);
  for(const sample of [original,holdA,holdB]){
    assert.equal(furthest(sample,pTaps[key.pi],cTaps[key.ci],
      key.k,true),sample.length);
    assert.deepEqual(encrypt(sample,pTaps[key.pi],
      cTaps[key.ci],key.k),Uint8Array.from(sample));
  }
}
failedAt.sort((a,b)=>a-b);

/** Convert independent English control prose to the authentic GP alphabet. */
function gpEncode(input){
  const tokens=book.translit.map((s,i)=>({s,i}))
    .sort((a,b)=>b.s.length-a.s.length);
  const out=[];
  for(let w of input.toUpperCase().match(/[A-Z]+/g)||[]){
    w=w.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S");
    for(let i=0;i<w.length;){
      const tok=tokens.find(t=>w.startsWith(t.s,i));
      assert.ok(tok,"Missing GP spelling");
      out.push(tok.i);
      i+=tok.s.length;
    }
  }
  return out;
}

/** Hidden GP-English control language scorer, independent of ciphertext. */
function logTrigrams(plain){
  const counts=new Uint32Array(M*M*M), totals=new Uint32Array(M*M);
  for(let i=2;i<plain.length;i++){
    const prev=plain[i-2]*M+plain[i-1];
    counts[prev*M+plain[i]]++;
    totals[prev]++;
  }
  return Float32Array.from(counts,(n,i)=>
    Math.log((n+0.2)/(totals[Math.floor(i/M)]+M*0.2)));
}
const english=gpEncode(read("resources/control/shakespeare_first300k.txt"));
assert.ok(english.length>210000);
const logp=logTrigrams(english.slice(0,-18000));
function languageScore(input){
  let value=0;
  for(let i=2;i<input.length;i++)
    value+=logp[(input[i-2]*M+input[i-1])*M+input[i]];
  return value/(input.length-2);
}

/**
 * Full Viterbi inversion for a planted nontrivial program.
 * State = last two plaintext symbols (29*29), with deterministic C history.
 * Simultaneously chooses plaintext-F bypass at every ciphertext zero.
 */
function viterbi(cipher,p,c,k){
  const states=M*M;
  const back=new Int16Array(cipher.length*states);
  back.fill(-1);
  let dp=new Float64Array(states);
  dp.fill(-Infinity);
  dp[0]=0;
  for(let i=0;i<cipher.length;i++){
    const next=new Float64Array(states);
    next.fill(-Infinity);
    const symbol=cipher[i], ct=prevCipher(cipher,i,c);
    for(let state=0;state<states;state++)if(dp[state]!==-Infinity){
      const prev2=Math.floor(state/M),prev1=state%M;
      const candidate=mod(symbol-prevPlain(prev1,i,p)-ct-k);
      const offer=plain=>{
        const target=prev1*M+plain;
        const ll=dp[state]+(i>=2?
          logp[(prev2*M+prev1)*M+plain]:0);
        if(ll>next[target]){
          next[target]=ll;
          back[i*states+target]=state;
        }
      };
      if(symbol===0)offer(0);
      if(candidate!==0)offer(candidate);
    }
    dp=next;
  }
  let best=-Infinity,state=-1;
  for(let i=0;i<states;i++)if(dp[i]>best){best=dp[i];state=i;}
  assert.notEqual(state,-1,"A full Viterbi inverse exists");
  const recovered=new Uint8Array(cipher.length);
  for(let i=cipher.length-1;i>=0;i--){
    recovered[i]=state%M;
    state=back[i*states+state];
    if(i>0)assert.ok(state>=0,"Backtracking is complete");
  }
  return {recovered,score:best/(cipher.length-2)};
}
const plain=Uint8Array.from(english.slice(-17000,
  -17000+original.length));
const planted={pi:3,ci:6,k:13};
const pc=pTaps[planted.pi],cc=cTaps[planted.ci];
const cipher=encrypt(plain,pc,cc,planted.k);
const decoded=viterbi(cipher,pc,cc,planted.k);
assert.deepEqual(decoded.recovered,plain,"Exact 729/729 GP planted recovery");
assert.deepEqual(encrypt(decoded.recovered,pc,cc,planted.k),cipher);
assert.equal(furthest(cipher,pc,cc,planted.k),cipher.length);
const bypasses=plain.filter(x=>x===0).length;
const zeroCipher=cipher.filter(x=>x===0).length;
assert.ok(zeroCipher>bypasses,"Encrypted non-F can emit F");
assert.ok(Math.abs(decoded.score-languageScore(plain))<1e-7);
assert.ok(languageScore(book.pages[57].indices)>-3.1);

const digest=a=>crypto.createHash("sha256")
  .update(Buffer.from(a)).digest("hex");
console.log(JSON.stringify({
  experiment:"Fully specified plaintext-F-transparent GP29 feedback grammar",
  originalPages:"p0-p2; untouched p8-p14 and p40-p53",
  originalSha256:digest(original),
  heldOutSha256:[digest(holdA),digest(holdB)],
  totalPrograms:1305,
  programBits:Math.log2(1305),
  positiveNonIdentityRecovered:{
    key:planted,
    plaintextRunes:plain.length,
    literalPlaintextFs:bypasses,
    zeroCiphertextRunes:zeroCipher,
    recoveredExact:true,
    ciphertextRoundtripExact:true,
    trigramLanguageScore:decoded.score
  },
  original:{
    failedPrograms:failedAt.length,
    longestFailedPrefix:failedAt[failedAt.length-1],
    medianFailedPrefix:failedAt[Math.floor(failedAt.length/2)],
    p95FailedPrefix:failedAt[Math.floor(failedAt.length*0.95)],
    completePrograms:survivors.map(({pi,ci,k,holdA,holdB})=>({
      plain:pTaps[pi].name,cipher:cTaps[ci].name,k,
      holdA,holdB,identicalOriginalPlaintext:true
    }))
  },
  calibration:{
    genuineClearP57:languageScore(book.pages[57].indices),
    originalUnchanged:languageScore(original),
    plantedEnglish:languageScore(plain)
  },
  interpretation:"Exactly five self-cancelling identity programs; no unknown LP2 plaintext."
},null,2));
