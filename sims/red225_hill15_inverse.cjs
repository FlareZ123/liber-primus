'use strict';
/**
 * Source-derived full-block 15x15 Hill inverse of LP2 using all 225
 * physically red-marked runes as the matrix. A wrong key produces uniform
 * plaintext; the correct key, even with 81% adjacent collision rewrites,
 * should expose roughly two thirds of the 15-rune blocks untouched.
 *
 * Exact encrypted -> repaired -> decoded positive controls. Original
 * candidates are selected on the first half of physical pages and assessed
 * only on the untouched second half. No plaintext fitted to original.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=require('./relative_key_english_probe.cjs');
const ROOT=path.resolve(__dirname,'..');
const read=x=>fs.readFileSync(path.join(ROOT,x),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const L=15,MOD=29,mod=x=>((x%MOD)+MOD)%MOD;
const gpByRune=new Map(corpus.runes.map((r,i)=>[r,i]));
const originalPages=corpus.pages.filter(p=>p.page<=55&&p.indices.length)
  .map(p=>p.indices);
assert.equal(originalPages.length,55);
assert.equal(originalPages.flat().length,12956);
const red=ink.pages.flatMap(p=>(p.red_spans||[])
  .flatMap(span=>[...span.runes].map(r=>gpByRune.get(r))));
assert.equal(red.length,225);
const redRows=Array.from({length:L},(_,i)=>red.slice(i*L,(i+1)*L));
const serp=redRows.flatMap((row,i)=>i%2?row.slice().reverse():row);
const matrices=[
  ['red-row-index',red],
  ['red-row-prime',red.map(i=>corpus.prime[i])],
  ['red-serp-index',serp],
  ['red-serp-prime',serp.map(i=>corpus.prime[i])]
];
/** @param {number} x */
function inv29(x){for(let k=1;k<MOD;k++)if(x*k%MOD===1)return k;throw Error('singular pivot');}
/** Invert one square source matrix exactly in F29. */
function inverse(source){
  const augmented=Array.from({length:L},(_,i)=>[
    ...source.slice(i*L,(i+1)*L).map(mod),
    ...Array.from({length:L},(_,j)=>Number(i===j))
  ]);
  for(let col=0;col<L;col++){
    let pivot=col;while(pivot<L&&augmented[pivot][col]===0)pivot++;
    if(pivot===L)return null;
    [augmented[col],augmented[pivot]]=[augmented[pivot],augmented[col]];
    const k=inv29(augmented[col][col]);
    for(let j=0;j<L*2;j++)augmented[col][j]=mod(augmented[col][j]*k);
    for(let i=0;i<L;i++)if(i!==col){
      const a=augmented[i][col];
      for(let j=0;j<L*2;j++)augmented[i][j]=mod(augmented[i][j]-a*augmented[col][j]);
    }
  }
  const output=augmented.map(row=>row.slice(L)).flat();
  for(let i=0;i<L;i++)for(let j=0;j<L;j++){
    let x=0;for(let k=0;k<L;k++)x+=source[i*L+k]*output[k*L+j];
    assert.equal(mod(x),Number(i===j));
  }
  return output;
}
/** @param {number[]} flat @param {number[]} vector */
function mul(flat,vector){
  const result=new Uint8Array(L);
  for(let i=0;i<L;i++){
    let v=0;
    for(let k=0;k<L;k++)v+=flat[i*L+k]*vector[k];
    result[i]=mod(v);
  }
  return result;
}
/** @param {number[]} x */
function transpose(x){return Array.from({length:L*L},(_,i)=>x[(i%L)*L+Math.floor(i/L)]);}
/** Return group arrays with global offsets, preserving true page joins. */
function groups(kind,pages){
  if(kind==='page'){
    let pos=0;
    return pages.map(x=>{const y={offset:pos,xs:x};pos+=x.length;return y;});
  }
  if(kind==='all')return [{offset:0,xs:pages.flat()}];
  const raw=read('resources/lp2-transcription.txt').split('%').slice(0,55).join('%');
  let pos=0;
  const parsed=raw.split('$').map(s=>[...s].filter(ch=>gpByRune.has(ch))
    .map(ch=>gpByRune.get(ch))).filter(x=>x.length).map(xs=>{
      const result={offset:pos,xs};pos+=xs.length;return result;
    });
  assert.equal(parsed.length,8);
  assert.equal(pos,12956);
  assert.deepEqual(parsed.flatMap(x=>x.xs),pages.flat());
  return parsed;
}
/** Scan complete blocks for one decoder, grouping and phase. */
function assess(grouped,decoder,phase,sign,prior,includeText=false){
  let a=0,b=0,na=0,nb=0;
  const countA=new Uint32Array(MOD),countB=new Uint32Array(MOD);
  let head='';
  for(const group of grouped)for(let start=phase;start+L<=group.xs.length;start+=L){
    const plain=mul(decoder,group.xs.slice(start,start+L));
    const half=group.offset+start<6500?0:1;
    for(const p0 of plain){
      const p=sign>0?p0:mod(-p0);
      const value=Math.log(prior[p]*MOD);
      if(half===0){a+=value;na++;countA[p]++;}
      else{b+=value;nb++;countB[p]++;}
      if(includeText&&head.length<160)head+=corpus.translit[p];
    }
  }
  const ioc=c=>{
    const n=c.reduce((x,y)=>x+y,0);
    return c.reduce((v,f)=>v+f*(f-1),0)/(n*(n-1));
  };
  return {train:a/na,holdout:b/nb,nTrain:na,nHeldout:nb,
    iocTrain:ioc(countA),iocHeldout:ioc(countB),
    ...(includeText?{opening:head}:null)};
}
/** Seeded collision-rewritten Hill encryption of independently heldout GP. */
function planted(H,pages,source){
  let seed=0x15d22501,previous=-1,sourcePos=0,repaired=0;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const out=[];
  for(const page of pages){
    const result=[];
    for(let t=0;t<page.length;t+=L){
      const block=source.slice(sourcePos,sourcePos+L);
      assert.equal(block.length,L);
      const raw=mul(H,block);
      for(let k=0;k<Math.min(L,page.length-t);k++){
        let symbol=raw[k];
        if(previous===symbol&&random()<.81){
          symbol=mod(symbol+1+Math.floor(28*random()));
          repaired++;
        }
        result.push(symbol);previous=symbol;
      }
      sourcePos+=Math.min(L,page.length-t);
    }
    out.push(result);
  }
  assert.equal(sourcePos,12956);
  return {pages:out,repaired};
}
function run(){
  const source=read('resources/control/shakespeare_first300k.txt');
  const train=base.corpusWords(source.slice(0,240000)).flat();
  const heldout=base.corpusWords(source.slice(240000)).flat();
  assert.ok(heldout.length>12956+L);
  const freq=new Float64Array(MOD).fill(1);
  for(const c of train)freq[c]++;
  const total=freq.reduce((a,b)=>a+b,0);
  const prior=Array.from(freq,x=>x/total);
  const keys=[];
  for(const [label,values] of matrices){
    const arr=values.map(mod);
    for(const mode of ['column','row']){
      const H=mode==='column'?arr:transpose(arr);
      const decipher=inverse(H);
      if(decipher)keys.push({label:label+'-'+mode,H,decipher});
    }
  }
  assert.equal(keys.length,8);
  const kinds=['page','section','all'];
  const layout=new Map(kinds.map(k=>[k,groups(k,originalPages)]));
  const original=[];
  for(const key of keys)for(const kind of kinds)
    for(let phase=0;phase<L;phase++)for(const sign of [1,-1]){
      const measured=assess(layout.get(kind),key.decipher,phase,sign,prior);
      original.push({key:key.label,kind,phase,sign,...measured});
    }
  original.sort((x,y)=>y.train-x.train);
  const winner=original[0];
  const locked=assess(layout.get(winner.kind),
    keys.find(x=>x.label===winner.key).decipher,
    winner.phase,winner.sign,prior,true);
  const trueKey=keys.find(x=>x.label==='red-row-index-column');
  const control=planted(trueKey.H,originalPages,heldout);
  const plantGroups=groups('page',control.pages);
  const plantedResult=assess(plantGroups,trueKey.decipher,0,1,prior,true);
  const wrong=assess(plantGroups,keys.find(x=>x.label==='red-serp-prime-row').decipher,
    0,1,prior);
  const n=originalPages.reduce((sum,p)=>sum+Math.floor(p.length/L)*L,0);
  let correct=0,totalDecoded=0,cursor=0;
  for(let page=0;page<originalPages.length;page++){
    const xs=control.pages[page];
    for(let start=0;start+L<=xs.length;start+=L){
      const got=mul(trueKey.decipher,xs.slice(start,start+L));
      for(let k=0;k<L;k++){
        correct+=Number(got[k]===heldout[cursor+start+k]);totalDecoded++;
      }
    }
    cursor+=xs.length;
  }
  assert.equal(n,totalDecoded);
  assert.ok(correct/totalDecoded>.55);
  assert.ok(plantedResult.holdout>.05);
  return {
    model:'source-225-red-rune 15x15 Hill F29, complete 15-rune ciphertext blocks, possible independent 81% adjacent-doublet overwrite',
    exactInput:{redMarkedRunes:red.length,sourceRedPageCount:ink.pages.length,
      sourceRuneLength:originalPages.flat().length,sourcePages:originalPages.length},
    search:'four source matrices, matrix/transpose, page/eight-section/whole-book resets, phases 0..14, positive/negative decode sign; selected on first ~6500 original runes only',
    candidateCount:original.length,
    originalBestTraining:original.slice(0,10),
    originalBestHeldout:original.slice().sort((x,y)=>y.holdout-x.holdout).slice(0,5),
    originalWinnerFrozenHeldout:locked,
    positive:{key:trueKey.label,layout:'page',phase:0,repaired:control.repaired,
      score:plantedResult,accuracy:correct/totalDecoded,
      independentlyWrongKey:wrong},
    caveat:'Plain 15x15 Hill over physically complete blocks, without nonlinear KDF, additional outer symbol permutation or unknown inter-block chaining. Outputs from wrong Hill keys do not prove absence of all keyed polygraphic ciphers. A candidate must expose readable unsolved plaintext.'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={inverse,mul,transpose,groups,assess,planted,run};
