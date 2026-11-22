"use strict";
/**
 * Completely untouched third-block continuation for the LP1-image-derived
 * reversed-base60-digit LP2 key candidate.
 *
 * Fit the global 29-way output permutation and hidden skip positions using
 * the first 240 positions in eight source sections. Continue the inferred
 * per-section key clock into positions 240..479, then score positions
 * 480..719 WITHOUT fitting the alphabet or selecting an offset or a key.
 *
 * Earlier 30- and 240-shuffle second-block tests selected this reading.
 * Third-block source rune positions were never used for that selection.
 * Exactly one source reading is evaluated, and shuffled-key controls are
 * subjected to identical training and two successive continuation stages.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {inputs}=require("./grid_section_column_keys.cjs");
const {lp2}=require("./outer_permutation_sha_probe.cjs");
const {words,flatten,training}=require("./outer_permutation_word_context.cjs");
const {evaluate}=require("./outer_permutation_pooled_holdout.cjs");
const {viterbi}=require("./outer_permutation_alignment.cjs");
const {seededRandom,shuffledPermutation,encrypt}=
  require("./outer_permutation_assignment.cjs");
const ROOT=path.join(__dirname,"..");
const MOD=29,SECTION=720,WINDOW=480,PAGECOUNT=8,KEYLEN=880;
const mod=x=>(x%MOD+MOD)%MOD;
const input=JSON.parse(fs.readFileSync(
  path.join(ROOT,"resources/liber-primus/base60-grid.json"),"utf8"));
const grid=input.rows.flat();
assert.equal(grid.length,256);
assert.equal(input.alphabet.length,60);
const symbols=grid.map(cell=>{
  assert.equal(cell.length,2);
  const hi=input.alphabet.indexOf(cell[0]);
  const lo=input.alphabet.indexOf(cell[1]);
  assert.ok(hi>=0&&hi<5&&lo>=0&&lo<60);
  return mod(lo*60+hi);
});
/** @param {number[]} source */
function makeKeys(source){
  assert.equal(source.length,256);
  return Array.from({length:PAGECOUNT},()=>Array.from(
    {length:KEYLEN},(_,i)=>source[i%256]));
}
/** @param {number[]} source @param {()=>number} rand */
function shuffled(source,rand){
  const v=source.slice();
  for(let i=v.length-1;i>0;i--){
    const j=Math.floor(rand()*(i+1));
    [v[i],v[j]]=[v[j],v[i]];
  }
  return v;
}
/**
 * @param {number[][]} pageSections
 * @param {string[][]} classSections
 * @param {number[][]} keys
 * @param {ReturnType<typeof training>} model
 */
