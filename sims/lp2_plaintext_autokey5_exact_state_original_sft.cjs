'use strict';

/**
 * One frozen GP29 plaintext-autokey test with five-rune memory.
 * Reversible model: C[i]=P[i]+P[i-5] (mod 29) for i>=5; first five C
 * positions are externally seeded and may encode arbitrary P values.
 * The best 5-symbol seed under the independent Shakespeare GP bigram
 * model is found exactly with a 5-cycle dynamic program, not a beam search.
 * Source-aware original word boundaries are excluded from bigram scoring.
 * Source-native Gibran words are unseen by the language model and are
 * planted in the original 158-word/729-rune first-chapter geometry.
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

const fromImage = new Map(gp.runes.map((s,i)=>[s,i]));
const originalLengths=[];
const ends=new Set();
let count=0;
for(const symbol of transcript.split('%').slice(0,3).join('%')){
  if(fromImage.has(symbol)){count++;}
  if((symbol==='-'||symbol==='.') && count){
    const prev=originalLengths.reduce((sum,x)=>sum+x,0);
    originalLengths.push(count);
    ends.add(prev+count-1);
    count=0;
  }
}
if(count){const prev=originalLengths.reduce((sum,x)=>sum+x,0);originalLengths.push(count);ends.add(prev+count-1);}
assert.equal(originalLengths.length,158);
assert.equal(originalLengths.reduce((sum,v)=>sum+v,0),729);
const original=gp.pages.slice(0,3).flatMap(p=>p.indices);
assert.equal(original.length,729);

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
  assert.equal(ciphertext.length,729);
  const n=ciphertext.length;
  const table=Array.from({length:5},()=>[]);
  const unaryScore=Array.from({length:5},()=>Array(A).fill(0));
  const edgeScore=Array.from({length:5},()=>Array.from({length:A},()=>Array(A).fill(0)));

  // Each GP state at residue j mod5 depends ONLY on its one unknown P[j].
  for(let r=0;r<5;r++)for(let seed=0;seed<A;seed++){
    const plain=Array(n).fill(-1);
    for(let i=r;i<n;i+=5)plain[i]=i===r
      ? seed : (ciphertext[i]-plain[i-5]+A)%A;
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
    if(i>=5)assert.equal((plain[i]+plain[i-5])%A,ciphertext[i]);
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
  assert.equal(plain.length,729);
  return plain;
}
const emit=plain=>plain.map((v,i)=>i<5?v:(v+plain[i-5])%A);
const originalResult=recover(original);
const native=[];
for(let k=0;k<8;k++){
  const source=plant(0x5f07a1c4+k*10691);
  const inferred=recover(emit(source));
  const exact=inferred.plain.filter((x,i)=>x===source[i]).length;
  native.push({seed:k,correct:exact,score_per_rune:+(inferred.score/729).toFixed(6),
    known_seed:source.slice(0,5),inferred_seed:inferred.seed});
}
const translit=seq=>seq.map(i=>gp.translit[i]).join('');
console.log(JSON.stringify({
  type:'frozen_lag5_plaintext_autokey_source_native_test',
  source:{runes:729,words:158,language_model:'independent Shakespeare',
    controls:'8 independently selected Gibran original-shaped 729-rune texts'},
  original:{seed:originalResult.seed,score_per_rune:+(originalResult.score/729).toFixed(6),
    first150_plain_runes:translit(originalResult.plain.slice(0,150))},
  plants:native
},null,2));
