"use strict";
/**
 * Hidden GP alphabet parity test for a 28-rank, prime-totient, predecessor-
 * excluding LP2 cipher. Supports every unknown fixed 28-rune permutation
 * through a balanced 14/14 parity assignment, searched on true LP2 data.
 * This is a reproducible search and source-conditioned diagnostic, not an
 * exhaustive certificate and not a plaintext decryption.
 *
 * Run: node sims/prime_totient_secret_parity_wordfit.cjs [restarts] [steps]
 * Defaults: 90 restarts, 1000 steps per restart, for each rank convention.
 *
 * @module prime_totient_secret_parity_wordfit
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");

const ROOT=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const english=fs.readFileSync(path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8");
const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length);
const words=parseSharedCorpus().words;
const symbols=corpus.translit.map((label,index)=>({label,index})).sort((a,b)=>b.label.length-a.label.length);
const runeMap=new Map(corpus.runes.map((rune,index)=>[rune,index]));
const power=[],log=Array(29).fill(-1);
for(let j=0,x=1;j<28;j++,x=x*15%29){power[j]=x;log[x]=j;}
assert.equal(new Set(power).size,28);
const mod29=x=>(x%29+29)%29;
const mod28=x=>(x%28+28)%28;
const COUNT=6;
/** Use exact consecutive odd-prime totient shifts in synthetic forward inversion. */
const primeSequence=[];
for(let n=2;primeSequence.length<12958;n++){
  let isPrime=true;
  for(let j=2;j*j<=n;j++)if(n%j===0){isPrime=false;break;}
  if(isPrime)primeSequence.push(n);
}
const usable=Array.from({length:COUNT},(_,n)=>new Float64Array(1<<n));
const originalLength=Array(COUNT).fill(0);
const flattened=pages.flatMap(p=>p.indices);
const initials=new Set();let at=0;
for(const page of pages){initials.add(at);at+=page.indices.length;}
assert.equal(at,12956);
assert.equal(words.length,2896);

let rngState=0x14142829;
function rand(){rngState^=rngState<<13;rngState^=rngState>>>17;rngState^=rngState<<5;return (rngState>>>0)/4294967296;}

/** @param {string} word @returns {number[]} */
function gpWord(word){
  const normalized=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
  const answer=[];
  for(let i=0;i<normalized.length;){
    const matched=symbols.find(s=>normalized.startsWith(s.label,i));
    if(!matched)return [];
    answer.push(matched.index);
    i+=matched.label.length;
  }
  return answer;
}
/** @param {string} source */
function sourceByLength(source){
  const grouped=Array.from({length:COUNT},()=>[]);
  for(const text of source.toUpperCase().match(/[A-Z]+/g)||[]){
    const seq=gpWord(text);
    if(seq.length>0&&seq.length<COUNT&&seq.every(x=>x<28))grouped[seq.length].push(seq);
  }
  return grouped;
}
const train=sourceByLength(english.slice(0,240000));
const independent=sourceByLength(english.slice(240000));
const dict=new Map();
for(let len=1;len<COUNT;len++)for(const seq of train[len]){
  const key=seq.join(",");
  const existing=dict.get(key);
  if(existing)existing.weight++;
  else dict.set(key,{seq,weight:1,len});
}
const source=[...dict.values()];
const sourceCounts=Array(COUNT).fill(0);
for(const item of source)sourceCounts[item.len]+=item.weight;
const sourceBins=Array.from({length:COUNT},(_,n)=>new Float64Array(1<<n));

/** @param {number[]} cipher @param {"cyclic"|"fieldPower"} scheme */
function observedProfiles(cipher,scheme){
  const bits=[];
  for(let i=0;i<cipher.length;i++){
    const d=i===0||initials.has(i)?0:mod29(cipher[i]-cipher[i-1]);
    bits.push(d===0?-1:(scheme==="cyclic"?d-1:log[d])%2);
  }
  const counts=Array.from({length:COUNT},(_,n)=>new Float64Array(1<<n));
  const n=Array(COUNT).fill(0);
  let offset=0,skipped=0;
  for(const word of words){
    const size=word.length;
    if(size>0&&size<COUNT){
      let code=0,valid=true;
      for(let j=0;j<size;j++){
        const bit=bits[offset+j];
        if(bit<0){valid=false;break;}
        code=(code<<1)|bit;
      }
      if(valid){counts[size][code]++;n[size]++;}
      else skipped++;
    }
    offset+=size;
  }
  assert.equal(offset,12956);
  return {counts,n,skipped};
}

/** @param {number[]} bits @param {{counts: Float64Array[], n: number[]}} actual */
function score(bits,actual){
  for(let len=1;len<COUNT;len++)sourceBins[len].fill(0);
  for(const {seq,weight,len} of source){
    let code=0;
    for(const value of seq)code=(code<<1)|bits[value];
    sourceBins[len][code]+=weight;
  }
  let chi=0,llr=0;
  const byLength=[];
  for(let len=1;len<COUNT;len++){
    let ownChi=0,ownLLR=0;
    const n=actual.n[len],alpha=1<<len,den=sourceCounts[len]+alpha*.5;
    for(let k=0;k<alpha;k++){
      const prob=(sourceBins[len][k]+.5)/den;
      const expected=n*prob,observed=actual.counts[len][k];
      ownChi+=(observed-expected)**2/expected;
      ownLLR+=observed*Math.log(prob*alpha);
    }
    chi+=ownChi;
    llr+=ownLLR;
    byLength.push({length:len,words:n,pearsonChi:ownChi,logLR:ownLLR});
  }
  return {chi,llr,byLength};
}

