#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),path=require("node:path");
const c=JSON.parse(fs.readFileSync(path.resolve(__dirname,"../resources/liber-primus/lp2-corpus.json"),"utf8"));
const pages=c.pages.filter(p=>p.page<=55 && p.indices && p.indices.length);
const tape=[],loc=[];
for(const p of pages)for(let i=0;i<p.indices.length;i++){tape.push(p.indices[i]);loc.push({page:p.page,offset:i});}
const N=tape.length;
function suffixArray(a){
 const n=a.length,sa=Array.from({length:n},(_,i)=>i),rank=a.slice(),tmp=Array(n);
 for(let k=1;k<n;k*=2){
   sa.sort((i,j)=>(rank[i]-rank[j])||((i+k<n?rank[i+k]:-1)-(j+k<n?rank[j+k]:-1)));
   tmp[sa[0]]=0;
   for(let z=1;z<n;z++){const i=sa[z-1],j=sa[z],ri=rank[i],rj=rank[j],ai=i+k<n?rank[i+k]:-1,aj=j+k<n?rank[j+k]:-1;
     tmp[j]=tmp[i]+((ri!==rj||ai!==aj)?1:0);
   }
   for(let i=0;i<n;i++)rank[i]=tmp[i];
   if(rank[sa[n-1]]===n-1)break;
 }
 return sa;
}
const sa=suffixArray(tape);let best=0,pairs=[];
for(let z=1;z<sa.length;z++){let i=sa[z-1],j=sa[z],l=0;while(i+l<N&&j+l<N&&tape[i+l]===tape[j+l])l++;
 if(l>best){best=l;pairs=[[i,j]]}else if(l===best)pairs.push([i,j]);
}
const freq=Array(29).fill(0);for(const x of tape)freq[x]++;const q=freq.reduce((s,n)=>s+(n/N)**2,0);
function ng(L){
 const m=new Map(),pow=29**L;let code=0;
 for(let i=0;i<N;i++){code=code*29+tape[i];if(i>=L)code-=tape[i-L]*pow;if(i>=L-1)m.set(code,(m.get(code)||0)+1);}
 let dup=0,cp=0,max=0;for(const n of m.values()){if(n>1)dup++;cp+=n*(n-1)/2;max=Math.max(max,n);}
 const W=N-L+1,expected=W*(W-1)/2*q**L;
 return {L,windows:W,distinct:m.size,duplicate_types:dup,collision_pairs:cp,max_multiplicity:max,iid_expected_pairs_empirical_unigram:expected,poisson_p_any:1-Math.exp(-expected)};
}
function range(a,b){return c.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices||[]);}
const a=range(27,31),b=range(44,55).slice(0,1312);let aligned=0;for(let i=0;i<a.length;i++)if(a[i]===b[i])aligned++;
const result={
 schema:1,source:"resources/liber-primus/lp2-corpus.json",runes:N,
 external_claim_check:{p27_length:c.pages.find(p=>p.page===27).indices.length,p27_p44_aligned_234_matches:c.pages.find(p=>p.page===27).indices.filter((x,i)=>x===c.pages.find(p=>p.page===44).indices[i]).length,p27_p31_length:a.length,p27_p31_vs_continuous_p44_aligned_matches:aligned,exact_overlap:false},
 longest_repeat:{length:best,pairs:pairs.map(([i,j])=>({a:{global:i,...loc[i]},b:{global:j,...loc[j]},runes:tape.slice(i,i+best),glyphs:tape.slice(i,i+best).map(x=>c.runes[x]).join("")}))},
 ngram_collision_stats:[2,3,4,5,6,7].map(ng),
 conclusion:"Canonical p0-p55 ciphertext contains no long exact duplicated blocks; maximum exact repeat is six runes and is compatible with chance under the empirical unigram distribution."
};
if(N!==12956||best!==6||pairs.length!==1||result.longest_repeat.pairs[0].a.page!==55&&result.longest_repeat.pairs[0].b.page!==55)throw Error("regression");
process.stdout.write(JSON.stringify(result,null,2)+"\n");
