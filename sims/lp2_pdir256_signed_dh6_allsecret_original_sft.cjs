"use strict";

/**
 * Original LP2 all-secret p50 cyclic-256 word-direction and signed-2013-DH
 * six-back affine-feedback necessary-condition test. Windows Node22.
 *
 * 66 source word-number direction rules × 2 signs × 18 h/m/c pointer
 * conventions × 2 deterministic equality clocks × three source-structural
 * lag-six resets = 14,256 original cipher receiver configurations.
 *
 * For original C_i with predecessor six C_early, form public register
 * D_i = C_i - (24 - 2*C_early) mod29; first six per scope are copied unchanged.
 * Per pointer phase allow ANY independent hidden 29-rune permutation.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeWords} = require("./lp2_difference_allletter_capacity_sft.cjs");
const {originalWords, direction, trace, RULES, GP, Q, N, KEY_STATES} =
  require("./lp2_pdir_cyclic256_allsecret_capacity_sft.cjs");

const ROOT = path.join(__dirname, "..");
const mod = (x,n) => ((x % n) + n) % n;
const T = (x) => mod(24 - 2*x,Q);

/** Source-ciphertext lag6 register: globally, by section, or by full word. */
function sixbackOriginalRegisters(sections) {
  const global=[],bySection=[],byWord=[];
  const all=sections.flatMap(s=>s.flatMap(w=>w.r));
  let globalPos=0;
  for(const section of sections) {
    const sec=section.flatMap(w=>w.r);
    let secPos=0;
    for(const {r} of section) {
      for(let i=0;i<r.length;i++) {
        const c=r[i];
        global.push(globalPos>=6 ? mod(c-T(all[globalPos-6]),Q) : c);
        bySection.push(secPos>=6 ? mod(c-T(sec[secPos-6]),Q) : c);
        byWord.push(i>=6 ? mod(c-T(r[i-6]),Q) : c);
        globalPos++;secPos++;
      }
    }
  }
  assert.equal(globalPos,N);
  return [global,bySection,byWord];
}

/** Sorted histogram exact GP29-IoC optimum over all 29!^256 permutations. */
function capacity(phases,data){
  const h=new Uint16Array(KEY_STATES*Q);
  for(let i=0;i<N;i++)h[phases[i]*Q+data[i]]++;
  const sum=new Uint32Array(Q);
  let top=0;
  for(let s=0;s<KEY_STATES;s++){
    const v=Array.from(h.subarray(s*Q,(s+1)*Q)).sort((a,b)=>b-a);
    top+=v[0];
    for(let j=0;j<Q;j++)sum[j]+=v[j];
  }
  assert.equal(sum.reduce((a,b)=>a+b,0),N);
  const num=sum.reduce((a,b)=>a+b*(b-1),0);
  return {numerator:num,ioc:num/(N*(N-1)),top};
}

/** Every sliding native 12956-rune control GP29 IoC minimum. */
function minIoC(data){
  const h=new Uint32Array(Q);
  let num=0,best=Infinity;
  for(let i=0;i<data.length;i++){
    num+=2*h[data[i]];h[data[i]]++;
    if(i>=N){h[data[i-N]]--;num-=2*h[data[i-N]];}
    if(i>=N-1)best=Math.min(best,num);
  }
  return best/(N*(N-1));
}

/**
 * Causal real-English original-length positive:
 * C_i = T(C_(i-6)) + GP_english_i + K[s_i] inside each printed word (i>=6),
 * and C_i = GP_english_i + K[s_i] at first six word positions. A_prev_G
 * direction uses the already-produced previous whole ciphertext word.
 */
