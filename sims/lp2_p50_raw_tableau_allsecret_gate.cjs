#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8').replace(/\r\n/g,'\n');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json')),grid=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const C=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),B=grid.pages.flatMap(p=>p.bytes),N=C.length;
assert.equal(N,12956);assert.equal(B.length,256);assert.equal(new Set(B).size,161);
const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function encodeWord(w){const out=[];for(let i=0;i<w.length;){if(w.startsWith('ING',i)){out.push(21);i+=3;continue;}if(w.startsWith('IO',i)){out.push(27);i+=2;continue;}const t=tokens.find(x=>w.startsWith(x.s,i));assert(t,'unmapped '+w.slice(i));out.push(t.i);i+=t.s.length;}return out;}
function encodeNativeWords(raw){const text=raw.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');return (text.match(/[A-Z]+/g)||[]).map(encodeWord);}
const alpha='0123456789ABCDEFGHIJKLMNOPQRS';
const vulgateWords=read('resources/control/latin-vulgate-gp-wholewords.txt').split('\n').filter(x=>/^[0-9A-S]+$/.test(x)).map(w=>w.split('').map(c=>alpha.indexOf(c)));
const sources=[
 {name:'Shakespeare',words:encodeNativeWords(read('resources/control/shakespeare_first300k.txt'))},
 {name:'Gibran',words:encodeNativeWords(read('resources/control/gibran_prophet_58585.txt'))},
 {name:'Emerson',words:encodeNativeWords(read('resources/control/emerson_essays_2944.txt'))},
 {name:'Latin Vulgate',words:vulgateWords}
];
const flatSources=sources.map(s=>({name:s.name,runes:s.words.flat()}));
const ix=new Map(gp.runes.map((r,i)=>[r,i])),rx=new RegExp('['+gp.runes.join('')+']+','gu');
const originalWords=(read('resources/lp2-transcription.txt').split('%').slice(0,55).join('%').replace(/\/\r?\n/g,'').replace(/[\r\n%]/g,'').match(rx)||[]).map(w=>Array.from(w,c=>ix.get(c)));
const lengths=originalWords.map(w=>w.length),NWORDS=originalWords.length,uniqueLengths=[...new Set(lengths)];
assert.equal(NWORDS,2896);assert.equal(originalWords.flat().length,N);assert.equal(Math.min(...lengths),1);assert.equal(Math.max(...lengths),14);
assert.deepEqual(sources.map(s=>s.words.length),[55407,15733,77932,39835]);
const pools=sources.map(s=>{const m=new Map();for(const w of s.words){if(!m.has(w.length))m.set(w.length,[]);m.get(w.length).push(w);}for(const n of uniqueLengths)assert(m.has(n),s.name+' missing word length '+n);return {name:s.name,pools:m,wordCount:s.words.length};});
function finish(g){let pairs=0,hits=0;const top=Array(12).fill(0),sizes=[];for(const row of g.values()){const a=Array.from(row).sort((x,y)=>y-x),n=a.reduce((s,x)=>s+x,0);sizes.push(n);pairs+=n*(n-1)/2;for(const x of a)hits+=x*(x-1)/2;let z=0;for(let k=0;k<12;k++){z+=a[k];top[k]+=z;}}return {groups:g.size,pairs,hits,rate:hits/pairs,top,minGroup:Math.min(...sizes),maxGroup:Math.max(...sizes)};}
function measureRunes(xs,key){const g=new Map();for(let i=0;i<N;i++){const v=key[i%key.length];let a=g.get(v);if(!a){a=new Uint32Array(29);g.set(v,a);}a[xs[i]]++;}return finish(g);}
function measureWords(words,key){const g=new Map();for(let wi=0;wi<words.length;wi++){const v=key[wi%key.length];let a=g.get(v);if(!a){a=new Uint32Array(29);g.set(v,a);}for(const x of words[wi])a[x]++;}return finish(g);}
function windows(xs){const starts=[],step=Math.floor(N/2);for(let s=0;s+N<=xs.length;s+=step)starts.push(s);if(starts.length&&starts[starts.length-1]+N<xs.length)starts.push(xs.length-N);return starts.map(s=>xs.slice(s,s+N));}
function rng(seed){let s=seed>>>0;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};}
function plantRunes(xs,key,seed){const rnd=rng(seed),p=new Map();for(const v of new Set(key)){const a=Array.from({length:29},(_,i)=>i);for(let j=28;j>0;j--){const k=rnd()%(j+1);[a[j],a[k]]=[a[k],a[j]];}p.set(v,a);}return xs.map((x,i)=>p.get(key[i%key.length])[x]);}
function plantWords(words,key,seed){const rnd=rng(seed),p=new Map();for(const v of new Set(key)){const a=Array.from({length:29},(_,i)=>i);for(let j=28;j>0;j--){const k=rnd()%(j+1);[a[j],a[k]]=[a[k],a[j]];}p.set(v,a);}return words.map((w,i)=>w.map(x=>p.get(key[i%key.length])[x]));}
function sampleWords(pool,seed){const rnd=rng(seed);return lengths.map(L=>{const a=pool.pools.get(L);return a[rnd()%a.length];});}
function summarizeContinuous(key){const orig=measureRunes(C,key),all=[],bySource=[];let minRate=Infinity;const minTop=Array(12).fill(Infinity);for(const s of flatSources){const ms=windows(s.runes).map(w=>measureRunes(w,key));all.push(...ms);const st=Array(12).fill(Infinity);for(const m of ms){minRate=Math.min(minRate,m.rate);for(let k=0;k<12;k++){minTop[k]=Math.min(minTop[k],m.top[k]);st[k]=Math.min(st[k],m.top[k]);}}bySource.push({name:s.name,windows:ms.length,minTop:st});}const plain=flatSources[0].runes.slice(0,N),a=measureRunes(plain,key),b=measureRunes(plantRunes(plain,key,0x17c0ffee),key);return {original:orig,controlWindows:all.length,minControlRate:minRate,minControlTop:minTop,all12TopBelowControls:minTop.every((x,k)=>orig.top[k]<x),bySource,positivePlantExact:a.pairs===b.pairs&&a.hits===b.hits&&a.rate===b.rate&&JSON.stringify(a.top)===JSON.stringify(b.top)};}
function summarizeWord(key){const orig=measureWords(originalWords,key),all=[],bySource=[];let minRate=Infinity;const minTop=Array(12).fill(Infinity);for(const p of pools){const samples=[];for(let s=1;s<=500;s++)samples.push(measureWords(sampleWords(p,0x33010000+s*7919),key));all.push(...samples);const st=Array(12).fill(Infinity);for(const m of samples){minRate=Math.min(minRate,m.rate);for(let k=0;k<12;k++){minTop[k]=Math.min(minTop[k],m.top[k]);st[k]=Math.min(st[k],m.top[k]);}}bySource.push({name:p.name,samples:samples.length,minRate:Math.min(...samples.map(m=>m.rate)),minTop:st});}const plain=sampleWords(pools[0],0x17c0ffee),a=measureWords(plain,key),b=measureWords(plantWords(plain,key,0x1badb002),key);return {original:orig,controlSamples:all.length,minControlRate:minRate,minControlTop:minTop,all12TopBelowControls:minTop.every((x,k)=>orig.top[k]<x),bySource,positivePlantExact:a.pairs===b.pairs&&a.hits===b.hits&&a.rate===b.rate&&JSON.stringify(a.top)===JSON.stringify(b.top)&&a.minGroup===b.minGroup&&a.maxGroup===b.maxGroup};}
const result={originalRunes:N,originalWords:NWORDS,wordLengthClasses:uniqueLengths.length,wordLengthRange:[Math.min(...lengths),Math.max(...lengths)],p50Bytes:B.length,p50DistinctBytes:new Set(B).size,controls:sources.map(s=>({name:s.name,words:s.words.length,runes:s.words.flat().length})),continuous:{raw:summarizeContinuous(B),mod29:summarizeContinuous(B.map(x=>x%29))},wordIndexed:{raw:summarizeWord(B),mod29:summarizeWord(B.map(x=>x%29))},highDigitSelector:summarizeContinuous(B.map(x=>Math.floor(x/60)))};
const cr=result.continuous.raw,cm=result.continuous.mod29,wr=result.wordIndexed.raw,wm=result.wordIndexed.mod29;
assert.equal(cr.original.pairs,646599);assert.equal(cr.original.hits,22339);assert(Math.abs(cr.original.rate-0.034548460483236135)<1e-15);
assert.deepEqual(cr.original.top,[1039,1944,2773,3537,4248,4927,5570,6176,6737,7260,7769,8269]);
assert.equal(cr.controlWindows,122);assert(Math.abs(cr.minControlRate-0.056999778842837676)<1e-15);
assert.deepEqual(cr.minControlTop,[1634,2938,4052,5051,5952,6775,7531,8230,8870,9460,10000,10499]);
assert(cr.all12TopBelowControls&&cr.positivePlantExact);
assert.equal(cm.original.pairs,3429119);assert.equal(cm.original.hits,117679);assert(Math.abs(cm.original.rate-0.03431756086621666)<1e-15);
assert.deepEqual(cm.original.top,[664,1291,1883,2449,2999,3538,4067,4578,5083,5575,6060,6533]);
assert.equal(cm.controlWindows,122);assert(Math.abs(cm.minControlRate-0.0577673157449479)<1e-15);
assert.deepEqual(cm.minControlTop,[1472,2593,3575,4478,5314,6103,6844,7523,8170,8762,9310,9821]);
assert(cm.all12TopBelowControls&&cm.positivePlantExact);
assert.equal(wr.original.groups,161);assert.equal(wr.original.pairs,654139);assert.equal(wr.original.hits,22494);assert(Math.abs(wr.original.rate-0.034387186821149635)<1e-15);
assert.deepEqual(wr.original.top,[1044,1927,2748,3506,4215,4888,5507,6097,6664,7202,7718,8208]);
assert.equal(wr.controlSamples,2000);assert(Math.abs(wr.minControlRate-0.05734255257674592)<1e-15);
assert.deepEqual(wr.minControlTop,[1613,2901,4045,5065,5984,6820,7589,8297,8935,9533,10060,10530]);
assert(wr.all12TopBelowControls&&wr.positivePlantExact);
assert.equal(wm.original.groups,29);assert.equal(wm.original.pairs,3433607);assert.equal(wm.original.hits,118871);assert(Math.abs(wm.original.rate-0.03461986185372991)<1e-15);
assert.deepEqual(wm.original.top,[692,1335,1947,2532,3098,3641,4169,4686,5189,5680,6166,6641]);
assert.equal(wm.controlSamples,2000);assert(Math.abs(wm.minControlRate-0.05805207177175489)<1e-15);
assert.deepEqual(wm.minControlTop,[1428,2551,3532,4453,5325,6154,6931,7662,8319,8937,9493,9979]);

