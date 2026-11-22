'use strict';

/**
 * Exact original-source test: the signed EPIPHANY SEEKS THE DEVOTED
 * 23-hop base60 p50 route has 22 interior states, and p32 has
 * 22 printed word fragments. Use each state as the ordinal starting
 * prime for that fragment under the authenticated p56 prime−1 cipher.
 *
 * F transparency is exhausted by testing all 2^4 masks on p32's
 * four actual ciphertext-F sites. Two natural ordinal origins and
 * three route alignments are included, no offsets or hidden keys fitted.
 * Run: node sims/lp2_p32_signed23_wordstart_prime_totient_source_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
/** @param {string} name @returns {string} */
const read=name=>fs.readFileSync(path.join(ROOT,name),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const printed=read('resources/liber-primus/lp2-transcription.txt');
const signed=read('resources/historical/cicada2016-4gq25-outguess.asc');
const mod=x=>(x%29+29)%29;
assert(signed.includes('EPIPHANY SEEKS THE DEVOTED'));
const alphabet=grid.alphabet;
assert.equal(alphabet.length,60);
const bytes=grid.pages.flatMap(p=>p.tokens).map(token=>
  60*alphabet.indexOf(token[0])+alphabet.indexOf(token[1]));
assert.equal(bytes.length,256);
assert(bytes.every(x=>x>=0&&x<=255));
const route=[71];
for(let i=0;i<23;i++)route.push(bytes[route.at(-1)]);
assert.deepEqual(route,[71,108,14,183,81,58,146,92,236,238,129,
  179,175,18,15,212,70,169,228,144,125,20,102,32]);
assert.equal(corpus.pages.find(x=>x.page===32).indices.length,121);
const idx=new Map(corpus.runes.map((r,i)=>[r,i]));
const fragments=printed.split('%')[32].replace(/[\r\n/\s]/g,'')
  .split(/[-.]/).map(w=>Array.from(w).filter(r=>idx.has(r)).map(r=>idx.get(r)))
  .filter(x=>x.length>0);
const cipher=fragments.flat();
assert.deepEqual(cipher,corpus.pages.find(p=>p.page===32).indices);
assert.deepEqual(fragments.map(x=>x.length),
  [1,3,5,11,5,5,3,11,6,9,5,8,4,9,4,8,2,3,2,8,5,4]);
const fSites=cipher.flatMap((x,i)=>x===0?[i]:[]);
assert.deepEqual(fSites,[29,30,42,114]);
const primes=[];
for(let k=2;primes.length<500;k++){
  let prime=true;
  for(let d=2;d*d<=k;d++)if(k%d===0){prime=false;break}
  if(prime)primes.push(k);
}
/** @param {number[]} cipherSource @param {number[]} starts
 * @param {number} mask @returns {{decoded:number[],invalid:number[],used:number}} */
function decrypt(cipherSource,starts,mask){
  const output=[],invalid=[];let used=0,pos=0;
  for(let j=0;j<fragments.length;j++){
    let primeOrdinal=starts[j];
    for(let k=0;k<fragments[j].length;k++,pos++){
      const v=cipherSource[pos],fIndex=fSites.indexOf(pos);
      if(fIndex>=0&&(mask&(1<<fIndex))){output.push(0);continue}
      const p=mod(v-(primes[primeOrdinal++]-1));
      output.push(p);used++;
      if(p===0)invalid.push(pos); // F may only arise from a bypass
    }
  }
  return {decoded:output,invalid,used};
}
let p56Prime=0;
const p56=corpus.pages.find(p=>p.page===56).indices;
const p56Plain=p56.map((c,i)=>i===56?0:mod(c-(primes[p56Prime++]-1)));
assert.equal(p56Prime,84);
assert.equal(p56Plain.slice(0,5).map(x=>corpus.translit[x]).join(''),'ANEND');
assert.equal(p56Plain.slice(0,31).map(x=>corpus.translit[x]).join(''),
  'ANENDWITHINTHEDEEPWEBTHEREEXISTS');
const tokens=corpus.translit.map((symbol,index)=>({symbol,index}))
  .sort((a,b)=>b.symbol.length-a.symbol.length);
/** @param {string} word @returns {number[]} */
function gp(word){
  const input=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG')
    .replace(/IO/g,'IA');
  const out=[];let pos=0;
  while(pos<input.length){
    const t=tokens.find(row=>input.startsWith(row.symbol,pos));
    if(!t)return [];
    out.push(t.index);pos+=t.symbol.length;
  }
  return out;
}
const native=(read('resources/control/gibran_prophet_58585.txt')
  .match(/[A-Za-z]+/g)||[]).flatMap(gp);
const split=Math.floor(native.length*2/3);
const train=native.slice(0,split),hold=native.slice(split);
const trigram=new Map();
for(let i=2;i<train.length;i++){
  const k=train[i-2]*841+train[i-1]*29+train[i];
  trigram.set(k,(trigram.get(k)||0)+1);
}
const denom=train.length-2+.25*29**3;
/** @param {number[]} values @returns {number} */
function score(values){
  let sum=0;
  for(let i=2;i<values.length;i++){
    const k=values[i-2]*841+values[i-1]*29+values[i];
    sum+=Math.log(((trigram.get(k)||0)+.25)/denom);
  }
  return sum/(values.length-2);
}
const nativeScores=[];
for(let i=0;i+cipher.length<=hold.length;i+=50)
  nativeScores.push(score(hold.slice(i,i+cipher.length)));
const nativeMin=Math.min(...nativeScores);
assert(Math.abs(nativeMin+9.345100027365)<1e-7);
// Positive: genuine GP-native plaintext with the identical word-fragment
// boundaries and the exact selected original-F mask, forward encrypted.
const positiveMask=5,positivePlain=native.filter(x=>x!==0).slice(0,121);
for(let i=0;i<fSites.length;i++)if(positiveMask&(1<<i))
  positivePlain[fSites[i]]=0;
const starts=route.slice(1,-1);
const positiveCipher=[];let pos=0;
for(let j=0;j<fragments.length;j++){
  let primeIndex=starts[j];
  for(let k=0;k<fragments[j].length;k++,pos++){
    const fIndex=fSites.indexOf(pos);
    positiveCipher.push(fIndex>=0&&(positiveMask&(1<<fIndex))?0:
      mod(positivePlain[pos]+(primes[primeIndex++]-1)));
  }
}
assert.deepEqual(decrypt(positiveCipher,starts,positiveMask).decoded,
  positivePlain);
const alignments={
  internal:route.slice(1,-1),
  starting:route.slice(0,-2),
  ending:route.slice(2),
};
const results=[];
for(const [alignment,sourceStarts] of Object.entries(alignments)){
  for(const origin of [0,1]){
    const actualStarts=sourceStarts.map(x=>x-origin);
    for(let mask=0;mask<16;mask++){
      const trial=decrypt(cipher,actualStarts,mask);
      results.push({alignment,origin,mask,invalid:trial.invalid.length,
        earliestInvalid:trial.invalid[0]??null,
        score:score(trial.decoded),
        prefix:trial.decoded.slice(0,35).map(x=>corpus.translit[x]).join('')});
    }
  }
}
assert.equal(results.length,96);
assert.equal(results.filter(x=>x.invalid===0).length,0);
assert.equal(results.filter(x=>x.score>=nativeMin).length,0);
results.sort((a,b)=>b.score-a.score);
console.log(JSON.stringify({
  status:'PASS',source:'original p32 121 runes/22 fragments + original p50 23-hop route',
  p56AuthenticPositive:85,sourceNativeP32Positive:121,
  originalCiphertextF:fSites,nativeHeldoutFloor:nativeMin,
  allSourceFiniteTrials:96,
  cryptographicallyAdmissible:results.filter(x=>x.invalid===0).length,
  aboveNativeFloor:results.filter(x=>x.score>=nativeMin).length,
  highestScoring:results.slice(0,5),
  decision:'Reject this exact per-fragment original-route-seeded p56 prime-totient transfer without fitted offsets or fragment-private keys; no original LP2 plaintext.'
},null,2));
