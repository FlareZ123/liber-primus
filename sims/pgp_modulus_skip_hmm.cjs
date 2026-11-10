"use strict";
/**
 * Original-source RSA modulus keystream with constrained soft doublet rejection.
 * Each hidden extra keystream draw must have generated the previous ciphertext
 * rune from the SAME plaintext rune; this gives an exact, key-dependent skip
 * condition independent of candidate language. A native-GP plant challenges the
 * beam search's sensitivity before interpreting original ciphertext.
 *
 * Run: node sims/pgp_modulus_skip_hmm.cjs
 * Node.js 22, CommonJS, no external packages.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {modularStream}=require("./cicada_pgp_modulus_square_inverse.cjs");
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,"..",
  "resources/liber-primus/lp2-corpus.json"),"utf8"));
const text=fs.readFileSync(path.join(__dirname,"..",
  "resources/control/shakespeare_first300k.txt"),"utf8");

const alphabet=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
const native=[];
for(let word of (text.toUpperCase().match(/[A-Z]+/g)||[])) {
  word=word.replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG");
  const vals=[];
  for(let j=0;j<word.length;) {
    const v=alphabet.find(x=>word.startsWith(x.s,j));
    if(!v){vals.length=0;break;}
    vals.push(v.i);j+=v.s.length;
  }
  native.push(...vals);
}
assert.ok(native.length>25000);
const raw=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
assert.equal(raw.length,12956);
const SIZE=2048, PAD=2450, WIDTH=384;
// Exact source text segment used as a planted control is excluded from LM training.
const training=native.slice(7000);
const lp1source=fs.readFileSync(path.join(__dirname,"..",
  "resources/liber-primus/lp1-plaintext-reference.txt"),"utf8")
  .split(/\r?\n/).filter(x=>!x.startsWith("#")).join(" ");
const lp1=[];
for(let word of (lp1source.toUpperCase().match(/[A-Z]+/g)||[])){
  word=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C")
    .replace(/Z/g,"S").replace(/ING/g,"NG");
  const vals=[];
  for(let j=0;j<word.length;){
    const token=alphabet.find(x=>word.startsWith(x.s,j));
    if(!token){vals.length=0;break;}
    vals.push(token.i);j+=token.s.length;
  }
  lp1.push(...vals);
}
assert.ok(lp1.length>=SIZE);
const cipher=raw.slice(0,SIZE),plantNative=native.slice(3000,3000+SIZE);
const AL=29, A2=AL*AL, A3=A2*AL, SMOOTH=0.2;
const one=new Uint32Array(AL),two=new Uint32Array(A2),three=new Uint32Array(A3);
for(let i=0;i<training.length;i++) {
  one[training[i]]++;
  if(i>=1)two[training[i-1]*AL+training[i]]++;
  if(i>=2)three[(training[i-2]*AL+training[i-1])*AL+training[i]]++;
}
const log1=Array.from(one,v=>Math.log((v+SMOOTH)/(training.length+AL*SMOOTH)));
const log2=Array.from({length:A2},(_,i)=>{
  const a=Math.floor(i/AL);
  return Math.log((two[i]+SMOOTH)/(one[a]+AL*SMOOTH));
});
const log3=Array.from({length:A3},(_,i)=>{
  const b=Math.floor(i/AL);
  return Math.log((three[i]+SMOOTH)/(two[b]+AL*SMOOTH));
});
const mod=n=>(n%AL+AL)%AL;
/** @param {number} a @param {number} b @param {number} c */
function language(a,b,c) {
  if(b<0)return log1[c];
  if(a<0)return log2[b*AL+c];
  return log3[(a*AL+b)*AL+c];
}

/** Deterministic independent synthetic anti-repeat coin for reproducibility. */
function coin() {
  let s=0x7e6c2b9f>>>0;
  return ()=>{
    s^=s<<13;s^=s>>>17;s^=s<<5;
    return (s>>>0)/4294967296;
  };
}
/** @param {number[]} plaintext @param {number[]} pad @param {number} sign */
function encryptSoft(plaintext,pad,sign) {
  const draw=coin(),ciphertext=[];
  let t=0,rejected=0;
  for(let i=0;i<plaintext.length;i++) {
    let c;
    do {
      assert.ok(t<pad.length);
      c=mod(plaintext[i]+sign*pad[t++]);
      if(i>0&&c===ciphertext[i-1]&&draw()<0.82) {
        rejected++;continue;
      }
      break;
    }while(true);
    ciphertext.push(c);
  }
  return {ciphertext,rejected,drawn:t};
}

/** @param {number[]} ciphertext
 * @param {number[]} pad
 * @param {number} sign
 * @param {number} beamWidth
 * @returns {object} Full Viterbi recovery with provenance about each skipped keystream draw.
 */
