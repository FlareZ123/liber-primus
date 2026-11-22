'use strict';

/**
 * Exhaustive 29-prime-source field-symbol marker sieve.
 *
 * If GP rune i embeds as E_q(i)=GPprime[i] mod q, where q is itself one of
 * the 29 GP primes, a standalone symbolwise unit cipher must be injective.
 * Only nine moduli make all 29 prime residues distinct. For any one of them,
 * output zero identifies exactly the original plaintext rune of weight q,
 * independent of keys, phases, private key skips, and output alphabet order
 * if the literal prime-valued labels are retained.
 *
 * Compare all nine zero-marker hypotheses to all original LP2 word-initial,
 * terminal, and total marker positions. English control manuscripts are
 * resampled by the exact 2,896 ciphertext word lengths. Re-select the most
 * plausible of all nine moduli for every independently seeded simulation:
 * the resulting empirical tail is a familywise control for the modulus
 * choice. No ordinary GP-English literal field-unit marker survives.
 *
 * Node.js 22 CommonJS. Run in project root or elsewhere via absolute path.
 * No working-tree writes. Set GP_FIELD_REPS (integer >=100) to change trials.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseUnsolved, random32} = require('./lag6_conditioned_echo.cjs');
const {gpEncode} = require('./red_f79_zero_mask_invariant.cjs');

const ROOT=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(ROOT,name),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const REFERENCES=[
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt'
];
const REPS=Number(process.env.GP_FIELD_REPS||2000);
assert.ok(Number.isSafeInteger(REPS) && REPS>=100);
const candidates=corpus.prime.flatMap((q,marker)=>{
  const distinct=new Set(corpus.prime.map(p=>p%q)).size;
  return distinct===29?[{q,marker,name:corpus.translit[marker]}]:[];
});
assert.deepEqual(candidates.map(x=>x.q), [61,67,73,79,83,89,97,103,109]);

/**
 * Purely algebraic impossibility of nonidentity affine GP-prime residue
 * automorphisms. A map x->a*x+b on F_q permuting a 29-element subset S
 * must preserve its centered second moment V:
 *    V == a^2*V (mod q).
 * Every legal q has V nonzero, so a=+1 or -1. The mean fixes b.
 * Reflection x->2*mu-x fails on an explicit source-set witness for each q.
 * Hence the ONLY affine GP-prime symbol permutation is identity.
 *
 * @returns {object[]} Short certificates for all nine candidate moduli.
 */
function affineStabilizerCertificates() {
  const src=corpus.prime;
  const mod=(n,q)=>(n%q+q)%q;
  return candidates.map(({q})=>{
    const values=src.map(x=>x%q), set=new Set(values);
    let reciprocal29=-1;
    for(let k=1;k<q;k++)if(k*29%q===1){reciprocal29=k;break;}
    assert.ok(reciprocal29>=0);
    const sum=values.reduce((a,b)=>a+b,0)%q;
    const mean=mod(sum*reciprocal29,q);
    const second=values.reduce((a,b)=>a+b*b,0)%q;
    const centeredSecond=mod(second-29*mean*mean,q);
    assert.notEqual(centeredSecond,0,
      'Second-moment proof requires nonzero variance in F'+q);
    // Reflection is the only possible remaining candidate because a=-1.
    const reflectedShift=2*mean%q;
    const witness=values.find(x=>!set.has(mod(reflectedShift-x,q)));
    assert.notEqual(witness,undefined);
    const image=mod(reflectedShift-witness,q);
    // Independent finite search also enumerates all a,b, establishing
    // arithmetic regression for the moment-based proof above.
    const maps=[];
    for(let a=1;a<q;a++)for(let b=0;b<q;b++){
      if(values.every(x=>set.has((a*x+b)%q)))maps.push([a,b]);
    }
    assert.deepEqual(maps,[[1,0]]);
    return {modulus:q,mean,centeredSecond,
      rejectedReflection:{scale:q-1,shift:reflectedShift,
        witnessResidue:witness,imageNotInAlphabet:image},
      allAffineStabilizers:maps};
  });
}
const fieldCertificates=affineStabilizerCertificates();
const K=candidates.length, V=3*K;
const originals=parseUnsolved(read('resources/lp2-transcription.txt'));
assert.equal(originals.length,2896);
assert.equal(originals.flat().length,12956);
const lens=originals.map(w=>w.length);

