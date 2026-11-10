"use strict";
/**
 * Keyless source-fixed necessary condition for historical Parable-modulus BBS.
 *
 * Exact source 2013 AUDIO/761.MP3 metadata = 1259*1031*1229.
 * For ANY source starting state, 1259-QR group order629 has squaring
 * order72 and 1031-QR order515 has squaring order204. The full original
 * 3-prime factor 1229 satisfies 1229-1=4*307: after two squarings its
 * nonzero field component lies in the order-307 odd subgroup, with
 * squaring order102. Since lcm(72,204,102)=1224, BOTH the two-prime
 * Blum modulus and the entire 1595277641 historical source number force
 * x_{t+1224}=x_t at every position t>=2 after two squarings.
 * This is an exact CRT conclusion for all seeds, including zero factors.
 *
 * Thus direct extracted state keys and five-packed parity keys have period
 * dividing1224, while eight consecutive parity bits/symbol yield period
 * dividing 1224/gcd(8,1224)=153.
 *
 * At equal key phase an additive GP29 pad preserves ciphertext equality
 * exactly; an exponent-step GP28 pad preserves equality of its reversible
 * nonzero-difference discrete-log ranks. This excludes unknown BBS SEEDS
 * without trying any seed and without relying on language-model fitting.
 * Run: node sims/parable_blum_keyless_period_gate.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {encode}=require("./grid_keyskip_viterbi.cjs");
const ROOT=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const co=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=co.pages.filter(p=>p.page<=55&&p.indices.length).map(p=>p.indices);
const lens=pages.map(p=>p.length),original=pages.flat();
assert.equal(original.length,12956);
const P=1259,Q=1031,R=1229,M=P*Q,FULL=M*R;
assert.equal(M,1298029);
assert.equal(FULL,1595277641);
const gcd=(a,b)=>b?gcd(b,a%b):a;
const lcm=(a,b)=>a/gcd(a,b)*b;
function order2(n){
  let x=2%n,p=1;
  while(x!==1){x=x*2%n;p++;assert(p<=n);}
  return p;
}
const ordP=order2((P-1)/2),ordQ=order2((Q-1)/2);
const statePeriod=lcm(ordP,ordQ);
const ordR=order2((R-1)/4),fullPeriod=lcm(statePeriod,ordR);
assert.deepEqual([ordP,ordQ,ordR,statePeriod,fullPeriod],[72,204,102,1224,1224]);
/** BigInt source witnesses; theorem above, not samples, proves all seeds. */
function squareWitness(modulus,seed,transient){
  const m=BigInt(modulus);let x=BigInt(seed)%m;
  for(let i=0;i<transient;i++)x=x*x%m;
  const expected=x;
  for(let i=0;i<fullPeriod;i++)x=x*x%m;
  assert.equal(x,expected);
}
for(const seed of [0,1,2,761,1033,3301,1259,1031,1229,FULL-1]){
  squareWitness(M,seed,1);
  squareWitness(FULL,seed,2);
}
const period8=statePeriod/gcd(8,statePeriod);
const period5=statePeriod/gcd(5,statePeriod);
assert.deepEqual([period8,period5],[153,1224]);

const mod=(x,n)=>(x%n+n)%n;
const fieldLog=new Int8Array(29).fill(-1),pow=new Uint8Array(28);
for(let i=0,x=1;i<28;i++){pow[i]=x;fieldLog[x]=i;x=x*15%29;}
const startOffsets=[];let n=0;
for(const len of lens){startOffsets.push(n);n+=len;}
const startSet=new Set(startOffsets);

