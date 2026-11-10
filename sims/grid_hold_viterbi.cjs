"use strict";
/**
 * LP2 256-byte grid: hidden hold-key repair decoder.
 *
 * Hypothesis: C=mod29(P+sign*K[j]); if a candidate C repeats the last
 * emitted C, a repair emits an alternative C uniformly from the other 28
 * symbols with probability q, consumes the plaintext rune, but HOLDS j.
 * Ordinary emissions spend one key symbol. Unlike the separate grid-keyskip
 * search, this mechanism loses one key advance at each repair.
 *
 * A Viterbi search marginalizes over the unknown locations in the sense of
 * maximizing the joint plaintext/repair-path likelihood, not summing paths.
 * State is (number of holds, last two plaintext runes). All candidates and
 * null tables use the same screen and selection process.
 * All findings are experimental; no plaintext claims without actual text.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {tableBytes} = require("./base60_seeded_stream.cjs");
const {encodeEnglish, seededRandom} = require("./outer_permutation_assignment.cjs");
const ROOT = path.join(__dirname, "..");
const M = 29;
const Q = 0.81;
const LOG_HOLD = Math.log(Q / 28);
const LOG_DUP = Math.log(1 - Q);

/** @param {number} x @returns {number} */
function mod29(x) {return (x % M + M) % M;}

/** @param {number[]} text @returns {{tri:Float64Array, bi:Float64Array, uni:Float64Array}} */
function train(text) {
  const uni = new Float64Array(M), bi = new Float64Array(M*M), tri = new Float64Array(M*M*M);
  for (let i = 0; i < text.length; i++) {
    const c = text[i]; uni[c]++;
    if (i > 0) bi[text[i-1]*M+c]++;
    if (i > 1) tri[(text[i-2]*M+text[i-1])*M+c]++;
  }
  const lnU = new Float64Array(M), lnB = new Float64Array(M*M), lnT = new Float64Array(M*M*M);
  for (let c=0;c<M;c++) lnU[c]=Math.log((uni[c]+0.25)/(text.length+0.25*M));
  for(let a=0;a<M;a++) {
    let n=0;
    for(let c=0;c<M;c++) n+=bi[a*M+c];
    for(let c=0;c<M;c++) lnB[a*M+c]=Math.log((bi[a*M+c]+0.25)/(n+0.25*M));
  }
  for(let a=0;a<M;a++)for(let b=0;b<M;b++) {
    let n=0;
    const base=(a*M+b)*M;
    for(let c=0;c<M;c++) n+=tri[base+c];
    for(let c=0;c<M;c++) lnT[base+c]=Math.log((tri[base+c]+0.25)/(n+0.25*M));
  }
  return {tri:lnT,bi:lnB,uni:lnU};
}

/** @param {{tri:Float64Array,bi:Float64Array,uni:Float64Array}} lm @param {number} a @param {number} b @param {number} c */
function wordLog(lm,a,b,c) {
  if (b===M) return lm.uni[c];
  if (a===M) return lm.bi[b*M+c];
  return lm.tri[(a*M+b)*M+c];
}

/**
 * Return maximum joint log-likelihood for one exact key and offset.
 * The historical orientation of the key must be independently supplied.
 * @param {number[]} c
 * @param {number[]} key - 256 integers, already reduced modulo 29
 * @param {number} offset
 * @param {1|-1} sign
 * @param {{tri:Float64Array,bi:Float64Array,uni:Float64Array}} lm
 * @param {number} maxHolds
 * @param {boolean} withTrace
 */
