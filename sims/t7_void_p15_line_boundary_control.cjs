#!/usr/bin/env node
// Reproduce the external T7/p15-axis structural observation and its
// printed-line-boundary control without language scoring.
const fs=require("fs");
const assert=require("node:assert/strict");
const corpus=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
const transcription=fs.readFileSync("resources/liber-primus/lp2-transcription.txt","utf8");
const pages=corpus.pages.filter(p=>p.page<=55).sort((a,b)=>a.page-b.page);
const stream=pages.flatMap(p=>p.indices);
const doublets=[];
for(let i=1;i<stream.length;i++) if(stream[i]===stream[i-1]) doublets.push(i);
const clusters=[];
for(let k=0;k+3<doublets.length;k++){
  const sites=doublets.slice(k,k+4);
  clusters.push({sites,gaps:[sites[1]-sites[0],sites[2]-sites[1],sites[3]-sites[2]],span:sites[3]-sites[0]});
}
clusters.sort((a,b)=>b.span-a.span||b.gaps[1]-a.gaps[1]);
const t7=clusters[0];
const pageTexts=transcription.split(/\n%\n/);
const lineBoundaries=[];
let global=0;
const pageStarts=[];
for(let p=0;p<pageTexts.length;p++){
  pageStarts.push(global); // beginning of physical page, including rune-free p50
  let first=true;
  for(const line of pageTexts[p].split("\n")){
    const n=(line.match(/[\u16A0-\u16FF]/g)||[]).length;
    if(!n) continue;
    if(!first) lineBoundaries.push(global-0.5);
    first=false; global+=n;
  }
}
const p15Lines=pageTexts[15].split("\n");
let p15Start=pageStarts[15], p15FirstLineRunes=0;
for(const line of p15Lines){const n=(line.match(/[\u16A0-\u16FF]/g)||[]).length;if(n){p15FirstLineRunes=n;break;}}
const p15Axis=p15Start+p15FirstLineRunes-0.5;

// Source-authentic p15 4x4 numerical display. Test only the finite relation
// suggested by the new T7 observation: does the mechanically selected maximum
// three-gap span equal half of one printed p15 value?
const p15Values=[3258,3222,3152,3038,3278,3299,3298,2838,3288,3294,3296,2472,4516,1206,708,1820];
const p15HalfTargets=new Set(p15Values.filter(v=>v%2===0).map(v=>v/2));
const observedThreeGapSpan=t7.span;
const exactP15Matches=p15Values.filter(v=>v===2*observedThreeGapSpan);

// Conservative null: preserve every page's exact rune multiset, shuffle only
// within pages, and recompute the maximum three-gap span. Fixed xorshift seed
// makes the 2000-trial control reproducible without an external RNG package.
let rngState=0x12345678>>>0;
function rnd(){rngState^=rngState<<13;rngState^=rngState>>>17;rngState^=rngState<<5;return(rngState>>>0)/4294967296;}
function shuffle(a){const x=a.slice();for(let i=x.length-1;i>0;i--){const k=Math.floor(rnd()*(i+1));[x[i],x[k]]=[x[k],x[i]];}return x;}
function maxThreeGap(arr){const ds=[];for(let i=1;i<arr.length;i++)if(arr[i]===arr[i-1])ds.push(i);let best=0;for(let k=0;k+3<ds.length;k++)best=Math.max(best,ds[k+3]-ds[k]);return best;}
let nullExact=0,nullGE=0;
const nullTrials=2000;
for(let t=0;t<nullTrials;t++){
  const shuffled=pages.flatMap(p=>shuffle(p.indices));
  const m=maxThreeGap(shuffled);
  if(p15HalfTargets.has(m))nullExact++;
  if(m>=observedThreeGapSpan)nullGE++;
}
const fullMid=(t7.sites[0]+t7.sites[3])/2;
const largestMid=(t7.sites[1]+t7.sites[2])/2;
const dists=lineBoundaries.map(b=>Math.abs(b-fullMid)).sort((a,b)=>a-b);
const rank=dists.findIndex(d=>d>=Math.abs(p15Axis-fullMid))+1;
const pageStartDistances=pages.map((p,i)=>({page:p.page,start:pageStarts[i],distance:Math.abs(pageStarts[i]-fullMid)})).sort((a,b)=>a.distance-b.distance);
const p15PageStartRank=pageStartDistances.findIndex(x=>x.page===15)+1;
assert.equal(pageStarts[15],3603); // source-native p15 coordinate
assert.equal(p15PageStartRank,1); // p15 is closest to T7 full-span midpoint
// Empirical baselines: a nearest page start and a fifth-nearest line boundary
// are common even when neither p15 nor this axis was selected in advance.
const nearestStartDistance = x => Math.min(...pageStarts.map(start=>Math.abs(start-x)));
const lineBoundariesIn47 = x => lineBoundaries.reduce((n,b)=>n+(Math.abs(b-x)<=47?1:0),0);
const quadMidpoints=clusters.map(c=>(c.sites[0]+c.sites[3])/2);
const quadNearAnyStart=quadMidpoints.filter(x=>nearestStartDistance(x)<=38.5).length;
const quadWithAtLeastFiveLines=quadMidpoints.filter(x=>lineBoundariesIn47(x)>=5).length;
let halfRuneNearAnyStart=0, halfRuneWithAtLeastFiveLines=0;
for(let x=0.5;x<stream.length;x++){
  if(nearestStartDistance(x)<=38.5)halfRuneNearAnyStart++;
  if(lineBoundariesIn47(x)>=5)halfRuneWithAtLeastFiveLines++;
}
assert.equal(quadMidpoints.length,83);
assert.equal(quadNearAnyStart,30);
assert.equal(quadWithAtLeastFiveLines,17);
assert.equal(halfRuneNearAnyStart,4239);
assert.equal(halfRuneWithAtLeastFiveLines,2447);
function pageFor(x){let start=0;for(const p of pages){const end=start+p.runic_count;if(x>=start&&x<end)return{page:p.page,offset:x-start};start=end;}return null;}
console.log(JSON.stringify({
 corpus_runes:stream.length,doublet_count:doublets.length,t7_cluster:t7,
 full_void_midpoint:fullMid,largest_gap_midpoint:largestMid,p15_axis:p15Axis,p15_page_start:p15Start,
 p15_axis_distance_from_full_midpoint:Math.abs(p15Axis-fullMid),
 internal_line_boundaries:lineBoundaries.length,nearest_line_boundary_distances:dists.slice(0,10),
 p15_axis_rank_by_distance:rank,p15_axis_empirical_rank:rank/lineBoundaries.length,
 empirical_baselines:{four_doublet_windows:quadMidpoints.length,windows_near_any_page_start:quadNearAnyStart,
   half_rune_positions:stream.length,positions_near_any_page_start:halfRuneNearAnyStart,
   windows_with_five_lines_in_axis_radius:quadWithAtLeastFiveLines,
   positions_with_five_lines_in_axis_radius:halfRuneWithAtLeastFiveLines,
   axis_radius_runes:47,page_start_radius_runes:38.5},
 nearest_page_starts:pageStartDistances.slice(0,8),p15_page_start_rank:p15PageStartRank,
 full_midpoint_page:pageFor(fullMid),void_start_page:pageFor(t7.sites[0]),void_end_page:pageFor(t7.sites[3])
},null,2));