/** @param {number[]} word @returns {Uint8Array} count/start/end per candidate. */
function features(word) {
  const out=new Uint8Array(V);
  for(const p of word)for(let k=0;k<K;k++)
    if(p===candidates[k].marker)out[k*3]++;
  for(let k=0;k<K;k++){
    out[k*3+1]=Number(word[0]===candidates[k].marker);
    out[k*3+2]=Number(word[word.length-1]===candidates[k].marker);
  }
  return out;
}

/** @param {Uint8Array[]} rows @returns {Int32Array} */
function summed(rows) {
  const out=new Int32Array(V);
  for(const row of rows)for(let i=0;i<V;i++)out[i]+=row[i];
  return out;
}
const observed=summed(originals.map(features));

/**
 * @param {number[][]} words
 * @returns {{bins:Map<number,Uint8Array[]>,mu:Float64Array,variance:Float64Array}}
 */
function moments(words) {
  const bins=new Map();
  for(const word of words){
    if(!bins.has(word.length))bins.set(word.length,[]);
    bins.get(word.length).push(features(word));
  }
  const empirical=new Map();
  for(const [len,items] of bins){
    const sum=new Float64Array(V), sq=new Float64Array(V);
    for(const item of items)for(let i=0;i<V;i++){
      sum[i]+=item[i];sq[i]+=item[i]*item[i];
    }
    const mu=new Float64Array(V),variance=new Float64Array(V);
    for(let i=0;i<V;i++){
      mu[i]=sum[i]/items.length;
      variance[i]=Math.max(0,sq[i]/items.length-mu[i]*mu[i]);
    }
    empirical.set(len,{mu,variance});
  }
  const mu=new Float64Array(V),variance=new Float64Array(V);
  for(const len of lens) {
    const ref=empirical.get(len);
    assert.ok(ref,'English source has no word with exact LP2 length '+len);
    for(let i=0;i<V;i++){
      mu[i]+=ref.mu[i];
      variance[i]+=ref.variance[i];
    }
  }
  return {bins,mu,variance};
}

/**
 * @param {Int32Array} maskCounts
 * @param {Float64Array} mu
 * @param {Float64Array} variance
 */
function evaluate(maskCounts,mu,variance) {
  const variants=[];
  for(let k=0;k<K;k++){
    const z=[],expected=[],sd=[],actual=[];
    for(let j=0;j<3;j++){
      const i=3*k+j;
      const spread=Math.sqrt(variance[i]+0.25);
      actual.push(maskCounts[i]);expected.push(mu[i]);sd.push(spread);
      z.push((maskCounts[i]-mu[i])/spread);
    }
    variants.push({...candidates[k],observed:actual,expected,
      sd,z,criterion:Math.max(...z.map(Math.abs))});
  }
  variants.sort((a,b)=>a.criterion-b.criterion);
  return variants;
}

/**
 * Exhaustive known-key positive across every injective modulus. Select
 * compatible ciphertext rune uniformly among non-marker symbols, infer
 * nonzero K_i=E(C_i)/E(P_i) modq, and invert using the exact known K_i.
 * The key sequence is deliberately synthetic, no LP2 key is inferred.
 * @param {number[]} plain
 * @returns {object[]}
 */