function logAdd(a,b) {
  if(a===-Infinity)return b;
  if(b>a){const tmp=a;a=b;b=tmp;}
  return a+Math.log1p(Math.exp(b-a));
}
function viterbi(c,key,offset,sign,lm,maxHolds,withTrace=false) {
  let states = new Map([[M*(M+1)+M, {h:0,a:M,b:M,s:0,w:0,trace:null}]]);
  let peakStates=1;
  for(let t=0;t<c.length;t++) {
    const current=c[t], prev=t?c[t-1]:-1;
    const next=new Map();
    for(const st of states.values()) {
      const ki=(offset+t-st.h+256*2)%256;
      const pNormal=mod29(current-sign*key[ki]);
      const logNormal=wordLog(lm,st.a,st.b,pNormal)+(current===prev?LOG_DUP:0);
      const ns=st.s+logNormal;
      const nf=st.w+logNormal;
      const normalCode=(st.h*M+st.b)*(M+1)+pNormal;
      const older=next.get(normalCode);
      if(!older)next.set(normalCode,{
        h:st.h,a:st.b,b:pNormal,s:ns,w:nf,
        trace:withTrace?{prev:st.trace,value:pNormal,held:false}:null
      });
      else {
        older.w=logAdd(older.w,nf);
        if(ns>older.s){
          older.s=ns;
          older.trace=withTrace?{prev:st.trace,value:pNormal,held:false}:null;
        }
      }
      if(t>0&&current!==prev&&st.h<maxHolds) {
        const pHold=mod29(prev-sign*key[ki]);
        const logHold=wordLog(lm,st.a,st.b,pHold)+LOG_HOLD;
        const hs=st.s+logHold, hf=st.w+logHold;
        const code=((st.h+1)*M+st.b)*(M+1)+pHold;
        const other=next.get(code);
        if(!other)next.set(code,{
          h:st.h+1,a:st.b,b:pHold,s:hs,w:hf,
          trace:withTrace?{prev:st.trace,value:pHold,held:true}:null
        });
        else {
          other.w=logAdd(other.w,hf);
          if(hs>other.s){
            other.s=hs;
            other.trace=withTrace?{prev:st.trace,value:pHold,held:true}:null;
          }
        }
      }
    }
    states=next;
    if(states.size>peakStates)peakStates=states.size;
  }
  let best=null,forwardScore=-Infinity;
  for(const state of states.values()){
    if(!best||state.s>best.s)best=state;
    forwardScore=logAdd(forwardScore,state.w);
  }
  const out={score:best.s,forwardScore,length:c.length,holds:best.h,peakStates};
  if(withTrace){
    const p=[],holds=[];let node=best.trace;
    while(node){p.push(node.value);holds.push(node.held);node=node.prev;}
    out.plaintext=p.reverse();out.holdFlags=holds.reverse();
  }
  return out;
}

/** @param {number[]} flat */
function orientations(flat){
  assert.equal(flat.length,256);
  const col=Array.from({length:256},(_,i)=>flat[(i%32)*8+Math.floor(i/32)]);
  return [flat,flat.slice().reverse(),col,col.slice().reverse()]
    .map(a=>a.map(x=>x%29));
}

/**
 * Two-stage search, both stages applied to real, null and positive data.
 * This reduces the computational cost but is not an exhaustive full-window
 * search, because only the highest-ranking early-prefix seeds survive.
 * @param {number[]} cipher
 * @param {number[]} bytes
 * @param {ReturnType<typeof train>} lm
 * @param {{early?:number,beam?:number,maxHolds?:number}} options
 */
function scan(cipher,bytes,lm,{early=72,beam=12,maxHolds=16}={}) {
  const keys=orientations(bytes);
  const finalists=[],earlyLength=Math.min(early,cipher.length);
  for(let o=0;o<4;o++)for(const sign of [-1,1]){
    const screen=[];
    for(let offset=0;offset<256;offset++){
      const fit=viterbi(cipher.slice(0,earlyLength),keys[o],offset,sign,lm,
        Math.min(maxHolds,Math.ceil(earlyLength*.16)));
      screen.push({orientation:o,sign,offset,earlyScore:fit.forwardScore});
    }
    screen.sort((a,b)=>b.earlyScore-a.earlyScore);
    finalists.push(...screen.slice(0,beam));
  }
  let best=null;
  for(const f of finalists) {
    const fit=viterbi(cipher,keys[f.orientation],f.offset,f.sign,lm,maxHolds);
    if(!best||fit.forwardScore>best.forwardScore)best={...f,...fit};
  }
  return {best,screened:4*2*256,finalists:finalists.length,
    early,beam,maxHolds};
}

/**
 * Synthesize a held-key, repeat-avoiding ciphertext under the exact model.
 * @param {number[]} plain
 * @param {number[]} key
 * @param {number} offset
 * @param {1|-1} sign
 * @param {number} seed
 */