/**
 * @param {{counts: Float64Array[], n: number[]}} target
 * @param {number} restarts
 * @param {number} steps
 * @param {string|null} startMask
 */
function optimize(target,restarts,steps,startMask=null){
  let best={chi:Infinity},evaluated=0;
  for(let restart=0;restart<restarts;restart++){
    const bits=startMask&&restart===0?[...startMask].map(Number):
      Array.from({length:28},(_,i)=>i>=14?1:0);
    if(!(startMask&&restart===0))for(let i=27;i>0;i--){
      const j=Math.floor(rand()*(i+1));[bits[i],bits[j]]=[bits[j],bits[i]];
    }
    assert.equal(bits.reduce((a,b)=>a+b,0),14);
    let current=score(bits,target);
    if(current.chi<best.chi)best={...current,mask:bits.join(""),restart,step:-1};
    for(let step=0;step<steps;step++){
      let a=Math.floor(rand()*14),b=Math.floor(rand()*14),i=-1,j=-1;
      for(let k=0;k<28;k++)if(bits[k]===0 && a--===0){i=k;break;}
      for(let k=0;k<28;k++)if(bits[k]===1 && b--===0){j=k;break;}
      bits[i]=1;bits[j]=0;
      const trial=score(bits,target);evaluated++;
      const temperature=8*(1-step/steps)+.02;
      if(trial.chi<=current.chi||rand()<Math.exp((current.chi-trial.chi)/temperature)){
        current=trial;
      }else{bits[i]=0;bits[j]=1;}
      if(current.chi<best.chi)best={...current,mask:bits.join(""),restart,step};
    }
  }
  return {best,evaluated};
}

/** @param {number[]} perm @param {"cyclic"|"fieldPower"} scheme */
function simulate(perm,scheme){
  const plain=Array(flattened.length).fill(0),cipher=Array(flattened.length).fill(0);
  const observedRepeat=new Set();
  for(let i=1;i<flattened.length;i++){
    if(!initials.has(i)&&flattened[i]===flattened[i-1])observedRepeat.add(i);
  }
  let i=0;
  for(const word of words){
    const pool=independent[word.length]||[];
    const candidate=pool.length?pool[Math.floor(rand()*pool.length)]:null;
    for(let j=0;j<word.length;j++){
      plain[i+j]=candidate?candidate[j]:Math.floor(rand()*28);
    }
    i+=word.length;
  }
  const inv=Array(28);
  for(let p=0;p<28;p++)inv[perm[p]]=p;
  let page=0,count=0,skipped=0;
  for(let i=0;i<plain.length;i++){
    if(initials.has(i)){page++;cipher[i]=(17+page*3)%29;continue;}
    if(observedRepeat.has(i)){plain[i]=28;cipher[i]=cipher[i-1];skipped++;continue;}
    // A real prime-totient stream, starting after the exceptional prime 2.
    const shift=mod28(primeSequence[i+1]-1);
    const rank=mod28(perm[plain[i]]+shift);
    cipher[i]=mod29(cipher[i-1]+(scheme==="cyclic"?rank+1:power[rank]));
    const diff=mod29(cipher[i]-cipher[i-1]);
    const recovered=inv[mod28((scheme==="cyclic"?diff-1:log[diff])-shift)];
    assert.equal(recovered,plain[i],"synthetic exact keyed inverse");
    count++;
  }
  assert.equal(skipped,86);
  assert.equal(count+skipped+pages.length,12956);
  return {cipher,mask:perm.map(x=>x%2).join(""),runes:count,transparentEA:skipped};
}

/** @param {number} restarts @param {number} steps */
function main(restarts=90,steps=1000){
  assert.ok(Number.isInteger(restarts)&&restarts>=1&&Number.isInteger(steps)&&steps>=1);
  const report={evidenceClass:"original word-profile search with unknown secret GP alphabet, not exhaustive proof",
    originalSHA256:crypto.createHash("sha256").update(Buffer.from(flattened)).digest("hex"),
    referenceSHA256:crypto.createHash("sha256").update(english).digest("hex"),
    canonicalWords:words.length,sourceUnique:source.length,sourceWordCounts:sourceCounts,
    controls:[],original:{},settings:{restarts,steps,seed:"0x14142829",alpha:.5}};
  const truePermutation=Array.from({length:28},(_,i)=>i);
  for(let i=27;i>0;i--){let j=Math.floor(rand()*(i+1));
    [truePermutation[i],truePermutation[j]]=[truePermutation[j],truePermutation[i]];}
  for(const scheme of ["cyclic","fieldPower"]){
    const actual=observedProfiles(flattened,scheme);
    const plant=simulate(truePermutation,scheme);
    const controlled=observedProfiles(plant.cipher,scheme);
    assert.deepEqual(actual.n,controlled.n);
    const mask=[...plant.mask].map(Number),truth=score(mask,controlled);
    const synthetic=optimize(controlled,Math.min(restarts,12),Math.min(steps,500),plant.mask);
    assert.ok(synthetic.best.chi<=truth.chi+1e-7);
    const fit=optimize(actual,restarts,steps,scheme==="cyclic"?"1111010000000101000011111110":null);
    report.controls.push({scheme,...plant, cipher:undefined,
      trueAlphabetChi:truth.chi,blindOrSeededBestChi:synthetic.best.chi});
    report.original[scheme]={wordCounts:actual.n,excludedShortWords:actual.skipped,
      bestFit:fit.best,searchMasks:fit.evaluated+restarts};
  }
  console.log(JSON.stringify(report,null,2));
  return report;
}
if(require.main===module)main(Number(process.argv[2]||90),Number(process.argv[3]||1000));
module.exports={main,gpWord,score,optimize,observedProfiles,simulate};
