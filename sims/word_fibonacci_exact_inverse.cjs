"use strict";
/**
 * Exact, source-motivated Fibonacci-key feasibility on original LP2 words.
 *
 * Tests both reading directions of a word-restarted modulo-29 Fibonacci
 * additive keystream. Each word receives two completely unrestricted seeds.
 * At any output index a tentative adjacent collision may be rerouted:
 * arbitrary nonprevious rune at i<6, or T(C[i-6]) at i>=6, with
 * T(x)=(24-2*x) mod29. Every physically possible repair is allowed.
 *
 * The first two ciphertext positions restrict the two unknown key seeds
 * to at most four pairs. All subsequent keys are algebraically determined.
 * No language-scored optimization, plaintext hallucination or key guessing.
 * @module word_fibonacci_exact_inverse
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {createHash}=require("node:crypto");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");
const {loadLexicon,sampleHeldout}=require("./word_period5_unknown_key_exact_inverse.cjs");

const ROOT=path.resolve(__dirname,"..");
const SOURCE=fs.readFileSync(path.join(ROOT,"resources/lp2-transcription.txt"),"utf8");
const CORPUS=JSON.parse(fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const INDEX=new Map(CORPUS.runes.map((r,i)=>[r,i]));
const WORDS=parseSharedCorpus().words.map(w=>[...w.runes].map(r=>{
  const result=INDEX.get(r);
  assert.notEqual(result,undefined);
  return result;
}));
assert.equal(WORDS.length,2896);
assert.equal(WORDS.flat().length,12956);
const DIRECTIONS=["forward","reverse"];
const MIN_LENGTH=10;
const SEED=0x3f1b0acc;
const mod=x=>(x%29+29)%29;
const T=x=>mod(24-2*x);
/** @param {number} seed */
function rng(seed){let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};}

/**
 * The exact permissible pad residues at a published position.
 * @param {number[]} c Published ciphertext word.
 * @param {number[]} p Candidate source word.
 * @param {number} i Word-local index.
 * @param {number} before Prior word's final published rune, or -1.
 */
function allowed(c,p,i,before){
  const previous=i>0?c[i-1]:before;
  const values=[mod(c[i]-p[i])];
  if(previous>=0 && c[i]!==previous &&
      (i<6 || c[i]===T(c[i-6])))
    values.push(mod(previous-p[i]));
  return values;
}

/** @param {"forward"|"reverse"} direction */
function next(a,b,direction){
  return direction==="forward"?mod(a+b):mod(a-b);
}
/**
 * Exact unknown-seed inverse: K_i=K_(i-1)+K_(i-2) (forward),
 * or K_i=K_(i-2)-K_(i-1) (reverse readout).
 * The sign of an additive cipher is absorbed by free seeds.
 *
 * @param {number[]} c
 * @param {number[]} p
 * @param {number} before
 * @param {"forward"|"reverse"} direction
 * @returns {Array<[number,number]>} Feasible starting key pairs.
 */
function fit(c,p,before,direction){
  assert.equal(c.length,p.length);
  const seeds=[];
  if(c.length<2)return seeds;
  for(const first of allowed(c,p,0,before)){
    for(const second of allowed(c,p,1,before)){
      let a=first,b=second,possible=true;
      for(let i=2;i<c.length;i++){
        const n=next(a,b,direction);
        if(!allowed(c,p,i,before).includes(n)){
          possible=false;break;
        }
        a=b;b=n;
      }
      if(possible)seeds.push([first,second]);
    }
  }
  return seeds;
}

/**
 * Search only exact-length English GP lexicon candidates.
 * @param {number[][]} ciphertext
 * @param {ReturnType<typeof loadLexicon>} lex
 * @param {"forward"|"reverse"} direction
 */
