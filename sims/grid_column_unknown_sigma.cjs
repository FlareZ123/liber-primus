"use strict";
/**
 * Attempt actual LP2 plaintext inversion using literal 32-byte vertical grid
 * columns as AES-256-CTR / ChaCha20 keys, arbitrary unknown outer rune
 * permutation, and collision-triggered hidden extra keystream draws.
 *
 * One independent 240-rune window from the first text group is used for
 * explicit bounded source-key competition. Includes a planted
 * English-GP/unknown-alphabet/skip control and matched shuffled-column nulls.
 * This is not a learned ciphertext key schedule.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {inputs, cipherBytes} = require("./grid_section_column_keys.cjs");
const {lp2} = require("./outer_permutation_sha_probe.cjs");
const {words,flatten,training,fit} = require("./outer_permutation_word_context.cjs");
const {viterbi} = require("./outer_permutation_alignment.cjs");
const {encrypt,shuffledPermutation,seededRandom} = require("./outer_permutation_assignment.cjs");

const N = 240, WINDOW = 60, SURVIVORS = 128;
const RUNES = [..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
const MAX_DRIFT = 34;
const SEARCH_WIDTHS = [60,100];
const modeNames = ["aes-256-ctr","chacha20"];
const mod = (v) => (v%29+29)%29;

/**
 * @param {number[][]} columns
 * @returns {{column:number,algorithm:string,reversed:boolean,scaled:boolean,sign:number,key:number[]}[]}
 */
function candidates(columns) {
  const out=[];
  for(let column=0;column<8;column++)for(const algorithm of modeNames)
    for(const reversed of [false,true]) {
      const pad=cipherBytes(reversed?columns[column].slice().reverse():columns[column],
        algorithm,N+MAX_DRIFT+2);
      for(const scaled of [false,true])for(const sign of [-1,1]){
        const key=[...pad].map(b=>mod((scaled?Math.floor(29*b/256):b%29)*sign));
        out.push({column,algorithm,reversed,scaled,sign,key});
      }
    }
  assert.equal(out.length,128);
  return out;
}

/** @param {number[]} cipher @param {string[]} contexts @param {object} model
 * @param {number[]} key
 */
function prefixScore(cipher,contexts,model,key) {
  const c=cipher.slice(0,WINDOW), ctx=contexts.slice(0,WINDOW);
  let best=fit(c,key,ctx,model).score;
  const indexes=Array.from({length:WINDOW},(_,i)=>i);
  for(let t=1;t<WINDOW;t++){
    for(let i=t;i<WINDOW;i++)indexes[i]=i+1;
    const fitted=fit(c,key,ctx,model,indexes);
    best=Math.max(best,fitted.score-3.5);
    indexes[t]=t;
  }
  return best/WINDOW;
}

/** @param {number[]} cipher @param {number[]} key
 * @param {string[]} contexts @param {object} model
 */
function invert(cipher,key,contexts,model) {
  const config={strict:true,maxDrift:MAX_DRIFT,suppress:.81,
    positionLogPrior:contexts.map(c=>model.logProb[c])};
  let winner={score:-Infinity};
  for(const width of SEARCH_WIDTHS) {
    const cc=cipher.slice(0,width),cx=contexts.slice(0,width);
    const init=fit(cc,key,cx,model);
    const suggestions=[{inverse:init.inverse,firstSkip:null,score:init.score}];
    const possible=[];
    const index=Array.from({length:width},(_,i)=>i);
    for(let t=1;t<width;t++){
      for(let i=t;i<width;i++)index[i]=i+1;
      const guess=fit(cc,key,cx,model,index);
      possible.push({inverse:guess.inverse,score:guess.score-3.5,firstSkip:t});
      index[t]=t;
    }
    possible.sort((a,b)=>b.score-a.score);
    const seen=new Set([init.inverse.join(",")]);
    for(const prop of possible){
      const keyString=prop.inverse.join(",");
      if(seen.has(keyString))continue;
      seen.add(keyString);
      suggestions.push(prop);
      if(suggestions.length>=4)break;
    }
    for(const proposal of suggestions) {
      let inverse=proposal.inverse;
      for(let iter=0;iter<4;iter++){
        const path=viterbi(cipher,key,model.prior,inverse,config);
        if(path.score>winner.score){
          const plaintext=cipher.map((c,i)=>mod(inverse[c]-key[i+path.drift[i]]));
          winner={score:path.score,initialWidth:width,
            firstSkip:proposal.firstSkip,iterations:iter+1,
            drift:path.finalDrift,
            text:plaintext.map(v=>RUNES[v]).join(""),
            inverse:[...inverse],decoded:plaintext};
        }
        const positions=[...path.drift].map((d,i)=>i+d);
        const next=fit(cipher,key,contexts,model,positions).inverse;
        if(next.every((v,i)=>v===inverse[i]))break;
        inverse=next;
      }
    }
  }
  return winner;
}

/** @param {number[]} cipher @param {string[]} contexts
 * @param {object} model @param {number[][]} columns
 */
