'use strict';

/**
 * Two fixed GP29 plaintext-autokey signs with five-rune memory.
 * Reversible model: C[i]=P[i]+sign*P[i-5] (mod 29), sign=+1/-1.
 * The first five plaintext runes are unconstrained starting states.
 * The best 5-symbol seed under the independent Shakespeare GP bigram
 * model is found exactly with a 5-cycle dynamic program, not a beam search.
 * Source-aware original word boundaries are excluded from bigram scoring.
 * Source-native Gibran words are unseen by the language model and are
 * planted in the original source-chapter word/rune geometry.
 * Windows Node22, standard library only, read-only.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const reference = read('resources/control/shakespeare_first300k.txt');
const withheld = read('resources/control/gibran_prophet_58585.txt');
const A = 29;
const order = gp.translit.map((s, i) => ({s, i})).sort((a,b)=>b.s.length-a.s.length);

/** @param {string} original @returns {number[]} */
function toGP(original) {
  const word = original.toUpperCase().replace(/QU/g,'CW')
    .replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const runes=[];
  for(let i=0;i<word.length;){
    if(word.startsWith('ING',i)){runes.push(21);i+=3;continue;}
    if(word.startsWith('IO',i)){runes.push(27);i+=2;continue;}
    const next = order.find(x=>word.startsWith(x.s,i));
    assert.ok(next, 'known Latin spelling has native GP conversion');
    runes.push(next.i);
    i+=next.s.length;
  }
  return runes;
}
const words = text => (text.match(/[A-Za-z]+/g)||[]).map(toGP);
const modelWords = words(reference);
const hiddenWords = words(withheld);
assert.equal(modelWords.flat().length, 217106);

