'use strict';
const fs=require('node:fs');
const {core,paths}=require('./lp2_q8_latent_independent_phase_sft.cjs');

function feedbackRamp({donors,dict,rng,corpus,latin},which='p40',hold=false){
 const mod=x=>(x%29+29)%29, inv=Array(29).fill(0), thresholds=[6,7,8,9,10];
 for(let i=1;i<29;i++)for(let j=1;j<29;j++)if(i*j%29===1){inv[i]=j;break;}
 const total=[...dict.values()].reduce((a,b)=>a+b,0);
 const groups=Array.from({length:25},()=>new Map());
 // For any given hold mask, a private affine alphabet and linear ramp leave
 // precisely the projective second-difference vector on the consuming positions.
 function signature(a){
  if(a.length<3)return ['_',0,0];
  const d=a.slice(2).map((x,i)=>mod(x-2*a[i+1]+a[i])), j=d.findIndex(x=>x!==0);
  return j<0?['0',0,0]:[d.map(x=>String.fromCharCode(65+x*inv[d[j]]%29)).join(''),d[j],j];
 }
 for(const [s,v] of dict){
  const p=s.split(',').map(Number),w=.95*v/total,active=[];let mask=0;
  for(let l=1;l<=p.length;l++){
   if(hold&&p[l-1]===0)mask+=2**(l-1);else active.push(l-1);
   let group=groups[l].get(mask);
   if(!group){group={pos:active.slice(),zeros:p.slice(0,l).map((_,i)=>i).filter(i=>mask&2**i),table:new Map()};groups[l].set(mask,group);}
   const [sig]=signature(group.pos.map(i=>p[i]));
   let row=group.table.get(sig);
   if(!row){row={complete:0,partial:0,weight:0,p:null};group.table.set(sig,row);}
   if(l===p.length){row.complete+=w;if(w>row.weight){row.weight=w;row.p=p;}}
   else row.partial+=w;
  }
 }
 const lse=(a,b)=>a===-Infinity?b:b===-Infinity?a:Math.max(a,b)+Math.log1p(Math.exp(-Math.abs(a-b)));
 const factor=(m,sig)=>m===0?1:m===1?1/29:sig==='0'||sig==='_'?1/841:1/(28*841);
 function scan(c,h,cut,full=false,seed=0){
  const n=c.length,y=c.map((x,i)=>mod(x-h*(i?c[i-1]:seed))),fw=Array(n+1).fill(-Infinity),best=Array(n+1).fill(-Infinity),prev=Array(n+1);
  fw[0]=best[0]=0;let partial=-Infinity;
  const last=thresholds.map(()=>0),cap=thresholds.map(()=>0);
  for(let end=1;end<=n;end++)for(let l=1;l<=Math.min(24,end);l++){
   const start=end-l;
   // All complete lexical intervals are visited in earliest-finishing order,
   // so independent greedy packings give exact maximum cardinalities.
   for(const g of groups[l].values()){
    if(g.zeros.some(j=>c[start+j]!==0))continue;
    const a=g.pos.map(j=>y[start+j]),[sig]=signature(a),row=g.table.get(sig);if(!row)continue;
    if(row.complete>0){
     for(let t=0;t<thresholds.length;t++)if(a.length>=thresholds[t]&&start>=last[t]){last[t]=end;cap[t]++;}
     const f=factor(a.length,sig);
     fw[end]=lse(fw[end],fw[start]+Math.log(row.complete*f));
     if(full){const b=best[start]+Math.log(row.weight*f);if(b>best[end]){best[end]=b;prev[end]={start,p:row.p};}}
    }
    if(end===cut&&row.partial>0)partial=lse(partial,fw[start]+Math.log(row.partial*factor(a.length,sig)));
   }
   if(l===1){
    const v=hold?.05*(28/29/29+(c[start]===0?1/29:0)):.05/29;
    fw[end]=lse(fw[end],fw[start]+Math.log(v));
    if(full){const p=hold&&c[start]===0?0:1,weight=hold&&p===0?.05/29:.05/29/29;
     const b=best[start]+Math.log(weight);if(b>best[end]){best[end]=b;prev[end]={start,p:[p]};}}
   }
  }
  const prefix=lse(fw[cut],partial),res={h,cap,fit:prefix/cut,held:cut<n?(fw[n]-prefix)/(n-cut):null};
  if(full){
   const words=[];for(let end=n;end>0;){const {start,p}=prev[end];const active=p.map((_,i)=>i).filter(i=>!hold||p[i]!==0),pa=active.map(i=>p[i]),ca=active.map(i=>y[start+i]);
    const [sp,dp,jp]=signature(pa),[sc,dc,jc]=signature(ca);if(sp!==sc)throw Error('incompatible MAP word');
    const a=dp?dc*inv[dp]%29:1,t=pa.length>1?mod(ca[1]-ca[0]-a*(pa[1]-pa[0])):0,b=pa.length?mod(ca[0]-a*pa[0]):0;
    let j=0;for(let i=0;i<p.length;i++){const expect=hold&&p[i]===0?0:mod(h*(start+i?c[start+i-1]:seed)+a*p[i]+b+t*j++);if(expect!==c[start+i])throw Error('MAP replay failure');}
    words.push({start,end,p,a,b,t});end=start;}
   words.reverse();res.map=best[n]/n;res.plain=words.flatMap(x=>x.p);res.decoded=words.map(x=>x.p.map(v=>latin[v]).join('')).join(' ');res.words=words;
  }
  return res;
 }
 function floors(n,t){return donors.map((words,d)=>{let p=0;const e=[];for(const w of words){const start=p;p+=w.length;if(w.filter(x=>!hold||x!==0).length>=t&&dict.has(w.join(',')))e.push([start,p]);}let lo=0,hi=0,min=Infinity;for(let s=0;s+n<=p;s++){while(lo<e.length&&e[lo][0]<s)lo++;while(hi<e.length&&e[hi][1]<=s+n)hi++;min=Math.min(min,Math.max(0,hi-lo));}return {d,windows:p-n+1,min};});}
 function assess(c,cut,truth=null,trueH=null,pad=false){
  const fits=Array.from({length:29},(_,h)=>scan(c.slice(0,cut),h,cut));
  fits.sort((a,b)=>b.fit-a.fit);const winner=scan(c,fits[0].h,cut,true);
  return {n:c.length,cut,trueH,selected:winner.h,fit:winner.fit,held:winner.held,map:winner.map,heldAccuracy:truth?truth.slice(cut).filter((x,i)=>x===winner.plain[cut+i]).length/(c.length-cut):null,decoded:winner.decoded,words:winner.words,rank:fits.map(({h,fit,cap})=>({h,fit,cap})),pad};
 }
 if(which.startsWith('p')){
  const scopes={p0:[0,2,13,515],p40:[40,53,0,1500],p54:[54,55,9,223]};
  const [first,last,drop,cut]=scopes[which],c=corpus.pages.filter(p=>p.page>=first&&p.page<=last).flatMap(p=>p.indices).slice(drop);
  if(which==='p40'){
   const rows=Array.from({length:29},(_,h)=>scan(c,h,c.length));
   return {which,hold,n:c.length,bounds:thresholds.map((t,i)=>{const max=Math.max(...rows.map(r=>r.cap[i])),refs=floors(c.length,t);return {threshold:t,max,arbitrarySeedUpper:max+1,winners:rows.filter(r=>r.cap[i]===max).map(r=>r.h),refs,gap:Math.min(...refs.map(r=>r.min))-max-1};}),rows};
  }
  return {which,hold,...assess(c,cut)};
 }
 const d=Number(which),words=donors[d];let found;for(let i=Math.floor(words.length*.8)+400;i<words.length;i++){let n=0,j=i;while(j<words.length&&n<716)n+=words[j++].length;if(n===716){found=words.slice(i,j);break;}}if(!found)throw Error('no held donor span');
 const rnd=rng(0x29a6f001+d+(hold?1000:0)),h=[1,17,28][d],truth=found.flat();let prev=0;
 const c=found.flatMap(w=>{const a=1+Math.floor(rnd()*28),b=Math.floor(rnd()*29),t=Math.floor(rnd()*29);let j=0;return w.map(p=>{const x=hold&&p===0?0:mod(h*prev+a*p+b+t*j++);prev=x;return x;});});
 const positive=assess(c,515,truth,h),negative=assess(truth.map(()=>Math.floor(rnd()*29)),515,null,null,true);
 const trueCap=scan(c,h,c.length).cap,covered=thresholds.map(t=>found.filter(w=>w.filter(x=>!hold||x!==0).length>=t&&dict.has(w.join(','))).length);if(trueCap.some((x,i)=>x<covered[i]))throw Error('capacity lost planted anchors');
 return {which,hold,positive,negative,trueCap,covered};
}
const which=process.argv[2]??'p40',hold=process.argv[3]==='hold';
console.log(JSON.stringify(core(paths.map(p=>fs.readFileSync(p,'utf8')),x=>feedbackRamp(x,which,hold)),null,2));
