#!/usr/bin/env node
"use strict";
const assert = require("node:assert/strict");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");
const { words, runeCount, crossPageWords } = parseSharedCorpus();
const runes = words.map(w => Array.from(w.runes));
const ranges = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const chapter = p => ranges.findIndex(([a,b]) => p >= a && p <= b);
const rows = words.map((w,i) => {
  const r = runes[i], prev = i ? runes[i-1] : null, next = i+1<words.length ? runes[i+1] : null;
  const internal = r.slice(1).reduce((n,x,j) => n + (x === r[j] ? 1 : 0), 0);
  const after = next && r.at(-1) === next[0] ? 1 : 0;
  const before = prev && prev.at(-1) === r[0] ? 1 : 0;
  return {
    index:i, startPage:w.startPage, length:r.length, internal, after, before,
    eAfter:internal+after, eBefore:internal+before,
    previousLength:prev ? prev.length : null, nextLength:next ? next.length : null,
    deltaPrev:prev ? r.length-prev.length : null,
    deltaNext:next ? next.length-r.length : null,
    chapter:chapter(w.startPage),
    previousChapter:i ? chapter(words[i-1].startPage) : null,
    nextChapter:next ? chapter(words[i+1].startPage) : null
  };
});
function H(a) {
  const m=new Map(); for(const x of a) m.set(x,(m.get(x)||0)+1);
  let h=0; for(const n of m.values()) { const p=n/a.length; h-=p*Math.log2(p); } return h;
}
function MI(x,y) {
  const n=x.length, hx=H(x), hy=H(y), m=new Map();
  for(let i=0;i<n;i++){const k=JSON.stringify([x[i],y[i]]);m.set(k,(m.get(k)||0)+1);}
  let hj=0; for(const v of m.values()){const p=v/n;hj-=p*Math.log2(p);} return hx+hy-hj;
}
function stats(a,e,feature) {
  const xs=a.map(x=>x[e]), ys=a.map(feature), h=H(xs), mi=MI(xs,ys);
  return {n:a.length,H_state:h,MI:mi,total_MI:mi*a.length,H_given_feature:h-mi,residual_bits:(h-mi)*a.length};
}
function permute(a,e,feature,trials,seed) {
  const groups=Array.from({length:9},(_,ch)=>a.filter(x=>x.chapter===ch));
  const observed=MI(a.map(x=>x[e]),a.map(feature));
  let state=seed>>>0, ge=0, sum=0, sum2=0;
  const rand=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296;};
  const shuffle=v=>{const b=v.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;};
  for(let t=0;t<trials;t++){
    const xs=[],ys=[];
    for(const g of groups){xs.push(...shuffle(g.map(x=>x[e])));ys.push(...g.map(feature));}
    const v=MI(xs,ys);sum+=v;sum2+=v*v;if(v>=observed)ge++;
  }
  const mean=sum/trials, sd=Math.sqrt(Math.max(0,sum2/trials-mean*mean));
  return {observed,mean,sd,ge,trials,seed:"0x"+(seed>>>0).toString(16),p:(ge+1)/(trials+1)};
}
const internal=rows.reduce((n,x)=>n+x.internal,0), boundary=rows.reduce((n,x)=>n+x.after,0);
const dist=Object.fromEntries([0,1,2].map(k=>[String(k),rows.filter(x=>x.eAfter===k).length]));
assert.equal(runeCount,12956);assert.equal(words.length,2896);assert.equal(crossPageWords.length,32);
assert.equal(internal,63);assert.equal(boundary,23);assert.equal(internal+boundary,86);
assert.deepEqual(dist,{"0":2812,"1":82,"2":2});
const forward=rows.filter(x=>x.deltaNext!==null&&x.chapter===x.nextChapter);
const backward=rows.filter(x=>x.deltaPrev!==null&&x.chapter===x.previousChapter);
const centered=rows.filter(x=>x.deltaPrev!==null&&x.deltaNext!==null&&x.chapter===x.previousChapter&&x.chapter===x.nextChapter);
const p27=rows[1476];
assert.equal(p27.startPage,27);assert.equal(p27.length,12);assert.equal(p27.internal,2);
assert.equal(p27.previousLength,4);assert.equal(p27.nextLength,2);
const d10=rows.filter(x=>x.deltaNext===-10);
assert.equal(d10.length,6);assert.equal(d10.filter(x=>x.eAfter===2).length,1);assert.equal(d10.filter(x=>x.eAfter===0).length,5);
const signSummary=Object.fromEntries([-1,0,1].map(s=>{const g=forward.filter(x=>Math.sign(x.deltaNext)===s);return[String(s),{n:g.length,exceptionWords:g.filter(x=>x.eAfter>0).length,rate:g.filter(x=>x.eAfter>0).length/g.length}];}));
const turn=x=>x.deltaPrev>0&&x.deltaNext<0?"peak":x.deltaPrev<0&&x.deltaNext>0?"trough":"monotone";
const result={
 source:{runeCount,words:words.length,crossPageWords:crossPageWords.length,withinDoublets:internal,boundaryDoublets:boundary,totalDoublets:internal+boundary,exceptionCountDistribution:dist},
 forward:{information:stats(forward,"eAfter",x=>x.deltaNext),permutation:permute(forward,"eAfter",x=>x.deltaNext,5000,0x33011456),signSummary},
 backward:{information:stats(backward,"eBefore",x=>x.deltaPrev),permutation:permute(backward,"eBefore",x=>x.deltaPrev,5000,0x3301bacc)},
 centeredThreeWord:{information:stats(centered,"eAfter",x=>JSON.stringify([x.previousLength,x.length,x.nextLength])),permutation:permute(centered,"eAfter",x=>JSON.stringify([x.previousLength,x.length,x.nextLength]),3000,0x3301c0de),turnMI:MI(centered.map(x=>x.eAfter),centered.map(turn))},
 p27:{wordIndex:p27.index,page:p27.startPage,length:p27.length,internalDoublets:p27.internal,previousLength:p27.previousLength,nextLength:p27.nextLength,deltaPrev:p27.deltaPrev,deltaNext:p27.deltaNext},
 deltaMinus10:{transitions:d10.length,withTwoExceptions:d10.filter(x=>x.eAfter===2).length,withZeroExceptions:d10.filter(x=>x.eAfter===0).length}
};
console.log(JSON.stringify(result,null,2));
