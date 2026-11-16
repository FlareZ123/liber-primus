'use strict';
/**
 * Original p0-2 2015 witness prime-difference register, then ANY secret
 * stationary GP29 bijection indexed by the visually printed red 13-dot clock.
 * Identifiability is exact: symbol-equality collisions in each 13-state row
 * survive all 29! output permutations without learning secret keys.
 *
 * Interpret the 2015 participant operation as an unverified reversible
 * preprocessing hypothesis; do not attribute this decoder to Cicada.
 *
 * Source: original 729 GP runes, first three images (p0,p1,p2).
 * Positive control: original-geometry, authentic native-GP source words,
 * arbitrary 13 secret permutations, then exact reversible 2015 inverse.
 * Windows 11 Node22 CJS: node sims/lp2_p0_2015_prime_delta_red13_allsecret_original_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {encodeSourceNativeGP}=require('./lp2_native_gp_source_orthography_sft.cjs');
const {parseLP2Words}=require('./lp2_word_pages.cjs');
const ROOT=path.resolve(__dirname,'..');
/** @param {string} p */
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const first=corpus.pages.filter(p=>p.page>=0&&p.page<=2);
const original=first.flatMap(p=>p.indices);
assert.deepEqual(first.map(p=>p.indices.length),[262,266,201]);
assert.equal(original.length,729);
const words=parseLP2Words(read('resources/lp2-transcription.txt'),3).words;
assert.equal(words.length,158);
assert.equal(words.reduce((s,w)=>s+w.length,0),729);
const mod=x=>(x%29+29)%29;
/** @param {number} count */
function primes(count) {
  const out=[];
  for(let n=2;out.length<count;n++){
    let prime=true;
    for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break;}
    if(prime)out.push(n);
  }
  return out;
}
const prime=primes(original.length+1);
/** Reconstruct exact 2015 p0 prime-difference D from original C. */
function delta(cipher) {
  let last=27; // hypothetical imaginary F, source participant rule
  return cipher.map((c,i)=>{
    const shifted=mod(c-prime[i+1]);
    const v=mod(shifted-last);
    last=shifted;
    return v;
  });
}
/** Exact inverse for any GP29 register, with every original rune retained. */
function undelta(values) {
  let last=27;
  return values.map((v,i)=>{
    last=mod(last+v);
    return mod(last+prime[i+1]);
  });
}
const d=delta(original);
assert.deepEqual(undelta(d),original);
assert.equal(d.slice(1).filter((v,i)=>v===d[i]).length,40);
/** The participant's separately recorded second modular difference E. */
function second(values) {
  return values.map((v,i)=>mod(v-(i?values[i-1]:0)));
}
/** Recover D exactly from E by one cumulative GP29 summation. */
function undoSecond(values) {
  let last=0;
  return values.map(v=>{last=mod(last+v);return last;});
}
const e=second(d);
assert.deepEqual(undoSecond(e),d);
assert.equal(e.filter(v=>v===0).length,40);
const allPageStarts=[0,262,528];
const localWordClocks=words.flatMap(w=>Array.from({length:w.length},(_,i)=>i%13));
assert.equal(localWordClocks.length,729);
const pageClocks=original.map((_,i)=>{
  const start=allPageStarts.filter(s=>s<=i).at(-1);
  return (i-start)%13;
});
const bookClocks=original.map((_,i)=>i%13);
const clocks={book:bookClocks,page:pageClocks,word:localWordClocks};
/**
 * Secret-permutation invariant (same-state collisions).
 * @param {number[]} tape @param {number[]} clock
 */
