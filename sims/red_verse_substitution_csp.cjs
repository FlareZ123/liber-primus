"use strict";
/**
 * Finite dictionary-CSP inversion for the 51 highlighted LP2 p53 runes.
 * Hypotheses:
 * (a) one global arbitrary bijective substitution of GP letter IDs, intact
 *     English words (no padding);
 * (b) same global substitution plus at most one arbitrary inserted cipher
 *     rune per word, with surviving word lengths and order unchanged.
 *
 * The search is constructive: each candidate is a complete 12-word
 * plaintext and a consistent injective letter map. Source words are from the
 * pinned local TextBlob frequency lexicon, using the shared GP encoder.
 *
 * The zero/one-padding inverse is beam-ranked, not exhaustive. This script
 * explicitly reports its held-out positive-control performance. It never
 * promotes a dictionary-compatible output to a decipherment by itself.
 */
const assert=require("node:assert/strict");
const {sourceWords,lexicon}=require("./red_verse_dictionary_anchor.cjs");
const {seededRandom,shuffledPermutation}=require("./outer_permutation_assignment.cjs");

const A=29;
const WIDTH=Number(process.env.BEAM_WIDTH||900);
const MAX_NULL=Number(process.env.NULL_REPLICATES||20);
const PLANT_SEED=0x5311073c;
const CIPHER=sourceWords();
const LENGTHS=CIPHER.map(x=>x.length);
const dictionary=lexicon();
assert.deepEqual(LENGTHS,[5,4,4,11,2,3,2,6,5,5,2,2]);

/** @param {number[]} symbols @returns {string} */
function signature(symbols) {
  const m=new Map();
  return symbols.map(c=>{
    if(!m.has(c))m.set(c,m.size);
    return m.get(c);
  }).join(",");
}

/**
 * @returns {Map<string,object[]>}
 */
function lexiconIndex(){
  const index=new Map();
  const lengthTotals=new Map();
  for(const word of dictionary.words.values())
    lengthTotals.set(word.indices.length,
      (lengthTotals.get(word.indices.length)||0)+word.freq);
  for(const word of dictionary.words.values()){
    const id=word.indices.length+":"+signature(word.indices);
    const score=Math.log(word.freq/lengthTotals.get(word.indices.length));
    if(!index.has(id))index.set(id,[]);
    index.get(id).push({...word,baseScore:score});
  }
  return index;
}
const INDEX=lexiconIndex();

/**
 * @param {number[]} word
 * @param {boolean} allowInsertion
 * @returns {object[]}
 */
function makeCandidates(word,allowInsertion){
  const result=[];
  const lengths=[-1,...(allowInsertion?word.map((_,i)=>i):[])];
  for(const omit of lengths){
    const kept=word.filter((_,i)=>i!==omit);
    const options=INDEX.get(kept.length+":"+signature(kept))||[];
    const prior=omit<0?Math.log(.55):Math.log(.45/word.length);
    for(const opt of options){
      result.push({
        english:opt.english,source:opt.indices,cipher:kept,omit,
        score:opt.baseScore+prior
      });
    }
  }
  return result.sort((a,b)=>b.score-a.score);
}

/**
 * @param {number[][]} cipherWords
 * @param {boolean} allowInsertion
 * @param {number} width
 * @returns {object}
 */
function infer(cipherWords,allowInsertion,width=WIDTH){
  const candidates=cipherWords.map(w=>makeCandidates(w,allowInsertion));
  // Most informative long word first. Printed order is restored in output.
  const sequence=Array.from({length:cipherWords.length},(_,i)=>i)
    .sort((a,b)=>cipherWords[b].length-cipherWords[a].length||
      candidates[a].length-candidates[b].length);
  let beam=[{score:0,map:Array(A).fill(-1),inv:Array(A).fill(-1),chosen:Array(cipherWords.length).fill(null)}];
  const stages=[];
  for(const id of sequence){
    const next=[];
    for(const partial of beam){
      for(const word of candidates[id]){
        let good=true;
        for(let i=0;i<word.source.length;i++){
          const c=word.cipher[i],p=word.source[i];
          if((partial.map[c]!==-1&&partial.map[c]!==p)||
            (partial.inv[p]!==-1&&partial.inv[p]!==c)){
            good=false;break;
          }
        }
        if(!good)continue;
        const map=partial.map.slice(),inv=partial.inv.slice();
        for(let i=0;i<word.source.length;i++){
          map[word.cipher[i]]=word.source[i];
          inv[word.source[i]]=word.cipher[i];
        }
        const chosen=partial.chosen.slice();
        chosen[id]=word;
        next.push({score:partial.score+word.score,map,inv,chosen});
      }
    }
    next.sort((a,b)=>b.score-a.score);
    beam=next.slice(0,width);
    stages.push({word:id,variants:candidates[id].length,
      surviving:next.length,retained:beam.length});
    if(!beam.length)break;
  }
  return {
    width,allowInsertion,stages,
    best:beam.slice(0,5).map(x=>({
      score:x.score,
      text:x.chosen.map(w=>w?.english||"?").join(" "),
      omissions:x.chosen.map(w=>w?.omit??null),
      mappedRunes:x.map.filter(v=>v>=0).length,
      permutation:x.map
    }))
  };
}

