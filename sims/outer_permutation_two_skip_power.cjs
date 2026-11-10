"use strict";
/**
 * Exploratory TWO-early-skip candidate improvement over prefix-bootstrapped
 * unknown-outer-alphabet / hidden-skip method. Reproducible Monte Carlo.
 *
 * Each run creates a fresh arbitrary sigma, independent GP key stream and
 * collision-rejected English-like plaintext. A matched wrong pad is searched
 * with the same number of prefix choices and optimization passes.
 */
const fs=require("node:fs");
const path=require("node:path");
const {encrypt,seededRandom,shuffledPermutation}=
  require("./outer_permutation_assignment.cjs");
const {words,flatten,training,fit}=
  require("./outer_permutation_word_context.cjs");
const {viterbi}=require("./outer_permutation_alignment.cjs");

function experiment({replicates=12}={}){
  const text=fs.readFileSync(path.join(__dirname,"..","resources",
    "control","shakespeare_first300k.txt"),"utf8");
  const corpus=words(text),test=flatten(corpus.slice(0,600));
  const model=training(flatten(corpus.slice(600,50000)));
  const N=1200;
  const plain=test.values.slice(0,N),contexts=test.classes.slice(0,N);
  const positionLogPrior=contexts.map(c=>model.logProb[c]);
  const config={strict:true,maxDrift:100,suppress:.81,positionLogPrior};
  const widths=[60,100,160,300];
  const master=seededRandom(20261110);
  function tryKey(cipher,key){
    let winner={score:-Infinity,correctMap:null,drift:null,width:null};
    for(const width of widths){
      const part=cipher.slice(0,width),ctx=contexts.slice(0,width);
      const base=fit(part,key,ctx,model),proposals=[{
        inverse:base.inverse,score:base.score,firstSkip:null
      }];
      if(width<=100){
        const candidates=[];
        for(let at=1;at<width;at++){
          const indices=Array.from({length:width},(_,i)=>i+(i>=at?1:0));
          const fitted=fit(part,key,ctx,model,indices);
          candidates.push({inverse:fitted.inverse,score:fitted.score,firstSkip:at});
        }
        candidates.sort((a,b)=>b.score-a.score);
        const seen=new Set([base.inverse.join(",")]);
        for(const p of candidates){
          const id=p.inverse.join(",");
          if(seen.has(id))continue;
          proposals.push(p);seen.add(id);
          if(proposals.length>=5)break;
        }
      }
      if(width===60){
        const doubleCandidates=[];
        for(let at=1;at<44;at++)for(let at2=at+1;at2<=45;at2++){
          const indices=Array.from({length:width},(_,i)=>i+(i>=at?1:0)+(i>=at2?1:0));
          const fitted=fit(part,key,ctx,model,indices);
          doubleCandidates.push({inverse:fitted.inverse,score:fitted.score,firstSkip:at,secondSkip:at2});
        }
        doubleCandidates.sort((a,b)=>b.score-a.score);
        const seen=new Set(proposals.map(x=>x.inverse.join(",")));
        for(const p of doubleCandidates){
          const id=p.inverse.join(",");
          if(seen.has(id))continue;
          proposals.push(p);seen.add(id);
          if(proposals.length>=10)break;
        }
      }
      for(const hypothesis of proposals){
        let inv=hypothesis.inverse;
        for(let iteration=0;iteration<5;iteration++){
          const solution=viterbi(cipher,key,model.prior,inv,config);
          if(solution.score>winner.score)
            winner={score:solution.score,correctMap:inv.slice(),
              drift:solution.drift,width,firstSkipHypothesis:hypothesis.firstSkip};
          const indices=[...solution.drift].map((d,i)=>i+d);
          const updated=fit(cipher,key,contexts,model,indices).inverse;
          if(updated.every((x,i)=>inv[i]===x))break;
          inv=updated;
        }
      }
    }
    return winner;
  }
  const rows=[];
  for(let replicate=0;replicate<replicates;replicate++){
    const seed=Number((master()*0x100000000)>>>0);
    const rng=seededRandom(seed);
    const sigma=shuffledPermutation(Array.from({length:29},(_,i)=>i),rng);
    const actualInverse=Array.from({length:29},(_,c)=>sigma.indexOf(c));
    const trueKey=Array.from({length:N+400},()=>Math.floor(rng()*29));
    const planted=encrypt(plain,trueKey,sigma,rng,.81);
    const fake=Array.from({length:N+400},()=>Math.floor(rng()*29));
    const trueResult=tryKey(planted.ciphertext,trueKey);
    const fakeResult=tryKey(planted.ciphertext,fake);
    const labels=trueResult.correctMap.filter((x,i)=>x===actualInverse[i]).length;
    const correctDrift=[...trueResult.drift].filter((d,i)=>
      d===planted.keyIndices[i]-i).length;
    rows.push({replicate,seed,firstSkip:planted.keyIndices.findIndex((x,i)=>x>i),
      extras:planted.extraDraws, labels,
      correctPositionRate:correctDrift/N,
      trueScore:trueResult.score,fakeScore:fakeResult.score,
      scoreMargin:trueResult.score-fakeResult.score,
      winningPrefix:trueResult.width});
  }
  const vals=rows.map(x=>x.scoreMargin).sort((a,b)=>a-b);
  return {
    model:"word-contextual prefix-bootstrapped 29-way permutation plus skip Viterbi",
    trials:replicates,seed:20261110,simulation:"English GP + truly uniform mod29 key; q=.81 filter",
    widthChoices:widths,iterationsPerWidth:5,
    twoEarlySkipsAdded:"all ordered two-skip pairs 1<=t1<t2<=45 in W=60, top five distinct assignments, matched search on true and wrong keys",
    earlySkipHypotheses:"first skip at each position 1..W-1 for W<=100; top four distinct prefix fits plus zero-skip control",
    exactAlphabetRecoveries:rows.filter(x=>x.labels===29).length,
    atleast20LabelRecoveries:rows.filter(x=>x.labels>=20).length,
    trueBeatsWrong:rows.filter(x=>x.scoreMargin>0).length,
    medianLabels:rows.map(x=>x.labels).sort((a,b)=>a-b)[Math.floor(replicates/2)],
    medianDriftAccuracy:rows.map(x=>x.correctPositionRate).sort((a,b)=>a-b)[Math.floor(replicates/2)],
    scoreMarginQuantiles:{min:vals[0],q05:vals[Math.floor(replicates*.05)],
      median:vals[Math.floor(replicates*.5)],q95:vals[Math.floor(replicates*.95)],
      max:vals.at(-1)},
    first10:rows.slice(0,10),failed:rows.filter(x=>x.labels<20).slice(0,8)
  };
}
if(require.main===module){ const baseline=require('./outer_permutation_context_power.cjs').experiment({replicates:12}); const two=experiment({replicates:12}); console.log(JSON.stringify({baseline:{exactAlphabetRecoveries:baseline.exactAlphabetRecoveries,trueBeatsWrong:baseline.trueBeatsWrong,medianDriftAccuracy:baseline.medianDriftAccuracy,first10:baseline.first10},two},null,2)); }
module.exports={experiment};
