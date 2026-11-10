"use strict";
/**
 * Integrated ORIGINAL LP2 inversion. A source-sensitive GP29 29-way output
 * permutation reserves EA zero-steps, conditional five-back echoes and
 * six-back affine echoes. The free-rune permutation is rotated by a delayed
 * plaintext-autokey a*P[i-delay]+b, with unknown initial plaintext set to
 * explicitly assumed zero. The complete original cipher has an exact inverse
 * and forward roundtrip for EACH key; readability on untouched runes is the
 * discriminant. All reserved rules are postselected hypotheses, not claims.
 * Scans original L=1..8, 28^2 coefficients with source-independent positive.
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const ROOT=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=gp.pages.filter(p=>p.page<56&&p.indices.length);
const original=pages.flatMap(p=>p.indices),N=original.length;
assert.equal(N,12956);
const rune=new Map(gp.runes.map((s,i)=>[s,i]));
const words=read("resources/lp2-transcription.txt")
  .split("%").slice(0,55).join("%").split(/[-.&$§]/u)
  .map(s=>[...s].filter(x=>rune.has(x)).map(x=>rune.get(x)))
  .filter(x=>x.length);
assert.equal(words.length,2896);
assert.deepEqual(words.flat(),original);
const wordOffset=new Uint8Array(N),pageInitial=new Uint8Array(N);
let at=0;
for(const word of words)for(let i=0;i<word.length;i++,at++)
  wordOffset[at]=i;
at=0;
for(const page of pages)for(let i=0;i<page.indices.length;i++,at++)
  pageInitial[at]=Number(i===0);
const trainCut=pages.slice(0,27).reduce((n,p)=>n+p.indices.length,0);
const tok=new Map(gp.translit.map((s,i)=>[s,i]));
function encode(text){
  const out=[];
  for(let word of text.toUpperCase().match(/[A-Z]+/g)||[]){
    word=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C")
      .replace(/Z/g,"S");
    for(let i=0;i<word.length;){
      const d=tok.get(word.slice(i,i+2));
      if(d!==undefined){out.push(d);i+=2;}
      else{const v=tok.get(word[i]);if(v!==undefined)out.push(v);i++;}
    }
  }
  return out;
}
const source=encode(read("resources/control/shakespeare_first300k.txt"));
assert.equal(source.length,218800);
const count=new Float64Array(29).fill(.5);
for(const p of source.slice(0,100000))count[p]++;
const tot=count.reduce((s,v)=>s+v,0),
  prior=Float64Array.from(count,v=>Math.log(29*v/tot));
const uniform=prior.reduce((s,v)=>s+v,0)/29;
const pow=[],mod=(x,m)=>(x%m+m)%m;
for(let i=0,x=1;i<28;i++,x=x*15%29)pow.push(x);
assert.equal(new Set(pow).size,28);
const T=x=>mod(24-2*x,29);
/**
 * Context-to-difference bijection. This reproduces the declared postselected
 * contextual-marker architecture, including deterministic collision fallback.
 * @param {ArrayLike<number>} cipher
 * @param {number} i
 */
