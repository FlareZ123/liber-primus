'use strict';

/**
 * Original p0-p2: exact all-secret outer-GP29 alphabet test of the historical
 * p56 phi(prime) stream WITH the authentic literal-plaintext-F bypass.
 *
 * Conditional crib is the earlier source-navigation candidate EPIPHANY SEEKS
 * on the first thirteen original p0 red title runes, NOT independently solved
 * plaintext. It contains no plaintext F, so all thirteen must consume primes.
 *
 * Encoder per chapter, given any unknown permutation sigma of GP29:
 *
 *   if P[i] === F: C[i]=F; key clock does not advance;
 *   otherwise: C[i]=sigma((P[i]+(prime[start+t]-1)) mod29), t++.
 *
 * The source-printed five one-rune words in p0..p2 must read A, I or O in
 * the ordinary GP-native English register (O as a permissive interjection).
 * The first thirteen plaintext cribs select compatible phase starts among
 * 0..4999 using exact two-way partial permutation consistency. For each
 * compatible start, dynamic-program *every* legal F-bypass history and
 * *all* unknown secret inverse-symbol permutations. Domains of every
 * unmapped ciphertext label are exact 29-bit subsets of remaining q labels;
 * a bipartite augmenting-path perfect matching enforces injectivity.
 * The algorithm rejects a state only when it has NO valid completion.
 *
 * The original negative therefore proves there is NO complete inverse on
 * the first 655 GP symbols under all this CONDITIONAL exact family.
 *
 * Pure read-only Node.js22/CommonJS SFT; supports Windows 11.
 * Source: resources/liber-primus/lp2-corpus.json and lp2-transcription.txt.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcript = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');

const MOD = 29;
const F = 0;
const E = 18;
const O = 3;
const A = 24;
const I = 10;
const crib = [18,13,10,13,8,24,9,26,15,18,18,5,15];
const chapter = corpus.pages.slice(0,3).flatMap(p=>p.indices);
const title = chapter.slice(0,13);
assert.deepEqual(title, [15,8,18,3,6,19,27,0,15,26,18,21,5]);
assert.equal(chapter.length,729);
assert.equal(corpus.pages[0].indices.length,262);
assert.equal(corpus.pages[1].indices.length,266);
assert.equal(corpus.pages[2].indices.length,201);
assert.equal(corpus.translit[E],'E');
assert.equal(corpus.translit[O],'O');
assert.equal(corpus.translit[A],'A');
assert.equal(corpus.translit[I],'I');
assert.ok(!crib.includes(F));

/**
 * Original complete printed words, preserving wrapped words across page
 * and printed line boundaries, and accumulating all GP rune glyphs exactly.
 * @returns {{start:number,length:number,indices:number[]}[]}
 */
function parseOriginalWords() {
  const runeToIndex = new Map(corpus.runes.map((r,i)=>[r,i]));
  /** @type {{start:number,length:number,indices:number[]}[]} */
  const words = [];
  /** @type {number[]} */
  let current = [];
  let start = 0;
  for(const ch of transcript) {
    const rune = runeToIndex.get(ch);
    if(rune !== undefined) current.push(rune);
    else if("-.'&$§".includes(ch) && current.length) {
      words.push({start,length:current.length,indices:current});
      start+=current.length;
      current=[];
    }
  }
  return words;
}
const originalWords = parseOriginalWords();
const hiddenWords = originalWords.filter(w=>w.start<12956);
const originalRunes = hiddenWords.flatMap(w=>w.indices);
assert.equal(hiddenWords.length,2896);
assert.deepEqual(originalRunes,
  corpus.pages.slice(0,56).flatMap(p=>p.indices));
assert.equal(hiddenWords.filter(w=>w.length===1).length,83);
const singletonPositions = hiddenWords.filter(w=>
  w.start<chapter.length && w.length===1).map(w=>w.start);
assert.deepEqual(singletonPositions,[176,244,350,530,644]);
const singleton = new Set(singletonPositions);

/**
 * Totient of consecutive primes, reduced modulo29.
 * @param {number} n
 * @returns {number[]}
 */
function totientPrimes(n) {
  const sieve = new Uint8Array(100000);
  /** @type {number[]} */
  const out = [];
  for(let p=2;p<sieve.length&&out.length<n;p++) {
    if(sieve[p]) continue;
    out.push((p-1)%MOD);
    for(let q=p*p;q<sieve.length;q+=p) sieve[q]=1;
  }
  assert.equal(out.length,n);
  return out;
}
const primeKey = totientPrimes(6000);

/**
 * Title mapping under a proposed prime start.
 * Every actual non-F crib rune must consume a prime. A secret permutation
 * must have a one-to-one partial inverse. Null iff collision.
 * @param {number[]} cipher
 * @param {number} start
 * @returns {number[]|null}
 */
function titleInverse(cipher,start) {
  const inverse=Array(MOD).fill(-1);
  const image=Array(MOD).fill(-1);
  for(let i=0;i<crib.length;i++) {
    const ci=cipher[i];
    const qi=(crib[i]+primeKey[start+i])%MOD;
    if((inverse[ci]!==-1&&inverse[ci]!==qi)||
      (image[qi]!==-1&&image[qi]!==ci))return null;
    inverse[ci]=qi;
    image[qi]=ci;
  }
  return inverse;
}

