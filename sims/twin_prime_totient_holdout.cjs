'use strict';
/**
 * Reuse the authentic LP2 p56 prime-totient sequence at source-motivated
 * p15 highlighted twin-prime indices 3299 and 3301. Test the 32 finite
 * inversion cases (sign, atbash carrier, literal F skip, page reset).
 * Score p16..18, freeze one choice and challenge p19..22. The null fits
 * the same 32 hypotheses at each of 750 equally spaced random prime-index
 * pairs, retaining the actual source and the F-skip-induced IoC bias.
 *
 * No free plaintext, no dictionary fitting, no original-key assumptions.
 * CommonJS Node.js 22: node sims/twin_prime_totient_holdout.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {encode}=require('./affine_echo_literary_control.cjs');
const ROOT=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(
  path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const pages=data.pages.filter(p=>p.status==='unsolved'&&p.indices.length);
const train=pages.filter(p=>p.page>=16&&p.page<=18);
const heldout=pages.filter(p=>p.page>=19&&p.page<=22);
const MAX_PRIME=100000;
const SEED=0x3301ca15;
const SAMPLES=750;
const mod=n=>(n%29+29)%29;

/** Deterministic original mathematical source: phi(prime_i) modulo 29. */
function totientKey() {
  const composite=new Uint8Array(MAX_PRIME+1);
  composite[0]=composite[1]=1;
  for(let p=2;p*p<=MAX_PRIME;p++)
    if(!composite[p])for(let x=p*p;x<=MAX_PRIME;x+=p)composite[x]=1;
  const primes=[];
  for(let p=2;p<=MAX_PRIME;p++)if(!composite[p])primes.push(p);
  assert.equal(primes.length,9592);
  assert.equal(primes[0],2);
  assert.equal(primes[3299],30559);
  assert.equal(primes[3301],30593);
  return {primes,key:primes.map(p=>(p-1)%29)};
}
function prime(n) {
  for(let i=2;i*i<=n;i++)if(n%i===0)return false;
  return n>=2;
}
assert.ok(prime(3299)&&prime(3301)&&3301-3299===2);

/** Decode one page stream, retaining the exact proposed F-skip semantics. */
function decodePages(groups,key,start,sign,flip,skip,reset) {
  let clock=0;
  const out=[];
  for(const group of groups){
    if(reset)clock=0;
    const row=[];
    for(const c of group){
      assert.ok(start+clock<key.length,'Key sequence capacity');
      row.push(skip&&c===0 ? 0 : mod((flip?28-c:c)+sign*key[start+clock]));
      if(!(skip&&c===0))clock++;
    }
    out.push(row);
  }
  return out;
}
/** A standard 29-symbol index of coincidence over a page collection. */
function ioc(groups) {
  const h=new Uint32Array(29);
  let n=0;
  for(const group of groups)for(const x of group){h[x]++;n++;}
  assert.ok(n>1);
  let matches=0;
  for(const count of h)matches+=count*(count-1);
  return matches/(n*(n-1));
}
/**
 * Returns the training-selected model and its *unfitted* heldout IoC.
 * Scores for input-exact random-index starts are comparable without
 * external English reference data or any plaintext claim.
 */