function decode(ciphertext,pad,sign,beamWidth) {
  let beam=[{t:0,a:-1,b:-1,v:-1,total:0,skips:0,parent:null}];
  let candidateCount=0;
  for(let i=0;i<ciphertext.length;i++){
    const C=ciphertext[i],Cprev=i?ciphertext[i-1]:-1;
    const candidates=new Map();
    const push=(state,p,t,skip,logChoice)=>{
      const score=state.total+language(state.a,state.b,p)+logChoice;
      const entry={t,a:state.b,b:p,v:p,total:score,skips:state.skips+skip,
        parent:state};
      const id=t*A2+(state.b+1)*AL+p;
      const old=candidates.get(id);
      if(!old||old.total<score)candidates.set(id,entry);
      candidateCount++;
    };
    for(const state of beam) {
      const t=state.t;
      if(t>=pad.length)continue;
      const zero=mod(C-sign*pad[t]);
      // If the output equals the previous accepted ciphertext, the
      // source-visible soft filter must have allowed that doublet.
      push(state,zero,t+1,0,C===Cprev?Math.log(0.18):0);
      // One hidden rejected draw is only possible when its tentative
      // ciphertext is exactly the previous accepted output.
      if(i>0 && C!==Cprev) {
        for(let skip=1;skip<=3 && t+skip<pad.length;skip++) {
          const p=mod(C-sign*pad[t+skip]);
          let valid=true;
          for(let j=0;j<skip;j++)if(mod(p+sign*pad[t+j])!==Cprev){
            valid=false;break;
          }
          if(valid)push(state,p,t+skip+1,skip,skip*Math.log(0.82));
        }
      }
    }
    beam=Array.from(candidates.values()).sort((x,y)=>y.total-x.total)
      .slice(0,beamWidth);
    assert.ok(beam.length>0);
  }
  const best=beam[0];
  const decoded=[];
  for(let p=best;p.parent;p=p.parent)decoded.push(p.v);
  decoded.reverse();
  assert.equal(decoded.length,ciphertext.length);
  return {decoded,meanScore:best.total/decoded.length,
    skips:best.skips,finalClock:best.t,candidatesConsidered:candidateCount,
    prefix:decoded.slice(0,72).map(v=>corpus.translit[v]).join("")};
}
function result() {
  const treatments=[
    ["3301-byte-plus",3301n,"byte",1],
    ["3301-byte-minus",3301n,"byte",-1],
    ["3301-bits-plus",3301n,"eightbits",1],
    ["3301-bits-minus",3301n,"eightbits",-1],
    ["signer-byte-plus",0x7A35090Fn,"byte",1],
    ["signer-byte-minus",0x7A35090Fn,"byte",-1],
    ["signer-bits-plus",0x7A35090Fn,"eightbits",1],
    ["signer-bits-minus",0x7A35090Fn,"eightbits",-1]
  ];
  const rows=[];
  let truePlant,lp1Plant;
  for(const [name,seed,sample,sign] of treatments){
    const pad=modularStream(seed,[PAD],sample,0).map(v=>v%AL);
    const orig=decode(cipher,pad,sign,WIDTH);
    rows.push({name,meanGPTrigram:orig.meanScore,skips:orig.skips,
      clock:orig.finalClock,preview:orig.prefix});
    if(name==="3301-byte-plus") {
      const encrypted=encryptSoft(plantNative,pad,sign);
      const predicted=decode(encrypted.ciphertext,pad,sign,WIDTH);
      const accuracy=predicted.decoded.filter((v,i)=>v===plantNative[i]).length;
      const solvedCipher=encryptSoft(lp1.slice(0,SIZE),pad,sign);
      const solvedRecovered=decode(solvedCipher.ciphertext,pad,sign,WIDTH);
      lp1Plant={sourceRunes:SIZE,actualSkipped:solvedCipher.rejected,
        decodedSkipped:solvedRecovered.skips,
        exactRecovered:solvedRecovered.decoded.filter((v,i)=>v===lp1[i]).length,
        originalPrefix:lp1.slice(0,72).map(v=>corpus.translit[v]).join(""),
        recoveredPrefix:solvedRecovered.prefix,
        viterbiMean:solvedRecovered.meanScore};
      truePlant={name,sourceRunes:SIZE,actualSkipped:encrypted.rejected,
        actualFinalClock:encrypted.drawn,viterbiSkipped:predicted.skips,
        accuracy,accuracyFraction:accuracy/SIZE,
        trueGPTrigramMean:plantNative.reduce((sum,v,i)=>
          sum+language(i>1?plantNative[i-2]:-1,
            i?plantNative[i-1]:-1,v),0)/SIZE,
        ViterbiMean:predicted.meanScore,
        trueOriginalPrefix:plantNative.slice(0,72)
          .map(v=>corpus.translit[v]).join(""),
        recoveredPrefix:predicted.prefix};
    }
  }
  rows.sort((a,b)=>b.meanGPTrigram-a.meanGPTrigram);
  return {status:"source-key soft rejection HMM original challenge; outcome judged against planted recovery",
    corpusRunes:raw.length,window:SIZE,languageModel:"Shakespeare GP trigram alpha0.2",
    beamWidth:WIDTH,exactSkipGate:"rejected stream draw would emit preceding ciphertext from the same plaintext",
    sourceSeeds:["3301","0x7A35090F"],sampling:["low-byte","8-low-bits"],
    sign:[-1,1],restart:"single book",sourceNativePositive:truePlant,
    sourceSolvedLP1Positive:lp1Plant,trainingExcludeNativePlant:true,
    originalAll:rows};
}
if(require.main===module)console.log(JSON.stringify(result(),null,2));
module.exports={encryptSoft,decode,result};
