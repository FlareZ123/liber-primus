"use strict";
/**
 * SFT: search the original 2013 Cicada 761.MP3/Twitter byte streams as
 * GP29 additive collision-keyskip pads at EVERY possible byte offset.
 *
 * This is deliberately distinct from:
 *  - byte-zero tests of the same sources;
 *  - all-offset scans of decoded PCM samples;
 *  - XOR use of the 761.MP3/Twitter pair to reconstruct Gematria Primus.
 *
 * Sources are pinned and SHA-256 checked. Mapping is the source-motivated
 * byte % 29 projection; both additive signs are searched. A planted English
 * positive control ranks its true offset against every offset of the same
 * raw source before any original-ciphertext claim is evaluated.
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
const sha256=b=>crypto.createHash("sha256").update(b).digest("hex");
const mp3=fs.readFileSync(process.env.LP761_RAW_MP3||"/tmp/761.MP3");
const twitter=fs.readFileSync(process.env.LP761_TWITTER_BIN||"/tmp/twitter.bin");
assert.equal(mp3.length,4010732,"unexpected original 761.MP3 length");
assert.equal(twitter.length,64167,"unexpected original twitter.bin length");
assert.equal(sha256(mp3),"83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460","761.MP3 source SHA-256 mismatch");
assert.equal(sha256(twitter),"defa117644978755c9d6e5cf9ed3dc4179dc63e5b6da877f1212ca2d24ce3776","twitter.bin source SHA-256 mismatch");

const gematria=Buffer.alloc(twitter.length);
for(let i=0;i<twitter.length;i++) gematria[i]=mp3[i]^twitter[i];
assert.equal(sha256(gematria),"d4736b09cfac03097efcb5c2f48ffc71f46700835fc09f7549283956580eb35d","761.MP3 XOR twitter.bin source relation mismatch");

const WINDOW=220,HEAD=24,KEEP=400;
const sources=[
  {name:"761.MP3 raw byte %29",key:Uint8Array.from(mp3,b=>b%29)},
  {name:"twitter.bin raw byte %29",key:Uint8Array.from(twitter,b=>b%29)},
  {name:"Gematria Primus XOR image raw byte %29",key:Uint8Array.from(gematria,b=>b%29)}
];
const lm=train(read("resources/control/shakespeare_first300k.txt"));
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const p0=corpus.pages[0].indices;
const p1=corpus.pages[1].indices.slice(0,WINDOW);
const p5=corpus.pages[5].indices.slice(0,WINDOW);
const headCipher=p0.slice(0,WINDOW);
assert.equal(headCipher.length,WINDOW);
assert(p0.length>=WINDOW && p1.length===WINDOW && p5.length===WINDOW);
const ref=read("resources/liber-primus/lp1-plaintext-reference.txt");
const plain=encode(ref.split("### 3")[1].split("### 4")[0]).slice(0,WINDOW);
assert.equal(plain.length,WINDOW);

function control(){
  const target=sources[0],offset=3301,sign=1;
  const ciphertext=encrypt(plain,target.key,offset,sign,0x76123301);
  const decoded=decode(ciphertext.cipher,target.key,offset,sign,lm);
  const exact=decoded.plain.filter((x,i)=>x===plain[i]).length;
  assert(exact>=Math.ceil(WINDOW*.90),"true raw-pad model must decode its own plant");
  const trueHead=headScore(ciphertext.cipher.slice(0,HEAD),target.key,offset,sign,lm);
  let better=0,bestWrong=-Infinity;
  const last=target.key.length-3*WINDOW;
  for(let p=0;p<=last;p++){
    if(p===offset)continue;
    const score=headScore(ciphertext.cipher.slice(0,HEAD),target.key,p,sign,lm);
    if(score>trueHead)better++;
    if(score>bestWrong)bestWrong=score;
  }
  return {
    source:target.name,offset,sign,seed:"0x76123301",
    sourceSpecificOffsets:last+1,headRunes:HEAD,fullRunes:WINDOW,
    trueHead,rankAmongTrueSource:better+1,plantSkips:ciphertext.skips,
    inferredSkips:decoded.skips,exactRecovered:exact,
    top400Retains:(better+1)<=KEEP,bestWrong
  };
}

function main(){
  const positive=control();
  const sourceManifest={
    mp3:{length:mp3.length,sha256:sha256(mp3),
      url:"https://raw.githubusercontent.com/rtkd/iddqd/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/2013/02/761.MP3"},
    twitter:{length:twitter.length,sha256:sha256(twitter),
      url:"https://raw.githubusercontent.com/neuroretransmit/cicada/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/003-twitter/twitter.bin"},
    gematriaXor:{length:gematria.length,sha256:sha256(gematria),
      relation:"first 64167 bytes of 761.MP3 XOR twitter.bin"}
  };
  console.log("SOURCE",JSON.stringify({
    provenance:"original Cicada 2013 761.MP3 and twitter.bin, pinned source commits",
    sourceManifest,model:"raw byte % 29; GP29 additive collision-keyskip; both signs",
    rawByteOffsets:true,pcmOffsets:false,sourceByteZeroOnly:false
  }));
  console.log("PLANT",JSON.stringify(positive));

  const ranked=exhaustive(headCipher.slice(0,HEAD),sources,lm,KEEP);
  const candidates=ranked.best.map(x=>{
    const key=sources.find(y=>y.name===x.name).key;
    const full=decode(p0,key,x.offset,x.sign,lm);
    const consumed=p0.length+full.skips;
    const local1=decode(p1,key,x.offset,x.sign,lm);
    const global1=decode(p1,key,x.offset+consumed,x.sign,lm);
    const local5=decode(p5,key,x.offset,x.sign,lm);
    return {
      ...x,fullScore:full.perRune,fullSkips:full.skips,
      fullFirst60:full.plain.slice(0,60).map(i=>corpus.translit[i]).join(""),
      page1LocalScore:local1.perRune,page1GlobalScore:global1.perRune,
      page1GlobalOffset:x.offset+consumed,page5LocalScore:local5.perRune
    };
  }).sort((a,b)=>
    (b.fullScore+b.page1GlobalScore+b.page1LocalScore)-
    (a.fullScore+a.page1GlobalScore+a.page1LocalScore)
  );

  const report={
    title:"Original 2013 Cicada raw-pad all-byte-offset GP29 keyskip scan",
    sourceManifest,
    method:{
      keyProjection:"raw byte modulo 29",
      operations:"additive GP29, both signs",
      skipModel:"collision-only rejected pad draws, maximum two",
      headRunes:HEAD,screenWindow:WINDOW,keptCandidates:KEEP,
      offsets:"every valid raw byte offset in each source",
      target:"LP2 p0 first 220 runes; p0 full page decoded for shortlisted offsets",
      heldOut:"p1 same-offset and continuous-after-p0 offsets; p5 same-offset",
      atbash:false,
      note:"No page-specific offset, PRF seed, or key phase fitted beyond the exhaustive raw-byte start offset."
    },
    positiveControl:positive,
    checkedHeadOffsets:ranked.checked,
    candidatesReturned:ranked.best.length,
    top32:candidates.slice(0,32),
    fullConfirmedEnglish:candidates.filter(x=>x.fullScore>-5.0 && x.page1GlobalScore>-5.0),
    decision:positive.top400Retains
      ?"Sensitivity control passed. Assess originals only through independent page holdouts; no plaintext claim from p0 score alone."
      :"Sensitivity control failed. The original all-offset screen is not powered for this model."
  };
  const out=process.env.LP761_REPORT||"run-artifacts/rawpad/lp2-2013-rawpad-offset-scan.json";
  fs.mkdirSync(path.dirname(out),{recursive:true});
  fs.writeFileSync(out,JSON.stringify(report,null,2)+"\n");
  console.log("FINAL",JSON.stringify({
    checkedHeadOffsets:report.checkedHeadOffsets,
    positiveControl:positive,
    top10:candidates.slice(0,10),
    fullConfirmedEnglish:report.fullConfirmedEnglish,
    reportPath:out
  }));
  return report;
}
if(require.main===module)main();
module.exports={control,main};
