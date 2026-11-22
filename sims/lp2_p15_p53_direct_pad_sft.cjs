"use strict";
/**
 * Frozen direct-pad test: p53's 51-rune red span as a one-use GP29 key
 * for the DH-coordinate-selected p15 51-rune window.
 * Run: node sims/lp2_p15_p53_direct_pad_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const historical=require("./historical_text_guide_terminal_vigenere_sft.cjs");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const ink=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-ink-annotations.json"),"utf8"));
const transcription=fs.readFileSync(path.join(root,"resources/liber-primus/lp2-transcription.txt"),"utf8");
const reference=fs.readFileSync(path.join(root,"resources/liber-primus/lp1-plaintext-reference.txt"),"utf8");
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const runeSet=new Set(corpus.runes);
const parts=transcription.split(/^\s*%\s*$/m);
const mod=x=>((x%29)+29)%29;
function parsePhysicalPage(page){
  const source=parts[page<50?page:page-1];
  assert.ok(source,"missing transcription page "+page);
  const runes=[],words=[];
  let current=[],start=0;
  function flush(){
    if(!current.length)return;
    words.push({start,end:runes.length,length:current.length,values:current.slice()});
    current=[];
  }
  for(const ch of [...source]){
    const v=runeIndex.get(ch);
    if(v!==undefined){
      if(!current.length)start=runes.length;
      current.push(v);runes.push(v);
    }else if(ch==="-"||ch===".")flush();
  }
  flush();
  return {runes,words};
}
function powMod(base,exponent,modulus){
  let out=1,factor=mod(base,modulus),e=exponent;
  while(e>0){if(e&1)out=out*factor%modulus;factor=factor*factor%modulus;e=Math.floor(e/2);}
  return out;
}
function inverseMod(value,modulus){
  for(let x=1;x<modulus;x++)if(value*x%modulus===1)return x;
  throw new Error("no modular inverse");
}
function H(x,y){return [mod(x-y),mod(x+y)];}
function base29Integer(values){return values.reduce((n,x)=>n*29n+BigInt(x),0n);}
function primes(count){
  const out=[];
  for(let n=2;out.length<count;n++){
    let ok=true;for(let d=2;d*d<=n;d++)if(n%d===0){ok=false;break;}
    if(ok)out.push(n);
  }
  return out;
}
function ioc(values){
  const f=Array(29).fill(0);values.forEach(x=>f[x]++);
  return f.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
}
function trigramScorer(source){
  const bi=new Map(),tri=new Map();
  for(let i=2;i<source.length;i++){
    const b=source[i-2]*29+source[i-1],t=b*29+source[i];
    bi.set(b,(bi.get(b)||0)+1);tri.set(t,(tri.get(t)||0)+1);
  }
  return text=>{
    let log=0;
    for(let i=2;i<text.length;i++){
      const b=text[i-2]*29+text[i-1];
      log+=Math.log((1+(tri.get(b*29+text[i])||0))/(29+(bi.get(b)||0)));
    }
    return log/(text.length-2);
  };
}
function main(){
  const line6=[...parts[28].trim().split("/")[5]]
    .filter(ch=>runeSet.has(ch)).map(ch=>runeIndex.get(ch));
  assert.equal(line6.length,23);
  assert.deepEqual(line6.slice(0,2),[23,8]);
  const [b,K]=H(line6[0],line6[1]);
  assert.deepEqual([b,K],[15,2]);
  const p28=parsePhysicalPage(28),g=p28.words[27].length,a=6,p=23;
  const A=powMod(g,a,p),B=powMod(g,b,p),shared=powMod(B,a,p),e=inverseMod(b,p-1);
  assert.deepEqual({p,g,a,b,A,B,K:shared,e},{p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3});

  const p15=parsePhysicalPage(15),p53=parsePhysicalPage(53);
  assert.equal(p15.runes.length,159);assert.equal(p53.runes.length,179);
  const cipher=p15.runes.slice(23,74),key=p53.runes.slice(128,179);
  assert.equal(cipher.length,51);assert.equal(key.length,51);
  const annotation=ink.pages.find(x=>x.page===53);
  assert.deepEqual(annotation.red_spans.map(x=>[x.start,x.length]),[[128,51]]);
  assert.deepEqual([...annotation.red_spans[0].runes].map(ch=>runeIndex.get(ch)),key);
  assert.deepEqual(p53.words.filter(w=>w.start>=128&&w.end<=179).map(w=>w.length),[5,4,4,11,2,3,2,6,5,5,2,2]);
  assert.deepEqual([p15.words.find(w=>w.start<=23&&23<w.end).start,p15.words.find(w=>w.start<=73&&73<w.end).end],[20,76]);

  const modulus=179n*179n;
  assert.equal(base29Integer(cipher)%modulus,29535n);
  assert.equal(base29Integer(key)%modulus,29535n);

  const historicalKey=historical.encodeGP("WELCOME PILGRIM TO THE GREAT");
  const onion="ᚦᛗᛞᛇᚠᛗᚪᚱ5ᚢᚫᛝᚱᛝ3 ᛠᛗᛇᚠᛡ";
  const onionOut=historical.historicalOnionInverse(onion,historicalKey);
  assert.equal(onionOut,"AUOWYFGL5LCSFJ3 NONIAN");

  const minus=cipher.map((c,i)=>mod(c-key[i]));
  const plus=cipher.map((c,i)=>mod(c+key[i]));
  assert.deepEqual(minus.map((x,i)=>mod(x+key[i])),cipher);
  assert.deepEqual(plus.map((x,i)=>mod(x-key[i])),cipher);

  const training=historical.encodeGP(reference.replace(/^#.*$/gm,""));
  const score=trigramScorer(training);
  const p56Cipher=corpus.pages.find(x=>x.page===56).indices;
  const prime=primes(90);let primePosition=0;
  const p56Plain=p56Cipher.map((c,i)=>i===56?0:mod(c-(prime[primePosition++]-1)));
  const p57=corpus.pages.find(x=>x.page===57).indices;
  const scores={
    p15Cipher:score(cipher),p53RedKey:score(key),
    CminusK:score(minus),CplusK:score(plus),
    p56KnownPlain:score(p56Plain),p57Clear:score(p57)
  };
  const indices={cipher,key,CminusK:minus,CplusK:plus};
  const print=x=>x.map(i=>corpus.translit[i]).join("");
  const result={
    classification:"bounded negative; the 179-adic fingerprint is structural, not a direct pad",
    selector:{dh23:{p,g,a,b,A,B,K:shared,e},p15:{page:15,start:23,length:51},p53:{page:53,start:128,length:51}},
    sourceNativePositiveControl:{keyPhrase:"WELCOME PILGRIM TO THE GREAT",onionOut},
    outputs:Object.fromEntries(Object.entries(indices).map(([k,v])=>[k,print(v)])),
    scores,ioc:Object.fromEntries(Object.entries(indices).map(([k,v])=>[k,ioc(v)])),
    nativeControls:{p56Length:p56Plain.length,p57Length:p57.length},
    reencryptsExactly:true
  };
  assert(Math.abs(scores.p15Cipher-(-3.4487730163544015))<1e-9);
  assert(Math.abs(scores.CminusK-(-3.4476378338252123))<1e-9);
  assert(Math.abs(scores.CplusK-(-3.4432528541138767))<1e-9);
  assert(Math.abs(scores.p56KnownPlain-(-2.4361899127543354))<1e-9);
  assert(Math.abs(scores.p57Clear-(-2.485745912452336))<1e-9);
  console.log(JSON.stringify(result,null,2));
}
if(require.main===module)main();
module.exports={main};
