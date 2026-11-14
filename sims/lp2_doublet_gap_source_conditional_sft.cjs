"use strict";

// Independent source-conditioned test of the pre-registered T7 doublet-gap signal.
// Run: node sims/lp2_doublet_gap_source_conditional_sft.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname,"..","resources","liber-primus");
/** @type {{runes: string[],pages:{page:number,indices:number[]}[]}} */
const corpus = JSON.parse(fs.readFileSync(path.join(root,"lp2-corpus.json"),"utf8"));
const transcript = fs.readFileSync(path.join(root,"lp2-transcription.txt"),"utf8");
const originalPages = transcript.split("%");
const runeSet = new Set(corpus.runes);
const chapterEnds = [729,1874,3603,5506,6527,7960,9640,12648,12956];
/** @typedef {{pool:number[],count:number}} Stratum */
/** @type {Stratum[]} */
const chapters=chapterEnds.map(()=>({pool:[],count:0}));
/** @type {Stratum[]} */
const pages=Array.from({length:56},()=>({pool:[],count:0}));
/** @type {Map<string,Stratum>} */
const pageContext=new Map();
/** @type {number[]} */
const sites=[];
/** @type {{[key:string]:number}} */
const contextCounts={};
let globalOffset=0;
for(let p=0;p<56;p++){
  const original=corpus.pages[p].indices.map(i=>corpus.runes[i]);
  const printed=p===50?"":originalPages[p<50?p:p-1];
  let prior=null,sep="",local=-1;
  /** @type {string[]} */
  const discovered=[];
  for(const symbol of printed){
    if(runeSet.has(symbol)){
      local++;
      discovered.push(symbol);
      if(prior!==null){
        const site=globalOffset+local-1;
        const ch=chapterEnds.findIndex(end=>end>site);
        assert.ok(ch>=0);
        const context=sep.includes(".")?"sentence":sep.includes("&")||sep.includes("$")?"paragraph":sep.includes("-")?"word":"inside";
        const contextKey=p+":"+context;
        if(!pageContext.has(contextKey))pageContext.set(contextKey,{pool:[],count:0});
        const entry=pageContext.get(contextKey);
        assert.ok(entry);
        chapters[ch].pool.push(site);
        pages[p].pool.push(site);
        entry.pool.push(site);
        if(prior===symbol){
          chapters[ch].count++;
          pages[p].count++;
          entry.count++;
          sites.push(site);
          contextCounts[context]=(contextCounts[context]??0)+1;
        }
      }
      prior=symbol;
      sep="";
    }else sep+=symbol;
  }
  assert.deepEqual(discovered,original);
  globalOffset+=original.length;
}
assert.equal(globalOffset,12956);
assert.equal(sites.length,86);
assert.deepEqual(chapters.map(x=>x.count),[4,6,9,10,11,13,12,18,3]);
assert.deepEqual(contextCounts,{word:22,inside:63,sentence:1});

/** @param {readonly number[]} pos @returns {number} */
function gapAc1(pos){
  const n=pos.length-1;
  /** @type {number[]} */
  const gaps=[];
  for(let i=0;i<n;i++)gaps.push(pos[i+1]-pos[i]);
  const m=n-1;
  let mx=0,my=0;
  for(let i=0;i<m;i++){mx+=gaps[i];my+=gaps[i+1];}
  mx/=m;my/=m;
  let cov=0,vx=0,vy=0;
  for(let i=0;i<m;i++){
    const x=gaps[i]-mx,y=gaps[i+1]-my;
    cov+=x*y;vx+=x*x;vy+=y*y;
  }
  return cov/Math.sqrt(vx*vy);
}
const observed=gapAc1(sites);
assert.ok(Math.abs(observed-0.38001968924100965)<1e-12);
const plant=[0];
for(let i=0;i<85;i++)plant.push(plant.at(-1)+(i<42?30:200));
assert.ok(gapAc1(plant)>.9);

let state=0x33012026;
/** @returns {number} */
function next(){state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296;}
/** @param {readonly Stratum[]} groups @param {number} draws */
function simulate(groups,draws){
  let exceed=0,sum=0,sumSq=0;
  for(let d=0;d<draws;d++){
    /** @type {number[]} */
    const pos=[];
    for(const {pool,count} of groups){
      if(count===0)continue;
      const chosen=new Set();
      while(chosen.size<count)chosen.add(pool[Math.floor(next()*pool.length)]);
      for(const site of chosen)pos.push(site);
    }
    pos.sort((a,b)=>a-b);
    assert.equal(pos.length,86);
    const v=gapAc1(pos);
    if(v>=observed)exceed++;
    sum+=v;sumSq+=v*v;
  }
  return {draws,mean:sum/draws,sd:Math.sqrt(sumSq/draws-(sum/draws)**2),exceed,upperTail:(exceed+1)/(draws+1)};
}
const allEligible=pages.flatMap(x=>x.pool);
const global=[{pool:allEligible,count:86}];
const draws=40000;
const outcomes={
  flat:simulate(global,draws),
  fixedVisibleChapterCounts:simulate(chapters,draws),
  fixedPageCounts:simulate(pages,draws),
  fixedPageAndWordBoundaryCounts:simulate([...pageContext.values()],draws)
};
assert.ok(outcomes.flat.upperTail<0.005);
assert.ok(outcomes.fixedVisibleChapterCounts.upperTail<0.005);
assert.ok(outcomes.fixedPageCounts.upperTail<0.025);
assert.ok(outcomes.fixedPageAndWordBoundaryCounts.upperTail<0.025);
console.log(JSON.stringify({
  source:"Original LP2 pp0–55, printed source chapter/page/word boundaries",
  runes:12956,sites:86,sourceContextCounts:contextCounts,
  sourceChapterCounts:chapters.map(x=>x.count),originalGapPearsonAc1:observed,
  sourceConditionedNulls:outcomes,positivePlantGapAc1:gapAc1(plant),status:"PASS",
  limits:"Conditional placement tests, not decryption, and exploratory once external T7 statistic known."
},null,2));
