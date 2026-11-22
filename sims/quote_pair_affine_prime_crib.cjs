"use strict";
/**
 * Original-LP2 quote-to-quote affine prime-totient relative-crib test.
 *
 * The two independently quoted 14-word spans on physical pages 40 and 53
 * share exactly five initial ciphertext word lengths, 5,7,2,3,4 (21 runes).
 * Test whether those 21 underlying plaintext runes can be equal up to two
 * substitutions after an arbitrary shared nonzero affine multiplier, an
 * arbitrary independent per-quote additive constant, and the authentic
 * solved-LP2 prime-totient running key with independent unknown starts.
 *
 * A seven-position clean block must exist if there are at most two errors.
 * Project each source-key block's six consecutive differences away from the
 * one-dimensional span of the observed ciphertext difference vector. The
 * resulting five-element F29 fingerprint is independent of the multiplier
 * and of both additive constants. Equal fingerprints identify ALL possible
 * source phase pairs, which are then tested exactly on 21 runes.
 *
 * This is a finite original-cipher rejection of a conditional architecture,
 * not evidence that the two quotations actually share plaintext.
 *
 * Single runnable file: node sims/quote_pair_affine_prime_crib.cjs
 * Optional smaller test: PRIME_START_LIMIT=10000.
 * Node 22 CommonJS; no dependencies and no file writes.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const load=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const corpus=JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const marks=JSON.parse(load("resources/liber-primus/lp2-quote-punctuation-spans.json"));
const unsolved=corpus.pages.filter(p=>p.page<56);
const runes=unsolved.flatMap(p=>p.indices);
const MOD=29, WIDTH=7, LENGTH=21, DEFAULT_STARTS=1000000;
const limit=Number(process.env.PRIME_START_LIMIT||DEFAULT_STARTS);
const mod=x=>(x%MOD+MOD)%MOD;
assert(Number.isSafeInteger(limit)&&limit>=10000&&limit<=DEFAULT_STARTS);
assert.equal(unsolved.length,56);
assert.equal(runes.length,12956);
assert.equal(marks.quotes.length,7);
assert.equal(marks.quotes.reduce((n,q)=>n+q.length,0),405);
for(const q of marks.quotes){
  assert.equal(q.end-q.start,q.length);
  assert.deepEqual(q.page_slices.flatMap(slice=>{
    const page=unsolved.find(p=>p.page===slice.page);
    return page.indices.slice(slice.start,slice.end);
  }),runes.slice(q.start,q.end));
}
const leftQuote=marks.quotes.find(q=>q.start===9811);
const rightQuote=marks.quotes.find(q=>q.start===12522);
assert.deepEqual(leftQuote.page_slices,[{page:40,start:171,end:229}]);
assert.deepEqual(rightQuote.page_slices,[{page:53,start:53,end:123}]);
const left=Array.from(runes.slice(9811,9832));
const right=Array.from(runes.slice(12522,12543));
assert.deepEqual(left,[0,23,4,28,6,13,3,12,3,19,28,17,11,27,15,19,0,16,0,25,3]);
assert.deepEqual(right,[28,14,26,12,4,3,13,15,5,25,19,12,9,11,18,0,15,18,0,24,21]);

/** Exact canonical word segmentation with line/page wraps left inside words. */
function printedWords(){
  const body=load("resources/lp2-transcription.txt")
    .split("%").slice(0,55).join("%");
  const alphabet=new Set(corpus.runes);
  const out=[];
  let length=0,start=0,ordinal=0;
  for(const ch of body){
    if(alphabet.has(ch)){
      if(length===0)start=ordinal;
      ordinal++;length++;
    }else if(ch==="/"||ch==="%"||/\s/u.test(ch)){
      continue;
    }else if(length){
      out.push({start,length});
      length=0;
    }
  }
  if(length)out.push({start,length});
  assert.equal(ordinal,12956);
  assert.equal(out.length,2896);
  return out;
}
const words=printedWords();
const qA=words.findIndex(w=>w.start===9811);
const qB=words.findIndex(w=>w.start===12522);
assert(qA>=0&&qB>=0);
const lens=i=>words.slice(i,i+14).map(w=>w.length);
const expectedA=[5,7,2,3,4,6,4,3,3,4,4,4,5,4];
const expectedB=[5,7,2,3,4,10,3,9,7,3,7,4,3,3];
assert.deepEqual(lens(qA),expectedA);
assert.deepEqual(lens(qB),expectedB);
const prefix=[5,7,2,3,4],copies=[];
for(let i=0;i<words.length-4;i++){
  if(prefix.every((n,j)=>words[i+j].length===n))copies.push(words[i].start);
}
assert.deepEqual(copies,[9811,12522]);

/** One-based ordinary-prime ordinal -> (prime - 1) modulo 29. */
function primeTape(maxStart){
  const n=maxStart+LENGTH+1;
  const upper=Math.ceil(n*(Math.log(n)+Math.log(Math.log(n)))+500);
  const composite=new Uint8Array(upper+1);
  for(let p=2;p*p<=upper;p++)if(!composite[p]){
    for(let k=p*p;k<=upper;k+=p)composite[k]=1;
  }
  const tape=new Uint8Array(n+1);
  let ordinal=0;
  for(let p=2;p<=upper&&ordinal<n;p++){
    if(!composite[p])tape[++ordinal]=(p-1)%MOD;
  }
  assert.equal(ordinal,n);
  assert.deepEqual(Array.from(tape.slice(1,6)),[1,2,4,6,10]);
  return tape;
}
const key=primeTape(limit);
const inverse=new Uint8Array(MOD);
for(let a=1;a<MOD;a++)for(let b=1;b<MOD;b++){
  if((a*b)%MOD===1)inverse[a]=b;
}
assert.equal(inverse[17],12);

