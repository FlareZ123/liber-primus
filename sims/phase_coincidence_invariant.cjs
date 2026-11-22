'use strict';
/**
 * Bijective-cipher phase equality: a fixed unknown 29-symbol outer alphabet
 * preserves exact equality of glyphs. Any key repeated at the same manuscript
 * position must preserve the elevated plaintext same-rune collision rate across
 * independent passages, regardless of the actual pad symbols.
 *
 * Two separate models are tested:
 *  (1) a shared page-reset stream, with no key skips after extra draws;
 *  (2) one continuous periodic stream of unknown period 2..1600.
 * Their nulls preserve individual page ciphertext and symbol frequencies by
 * independently rotating pages; 100 planted heldout-GP-English manuscripts
 * per source class demonstrate explicit detector power.
 *
 * A key-skip policy, a different outer alphabet per page, non-English GP
 * plaintext, or a deliberate output rewriter beyond sparse anti-doublets are
 * outside the necessary-condition argument.
 * Node.js 22; invoke on demand (never on automatic push).
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {corpusWords}=require('./relative_key_english_probe.cjs');
const ROOT=path.resolve(__dirname,'..');
const corp=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const physical=corp.pages.filter(p=>p.page<56&&p.indices.length>0).map(p=>p.indices);
assert.equal(physical.length,55);
const TOTAL=physical.reduce((n,x)=>n+x.length,0);
assert.equal(TOTAL,12956);
const heldout=corpusWords(fs.readFileSync(path.join(
  ROOT,'resources/control/shakespeare_first300k.txt'),'utf8').slice(240000)).flat();
assert.ok(heldout.length>TOTAL);
const maxPage=Math.max(...physical.map(p=>p.length)),MAX_PERIOD=1600;
let seed=0x341112;
/** @returns {number} */
function random(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;}
/** @param {number} n */
function choice(n){return Math.floor(random()*n);}
/** @param {number[]} v */
function shuffle(v){const a=v.slice();for(let i=a.length-1;i>0;i--){const j=choice(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
/**
 * Within every physical page offset i, count equal pairs of ciphertext
 * symbols among the pages whose length exceeds i. This remains invariant
 * under any fixed bijection applied to all cipher glyphs.
 * @param {number[][]} pages
 * @param {number[]} offsets
 */
function pageRate(pages,offsets=pages.map(()=>0)){
  const hist=new Uint16Array(maxPage*29),exp=new Uint16Array(maxPage);
  let hit=0,pairs=0;
  for(let j=0;j<pages.length;j++){
    const page=pages[j],offset=offsets[j];
    for(let i=0;i<page.length;i++){
      const bin=29*i+page[(i+offset)%page.length];
      hit+=hist[bin]++;
      pairs+=exp[i]++;
    }
  }
  return {hit,pairs,rate:hit/pairs};
}
/**
 * For every modulus L, count equal glyphs among positions equivalent modulo
 * L in the entire concatenated manuscript. Scan max over 1599 distinct L.
 * @param {number[]} symbols
 * @param {number} limit
 */
function periodicMaximum(symbols,limit=Infinity){
  let best={period:0,z:-Infinity,rate:0};
  for(let period=2;period<=MAX_PERIOD;period++){
    const cells=new Uint16Array(period*29);
    let hits=0;
    for(let i=0;i<symbols.length;i++){
      const ix=29*(i%period)+symbols[i];
      hits+=cells[ix]++;
    }
    const q=Math.floor(symbols.length/period),rem=symbols.length%period;
    const pairs=period*q*(q-1)/2+rem*q;
    const p=1/29,z=(hits-pairs*p)/Math.sqrt(pairs*p*(1-p));
    if(z>best.z)best={period,z,rate:hits/pairs};
    if(z>=limit)break;
  }
  return best;
}
/** @param {number[][]} pages */
function globalRate256(pages){
  const cells=new Uint16Array(256*29),counts=new Uint16Array(256);
  let hits=0,pairs=0,position=0;
  for(const page of pages)for(const x of page){
    const k=position++&255;
    hits+=cells[k*29+x]++;pairs+=counts[k]++;
  }
  return hits/pairs;
}
/**
 * Plant independent GP-English plaintext from the withheld 60k characters,
 * a single outer random glyph permutation, and collision rewrites with 81%
 * probability. Key phases either reset to a common 256-rune pad per page,
 * continue globally, or vary independently between pages.
 * @param {'page'|'global'|'independent'} mode
 */
function plant(mode){
  const pad=Array.from({length:256},()=>choice(29));
  const sigma=shuffle(Array.from({length:29},(_,i)=>i));
  let cursor=choice(heldout.length-TOTAL),absolute=0;
  const synthetic=physical.map(original=>{
    const local=Array.from({length:256},()=>choice(29));
    const result=[];
    for(let i=0;i<original.length;i++){
      const phase=mode==='global'?absolute&255:i&255;
      const key=mode==='independent'?local[phase]:pad[phase];
      let c=sigma[(heldout[cursor++]+key)%29];
      if(i>0&&c===result[i-1]&&random()<.81)
        c=(c+1+choice(28))%29;
      result.push(c);
      absolute++;
    }
    return result;
  });
  return {pageRate:pageRate(synthetic).rate,global256:globalRate256(synthetic)};
}
/** @param {number[]} x */
function summarize(x){
  const sorted=x.slice().sort((a,b)=>a-b),n=sorted.length;
  return {minimum:sorted[0],median:sorted[Math.floor(n/2)],
    q05:sorted[Math.floor(.05*n)],q95:sorted[Math.floor(.95*n)],
    maximum:sorted[n-1]};
}
function main(){
  const observedPage=pageRate(physical),flat=physical.flat();
  const rotatedPage=[];
  for(let i=0;i<1000;i++)
    rotatedPage.push(pageRate(physical,physical.map(p=>choice(p.length))).rate);
  const pageUpper=(rotatedPage.filter(v=>v>=observedPage.rate).length+1)/
    (rotatedPage.length+1);
  const observedPeriod=periodicMaximum(flat);
  let periodExceed=0;
  for(let i=0;i<160;i++){
    const joined=physical.flatMap(p=>{const shift=choice(p.length);return p.map(
      (_,j)=>p[(j+shift)%p.length]);});
    if(periodicMaximum(joined,observedPeriod.z).z>=observedPeriod.z)
      periodExceed++;
  }
  const controls={};
  for(const mode of ['page','global','independent']){
    const samples=Array.from({length:100},()=>plant(mode));
    controls[mode]={page:summarize(samples.map(x=>x.pageRate)),
      global256:summarize(samples.map(x=>x.global256))};
  }
  const result={
    observation:'Outer-bijection invariant phase coincidence, direct no-skip alignment',
    pages:physical.length,runes:TOTAL,randomBaseline:1/29,
    pageReset:{observed:observedPage,rotationNull:1000,
      rotationP:pageUpper,rotationRates:summarize(rotatedPage)},
    globalRepeat:{periodsTested:[2,1600],best:observedPeriod,
      independentPageRotationNull:160,exceedances:periodExceed,
      familywiseP:(periodExceed+1)/161,
      period256Rate:globalRate256(physical)},
    plantedControls:{heldoutRunes:heldout.length,antiRepeatRewriteProbability:.81,
      samplesPerMode:100,...controls},
    limitations:'Direct fixed-phase bijections and English-register plaintext; independent per-page outer alphabets, key skips and non-English registers are untested.'
  };
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  return result;
}
if(require.main===module)main();
module.exports={pageRate,periodicMaximum,globalRate256,plant,main};