function scan(ciphertext,lex,direction){
  let previous=-1;
  const byLength={},hits=[];
  for(let wordIndex=0;wordIndex<ciphertext.length;wordIndex++){
    const word=ciphertext[wordIndex];
    if(word.length>=MIN_LENGTH){
      const length=word.length;
      const bucket=byLength[length]??{checked:0,matched:0};
      byLength[length]=bucket;
      bucket.checked++;
      const matches=[];
      for(const entry of lex.get(length)||[]){
        const seeds=fit(word,entry.gp,previous,direction);
        if(seeds.length)matches.push({
          spelling:entry.spelling,frequency:entry.count,seedPairs:seeds
        });
      }
      if(matches.length){
        bucket.matched++;
        matches.sort((a,b)=>b.frequency-a.frequency);
        hits.push({wordIndex,length,ciphertext:word.map(v=>CORPUS.runes[v]).join(""),
          candidateCount:matches.length,top:matches.slice(0,4)});
      }
    }
    previous=word.at(-1);
  }
  return {longWords:Object.values(byLength).reduce((s,r)=>s+r.checked,0),
    wordsWithCandidates:hits.length,byLength,hits};
}
/**
 * Reversible source-channel positive generator. Pads for a given word
 * satisfy the chosen linear Fibonacci recurrence exactly.
 * @param {number[][]} plaintext
 * @param {"forward"|"reverse"|"iid"} direction
 * @param {()=>number} random
 */
function encipher(plaintext,direction,random){
  let previous=-1,rewrites=0,longRewrites=0;
  const words=[],seeds=[];
  for(const word of plaintext){
    const pad=[random()%29,random()%29],c=[];
    for(let i=2;i<word.length;i++)
      pad.push(direction==="iid"?random()%29:next(pad[i-2],pad[i-1],direction));
    for(let i=0;i<word.length;i++){
      const key=direction==="iid"&&i<2?random()%29:pad[i];
      const raw=mod(word[i]+key);
      let published=raw;
      if(previous>=0&&raw===previous&&random()/4294967296<0.81){
        if(i>=6)published=T(c[i-6]);
        else{const rank=random()%28;published=rank>=previous?rank+1:rank;}
        rewrites++;
        if(word.length>=MIN_LENGTH)longRewrites++;
      }
      c.push(published);
      previous=published;
    }
    words.push(c);
    seeds.push(pad.slice(0,2));
  }
  return {words,seeds,rewrites,longRewrites};
}
function run(){
  const lex=loadLexicon(),original={};
  for(const d of DIRECTIONS)original[d]=scan(WORDS,lex,d);
  const draw=rng(SEED);
  const plant=sampleHeldout(lex,draw);
  const positives={};
  for(const d of DIRECTIONS){
    const crypt=encipher(plant.plaintext,d,draw);
    for(let i=0;i<crypt.words.length;i++){
      const prev=i?crypt.words[i-1].at(-1):-1;
      const solutions=fit(crypt.words[i],plant.plaintext[i],prev,d);
      assert.ok(solutions.some(x=>x[0]===crypt.seeds[i][0]&&x[1]===crypt.seeds[i][1]),
        "True key absent at word "+i);
    }
    const result=scan(crypt.words,lex,d);
    assert.ok(result.wordsWithCandidates>=plant.longWordsInLexicon);
    assert.ok(crypt.longRewrites>5);
    positives[d]={
      exactTrueSourceAndKeyRecovered:crypt.words.length,
      lexiconCoveredLongSources:plant.longWordsInLexicon,
      matchedLongCipherWords:result.wordsWithCandidates,
      rewrites:crypt.rewrites,longRewrites:crypt.longRewrites,
      byLength:result.byLength
    };
  }
  const nullCounts=[];
  for(let trial=0;trial<20;trial++){
    const stream=encipher(plant.plaintext,"iid",draw);
    nullCounts.push({
      forward:scan(stream.words,lex,"forward").wordsWithCandidates,
      reverse:scan(stream.words,lex,"reverse").wordsWithCandidates
    });
  }
  return {
    source:"original LP2 55 rune-bearing pages, 12956 runes, 2896 whole words",
    originalTranscriptSHA256:createHash("sha256").update(SOURCE).digest("hex"),
    hypothesis:"independent word-restarted two-seed Fibonacci mod29 pad plus any possible T6 collision repair",
    directions:{forward:"K_i=K_(i-1)+K_(i-2)",reverse:"K_i=K_(i-2)-K_(i-1)"},
    lexicon:"resources/control/english_wordfreq_textblob.txt; shared GP transliteration",
    seed:"0x"+SEED.toString(16),
    original,positives,
    independentPadNull:{trials:nullCounts.length,counts:nullCounts},
    scope:"Only these two exact recurrences, GP-English dictionary sources and declared collision-repair channel are tested. No unknown LP2 plaintext or key is implied."
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={allowed,next,fit,scan,encipher,run};