function alphabet(cipher,i){
  const reserved=new Map([[28,0]]),used=new Set([0]);
  function add(p,d){
    if(used.has(d))d=pow.find(x=>!used.has(x));
    assert.notEqual(d,undefined);
    assert(!reserved.has(p));
    reserved.set(p,d);used.add(d);
  }
  const j=wordOffset[i],prev=cipher[i-1];
  if(j>=5)add(cipher[i-5]===15?18:20,
    mod(cipher[i-5]-prev,29));
  if(j>=6)add(15,mod(T(cipher[i-6])-prev,29));
  const freeP=Array.from({length:28},(_,k)=>k)
    .filter(p=>!reserved.has(p));
  const freeD=pow.filter(d=>!used.has(d));
  assert.equal(freeP.length,freeD.length);
  return {reserved,freeP,freeD};
}
/** @param {number[]} cipher */
function records(cipher){
  const out=[];
  for(let i=0;i<N;i++){
    if(pageInitial[i]){out.push({type:0,value:cipher[i]});continue;}
    const A=alphabet(cipher,i),
      delta=mod(cipher[i]-cipher[i-1],29);
    let special=-1;
    for(const [p,d] of A.reserved)if(d===delta)special=p;
    if(special>=0){out.push({type:1,value:special});continue;}
    const rank=A.freeD.indexOf(delta);
    assert(rank>=0);
    out.push({type:2,rank,freeP:A.freeP,radix:A.freeP.length,
      neutral:A.freeP.reduce((s,p)=>s+prior[p],0)/A.freeP.length});
  }
  return out;
}
/**
 * Exact original inverse for given key and a public initial-seed convention.
 * @param {ReturnType<typeof records>} recs
 * @param {number} delay @param {number} a @param {number} b
 */
function decode(recs,delay,a,b){
  const p=new Uint8Array(N);
  let train=0,held=0,ntrain=0,nheld=0;
  for(let i=0;i<N;i++){
    const r=recs[i],prev=i<delay?0:p[i-delay]%28,
      k=a*prev+b;
    if(r.type===0)p[i]=mod(r.value-k,29);
    else if(r.type===1)p[i]=r.value;
    else p[i]=r.freeP[mod(r.rank-k,r.radix)];
    if(r.type===1)continue;
    const gain=prior[p[i]]-(r.type===2?r.neutral:uniform);
    if(i<trainCut){train+=gain;ntrain++;}
    else{held+=gain;nheld++;}
  }
  return {p,train:train/ntrain,held:held/nheld,
    trainCount:ntrain,heldCount:nheld};
}
/**
 * Deterministic complete forward cipher for any original-layout GP text.
 * @param {number[]} p @param {number} delay
 * @param {number} a @param {number} b
 */
function encrypt(p,delay,a,b){
  assert.equal(p.length,N);
  const c=new Uint8Array(N);
  for(let i=0;i<N;i++){
    const prev=i<delay?0:p[i-delay]%28,k=a*prev+b;
    if(pageInitial[i]){c[i]=mod(p[i]+k,29);continue;}
    const A=alphabet(c,i);
    let d=A.reserved.get(p[i]);
    if(d===undefined){
      const rank=A.freeP.indexOf(p[i]);
      assert(rank>=0);
      d=A.freeD[mod(rank+k,A.freeD.length)];
    }
    c[i]=mod(c[i-1]+d,29);
  }
  return Array.from(c);
}
/** @param {ReturnType<typeof records>} recs */
function search(recs,delays){
  const rows=[];
  for(const delay of delays){
    let best={train:-Infinity};
    for(let a=0;a<28;a++)for(let b=0;b<28;b++){
      const r=decode(recs,delay,a,b);
      if(r.train>best.train)best={delay,a,b,train:r.train,
        held:r.held,trainCount:r.trainCount,heldCount:r.heldCount};
    }
    rows.push(best);
  }
  return rows;
}
/** Real source register N-gram scoring, independent of original selection. */
function trigramScore(p){
  const seq=source.slice(0,100000),
    tri=new Int32Array(29**3),bi=new Int32Array(29**2),
    uni=new Int32Array(29);
  for(let i=0;i<seq.length;i++){
    uni[seq[i]]++;
    if(i)bi[seq[i-1]*29+seq[i]]++;
    if(i>=2)tri[(seq[i-2]*29+seq[i-1])*29+seq[i]]++;
  }
  let score=0,n=0;
  for(let i=trainCut;i<p.length;i++){
    if(i<2)continue;
    const a=p[i-2],b=p[i-1],x=p[i];
    const ab=bi[a*29+b],bc=bi[b*29+x],b0=uni[b];
    const prob=.80*(tri[(a*29+b)*29+x]+.25)/(ab+7.25)
      +.20*(bc+.25)/(b0+7.25);
    score+=Math.log(prob);n++;
  }
  return score/n;
}
/**
 * Conditional GP trigram excess over the SAME context-specific free-rune
 * alphabet. This independent heldout discriminant uses none of the original
 * plaintext candidate letters to train its source model.
 * @param {Uint8Array} p
 * @param {ReturnType<typeof records>} recs
 */