function positive(template, english, cfg){
  const pools=new Map(),used=new Map();
  for(const w of english){
    if(!pools.has(w.length))pools.set(w.length,[]);
    pools.get(w.length).push(w);
  }
  const plain=template.map(section=>section.map(record=>{
    const p=pools.get(record.n);assert.ok(p?.length);
    const k=used.get(record.n)||0;used.set(record.n,k+1);
    return p[k%p.length];
  }));
  const key=Array.from({length:256},(_,i)=>(7*i+11)%29);
  let prev=-1;
  const cipher=plain.map(section=>{
    let ptr=0,old=null,lastBackward=prev,lastSum=0;
    return section.map((w,wi)=>{
      const dir=(wi===0||lastSum%2===0?1:-1)*(cfg.flip?-1:1);
      if(old!==null)ptr+=cfg.m===0?0:cfg.m===1?old:dir;
      if(dir<0&&cfg.h)ptr--;
      const r=[];
      for(let j=0;j<w.length;j++){
        const past=j>=6?T(r[j-6]):0;
        const c=mod(past+w[j]+key[mod(ptr,256)],29);
        const comparator=dir>0||cfg.c===0?prev:cfg.c===1?(j===0?-1:prev):lastBackward;
        ptr+=dir*(cfg.skip&&c===comparator&&comparator>=0?2:1);
        if(dir<0)lastBackward=c;
        prev=c;r.push(c);
      }
      lastSum=r.reduce((sum,c)=>sum+GP.prime[c],0);
      old=dir;
      return r;
    });
  });
  const enc=template.map((sec,i)=>sec.map((word,j)=>{
    const r=cipher[i][j];return {...word,r,G:r.reduce((s,c)=>s+GP.prime[c],0)};
  }));
  const dirs=enc.map(sec=>sec.map((_,i)=>direction("A_prev_G",sec,i)));
  const ph=trace(enc,dirs,cfg,true).phases;
  const publicD=sixbackOriginalRegisters(enc)[2];
  const pt=plain.flat(2);
  assert.equal(pt.length,N);
  const recovered=publicD.map((v,i)=>mod(v-key[ph[i]],29));
  assert.deepEqual(recovered,pt);
  let k=0;
  const generated=[];
  for(const sec of enc)for(const {r} of sec){
    const out=[];
    for(const c of r){
      const past=out.length>=6?T(out[out.length-6]):0;
      const v=mod(past+recovered[k]+key[ph[k]],29);
      assert.equal(v,c);
      out.push(v);generated.push(v);k++;
    }
  }
  assert.deepEqual(generated,cipher.flat(2));
  const hist=new Uint32Array(Q);
  for(const p of pt)hist[p]++;
  const ioc=hist.reduce((s,v)=>s+v*(v-1),0)/(N*(N-1));
  const upper=capacity(ph,publicD).ioc;
  assert.ok(upper>=ioc);
  return {runes:N,recoveredAndReencryptedAll:true,realEnglishIoC:ioc,allSecretMaximumIoC:upper};
}

function main(){
  const source=originalWords();
  const reg=sixbackOriginalRegisters(source);
  const controls=[["Gibran","resources/control/gibran_prophet_58585.txt"],
    ["Emerson","resources/control/emerson_essays_2944.txt"],
    ["Shakespeare","resources/control/shakespeare_first300k.txt"]].map(([name,file])=>{
      const words=encodeWords(fs.readFileSync(path.join(ROOT,file),"utf8"));
      return {name,minimumWindowIoC:minIoC(words.flat()),words};
    });
  const lower=Math.min(...controls.map(x=>x.minimumWindowIoC));
  const best=Array(3).fill(null),worst=Array(3).fill(null);
  let count=0;
  for(const name of RULES){
    const dirs=source.map(sec=>sec.map((_,i)=>direction(name,sec,i)));
    for(let h=0;h<2;h++)for(let m=0;m<3;m++)
      for(let c=0;c<3;c++)for(let flip=0;flip<2;flip++)
        for(let skip=0;skip<2;skip++){
          const conf={name,h,m,c,flip,skip};
          const phases=trace(source,dirs,conf,true).phases;
          for(let i=0;i<3;i++){
            const cap=capacity(phases,reg[i]),v={...conf,...cap};
            if(!best[i]||v.numerator>best[i].numerator)best[i]=v;
            if(!worst[i]||v.numerator<worst[i].numerator)worst[i]=v;
          }
          count++;
        }
  }
  assert.equal(count,4752);
  const pos=positive(source,controls[0].words,{h:1,m:2,c:2,flip:1,skip:1});
  const report={
    originalRunes:N,originalWords:source.flat().length,
    pointerModels:count,totalSixbackReceivers:count*3,
    sourceOriginalModes:["book-global six-back","eight-section six-back",
      "word-local six-back"].map((name,i)=>({name,best:best[i],worst:worst[i],
        nativeEnglishEnvelopeExcluded:best[i].ioc<lower})),
    nativeControls:controls.map(({name,minimumWindowIoC})=>({name,minimumWindowIoC})),
    referenceMinimumIoC:lower,positiveSourceEnglish:pos,
    actualUnknownPagePlaintextRecovered:false
  };
  console.log(JSON.stringify(report,null,2));
  return report;
}
if(require.main===module)main();
module.exports={main};