function fingerprint(tape,clock) {
  assert.equal(tape.length,729);
  const hist=Array.from({length:13},()=>new Uint16Array(29));
  const sizes=new Uint16Array(13);
  tape.forEach((v,i)=>{hist[clock[i]][v]++;sizes[clock[i]]++;});
  let hits=0,pairs=0;
  for(let p=0;p<13;p++){
    pairs+=sizes[p]*(sizes[p]-1);
    for(const n of hist[p])hits+=n*(n-1);
  }
  const sorted=hist.map(h=>[...h].sort((a,b)=>a-b));
  return {hits,pairs,ratio:hits/pairs,sorted};
}
/** Native exact-original word-length pools from historical English corpus. */
function pools(source) {
  const result=Array.from({length:15},()=>[]);
  for(const word of source.match(/[a-z]+/gi)||[]) {
    const gp=encodeSourceNativeGP(word);
    if(gp.length<result.length)result[gp.length].push(gp);
  }
  for(const w of words)assert(result[w.length].length>0,'empty native word pool '+w.length);
  return result;
}
/** @param {number} seed */
function random(seed) {
  let s=seed>>>0;
  return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};
}
/** @param {number[][][]} buckets @param {()=>number} rand */
function nativeSource(buckets,rand) {
  const tape=words.flatMap(w=>{
    const pool=buckets[w.length];
    return pool[rand()%pool.length];
  });
  assert.equal(tape.length,729);
  return tape;
}
/** @param {()=>number} rnd */
function permutation(rnd) {
  const a=Array.from({length:29},(_,i)=>i);
  for(let i=28;i>0;i--){
    const j=rnd()%(i+1);
    [a[i],a[j]]=[a[j],a[i]];
  }
  assert.equal(new Set(a).size,29);
  return a;
}
const samples=[];
let plant=null;
const originalProfiles=Object.fromEntries(
  Object.entries(clocks).map(([name,clock])=>[name,fingerprint(d,clock)])
);
const originalSecondProfiles=Object.fromEntries(
  Object.entries(clocks).map(([name,clock])=>[name,fingerprint(e,clock)])
);
for(const [number,[name,file]] of [
  ['Shakespeare','resources/control/shakespeare_first300k.txt'],
  ['Gibran','resources/control/gibran_prophet_58585.txt'],
  ['Emerson','resources/control/emerson_essays_2944.txt']
].entries()){
  const buckets=pools(read(file));
  const rng=random((0x33011300+number*99173)>>>0);
  const distribution={name};
  for(const key of Object.keys(clocks))distribution[key]=[];
  for(let trial=0;trial<120;trial++){
    const plain=nativeSource(buckets,rng);
    for(const [key,clock] of Object.entries(clocks)){
      distribution[key].push(fingerprint(plain,clock).ratio);
      if(trial===0&&number===0&&plant===null&&key==='book'){
        const perm=Array.from({length:13},()=>permutation(rng));
        const encodedDelta=plain.map((v,i)=>perm[clock[i]][v]);
        const madeCipher=undelta(encodedDelta);
        assert.deepEqual(delta(madeCipher),encodedDelta);
        assert.deepEqual(encodedDelta.map((v,i)=>perm[clock[i]].indexOf(v)),plain);
        assert.deepEqual(undelta(delta(madeCipher)),madeCipher);
        const before=fingerprint(plain,clock),after=fingerprint(delta(madeCipher),clock);
        assert.deepEqual(after,before);
        const secondCipher=undelta(undoSecond(encodedDelta));
        assert.deepEqual(second(delta(secondCipher)),encodedDelta);
        assert.deepEqual(undelta(undoSecond(second(delta(secondCipher)))),secondCipher);
        assert.deepEqual(second(delta(secondCipher)).map((v,i)=>perm[clock[i]].indexOf(v)),plain);
        assert.deepEqual(fingerprint(second(delta(secondCipher)),clock),before);
        plant={runes:729,secretBijectiveAlphabets:13,
          exactlyRecovered:729,exactReencryption:true,
          bothParticipantRegistersInvertExactly:true,
          collisionInvariantPairs:before.pairs,
          collisionInvariantHits:before.hits};
      }
    }
  }
  samples.push(distribution);
}
assert(plant);
const results={},secondResults={};
for(const key of Object.keys(clocks)){
  const actual=originalProfiles[key];
  const secondary=originalSecondProfiles[key];
  const reference=samples.map(s=>{
    const series=s[key].slice().sort((a,b)=>a-b);
    return {name:s.name,count:series.length,
      min:series[0],median:series[Math.floor(series.length/2)],
      max:series.at(-1),
      atOrBelowOriginal:series.filter(x=>x<=actual.ratio).length};
  });
  results[key]={original:{hits:actual.hits,pairs:actual.pairs,rate:actual.ratio},
    nativeReference:reference};
  const secondReference=samples.map(s=>{
    const series=s[key].slice().sort((a,b)=>a-b);
    return {name:s.name,count:series.length,
      min:series[0],median:series[Math.floor(series.length/2)],
      max:series.at(-1),
      atOrBelowOriginal:series.filter(x=>x<=secondary.ratio).length};
  });
  secondResults[key]={original:{hits:secondary.hits,pairs:secondary.pairs,rate:secondary.ratio},
    nativeReference:secondReference};
}
assert.deepEqual(Object.values(results).flatMap(x=>x.nativeReference.map(r=>r.atOrBelowOriginal)),Array(9).fill(0));
assert.deepEqual(Object.values(secondResults).flatMap(x=>x.nativeReference.map(r=>r.atOrBelowOriginal)),Array(9).fill(0));
console.log(JSON.stringify({
  classification:'Source-constrained period13 secret-permutation family excluded against matched native prose, not universal cipher proof',
  source:'Original LP2 p0-2, participant-era February 2015 prime-difference operation, original red13 marker',
  originalRuneCount:729,originalCompletePrintedWords:words.length,
  sourceDerivedDoubledPairs:40,secondPassLiteralZeroRunes:40,
  variant:'D=prime-difference(C), or participant second-difference E_i=D_i-D_(i-1); each tested as arbitrary secret bijection[phase13](P_i)',
  exactAllSecretInvariant:'same-phase identical-pair count, invariant for each of 29! 13 stationary GP29 secret alphabets',
  plantedNativeSource:plant,
  firstPassOutput:results,
  secondPassOutput:secondResults,
  note:'English GP register and stationary 13-state symbol-only bijection assumed; different intermediate alphabet or dynamic rekey remains untested',
  recoveredUnknownPlaintext:false
},null,2));
