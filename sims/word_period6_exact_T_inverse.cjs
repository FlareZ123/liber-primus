"use strict";
/**
 * Unknown six-rune word-restarted additive key feasibility under the exact
 * GP lag-six T-rewrite. Every source GP dictionary word is permitted any
 * six-symbol key; all collisions and all repair choices are admitted.
 * Strictly model-specific test on original unsolved LP2.
 */
const assert=require("node:assert/strict");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");
const {loadLexicon,sampleHeldout}=require("./word_period5_unknown_key_exact_inverse.cjs");
const fs=require("node:fs");
const path=require("node:path");

const M=29,PERIOD=6,MIN=10,SEED=0x396291;
const ROOT=path.join(__dirname,"..");
const CORPUS=JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-corpus.json"),"utf8"));
const ID=new Map(CORPUS.runes.map((r,i)=>[r,i]));
const WORDS=parseSharedCorpus().words.map(w=>[...w.runes].map(c=>{
  const n=ID.get(c);assert.notEqual(n,undefined);return n;
}));
assert.equal(WORDS.length,2896);
assert.equal(WORDS.flat().length,12956);
assert.deepEqual(WORDS.flat(),CORPUS.pages.filter(p=>
  p.status==="unsolved"&&p.indices.length).flatMap(p=>p.indices));

const mod=x=>(x%M+M)%M;
const target=x=>mod(24-2*x);
/** @param {number} seed */
function rng(seed){let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};}

/**
 * Exact unknown-key feasibility: intersection of all allowed key digits
 * at every occurrence of each word-local key phase mod6.
 * @param {number[]} cipher
 * @param {number[]} plaintext
 * @param {number} prevLast
 * @returns {{feasible:boolean,masks:number[]}}
 */
function fits(cipher,plaintext,prevLast){
  assert.equal(cipher.length,plaintext.length);
  const masks=Array(PERIOD).fill((1<<M)-1);
  for(let i=0;i<cipher.length;i++){
    const c=cipher[i],previous=i?cipher[i-1]:prevLast;
    let allowed=1<<mod(c-plaintext[i]);
    if(previous>=0&&c!==previous&&
      (i<6||c===target(cipher[i-6])))
      allowed|=1<<mod(previous-plaintext[i]);
    const phase=i%PERIOD;
    masks[phase]&=allowed;
    if(masks[phase]===0)return {feasible:false,masks};
  }
  return {feasible:true,masks};
}

/** @param {number[][]} cipher @param {ReturnType<typeof loadLexicon>} lex */
function scan(cipher,lex){
  const hits=[];
  let total=0,prior=-1;
  const byLength=new Map();
  for(let i=0;i<cipher.length;i++){
    const word=cipher[i],n=word.length;
    if(n>=MIN){
      total++;
      if(!byLength.has(n))byLength.set(n,{checked:0,matched:0});
      const row=byLength.get(n);row.checked++;
      const matches=[];
      for(const entry of lex.get(n)||[])
        if(fits(word,entry.gp,prior).feasible)
          matches.push({spelling:entry.spelling,frequency:entry.count});
      if(matches.length){
        row.matched++;
        matches.sort((a,b)=>b.frequency-a.frequency);
        hits.push({wordIndex:i,length:n,ciphertext:word.map(x=>CORPUS.runes[x]).join(""),
          candidateCount:matches.length,top:matches.slice(0,4)});
      }
    }
    prior=word.at(-1);
  }
  return {longWords:total,hitsCount:hits.length,byLength:Object.fromEntries(byLength),
    hits,maxCandidates:Math.max(0,...hits.map(x=>x.candidateCount))};
}

/** @param {number[][]} source @param {"period6"|"iid"} mode @param {()=>number} rand */
function encipher(source,mode,rand){
  const words=[],secrets=[];
  let previous=-1,rewrites=0,rewritesLong=0;
  for(const plain of source){
    const key=Array.from({length:PERIOD},()=>rand()%M),cipher=[];
    for(let j=0;j<plain.length;j++){
      const k=mode==="period6"?key[j%PERIOD]:rand()%M;
      const tentative=mod(plain[j]+k);
      let actual=tentative;
      if(previous>=0&&tentative===previous&&rand()/4294967296<0.81){
        actual=j>=6?target(cipher[j-6]):
          ((v,previous)=>v>=previous?v+1:v)(rand()%28,previous);
        rewrites++;if(plain.length>=MIN)rewritesLong++;
      }
      cipher.push(actual);previous=actual;
    }
    words.push(cipher);secrets.push(key);
  }
  return {words,secrets,rewrites,rewritesLong};
}

function run(){
  const lex=loadLexicon(),real=scan(WORDS,lex);
  const random=rng(SEED);
  const planted=sampleHeldout(lex,random),crypt=encipher(planted.plaintext,"period6",random);
  let trueKeyAccepted=0;
  for(let i=0;i<WORDS.length;i++){
    const prev=i?crypt.words[i-1].at(-1):-1;
    const fit=fits(crypt.words[i],planted.plaintext[i],prev);
    assert.ok(fit.feasible);
    for(let j=0;j<PERIOD;j++)assert.ok(fit.masks[j]&(1<<crypt.secrets[i][j]));
    trueKeyAccepted++;
  }
  assert.ok(crypt.rewritesLong>5);
  const ctrl=scan(crypt.words,lex);
  assert.ok(ctrl.hitsCount>=planted.longWordsInLexicon);
  const nullCounts=[];
  for(let trial=0;trial<30;trial++){
    const c=encipher(planted.plaintext,"iid",random);
    nullCounts.push(scan(c.words,lex).hitsCount);
  }
  const trueSourceCoverage=planted.longWordsInLexicon;
  return {
    hypothesis:"arbitrary independent 6-rune mod29 additive word key, exact collision-triggered T rewrite",
    input:{runes:12956,words:2896,minLength:MIN,longWords:real.longWords,
      source:"English word-frequency GP lexicon, 29-rune original transcript"},
    real,planted:{trueKeyAccepted,rewrites:crypt.rewrites,
      rewritesLong:crypt.rewritesLong,lexiconSourceCoverage:trueSourceCoverage,
      matchedCipherWords:ctrl.hitsCount,matchedSummary:ctrl.byLength,
      fallbackWords:planted.fallbackWordCount},
    null:{mode:"independent per-rune random keys, original word lengths and planted source",
      replicates:nullCounts.length,counts:nullCounts,
      mean:nullCounts.reduce((a,b)=>a+b,0)/nullCounts.length,
      range:[Math.min(...nullCounts),Math.max(...nullCounts)]}
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={fits,scan,encipher,run};
