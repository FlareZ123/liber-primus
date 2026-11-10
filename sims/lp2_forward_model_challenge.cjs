"use strict";
/**
 * Joint forward-generator challenge for LP2 rune ciphertext structure.
 * Preserves the original 2,896 true word lengths, 55 rune-bearing physical
 * page lengths, and nine section boundaries. Physical page breaks are
 * coordinate changes, never synthetic lexical word breaks.
 *
 * Deliberately simple null mechanisms are simulated side by side to show
 * which constraints an anti-repeat rule can and cannot jointly explain.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");
const {loadWords}=require("./word_partition_invariant.cjs");
const {pageRate,globalRate256}=require("./phase_coincidence_invariant.cjs");
const ROOT=path.resolve(__dirname,".."),N=29;
const runes=[..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
const value=new Map(runes.map((v,i)=>[v,i]));
const mod=x=>(x%N+N)%N;
const lenRange=[4,9];
/** @param {number} initial */
function random(initial){
  let x=initial>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};
}
/** @returns {{wordLengths:number[],pageLengths:number[],wordSections:number[],original:number[][],actualPages:number[][]}} */
function inputs(){
  const raw=fs.readFileSync(path.join(ROOT,"resources/lp2-transcription.txt"),"utf8");
  const parsed=parseSharedCorpus();
  assert.equal(parsed.crossPageWords,32);
  assert.equal(parsed.words.length,2896);
  assert.equal(parsed.runeCount,12956);
  const master=fs.readFileSync(path.join(ROOT,"resources/transcriptions/liber_primus_master.txt"),"utf8");
  const start=master.indexOf("ᛋᚻᛖᚩᚷᛗᛡᚠ");
  assert(start>0);
  const sections=master.slice(start).split("%").slice(0,56).join("%").split("$")
    .map(piece=>[...piece].filter(c=>value.has(c)).length).filter(n=>n);
  assert.deepEqual(sections,[729,1145,1729,9,1894,1021,1524,1589,3316]);
  const wordLengths=parsed.words.map(w=>w.length);
  const original=parsed.words.map(w=>[...w.runes].map(c=>value.get(c)));
  const wordSections=[];
  let absolute=0,section=0,boundary=sections[0];
  for(const w of original){
    while(absolute>=boundary){section++;boundary+=sections[section];}
    assert(absolute+w.length<=boundary,"Word crosses a section boundary");
    wordSections.push(section);
    absolute+=w.length;
  }
  assert.equal(absolute,12956);
  const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-corpus.json"),"utf8"));
  const actualPages=corpus.pages.filter(p=>p.status==="unsolved"&&p.indices.length).map(p=>p.indices);
  const pageLengths=actualPages.map(x=>x.length);
  assert.equal(pageLengths.length,55);
  assert.equal(pageLengths.reduce((s,x)=>s+x,0),12956);
  assert.deepEqual(actualPages.flat(),original.flat());
  return {wordLengths,pageLengths,wordSections,original,actualPages};
}
/** @param {number[]} flat @param {number[]} lengths */
function pages(flat,lengths){
  let at=0;
  const result=lengths.map(n=>{const page=flat.slice(at,at+n);at+=n;return page;});
  assert.equal(at,flat.length);
  return result;
}
/** @param {number[][]} words @param {number[][]} pageLists @param {number[]} sections */
function measure(words,pageLists,sections){
  const flat=words.flat(),frequency=new Uint32Array(29);
  assert.equal(flat.length,12956);
  let internal=0,cross=0,eligibleInternal=0,eligibleCross=0,
    nonadj=0,nonadjPossible=0,lag6=0,lag6Reverse=0,lag6Adjacent=0,lag5S=0;
  for(let i=0;i<flat.length;i++)frequency[flat[i]]++;
  for(let wi=0;wi<words.length;wi++){
    const w=words[wi];
    for(let i=1;i<w.length;i++){
      eligibleInternal++;
      if(w[i]===w[i-1])internal++;
    }
    if(w.length>=4&&w.length<=9){
      for(let i=0;i<w.length;i++)for(let j=i+2;j<w.length;j++){
        nonadjPossible++;
        if(w[i]===w[j])nonadj++;
      }
    }
    for(let i=6;i<w.length;i++){
      if(w[i]===mod(24-2*w[i-6])){lag6++;if(w[i]===w[i-1])lag6Adjacent++;}
      if(w[i-6]===mod(24-2*w[i]))lag6Reverse++;
    }
    for(let i=5;i<w.length;i++)if(w[i]===15&&w[i-5]===15)lag5S++;
    if(wi+1<words.length&&sections[wi]===sections[wi+1]){
      eligibleCross++;
      if(w.at(-1)===words[wi+1][0])cross++;
    }
  }
  let physicalAdj=0,physicalPairs=0;
  for(const page of pageLists)for(let i=1;i<page.length;i++){
    physicalPairs++;if(page[i]===page[i-1])physicalAdj++;
  }
  let chi2=0;
  for(const n of frequency){const e=flat.length/29;chi2+=(n-e)*(n-e)/e;}
  const phase=pageRate(pageLists);
  return {runes:flat.length,words:words.length,
    internal,eligibleInternal,cross,eligibleCross,
    nonadj,nonadjPossible,physicalAdj,physicalPairs,
    lag6,lag6Reverse,lag6Adjacent,lag5S,
    chi2,pagePositionRate:phase.rate,global256Rate:globalRate256(pageLists)};
}
/**
 * @param {number[][]} source Words of actual exact LP2 lengths.
 * @param {"plaintext"|"iid"|"global-rewrite"|"word-rewrite"|"global-counter6"} model
 * @param {()=>number} rng
 */
