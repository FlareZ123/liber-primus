"use strict";
/**
 * Lossless, fully invertible four-marker GP29 step cipher motivated by the
 * source-native EA, S, L, and E frequencies and original local echoes.
 *
 * A page's initial rune is additively keyed modulo29. Later positions encode
 * GP-EA as a zero output difference; for word-local j>=5, GP-L or GP-E
 * (depending on whether C[j-5]=S) is reserved to repeat C[j-5]; for j>=6
 * GP-S is reserved to emit T(C[j-6])=(24-2*C[j-6]) mod29. When an attempted
 * difference was used by an earlier reserved symbol, choose the first unused
 * power of source-derived root 15 in F29. Remaining plaintexts and differences
 * have a keyed cyclic bijection, using the 225 source-red-rune sequence.
 *
 * This is a POST-SELECTED candidate mechanism. An exact original round trip
 * holds for ANY correct inverse key and is not a decryption claim. Compare
 * first-half fitted key schedules on untouched pages and source-native
 * positive controls; compare five original motifs with complete forward
 * simulations. No unknown original plaintext is asserted.
 *
 * Run: node sims/contextual_marker29_reversible.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");
const ROOT=path.join(__dirname,".."),read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const runeMap=new Map(corpus.runes.map((r,i)=>[r,i]));
const words=parseSharedCorpus().words.map(w=>[...w.runes].map(r=>runeMap.get(r)));
const original=words.flat(),N=original.length;
assert.equal(N,12956);assert.equal(words.length,2896);
const red=ink.pages.flatMap(page=>(page.red_spans||[])
  .flatMap(span=>[...span.runes].map(r=>runeMap.get(r))));
assert.equal(red.length,225);
const pageInfo=corpus.pages.filter(p=>p.page<56&&p.indices.length);
assert.equal(pageInfo.length,55);
const wordLocal=new Uint8Array(N),wordIndex=new Uint16Array(N);
const pageLocal=new Uint16Array(N),pageIndex=new Uint8Array(N);
const initial=new Uint8Array(N),wordLength=new Uint8Array(N);
let pos=0;
for(let wi=0;wi<words.length;wi++)
  for(let j=0;j<words[wi].length;j++,pos++){
    wordLocal[pos]=j;wordIndex[pos]=wi;wordLength[pos]=words[wi].length;
  }
assert.equal(pos,N);
pos=0;
for(const page of pageInfo)
  for(let j=0;j<page.indices.length;j++,pos++){
    pageLocal[pos]=j;pageIndex[pos]=page.page;initial[pos]=Number(j===0);
  }
assert.equal(pos,N);assert.deepEqual(original,pageInfo.flatMap(p=>p.indices));
const powers=[],log=new Int8Array(29).fill(-1);
for(let i=0,x=1;i<28;i++,x=15*x%29){
  assert.equal(log[x],-1);
  powers.push(x);log[x]=i;
}
assert.equal(new Set(powers).size,28);
const translit=new Map(corpus.translit.map((s,i)=>[s,i]));
const native=read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split(/\r?\n/u).filter(line=>{
    const s=line.trim();
    return !s.startsWith("#")&&!s.startsWith("[")
      && !/^[0-9a-f]{25,}$/iu.test(s);
  }).join(" ");
/** @returns {number[]} */
function nativeLetters(){
  const letters=[];
  for(const word of native.match(/[A-Za-z]+/gu)||[]){
    const s=word.toUpperCase().replace(/QU/g,"CW")
      .replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
    for(let i=0;i<s.length;){
      const digraph=translit.get(s.slice(i,i+2));
      if(digraph!==undefined){letters.push(digraph);i+=2;}
      else{
        const symbol=translit.get(s[i]);
        assert.notEqual(symbol,undefined);
        letters.push(symbol);i++;
      }
    }
  }
  return letters;
}
const reference=nativeLetters();
assert.equal(reference.length,3248);
const letterCount=new Uint32Array(29);
for(const x of reference)letterCount[x]++;
const prior=Array.from(letterCount,x=>
  Math.log((x+1)/(reference.length+29)));
const mod=(n,m)=>((n%m)+m)%m;
const T=x=>mod(24-2*x,29);
/**
 * Given preceding ciphertext (all from the same published document),
 * construct a COMPLETE 29->29 difference alphabet for source index i.
 * The special symbols are prioritized EA, then contextual E/L, then S.
 * @param {ArrayLike<number>} ciphertext
 * @param {number} i Original-global rune offset, not word ordinal.
 */
