"use strict";
/**
 * Global latent 29-rune alphabet shared across eight independently keyed
 * LP2 text groups. A single unknown outer permutation, eight actual vertical
 * table-column AES-256-CTR keys, and hidden collision-triggered key skips.
 *
 * Solves alternating globally optimal 29x29 alphabet assignments and
 * page-group-specific Viterbi paths; initial candidate windows are pooled
 * across eight groups, rather than fitted to a single tiny 60-rune prefix.
 * A known-key, known-source encrypted plant must first establish power.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {inputs,cipherBytes}=require("./grid_section_column_keys.cjs");
const {lp2}=require("./outer_permutation_sha_probe.cjs");
const {words,flatten,training}=require("./outer_permutation_word_context.cjs");
const {assignmentMax,encrypt,shuffledPermutation,seededRandom}=
  require("./outer_permutation_assignment.cjs");
const {viterbi}=require("./outer_permutation_alignment.cjs");

const M=29;
const LENGTHS=[729,1145,1729,1903,1021,1524,1589,3316];
const MOD=(n)=>(n%M+M)%M;
const GP=[..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];

/** @param {number[]} flat */
function split(flat) {
 let offset=0;
 return LENGTHS.map(n=>{const slice=flat.slice(offset,offset+n);offset+=n;return slice;});
}

/** @param {number[][]} columns @param {number[]} lengths */
function keysFor(columns,lengths,settings={}){
  const {algorithm="aes-256-ctr",reversed=false,scaled=false,sign=1}=settings;
  return columns.map((c,i)=>{
    const width=lengths[i],drift=Math.ceil(width*.06)+18;
    const key=reversed?c.slice().reverse():c;
    const pad=cipherBytes(key,algorithm,width+drift+3);
    return [...pad].map(x=>MOD(sign*(scaled?Math.floor(x*29/256):x%29)));
  });
}

/**
 * Conditionally exact global maximum-likelihood permutation.
 * @param {number[][]} ciphers
 * @param {string[][]} contexts
 * @param {number[][]} keys
 * @param {object} model
 * @param {number[][]|null} keyPositions
 * @param {number|null} prefix
 */
function assignGlobal(ciphers,contexts,keys,model,keyPositions=null,prefix=null) {
  const weights=Array.from({length:M},()=>Array(M).fill(0));
  for(let s=0;s<ciphers.length;s++){
    const n=prefix===null?ciphers[s].length:Math.min(prefix,ciphers[s].length);
    for(let i=0;i<n;i++){
      const c=ciphers[s][i];
      const j=keyPositions?keyPositions[s][i]:i;
      const k=keys[s][j];
      const lp=model.logProb[contexts[s][i]];
      for(let v=0;v<M;v++)weights[c][v]+=lp[MOD(v-k)];
    }
  }
  return assignmentMax(weights).assignment;
}

/**
 * @param {number[][]} ciphers
 * @param {string[][]} contexts
 * @param {number[][]} keys
 * @param {object} model
 * @param {number[]} inverse
 * @param {boolean} strict
 */
function alignAll(ciphers,contexts,keys,model,inverse,strict) {
  const paths=[], keyPositions=[];
  let score=0;
  for(let s=0;s<ciphers.length;s++){
    const n=ciphers[s].length;
    const config={strict,maxDrift:Math.ceil(n*.06)+18,suppress:.81,
      positionLogPrior:contexts[s].map(c=>model.logProb[c])};
    const path=viterbi(ciphers[s],keys[s],model.prior,inverse,config);
    score+=path.score;
    paths.push(path);
    keyPositions.push([...path.drift].map((d,i)=>i+d));
  }
  return {paths,keyPositions,score};
}

/**
 * @param {number[][]} ciphers
 * @param {string[][]} contexts
 * @param {number[][]} keys
 * @param {object} model
 */
function recover(ciphers,contexts,keys,model){
  const initialWidths=[10,20,30,45,65,100,160,null];
  let champion={score:-Infinity};
  for(const W of initialWidths){
    let inv=W===null?Array.from({length:M},(_,i)=>i):
      assignGlobal(ciphers,contexts,keys,model,null,W);
    const history=[];
    for(const strict of [false,true]){
      for(let iter=0;iter<8;iter++){
        const paths=alignAll(ciphers,contexts,keys,model,inv,strict);
        history.push({strict,iter,score:paths.score,
          drift:paths.paths.map(x=>x.finalDrift)});
        if(strict && paths.score>champion.score)
          champion={score:paths.score,init:W,strict,iter,
            inv:inv.slice(),keyPositions:paths.keyPositions,
            drift:paths.paths.map(x=>x.finalDrift),history:history.slice()};
        const next=assignGlobal(ciphers,contexts,keys,model,paths.keyPositions);
        if(next.every((x,i)=>x===inv[i]))break;
        inv=next;
      }
    }
  }
  const count=ciphers.reduce((n,c)=>n+c.length,0);
  return {...champion,average:champion.score/count,
    firstPlain:ciphers[0].slice(0,120).map((c,i)=>{
      const k=keys[0][champion.keyPositions[0][i]];
      return GP[MOD(champion.inv[c]-k)];
    }).join("")};
}

