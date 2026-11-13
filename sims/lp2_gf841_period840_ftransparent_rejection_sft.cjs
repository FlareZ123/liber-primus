'use strict';
/**
 * Literal-F/zero-reserved plus duplicate-output rejection using the exact
 * source-derived GF(29^2) order-840 g on original physical LP2 pp33–39.
 * Authentically solved LP1 and p56 supply the F bypass precedent; the
 * combination with this field key is a hypothesis. Node.js22, CommonJS.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encode, train} = require('./grid_keyskip_viterbi.cjs');
const {fieldCycle, projections, scoreText} =
  require('./lp2_gf841_period840_collision_keyskip_sft.cjs');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const language=read('resources/control/shakespeare_first300k.txt');
const GP=29, WIDTH=840, ADV=4, MAX_SKIP=2, PEN=3.5;
const mod=x=>((x%GP)+GP)%GP;

/**
 * Exact full-phase Viterbi: literal F uses no key, ordinary rune uses
 * one accepted key and 0..2 rejected draws. A rejected draw is legal
 * precisely if it would emit the previous printed ciphertext or the
 * reserved output F (which no encrypted non-F may use).
 * @param {number[]} cipher Source GP indices
 * @param {number[]} key GF841 projection
 * @param {1|-1} sign Source encryption sign
 * @param {ReturnType<typeof train>} model Language scorer
 */
function solve(cipher,key,sign,model){
  const decode=(c,j)=>mod(c-sign*key[j]);
  const N=WIDTH*ADV, n=cipher.length;
  const back=new Int16Array(n*N).fill(-1);
  let old=new Float64Array(N).fill(-Infinity);
  assert.equal(key.length,WIDTH);
  for(let phase=0;phase<WIDTH;phase++){
    const j0=cipher[0]===0?modPhase(phase-1):phase;
    const p0=cipher[0]===0?0:decode(cipher[0],j0);
    const dValues=cipher[1]===0?[0]:[1,2,3];
    for(const d of dValues){
      const j1=modPhase(j0+d);
      const p1=cipher[1]===0?0:decode(cipher[1],j1);
      let possible=true;
      for(let h=1;h<d;h++){
        const proposed=mod(p1+sign*key[modPhase(j0+h)]);
        if(proposed!==0&&proposed!==cipher[0]){possible=false;break;}
      }
      if(!possible)continue;
      const state=j1*ADV+d;
      const score=model.unigram[p0]+model.bigram[p0*GP+p1]-PEN*Math.max(0,d-1);
      if(score>old[state])old[state]=score;
    }
  }
  for(let i=2;i<n;i++){
    const next=new Float64Array(N).fill(-Infinity);
    const ds=cipher[i]===0?[0]:[1,2,3];
    for(let state=0;state<N;state++){
      const base=old[state];
      if(!Number.isFinite(base))continue;
      const j=Math.floor(state/ADV), dprev=state%ADV;
      const pPrev=cipher[i-1]===0?0:decode(cipher[i-1],j);
      const pPreprev=cipher[i-2]===0?0:decode(cipher[i-2],modPhase(j-dprev));
      const gramBase=(pPreprev*GP+pPrev)*GP;
      for(const d of ds){
        const jnew=modPhase(j+d);
        const p=cipher[i]===0?0:decode(cipher[i],jnew);
        let allowed=true;
        for(let h=1;h<d;h++){
          const proposed=mod(p+sign*key[modPhase(j+h)]);
          if(proposed!==0&&proposed!==cipher[i-1]){allowed=false;break;}
        }
        if(!allowed)continue;
        const score=base+model.trigram[gramBase+p]-PEN*Math.max(0,d-1);
        const ns=jnew*ADV+d;
        if(score>next[ns]){next[ns]=score;back[i*N+ns]=state;}
      }
    }
    old=next;
  }
  let state=-1,best=-Infinity;
  for(let s=0;s<N;s++)if(old[s]>best){best=old[s];state=s;}
  assert.ok(state>=0&&Number.isFinite(best));
  const plain=new Array(n);
  let skips=0,phase=-1;
  for(let i=n-1;i>=1;i--){
    const j=Math.floor(state/ADV),d=state%ADV;
    plain[i]=cipher[i]===0?0:decode(cipher[i],j);
    skips+=Math.max(0,d-1);
    if(i===1){
      const j0=modPhase(j-d);
      plain[0]=cipher[0]===0?0:decode(cipher[0],j0);
      phase=cipher[0]===0?modPhase(j0+1):j0;
    }else{
      state=back[i*N+state];assert.ok(state>=0);
    }
  }
  const raw=scoreText(plain,model);
  assert.ok(Math.abs(raw-best-PEN*skips)<1e-6,'Viterbi total cost invariant');
  const hist=Array(GP).fill(0);plain.forEach(p=>hist[p]++);
  return{plaintext:plain,start:phase,skips,score:best/n,plainScore:raw/n,
    ioc:hist.reduce((a,k)=>a+k*(k-1),0)/(n*(n-1))};
}

