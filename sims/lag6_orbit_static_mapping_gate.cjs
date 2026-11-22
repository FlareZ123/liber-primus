'use strict';
/**
 * Source-native GP invariant for LP2 lag-six T(x)=(24-2x) mod29.
 * Any one frozen bijection from 28 plaintext symbols to 28 T-orbit
 * exponents preserves the index of coincidence, regardless of secret
 * alphabet order or the exceptional rune assignment.
 * Exact positive uses a reversible original-layout orbit encryptor.
 * Node 22 SFT: node sims/lag6_orbit_static_mapping_gate.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {corpusWords}=require('./relative_key_english_probe.cjs');
const ROOT=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(ROOT,name),'utf8');
const CORPUS=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const RAW=read('resources/lp2-transcription.txt');
const RUNE=new Map(CORPUS.runes.map((v,i)=>[v,i]));
const BOOK=RAW.split('%').slice(0,55).join('%').split(/[-.&$§]+/)
  .map(s=>[...s].filter(g=>RUNE.has(g)).map(g=>RUNE.get(g)))
  .filter(w=>w.length>0);
assert.equal(BOOK.length,2896);
assert.equal(BOOK.flat().length,12956);
const LONG=BOOK.filter(w=>w.length>=7);
assert.equal(LONG.length,559);
assert.equal(LONG.reduce((s,w)=>s+w.length-6,0),1290);
const mod=x=>(x%29+29)%29;
const orbit=Array.from({length:29},()=>[]);
const inverse=Array.from({length:29},()=>new Int8Array(29).fill(-1));
for(let x=0;x<29;x++)if(x!==8){
  let y=x;
  for(let k=0;k<28;k++){
    assert.equal(inverse[x][y],-1);
    orbit[x].push(y);inverse[x][y]=k;
    y=mod(24-2*y);
  }
  assert.equal(y,x);
  assert.equal(new Set(orbit[x]).size,28);
}
assert.equal(mod(24-2*8),8);
/** @param {ArrayLike<number>} counts @returns {number} */
function ioc(counts){
  let n=0,pairs=0;
  for(const v of counts){n+=v;pairs+=v*(v-1);}
  return pairs/(n*(n-1));
}
/** @param {number[][]} words */
function exponentStats(words){
  const counts=new Uint32Array(28);
  let n=0,antecedent8=0,exception=0,both8=0,output8=0;
  for(const w of words)for(let i=6;i<w.length;i++){
    const x=w[i-6],y=w[i];
    if(x===8){
      antecedent8++;
      if(y!==8)exception++;else both8++;
    }else if(y===8)output8++;
    else{
      const v=inverse[x][y];
      assert(v>=0);counts[v]++;n++;
    }
  }
  return {n,antecedent8,exception,both8,output8,ioc:ioc(counts),
    exponents:Array.from(counts)};
}
/** @param {number[][]} native @param {number} escape */
function nativeIoc(native,escape){
  const counts=new Uint32Array(29);
  let n=0;
  for(const w of native)for(let i=6;i<w.length;i++)
    if(w[i]!==escape&&w[i-6]!==escape){
      counts[w[i]]++;n++;
    }
  return {n,ioc:ioc(counts)};
}
/** @param {number[][]} native */
function minNative(native){
  let best={escape:-1,n:0,ioc:Infinity};
  for(let escape=0;escape<29;escape++){
    const v=nativeIoc(native,escape);
    if(v.ioc<best.ioc)best={escape,...v};
  }
  return best;
}
/** @param {number} seed */
function rng(seed){
  let x=seed>>>0;
  return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}