function evaluate(cipher,contexts,model,columns) {
  const variants=candidates(columns);
  const screening=variants.map((opt,i)=>({i,score:prefixScore(cipher,contexts,model,opt.key)}))
    .sort((a,b)=>b.score-a.score);
  const tested=screening.slice(0,SURVIVORS).map(row=>{
    const opt=variants[row.i],v=invert(cipher,opt.key,contexts,model);
    return {column:opt.column,algorithm:opt.algorithm,reversed:opt.reversed,
      scaled:opt.scaled,sign:opt.sign,prefixScore:row.score,
      fullScore:v.score/N,drift:v.drift,width:v.initialWidth,
      firstSkip:v.firstSkip,text:v.text,
      inverse:v.inverse,decoded:v.decoded};
  }).sort((a,b)=>b.fullScore-a.fullScore);
  return {winning:tested[0],top:tested.slice(0,3).map(x=>({
    column:x.column,algorithm:x.algorithm,reversed:x.reversed,
    scaled:x.scaled,sign:x.sign,fullScore:x.fullScore,
    prefixScore:x.prefixScore,drift:x.drift,firstSkip:x.firstSkip,
    plaintextPreview:x.text.slice(0,90)})),
    testedCount:variants.length,fullSearchCount:SURVIVORS,
    topScreen:screening[0].score,
    key0screenRank:screening.findIndex(x=>x.i===0)+1};
}

/** @param {number[][]} columns @param {()=>number} rand */
function shuffle(columns,rand){
  return columns.map(col=>{
    const a=col.slice();
    for(let i=a.length-1;i>0;i--){
      const j=Math.floor(rand()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  });
}

function main(){
  const {groups,columnKeys}=inputs();
  assert.deepEqual(groups.map(x=>x.length),[729,1145,1729,1903,1021,1524,1589,3316]);
  const corpus=lp2();
  assert.equal(corpus.values.length,12956);
  const ciphertext=corpus.values.slice(0,N);
  const context=corpus.classes.slice(0,N);
  const english=fs.readFileSync(path.join(__dirname,"..","resources",
    "control","shakespeare_first300k.txt"),"utf8");
  const corpusWords=words(english);
  const model=training(flatten(corpusWords.slice(600,50000)));
  const positive=flatten(corpusWords.slice(0,500));
  const rand=seededRandom(0x25aeb5);
  const sigma=shuffledPermutation(Array.from({length:29},(_,i)=>i),rand);
  const source=positive.values.slice(0,N);
  assert.equal(source.length,N);
  const trueKey=candidates(columnKeys)[0].key;
  const planted=encrypt(source,trueKey,sigma,rand,.81);
  const oracleInv=Array.from({length:29},(_,c)=>sigma.indexOf(c));
  const aligned=fit(planted.ciphertext,trueKey,positive.classes.slice(0,N),model,planted.keyIndices);
  const matchedLabels=aligned.inverse.filter((x,i)=>x===oracleInv[i]).length;
  const oraclePath=viterbi(planted.ciphertext,trueKey,model.prior,oracleInv,{strict:true,maxDrift:MAX_DRIFT,suppress:.81,positionLogPrior:positive.classes.slice(0,N).map(c=>model.logProb[c])});
  const alignedPositions=[...oraclePath.drift].filter((x,i)=>x===planted.keyIndices[i]-i).length;
  const test=evaluate(planted.ciphertext,positive.classes.slice(0,N),model,columnKeys);
  const pwin=test.winning;
  const correct=pwin.decoded.filter((v,i)=>v===source[i]).length;
  const trueVariant=test.top.find(v=>v.column===0&&v.algorithm==="aes-256-ctr"&&!v.reversed&&!v.scaled&&v.sign===-1);
  // candidate[0] is negative-sign AES; inversion uses its key directly,
  // while the plant used exactly the same signed key.
  console.log("PLANT",JSON.stringify({
    extraKeyDraws:planted.extraDraws,outputRunes:N,
    best:test.top,correctPlaintextRunes:correct,
    topIsTrueVariant:!!trueVariant,
    trueKeyRankAfterScreening:test.key0screenRank,
    oracle:{matchedLabels,alignedPositions,originalDrift:planted.keyIndices.at(-1)-(N-1),inferredDrift:oraclePath.finalDrift}
  }));
  const actual=evaluate(ciphertext,context,model,columnKeys);
  console.log("REAL",JSON.stringify({scope:"First LP2 section, 240 runes",top:actual.top}));
  const nullN=8, nullScores=[],rng=seededRandom(0x25badd);
  for(let j=0;j<nullN;j++){
    const fake=evaluate(ciphertext,context,model,shuffle(columnKeys,rng));
    nullScores.push(fake.winning.fullScore);
  }
  const p=(1+nullScores.filter(x=>x>=actual.winning.fullScore).length)/(nullN+1);
  console.log("NULL",JSON.stringify({n:nullN,realBest:actual.winning.fullScore,
    nullMean:nullScores.reduce((a,b)=>a+b,0)/nullScores.length,
    nullMin:Math.min(...nullScores),nullMax:Math.max(...nullScores),
    nullScores,upperTailP:p,
    caveat:"small pilot null, exact pipeline matched; no key claim without literal plaintext"}));
}
if(require.main===module)main();
module.exports={candidates,prefixScore,invert,evaluate};
