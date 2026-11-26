'use strict';
const fs=require('node:fs');
const path=require('node:path');
function experiment(A,B){
 const assert=(v,m)=>{if(!v)throw Error(m)},mod=(v,m=29)=>(v%m+m)%m;
 const primes=[];for(let n=2;primes.length<3301;n++){let prime=true;for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break}if(prime)primes.push(n);}
 const fib=[];let a=0,b=1;do{fib.push(a);[a,b]=[b,(a+b)%3301]}while(a!==0||b!==1);
 assert(fib.length===1650,"period");
 const distinct=[0,1,...fib.slice(3,17)],grid=[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516];
 assert(String(distinct.map(x=>Math.abs(3301-primes[x])))===String(grid),"printed grid");
 const native=s=>[...s.source_text].map(x=>A.runes.indexOf(x)).filter(x=>x>=0);
 const sec=B.sections.find(s=>s.name==="p56_an_end"),p56=native(sec);
 function enc(p,K,sign,hold=true){let q=0;return p.map(x=>hold&&x===0?0:mod(x+sign*K(q++)));}
 assert(String(enc(p56,i=>primes[i]-1,1))===String(A.pages[56].indices),"authentic p56");
 const donor=B.sections.filter(s=>["0_koan_1","0_loss_of_divinity","jpg107-167","jpg229"].includes(s.name)).flatMap(native);
 const prior=B.sections.filter(s=>!["0_koan_1","0_loss_of_divinity","jpg107-167","jpg229"].includes(s.name)).flatMap(native);
 const counts=Array(29).fill(0),pairs=Array.from({length:29},()=>Array(29).fill(0));
 prior.forEach((v,i)=>{counts[v]++;if(i)pairs[prior[i-1]][v]++;});
 const log= pairs.map(row=>{let n=row.reduce((a,b)=>a+b,0);return row.map((x,i)=>Math.log((x+5*(counts[i]+.5)/(prior.length+14.5))/(n+5)));});
 function metrics(v){const c=Array(29).fill(0);let score=0;v.forEach((x,i)=>{c[x]++;if(i)score+=log[v[i-1]][x]});return {ioc:c.reduce((s,x)=>s+x*(x-1),0)/(v.length*(v.length-1)),bigram:score/(v.length-1),preview:v.slice(0,60).map(i=>A.translit[i]).join(" ")};}
 function reach(c,K,sign){let s=new Uint8Array(c.length+2);s[0]=1;let z=0;for(let i=0;i<c.length;i++){let any=0;const v=c[i];if(v===0){for(let h=z+1;h>=0;h--){s[h]=((h<=z&&s[h]&&mod(sign*K(i-h))!==0)||(h>0&&s[h-1]))?1:0;any|=s[h];}z++;}else{for(let h=0;h<=z;h++){if(s[h]&&mod(sign*K(i-h))===v)s[h]=0;any|=s[h];}}if(!any)return {prefix:i,states:0};}return {prefix:c.length,states:s.reduce((a,b)=>a+b,0)};}
 const mapper={grid:x=>mod(Math.abs(3301-primes[x])),primeMinusOne:x=>mod(primes[x]-1)};
 const targets=[9,20].map(skip=>({skip,c:A.pages.slice(15,23).flatMap((p,i)=>i?p.indices:p.indices.slice(skip))}));
 const result={period:fib.length,grid,firstAfterGrid:fib.slice(17,23),nativeP56:p56.length,donorLength:donor.length,priorLength:prior.length,targets:[],plants:[]};
 for(const {skip,c} of targets){const t={skip,length:c.length,zeros:c.filter(x=>x===0).length,raw:metrics(c),fixed:[],phaseSearch:[]};for(const [kind,m] of Object.entries(mapper)){const ring=fib.map(m);
 for(const sign of [1,-1]){
  const get=(origin,i)=>origin==="distinctStart"?ring[(i<2?i:i+1)%ring.length]:ring[(17+i)%ring.length];
  for(const origin of ["distinctStart","afterGrid"]){const K=i=>get(origin,i),rr=reach(c,K,sign),v=c.map((x,i)=>mod(x-sign*K(i)));t.fixed.push({kind,sign,origin,fhold:rr,ordinary:metrics(v)});const P=donor.slice(0,c.length);assert(P.length===c.length,"donor size");const C=enc(P,K,sign);const ctrl=reach(C,K,sign);assert(ctrl.prefix===c.length,"plant");result.plants.push({skip,kind,sign,origin,holds:ctrl.states,truth:metrics(P)});}
  let max=0,phases=[],full=0,train=0;
  for(let phase=0;phase<ring.length;phase++){const r=reach(c,i=>ring[(phase+i)%ring.length],sign);if(r.prefix>max){max=r.prefix;phases=[phase]}else if(r.prefix===max)phases.push(phase);if(r.prefix>=928)train++;if(r.prefix===c.length)full++;}
  t.phaseSearch.push({kind,sign,phases:1650,max,phaseAtMax:phases,train,full});
 }}
 result.targets.push(t);}
 return result;
}
const read=p=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json")),null,2));