/** @param {number[]} array @param {()=>number} rand */
function shuffle(array,rand){
  const out=array.slice();
  for(let i=out.length-1;i>0;i--){
    const j=rand()%(i+1);
    [out[i],out[j]]=[out[j],out[i]];
  }
  return out;
}
/** @param {number[][]} words */
function buckets(words){
  const result=new Map();
  for(const w of words){
    if(!result.has(w.length))result.set(w.length,[]);
    result.get(w.length).push(w);
  }
  for(const w of BOOK)assert(result.has(w.length));
  return result;
}
/** @param {Map<number,number[][]>} grouped @param {number[]} lengths @param {()=>number} rand */
function sample(grouped,lengths,rand){
  return lengths.map(n=>{
    const options=grouped.get(n);
    return options[rand()%options.length];
  });
}
/**
 * One exact bijection for all published prefixes and fixedpoint exceptions.
 * @param {number} escape Native GP rune mapping to output GP index8.
 * @param {number} seed Fixed assignment of the other 28 plaintext runes.
 */
function model(escape,seed){
  const rand=rng(seed),letters=Array.from({length:29},(_,i)=>i)
    .filter(v=>v!==escape);
  const exponentToPlain=shuffle(letters,rand);
  const fallback=shuffle(Array.from({length:29},(_,i)=>i)
    .filter(v=>v!==8),rand);
  const plainExponent=new Int8Array(29).fill(-1),
    plainFallback=new Int8Array(29).fill(-1),
    inverseFallback=new Int8Array(29).fill(-1);
  for(let k=0;k<28;k++){
    const p=exponentToPlain[k],y=fallback[k];
    plainExponent[p]=k;
    plainFallback[p]=y;
    inverseFallback[y]=p;
  }
  plainFallback[escape]=8;inverseFallback[8]=escape;
  /** @param {number[][]} words */
  function encode(words){
    return words.map(w=>{
      const out=[];
      for(let i=0;i<w.length;i++){
        const p=w[i];
        const y=p===escape?8:
          i<6||out[i-6]===8?plainFallback[p]:
            orbit[out[i-6]][plainExponent[p]];
        out.push(y);
      }
      return out;
    });
  }
  /** @param {number[][]} words */
  function decode(words){
    return words.map(w=>{
      const out=[];
      for(let i=0;i<w.length;i++){
        const y=w[i];
        const p=y===8?escape:
          i<6||w[i-6]===8?inverseFallback[y]:
            exponentToPlain[inverse[w[i-6]][y]];
        out.push(p);
      }
      return out;
    });
  }
  return {encode,decode,escape};
}

/**
 * Boundary-independent GP control. A contiguous English GP excerpt is
 * divided at the original ciphertext's physical word lengths. The break
 * positions need not coincide with any English word break.
 */
const ORBIT_PAIRS=[];
let slot=0;
for(const w of BOOK){
  for(let j=6;j<w.length;j++)ORBIT_PAIRS.push([slot+j-6,slot+j]);
  slot+=w.length;
}
assert.equal(ORBIT_PAIRS.length,1290);
/** @param {number[]} flat @param {number} start */
function minContinuous(flat,start){
  let minimum={escape:-1,n:0,ioc:Infinity};
  for(let e=0;e<29;e++){
    const hist=new Uint32Array(29);
    let n=0;
    for(const [a,b] of ORBIT_PAIRS){
      const current=flat[start+b],previous=flat[start+a];
      if(current!==e&&previous!==e){hist[current]++;n++;}
    }
    const value=ioc(hist);
    if(value<minimum.ioc)minimum={escape:e,n,ioc:value};
  }
  return minimum;
}

