'use strict';

/**
 * Test the exact p32 13-rune W window selected by the provisional signed-2016
 * base58/Beware pointer as a repeating additive GP29 key.
 *
 * Key is frozen from sims/p32_13runic_w_infinity_route_sft.cjs:
 * p32 local offsets 25..37 inclusive, selected word IARTTHF plus its suffix.
 * p32 is excluded from plaintext scoring because it supplied the key.
 *
 * Test only forward printed order, both signs, and continuous/page-reset
 * clocks. No key rotations, phases, reversals, or alternative windows.
 *
 * Run: node sims/p32_13runic_window_period13_key_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const gibranText = fs.readFileSync(path.join(ROOT,'resources/control/gibran_prophet_58585.txt'),'utf8');
const MOD = 29;
const NULL_REPLICATES = 100;
const NULL_SEED = 0x13be5e58;
const LETTERS = {A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,K:5,L:20,M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,W:7,X:14,Y:26,Z:15};
const DIGRAPHS = {TH:2,NG:21,EO:12,OE:22,AE:25,IA:27,EA:28};
const mod = x => ((x % MOD) + MOD) % MOD;

function encodeGp29(text) {
  const source=text.toUpperCase().replace(/[^A-Z]/g,'');
  const out=[];
  for(let i=0;i<source.length;i++){
    const digraph=DIGRAPHS[source.slice(i,i+2)];
    if(digraph!==undefined){out.push(digraph);i++;}
    else out.push(LETTERS[source[i]]);
  }
  return out;
}
function ioc(values) {
  const counts=new Uint32Array(MOD);
  for(const value of values)counts[value]++;
  let pairs=0;
  for(const count of counts)pairs+=count*(count-1);
  return pairs/(values.length*(values.length-1));
}
function applyPages(inputPages,key,sign,clock) {
  let global=0;
  return inputPages.map(page=>page.map((value,localIndex)=>{
    const keyIndex=clock==='page'?(localIndex%key.length):(global%key.length);
    global++;
    return mod(value+sign*key[keyIndex]);
  }));
}
function score(pages,key,sign,clock) {
  let global=0;
  const full=[],pageScores=[];
  for(const page of pages){
    const pageOut=[];
    for(let i=0;i<page.indices.length;i++,global++){
      const keyIndex=clock==='page'?(i%key.length):(global%key.length);
      const value=mod(page.indices[i]+sign*key[keyIndex]);
      if(page.page!==32)pageOut.push(value);
    }
    if(page.page!==32){
      full.push(...pageOut);
      if(pageOut.length>=140)pageScores.push({page:page.page,n:pageOut.length,ioc:ioc(pageOut)});
    }
  }
  pageScores.sort((a,b)=>b.ioc-a.ioc);
  return {fullIoC:ioc(full),maxPage:pageScores[0],pageScores};
}
function scoreRandomKey(pages,key,sign,clock) {
  let global=0,n=0,maxPage={ioc:0};
  const fullCounts=new Uint32Array(MOD);
  for(const page of pages){
    const pageCounts=new Uint32Array(MOD);
    let pageN=0;
    for(let i=0;i<page.indices.length;i++,global++){
      if(page.page===32)continue;
      const keyIndex=clock==='page'?(i%key.length):(global%key.length);
      const value=mod(page.indices[i]+sign*key[keyIndex]);
      fullCounts[value]++;pageCounts[value]++;n++;pageN++;
    }
    if(page.page!==32&&pageN>=140){
      let pairs=0;for(const count of pageCounts)pairs+=count*(count-1);
      const value=pairs/(pageN*(pageN-1));
      if(value>maxPage.ioc)maxPage={page:page.page,ioc:value};
    }
  }
  let pairs=0;for(const count of fullCounts)pairs+=count*(count-1);
  return {fullIoC:pairs/(n*(n-1)),maxPage};
}
function xorshift32(seed){
  let state=seed>>>0;
  return ()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;};
}
function distribution(values,actual){
  const sorted=values.slice().sort((a,b)=>a-b);
  const pct=p=>sorted[Math.floor(p*(sorted.length-1))];
  return {
    replicates:values.length,
    mean:values.reduce((s,x)=>s+x,0)/values.length,
    median:pct(0.5),p95:pct(0.95),p99:pct(0.99),
    maximum:sorted.at(-1),
    actualPercentile:sorted.filter(x=>x<=actual).length/values.length
  };
}
function run(){
  const pages=corpus.pages.filter(p=>p.page<=55&&p.status==='unsolved'&&p.indices.length)
    .map(p=>({page:p.page,indices:p.indices}));
  const p32=pages.find(p=>p.page===32);
  assert.ok(p32);assert.equal(p32.indices.length,121);
  const key=p32.indices.slice(25,38);
  assert.equal(key.length,13);
  assert.deepEqual(key,[27,4,16,2,0,0,3,2,8,3,19,18,14]);
  const primeSum=key.reduce((s,index)=>s+corpus.prime[index],0);
  assert.equal(primeSum,413);assert.equal(primeSum%29,7);
  const keyTokens=key.map(index=>corpus.translit[index]);
  assert.deepEqual(keyTokens,['IA','R','T','TH','F','F','O','TH','H','O','M','E','X']);

  const otherPages=pages.filter(p=>p.page!==32);
  const originalOther=otherPages.flatMap(p=>p.indices);
  const originalIoC=ioc(originalOther);
  const p33to39=pages.filter(p=>p.page>=33&&p.page<=39);
  const p0to31=pages.filter(p=>p.page<=31);
  const p40to55=pages.filter(p=>p.page>=40);
  const actual=[];
  for(const clock of ['continuous','page'])for(const sign of [-1,1]){
    actual.push({clock,sign,...score(pages,key,sign,clock)});
  }

  // Exact planted-English control under every tested sign/clock.
  const gibran=encodeGp29(gibranText);
  const totalRunes=pages.reduce((s,p)=>s+p.indices.length,0);
  const controlPlain=gibran.slice(0,totalRunes);
  assert.equal(controlPlain.length,totalRunes);
  const controlPages=[];let at=0;
  for(const page of pages){
    controlPages.push(controlPlain.slice(at,at+page.indices.length));
    at+=page.indices.length;
  }
  let positiveControls=0;
  for(const clock of ['continuous','page'])for(const sign of [-1,1]){
    const encrypted=applyPages(controlPages,key,-sign,clock);
    const recovered=applyPages(encrypted,key,sign,clock).flat();
    assert.deepEqual(recovered,controlPlain);
    positiveControls++;
  }

  // Matched null: 100 random 13-symbol GP29 keys, each evaluated across the
  // same four sign/clock models before taking full-book/page-local maxima.
  const rng=xorshift32(NULL_SEED),nullFull=[],nullPage=[];
  for(let replicate=0;replicate<NULL_REPLICATES;replicate++){
    const randomKey=Array.from({length:13},()=>rng()%MOD);
    let maxFull=0,maxPage=0;
    for(const clock of ['continuous','page'])for(const sign of [-1,1]){
      const result=scoreRandomKey(pages,randomKey,sign,clock);
      maxFull=Math.max(maxFull,result.fullIoC);
      maxPage=Math.max(maxPage,result.maxPage.ioc);
    }
    nullFull.push(maxFull);nullPage.push(maxPage);
  }

  function subsetScore(subset,sign,clock){
    const selected=new Set(subset.map(p=>p.page));
    let global=0;const out=[],scores=[];
    for(const page of pages){
      const pageOut=[];
      for(let i=0;i<page.indices.length;i++,global++){
        const keyIndex=clock==='page'?(i%13):(global%13);
        if(selected.has(page.page))pageOut.push(mod(page.indices[i]+sign*key[keyIndex]));
      }
      if(selected.has(page.page)){
        out.push(...pageOut);
        if(pageOut.length>=140)scores.push({page:page.page,n:pageOut.length,ioc:ioc(pageOut)});
      }
    }
    scores.sort((a,b)=>b.ioc-a.ioc);
    return {fullIoC:ioc(out),maxPage:scores[0]};
  }
  const bestFull=actual.slice().sort((a,b)=>b.fullIoC-a.fullIoC)[0];
  const bestPage=actual.slice().sort((a,b)=>b.maxPage.ioc-a.maxPage.ioc)[0];
  return {
    key:{p32LocalOffsets:[25,37],runeCount:key.length,gpIndices:key,gpTokens:keyTokens,primeSum,primeSumMod29:primeSum%29},
    corpus:{pages:pages.length,totalRunes,otherPages:otherPages.length,otherRunes:originalOther.length,originalOtherIoC:originalIoC,p33to39OriginalIoC:ioc(p33to39.flatMap(p=>p.indices)),gibranControlRunes:gibran.length,gibranControlIoC:ioc(gibran)},
    modelGrid:{signs:[-1,1],clocks:['continuous','page-reset'],models:4,positiveControls},
    actual:{models:actual,bestFull,bestPage},
    heldOutSubsets:{
      p0to31:{minus:subsetScore(p0to31,-1,'continuous'),plus:subsetScore(p0to31,1,'continuous')},
      p33to39:{minusContinuous:subsetScore(p33to39,-1,'continuous'),plusContinuous:subsetScore(p33to39,1,'continuous'),minusPage:subsetScore(p33to39,-1,'page'),plusPage:subsetScore(p33to39,1,'page')},
      p40to55:{minus:subsetScore(p40to55,-1,'continuous'),plus:subsetScore(p40to55,1,'continuous')}
    },
    matchedRandomNull:{
      seed:NULL_SEED,
      fullBook:distribution(nullFull,bestFull.fullIoC),
      pageLocal:distribution(nullPage,bestPage.maxPage.ioc)
    },
    decision:'The source-selected 13-rune window does not function as a direct repeating additive GP29 key on the other LP2 pages. This rejects only the four fixed period-13 variants; it does not reject the p32 selector/pole relationship or every possible use of the window.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