function testThird(pageSections,classSections,keys,model){
  const original=evaluate(
    pageSections.map(p=>p.slice(0,WINDOW)),
    classSections.map(c=>c.slice(0,WINDOW)),keys,model);
  let totalScore=0,extraDraws=0;
  const third=[],thirdIndices=[];
  for(let s=0;s<PAGECOUNT;s++){
    const c=pageSections[s].slice(WINDOW,SECTION);
    const cls=classSections[s].slice(WINDOW,SECTION);
    assert.equal(c.length,240);
    assert.equal(cls.length,240);
    const prior=cls.map(name=>model.logProb[name]||
      model.prior.map(p=>Math.log(p)));
    const clock=original.indices[s].at(-1)+1;
    const path=viterbi(c,keys[s].slice(clock),model.prior,original.inverse,{
      strict:true,maxDrift:35,suppress:.81,positionLogPrior:prior
    });
    const dec=c.map((v,i)=>mod(
      original.inverse[v]-keys[s][clock+i+path.drift[i]]));
    third.push(dec);
    thirdIndices.push(c.map((_,i)=>clock+i+path.drift[i]));
    totalScore+=path.score;
    extraDraws+=path.finalDrift;
  }
  return {thirdPerRune:totalScore/(PAGECOUNT*240),
    secondPerRune:original.heldScorePerRune,
    trainPerRune:original.trainScorePerRune,
    inverse:original.inverse,
    third,thirdIndices,extraDraws};
}
const {groups}=inputs();
assert.equal(groups.length,PAGECOUNT);
assert.ok(groups.every(p=>p.length>=SECTION));
const data=lp2();
const original=groups.map(p=>p.slice(0,SECTION));
let pos=0;
const classes=groups.map(p=>{
  const cls=data.classes.slice(pos,pos+SECTION);
  pos+=p.length;
  return cls;
});
const source=fs.readFileSync(
  path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8");
const ew=words(source);
const holdout=flatten(ew.slice(0,16000));
const model=training(flatten(ew.slice(16000,50000)));
assert.ok(holdout.values.length>=PAGECOUNT*SECTION);
const rng=seededRandom(0x15331579);
const sigma=shuffledPermutation(
  Array.from({length:MOD},(_,i)=>i),rng);
const knownInverse=Array.from({length:MOD},(_,c)=>sigma.indexOf(c));
const planted=[],plantedClasses=[],truth=[];
for(let s=0;s<PAGECOUNT;s++){
  const ix=s*SECTION;
  const plain=holdout.values.slice(ix,ix+SECTION);
  truth.push(plain);
  const c=encrypt(plain,makeKeys(symbols)[s],sigma,rng,.81);
  planted.push(c.ciphertext);
  plantedClasses.push(holdout.classes.slice(ix,ix+SECTION));
}
const keys=makeKeys(symbols);
const plantedResult=testThird(planted,plantedClasses,keys,model);
const alphabetExact=plantedResult.inverse.filter(
  (v,i)=>v===knownInverse[i]).length;
let correct=0;
for(let s=0;s<PAGECOUNT;s++)
  for(let i=0;i<240;i++)
    correct+=Number(plantedResult.third[s][i]===truth[s][WINDOW+i]);
const plantAccuracy=correct/(PAGECOUNT*240);
assert.equal(alphabetExact,29,"Model-matched planted alphabet must be recovered");
assert.ok(plantAccuracy>.75,"Known-key third block must decode GP English");
const actual=testThird(original,classes,keys,model);
const reps=Number(process.env.LP2_BASE60_THIRD_NULLS||"60");
assert.ok(Number.isInteger(reps)&&reps>=5&&reps<=500);
const rngNull=seededRandom(0x57013301);
const nulls=[];
for(let i=0;i<reps;i++){
  const competitor=testThird(original,classes,
    makeKeys(shuffled(symbols,rngNull)),model);
  nulls.push({third:competitor.thirdPerRune,
    second:competitor.secondPerRune});
}
const sorted=nulls.map(x=>x.third).sort((a,b)=>a-b);
const upper=(1+sorted.filter(x=>x>=actual.thirdPerRune).length)/(reps+1);
const average=sorted.reduce((a,b)=>a+b,0)/reps;
const sd=Math.sqrt(sorted.reduce((a,b)=>a+(b-average)**2,0)/reps);
const outcome={
  source:"LP1 JPEG05 reverse hex characters -> reverse LP2 base60 digits within cells",
  originalSections:PAGECOUNT,cipherRunesPerSection:SECTION,
  firstFitRunes:240,firstContinuationRunes:240,untouchedThirdRunes:240,
  keyPeriod:256,sharedUnknownOutputPermutation:true,
  skipModel:"0.81 collision-triggered key pointer advance, frozen model",
  control:{exactAlphabet:alphabetExact,thirdPlainAccuracy:plantAccuracy,
    thirdPerRune:plantedResult.thirdPerRune,secondPerRune:plantedResult.secondPerRune},
  original:{trainPerRune:actual.trainPerRune,
    secondPerRune:actual.secondPerRune,thirdPerRune:actual.thirdPerRune,
    thirdPreview:actual.third[0].slice(0,40)},
  null:{seed:"0x57013301",replicates:reps,
    mean:average,sd,maximum:sorted.at(-1),minimum:sorted[0],
    countAtLeast:sorted.filter(x=>x>=actual.thirdPerRune).length,
    upperP:upper},
  caveat:"The source family and first-two-block pilot were selected exploratorily. Third block is not chosen by its score; no original plaintext has been recovered."
};
console.log("THIRD",JSON.stringify(outcome));
module.exports={testThird,makeKeys,symbols};
