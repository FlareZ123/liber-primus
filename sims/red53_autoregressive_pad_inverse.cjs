"use strict";

/**
 * Exact unknown-key inversion for word-restarted affine lag-six additive pads.
 *
 * Source-selected key hypothesis:
 *   K[i] = (53 - 2*K[i-6]) mod29, for i>=6 within each word.
 * Each whole word may start with SIX COMPLETELY ARBITRARY key seeds.
 * Publish X[i]=(P[i]+K[i]) mod29, permitting the original proposed
 * adjacent-collision rewrite to T(C[i-6]), or an arbitrary replacement
 * at offsets 0..5. The word's previous-published-rune state is continuous.
 *
 * For a candidate dictionary word, each published symbol allows one or two
 * raw pad symbols. Invert T^(floor(i/6)) on these allowed symbols and
 * intersect exact 29-bit seed masks independently for all six lanes.
 * No key enumeration, soft scores, known crib, or beam pruning is required.
 *
 * Run: node sims/red53_autoregressive_pad_inverse.cjs
 * @module red53_autoregressive_pad_inverse
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const {loadLexicon, sampleHeldout} =
  require("./word_period5_unknown_key_exact_inverse.cjs");

const ROOT = path.resolve(__dirname, "..");
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const ANNOTATIONS = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-ink-annotations.json"), "utf8"));
const RUNE_ID = new Map(DATA.runes.map((rune, index) => [rune, index]));
const WORDS = parseSharedCorpus().words.map(item =>
  [...item.runes].map(rune => {
    assert.ok(RUNE_ID.has(rune));
    return RUNE_ID.get(rune);
  }));
const LEX = loadLexicon();
const M = 29, PERIOD = 6, MIN_LENGTH = 10;
const SEED = 0x20655329, POSITIVE_REWRITE_PROBABILITY = 0.81;
assert.equal(WORDS.length, 2896);
assert.equal(WORDS.flat().length, 12956);
assert.deepEqual(WORDS.flat(), DATA.pages.filter(p => p.status === "unsolved")
  .flatMap(p => p.indices));

function mod(x) {return (x % M + M) % M;}
function T(x) {return mod(53 - 2 * x);}
const POWERS = [Array.from({length:M},(_,i)=>i)];
for(let i=1;i<=4;i++) POWERS.push(POWERS[i-1].map(T));
const FULL_MASK = (1 << M) - 1;

function sourceRule() {
  const span = ANNOTATIONS.pages.find(p=>p.page===40).red_spans[0];
  const sum = [...span.runes].reduce((total,r)=>
    total + DATA.prime[RUNE_ID.get(r)], 0);
  assert.equal(sum,435);
  assert.equal(sum/M,15);
  assert.equal(DATA.prime[15],53);
  assert.deepEqual(DATA.prime.slice(14,17),[47,53,59]);
  return {page:40,redPrimeSum:sum,selectedIndex:15,
    primeTriplet:[47,53,59],keyLag:6,
    keyRecurrence:"K[i]=(53-2*K[i-6]) mod29"};
}

/** @param {number} seed Initial xorshift32 state. */
function random32(seed) {
  let s=seed>>>0;
  return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};
}

/**
 * @param {number[]} cipher Complete ciphertext word.
 * @param {number[]} plain Proposed GP source word.
 * @param {number} prior Last previously published ciphertext rune, or -1.
 * @returns {{feasible:boolean,seedMasks:number[]}}
 */
function feasible(cipher,plain,prior) {
  assert.equal(cipher.length,plain.length);
  const masks=Array(PERIOD).fill(FULL_MASK);
  for(let i=0;i<cipher.length;i++) {
    const c=cipher[i],previous=i>0?cipher[i-1]:prior;
    const allowed=[mod(c-plain[i])];
    // Only a tentative collision with previous published rune can be
    // rewritten. Word indices >=6 have exactly the original proposed
    // T6 target, while early rewritten positions can publish any other.
    if(previous>=0&&c!==previous &&
       (i<6||c===T(cipher[i-6])))
      allowed.push(mod(previous-plain[i]));
    const power=POWERS[Math.floor(i/PERIOD)];
    let options=0;
    for(let seed=0;seed<M;seed++) {
      const digit=power[seed];
      if(allowed.includes(digit)) options|=1<<seed;
    }
    masks[i%PERIOD]&=options;
    if(masks[i%PERIOD]===0)
      return {feasible:false,seedMasks:masks};
  }
  return {feasible:true,seedMasks:masks};
}

/**
 * @param {number[][]} cipher 2,896 words in source order.
 * @param {ReturnType<typeof loadLexicon>} lex
 */
