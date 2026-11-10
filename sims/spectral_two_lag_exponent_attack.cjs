"use strict";

/**
 * Source-blind, two-lag finite-field spectral signature and inverse recovery.
 *
 * Suppose ciphertext increments are 0 for GP EA and otherwise
 *   log_15(C[i]-C[i-1] mod29) = P[i]+F(C[i-a])+G(C[i-b]) (mod28).
 * For Fourier harmonic h=11 (coprime to28), build each pair-lag's 29x29
 * complex moment matrix M[x,y]=sum exp(2*pi*i*h*log_15(delta)/28).
 * Under the stated additive lookup architecture M is approximately a
 * row/column phase-factorized signal with a large top singular value.
 *
 * Scan 1<=a<b<=64 and choose solely with training pages 0..27.
 * Report untouched heldout pages28..55; apply existing exact reversible
 * lookup-key learning only after choosing the lag pair.
 *
 * Node >=22, manual invocation, zero dependencies.
 */
const fs=require("node:fs");
const path=require("node:path");
const {encodeGP,sourceModel,train,decrypt,encrypt}=require("./exponent_feedback_lookup_attack.cjs");
const root=path.join(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length).map(p=>p.indices);
const control=fs.readFileSync(path.join(root,"resources/control/shakespeare_first300k.txt"),"utf8");
const english=encodeGP(control);
const logp=sourceModel(english).logp;
const power=[],log=new Int8Array(29).fill(-1);
for(let i=0,p=1;i<28;i++){power.push(p);log[p]=i;p=p*15%29;}
const harmonic=11,cos=[],sin=[];
for(let r=0;r<28;r++){
  cos.push(Math.cos(2*Math.PI*harmonic*r/28));
  sin.push(Math.sin(2*Math.PI*harmonic*r/28));
}
const mod28=n=>(n%28+28)%28;
/** @param {number} seed */
function rng(seed){
  let state=seed>>>0;
  return ()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;};
}
/**
 * Find largest singular value of complex 29x29 matrix through repeated
 * product M* M on a normalized complex vector. Zero-indexed row-major.
 * @param {Float64Array} mr
 * @param {Float64Array} mi
 */
function leadingSingular(mr,mi){
  const ur=new Float64Array(29).fill(1/Math.sqrt(29));
  const ui=new Float64Array(29);
  let sigma=0;
  for(let iteration=0;iteration<24;iteration++){
    const vr=new Float64Array(29),vi=new Float64Array(29);
    for(let i=0;i<29;i++)for(let j=0;j<29;j++){
      const k=i*29+j;
      vr[j]+=mr[k]*ur[i]+mi[k]*ui[i];
      vi[j]+=mr[k]*ui[i]-mi[k]*ur[i];
    }
    sigma=Math.sqrt(vr.reduce((s,v,j)=>s+v*v+vi[j]*vi[j],0));
    if(sigma===0)return 0;
    const nr=new Float64Array(29),ni=new Float64Array(29);
    for(let i=0;i<29;i++)for(let j=0;j<29;j++){
      const k=i*29+j;
      nr[i]+=mr[k]*vr[j]-mi[k]*vi[j];
      ni[i]+=mr[k]*vi[j]+mi[k]*vr[j];
    }
    const norm=Math.sqrt(nr.reduce((s,v,j)=>s+v*v+ni[j]*ni[j],0));
    if(norm===0)return 0;
    for(let i=0;i<29;i++){ur[i]=nr[i]/norm;ui[i]=ni[i]/norm;}
  }
  return sigma;
}
/**
 * @param {number[][]} sourcePages
 * @param {number} lagA
 * @param {number} lagB
 * @param {number} fromPage
 * @param {number} toPage
 */
