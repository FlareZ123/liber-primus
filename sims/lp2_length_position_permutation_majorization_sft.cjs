"use strict";
const fs=require("node:fs");
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/transcriptions/lp2-image-corrected.txt",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt"
];
function majorization(raw){
 const gp=JSON.parse(raw[0]),ix=new Map(gp.runes.map((x,i)=>[x,i])),gold=JSON.parse(raw[2]);function words(t,sep){let w=[],between="",groups=[];for(const c of t){if(ix.has(c)){if(w.length&&sep.test(between)){groups.push(w);w=[]}w.push(ix.get(c));between=""}else between+=c}if(w.length)groups.push(w);return groups}
 const all=words(raw[1],/[-.&]/u),orig=all.slice(0,2896);if(orig.flat().join()!==gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices).join())throw Error("original mismatch");
 const regions=[[0,2,158],[3,7,255],[8,14,383],[15,22,437],[23,26,224],[27,32,326],[33,39,378],[40,53,669],[54,55,66]];let offset=0;
 const chapters=regions.map(([a,b,n])=>{const g=orig.slice(offset,offset+=n);if(g.flat().join()!==gp.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices).join())throw Error("chapter mismatch");return g;});
 const summary=(h)=>{const n=h.reduce((a,b)=>a+b,0);return{n,frequency:h,IoC:n>1?h.reduce((s,x)=>s+x*(x-1),0)/(n*(n-1)):0,top1:h[0],top2:h[0]+h[1],top3:h[0]+h[1]+h[2]}}
 function bound(chs,freeF=false){const sum=Array(29).fill(0);let free=0,rows=0;for(const ch of chs){const strata=new Map();for(const c of ch){if(freeF&&c.includes(0)){free+=c.length;continue;}for(let j=0;j<c.length;j++){const key=c.length+":"+j;if(!strata.has(key))strata.set(key,Array(29).fill(0));strata.get(key)[c[j]]++;}}rows+=strata.size;for(const row of strata.values())row.sort((a,b)=>b-a).forEach((v,i)=>sum[i]+=v);}sum[0]+=free;return{rows,free,...summary(sum)}}
 function measured(p){const h=Array(29).fill(0);for(const x of p)h[x]++;return summary(h.sort((a,b)=>b-a))}
 const ordinary=bound([orig]),privateChapter=bound(chapters),literalF=bound([orig],true),privateChapterF=bound(chapters,true);
 const perChapter=chapters.map((g,i)=>({pages:regions[i].slice(0,2),ordinary:bound([g]),literalF:bound([g],true)}));
 // Native reference uses exact solved rune text, plus independent full-window literary normalization.
 const exactNative=gold.sections.map(s=>({name:s.name,...measured(words(s.source_text,/[^\u16a0-\u16ff]/u).flat())}));
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return(t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]).map(s=>{const w=s.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let p=[];for(let j=0;j<w.length;){const v=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));if(!v)throw Error("unknown token");p.push(v.i);j+=v.t.length;}return p;});}
 const donor=raw.slice(3).map(native);function windows(p,n){if(p.length<n)return null;const h=Array(29).fill(0);let minE=Infinity,minMax=Infinity,minIoC=Infinity,minTop2=Infinity;for(let i=0;i<n;i++)h[p[i]]++;let pairs=h.reduce((s,x)=>s+x*(x-1),0);for(let start=0;start+n<=p.length;start++){if(start){const x=p[start-1],y=p[start+n-1];pairs-=2*(--h[x]);pairs+=2*(h[y]++);}const sort=h.slice().sort((a,b)=>b-a);minE=Math.min(minE,h[18]);minMax=Math.min(minMax,sort[0]);minTop2=Math.min(minTop2,sort[0]+sort[1]);minIoC=Math.min(minIoC,pairs/(n*(n-1)));}return{windows:p.length-n+1,minE,minMax,minTop2,minIoC};}
 const literary=donor.map((w,i)=>({source:i,whole:windows(w.flat(),12956),chapters:chapters.map(g=>windows(w.flat(),g.flat().length))}));
 // Per-cell secret permutations (different by chapter, group length, and position) encrypt the actual native words.
 // Verify exact rank bounds and round trips. The plant has no shared additive key.
 let seed=241105;function rnd(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n}
 const controls=[];for(const s of gold.sections){const p=words(s.source_text,/[^\u16a0-\u16ff]/u),map=new Map();const c=p.map(w=>w.map((v,j)=>{const k=w.length+":"+j;if(!map.has(k)){const z=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){const q=rnd(i+1);[z[i],z[q]]=[z[q],z[i]];}map.set(k,z);}return map.get(k)[v];}));const recovered=c.map(w=>w.map((v,j)=>map.get(w.length+":"+j).indexOf(v)));if(recovered.flat().join()!==p.flat().join())throw Error("control replay");const actual=measured(p.flat()),cap=bound([c]);let x=0,y=0;for(let j=0;j<29;j++){x+=actual.frequency[j];y+=cap.frequency[j];if(x>y)throw Error("majorization violation");}controls.push({name:s.name,actual,cap});}
 return{ordinary,privateChapter,literalF,privateChapterF,perChapter,exactNative,literary,controls};
}
if(require.main===module)console.log(JSON.stringify(majorization(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
module.exports={majorization};
