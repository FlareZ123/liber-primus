"use strict";
/**
 * Native GP29 integer rANS stream codec with 29-ary output digits, five-digit
 * terminal-state header and continuous state across all printed words.
 *
 * The first-order GP29 model is trained once from period-available English
 * control prose and is never fitted to original LP2 ciphertext. Fixed
 * word-length side information is supplied externally by original typography.
 * This deliberately tests unpadded, direct rANS. It does not claim an author-
 * selected LP2 normalization/header or an anti-repeat postcoder.
 *
 * Run on Windows 11:
 * node sims/lp2_wordcodec_real_rans_stream_original_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");
const root=path.resolve(__dirname,"..");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const index=new Map(gp.runes.map((r,i)=>[r,i]));
const source=parseSharedCorpus();
const original=source.words.map(w=>[...w.runes].map(x=>index.get(x)));
assert.equal(original.length,2896);
assert.equal(original.flat().length,12956);
const token=gp.translit.map((name,index)=>({name,index}))
  .sort((a,b)=>b.name.length-a.name.length);
/** @param {string} raw @returns {number[]} */
function nativeWord(raw){
  const s=raw.toUpperCase().replace(/QU/gu,"CW")
    .replace(/[KQ]/gu,"C").replace(/V/gu,"U")
    .replace(/Z/gu,"S").replace(/ING/gu,"NG").replace(/IO/gu,"IA");
  const out=[];
  for(let i=0;i<s.length;){
    const t=token.find(x=>s.startsWith(x.name,i));
    if(!t)return [];
    out.push(t.index);i+=t.name.length;
  }
  return out;
}
/** @param {string} name @returns {number[][]} */
function nativeCorpus(name){
  return (read(name).match(/[A-Za-z]+/gu)||[]).map(nativeWord)
    .filter(w=>w.length>0&&w.length<=14);
}
const gibran=nativeCorpus("resources/control/gibran_prophet_58585.txt");
const shakespeare=nativeCorpus("resources/control/shakespeare_first300k.txt");
const B=29,M=B*B,L=M*B*B,HEADER=5;
assert.equal(M,841);
assert.equal(L,707281);
assert.equal(B*L,B**5);

/**
 * Integer quantization to sum841, every symbol frequency >=1, largest
 * remainder redistribution, GP-ordinal tie break. 30 contexts: 29 rune
 * values and one word-start context.
 * @param {number[][]} corpus @returns {Array<{freq:number[],cum:number[]}>}
 */
function train(corpus){
  const counts=Array.from({length:30},()=>Array(29).fill(0));
  for(const w of corpus)for(let i=0;i<w.length;i++)
    counts[i===0?29:w[i-1]][w[i]]++;
  return counts.map(row=>{
    const total=row.reduce((x,y)=>x+y,0);
    let freq,frac;
    if(!total){freq=Array(29).fill(29);}
    else{
      freq=row.map(n=>1+Math.floor(812*n/total));
      frac=row.map((n,i)=>({i,v:812*n/total-Math.floor(812*n/total)}));
      frac.sort((a,b)=>b.v-a.v||a.i-b.i);
      let missing=M-freq.reduce((x,y)=>x+y,0);
      for(let i=0;i<missing;i++)freq[frac[i].i]++;
    }
    const cum=[],totalFreq=freq.reduce((x,f,i)=>(cum[i]=x,x+f),0);
    assert.equal(totalFreq,M);
    return {freq,cum};
  });
}
const gModel=train(gibran);
const sModel=train(shakespeare);
/** @param {number} state @returns {number[]} */
function header(state){
  const result=Array(HEADER);
  for(let i=HEADER-1;i>=0;i--){
    result[i]=state%B;state=Math.floor(state/B);
  }
  assert.equal(state,0);
  return result;
}
/**
 * Exact classic rANS normalized into [L,B*L), radix29.
 * Each table context is the original preceding PLAINTEXT rune within
 * the same word; encoding in reverse uses known forward contexts.
 * @param {number[][]} words
 * @param {ReturnType<typeof train>} model
 * @returns {number[]}
 */
function encode(words,model){
  const pairs=[];
  for(const w of words)for(let i=0;i<w.length;i++){
    const p=w[i],context=i?w[i-1]:29;
    assert(p>=0&&p<29&&Number.isInteger(p));
    pairs.push({p,context});
  }
  let x=L;const emitted=[];
  for(let i=pairs.length-1;i>=0;i--){
    const {p,context}=pairs[i];
    const {freq,cum}=model[context],f=freq[p];
    const limit=f*(L/M)*B;
    while(x>=limit){emitted.push(x%B);x=Math.floor(x/B);}
    x=Math.floor(x/f)*M+(x%f)+cum[p];
    assert(x>=L&&x<B*L);
  }
  return header(x).concat(emitted.reverse());
}
/**
 * @param {number[]} digits
 * @param {number[]} wordLengths
 * @param {ReturnType<typeof train>} model
 * @returns {{status:string,consumed:number,remaining:number,state:number,words:number[][],complete:boolean}}
 */
