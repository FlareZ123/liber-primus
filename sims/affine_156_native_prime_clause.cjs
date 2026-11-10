"use strict";
/**
 * Search the same complete GP29 affine lag-(1,5,6) family by an independent,
 * author-native indicator: GP-prime sums at original printed full stops.
 *
 * Original transcription clause structure is fixed before selecting any key.
 * Physical pages 0..27 select the key using clause-first-half boundaries;
 * no plaintext/English unigram likelihood is consulted. Heldout clauses
 * use unchanged original text. The positive plants a GP-English source that
 * has one GP rune per original clause adjusted to prime-valued sum when
 * possible, then encrypts under a concealed exact affine-feedback key.
 *
 * Run: node sims/affine_156_native_prime_clause.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {sourceEnglish,plant}=require("./affine_156_feedback_inverse.cjs");
const ROOT=path.resolve(__dirname,"..");
const GP=JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-corpus.json"),"utf8"));
const PAGES=GP.pages.filter(p=>p.status==="unsolved"&&p.indices.length);
const corpus=PAGES.flatMap(p=>p.indices),N=corpus.length;
assert.equal(N,12956);
const index=new Map(GP.runes.map((rune,i)=>[rune,i]));
const text=fs.readFileSync(path.join(ROOT,
  "resources/lp2-transcription.txt"),"utf8").split("%").slice(0,55).join("%");
const clauseOf=new Uint16Array(N);
let cursor=0,clauses=0;
for(const ch of text) {
  const g=index.get(ch);
  if(g!==undefined) {
    assert.equal(corpus[cursor],g,"Original physical source mismatch");
    clauseOf[cursor++]=clauses;
  } else if(ch===".") clauses++;
}
assert.equal(cursor,N);
assert.equal(clauses,175);
const clauseSlots=Array.from({length:clauses},()=>[]);
for(let i=0;i<N;i++)clauseSlots[clauseOf[i]].push(i);
assert(clauseSlots.every(c=>c.length>0));
const primeFlag=new Uint8Array(100000);
primeFlag.fill(1,2);
for(let i=2;i*i<primeFlag.length;i++)
  if(primeFlag[i])for(let j=i*i;j<primeFlag.length;j+=i)primeFlag[j]=0;
const starts=new Uint8Array(N);
let at=0;
for(const page of PAGES){starts[at]=1;at+=page.indices.length;}

/** Score all printed clauses after one candidate, excluding no known symbol. */
function score(cipher,a,b,d,scope) {
  const sums=new Uint32Array(clauses);
  let first=0;
  for(let i=0;i<N;i++) {
    if(starts[i])first=i;
    const g=(scope==="page"&&i-first<6)||i<6
      ?cipher[i]
      :((cipher[i]-a*cipher[i-1]-b*cipher[i-5]-d*cipher[i-6])%29+29)%29;
    sums[clauseOf[i]]+=GP.prime[g];
  }
  let train=0,heldout=0;
  for(let j=0;j<clauses;j++) {
    assert(sums[j]<primeFlag.length,"Sieve upper bound");
    if(primeFlag[sums[j]]) {
      if(j<Math.ceil(clauses/2))train++;
      else heldout++;
    }
  }
  return {train,heldout,total:train+heldout};
}

/**
 * Exhaust every one of 29^3 plausible keys. The heldout half cannot
 * contribute to key selection or resolve a tie.
 * @param {number[]} cipher
 * @param {"page"|"continuous"} scope
 * @param {number[]} [target] Known planted source key for calibration.
 */
function search(cipher,scope,target=null){
  const truth=target?score(cipher,...target,scope):null;
  let best={train:-1},rank=0,models=0,maxTotal=0;
  for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let d=0;d<29;d++){
    const s=score(cipher,a,b,d,scope);
    models++;
    if(s.train>best.train)best={key:[a,b,d],...s};
    if(s.total>maxTotal)maxTotal=s.total;
    if(truth&&s.train>=truth.train)rank++;
  }
  return {models,clauses,selection:"first 88 clauses",
    validation:"last 87 clauses, never used for key selection",
    baseline:score(cipher,0,0,0,scope),bestTrain:best,maxAnyTotal:maxTotal,
    ...(target?{trueKey:target,trueKeyScore:truth,trueKeyTrainingRank:rank}:{})};
}

/**
 * Strengthen genuine GP-English source with the observed author-specific
 * prime-valued clause-sum property; retain source spelling except at most
 * one rune per printed clause. This is synthetic cryptographic calibration,
 * not a claim about what the unknown pages really say.
 */
function primeClauseSource(){
  const plain=sourceEnglish(N);
  let edits=0,primeBefore=0,primeAfter=0;
  for(const slots of clauseSlots) {
    let sum=slots.reduce((s,i)=>s+GP.prime[plain[i]],0);
    primeBefore+=Number(primeFlag[sum]);
    if(!primeFlag[sum]) {
      let improved=false;
      for(let j=slots.length-1;j>=0&&!improved;j--) {
        const i=slots[j];
        for(let newGlyph=0;newGlyph<29;newGlyph++) {
          const changed=sum-GP.prime[plain[i]]+GP.prime[newGlyph];
          if(primeFlag[changed]) {
            plain[i]=newGlyph;sum=changed;edits++;improved=true;break;
          }
        }
      }
    }
    primeAfter+=Number(primeFlag[sum]);
  }
  assert(primeAfter>=170);
  assert(edits<170);
  return {plain,edits,primeBefore,primeAfter};
}
function run(){
  const original={
    page:search(corpus,"page"),
    continuous:search(corpus,"continuous")
  };
  assert.deepEqual(original.page.bestTrain.key,[26,24,27]);
  assert.deepEqual(original.continuous.bestTrain.key,[14,12,2]);
  const source=primeClauseSource(),key=[7,11,19];
  const planted=plant(source.plain,key).flatMap(p=>p.indices);
  const positive=search(planted,"page",key);
  assert.equal(positive.trueKeyTrainingRank,1);
  assert.deepEqual(positive.bestTrain.key,key);
  assert.equal(positive.trueKeyScore.total,source.primeAfter);
  return {originalSource:"resources/lp2-transcription.txt",
    actualRunes:N,originalClauseCount:clauses,
    hypothesis:"GP29 direct lag-(1,5,6) feedback on author-prime-valued clauses",
    original,syntheticPlant:{
      source:"Shakespeare GP source with at most one modified rune per printed clause",
      plaintextEdits:source.edits,
      sourcePrimeClausesBefore:source.primeBefore,
      sourcePrimeClausesAfter:source.primeAfter,
      ...positive
    },
    result:"No unknown original LP2 key or decipherment. Native prime-clause cue does not rescue this exact direct GP29 feedback family."};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={score,search,primeClauseSource,run};