assert(wm.all12TopBelowControls&&wm.positivePlantExact);
const hd=result.highDigitSelector;
assert.equal(hd.original.groups,5);assert.equal(hd.original.pairs,18712993);assert.equal(hd.original.hits,645914);
assert(Math.abs(hd.original.rate-0.034516872848720674)<1e-15);
assert.deepEqual(hd.original.top,[532,1054,1570,2077,2576,3073,3562,4039,4512,4980,5443,5902]);
assert.equal(hd.controlWindows,122);
assert.deepEqual(hd.minControlTop,[1428,2510,3431,4321,5164,5923,6641,7328,7996,8626,9197,9713]);
assert(hd.all12TopBelowControls&&hd.positivePlantExact);

const tableTokens=grid.pages.flatMap(p=>p.tokens);
const alpha60='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const alpha59='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx';
function tokenCells(alpha){
  const d=new Map([...alpha].map((c,i)=>[c,i]));
  return tableTokens.map((t,index)=>({index,byte:d.get(t[0])*alpha.length+d.get(t[1]),hi:d.get(t[0]),lo:d.get(t[1])}));
}
const pageLocal=new Uint16Array(N);
let pageBase=0;
for(const p of gp.pages.filter(p=>p.page<=55)){
  for(let i=0;i<p.indices.length;i++)pageLocal[pageBase+i]=i;
  pageBase+=p.indices.length;
}
assert.equal(pageBase,N);
const wordLocal=new Uint8Array(N);
let wordBase=0;
for(const w of originalWords){
  for(let i=0;i<w.length;i++)wordLocal[wordBase+i]=i;
  wordBase+=w.length;
}
assert.equal(wordBase,N);
const doubletSites=[];
for(let i=1;i<N;i++)if(C[i]===C[i-1])doubletSites.push(i);
assert.equal(doubletSites.length,86);
function chiSquareP4(observed,expected){
  if(expected.some(x=>x===0))return null;
  const x=observed.reduce((s,o,i)=>s+(o-expected[i])**2/expected[i],0)/2;
  return Math.exp(-x)*(1+x); // chi-square survival, df=4
}
function maskStats(cells,clock,which){
  const at=i=>{
    const q=which==='current'?i:i-1;
    const ptr=clock==='global'?q:clock==='pageLocal'?pageLocal[q]:wordLocal[q];
    return cells[((ptr%256)+256)%256];
  };
  const all=[],events=[];
  for(let i=1;i<N;i++){const x=at(i);all.push(x);if(C[i]===C[i-1])events.push(x);}
  const counts=(xs,key,n)=>Array.from({length:n},(_,i)=>xs.filter(x=>key(x)===i).length);
  const allHigh=counts(all,x=>x.hi,5),eventHigh=counts(events,x=>x.hi,5);
  const allLow5=counts(all,x=>x.lo%5,5),eventLow5=counts(events,x=>x.lo%5,5);
  const expectedHigh=allHigh.map(x=>events.length*x/all.length);
  const expectedLow5=allLow5.map(x=>events.length*x/all.length);
  const allBottom20=all.filter(x=>x.byte<51).length;
  const eventBottom20=events.filter(x=>x.byte<51).length;
  return {
    radix:cells===tableCells59?'base59':'base60',clock,which,
    allByteMean:all.reduce((s,x)=>s+x.byte,0)/all.length,
    doubletByteMean:events.reduce((s,x)=>s+x.byte,0)/events.length,
    bottom20:{allCount:allBottom20,eventCount:eventBottom20,expectedEvents:events.length*allBottom20/all.length},
    highDigit:{all:allHigh,events:eventHigh,expected:expectedHigh,chiSquareP:chiSquareP4(eventHigh,expectedHigh)},
    lowDigitMod5:{all:allLow5,events:eventLow5,expected:expectedLow5,chiSquareP:chiSquareP4(eventLow5,expectedLow5)}
  };
}
const tableCells60=tokenCells(alpha60),tableCells59=tokenCells(alpha59);
assert.equal(tableCells60.length,256);assert.equal(tableCells59.length,256);
const repeatMask=[];
for(const [cells] of [[tableCells60],[tableCells59]]){
  for(const clock of ['global','pageLocal','wordLocal'])
    for(const which of ['current','previous'])repeatMask.push(maskStats(cells,clock,which));
}
const base60GlobalCurrent=repeatMask.find(x=>x.radix==='base60'&&x.clock==='global'&&x.which==='current');
assert.deepEqual(base60GlobalCurrent.highDigit.events,[15,25,24,18,4]);
assert.deepEqual(base60GlobalCurrent.lowDigitMod5.events,[20,14,23,15,14]);
assert.equal(base60GlobalCurrent.bottom20.eventCount,11);
const base60GlobalPrevious=repeatMask.find(x=>x.radix==='base60'&&x.clock==='global'&&x.which==='previous');
assert.deepEqual(base60GlobalPrevious.highDigit.all,[3036,2936,3288,2837,858]);
assert.deepEqual(base60GlobalPrevious.highDigit.events,[33,12,17,19,5]);

