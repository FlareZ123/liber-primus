"use strict";

const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");
const {words,category}=require("./outer_permutation_word_context.cjs");
const {train,inverseCandidates,decodeWord,ngramProbability,rng}=require("./lag6_repair_contextual_inverse.cjs");
const {encipher}=require("./lag6_repair_keyed_inverse.cjs");

const ROOT=path.resolve(__dirname,"..");
const read=name=>fs.readFileSync(path.join(ROOT,name),"utf8");
const GP=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const INK=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const SHAKESPEARE=read("resources/control/shakespeare_first300k.txt");
const Q=.81,MIX=.95,M=29,BOS=29,mod=x=>((x%M)+M)%M;
const runeIndex=new Map(GP.runes.map((r,i)=>[r,i]));

function redDigits(page){
  const source=GP.pages.find(p=>p.page===page);
  const annotation=INK.pages.find(p=>p.page===page);
  assert(source&&annotation&&annotation.red_spans.length);
  const span=annotation.red_spans[0];
  const digits=[...span.runes].map(r=>runeIndex.get(r));
  assert(digits.every((v,i)=>Number.isInteger(v)&&v===source.indices[span.start+i]));
  return {digits,start:span.start,length:span.length};
}
function asBase29(digits,n){
  let v=0n;for(const d of digits)v=v*29n+BigInt(d);
  const hex=v.toString(16).padStart(n*2,"0");
  assert.equal(hex.length,n*2);
  return Buffer.from(hex,"hex");
}
function stream(n,key,iv,algorithm){
  const d=crypto.createDecipheriv(algorithm,key,iv);
  return Buffer.concat([d.update(Buffer.alloc(n)),d.final()]);
}
function sourceBodies(){
  const parsed=parseSharedCorpus();
  assert.equal(parsed.words.length,2896);
  assert.equal(parsed.runeCount,12956);
  let offset=0;
  const all=parsed.words.map(w=>{
    const start=offset;offset+=w.length;
    return {start,end:offset-1,length:w.length,indices:[...w.runes].map(r=>runeIndex.get(r))};
  });
  assert.equal(offset,12956);
  const starts=new Map();let pageOffset=0;
  for(const p of GP.pages){starts.set(p.page,pageOffset);pageOffset+=p.indices.length;}
  assert.equal(pageOffset,12956);
  const p22=GP.pages.find(p=>p.page===22),p55=GP.pages.find(p=>p.page===55);
  const specs=[
    {name:"p15-22",start:starts.get(15)+20,end:starts.get(22)+p22.indices.length-1,runes:1883,words:432},
    {name:"p40-55",start:starts.get(40)+8,end:starts.get(55)+p55.indices.length-1,runes:3308,words:733}
  ];
  return specs.map(s=>{
    const overlap=all.filter(w=>w.end>=s.start&&w.start<=s.end);
    const selected=overlap.filter(w=>w.start>=s.start&&w.end<=s.end);
    assert.equal(overlap.length,selected.length,s.name+" cuts a word");
    assert.equal(selected.reduce((n,w)=>n+w.length,0),s.runes);
    assert.equal(selected.length,s.words);
    return {...s,body:selected.map(w=>w.indices)};
  });
}
function languageMean(ws,model){
  let score=0,n=0;
  for(const w of ws){let a=BOS,b=BOS;for(let j=0;j<w.length;j++){
    score+=Math.log(ngramProbability(model,a,b,w[j],category(w.length,j)));
    a=b;b=w[j];n++;
  }}
  return score/n;
}
function decode(cipher,pad,model){
  const options=inverseCandidates(cipher,pad,-1);
  const out=options.map(row=>decodeWord(row,model,MIX));
  return {words:out.map(x=>x.sequence),score:out.reduce((s,x)=>s+x.score,0),
    lexical:out.filter(x=>x.origin==="lexicon").length};
}
function plantWords(lengths,sourceWords,seed){
  const random=rng(seed),bins=new Map(),flat=sourceWords.flat();
  for(const w of sourceWords){if(!bins.has(w.length))bins.set(w.length,[]);bins.get(w.length).push(w);}
  let fallback=0;
  const plaintext=lengths.map(n=>{
    const b=bins.get(n);
    if(b&&b.length)return b[Math.floor(random()*b.length)];
    fallback++;const start=Math.floor(random()*(flat.length-n));return flat.slice(start,start+n);
  });
  return {plaintext,fallback};
}
function metrics(plain,predicted){
  const a=plain.flat(),b=predicted.flat();let correct=0,whole=0;
  for(let i=0;i<a.length;i++)correct+=Number(a[i]===b[i]);
  for(let i=0;i<plain.length;i++)if(plain[i].every((v,j)=>v===predicted[i][j]))whole++;
  return {runes:a.length,correct,accuracy:correct/a.length,wholeWords:whole,words:plain.length};
}
function run(){
  const p15=redDigits(15),p40=redDigits(40),p53=redDigits(53);
  assert.equal(p15.length,9);assert.equal(p40.length,8);
  assert.equal(p53.length,51);assert.equal(p53.start,128);
  const keyOptions=[
    {name:"forward",digits:p53.digits},
    {name:"reverse",digits:p53.digits.slice().reverse()},
    {name:"atbash",digits:p53.digits.map(x=>28-x)},
    {name:"reverse-atbash",digits:p53.digits.slice().reverse().map(x=>28-x)}
  ];
  const joined=[...p15.digits,...p40.digits],other=[...p40.digits,...p15.digits];
  const nonceOptions=[
    {name:"p15-p40",digits:joined},
    {name:"reverse-p15-p40",digits:joined.slice().reverse()},
    {name:"p40-p15",digits:other},
    {name:"reverse-p40-p15",digits:other.slice().reverse()}
  ];
  const bodies=sourceBodies(),trainWords=words(SHAKESPEARE.slice(0,200000));
  const testWords=words(SHAKESPEARE.slice(240000)),model=train(trainWords);
  const nativeTestMean=languageMean(testWords,model);
  const candidates=[],algorithms=["aes-256-ctr","chacha20"],signs=[1,-1];
  for(const ko of keyOptions)for(const no of nonceOptions){
    const key=asBase29(ko.digits,32),nonce=asBase29(no.digits,12);
    const iv=Buffer.concat([Buffer.alloc(4),nonce]);
    for(const algorithm of algorithms)for(const sign of signs){
      const decoded=bodies.map(b=>{
        const pad=[...stream(b.runes,key,iv,algorithm)].map(x=>mod(sign*(x%M)));
        return decode(b.body,pad,model);
      });
      candidates.push({
        key:ko.name,nonce:no.name,algorithm,sign,
        trainScore:decoded[0].score/bodies[0].runes,
        heldoutScore:decoded[1].score/bodies[1].runes,
        trainMean:languageMean(decoded[0].words,model),
        heldoutMean:languageMean(decoded[1].words,model),
        lexical:[decoded[0].lexical,decoded[1].lexical],
        preview:decoded.map(x=>x.words.slice(0,12).map(w=>w.map(v=>GP.translit[v]).join("")).join(" "))
      });
    }
  }
  assert.equal(candidates.length,64);
  const byTrain=[...candidates].sort((a,b)=>b.trainScore-a.trainScore);
  const byHeldout=[...candidates].sort((a,b)=>b.heldoutScore-a.heldoutScore);
  const byJoint=[...candidates].sort((a,b)=>(b.trainScore+b.heldoutScore)-(a.trainScore+a.heldoutScore));

  const positive=[];
  const key=asBase29(keyOptions[0].digits,32);
  const nonce=asBase29(nonceOptions[0].digits,12);
  const iv=Buffer.concat([Buffer.alloc(4),nonce]);
  for(const algorithm of algorithms)for(const sign of signs){
    const controls=bodies.map((b,i)=>{
      const pad=[...stream(b.runes,key,iv,algorithm)].map(x=>mod(sign*(x%M)));
      const sample=plantWords(b.body.map(w=>w.length),testWords,0x12c1d00d+i);
      const encrypted=encipher(sample.plaintext,pad,rng(0x12c1e00d+i),Q);
      const recovered=decode(encrypted.ciphertext,pad,model);
      return {...metrics(sample.plaintext,recovered.words),
        rewrites:encrypted.rewritten.filter(Boolean).length,
        fallbackWords:sample.fallback,lexicalWords:recovered.lexical};
    });
    positive.push({algorithm,sign,bodies:controls});
  }
  const minAccuracy=Math.min(...positive.flatMap(x=>x.bodies.map(b=>b.accuracy)));
  assert(minAccuracy>.95,"T6 positive controls failed");

  const compact=x=>({
    key:x.key,nonce:x.nonce,algorithm:x.algorithm,sign:x.sign,
    trainViterbiPerRune:x.trainScore,heldoutViterbiPerRune:x.heldoutScore,
    trainLanguageMean:x.trainMean,heldoutLanguageMean:x.heldoutMean,
    lexicalWords:x.lexical,preview:x.preview
  });
  const result={
    classification:"64-model original-source negative with synthetic positive controls; no plaintext/key recovered",
    source:{
      redRunes:{p15:p15.length,p40:p40.length,p53:p53.length},
      bodies:bodies.map(b=>({name:b.name,start:b.start,end:b.end,runes:b.runes,words:b.words})),
      languageTrainingRunes:trainWords.flat().length,
      nativeShakespeareTestMeanLogProbability:nativeTestMean
    },
    model:{keyOrientations:keyOptions.map(x=>x.name),nonceOrders:nonceOptions.map(x=>x.name),
      algorithms,signs,models:candidates.length,q:Q,mix:MIX,
      reset:"keystream and echo predecessor reset at each red-selected body"},
    original:{bestTraining:byTrain.slice(0,5).map(compact),
      bestHeldout:byHeldout.slice(0,5).map(compact),
      bestJoint:byJoint.slice(0,5).map(compact)},
    positiveControls:{minimumRuneAccuracy:minAccuracy,
      accuracyRange:[minAccuracy,Math.max(...positive.flatMap(x=>x.bodies.map(b=>b.accuracy)))],
      models:positive},
    interpretation:"All 64 settings remain nonlinguistic on both original bodies. The body split is a within-candidate cross-body check, not an undisclosed research-wide holdout. The T6 generator is lossy; this excludes only the stated source-key/T6 family."
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)run();
module.exports={redDigits,asBase29,sourceBodies,run};
