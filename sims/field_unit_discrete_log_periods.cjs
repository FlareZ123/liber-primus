"use strict";
/**
 * Direct inverse of nonzero-unit GP differential stream:
 * D_i=C_i-C_(i-1) = (P_i+1)K_i (mod29), K_i in F29*.
 * Discrete log base 2 converts nonzero differences to an additive cipher
 * modulo 28: log2(D_i)=log2(P_i+1)+log2(K_i) (mod28).
 *
 * Search all periods 1..128 and global/page/section key resets; fit keys
 * on untouched original training sections/pages, evaluate real holdouts,
 * then calibrate the maximum over the entire family with section rotations.
 * @module field_unit_discrete_log_periods
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const {createHash}=require("node:crypto");
const ROOT=path.resolve(__dirname,"..");
const R=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const DATA=JSON.parse(R("resources/liber-primus/lp2-corpus.json"));
const RUNES=new Map(DATA.runes.map((r,i)=>[r,i]));
const TOKENS=DATA.translit.map((t,i)=>[t,i]).sort((a,b)=>b[0].length-a[0].length);
const TRIALS=Number(process.argv[2]||80);
const MAX_PERIOD=128;
const SEED=0x29fd3131;
const ANTI=Array.from({length:29},()=>-1);
const EXP=Array(28);
for(let k=0,x=1;k<28;k++,x=x*2%29){assert.equal(ANTI[x],-1);ANTI[x]=k;EXP[k]=x;}
assert.equal(ANTI[0],-1);
assert.equal(ANTI[28],14);
function encode(text){
  const words=(text.toUpperCase().match(/[A-Z]+/g)||[]);
  const a=[];
  for(let word of words){
    word=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C")
      .replace(/Z/g,"S").replace(/ING/g,"NG");
    for(let i=0;i<word.length;){
      const t=TOKENS.find(x=>word.startsWith(x[0],i));
      if(!t)break;
      a.push(t[1]);i+=t[0].length;
    }
  }
  return a;
}
function parse(){
  const raw=R("resources/lp2-transcription.txt").split("%").slice(0,55).join("%");
  const a=[],pages=[],sections=[];
  let page=0,section=0,oPage=0,oSection=0,previous=-1;
  for(const c of raw){
    if(RUNES.has(c)){
      const value=RUNES.get(c),delta=previous<0?-1:(value-previous+29)%29;
      a.push({page,section,oPage,oSection,abs:a.length,x:delta<0||delta===0?-1:ANTI[delta],
        raw:delta,plain:null});
      oPage++;oSection++;previous=value;
    }else if(c==="%"){page++;oPage=0;}
    else if(c==="$"){section++;oSection=0;}
  }
  assert.equal(a.length,12956);
  assert.equal(page,54);
  assert.equal(a.filter(x=>x.raw===0).length,86);
  assert.equal(a.filter(x=>x.x>=0).length,12869);
  assert.equal(section,8); // Terminal $ follows the eighth section.
  return {a,raw};
}
function logPrior(){
  const control=encode(R("resources/control/shakespeare_first300k.txt").slice(0,180000));
  const hist=new Float64Array(28).fill(.5);
  for(const p of control)if(p!==28)hist[ANTI[p+1]]++;
  const sum=hist.reduce((u,x)=>u+x,0);
  return Float64Array.from(hist,x=>Math.log(28*x/sum));
}
function fit(a,p,mode,prior){
  const counts=new Int32Array(p*28);
  const phase=r=> (mode==="section"?r.oSection:mode==="page"?r.oPage:r.abs)%p;
  let training=0;
  for(const r of a)if(r.x>=0 && (mode==="page"?r.page<27:r.section<4)){
    counts[phase(r)*28+r.x]++;training++;
  }
  const keys=new Uint8Array(p);
  for(let phaseIndex=0;phaseIndex<p;phaseIndex++){
    let bestScore=-Infinity,bestKey=0;
    for(let key=0;key<28;key++){
      let s=0;
      for(let x=0;x<28;x++)s+=counts[phaseIndex*28+x]*prior[(x-key+28)%28];
      if(s>bestScore){bestScore=s;bestKey=key;}
    }
    keys[phaseIndex]=bestKey;
  }
  return {mode,p,keys,training};
}
function score(a,fit,prior,overrides){
  let total=0,n=0;
  for(let i=0;i<a.length;i++){
    const r=a[i];
    if(!(fit.mode==="page"?r.page>=27:r.section>=4))continue;
    const x=overrides?overrides[i]:r.x;
    if(x<0)continue;
    const ph=(fit.mode==="section"?r.oSection:fit.mode==="page"?r.oPage:r.abs)%fit.p;
    total+=prior[(x-fit.keys[ph]+28)%28];
    n++;
  }
  return {mean:total/n,scored:n};
}
function rng(seed){
  let state=seed>>>0;
  return ()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)+.5;};
}
function plant(a,prior,random){
  const sh=encode(R("resources/control/shakespeare_first300k.txt").slice(190000));
  assert.ok(sh.length>=a.length);
  const p=31,key=Array.from({length:p},()=>Math.floor(random()/4294967296*28));
  let previous=11,zeros=0;
  const planted=a.map((r,i)=>{
    const pp=sh[i],ph=r.oSection%p;
    const delta=((pp+1)*EXP[key[ph]])%29;
    const current=(previous+delta)%29;
    assert.equal((current-previous+29)%29,delta);
    previous=current;
    if(delta===0)zeros++;
    return {...r,x:delta===0?-1:ANTI[delta],raw:delta};
  });
  const matched=fit(planted,p,"section",prior);
  let correct=0;
  for(let i=0;i<p;i++)correct+=Number(matched.keys[i]===key[i]);
  const held=score(planted,matched,prior);
  assert.equal(correct,p);
  assert.ok(held.mean>0.1);
  return {type:"authentic GP Shakespeare source, field-unit key section-reset period31",
    recoveredKeyPhases:correct,totalKeyPhases:p,zeroMarks:zeros,heldout:held};
}
function run(){
  const {a,raw}=parse(),prior=logPrior();
  const modes=["global","section","page"],fits=[];
  for(const mode of modes)for(let p=1;p<=MAX_PERIOD;p++){
    const fitted=fit(a,p,mode,prior);
    fits.push({...fitted,...score(a,fitted,prior)});
  }
  const top=fits.slice().sort((x,y)=>y.mean-x.mean);
  const scores=top.map(x=>({mode:x.mode,period:x.p,heldoutLogOdds:x.mean,
    heldoutCount:x.scored,trainingCount:x.training}));
  const random=rng(SEED),positive=plant(a,prior,random);
  const bySection=Array.from({length:8},()=>[]);
  for(let i=0;i<a.length;i++)if(a[i].section>=4)bySection[a[i].section].push(i);
  const maximums=[],realBest=top[0].mean;
  for(let trial=0;trial<TRIALS;trial++){
    const rotated=new Int8Array(a.length).fill(-1);
    for(const indices of bySection){
      if(indices.length===0)continue;
      const shift=Math.floor(random()/4294967296*indices.length);
      for(let k=0;k<indices.length;k++)
        rotated[indices[k]]=a[indices[(k+shift)%indices.length]].x;
    }
    let best=-Infinity;
    for(const f of fits){
      const held=score(a,f,prior,rotated).mean;
      if(held>best)best=held;
    }
    maximums.push(best);
  }
  const exceed=maximums.filter(x=>x>=realBest).length;
  return {hypothesis:"Nonzero-unit GP field cipher; discrete-log additive period 1..128, global/section/page resets",
    originalSHA256:createHash("sha256").update(raw).digest("hex"),
    originalRunes:a.length,nonzeroDifferences:a.filter(x=>x.x>=0).length,
    originalRepeatEvents:a.filter(x=>x.raw===0).length,
    candidates:fits.length,training:"Original sections 0..3 for global/section, original pages 0..26 for page mode",
    GPReference:"First 180k Shakespeare characters; mod28 nonzero unit logarithm frequency",
    topOriginal:scores.slice(0,15),
    positive,randomSeed:"0x"+SEED.toString(16),null:{
      trials:TRIALS,rotations:"Each untouched section 4..7 cyclically rotated independently; all 384 learned candidates rescored",
      familyExceed:exceed,familyUpperTail:(exceed+1)/(TRIALS+1),
      nullMaxMean:maximums.reduce((u,x)=>u+x,0)/maximums.length,
      nullMax:Math.max(...maximums),realMax:realBest},
    plaintextStatus:"No plaintext asserted unless a coherent heldout GP decode and re-encryption is found"};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+"\n");
module.exports={encode,parse,logPrior,fit,score,plant,run};
