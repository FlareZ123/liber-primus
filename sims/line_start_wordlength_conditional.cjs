'use strict';

/**
 * Source-exact printed line-start selection test conditioned on the
 * page and complete GP word length of each actual line-leading word.
 *
 * Usage: node sims/line_start_wordlength_conditional.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {pages,prng,dot} = require('./physical_line_initial_crosspage_heldout.cjs');
const ROOT = path.resolve(__dirname,'..');
const source = fs.readFileSync(path.join(ROOT,
  'resources/transcriptions/liber_primus_master.txt'),'utf8');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
  'resources/liber-primus/lp2-corpus.json'),'utf8'));
const RUNES = new Set(corpus.runes);
const manuscript = pages();
const byPage = new Map(manuscript.map(p=>[p.page,p]));
const starts = new Map();
let page = 0,position = 0,needsStart = true,word = null;
function finish() {
  if (!word) return;
  starts.set(word.page+':'+word.position,word.length);
  word = null;
}
for (const ch of source.split('%').slice(16,72).join('%')) {
  if (RUNES.has(ch)) {
    if (needsStart) word={page,position,length:0};
    word.length++;
    position++;
    needsStart=false;
  } else if (ch==='%') {
    page++;
    position=0;
  } else if (ch==='/' || /\s/u.test(ch)) {
    // Typographic delimiters do not end a cipher word.
  } else {
    finish();
    needsStart=true;
  }
}
finish();
assert.equal(starts.size,2896);
const groups = manuscript.map(page=>{
  const byLength = new Map();
  for (const site of page.wordStarts) {
    const length=starts.get(page.page+':'+site);
    assert.ok(Number.isInteger(length)&&length>0);
    if (!byLength.has(length)) byLength.set(length,{pool:[],target:0});
    byLength.get(length).pool.push(site);
  }
  const wordSites=new Set(page.wordStarts);
  for (const site of page.beginWords) {
    assert.ok(wordSites.has(site));
    const length=starts.get(page.page+':'+site);
    byLength.get(length).target++;
  }
  return {page,byLength};
});
const even=groups.filter(g=>g.page.page%2===0);
const odd=groups.filter(g=>g.page.page%2===1);
/** @param {typeof groups} half @param {number[][]|null} draw */
function zScore(half,draw=null) {
  const obs=new Float64Array(29),exp=new Float64Array(29);
  for(let j=0;j<half.length;j++) {
    const g=half[j],observed=draw?draw[j]:g.page.beginWords;
    observed.forEach(site=>obs[g.page.runic[site]]++);
    for(const x of g.byLength.values()) {
      if(!x.target)continue;
      const bins=new Float64Array(29);
      x.pool.forEach(site=>bins[g.page.runic[site]]++);
      for(let c=0;c<29;c++)exp[c]+=x.target*bins[c]/x.pool.length;
    }
  }
  return Float64Array.from(obs,(v,i)=>(v-exp[i])/Math.sqrt(exp[i]));
}
/** @param {typeof groups} half @param {()=>number} random */
function sample(half,random) {
  return half.map(g=>{
    const chosen=[];
    for(const x of g.byLength.values()) {
      const sites=x.pool.slice();
      for(let j=0;j<x.target;j++) {
        const k=j+random()%(sites.length-j);
        [sites[j],sites[k]]=[sites[k],sites[j]];
        chosen.push(sites[j]);
      }
    }
    return chosen;
  });
}
function run() {
  const reps=Number(process.env.NULL_TRIALS||50000);
  assert.ok(Number.isInteger(reps)&&reps>=100);
  const evenZ=zScore(even),oddZ=zScore(odd);
  const observed=dot(evenZ,oddZ),random=prng(0x19c1da32);
  let exceed=0,sum=0,max=-Infinity;
  for(let i=0;i<reps;i++) {
    const result=dot(zScore(even,sample(even,random)),
      zScore(odd,sample(odd,random)));
    exceed+=Number(result>=observed);
    sum+=result;
    max=Math.max(max,result);
  }
  const lengths={};
  for(const g of groups)for(const [n,x]of g.byLength)
    if(x.target)lengths[n]=(lengths[n]||0)+x.target;
  const report={
    hypothesis:'The printed-line-new-word glyph signature is more than original page/word-length selection',
    exactOriginalWords:starts.size,originalRunes:12956,
    lineLeadingWords:151,lengthMatchedLineStarts:lengths,
    score:'cross-alternating-page dot of standardized length-conditioned leading-rune residuals',
    observedDot:observed,evenChi:dot(evenZ,evenZ),oddChi:dot(oddZ,oddZ),
    null:'within each physical page and exact whole-word length, uniformly sample the same number of original word starts without replacement',
    nullReplicates:reps,seed:'0x19c1da32',
    exceedances:exceed,addOneP:(exceed+1)/(reps+1),
    nullMean:sum/reps,nullMaximum:max,
    interpretation:'Original-layout conditional result; no LP2 decryption or identified typographic cipher'
  };
  console.log(JSON.stringify(report,null,2));
  return report;
}
if(require.main===module)run();
module.exports={run};
