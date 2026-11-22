'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const punctuation = require('../resources/liber-primus/lp2-punctuation-identity.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');

const ROOT=path.resolve(__dirname,'..');
const transcription=fs.readFileSync(
  path.join(ROOT,'resources/liber-primus/lp2-transcription.txt'),'utf8'
);
const CHAPTERS=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const RADIUS=64;
const BOOT=10000;
const MASK=Uint8Array.from(
  grid.pages.flatMap(page=>page.tokens),
  token=>Number(token[0]==='0')
);
assert.equal(MASK.length,256);

const pages=corpus.pages.filter(p=>p.page<=55);
const stream=pages.flatMap(p=>p.indices);
assert.equal(stream.length,12956);

const pageStarts=[];
let acc=0;
for(const p of pages){pageStarts[p.page]=acc; acc+=p.indices.length;}
assert.equal(acc,12956);

function chapterForPage(page){
  return CHAPTERS.findIndex(([a,b])=>a<=page&&page<=b);
}
function pageForOffset(offset){
  for(let p=pages.length-1;p>=0;p--) if(offset>=pageStarts[p]) return p;
  throw new Error('offset');
}
function chapterForOffset(offset){return chapterForPage(pageForOffset(Math.min(offset,stream.length-1)));}

const markEvents=punctuation.events.filter(e=>
  e.page<=55 && e.large_mark && e.large_mark.dot_count===13
);
assert.equal(markEvents.length,28);
const marks=[...new Set(markEvents.map(e=>e.rune_offset))].sort((a,b)=>a-b);
assert.equal(marks.length,26);

// Ordinary source-visible word separators: literal hyphens only. Line/page
// continuation markers do not create controls, and punctuation is excluded.
const runeSet=new Set(corpus.runes);
const hyphenBounds=[];
let runeCount=0;
for(const ch of transcription){
  if(runeSet.has(ch)){
    if(runeCount<stream.length) runeCount++;
  } else if(ch==='-' && runeCount>0 && runeCount<stream.length){
    hyphenBounds.push(runeCount);
  }
  if(runeCount>=stream.length) break;
}
const ordinary=[...new Set(hyphenBounds)]
  .filter(x=>RADIUS<=x && x<=stream.length-RADIUS && !marks.includes(x));
assert.ok(ordinary.length>1000);

function equalRate(a,b){
  let hit=0,n=0;
  for(let i=a;i+1<b;i++){n++; hit+=Number(stream[i]===stream[i+1]);}
  return n?hit/n:0;
}
function lagRate(a,b,lag){
  let hit=0,n=0;
  for(let i=a;i+lag<b;i++){n++;hit+=Number(stream[i]===stream[i+lag]);}
  return n?hit/n:0;
}
function diffHist(a,b){
  const h=new Array(29).fill(0);
  let n=0;
  for(let i=a;i+1<b;i++){
    h[(stream[i+1]-stream[i]+29)%29]++;n++;
  }
  return h.map(x=>x/n);
}
function kl(p,q){
  let s=0;
  for(let i=0;i<p.length;i++) if(p[i]>0) s+=p[i]*Math.log(p[i]/q[i]);
  return s;
}
function js(p,q){
  const m=p.map((x,i)=>(x+q[i])/2);
  return (kl(p,m)+kl(q,m))/2;
}
function boundaryMetrics(pos){
  const la=pos-RADIUS, lb=pos, ra=pos, rb=pos+RADIUS;
  return {
    adjDelta:Math.abs(equalRate(la,lb)-equalRate(ra,rb)),
    lag5Delta:Math.abs(lagRate(la,lb,5)-lagRate(ra,rb,5)),
    transitionJS:js(diffHist(la,lb),diffHist(ra,rb))
  };
}
const eligibleMarks=marks.filter(x=>RADIUS<=x&&x<=stream.length-RADIUS);
const markMetrics=eligibleMarks.map(pos=>({pos,chapter:chapterForOffset(pos),...boundaryMetrics(pos)}));
assert.ok(markMetrics.length>=20);

const controlsByChapter=Array.from({length:9},()=>[]);
for(const pos of ordinary) controlsByChapter[chapterForOffset(pos)].push(pos);
for(const m of markMetrics) assert.ok(controlsByChapter[m.chapter].length>0);

function mean(rows,key){return rows.reduce((s,r)=>s+r[key],0)/rows.length;}
const observed={
  adjDelta:mean(markMetrics,'adjDelta'),
  lag5Delta:mean(markMetrics,'lag5Delta'),
  transitionJS:mean(markMetrics,'transitionJS')
};
function xorshift32(seed){
  let state=seed>>>0;
  return ()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;};
}
const rnd=xorshift32(0x33011505);
const ge={adjDelta:0,lag5Delta:0,transitionJS:0};
const nullMeans={adjDelta:0,lag5Delta:0,transitionJS:0};
for(let trial=0;trial<BOOT;trial++){
  const sample=markMetrics.map(m=>{
    const pool=controlsByChapter[m.chapter];
    const pos=pool[rnd()%pool.length];
    return boundaryMetrics(pos);
  });
  for(const key of Object.keys(ge)){
    const value=mean(sample,key);
    nullMeans[key]+=value;
    if(value>=observed[key]-1e-15) ge[key]++;
  }
}
for(const key of Object.keys(ge)) nullMeans[key]/=BOOT;
const matched={
  trials:BOOT,
  observed,
  nullMean:nullMeans,
  upperTail:Object.fromEntries(Object.keys(ge).map(k=>[k,(ge[k]+1)/(BOOT+1)]))
};