/** @param {number[][]} cipherWords @param {boolean} allowInsertion */
function strictAnchorFeasibility(cipherWords,allowInsertion){
  const variants=cipherWords.map(w=>makeCandidates(w,allowInsertion));
  const anchors=variants[3];
  const viable=anchors.filter(w=>{
    const map=Array(A).fill(-1),inv=Array(A).fill(-1);
    for(let i=0;i<w.source.length;i++){
      map[w.cipher[i]]=w.source[i];
      inv[w.source[i]]=w.cipher[i];
    }
    for(let id=0;id<cipherWords.length;id++){
      if(id===3)continue;
      if(!variants[id].some(opt=>opt.source.every((p,i)=>
        (map[opt.cipher[i]]<0||map[opt.cipher[i]]===p)&&
        (inv[p]<0||inv[p]===opt.cipher[i]))))return false;
    }
    return true;
  });
  return {anchorCandidates:anchors.length,allowInsertion,
    anchorsCompatibleWithEveryWord:viable.length,
    topAnchors:viable.slice(0,5).map(x=>x.english)};
}

/** @param {number} seed */
function plant(seed){
  const random=seededRandom(seed);
  const sigma=shuffledPermutation(Array.from({length:A},(_,i)=>i),random);
  const plain=[];
  const cipher=CIPHER.map((c,i)=>{
    const useInsert=random()<.45&&c.length>1;
    const len=c.length-Number(useInsert);
    const opts=[...dictionary.words.values()].filter(w=>
      w.indices.length===len&&w.freq>=10);
    assert(opts.length>0);
    // English words selected with moderate frequency and no unused glyph type
    // assumption; this is a complete model-matched synthetic plaintext.
    const word=opts[Math.floor(random()*Math.min(50,opts.length))];
    plain.push(word.english);
    const output=word.indices.map(v=>sigma[v]);
    if(useInsert){
      const at=Math.floor(random()*(output.length+1));
      output.splice(at,0,Math.floor(random()*A));
    }
    return output;
  });
  return {cipher,plain:plain.join(" "),sigma};
}

function nullCipher(random){
  const src=CIPHER.flat(),n=src.length;
  const out=src.slice();
  for(let i=n-1;i>0;i--){
    const j=Math.floor(random()*(i+1));
    [out[i],out[j]]=[out[j],out[i]];
  }
  let p=0;
  return LENGTHS.map(len=>{const result=out.slice(p,p+len);p+=len;return result;});
}

function main(){
  const realNoPadding=strictAnchorFeasibility(CIPHER,false);
  const realPaddingFeasibility=strictAnchorFeasibility(CIPHER,true);
  const planted=plant(PLANT_SEED);
  const plantScore=infer(planted.cipher,true);
  const actual=infer(CIPHER,true);
  const random=seededRandom(PLANT_SEED+1);
  const nullScores=[],nullSolved=[];
  for(let i=0;i<MAX_NULL;i++){
    const fake=infer(nullCipher(random),true);
    nullScores.push(fake.best[0]?.score??-Infinity);
    nullSolved.push(fake.best.length>0);
  }
  const score=actual.best[0]?.score??-Infinity;
  const ordered=nullScores.slice().sort((a,b)=>a-b);
  console.log(JSON.stringify({
    source:"51 red runes, 12 complete words from scanned LP2 page53",
    dictionaryEntries:dictionary.words.size,
    mode:"one fixed arbitrary bijective mapping of 29 GP rune labels",
    strict:realNoPadding,
    paddedAnchor:realPaddingFeasibility,
    positive:{plantSeed:PLANT_SEED,source:planted.plain,
      recoveredLiteral:plantScore.best.some(x=>x.text===planted.plain),
      best:plantScore.best,stages:plantScore.stages},
    real:actual,
    null:{replicates:MAX_NULL,seed:PLANT_SEED+1,
      nullSolved:nullSolved.filter(Boolean).length,
      median:ordered[Math.floor(MAX_NULL/2)],
      max:ordered.at(-1),
      upperTail:(1+ordered.filter(x=>x>=score).length)/(MAX_NULL+1)}
  },null,2));
}
if(require.main===module)main();
module.exports={signature,makeCandidates,infer,strictAnchorFeasibility,plant};