function plantedPositive(plain) {
  const rng=random32(0x28795361);
  const output=[];
  for(const {q,marker} of candidates){
    const embed=corpus.prime.map(p=>p%q);
    assert.equal(new Set(embed).size,29);
    const index=new Int8Array(q).fill(-1);
    embed.forEach((x,i)=>{index[x]=i;});
    const modPow=(base,exponent)=>{
      let x=1;
      while(exponent){
        if(exponent&1)x=x*base%q;
        base=base*base%q;
        exponent>>=1;
      }
      return x;
    };
    const inverses=embed.map(v=>v?modPow(v,q-2):0);
    let maskCorrect=0,completeCorrect=0;
    for(const p of plain){
      const outputRune=p===marker?marker:(()=>{
        let r=rng()%28;
        if(r>=marker)r++;
        return r;
      })();
      const key=p===marker?53%q:embed[outputRune]*inverses[p]%q;
      assert.ok(key>0&&key<q);
      assert.equal(embed[p]*key%q,embed[outputRune]);
      const decoded=index[embed[outputRune]*modPow(key,q-2)%q];
      completeCorrect+=Number(decoded===p);
      maskCorrect+=Number((outputRune===marker)===(p===marker));
    }
    assert.equal(completeCorrect,plain.length);
    assert.equal(maskCorrect,plain.length);
    output.push({field:q,zeroMarker:marker,correct:completeCorrect,
      total:plain.length,maskExact:true});
  }
  return output;
}

function run(){
  const detailed=[];
  for(let sourceNumber=0;sourceNumber<REFERENCES.length;sourceNumber++){
    const filename=REFERENCES[sourceNumber];
    const english=(read(filename).toUpperCase().match(/[A-Z]+/g)||[])
      .map(w=>gpEncode(w));
    const {bins,mu,variance}=moments(english);
    const actual=evaluate(observed,mu,variance);
    const best=actual[0].criterion;
    const rng=random32((0x28795361+(sourceNumber+1)*3301)>>>0);
    let exceed=0,maxSim=-Infinity,meanSim=0;
    const pool=lens.map(len=>bins.get(len));
    for(let trial=0;trial<REPS;trial++){
      const counts=new Int32Array(V);
      for(const items of pool){
        const v=items[rng()%items.length];
        for(let i=0;i<V;i++)counts[i]+=v[i];
      }
      const candidate=evaluate(counts,mu,variance)[0].criterion;
      exceed+=Number(candidate>=best);
      maxSim=Math.max(candidate,maxSim);
      meanSim+=candidate;
    }
    detailed.push({source:filename,referenceWords:english.length,
      sourceRunes:english.reduce((v,w)=>v+w.length,0),
      testedOriginalWords:originals.length,models:K,
      bestOriginal:actual.slice(0,4).map(x=>({
        q:x.q,rune:x.name,observed:x.observed,
        expected:x.expected.map(v=>+v.toFixed(2)),
        sd:x.sd.map(v=>+v.toFixed(2)),
        z:x.z.map(v=>+v.toFixed(3)),
        maxAbsoluteZ:+x.criterion.toFixed(3)})),
      empiricalNull:{trials:REPS,seed:(0x28795361+(sourceNumber+1)*3301)>>>0,
        familyExceed:exceed,addOneUpper:(exceed+1)/(REPS+1),
        maximumBestScore:maxSim,meanBestScore:meanSim/REPS}});
    assert.ok(best>3.5,
      'At least one original field unit marker resembles this GP-English source');
  }
  const plain=gpEncode(read(REFERENCES[0])).slice(0,12956);
  const positives=plantedPositive(plain);
  const final={
    hypothesis:'Any literal GP-prime-residue field-unit cipher with one of the 29 GP primes as its modulus',
    allGPPrimeFields:corpus.prime.length,
    injectiveFields:candidates,
    noninjectiveFieldCount:corpus.prime.length-K,
    affineFieldAlphabetCertificates:fieldCertificates,
    originalRunes:12956,originalWords:2896,
    criterion:'Across nine legal field primes, select smallest maximum absolute word-length matched z of total, word-initial and word-final zero-marker counts. Refit in every independent null book.',
    sourceTests:detailed,syntheticKeyedPositive:positives,
    conclusion:'No injective GP-prime field-unit model has source-English-compatible mandatory zero-rune positions; other alphabet encodings, additive terms, altered boundaries and intermediate languages remain untested. No original LP2 plaintext or key recovered.'
  };
  console.log(JSON.stringify(final,null,2));
  return final;
}
if(require.main===module)run();
module.exports={affineStabilizerCertificates,features,moments,evaluate,plantedPositive,run};