function alphabet(ciphertext,i){
  assert.equal(initial[i],0);
  const reserved=new Map([[28,0]]),used=new Set([0]);
  /** @param {number} symbol @param {number} delta */
  function add(symbol,delta){
    if(used.has(delta))delta=powers.find(x=>!used.has(x));
    assert.notEqual(delta,undefined);
    assert.ok(!reserved.has(symbol));
    used.add(delta);reserved.set(symbol,delta);
  }
  const prev=ciphertext[i-1],j=wordLocal[i];
  if(j>=5)
    add(ciphertext[i-5]===15?18:20,mod(ciphertext[i-5]-prev,29));
  if(j>=6)
    add(15,mod(T(ciphertext[i-6])-prev,29));
  const freeSymbols=Array.from({length:28},(_,x)=>x)
    .filter(x=>!reserved.has(x));
  const freeDeltas=powers.filter(x=>!used.has(x));
  assert.equal(freeSymbols.length,freeDeltas.length);
  assert.equal(reserved.size+freeSymbols.length,29);
  return {reserved,freeSymbols,freeDeltas};
}
/** @param {number} i @param {string} clock */
function clockAt(i,clock){
  if(clock==="global")return i;
  if(clock==="page")return pageLocal[i];
  if(clock==="word")return wordIndex[i];
  if(clock==="wordpos")return wordLocal[i];
  throw Error("Unknown clock "+clock);
}
/** @param {number[]} seq @param {string} repr @param {boolean} reverse */
function keySource(seq,repr,reverse){
  return seq.map((_,i)=>{
    const val=seq[reverse?seq.length-1-i:i];
    return repr==="prime"?corpus.prime[val]:val;
  });
}
/**
 * @typedef {{repr:"index"|"prime",reverse:boolean,clock:string,sign:number,phase:number}} Key
 * @param {number} i
 * @param {Key} key
 * @param {number[]} seq
 */
function keyAt(i,key,seq){
  return key.sign*seq[(clockAt(i,key.clock)+key.phase)%seq.length];
}
/**
 * Reversible encoder with page-initial special processing.
 * @param {ArrayLike<number>} plain
 * @param {Key} key
 * @param {number[]} seq
 */
function encrypt(plain,key,seq){
  assert.equal(plain.length,N);
  const out=new Uint8Array(N);
  for(let i=0;i<N;i++){
    const p=plain[i],k=keyAt(i,key,seq);
    if(initial[i]){out[i]=mod(p+k,29);continue;}
    const a=alphabet(out,i);
    let d=a.reserved.get(p);
    if(d===undefined){
      const rank=a.freeSymbols.indexOf(p);
      assert.ok(rank>=0);
      d=a.freeDeltas[mod(rank+k,a.freeDeltas.length)];
    }
    out[i]=mod(out[i-1]+d,29);
  }
  return out;
}
/**
 * Exact inverse of the complete forward algorithm, even at page first runes.
 * @param {ArrayLike<number>} cipher
 * @param {Key} key
 * @param {number[]} seq
 */
function decrypt(cipher,key,seq){
  assert.equal(cipher.length,N);
  const out=new Uint8Array(N);
  for(let i=0;i<N;i++){
    const k=keyAt(i,key,seq);
    if(initial[i]){out[i]=mod(cipher[i]-k,29);continue;}
    const a=alphabet(cipher,i),delta=mod(cipher[i]-cipher[i-1],29);
    let found=false;
    for(const [p,d] of a.reserved)
      if(delta===d){out[i]=p;found=true;break;}
    if(!found){
      const rank=a.freeDeltas.indexOf(delta);
      assert.ok(rank>=0);
      out[i]=a.freeSymbols[mod(rank-k,a.freeSymbols.length)];
    }
  }
  return out;
}
const sources=[];
for(const repr of ["index","prime"])
  for(const reverse of [false,true])
    sources.push({repr,reverse,seq:keySource(red,repr,reverse)});
const keys=[];
for(const {repr,reverse} of sources)
  for(const clock of ["global","page","word","wordpos"])
    for(const sign of [1,-1])
      keys.push({repr,reverse,clock,sign});
/**
 * Cache the original ciphertext's unkeyed inverse for all 29-symbol
 * contexts. Reserved anchors are excluded from the language key fit.
 */
