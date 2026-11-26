'use strict';
const fs=require('node:fs');
const {core,paths}=require('./lp2_q8_latent_independent_phase_sft.cjs');
const N=12956,cuts=[0,729,1874,3603,5506,6527,7960,9640,12648];
function cover({donors,dict,latin},frozen){
 const W=latin.map(x=>x.length), keys=new Set(frozen.map(x=>x.p));
 function measure(){
  return donors.map((words,d)=>{
   const n=words.reduce((a,b)=>a+b.length,0)-N+1,D=new Int32Array(n+1);
   let pos=0,occ=0;
   for(const w of words){const start=pos;pos+=w.length;if(!keys.has(w.map(x=>x.toString(36)).join('')))continue;occ++;
    for(let j=0;j<cuts.length-1;j++){const lo=Math.max(0,pos-cuts[j+1]),hi=Math.min(n,start-cuts[j]+1);if(lo<hi){D[lo]++;D[hi]--;}}}
   let cov=0,min=Infinity,missing=[],hist={};for(let i=0;i<n;i++){cov+=D[i];min=Math.min(min,cov);hist[cov]=(hist[cov]??0)+1;if(!cov)missing.push(i);}
   return {d,n,occ,min,missing,hist};
  });
 }
 const before=measure(),rows=[];for(const {d,missing} of before){if(!missing.length)continue;let pos=0;for(const w of donors[d]){const start=pos;pos+=w.length;let t=0,m=0;for(const x of w)if(x){m|=1<<t;t=(t+W[x])%13;}const cov=m.toString(2).replace(/0/g,'').length;if(cov<11||!dict.has(w.join(',')))continue;
  const count=missing.filter(i=>cuts.slice(0,-1).some((a,j)=>start>=i+a&&pos<=i+cuts[j+1])).length;
  if(count)rows.push({p:w.map(x=>x.toString(36)).join(''),word:w.map(x=>latin[x]).join(''),len:w.length,cov,count,start,pos,d});}}
 rows.sort((a,b)=>b.count-a.count||b.cov-a.cov||b.len-a.len||a.start-b.start||a.d-b.d);
 const added=rows[0];if(!added)throw Error('no extension');keys.add(added.p);
 const after=measure();if(after.some(x=>x.missing.length))throw Error('incomplete extension');
 return {N,cuts,before,candidates:rows,added,after};
}
module.exports={cover};
if(require.main===module){const frozen=JSON.parse(fs.readFileSync('im-results/lp2-q13-plainwidth-cover-bank.json','utf8')).chosen;const r=core(paths.map(p=>fs.readFileSync(p,'utf8')),a=>cover(a,frozen));console.log(process.argv[2]==='bank'?r.added.p:JSON.stringify(r,null,2));}
