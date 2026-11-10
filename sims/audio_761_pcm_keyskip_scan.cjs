"use strict";
/**
 * Original Cicada AUDIO/761.MP3: decode the actual waveform to original-rate
 * signed-16-bit mono PCM using FFmpeg, then search EVERY possible sample
 * offset as a collision-keyskip GP29 running pad. Historical audio bytes and
 * numerical metadata are treated in other separate prior experiments.
 *
 * PCM source is generated externally by ffmpeg in the opt-in workflow:
 * ffmpeg -i 761.MP3 -ac 1 -c:a pcm_s16le -f s16le 761.pcm
 * without changing the source MP3's sampling rate.
 *
 * This is a finite proposed signal cipher, NOT an authenticated key.
 * Run: node sims/audio_761_pcm_keyskip_scan.cjs (requires LP761_PCM)
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {train,encode}=require("./grid_keyskip_viterbi.cjs");
const {headScore,exhaustive}=require("./mirror_jpeg_offsets.cjs");
const {decode,encrypt}=require("./mirror_jpeg_pad.cjs");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const pcm=fs.readFileSync(process.env.LP761_PCM||"/tmp/761.pcm");
assert(pcm.length>2_000_000 && pcm.length%2===0,"PCM must be raw 16-bit little-endian mono");
const SAMPLE_COUNT=pcm.length/2;
const WINDOW=220,HEAD=24,KEEP=400;
const sourceKinds=["signed16-mod29","lsb8-mod29"];
function keyStream(mode) {
  const output=new Uint8Array(SAMPLE_COUNT);
  if(mode==="signed16-mod29"){
    for(let i=0;i<SAMPLE_COUNT;i++) {
      const x=pcm.readInt16LE(2*i);
      output[i]=((x%29)+29)%29;
    }
  } else if(mode==="lsb8-mod29"){
    for(let i=0;i<SAMPLE_COUNT;i++) output[i]=pcm[2*i]%29;
  } else throw new Error("unknown mode");
  return output;
}
const sources=sourceKinds.map(name=>({name,key:keyStream(name)}));
const lm=train(read("resources/control/shakespeare_first300k.txt"));
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const get=p=>corpus.pages[p].indices.slice(0,WINDOW);
const original=get(0);
assert.equal(original.length,WINDOW);
const ref=read("resources/liber-primus/lp1-plaintext-reference.txt");
const plain=encode(ref.split("### 3")[1].split("### 4")[0]).slice(0,WINDOW);
assert.equal(plain.length,WINDOW);

/** A real-language plant: same authentic historical waveform, sign and skip model. */
function control(){
  const target=sources[0],offset=3301,sign=1;
  const ciphertext=encrypt(plain,target.key,offset,sign,0x76123301);
  const decoded=decode(ciphertext.cipher,target.key,offset,sign,lm);
  const exact=decoded.plain.filter((x,i)=>x===plain[i]).length;
  assert(exact>=Math.ceil(WINDOW*.90),"true-pad model must decode its own plant");
  // Sample every possible offset of the SAME true extracted source. This
  // is the required ranking-based sensitivity control before original claims.
  const trueHead=headScore(ciphertext.cipher.slice(0,HEAD),target.key,offset,sign,lm);
  let better=0,bestWrong=-Infinity;
  const last=target.key.length-3*WINDOW;
  for(let p=0;p<=last;p++){
    if(p===offset)continue;
    const score=headScore(ciphertext.cipher.slice(0,HEAD),target.key,p,sign,lm);
    if(score>trueHead)better++;
    if(score>bestWrong)bestWrong=score;
  }
  return {source:target.name,offset,sign,seed:"0x76123301",
    realSampleCount:SAMPLE_COUNT,sourceSpecificOffsets:last+1,
    headRunes:HEAD,fullRunes:WINDOW,trueHead,rankAmongTrueSource:better+1,
    plantSkips:ciphertext.skips,inferredSkips:decoded.skips,
    exactRecovered:exact,top400Retains:(better+1)<=KEEP,bestWrong};
}
function main(){
  const positive=control();
  console.log("SOURCE",JSON.stringify({
    provenance:"immutable pre-LP2 Cicada 2013 AUDIO/761.MP3 decoded by FFmpeg to native-rate mono signed16 LE",
    pcmSamples:SAMPLE_COUNT,sha256:crypto.createHash("sha256").update(pcm).digest("hex"),
    modes:sourceKinds,model:"GP29 addition; <=2 collision-only rejected pad draws"
  }));
  console.log("PLANT",JSON.stringify(positive));
  const ranked=exhaustive(original.slice(0,HEAD),sources,lm,KEEP);
  const candidates=ranked.best.map(x=>{
    const key=sources.find(y=>y.name===x.name).key;
    const decoded=decode(original,key,x.offset,x.sign,lm);
    return {...x,fullScore:decoded.perRune,skips:decoded.skips,
      first45:decoded.plain.slice(0,45).map(x=>corpus.translit[x]).join("")};
  }).sort((a,b)=>b.fullScore-a.fullScore);
  const selected=candidates.slice(0,6).map(c=>{
    const key=sources.find(y=>y.name===c.name).key;
    return {...c, page1:decode(get(1),key,c.offset,c.sign,lm).perRune,
      page5:decode(get(5),key,c.offset,c.sign,lm).perRune};
  });
  const answer={checkedHead:ranked.checked,headSize:HEAD,fullSize:WINDOW,
    kept:ranked.best.length,topOriginal:selected,headWinner:ranked.best[0],
    sourcePositive:positive,
    decision:positive.top400Retains?
      "Powered for one genuine original PCM stream family; no source-authentic original plaintext unless independent heldouts read naturally":
      "True source offset fails top400 head filter; original search has inadequate sensitivity for key family"};
  console.log("FINAL",JSON.stringify(answer));
  return answer;
}
if(require.main===module)main();
module.exports={keyStream,control,main};
