"use strict";

/**
 * Canonical-word-aware, exactly invertible GP29 word-local ciphertext-autokey.
 * At positions with at least d prior runes in the same canonical displayed
 * word, the candidate pad is F(C[i-d]) mod28, an unrestricted 29-entry table.
 * Outside those positions the cipher may use any separate state or pad, so
 * the inference applies only to eligible sites and is deliberately partial.
 * Train key using physical pages0..13, select lag d in 1..10 on p14..27,
 * refit F using p0..27, and report heldout original p28..55.
 *
 * The plant uses an independent seeded unknown pad outside eligible words,
 * a truly hidden lag5, and a random 29-entry table. It tests detection,
 * partial plaintext recovery, and the published parser's word contract.
 */
const fs=require("node:fs"),path=require("node:path");
const {encodeGP,sourceModel}=require("./exponent_feedback_lookup_attack.cjs");
const root=path.join(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const transcript=fs.readFileSync(path.join(root,"resources/lp2-transcription.txt"),"utf8");
const english=encodeGP(fs.readFileSync(path.join(root,"resources/control/shakespeare_first300k.txt"),"utf8"));
const logp=sourceModel(english).logp;
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length).map(p=>p.indices);
const flat=pages.flat();
const runeMap=new Map(corpus.runes.map((r,i)=>[r,i]));
/**
 * Canonical parser state: percent/page break and slash line wraps do not
 * separate words. A dot, hyphen and other explicit non-rune marks do.
 * @param {string} raw
 */
function parseWordOffsets(raw){
  const stream=raw.split("%").slice(0,55).join("%");
  const offsets=[],symbols=[];
  let position=0,words=0;
  for(const c of stream){
    if(runeMap.has(c)){
      offsets.push(position++);
      symbols.push(runeMap.get(c));
    }else if(c==="%"||c==="/"||/\s/u.test(c)){
      // Printed page and line breaks may occur within a word.
    }else if(position>0){position=0;words++;}
  }
  if(position>0)words++;
  return {offsets,symbols,words};
}
const parsed=parseWordOffsets(transcript);
if(parsed.symbols.length!==flat.length||
   parsed.symbols.some((v,i)=>v!==flat[i]))
   throw new Error("canonical word coordinates do not match source ciphertext");
const pageOf=[],pageFirst=[];
let idx=0;
for(let p=0;p<pages.length;p++)for(let i=0;i<pages[p].length;i++){
  pageOf[idx]=p;
  pageFirst[idx]=i===0;
  idx++;
}
const pow=[],lg=new Int8Array(29).fill(-1);
for(let i=0,v=1;i<28;i++){pow[i]=v;lg[v]=i;v=v*15%29;}
const mod28=n=>(n%28+28)%28;
/** @param {number} seed */
function rng(seed){
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}
/**
 * @param {number[]} ciphertext
 * @param {number} lag
 * @param {number} from
 * @param {number} to
 */
function rows(ciphertext,lag,from,to){
  const out=[];
  for(let i=1;i<ciphertext.length;i++){
    if(pageOf[i]<from||pageOf[i]>=to||pageFirst[i]||
       parsed.offsets[i]<lag)continue;
    const step=(ciphertext[i]-ciphertext[i-1]+29)%29;
    if(step)out.push([lg[step],ciphertext[i-lag],i]);
  }
  return out;
}
/** @param {Array<[number,number,number]>} samples */
function train(samples){
  const counts=Array.from({length:29},()=>new Uint16Array(28));
  for(const [r,x] of samples)counts[x][r]++;
  const f=Array(29).fill(0);
  for(let x=0;x<29;x++){
    let best=-Infinity;
    for(let k=0;k<28;k++){
      let score=0;
      for(let r=0;r<28;r++)score+=counts[x][r]*logp[mod28(r-k)];
      if(score>best){best=score;f[x]=k;}
    }
  }
  return f;
}
/**
 * @param {Array<[number,number,number]>} samples
 * @param {number[]} f
 */