function select(starts,key) {
  let winner=null;
  for(const start of starts)for(const sign of [-1,1])
    for(const flip of [false,true])for(const skip of [false,true])
      for(const reset of [false,true]) {
        const trainIoC=ioc(decodePages(train.map(p=>p.indices),key,
          start,sign,flip,skip,reset));
        if(!winner||trainIoC>winner.trainIoC)
          winner={start,sign,flip,skip,reset,trainIoC};
      }
  winner.heldoutIoC=ioc(decodePages(heldout.map(p=>p.indices),key,
    winner.start,winner.sign,winner.flip,winner.skip,winner.reset));
  return winner;
}
function random32(seed) {
  let state=seed>>>0;
  return ()=>{
    state^=state<<13;state^=state>>>17;state^=state<<5;
    return state>>>0;
  };
}
function positive(key) {
  const source=fs.readFileSync(
    path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8');
  const full=(source.match(/[A-Za-z]+/g)||[]).flatMap(w=>encode(w));
  let i=0,clock=0;
  const plain=[...train,...heldout].map(page=>{
    const v=full.slice(i,i+page.indices.length);
    i+=page.indices.length;
    return v;
  });
  assert.equal(i,1744);
  const start=3299,reset=true,sign=-1,flip=false;
  const encrypted=plain.map(p=>{
    if(reset)clock=0;
    const v=p.map(x=>mod(x-sign*key[start+clock++]));
    return v;
  });
  const recovered=decodePages(encrypted,key,start,sign,flip,false,reset);
  assert.deepEqual(recovered,plain);
  return {sourceRuneCount:i,sourceIoC:ioc(plain),
    recoveredIoC:ioc(recovered),exactRoundtrip:true};
}
function run() {
  assert.equal(train.reduce((n,p)=>n+p.indices.length,0),800);
  assert.equal(heldout.reduce((n,p)=>n+p.indices.length,0),944);
  const {key}=totientKey();
  const found=select([3299,3301],key);
  assert.equal(found.start,3301);
  assert.equal(found.sign,-1);
  assert.equal(found.flip,true);
  assert.equal(found.skip,true);
  assert.equal(found.reset,false);
  assert.ok(Math.abs(found.trainIoC-0.03768147684605757)<1e-12);
  assert.ok(Math.abs(found.heldoutIoC-0.0357181372108489)<1e-12);

  const random=random32(SEED),controls=[];
  for(let i=0;i<SAMPLES;i++){
    let q=random()%8000;
    if(q===3299||q===3301)q+=4;
    controls.push(select([q,q+2],key));
  }
  const n=controls.length;
  const exceedHold=controls.filter(x=>x.heldoutIoC>=found.heldoutIoC).length;
  const exceedTrain=controls.filter(x=>x.trainIoC>=found.trainIoC).length;
  assert.equal(exceedHold,328);
  assert.equal(exceedTrain,101);
  const heldoutNull=controls.map(x=>x.heldoutIoC).sort((a,b)=>a-b);
  const trueNoSkip=select([3299,3301],key);
  // A false F-skip option typically wins simply by mapping all C=F
  // directly to P=F. State that feature rather than interpreting as key.
  const result={
    hypothesis:'Authentic p56 prime-totient keystream restarted at highlighted 3299 or title prime3301',
    twinPrimes:[3299,3301],
    source:'LP2 physical p15 3299 red, 3301 Cicada title; solved LP2 p56 prime-totient decryption',
    trainPages:train.map(p=>p.page),holdoutPages:heldout.map(p=>p.page),
    variants:32,selected:found,
    selectedAgainst750MatchedRandomPrimeOffsetPairs:{
      samples:n,seed:'0x3301ca15',
      nullPairConstruction:'uniform start q in 0..7999 and q+2, same train/heldout selection across 32 variants',
      heldoutMean:heldoutNull.reduce((sum,x)=>sum+x,0)/n,
      heldoutMedian:heldoutNull[Math.floor(n/2)],
      heldout95Percentile:heldoutNull[Math.floor(0.95*n)],
      heldoutExceedances:exceedHold,heldoutUpperTail:(exceedHold+1)/(n+1),
      trainExceedances:exceedTrain,trainUpperTail:(exceedTrain+1)/(n+1),
      nullSelectedSkipCount:controls.filter(x=>x.skip).length
    },
    positive:positive(key),
    caution:'Skip-F models manufacture a high zero-rune IoC even with wrong keys; the matched-seed control handles this. No original plaintext recovered.'
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)run();
module.exports={totientKey,prime,decodePages,ioc,select,positive,run};
