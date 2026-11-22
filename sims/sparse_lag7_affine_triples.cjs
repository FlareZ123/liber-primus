"use strict";
/**
 * Key-free exhaustive F29 three-support affine feedback screen over all 7-rune
 * positions. Search every choice of 3 offsets among 0..6 and 28^2 nonzero
 * normalized coefficients: 35*784 = 27,440 triple directions.
 *
 * The 7-rune span can cover the original word-local six-back echo. Freeze
 * directions learned from the first half of word windows and score only heldout.
 * A synthetic original-word-length plant uses a hidden 3-term feedback rule.
 *
 * Run: node sims/sparse_lag7_affine_triples.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const ROOT = path.resolve(__dirname, "..");
const DOC = JSON.parse(fs.readFileSync(
  path.join(ROOT,"resources","liber-primus","lp2-corpus.json"),"utf8"));
const ALPHABET = new Map(DOC.runes.map((c,i)=>[c,i]));
const PAGES = DOC.pages.filter(p=>p.status==="unsolved"&&p.indices.length)
  .map(p=>p.indices);
const WORDS = parseSharedCorpus().words.map(w=>[...w.runes].map(c=>ALPHABET.get(c)));
const LONG = PAGES.flat();
assert.equal(PAGES.length,55);
assert.equal(WORDS.length,2896);
assert.equal(LONG.length,12956);
assert.deepEqual(WORDS.flat(),LONG);
const M=29, WIDTH=7;
const mod=x=>(x%M+M)%M;

/**
 * Windows are flat rows of 7 bytes. Do not merge source words in word mode.
 * @param {number[][]} groups
 * @returns {Uint8Array}
 */
function windows(groups){
  let n=0;
  for(const group of groups)n+=Math.max(0,group.length-WIDTH+1);
  const out=new Uint8Array(n*WIDTH);
  let pos=0;
  for(const group of groups)for(let i=0;i+WIDTH<=group.length;i++)
    for(let j=0;j<WIDTH;j++)out[pos++]=group[i+j];
  assert.equal(pos,out.length);
  return out;
}
/**
 * @param {Uint8Array} flat Seven-column windows.
 * @param {{i:number,j:number,k:number,a:number,b:number}} m
 */
function quality(flat,m){
  const n=flat.length/WIDTH;
  const h=new Uint16Array(M);
  const {i,j,k,a,b}=m;
  for(let t=0;t<flat.length;t+=WIDTH)
    h[(flat[t+i]+a*flat[t+j]+b*flat[t+k])%M]++;
  let sum=0,peak=0;
  for(let v=0;v<M;v++){
    sum+=h[v]*h[v];
    if(h[v]>h[peak])peak=v;
  }
  return {contrast:M*sum/(n*n)-1,peak,peakCount:h[peak],
    peakRate:h[peak]/n};
}
/**
 * Exhaustive finite family. Train scores alone choose the candidate list.
 * No original heldout output enters the parameter search.
 * @param {Uint8Array} flat
 * @param {number} [top=12]
 */
function evaluate(flat,top=12){
  const n=flat.length/WIDTH;
  const split=Math.floor(n/2);
  const train=flat.subarray(0,split*WIDTH);
  const test=flat.subarray(split*WIDTH);
  const candidates=[];
  for(let i=0;i<WIDTH;i++)for(let j=i+1;j<WIDTH;j++)
    for(let k=j+1;k<WIDTH;k++)
      for(let a=1;a<M;a++)for(let b=1;b<M;b++){
        const row={i,j,k,a,b};
        const score=quality(train,row);
        candidates.push({row,train:score.contrast});
      }
  assert.equal(candidates.length,27440);
  candidates.sort((a,b)=>b.train-a.train);
  const winners=candidates.slice(0,top).map(o=>({
    ...o,train:Object.keys(o).includes("train")?Number(o.train.toFixed(7)):undefined,
    ...{
      trainPeak:quality(train,o.row).peak,
      trainPeakRate:quality(train,o.row).peakRate,
      heldout:quality(test,o.row).contrast,
      heldoutPeakRate:(()=>{
        const m=o.row, p=quality(train,m).peak;
        let count=0;
        for(let at=0;at<test.length;at+=WIDTH){
          if((test[at+m.i]+m.a*test[at+m.j]+m.b*test[at+m.k])%M===p)count++;
        }
        return count/(test.length/WIDTH);
      })()
    }
  }));
  const lag6={target:"c[i] == 24 - 2*c[i-6] (mod29)"};
  let lagTrain=0,lagTest=0;
  for(let t=0;t<flat.length;t+=WIDTH){
    const yes=flat[t+6]===mod(24-2*flat[t]);
    if(t/WIDTH<split)lagTrain+=Number(yes);
    else lagTest+=Number(yes);
  }
  Object.assign(lag6,{trainHits:lagTrain,trainEligible:split,
    heldoutHits:lagTest,heldoutEligible:n-split});
  return {trainWindows:split,heldoutWindows:n-split,
    testedDirections:candidates.length,
    nullExpectedTrainContrast:28/split,
    nullExpectedHeldoutContrast:28/(n-split),
    top:winners,lag6FixedReference:lag6};
}
/** @param {number} seed */
function rng(seed){
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};
}
/**
 * Plant the three-term 6-back/1-back original-length feedback mechanism
 * C[i] = 5*C[i-6]+3*C[i-1]+13 (mod29), triggered on 13% of eligible sites.
 * Also rewrite equal consecutive outputs on 81% of such events.
 */
function plant(){
  const random=rng(0x24a71117),q=.13;
  let forced=0,repairs=0;
  const groups=WORDS.map(word=>{
    const out=[];
    for(let j=0;j<word.length;j++){
      let z=Math.floor(random()*M);
      if(j>=6&&random()<q){
        z=mod(5*out[j-6]+3*out[j-1]+13);
        forced++;
      }
      if(out.length&&z===out[j-1]&&random()<.81){
        z=mod(out[j-1]+1+Math.floor(random()*(M-1)));
        repairs++;
      }
      out.push(z);
    }
    return out;
  });
  const result=evaluate(windows(groups));
  const trueRow={i:0,j:5,k:6,a:18,b:23};
  const match=result.top.find(item=>Object.keys(trueRow).every(k=>item.row[k]===trueRow[k]));
  assert.ok(match,"Planted three-rune inverse direction must be recovered");
  return {seed:"0x24a71117",q,forced,repairs,trueRow,found:match,results:result};
}
function main(){
  const originalWord=evaluate(windows(WORDS));
  console.log("ORIGINAL_WORDS "+JSON.stringify(originalWord));
  const originalBook=evaluate(windows([LONG]));
  console.log("ORIGINAL_BOOK "+JSON.stringify(originalBook));
  const positive=plant();
  console.log("PLANTED "+JSON.stringify({
    seed:positive.seed,q:positive.q,forced:positive.forced,
    repairs:positive.repairs,trueRow:positive.trueRow,
    found:positive.found,top:positive.results.top.slice(0,3)
  }));
  return {originalWord,originalBook,positive};
}
if(require.main===module)main();
module.exports={windows,quality,evaluate,plant,main};