function forward(source,model,rng){
  let last=-1,key=Math.floor(rng()*29);
  return source.map(word=>{
    if(model==="word-rewrite")last=-1;
    const out=[];
    for(let i=0;i<word.length;i++){
      const p=word[i];
      if(model==="plaintext"){out.push(p);continue;}
      let c;
      if(model==="global-counter6"){
        c=mod(p+key);
        key=mod(key+6);
      }else{
        c=mod(p+Math.floor(rng()*29));
      }
      if((model==="global-rewrite"||model==="word-rewrite"||
          model==="global-T-rewrite")&&last===c&&rng()<.81){
        c=model==="global-T-rewrite"&&i>=6
          ?mod(24-2*out[i-6])
          :mod(c+1+Math.floor(rng()*28));
      }
      last=c;
      out.push(c);
    }
    return out;
  });
}
/**
 * @param {number[]} lengths
 * @param {number[][][]} sourceBins
 * @param {()=>number} rng
 */
function drawSource(lengths,sourceBins,rng){
  return lengths.map(length=>{
    const options=sourceBins[length];
    assert(options&&options.length,"No GP-English control words at length "+length);
    return options[Math.floor(rng()*options.length)];
  });
}
/** @param {number[]} values */
function summary(values) {
  const a=values.slice().sort((x,y)=>x-y);
  const mean=values.reduce((s,x)=>s+x,0)/values.length;
  const sd=Math.sqrt(values.reduce((s,x)=>s+(x-mean)*(x-mean),0)/(values.length-1));
  return {mean,sd,q025:a[Math.floor(.025*(a.length-1))],
    median:a[Math.floor(.5*(a.length-1))],
    q975:a[Math.floor(.975*(a.length-1))]};
}
/** @param {number} repetitions */
function run(repetitions=250){
  assert(Number.isInteger(repetitions)&&repetitions>=10&&repetitions<=2000);
  const input=inputs();
  const real=measure(input.original,input.actualPages,input.wordSections);
  assert.equal(real.internal,63);
  assert.equal(real.eligibleInternal,10060);
  assert.equal(real.cross,23);
  assert.equal(real.eligibleCross,2887);
  assert.equal(real.nonadj,526);
  assert.equal(real.physicalAdj,86);
  assert.equal(real.physicalPairs,12901);
  assert.equal(real.lag6Reverse,44);
  assert.equal(real.lag6Adjacent,1);
  const sourceBins=Array.from({length:15},()=>[]);
  for(const word of loadWords().shakespeare)if(word.length<sourceBins.length)
    sourceBins[word.length].push(word);
  const types=["plaintext","iid","global-rewrite","word-rewrite","global-T-rewrite","global-counter6"];
  const metrics=["internal","cross","nonadj","physicalAdj","chi2",
    "pagePositionRate","global256Rate","lag6","lag6Reverse","lag6Adjacent","lag5S"];
  const rng=random(0x3901a7d0),panels={};
  for(const type of types)panels[type]={samples:Object.fromEntries(metrics.map(k=>[k,[]]))};
  let contextWords=0;
  for(let t=0;t<repetitions;t++){
    const source=drawSource(input.wordLengths,sourceBins,rng);
    contextWords+=source.length;
    for(const type of types){
      const encoded=forward(source,type,rng);
      const m=measure(encoded,pages(encoded.flat(),input.pageLengths),input.wordSections);
      for(const key of metrics)panels[type].samples[key].push(m[key]);
    }
  }
  const out={source:{
    pageRecords:55,physicalPageWithoutRunes:50,words:input.wordLengths.length,
    crossPhysicalWords:32,runes:12956,control:"Shakespeare GP-encoded occurrence tokens length-matched to every LP2 word",
    repeatedSamples:repetitions,seed:"0x3901a7d0",sourceSampledWords:contextWords},
    observed:real,mechanisms:{},comment:"No decryption. Results are conditional forward-generator comparisons, with exploratory selected echoes reported separately."};
  for(const type of types){
    const s=panels[type].samples;
    const stats=Object.fromEntries(metrics.map(k=>[k,summary(s[k])]));
    const keys=["internal","cross","nonadj","physicalAdj"];
    const maxError=Math.max(...keys.map(k=>Math.abs((real[k]-stats[k].mean)/Math.max(stats[k].sd,1e-8))));
    const simulatedMax=Array.from({length:repetitions},(_,i)=>Math.max(...keys.map(k=>
      Math.abs((s[k][i]-stats[k].mean)/Math.max(stats[k].sd,1e-8)))));
    out.mechanisms[type]={parameters:type.includes("rewrite")?
      {rewriteOnAdjacentRepeatProbability:0.81,scope:type.startsWith("word")?"within word only":"entire ciphertext stream",
       replacement:type==="global-T-rewrite"?"T(C[i-6]) at word index>=6, uniform nonduplicate otherwise":"uniform nonduplicate"}:
      type==="global-counter6"?{additiveKeyIncrement:6,globalState:true}:
      {key:type==="plaintext"?"none":"iid uniform mod29"},
      stats,primaryJointMaximumAbsZ:maxError,
      primaryMaxZUpperTail:(simulatedMax.filter(z=>z>=maxError).length+1)/(repetitions+1)};
  }
  return out;
}
if(require.main===module){
  const result=run(Number(process.argv[2]||250));
  console.log(JSON.stringify(result,null,2));
}
module.exports={inputs,measure,forward,drawSource,run};
