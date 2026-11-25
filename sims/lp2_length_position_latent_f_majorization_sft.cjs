"use strict";
const fs=require("node:fs");
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/transcriptions/lp2-image-corrected.txt",
  "resources/external/relikd-solved-gp29-native-v1.json"
];
function experiment(raw){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[2]),ix=new Map(gp.runes.map((x,i)=>[x,i]));
 function groups(t,sep){let w=[],between="",out=[];for(const c of t){if(ix.has(c)){if(w.length&&sep.test(between)){out.push(w);w=[]}w.push(ix.get(c));between=""}else between+=c}if(w.length)out.push(w);return out;}
 const orig=groups(raw[1],/[-.&]/u).slice(0,2896);
 if(orig.flat().join()!==gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices).join())throw Error("original mismatch");
 const sizes=[[0,2,158],[3,7,255],[8,14,383],[15,22,437],[23,26,224],[27,32,326],[33,39,378],[40,53,669],[54,55,66]];
 let off=0;const chapters=sizes.map(([a,b,n])=>{const g=orig.slice(off,off+=n);if(g.flat().join()!==gp.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices).join())throw Error("chapter mismatch");return g;});
 function bound(chs,A=29){
 const sum=Array(A).fill(0);let zeros=0,N=0,rows=0;
 for(const gs of chs){const strata=new Map();for(const c of gs){N+=c.length;const possible=Array.from({length:c.length},()=>new Set());let z=0;for(let i=0;i<c.length;i++){// Any previous ciphertext zero may have been a literal hold.
 for(let j=i-z;j<=i;j++)possible[j].add(c[i]);if(c[i]===0){z++;zeros++;}}
 for(let j=0;j<c.length;j++){const key=c.length+":"+j;if(!strata.has(key))strata.set(key,Array(A).fill(0));const h=strata.get(key);for(const v of possible[j])h[v]++;}}
 rows+=strata.size;for(const row of strata.values())row.sort((a,b)=>b-a).forEach((v,i)=>sum[i]+=v);}
 // For every set of k non-F plaintext symbols, their combined count <= sum of top k incidence counts.
 // F itself can only be emitted by a visible ciphertext F. Insert its independent upper bound.
 const envelope=sum.slice(0,A-1).concat(zeros).sort((a,b)=>b-a);
 let left=N;const majorant=envelope.map(x=>{const v=Math.min(left,x);left-=v;return v;});
 if(left!==0)throw Error("capacity");
 return {N,rows,zeros,nonF:sum.slice(0,A-1),majorant,IoC:N>1?majorant.reduce((s,v)=>s+v*(v-1),0)/(N*(N-1)):0};
 }
 function check(p,c,A=29){const h=Array(A).fill(0);for(const x of p.flat())h[x]++;const b=bound([c],A);if(h[0]>b.zeros||Math.max(...h.slice(1))>b.nonF[0])throw Error("symbol bound");
 h.sort((a,b)=>b-a);let x=0,y=0;for(let j=0;j<A;j++){x+=h[j];y+=b.majorant[j];if(x>y)throw Error("majorization");}return {actualIoC:p.flat().length>1?h.reduce((s,v)=>s+v*(v-1),0)/(p.flat().length*(p.flat().length-1)):0,cap:b.IoC};}
 let seed=20261125;function rnd(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n}
 function plant(p,A=29){const maps=new Map();const c=p.map(w=>{let j=0;return w.map(v=>{if(v===0)return 0;const k=w.length+":"+j++;if(!maps.has(k)){const z=Array.from({length:A},(_,i)=>i);for(let i=A-1;i>0;i--){const q=rnd(i+1);[z[i],z[q]]=[z[q],z[i]];}maps.set(k,z);}return maps.get(k)[v];});});
 // Use planted hold schedule solely as a forward/inverse implementation control.
 const rec=c.map((w,wi)=>{let j=0;return w.map((v,i)=>{if(p[wi][i]===0){if(v!==0)throw Error("literal F");return 0;}const z=maps.get(w.length+":"+j++);return z.indexOf(v);});});if(rec.flat().join()!==p.flat().join())throw Error("replay");return check(p,c,A);}
 const controls=gold.sections.map(s=>({name:s.name,...plant(groups(s.source_text,/[^\u16a0-\u16ff]/u))}));
 let toys=0;for(let i=0;i<256;i++){const p=Array.from({length:12},()=>Array.from({length:1+rnd(5)},()=>rnd(3)));plant(p,3);toys++;}
 return {shared:bound([orig]),chapterPrivate:bound(chapters),chapters:chapters.map((g,i)=>({pages:sizes[i].slice(0,2),...bound([g])})),controls,toys};
}
if(require.main===module)console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
module.exports={experiment};