function runTarget(firstPage,lastPage,expectedWords,expectedRunes,sign){
assert.ok(sign===1 || sign===-1);
const fromImage = new Map(gp.runes.map((s,i)=>[s,i]));
const originalLengths=[];
const ends=new Set();
let count=0;
for(const symbol of transcript.split('%').slice(firstPage,lastPage).join('%')){
  if(fromImage.has(symbol)){count++;}
  if((symbol==='-'||symbol==='.') && count){
    const prev=originalLengths.reduce((sum,x)=>sum+x,0);
    originalLengths.push(count);
    ends.add(prev+count-1);
    count=0;
  }
}
if(count){const prev=originalLengths.reduce((sum,x)=>sum+x,0);originalLengths.push(count);ends.add(prev+count-1);}
assert.equal(originalLengths.length,expectedWords);
assert.equal(originalLengths.reduce((sum,v)=>sum+v,0),expectedRunes);
const original=gp.pages.slice(firstPage,lastPage).flatMap(p=>p.indices);
assert.equal(original.length,expectedRunes);

// The exact source GP bigram probability is frozen before original decoding.
const unary=Array(A).fill(1);
const pair=Array.from({length:A},()=>Array(A).fill(.25));
for(const w of modelWords)for(let j=0;j<w.length;j++){
  unary[w[j]]++;
  if(j)pair[w[j-1]][w[j]]++;
}
const uTotal=unary.reduce((a,b)=>a+b,0);
const logU=unary.map(v=>Math.log(v/uTotal));
const logB=pair.map(r=>{
  const n=r.reduce((a,b)=>a+b,0);
  return r.map(v=>Math.log(v/n));
});
const W=0.25; // Source-frozen unigram weight.

/** @param {number[]} ciphertext @returns {object} */
function recover(ciphertext){
  assert.equal(ciphertext.length,expectedRunes);
  const n=ciphertext.length;
  const table=Array.from({length:5},()=>[]);
  const unaryScore=Array.from({length:5},()=>Array(A).fill(0));
  const edgeScore=Array.from({length:5},()=>Array.from({length:A},()=>Array(A).fill(0)));

  // Each GP state at residue j mod5 depends ONLY on its one unknown P[j].
  for(let r=0;r<5;r++)for(let seed=0;seed<A;seed++){
    const plain=Array(n).fill(-1);
    for(let i=r;i<n;i+=5)plain[i]=i===r
      ? seed : (ciphertext[i]-sign*plain[i-5]+A)%A;
    table[r][seed]=plain;
    for(let i=r;i<n;i+=5)unaryScore[r][seed]+=logU[plain[i]]*W;
  }

  // Bigram terms link only adjacent residue states, a 5-cycle graph.
  for(let i=0;i<n-1;i++){
    if(ends.has(i))continue;
    const r=i%5, rr=(i+1)%5;
    for(let x=0;x<A;x++){
      const left=table[r][x][i];
      for(let y=0;y<A;y++)edgeScore[r][x][y]+=logB[left][table[rr][y][i+1]];
    }
  }

  let bestScore=-Infinity, bestSeed=null;
  for(let s0=0;s0<A;s0++){
    let prev=Array.from({length:A},(_,s1)=>unaryScore[1][s1]+edgeScore[0][s0][s1]);
    const parent=Array(5).fill(null);
    for(let r=2;r<=4;r++){
      const next=Array(A).fill(-Infinity),back=Array(A).fill(-1);
      for(let x=0;x<A;x++)for(let y=0;y<A;y++){
        const cand=prev[x]+unaryScore[r][y]+edgeScore[r-1][x][y];
        if(cand>next[y]){next[y]=cand;back[y]=x;}
      }
      prev=next;parent[r]=back;
    }
    for(let s4=0;s4<A;s4++){
      const score=prev[s4]+unaryScore[0][s0]+edgeScore[4][s4][s0];
      if(score>bestScore){
        const s3=parent[4][s4],s2=parent[3][s3],s1=parent[2][s2];
        bestScore=score;
        bestSeed=[s0,s1,s2,s3,s4];
      }
    }
  }
  const plain=Array.from({length:n},(_,i)=>table[i%5][bestSeed[i%5]][i]);
  // Independently replay the score and the exact original forward cipher.
  let verify=0;
  for(let i=0;i<n;i++){
    verify+=logU[plain[i]]*W;
    if(i && !ends.has(i-1))verify+=logB[plain[i-1]][plain[i]];
    if(i>=5)assert.equal(((plain[i]+sign*plain[i-5]+A)%A),ciphertext[i]);
  }
  assert.ok(Math.abs(verify-bestScore)<1e-7);
  return {seed:bestSeed,score:bestScore,plain};
}
const sourceBuckets=new Map();
for(const w of hiddenWords){
  const list=sourceBuckets.get(w.length)||[];
  list.push(w);
  sourceBuckets.set(w.length,list);
}
const missing=[...new Set(originalLengths)].filter(L=>!sourceBuckets.has(L));
assert.deepEqual(missing,[], 'Gibran must provide every original word length');

/** @param {number} seed @returns {number[]} */
function plant(seed){
  let state=seed>>>0;
  const next=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  const plain=originalLengths.flatMap(length=>{
    const eligible=sourceBuckets.get(length);
    return eligible[Math.floor(next()*eligible.length)];
  });
  assert.equal(plain.length,expectedRunes);
  return plain;
}
const emit=plain=>plain.map((v,i)=>i<5?v:((v+sign*plain[i-5]+A)%A));
const originalResult=recover(original);
const native=[];
for(let k=0;k<8;k++){
  const source=plant(0x5f07a1c4+k*10691);
  const inferred=recover(emit(source));
  const exact=inferred.plain.filter((x,i)=>x===source[i]).length;
  native.push({seed:k,correct:exact,score_per_rune:+(inferred.score/expectedRunes).toFixed(6),
    known_seed:source.slice(0,5),inferred_seed:inferred.seed});
}
const translit=seq=>seq.map(i=>gp.translit[i]).join('');

/*
 * Permutation-invariant original test. For i>=6 both C[i], C[i-1] are
 * after the unknown five-symbol initialization. Any fixed output alphabet
 * permutation (even one changed per printed word) preserves same-word
 * adjacent equalities, for either sign, so the deficit survives
 * relabeling a complete autokey output alphabet.
 */
function repeatCounts(seq){
  let internal=0,cross=0;
  for(let i=6;i<seq.length;i++)if(seq[i]===seq[i-1]){
    if(ends.has(i-1))cross++;
    else internal++;
  }
  return {internal,cross};
}
const observedRepeat=repeatCounts(original);
const repeats=[];
let low=0,high=-Infinity,minimum=Infinity,total=0,totalSq=0;
const INVARIANT_SAMPLES=4096;
for(let k=0;k<INVARIANT_SAMPLES;k++){
  const seed=(0x45391fac+Math.imul(k,16211))>>>0;
  const eq=repeatCounts(emit(plant(seed)));
  repeats.push(eq.internal);
  if(eq.internal<=observedRepeat.internal)low++;
  if(eq.internal<minimum)minimum=eq.internal;
  if(eq.internal>high)high=eq.internal;
  total+=eq.internal;
  totalSq+=eq.internal*eq.internal;
}
const repMean=total/INVARIANT_SAMPLES;
const invariant={
  observed:observedRepeat,
  simulated_plants:INVARIANT_SAMPLES,
  source:'original-geometry independent Gibran GP words, Shakespeare trained',
  minimum,maximum:high,
  mean:+repMean.toFixed(3),
  sd:+Math.sqrt((totalSq-INVARIANT_SAMPLES*repMean*repMean)/(INVARIANT_SAMPLES-1)).toFixed(3),
  count_at_or_below:low,
  empirical_lower_tail:+((low+1)/(INVARIANT_SAMPLES+1)).toFixed(9)
};

return {
  type:'frozen_lag5_plaintext_autokey_source_native_test',
  sign,
  source:{runes:expectedRunes,words:expectedWords,language_model:'independent Shakespeare',
    controls:'8 independently selected Gibran original-shaped expectedRunes-rune texts'},
  original:{seed:originalResult.seed,score_per_rune:+(originalResult.score/expectedRunes).toFixed(6),
    first150_plain_runes:translit(originalResult.plain.slice(0,150))},
  plants:native,
  invariant
};
}
console.log(JSON.stringify({
  type: 'exact_five_position_gp29_two_sign_plaintext_autokey_original_gate',
  chapters: [
    {pages:'p0..p2', ...runTarget(0,3,158,729,+1)},
    {pages:'p23..p26', ...runTarget(23,27,224,1021,+1)},
    {pages:'p0..p2', ...runTarget(0,3,158,729,-1)},
    {pages:'p23..p26', ...runTarget(23,27,224,1021,-1)}
  ]
},null,2));
