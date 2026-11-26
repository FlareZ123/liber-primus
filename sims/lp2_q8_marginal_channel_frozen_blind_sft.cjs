"use strict";
const fs=require("node:fs"),path=require("node:path");
function experiment(corpus,raw,g,s,e,seed){
 const M=29,mod=x=>(x+M*2)%M,F=0;
 const idx=new Map(corpus.runes.map((v,i)=>[v,i])),profile=Array(40).fill(0);let wlen=0;
 const flush=()=>{if(wlen){profile[wlen]++;wlen=0}};
 for(const c of raw.split("%").slice(0,55).join("%")){if(idx.has(c))wlen++;else if(c!=="/"&&c!=="%"&&!/\s/u.test(c))flush()}flush();
 const alphabet=corpus.translit;
 const pool=text=>{let by=Array.from({length:40},()=>[]);for(let w of text.toUpperCase().match(/[A-Z]+/g)||[]){
  w=w.replaceAll("QU","CW").replaceAll("Q","C").replaceAll("K","C").replaceAll("V","U").replaceAll("Z","S");
  let a=[];while(w.length){const t=["ING","TH","EO","NG","OE","AE","IA","EA","IO"].find(t=>w.startsWith(t))||w[0];const q=alphabet.indexOf(t==="ING"?"NG":t==="IO"?"IA":t);if(q>=0)a.push(q);w=w.slice(t.length)}
  if(a.length&&a.length<40)by[a.length].push(a)
 }return by};
 const oracle=pool(s),train=pool(g+"\n"+e),contexts=[];
 for(let l=1;l<40;l++)if(profile[l]&&oracle[l].length&&train[l].length)for(let i=0;i<l;i++)contexts.push({l,i,n:profile[l]});
 const ci=Object.fromEntries(contexts.map((v,i)=>[`${v.l}:${v.i}`,i]));
 const X=by=>contexts.map(({l,i})=>{let h=Array(M).fill(0);for(const w of by[l])h[w[i]]++;return h.map(n=>n/by[l].length)});
 let st=seed;
 const rng=()=>{st^=st<<13;st^=st>>>17;st^=st<<5;return st>>>0};
 const perm=()=>{let p=Array.from({length:M},(_,i)=>i);for(let i=M-1;i>1;i--){let j=1+rng()%i;[p[i],p[j]]=[p[j],p[i]]}return p};
 const ord=perm(),pi=[];ord.forEach((v,i)=>pi[v]=i);
 const k=[];while(k.length<8){const d=rng()%29;if(!k.includes(d))k.push(d)}const Y=contexts.map(()=>new Float64Array(M));
 for(let l=1;l<40;l++)if(profile[l]&&oracle[l].length&&train[l].length){
  const by=oracle[l];for(let j=0;j<profile[l];j++){let w=by[rng()%by.length],phase=rng()%8;
   for(let i=0;i<l;i++){let p=w[i],c=F;if(p!==F){c=ord[mod(pi[p]+k[phase])];phase=(phase+1)%8}Y[ci[`${l}:${i}`]][c]++}
  }
 }
 const trueRows=Array.from({length:M},(_,c)=>k.map(d=>ord[mod(pi[c]-d)]).sort((a,b)=>a-b));
 function allRows(X){
  const G=Array.from({length:M},()=>new Float64Array(M)),L=Array.from({length:M},()=>new Float64Array(M));
  for(let t=0;t<contexts.length;t++){const n=contexts[t].n,x=X[t],y=Y[t];for(let p=1;p<M;p++){for(let q=1;q<M;q++)G[p][q]+=n*x[p]*x[q]/64;for(let c=0;c<M;c++)L[p][c]+=-2*(x[p]/8)*(y[c]-(c===F?n*x[F]:0));}}
  return {G:G.map(r=>Array.from(r)),L:L.map(r=>Array.from(r))};
 }
 return {key:k,ord,contexts:contexts.length,sourceGroups:profile.reduce((a,b)=>a+b,0),sourceRunes:profile.reduce((a,b,i)=>a+i*b,0),oracle:allRows(X(oracle)),independent:allRows(X(train))};
}
function softSupports(data){
const n=29,K=4096,out={};
for(const name of ["independent"]){
const {G,L}=data[name], heaps=Array.from({length:n},()=>({scores:new Float64Array(K).fill(Infinity),masks:new Uint32Array(K)}));
let stack=new Int8Array(8),linear=new Float64Array(n),leaves=0;
function offer(h,z,m){
if(z>=h.scores[0])return;
let i=0;while(true){let c=2*i+1;if(c>=K)break;if(c+1<K&&h.scores[c+1]>h.scores[c])c++;if(h.scores[c]<=z)break;h.scores[i]=h.scores[c];h.masks[i]=h.masks[c];i=c}h.scores[i]=z;h.masks[i]=m;
}
function rec(start,depth,quad,mask){
if(depth===8){leaves++;for(let c=0;c<n;c++)offer(heaps[c],quad+linear[c],mask);return}
for(let p=start;p<=n-(8-depth);p++){let add=G[p][p];for(let j=0;j<depth;j++)add+=2*G[p][stack[j]];for(let c=0;c<n;c++)linear[c]+=L[p][c];stack[depth]=p;rec(p+1,depth+1,quad+add,mask|(1<<p));for(let c=0;c<n;c++)linear[c]-=L[p][c]}
}
rec(0,0,0,0);if(leaves!==4292145)throw Error("coverage");
let truth=Array.from({length:n},(_,c)=>data.key.map(d=>data.ord[(data.ord.indexOf(c)-d+n)%n]));
let ranked=heaps.map(h=>Array.from(h.scores,(score,i)=>({score,mask:h.masks[i]})).sort((a,b)=>a.score-b.score));
let matrices={};for(let k of [64,256,1024,4096]){let A=ranked.map(row=>{let w=new Float64Array(n);for(let {mask} of row.slice(0,k))for(let p=0;p<n;p++)if(mask&(1<<p))w[p]+=1/k;return Array.from(w)});let best=A.map(row=>Array.from({length:n},(_,i)=>i).sort((a,b)=>row[b]-row[a]).slice(0,8));let edges=best.reduce((sum,row,c)=>sum+row.filter(p=>truth[c].includes(p)).length,0);let truthWeight=truth.reduce((sum,row,c)=>sum+row.reduce((s,p)=>s+A[c][p],0),0);matrices[k]={A,edges,truthWeight};}
out[name]={leaves,matrices};
}return out;
}
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
 const out={};for(const ref of ["independent"])for(const rank of [64,256,1024,4096]){
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
function refine(data,previous){
 const n=29,mod=x=>(x+n)%n;const out={};let st=0x7eac19cf;const rng=()=>{st^=st<<13;st^=st>>>17;st^=st<<5;return(st>>>0)/4294967296};
 const canon=o=>{const i=o.indexOf(0);return o.slice(i).concat(o.slice(0,i))};
 const gauges=Array.from({length:28},(_,k)=>data.ord.map((_,i)=>data.ord[i*(k+1)%29]).join(","));
 for(const [name,old] of Object.entries(previous)){
 const [ref,mode]=name.split(":"),known=false,{G,L}=data[ref];
 const corr=o=>{let g=new Float64Array(n),l=new Float64Array(n);for(let i=0;i<n;i++)for(let j=0;j<n;j++){let d=mod(i-j);g[d]+=G[o[j]][o[i]];l[d]+=L[o[j]][o[i]]}return {g,l}};
 const cost=(c,k)=>{let v=0;for(const d of k){v+=c.l[d];for(const e of k)v+=c.g[mod(d-e)]}return v};
 const optK=(c,k)=>{let v=cost(c,k);while(true){let b=v,bi=-1,bd=-1;for(let i=0;i<8;i++){let d0=k[i];for(let d=0;d<n;d++){if(k.includes(d))continue;k[i]=d;let z=cost(c,k);if(z<b-1e-9){b=z;bi=i;bd=d}}k[i]=d0}if(bi<0)return v;k[bi]=bd;v=b}};
 let best=Infinity,bo,bk,exact=0;
 const runs=12,steps=16000,dg=new Float64Array(n),dl=new Float64Array(n);
 for(let rep=0;rep<runs;rep++){
 let o=old.bestOrd.slice(),k=old.bestShift.slice();if(rep){for(let j=0;j<rep%5;j++){let a=Math.floor(rng()*n),b=Math.floor(rng()*n);[o[a],o[b]]=[o[b],o[a]]}}
 let c=corr(o),v=known?cost(c,k):optK(c,k);
 for(let t=0;t<steps;t++){
 let T=0.14*Math.pow(0.005,t/steps),a,b,nv;
 if(!known&&rng()<0.12){a=Math.floor(rng()*8);b=Math.floor(rng()*n);if(k.includes(b))continue;let old=k[a];k[a]=b;nv=cost(c,k);if(nv<=v||rng()<Math.exp((v-nv)/T))v=nv;else k[a]=old}
 else {
 a=Math.floor(rng()*n);b=Math.floor(rng()*n);if(a===b)continue;let x=o[a],y=o[b];dg.fill(0);dl.fill(0);
 for(let j=0;j<n;j++){if(j===a||j===b)continue;let z=o[j],u=mod(a-j),w=mod(b-j);dg[u]+=G[z][y]-G[z][x];dg[w]+=G[z][x]-G[z][y];dg[mod(j-a)]+=G[y][z]-G[x][z];dg[mod(j-b)]+=G[x][z]-G[y][z];dl[u]+=L[z][y]-L[z][x];dl[w]+=L[z][x]-L[z][y];dl[mod(j-a)]+=L[y][z]-L[x][z];dl[mod(j-b)]+=L[x][z]-L[y][z]}
 let u=mod(a-b),w=mod(b-a);dg[u]+=G[x][y]-G[y][x];dg[w]+=G[y][x]-G[x][y];dl[u]+=L[x][y]-L[y][x];dl[w]+=L[y][x]-L[x][y];for(let d=0;d<n;d++){c.g[d]+=dg[d];c.l[d]+=dl[d]}
 nv=cost(c,k);if(nv<=v||rng()<Math.exp((v-nv)/T)){[o[a],o[b]]=[y,x];v=nv}else for(let d=0;d<n;d++){c.g[d]-=dg[d];c.l[d]-=dl[d]}
 }
 if(v<best){best=v;bo=canon(o);bk=k.slice()}
 }
 if(Math.abs(v-cost(corr(o),k))>1e-7)throw Error("drift");
 if(gauges.includes(canon(o).join(",")))exact++;
 }
 let rank=bo.map(x=>data.ord.indexOf(x)),step=rank[1];let shiftExact=step!==0&&bk.map(d=>mod(d*step%29)).sort((a,b)=>a-b).join(",")===data.key.slice().sort((a,b)=>a-b).join(",");
 out[name]={before:old.best,best,trueCost:old.trueCost,cycleExact:gauges.includes(bo.join(",")),shiftExact,exact,runs,steps,bestOrd:bo,bestShift:bk};
 }
 return out;
}
function blind(corpus,raw,g,s,e,seed){
 const data=experiment(corpus,raw,g,s,e,seed),soft=softSupports(data),seeds=solve(data,soft),inputs=Object.fromEntries(Object.entries(seeds).map(([name,x])=>[name,{bestOrd:x.ord,bestShift:x.shifts,best:null,trueCost:null}]));
 const candidates=refine(data,inputs),ranked=Object.entries(candidates).sort((a,b)=>a[1].best-b[1].best);
 return {seed,key:data.key,ord:data.ord,candidates,selected:ranked[0][0],exact:ranked[0][1].cycleExact&&ranked[0][1].shiftExact};
}
const root=path.resolve(__dirname,"..");const read=p=>fs.readFileSync(path.join(root,p),"utf8");const seed=Number(process.argv[2]||0x64b3a911);console.log(JSON.stringify(blind(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/liber-primus/lp2-transcription.txt"),read("resources/control/gibran_prophet_58585.txt"),read("resources/control/shakespeare_first300k.txt"),read("resources/control/emerson_essays_2944.txt"),seed),null,2));