function main(){
  const original=exponentStats(BOOK);
  assert.equal(original.n,1204);
  assert.equal(original.antecedent8,47);
  assert.equal(original.exception,45);
  assert.equal(original.both8,2);
  assert.equal(original.exponents[1],78);
  assert.ok(Math.abs(original.ioc-0.03685139311190462)<1e-14);
  const refs=[
    ['Shakespeare','resources/control/shakespeare_first300k.txt',0x60013133],
    ['Gibran','resources/control/gibran_prophet_58585.txt',0x60023133],
    ['Emerson','resources/control/emerson_essays_2944.txt',0x60033133]
  ];
  const trials=process.argv[2]===undefined?1500:Number(process.argv[2]);
  assert(Number.isSafeInteger(trials)&&trials>0&&trials<=10000);
  const lengths=LONG.map(w=>w.length);
  const controls=[];
  for(const [name,filename,seed] of refs){
    const raw=read(filename),native=corpusWords(raw),grouped=buckets(native);
    const next=rng(seed);
    let minimum=Infinity,maximum=-Infinity,sum=0,exceed=0,
      minimumRow=null;
    for(let i=0;i<trials;i++){
      const test=sample(grouped,lengths,next);
      const best=minNative(test);
      if(best.ioc<=original.ioc)exceed++;
      if(best.ioc<minimum){minimum=best.ioc;minimumRow=best;}
      maximum=Math.max(maximum,best.ioc);sum+=best.ioc;
    }
    const flat=native.flat(),selector=rng(seed^0xa5a5a5a5);
    const fullLength=BOOK.reduce((s,w)=>s+w.length,0);
    assert(flat.length>=fullLength);
    let independentMin=Infinity,independentMax=-Infinity,
      independentSum=0,independentExceed=0,independentExample=null;
    for(let i=0;i<trials;i++){
      const start=selector()%(flat.length-fullLength+1);
      const best=minContinuous(flat,start);
      if(best.ioc<=original.ioc)independentExceed++;
      if(best.ioc<independentMin){
        independentMin=best.ioc;independentExample={start,...best};
      }
      independentMax=Math.max(independentMax,best.ioc);
      independentSum+=best.ioc;
    }
    controls.push({name,sourceGpWords:native.length,
      sourceSHA256:createHash('sha256').update(raw).digest('hex'),
      trials,bestOfAll29ExceptionalRuneChoices:{
        minimum,mean:sum/trials,maximum,
        attainingWorstCase:minimumRow},
      atOrBelowOriginal:exceed,addOneLowerTail:(exceed+1)/(trials+1),
      boundaryIndependentContinuousSource:{
        minimum:independentMin,mean:independentSum/trials,
        maximum:independentMax,worstCase:independentExample,
        atOrBelowOriginal:independentExceed,
        addOneLowerTail:(independentExceed+1)/(trials+1)}});
  }
  // Genuine GP-English words in the exact original 2,896-word layout.
  const sourceNative=corpusWords(read(refs[0][1]));
  const plant=sample(buckets(sourceNative),BOOK.map(w=>w.length),
    rng(0x99330011));
  const key=model(8,0x2833301);
  const generated=key.encode(plant);
  assert.deepEqual(key.decode(generated),plant);
  assert.deepEqual(key.encode(key.decode(generated)),generated);
  const observedPositive=exponentStats(generated),
    predictedPositive=nativeIoc(plant,8);
  assert.equal(observedPositive.n,predictedPositive.n);
  assert.ok(Math.abs(observedPositive.ioc-predictedPositive.ioc)<1e-14);
  const result={
    classification:'key-independent scoped exclusion of a static, unpadded 28-way six-back affine orbit cipher with native English GP plaintext',
    source:{words:BOOK.length,runes:12956,sixBackWords:LONG.length,
      eligiblePairs:1290,
      SHA256:createHash('sha256').update(RAW).digest('hex')},
    fixedpoint:8,orbitOrder:28,
    original,controls,
    positive:{wholeBookExactRecoveredRunes:12956,escape:8,
      sourceNativeIoc:predictedPositive.ioc,
      encodedOrbitIoc:observedPositive.ioc,
      eligibleOrbitPairs:observedPositive.n,
      secretPermutationSeed:'0x2833301'},
    scope:'For any static 28-symbol exponent alphabet and any of 29 GP escape assignments, the selected native plaintext rune coincidence equals the published exponent coincidence. Changes of alphabet per word, a running pad, and other languages are outside this exclusion. Original six-back transform was identified by prior research.'
  };
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  return result;
}
if(require.main===module)main();
module.exports={model,exponentStats,nativeIoc,minNative,main};