function decode(digits,wordLengths,model){
  assert(digits.every(x=>Number.isInteger(x)&&x>=0&&x<29));
  if(digits.length<HEADER)
    return {status:"short-header",consumed:0,remaining:digits.length,state:0,words:[],complete:false};
  let x=digits.slice(0,HEADER).reduce((v,d)=>B*v+d,0);
  if(x<L||x>=B*L)
    return {status:"out-of-range-header",consumed:HEADER,
      remaining:digits.length-HEADER,state:x,words:[],complete:false};
  let pos=HEADER;
  const words=[];
  for(const len of wordLengths){
    let prev=29,word=[];
    for(let j=0;j<len;j++){
      const {freq,cum}=model[prev];
      const residual=x%M;
      let p=0;
      while(p<29&&!(cum[p]<=residual&&residual<cum[p]+freq[p]))p++;
      assert(p<29);
      x=freq[p]*Math.floor(x/M)+residual-cum[p];
      while(x<L){
        if(pos>=digits.length)
          return {status:"input-exhausted",consumed:pos,remaining:0,
            state:x,words,complete:false};
        x=x*B+digits[pos++];
      }
      assert(x>=L&&x<B*L);
      word.push(p);prev=p;
    }
    words.push(word);
  }
  return {status:"decoded-length-contract",consumed:pos,
    remaining:digits.length-pos,state:x,words,
    complete:pos===digits.length&&x===L};
}
/** @param {number[][]} words @returns {number} */
function repeats(words){
  let out=0,previous=null;
  for(const word of words)for(const p of word){
    if(previous!==null)out+=Number(p===previous);
    previous=p;
  }
  return out;
}
/** @param {number[][]} words @returns {number} */
function normalizedIoC(words){
  const all=words.flat(),c=Array(29).fill(0);
  for(const p of all)c[p]++;
  return 29*c.reduce((s,n)=>s+n*(n-1),0)/(all.length*(all.length-1));
}
/** @param {number[][]} words @returns {number} */
function lexiconHits(words){
  const known=new Set(gibran.map(w=>w.join(",")));
  return words.filter(w=>known.has(w.join(","))).length;
}
const arbitrary=Array.from({length:14},(_,i)=>
  Array.from({length:i+1},(_,j)=>(5*i+13*j)%29));
const arbCipher=encode(arbitrary,gModel);
const arb=decode(arbCipher,arbitrary.map(w=>w.length),gModel);
assert.equal(arb.complete,true);
assert.deepEqual(arb.words,arbitrary);

// Exact-length native-GP positive for the full source word-length inventory.
let seed=3301;
const pools=Array.from({length:15},()=>[]);
for(const w of gibran)pools[w.length].push(w);
assert(pools.slice(1).every(w=>w.length>0));
const native=original.map(w=>{
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  const pool=pools[w.length];
  return pool[seed%pool.length];
});
const nativeCipher=encode(native,gModel);
const nativeDecoded=decode(nativeCipher,native.map(w=>w.length),gModel);
assert.equal(nativeDecoded.complete,true);
assert.deepEqual(nativeDecoded.words,native);
const wrong=decode(nativeCipher,native.map(w=>w.length),sModel);
assert(!wrong.complete||JSON.stringify(wrong.words)!==JSON.stringify(native));
const originalLengths=original.map(w=>w.length);
const originalFlat=original.flat();
const originalDecoded=decode(originalFlat,originalLengths,gModel);
function chapter(first,last){
  const positions=source.words.map((w,i)=>({w,i}))
    .filter(x=>x.w.startPage>=first&&x.w.startPage<=last).map(x=>x.i);
  const words=positions.map(i=>original[i]);
  const value=decode(words.flat(),words.map(w=>w.length),gModel);
  return {pages:[first,last],cipherRunes:words.flat().length,printedWords:words.length,
    status:value.status,consumed:value.consumed,unused:value.remaining,
    decodedWords:value.words.length,terminalState:value.state,
    complete:value.complete,
    decodedRunes:value.words.flat().length,
    normIoC:value.words.flat().length>1?normalizedIoC(value.words):null,
    gibranLexiconHits:lexiconHits(value.words),
    first12:value.words.slice(0,12).map(w=>w.map(x=>gp.translit[x]).join("")).join(" ")};
}
console.log(JSON.stringify({
  status:"PASS",
  classification:"bounded true base29 rANS original-input framing negative; no authenticated plaintext",
  architecture:{
    radix:29,totalFrequency:841,stateLowerBound:707281,
    headerRunes:5,plaintextContext:"preceding GP rune within each printed word",
    state:"continuously normalized across all printed words",
    boundaryChannel:"external fixed original printed word length inventory",
    escapeAndPadding:"none",plaintextAlphabet:"all 29 GP symbols",
    sourceSelector:"no historical clue specifies this code, model or 5-rune header"},
  positive:{arbitraryRuneRoundtrip:true,
    nativeGPRunes:native.flat().length,nativeWords:native.length,
    compressedDigits:nativeCipher.length,
    expectedOriginalCipherDigits:originalFlat.length,
    nativeCompressedRepeats:repeats([nativeCipher]),
    nativePlainIoC:normalizedIoC(native),
    wrongModelComplete:wrong.complete},
  original:{
    sameLengthRunes:originalFlat.length,
    usedDigits:originalDecoded.consumed,
    unusedDigits:originalDecoded.remaining,
    headerAndTerminalValid:originalDecoded.complete,
    status:originalDecoded.status,
    terminalState:originalDecoded.state,
    recoveredRunes:originalDecoded.words.flat().length,
    recoveredWordCount:originalDecoded.words.length,
    decodedCandidateIoC:originalDecoded.words.flat().length>1?
      normalizedIoC(originalDecoded.words):null,
    decodedCandidateLexiconHits:lexiconHits(originalDecoded.words),
    chapterP0to2:chapter(0,2),
    blindP3to7:chapter(3,7)
  }
},null,2));