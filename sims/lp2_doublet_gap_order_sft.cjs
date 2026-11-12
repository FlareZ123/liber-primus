'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
function pearson(x,y){const n=x.length,mx=x.reduce((s,v)=>s+v,0)/n,my=y.reduce((s,v)=>s+v,0)/n;let num=0,dx=0,dy=0;for(let i=0;i<n;i++){const a=x[i]-mx,b=y[i]-my;num+=a*b;dx+=a*a;dy+=b*b;}return num/Math.sqrt(dx*dy);}
function acf(a,k){return pearson(a.slice(0,a.length-k),a.slice(k));}
function mulberry32(seed){let t=seed>>>0;return ()=>{t+=0x6D2B79F5;let x=t;x=Math.imul(x^(x>>>15),x|1);x^=x+Math.imul(x^(x>>>7),x|61);return ((x^(x>>>14))>>>0)/4294967296;};}
function permutationTest(a,N,seed){const observed=acf(a,1),random=mulberry32(seed);let upper=0,two=0;for(let b=0;b<N;b++){const p=a.slice();for(let i=p.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[p[i],p[j]]=[p[j],p[i]];}const r=acf(p,1);if(r>=observed)upper++;if(Math.abs(r)>=Math.abs(observed))two++;}return {observed,N,seed,upperTail:(upper+1)/(N+1),twoSided:(two+1)/(N+1)};}
function summarize(pages){const stream=pages.flatMap(p=>p.indices),sites=[];for(let i=0;i<stream.length-1;i++)if(stream[i]===stream[i+1])sites.push(i);const gaps=sites.slice(1).map((p,i)=>p-sites[i]);const nonempty=pages.filter(p=>p.indices.length>0);const crossPage=nonempty.slice(1).filter((p,i)=>nonempty[i].indices[nonempty[i].indices.length-1]===p.indices[0]).length;const pageCounts=pages.map(p=>{let n=0;for(let i=0;i<p.indices.length-1;i++)if(p.indices[i]===p.indices[i+1])n++;return n;});const pageRates=nonempty.map(p=>{let n=0;for(let i=0;i<p.indices.length-1;i++)if(p.indices[i]===p.indices[i+1])n++;return n/p.indices.length;});return {stream,sites,gaps,nonempty,crossPage,pageCounts,pageRates,distinctRepeatedSymbols:new Set(sites.map(i=>stream[i])).size};}
const unsolvedPages=corpus.pages.filter(p=>p.page>=0&&p.page<=55),fullPages=corpus.pages.filter(p=>p.page>=0&&p.page<=57);
const u=summarize(unsolvedPages),f=summarize(fullPages);
assert.equal(unsolvedPages.length,56);assert.equal(u.stream.length,12956);assert.equal(u.sites.length,86);assert.equal(u.gaps.length,85);assert.equal(u.crossPage,0);assert.equal(u.distinctRepeatedSymbols,28);
const blockCounts=Array.from({length:13},(_,i)=>u.sites.filter(p=>Math.floor(p/1000)===i).length);
assert.deepEqual(blockCounts,[8,3,7,2,6,9,10,8,11,2,9,6,5]);
assert.equal(f.stream.length,13136);assert.equal(f.sites.length,89);assert.equal(f.gaps.length,88);
const gapAcf=[1,2,3,4,5].map(k=>acf(u.gaps,k)),loo=u.gaps.map((_,i)=>acf(u.gaps.filter((_,j)=>j!==i),1));
const blockAcf=acf(blockCounts,1),gapPermutation=permutationTest(u.gaps,100000,3301);
const pageRateAcf=acf(u.pageRates,1),pageRatePermutation=permutationTest(u.pageRates,100000,3302),fullGapAcf=acf(f.gaps,1);
assert.ok(Math.abs(gapAcf[0]-0.38001968924100965)<1e-12);assert.ok(gapPermutation.upperTail<0.001);
assert.ok(Math.abs(pageRateAcf-0.04410488193141018)<1e-12);assert.ok(pageRatePermutation.upperTail>0.1);
assert.ok(blockAcf<0);assert.ok(Math.abs(fullGapAcf-0.3879662542215518)<1e-12);
const output={
 source:{corpus:'resources/liber-primus/lp2-corpus.json',unsolvedPages:'0-55',fullCanonPages:'0-57'},
 unsolved:{runes:u.stream.length,doublets:u.sites.length,gaps:u.gaps.length,crossPageDoublets:u.crossPage,distinctRepeatedSymbols:u.distinctRepeatedSymbols,
  sitePositions:u.sites,gapSequence:u.gaps,gapAcfLags1to5:gapAcf,leaveOneOutAcf1Range:[Math.min(...loo),Math.max(...loo)],
  gapPermutation,blockCountsPer1000:blockCounts,blockCountAcf1:blockAcf,pageCounts:u.pageCounts,pageLengths:unsolvedPages.map(p=>p.indices.length),
  nonemptyPageRateAcf1:pageRateAcf,pageRatePermutation},
 fullCanon:{runes:f.stream.length,doublets:f.sites.length,gaps:f.gaps.length,gapAcf1:fullGapAcf,addedSolvedPageDoublets:f.sites.length-u.sites.length},
 interpretation:'Positive short-lag dependence in the ordered doublet interarrival gaps is reproducible. Page-rate ordering is not significant and 1000-rune block counts are not positively autocorrelated. This does not establish a drifting filter rate, a cipher mechanism, or plaintext.'
};
const json=JSON.stringify(output,null,2);
if(process.argv[2])fs.writeFileSync(process.argv[2],json+'\n');
console.log(json);