result.repeatMask={doubletSites:doubletSites.length,opportunities:N-1,tests:repeatMask};
const rankedTable=tableCells60.slice().sort((a,b)=>a.byte-b.byte||a.index-b.index);
const quintileByCell=new Uint8Array(256);
rankedTable.forEach((x,rank)=>quintileByCell[x.index]=Math.floor(rank*5/256));
const quintileOpportunities=Array(5).fill(0),quintileEvents=Array(5).fill(0),eventByCell=Array(256).fill(0);
for(let i=1;i<N;i++){
  const cell=(i-1)%256,q=quintileByCell[cell];
  quintileOpportunities[q]++;
  if(C[i]===C[i-1]){quintileEvents[q]++;eventByCell[cell]++;}
}
const observedBottom=quintileEvents[0],shiftFamily=[];
for(let shift=0;shift<256;shift++){
  const counts=Array(5).fill(0);
  for(const i of doubletSites){const cell=((i-1+shift)%256+256)%256;counts[quintileByCell[cell]]++;}
  shiftFamily.push(...counts);
}
const shiftGe=shiftFamily.filter(x=>x>=observedBottom).length;
const bottomCells=rankedTable.slice(0,52).map(x=>x.index);
const rnd=rng(0x3301c1ca),indices=Array.from({length:256},(_,i)=>i);
let randomGe=0,randomSum=0,randomMax=0;
const randomTrials=100000;
for(let z=0;z<randomTrials;z++){
  for(let j=0;j<52;j++){const k=j+rnd()%(256-j);[indices[j],indices[k]]=[indices[k],indices[j]];}
  let s=0;for(let j=0;j<52;j++)s+=eventByCell[indices[j]];
  randomSum+=s;if(s>=observedBottom)randomGe++;if(s>randomMax)randomMax=s;
}
const lagComparison=[];
for(let lag=1;lag<=10;lag++){
  const op=Array(5).fill(0),hit=Array(5).fill(0);
  for(let i=lag;i<N;i++){
    const q=quintileByCell[(i-lag)%256];op[q]++;
    if(C[i]===C[i-lag])hit[q]++;
  }
  const otherOp=op.slice(1).reduce((s,x)=>s+x,0),otherHit=hit.slice(1).reduce((s,x)=>s+x,0);
  lagComparison.push({lag,opportunities:op,events:hit,bottomRate:hit[0]/op[0],otherRate:otherHit/otherOp,rateRatio:(hit[0]/op[0])/(otherHit/otherOp),totalEvents:hit.reduce((s,x)=>s+x,0)});
}
result.repeatMask.alignment={
  quintileOpportunities,quintileEvents,
  bottomQuintile:{cells:52,cutoffBase60:rankedTable[51].byte,observed:observedBottom,expected:86*quintileOpportunities[0]/(N-1)},
  cyclicShiftFamily:{combinations:shiftFamily.length,ge:shiftGe,p:shiftGe/shiftFamily.length},
  randomSubset:{trials:randomTrials,ge:randomGe,p:(randomGe+1)/(randomTrials+1),mean:randomSum/randomTrials,max:randomMax,seed:'0x3301c1ca'},
  lagComparison
};
assert.deepEqual(quintileEvents,[30,13,12,12,19]);
assert.equal(rankedTable[51].byte,54);
assert.equal(shiftGe,3);
assert.equal(randomGe,392);
assert(Math.abs(lagComparison[0].rateRatio-2.101)<0.01);

