'use strict';
const fs=require('node:fs');
function experiment(corpus,native){
 const N=12,W=16,Q=29,M=29n**BigInt(N),mod=x=>(x%29+29)%29,bmod=(x,m)=>(x%m+m)%m;
 const pow=Array.from({length:N+1},(_,i)=>29n**BigInt(i)),big=x=>x.reduceRight((a,b)=>a*29n+BigInt(b),0n),digits=x=>Array.from({length:N},(_,i)=>Number(x/pow[i]%29n));
 function inv(a,m){let [x,y,u,v]=[bmod(a,m),m,1n,0n];while(y){let q=x/y;[x,y,u,v]=[y,x-q*y,v,u-q*v]}if(x!==1n)throw Error("nonunit");return bmod(u,m)}
 const I=Array.from({length:29},(_,x)=>x?Number(inv(BigInt(x),29n)):0);
 const sections=native.sections.map(s=>({name:s.name,seq:[...s.source_text].map(x=>native.runes.indexOf(x)).filter(x=>x>=0)}));
 const exclude=["0_koan_1","0_loss_of_divinity"],donors=sections.filter(s=>exclude.includes(s.name)).flatMap(s=>Array.from({length:Math.floor(s.seq.length/N)},(_,i)=>s.seq.slice(i*N,i*N+N)));
 function model(rev){const u=Array(29).fill(1),b=Array(841).fill(.5),t=Array(24389).fill(.25);
 for(const s of sections.filter(s=>!exclude.includes(s.name))){const x=rev?[...s.seq].reverse():s.seq;for(let i=0;i<x.length;i++){u[x[i]]++;if(i)b[x[i-1]*29+x[i]]++;if(i>1)t[(x[i-2]*29+x[i-1])*29+x[i]]++}}
 const us=u.reduce((a,b)=>a+b),bs=Array(29).fill(0),ts=Array(841).fill(0);for(let i=0;i<841;i++)bs[Math.floor(i/29)]+=b[i];for(let i=0;i<24389;i++)ts[Math.floor(i/29)]+=t[i];
 return {u:u.map(v=>Math.log(v/us)),b:b.map((v,i)=>Math.log(.8*v/bs[Math.floor(i/29)]+.2*u[i%29]/us)),t:t.map((v,i)=>{const a=Math.floor(i/29),c=i%29,p=a%29;return Math.log(.6*v/ts[a]+.3*b[p*29+c]/bs[p]+.1*u[c]/us)})}}
 function score(P,l){let sum=0,n=0;for(const p of P)for(let j=0;j<N;j++){sum+=j===0?l.u[p[j]]:j===1?l.b[p[0]*29+p[1]]:l.t[(p[j-2]*29+p[j-1])*29+p[j]];n++}return sum/n}
 function recover(C,rev,truth){
 const ci=C.map(big),fit=ci.filter((_,i)=>i%4!==3),held=ci.filter((_,i)=>i%4===3),K=fit.length,l=model(rev);
 const x=fit.map(v=>Number(v%29n)),allx=ci.map(v=>Number(v%29n)),groups=[...new Set(x)].sort((a,b)=>a-b),gidx=new Map(groups.map((g,i)=>[g,i]));
 let beam=[],trace=[];
 function retain(next,s){if(next.length===W&&s.score<=next[W-1].score)return;next.push(s);next.sort((a,b)=>b.score-a.score);if(next.length>W)next.pop()}
 let legal0=0;
 for(let d=0;d<29;d++){
 if(allx.some(z=>mod(1+d*z)===0))continue;
 for(let a=0;a<29;a++)for(let b=0;b<29;b++){if(mod(a-b*d)===0)continue;legal0++;const p=x.map(z=>mod((a*z+b)*I[mod(1+d*z)]));let sc=0;for(const y of p)sc+=l.u[y];retain(beam,{A:BigInt(a),B:BigInt(b),D:BigInt(d),p:p.map(BigInt),score:sc})}
 }
 const truthIn=j=>truth?beam.some(s=>["A","B","D"].every(k=>s[k]===truth[k]%pow[j])):null;
 trace.push({digits:1,fit:beam[0].score/K,truthRetained:truthIn(1)});
 for(let j=1;j<N;j++){
 let next=[];const m=pow[j],m2=pow[j+1];
 for(const s of beam){
 const d0=Number(s.D%29n),den=groups.map(z=>I[mod(1+d0*z)]),y0=groups.map(z=>mod((Number(s.A%29n)*z+Number(s.B%29n))*I[mod(1+d0*z)]));
 const base=fit.map((c,i)=>{const rem=s.A*c+s.B-(1n+s.D*c)*s.p[i];if(rem%m!==0n)throw Error("bad lift");return mod(Number(bmod(rem/m,29n))*I[mod(1+d0*x[i])])});
 const rows=groups.map(()=>new Float64Array(29));
 for(let i=0;i<K;i++){
 const prev=Number(s.p[i]/pow[j-1]%29n),prev2=j>1?Number(s.p[i]/pow[j-2]%29n):0,off=j===1?prev*29:(prev2*29+prev)*29,arr=j===1?l.b:l.t,gi=gidx.get(x[i]);
 for(let sh=0;sh<29;sh++)rows[gi][sh]+=arr[off+(base[i]+sh)%29];
 }
 const delta=groups.map((z,g)=>Array.from({length:29},(_,b)=>mod(b*den[g])));
 const ax=groups.map((z,g)=>mod(z*den[g])),dy=groups.map((z,g)=>mod(-z*y0[g]*den[g]));
 const accum=new Float64Array(29),shifts=new Int32Array(groups.length);
 for(let a=0;a<29;a++)for(let d=0;d<29;d++){
 accum.fill(0);for(let g=0;g<groups.length;g++){const sh=(a*ax[g]+d*dy[g])%29;shifts[g]=sh;const row=rows[g],db=delta[g];for(let b=0;b<29;b++)accum[b]+=row[(sh+db[b])%29]}
 for(let b=0;b<29;b++){
 const sc=s.score+accum[b];if(next.length===W&&sc<=next[W-1].score)continue;
 const A=s.A+BigInt(a)*m,B=s.B+BigInt(b)*m,D=s.D+BigInt(d)*m;
 const p=s.p.map((v,i)=>v+BigInt((base[i]+shifts[gidx.get(x[i])]+delta[gidx.get(x[i])][b])%29)*m);
 if(p.some((v,i)=>bmod(A*fit[i]+B-(1n+D*fit[i])*v,m2)!==0n))throw Error("bad retained lift");
 retain(next,{A,B,D,p,score:sc});
 }
 }
 }
 beam=next;trace.push({digits:j+1,fit:beam[0].score/(K*(j+1)),truthRetained:truthIn(j+1)});
 }
 const s=beam[0],P=ci.map(c=>digits(bmod((s.A*c+s.B)*inv(1n+s.D*c,M),M)));
 const replay=P.every((p,i)=>bmod((big(p)-s.B)*inv(s.A-s.D*big(p),M),M)===ci[i]);
 return {key:Object.fromEntries(["A","B","D"].map(k=>[k,s[k].toString()])),trace,legal0,fit:score(P.filter((_,i)=>i%4!==3),l),held:score(P.filter((_,i)=>i%4===3),l),replay,P,fitN:K,heldN:held.length};
 }
 const pages=corpus.pages.slice(0,56).filter(p=>p.indices.length>=N),out={N,W,pages:pages.map(p=>p.page),plants:[],original:[]};
 for(const rev of [false,true]){
 const D=donors.slice(rev?55:0,rev?110:55).map(p=>rev?[...p].reverse():p);
 const A=big(Array.from({length:N},(_,i)=>(13*i*i+7*i+11+(rev?3:0))%29)), B=big(Array.from({length:N},(_,i)=>(23*i*i+5*i+19+(rev?2:0))%29));
 let d0=0;if(rev){d0=Array.from({length:28},(_,i)=>i+1).find(d=>mod(Number(A%29n)-d*Number(B%29n))!==0&&D.every(p=>mod(Number(A%29n)-d*p[0])!==0));if(!d0)throw Error("no affine chart control")}
 const G=big(Array.from({length:N},(_,i)=>i===0?d0:(17*i*i+11*i+3+(rev?7:0))%29)),T={A,B,D:G};
 const plant=D.map(p=>digits(bmod((big(p)-B)*inv(A-G*big(p),M),M))),r=recover(plant,rev,T),{P,...rest}=r;
 out.plants.push({rev,truth:Object.fromEntries(Object.entries(T).map(([k,v])=>[k,v.toString()])),...rest,correct:P.reduce((n,p,i)=>n+p.filter((v,j)=>v===D[i][j]).length,0),total:D.length*N});
 }
 if(out.plants.some(p=>p.correct!==p.total||!p.replay||p.trace.some(t=>!t.truthRetained)))return {...out,blocked:"failed planted key recovery; original withheld"};
 for(const rev of [false,true]){
 const C=pages.map(p=>(rev?[...p.indices].reverse():p.indices).slice(0,N)),r=recover(C,rev,null),{P,...rest}=r;
 out.original.push({rev,...rest,sample:P.slice(0,8).map((p,i)=>({page:pages[i].page,text:(rev?[...p].reverse():p).map(x=>corpus.translit[x]).join(" ")}))});
 }
 return out;
}
console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json')),JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json'))),null,2));