function conditionalTrigramExcess(p,recs){
  const seq=source.slice(0,100000),
    tri=new Int32Array(29**3),bi=new Int32Array(29**2),
    unigram=new Int32Array(29);
  for(let i=0;i<seq.length;i++){
    unigram[seq[i]]++;
    if(i)bi[seq[i-1]*29+seq[i]]++;
    if(i>=2)tri[(seq[i-2]*29+seq[i-1])*29+seq[i]]++;
  }
  /** @param {number} a @param {number} b @param {number} x */
  function probability(a,b,x){
    return .8*(tri[(a*29+b)*29+x]+.25)/(bi[a*29+b]+7.25)
      +.2*(bi[b*29+x]+.25)/(unigram[b]+7.25);
  }
  const total=[0,0],count=[0,0];
  for(let i=2;i<N;i++){
    const r=recs[i];
    if(r.type!==2)continue;
    const x=p[i-2],y=p[i-1],z=p[i],group=i<trainCut?0:1;
    const baseline=r.freeP.reduce((s,v)=>
      s+Math.log(probability(x,y,v)),0)/r.freeP.length;
    total[group]+=Math.log(probability(x,y,z))-baseline;
    count[group]++;
  }
  return {train:total[0]/count[0],held:total[1]/count[1],
    trainRunes:count[0],heldRunes:count[1]};
}
const recs=records(original),delays=[1,2,3,4,5,6,7,8];
const ranks=search(recs,delays);
const selected=ranks.slice().sort((a,b)=>b.train-a.train);
const checked=selected.map(r=>{
  const inv=decode(recs,r.delay,r.a,r.b);
  assert.deepEqual(encrypt(Array.from(inv.p),r.delay,r.a,r.b),original);
  return {...r,heldTrigramLogProbability:trigramScore(inv.p),
    heldConditionalTrigramExcess:conditionalTrigramExcess(inv.p,recs),
    first60: Array.from(inv.p.slice(0,60)).map(x=>gp.translit[x]).join(" ")};
});
const trueDelay=6,trueA=7,trueB=11;
const controlP=source.slice(-N);
const controlC=encrypt(controlP,trueDelay,trueA,trueB);
const controlRec=records(controlC),positive=search(controlRec,[trueDelay])[0];
assert.deepEqual([positive.a,positive.b],[trueA,trueB]);
const recovered=decode(controlRec,trueDelay,trueA,trueB);
assert.deepEqual(Array.from(recovered.p),controlP);
assert.deepEqual(encrypt(Array.from(recovered.p),trueDelay,trueA,trueB),controlC);
console.log(JSON.stringify({
  model:"Postselected contextual 29-output marker bijection with delayed plaintext autokey",
  originalRunes:N,originalWords:words.length,sourceGP:source.length,
  trainCut,sourceRoot:15,gridKeyUsed:false,
  reserveClasses:["EA/no-difference","E-or-L/lag5","S/T6"],
  keyFamily:"8 delays x 28^2 two-coefficient plaintext feedback",
  originalByDelay:ranks,
  originalAllWithExactlyReencryption:checked,
  planted:{trueDelay,trueA,trueB,selected:positive,
    exactRecovered:N,heldTrigramLogProbability:trigramScore(recovered.p),
    heldConditionalTrigramExcess:conditionalTrigramExcess(recovered.p,controlRec)},
  conclusion:"Original heldout unigram gains are small and no authentic new LP2 plaintext is recovered."
},null,2));