function moment(sourcePages,lagA,lagB,fromPage,toPage){
  const mr=new Float64Array(29*29),mi=new Float64Array(29*29);
  let n=0;
  for(let p=fromPage;p<toPage;p++){
    const page=sourcePages[p];
    for(let i=Math.max(lagA,lagB);i<page.length;i++){
      const delta=(page[i]-page[i-1]+29)%29;
      if(delta===0)continue;
      const x=page[i-lagA]*29+page[i-lagB];
      const r=log[delta];
      mr[x]+=cos[r];
      mi[x]+=sin[r];
      n++;
    }
  }
  const sigma=leadingSingular(mr,mi);
  return {n,sigma,normalized:sigma/Math.sqrt(n)};
}
/**
 * @param {number[][]} sourcePages
 * @param {number} maxLag
 */
function scan(sourcePages,maxLag){
  const all=[];
  for(let a=1;a<=maxLag;a++)for(let b=a+1;b<=maxLag;b++){
    const tr=moment(sourcePages,a,b,0,28);
    all.push({a,b,...tr});
  }
  all.sort((x,y)=>y.normalized-x.normalized);
  const leader=all[0];
  const hold=moment(sourcePages,leader.a,leader.b,28,sourcePages.length);
  const top=all.slice(0,8).map(x=>({...x,
    hold:moment(sourcePages,x.a,x.b,28,sourcePages.length)}));
  return {leader,hold,top,numberOfPairs:all.length,
    original56:moment(sourcePages,5,6,0,28),
    original56Hold:moment(sourcePages,5,6,28,sourcePages.length)};
}
/**
 * @param {number[][]} sourcePages
 * @param {number} a
 * @param {number} b
 * @param {number} from
 * @param {number} to
 */
function feedbackRows(sourcePages,a,b,from,to){
  const out=[];
  for(let p=from;p<to;p++){
    const c=sourcePages[p];
    for(let i=Math.max(a,b);i<c.length;i++){
      const step=(c[i]-c[i-1]+29)%29;
      if(step)out.push([log[step],c[i-a],c[i-b]]);
    }
  }
  return out;
}
/** @param {number[][]} a @param {number[][]} b */
function matches(a,b){
  let equal=0,total=0;
  for(let i=0;i<a.length;i++)for(let j=0;j<a[i].length;j++){
    equal+=Number(a[i][j]===b[i][j]);total++;
  }
  return {equal,total};
}
function main(){
  const random=rng(0x725625);
  const secretF=Array.from({length:29},()=>random()%28);
  const secretG=Array.from({length:29},()=>random()%28);
  let pos=0;
  const trueP=pages.map(p=>p.map(()=>english[pos++%english.length]));
  const planted=encrypt(trueP,secretF,secretG);
  const original=scan(pages,64),positive=scan(planted,64);
  let recovered=null;
  if(positive.leader.a===5&&positive.leader.b===6){
    // Pair selected entirely from ciphertext moments and train pages.
    const rows=feedbackRows(planted,positive.leader.a,positive.leader.b,0,28);
    const trained=train(rows,logp,12,0x33012956);
    const decoded=decrypt(planted,trained.f,trained.g);
    recovered=matches(trueP.slice(28),decoded.slice(28));
  }
  const summarize=x=>({
    selected:{...x.leader,hold:x.hold},
    topFive:x.top.slice(0,5),pairs:x.numberOfPairs,
    originalLags56Train:x.original56,
    originalLags56Hold:x.original56Hold
  });
  const result={hypothesis:"source-blind two-lag rank-one F29 harmonic signature",
    FourierHarmonic:11,lagRange:[1,64],trainPages:28,
    nOriginal:pages.flat().length,
    original:summarize(original),
    plant:{plantedLags:[5,6],...summarize(positive),
      recoveredHeldoutPlaintext:recovered}};
  console.log(JSON.stringify(result,null,2));
  if(positive.leader.a!==5||positive.leader.b!==6)
    throw new Error("blind planted lag selection failed");
  if(!recovered||recovered.equal!==recovered.total)
    throw new Error("blind selected-lag key recovery failed");
}
if(require.main===module)main();
module.exports={leadingSingular,moment,scan,feedbackRows};
