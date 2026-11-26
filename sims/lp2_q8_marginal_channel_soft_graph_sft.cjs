// Soft support spectral seeds and rotation-free graph alignment.
const fs=require("node:fs");
function solve(data,soft){
 const n=29,mod=x=>(x+n)%n;let seed=0x495fc877;const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296};
 const canon=o=>{let i=o.indexOf(0);return o.slice(i).concat(o.slice(0,i))};const truth=new Set(Array.from({length:28},(_,k)=>data.ord.map((_,i)=>data.ord[i*(k+1)%29]).join(",")));
 function eig(A){
 const B=A.map(r=>r.slice()),V=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>+(i===j)));
 for(let it=0;it<50000;it++){let p=0,q=1,z=0;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(Math.abs(B[i][j])>z){p=i;q=j;z=Math.abs(B[i][j])}if(z<1e-10)break;
 const th=0.5*Math.atan2(2*B[p][q],B[q][q]-B[p][p]),c=Math.cos(th),s=Math.sin(th),a=B[p][p],b=B[q][q],x=B[p][q];
 B[p][p]=c*c*a-2*c*s*x+s*s*b;B[q][q]=s*s*a+2*c*s*x+c*c*b;B[p][q]=B[q][p]=0;
 for(let k=0;k<n;k++)if(k!==p&&k!==q){let x=B[k][p],y=B[k][q];B[k][p]=B[p][k]=c*x-s*y;B[k][q]=B[q][k]=s*x+c*y}
 for(let k=0;k<n;k++){let x=V[k][p],y=V[k][q];V[k][p]=c*x-s*y;V[k][q]=s*x+c*y}
 }
 return B.map((r,i)=>({v:r[i],vec:V.map(row=>row[i])})).sort((a,b)=>b.v-a.v);
 }
 function seeds(A){let out=[];for(let mode=0;mode<3;mode++){
 let B=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>mode===0?(A[i][j]+A[j][i])/2:mode===1?A.reduce((s,r)=>s+r[i]*r[j],0):A[i].reduce((s,v,k)=>s+v*A[j][k],0)));
 let mean=B.map(r=>r.reduce((a,b)=>a+b,0)/n),avg=mean.reduce((a,b)=>a+b,0)/n;
 B=B.map((r,i)=>r.map((v,j)=>v-mean[i]-mean[j]+avg));let es=eig(B),dc=es.reduce((m,e,i)=>Math.abs(e.vec.reduce((a,b)=>a+b,0))>Math.abs(es[m].vec.reduce((a,b)=>a+b,0))?i:m,0);es.splice(dc,1);
 for(let i=0;i<28;i+=2){const a=es[i].vec,b=es[i+1].vec;out.push(canon(Array.from({length:n},(_,j)=>j).sort((i,j)=>Math.atan2(b[i],a[i])-Math.atan2(b[j],a[j]))))}
 }return out}
 const out={};for(const ref of ["oracle","independent"])for(const rank of [64,256,1024,4096]){
 const A=soft[ref].matrices[rank].A;
 const hist=o=>{let h=new Float64Array(n);for(let i=0;i<n;i++)for(let j=0;j<n;j++)h[mod(i-j)]+=A[o[i]][o[j]];return h};
 const top=h=>Array.from(h).sort((a,b)=>b-a).slice(0,8).reduce((a,b)=>a+b,0);
 const square=h=>h.reduce((s,v)=>s+v*v,0)/n;
 const ss=seeds(A),d=new Float64Array(n);let best=-Infinity,bo,bh,exact=0,seedExact=ss.filter(o=>truth.has(o.join(","))).length;
 for(let rep=0;rep<ss.length+32;rep++){
 let o=rep<ss.length?ss[rep].slice():Array.from({length:n},(_,i)=>i);
 if(rep>=ss.length)for(let i=n-1;i>0;i--){let j=Math.floor(rand()*(i+1));[o[i],o[j]]=[o[j],o[i]]}
 let h=hist(o),v=top(h),q=square(h);
 for(let t=0;t<12000;t++){let a=Math.floor(rand()*n),b=Math.floor(rand()*n);if(a===b)continue;
 let x=o[a],y=o[b];d.fill(0);
 for(let j=0;j<n;j++){if(j===a||j===b)continue;let z=o[j];d[mod(a-j)]+=A[y][z]-A[x][z];d[mod(b-j)]+=A[x][z]-A[y][z];d[mod(j-a)]+=A[z][y]-A[z][x];d[mod(j-b)]+=A[z][x]-A[z][y]}
 d[mod(a-b)]+=A[y][x]-A[x][y];d[mod(b-a)]+=A[x][y]-A[y][x];for(let k=0;k<n;k++)h[k]+=d[k];
 let nv=top(h),nq=square(h);let lam=t<6000?0.5*(1-t/6000):0,T=1.4*Math.pow(0.015,t/12000);
 let diff=nv-v+lam*(nq-q);
 if(diff>=0||rand()<Math.exp(diff/T)){[o[a],o[b]]=[y,x];v=nv;q=nq;if(v>best){best=v;bo=canon(o);bh=Array.from(h)}}else for(let k=0;k<n;k++)h[k]-=d[k];
 }
 if(truth.has(canon(o).join(",")))exact++;
 }
 out[ref+":"+rank]={best,truthScore:top(hist(data.ord)),cycleExact:truth.has(bo.join(",")),exact,seedExact,ord:bo,shifts:Array.from({length:n},(_,i)=>i).sort((a,b)=>bh[b]-bh[a]).slice(0,8),starts:ss.length+32};
 }return out;
}
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));console.log(JSON.stringify(solve(read("im-results/lp2-q8-marginal-channel-structured-objective.json"),read("im-results/lp2-q8-marginal-channel-soft-support-output.json")),null,2));