function plant(plain,key,offset,sign,seed){
  const rand=seededRandom(seed);const c=[],holds=[];let j=0;
  for(const p of plain) {
    const base=mod29(p+sign*key[(offset+j)%256]);
    let value=base,hold=false;
    if(c.length&&base===c[c.length-1]&&rand()<Q) {
      value=mod29(base+1+Math.floor(rand()*28));hold=true;
    } else j++;
    c.push(value);holds.push(hold);
  }
  return {cipher:c,holds:holds.filter(Boolean).length,
    holdFlags:holds,spent:j};
}

/** @param {number[]} array @param {()=>number} random */
function shuffle(array,random) {
  const a=array.slice();
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function study({nullReps=20,seed=0x3301ab17}={}) {
  const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-corpus.json"),"utf8"));
  const raw=fs.readFileSync(path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8");
  const lm=train(encodeEnglish(raw));
  const bytes=Array.from(tableBytes());
  const ps=corpus.pages.filter(p=>p.status==="unsolved"&&p.indices.length);
  assert.equal(ps.length,55);
  assert.equal(ps.reduce((s,p)=>s+p.indices.length,0),12956);
  const target=ps.find(p=>p.page===0).indices;
  const controlText=fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp1-plaintext-reference.txt"),"utf8")
    .split("\n").filter(line=>!line.startsWith("#")&&!line.startsWith("###")).join(" ");
  const known=encodeEnglish(controlText);
  const reference=known.slice(120,120+target.length);
  assert.equal(reference.length,target.length);
  const key=orientations(bytes)[0],trueOffset=37;
  const control=plant(reference,key,trueOffset,1,seed^0x11112345);
  const plantFit=scan(control.cipher,bytes,lm);
  const decoded=viterbi(control.cipher,key,trueOffset,1,lm,16,true);
  const plantAccuracy=decoded.plaintext.filter((v,i)=>v===reference[i]).length/reference.length;
  const random=seededRandom(seed),observed=[];
  for(const pageId of [0,20,49,51,55]){
    const cipher=ps.find(p=>p.page===pageId).indices;
    const realFit=scan(cipher,bytes,lm,{maxHolds:Math.ceil(cipher.length*0.07)+6});
    const nullFits=[];
    for(let t=0;t<nullReps;t++)
      nullFits.push(scan(cipher,shuffle(bytes,random),lm,
        {maxHolds:Math.ceil(cipher.length*0.07)+6}).best);
    const nullScores=nullFits.map(s=>s.forwardScore);
    const mean=nullScores.reduce((a,b)=>a+b,0)/nullScores.length;
    const sd=Math.sqrt(nullScores.reduce((s,x)=>s+(x-mean)**2,0)/
      Math.max(1,nullScores.length-1));
    const upperTail=(1+nullScores.filter(s=>s>=realFit.best.forwardScore).length)/
      (nullReps+1);
    observed.push({page:pageId,length:cipher.length,
      model:realFit.best,relativePerRuneLogLikelihood:(realFit.best.forwardScore+Math.log(29)*cipher.length)/cipher.length,
      null:{replicates:nullReps,mean,sd,upperTail,
        min:Math.min(...nullScores),max:Math.max(...nullScores),
        holdsMean:nullFits.reduce((sum,x)=>sum+x.holds,0)/nullFits.length}});
  }
  return {model:"M04 repeat repair holds key index; exact forward path likelihood plus Viterbi traceback",
    q:Q,orientations:"actual base-60 table, four directions and two signs",
    screensPerPage:2048,perFamilyFinalists:12,seed,observed,
    positive:{seed:seed^0x11112345,trueOffset,
      trueSign:1,trueOrientation:0,holds:control.holds,
      globalFit:plantFit.best,correctModel:decoded.score,
      exactPlaintextAccuracyAtTrueParams:plantAccuracy,
      globallyRecovered:plantFit.best.offset===trueOffset&&
        plantFit.best.orientation===0&&plantFit.best.sign===1},
    limitations:"Top12 offsets per orientation selected from first72 runes; 29-rune Shakespeare language model; pagewise no external key derivation"};
}
if(require.main===module)console.log(JSON.stringify(study(),null,2));
module.exports={train,viterbi,scan,plant,study};