function scan(cipher,lex) {
  let previous=-1;
  const hits=[],tallies=new Map();
  for(let wi=0;wi<cipher.length;wi++){
    const word=cipher[wi],length=word.length;
    if(length>=MIN_LENGTH) {
      const group=lex.get(length)||[];
      const row=tallies.get(length)||{length,checked:0,matched:0,lexiconSize:group.length};
      row.checked++;
      const matches=[];
      for(const entry of group)
        if(feasible(word,entry.gp,previous).feasible)
          matches.push({spelling:entry.spelling,frequency:entry.count});
      if(matches.length){
        row.matched++;
        matches.sort((a,b)=>b.frequency-a.frequency);
        hits.push({wordIndex:wi,length,
          ciphertext:word.map(r=>DATA.runes[r]).join(""),
          candidateCount:matches.length,top:matches.slice(0,8)});
      }
      tallies.set(length,row);
    }
    previous=word.at(-1);
  }
  return {checkedWords:[...tallies.values()].reduce((s,x)=>s+x.checked,0),
    wordsWithCandidates:hits.length,
    byLength:[...tallies.values()].sort((a,b)=>a.length-b.length),
    hits};
}

/**
 * Generate exact key recurrence, plus an optional independent-pad control.
 * Key seed resets per word; published previous-rune state never resets.
 * @param {number[][]} plaintext
 * @param {"recurrence"|"independent"} mode
 * @param {()=>number} random
 */
function encrypt(plaintext,mode,random) {
  let previous=-1,rewrites=0,longRewrites=0;
  const output=[],secrets=[];
  for(const plain of plaintext){
    const seeds=Array.from({length:PERIOD},()=>random()%M);
    const cipher=[];
    for(let i=0;i<plain.length;i++){
      const key=mode==="recurrence"?
        POWERS[Math.floor(i/PERIOD)][seeds[i%PERIOD]]:random()%M;
      const tentative=mod(plain[i]+key);
      let published=tentative;
      if(previous>=0 && tentative===previous &&
        random()/4294967296<POSITIVE_REWRITE_PROBABILITY){
        if(i>=6)published=T(cipher[i-6]);
        else {
          const r=random()%(M-1);
          published=r>=previous?r+1:r;
        }
        rewrites++;
        if(plain.length>=MIN_LENGTH)longRewrites++;
      }
      cipher.push(published);previous=published;
    }
    output.push(cipher);secrets.push(seeds);
  }
  return {output,secrets,rewrites,longRewrites};
}

function run() {
  const rule=sourceRule();
  const original=scan(WORDS,LEX);
  assert.equal(original.checkedWords,109);
  assert.equal(original.wordsWithCandidates,1);
  assert.equal(original.hits[0].wordIndex,2475);
  const random=random32(SEED);
  const plant=sampleHeldout(LEX,random);
  const positive=encrypt(plant.plaintext,"recurrence",random);
  for(let wi=0;wi<positive.output.length;wi++){
    const prior=wi?positive.output[wi-1].at(-1):-1;
    const fitted=feasible(positive.output[wi],plant.plaintext[wi],prior);
    assert.ok(fitted.feasible,"Actual recurrence key rejected at word "+wi);
    for(let phase=0;phase<Math.min(PERIOD,plant.plaintext[wi].length);phase++)
      assert.ok(fitted.seedMasks[phase]&(1<<positive.secrets[wi][phase]),
        "Actual key seed missing for word/phase "+wi+"/"+phase);
  }
  const synthetic=scan(positive.output,LEX);
  assert.ok(positive.longRewrites>5);
  assert.ok(synthetic.wordsWithCandidates>=plant.longWordsInLexicon);
  const nullCounts=[];
  for(let test=0;test<15;test++){
    const independent=encrypt(plant.plaintext,"independent",random);
    nullCounts.push(scan(independent.output,LEX).wordsWithCandidates);
  }
  const raw=fs.readFileSync(path.join(ROOT,"resources/lp2-transcription.txt"));
  return {
    status:"Exact source-selected model exclusion under GP-English; no LP2 plaintext or key",
    sourceRule:rule,originalSourceSha256:createHash("sha256").update(raw).digest("hex"),
    hypothesis:"Separate six-seed word-local running pad K[i]=T(K[i-6]); any physically possible proposed T6 adjacent-collision repair",
    original,
    syntheticPositive:{fullTrueWordKeyCoverage:positive.output.length,
      knownLexiconLongWords:plant.longWordsInLexicon,
      longWordsWithCandidates:synthetic.wordsWithCandidates,
      rewriteCount:positive.rewrites,longWordRewriteCount:positive.longRewrites},
    independentPadControls:{counts:nullCounts,
      average:nullCounts.reduce((a,b)=>a+b,0)/nullCounts.length},
    caveat:"No plaintext word is proven. Results exclude only GP-English source words from the specified lexicon under this exact additive lag-six key recurrence and permitted collision repairs; other languages, source codes, key resets, and cipher stages remain untested."
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={feasible,scan,encrypt,run};
