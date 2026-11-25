"use strict";
const fs=require("node:fs");
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","im-results/lp2-q8-single-null-repair-capacity-output.json"];
function rateGate(raw){
 const gp=JSON.parse(raw[0]),ix=new Map(gp.runes.map((x,i)=>[x,i])),data=JSON.parse(raw[2]),assert=(v,m)=>{if(!v)throw Error(m)};
 let gs=[],w=[],sep="";for(const c of raw[1]){if(ix.has(c)){if(w.length&&/[-.&]/u.test(sep)){gs.push(w);w=[]}w.push(ix.get(c));sep=""}else sep+=c}if(w.length)gs.push(w);
 const target=gp.pages.filter(x=>x.page<56).flatMap(x=>x.indices);assert(gs.flat().slice(0,target.length).join()===target.join(),"tape");
 let n=0,orig=[];for(const w of gs){if(n>=target.length)break;orig.push({off:n,C:w});n+=w.length}assert(n===12956&&orig.length===2896,"counts");
 const eq=orig.reduce((s,x)=>s+x.C.reduce((a,v,j)=>a+(x.off+j>0&&v===target[x.off+j-1]?1:0),0),0);
 assert(eq===86,"equal census "+eq);
 // Binomial upper tail = event of at least R successful repairs before F+1 failures.
 function tail(R,F,q){if(!R)return 1;const N=R+F;let logP=N*Math.log(q),sum=Math.exp(logP);for(let s=N;s>R;s--){logP+=Math.log(s)-Math.log(N-s+1)+Math.log1p(-q)-Math.log(q);sum+=Math.exp(logP)}return Math.min(1,sum)}
 const out=[];for(let k=3;k<=7;k++){
   const R=data.original.reduce((s,x)=>s+Math.max(0,x.cumulative.find(t=>t.k===k).minAffected-x.budget),0);
   const rows=orig.filter(x=>x.C.length>=k+1);
   const F=rows.reduce((s,x)=>s+x.C.reduce((a,v,j)=>a+(x.off+j>0&&v===target[x.off+j-1]?1:0),0),0);
   let p={};for(const q of [.81,.85,.9,.95])p[q]=tail(R,F,q);
   let l=0,h=1;for(let j=0;j<64;j++){let q=(l+h)/2;if(tail(R,F,q)<.01)l=q;else h=q}
   out.push({k,minimumRepairs:R,maximumFailedRepairs:F,selectedGroups:rows.length,selectedRunes:rows.reduce((n,x)=>n+x.C.length,0),p,repairProbabilityAtPoint01:h});
 }
 const corrected={};for(const q of [.81,.85,.9,.95])corrected[q]=Math.min(1,5*Math.min(...out.map(x=>x.p[q])));
 return {wholeTapeEqualities:eq,scope:"ordered printed groups; independent repair coin on each collision; checked nulls; group length independent of repair outcome",tests:out,bonferroni5:corrected};
}
if(require.main===module)console.log(JSON.stringify(rateGate(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
module.exports={rateGate};
