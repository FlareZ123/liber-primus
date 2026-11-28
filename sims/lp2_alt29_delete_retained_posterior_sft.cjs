"use strict";
/** Conditional retained-rune posterior for supplied GP29 deletion key.
 * Sum all accepted hidden paths, then minimize expected positional Hamming loss.
 * Marginal modes are not a claim of a unique full sender path. */
function posterior(C,e,initial){
 const {q,N,M,K}=e,n=C.length,alpha=new Float64Array(n*q),scale=new Float64Array(n);
 const f=initial(e,0);let sum=0;
 for(let j=0;j<q;j++){alpha[j]=f[C[0]*q+j];sum+=alpha[j];}
 if(!(sum>0))throw Error("impossible first rune");scale[0]=sum;
 for(let j=0;j<q;j++)alpha[j]/=sum;
 for(let t=1;t<n;t++){
   const src=C[t-1]*q,dst=C[t]*q,prev=(t-1)*q,now=t*q;sum=0;
   for(let i=0;i<q;i++){const w=alpha[prev+i],off=(src+i)*N+dst;for(let j=0;j<q;j++)alpha[now+j]+=w*M[off+j];}
   for(let j=0;j<q;j++)sum+=alpha[now+j];if(!(sum>0))throw Error("impossible rune "+t);
   scale[t]=sum;for(let j=0;j<q;j++)alpha[now+j]/=sum;
 }
 let beta=new Float64Array(q).fill(1),next=new Float64Array(q);
 const rows=new Array(n);let maxMassError=0;
 for(let t=n-1;t>=0;t--){
   const prob=new Float64Array(29);sum=0;
   for(let j=0;j<q;j++){const w=alpha[t*q+j]*beta[j];prob[(C[t]-K[(j+q-1)%q]+29)%29]+=w;sum+=w;}
   maxMassError=Math.max(maxMassError,Math.abs(sum-1));
   let best=0,H=0;
   for(let p=0;p<29;p++){prob[p]/=sum;if(prob[p]>prob[best])best=p;if(prob[p]>0)H-=prob[p]*Math.log2(prob[p]);}
   rows[t]={p:best,confidence:prob[best],entropy:H,prob:Array.from(prob)};
   if(t){const src=C[t-1]*q,dst=C[t]*q;next.fill(0);for(let i=0;i<q;i++){const off=(src+i)*N+dst;for(let j=0;j<q;j++)next[i]+=M[off+j]*beta[j];next[i]/=scale[t];}[next,beta]=[beta,next];}
 }
 if(maxMassError>1e-8)throw Error("posterior normalization "+maxMassError);
 return {rows,maxMassError,likelihood:scale.reduce((a,b)=>a+Math.log(b),0)/n};
}
function measure(rows,truth,map,cut=0){
 const n=rows.length-cut,out={n,expectedAccuracy:0,meanEntropy:0,modeAccuracy:truth?0:null,mapAccuracy:truth&&map?0:null,trueLogLoss:truth?0:null,thresholds:[]};
 for(let i=cut;i<rows.length;i++){const z=rows[i];out.expectedAccuracy+=z.confidence/n;out.meanEntropy+=z.entropy/n;
 if(truth){out.modeAccuracy+=(z.p===truth[i])/n;out.trueLogLoss-=Math.log(Math.max(z.prob[truth[i]],1e-300))/n;if(map)out.mapAccuracy+=(map[i]===truth[i])/n;}}
 for(const threshold of [.5,.7,.8,.9,.95,.99]){const idx=[];for(let i=cut;i<rows.length;i++)if(rows[i].confidence>=threshold)idx.push(i);
 out.thresholds.push({threshold,n:idx.length,coverage:idx.length/n,observedAccuracy:truth&&idx.length?idx.filter(i=>rows[i].p===truth[i]).length/idx.length:null,expectedAccuracy:idx.length?idx.reduce((a,i)=>a+rows[i].confidence,0)/idx.length:null});}
 return out;
}
function run(raw,base,blind,opt={}){
 const m=base.model(raw,"delete"),n=1883,cut=1479;let C,K,plant=null;
 if(opt.original){C=m.gp.pages[15].indices.slice(20).concat(m.gp.pages.slice(16,23).flatMap(p=>p.indices));K=[24,1,8,19,27,15,17,7,19,14,24,11,24,20,17,7];}
 else{const seed=opt.seed||20261128,r=base.rng(seed);K=Array.from({length:16},()=>r(29));plant=base.sender(m.tests[opt.source||"gibran"].slice(opt.offset||5000),K,m,n,seed^0x12345678);C=plant.C;}
 const e=blind.effective(K,m,base),z=posterior(C,e,blind.initial),map=base.decode(C,K,m).retained,truth=plant?.retained||null;
 return {source:opt.original?"original":opt.source||"gibran",K,cut,n,likelihood:z.likelihood,maxMassError:z.maxMassError,all:measure(z.rows,truth,map),held:measure(z.rows,truth,map,cut),mode:z.rows.map(x=>x.p),confidence:z.rows.map(x=>x.confidence),entropy:z.rows.map(x=>x.entropy)};
}
if(typeof module!=="undefined")module.exports={posterior,measure,run};
if(typeof require!=="undefined"&&typeof module!=="undefined"&&require.main===module){
 const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
 const raw={gp:read("resources/liber-primus/lp2-corpus.json"),shakespeare:read("resources/control/shakespeare_first300k.txt"),gibran:read("resources/control/gibran_prophet_58585.txt"),emerson:read("resources/control/emerson_essays_2944.txt")};
 console.log(JSON.stringify(run(raw,require("./lp2_alt_periodic_exact_map_sft.cjs"),require("./lp2_alt29_delete_blind_periodic_sft.cjs"),JSON.parse(process.argv[2]||"{}")),null,2));
}