function originalRecords(){
  const records=[],fixed=new Uint32Array(29);
  for(let i=0;i<N;i++){
    if(initial[i]){
      records.push({i,first:true,rank:original[i],
        radix:29,symbols:null});
      continue;
    }
    const a=alphabet(original,i),delta=mod(original[i]-original[i-1],29);
    let special=-1;
    for(const [p,d] of a.reserved)if(delta===d){special=p;break;}
    if(special>=0){fixed[special]++;continue;}
    const rank=a.freeDeltas.indexOf(delta);
    assert.ok(rank>=0);
    records.push({i,first:false,rank,radix:a.freeDeltas.length,
      symbols:a.freeSymbols});
  }
  return {records,fixed};
}
/** @param {number} [seed] */
function random32(seed=0x15807922){
  let s=seed>>>0;
  return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};
}
/** @param {ArrayLike<number>} ciphertext */
function motifs(ciphertext){
  let equal=0,t6=0,s5=0,lag5=0,pairs=0;
  for(let i=0;i<N;i++){
    if(!initial[i]&&ciphertext[i]===ciphertext[i-1])equal++;
    const j=wordLocal[i];
    if(j>=5){
      lag5+=Number(ciphertext[i]===ciphertext[i-5]);
      s5+=Number(ciphertext[i]===15&&ciphertext[i-5]===15);
    }
    if(j>=6){
      t6+=Number(ciphertext[i]===T(ciphertext[i-6]));
      pairs+=Number(ciphertext[i]===ciphertext[i-5]&&
        ciphertext[i-1]===ciphertext[i-6]);
    }
  }
  return {EA:equal,T6:t6,S5:s5,L5:lag5,pairs};
}
/** @param {number} [replicates=250] */
function run(replicates=250){
  const {records,fixed}=originalRecords(),result=[];
  const uniform=records.reduce((sum,r)=>{
    if(r.first)return sum+prior.reduce((a,b)=>a+b,0)/29;
    return sum+r.symbols.reduce((s,x)=>s+prior[x],0)/r.radix;
  },0)/records.length;
  for(const setting of keys){
    const source=sources.find(s=>s.repr===setting.repr&&
      s.reverse===setting.reverse).seq;
    let best=null;
    for(let phase=0;phase<225;phase++){
      let train=0,hold=0,nTrain=0,nHold=0;
      const key={...setting,phase};
      for(const r of records){
        const k=keyAt(r.i,key,source),p=r.first?
          mod(r.rank-k,29):
          r.symbols[mod(r.rank-k,r.radix)];
        if(pageIndex[r.i]<28){train+=prior[p];nTrain++;}
        else{hold+=prior[p];nHold++;}
      }
      const trainMean=train/nTrain;
      if(best===null||trainMean>best.trainPerRune)
        best={...key,trainPerRune:trainMean,
          holdoutPerRune:hold/nHold,trainN:nTrain,holdoutN:nHold};
    }
    result.push(best);
  }
  result.sort((a,b)=>b.trainPerRune-a.trainPerRune);
  const winner=result[0],seq=sources.find(s=>s.repr===winner.repr&&
    s.reverse===winner.reverse).seq;
  const decoded=decrypt(original,winner,seq);
  assert.deepEqual(Array.from(encrypt(decoded,winner,seq)),original);
  const originalFixed=Array.from(fixed,(count,i)=>({
    symbol:corpus.translit[i],index:i,count
  })).filter(x=>x.count);
  const observed=motifs(original),r=random32(),out=[];
  const trueKey={repr:"index",reverse:false,clock:"global",sign:1,phase:0};
  const knownSeq=sources.find(s=>s.repr==="index"&&!s.reverse).seq;
  for(let replicate=0;replicate<replicates;replicate++){
    const planted=new Uint8Array(N);
    for(const page of pageInfo){
      let at=pageInfo.slice(0,pageInfo.indexOf(page))
        .reduce((s,p)=>s+p.indices.length,0);
      const offset=r()%reference.length;
      for(let j=0;j<page.indices.length;j++)
        planted[at+j]=reference[(offset+j)%reference.length];
    }
    const cipher=encrypt(planted,trueKey,knownSeq);
    if(replicate===0){
      const inversion=decrypt(cipher,trueKey,knownSeq);
      assert.deepEqual(inversion,planted);
      assert.deepEqual(encrypt(inversion,trueKey,knownSeq),cipher);
    }
    out.push(motifs(cipher));
  }
  const summaries={};
  for(const metric of Object.keys(observed)){
    const all=out.map(x=>x[metric]).sort((a,b)=>a-b);
    const mean=all.reduce((s,x)=>s+x,0)/replicates;
    const greater=all.filter(x=>x>=observed[metric]).length;
    summaries[metric]={observed:observed[metric],plantMean:mean,
      plantMin:all[0],plantP05:all[Math.floor(.05*replicates)],
      plantP95:all[Math.floor(.95*replicates)],plantMax:all.at(-1),
      plantedUpperTail:(greater+1)/(replicates+1)};
  }
  return {
    model:"reversible 29-difference context-marker transducer",
    source:{runes:N,wholeWords:words.length,runePages:pageInfo.length,
      solvedNativeGP:reference.length,redSource:225},
    caveat:"Features and alphabet selected after observing original; all original plaintext is key-dependent, none independently validated.",
    benchmark:{trueKey,seed:"0x15807922",replicates,
      fullRecoveredRunes:N,roundtripExact:true,motifs:summaries},
    sourceKeySearch:{schedules:keys.length*225,trainPages:"0..27",
      untouchedPages:"28..55",freeOriginalRunes:records.length,
      reservedByObserved:originalFixed,uniformExpected:uniform,
      trainedBest:winner,
      bestHoldoutAmongTrainSelected:result.slice().sort(
        (a,b)=>b.holdoutPerRune-a.holdoutPerRune)[0],
      originalExactReEncryption:true,topByTraining:result.slice(0,5)}
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={alphabet,encrypt,decrypt,motifs,run};
