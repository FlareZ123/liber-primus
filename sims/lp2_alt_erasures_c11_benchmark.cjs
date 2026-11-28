#!/usr/bin/env node
"use strict";
/**
 * One reproducible C11-style controlled evaluation shard.
 *
 * Genuine held-out source: resources/control/emerson_essays_2944.txt.
 * Language training: Gibran, Blake, and separately pinned solved LP1 sections.
 * New v2 source-calibrated tokenizer; evaluation covers retained plaintext, not hidden events.
 * This uses *no unsolved LP2 symbols for training or tuning*.
 *
 * Output to stdout is a JSON object; exact seeds and source offsets are logged.
 * Wrong keys are decoded by the same algorithm, so a generic-English hallucinator
 * cannot be counted as success merely by recovering planted strings.
 *
 * Command:
 *   node sims/lp2_alt_erasures_c11_benchmark.cjs 0 5 20261128 320
 */
const fs=require("node:fs"),D=require("./lp2_alt_erasures_alignment_decoder.cjs");
const _aliasCases=[["QU",[5,7]],["ING",[21]],["IO",[27]],["A B",[24,29,17]]];
for(const [s,expected] of _aliasCases){
  const actual=D.tokenizeLatinCanonical(s,true);
  if(JSON.stringify(actual)!==JSON.stringify(expected))
    throw Error("Canonical GP29 tokenizer regression: "+s+" "+JSON.stringify(actual));
}
const shard=Number(process.argv[2]??0), count=Number(process.argv[3]??5),
      seed=Number(process.argv[4]??20261128), beam=Number(process.argv[5]??320);
if(!Number.isSafeInteger(shard)||shard<0||shard>1024||!Number.isSafeInteger(count)||count<=0||count>40||!Number.isSafeInteger(seed)||seed<0||seed>4294967295||!Number.isSafeInteger(beam)||beam<1||beam>20000)throw Error("Invalid shard/count/seed/beam");
const root=process.cwd(),read=p=>fs.readFileSync(root+"/"+p,"utf8");
const train=[
  D.tokenizeLatinCanonical(read("resources/control/gibran_prophet_58585.txt"),true),
  D.tokenizeLatinCanonical(read("resources/external/blake-marriage-1906-gutenberg45315.txt"),true),
];
const native=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
for(const section of native.sections)if(!["0_koan_1","p56_an_end","p57_parable"].includes(section.name))
  train.push(D.tokenizeNative(section.source_text,true));
const models=Object.fromEntries(["V-DELETE","V-SILENT"].map(v=>[v,D.trainLanguage(train,v,{
  rounds:3,drop:0,order:4,seed:125516})]));