/**
 * Search ALL prime starts in [1,limit] for both quotes.
 * The unknown affine multiplier absorbs the key sign: reversing the
 * source-phase pair and negating multiplier and delta represents the
 * opposite additive-key sign, so one sign is sufficient.
 * @param {number[]} A 21 GP original/source-control ciphertext runes.
 * @param {number[]} B Another 21 ciphertext runes.
 */
function scan(A,B){
  assert.equal(A.length,LENGTH);
  assert.equal(B.length,LENGTH);
  let examinations=0,most=0;
  const survivors=[],blocks=[];
  const counts=new Uint8Array(MOD);
  for(let block=0;block<3;block++){
    const off=block*WIDTH,delta=new Uint8Array(WIDTH);
    for(let i=1;i<WIDTH;i++){
      delta[i]=mod(A[off+i]-B[off+i]-A[off]+B[off]);
    }
    const pivot=delta.findIndex((d,i)=>i>0&&d!==0);
    assert(pivot>0,"Nondegenerate quote-difference block required");
    const ratio=Array.from(delta,d=>mod(d*inverse[delta[pivot]]));
    /** Five base29 digits, exact integer below 29^5 < 2^53. */
    function fingerprint(start){
      const base=key[start+off];
      const kPivot=mod(key[start+off+pivot]-base);
      let code=0;
      for(let i=1;i<WIDTH;i++)if(i!==pivot){
        code=MOD*code+mod(key[start+off+i]-base-ratio[i]*kPivot);
      }
      return code;
    }
    const lookup=new Map();
    for(let u=1;u<=limit;u++){
      const k=fingerprint(u),old=lookup.get(k);
      if(old===undefined)lookup.set(k,u);
      else if(Array.isArray(old))old.push(u);
      else lookup.set(k,[old,u]);
    }
    let blockPairs=0;
    for(let v=1;v<=limit;v++){
      const items=lookup.get(fingerprint(v));
      if(items===undefined)continue;
      for(const u of Array.isArray(items)?items:[items]){
        examinations++;blockPairs++;
        const multiplier=mod(
          (key[u+off+pivot]-key[u+off]
           -key[v+off+pivot]+key[v+off])*inverse[delta[pivot]]);
        if(multiplier===0)continue;
        counts.fill(0);
        for(let i=0;i<LENGTH;i++){
          counts[mod(multiplier*(A[i]-B[i])-key[u+i]+key[v+i])]++;
        }
        let matched=0,caesarOffset=0;
        for(let x=0;x<MOD;x++)if(counts[x]>matched){
          matched=counts[x];caesarOffset=x;
        }
        if(matched>most)most=matched;
        if(matched>=LENGTH-2){
          survivors.push({startA:u,startB:v,multiplier,
            caesarOffset,matched,block});
        }
      }
    }
    blocks.push({block,pivot,relativeDelta:Array.from(delta),
      fingerprintMatches:blockPairs});
  }
  return {fingerprintPairExaminations:examinations,
    maximum21PositionAgreement:most,survivors,blocks};
}

/** Secret-key planted English-register-independent exact inverse control. */
function positiveControl(){
  const plain=Array.from({length:LENGTH},(_,i)=>
    (i*5+Math.floor(i/3))%MOD);
  const startA=3301,startB=7900,a=17,invA=12,bA=8,bB=13;
  const corrupted=[4,17];
  const A=plain.map((p,i)=>mod(invA*(p+key[startA+i]-bA)));
  const B=plain.map((p,i)=>mod(invA*(
    p+7+Number(corrupted.includes(i))+key[startB+i]-bB)));
  for(let i=0;i<LENGTH;i++){
    assert.equal(mod(a*A[i]+bA-key[startA+i]),plain[i]);
    assert.equal(mod(a*B[i]+bB-key[startB+i]),
      mod(plain[i]+7+Number(corrupted.includes(i))));
  }
  const result=scan(A,B);
  assert(result.survivors.some(x=>
    x.startA===startA&&x.startB===startB&&
    x.multiplier===a&&x.caesarOffset===27&&x.matched===19));
  return result;
}
function run(){
  const actual=scan(left,right);
  const planted=positiveControl();
  assert.equal(actual.survivors.length,0);
  if(limit===DEFAULT_STARTS){
    assert.equal(actual.fingerprintPairExaminations,5931168);
    assert.equal(actual.maximum21PositionAgreement,12);
    assert.equal(planted.fingerprintPairExaminations,6132066);
    assert.equal(planted.maximum21PositionAgreement,19);
  }
  return {
    status:"No candidate recovered from original quote pair",
    hypothesis:"Same first 21 plaintext runes, up to 2 errors, an unknown nonzero common affine multiplier, arbitrary quote-wise Caesar offsets, and independent continuous original-p56 prime-totient key starts",
    source:{runes:runes.length,physicalPages:[40,53],
      globalQuotes:[[9811,9869],[12522,12592]],
      originalPrefixWordsA:expectedA,originalPrefixWordsB:expectedB,
      repeatedFiveWordPattern:prefix,occurrences:copies},
    key:{maxStart:limit,ordinal:"one-based consecutive ordinary primes",
      keyResidue:"(prime-1) mod29",affineMultipliers:28,
      distinctQuoteOffsets:"arbitrary modulo29",
      keySign:"both, by swapping source-phase start positions"},
    actual,planted
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={scan,primeTape,run};
