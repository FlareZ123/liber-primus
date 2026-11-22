"use strict";
/**
 * Bounded actual-LP2 search using a jointly learned arbitrary outer rune
 * permutation and skip-aware word-contextual Viterbi key-pointer alignment.
 * 27 fixed password hypotheses x 2 SHA256 layouts x 2 additive signs.
 * This is a SCREEN, with only one key offset and one continuous pad.
 *
 * Reproduction: node sims/outer_permutation_real_skip_scan.cjs
 */
const fs=require("node:fs");
const path=require("node:path");
const {seededRandom}=require("./outer_permutation_assignment.cjs");
const {words,flatten,training,fit}=
  require("./outer_permutation_word_context.cjs");
const {viterbi}=require("./outer_permutation_alignment.cjs");
const {pad,lp2}=require("./outer_permutation_sha_probe.cjs");
const seeds=[
  "3301","CICADA","CICADA3301","CICADA 3301","LIBER PRIMUS",
  "LIBERPRIMUS","DIVINITY","THE PRIMES ARE SACRED","PRIMES",
  "FIRFUMFERENFE","WELCOME","A WARNING","THE KEY IS ALL AROUND YOU",
  "2014-01-05","2014-01-06","2014-01-07","2014","2013","2012",
  "2017","AN END","THE WORDS ARE THE MAP","TRUTH","KNOW THIS",
  "CICADA 3301 2014","THE PRIMES","IT IS NOT AN END"
];
const WIDTHS=[60,100,160,300],N=1200;

/**
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {string[]} contexts
 * @param {object} model
 * @returns {{score:number,width:number,skipHypothesis:number|null,drift:number}}
 */
function search(cipher,key,contexts,model){
  const config={strict:true,maxDrift:100,suppress:.81,
    positionLogPrior:contexts.map(c=>model.logProb[c])};
  let best={score:-Infinity};
  for(const width of WIDTHS){
    const c=cipher.slice(0,width),ctx=contexts.slice(0,width);
    const base=fit(c,key,ctx,model);
    const proposals=[{inverse:base.inverse,firstSkip:null}];
    if(width<=100){
      const possible=[];
      for(let t=1;t<width;t++){
        const index=Array.from({length:width},(_,i)=>i+(i>=t?1:0));
        const attempt=fit(c,key,ctx,model,index);
        possible.push({inverse:attempt.inverse,score:attempt.score,firstSkip:t});
      }
      possible.sort((a,b)=>b.score-a.score);
      const seen=new Set([base.inverse.join(",")]);
      for(const p of possible){
        const id=p.inverse.join(",");
        if(seen.has(id))continue;
        seen.add(id);proposals.push(p);
        if(proposals.length>=5)break;
      }
    }
    for(const initial of proposals){
      let inv=initial.inverse;
      for(let iteration=0;iteration<5;iteration++){
        const v=viterbi(cipher,key,model.prior,inv,config);
        if(v.score>best.score)best={score:v.score,width,
          skipHypothesis:initial.firstSkip,drift:v.finalDrift};
        const indices=[...v.drift].map((d,i)=>i+d);
        const updated=fit(cipher,key,contexts,model,indices).inverse;
        if(updated.every((x,i)=>x===inv[i]))break;
        inv=updated;
      }
    }
  }
  return best;
}
function experiment({nullReplicates=250}={}){
  const txt=fs.readFileSync(path.join(__dirname,"..","resources",
    "control","shakespeare_first300k.txt"),"utf8");
  const model=training(flatten(words(txt).slice(600,50000)));
  const actual=lp2();
  const cipher=actual.values.slice(0,N),
    contexts=actual.classes.slice(0,N);
  const options=[];
  for(const secret of seeds)for(const mode of ["suffixBE","prefixLE"])
    for(const sign of [1,-1]){
      const key=pad(secret,mode,N+300).map(x=>sign===1?x:(29-x)%29);
      options.push({seed:secret,mode,sign,...search(cipher,key,contexts,model)});
    }
  options.sort((a,b)=>b.score-a.score);
  const random=seededRandom(331001),controls=[];
  for(let i=0;i<nullReplicates;i++){
    const secret="wrong/"+i+"/"+Math.floor(random()*4294967296);
    const mode=i%2?"suffixBE":"prefixLE",sign=i%4<2?1:-1;
    const key=pad(secret,mode,N+300).map(x=>sign===1?x:(29-x)%29);
    controls.push(search(cipher,key,contexts,model).score);
  }
  controls.sort((a,b)=>a-b);
  const p=(1+controls.filter(x=>x>=options[0].score).length)/
    (nullReplicates+1);
  return {
    model:"unknown sigma + strict keyskip q=.81 + preserved word position",
    scope:"first 1200 unsolved runes, 27 named seeds, two SHA256 counter layouts, both signs, continuous K from position zero, English word-context prior",
    nullReplicates,window:N,modelVariants:seeds.length*4,
    maxNull:controls.at(-1),nullMedian:controls[Math.floor(nullReplicates/2)],
    rawPerCellP:p,bonferroniPBound:Math.min(1,seeds.length*4*p),
    top:options.slice(0,10)
  };
}
if(require.main===module)console.log(JSON.stringify(experiment(),null,2));
module.exports={search,experiment};
