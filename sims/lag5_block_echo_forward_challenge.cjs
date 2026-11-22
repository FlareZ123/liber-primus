'use strict';

/**
 * Reproduce original-input second-order constraints on the published
 * pnotisdev six-affine M1 and independent lag-five-copy M3 forward models.
 * They are lossy controls, not LP2 decryption algorithms.
 */
const fs = require('node:fs');
const path = require('node:path');
const {parseUnsolved,random32} = require('./lag6_conditioned_echo.cjs');
const {tally} = require('./lag5_contiguous_echo_challenge.cjs');
const Q=0.818, EPS=0.015;
const names=['lag5Hits','lag5ContiguousPairs','lag5S','wordsWithTwoLag5','lag6T'];

/**
 * @param {number[][]} words Original whole words, lengths only.
 * @param {()=>number} next Uint32 PRNG.
 * @param {'M1'|'M3'} model
 * @returns {number[][]}
 */
function generate(words,next,model) {
  let prev=-1;
  return words.map(word=>{
    const out=[];
    for(let i=0;i<word.length;i++){
      let x=next()%29;
      if(x===prev && next()/4294967296<Q){
        x=i>=6?(24-2*out[i-6]+58)%29:(prev+1+next()%28)%29;
        if(x===prev)x=(prev+1+next()%28)%29;
      }else if(model==='M3' && i>=5 && next()/4294967296<EPS){
        x=out[i-5];
      }
      out.push(x);prev=x;
    }
    return out;
  });
}

/** @param {number[][]} words */
function observe(words) {
  const s=tally(words);
  let t=0;
  for(const w of words)for(let i=6;i<w.length;i++)
    t+=Number(w[i]===(24-2*w[i-6]+58)%29);
  return [s.singles[3],s.pairs[3],s.lag5S,s.lag5WordsWithTwo,t];
}

/**
 * @param {string} source Original corpus.
 * @param {number} [replicates=8000] Number of independent forward books/model.
 */
function run(source,replicates=8000) {
  if(!Number.isInteger(replicates)||replicates<50)
    throw new RangeError('replicates must be >=50');
  const words=parseUnsolved(source),actual=observe(words);
  if(JSON.stringify(actual)!==JSON.stringify([104,9,11,9,80]))
    throw new Error('Original LP2 measurement drift');
  const answer={models:'pnotisdev M1 and M3; independently uniform pre-repair cipher digits',
    parameters:{q:Q,epsilon:EPS,replicates},
    actual:Object.fromEntries(names.map((s,i)=>[s,actual[i]])),simulated:{}};
  for(const [model,seed] of [['M1',0x6a54edb1],['M3',0x6aff7113]]){
    const next=random32(seed);
    const sums=Array(5).fill(0),sq=Array(5).fill(0),
      upper=Array(5).fill(0),max=Array(5).fill(0);
    let joint=0;
    for(let trial=0;trial<replicates;trial++){
      const v=observe(generate(words,next,model));
      for(let i=0;i<5;i++){
        sums[i]+=v[i];sq[i]+=v[i]*v[i];
        upper[i]+=Number(v[i]>=actual[i]);max[i]=Math.max(max[i],v[i]);
      }
      joint+=Number(v[1]>=actual[1]&&v[2]>=actual[2]);
    }
    answer.simulated[model]={seed:'0x'+seed.toString(16),
      diagnostics:Object.fromEntries(names.map((name,i)=>{
        const mean=sums[i]/replicates;
        return [name,{mean,sd:Math.sqrt(sq[i]/replicates-mean*mean),
          maximum:max[i],upperExceed:upper[i],
          upperP:(upper[i]+1)/(replicates+1)}];
      })),
      jointPairsAndSExceed:joint,
      jointPairsAndSP:(joint+1)/(replicates+1)};
  }
  answer.caveat='Models and lag statistics were previously selected from LP2. No original plaintext or key is recovered.';
  return answer;
}
if(require.main===module){
  const source=fs.readFileSync(path.resolve(__dirname,'../resources/lp2-transcription.txt'),'utf8');
  console.log(JSON.stringify(run(source,Number(process.argv[2]||'8000')),null,2));
}
module.exports={generate,observe,run};