const controlRepeatWindows=flatSources.flatMap(windows);
const controlRepeatStats=controlRepeatWindows.map((xs,index)=>{
  let bottomOp=0,otherOp=0,bottomHit=0,otherHit=0;
  for(let i=1;i<N;i++){
    const bottom=quintileByCell[(i-1)%256]===0;
    if(bottom)bottomOp++;else otherOp++;
    if(xs[i]===xs[i-1]){if(bottom)bottomHit++;else otherHit++;}
  }
  const bottomRate=bottomHit/bottomOp,otherRate=otherHit/otherOp,total=bottomHit+otherHit;
  return {index,total,bottomHit,bottomFraction:bottomHit/total,rateRatio:bottomRate/otherRate};
});
const controlRepeatMask={
  windows:controlRepeatStats.length,
  maxBottomFraction:Math.max(...controlRepeatStats.map(x=>x.bottomFraction)),
  maxRateRatio:Math.max(...controlRepeatStats.map(x=>x.rateRatio)),
  windowsOver30Percent:controlRepeatStats.filter(x=>x.bottomFraction>=30/86).length,
  top:controlRepeatStats.slice().sort((a,b)=>b.bottomFraction-a.bottomFraction).slice(0,5)
};
result.repeatMask.controlWindows=controlRepeatMask;
assert.equal(controlRepeatMask.windows,122);
assert.equal(controlRepeatMask.windowsOver30Percent,0);
assert(controlRepeatMask.maxBottomFraction<0.26);
assert(controlRepeatMask.maxRateRatio<1.35);



console.log(JSON.stringify(result,null,2));