const held=read("resources/control/emerson_essays_2944.txt");
const words=[...held.matchAll(/[A-Za-z]+(?:'[A-Za-z]+)*|[.!?]/g)]
  .map(m=>m[0]).filter(t=>!/[.!?]/.test(t))
  .map(t=>D.tokenizeLatinCanonical(t,false)).filter(w=>w.length>0);
const sources={"V-DELETE":words.flat(),"V-SILENT":words.flatMap(w=>w.concat(29))};
const rawQ=new Map(), qlines=read("resources/control/duko_round27_english_quadgrams.txt").trim().split("\n");let qmass=0;
for(const line of qlines){const [q,raw]=line.split(" ");let n=Number(raw);if(q?.length===4&&Number.isFinite(n)){rawQ.set(q,n);qmass+=n;}}
const norm=Math.log10(qmass),floor=Math.log10(.01)-norm;
function qscore(indices){
  let s=indices.map(i=>D.GP_NATIVE[i]).join(""),score=0;
  if(s.length<4)return null; // no artificial best score for empty decoder output
  for(let i=0;i+3<s.length;i++){const n=rawQ.get(s.slice(i,i+4));score+=(n?Math.log10(n)-norm:floor);}
  return score/Math.max(s.length-3,1);
}
const rows=[];const t0=Date.now();
for(const variant of ["V-DELETE","V-SILENT"])for(let k=0;k<count;k++) {
  const pid=shard*count+k,mod=variant==="V-DELETE"?29:36,
        r=D.lcg((seed ^ (shard*7919) ^ (k*101) ^ (variant==="V-DELETE"?0x73291:0x36029))>>>0),
        randint=n=>Math.floor(r()*n), L=variant==="V-DELETE"?Math.ceil(240/(1-.187)):Math.ceil(240*36/29);
  const src=sources[variant],start=randint(src.length-L),P=src.slice(start,start+L);
  const K=Array.from({length:6*L},()=>randint(mod)),
        wrong=Array.from({length:6*L},()=>randint(mod));
  const enc=D.encodePlant(P,K,variant,r);
  const a=D.beamDecodeFull(enc.C,K,variant,models[variant],{beam,maxHidden:2,maxReject:2}),
        b=D.beamDecodeFull(enc.C,wrong,variant,models[variant],{beam,maxHidden:2,maxReject:2});
  const recovered=D.lcs(a.plain_idx,enc.truth)/Math.max(a.plain_idx.length,enc.truth.length,1);
  const qTrue=qscore(enc.truth),qCorrect=qscore(a.plain_idx),qWrong=qscore(b.plain_idx);
  const exactRetained=a.plain_idx.length===enc.truth.length&&a.plain_idx.every((v,i)=>v===enc.truth[i]);
  const validScorePair=!a.error&&!b.error&&qCorrect!==null&&qWrong!==null;
  rows.push({variant,pid,shard,sourceStart:start,sourceLength:L,cipherLength:enc.C.length,
    truthLength:enc.truth.length,decodedLength:a.plain_idx.length,
    keyConsumedActual:enc.keyConsumed,keyConsumedDecoded:a.alignmentKeyConsumed,
    recovered,passedRecovery:recovered>=0.85,exactRetained,validScorePair,
    qTrue,qCorrect,qWrong,
    decoderCorrectScore:a.score,decoderWrongScore:b.score,
    correctSeconds:Number.isFinite(a.elapsedMs)?a.elapsedMs/1000:null,
    wrongSeconds:Number.isFinite(b.elapsedMs)?b.elapsedMs/1000:null,
    errors:[a.error,b.error].filter(Boolean)});
  console.error(JSON.stringify({plant:pid,variant,rec:+recovered.toFixed(3),
    q:qCorrect===null?null:+qCorrect.toFixed(3),
    wrong:qWrong===null?null:+qWrong.toFixed(3),
    sec:Math.round(((a.elapsedMs??0)+(b.elapsedMs??0))/1000)}));
}
const output={test:"Agent9-erasure-alignment-C11-canonical-v2",seed,shard,count,beam,
  scoreSemantics:"retained GP29 LCS; invalid or <4-letter quadgram outputs score null",
  languageTokens:train.map(x=>x.length),
  elapsedSeconds:(Date.now()-t0)/1000,rows};
const outputPath="benchmark-output";
fs.mkdirSync(outputPath,{recursive:true});
fs.writeFileSync(outputPath+"/shard"+shard+".json",JSON.stringify(output,null,2)+"\n");
console.log(JSON.stringify({shard,count,beam,seconds:output.elapsedSeconds,
  variants:["V-DELETE","V-SILENT"].map(v=>{
  const r=rows.filter(x=>x.variant===v),success=r.filter(x=>x.passedRecovery).length;
  const valid=r.filter(x=>x.validScorePair);
  const avg=key=>valid.length?valid.reduce((s,x)=>s+x[key],0)/valid.length:null;
  return {variant:v,passedRecovery:success,exactRetained:r.filter(x=>x.exactRetained).length,
    n:r.length,mean:r.reduce((s,x)=>s+x.recovered,0)/r.length,
    scorePairs:valid.length,failedCorrect:r.filter(x=>x.correctSeconds===null).length,
    failedWrong:r.filter(x=>x.wrongSeconds===null).length,
    meanRealQ:avg("qCorrect"),meanWrongQ:avg("qWrong")};
})}));
