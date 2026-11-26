'use strict';
const fs=require('node:fs');
const {core,paths}=require('./lp2_q8_latent_independent_phase_sft.cjs');
/** Reference-only hitting set of full-book long native words, with no chapter-crossing anchor requirement. */
function build({donors,dict,latin,corpus},frozen){
 const N=12956,q=13,W=latin.map(x=>x.length),cuts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956],bank=new Map(),ns=[];
 function cov(p){let t=0,m=0;for(const x of p)if(x){m|=1<<t;t=(t+W[x])%q;}return m.toString(2).replace(/0/g,'').length;}
 for(let d=0;d<donors.length;d++){const words=donors[d],n=words.reduce((a,b)=>a+b.length,0)-N+1;ns.push(n);let pos=0;
  for(const p of words){const start=pos;pos+=p.length;const k=p.join(','),c=cov(p);if(c<11||!dict.has(k))continue;
   const lo=Math.max(0,pos-N),hi=Math.min(n,start+1);if(lo>=hi)continue;let intervals=[[lo,hi]];
   // Remove starts for which a true selected word would cross a physical chapter reset.
   for(const cut of cuts.slice(1,-1)){const l=start-cut+1,h=pos-cut;const next=[];for(const [a,b] of intervals){if(h<=a||l>=b){next.push([a,b]);continue;}if(a<l)next.push([a,l]);if(h<b)next.push([h,b]);}intervals=next;}
   if(!intervals.length)continue;
   let z=bank.get(k);if(!z)bank.set(k,z={p,cover:c,occ:donors.map(()=>[])});z.occ[d].push(...intervals);
  }
 }
 for(const z of bank.values())for(let d=0;d<ns.length;d++){const m=[];for(const [a,b] of z.occ[d].sort((x,y)=>x[0]-y[0]||x[1]-y[1])){const p=m.at(-1);if(p&&p[1]>=a)p[1]=Math.max(p[1],b);else m.push([a,b]);}z.occ[d]=m;}
 const uncovered=ns.map(n=>new Uint8Array(n).fill(1)),chosen=[];let remain=ns.reduce((a,b)=>a+b,0),total=remain;
 while(remain>0){const pref=uncovered.map(a=>{const b=new Int32Array(a.length+1);for(let i=0;i<a.length;i++)b[i+1]=b[i]+a[i];return b;});let best=null,bg=0,bs=0;
  for(const [key,a] of bank){if(frozen&&a.p.map(x=>x.toString(36)).join('')!==frozen[chosen.length].p)continue;let gain=0;for(let d=0;d<ns.length;d++)for(const [l,h] of a.occ[d])gain+=pref[d][h]-pref[d][l];const score=gain/29**(13-a.cover);if(score>bs||(score===bs&&gain>bg)){best={key,a};bg=gain;bs=score;}}
  if(!best)throw Error('uncovered '+remain+' after '+chosen.length);
  for(let d=0;d<ns.length;d++)for(const [l,h] of best.a.occ[d])uncovered[d].fill(0,l,h);
  remain-=bg;chosen.push({p:best.a.p.map(x=>x.toString(36)).join(''),latin:best.a.p.map(x=>latin[x]).join(''),cover:best.a.cover,len:best.a.p.length,gain:bg,remain});bank.delete(best.key);
 }
 const c=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);let hash=2166136261;for(const x of c)hash=Math.imul(hash^x,16777619)>>>0;
 if(c.length!==N||uncovered.some(x=>x.some(Boolean)))throw Error('source coverage');
 return {N,q,cuts,ns,total,chosen,estimatedCompletions:chosen.reduce((s,x)=>s+N*29**(q-x.cover),0),tapeFNV:hash};
}
module.exports={build};
if(require.main===module){const frozen=JSON.parse(fs.readFileSync('im-results/lp2-q13-plainwidth-cover-bank.json','utf8')).chosen;const out=core(paths.map(p=>fs.readFileSync(p,'utf8')),a=>build(a,frozen));console.log(process.argv[2]==='bank'?out.chosen.map(x=>x.p).join('\n'):JSON.stringify(out,null,2));}