const startCandidates = [];
for(let s=0;s<5000;s++)if(titleInverse(chapter,s))startCandidates.push(s);
assert.deepEqual(startCandidates,[4557]);

/** Genuine clear p57 sliding windows calibrate whether one start is rare. */
const sourceClear=corpus.pages[57].indices;
assert.equal(sourceClear.length,95);
const originalCrib=crib.slice();
/**
 * @param {number[]} word13
 * @returns {number}
 */
function compatibleStartCount(word13) {
  crib.splice(0,crib.length,...word13);
  let count=0;
  for(let s=0;s<5000;s++)if(titleInverse(chapter,s))count++;
  crib.splice(0,crib.length,...originalCrib);
  return count;
}
const sourceCounts=[];
for(let i=0;i+13<=sourceClear.length;i++)
  sourceCounts.push(compatibleStartCount(sourceClear.slice(i,i+13)));
assert.equal(sourceCounts.length,83);
assert.equal(sourceCounts.filter(x=>x>=1).length,30);
assert.equal(Math.max(...sourceCounts),5);

/**
 * A bipartite Hall-matching constraint for all eighteen previously unknown
 * cipher rune labels. The eleven prefix mappings are held fixed.
 * This is exact: there is a possible remaining alphabet bijection iff every
 * unmapped ciphertext symbol has a distinct permitted inverse label.
 *
 * @param {number[]} domain
 * @param {number[]} unknown
 * @param {number[]} available
 * @returns {boolean}
 */
function hasPerfectMatching(domain,unknown,available) {
  const match = new Int8Array(MOD).fill(-1);
  const seen = new Uint8Array(MOD);
  /** @param {number} c @returns {boolean} */
  function dfs(c) {
    for(const q of available) {
      if(((domain[c]>>>q)&1)===0 || seen[q]) continue;
      seen[q]=1;
      if(match[q]===-1||dfs(match[q])) {
        match[q]=c;
        return true;
      }
    }
    return false;
  }
  for(const c of unknown) {
    seen.fill(0);
    if(!dfs(c))return false;
  }
  return true;
}

/**
 * Exact F-skip dynamic programming with unknown permutation.
 * Every state carries the consumed-key count and remaining allowed
 * inverse symbol domains. Deduplicating equal states is lossless.
 *
 * @param {number[]} ciphertext
 * @param {number} start
 * @param {number} stopExclusive
 * @returns {{firstImpossibleAt:number|null,terminalStates:number,
 *             peakStates:number,events:Array<{at:number,states:number}>}}
 */
function allSecretInverse(ciphertext,start,stopExclusive) {
  assert.ok(stopExclusive<=ciphertext.length);
  const inverse=titleInverse(ciphertext,start);
  assert.ok(inverse,'known title must be an algebraically feasible crib');
  const selected=new Set(inverse.filter(q=>q>=0));
  const unknown=Array.from({length:MOD},(_,i)=>i).filter(c=>inverse[c]<0);
  const available=Array.from({length:MOD},(_,i)=>i).filter(q=>!selected.has(q));
  assert.equal(unknown.length,available.length);
  const mask=available.reduce((m,q)=>m|(1<<q),0);
  const domains=Array(MOD).fill(mask);
  /** @type {Array<{t:number,D:number[]}>} */
  let states=[{t:crib.length,D:domains}];
  let peak=1;
  const events=[];
  for(let i=crib.length;i<stopExclusive;i++) {
    const ci=ciphertext[i],isSingleton=singleton.has(i);
    /** @type {Array<{t:number,D:number[]}>} */
    const next=[];
    const seen=new Set();
    /** @param {number} t @param {number[]} D */
    function add(t,D) {
      const code=t+':'+unknown.map(c=>D[c]).join(',');
      if(seen.has(code))return;
      seen.add(code);
      next.push({t,D});
    }
    for(const state of states) {
      // A literal-F bypass yields plaintext F without consuming key;
      // native English one-rune words can only be A,I,O, never F.
      if(ci===F && !isSingleton)add(state.t,state.D);
      const key=primeKey[start+state.t];
      if(inverse[ci]>=0) {
        const q=inverse[ci];
        const possible=isSingleton ?
          (q-key+MOD)%MOD===A||(q-key+MOD)%MOD===I||
          (q-key+MOD)%MOD===O :
          q!==key; // ordinary encipherment cannot create plaintext F
        if(possible)add(state.t+1,state.D);
      } else {
        const allowed=isSingleton ?
          (1<<((key+A)%MOD)) |
          (1<<((key+I)%MOD)) |
          (1<<((key+O)%MOD)) :
          mask&~(1<<key);
        const after=state.D[ci]&allowed;
        if(after===0)continue;
        if(after===state.D[ci])add(state.t+1,state.D);
        else {
          const D=state.D.slice();
          D[ci]=after;
          if(hasPerfectMatching(D,unknown,available))add(state.t+1,D);
        }
      }
    }
    states=next;
    peak=Math.max(peak,states.length);
    if(isSingleton||i===stopExclusive-1||states.length===0)
      events.push({at:i,states:states.length});
    if(!states.length)
      return {firstImpossibleAt:i,terminalStates:0,
        peakStates:peak,events};
    assert.ok(states.length<120000,
      'unexpected extreme state growth; avoid unverified truncation');
  }
  return {firstImpossibleAt:null,terminalStates:states.length,
    peakStates:peak,events};
}

