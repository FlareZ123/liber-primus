'use strict';
/**
 * SFT. Crosswalk external Nov-2026 replicated T7 doublet-site anomaly onto
 * original LP2 physical pages and 2014 FOLD seam. No claims about the cipher.
 * Source: original resources/liber-primus/lp2-corpus.json, pages0..55.
 * Windows Node22 CJS; read-only, deterministic, standalone.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const repo=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(repo,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
assert.equal(pages.length,55);
const runes=[],places=[];
for(const p of pages)for(let i=0;i<p.indices.length;i++){
  const v=p.indices[i];assert(v>=0&&v<29);
  runes.push(v);places.push({physicalPage:p.page,offset:i});
}
assert.equal(runes.length,12956);
const sites=[];for(let i=1;i<runes.length;i++)if(runes[i]===runes[i-1])sites.push(i);
assert.equal(sites.length,86);
const gaps=sites.slice(1).map((s,i)=>s-sites[i]);
assert.deepEqual(gaps.slice().sort((a,b)=>b-a).slice(0,4),[712,662,553,537]);
const blockCount=Array.from({length:13},(_,k)=>
  sites.filter(p=>p>=1000*k&&p<1000*(k+1)).length);
assert.deepEqual(blockCount,[8,3,7,2,6,9,10,8,11,2,9,6,5]);
const candidateSpan={start:2739,end:4388};
const inSpan=sites.filter(s=>s>=candidateSpan.start&&s<=candidateSpan.end);
assert.deepEqual(inSpan,[2740,3140,3852]);
assert.deepEqual([places[candidateSpan.start],places[candidateSpan.end]],
  [{physicalPage:11,offset:79},{physicalPage:18,offset:86}]);
assert.deepEqual(inSpan.map(i=>places[i]),
  [{physicalPage:11,offset:80},{physicalPage:12,offset:207},{physicalPage:16,offset:90}]);
const countByPage=pages.map(p=>({
  page:p.page, count:sites.filter(s=>places[s].physicalPage===p.page).length
}));
assert.deepEqual(countByPage.filter(p=>p.page>=13&&p.page<=17).map(x=>x.count),
  [0,0,0,1,0]);
const within=pages.filter(p=>p.page>=13&&p.page<=15)
  .reduce((n,p)=>n+p.indices.length,0);
assert.equal(within,568);
const maxNoDoubletSpan=[0,...sites,runes.length]
  .map((s,i,all)=>i===0?0:s-all[i-1]-1)
  .reduce((a,b)=>Math.max(a,b),0);
assert.equal(maxNoDoubletSpan,711);
const output={
  originalRunes:runes.length,
  adjacentEqualSites:sites.length,
  blockCount,
  gapLargest:gaps.slice().sort((a,b)=>b-a).slice(0,4),
  replicatedCandidateSpan:{
    globalIndices:[candidateSpan.start,candidateSpan.end],
    length:candidateSpan.end-candidateSpan.start+1,
    physicalPages:[places[candidateSpan.start],places[candidateSpan.end]],
    internalSites:inSpan.map(s=>({globalIndex:s,...places[s]}))
  },
  p13p14p15:{totalRunes:within,doublets:0},
  longestTrulyDoubletFreeRun:maxNoDoubletSpan,
  verdict:'T7 position variation confirmed; the alleged 1649-rune doublet-free void is mislabelled and contains three doublets. No key or plaintext recovered.'
};
console.log(JSON.stringify(output,null,2));
