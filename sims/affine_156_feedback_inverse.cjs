"use strict";
/**
 * Exhaustive nonconsecutive lag-(5,6) and lag-(1,5,6) additive-feedback
 * GP29 inverses on all original unknown LP2 rune pages.
 * Select on physical pages 0..27, independently test on 28..55.
 * Includes exact recovered GP-English planted-key regression.
 * Run: node sims/affine_156_feedback_inverse.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const GP=JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-corpus.json"),"utf8"));
const PAGES=GP.pages.filter(p=>p.status==="unsolved"&&p.indices.length);
assert.equal(PAGES.length,55);
assert.equal(PAGES.reduce((s,p)=>s+p.indices.length,0),12956);
const M=29;
const mod=x=>(x%M+M)%M;

/**
 * @param {Array<{page:number,indices:number[]}>} pages
 * @param {"page"|"continuous"} scope
 * @returns {Array<Array<[number,number,number,number]>>}
 */
function sourceRows(pages,scope) {
  const flat=pages.flatMap(p=>p.indices),halves=[[],[]];
  let offset=0;
  for(const page of pages) {
    const target=halves[page.page<28?0:1];
    for(let i=0;i<page.indices.length;i++) {
      const j=offset+i;
      if((scope==="page"&&i<6)||j<6)continue;
      target.push([flat[j],flat[j-1],flat[j-5],flat[j-6]]);
    }
    offset+=page.indices.length;
  }
  return halves;
}

/** @param {Array<[number,number,number,number]>} rows */
function ioc(rows,a,b,d) {
  const hist=new Uint16Array(M);
  for(const [c,p1,p5,p6] of rows)hist[mod(c-a*p1-b*p5-d*p6)]++;
  const numerator=hist.reduce((s,n)=>s+n*(n-1),0);
  return numerator/(rows.length*(rows.length-1));
}

/** Exhaust all coefficients, retaining the strongest training candidates. */
function search(train,test,threeTap,trueKey=null) {
  let rank=0,full=0,top=[];
  const truth=trueKey?ioc(train,...trueKey):null;
  for(let a=0;a<(threeTap?M:1);a++)
    for(let b=0;b<M;b++)
      for(let d=0;d<M;d++) {
        full++;
        const value=ioc(train,a,b,d);
        if(truth!==null&&value>=truth-1e-14)rank++;
        if(top.length===6&&value<=top.at(-1).train)continue;
        top.push({a,b,d,train:value});
        top.sort((x,y)=>y.train-x.train);
        if(top.length>6)top.pop();
      }
  for(const row of top)row.heldout=ioc(test,row.a,row.b,row.d);
  return {models:full,samples:[train.length,test.length],top,
    ...(trueKey?{trueKey,rank,trueTrain:truth,
      trueHeldout:ioc(test,...trueKey)}:{})};
}

/** GP spelling from a separate portion of an independently pinned text. */
function sourceEnglish(count) {
  const raw=fs.readFileSync(path.join(ROOT,
    "resources/control/shakespeare_first300k.txt"),"utf8").slice(180000);
  const tokens=GP.translit.map((token,i)=>[token,i])
    .sort((a,b)=>b[0].length-a[0].length);
  const result=[];
  for(const sourceWord of raw.toUpperCase().match(/[A-Z]+/g)||[]) {
    const word=sourceWord.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S");
    for(let i=0;i<word.length;) {
      const pair=tokens.find(([s])=>word.startsWith(s,i));
      assert(pair,"Unknown GP token");
      result.push(pair[1]);
      i+=pair[0].length;
    }
    if(result.length>=count)break;
  }
  assert(result.length>=count);
  return result.slice(0,count);
}

/**
 * Invertible planted ciphertext for P_i=C_i-aC_(i-1)-bC_(i-5)-dC_(i-6),
 * with 6 known initial symbols per physical rune page.
 * @param {number[]} plain
 * @param {[number,number,number]} key
 */
function plant(plain,key) {
  const [a,b,d]=key,pages=[],recovered=[];
  let offset=0;
  for(const page of PAGES) {
    const c=[];
    for(let i=0;i<page.indices.length;i++) {
      const v=plain[offset+i];
      c.push(i<6?v:mod(v+a*c[i-1]+b*c[i-5]+d*c[i-6]));
      recovered.push(i<6?c[i]:mod(c[i]-a*c[i-1]-b*c[i-5]-d*c[i-6]));
    }
    pages.push({...page,indices:c});
    offset+=page.indices.length;
  }
  assert.deepEqual(recovered,plain);
  return pages;
}
function run() {
  const original={};
  for(const scope of ["page","continuous"]) {
    const [train,test]=sourceRows(PAGES,scope);
    original[scope]={lag56:search(train,test,false),
      lag156:search(train,test,true)};
  }
  assert.deepEqual([original.page.lag56.top[0].b,
    original.page.lag56.top[0].d],[3,25]);
  assert.deepEqual([original.page.lag156.top[0].a,
    original.page.lag156.top[0].b,
    original.page.lag156.top[0].d],[1,0,0]);
  const key=[7,11,19],plain=sourceEnglish(12956);
  const cipher=plant(plain,key);
  const [train,test]=sourceRows(cipher,"page");
  const positive=search(train,test,true,key);
  assert.equal(positive.rank,1);
  assert.deepEqual([positive.top[0].a,positive.top[0].b,
    positive.top[0].d],key);
  return {formula:"P_i=C_i-a*C_(i-1)-b*C_(i-5)-d*C_(i-6) mod29; lag56 fixes a=0",
    source:"original 55 rune-bearing unknown LP2 pages, 12956 runes",
    original,independentPlaintextPlant:{
      actualTrueKey:key,uniqueTrainingRank:positive.rank,
      trueTrainIoC:positive.trueTrain,trueHeldoutIoC:positive.trueHeldout,
      allRecoveredRunes:plain.length},
    interpretation:"No new original plaintext, key, or source transformation recovered."};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={sourceRows,ioc,search,sourceEnglish,plant,run};