const original=allSecretInverse(chapter,startCandidates[0],chapter.length);
assert.equal(original.firstImpossibleAt,654);
assert.equal(original.terminalStates,0);
assert.ok(original.peakStates>1000);
assert.deepEqual(original.events.filter(x=>singleton.has(x.at)).map(x=>x.at),
  singletonPositions);

/** @param {number} seed @returns {()=>number} */
function xorshift32(seed) {
  let x=seed>>>0;
  return ()=>{
    x^=x<<13;
    x^=x>>>17;
    x^=x<<5;
    return x>>>0;
  };
}

/** Positive: real solved p57 GP plaintext in matched length, native
 * singletons A/I/O, true source-prefix crib, arbitrary secret sigma.
 * Authentic literal-F bypasses are actually exercised; forward inverse
 * checks all 729 positions, including each true clock pause.
 */
const plantedPlain=Array.from({length:chapter.length},
  (_,i)=>sourceClear[(i+7)%sourceClear.length]);
for(const i of singletonPositions)plantedPlain[i]=[A,I,O][i%3];
for(let i=0;i<crib.length;i++)plantedPlain[i]=crib[i];
const random=xorshift32(0x33011914);
const sigma=Array.from({length:MOD},(_,i)=>i);
for(let i=MOD-1;i>0;i--) {
  const j=random()%(i+1);
  [sigma[i],sigma[j]]=[sigma[j],sigma[i]];
}
const invSigma=Array(MOD);
sigma.forEach((v,i)=>{invSigma[v]=i;});
assert.equal(new Set(sigma).size,MOD);
const positiveStart=167;
let consumed=0,skips=0;
const plantedCipher=plantedPlain.map(p=>{
  if(p===F){skips++;return F;}
  const c=sigma[(p+primeKey[positiveStart+consumed])%MOD];
  consumed++;
  return c;
});
assert.ok(skips>0);
let exactClock=0;
const reconstructed=plantedCipher.map((c,i)=>{
  if(plantedPlain[i]===F) {
    assert.equal(c,F);
    return F;
  }
  const q=invSigma[c];
  const p=(q-primeKey[positiveStart+exactClock]+MOD)%MOD;
  exactClock++;
  return p;
});
assert.deepEqual(reconstructed,plantedPlain);
const plantedTitle=titleInverse(plantedCipher,positiveStart);
assert.ok(plantedTitle);
const positive=allSecretInverse(plantedCipher,positiveStart,262);
assert.equal(positive.firstImpossibleAt,null);
assert.ok(positive.terminalStates>0);

console.log(JSON.stringify({
  model:'C=σ(P+φ(prime[start+t])) mod29; literal plaintext-F bypass, no consumed key',
  scope:'Original LP2 physical p0..p2 729 GP runes, source title GP EPIPHANY SEEKS',
  classification:'CONDITIONAL exact impossibility; crib itself is not solved/authenticated',
  phases:5000,
  matchingTitleStarts:startCandidates,
  independentSolvedP57WindowCount:83,
  slidingP57WindowsWithAnyMatchingStart:sourceCounts.filter(x=>x>=1).length,
  originalPrintedSingletons:singletonPositions.map(i=>({
    chapterOffset:i,physicalPage:i<262?0:i<528?1:2,
    localOffset:i<262?i:i<528?i-262:i-528,
    printedGP:corpus.translit[chapter[i]]
  })),
  originalFirstImpossibleGlobalOffset:original.firstImpossibleAt,
  originalFirstImpossiblePhysicalPage:2,
  originalFirstImpossiblePageOffset:126,
  originalTerminalAlphabetCompletions:original.terminalStates,
  originalPeakExactStates:original.peakStates,
  originalConstrainedPositions:original.events,
  truePositive:{source:'repeated actually clear solved p57; matched original singleton grammar and opening',
    secretOuterAlphabet:true,primeStart:positiveStart,
    literalFBypasses:skips,recoveredRoutines:reconstructed.length,
    exactFullForwardRoundtrip:true,positivePrefixStates:positive.terminalStates},
  decision:'Even any 29! secret fixed outer alphabet, all prime starts 0..4999 and all legal literal-F skip traces cannot make the earlier EPIPHANY SEEKS crib coexist with source printed one-rune A/I/O words under the historical m=1 prime stream',
  caveats:'Conditional on p0 red-title candidate, GP-native printed singleton grammar, unmodified source rune order, and one outer alphabet across first chapter. No new plaintext recovered.'
},null,2));