function evaluate(samples,f){
  const h=Array(28).fill(0);
  let s=0;
  for(const [r,x] of samples){
    const v=mod28(r-f[x]);h[v]++;s+=logp[v];
  }
  const n=samples.length;
  return {n,meanLogL:s/n,ioC:h.reduce((a,v)=>a+v*(v-1),0)/(n*(n-1))};
}
/** @param {number[]} cipher */
function discover(cipher){
  const out=[];
  for(let lag=1;lag<=10;lag++){
    const early=rows(cipher,lag,0,14);
    const earlyKey=train(early);
    const validation=rows(cipher,lag,14,28);
    const frozen=train(rows(cipher,lag,0,28));
    const hold=rows(cipher,lag,28,55);
    out.push({lag,fitEarly:evaluate(early,earlyKey),
      validation:evaluate(validation,earlyKey),
      hold:evaluate(hold,frozen),key:frozen});
  }
  out.sort((a,b)=>b.validation.meanLogL-a.validation.meanLogL);
  return out;
}
/**
 * @param {number[]} originalPlain
 * @param {number} lag
 * @param {number[]} f
 * @param {()=>number} random
 */
function plantCipher(originalPlain,lag,f,random){
  const cipher=[];
  for(let i=0;i<originalPlain.length;i++){
    if(pageFirst[i]){cipher.push(originalPlain[i]);continue;}
    const pad=parsed.offsets[i]>=lag?f[cipher[i-lag]]:random()%28;
    const p=originalPlain[i];
    cipher.push(p===28?cipher[i-1]:
      (cipher[i-1]+pow[mod28(p+pad)])%29);
  }
  return cipher;
}
/**
 * @param {number[]} cipher
 * @param {number[]} sourcePlain
 * @param {number} lag
 * @param {number[]} key
 */
function recovered(cipher,sourcePlain,lag,key){
  let match=0,eligible=0;
  for(let i=1;i<cipher.length;i++){
    if(pageFirst[i]||pageOf[i]<28||parsed.offsets[i]<lag)continue;
    const delta=(cipher[i]-cipher[i-1]+29)%29;
    const p=delta?mod28(lg[delta]-key[cipher[i-lag]]):28;
    eligible++;match+=Number(p===sourcePlain[i]);
  }
  return {match,eligible,rate:match/eligible};
}
function main(){
  const random=rng(0x7935ab25),trueLag=5;
  const secret=Array.from({length:29},()=>random()%28);
  const plain=Array.from({length:flat.length},(_,i)=>english[i%english.length]);
  const synthetic=plantCipher(plain,trueLag,secret,random);
  const original=discover(flat),plant=discover(synthetic);
  const predicted=recovered(synthetic,plain,plant[0].lag,plant[0].key);
  const realKeyRecovered=plant[0].key.filter((v,i)=>v===secret[i]).length;
  const simplify=x=>({lag:x.lag,fitEarly:x.fitEarly,
    validation:x.validation,heldout:x.hold});
  const report={sourceWords:parsed.words,ciphertextRunes:flat.length,
    lagCandidates:[1,10],physicalPageSplits:[[0,14],[14,28],[28,55]],
    original:original.slice(0,6).map(simplify),
    positive:{plantedLag:trueLag,selectedLag:plant[0].lag,
      topThree:plant.slice(0,3).map(simplify),
      keyEntriesRecovered:realKeyRecovered,
      trueHeldoutPlaintext:predicted}};
  console.log(JSON.stringify(report,null,2));
  if(parsed.words!==2896||plant[0].lag!==trueLag||
      predicted.rate<0.9)
    throw new Error("word contract/lag/partial plaintext control failed");
}
if(require.main===module)main();
module.exports={parseWordOffsets,rows,train,evaluate,discover,plantCipher,recovered};