function study() {
  const {groups,columnKeys}=inputs();
  assert.deepEqual(groups.map(a=>a.length),LENGTHS);
  const actual=lp2();
  const ciphers=split(actual.values), contexts=split(actual.classes);
  const text=fs.readFileSync(path.join(__dirname,"..","resources",
    "control","shakespeare_first300k.txt"),"utf8");
  const allWords=words(text);
  const model=training(flatten(allWords.slice(4200,50000)));
  const plainCorpus=flatten(allWords.slice(0,4000));
  assert(plainCorpus.values.length>=LENGTHS.reduce((a,b)=>a+b,0));
  const plaintext=split(plainCorpus.values);
  const plaintextContexts=split(plainCorpus.classes);
  const rng=seededRandom(0x253301c);
  const sigma=shuffledPermutation(Array.from({length:M},(_,i)=>i),rng);
  const invOracle=Array.from({length:M},(_,c)=>sigma.indexOf(c));
  const keys=keysFor(columnKeys,LENGTHS);
  const planted=plaintext.map((p,i)=>encrypt(p,keys[i],sigma,rng,.81));
  const plantCiphers=planted.map(x=>x.ciphertext);
  const plantPaths=planted.map(x=>x.keyIndices);
  const plantedOracle=assignGlobal(plantCiphers,plaintextContexts,keys,model,plantPaths);
  const oracleLabels=plantedOracle.filter((x,i)=>x===invOracle[i]).length;
  const knownOracle=alignAll(plantCiphers,plaintextContexts,keys,model,invOracle,true);
  const oracleAligned=knownOracle.keyPositions.reduce((sum,positions,s)=>
    sum+positions.filter((j,i)=>j===plantPaths[s][i]).length,0);
  const plant=recover(plantCiphers,plaintextContexts,keys,model);
  const labelCorrect=plant.inv.filter((x,i)=>x===invOracle[i]).length;
  const plainCorrect=plantCiphers.reduce((sum,c,s)=>
    sum+c.filter((symbol,i)=>MOD(plant.inv[symbol]-keys[s][plant.keyPositions[s][i]])===
      plaintext[s][i]).length,0);
  console.log("PLANT",JSON.stringify({runes:12956,
    extraDraws:planted.map(x=>x.extraDraws),oracleLabels,
    oracleAligned,oracleScore:knownOracle.score/12956,
    inferred:{average:plant.average,init:plant.init,drift:plant.drift,
      labelCorrect,plainCorrect,preview:plant.firstPlain,history:plant.history}
  }));
  const real=recover(ciphers,contexts,keys,model);
  console.log("REAL",JSON.stringify({
    assumption:"same outer permutation for all 8 groups, fixed column-to-section mapping, AES256CTR, IV zero, byte modulo 29",
    meanLogScore:real.average,init:real.init,drift:real.drift,
    alphabet:real.inv,preview:real.firstPlain,history:real.history
  }));
  const variants=[];
  for(const algorithm of ["aes-256-ctr","chacha20"])
    for(const reversed of [false,true])
      for(const scaled of [false,true])
        for(const sign of [-1,1]){
          const settings={algorithm,reversed,scaled,sign};
          const keys2=keysFor(columnKeys,LENGTHS,settings);
          const result=algorithm==="aes-256-ctr"&&!reversed&&!scaled&&sign===1
            ? real:recover(ciphers,contexts,keys2,model);
          variants.push({...settings,score:result.average,
            init:result.init,drift:result.drift,preview:result.firstPlain,
            inverse:result.inv});
        }
  variants.sort((a,b)=>b.score-a.score);
  console.log("MODES",JSON.stringify({count:variants.length,top:variants.slice(0,8),
    worstScore:variants.at(-1).score,baselineScore:real.average}));
  return {plant,real,variants};
}
if(require.main===module)study();
module.exports={split,keysFor,assignGlobal,alignAll,recover,study};