const chapterTransfer=[];
for(let chapter=0;chapter<9;chapter++){
  const ms=markMetrics.filter(m=>m.chapter===chapter);
  const cs=controlsByChapter[chapter].map(pos=>boundaryMetrics(pos));
  if(!ms.length||!cs.length) continue;
  chapterTransfer.push({
    chapter,
    markerCount:ms.length,
    controlCount:cs.length,
    adjMarker:mean(ms,'adjDelta'),
    adjControl:mean(cs,'adjDelta'),
    lag5Marker:mean(ms,'lag5Delta'),
    lag5Control:mean(cs,'lag5Delta'),
    jsMarker:mean(ms,'transitionJS'),
    jsControl:mean(cs,'transitionJS')
  });
}

// Clock reset discriminator.
const chapterStarts=CHAPTERS.map(([p])=>pageStarts[p]);
const pageResetSet=new Set(pages.map(p=>pageStarts[p.page]));
const chapterResetSet=new Set(chapterStarts);
const markResetSet=new Set(marks);

function phaseAt(i,resetSet){
  if(!resetSet) return i&255;
  let last=0;
  // Small reset sets, direct search is clearer and deterministic.
  for(const x of resetSet){if(x<=i&&x>=last) last=x;}
  return (i-last)&255;
}
function scheduleCounts(resetSet){
  let selectedOpp=0,selectedHits=0,outsideOpp=0,outsideHits=0;
  let offset=0;
  for(const page of pages){
    for(let j=0;j+1<page.indices.length;j++){
      const i=offset+j;
      const selected=MASK[phaseAt(i,resetSet)]===1;
      const hit=page.indices[j]===page.indices[j+1];
      if(selected){selectedOpp++;selectedHits+=Number(hit);}
      else {outsideOpp++;outsideHits+=Number(hit);}
    }
    offset+=page.indices.length;
  }
  const a=selectedHits,b=selectedOpp-selectedHits,c=outsideHits,d=outsideOpp-outsideHits;
  const odds=((a+0.5)*(d+0.5))/((b+0.5)*(c+0.5));
  return {selectedOpp,selectedHits,outsideOpp,outsideHits,odds};
}

const MAX=12901;
const logFact=new Float64Array(MAX+1);
for(let i=2;i<=MAX;i++) logFact[i]=logFact[i-1]+Math.log(i);
const lc=(n,k)=>k<0||k>n?-Infinity:logFact[n]-logFact[k]-logFact[n-k];
function fisherUpper(x,n1,h,N){
  const hi=Math.min(n1,h), lo=Math.max(0,h-(N-n1));
  const logs=[];
  for(let k=Math.max(x,lo);k<=hi;k++) logs.push(lc(n1,k)+lc(N-n1,h-k)-lc(N,h));
  const m=Math.max(...logs);
  return Math.exp(m)*logs.reduce((s,v)=>s+Math.exp(v-m),0);
}
const schedules={
  continuous:scheduleCounts(null),
  thirteenDotReset:scheduleCounts(markResetSet),
  pageReset:scheduleCounts(pageResetSet),
  chapterReset:scheduleCounts(chapterResetSet)
};
for(const v of Object.values(schedules)){
  v.fisherUpper=fisherUpper(v.selectedHits,v.selectedOpp,86,12901);
}
assert.deepEqual(
  {o:schedules.continuous.selectedOpp,h:schedules.continuous.selectedHits},
  {o:3025,h:33}
);

console.log(JSON.stringify({
  source:{
    thirteenDotEvents:markEvents.length,
    uniqueThirteenDotOffsets:marks.length,
    eligibleLocalBoundaries:markMetrics.length,
    ordinaryHyphenControls:ordinary.length,
    localRadiusRunes:RADIUS
  },
  matchedBoundaryRegimeChange:matched,
  chapterTransfer:{
    chapters:chapterTransfer.length,
    adjMarkerGreater:chapterTransfer.filter(x=>x.adjMarker>x.adjControl).length,
    lag5MarkerGreater:chapterTransfer.filter(x=>x.lag5Marker>x.lag5Control).length,
    jsMarkerGreater:chapterTransfer.filter(x=>x.jsMarker>x.jsControl).length,
    rows:chapterTransfer
  },
  p50ClockResetDiscriminator:schedules
},null,2));