/** Return the alphabet of 28 NONZERO field differences at non-duplicate sites. */
function rank28(cipher){
  const out=new Int16Array(cipher.length).fill(-1);
  for(let i=1;i<cipher.length;i++){
    if(startSet.has(i))continue;
    const diff=mod(cipher[i]-cipher[i-1],29);
    if(diff>0)out[i]=fieldLog[diff];
  }
  return out;
}
/** Exact lag-pair identical-symbol count, dropping -1 GP28 erasures. */
function lagPair(indices,L,minIndex=0) {
  let valid=0,equal=0;
  for(let i=minIndex;i+L<indices.length;i++){
    if(indices[i]<0||indices[i+L]<0)continue;
    valid++;
    if(indices[i]===indices[i+L])equal++;
  }
  return {lag:L,valid,equal,rate:equal/valid};
}
const plainSource=encode(read("resources/control/shakespeare_first300k.txt").slice(120000));
assert(plainSource.length>=original.length);
const control=Uint8Array.from(plainSource.slice(0,original.length));
const controlSameKeyGP29=lagPair(control,period5);
const control153=lagPair(control,period8);
const original29=[period8,period5].map(L=>lagPair(original,L));
const origRanks=rank28(original);
const original28=[period8,period5].map(L=>lagPair(origRanks,L));
const fullSourcePostTransientGP29=[period8,period5].map(L=>lagPair(original,L,2));
const fullSourcePostTransientGP28=[period8,period5].map(L=>lagPair(origRanks,L,2));
const controlRank=Int16Array.from(control, x=>x===28?-1:x);
const control28=[period8,period5].map(L=>lagPair(controlRank,L));

/**
 * Native-text exact witness that the same-source cyclic GP29 pad preserves
 * all phase-lag equalities. The pad can have arbitrary unknown symbols.
 */
function plant29(L){
  const key=Uint8Array.from({length:L},(_,i)=>mod(i*i+761*i+3301,29));
  const fake=Uint8Array.from(control,(p,i)=>mod(p+key[i%L],29));
  const same=lagPair(fake,L),source=lagPair(control,L);
  assert.deepEqual(same,source);
  return {keySymbols:L,originalLanguageRate:source.rate,
    encryptedSamePhaseRate:same.rate,equal:same.equal};
}

/**
 * Native-text exact witness that EA-transparent F29 field28 difference
 * inversion preserves all phase-lag equalities where the emitted
 * GP runes differ from the previous rune and both are nonhead sites.
 */
function plant28(L){
  const key=Uint8Array.from({length:L},(_,i)=>mod(i*i+761*i+3301,28));
  const emitted=new Uint8Array(control.length);
  let prev=0;
  for(const [pageNo,len] of lens.entries()){
    const offset=startOffsets[pageNo];
    for(let j=0;j<len;j++){
      const index=offset+j,p=control[index];
      if(j===0)emitted[index]=p;
      else emitted[index]=p===28?emitted[index-1]:
        mod(emitted[index-1]+pow[(p+key[index%L])%28],29);
    }
    prev+=len;
  }
  assert.equal(prev,control.length);
  const source=Int16Array.from(control,(x,i)=>startSet.has(i)||x===28?-1:x);
  const expected=lagPair(source,L),actual=lagPair(rank28(emitted),L);
  assert.deepEqual(actual,expected);
  return {keySymbols:L,originalLanguageRate:expected.rate,
    encryptedSamePhaseRate:actual.rate,equal:actual.equal};
}
function main(){
  const result={
    historicalSource:"Cicada 2013 761.MP3 ID3 Parable 1595277641=1259*1031*1229",
    twoPrimeBlumModulus:M,fullHistoricalThreePrimeModulus:FULL,
    postSquareOddOrders:[(P-1)/2,(Q-1)/2,(R-1)/4],
    squareMapOrders:[ordP,ordQ,ordR],
    sourceTransientSquaresFullModulus:2,fullModulusStatePeriodMultiple:fullPeriod,
    exactStatePeriodMultiple:statePeriod,bit5GroupPeriodMultiple:period5,
    bit8GroupPeriodMultiple:period8,sourceRunes:original.length,
    originalGP29:original29,
    englishNativeGP29:[control153,controlSameKeyGP29],
    originalNonzeroFieldGP28:original28,
    threePrimePostTransientGP29:fullSourcePostTransientGP29,
    threePrimePostTransientGP28:fullSourcePostTransientGP28,
    englishNativeNonEA_GP28:control28,
    witnessedAdditive29:[plant29(period8),plant29(period5)],
    witnessedField28:[plant28(period8),plant28(period5)],
    caveats:"Only book-continuous, exact-phase, fixed-alphabet direct channels; hidden key-skips, per-page independent states, changing alphabet or non-English register can evade this identity."};
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)main();
module.exports={lagPair,rank28,order2,plant29,plant28,main};
