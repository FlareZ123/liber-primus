'use strict';

/**
 * Exhaustive GP29 first-complete-word lexicon gate for both signed
 * five-plaintext-autokey equations. Every compatible initial 5-symbol
 * GP state is enumerated algebraically from the first original word
 * containing at least 5 GP runes. No beam, key sampling, or English fitting.
 * Windows Node22, CommonJS and standard library only, read-only.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript=read('resources/liber-primus/lp2-transcription.txt');
const shakespeare=read('resources/control/shakespeare_first300k.txt');
const gibran=read('resources/control/gibran_prophet_58585.txt');
const glyph=new Map(gp.runes.map((x,i)=>[x,i]));
const spelling=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);

/** @param {string} word @returns {number[]} */
function toGP(word){
  word=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const out=[];
  for(let i=0;i<word.length;){
    if(word.startsWith('ING',i)){out.push(21);i+=3;continue;}
    if(word.startsWith('IO',i)){out.push(27);i+=2;continue;}
    const next=spelling.find(x=>word.startsWith(x.s,i));
    assert.ok(next, 'all source English words have GP spelling');
    out.push(next.i);i+=next.s.length;
  }
  return out;
}
const english=text=>(text.match(/[A-Za-z]+/g)||[]).map(toGP);
const gWords=english(gibran);
const lexicon=new Map();
for(const w of english(shakespeare).concat(gWords)){
  const bucket=lexicon.get(w.length)||new Map();
  bucket.set(w.join(','),w);
  lexicon.set(w.length,bucket);
}
const plantPool=new Map();
for(const w of gWords){
  const bucket=plantPool.get(w.length)||[];
  bucket.push(w);
  plantPool.set(w.length,bucket);
}

/** @param {number} first @param {number} last */
function original(first,last){
  const C=gp.pages.slice(first,last).flatMap(p=>p.indices);
  const L=[],actual=[];
  let n=0,cur=[];
  for(const symbol of transcript.split('%').slice(first,last).join('%')){
    if(glyph.has(symbol)){n++;cur.push(glyph.get(symbol));}
    if((symbol==='-'||symbol==='.')&&n){L.push(n);actual.push(...cur);n=0;cur=[];}
  }
  if(n){L.push(n);actual.push(...cur);}
  assert.deepEqual(actual,C,'original transcript agrees with canonical GP corpus');
  const starts=[];let at=0;
  for(const v of L){starts.push(at);at+=v;}
  assert.equal(at,C.length);
  return {C,L,starts};
}

/** @param {number[]} L @param {number} seed @returns {number[]} */
function plant(L,seed){
  let state=seed>>>0;
  const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  return L.flatMap(len=>{
    const eligible=plantPool.get(len);
    assert.ok(eligible,'all original word lengths must have English controls');
    return eligible[Math.floor(random()*eligible.length)];
  });
}

/**
 * @param {number[]} C
 * @param {number[]} L
 * @param {number[]} starts
 * @param {1|-1} sign
 */
function attack(C,L,starts,sign){
  const A=[],B=[];
  for(let i=0;i<C.length;i++){
    if(i<5){A.push(1);B.push(0);}
    else{
      A.push(-sign*A[i-5]);
      B.push(((C[i]-sign*B[i-5])%29+29)%29);
    }
  }
  const anchor=L.findIndex(v=>v>=5);
  assert.ok(anchor>=0);
  const length=L[anchor],start=starts[anchor];
  const choices=lexicon.get(length)||new Map();
  let admissible=0,best=0,bestSeed=null,matchesFirst=0;
  // Each eligible native GP word of length>=5 algebraically determines
  // all five plaintext starting states, independent of word start offset.
  for(const word of choices.values()){
    const seed=Array(5).fill(null);
    let compatible=true;
    for(let j=0;j<length;j++){
      const i=start+j,phase=i%5;
      const required=(((word[j]-B[i])*A[i])%29+29)%29;
      if(seed[phase]===null)seed[phase]=required;
      else if(seed[phase]!==required){compatible=false;break;}
    }
    if(!compatible || seed.some(v=>v===null))continue;
    admissible++;
    let prefix=0;
    for(let k=0;k<L.length;k++){
      const candidate=Array.from({length:L[k]},(_,j)=>{
        const i=starts[k]+j;
        return (A[i]*seed[i%5]+B[i]+29)%29;
      }).join(',');
      if(!lexicon.get(L[k])?.has(candidate))break;
      prefix++;
    }
    if(prefix>0)matchesFirst++;
    if(prefix>best){best=prefix;bestSeed=seed;}
  }
  return {
    first_long_word_index:anchor,
    first_long_word_rune_start:start,
    first_long_word_rune_length:length,
    source_native_dictionary_words_at_anchor:choices.size,
    algebraically_compatible_state_candidates:admissible,
    candidates_matching_at_least_one_initial_printed_word:matchesFirst,
    best_full_dictionary_word_prefix:best,
    best_seed:bestSeed
  };
}

const cases=[];
for(const [first,last,expectedWords,expectedRunes] of [[0,3,158,729],[23,27,224,1021]]){
  const {C,L,starts}=original(first,last);
  assert.equal(C.length,expectedRunes);
  assert.equal(L.length,expectedWords);
  for(const sign of [1,-1]){
    const originalResult=attack(C,L,starts,sign);
    const positives=[];
    for(let k=0;k<8;k++){
      const plaintext=plant(L,(0x5f07a1c4+k*10691)>>>0);
      const cipher=plaintext.map((v,i)=>i<5?v:(v+sign*plaintext[i-5]+29)%29);
      const recovered=attack(cipher,L,starts,sign);
      assert.equal(recovered.best_full_dictionary_word_prefix,L.length);
      assert.deepEqual(recovered.best_seed,plaintext.slice(0,5));
      positives.push({seed:k,all_words_recovered:recovered.best_full_dictionary_word_prefix,
        exact_starting_state:true});
    }
    cases.push({original_physical_pages:'p'+first+'..p'+(last-1),
      rune_count:C.length,printed_words:L.length,feedback_sign:sign,
      original:originalResult,positive_plants:positives});
  }
}
assert.deepEqual(cases.map(x=>x.original.best_full_dictionary_word_prefix),[0,0,2,2]);
console.log(JSON.stringify({type:'exact_original_native_lexicon_autokey5_allseed_gate',
  english_lexicon:'GP29 Shakespeare + Gibran whole words',
  dictionary_types:[...lexicon.values()].reduce((n,x)=>n+x.size,0),
  cases},null,2));
