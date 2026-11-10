"use strict";
/**
 * Targeted real-LP2 screen: unknown arbitrary 29-way outer alphabet with a
 * proposed SHA-256 counter stream. A global optimum over all 29! alphabets is
 * computed for each proposed key, with word-position-aware English rune priors.
 *
 * This is a narrow candidate scan, not a brute-force exhaustion statement.
 * Model: one pad draw per ciphertext rune, no key-pointer drift, pad offset 0,
 * SHA256(seed||4-byte counter) or SHA256(4-byte counter||seed), byte mod29,
 * two additive signs, one shared alphabet; it is intentionally broad in sigma
 * and narrow in the other dimensions. Calibration uses the actual LP2 text.
 *
 * Reproduction: node sims/outer_permutation_sha_probe.cjs
 */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const {inferAlphabet, encrypt, seededRandom, shuffledPermutation} =
  require("./outer_permutation_assignment.cjs");
const {words,flatten,training,fit} =
  require("./outer_permutation_word_context.cjs");
const RUNES = "ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ";
const INDEX = new Map([...RUNES].map((r,i)=>[r,i]));
const seeds = [
  "3301","CICADA","CICADA3301","CICADA 3301","LIBER PRIMUS",
  "LIBERPRIMUS","DIVINITY","THE PRIMES ARE SACRED","PRIMES",
  "FIRFUMFERENFE","WELCOME","A WARNING","THE KEY IS ALL AROUND YOU",
  "2014-01-05","2014-01-06","2014-01-07","2014","2013","2012",
  "2017","AN END","THE WORDS ARE THE MAP","TRUTH","KNOW THIS",
  "CICADA 3301 2014","THE PRIMES","IT IS NOT AN END"
];

/**
 * @param {string} seed
 * @param {"suffixBE"|"prefixLE"} mode
 * @param {number} length
 * @returns {number[]}
 */
function pad(seed,mode,length) {
  const prefix=Buffer.from(seed,"utf8"),out=[];
  for(let block=0;out.length<length;block++){
    const ctr=Buffer.alloc(4);
    if(mode==="suffixBE")ctr.writeUInt32BE(block);
    else ctr.writeUInt32LE(block);
    const hash=crypto.createHash("sha256");
    if(mode==="suffixBE")hash.update(prefix).update(ctr);
    else hash.update(ctr).update(prefix);
    const digest=hash.digest();
    for(const byte of digest)if(out.length<length)out.push(byte%29);
  }
  return out;
}
function lp2(){
  const source=fs.readFileSync(path.join(__dirname,"..","resources",
    "lp2-transcription.txt"),"utf8");
  const segments=source.split("%");
  const body=segments.slice(0,55).join("");
  const cells=body.replace(/[/\r\n\s]/g,"").split(/[-.&$§]+/);
  const list=cells.map(w=>[...w].filter(c=>INDEX.has(c))
    .map(c=>INDEX.get(c))).filter(w=>w.length);
  const corpus=flatten(list);
  if(corpus.values.length!==12956 || list.length!==2896)
    throw new Error("Unexpected LP2 transcription or word parser");
  return corpus;
}
/** @param {number[]} key @param {number} sign */
function signed(key,sign) {
  return sign===1?key:key.map(x=>(29-x)%29);
}
/** @param {number[]} ciphertext @param {string[]} contexts @param {object} model
 *  @param {string} seed @param {string} mode @param {number} sign
 */
function attempt(ciphertext, contexts, model, seed,mode,sign) {
  const key=signed(pad(seed,mode,ciphertext.length),sign);
  return {score:fit(ciphertext,key,contexts,model).score,seed,mode,sign};
}
function study({nullReplicates=4000}={}){
  const english=fs.readFileSync(path.join(__dirname,"..","resources",
    "control","shakespeare_first300k.txt"),"utf8");
  const corpus=words(english),train=flatten(corpus.slice(600,50000));
  const model=training(train),actual=lp2(),random=seededRandom(77521);
  const lengths=[200,350],modes=["suffixBE","prefixLE"],signs=[1,-1];
  const output={model:"unknown outer permutation, SHA256 counter candidate",
    seedsTested:seeds.length,variantsPerSeed:modes.length*signs.length,
    nullReplicates, randomSeed:77521,
    corpusRuneCount:actual.values.length,wordCount:2896,
    windows:{}};
  for(const N of lengths){
    const ciphertext=actual.values.slice(0,N),contexts=actual.classes.slice(0,N);
    const candidates=[];
    for(const secret of seeds)for(const mode of modes)for(const sign of signs)
      candidates.push(attempt(ciphertext,contexts,model,secret,mode,sign));
    candidates.sort((a,b)=>b.score-a.score);
    const nullScores=[];
    for(let i=0;i<nullReplicates;i++){
      const secret="null/"+i+"/"+Math.floor(random()*4294967296);
      const mode=modes[i%2],sign=signs[Math.floor(i/2)%2];
      nullScores.push(attempt(ciphertext,contexts,model,secret,mode,sign).score);
    }
    nullScores.sort((a,b)=>a-b);
    const best=candidates[0];
    const exceeds=nullScores.filter(value=>value>=best.score).length;
    const p=(1+exceeds)/(nullReplicates+1);
    output.windows[N]={
      top:candidates.slice(0,8),
      nullMedian:nullScores[Math.floor(nullReplicates/2)],
      null99:nullScores[Math.floor(nullReplicates*.99)],
      nullMax:nullScores.at(-1),nullExceedances:exceeds,
      perCandidateTailP:p,
      bonferroniPBound:Math.min(1,seeds.length*4*p)
    };
  }
  // Held-out synthetic control. Same scorer, new English text, random sigma.
  const control=flatten(corpus.slice(0,300)),N=350;
  const text=control.values.slice(0,N),contexts=control.classes.slice(0,N);
  const key=pad("DIVINITY","suffixBE",N+80);
  const sigma=shuffledPermutation(Array.from({length:29},(_,i)=>i),random);
  const synthetic=encrypt(text,key,sigma,random,.81);
  const test=fit(synthetic.ciphertext,key.slice(0,N),contexts,model);
  const wrong=[];
  for(let i=0;i<1000;i++) {
    const k=pad("control/null/"+i,"suffixBE",N);
    wrong.push(fit(synthetic.ciphertext,k,contexts,model).score);
  }
  wrong.sort((a,b)=>a-b);
  output.plant={
    seed:"DIVINITY",mode:"suffixBE",length:N,
    antiRepeatProbability:.81,
    extraDraws:synthetic.extraDraws,
    unalignedScore:test.score,
    recoveredAlphabetSymbols:test.inverse.filter((g,c)=>sigma[g]===c).length,
    nullMedian:wrong[500],nullMax:wrong[999],
    tailP:(1+wrong.filter(x=>x>=test.score).length)/1001
  };
  return output;
}
if(require.main===module)console.log(JSON.stringify(study(),null,2));
module.exports={pad,lp2,attempt,study};