/** @param {number} x */
function modPhase(x){return((x%WIDTH)+WIDTH)%WIDTH;}
/** @param {number} seed */
function random(seed){let x=seed>>>0;return()=>{
  x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;
};}

/**
 * Native-GP forward cipher with literal F bypass and rejection for F
 * reserved outputs and probabilistic repeat-collision proposals.
 * @param {number[]} plain
 * @param {number[]} key
 * @param {1|-1} sign
 * @param {number} phase
 */
function plant(plain,key,sign,phase){
  let j=phase,prev=-1;
  const rng=random(0x3301f007),out=[],rejects=[];
  for(const p of plain){
    if(p===0){out.push(0);rejects.push(0);prev=0;continue;}
    let c=mod(p+sign*key[j]),skips=0;
    while((c===0||(c===prev&&rng()<0.87))&&skips<MAX_SKIP){
      j=modPhase(j+1);skips++;
      c=mod(p+sign*key[j]);
    }
    assert.notEqual(c,0,'Positive needs a legal F-reserved output');
    out.push(c);rejects.push(skips);prev=c;j=modPhase(j+1);
  }
  return{cipher:out,rejects};
}
function main(){
  const cipher=[33,34,35,36,37,38,39]
    .flatMap(page=>corpus.pages.find(p=>p.page===page).indices);
  assert.equal(cipher.length,1680);
  const model=train(language.slice(0,200000));
  const native=encode(language.slice(230000,295000)).slice(0,1680);
  assert.equal(native.length,1680);
  const projs=projections(fieldCycle()).filter(k=>
    k.name==='coordinate-a'||k.name==='norm');
  let sourceF=0;cipher.forEach(p=>{if(p===0)sourceF++;});
  const results=[];
  for(const variant of projs){
    for(const sign of [1,-1]){
      const encrypted=plant(native,variant.key,sign,227);
      const dec=solve(encrypted.cipher,variant.key,sign,model);
      const correct=dec.plaintext.filter((p,i)=>p===native[i]).length;
      const plantedSkips=encrypted.rejects.reduce((a,b)=>a+b,0);
      console.log('CONTROL '+JSON.stringify({
        projection:variant.name,sign,correct,trueLength:native.length,
        phase:dec.start,expectedPhase:227,plantedSkips,recoveredSkips:dec.skips,
        nativeScore:scoreText(native,model)/native.length,score:dec.plainScore
      }));
      assert.ok(correct>=0.95*native.length,'Positive F bypass inverse failure');
      const out=solve(cipher,variant.key,sign,model);
      const result={
        projection:variant.name,sign,sourceF,length:cipher.length,
        score:out.score,plainScore:out.plainScore,ioc:out.ioc,
        skips:out.skips,phase:out.start,
        nativeScore:scoreText(native,model)/native.length,
        preview:out.plaintext.slice(0,100).map(p=>corpus.translit[p]).join(' ')
      };
      console.log('ORIGINAL '+JSON.stringify(result));results.push(result);
    }
  }
  console.log('BEST '+JSON.stringify(results.reduce((a,b)=>a.plainScore>b.plainScore?a:b)));
  console.log('PASS: forced literal F, non-F reserved skip, collision-reject models');
}
if(require.main===module)main();
module.exports={solve,plant};
