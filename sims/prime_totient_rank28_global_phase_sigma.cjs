"use strict";
/**
 * Complete signed, page-reset/global-clock, 28-rank prime-totient source
 * search with arbitrary fixed hidden GP alphabet. One fingerprint is
 * independent of all 28! plaintext rune permutations: the recovered rank
 * index of coincidence. This is an original-source attack with authentic
 * original page holdout and exact unknown-key implanted controls.
 *
 * Run: node sims/prime_totient_rank28_global_phase_sigma.cjs [maxStarts]
 * Default 2,000,000; output includes both signed key directions, both
 * predecessor-excluding maps, both doublet-clock policies, and both
 * page-reset/continuous-tape clocks.
 *
 * @module prime_totient_rank28_global_phase_sigma
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {features,search,primeResidues}=require("./prime_totient_rank28_unknown_sigma_keysearch.cjs");
const {gpWord}=require("./prime_totient_secret_parity_wordfit.cjs");
const root=path.resolve(__dirname,"..");
const src=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const ref=fs.readFileSync(path.join(root,"resources/control/shakespeare_first300k.txt"),"utf8");
const gp=ref.slice(240000).toUpperCase().match(/[A-Z]+/g).flatMap(gpWord).filter(x=>x<28);
const indices=[0,3,8,16,23,27,33,40];
const all=src.pages.filter(p=>p.page<56&&p.indices.length);
const selected=indices.map(n=>({page:n,code:all.find(p=>p.page===n).indices.slice(0,145)}));
const base=new Map();let countAll=0,countNoRepeat=0;
for(const page of all){
  base.set(page.page,{all:countAll,noRepeat:countNoRepeat});
  countAll+=page.indices.length;
  countNoRepeat++;
  for(let i=1;i<page.indices.length;i++)if(page.indices[i]!==page.indices[i-1])countNoRepeat++;
}
assert.equal(countAll,12956);
let seed=0x14144033;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;}
const mod29=x=>(x%29+29)%29;
const power=[],log=Array(29).fill(-1);
for(let x=1,k=0;k<28;k++,x=x*15%29){power.push(x);log[x]=k;}
function prepare(scheme,consumes,global){
  return selected.map(({page,code})=>{
    const f=features(code,scheme,consumes);
    if(global){
      const shift=consumes?base.get(page).all:base.get(page).noRepeat;
      f.clock=f.clock.map(v=>v+shift);
    }
    return f;
  });
}
/** @param {number} limit */
function main(limit=2000000){
  assert.ok(Number.isSafeInteger(limit)&&limit>=10&&limit<=2000000);
  const t0=Date.now(),shifts=primeResidues(limit+countAll+200),
    reverse=Uint8Array.from(shifts,k=>(28-k)%28),
    report={algorithm:"key-independent frequency concentration of 28-rank GP ordinal after genuine prime-totient shifts",
      originalFile:"resources/liber-primus/lp2-corpus.json",trainingPages:indices.slice(0,4),
      holdoutPages:indices.slice(4),pagePrefixLength:145,
      startRange:[1,limit],modeCount:16,original:[],sourceTruePlants:[],
      sourceSHA256:crypto.createHash("sha256").update(Buffer.from(selected.flatMap(x=>x.code))).digest("hex")};
  for(const scheme of ["cyclic","power"])for(const consumes of [true,false])
    for(const global of [false,true])for(const sign of [1,-1]){
      const selectedShifts=sign===1?shifts:reverse;
      const f=prepare(scheme,consumes,global);
      const top=search(f.slice(0,4),selectedShifts,limit,3);
      const hold=top.map(({start,collisions,ioc})=>{
        const hist=new Int32Array(28);
        let n=0;
        for(const page of f.slice(4))for(let i=0;i<page.rank.length;i++){
          let p=page.rank[i]-selectedShifts[start+page.clock[i]];
          if(p<0)p+=28;
          hist[p]++;n++;
        }
        let pairs=0;for(const v of hist)pairs+=v*(v-1);
        return {start,collisions,ioc,holdoutIoC:pairs/(n*(n-1)),holdoutN:n};
      });
      report.original.push({scheme,consumes,global,sign,best:hold});
    }
  const plantModes=[
    {scheme:"cyclic",consumes:true,global:true,sign:-1},
    {scheme:"power",consumes:false,global:true,sign:1},
    {scheme:"cyclic",consumes:false,global:false,sign:-1},
    {scheme:"power",consumes:true,global:false,sign:1}
  ];
  for(const mode of plantModes){
    const trueStart=Math.min(123456,Math.floor(limit*.7)),f=prepare(mode.scheme,mode.consumes,mode.global);
    const permutation=Array.from({length:28},(_,i)=>i);
    for(let i=27;i>0;i--){const j=Math.floor(rng()*(i+1));[permutation[i],permutation[j]]=[permutation[j],permutation[i]];}
    const inverse=Array(28);
    for(let i=0;i<28;i++)inverse[permutation[i]]=i;
    const encoded=[];
    let sourceIndex=0,matched=0;
    for(let z=0;z<selected.length;z++){
      const shape=selected[z].code,clocks=f[z].clock;
      const ciphertext=[(17+13*z)%29];
      let j=0;
      for(let i=1;i<shape.length;i++){
        if(shape[i]===shape[i-1]){ciphertext.push(ciphertext[i-1]);continue;}
        const plaintext=gp[sourceIndex++%gp.length];
        const k=shifts[trueStart+clocks[j++]];
        const rank=(permutation[plaintext]+mode.sign*k+28)%28;
        const c=mod29(ciphertext[i-1]+(mode.scheme==="cyclic"?rank+1:power[rank]));
        ciphertext.push(c);
        const diff=mod29(c-ciphertext[i-1]);
        const x=mode.scheme==="cyclic"?diff-1:log[diff];
        assert.equal(inverse[(x-mode.sign*k+28)%28],plaintext);
        matched++;
      }
      encoded.push(features(ciphertext,mode.scheme,mode.consumes));
      if(mode.global){
        const prefix=mode.consumes?base.get(selected[z].page).all:base.get(selected[z].page).noRepeat;
        encoded.at(-1).clock=encoded.at(-1).clock.map(x=>x+prefix);
      }
    }
    const top=search(encoded.slice(0,4),mode.sign===1?shifts:reverse,limit,3);
    assert.equal(top[0].start,trueStart,"known-source blind key recovery");
    report.sourceTruePlants.push({...mode,trueStart,recoveredRank:1,
      exactInvertedRunes:matched,selected:top});
  }
  report.seconds=(Date.now()-t0)/1000;
  console.log(JSON.stringify(report,null,2));
  return report;
}
if(require.main===module)main(Number(process.argv[2]||2000000));
module.exports={main,prepare};
