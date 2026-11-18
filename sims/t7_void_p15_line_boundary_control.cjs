#!/usr/bin/env node
// Reproduce the external T7/p15-axis structural observation and its
// printed-line-boundary control without language scoring.
const fs=require("fs");
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
  let first=true;
  for(const line of pageTexts[p].split("\n")){
    const n=(line.match(/[\u16A0-\u16FF]/g)||[]).length;
    if(!n) continue;
    if(!first) lineBoundaries.push(global-0.5);
    first=false; global+=n;
  }
  pageStarts.push(global);
}
const p15Lines=pageTexts[15].split("\n");
let p15Start=pageStarts[14], p15FirstLineRunes=0;
for(const line of p15Lines){const n=(line.match(/[\u16A0-\u16FF]/g)||[]).length;if(n){p15FirstLineRunes=n;break;}}
const p15Axis=p15Start+p15FirstLineRunes-0.5;
const fullMid=(t7.sites[0]+t7.sites[3])/2;
const largestMid=(t7.sites[1]+t7.sites[2])/2;
const dists=lineBoundaries.map(b=>Math.abs(b-fullMid)).sort((a,b)=>a-b);
const rank=dists.findIndex(d=>d>=Math.abs(p15Axis-fullMid))+1;
const pageStartDistances=pages.map((p,i)=>({page:p.page,start:pageStarts[i],distance:Math.abs(pageStarts[i]-fullMid)})).sort((a,b)=>a.distance-b.distance);
const p15PageStartRank=pageStartDistances.findIndex(x=>x.page===15)+1;
function pageFor(x){let start=0;for(const p of pages){const end=start+p.runic_count;if(x>=start&&x<end)return{page:p.page,offset:x-start};start=end;}return null;}
console.log(JSON.stringify({
 corpus_runes:stream.length,doublet_count:doublets.length,t7_cluster:t7,
 full_void_midpoint:fullMid,largest_gap_midpoint:largestMid,p15_axis:p15Axis,p15_page_start:p15Start,
 p15_axis_distance_from_full_midpoint:Math.abs(p15Axis-fullMid),
 internal_line_boundaries:lineBoundaries.length,nearest_line_boundary_distances:dists.slice(0,10),
 p15_axis_rank_by_distance:rank,p15_axis_empirical_rank:rank/lineBoundaries.length,
 nearest_page_starts:pageStartDistances.slice(0,8),p15_page_start_rank:p15PageStartRank,
 full_midpoint_page:pageFor(fullMid),void_start_page:pageFor(t7.sites[0]),void_end_page:pageFor(t7.sites[3])
},null,2));
